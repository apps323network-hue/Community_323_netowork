import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import { useUserStore } from './user'
import type { User } from '@supabase/supabase-js'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const loading = ref(false)
  const initialized = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!user.value)

  async function signIn(email: string, password: string) {
    const signInStartTime = performance.now()
    console.log('[AUTH] signIn iniciado')
    
    loading.value = true
    error.value = null
    try {
      const supabaseStartTime = performance.now()
      console.log('[AUTH] Chamando supabase.auth.signInWithPassword...')
      
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      const supabaseEndTime = performance.now()
      console.log(`[AUTH] supabase.auth.signInWithPassword completou em ${(supabaseEndTime - supabaseStartTime).toFixed(2)}ms`)
      
      if (authError) throw authError
      
      const setUserStartTime = performance.now()
      user.value = data.user
      console.log(`[AUTH] user.value definido em ${(performance.now() - setUserStartTime).toFixed(2)}ms`)
      
      // NÃO buscar profile aqui - deixar o onAuthStateChange fazer isso em background
      // Isso evita bloquear o login
      
      const signInEndTime = performance.now()
      console.log(`[AUTH] signIn completou em ${(signInEndTime - signInStartTime).toFixed(2)}ms`)
      
      return { success: true }
    } catch (err: any) {
      const signInErrorTime = performance.now()
      console.error(`[AUTH] signIn erro após ${(signInErrorTime - signInStartTime).toFixed(2)}ms:`, err)
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  async function signUp(email: string, password: string, userData?: Record<string, any>) {
    loading.value = true
    error.value = null
    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
        },
      })
      if (authError) throw authError
      user.value = data.user
      
      // Fallback: criar profile se trigger não funcionar
      if (data.user) {
        try {
          await supabase.from('profiles').insert({
            id: data.user.id,
            nome: userData?.nome || userData?.firstName 
              ? `${userData.firstName || ''} ${userData.lastName || ''}`.trim() 
              : email.split('@')[0],
            area_atuacao: userData?.role || null,
            plano: 'Free',
            badge: 'Free',
          }).select().single()
        } catch (profileError) {
          // Profile já existe ou erro - tentar atualizar
          try {
            await supabase.from('profiles').update({
              area_atuacao: userData?.role || null,
              nome: userData?.nome || userData?.firstName 
                ? `${userData.firstName || ''} ${userData.lastName || ''}`.trim() 
                : email.split('@')[0],
            }).eq('id', data.user.id)
          } catch (updateError) {
            // Profile já existe ou erro - não é crítico, trigger pode ter criado
            console.log('Profile creation/update:', updateError)
          }
        }
      }
      
      return { success: true }
    } catch (err: any) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  async function signOut() {
    loading.value = true
    error.value = null
    try {
      // Adicionar timeout de 3 segundos para evitar travamento
      const signOutPromise = supabase.auth.signOut()
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout: signOut demorou mais de 3 segundos')), 3000)
      )
      
      const { error: authError } = await Promise.race([signOutPromise, timeoutPromise]) as any
      
      if (authError) {
        throw authError
      }
      
      user.value = null
      
      // Limpar profile do user store
      const userStore = useUserStore()
      userStore.clearProfile()
      
      return { success: true }
    } catch (err: any) {
      // Mesmo com erro ou timeout, limpar o estado local
      user.value = null
      const userStore = useUserStore()
      userStore.clearProfile()
      
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  async function checkSession() {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      user.value = session?.user ?? null
      
      // Buscar profile se usuário estiver logado
      if (session?.user) {
        const userStore = useUserStore()
        await userStore.fetchProfile(session.user.id)
      }
    } finally {
      initialized.value = true
    }
  }

  async function resetPassword(email: string) {
    loading.value = true
    error.value = null
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (resetError) throw resetError
      return { success: true }
    } catch (err: any) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  async function updatePassword(newPassword: string) {
    loading.value = true
    error.value = null
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      })
      if (updateError) throw updateError
      return { success: true }
    } catch (err: any) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  async function fetchUser() {
    if (!user.value) return null
    
    const userStore = useUserStore()
    await userStore.fetchProfile(user.value.id)
    return userStore.profile
  }

  // Escutar mudanças de autenticação ANTES de checkSession para evitar race conditions
  supabase.auth.onAuthStateChange(async (event, session) => {
    const onAuthStartTime = performance.now()
    console.log(`[AUTH] onAuthStateChange: ${event}`)
    
    user.value = session?.user ?? null
    
    // Buscar ou limpar profile quando estado de auth mudar (em background, não bloquear)
    const userStore = useUserStore()
    if (session?.user) {
      // Executar em background com delay para não interferir no login
      // Usar setTimeout para garantir que não bloqueie o fluxo principal
      setTimeout(() => {
        userStore.fetchProfile(session.user.id).catch((err) => {
          console.error('[AUTH] Erro ao buscar profile no onAuthStateChange (não crítico):', err)
        })
      }, 100) // Pequeno delay para não interferir no login
    } else {
      userStore.clearProfile()
    }
    
    const onAuthEndTime = performance.now()
    console.log(`[AUTH] onAuthStateChange completou em ${(onAuthEndTime - onAuthStartTime).toFixed(2)}ms`)
  })

  // Inicializar verificando sessão APÓS configurar o listener
  // Isso evita que checkSession seja chamado múltiplas vezes durante o login
  checkSession()

  return {
    user,
    loading,
    error,
    isAuthenticated,
    initialized,
    signIn,
    signUp,
    signOut,
    checkSession,
    resetPassword,
    updatePassword,
    fetchUser,
  }
})

