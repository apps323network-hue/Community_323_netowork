<template>
  <footer class="bg-white dark:bg-surface-dark border-t border-slate-200 dark:border-white/10 py-12 sm:py-16">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <!-- Logo and Description -->
        <div class="space-y-4">
          <div class="flex items-center gap-2">
            <span class="text-primary dark:text-secondary text-2xl font-black">(323</span>
            <span class="material-icons-outlined text-primary dark:text-secondary animate-pulse text-lg">play_arrow</span>
            <span class="bg-clip-text text-transparent bg-neon-gradient text-2xl font-black">NETWORK</span>
          </div>
          <p class="text-slate-600 dark:text-gray-400 text-sm leading-relaxed">
            {{ t('partners.footer.description') }}
          </p>
        </div>

        <!-- Contact -->
        <div class="space-y-4">
          <h3 class="text-slate-900 dark:text-white font-bold text-lg">{{ t('partners.footer.contact') }}</h3>
          <div class="space-y-2 text-sm">
            <a
              :href="`https://wa.me/13239791990`"
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center gap-2 text-slate-600 dark:text-gray-400 hover:text-primary dark:hover:text-secondary transition-colors"
            >
              <span class="material-icons-outlined text-base">phone</span>
              WhatsApp: +1 (323) 979-1990
            </a>
            <a
              href="mailto:admin@323network.com"
              class="flex items-center gap-2 text-slate-600 dark:text-gray-400 hover:text-primary dark:hover:text-secondary transition-colors"
            >
              <span class="material-icons-outlined text-base">email</span>
              admin@323network.com
            </a>
          </div>
        </div>

        <!-- Social Media -->
        <div class="space-y-4">
          <h3 class="text-slate-900 dark:text-white font-bold text-lg">{{ t('partners.footer.social') }}</h3>
          <div class="flex gap-4">
            <a
              href="https://instagram.com/323network"
              target="_blank"
              rel="noopener noreferrer"
              class="w-10 h-10 flex items-center justify-center bg-slate-100 dark:bg-white/5 rounded-lg text-slate-600 dark:text-gray-400 hover:text-primary dark:hover:text-secondary hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
            >
              <span class="material-icons-outlined">photo_camera</span>
            </a>
          </div>
        </div>
      </div>

      <!-- Copyright -->
      <div class="pt-8 border-t border-slate-200 dark:border-white/10 text-center">
        <p class="text-slate-500 dark:text-gray-500 text-sm">
          © 2025 323 Network. {{ t('partners.footer.rights') }}
        </p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

