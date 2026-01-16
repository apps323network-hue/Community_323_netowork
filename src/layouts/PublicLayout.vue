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
              <LanguageSwitcher />
            </div>

            <!-- Mobile: Theme and Language -->
            <div class="md:hidden flex items-center gap-3">
              <AnimatedThemeToggler />
              <LanguageSwitcher />
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
import { RouterLink } from 'vue-router'
import PartnersFooter from '@/components/public/PartnersFooter.vue'
import AnimatedThemeToggler from '@/components/ui/AnimatedThemeToggler.vue'
import LanguageSwitcher from '@/components/ui/LanguageSwitcher.vue'
</script>

