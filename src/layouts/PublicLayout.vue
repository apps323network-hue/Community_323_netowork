<template>
  <div class="min-h-screen bg-background-light dark:bg-background-dark flex flex-col">
    <!-- Public Header -->
    <header
      class="sticky top-0 z-50 bg-white/90 dark:bg-surface-dark/90 backdrop-blur-md border-b border-slate-200 dark:border-white/10 shadow-sm w-full"
    >
      <nav class="w-full mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div class="flex items-center justify-between h-20">
          <!-- Logo -->
          <RouterLink to="/parceiros" class="flex-shrink-0 flex items-center gap-2 cursor-pointer group">
            <div class="font-display font-extrabold tracking-tighter flex items-center transform group-hover:scale-105 transition-transform text-2xl">
              <span class="text-primary dark:text-secondary">(323</span>
              <span
                class="material-icons-outlined text-primary dark:text-secondary mx-1 animate-pulse"
                style="font-size: 1em"
              >play_arrow</span>
              <span
                class="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary font-extrabold"
              >NETWORK</span>
            </div>
          </RouterLink>

          <!-- Right Side - Theme and Language -->
          <div class="flex items-center gap-4">
            <!-- Desktop: Theme and Language -->
            <div class="hidden md:flex items-center gap-5">
              <AnimatedThemeToggler />
              
              <!-- Language Switcher -->
              <div class="relative" ref="languageMenuContainer">
                <button
                  @click.stop="toggleLanguageMenu"
                  class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-surface-lighter transition-colors"
                >
                  <span class="text-lg">{{ currentLocaleData.flag }}</span>
                  <span class="hidden lg:block">{{ currentLocaleData.code.split('-')[0].toUpperCase() }}</span>
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
            </div>

            <!-- Mobile: Theme and Language -->
            <div class="md:hidden flex items-center gap-3">
              <AnimatedThemeToggler />
              
              <!-- Language Switcher Mobile -->
              <div class="relative" ref="languageMenuContainerMobile">
                <button
                  @click.stop="toggleLanguageMenu"
                  class="flex items-center gap-1 px-2 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-surface-lighter transition-colors"
                >
                  <span class="text-lg">{{ currentLocaleData.flag }}</span>
                  <span class="material-icons text-sm">expand_more</span>
                </button>
                
                <!-- Language Dropdown Mobile -->
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
            </div>
          </div>
        </div>
      </nav>
    </header>

    <!-- Main Content -->
    <main class="flex-1">
      <slot />
    </main>

    <!-- Public Footer -->
    <PartnersFooter />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'
import PartnersFooter from '@/components/public/PartnersFooter.vue'
import AnimatedThemeToggler from '@/components/ui/AnimatedThemeToggler.vue'
import { useLocale } from '@/composables/useLocale'

const { locale: currentLocale, setLocale, availableLocales } = useLocale()

const showLanguageMenu = ref(false)
const languageMenuContainer = ref<HTMLElement | null>(null)
const languageMenuContainerMobile = ref<HTMLElement | null>(null)

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

function handleClickOutside(event: MouseEvent) {
  if (languageMenuContainer.value && !languageMenuContainer.value.contains(event.target as Node)) {
    showLanguageMenu.value = false
  }
  if (languageMenuContainerMobile.value && !languageMenuContainerMobile.value.contains(event.target as Node)) {
    showLanguageMenu.value = false
  }
}

onMounted(() => {
  setTimeout(() => {
    document.addEventListener('click', handleClickOutside)
  }, 0)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

