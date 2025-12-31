import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '../auth'

/**
 * Store base compartilhado para funcionalidades comuns do admin
 * Contém estados e funções compartilhadas entre todos os stores de admin
 * Usa Pinia para garantir que loading e error sejam compartilhados entre todos os stores
 */
export const useAdminBaseStore = defineStore('admin-base', () => {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const authStore = useAuthStore()

  // Verificar se usuário é admin
  async function checkIsAdmin(): Promise<boolean> {
    if (!authStore.user) {
      console.log('[ADMIN] checkIsAdmin: Usuário não autenticado')
      return false
    }

    try {
      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', authStore.user.id)
        .single()

      if (profileError) {
        console.error('[ADMIN] checkIsAdmin: Erro ao buscar role:', profileError)
        return false
      }

      const isAdmin = data?.role === 'admin'
      console.log('[ADMIN] checkIsAdmin:', { userId: authStore.user.id, role: data?.role, isAdmin })
      return isAdmin
    } catch (err: any) {
      console.error('[ADMIN] checkIsAdmin: Exceção:', err)
      return false
    }
  }

  return {
    loading,
    error,
    checkIsAdmin,
    authStore,
  }
})

