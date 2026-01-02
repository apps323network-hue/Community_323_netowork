import Stripe from "npm:stripe@^14.0.0"
import { createClient } from "npm:@supabase/supabase-js@^2.39.0"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // Detectar ambiente baseado na URL de origem
        const referer = req.headers.get('referer') || req.headers.get('origin')
        let isProduction = false

        if (referer) {
            isProduction = referer.includes('community-323-netowork.vercel.app') ||
                referer.includes('323network')
        }

        // Escolher chave Stripe baseada no ambiente
        const stripeKey = isProduction
            ? Deno.env.get('STRIPE_SECRET_KEY_LIVE')
            : Deno.env.get('STRIPE_SECRET_KEY')

        if (!stripeKey) {
            throw new Error(`Stripe key not configured for ${isProduction ? 'production' : 'test'} environment`)
        }

        console.log(`Webhook running in ${isProduction ? 'PRODUCTION' : 'TEST'} mode`)

        const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' })

        // Ler body como texto para validação de assinatura
        const body = await req.text()
        const signature = req.headers.get('stripe-signature')

        if (!signature) {
            return new Response(JSON.stringify({ error: 'Missing stripe-signature' }), { status: 400 })
        }

        // 1. Decodificar o corpo primeiro para saber se é Live ou Test
        const tempEvent = JSON.parse(body)
        const isLive = tempEvent.livemode === true

        // 2. Selecionar o Secret correto
        const webhookSecret = isLive
            ? Deno.env.get('STRIPE_WEBHOOK_SECRET')
            : Deno.env.get('STRIPE_TEST_WEBHOOK_SECRET')

        if (!webhookSecret) {
            console.error(`Webhook secret não configurado para ambiente: ${isLive ? 'LIVE' : 'TEST'}`)
            return new Response(JSON.stringify({ error: 'Webhook secret not configured' }), { status: 500 })
        }

        let event: Stripe.Event
        try {
            event = await stripe.webhooks.constructEventAsync(
                body,
                signature,
                webhookSecret
            )
        } catch (err: any) {
            console.error('Webhook signature verification failed:', err.message)
            return new Response(`Webhook Error: ${err.message}`, { status: 400 })
        }

        // Criar cliente Supabase
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        const supabase = createClient(supabaseUrl, supabaseKey)

        console.log(`Webhook received: ${event.type}`)

        // Processar eventos
        switch (event.type) {
            case 'checkout.session.completed':
            case 'checkout.session.async_payment_succeeded': {
                const session = event.data.object as Stripe.Checkout.Session

                console.log(`Processing session: ${session.id}`)
                console.log(`Metadata:`, session.metadata)

                // Verificar se é pagamento de serviço
                if (session.metadata?.type === 'service_payment') {
                    const paymentId = session.metadata.payment_id
                    const serviceRequestId = session.metadata.service_request_id
                    const userId = session.metadata.user_id

                    if (!paymentId || !serviceRequestId) {
                        console.error('Missing payment metadata')
                        break
                    }

                    // Atualizar service_payment
                    const { error: paymentError } = await supabase
                        .from('service_payments')
                        .update({
                            status: 'completed',
                            stripe_payment_intent_id: session.payment_intent as string,
                            updated_at: new Date().toISOString()
                        })
                        .eq('id', paymentId)

                    if (paymentError) {
                        console.error('Error updating payment:', paymentError)
                    }

                    // Atualizar service_request para pendente (pronto para atendimento)
                    const { error: requestError } = await supabase
                        .from('service_requests')
                        .update({
                            status: 'pendente', // Mantém pendente, mas agora está pago
                            updated_at: new Date().toISOString()
                        })
                        .eq('id', serviceRequestId)

                    if (requestError) {
                        console.error('Error updating request:', requestError)
                    }

                    // Criar notificação in-app
                    await supabase.from('notifications').insert({
                        user_id: userId,
                        type: 'payment_success',
                        title: 'Pagamento confirmado!',
                        content: 'Seu pagamento foi processado com sucesso. O parceiro entrará em contato em breve.',
                        metadata: {
                            service_request_id: serviceRequestId,
                            payment_id: paymentId
                        }
                    })

                    console.log(`Service payment completed: ${paymentId}`)
                }

                // Verificar se é pagamento de programa/curso
                if (session.metadata?.type === 'program_payment') {
                    const programId = session.metadata.program_id
                    const enrollmentId = session.metadata.enrollment_id
                    const userId = session.metadata.user_id

                    if (!programId || !enrollmentId) {
                        console.error('Missing program payment metadata')
                        break
                    }

                    // 1. Atualizar Matrícula
                    const { error: enrollError } = await supabase
                        .from('program_enrollments')
                        .update({
                            status: 'active',
                            payment_status: 'paid',
                            paid_at: new Date().toISOString(),
                            updated_at: new Date().toISOString()
                        })
                        .eq('id', enrollmentId)

                    if (enrollError) {
                        console.error('Error updating enrollment:', enrollError)
                    }

                    // 2. Incrementar contador de alunos no programa
                    await supabase.rpc('increment_program_students', { program_id: programId })

                    // 3. Notificação In-App
                    await supabase.from('notifications').insert({
                        user_id: userId,
                        type: 'program_enrolled',
                        title: 'Inscrição confirmada!',
                        content: 'Seu acesso ao programa foi liberado. Bons estudos!',
                        metadata: {
                            program_id: programId,
                            enrollment_id: enrollmentId
                        }
                    })

                    // 4. Trigger Google Classroom (se habilitado)
                    try {
                        const { data: program } = await supabase
                            .from('programs')
                            .select('classroom_enabled, classroom_course_id')
                            .eq('id', programId)
                            .single()

                        if (program?.classroom_enabled && program?.classroom_course_id) {
                            // Buscar e-mail do usuário para o convite
                            const { data: { user: userData } } = await supabase.auth.admin.getUserById(userId)

                            if (userData?.email) {
                                console.log(`Triggering Classroom invite for ${userData.email} in course ${program.classroom_course_id}`)
                                await supabase.functions.invoke('classroom_invite', {
                                    body: {
                                        courseId: program.classroom_course_id,
                                        studentEmail: userData.email
                                    }
                                })
                            }
                        }
                    } catch (classroomErr) {
                        console.error('Error triggering classroom invite from webhook:', classroomErr)
                    }

                    console.log(`Program enrollment completed: ${enrollmentId}`)
                }
                break
            }

            case 'checkout.session.async_payment_failed':
            case 'checkout.session.expired': {
                const session = event.data.object as Stripe.Checkout.Session

                if (session.metadata?.type === 'service_payment') {
                    const paymentId = session.metadata.payment_id
                    const userId = session.metadata.user_id

                    if (paymentId) {
                        // Atualizar como falhou
                        await supabase
                            .from('service_payments')
                            .update({
                                status: 'failed',
                                updated_at: new Date().toISOString()
                            })
                            .eq('id', paymentId)

                        // Notificar usuário
                        if (userId) {
                            await supabase.from('notifications').insert({
                                user_id: userId,
                                type: 'payment_failed',
                                title: 'Pagamento não concluído',
                                content: 'Houve um problema com seu pagamento. Por favor, tente novamente.',
                                metadata: { payment_id: paymentId }
                            })
                        }

                        console.log(`Service payment failed: ${paymentId}`)
                    }
                }

                if (session.metadata?.type === 'program_payment') {
                    const enrollmentId = session.metadata.enrollment_id
                    const userId = session.metadata.user_id

                    if (enrollmentId) {
                        // Atualizar matrícula como falhou
                        await supabase
                            .from('program_enrollments')
                            .update({
                                payment_status: 'failed',
                                status: 'cancelled',
                                updated_at: new Date().toISOString()
                            })
                            .eq('id', enrollmentId)

                        if (userId) {
                            await supabase.from('notifications').insert({
                                user_id: userId,
                                type: 'program_payment_failed',
                                title: 'Pagamento de programa falhou',
                                content: 'Não conseguimos processar o pagamento da sua inscrição. Tente novamente.',
                                metadata: { enrollment_id: enrollmentId }
                            })
                        }
                    }
                }
                break
            }

            default:
                console.log(`Unhandled event type: ${event.type}`)
        }

        return new Response(JSON.stringify({ received: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200
        })

    } catch (error: any) {
        console.error('Webhook error:', error.message)
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 500
            }
        )
    }
})
