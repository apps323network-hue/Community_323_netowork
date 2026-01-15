<template>
  <div class="max-w-4xl mx-auto p-6 space-y-6">
    <!-- Header -->
    <div class="bg-gradient-to-r from-primary to-secondary rounded-2xl p-6 text-white">
      <h1 class="text-3xl font-black mb-2">🌍 Language Detection Demo</h1>
      <p class="text-white/80">Sistema de Detecção Automática de Idioma</p>
    </div>

    <!-- Current Status -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- Current Language -->
      <div class="bg-white dark:bg-surface-card rounded-xl p-6 border border-slate-200 dark:border-white/10">
        <div class="flex items-center gap-3 mb-2">
          <span class="material-symbols-outlined text-primary">language</span>
          <h3 class="font-bold text-slate-900 dark:text-white">Current Language</h3>
        </div>
        <div class="flex items-center gap-2 mt-4">
          <span class="text-3xl">{{ currentLanguageInfo?.flag }}</span>
          <div>
            <p class="font-bold text-slate-900 dark:text-white">{{ currentLanguageInfo?.name }}</p>
            <p class="text-xs text-slate-500 dark:text-gray-400">{{ currentLanguageInfo?.code }}</p>
          </div>
        </div>
      </div>

      <!-- Browser Language -->
      <div class="bg-white dark:bg-surface-card rounded-xl p-6 border border-slate-200 dark:border-white/10">
        <div class="flex items-center gap-3 mb-2">
          <span class="material-symbols-outlined text-secondary">web</span>
          <h3 class="font-bold text-slate-900 dark:text-white">Browser Language</h3>
        </div>
        <div class="flex items-center gap-2 mt-4">
          <span class="text-3xl">{{ browserLanguageInfo?.flag }}</span>
          <div>
            <p class="font-bold text-slate-900 dark:text-white">{{ browserLanguageInfo?.name }}</p>
            <p class="text-xs text-slate-500 dark:text-gray-400">{{ browserLanguage }}</p>
          </div>
        </div>
      </div>

      <!-- Status -->
      <div class="bg-white dark:bg-surface-card rounded-xl p-6 border border-slate-200 dark:border-white/10">
        <div class="flex items-center gap-3 mb-2">
          <span class="material-symbols-outlined" :class="isDetectedLanguageApplied ? 'text-green-500' : 'text-yellow-500'">
            {{ isDetectedLanguageApplied ? 'check_circle' : 'warning' }}
          </span>
          <h3 class="font-bold text-slate-900 dark:text-white">Detection Status</h3>
        </div>
        <div class="mt-4">
          <p class="font-bold" :class="isDetectedLanguageApplied ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'">
            {{ isDetectedLanguageApplied ? '✅ Applied' : '⚠️ Not Applied' }}
          </p>
          <p class="text-xs text-slate-500 dark:text-gray-400 mt-1">
            {{ isCurrentBrowserDefault ? 'Using browser default' : 'Using custom preference' }}
          </p>
        </div>
      </div>
    </div>

    <!-- Available Languages -->
    <div class="bg-white dark:bg-surface-card rounded-xl p-6 border border-slate-200 dark:border-white/10">
      <h3 class="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
        <span class="material-symbols-outlined">translate</span>
        Available Languages
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <button
          v-for="language in availableLanguages"
          :key="language.code"
          @click="changeLanguage(language.code as 'pt-BR' | 'en-US')"
          class="flex items-center gap-4 p-4 rounded-xl border-2 transition-all"
          :class="[
            language.isActive
              ? 'border-primary bg-primary/10 dark:bg-primary/20'
              : 'border-slate-200 dark:border-white/10 hover:border-primary/50'
          ]"
        >
          <span class="text-4xl">{{ language.flag }}</span>
          <div class="flex-1 text-left">
            <div class="flex items-center gap-2">
              <p class="font-bold text-slate-900 dark:text-white">{{ language.name }}</p>
              <span v-if="language.isBrowserDefault" class="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 font-bold">
                AUTO
              </span>
            </div>
            <p class="text-sm text-slate-500 dark:text-gray-400">{{ language.nativeName }}</p>
            <p class="text-xs text-slate-400 dark:text-gray-500 mt-1">{{ language.code }}</p>
          </div>
          <span v-if="language.isActive" class="material-symbols-outlined text-primary text-2xl">
            check_circle
          </span>
        </button>
      </div>
    </div>

    <!-- Actions -->
    <div class="bg-white dark:bg-surface-card rounded-xl p-6 border border-slate-200 dark:border-white/10">
      <h3 class="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
        <span class="material-symbols-outlined">settings</span>
        Actions
      </h3>
      <div class="flex flex-wrap gap-3">
        <button
          @click="forceApplyDetectedLanguage"
          :disabled="isDetectedLanguageApplied"
          class="px-4 py-2 rounded-lg bg-secondary text-white font-medium hover:bg-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <span class="material-symbols-outlined">sync</span>
          Force Apply Browser Language
        </button>

        <button
          @click="resetToDefault"
          :disabled="isCurrentBrowserDefault"
          class="px-4 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <span class="material-symbols-outlined">refresh</span>
          Reset to Browser Default
        </button>

        <button
          @click="clearCache"
          class="px-4 py-2 rounded-lg border-2 border-red-500 text-red-500 font-medium hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors flex items-center gap-2"
        >
          <span class="material-symbols-outlined">delete</span>
          Clear Cache
        </button>
      </div>
    </div>

    <!-- Debug Info -->
    <div class="bg-slate-900 rounded-xl p-6 text-white font-mono text-sm">
      <h3 class="font-bold mb-4 flex items-center gap-2 font-sans">
        <span class="material-symbols-outlined">bug_report</span>
        Debug Information
      </h3>
      <div class="space-y-2">
        <div><span class="text-secondary">navigator.language:</span> {{ navigatorLanguage }}</div>
        <div><span class="text-secondary">navigator.languages:</span> {{ navigatorLanguages }}</div>
        <div><span class="text-secondary">localStorage.locale:</span> {{ localStorageLocale }}</div>
        <div><span class="text-secondary">localStorage.i18n_initialized:</span> {{ localStorageInitialized }}</div>
        <div><span class="text-secondary">Current i18n locale:</span> {{ currentLocale }}</div>
        <div><span class="text-secondary">Detected languages:</span> {{ detectedLanguages }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useLanguageDetection } from '@/composables/useLanguageDetection'

const { locale: currentLocale } = useI18n()
const {
  browserLanguage,
  detectedLanguages,
  isCurrentBrowserDefault,
  isDetectedLanguageApplied,
  availableLanguages,
  forceApplyDetectedLanguage,
  resetToDefault,
  changeLanguage,
  getLanguageDetails
} = useLanguageDetection()

const currentLanguageInfo = computed(() => {
  return availableLanguages.value.find(l => l.isActive)
})

const browserLanguageInfo = computed(() => {
  return getLanguageDetails(browserLanguage.value)
})

// Debug info
const navigatorLanguage = ref(navigator.language)
const navigatorLanguages = ref(navigator.languages)
const localStorageLocale = ref(localStorage.getItem('locale'))
const localStorageInitialized = ref(localStorage.getItem('i18n_initialized'))

function clearCache() {
  if (confirm('This will clear all language preferences and reload the page. Continue?')) {
    localStorage.removeItem('locale')
    localStorage.removeItem('i18n_initialized')
    window.location.reload()
  }
}
</script>
