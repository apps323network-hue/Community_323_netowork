import Stripe from "npm:stripe@^14.0.0"
import { createClient } from "npm:@supabase/supabase-js@^2.39.0"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Taxas Stripe
const CARD_FEE_PERCENTAGE = 0.039 // 3.9%
const CARD_FEE_FIXED = 30 // $0.30 em centavos
const PIX_FEE_PERCENTAGE = 0.0179 // ~1.8%

Deno.serve(async (req: Request) => {
    console.log('Request received:', req.method)

    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const authHeader = req.headers.get('Authorization')
        console.log('Auth Header check:', authHeader ? 'Present' : 'Missing')

        // 1. Validar e obter body
        let body
        try {
            body = await req.json()
        } catch (e) {
            console.error('Error parsing JSON:', e)
            throw new Error('Invalid JSON body')
        }

        const { service_id, payment_method, exchange_rate, mensagem } = body

        if (!service_id || !payment_method) {
            throw new Error('service_id e payment_method são obrigatórios')
        }

        // 2. Setup Supabase Admin
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        const supabase = createClient(supabaseUrl, supabaseServiceKey)

        // 3. Validar Usuário manualmente
        if (!authHeader) {
            throw new Error('Token de autenticação não fornecido')
        }
        const token = authHeader.replace('Bearer ', '')
        const { data: { user }, error: authError } = await supabase.auth.getUser(token)

        if (authError || !user) {
            console.error('Auth error:', authError)
            throw new Error('Usuário não autenticado')
        }
        console.log('User authenticated:', user.id)

        // 4. Detectar ambiente
        const referer = req.headers.get('referer')
        let siteUrl = referer ? new URL(referer).origin : Deno.env.get('SITE_URL') || 'http://localhost:5173'
        const isProduction = siteUrl.includes('community-323-netowork.vercel.app') ||
            siteUrl.includes('323network')

        console.log(`Environment: ${isProduction ? 'PRODUCTION' : 'TEST'} (${siteUrl})`)

        // 5. Setup Stripe
        const origin = req.headers.get('origin') || ''
        const isDevelopment = origin.includes('localhost') || origin.includes('127.0.0.1') || siteUrl.includes('localhost')

        // Selecionar a chave do Stripe baseada no ambiente
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

        // 6. Buscar Serviço
        const { data: service, error: serviceError } = await supabase
            .from('services')
            .select('*')
            .eq('id', service_id)
            .single()

        if (serviceError || !service) {
            throw new Error('Serviço não encontrado')
        }

        if (!service.preco || service.preco <= 0) {
            throw new Error('Este serviço não possui preço definido')
        }

        // 7. Calcular valores
        let finalAmount: number
        let currency: string

        if (payment_method === 'pix') {
            if (!exchange_rate) {
                throw new Error('Taxa de câmbio é obrigatória para PIX')
            }
            currency = 'brl'
            // Fórmula: (Base USD * Taxa * 1.04) / (1 - 0.0179)
            const RATE_MARGIN = 1.04
            const rateWithMargin = exchange_rate * RATE_MARGIN
            const netAmountBRL = (service.preco / 100) * rateWithMargin
            const grossAmountBRL = netAmountBRL / (1 - PIX_FEE_PERCENTAGE)

            finalAmount = Math.round(grossAmountBRL * 100)
        } else {
            currency = 'usd'
            finalAmount = Math.round(
                service.preco +
                (service.preco * CARD_FEE_PERCENTAGE) +
                CARD_FEE_FIXED
            )
        }

        console.log(`Calculating amount: ${finalAmount} ${currency}`)

        // 8. Criar Records no DB
        // Criar service_request
        const { data: serviceRequest, error: requestError } = await supabase
            .from('service_requests')
            .insert({
                service_id: service.id,
                user_id: user.id,
                mensagem: mensagem || '',
                status: 'pendente',
                payment_required: true
            })
            .select()
            .single()

        if (requestError) throw new Error('Erro ao criar solicitação: ' + requestError.message)

        // Criar service_payment
        const { data: payment, error: paymentError } = await supabase
            .from('service_payments')
            .insert({
                service_request_id: serviceRequest.id,
                user_id: user.id,
                service_id: service.id,
                amount: finalAmount,
                currency: currency.toUpperCase(),
                payment_method: payment_method,
                status: 'pending',
                metadata: {
                    base_amount: service.preco,
                    exchange_rate: payment_method === 'pix' ? exchange_rate : null,
                    service_name: service.nome_pt || service.nome_en
                }
            })
            .select()
            .single()

        if (paymentError) throw new Error('Erro ao criar pagamento: ' + paymentError.message)

        // 8.5. Gravar aceitação de termos se fornecido
        if (body.accepted_terms) {
            const ip = req.headers.get('x-real-ip') || req.headers.get('x-forwarded-for') || 'unknown'
            const userAgent = req.headers.get('user-agent') || 'unknown'

            await supabase
                .from('item_terms_acceptance')
                .insert({
                    user_id: user.id,
                    item_type: 'service',
                    item_id: service.id,
                    terms_snapshot_pt: service.terms_content_pt,
                    terms_snapshot_en: service.terms_content_en,
                    ip_address: ip,
                    user_agent: userAgent
                })
        }

        // Atualizar service_request
        await supabase
            .from('service_requests')
            .update({ payment_id: payment.id })
            .eq('id', serviceRequest.id)

        // 9. Criar Sessão Stripe
        // Usar nome e descrição em português como padrão, com fallback para inglês
        const serviceName = service.nome_pt || service.nome_en || 'Professional Service'
        const serviceDescription = service.descricao_pt || service.descricao_en || `Professional Service: ${serviceName}`

        const sessionConfig: Stripe.Checkout.SessionCreateParams = {
            // Adicionamos 'card' junto com 'pix' para evitar erro 500 se o PIX não estiver ativado no Dashboard
            payment_method_types: payment_method === 'pix' ? ['card', 'pix'] : ['card'],
            line_items: [{
                price_data: {
                    currency: currency,
                    product_data: {
                        name: serviceName,
                        description: serviceDescription,
                    },
                    unit_amount: finalAmount,
                },
                quantity: 1,
            }],
            mode: 'payment',
            success_url: `${siteUrl}/pagamento/sucesso?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${siteUrl}/pagamento/cancelado?service_id=${service_id}`,
            metadata: {
                type: 'service_payment',
                service_id: service.id,
                service_request_id: serviceRequest.id,
                payment_id: payment.id,
                user_id: user.id
            },
            customer_email: user.email,
        }

        console.log('Creating Stripe Session with config:', JSON.stringify(sessionConfig, null, 2))
        const session = await stripe.checkout.sessions.create(sessionConfig)
        console.log('Stripe session created:', session.id)

        // 10. Atualizar DB com Session ID
        await supabase
            .from('service_payments')
            .update({
                stripe_session_id: session.id,
                metadata: {
                    ...payment.metadata,
                    checkout_url: session.url
                }
            })
            .eq('id', payment.id)

        return new Response(
            JSON.stringify({
                checkout_url: session.url,
                session_id: session.id,
                amount: finalAmount,
                currency: currency.toUpperCase()
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
