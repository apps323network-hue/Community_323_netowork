<template>
  <div class="relative" ref="languageMenuContainer">
    <button
      @click.stop="toggleLanguageMenu"
      class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-surface-lighter transition-colors border border-slate-200 dark:border-white/10"
      :class="{ 'ring-2 ring-secondary/50': !isDetectedLanguageApplied }"
      type="button"
    >
      <span class="text-lg">{{ currentLocaleData.flag }}</span>
      <span class="text-xs sm:text-sm">{{ currentLocaleData.code.split('-')[0].toUpperCase() }}</span>
      <!-- Indicator for browser default -->
      <span 
        v-if="isCurrentBrowserDefault" 
        class="w-2 h-2 rounded-full bg-green-500 animate-pulse"
        title="Browser default language"
      ></span>
      <span class="material-icons text-sm">expand_more</span>
    </button>
    
    <!-- Language Dropdown -->
    <Transition
      enter-active-class="transition-all duration-200"
      enter-from-class="opacity-0 scale-95 translate-y-2"
      enter-to-class="opacity-100 scale-100 translate-y-0"
      leave-active-class="transition-all duration-200"
      leave-from-class="opacity-100 scale-100 translate-y-0"
      leave-to-class="opacity-0 scale-95 translate-y-2"
    >
      <div
        v-if="showLanguageMenu"
        class="absolute right-0 mt-2 w-64 rounded-xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 shadow-2xl z-50 overflow-hidden"
        @click.stop
      >
        <div class="p-2">
          <!-- Language Options -->
          <button
            v-for="language in availableLanguages"
            :key="language.code"
            @click="handleLocaleChange(language.code)"
            class="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors"
            :class="[
              language.isActive
                ? 'bg-primary/10 text-primary dark:bg-secondary/10 dark:text-secondary'
                : 'text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-surface-lighter'
            ]"
          >
            <span class="text-lg">{{ language.flag }}</span>
            <div class="flex-1 text-left">
              <div class="flex items-center gap-2">
                <span>{{ language.name }}</span>
                <!-- Browser default badge -->
                <span 
                  v-if="language.isBrowserDefault" 
                  class="text-[10px] px-1.5 py-0.5 rounded bg-green-500/10 text-green-600 dark:text-green-400 font-bold uppercase"
                  title="Browser default"
                >
                  Auto
                </span>
              </div>
              <span class="text-xs text-slate-500 dark:text-gray-400">{{ language.nativeName }}</span>
            </div>
            <span v-if="language.isActive" class="material-icons text-sm">check</span>
          </button>

          <!-- Divider -->
          <div v-if="!isDetectedLanguageApplied" class="my-2 border-t border-slate-200 dark:border-white/10"></div>

          <!-- Reset to Browser Language Option -->
          <button
            v-if="!isDetectedLanguageApplied"
            @click="handleResetToBrowser"
            class="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-secondary dark:text-secondary hover:bg-secondary/10 transition-colors"
          >
            <span class="material-symbols-outlined text-lg">refresh</span>
            <div class="flex-1 text-left">
              <span>Reset to Browser Language</span>
              <div class="text-xs text-slate-500 dark:text-gray-400">
                {{ browserLanguageInfo?.name }}
              </div>
            </div>
          </button>

          <!-- Auto-detect info -->
          <div class="mt-2 px-4 py-2 text-xs text-slate-500 dark:text-gray-400 border-t border-slate-200 dark:border-white/10">
            <div class="flex items-center gap-1">
              <span class="material-symbols-outlined text-sm">info</span>
              <span>Browser: {{ browserLanguageInfo?.flag }} {{ browserLanguageInfo?.name }}</span>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useLocale } from '@/composables/useLocale'
import { useLanguageDetection } from '@/composables/useLanguageDetection'

const { locale: currentLocale, setLocale } = useLocale()
const {
  browserLanguage,
  isCurrentBrowserDefault,
  isDetectedLanguageApplied,
  availableLanguages,
  resetToDefault,
  changeLanguage,
  getLanguageDetails
} = useLanguageDetection()

const showLanguageMenu = ref(false)
const languageMenuContainer = ref<HTMLElement | null>(null)

const currentLocaleData = computed(() => {
  return availableLanguages.value.find(l => l.isActive) || availableLanguages.value[0]
})

const browserLanguageInfo = computed(() => {
  return getLanguageDetails(browserLanguage.value)
})

function toggleLanguageMenu() {
  showLanguageMenu.value = !showLanguageMenu.value
}

function handleLocaleChange(newLocale: string) {
  changeLanguage(newLocale as 'pt-BR' | 'en-US')
  showLanguageMenu.value = false
}

function handleResetToBrowser() {
  resetToDefault()
  showLanguageMenu.value = false
}

// Fechar menu ao clicar fora
function handleClickOutside(event: MouseEvent) {
  if (languageMenuContainer.value && !languageMenuContainer.value.contains(event.target as Node)) {
    showLanguageMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
