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

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

onMounted(async () => {
  try {
    // 1. Verificar se há um token na query string (SSO American Dream)
    const token = route.query.token as string
    const redirectTo = (route.query.redirect as string) || '/'

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
    }

    // 3. Redirecionar para a página desejada
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

