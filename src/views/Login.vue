<template>
  <div class="min-h-screen bg-slate-50 dark:bg-background-dark">
    <!-- Login Content -->
  <div
      class="flex min-h-screen relative text-slate-900 dark:text-slate-100 font-sans antialiased selection:bg-primary selection:text-white"
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
          <!-- American Dream - Minimalista abaixo da logo -->
          <div v-if="source === 'american-dream'" class="mt-4">
            <div class="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-100/50 dark:bg-slate-800/30 border border-slate-200/50 dark:border-slate-700/50">
              <div class="w-2 h-2 rounded-full bg-primary dark:bg-secondary"></div>
              <span class="text-sm font-medium text-slate-600 dark:text-slate-400 tracking-wide">
                American Dream
              </span>
            </div>
          </div>
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
      class="w-full lg:w-1/2 flex flex-col justify-start items-center p-6 sm:p-8 bg-white dark:bg-background-dark relative overflow-y-auto"
    >
      <div
        class="lg:hidden absolute top-[-20%] left-[-20%] w-[400px] h-[400px] bg-primary/20 rounded-full blur-[100px]"
      ></div>
      <div
        class="lg:hidden absolute bottom-[-20%] right-[-20%] w-[400px] h-[400px] bg-secondary/20 rounded-full blur-[100px]"
      ></div>
      
      <!-- Theme and Language Controls -->
      <div class="absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center gap-3 z-20">
        <AnimatedThemeToggler />
        <LanguageSwitcher />
      </div>
      
      <div class="w-full max-w-md space-y-8 relative z-10 pt-16 sm:pt-20">
        
        <!-- Logo Mobile -->
        <div class="lg:hidden flex flex-col items-center mb-6">
          <img
            alt="323 Network Logo"
            class="w-40 h-auto object-contain drop-shadow-lg"
            src="/logo-removebg-preview.png"
          />
          <!-- American Dream - Minimalista abaixo da logo (mobile) -->
          <div v-if="source === 'american-dream'" class="mt-3">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100/50 dark:bg-slate-800/30 border border-slate-200/50 dark:border-slate-700/50">
              <div class="w-1.5 h-1.5 rounded-full bg-primary dark:bg-secondary"></div>
              <span class="text-xs font-medium text-slate-600 dark:text-slate-400 tracking-wide">
                American Dream
              </span>
            </div>
          </div>
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

        <!-- Forms Container - Grid for stacking -->
        <div class="grid mt-6 w-full">
          <!-- Login Form -->
          <form
            v-show="activeTab === 'login'"
            class="space-y-5 col-start-1 row-start-1 w-full transition-opacity duration-300"
            :class="activeTab === 'login' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'"
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
            v-show="activeTab === 'register'"
            class="space-y-5 col-start-1 row-start-1 w-full transition-opacity duration-300"
            :class="activeTab === 'register' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'"
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
                >{{ t('auth.email') }}</label
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
              <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1" for="reg-phone"
                >{{ t('auth.phone') }}</label
              >
              <input
                id="reg-phone"
                v-model="registerForm.phone"
                type="tel"
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
          
          <!-- Checkboxes de Aceite de Termos e Política -->
          <div class="space-y-3">
            <div class="flex items-start gap-3">
              <input
                id="accept-terms"
                v-model="registerForm.acceptTerms"
                type="checkbox"
                class="mt-1 h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-primary focus:ring-primary focus:ring-offset-0 dark:bg-slate-800"
                required
              />
              <label for="accept-terms" class="text-sm text-slate-700 dark:text-slate-300">
                {{ t('auth.acceptTerms') }}
                <RouterLink
                  :to="{ name: 'Terms' }"
                  target="_blank"
                  class="text-primary hover:text-cyan-300 underline font-medium"
                  @click.stop
                >
                  {{ t('auth.terms') }}
                </RouterLink>
                <span v-if="!registerForm.acceptTerms" class="text-red-500 ml-1">*</span>
              </label>
            </div>
            <div class="flex items-start gap-3">
              <input
                id="accept-privacy"
                v-model="registerForm.acceptPrivacy"
                type="checkbox"
                class="mt-1 h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-primary focus:ring-primary focus:ring-offset-0 dark:bg-slate-800"
                required
              />
              <label for="accept-privacy" class="text-sm text-slate-700 dark:text-slate-300">
                {{ t('auth.acceptPrivacy') }}
                <RouterLink
                  :to="{ name: 'PrivacyPolicy' }"
                  target="_blank"
                  class="text-primary hover:text-cyan-300 underline font-medium"
                  @click.stop
                >
                  {{ t('auth.privacyPolicy') }}
                </RouterLink>
                <span v-if="!registerForm.acceptPrivacy" class="text-red-500 ml-1">*</span>
              </label>
            </div>
          </div>

          <div>
            <Button variant="secondary" size="lg" full-width :loading="loading" type="submit">
              {{ t('auth.createAccount') }}
            </Button>
          </div>

          <!-- Google Register - COMENTADO: Pode ser reativado posteriormente -->
          <!--
          <div>
            <div class="relative">
              <div class="absolute inset-0 flex items-center">
                <div class="w-full border-t border-slate-200 dark:border-slate-800"></div>
              </div>
              <div class="relative flex justify-center text-sm">
                <span class="px-4 bg-white dark:bg-slate-900/50 text-slate-500 font-medium">{{ t('auth.orContinueWith') }}</span>
              </div>
            </div>
            <div class="mt-4 flex justify-center">
              <button
                type="button"
                class="w-full inline-flex justify-center items-center py-3.5 px-4 border border-slate-300 dark:border-slate-700 rounded-xl shadow-sm bg-white dark:bg-slate-900/50 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-400 dark:hover:border-slate-600 transition-all duration-300 active:scale-95 group"
                @click="handleOAuth('register')"
                :disabled="loading"
              >
                <svg aria-hidden="true" class="w-5 h-5 mr-3 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span>Google</span>
              </button>
            </div>
          </div>
          -->
          </form>
        </div>

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


      </div>
      <div class="mt-auto w-full text-center py-6">
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
import AnimatedThemeToggler from '@/components/ui/AnimatedThemeToggler.vue'
import LanguageSwitcher from '@/components/ui/LanguageSwitcher.vue'
import { toast } from 'vue-sonner'
import { useI18n } from 'vue-i18n'
import { useTermsAcceptance } from '@/composables/useTermsAcceptance'

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

