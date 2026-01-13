import { useUserStore } from '@/stores/user'
import { supabase } from '@/lib/supabase'
import type { UserProfile } from '@/stores/user'

/**
 * Verifica se o perfil do usuário está completo (campos essenciais preenchidos)
 */
export function isProfileComplete(profile: UserProfile | null): boolean {
  if (!profile) return false

  // Campos essenciais obrigatórios
  const hasName = !!profile.nome && profile.nome.trim() !== ''
  const hasArea = !!profile.area_atuacao && profile.area_atuacao.trim() !== ''
  const hasCountry = !!profile.pais && profile.pais.trim() !== ''
  const hasState = !!profile.estado && profile.estado.trim() !== ''
  const hasCity = !!profile.cidade && profile.cidade.trim() !== ''

  return hasName && hasArea && hasCountry && hasState && hasCity
}

/**
 * Verifica se o usuário completou o onboarding
 */
export function hasCompletedOnboarding(profile: UserProfile | null): boolean {
  if (!profile) return false
  
  // Verificar flag onboarding_completed
  if ((profile as any).onboarding_completed === true) {
    return true
  }

  // Fallback: verificar se perfil está completo
  return isProfileComplete(profile)
}

/**
 * Completa o onboarding e salva os dados do perfil
 */
export async function completeOnboarding(
  profileData: Partial<UserProfile>
): Promise<{ success: boolean; error?: string }> {
  try {
    const userStore = useUserStore()
    
    if (!userStore.profile?.id) {
      throw new Error('Usuário não autenticado')
    }

    // Preparar dados para atualização
    const updates: any = {
      ...profileData,
      onboarding_completed: true,
      updated_at: new Date().toISOString(),
    }

    // Remover campos undefined
    Object.keys(updates).forEach(key => {
      if (updates[key] === undefined) {
        delete updates[key]
      }
    })

    // Atualizar perfil no banco
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userStore.profile.id)

    if (error) {
      console.error('[ONBOARDING] Erro ao salvar perfil:', error)
      throw error
    }

    // Atualizar store local
    await userStore.fetchProfile(userStore.profile.id)

    return { success: true }
  } catch (error: any) {
    console.error('[ONBOARDING] Erro ao completar onboarding:', error)
    return { 
      success: false, 
      error: error.message || 'Erro ao salvar dados do perfil' 
    }
  }
}

/**
 * Verifica se o usuário precisa fazer onboarding
 */
export function needsOnboarding(profile: UserProfile | null): boolean {
  if (!profile) return true
  
  // Se já completou, não precisa
  if (hasCompletedOnboarding(profile)) {
    return false
  }

  // Se perfil não está completo, precisa fazer onboarding
  return !isProfileComplete(profile)
}
