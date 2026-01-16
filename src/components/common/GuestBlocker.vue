<template>
  <Transition name="fade">
    <div 
      v-if="show" 
      :class="[
        variant === 'full' 
          ? 'fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/80 backdrop-blur-sm' 
          : 'relative z-10 w-full rounded-2xl border border-slate-200 dark:border-white/10 p-8 text-center bg-white dark:bg-gradient-to-br dark:from-background-dark dark:to-gray-900 shadow-2xl overflow-hidden'
      ]"
      @click="handleOverlayClick"
    >
      <!-- Blur overlay for inline mode -->
      <div v-if="variant === 'inline'" class="absolute inset-0 bg-white/40 dark:bg-background-dark/20 backdrop-blur-[2px] pointer-events-none"></div>

      <div 
        :class="[
          variant === 'full' ? 'relative max-w-lg w-full mx-4 bg-white dark:bg-gradient-to-br dark:from-background-dark dark:to-gray-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 p-8 text-center' : 'relative z-10'
        ]"
        @click.stop
      >
        <!-- Close button (optional) -->
        <button
          v-if="dismissible"
          @click="$emit('dismiss')"
          class="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:text-gray-400 dark:hover:text-white transition-colors"
        >
          <span class="material-symbols-outlined">close</span>
        </button>

        <!-- Icon -->
        <div class="mb-6 flex justify-center">
          <div 
            class="rounded-full bg-gradient-to-r from-secondary to-primary flex items-center justify-center"
            :class="variant === 'full' ? 'w-20 h-20' : 'w-16 h-16'"
          >
            <span class="material-symbols-outlined text-white" :class="variant === 'full' ? 'text-4xl' : 'text-3xl'">lock_open</span>
          </div>
        </div>

        <!-- Title -->
        <h2 
        class="font-black text-slate-900 dark:text-white mb-3"
          :class="variant === 'full' ? 'text-3xl' : 'text-2xl'"
        >
          {{ displayTitle }}
        </h2>

        <!-- Message -->
        <p 
        class="text-slate-600 dark:text-gray-300 mb-8 leading-relaxed"
          :class="variant === 'full' ? 'text-lg' : 'text-base'"
        >
          {{ displayMessage }}
        </p>

        <!-- Benefits (optional) -->
        <div v-if="showBenefits" class="mb-8 text-left space-y-3">
          <div 
            v-for="benefit in displayBenefits" 
            :key="benefit"
            class="flex items-start gap-3 text-slate-700 dark:text-gray-200"
          >
            <span class="material-symbols-outlined text-secondary mt-0.5">check_circle</span>
            <span>{{ benefit }}</span>
          </div>
        </div>

        <!-- CTA Buttons -->
        <div class="flex flex-col sm:flex-row gap-3">
          <button
            @click="handleSignup"
            class="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-secondary to-primary text-white font-black text-lg hover:shadow-lg hover:scale-105 transition-all"
          >
            {{ displayCta }}
          </button>
          <button
            @click="handleLogin"
            class="flex-1 px-6 py-3 rounded-xl bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/20 text-slate-900 dark:text-white font-bold text-lg hover:bg-slate-200 dark:hover:bg-white/20 transition-all"
          >
            {{ t('auth.login') || 'Já tenho conta' }}
          </button>
        </div>

        <!-- Terms -->
        <p class="text-xs text-gray-500 mt-6 leading-relaxed">
          {{ t('common.guestBlocker.termsPrefix') }}
          <RouterLink to="/termos" class="text-secondary hover:underline font-medium">{{ t('common.guestBlocker.termsLabel') }}</RouterLink>
          {{ t('common.guestBlocker.termsAnd') }}
          <RouterLink to="/politica-privacidade" class="text-secondary hover:underline font-medium">{{ t('common.guestBlocker.privacyLabel') }}</RouterLink>
        </p>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePublicAccess } from '@/composables/usePublicAccess'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

interface Props {
  show: boolean
  variant?: 'full' | 'inline'
  title?: string
  message?: string
  cta?: string
  dismissible?: boolean
  showBenefits?: boolean
  benefits?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'full',
  title: '',
  message: '',
  cta: '',
  dismissible: false,
  showBenefits: false,
  benefits: () => []
})

const displayTitle = computed(() => props.title || t('common.guestBlocker.title'))
const displayMessage = computed(() => props.message || t('common.guestBlocker.message'))
const displayCta = computed(() => props.cta || t('common.guestBlocker.cta'))
const displayBenefits = computed(() => props.benefits.length > 0 ? props.benefits : t('common.guestBlocker.benefits'))

const emit = defineEmits<{
  dismiss: []
}>()

const { showAuthModal } = usePublicAccess()

function handleSignup() {
  showAuthModal('signup')
}

function handleLogin() {
  showAuthModal('login')
}

function handleOverlayClick() {
  if (props.dismissible) {
    emit('dismiss')
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
