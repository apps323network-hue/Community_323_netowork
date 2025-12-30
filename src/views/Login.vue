<template>
  <div class="min-h-screen bg-slate-50 dark:bg-background-dark">
    <!-- Header -->
    <AppHeader :show-navigation="false" :show-logo="false" />
    
    <!-- Login Content -->
  <div
      class="flex min-h-[calc(100vh-80px)] relative text-slate-900 dark:text-slate-100 font-sans antialiased selection:bg-primary selection:text-white"
  >
    <!-- Left Side - Image/Logo -->
    <div
      class="hidden lg:flex w-1/2 relative overflow-hidden bg-slate-100 dark:bg-background-dark items-center justify-center p-12 border-r border-slate-200 dark:border-slate-800/50"
    >
      <div
        class="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 z-0"
      ></div>
      <div
        class="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-secondary/20 rounded-full mix-blend-screen filter blur-[120px] animate-glow z-0"
      ></div>
      <div
        class="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-primary/20 rounded-full mix-blend-screen filter blur-[120px] animate-glow z-0"
        style="animation-delay: 2.5s"
      ></div>
      <div class="relative z-10 flex flex-col items-center text-center max-w-lg">
        <div class="mb-10">
            <img
              alt="323 Network Logo"
              class="w-56 h-auto object-contain drop-shadow-lg"
            src="/logo-removebg-preview.png"
            />
          </div>
        <h1 class="text-5xl font-black text-slate-900 dark:text-white mb-6 leading-tight tracking-tight">
          {{ t('auth.tagline') }} <br />
          <span
            class="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-secondary neon-text"
            >{{ t('auth.taglineHighlight') }}</span
          >
        </h1>
        <p class="text-slate-400 dark:text-slate-400 text-lg leading-relaxed mb-10 max-w-md">
          {{ t('auth.description') }}
        </p>
      </div>
    </div>

    <!-- Right Side - Form -->
    <div
      class="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 sm:p-12 bg-white dark:bg-background-dark relative overflow-hidden"
    >
      <div
        class="lg:hidden absolute top-[-20%] left-[-20%] w-[400px] h-[400px] bg-primary/20 rounded-full blur-[100px]"
      ></div>
      <div
        class="lg:hidden absolute bottom-[-20%] right-[-20%] w-[400px] h-[400px] bg-secondary/20 rounded-full blur-[100px]"
      ></div>
      <div class="w-full max-w-md space-y-8 relative z-10">
        <!-- Logo Mobile -->
        <div class="lg:hidden flex justify-center mb-6">
          <img
            alt="323 Network Logo"
            class="w-40 h-auto object-contain drop-shadow-lg"
            src="/logo-removebg-preview.png"
          />
        </div>
        
        <!-- Tabs -->
        <div class="flex justify-center mb-8 border-b border-slate-200 dark:border-slate-800 pb-1 relative">
          <div class="grid grid-cols-2 w-full">
            <button
              :class="[
                'pb-3 text-lg transition-all duration-300 relative',
                activeTab === 'login'
                  ? 'text-primary border-b-2 border-primary font-bold'
                  : 'text-slate-500 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 border-b-2 border-transparent font-medium',
              ]"
              @click="activeTab = 'login'"
            >
              {{ t('auth.loginTab') }}
            </button>
            <button
              :class="[
                'pb-3 text-lg transition-all duration-300',
                activeTab === 'register'
                  ? 'text-primary border-b-2 border-primary font-bold'
                  : 'text-slate-500 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 border-b-2 border-transparent font-medium',
              ]"
              @click="activeTab = 'register'"
            >
              {{ t('auth.registerTab') }}
            </button>
          </div>
        </div>

        <!-- Form Title -->
        <div class="text-center">
          <h2 class="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {{ activeTab === 'login' ? t('auth.welcomeBack') : t('auth.joinUs') }}
          </h2>
          <p class="mt-2 text-sm text-slate-600 dark:text-slate-400">
            {{
              activeTab === 'login'
                ? t('auth.loginSubtitle')
                : t('auth.registerSubtitle')
            }}
          </p>
        </div>

        <!-- Login Form -->
        <form
          v-if="activeTab === 'login'"
          class="mt-8 space-y-6 block animate-fade-in-up"
          @submit.prevent="handleLogin"
        >
          <div class="space-y-5">
            <div>
              <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2" for="email"
                >{{ t('auth.emailOrUsername') }}</label
              >
              <div class="relative group">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    class="h-5 w-5 text-slate-500 group-focus-within:text-primary transition-colors duration-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                    ></path>
                  </svg>
                </div>
                <input
                  id="email"
                  v-model="loginForm.email"
                  type="email"
                  class="block w-full pl-10 pr-3 py-3.5 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900/50 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary focus:shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all duration-300 sm:text-sm"
                  required
                />
              </div>
            </div>
            <div>
              <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2" for="password"
                >{{ t('auth.password') }}</label
              >
              <div class="relative group">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    class="h-5 w-5 text-slate-500 group-focus-within:text-secondary transition-colors duration-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                    ></path>
                  </svg>
                </div>
                <input
                  id="password"
                  v-model="loginForm.password"
                  type="password"
                  class="block w-full pl-10 pr-3 py-3.5 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900/50 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-secondary focus:border-secondary focus:shadow-[0_0_15px_rgba(217,70,239,0.3)] transition-all duration-300 sm:text-sm"
                  required
                />
              </div>
              <div class="flex items-center justify-end mt-2">
                <div class="text-sm">
                  <RouterLink
                    :to="{
                      name: 'ForgotPassword',
                      query: loginForm.email ? { email: loginForm.email } : {},
                    }"
                    class="font-medium text-primary hover:text-cyan-300 transition-colors hover:shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                    @click.stop
                  >
                    {{ t('auth.forgotPasswordLink') }}
                  </RouterLink>
                </div>
              </div>
            </div>
          </div>
          <div>
            <Button variant="primary" size="lg" full-width :loading="loading" type="submit">
              {{ t('auth.login') }}
            </Button>
          </div>
        </form>

        <!-- Register Form -->
        <form
          v-else
          class="mt-8 space-y-5 block animate-fade-in-up"
          @submit.prevent="handleRegister"
        >
          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1" for="first-name"
                  >{{ t('auth.firstName') }}</label
                >
                <input
                  id="first-name"
                  v-model="registerForm.firstName"
                  type="text"
                  class="block w-full px-3 py-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900/50 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary focus:shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all duration-300 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1" for="last-name"
                  >{{ t('auth.lastName') }}</label
                >
                <input
                  id="last-name"
                  v-model="registerForm.lastName"
                  type="text"
                  class="block w-full px-3 py-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900/50 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary focus:shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all duration-300 sm:text-sm"
                  required
                />
              </div>
            </div>
            <div>
              <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1" for="reg-email"
                >{{ t('auth.professionalEmail') }}</label
              >
              <input
                id="reg-email"
                v-model="registerForm.email"
                type="email"
                class="block w-full px-3 py-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900/50 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary focus:shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all duration-300 sm:text-sm"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1" for="reg-password"
                >{{ t('auth.password') }}</label
              >
              <input
                id="reg-password"
                v-model="registerForm.password"
                type="password"
                class="block w-full px-3 py-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900/50 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-secondary focus:border-secondary focus:shadow-[0_0_15px_rgba(217,70,239,0.3)] transition-all duration-300 sm:text-sm"
                required
              />
            </div>
          </div>
          <div>
            <Button variant="secondary" size="lg" full-width :loading="loading" type="submit">
              {{ t('auth.createAccount') }}
            </Button>
          </div>
          <div class="text-xs text-center text-slate-500 dark:text-slate-500 mt-4">
            {{ t('auth.termsAgreement') }}
            <a class="underline hover:text-primary transition-colors" href="#">{{ t('auth.terms') }}</a> {{ t('auth.and') }}
            <a class="underline hover:text-primary transition-colors" href="#"
              >{{ t('auth.privacyPolicy') }}</a
            >.
          </div>
        </form>

        <!-- Modal de Erro de Login -->
        <Modal v-model="showLoginErrorModal" :title="loginErrorModal.title" :closable="true">
          <div class="text-center">
            <div class="mb-6 flex justify-center">
              <div class="rounded-full bg-red-500/10 dark:bg-red-500/20 p-4">
                <span class="material-symbols-outlined text-6xl text-red-500">
                  {{ loginErrorModal.icon }}
                </span>
              </div>
            </div>
            <h3 class="text-2xl font-bold text-slate-900 dark:text-white mb-3">
              {{ loginErrorModal.title }}
            </h3>
            <p class="text-slate-600 dark:text-gray-400 mb-4 leading-relaxed">
              {{ loginErrorModal.message }}
            </p>
            <div
              v-if="loginErrorModal.isEmailNotConfirmed"
              class="bg-slate-50 dark:bg-surface-lighter rounded-lg p-4 mb-6"
            >
              <p class="text-sm text-slate-600 dark:text-gray-400 leading-relaxed">
                <span class="material-symbols-outlined text-sm align-middle mr-1 text-primary"
                  >info</span
                >
                <strong>{{ t('auth.whatToDoNow') }}</strong><br />
                {{ t('auth.verifyInboxInstructions') }}
              </p>
            </div>
          </div>
          <template #footer>
            <div class="flex gap-3 w-full">
              <Button
                v-if="loginErrorModal.isEmailNotConfirmed"
                variant="outline"
                size="sm"
                full-width
                @click="resendConfirmationEmail"
                :loading="resendingEmail"
                :disabled="resendCooldown > 0"
              >
                <span v-if="resendCooldown > 0"> {{ t('auth.wait') }} {{ resendCooldown }}s </span>
                <span v-else> {{ t('auth.resendConfirmationEmail') }} </span>
              </Button>
              <Button variant="primary" size="sm" full-width @click="closeLoginErrorModal">
                {{ t('auth.understood') }}
              </Button>
            </div>
          </template>
        </Modal>

        <!-- Modal de Verificação de Email -->
        <Modal v-model="showEmailVerificationModal" :title="t('auth.verifyEmailTitle')" :closable="true">
          <div class="text-center">
            <div class="mb-6 flex justify-center">
              <div class="rounded-full bg-primary/10 dark:bg-primary/20 p-4">
                <span class="material-symbols-outlined text-6xl text-primary dark:text-secondary">
                  mark_email_read
                </span>
              </div>
            </div>
            <h3 class="text-2xl font-bold text-slate-900 dark:text-white mb-3">
              {{ t('auth.accountCreatedSuccess') }}
            </h3>
            <p class="text-slate-600 dark:text-gray-400 mb-4 leading-relaxed">
              {{ t('auth.verificationEmailSent') }}
              <strong class="text-slate-900 dark:text-white">{{ registerForm.email }}</strong>
            </p>
            <p class="text-sm text-slate-500 dark:text-gray-500 mb-6 leading-relaxed">
              {{ t('auth.checkInboxInstructions') }}
            </p>
            <div class="bg-slate-50 dark:bg-surface-lighter rounded-lg p-4 mb-6">
              <p class="text-xs text-slate-600 dark:text-gray-400">
                <span class="material-symbols-outlined text-sm align-middle mr-1">info</span>
                <strong>{{ t('auth.important') }}</strong> {{ t('auth.verifyBeforeLogin') }}
              </p>
            </div>
          </div>
          <template #footer>
            <Button variant="primary" full-width @click="closeEmailModal">
              {{ t('auth.thankYou') }}
            </Button>
          </template>
        </Modal>

        <!-- OAuth - Comentado temporariamente, será implementado depois -->
        <!--
        <div class="mt-8">
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-slate-800"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-4 bg-background-dark text-slate-500">Ou continue com</span>
            </div>
          </div>
          <div class="mt-6 grid grid-cols-2 gap-4">
            <button
              class="w-full inline-flex justify-center py-3 px-4 border border-slate-700 rounded-xl shadow-sm bg-slate-900/50 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white hover:border-slate-600 transition-all duration-200"
              @click="handleOAuth('google')"
            >
              <svg aria-hidden="true" class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.813.92 6.507 2.49l2.48-2.48C19.12 1.347 16.027 0 12.48 0 5.867 0 0 5.867 0 12.48s5.867 12.48 12.48 12.48c3.6 0 6.32-1.187 8.213-3.08 1.947-1.933 2.507-4.8 2.507-6.933 0-.627-.067-1.347-.173-1.92h-10.53Z"></path>
              </svg>
              Google
            </button>
            <button
              class="w-full inline-flex justify-center py-3 px-4 border border-slate-700 rounded-xl shadow-sm bg-slate-900/50 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white hover:border-slate-600 transition-all duration-200"
              @click="handleOAuth('apple')"
            >
              <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C1.79 15.25 4.23 5.81 9.38 5.61c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 5.48c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
              Apple
            </button>
          </div>
        </div>
        -->
      </div>
      <div class="absolute bottom-6 w-full text-center">
        <p class="text-xs text-slate-500 dark:text-slate-600">{{ t('auth.copyright') }}</p>
      </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/lib/supabase'
