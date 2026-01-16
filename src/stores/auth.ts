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
      // ✅ NOVO: Se veio do American Dream, usar Edge Function para confirmar email automaticamente
      if (userData?.source === 'american-dream') {
        console.log('[SSO] ============================================')
        console.log('[SSO] REGISTRO VINDO DO AMERICAN DREAM')
        console.log('[SSO] ============================================')
        console.log('[SSO] Criando usuário com email já confirmado...')
        
        // Chamar Edge Function para criar usuário com email confirmado
        const { data: result, error: invokeError } = await supabase.functions.invoke('create-user-confirmed', {
          body: {
            email,
            password,
            user_metadata: {
              ...userData,
              source: 'american-dream',
              phoneCountryCode: userData?.phoneCountryCode || 'BR',
              nome: userData.nome || `${userData.firstName || ''} ${userData.lastName || ''}`.trim()
            }
          }
        })
        
        if (invokeError) {
          console.error('[SSO] ❌ Erro ao chamar Edge Function:', invokeError)
          throw invokeError
        }
        
        if (!result?.success || !result?.user) {
          throw new Error('Falha ao criar usuário')
        }
        
        user.value = result.user
        
        console.log('[SSO] ✅ Usuário criado com email confirmado:', result.user.id)
        
        // Se a Edge Function retornou token, usar ele
        // Se não, fazer sign in para obter token
        let accessToken = result.access_token
        
        if (!accessToken) {
          // Fazer sign in para obter token
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
          })
          
          if (signInError) {
            console.error('[SSO] ❌ Erro ao fazer sign in:', signInError)
            throw signInError
          }
          
          accessToken = signInData.session?.access_token
        }
        
        if (!accessToken) {
          throw new Error('Falha ao obter token de sessão')
        }
        
        console.log('[SSO] ✅ Token obtido, redirecionando para American Dream...')
        
        // Se tiver returnTo, redirecionar com token
        if (userData?.returnTo && accessToken) {
          try {
            // Decodificar returnTo se estiver URL-encoded
            let decodedReturnTo = userData.returnTo
            try {
              // Tentar decodificar (pode estar URL-encoded)
              decodedReturnTo = decodeURIComponent(userData.returnTo)
            } catch {
              // Se falhar ao decodificar, usar o valor original
              decodedReturnTo = userData.returnTo
            }
            
            console.log('[SSO] returnTo original:', userData.returnTo)
            console.log('[SSO] returnTo decodificado:', decodedReturnTo)
            
            // Verificar se returnTo é uma URL válida
            let returnUrl: URL
            
            // Se já é uma URL absoluta, usar diretamente
            if (decodedReturnTo.startsWith('http://') || decodedReturnTo.startsWith('https://')) {
              returnUrl = new URL(decodedReturnTo)
            } else {
              // Se for uma URL relativa, construir URL absoluta
              // Assumir que é do American Dream (produção)
              const baseUrl = decodedReturnTo.startsWith('/') 
                ? 'https://americandream.323network.com' 
                : 'https://americandream.323network.com/'
              returnUrl = new URL(decodedReturnTo, baseUrl)
            }
            
            returnUrl.searchParams.set('token', accessToken)
            returnUrl.searchParams.set('email', email)
            returnUrl.searchParams.set('name', userData.nome || `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || email.split('@')[0])
            if (userData.phone) returnUrl.searchParams.set('phone', userData.phone)
            if (userData.phoneCountryCode) returnUrl.searchParams.set('phoneCountryCode', userData.phoneCountryCode)
            
            console.log('[SSO] Redirecionando para:', returnUrl.toString())
            window.location.href = returnUrl.toString()
            return { success: true, redirected: true }
          } catch (urlError: any) {
            console.error('[SSO] ❌ Erro ao construir URL de redirecionamento:', urlError)
            console.error('[SSO] returnTo recebido:', userData.returnTo)
            // Não bloquear o registro - apenas logar o erro
            // O usuário pode fazer login manualmente depois
          }
        }
        
        return { success: true }
      }
      
      // ✅ Fluxo normal (não veio do American Dream)
      console.log('[SSO] Registro normal (não veio do American Dream)')
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (authError) throw authError
      user.value = data.user
      
      // O trigger handle_new_user() cria o profile automaticamente
      // Não tentamos criar/atualizar manualmente para evitar erros de RLS
      // Apenas sincronizamos com American Dream
      if (data.user) {
        const userName = userData?.nome || userData?.firstName 
          ? `${userData.firstName || ''} ${userData.lastName || ''}`.trim() 
          : email.split('@')[0]
        const userArea = userData?.role || null
        
        console.log('[SSO] Usuário criado:', {
          id: data.user.id,
          email: data.user.email,
          userName,
          userArea,
          phone: userData?.phone || null,
          source: userData?.source || '323-network'
        })
        
        // Sincronizar usuário com American Dream (não bloquear se falhar)
        // Não esperamos o profile ser criado - a Edge Function pode criar o usuário mesmo assim
        if (!userData?.source) {
          // Só sincronizar se não vier do American Dream (evitar loop)
          console.log('[SSO] ============================================')
          console.log('[SSO] INICIANDO SINCRONIZAÇÃO COM AMERICAN DREAM')
          console.log('[SSO] ============================================')
          console.log('[SSO] Dados a serem sincronizados:', {
            email,
            nome: userName,
            phone: userData?.phone || null,
            passwordLength: password.length
          })
          
          try {
            const { data: result, error: invokeError } = await supabase.functions.invoke('sync-user-to-american-dream', {
              body: {
                email: email,
                password: password, // Senha em texto plano (só existe neste momento)
                nome: userName,
                phone: userData?.phone || null,
              }
            })
            
            if (invokeError) {
              console.error('[SSO] ❌ Erro ao chamar Edge Function:', invokeError)
              console.error('[SSO] Detalhes do erro:', {
                message: invokeError.message,
                name: invokeError.name,
                stack: invokeError.stack
              })
            } else {
              console.log('[SSO] ✅ Edge Function chamada com sucesso!')
              console.log('[SSO] Resultado:', result)
            }
          } catch (err: any) {
            console.error('[SSO] ❌ Exceção ao chamar Edge Function:', err)
            console.error('[SSO] Tipo do erro:', typeof err)
            console.error('[SSO] Mensagem:', err?.message)
            console.error('[SSO] Stack:', err?.stack)
            // Não bloquear signup se sincronização falhar
          }
          
          console.log('[SSO] ============================================')
          console.log('[SSO] SINCRONIZAÇÃO CONCLUÍDA')
          console.log('[SSO] ============================================')
        } else {
          console.log('[SSO] ⏭️ Pulando sincronização (source:', userData.source, ')')
        }
        
        // Notificar admins sobre novo usuário (em background, não bloqueia)
        // Aguardar um pouco para o trigger criar o profile primeiro
        // Tentar múltiplas vezes com retry
        let retryCount = 0
        const maxRetries = 3
        const retryDelay = 1500 // 1.5 segundos
        
        const tryNotifyAdmins = async () => {
          try {
            console.log(`[SSO] Tentando buscar profile para notificar admins... (tentativa ${retryCount + 1}/${maxRetries})`)
            
            // Usar maybeSingle() ao invés de single() para evitar erro 406 quando não há resultado
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('status, created_at, area_atuacao')
              .eq('id', data.user!.id)
              .maybeSingle() // Retorna null se não houver resultado, sem erro
            
            if (profileError) {
              console.log('[SSO] ⚠️ Erro ao buscar profile:', profileError.message)
              // Se for erro de RLS ou não encontrado, tentar novamente
              if (retryCount < maxRetries - 1 && (profileError.code === 'PGRST116' || profileError.message.includes('row-level security'))) {
                retryCount++
                setTimeout(tryNotifyAdmins, retryDelay)
                return
              }
              console.log('[SSO] Não foi possível buscar profile após múltiplas tentativas')
              return
            }
            
            // Se profile não existe ainda, tentar novamente
            if (!profileData) {
              if (retryCount < maxRetries - 1) {
                retryCount++
                console.log(`[SSO] Profile ainda não criado, tentando novamente em ${retryDelay}ms...`)
                setTimeout(tryNotifyAdmins, retryDelay)
                return
              } else {
                console.log('[SSO] ⚠️ Profile não foi criado após múltiplas tentativas (pode ser que o trigger não tenha executado)')
                return
              }
            }
            
            // Profile encontrado!
            console.log('[SSO] ✅ Profile encontrado:', { status: profileData.status, id: data.user!.id })
            
            if (profileData.status === 'pending') {
              console.log('[SSO] Profile com status pending, notificando admins...')
              const { notifyAdminsNewUser } = await import('@/lib/emails')
              await notifyAdminsNewUser(
                data.user!.id,
                userName,
                userArea || undefined,
                profileData.created_at || new Date().toISOString()
              )
              console.log('[SSO] ✅ Admins notificados com sucesso')
            } else {
              console.log('[SSO] Profile encontrado com status:', profileData.status, '- não é necessário notificar')
            }
          } catch (err: any) {
            // Não crítico - apenas logar
            console.error('[SSO] ⚠️ Erro ao buscar/notificar profile (não crítico):', err?.message || err)
          }
        }
        
        // Iniciar primeira tentativa após delay inicial
        setTimeout(tryNotifyAdmins, retryDelay)
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
      
      // Limpar localStorage manualmente para garantir
      localStorage.removeItem('supabase.auth.token')
      
      // Limpar todas as chaves do supabase no localStorage
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('sb-') || key.includes('supabase')) {
          localStorage.removeItem(key)
        }
      })
      
      return { success: true }
    } catch (err: any) {
      // Mesmo com erro ou timeout, limpar o estado local
      user.value = null
      const userStore = useUserStore()
      userStore.clearProfile()
      
      // Limpar localStorage mesmo em caso de erro
      localStorage.removeItem('supabase.auth.token')
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('sb-') || key.includes('supabase')) {
          localStorage.removeItem(key)
        }
      })
      
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
    const previousUser = user.value
    user.value = session?.user ?? null
    
    // 🔥 NOVO: Detectar novo usuário e registrar termos automaticamente
    if (event === 'SIGNED_IN' && session?.user && !previousUser) {
      const userCreatedAt = new Date(session.user.created_at)
      const now = new Date()
      const secondsSinceCreation = (now.getTime() - userCreatedAt.getTime()) / 1000
      const isNewUser = secondsSinceCreation < 10
      
      console.log(`[AUTH] 🔐 SIGNED_IN detectado para user: ${session.user.email}`)
      console.log(`[AUTH] 📅 User criado há ${secondsSinceCreation.toFixed(1)}s`)
      console.log(`[AUTH] 🆕 É novo usuário? ${isNewUser ? 'SIM' : 'NÃO'}`)
      
      if (isNewUser) {
        console.log('[AUTH] 🔥 INICIANDO registro automático de termos...')
        try {
          const { useTermsAcceptance } = await import('@/composables/useTermsAcceptance')
          const { getLatestActiveTerm, recordTermAcceptance } = useTermsAcceptance()
          
          const termsOfService = await getLatestActiveTerm('terms_of_service')
          const privacyPolicy = await getLatestActiveTerm('privacy_policy')
          
          console.log(`[AUTH] 📄 ToS encontrado? ${termsOfService ? 'SIM (' + termsOfService.id + ')' : 'NÃO'}`)
          console.log(`[AUTH] 📄 PP encontrado? ${privacyPolicy ? 'SIM (' + privacyPolicy.id + ')' : 'NÃO'}`)
          
          if (termsOfService) {
            await recordTermAcceptance(termsOfService.id, 'terms_of_service', session.user.id)
            console.log('[AUTH] ✅ Terms of Service registrado!')
          }
          
          if (privacyPolicy) {
            await recordTermAcceptance(privacyPolicy.id, 'privacy_policy', session.user.id)
            console.log('[AUTH] ✅ Privacy Policy registrado!')
          }
          
          console.log('[AUTH] 🎉 Aceite automático de termos CONCLUÍDO!')
        } catch (err: any) {
          console.error('[AUTH] 🚨 ERRO ao registrar termos:', err)
        }
      }
    }
    
    // Buscar ou limpar profile quando estado de auth mudar (em background, não bloquear)
    const userStore = useUserStore()
    if (session?.user) {
      // Executar em background com delay para não interferir no login
      // Usar setTimeout para garantir que não bloqueie o fluxo principal
      setTimeout(() => {
        userStore.fetchProfile(session.user.id).catch((err) => {
          // Apenas logar erros não relacionados a conexão
          if (!err?.message?.includes('Failed to fetch')) {
            console.error('[AUTH] Erro ao buscar profile no onAuthStateChange (não crítico):', err)
          }
        })
      }, 100) // Pequeno delay para não interferir no login
    } else {
      userStore.clearProfile()
    }
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
    signInWithGoogle,
  }
})

async function signInWithGoogle(redirectTo?: string) {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectTo || `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })
    
    if (error) throw error
    return { success: true, data }
  } catch (err: any) {
    console.error('[AUTH] Google Sign-In error:', err)
    return { success: false, error: err.message }
  }
}

