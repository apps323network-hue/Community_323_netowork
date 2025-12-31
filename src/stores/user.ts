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
  role?: UserRole
  status?: UserStatus
  strikes?: number
  approved_by?: string
  approved_at?: string
  total_points?: number
  created_at?: string
  updated_at?: string
}

export const useUserStore = defineStore('user', () => {
  const profile = ref<UserProfile | null>(null)
  const loading = ref(false)

  async function fetchProfile(userId: string) {
    const fetchStartTime = performance.now()
    console.log(`[USER] fetchProfile iniciado para userId: ${userId}`)

    loading.value = true
    try {
      const queryStartTime = performance.now()
      console.log('[USER] Executando query no Supabase...')

      // Verificar se o Supabase está configurado
      if (!supabase) {
        throw new Error('Cliente Supabase não está inicializado. Verifique as variáveis de ambiente.')
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      const queryEndTime = performance.now()
      console.log(`[USER] Query completou em ${(queryEndTime - queryStartTime).toFixed(2)}ms`)

      if (error) {
        // Melhorar mensagem de erro
        if (error.message?.includes('Failed to fetch')) {
          console.error('[USER] Erro de conexão com Supabase:', {
            message: error.message,
            hint: 'Verifique: 1) URL do Supabase está correta? 2) Conexão com internet? 3) CORS configurado?',
            code: error.code,
          })
          throw new Error('Erro de conexão com o servidor. Verifique sua conexão com a internet e as configurações do Supabase.')
        }
        throw error
      }

      profile.value = data
      const fetchEndTime = performance.now()
      console.log(`[USER] fetchProfile completou em ${(fetchEndTime - fetchStartTime).toFixed(2)}ms`)
    } catch (error: any) {
      const fetchErrorTime = performance.now()
      const errorDetails = {
        message: error?.message || 'Erro desconhecido',
        details: error?.stack || error?.toString(),
        hint: error?.hint || '',
        code: error?.code || '',
      }
      console.error(`[USER] fetchProfile erro após ${(fetchErrorTime - fetchStartTime).toFixed(2)}ms:`, errorDetails)

      // Não bloquear se houver erro - apenas logar
      // Mas definir profile como null para evitar estados inconsistentes
      profile.value = null
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

