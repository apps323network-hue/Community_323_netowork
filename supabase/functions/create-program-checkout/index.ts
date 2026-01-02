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

Deno.serve(async (req) => {
    console.log('Program Checkout Request received:', req.method)

    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const authHeader = req.headers.get('Authorization')

        // 1. Validar e obter body
        let body
        try {
            body = await req.json()
        } catch (e) {
            console.error('Error parsing JSON:', e)
            throw new Error('Invalid JSON body')
        }

        const { program_id, payment_method, exchange_rate } = body

        if (!program_id || !payment_method) {
            throw new Error('program_id e payment_method são obrigatórios')
        }

        // 2. Setup Supabase Admin
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        const supabase = createClient(supabaseUrl, supabaseKey)

        // 3. Validar Usuário
        if (!authHeader) {
            throw new Error('Token de autenticação não fornecido')
        }
        const token = authHeader.replace('Bearer ', '')
        const { data: { user }, error: authError } = await supabase.auth.getUser(token)

        if (authError || !user) {
            console.error('Auth error:', authError)
            throw new Error('Usuário não autenticado')
        }

        // 4. Detectar ambiente
        const referer = req.headers.get('referer')
        let siteUrl = referer ? new URL(referer).origin : Deno.env.get('SITE_URL') || 'http://localhost:5173'
        const isProduction = siteUrl.includes('community-323-netowork.vercel.app') ||
            siteUrl.includes('323network')

        // 5. Setup Stripe
        const origin = req.headers.get('origin') || ''
        const isDevelopment = origin.includes('localhost') || origin.includes('127.0.0.1')

        // Selecionar a chave do Stripe baseada no ambiente
        const stripeKey = isDevelopment
            ? Deno.env.get('STRIPE_TEST_SECRET_KEY')
            : Deno.env.get('STRIPE_SECRET_KEY')

        if (!stripeKey) {
            throw new Error(`Stripe Secret Key não configurada para o ambiente: ${isDevelopment ? 'TEST' : 'PROD'}`)
        }

        const stripe = new Stripe(stripeKey, {
            apiVersion: '2023-10-16',
            httpClient: Stripe.createFetchHttpClient(),
        })

        // 6. Buscar Programa
        const { data: program, error: programError } = await supabase
            .from('programs')
            .select('*')
            .eq('id', program_id)
            .single()

        if (programError || !program) {
            throw new Error('Programa não encontrado')
        }

        if (program.status !== 'published') {
            throw new Error('Este programa não está disponível para matrícula')
        }

        // Verificar vagas
        if (program.max_students && program.current_students >= program.max_students) {
            throw new Error('Este programa não possui mais vagas disponíveis')
        }

        // 7. Calcular valores
        let finalAmount: number
        let currency: string

        // Preço base em USD (multiplicamos por 100 para centavos)
        const basePriceUSD = Math.round(program.price_usd * 100)

        if (payment_method === 'pix') {
            if (!exchange_rate) {
                throw new Error('Taxa de câmbio é obrigatória para PIX')
            }
            currency = 'brl'
            // Fórmula: (Base USD * Taxa * 1.04) / (1 - 0.0179)
            const RATE_MARGIN = 1.04
            const rateWithMargin = exchange_rate * RATE_MARGIN
            const netAmountBRL = (program.price_usd) * rateWithMargin
            const grossAmountBRL = netAmountBRL / (1 - PIX_FEE_PERCENTAGE)

            finalAmount = Math.round(grossAmountBRL * 100) // Centavos de BRL
        } else {
            currency = 'usd'
            finalAmount = Math.round(
                basePriceUSD +
                (basePriceUSD * CARD_FEE_PERCENTAGE) +
                CARD_FEE_FIXED
            )
        }

        console.log(`Program Checkout: ${program.title_pt} - ${finalAmount} ${currency}`)

        // 8. Criar/Atualizar Matrícula (Enrollment) como 'pending'
        // Usamos upsert baseado na constraint UNIQUE(program_id, user_id)
        const { data: enrollment, error: enrollmentError } = await supabase
            .from('program_enrollments')
            .upsert({
                program_id: program.id,
                user_id: user.id,
                status: 'pending',
                payment_amount: finalAmount,
                payment_currency: currency.toUpperCase(),
                payment_method: payment_method,
                payment_status: 'pending',
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'program_id,user_id'
            })
            .select()
            .single()

        if (enrollmentError) throw new Error('Erro ao processar matrícula: ' + enrollmentError.message)

        // 9. Criar Sessão Stripe
        const sessionConfig: Stripe.Checkout.SessionCreateParams = {
            payment_method_types: payment_method === 'pix' ? ['pix'] : ['card'],
            line_items: [{
                price_data: {
                    currency: currency,
                    product_data: {
                        name: program.title_pt,
                        description: program.short_description_pt || undefined,
                        images: program.thumbnail_url ? [program.thumbnail_url] : undefined,
                    },
                    unit_amount: finalAmount,
                },
                quantity: 1,
            }],
            mode: 'payment',
            success_url: `${siteUrl}/pagamento/sucesso?type=program&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${siteUrl}/programas/${program.id}`,
            metadata: {
                type: 'program_payment',
                program_id: program.id,
                enrollment_id: enrollment.id,
                user_id: user.id
            },
            customer_email: user.email,
        }

        const session = await stripe.checkout.sessions.create(sessionConfig)

        // 10. Atualizar Enrollment com Session ID
        await supabase
            .from('program_enrollments')
            .update({
                payment_id: session.id
            })
            .eq('id', enrollment.id)

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
        console.error('Program Checkout error:', error.message)
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400
            }
        )
    }
})
