<template>
  <div class="min-h-screen bg-slate-50 dark:bg-background-dark overflow-hidden scroll-smooth">
    <!-- Grain Overlay for premium texture -->
    <GrainOverlay subtle />

    <!-- Header -->
    <AppHeader :show-navigation="false" />

    <!-- Content -->
    <main class="relative">
      <!-- Animated Background -->
      <div class="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div
          class="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-secondary/10 dark:bg-secondary/20 rounded-full mix-blend-screen filter blur-[120px] animate-glow"
        ></div>
        <div
          class="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-primary/10 dark:bg-primary/20 rounded-full mix-blend-screen filter blur-[120px] animate-glow"
          style="animation-delay: 2.5s"
        ></div>
        <div
          class="absolute top-[40%] left-[50%] w-[400px] h-[400px] bg-primary/5 dark:bg-primary/10 rounded-full mix-blend-screen filter blur-[100px] animate-float"
        ></div>
      </div>

      <!-- Sections -->
      <HeroSection />
      <AboutSection />
      <WhatWeDoSection />
      <EventsShowcaseSection />
      <PortfolioSection />
      <BenefitsSection />
      <TestimonialsSection />
      <FinalCTASection />
      <LandingFooter />
    </main>
  </div>
</template>

<script setup lang="ts">
import AppHeader from '@/components/layout/AppHeader.vue'
import GrainOverlay from '@/components/ui/GrainOverlay.vue'
import HeroSection from '@/components/landing/HeroSection.vue'
import AboutSection from '@/components/landing/AboutSection.vue'
import WhatWeDoSection from '@/components/landing/WhatWeDoSection.vue'
import EventsShowcaseSection from '@/components/landing/EventsShowcaseSection.vue'
import PortfolioSection from '@/components/landing/PortfolioSection.vue'
import BenefitsSection from '@/components/landing/BenefitsSection.vue'
import TestimonialsSection from '@/components/landing/TestimonialsSection.vue'
import FinalCTASection from '@/components/landing/FinalCTASection.vue'
import LandingFooter from '@/components/landing/LandingFooter.vue'
import { useDynamicMeta } from '@/composables/useDynamicMeta'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

// SEO
useDynamicMeta(() => ({
  title: 'Comunidade 323 Network | Conectando brasileiros nos EUA',
  description: 'A maior rede de networking e negócios para brasileiros morando ou vindo para os Estados Unidos. Mentoria, eventos e comunidade.',
  url: '/brasileiro-nos-eua'
}))
</script>

<style scoped>
@keyframes pulse-glow {
  0%,
  100% {
    opacity: 0.8;
    filter: blur(100px);
    transform: scale(1);
  }
  50% {
    opacity: 0.4;
    filter: blur(140px);
    transform: scale(1.2);
  }
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0) translateX(-50%);
  }
  50% {
    transform: translateY(-30px) translateX(-50%);
  }
}

.animate-glow {
  animation: pulse-glow 8s infinite ease-in-out;
}

.animate-float {
  animation: float 12s infinite ease-in-out;
}
</style>
