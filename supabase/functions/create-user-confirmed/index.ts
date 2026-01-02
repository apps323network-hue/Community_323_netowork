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
    const { email, password, user_metadata } = body

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: 'Email e password são obrigatórios' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    // Obter variáveis de ambiente
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    // Tentar obter anon key, mas se não estiver disponível, usar service role key para sign in
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')

    console.log('[EDGE] Verificando secrets...')
    console.log('[EDGE] SUPABASE_URL:', supabaseUrl ? '✅ Configurado' : '❌ FALTANDO')
    console.log('[EDGE] SUPABASE_SERVICE_ROLE_KEY:', serviceRoleKey ? '✅ Configurado' : '❌ FALTANDO')
    console.log('[EDGE] SUPABASE_ANON_KEY:', anonKey ? '✅ Configurado' : '⚠️ Não configurado (usando service role)')

    if (!supabaseUrl || !serviceRoleKey) {
      const missing = []
      if (!supabaseUrl) missing.push('SUPABASE_URL')
      if (!serviceRoleKey) missing.push('SUPABASE_SERVICE_ROLE_KEY')
      console.error('[EDGE] ❌ Secrets faltando:', missing.join(', '))
      throw new Error(`Missing environment variables: ${missing.join(', ')}. Configure no Dashboard > Edge Functions > Secrets`)
    }

    // Criar cliente admin para criar usuário
    console.log('[EDGE] Criando cliente Supabase Admin...')
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Verificar se usuário já existe
    console.log('[EDGE] Verificando se usuário já existe...')
    const { data: existingUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (listError) {
      console.error('[EDGE] ❌ Erro ao listar usuários:', listError)
      throw new Error(`Erro ao verificar usuários existentes: ${listError.message}`)
    }
    
    const userExists = existingUsers?.users?.some(u => u.email === email)
    console.log('[EDGE] Usuário existe?', userExists ? 'Sim' : 'Não')

    if (userExists) {
      console.log(`[EDGE] Usuário ${email} já existe, fazendo sign in...`)
      
      // Se usuário já existe, fazer sign in para obter token
      // Usar anon key se disponível, senão usar service role key
      const keyForSignIn = anonKey || serviceRoleKey
      const supabaseForSignIn = createClient(supabaseUrl, keyForSignIn, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      })

      const { data: signInData, error: signInError } = await supabaseForSignIn.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        console.error('[EDGE] ❌ Erro ao fazer sign in:', signInError)
        throw new Error(`Erro ao fazer sign in: ${signInError.message}`)
      }

      if (!signInData.session) {
        throw new Error('Falha ao obter sessão após sign in')
      }

      console.log('[EDGE] ✅ Sign in realizado com sucesso')

      return new Response(
        JSON.stringify({
          success: true,
          user: signInData.user,
          access_token: signInData.session.access_token,
          refresh_token: signInData.session.refresh_token,
          existing: true,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    // Criar usuário com email confirmado
    console.log('[EDGE] Criando usuário com email confirmado...')
    const { data: newUser, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: user_metadata || {},
    })

    if (createUserError) {
      console.error('[EDGE] ❌ Erro ao criar usuário:', createUserError)
      throw createUserError
    }

    if (!newUser.user) {
      throw new Error('Falha ao criar usuário')
    }

    console.log('[EDGE] ✅ Usuário criado:', newUser.user.id)

    // Fazer sign in para obter token de sessão
    console.log('[EDGE] Fazendo sign in para obter token...')
    // Usar anon key se disponível, senão usar service role key
    const keyForSignIn = anonKey || serviceRoleKey
    const supabaseForSignIn = createClient(supabaseUrl, keyForSignIn, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    const { data: signInData, error: signInError } = await supabaseForSignIn.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      console.error('[EDGE] ❌ Erro ao fazer sign in:', signInError)
      throw new Error(`Erro ao fazer sign in após criação: ${signInError.message}`)
    }

    if (!signInData.session) {
      throw new Error('Falha ao obter sessão após criação de usuário')
    }

    console.log('[EDGE] ✅ Token obtido com sucesso')

    return new Response(
      JSON.stringify({
        success: true,
        user: newUser.user,
        access_token: signInData.session.access_token,
        refresh_token: signInData.session.refresh_token,
        existing: false,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error: any) {
    console.error('[EDGE] ❌ Erro na Edge Function:', error)
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

