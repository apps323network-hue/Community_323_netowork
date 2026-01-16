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

        const { session_id, force_live_mode } = await req.json()
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
        const referer = req.headers.get('referer')
        let siteUrl = referer ? new URL(referer).origin : Deno.env.get('SITE_URL') || 'http://localhost:5173'
        
        const origin = req.headers.get('origin') || ''
        const isDevelopment = origin.includes('localhost') || origin.includes('127.0.0.1') || siteUrl.includes('localhost')

        // Allow forcing live mode via parameter (for testing real payments in localhost)
        const useLiveMode = force_live_mode === true ? true : !isDevelopment

        const stripeKey = useLiveMode
            ? Deno.env.get('STRIPE_SECRET_KEY')
            : Deno.env.get('STRIPE_SECRET_KEY_TEST')

        if (!stripeKey) throw new Error(`Stripe Secret Key não configurada para o ambiente: ${useLiveMode ? 'LIVE' : 'TEST'}`)

        console.log(`[check-payment-status] Using ${useLiveMode ? 'LIVE' : 'TEST'} mode (force_live_mode: ${force_live_mode}, isDevelopment: ${isDevelopment})`)

        const stripe = new Stripe(stripeKey, {
            apiVersion: '2023-10-16',
            httpClient: Stripe.createFetchHttpClient(),
        })

        // 4. Check Stripe Session
        const session = await stripe.checkout.sessions.retrieve(session_id)

        let status = 'pending'
        // 'paid' significa sucesso no pagamento (card ou pix confirmado)
        if (session.payment_status === 'paid' || session.status === 'complete') {
            status = 'completed'

            // 5. Force Database Update (Self-healing)
            const type = session.metadata?.type
            const paymentIntentId = typeof session.payment_intent === 'string'
                ? session.payment_intent
                : (session.payment_intent as any)?.id

            if (type === 'program_payment') {
                // Update Program Enrollment
                const { error: updateError } = await supabase
                    .from('program_enrollments')
                    .update({
                        payment_status: 'paid',
                        status: 'active',
                        updated_at: new Date().toISOString()
                    })
                    .eq('payment_id', session_id)

                if (updateError) console.error('Error updating program enrollment:', updateError)

                // Trigger Classroom Invite (if not already triggered)
                if (session.metadata?.program_id) {
                    const programId = session.metadata.program_id
                    const userId = session.metadata.user_id

                    const { data: program } = await supabase
                        .from('programs')
                        .select('classroom_enabled, classroom_course_id')
                        .eq('id', programId)
                        .single()

                    if (program?.classroom_enabled && program?.classroom_course_id) {
                        const { data: authUser } = await supabase.auth.admin.getUserById(userId)
                        const email = authUser?.user?.email

                        if (email) {
                            console.log(`Triggering Classroom invite for ${email} in course ${program.classroom_course_id}`)
                            await supabase.functions.invoke('classroom_invite', {
                                body: {
                                    courseId: program.classroom_course_id,
                                    studentEmail: email
                                }
                            })
                        }
                    }
                }
            } else if (type === 'subscription_payment') {
                // Update Subscription
                const userId = session.metadata?.user_id
                const subscriptionDbId = session.metadata?.subscription_id
                const stripeSubscriptionId = session.subscription as string

                if (userId && stripeSubscriptionId) {
                    // Buscar detalhes da assinatura no Stripe para pegar as datas
                    const subscriptionData = await stripe.subscriptions.retrieve(stripeSubscriptionId)
                    
                    const updateData = {
                        status: 'active',
                        stripe_subscription_id: stripeSubscriptionId,
                        stripe_customer_id: session.customer as string,
                        current_period_start: new Date(subscriptionData.current_period_start * 1000).toISOString(),
                        current_period_end: new Date(subscriptionData.current_period_end * 1000).toISOString(),
                        cancel_at_period_end: subscriptionData.cancel_at_period_end,
                        updated_at: new Date().toISOString()
                    }

                    if (subscriptionDbId) {
                        await supabase.from('subscriptions').update(updateData).eq('id', subscriptionDbId)
                    } else {
                        await supabase.from('subscriptions').update(updateData).eq('user_id', userId).eq('plan_type', 'premium')
                    }

                    // Update User Profile Plan
                    await supabase
                        .from('profiles')
                        .update({ plano: 'Premium' })
                        .eq('id', userId)

                    console.log(`Subscription self-healed and profile updated to Premium for user ${userId}`)
                }
            } else {
                // Default: Service Payment
                const { error: updateError } = await supabase
                    .from('service_payments')
                    .update({
                        status: 'completed',
                        stripe_payment_intent_id: paymentIntentId,
                        updated_at: new Date().toISOString()
                    })
                    .eq('stripe_session_id', session_id)

                if (updateError) console.error('Error updating service payment:', updateError)

                // Update Service Request using metadata
                if (session.metadata?.service_request_id) {
                    await supabase
                        .from('service_requests')
                        .update({ status: 'pendente' }) // pendente = pronto para atendimento
                        .eq('id', session.metadata.service_request_id)
                }
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
