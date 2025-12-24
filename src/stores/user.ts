import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

import type { UserRole } from '@/types/admin'

export interface UserProfile {
  id: string
  nome?: string
  area_atuacao?: string
  cidade?: string
  pais?: string
  objetivo?: string
  whatsapp?: string
  linkedin?: string
  avatar_url?: string
  plano?: 'Free' | 'Member' | 'Premium'
  badge?: string
  role?: UserRole
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
      
      // Adicionar timeout de 5 segundos para evitar travamento
      const queryPromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout: fetchProfile demorou mais de 5 segundos')), 5000)
      )
      
      const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any

      const queryEndTime = performance.now()
      console.log(`[USER] Query completou em ${(queryEndTime - queryStartTime).toFixed(2)}ms`)

      if (error) throw error
      
      profile.value = data
      const fetchEndTime = performance.now()
      console.log(`[USER] fetchProfile completou em ${(fetchEndTime - fetchStartTime).toFixed(2)}ms`)
    } catch (error) {
      const fetchErrorTime = performance.now()
      console.error(`[USER] fetchProfile erro após ${(fetchErrorTime - fetchStartTime).toFixed(2)}ms:`, error)
      // Não bloquear se houver erro - apenas logar
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

