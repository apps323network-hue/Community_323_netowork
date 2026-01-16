import Stripe from "npm:stripe@^14.0.0"
import { createClient } from "npm:@supabase/supabase-js@^2.39.0"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

/**
 * Edge Function: Reconcile Payments
 * 
 * Esta função verifica no Stripe os pagamentos que foram confirmados
 * mas não foram atualizados no banco de dados (devido a webhook failures).
 * 
 * Procura por enrollments com payment_id mas payment_status != 'paid'
 * e atualiza automaticamente se o pagamento foi confirmado no Stripe.
 */
Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // 1. Validar autenticação (apenas admins)
        const authHeader = req.headers.get('Authorization')
        if (!authHeader) throw new Error('Missing authorization header')

        const supabaseUrl = Deno.env.get('SUPABASE_URL')!
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        const supabase = createClient(supabaseUrl, supabaseKey)

        const token = authHeader.replace('Bearer ', '')
        const { data: { user }, error: authError } = await supabase.auth.getUser(token)
        if (authError || !user) throw new Error('Unauthorized')

        // Verificar se é admin
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (profile?.role !== 'admin') {
            throw new Error('Only admins can run this reconciliation')
        }

        // 2. Setup Stripe (detectar ambiente)
        const isDevelopment = req.headers.get('origin')?.includes('localhost') || false
        const stripeKey = isDevelopment
            ? Deno.env.get('STRIPE_SECRET_KEY_TEST')
            : Deno.env.get('STRIPE_SECRET_KEY')

        if (!stripeKey) throw new Error('Stripe key not configured')

        const stripe = new Stripe(stripeKey, {
            apiVersion: '2023-10-16',
            httpClient: Stripe.createFetchHttpClient(),
        })

        console.log(`Reconciliation running in ${isDevelopment ? 'TEST' : 'LIVE'} mode`)

        // 3. Buscar enrollments pendentes com payment_id
        const { data: enrollments, error: enrollmentsError } = await supabase
            .from('program_enrollments')
            .select(`
                id,
                payment_id,
                payment_status,
                status,
                user_id,
                program_id,
                payment_amount,
                payment_currency
            `)
            .not('payment_id', 'is', null)
            .neq('payment_status', 'paid')
            .order('enrolled_at', { ascending: false })

        if (enrollmentsError) throw enrollmentsError

        console.log(`Found ${enrollments?.length || 0} enrollments to check`)

        const results = {
            checked: 0,
            updated: 0,
            still_pending: 0,
            failed: 0,
            errors: [] as any[]
        }

        // 4. Verificar cada enrollment no Stripe
        for (const enrollment of enrollments || []) {
            results.checked++

            try {
                // Buscar session no Stripe
                const session = await stripe.checkout.sessions.retrieve(enrollment.payment_id)

                console.log(`Session ${session.id}: payment_status=${session.payment_status}, status=${session.status}`)

                // Se foi pago no Stripe, atualizar no banco
                if (session.payment_status === 'paid' || session.status === 'complete') {
                    const { error: updateError } = await supabase
                        .from('program_enrollments')
                        .update({
                            status: 'active',
                            payment_status: 'paid',
                            paid_at: new Date(session.created * 1000).toISOString(),
                            updated_at: new Date().toISOString()
                        })
                        .eq('id', enrollment.id)

                    if (updateError) {
                        results.failed++
                        results.errors.push({
                            enrollment_id: enrollment.id,
                            error: updateError.message
                        })
                    } else {
                        results.updated++
                        console.log(`✅ Updated enrollment ${enrollment.id} to paid & active`)

                        // Criar notificação para o usuário
                        await supabase.from('notifications').insert({
                            user_id: enrollment.user_id,
                            type: 'program_enrolled',
                            title: 'Enrollment confirmed!',
                            content: 'Your payment has been confirmed and your access to the program has been granted.',
                            metadata: {
                                program_id: enrollment.program_id,
                                enrollment_id: enrollment.id,
                                reconciled: true
                            }
                        })
                    }
                } else if (session.payment_status === 'unpaid' || session.status === 'open') {
                    results.still_pending++
                    console.log(`⏳ Session ${session.id} still pending`)
                } else {
                    // Payment failed or expired
                    const { error: updateError } = await supabase
                        .from('program_enrollments')
                        .update({
                            payment_status: 'failed',
                            status: 'cancelled',
                            updated_at: new Date().toISOString()
                        })
                        .eq('id', enrollment.id)

                    if (!updateError) {
                        results.updated++
                        console.log(`❌ Marked enrollment ${enrollment.id} as failed`)
                    }
                }

            } catch (error: any) {
                results.failed++
                results.errors.push({
                    enrollment_id: enrollment.id,
                    payment_id: enrollment.payment_id,
                    error: error.message
                })
                console.error(`Error checking enrollment ${enrollment.id}:`, error.message)
            }
        }

        return new Response(
            JSON.stringify({
                success: true,
                summary: {
                    total_checked: results.checked,
                    updated_to_paid: results.updated,
                    still_pending: results.still_pending,
                    errors: results.failed
                },
                details: results.errors.length > 0 ? results.errors : undefined
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200
            }
        )

    } catch (error: any) {
        console.error('Reconciliation error:', error.message)
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400
            }
        )
    }
})
