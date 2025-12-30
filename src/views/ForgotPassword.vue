<template>
  <div class="flex min-h-screen relative bg-background-dark text-slate-100 font-sans antialiased selection:bg-primary selection:text-white">
    <!-- Left Side - Image/Logo -->
    <div class="hidden lg:flex w-1/2 relative overflow-hidden bg-background-dark items-center justify-center p-12 border-r border-slate-800/50">
      <div class="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 z-0"></div>
      <div class="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-secondary/20 rounded-full mix-blend-screen filter blur-[120px] animate-glow z-0"></div>
      <div class="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-primary/20 rounded-full mix-blend-screen filter blur-[120px] animate-glow z-0" style="animation-delay: 2.5s;"></div>
      <div class="relative z-10 flex flex-col items-center text-center max-w-lg">
        <div class="mb-10 p-6 rounded-3xl glass shadow-2xl relative group">
          <div class="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
          <div class="relative bg-black/40 rounded-2xl p-4">
            <img
              alt="323 Network Logo"
              class="w-56 h-auto object-contain drop-shadow-lg"
              src="/logo-removebg-preview.png"
            />
          </div>
        </div>
        <h1 class="text-5xl font-black text-white mb-6 leading-tight tracking-tight">
          Recuperar Senha
        </h1>
        <p class="text-slate-400 text-lg leading-relaxed mb-10 max-w-md">
          Digite seu email e enviaremos um link para redefinir sua senha.
        </p>
      </div>
    </div>

    <!-- Right Side - Form -->
    <div class="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 sm:p-12 bg-background-dark relative overflow-hidden">
      <div class="lg:hidden absolute top-[-20%] left-[-20%] w-[400px] h-[400px] bg-primary/20 rounded-full blur-[100px]"></div>
      <div class="lg:hidden absolute bottom-[-20%] right-[-20%] w-[400px] h-[400px] bg-secondary/20 rounded-full blur-[100px]"></div>
      <div class="w-full max-w-md space-y-8 relative z-10">
        <!-- Back to Login -->
        <RouterLink
          to="/login"
          class="inline-flex items-center gap-2 text-slate-400 hover:text-primary transition-colors text-sm"
        >
          <span class="material-symbols-outlined text-[18px]">arrow_back</span>
          Voltar para login
        </RouterLink>

        <!-- Form Title -->
        <div class="text-center">
          <h2 class="text-3xl font-extrabold tracking-tight text-white">
            Esqueceu sua senha?
          </h2>
          <p class="mt-2 text-sm text-slate-400">
            Não se preocupe! Enviaremos instruções para redefinir sua senha.
          </p>
        </div>

        <!-- Success Message -->
        <div
          v-if="emailSent"
          class="p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400"
        >
          <div class="flex items-start gap-3">
            <span class="material-symbols-outlined text-[24px]">check_circle</span>
            <div class="flex-1">
              <p class="font-semibold">Email enviado!</p>
              <p class="text-sm mt-1">
                Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.
              </p>
              <div class="mt-4">
                <p class="text-xs text-green-400/80 mb-2">
                  O email não chegou?
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  :loading="resendingEmail"
                  :disabled="resendCooldown > 0"
                  @click="handleResendEmail"
                  class="w-full"
                >
                  <span v-if="resendCooldown > 0">Solicite novamente em {{ resendCooldown }}s</span>
                  <span v-else>Solicite novamente</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <!-- Error Message -->
        <div
          v-if="authStore.error && !emailSent"
          class="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400"
        >
          <div class="flex items-start gap-3">
            <span class="material-symbols-outlined text-[24px]">error</span>
            <div>
              <p class="font-semibold">Erro</p>
              <p class="text-sm mt-1">{{ authStore.error }}</p>
            </div>
          </div>
        </div>

        <!-- Form -->
        <form
          v-if="!emailSent"
          class="mt-8 space-y-6"
          @submit.prevent="handleResetPassword"
        >
          <div>
            <label class="block text-sm font-semibold text-slate-300 mb-2" for="email">
              Email
            </label>
            <div class="relative group">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-slate-500 group-focus-within:text-primary transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
                </svg>
              </div>
              <input
                id="email"
                v-model="email"
                type="email"
                class="block w-full pl-10 pr-3 py-3.5 border border-slate-700 rounded-xl bg-slate-900/50 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary focus:shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all duration-300 sm:text-sm"
                required
              />
            </div>
          </div>
          <div>
            <Button
              variant="primary"
              size="lg"
              full-width
              :loading="authStore.loading"
              type="submit"
            >
              Enviar Link de Recuperação
            </Button>
          </div>
        </form>
      </div>
      <div class="absolute bottom-6 w-full text-center">
        <p class="text-xs text-slate-600">
          © 2025 (323) Network. Todos os direitos reservados.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Button from '@/components/ui/Button.vue'

const route = useRoute()
const authStore = useAuthStore()
const email = ref('')
const emailSent = ref(false)
const resendingEmail = ref(false)
const resendCooldown = ref(0)
let resendCooldownTimer: ReturnType<typeof setInterval> | null = null

// Preencher email automaticamente se vier da query string
onMounted(() => {
  const emailFromQuery = route.query.email as string
  if (emailFromQuery) {
    email.value = emailFromQuery
  }
})

async function handleResetPassword() {
  if (!email.value.trim()) return

  const result = await authStore.resetPassword(email.value)
  if (result.success) {
    emailSent.value = true
    // Iniciar cooldown após enviar o primeiro email
    startResendCooldown()
  }
}

async function handleResendEmail() {
  if (!email.value.trim() || resendCooldown.value > 0) return

  resendingEmail.value = true
  try {
    const result = await authStore.resetPassword(email.value)
    if (result.success) {
      // Reiniciar cooldown após reenvio
      startResendCooldown()
    }
  } catch (error) {
    console.error('Error resending password reset email:', error)
  } finally {
    resendingEmail.value = false
  }
}

function startResendCooldown() {
  resendCooldown.value = 60
  
  // Limpar timer anterior se existir
  if (resendCooldownTimer) {
    clearInterval(resendCooldownTimer)
  }
  
  // Iniciar contagem regressiva
  resendCooldownTimer = setInterval(() => {
    resendCooldown.value--
    if (resendCooldown.value <= 0) {
      if (resendCooldownTimer) {
        clearInterval(resendCooldownTimer)
        resendCooldownTimer = null
      }
    }
  }, 1000)
}

// Limpar timer ao desmontar componente
onUnmounted(() => {
  if (resendCooldownTimer) {
    clearInterval(resendCooldownTimer)
    resendCooldownTimer = null
  }
})
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

