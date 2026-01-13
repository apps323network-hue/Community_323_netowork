import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'
import { logAdminAction } from '@/lib/auditLog'
import type { UserRole, UserStatus } from '@/types/admin'

export interface UserProfile {
  id: string
  nome?: string
  area_atuacao?: string
  cidade?: string
  estado?: string
  pais?: string
  objetivo?: string
  whatsapp?: string
  linkedin?: string
  instagram?: string
  avatar_url?: string
  bio?: string
  tags?: string[]
  goals?: string[]
  plano?: 'Free' | 'Member' | 'Premium'
  badge?: string
  is_public?: boolean
  job_notifications?: boolean
  nacionalidade?: string
  email?: string
  show_whatsapp?: boolean
  show_email?: boolean
  role?: UserRole
  status?: UserStatus
  strikes?: number
  approved_by?: string
  approved_at?: string
  total_points?: number
  created_at?: string
  updated_at?: string
  is_test_user?: boolean
}

export const useUserStore = defineStore('user', () => {
  const profile = ref<UserProfile | null>(null)
  const loading = ref(false)

  async function fetchProfile(userId: string, retries = 2) {
    loading.value = true
    try {
      // Verificar se o Supabase está configurado
      if (!supabase) {
        throw new Error('Cliente Supabase não está inicializado. Verifique as variáveis de ambiente.')
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        // Se for erro de conexão e ainda houver tentativas, fazer retry
        if (error.message?.includes('Failed to fetch') && retries > 0) {
          // Aguardar um pouco antes de tentar novamente (backoff exponencial)
          await new Promise(resolve => setTimeout(resolve, 1000 * (3 - retries)))
          return fetchProfile(userId, retries - 1)
        }

        // Se for erro de conexão mas sem mais tentativas, apenas logar silenciosamente
        if (error.message?.includes('Failed to fetch')) {
          // Log apenas em desenvolvimento
          if (import.meta.env.DEV) {
            console.warn('[USER] Erro de conexão temporário (não crítico):', error.message)
          }
          // Não definir profile como null para manter o último valor conhecido
          return
        }
        throw error
      }

      profile.value = data
    } catch (error: any) {
      // Apenas logar erros não relacionados a conexão
      if (!error?.message?.includes('Failed to fetch')) {
        const errorDetails = {
          message: error?.message || 'Erro desconhecido',
          details: error?.stack || error?.toString(),
          hint: error?.hint || '',
          code: error?.code || '',
        }
        console.error('[USER] fetchProfile erro:', errorDetails)
      }

      // Não definir profile como null para manter o último valor conhecido em caso de erro de conexão
      // Apenas limpar se for um erro diferente (ex: usuário não encontrado)
      if (!error?.message?.includes('Failed to fetch')) {
        profile.value = null
      }
    } finally {
      loading.value = false
    }
  }

  async function updateProfile(updates: Partial<UserProfile>) {
    if (!profile.value) return

    loading.value = true
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', profile.value.id)
        .select()
        .single()

      if (error) throw error
      profile.value = data

      // Log da ação
      if (profile.value) {
        logAdminAction(profile.value.id, {
          action: 'user_update_profile',
          targetId: profile.value.id,
          targetType: 'user',
          details: { updates: Object.keys(updates) }
        })
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  function clearProfile() {
    profile.value = null
  }

  return {
    profile,
    loading,
    fetchProfile,
    updateProfile,
    clearProfile,
  }
})

