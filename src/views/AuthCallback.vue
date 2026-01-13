<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
    <div class="text-center">
      <div class="mb-4">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
      <h2 class="text-xl font-semibold text-slate-900 dark:text-white mb-2">
        {{ t('auth.callback.processing') }}
      </h2>
      <p class="text-slate-600 dark:text-slate-400">
        {{ t('auth.callback.pleaseWait') }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { supabase } from '@/lib/supabase'
import { useUserStore } from '@/stores/user'
import { needsOnboarding } from '@/composables/useOnboarding'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const userStore = useUserStore()

onMounted(async () => {
  try {
    // 1. Verificar se há um token na query string (SSO American Dream)
    const token = route.query.token as string
    const mode = route.query.mode as string // 'register' ou 'login' - indica origem do OAuth
    const redirectTo = (route.query.redirect as string) || '/'

    console.log('[CALLBACK] Modo OAuth:', mode || 'não especificado')

    if (token) {
      console.log('[CALLBACK] Token de query encontrado, configurando sessão...')
      const { error } = await supabase.auth.setSession({
        access_token: token,
        refresh_token: '',
      })

      if (error) throw error
    } else {
      // 2. Se não houver token na query, verificar se o Supabase já processou o OAuth (hash fragment)
      console.log('[CALLBACK] Nenhum token na query, verificando sessão do Supabase...')
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) throw sessionError
      
      if (!session) {
        console.warn('[CALLBACK] Nenhuma sessão encontrada.')
        router.push({ name: 'Login', query: { redirect: redirectTo } })
        return
      }
      
      console.log('[CALLBACK] Sessão OAuth detectada com sucesso.')
      console.log('[CALLBACK] Usuário:', session.user.email)
      console.log('[CALLBACK] Data de criação:', session.user.created_at)
      
      // Verificar se é um usuário novo (criado há menos de 10 segundos)
      const userCreatedAt = new Date(session.user.created_at)
      const now = new Date()
      const secondsSinceCreation = (now.getTime() - userCreatedAt.getTime()) / 1000
      const isNewUser = secondsSinceCreation < 10
      
      console.log('[CALLBACK] Usuário criado há', secondsSinceCreation.toFixed(1), 'segundos')
      console.log('[CALLBACK] É novo usuário?', isNewUser ? 'Sim' : 'Não')
      
      // Se veio do modo "login" mas é um usuário novo, redirecionar para registro
      // (Isso não deveria acontecer agora que removemos o botão da aba de login, mas é uma segurança extra)
      if (mode === 'login' && isNewUser) {
        console.warn('[CALLBACK] ⚠️ Tentativa de login com Google de usuário não cadastrado')
        await supabase.auth.signOut()
        router.push({ 
          name: 'Login', 
          query: { 
            error: 'user_not_registered',
            message: 'Você precisa se cadastrar primeiro. Use a aba de registro para criar sua conta com Google.'
          } 
        })
        return
      }
    }

    // 3. Verificar se usuário precisa fazer onboarding
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      // Buscar perfil do usuário
      await userStore.fetchProfile(user.id)
      
      // Verificar se precisa fazer onboarding
      if (needsOnboarding(userStore.profile)) {
        console.log('[CALLBACK] Usuário precisa completar onboarding, redirecionando...')
        router.push({ name: 'Onboarding' })
        return
      }
    }

    // 4. Redirecionar para a página desejada
    if (redirectTo.startsWith('http')) {
      window.location.href = redirectTo
    } else {
      router.push(redirectTo)
    }
  } catch (error) {
    console.error('[CALLBACK] Erro no callback de autenticação:', error)
    router.push({ name: 'Login' })
  }
})
</script>

