<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-500 overflow-hidden">
    <!-- Header -->
    <AppHeader :show-navigation="false" />

    <!-- 404 Content -->
    <div class="w-full relative flex min-h-[calc(100vh-80px)] items-center justify-center overflow-hidden text-slate-900 dark:text-white">
      <!-- Radial gradient background -->
      <div 
        class="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(234,98,29,0.08),transparent_70%)] dark:bg-[radial-gradient(circle_at_center,rgba(234,98,29,0.12),transparent_70%)]"
      ></div>
      
      <!-- Animated background orbs -->
      <div aria-hidden="true" class="-z-10 absolute inset-0 overflow-hidden">
        <!-- Primary orb -->
        <div 
          class="orb-primary absolute top-1/2 left-1/3 h-64 w-64 rounded-full bg-gradient-to-tr from-primary/10 to-secondary/10 dark:from-primary/20 dark:to-secondary/20 blur-3xl"
        ></div>
        <!-- Secondary orb -->
        <div 
          class="orb-secondary absolute right-1/4 bottom-1/3 h-72 w-72 rounded-full bg-gradient-to-br from-secondary/5 to-primary/5 dark:from-secondary/10 dark:to-primary/10 blur-3xl"
        ></div>
      </div>

      <!-- Content -->
      <div class="flex min-w-0 flex-1 flex-col items-center justify-center gap-6 p-6 text-center md:p-12 z-10">
        <!-- Header -->
        <div class="flex max-w-sm flex-col items-center gap-4 text-center">
          <!-- 404 Title -->
          <h1 
            class="font-black text-8xl md:text-9xl text-transparent bg-clip-text bg-gradient-to-r from-primary via-slate-800 dark:via-white to-secondary animate-gradient-title"
          >
            404
          </h1>
          <!-- Description -->
          <p class="text-slate-600 dark:text-gray-400 text-lg font-medium">
            {{ t('errors.notFoundMessage') }}
          </p>
        </div>

        <!-- Actions -->
        <div class="flex flex-col sm:flex-row gap-3 mt-4">
          <router-link to="/">
            <Button variant="primary" size="lg" class="min-w-[180px] group shadow-lg shadow-primary/20">
              <span class="flex items-center gap-2">
                <span class="material-symbols-outlined text-xl">home</span>
                {{ t('errors.goHome') }}
              </span>
            </Button>
          </router-link>


        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import AppHeader from '@/components/layout/AppHeader.vue'
import Button from '@/components/ui/Button.vue'

const { t } = useI18n()
</script>

<style scoped>
/* Orb animations */
@keyframes orb-float-primary {
  0%, 100% {
    transform: translate(0, 0) rotate(0deg);
  }
  25% {
    transform: translate(40px, 20px) rotate(10deg);
  }
  50% {
    transform: translate(-40px, -20px) rotate(-10deg);
  }
  75% {
    transform: translate(40px, -20px) rotate(5deg);
  }
}

@keyframes orb-float-secondary {
  0%, 100% {
    transform: translate(0, 0);
  }
  25% {
    transform: translate(-40px, -20px);
  }
  50% {
    transform: translate(40px, 20px);
  }
  75% {
    transform: translate(-40px, 20px);
  }
}

@keyframes gradient-shift {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

.orb-primary {
  animation: orb-float-primary 12s ease-in-out infinite;
}

.orb-secondary {
  animation: orb-float-secondary 15s ease-in-out infinite;
}

.animate-gradient-title {
  background-size: 200% auto;
  animation: gradient-shift 4s ease-in-out infinite;
}

/* Reduce motion for accessibility */
@media (prefers-reduced-motion: reduce) {
  .orb-primary,
  .orb-secondary,
  .animate-gradient-title {
    animation: none;
  }
}
</style>
