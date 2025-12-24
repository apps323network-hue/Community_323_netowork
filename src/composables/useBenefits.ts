import { ref } from 'vue'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth'
import type { Benefit, UserBenefit } from '@/types/benefits'

export function useBenefits() {
  const benefits = ref<Benefit[]>([])
  const userBenefits = ref<UserBenefit[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  const authStore = useAuthStore()

  async function fetchBenefits() {
    loading.value = true
    error.value = null
    try {
      const { data, error: err } = await supabase
        .from('benefits')
        .select('*')
        .eq('ativo', true)
        .order('created_at', { ascending: false })
      
      if (err) throw err
      benefits.value = data || []
    } catch (e: any) {
      console.error('[useBenefits] Error fetching benefits:', e)
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function fetchUserBenefits() {
    if (!authStore.user) return
    
    loading.value = true
    try {
      const { data, error: err } = await supabase
        .from('user_benefits')
        .select('*, benefit:benefits(*)')
        .eq('user_id', authStore.user.id)
      
      if (err) throw err
      userBenefits.value = data || []
    } catch (e: any) {
      console.error('[useBenefits] Error fetching user benefits:', e)
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function claimBenefit(benefitId: string): Promise<boolean> {
    if (!authStore.user) {
      error.value = 'Você precisa estar logado'
      return false
    }
    
    try {
      const { error: err } = await supabase
        .from('user_benefits')
        .insert({
          user_id: authStore.user.id,
          benefit_id: benefitId
        })
      
      if (err) throw err
      await fetchUserBenefits() // Reload
      return true
    } catch (e: any) {
      console.error('[useBenefits] Error claiming benefit:', e)
      error.value = e.message
      return false
    }
  }

  function isBenefitClaimed(benefitId: string): boolean {
    return userBenefits.value.some(ub => ub.benefit_id === benefitId)
  }

  function canClaimBenefit(benefit: Benefit, userPlan: string): boolean {
    // Verificar se o usuário tem o plano necessário
    const planHierarchy: Record<string, number> = {
      Free: 0,
      Member: 1,
      Premium: 2
    }
    
    const userLevel = planHierarchy[userPlan] || 0
    const requiredLevel = planHierarchy[benefit.plano_requerido] || 0
    
    return userLevel >= requiredLevel
  }

  return {
    benefits,
    userBenefits,
    loading,
    error,
    fetchBenefits,
    fetchUserBenefits,
    claimBenefit,
    isBenefitClaimed,
    canClaimBenefit
  }
}