import Button from '@/components/ui/Button.vue'
import Modal from '@/components/ui/Modal.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import { toast } from 'vue-sonner'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// Define a aba inicial baseado na rota
const activeTab = ref<'login' | 'register'>(route.name === 'Register' ? 'register' : 'login')
const loading = ref(false)
const showEmailVerificationModal = ref(false)
const showLoginErrorModal = ref(false)
const resendingEmail = ref(false)
const resendCooldown = ref(0)
let resendCooldownTimer: ReturnType<typeof setInterval> | null = null
const loginErrorModal = ref({
  title: '',
  message: '',
  icon: 'error',
  isEmailNotConfirmed: false,
})

const loginForm = ref({
  email: '',
  password: '',
})

const registerForm = ref({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
})

async function handleLogin() {
  const startTime = performance.now()
  console.log('[LOGIN] Iniciando login - timestamp:', new Date().toISOString())

  loading.value = true
  try {
    const signInStartTime = performance.now()
    console.log('[LOGIN] Chamando authStore.signIn...')

    // Usar o método do authStore que já atualiza o user automaticamente
    const result = await authStore.signIn(loginForm.value.email, loginForm.value.password)

    const signInEndTime = performance.now()
    const signInDuration = signInEndTime - signInStartTime
    console.log(`[LOGIN] authStore.signIn completou em ${signInDuration.toFixed(2)}ms`)

    if (!result.success) {
      throw new Error(result.error || 'Erro ao fazer login')
    }

    // Verificar se há redirect na query string
    const redirect = route.query.redirect as string
    const redirectTo = redirect || '/'

    const redirectStartTime = performance.now()
    console.log(`[LOGIN] Redirecionando para: ${redirectTo}`)

    // Redirecionar usando Vue Router para evitar refresh da página
    await router.push(redirectTo)

    const redirectEndTime = performance.now()
    const redirectDuration = redirectEndTime - redirectStartTime
    const totalDuration = redirectEndTime - startTime
    console.log(`[LOGIN] Redirecionamento iniciado em ${redirectDuration.toFixed(2)}ms`)
    console.log(`[LOGIN] Tempo total desde clique: ${totalDuration.toFixed(2)}ms`)
  } catch (error: any) {
    const errorTime = performance.now()
    const errorDuration = errorTime - startTime
    console.error(`[LOGIN] Erro após ${errorDuration.toFixed(2)}ms:`, error)
    console.error('Login error:', error)

    // Verificar se é erro de email não confirmado
    const isEmailNotConfirmed =
      error.message?.toLowerCase().includes('email not confirmed') ||
      error.message?.toLowerCase().includes('email não confirmado') ||
      error.message?.toLowerCase().includes('confirmation') ||
      error.status === 400

    if (isEmailNotConfirmed) {
      loginErrorModal.value = {
        title: t('auth.emailNotConfirmedTitle'),
        message: t('auth.emailNotConfirmedMessage', { email: loginForm.value.email }),
        icon: 'mark_email_unread',
        isEmailNotConfirmed: true,
      }
    } else {
      loginErrorModal.value = {
        title: t('auth.loginErrorTitle'),
        message:
          error.message ||
          t('auth.loginErrorMessage'),
        icon: 'error',
        isEmailNotConfirmed: false,
      }
    }

    showLoginErrorModal.value = true
  } finally {
    loading.value = false
  }
}

