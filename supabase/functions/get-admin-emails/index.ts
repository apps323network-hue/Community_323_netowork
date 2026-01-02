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
    // Criar cliente Supabase Admin
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Buscar todos os perfis com role='admin'
    const { data: adminProfiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('id, nome')
      .eq('role', 'admin')

    if (profilesError) {
      throw profilesError
    }

    if (!adminProfiles || adminProfiles.length === 0) {
      return new Response(JSON.stringify({ admins: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // Buscar emails dos admins via Admin API
    const adminsWithEmails = await Promise.all(
      adminProfiles.map(async (profile) => {
        try {
          const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(profile.id)
          
          if (userError || !userData?.user) {
            console.error(`Error fetching email for admin ${profile.id}:`, userError)
            return null
          }

          return {
            id: profile.id,
            nome: profile.nome || 'Admin',
            email: userData.user.email || null,
          }
        } catch (err) {
          console.error(`Error processing admin ${profile.id}:`, err)
          return null
        }
      })
    )

    // Filtrar nulls e retornar apenas admins com email válido
    const validAdmins = adminsWithEmails.filter((admin): admin is { id: string; nome: string; email: string } => 
      admin !== null && admin.email !== null
    )

    return new Response(JSON.stringify({ admins: validAdmins }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Error fetching admin emails:', error)
    return new Response(JSON.stringify({
      error: error.message,
      admins: []
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})

