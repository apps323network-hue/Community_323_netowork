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
    const { email, password, name, phone } = body

    // Validar campos obrigatórios
    if (!email || !password || !name) {
      return new Response(
        JSON.stringify({ error: 'Email, password e name são obrigatórios' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    // Obter URL e Service Role Key do 323 Network (do próprio projeto)
    // No Supabase Edge Functions, essas variáveis estão disponíveis automaticamente
    const supabase323Url = Deno.env.get('SUPABASE_URL')
    const supabase323ServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabase323Url || !supabase323ServiceRoleKey) {
      throw new Error('Missing environment variables: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
    }

    // Criar cliente Supabase Admin para 323 Network
    const supabase323 = createClient(supabase323Url, supabase323ServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Verificar se usuário já existe no 323 Network
    const { data: existingUser } = await supabase323.auth.admin.listUsers()
    const userExists = existingUser?.users?.some(u => u.email === email)

    if (userExists) {
      console.log(`Usuário ${email} já existe no 323 Network, pulando criação`)
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Usuário já existe no 323 Network',
          skipped: true 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    // Criar usuário no 323 Network com a mesma senha
    const { data: newUser, error: createUserError } = await supabase323.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: {
        source: 'american-dream', // Flag para prevenir loops
        nome: name,
        phone: phone || null,
      },
    })

    if (createUserError) {
      throw createUserError
    }

    if (!newUser.user) {
      throw new Error('Falha ao criar usuário no 323 Network')
    }

    // Criar profile no 323 Network
    const { data: profileData, error: profileError } = await supabase323
      .from('profiles')
      .insert({
        id: newUser.user.id,
        nome: name,
        phone: phone || null,
        plano: 'Free',
        badge: 'Free',
        status: 'pending',
      })
      .select()
      .single()

    if (profileError) {
      console.error('Erro ao criar profile no 323 Network:', profileError)
      // Não falhar completamente se profile não for criado - usuário já foi criado
    }

    console.log(`Usuário ${email} criado com sucesso no 323 Network`)

    return new Response(
      JSON.stringify({
        success: true,
        user_id: newUser.user.id,
        profile_id: profileData?.id || null,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error: any) {
    console.error('Erro na sincronização para 323 Network:', error)
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

