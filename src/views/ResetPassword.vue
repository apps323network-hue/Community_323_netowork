<template>
  <div class="min-h-screen bg-slate-50 dark:bg-background-dark">
    <!-- Header -->
    <AppHeader :show-navigation="false" />
    
    <!-- Reset Password Content -->
    <div class="flex min-h-[calc(100vh-80px)] relative text-slate-900 dark:text-slate-100 font-sans antialiased selection:bg-primary selection:text-white">
    <!-- Left Side - Image/Logo -->
    <div class="hidden lg:flex w-1/2 relative overflow-hidden bg-slate-100 dark:bg-background-dark items-center justify-center p-12 border-r border-slate-200 dark:border-slate-800/50">
      <div class="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 z-0"></div>
      <div class="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-secondary/20 rounded-full mix-blend-screen filter blur-[120px] animate-glow z-0"></div>
      <div class="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-primary/20 rounded-full mix-blend-screen filter blur-[120px] animate-glow z-0" style="animation-delay: 2.5s;"></div>
      <div class="relative z-10 flex flex-col items-center text-center max-w-lg">
        <div class="mb-10">
          <img
            alt="323 Network Logo"
            class="w-56 h-auto object-contain drop-shadow-lg"
            src="/logo-removebg-preview.png"
          />
        </div>
        <h1 class="text-5xl font-black text-slate-900 dark:text-white mb-6 leading-tight tracking-tight">
          {{ t('auth.resetPasswordTitle') }}
        </h1>
        <p class="text-slate-600 dark:text-slate-400 text-lg leading-relaxed mb-10 max-w-md">
          {{ t('auth.resetPasswordDescription') }}
        </p>
      </div>
    </div>

    <!-- Right Side - Form -->
    <div class="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 sm:p-12 bg-white dark:bg-background-dark relative overflow-hidden">
      <div class="lg:hidden absolute top-[-20%] left-[-20%] w-[400px] h-[400px] bg-primary/20 rounded-full blur-[100px]"></div>
      <div class="lg:hidden absolute bottom-[-20%] right-[-20%] w-[400px] h-[400px] bg-secondary/20 rounded-full blur-[100px]"></div>
      <div class="w-full max-w-md space-y-8 relative z-10">
        <!-- Back to Login -->
        <RouterLink
          to="/login"
          class="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-primary transition-colors text-sm"
        >
          <span class="material-symbols-outlined text-[18px]">arrow_back</span>
          {{ t('auth.backToLogin') }}
        </RouterLink>

        <!-- Form Title -->
        <div class="text-center">
          <h2 class="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {{ t('auth.createNewPassword') }}
          </h2>
          <p class="mt-2 text-sm text-slate-600 dark:text-slate-400">
            {{ t('auth.createNewPasswordSubtitle') }}
          </p>
        </div>

        <!-- Success Message -->
        <div
          v-if="passwordUpdated"
          class="p-4 rounded-xl bg-green-500/10 dark:bg-green-500/10 border border-green-500/30 text-green-600 dark:text-green-400"
        >
          <div class="flex items-start gap-3">
            <span class="material-symbols-outlined text-[24px]">check_circle</span>
            <div>
              <p class="font-semibold">{{ t('auth.passwordChangedTitle') }}</p>
              <p class="text-sm mt-1">
                {{ t('auth.passwordChangedMessage') }}
              </p>
            </div>
          </div>
        </div>

        <!-- Error Message -->
        <div
          v-if="errorMessage && !passwordUpdated"
          class="p-4 rounded-xl bg-red-500/10 dark:bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400"
        >
          <div class="flex items-start gap-3">
            <span class="material-symbols-outlined text-[24px]">error</span>
            <div>
              <p class="font-semibold">{{ t('auth.error') }}</p>
              <p class="text-sm mt-1">{{ errorMessage }}</p>
              <p class="text-xs mt-2 text-red-600 dark:text-red-400/80">
                Você será redirecionado para o login em alguns segundos.
              </p>
            </div>
          </div>
        </div>

        <!-- Form -->
        <form
          v-if="!passwordUpdated && !errorMessage"
          class="mt-8 space-y-6"
          @submit.prevent="handleUpdatePassword"
        >
          <div>
            <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2" for="password">
              {{ t('auth.newPassword') }}
            </label>
            <div class="relative group">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-slate-500 group-focus-within:text-secondary transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
                </svg>
              </div>
              <input
                id="password"
                v-model="password"
                type="password"
                :placeholder="t('auth.passwordPlaceholder')"
                class="block w-full pl-10 pr-3 py-3.5 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900/50 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-secondary focus:border-secondary focus:shadow-[0_0_15px_rgba(217,70,239,0.3)] transition-all duration-300 sm:text-sm"
                required
                minlength="6"
              />
            </div>
          </div>
          <div>
            <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2" for="confirmPassword">
              {{ t('auth.confirmPassword') }}
            </label>
            <div class="relative group">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-slate-500 group-focus-within:text-secondary transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
                </svg>
              </div>
              <input
                id="confirmPassword"
                v-model="confirmPassword"
                type="password"
                :placeholder="t('auth.confirmPasswordPlaceholder')"
                class="block w-full pl-10 pr-3 py-3.5 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900/50 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-secondary focus:border-secondary focus:shadow-[0_0_15px_rgba(217,70,239,0.3)] transition-all duration-300 sm:text-sm"
                required
                minlength="6"
              />
            </div>
            <p v-if="passwordMismatch" class="mt-2 text-sm text-red-600 dark:text-red-400">
              {{ t('auth.passwordsDoNotMatch') }}
            </p>
          </div>
          <div>
            <Button
              variant="primary"
              size="lg"
              full-width
              :loading="authStore.loading"
              :disabled="passwordMismatch || !password || !confirmPassword"
              type="submit"
            >
              {{ t('auth.changePassword') }}
            </Button>
          </div>
        </form>

        <div v-if="passwordUpdated" class="text-center">
          <RouterLink to="/login">
            <Button variant="outline" size="md">
              {{ t('auth.goToLogin') }}
            </Button>
          </RouterLink>
        </div>
      </div>
      <div class="absolute bottom-6 w-full text-center">
        <p class="text-xs text-slate-500 dark:text-slate-600">
          {{ t('auth.copyright') }}
        </p>
      </div>
    </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import Button from '@/components/ui/Button.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const authStore = useAuthStore()
