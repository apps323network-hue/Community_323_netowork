<template>
  <footer class="hidden lg:block bg-surface-light dark:bg-surface-dark border-t border-gray-200 dark:border-gray-800 mt-auto py-4 sm:py-6 relative overflow-hidden">
    <div class="absolute top-0 left-1/2 transform -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-secondary to-transparent opacity-50"></div>
    
    <div class="max-w-[1440px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 text-center relative z-10">
      <div class="flex justify-center items-center gap-1 sm:gap-2 mb-3 sm:mb-4">
        <span class="text-secondary text-lg sm:text-xl font-black text-glow-blue whitespace-nowrap">(323</span>
        <span class="material-icons-outlined text-secondary animate-pulse text-base sm:text-lg">play_arrow</span>
        <span class="bg-clip-text text-transparent bg-neon-gradient text-lg sm:text-xl font-black whitespace-nowrap">NETWORK</span>
      </div>
      
      <p class="text-slate-500 dark:text-gray-400 text-xs sm:text-sm mb-3 sm:mb-4 max-w-md mx-auto px-2 font-medium">
        {{ t('footer.description') }}
      </p>

      <!-- Legal Links -->
      <div class="flex flex-wrap justify-center items-center gap-3 sm:gap-6 mb-4 sm:mb-5">
        <RouterLink 
          :to="{ name: 'Terms' }" 
          class="relative px-3 py-1 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 hover:text-primary transition-all duration-300 group overflow-hidden rounded-lg hover:bg-primary/5 border border-transparent hover:border-primary/20"
        >
          <span class="relative z-10">{{ t('auth.terms') }}</span>
          <div class="absolute inset-0 bg-primary/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
        </RouterLink>
        
        <span class="text-slate-300 dark:text-slate-700 hidden sm:inline">•</span>
        
        <RouterLink 
          :to="{ name: 'PrivacyPolicy' }" 
          class="relative px-3 py-1 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 hover:text-secondary transition-all duration-300 group overflow-hidden rounded-lg hover:bg-secondary/5 border border-transparent hover:border-secondary/20"
        >
          <span class="relative z-10">{{ t('auth.privacyPolicy') }}</span>
          <div class="absolute inset-0 bg-secondary/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
        </RouterLink>
      </div>
      
      <div class="flex justify-center space-x-4 sm:space-x-6 mb-3 sm:mb-4">
        <a href="#" class="text-gray-500 hover:text-secondary transition-colors transform hover:-translate-y-1">
          <span class="material-icons-outlined text-lg sm:text-xl">facebook</span>
        </a>
        <a href="#" class="text-gray-500 hover:text-primary transition-colors transform hover:-translate-y-1">
          <span class="material-icons-outlined text-lg sm:text-xl">photo_camera</span>
        </a>
        <RouterLink :to="{ name: 'ContactUs' }" class="text-gray-500 hover:text-white transition-colors transform hover:-translate-y-1">
          <span class="material-icons-outlined text-lg sm:text-xl">email</span>
        </RouterLink>
      </div>
      
      <p class="text-gray-600 dark:text-gray-500 text-xs px-2">
        © 2025 (323) Network. {{ t('footer.copyright') }}
      </p>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

