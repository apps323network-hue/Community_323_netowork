import Stripe from "npm:stripe@^14.0.0"
import { createClient } from "npm:@supabase/supabase-js@^2.39.0"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
    console.log('Subscription Checkout - Request received:', req.method)

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

        // 3. Verificar se já tem assinatura ativa
        const { data: existingSubscription } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', user.id)
            .eq('plan_type', 'service_publisher')
            .in('status', ['active', 'pending'])
            .single()

        if (existingSubscription?.status === 'active') {
            throw new Error('Você já possui uma assinatura ativa')
        }

        // 4. Buscar preço configurado
        const { data: priceConfig, error: priceError } = await supabase
            .from('subscription_prices')
            .select('*')
            .eq('plan_type', 'service_publisher')
            .eq('active', true)
            .single()

        if (priceError || !priceConfig) {
            throw new Error('Configuração de preço não encontrada')
        }

        console.log('Price config:', priceConfig)

        // 5. Detectar ambiente
        const referer = req.headers.get('referer')
        const origin = req.headers.get('origin') || ''
        let siteUrl = referer ? new URL(referer).origin : Deno.env.get('SITE_URL') || 'http://localhost:5173'
        
        // Se a origem for localhost ou o referer for localhost, estamos em dev
        const isDevelopment = origin.includes('localhost') || origin.includes('127.0.0.1') || 
                            siteUrl.includes('localhost') || siteUrl.includes('127.0.0.1')

        console.log(`Environment: ${isDevelopment ? 'TEST (Localhost)' : 'PRODUCTION'} (${siteUrl})`)

        // 6. Setup Stripe
        // Usando os nomes exatos do seu arquivo .env
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

        // 7. Buscar ou criar Customer no Stripe
        let stripeCustomerId: string | undefined

        // Verificar se usuário já tem customer_id em alguma subscription anterior
        // Nota: IDs de customer são diferentes entre Live e Test mode no Stripe
        const { data: previousSub } = await supabase
            .from('subscriptions')
            .select('stripe_customer_id, status')
            .eq('user_id', user.id)
            .not('stripe_customer_id', 'is', null)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

        // Só usamos o customer_id anterior se o livemode bater (assumindo que guardamos essa info ou arriscando o erro)
        // O ideal seria verificar no Stripe se o customer existe, mas para simplificar:
        if (previousSub?.stripe_customer_id) {
            try {
                const customer = await stripe.customers.retrieve(previousSub.stripe_customer_id)
                if (customer && !customer.deleted) {
                   stripeCustomerId = customer.id
                   console.log('Using existing Stripe customer:', stripeCustomerId)
                }
            } catch (e) {
                console.log('Previous customer ID not found in this Stripe environment, creating new one')
            }
        } 
        
        if (!stripeCustomerId) {
            // Criar novo customer
            const customer = await stripe.customers.create({
                email: user.email,
                name: user.user_metadata?.nome || user.email,
                metadata: {
                    user_id: user.id,
                    environment: isDevelopment ? 'test' : 'production'
                }
            })
            stripeCustomerId = customer.id
            console.log('Created new Stripe customer:', stripeCustomerId)
        }

        // 8. Criar ou buscar Price no Stripe
        let stripePriceId = priceConfig.stripe_price_id

        // Se estivermos em dev, não usamos o ID de produção (e vice-versa)
        if (isDevelopment) {
            // Tentar buscar um preço de teste já criado para este plano
            const products = await stripe.products.list({ limit: 10 })
            const product = products.data.find((p: any) => p.metadata.plan_type === 'service_publisher')
            
            if (product) {
                const prices = await stripe.prices.list({ product: product.id, active: true, limit: 1 })
                if (prices.data.length > 0) {
                    stripePriceId = prices.data[0].id
                    console.log('Found existing test price:', stripePriceId)
                } else {
                    stripePriceId = null
                }
            } else {
                stripePriceId = null
            }
        }

        if (!stripePriceId) {
            // Criar produto e preço no Stripe (English)
            const productName = isDevelopment ? '[TEST] 323 Network - Publisher Subscription' : '323 Network - Publisher Subscription'
            const product = await stripe.products.create({
                name: productName,
                description: 'Publish your services on 323 Network',
                metadata: {
                    plan_type: 'service_publisher',
                    environment: isDevelopment ? 'test' : 'production'
                }
            })

            const price = await stripe.prices.create({
                product: product.id,
                unit_amount: priceConfig.price_cents,
                currency: priceConfig.currency.toLowerCase(),
                recurring: {
                    interval: 'month'
                },
                metadata: {
                    plan_type: 'service_publisher'
                }
            })

            stripePriceId = price.id
            console.log(`Created new Stripe price (${isDevelopment ? 'TEST' : 'PROD'}):`, stripePriceId)

            // Só salvamos no banco o ID se for produção, ou se tivéssemos a coluna stripe_test_price_id
            if (!isDevelopment) {
                await supabase
                    .from('subscription_prices')
                    .update({ stripe_price_id: stripePriceId })
                    .eq('id', priceConfig.id)
            }
        }

        // 9. Criar registro pendente de subscription
        const { data: subscription, error: subError } = await supabase
            .from('subscriptions')
            .upsert({
                user_id: user.id,
                plan_type: 'service_publisher',
                status: 'pending',
                stripe_customer_id: stripeCustomerId,
                price_cents: priceConfig.price_cents,
                currency: priceConfig.currency
            }, {
                onConflict: 'user_id,plan_type'
            })
            .select()
            .single()

        if (subError) {
            console.error('Error creating subscription record:', subError)
            throw new Error('Erro ao criar registro de assinatura')
        }

        console.log('Subscription record created:', subscription.id)

        // 10. Criar Checkout Session
        const session = await stripe.checkout.sessions.create({
            customer: stripeCustomerId,
            payment_method_types: ['card'],
            line_items: [{
                price: stripePriceId,
                quantity: 1,
            }],
            mode: 'subscription',
            success_url: `${siteUrl}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${siteUrl}/subscription?canceled=true`,
            metadata: {
                type: 'subscription_payment',
                user_id: user.id,
                subscription_id: subscription.id,
                plan_type: 'service_publisher'
            },
            subscription_data: {
                product_data: {
                    name: '323 Network - Publisher Subscription', // Assuming a generic name for the product in checkout
                    description: 'Publish your services on 323 Network',
                },
                metadata: {
                    user_id: user.id,
                    subscription_id: subscription.id,
                    plan_type: 'service_publisher'
                }
            }
        })

        console.log('Stripe checkout session created:', session.id)

        return new Response(
            JSON.stringify({
                checkout_url: session.url,
                session_id: session.id
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