const password = ref('')
const confirmPassword = ref('')
const passwordUpdated = ref(false)
const errorMessage = ref<string | null>(null)

// Verificar se há token válido na URL ao montar o componente
onMounted(async () => {
  // Verificar se há erros na URL (token expirado, etc)
  const hashParams = new URLSearchParams(window.location.hash.substring(1))
  const error = hashParams.get('error')
  const errorDescription = hashParams.get('error_description')
  
  if (error) {
    let message = 'Link inválido ou expirado.'
    if (errorDescription) {
      if (errorDescription.includes('expired')) {
        message = 'O link de recuperação expirou. Por favor, solicite um novo link.'
      } else if (errorDescription.includes('invalid')) {
        message = 'O link de recuperação é inválido. Por favor, solicite um novo link.'
      }
    }
    errorMessage.value = message
    
    // Redirecionar após 5 segundos
    setTimeout(() => {
      window.location.href = '/login'
    }, 5000)
    return
  }
  
  // Verificar se há token de acesso na URL (sessão de recuperação)
  const accessToken = hashParams.get('access_token')
  const type = hashParams.get('type')
  
  if (!accessToken || type !== 'recovery') {
    errorMessage.value = 'Link de recuperação inválido. Por favor, solicite um novo link.'
    // Redirecionar após 5 segundos
    setTimeout(() => {
      window.location.href = '/login'
    }, 5000)
  }
})

const passwordMismatch = computed(() => {
  return password.value && confirmPassword.value && password.value !== confirmPassword.value
})

function getErrorMessage(error: any): string {
  const errorMsg = error?.message || error || 'Erro desconhecido'
  
  // Mensagens amigáveis para erros comuns
  if (errorMsg.toLowerCase().includes('same') || errorMsg.toLowerCase().includes('igual')) {
    return 'A nova senha deve ser diferente da senha atual.'
  }
  
  if (errorMsg.toLowerCase().includes('weak') || errorMsg.toLowerCase().includes('fraca')) {
    return 'A senha é muito fraca. Use uma senha mais forte.'
  }
  
  if (errorMsg.toLowerCase().includes('invalid') || errorMsg.toLowerCase().includes('inválido')) {
    return 'A senha informada é inválida. Tente novamente.'
  }
  
  return errorMsg
}

async function handleUpdatePassword() {
  if (passwordMismatch.value || !password.value) return

  errorMessage.value = null
  authStore.error = null

  try {
    const result = await authStore.updatePassword(password.value)
    
    if (result.success) {
      passwordUpdated.value = true
      // Redirecionar após 3 segundos
      setTimeout(() => {
        window.location.href = '/login'
      }, 3000)
    } else {
      // Tratar erro e redirecionar após 5 segundos
      errorMessage.value = getErrorMessage(result.error)
      setTimeout(() => {
        window.location.href = '/login'
      }, 5000)
    }
  } catch (error: any) {
    console.error('Error updating password:', error)
    errorMessage.value = getErrorMessage(error)
    // Redirecionar após 5 segundos mesmo com erro
    setTimeout(() => {
      window.location.href = '/login'
    }, 5000)
  }
}
</script>

<style scoped>
@keyframes pulse-glow {
  0%, 100% { opacity: 0.8; filter: blur(40px); transform: scale(1); }
  50% { opacity: 0.5; filter: blur(60px); transform: scale(1.1); }
}
.animate-glow {
  animation: pulse-glow 5s infinite;
}
.glass {
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.05);
}
</style>

