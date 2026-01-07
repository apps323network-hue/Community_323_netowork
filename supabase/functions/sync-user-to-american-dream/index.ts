import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const { email, password, nome, phone } = body

    // Validar campos obrigatórios
    if (!email || !password || !nome) {
      return new Response(
        JSON.stringify({ error: 'Email, password e nome são obrigatórios' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    // Obter secrets do American Dream
    const americanDreamUrl = Deno.env.get('AMERICAN_DREAM_URL')
    const americanDreamServiceRoleKey = Deno.env.get('AMERICAN_DREAM_SERVICE_ROLE_KEY')

    console.log('[EDGE] Verificando secrets...')
    console.log('[EDGE] AMERICAN_DREAM_URL:', americanDreamUrl ? '✅ Configurado' : '❌ FALTANDO')
    console.log('[EDGE] AMERICAN_DREAM_SERVICE_ROLE_KEY:', americanDreamServiceRoleKey ? '✅ Configurado' : '❌ FALTANDO')

    if (!americanDreamUrl || !americanDreamServiceRoleKey) {
      const missing = []
      if (!americanDreamUrl) missing.push('AMERICAN_DREAM_URL')
      if (!americanDreamServiceRoleKey) missing.push('AMERICAN_DREAM_SERVICE_ROLE_KEY')
      console.error('[EDGE] ❌ Secrets faltando:', missing.join(', '))
      throw new Error(`Missing environment variables: ${missing.join(', ')}. Configure no Dashboard > Edge Functions > Secrets`)
    }

    // Criar cliente Supabase Admin para American Dream
    console.log('[EDGE] Criando cliente Supabase para American Dream...')
    const supabaseAD = createClient(americanDreamUrl, americanDreamServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Verificar se usuário já existe no American Dream
    console.log('[EDGE] Verificando se usuário já existe no American Dream...')
    const { data: existingUser, error: listUsersError } = await supabaseAD.auth.admin.listUsers()
    
    if (listUsersError) {
      console.error('[EDGE] ❌ Erro ao listar usuários:', listUsersError)
      throw new Error(`Erro ao verificar usuários existentes: ${listUsersError.message}. Verifique se AMERICAN_DREAM_SERVICE_ROLE_KEY está correto.`)
    }
    
    const userExists = existingUser?.users?.some(u => u.email === email)
    console.log('[EDGE] Usuário existe?', userExists ? 'Sim' : 'Não')

    if (userExists) {
      console.log(`Usuário ${email} já existe no American Dream, pulando criação`)
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Usuário já existe no American Dream',
          skipped: true 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    // Criar usuário no American Dream com a mesma senha
    console.log('[EDGE] Criando usuário no American Dream...')
    const { data: newUser, error: createUserError } = await supabaseAD.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: {
        source: '323-network', // Flag para prevenir loops
        nome: nome,
        phone: phone || null,
      },
    })

    if (createUserError) {
      console.error('[EDGE] ❌ Erro ao criar usuário:', createUserError)
      console.error('[EDGE] Detalhes do erro:', {
        message: createUserError.message,
        status: createUserError.status,
        name: createUserError.name
      })
      
      // Mensagem mais clara para erro de API key
      if (createUserError.message?.includes('Invalid API key') || createUserError.status === 401) {
        throw new Error('Invalid API key do American Dream. Verifique se AMERICAN_DREAM_SERVICE_ROLE_KEY está correto no Dashboard > Edge Functions > Secrets')
      }
      
      throw createUserError
    }
    
    console.log('[EDGE] ✅ Usuário criado no American Dream:', newUser.user?.id)

    if (!newUser.user) {
      throw new Error('Falha ao criar usuário no American Dream')
    }

    // Criar lead no American Dream
    console.log('[EDGE] Criando lead no American Dream...')
    const { data: leadData, error: leadError } = await supabaseAD
      .from('leads')
      .insert({
        name: nome,
        email: email,
        phone: phone || '',
        user_id: newUser.user.id,
        status_geral: 'novo',
      })
      .select()
      .single()

    if (leadError) {
      console.error('[EDGE] ⚠️ Erro ao criar lead no American Dream:', leadError)
      console.error('[EDGE] Detalhes:', leadError.message)
      // Não falhar completamente se lead não for criado - usuário já foi criado
    } else {
      console.log('[EDGE] ✅ Lead criado no American Dream:', leadData?.id)
    }

    console.log(`Usuário ${email} criado com sucesso no American Dream`)

    return new Response(
      JSON.stringify({
        success: true,
        user_id: newUser.user.id,
        lead_id: leadData?.id || null,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error: any) {
    console.error('Erro na sincronização para American Dream:', error)
    return new Response(
      JSON.stringify({
        error: error.message || 'Erro desconhecido',
        stack: error.stack,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})

