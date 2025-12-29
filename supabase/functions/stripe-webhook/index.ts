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
        const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')

        if (!webhookSecret) {
            throw new Error('Webhook secret not configured')
        }

        // Ler body como texto para validação de assinatura
        const body = await req.text()
        const sig = req.headers.get('stripe-signature')

        if (!sig) {
            throw new Error('No signature header')
        }

        // Validar assinatura
        let event: Stripe.Event
        try {
            event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
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
