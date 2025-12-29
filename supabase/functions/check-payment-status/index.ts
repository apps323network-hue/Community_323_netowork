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
        const authHeader = req.headers.get('Authorization')
        if (!authHeader) throw new Error('Missing auth header')

        const { session_id } = await req.json()
        if (!session_id) throw new Error('session_id required')

        // 1. Setup Supabase
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        const supabase = createClient(supabaseUrl, supabaseKey)

        // 2. Validate User
        const token = authHeader.replace('Bearer ', '')
        const { data: { user }, error: authError } = await supabase.auth.getUser(token)
        if (authError || !user) throw new Error('Unauthorized')

        // 3. Setup Stripe (Environment Detection)
        const referer = req.headers.get('referer') || req.headers.get('origin')
        let isProduction = false
        if (referer) {
            isProduction = referer.includes('community-323-netowork.vercel.app') ||
                referer.includes('323network')
        }

        const stripeKey = isProduction
            ? Deno.env.get('STRIPE_SECRET_KEY_LIVE')
            : Deno.env.get('STRIPE_SECRET_KEY')

        if (!stripeKey) throw new Error('Stripe key config missing')

        const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' })

        // 4. Check Stripe Session
        const session = await stripe.checkout.sessions.retrieve(session_id)

        let status = 'pending'
        // 'paid' significa sucesso no pagamento (card ou pix confirmado)
        if (session.payment_status === 'paid' || session.status === 'complete') {
            status = 'completed'

            // 5. Force Database Update (Self-healing)
            // Se o webhook falhou ou atrasou, garantimos a consistência aqui
            const paymentIntentId = typeof session.payment_intent === 'string'
                ? session.payment_intent
                : (session.payment_intent as any)?.id

            // Update Service Payment
            const { error: updateError } = await supabase
                .from('service_payments')
                .update({
                    status: 'completed',
                    stripe_payment_intent_id: paymentIntentId,
                    updated_at: new Date().toISOString()
                })
                .eq('stripe_session_id', session_id)

            if (updateError) console.error('Error updating payment:', updateError)

            // Update Service Request using metadata
            if (session.metadata?.service_request_id) {
                await supabase
                    .from('service_requests')
                    .update({ status: 'pendente' }) // pendente = pronto para atendimento
                    .eq('id', session.metadata.service_request_id)
            }
        }

        return new Response(
            JSON.stringify({
                status: status,
                stripe_status: session.payment_status,
                payment_method: session.payment_method_types[0]
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error: any) {
        console.error('Check status error:', error)
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
