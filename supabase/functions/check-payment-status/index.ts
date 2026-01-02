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
        const origin = req.headers.get('origin') || ''
        const isDevelopment = origin.includes('localhost') || origin.includes('127.0.0.1')

        const stripeKey = isDevelopment
            ? Deno.env.get('STRIPE_TEST_SECRET_KEY')
            : Deno.env.get('STRIPE_SECRET_KEY')

        if (!stripeKey) throw new Error(`Stripe Secret Key não configurada para o ambiente: ${isDevelopment ? 'TEST' : 'PROD'}`)

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
