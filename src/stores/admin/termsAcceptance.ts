import { defineStore } from 'pinia'
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { supabase } from '@/lib/supabase'
import { useAdminBaseStore } from './base'
import type { TermAcceptance, ApplicationTerm } from '@/composables/useTermsAcceptance'
import { generatePDFFromAcceptance } from '@/utils/pdfGenerator'

export interface TermAcceptanceWithDetails extends TermAcceptance {
  term: ApplicationTerm
  user_name?: string
  user_email?: string
  user_country?: string
  user_avatar?: string
}

export interface TermAcceptanceStats {
  total: number
  terms_of_service: number
  privacy_policy: number
  today: number
  this_week: number
  this_month: number
}

export const useAdminTermsAcceptanceStore = defineStore('admin-terms-acceptance', () => {
  const baseStore = useAdminBaseStore()
  const { loading, error } = storeToRefs(baseStore)

  const acceptances = ref<TermAcceptanceWithDetails[]>([])
  const stats = ref<TermAcceptanceStats>({
    total: 0,
    terms_of_service: 0,
    privacy_policy: 0,
    today: 0,
    this_week: 0,
    this_month: 0,
  })

  /**
   * Busca todos os aceites com informações do termo e usuário
   */
  async function fetchAcceptances(filters?: {
    term_type?: 'terms_of_service' | 'privacy_policy'
    term_id?: string
    user_id?: string
    start_date?: string
    end_date?: string
  }) {
    loading.value = true
    error.value = null

    try {
      // Limpar dados anteriores para forçar atualização visual
      acceptances.value = []
      
      // Primeiro buscar os aceites
      let query = supabase
        .from('comprehensive_term_acceptance')
        .select('*, term:application_terms(*)')
        .order('accepted_at', { ascending: false })

      // Aplicar filtros
      if (filters?.term_type) {
        query = query.eq('term_type', filters.term_type)
      }

      if (filters?.term_id) {
        query = query.eq('term_id', filters.term_id)
      }

      if (filters?.user_id) {
        query = query.eq('user_id', filters.user_id)
      }

      if (filters?.start_date) {
        query = query.gte('accepted_at', filters.start_date)
      }

      if (filters?.end_date) {
        query = query.lte('accepted_at', filters.end_date)
      }

      const { data: acceptancesData, error: queryError } = await query

      if (queryError) throw queryError

      if (!acceptancesData || acceptancesData.length === 0) {
        acceptances.value = []
        return
      }

      // Buscar dados dos usuários separadamente
      const userIds = [...new Set(acceptancesData.map((a: any) => a.user_id))]
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, nome, email, pais, avatar_url')
        .in('id', userIds)

      if (profilesError) {
        console.warn('[ADMIN] Erro ao buscar perfis:', profilesError)
      }

      // Criar mapa de usuários para lookup rápido
      const profilesMap = new Map()
      if (profilesData) {
        profilesData.forEach((profile: any) => {
          profilesMap.set(profile.id, profile)
        })
      }

      // Combinar dados
      acceptances.value = acceptancesData.map((item: any) => {
        const profile = profilesMap.get(item.user_id)
        return {
          ...item,
          user_name: profile?.nome || 'N/A',
          user_email: profile?.email || 'N/A',
          user_country: profile?.pais || 'N/A',
          user_avatar: profile?.avatar_url || null,
        }
      }) as TermAcceptanceWithDetails[]
    } catch (err: any) {
      console.error('[ADMIN] Erro ao buscar aceites:', err)
      error.value = err.message || 'Erro ao buscar aceites'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Busca estatísticas de aceites
   */
  async function fetchStats() {
    loading.value = true
    error.value = null

    try {
      // Total
      const { count: totalCount, error: totalError } = await supabase
        .from('comprehensive_term_acceptance')
        .select('*', { count: 'exact', head: true })

      if (totalError) throw totalError

      // Por tipo
      const { count: termsCount, error: termsError } = await supabase
        .from('comprehensive_term_acceptance')
        .select('*', { count: 'exact', head: true })
        .eq('term_type', 'terms_of_service')

      if (termsError) throw termsError

      const { count: privacyCount, error: privacyError } = await supabase
        .from('comprehensive_term_acceptance')
        .select('*', { count: 'exact', head: true })
        .eq('term_type', 'privacy_policy')

      if (privacyError) throw privacyError

      // Hoje
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const { count: todayCount, error: todayError } = await supabase
        .from('comprehensive_term_acceptance')
        .select('*', { count: 'exact', head: true })
        .gte('accepted_at', today.toISOString())

      if (todayError) throw todayError

      // Esta semana
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      const { count: weekCount, error: weekError } = await supabase
        .from('comprehensive_term_acceptance')
        .select('*', { count: 'exact', head: true })
        .gte('accepted_at', weekAgo.toISOString())

      if (weekError) throw weekError

      // Este mês
      const monthAgo = new Date()
      monthAgo.setMonth(monthAgo.getMonth() - 1)
      const { count: monthCount, error: monthError } = await supabase
        .from('comprehensive_term_acceptance')
        .select('*', { count: 'exact', head: true })
        .gte('accepted_at', monthAgo.toISOString())

      if (monthError) throw monthError

      stats.value = {
        total: totalCount || 0,
        terms_of_service: termsCount || 0,
        privacy_policy: privacyCount || 0,
        today: todayCount || 0,
        this_week: weekCount || 0,
        this_month: monthCount || 0,
      }
    } catch (err: any) {
      console.error('[ADMIN] Erro ao buscar estatísticas:', err)
      error.value = err.message || 'Erro ao buscar estatísticas'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Gera e baixa PDF de um aceite específico
   */
  async function downloadAcceptancePDF(acceptanceId: string) {
    loading.value = true
    error.value = null
    
    try {
      const acceptance = acceptances.value.find((a) => a.id === acceptanceId)

      if (!acceptance) {
        throw new Error('Aceite não encontrado')
      }

      if (!acceptance.term) {
        throw new Error('Termo não encontrado')
      }

      // Buscar email do usuário de auth.users se não estiver disponível no profile
      let userEmail = acceptance.user_email
      if (!userEmail || userEmail === 'N/A') {
        try {
          const { data: emailData, error: emailError } = await supabase.rpc('get_user_email', {
            user_id_param: acceptance.user_id,
          })
          if (!emailError && emailData) {
            userEmail = emailData
          }
        } catch (err) {
          console.warn('[ADMIN] Erro ao buscar email de auth.users:', err)
        }
      }

      const userProfile = {
        nome: acceptance.user_name || 'N/A',
        email: userEmail || 'N/A',
        pais: acceptance.user_country || undefined,
        avatar_url: acceptance.user_avatar || undefined,
      }

      // Gerar PDF
      await generatePDFFromAcceptance(
        {
          ...acceptance,
          term: acceptance.term,
        },
        userProfile
      )
    } catch (err: any) {
      console.error('[ADMIN] Erro ao gerar PDF:', err)
      error.value = err.message || 'Erro ao gerar PDF'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    acceptances,
    stats,
    loading,
    error,
    fetchAcceptances,
    fetchStats,
    downloadAcceptancePDF,
  }
})
