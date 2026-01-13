<template>
  <div class="min-h-screen bg-slate-50 dark:bg-background-dark">
    <div class="flex min-h-screen relative text-slate-900 dark:text-slate-100 font-sans antialiased selection:bg-primary selection:text-white">
      <!-- Right Side - Content -->
      <div class="w-full flex flex-col justify-start items-center p-6 sm:p-8 bg-white dark:bg-background-dark relative overflow-y-auto">
        <div class="lg:hidden absolute top-[-20%] left-[-20%] w-[400px] h-[400px] bg-primary/20 rounded-full blur-[100px]"></div>
        <div class="lg:hidden absolute bottom-[-20%] right-[-20%] w-[400px] h-[400px] bg-secondary/20 rounded-full blur-[100px]"></div>
        
        <!-- Theme and Language Controls -->
        <div class="absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center gap-3 z-20">
          <AnimatedThemeToggler />
          <LanguageSwitcher />
        </div>
        
        <div class="w-full max-w-2xl space-y-8 relative z-10 pt-16 sm:pt-20">
          
          <!-- Logo Mobile -->
          <div class="flex flex-col items-center mb-6">
            <img
              alt="323 Network Logo"
              class="w-40 h-auto object-contain drop-shadow-lg"
              src="/logo-removebg-preview.png"
            />
          </div>
          <!-- Progress Bar -->
          <div class="mb-4 sm:mb-6 md:mb-8">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs sm:text-sm font-medium text-slate-600 dark:text-text-muted">
                {{ t('onboarding.progress', { current: currentStep, total: 3 }) }}
              </span>
              <span class="text-xs sm:text-sm font-medium text-primary dark:text-secondary">{{ Math.round((currentStep / 3) * 100) }}%</span>
            </div>
            <div class="w-full h-1.5 sm:h-2 bg-slate-200 dark:bg-input-bg rounded-full overflow-hidden">
              <div 
                class="h-full bg-gradient-to-r from-secondary to-primary transition-all duration-500 ease-out"
                :style="{ width: `${(currentStep / 3) * 100}%` }"
              ></div>
            </div>
          </div>

          <!-- Step Content Card -->
          <div class="bg-white dark:bg-surface-dark/90 backdrop-blur-xl border border-slate-200 dark:border-input-border rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-2xl">
            <Transition name="fade-slide" mode="out-in">
              <!-- Step 1: Informações Básicas -->
              <OnboardingStep1
                v-if="currentStep === 1"
                :name="formData.nome"
                :profession="formData.area_atuacao"
                :nationality="formData.nacionalidade"
                :avatar-url="formData.avatar_url"
                :name-error="errors.nome"
                :profession-error="errors.area_atuacao"
                @update:name="formData.nome = $event"
                @update:profession="formData.area_atuacao = $event"
                @update:nationality="formData.nacionalidade = $event"
                @update:avatar-url="formData.avatar_url = $event"
              />

              <!-- Step 2: Localização -->
              <OnboardingStep2
                v-else-if="currentStep === 2"
                :country="formData.pais"
                :state="formData.estado"
                :city="formData.cidade"
                :country-error="errors.pais"
                :state-error="errors.estado"
                :city-error="errors.cidade"
                @update:country="formData.pais = $event"
                @update:state="formData.estado = $event"
                @update:city="formData.cidade = $event"
              />

              <!-- Step 3: Sobre Você -->
              <OnboardingStep3
                v-else-if="currentStep === 3"
                :bio="formData.bio"
                :linkedin="formData.linkedin"
                :instagram="formData.instagram"
                :tags="formData.tags"
                :goals="formData.goals"
                @update:bio="formData.bio = $event"
                @update:linkedin="formData.linkedin = $event"
                @update:instagram="formData.instagram = $event"
                @update:tags="formData.tags = $event"
                @update:goals="formData.goals = $event"
              />
            </Transition>

            <!-- Navigation Buttons -->
            <div class="flex items-center justify-between mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-slate-200 dark:border-input-border gap-3">
              <button
                v-if="currentStep > 1"
                @click="previousStep"
                class="px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border border-slate-300 dark:border-input-border text-slate-700 dark:text-white text-sm sm:text-base font-semibold hover:bg-slate-50 dark:hover:bg-white/5 hover:border-primary dark:hover:border-secondary transition-all active:scale-95"
              >
                {{ t('common.previous') }}
              </button>
              <div v-else class="flex-1"></div>

              <button
                v-if="currentStep < 3"
                @click="nextStep"
                :disabled="loading"
                class="px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg sm:rounded-xl bg-gradient-to-r from-secondary to-primary text-white text-sm sm:text-base font-bold shadow-lg hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 flex-1 sm:flex-none"
              >
                {{ loading ? t('common.loading') : t('common.next') }}
              </button>
              <button
                v-else
                @click="completeOnboarding"
                :disabled="loading"
                class="px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg sm:rounded-xl bg-gradient-to-r from-secondary to-primary text-white text-sm sm:text-base font-bold shadow-lg hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 flex-1 sm:flex-none"
              >
                {{ loading ? t('common.loading') : t('onboarding.finish') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { toast } from 'vue-sonner'
import { useAuthStore } from '@/stores/auth'
import { useUserStore } from '@/stores/user'
import { completeOnboarding as completeOnboardingFn } from '@/composables/useOnboarding'
import OnboardingStep1 from '@/components/onboarding/OnboardingStep1.vue'
import OnboardingStep2 from '@/components/onboarding/OnboardingStep2.vue'
import OnboardingStep3 from '@/components/onboarding/OnboardingStep3.vue'
import AnimatedThemeToggler from '@/components/ui/AnimatedThemeToggler.vue'
import LanguageSwitcher from '@/components/ui/LanguageSwitcher.vue'

const { t } = useI18n()
const router = useRouter()
const authStore = useAuthStore()
const userStore = useUserStore()

const currentStep = ref(1)
const loading = ref(false)

const formData = reactive({
  nome: '',
  area_atuacao: '',
  nacionalidade: '',
  avatar_url: '',
  pais: 'USA',
  estado: '',
  cidade: '',
  bio: '',
  linkedin: '',
  instagram: '',
  tags: [] as string[],
  goals: [] as string[],
})

const errors = reactive({
  nome: '',
  area_atuacao: '',
  pais: '',
  estado: '',
  cidade: '',
})

// Carregar dados existentes do perfil
onMounted(async () => {
  if (authStore.user && !userStore.profile) {
    await userStore.fetchProfile(authStore.user.id)
  }

  if (userStore.profile) {
    formData.nome = userStore.profile.nome || ''
    formData.area_atuacao = userStore.profile.area_atuacao || ''
    formData.nacionalidade = userStore.profile.nacionalidade || ''
    formData.avatar_url = userStore.profile.avatar_url || ''
    formData.pais = userStore.profile.pais || 'USA'
    formData.estado = userStore.profile.estado || ''
    formData.cidade = userStore.profile.cidade || ''
    formData.bio = userStore.profile.bio || ''
    formData.linkedin = userStore.profile.linkedin || ''
    formData.instagram = userStore.profile.instagram || ''
    formData.tags = userStore.profile.tags || []
    formData.goals = userStore.profile.goals || []
  }
})

function validateStep1(): boolean {
  errors.nome = ''
  errors.area_atuacao = ''

  if (!formData.nome || formData.nome.trim() === '') {
    errors.nome = t('onboarding.errors.nameRequired')
    return false
  }

  if (!formData.area_atuacao || formData.area_atuacao.trim() === '') {
    errors.area_atuacao = t('onboarding.errors.professionRequired')
    return false
  }

  return true
}

function validateStep2(): boolean {
  errors.pais = ''
  errors.estado = ''
  errors.cidade = ''

  if (!formData.pais || formData.pais.trim() === '') {
    errors.pais = t('onboarding.errors.countryRequired')
    return false
  }

  if (!formData.estado || formData.estado.trim() === '') {
    errors.estado = t('onboarding.errors.stateRequired')
    return false
  }

  if (!formData.cidade || formData.cidade.trim() === '') {
    errors.cidade = t('onboarding.errors.cityRequired')
    return false
  }

  return true
}

function nextStep() {
  if (currentStep.value === 1) {
    if (!validateStep1()) {
      return
    }
  } else if (currentStep.value === 2) {
    if (!validateStep2()) {
      return
    }
  }

  currentStep.value++
}

function previousStep() {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

async function completeOnboarding() {
  loading.value = true

  try {
    // Validar todos os steps antes de finalizar
    if (!validateStep1() || !validateStep2()) {
      // Voltar para o step com erro
      if (!validateStep1()) {
        currentStep.value = 1
      } else if (!validateStep2()) {
        currentStep.value = 2
      }
      return
    }

    // Preparar dados para salvar
    const profileData = {
      nome: formData.nome.trim(),
      area_atuacao: formData.area_atuacao.trim(),
      nacionalidade: formData.nacionalidade || undefined,
      avatar_url: formData.avatar_url || undefined,
      pais: formData.pais,
      estado: formData.estado.trim(),
      cidade: formData.cidade.trim(),
      bio: formData.bio.trim() || undefined,
      linkedin: formData.linkedin.trim() || undefined,
      instagram: formData.instagram.trim() || undefined,
      tags: formData.tags.length > 0 ? formData.tags : undefined,
      goals: formData.goals.length > 0 ? formData.goals : undefined,
    }

    const result = await completeOnboardingFn(profileData)

    if (!result.success) {
      throw new Error(result.error || 'Erro ao salvar perfil')
    }

    toast.success(t('onboarding.success'))
    
    // Redirecionar para o feed
    router.push('/')
  } catch (error: any) {
    console.error('[ONBOARDING] Erro ao completar:', error)
    toast.error(error.message || t('onboarding.error'))
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
</style>
