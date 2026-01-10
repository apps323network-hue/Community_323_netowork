import { ref } from 'vue'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth'

export type TermType = 'terms_of_service' | 'privacy_policy'

export interface ApplicationTerm {
  id: string
  title: string
  content: string
  term_type: TermType
  version: number
  is_active: boolean
  created_at: string
  updated_at?: string
}

export interface TermAcceptance {
  id: string
  user_id: string
  term_id: string
  term_type: TermType
  accepted_at: string
  ip_address: string | null
  user_agent: string | null
}

export function useTermsAcceptance() {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const authStore = useAuthStore()

  /**
   * Obtém o IP do usuário usando API externa
   */
  async function getUserIP(): Promise<string | null> {
    try {
      const response = await fetch('https://api.ipify.org?format=json')
      const data = await response.json()
      return data.ip || null
    } catch (err) {
      console.warn('[useTermsAcceptance] Erro ao obter IP:', err)
      return null
    }
  }

  /**
   * Verifica se o usuário aceitou a versão ativa do termo especificado
   */
  async function checkTermAcceptance(
    type: TermType,
    userId?: string
  ): Promise<boolean> {
    const targetUserId = userId || authStore.user?.id
    if (!targetUserId) {
      return false
    }

    loading.value = true
    error.value = null

    try {
      const { data, error: rpcError } = await supabase.rpc(
        'check_user_term_acceptance',
        {
          p_user_id: targetUserId,
          p_term_type: type,
        }
      )

      if (rpcError) throw rpcError

      return data === true
    } catch (err: any) {
      console.error('[useTermsAcceptance] Erro ao verificar aceite:', err)
      error.value = err.message || 'Erro ao verificar aceite de termos'
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Busca o termo ativo mais recente do tipo especificado
   */
  async function getLatestActiveTerm(
    type: TermType
  ): Promise<ApplicationTerm | null> {
    loading.value = true
    error.value = null

    try {
      const { data, error: queryError } = await supabase.rpc(
        'get_latest_active_term',
        {
          p_term_type: type,
        }
      )

      if (queryError) throw queryError

      if (!data || data.length === 0) {
        return null
      }

      return data[0] as ApplicationTerm
    } catch (err: any) {
      console.error('[useTermsAcceptance] Erro ao buscar termo:', err)
      error.value = err.message || 'Erro ao buscar termo'
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Registra o aceite de um termo pelo usuário
   */
  async function recordTermAcceptance(
    termId: string,
    type: TermType,
    userId?: string
  ): Promise<boolean> {
    const targetUserId = userId || authStore.user?.id
    if (!targetUserId) {
      error.value = 'Usuário não autenticado'
      return false
    }

    loading.value = true
    error.value = null

    try {
      // Obter IP e User Agent
      const ipAddress = await getUserIP()
      const userAgent = navigator.userAgent

      const { data, error: rpcError } = await supabase.rpc(
        'record_term_acceptance',
        {
          p_user_id: targetUserId,
          p_term_id: termId,
          p_term_type: type,
          p_ip_address: ipAddress,
          p_user_agent: userAgent,
        }
      )

      if (rpcError) throw rpcError

      return data === true
    } catch (err: any) {
      console.error('[useTermsAcceptance] Erro ao registrar aceite:', err)
      error.value = err.message || 'Erro ao registrar aceite de termos'
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Busca todos os aceites de um usuário
   */
  async function getUserAcceptances(
    userId?: string
  ): Promise<TermAcceptance[]> {
    const targetUserId = userId || authStore.user?.id
    if (!targetUserId) {
      return []
    }

    loading.value = true
    error.value = null

    try {
      const { data, error: queryError } = await supabase
        .from('comprehensive_term_acceptance')
        .select('*')
        .eq('user_id', targetUserId)
        .order('accepted_at', { ascending: false })

      if (queryError) throw queryError

      return (data || []) as TermAcceptance[]
    } catch (err: any) {
      console.error('[useTermsAcceptance] Erro ao buscar aceites:', err)
      error.value = err.message || 'Erro ao buscar aceites'
      return []
    } finally {
      loading.value = false
    }
  }

  /**
   * Busca aceite específico com informações do termo
   */
  async function getAcceptanceWithTerm(
    acceptanceId: string
  ): Promise<(TermAcceptance & { term: ApplicationTerm }) | null> {
    loading.value = true
    error.value = null

    try {
      const { data, error: queryError } = await supabase
        .from('comprehensive_term_acceptance')
        .select(
          `
          *,
          term:application_terms(*)
        `
        )
        .eq('id', acceptanceId)
        .single()

      if (queryError) throw queryError

      if (!data) {
        return null
      }

      return {
        ...(data as TermAcceptance),
        term: data.term as ApplicationTerm,
      }
    } catch (err: any) {
      console.error('[useTermsAcceptance] Erro ao buscar aceite:', err)
      error.value = err.message || 'Erro ao buscar aceite'
      return null
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    checkTermAcceptance,
    getLatestActiveTerm,
    recordTermAcceptance,
    getUserAcceptances,
    getAcceptanceWithTerm,
    getUserIP,
  }
}