function closeLoginErrorModal() {
  showLoginErrorModal.value = false
  loginErrorModal.value = {
    title: '',
    message: '',
    icon: 'error',
    isEmailNotConfirmed: false,
  }
}

async function resendConfirmationEmail() {
  if (!loginForm.value.email) {
    loginErrorModal.value = {
      title: t('auth.emailNecessaryTitle'),
      message: t('auth.emailNecessaryMessage'),
      icon: 'error',
      isEmailNotConfirmed: false,
    }
    return
  }

  // Verificar se está em cooldown
  if (resendCooldown.value > 0) {
    return
  }

  resendingEmail.value = true
  try {
    // Usar resend do Supabase para reenviar email de confirmação
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: loginForm.value.email,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
      },
    })

    if (error) throw error

    // Iniciar cooldown de 60 segundos
    startResendCooldown()

    // Mostrar mensagem de sucesso
    loginErrorModal.value = {
      title: t('auth.emailResentTitle'),
      message: t('auth.emailResentMessage', { email: loginForm.value.email }),
      icon: 'mark_email_read',
      isEmailNotConfirmed: false,
    }
  } catch (error: any) {
    console.error('Error resending confirmation:', error)
    loginErrorModal.value = {
      title: t('auth.resendErrorTitle'),
      message:
        error.message ||
        t('auth.resendErrorMessage'),
      icon: 'error',
      isEmailNotConfirmed: false,
    }
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
  }
})

