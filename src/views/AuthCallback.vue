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
    // Pegar token da query string
    const token = route.query.token as string
    const redirectTo = (route.query.redirect as string) || '/'

    if (!token) {
      // Se não tem token, redirecionar para login
      router.push({ name: 'Login', query: { redirect: redirectTo } })
      return
    }

    // Validar token e criar sessão
    const { error } = await supabase.auth.setSession({
      access_token: token,
      refresh_token: '', // Será gerado automaticamente
    })

    if (error) {
      console.error('Erro ao validar token:', error)
      // Token inválido - redirecionar para login
      router.push({ name: 'Login', query: { redirect: redirectTo } })
      return
    }

    // Token válido! Sessão criada automaticamente
    // Redirecionar para página desejada
    if (redirectTo.startsWith('http')) {
      // URL externa - redirecionar diretamente
      window.location.href = redirectTo
    } else {
      // Rota interna - usar router
      router.push(redirectTo)
    }
  } catch (error) {
    console.error('Erro no callback de autenticação:', error)
    router.push({ name: 'Login' })
  }
})
</script>

