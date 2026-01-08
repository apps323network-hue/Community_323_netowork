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
    // Obter token do header Authorization
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ valid: false, error: 'Missing or invalid Authorization header' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    
    console.log('[EDGE] Validando token para serviço externo...')
    
    // Criar cliente Supabase com Service Role Key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    console.log('[EDGE] Verificando secrets...')
    console.log('[EDGE] SUPABASE_URL:', supabaseUrl ? '✅ Configurado' : '❌ FALTANDO')
    console.log('[EDGE] SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅ Configurado' : '❌ FALTANDO')
    
    if (!supabaseUrl || !supabaseServiceKey) {
      const missing = []
      if (!supabaseUrl) missing.push('SUPABASE_URL')
      if (!supabaseServiceKey) missing.push('SUPABASE_SERVICE_ROLE_KEY')
      console.error('[EDGE] ❌ Secrets faltando:', missing.join(', '))
      throw new Error(`Missing environment variables: ${missing.join(', ')}. Configure no Dashboard > Edge Functions > Secrets`)
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Validar token e obter usuário
    console.log('[EDGE] Validando token JWT...')
    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
      console.error('[EDGE] ❌ Token inválido ou expirado:', error?.message)
      return new Response(
        JSON.stringify({ valid: false, error: 'Invalid or expired token' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        }
      )
    }

    console.log('[EDGE] ✅ Token válido para usuário:', user.id)

    // Buscar profile do usuário
    console.log('[EDGE] Buscando profile do usuário...')
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('[EDGE] ⚠️ Erro ao buscar profile:', profileError.message)
      // Não falhar se profile não existir - retornar dados básicos do auth.users
    }

    // Construir nome completo
    let fullName = user.email?.split('@')[0] || 'User'
    let firstName: string | null = null
    let lastName: string | null = null

    if (profile?.nome) {
      fullName = profile.nome
      // Tentar separar nome e sobrenome
      const nameParts = profile.nome.trim().split(/\s+/)
      if (nameParts.length > 0) {
        firstName = nameParts[0]
        if (nameParts.length > 1) {
          lastName = nameParts.slice(1).join(' ')
        }
      }
    } else if (user.user_metadata?.nome) {
      fullName = user.user_metadata.nome
      const nameParts = fullName.trim().split(/\s+/)
      if (nameParts.length > 0) {
        firstName = nameParts[0]
        if (nameParts.length > 1) {
          lastName = nameParts.slice(1).join(' ')
        }
      }
    } else if (user.user_metadata?.firstName) {
      firstName = user.user_metadata.firstName
      lastName = user.user_metadata.lastName || null
      fullName = lastName ? `${firstName} ${lastName}` : firstName
    }

    // Retornar dados do usuário (sem informações sensíveis)
    // Formato compatível com Matrícula US (user_profiles)
    const userData = {
      valid: true,
      user: {
        id: user.id,
        email: user.email || '',
        email_confirmed: user.email_confirmed_at ? true : false,
        full_name: fullName,
        first_name: firstName,
        last_name: lastName,
        phone: profile?.phone || user.user_metadata?.phone || null,
        country: profile?.pais || user.user_metadata?.country || 'USA',
        created_at: user.created_at,
      },
    }

    console.log('[EDGE] ✅ Retornando dados do usuário (sem informações sensíveis)')
    
    return new Response(
      JSON.stringify(userData),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error: any) {
    console.error('[EDGE] ❌ Erro ao validar usuário:', error)
    return new Response(
      JSON.stringify({ valid: false, error: 'Internal server error', details: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})