// Ler query parameters para integração com American Dream
const source = route.query.source as string
// Decodificar returnTo se estiver URL-encoded (Vue Router pode já decodificar, mas garantir)
let returnTo = route.query.returnTo as string
if (returnTo) {
  try {
    returnTo = decodeURIComponent(returnTo)
  } catch {
    // Se falhar, usar o valor original
  }
}
const prefillEmail = route.query.email as string
const prefillName = route.query.name as string
const prefillPhone = route.query.phone as string
const prefillCountryCode = route.query.phoneCountryCode as string || 'BR'

// Se veio do American Dream, ativar aba de registro e pré-preencher
if (source === 'american-dream') {
  activeTab.value = 'register'
}

const loginForm = ref({
  email: '',
  password: '',
})

interface RegisterForm {
  firstName: string
  lastName: string
  email: string
  phone: string
  password: string
  acceptTerms: boolean
  acceptPrivacy: boolean
}

const registerForm = ref<RegisterForm>({
  firstName: '',
  lastName: '',
  email: prefillEmail || '',
  phone: prefillPhone || '',
  password: '',
  acceptTerms: false,
  acceptPrivacy: false,
})

// Pré-preencher nome se veio do American Dream
if (source === 'american-dream' && prefillName) {
  const nameParts = prefillName.split(' ')
  registerForm.value.firstName = nameParts[0] || ''
  registerForm.value.lastName = nameParts.slice(1).join(' ') || ''
}

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

    // Verificar se é URL externa (American Dream)
    if (redirectTo.startsWith('http://') || redirectTo.startsWith('https://')) {
      // URL externa - redirecionar com token
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.access_token) {
        // Adicionar token à URL se ainda não tiver
        const url = new URL(redirectTo)
        if (!url.searchParams.has('token')) {
          url.searchParams.set('token', session.access_token)
        }
        window.location.href = url.toString()
        return
      }
    }

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

    const errorMessage = error.message?.toLowerCase() || ''
    
    // Verificar se é erro de email não confirmado
    const isEmailNotConfirmed =
      errorMessage.includes('email not confirmed') ||
      errorMessage.includes('email não confirmado') ||
      errorMessage.includes('confirmation') ||
      error.status === 400

    // Verificar se é erro de credenciais inválidas
    const isInvalidCredentials =
      errorMessage.includes('invalid login credentials') ||
      errorMessage.includes('credenciais inválidas') ||
      errorMessage.includes('invalid credentials') ||
      errorMessage.includes('email or password') ||
      error.code === 'invalid_credentials'

    if (isEmailNotConfirmed) {
      loginErrorModal.value = {
        title: t('auth.emailNotConfirmedTitle'),
        message: t('auth.emailNotConfirmedMessage', { email: loginForm.value.email }),
        icon: 'mark_email_unread',
        isEmailNotConfirmed: true,
      }
    } else if (isInvalidCredentials) {
      loginErrorModal.value = {
        title: t('auth.invalidCredentialsTitle'),
        message: t('auth.invalidCredentialsMessage'),
        icon: 'lock',
        isEmailNotConfirmed: false,
      }
    } else {
      loginErrorModal.value = {
        title: t('auth.loginErrorTitle'),
        message: t('auth.loginErrorMessage'),
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
        emailRedirectTo: `${window.location.origin}/auth/callback`,
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
  // Validar checkboxes obrigatórios
  if (!registerForm.value.acceptTerms) {
    toast.error(t('auth.mustAcceptTerms'))
    return
  }

  if (!registerForm.value.acceptPrivacy) {
    toast.error(t('auth.mustAcceptPrivacy'))
    return
  }

  loading.value = true
  try {
    const { getLatestActiveTerm, recordTermAcceptance } = useTermsAcceptance()

    // Buscar termos ativos
    const termsOfService = await getLatestActiveTerm('terms_of_service')
    const privacyPolicy = await getLatestActiveTerm('privacy_policy')

    if (!termsOfService) {
      throw new Error(t('auth.termsNotFound'))
    }

    if (!privacyPolicy) {
      throw new Error(t('auth.privacyNotFound'))
    }

    // Criar conta primeiro
    const result = await authStore.signUp(
      registerForm.value.email,
      registerForm.value.password,
      {
        firstName: registerForm.value.firstName,
        lastName: registerForm.value.lastName,
        nome: `${registerForm.value.firstName} ${registerForm.value.lastName}`,
        phone: registerForm.value.phone,
        source: source || '323-network',
        returnTo: returnTo || null,
        phoneCountryCode: prefillCountryCode || 'BR'
      }
    )

    if (!result.success) {
      throw new Error(result.error || 'Erro ao criar conta')
    }

    // Se veio do American Dream e já redirecionou, registrar aceites antes de sair
    if (result.redirected) {
      // Aguardar um pouco para garantir que o usuário foi criado
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Registrar aceites (pode falhar silenciosamente se o usuário não estiver disponível ainda)
      try {
        const userId = authStore.user?.id
        if (userId) {
          await recordTermAcceptance(termsOfService.id, 'terms_of_service', userId)
          await recordTermAcceptance(privacyPolicy.id, 'privacy_policy', userId)
        }
      } catch (err) {
        console.warn('Erro ao registrar aceites após redirecionamento:', err)
      }
      return
    }

    // Registrar aceites após criar conta
    const userId = authStore.user?.id
    if (userId) {
      await recordTermAcceptance(termsOfService.id, 'terms_of_service', userId)
      await recordTermAcceptance(privacyPolicy.id, 'privacy_policy', userId)
    }

    // Só mostrar modal se não veio do American Dream
    if (source !== 'american-dream') {
      // Mostrar modal de verificação de email
      showEmailVerificationModal.value = true

      // Limpar formulário
      registerForm.value = {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        acceptTerms: false,
        acceptPrivacy: false,
      }
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

// COMENTADO: Função de autenticação com Google - Pode ser reativada posteriormente
/*
async function handleOAuth(mode: 'register' | 'login' = 'register') {
  try {
    loading.value = true
    
    // Passar o modo (register/login) na URL de callback para identificar a origem
    const redirectTo = `${window.location.origin}/auth/callback?mode=${mode}`
    const result = await authStore.signInWithGoogle(redirectTo)
    
    if (!result.success) {
      throw new Error(result.error || 'Erro ao iniciar autenticação com Google')
    }
  } catch (error: any) {
    console.error('OAuth error:', error)
    toast.error(error.message || 'Erro ao fazer autenticação com Google')
  } finally {
    loading.value = false
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
