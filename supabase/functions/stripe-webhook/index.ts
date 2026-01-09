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
            ? Deno.env.get('STRIPE_SECRET_KEY')
            : Deno.env.get('STRIPE_SECRET_KEY_TEST')

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
            : Deno.env.get('STRIPE_WEBHOOK_SECRET_TEST')

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

        // Helper para notificar todos os admins
        async function notifyAdmins(type: string, title: string, content: string, metadata: any = {}) {
            try {
                const { data: admins, error: adminsError } = await supabase
                    .from('profiles')
                    .select('id')
                    .eq('role', 'admin');

                if (adminsError) {
                    console.error('Error fetching admins:', adminsError);
                    return;
                }

                if (admins && admins.length > 0) {
                    const notifications = admins.map((admin: any) => ({
                        user_id: admin.id,
                        type,
                        title,
                        content,
                        metadata: { ...metadata, is_admin_alert: true }
                    }));
                    await supabase.from('notifications').insert(notifications);
                    console.log(`Notifications sent to ${admins.length} admins`);
                }
            } catch (err) {
                console.error('Error in notifyAdmins:', err);
            }
        }

        // Helper para pegar nome do usuário
        async function getUserDisplay(userId: string) {
            const { data } = await supabase.from('profiles').select('nome').eq('id', userId).single();
            if (data?.nome) return data.nome;
            
            const { data: authUser } = await supabase.auth.admin.getUserById(userId);
            return authUser?.user?.email || userId;
        }

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

                    // Criar notificação in-app (English for user)
                    await supabase.from('notifications').insert({
                        user_id: userId,
                        type: 'payment_success',
                        title: 'Payment confirmed!',
                        content: 'Your payment has been processed successfully. The partner will contact you soon.',
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

                    // 3. Notificação In-App (English for user)
                    await supabase.from('notifications').insert({
                        user_id: userId,
                        type: 'program_enrolled',
                        title: 'Enrollment confirmed!',
                        content: 'Your access to the program has been granted. Enjoy your studies!',
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

                        // Notificar usuário (English)
                        if (userId) {
                            await supabase.from('notifications').insert({
                                user_id: userId,
                                type: 'payment_failed',
                                title: 'Payment failed',
                                content: 'There was a problem with your payment. Please try again.',
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
                                title: 'Enrollment payment failed',
                                content: "We couldn't process your enrollment payment. Please try again.",
                                metadata: { enrollment_id: enrollmentId }
                            })
                        }
                    }
                }
                break
            }

            // ====== SUBSCRIPTION EVENTS ======
            case 'customer.subscription.created':
            case 'customer.subscription.updated': {
                const subscription = event.data.object as Stripe.Subscription
                const userId = subscription.metadata?.user_id
                const subscriptionDbId = subscription.metadata?.subscription_id

                if (!userId) {
                    console.log('No user_id in subscription metadata, skipping')
                    break
                }

                console.log(`Processing subscription ${event.type}:`, subscription.id)

                // Map Stripe status to our status
                let status = 'pending'
                if (subscription.status === 'active') status = 'active'
                else if (subscription.status === 'canceled') status = 'canceled'
                else if (subscription.status === 'past_due') status = 'past_due'
                else if (subscription.status === 'paused') status = 'paused'

                const updateData: any = {
                    stripe_subscription_id: subscription.id,
                    stripe_customer_id: subscription.customer as string,
                    status: status,
                    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
                    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                    cancel_at_period_end: subscription.cancel_at_period_end,
                    updated_at: new Date().toISOString()
                }

                // Update by subscription_id if we have it, otherwise by user_id
                if (subscriptionDbId) {
                    const { error } = await supabase
                        .from('subscriptions')
                        .update(updateData)
                        .eq('id', subscriptionDbId)

                    if (error) console.error('Error updating subscription:', error)
                } else {
                    const { error } = await supabase
                        .from('subscriptions')
                        .update(updateData)
                        .eq('user_id', userId)
                        .eq('plan_type', subscription.metadata?.plan_type || 'service_publisher')

                    if (error) console.error('Error updating subscription by user_id:', error)
                }

                // Send notification on activation (English for user)
                if (status === 'active') {
                    await supabase.from('notifications').insert({
                        user_id: userId,
                        type: 'subscription_activated',
                        title: 'Subscription activated! 🎉',
                        content: 'Your subscription has been activated successfully. You can now publish your services!',
                        metadata: { subscription_id: subscription.id }
                    })

                    // Notificar Admin
                    const userName = await getUserDisplay(userId);
                    await notifyAdmins(
                        'admin_subscription_activated',
                        'Assinatura Ativada',
                        `O usuário ${userName} ativou com sucesso a assinatura Publisher.`,
                        { user_id: userId, stripe_subscription_id: subscription.id }
                    );
                }

                if (event.type === 'customer.subscription.created') {
                    const userName = await getUserDisplay(userId);
                    await notifyAdmins(
                        'admin_subscription_created',
                        'Nova Assinatura',
                        `O usuário ${userName} iniciou uma nova assinatura (Status: ${status}).`,
                        { user_id: userId, stripe_subscription_id: subscription.id }
                    );
                }

                console.log(`Subscription ${subscription.id} updated to status: ${status}`)
                break
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object as Stripe.Subscription
                const userId = subscription.metadata?.user_id

                if (!userId) {
                    console.log('No user_id in deleted subscription metadata')
                    break
                }

                console.log(`Subscription deleted:`, subscription.id)

                const { error } = await supabase
                    .from('subscriptions')
                    .update({
                        status: 'canceled',
                        updated_at: new Date().toISOString()
                    })
                    .eq('stripe_subscription_id', subscription.id)

                if (error) console.error('Error canceling subscription:', error)

                // Notify user (English)
                await supabase.from('notifications').insert({
                    user_id: userId,
                    type: 'subscription_canceled',
                    title: 'Subscription canceled',
                    content: 'Your subscription has been canceled. You will no longer be able to publish new services.',
                    metadata: { subscription_id: subscription.id }
                })

                // Notificar Admin
                const userName = await getUserDisplay(userId);
                await notifyAdmins(
                    'admin_subscription_canceled',
                    'Assinatura Cancelada',
                    `A assinatura de ${userName} foi cancelada no Stripe.`,
                    { user_id: userId, stripe_subscription_id: subscription.id }
                );

                break
            }

            case 'invoice.payment_failed': {
                const invoice = event.data.object as Stripe.Invoice
                const subscriptionId = invoice.subscription as string

                if (!subscriptionId) break

                console.log(`Invoice payment failed for subscription:`, subscriptionId)

                const { error } = await supabase
                    .from('subscriptions')
                    .update({
                        status: 'past_due',
                        updated_at: new Date().toISOString()
                    })
                    .eq('stripe_subscription_id', subscriptionId)

                if (error) console.error('Error updating subscription to past_due:', error)

                // Get user from subscription
                const { data: sub } = await supabase
                    .from('subscriptions')
                    .select('user_id')
                    .eq('stripe_subscription_id', subscriptionId)
                    .single()

                if (sub?.user_id) {
                    await supabase.from('notifications').insert({
                        user_id: sub.user_id,
                        type: 'payment_failed',
                        title: 'Subscription payment failed',
                        content: "We couldn't process your subscription payment. Please update your payment details.",
                        metadata: { subscription_id: subscriptionId }
                    })

                    // Notificar Admin
                    const userName = await getUserDisplay(sub.user_id);
                    await notifyAdmins(
                        'admin_subscription_delinquency',
                        'ALERTA: Inadimplência',
                        `Falha no pagamento da assinatura de ${userName}. O acesso foi restrito (Status: Past Due).`,
                        { user_id: sub.user_id, stripe_subscription_id: subscriptionId }
                    );
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
