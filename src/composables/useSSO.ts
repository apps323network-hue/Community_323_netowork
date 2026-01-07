import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase'

export function useSSO() {
  const router = useRouter()

  async function redirectToAmericanDream(redirectPath = '/') {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        // Se não tem sessão, redirecionar para login primeiro
        // O returnTo será processado após login para redirecionar para American Dream
        const callbackUrl = encodeURIComponent(
          `https://americandream.com/auth/callback?redirect=${encodeURIComponent(redirectPath)}`
        )
        router.push({ 
          name: 'Login', 
          query: { 
            returnTo: callbackUrl
          } 
        })
        return
      }
      
      // Redirecionar com token
      window.location.href = `https://americandream.com/auth/callback?token=${session.access_token}&redirect=${encodeURIComponent(redirectPath)}`
    } catch (error) {
      console.error('Erro ao redirecionar para American Dream:', error)
      // Em caso de erro, redirecionar para login
      router.push({ name: 'Login' })
    }
  }
  
  return { redirectToAmericanDream }
}

