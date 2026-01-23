<template>
  <!-- Toggle Variant -->
  <div v-if="variant === 'toggle'" class="flex items-center bg-slate-100 dark:bg-surface-lighter p-1 rounded-xl w-full">
    <button
      v-for="language in availableLanguages"
      :key="language.code"
      @click="handleLocaleChange(language.code)"
      class="flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-xs font-bold transition-all duration-300"
      :class="[
        language.isActive
          ? 'bg-white dark:bg-surface-dark text-primary dark:text-secondary shadow-sm'
          : 'text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-200'
      ]"
    >
      <span>{{ language.flag }}</span>
      <span>{{ language.code.split('-')[0].toUpperCase() }}</span>
    </button>
  </div>

  <!-- Dropdown Variant -->
  <div v-else class="relative" ref="languageMenuContainer">
    <button
      @click.stop="toggleLanguageMenu"
      class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-surface-lighter transition-colors"
      type="button"
    >
      <span class="text-lg">{{ currentLocaleData.flag }}</span>
      <span class="text-xs sm:text-sm">{{ currentLocaleData.code.split('-')[0].toUpperCase() }}</span>
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
        class="absolute right-0 mt-2 w-44 rounded-xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 shadow-2xl z-50 overflow-hidden"
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
            <span class="flex-1 text-left">{{ language.name }}</span>
            <span v-if="language.isActive" class="material-icons text-sm">check</span>
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useLanguageDetection } from '@/composables/useLanguageDetection'

const props = withDefaults(defineProps<{
  variant?: 'dropdown' | 'toggle'
}>(), {
  variant: 'dropdown'
})

const {
  availableLanguages,
  changeLanguage
} = useLanguageDetection()

const showLanguageMenu = ref(false)
const languageMenuContainer = ref<HTMLElement | null>(null)

const currentLocaleData = computed(() => {
  return availableLanguages.value.find(l => l.isActive) || availableLanguages.value[0]
})

function toggleLanguageMenu() {
  showLanguageMenu.value = !showLanguageMenu.value
}

function handleLocaleChange(newLocale: string) {
  changeLanguage(newLocale as 'pt-BR' | 'en-US')
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
