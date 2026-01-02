import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('[SUPABASE] Variáveis de ambiente faltando:')
  console.error('  VITE_SUPABASE_URL:', supabaseUrl ? '✓' : '✗')
  console.error('  VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✓' : '✗')
  throw new Error('Missing Supabase environment variables. Verifique seu arquivo .env')
}

// Validar formato da URL
if (!supabaseUrl.startsWith('http://') && !supabaseUrl.startsWith('https://')) {
  console.error('[SUPABASE] URL inválida:', supabaseUrl)
  throw new Error('VITE_SUPABASE_URL deve começar com http:// ou https://')
}

// Validar formato da chave (deve ser um JWT)
if (!supabaseAnonKey.startsWith('eyJ')) {
  console.warn('[SUPABASE] Chave anon pode estar incorreta (deve ser um JWT)')
}


export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

