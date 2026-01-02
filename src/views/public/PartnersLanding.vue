<template>
  <div class="min-h-screen bg-slate-50 dark:bg-background-dark overflow-hidden scroll-smooth">
    <!-- Grain Overlay for premium texture -->
    <GrainOverlay subtle />

    <PublicLayout>
      <!-- Animated Background -->
      <div class="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div
          class="absolute top-[-15%] right-[-5%] w-[650px] h-[650px] bg-secondary/12 dark:bg-secondary/25 rounded-full mix-blend-screen filter blur-[130px] animate-glow"
        ></div>
        <div
          class="absolute bottom-[-15%] left-[-5%] w-[650px] h-[650px] bg-primary/12 dark:bg-primary/25 rounded-full mix-blend-screen filter blur-[130px] animate-glow"
          style="animation-delay: 3s"
        ></div>
        <div
          class="absolute top-[50%] right-[20%] w-[450px] h-[450px] bg-primary/6 dark:bg-primary/12 rounded-full mix-blend-screen filter blur-[110px] animate-float"
        ></div>
        <div
          class="absolute bottom-[30%] left-[30%] w-[350px] h-[350px] bg-secondary/8 dark:bg-secondary/15 rounded-full mix-blend-screen filter blur-[90px] animate-float"
          style="animation-delay: 1.5s"
        ></div>
      </div>

      <!-- Content -->
      <main class="relative z-10">
        <!-- Hero Section -->
        <PartnersHero />

        <!-- About Section -->
        <PartnersAbout />

        <!-- Events Portfolio -->
        <PartnersEvents />

        <!-- Gallery -->
        <PartnersGallery />

        <!-- Videos Portfolio -->
        <PartnersVideos />

        <!-- Benefits -->
        <PartnersBenefits />

        <!-- Testimonials -->
        <PartnersTestimonials />

        <!-- Sponsorship Plans -->
        <PartnersPlans />

        <!-- Naming Rights -->
        <PartnersNamingRights />

        <!-- Final CTA -->
        <PartnersCTA />

        <!-- Contact Form -->
        <PartnersContactForm />
      </main>
    </PublicLayout>
  </div>
</template>

<script setup lang="ts">
import PublicLayout from '@/layouts/PublicLayout.vue'
import GrainOverlay from '@/components/ui/GrainOverlay.vue'
import PartnersHero from '@/components/public/PartnersHero.vue'
import PartnersAbout from '@/components/public/PartnersAbout.vue'
import PartnersEvents from '@/components/public/PartnersEvents.vue'
import PartnersGallery from '@/components/public/PartnersGallery.vue'
import PartnersVideos from '@/components/public/PartnersVideos.vue'
import PartnersBenefits from '@/components/public/PartnersBenefits.vue'
import PartnersTestimonials from '@/components/public/PartnersTestimonials.vue'
import PartnersPlans from '@/components/public/PartnersPlans.vue'
import PartnersNamingRights from '@/components/public/PartnersNamingRights.vue'
import PartnersCTA from '@/components/public/PartnersCTA.vue'
import PartnersContactForm from '@/components/public/PartnersContactForm.vue'
</script>

<style scoped>
@keyframes pulse-glow {
  0%,
  100% {
    opacity: 0.7;
    filter: blur(130px);
    transform: scale(1);
  }
  50% {
    opacity: 0.35;
    filter: blur(150px);
    transform: scale(1.15);
  }
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0) translateX(0);
  }
  50% {
    transform: translateY(-25px) translateX(15px);
  }
}

.animate-glow {
  animation: pulse-glow 9s infinite ease-in-out;
}

.animate-float {
  animation: float 14s infinite ease-in-out;
}

/* Reduce motion for accessibility */
@media (prefers-reduced-motion: reduce) {
  .animate-glow,
  .animate-float {
    animation: none;
  }
}
</style>

