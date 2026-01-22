import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Parcelow Client Class
class ParcelowClient {
    private baseUrl: string
    private clientId: string
    private clientSecret: string

    constructor(environment: 'staging' | 'production', clientId: string, clientSecret: string) {
        this.baseUrl = environment === 'production'
            ? 'https://app.parcelow.com'
            : 'https://sandbox-2.parcelow.com.br'
        this.clientId = clientId
        this.clientSecret = clientSecret
    }

    private async getAccessToken(): Promise<string> {
        // Lógica da Migma: converter para número se for string numérica
        let clientIdToUse: any = this.clientId
        if (typeof this.clientId === 'string' && !isNaN(parseInt(this.clientId))) {
            clientIdToUse = parseInt(this.clientId)
        }

        console.log(`[Parcelow Auth] Authenticating for client: ${clientIdToUse} (Type: ${typeof clientIdToUse})`)

        const response = await fetch(`${this.baseUrl}/oauth/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                client_id: clientIdToUse,
                client_secret: this.clientSecret,
                grant_type: 'client_credentials'
            })
        })

        const errorText = await response.text()

        if (!response.ok) {
            console.error(`[Parcelow Auth] Failed (${response.status}):`, errorText.slice(0, 500))

            if (errorText.includes('<!DOCTYPE')) {
                throw new Error(`Erro Crítico Parcelow: O servidor retornou HTML (provavelmente URL errada ou serviço fora do ar). Status: ${response.status}`)
            }

            try {
                const json = JSON.parse(errorText)
                throw new Error(json.message || json.error || 'Erro na API de autenticação')
            } catch (e) {
                throw new Error(`Erro na Autenticação (${response.status}): ${errorText.slice(0, 100)}`)
            }
        }

        try {
            const data = JSON.parse(errorText)
            return data.access_token
        } catch (e) {
            throw new Error(`Erro ao processar token (JSON inválido): ${errorText.slice(0, 100)}`)
        }
    }

    async createOrder(params: {
        amount_usd: number
        client_name: string
        client_email: string
        client_cpf: string
        reference: string
        redirectUrls: { success: string; failed: string }
    }) {
        const accessToken = await this.getAccessToken()

        // Tentar criar com email original primeiro
        let orderData
        try {
            orderData = await this.attemptCreateOrder(accessToken, params)
        } catch (error: any) {
            // Se erro de email duplicado, adicionar timestamp
            if (error.message.includes('Email do cliente existente')) {
                console.log('[Parcelow] Email duplicado, tentando com timestamp...')
                const aliasedEmail = params.client_email.replace('@', `+${Date.now()}@`)
                orderData = await this.attemptCreateOrder(accessToken, { ...params, client_email: aliasedEmail })
            } else {
                throw error
            }
        }

        return orderData
    }

    private async attemptCreateOrder(accessToken: string, params: {
        amount_usd: number
        client_name: string
        client_email: string
        client_cpf: string
        reference: string
        redirectUrls: { success: string; failed: string }
    }) {
        const notifyUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/parcelow-webhook`
        const response = await fetch(`${this.baseUrl}/api/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({
                reference: params.reference,
                items: [
                    {
                        reference: params.reference,
                        description: 'Service Payment',
                        quantity: 1,
                        amount: params.amount_usd
                    }
                ],
                client: {
                    name: params.client_name,
                    email: params.client_email,
                    cpf: params.client_cpf
                },
                redirectUrls: params.redirectUrls,
                // Passando ambos para garantir compatibilidade
                notify_url: notifyUrl,
                webhook_url: notifyUrl
            })
        })

        const responseText = await response.text()

        if (!response.ok) {
            console.error(`[Parcelow Order] Failed (${response.status}):`, responseText.slice(0, 500))

            if (responseText.includes('<!DOCTYPE')) {
                throw new Error(`Erro Crítico Parcelow: O servidor retornou HTML ao criar pedido. Status: ${response.status}`)
            }

            try {
                const json = JSON.parse(responseText)
                throw new Error(json.message || json.error || 'Erro na criação do pedido')
            } catch (e) {
                throw new Error(`Erro na API de Pedidos (${response.status}): ${responseText.slice(0, 100)}`)
            }
        }

        try {
            return JSON.parse(responseText)
        } catch (e) {
            throw new Error(`Erro ao processar resposta do pedido (JSON inválido): ${responseText.slice(0, 100)}`)
        }
    }
}

Deno.serve(async (req) => {
    // Handle CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const method = req.method
        const body = method !== 'GET' && method !== 'HEAD' ? await req.json().catch(() => ({})) : {}
        const { payment_id, currency = 'USD' } = body

        // Se faltar payment_id, pode ser um webhook chamando a função errada
        if (!payment_id) {
            // Verificar se o corpo parece um webhook da Parcelow (tem o campo 'order' ou 'event')
            if (body.event || body.order) {
                console.error(`[Parcelow Checkout] ⚠️ REDIRECIONAMENTO DE WEBHOOK DETECTADO!`)
                console.error(`A Parcelow está chamando a função de CHECKOUT em vez da função de WEBHOOK.`)
                console.error(`Evento recebido: ${body.event}. Order ID: ${body.order?.id}`)

                return new Response(JSON.stringify({
                    success: false,
                    error: "Wrong endpoint. Please use the /parcelow-webhook endpoint for notifications.",
                    received_event: body.event
                }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    status: 200 // Retornamos 200 para a Parcelow parar de tentar este endpoint
                })
            }

            console.error(`[Parcelow Checkout] ❌ Missing payment_id!`)
            console.error(`Method: ${method}`)
            console.error(`Headers:`, JSON.stringify(Object.fromEntries(req.headers.entries())))
            console.error(`Body:`, JSON.stringify(body))
            throw new Error('payment_id is required for checkout creation')
        }

        console.log(`[Parcelow Checkout] Creating checkout for payment: ${payment_id}`)

        // Detect environment based on origin/referer
        const referer = req.headers.get('referer')
        const origin = req.headers.get('origin') || ''

        // 1. Determine siteUrl for redirection
        let siteUrl = ''
        if (referer) {
            try {
                siteUrl = new URL(referer).origin
            } catch (e) {
                siteUrl = origin
            }
        } else {
            siteUrl = origin || 'https://323network.com'
        }

        const isLocalhost = siteUrl.includes('localhost') || siteUrl.includes('127.0.0.1')
        const isStaging = siteUrl.includes('vercel.app')

        // Se não for localhost nem staging, forçamos a URL de produção
        if (!isLocalhost && !isStaging) {
            siteUrl = 'https://323network.com'
        }

        // Use staging/sandbox for localhost/staging URLs, production otherwise
        const environment: 'staging' | 'production' = (isLocalhost || isStaging) ? 'staging' : 'production'

        const clientId = environment === 'production'
            ? Deno.env.get('PARCELOW_CLIENT_ID_PRODUCTION')
            : Deno.env.get('PARCELOW_CLIENT_ID_STAGING')

        const clientSecret = environment === 'production'
            ? Deno.env.get('PARCELOW_CLIENT_SECRET_PRODUCTION')
            : Deno.env.get('PARCELOW_CLIENT_SECRET_STAGING')

        if (!clientId || !clientSecret) {
            throw new Error(`Parcelow credentials not configured for ${environment} environment`)
        }

        console.log(`[Parcelow Checkout] Running in ${environment.toUpperCase()} mode (Origin: ${origin})`)

        // Inicializar Supabase Admin
        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

        // 1. Validar Token do Usuário (Manual Auth since we deploy with verify_jwt: false)
        const authHeader = req.headers.get('Authorization')
        if (!authHeader) {
            throw new Error('No authorization header')
        }

        const token = authHeader.replace('Bearer ', '')
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)

        if (authError || !user) {
            console.error('[Parcelow Checkout] Auth Error:', authError)
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 401
            })
        }

        // Buscar payment (Sem join pois falta FK no banco)
        const { data: payment, error: paymentError } = await supabaseAdmin
            .from('service_payments')
            .select('*')
            .eq('id', payment_id)
            .single()

        if (paymentError || !payment) {
            throw new Error(`Payment not found: ${paymentError?.message}`)
        }

        // 2. Verificar se o payment pertence ao usuário autenticado (Segurança extra)
        if (payment.user_id !== user.id) {
            console.error(`[Parcelow Checkout] Security violation: User ${user.id} tried to access payment ${payment.id} owned by ${payment.user_id}`)
            return new Response(JSON.stringify({ error: 'Access denied' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 403
            })
        }

        // 3. Buscar Perfil do Usuário
        const { data: profile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('nome, document_number, email')
            .eq('id', payment.user_id)
            .single()

        if (profileError || !profile) {
            throw new Error(`User profile not found: ${profileError?.message}`)
        }

        // Validar CPF
        const cpf = profile.document_number
        if (!cpf || cpf.length < 11) {
            throw new Error('CPF is required for Parcelow payment. Please update your profile.')
        }

        // Limpar CPF (remover pontuação)
        const cleanCpf = cpf.replace(/\D/g, '')

        if (cleanCpf.length !== 11) {
            throw new Error('Invalid CPF format. Must be 11 digits.')
        }

        // Criar cliente Parcelow
        const parcelowClient = new ParcelowClient(environment, clientId, clientSecret)

        // Criar order na Parcelow
        const orderData = await parcelowClient.createOrder({
            amount_usd: payment.amount, // Já está em centavos
            client_name: profile.nome || 'Cliente',
            client_email: profile.email || user.email,
            client_cpf: cleanCpf,
            reference: payment.id,
            redirectUrls: {
                success: `${siteUrl}/pagamento/sucesso?payment_id=${payment.id}&type=${payment.program_id ? 'program' : 'service'}`,
                failed: `${siteUrl}/pagamento/cancelado?payment_id=${payment.id}&type=${payment.program_id ? 'program' : 'service'}`
            }
        })

        console.log(`[Parcelow Checkout] ✅ Order created. Parcelow ID: ${orderData.data.order_id}`)
        console.log(`[Parcelow Checkout] 📊 Response data:`, JSON.stringify(orderData, null, 2))

        // Salvar dados no banco
        const { error: updateError } = await supabaseAdmin
            .from('service_payments')
            .update({
                parcelow_order_id: String(orderData.data.order_id),
                parcelow_checkout_url: orderData.data.url_checkout,
                parcelow_status: 'Open',
                parcelow_status_code: 0,
                metadata: {
                    ...payment.metadata,
                    parcelow_environment: environment,
                    parcelow_created_at: new Date().toISOString()
                }
            })
            .eq('id', payment_id)

        if (updateError) {
            console.error('[Parcelow Checkout] ❌ Failed to save order data:', updateError)
        }

        // Retornar dados do checkout
        return new Response(
            JSON.stringify({
                success: true,
                checkout_url: orderData.data.url_checkout,
                order_id: orderData.data.order_id,
                status: 'Open',
                total_usd: payment.amount,
                order_amount: payment.amount
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200
            }
        )

    } catch (error) {
        console.error('[Parcelow Checkout] ❌ Error:', error.message)
        return new Response(
            JSON.stringify({
                success: false,
                error: error.message
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400
            }
        )
    }
})
