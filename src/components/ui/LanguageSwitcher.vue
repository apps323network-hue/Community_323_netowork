<template>
  <div class="relative" ref="languageMenuContainer">
    <button
      @click.stop="toggleLanguageMenu"
      class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-surface-lighter transition-colors border border-slate-200 dark:border-white/10"
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
        class="absolute right-0 mt-2 w-48 rounded-xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 shadow-2xl z-50 overflow-hidden"
        @click.stop
      >
        <div class="p-2">
          <button
            v-for="locale in availableLocales"
            :key="locale.code"
            @click="handleLocaleChange(locale.code)"
            class="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors"
            :class="[
              currentLocale === locale.code
                ? 'bg-primary/10 text-primary dark:bg-secondary/10 dark:text-secondary'
                : 'text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-surface-lighter'
            ]"
          >
            <span class="text-lg">{{ locale.flag }}</span>
            <span>{{ locale.name }}</span>
            <span v-if="currentLocale === locale.code" class="material-icons text-sm ml-auto">check</span>
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useLocale } from '@/composables/useLocale'

const { locale: currentLocale, setLocale, availableLocales } = useLocale()
const showLanguageMenu = ref(false)
const languageMenuContainer = ref<HTMLElement | null>(null)

const currentLocaleData = computed(() => {
  return availableLocales.find(l => l.code === currentLocale.value) || availableLocales[0]
})

function toggleLanguageMenu() {
  showLanguageMenu.value = !showLanguageMenu.value
}

function handleLocaleChange(newLocale: string) {
  setLocale(newLocale)
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
