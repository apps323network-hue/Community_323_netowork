import Stripe from "npm:stripe@^14.0.0"
import { createClient } from "npm:@supabase/supabase-js@^2.39.0"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
    console.log('Stripe Portal - Request received:', req.method)

    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const authHeader = req.headers.get('Authorization')
        if (!authHeader) {
            throw new Error('Token de autenticação não fornecido')
        }

        // 1. Setup Supabase Admin
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        const supabase = createClient(supabaseUrl, supabaseKey)

        // 2. Validar Usuário
        const token = authHeader.replace('Bearer ', '')
        const { data: { user }, error: authError } = await supabase.auth.getUser(token)

        if (authError || !user) {
            console.error('Auth error:', authError)
            throw new Error('Usuário não autenticado')
        }
        console.log('User authenticated:', user.id)

        // 3. Buscar stripe_customer_id
        const { data: subscription, error: subError } = await supabase
            .from('subscriptions')
            .select('stripe_customer_id')
            .eq('user_id', user.id)
            .not('stripe_customer_id', 'is', null)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

        if (subError || !subscription?.stripe_customer_id) {
            console.error('Subscription error or customer ID not found:', subError)
            throw new Error('Você ainda não possui uma assinatura ou ID de cliente no Stripe')
        }

        // 4. Detectar ambiente
        const referer = req.headers.get('referer')
        const origin = req.headers.get('origin') || ''
        let siteUrl = referer ? new URL(referer).origin : Deno.env.get('SITE_URL') || 'http://localhost:5173'
        
        const isDevelopment = origin.includes('localhost') || origin.includes('127.0.0.1') || 
                            siteUrl.includes('localhost') || siteUrl.includes('127.0.0.1')

        // 5. Setup Stripe
        const stripeKey = isDevelopment
            ? Deno.env.get('STRIPE_SECRET_KEY_TEST')
            : Deno.env.get('STRIPE_SECRET_KEY')

        if (!stripeKey) {
            throw new Error(`Stripe Secret Key não configurada para o ambiente: ${isDevelopment ? 'TEST' : 'PROD'}`)
        }

        const stripe = new Stripe(stripeKey, {
            apiVersion: '2023-10-16',
            httpClient: Stripe.createFetchHttpClient(),
        })

        // 6. Criar Portal Session
        const session = await stripe.billingPortal.sessions.create({
            customer: subscription.stripe_customer_id,
            return_url: `${siteUrl}/perfil`, // Redireciona de volta para o perfil
        })

        console.log('Stripe portal session created:', session.id)

        return new Response(
            JSON.stringify({
                url: session.url
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200
            }
        )

    } catch (error: any) {
        console.error('Handler error:', error.message)
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400
            }
        )
    }
})