async function handleRegister() {
  loading.value = true
  try {
    const { data, error } = await supabase.auth.signUp({
      email: registerForm.value.email,
      password: registerForm.value.password,
      options: {
        data: {
          nome: `${registerForm.value.firstName} ${registerForm.value.lastName}`,
        },
      },
    })
    if (error) throw error

    // Atualizar o perfil após o signUp
    if (data.user) {
      try {
        await supabase
          .from('profiles')
          .update({
            nome: `${registerForm.value.firstName} ${registerForm.value.lastName}`,
          })
          .eq('id', data.user.id)
      } catch (profileError) {
        // Se o perfil ainda não existe (trigger não executou), criar manualmente
        console.log('Tentando criar perfil manualmente:', profileError)
        try {
          await supabase.from('profiles').insert({
            id: data.user.id,
            nome: `${registerForm.value.firstName} ${registerForm.value.lastName}`,
            plano: 'Free',
            badge: 'Free',
          })
        } catch (insertError) {
          console.error('Erro ao criar/atualizar perfil:', insertError)
          // Não bloquear o fluxo se houver erro no perfil
        }
      }
    }

    // Mostrar modal de verificação de email
    showEmailVerificationModal.value = true

    // Limpar formulário
    registerForm.value = {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
    }
  } catch (error: any) {
    console.error('Register error:', error)
    toast.error(error.message || 'Erro ao criar conta')
  } finally {
    loading.value = false
  }
}

function closeEmailModal() {
  showEmailVerificationModal.value = false
  // Mudar para aba de login após fechar o modal
  activeTab.value = 'login'
}

// OAuth - Comentado temporariamente, será implementado depois
/*
async function handleOAuth(provider: 'google' | 'apple') {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: provider === 'google' ? 'google' : 'apple',
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    })
    if (error) throw error
  } catch (error: any) {
    console.error('OAuth error:', error)
    toast.error(error.message || 'Erro ao fazer login com OAuth')
  }
}
*/
</script>

<style scoped>
@keyframes pulse-glow {
  0%,
  100% {
    opacity: 0.8;
    filter: blur(40px);
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    filter: blur(60px);
    transform: scale(1.1);
  }
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
.neon-text {
  text-shadow: 0 0 10px rgba(6, 182, 212, 0.5);
}
.animate-fade-in-up {
  animation: fadeInUp 0.3s ease-out;
}
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
