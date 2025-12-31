<template>
  <section 
    id="benefits" 
    ref="sectionRef"
    class="relative py-20 lg:py-32 bg-slate-50 dark:bg-background-dark"
  >
    <div class="container mx-auto px-6">
      <!-- Section Header -->
      <div 
        ref="headerRef"
        class="text-center mb-16 section-reveal"
        :class="{ 'revealed': headerVisible }"
      >
        <h2 class="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-4">
          {{ t('landing.benefits.title') }}
        </h2>
        <p class="text-lg text-slate-600 dark:text-gray-400 max-w-2xl mx-auto">
          {{ t('landing.benefits.description') }}
        </p>
      </div>

      <!-- Benefits Grid -->
      <div ref="gridRef" class="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        <div 
          v-for="(benefit, index) in benefits" 
          :key="index"
          class="benefit-card group relative p-8 rounded-2xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-800 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10"
          :class="{ 'revealed': cardsVisible }"
          :style="{ transitionDelay: `${index * 80}ms` }"
        >
          <!-- Icon -->
          <div 
            class="icon-container w-12 h-12 rounded-xl flex items-center justify-center mb-6"
            :class="benefit.iconBg"
          >
            <span class="material-symbols-outlined text-2xl" :class="benefit.iconColor">
              {{ benefit.icon }}
            </span>
          </div>

          <!-- Content -->
          <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-3">
            {{ t(benefit.title) }}
          </h3>
          <p class="text-slate-600 dark:text-gray-400 leading-relaxed">
            {{ t(benefit.description) }}
          </p>

          <!-- Decorative -->
          <div class="decorative-icon absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-all duration-500">
            <span class="material-symbols-outlined text-6xl text-primary">{{ benefit.icon }}</span>
          </div>
          
          <!-- Glow effect on hover -->
          <div class="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/0 via-primary/5 to-secondary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
        </div>
      </div>

      <!-- Upgrade CTA -->
      <div 
        ref="ctaRef"
        class="cta-reveal mt-16 p-8 md:p-12 rounded-3xl bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 dark:from-primary/20 dark:via-secondary/20 dark:to-primary/20 border border-primary/20"
        :class="{ 'revealed': ctaVisible }"
      >
        <div class="flex flex-col lg:flex-row items-center justify-between gap-6 text-center lg:text-left">
          <div>
            <h3 class="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2">
              {{ t('landing.benefits.cta.title') }}
            </h3>
            <p class="text-slate-600 dark:text-gray-400">
              {{ t('landing.benefits.cta.description') }}
            </p>
          </div>
          <router-link to="/login">
            <Button variant="primary" size="lg" class="whitespace-nowrap btn-pulse">
              {{ t('landing.benefits.cta.button') }}
              <span class="material-symbols-outlined text-lg ml-2">rocket_launch</span>
            </Button>
          </router-link>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import Button from '@/components/ui/Button.vue'

const { t } = useI18n()

const sectionRef = ref<HTMLElement | null>(null)
const headerRef = ref<HTMLElement | null>(null)
const gridRef = ref<HTMLElement | null>(null)
const ctaRef = ref<HTMLElement | null>(null)

const headerVisible = ref(false)
const cardsVisible = ref(false)
const ctaVisible = ref(false)

let observer: IntersectionObserver | null = null

const benefits = [
  {
    icon: 'diversity_3',
    iconBg: 'bg-primary/10 dark:bg-primary/20',
    iconColor: 'text-primary',
    title: 'landing.benefits.items.networking.title',
    description: 'landing.benefits.items.networking.description',
  },
  {
    icon: 'event',
    iconBg: 'bg-secondary/10 dark:bg-secondary/20',
    iconColor: 'text-secondary dark:text-secondary',
    title: 'landing.benefits.items.events.title',
    description: 'landing.benefits.items.events.description',
  },
  {
    icon: 'loyalty',
    iconBg: 'bg-green-500/10 dark:bg-green-500/20',
    iconColor: 'text-green-500',
    title: 'landing.benefits.items.discounts.title',
    description: 'landing.benefits.items.discounts.description',
  },
  {
    icon: 'school',
    iconBg: 'bg-blue-500/10 dark:bg-blue-500/20',
    iconColor: 'text-blue-500',
    title: 'landing.benefits.items.content.title',
    description: 'landing.benefits.items.content.description',
  },
  {
    icon: 'support_agent',
    iconBg: 'bg-orange-500/10 dark:bg-orange-500/20',
    iconColor: 'text-orange-500',
    title: 'landing.benefits.items.support.title',
    description: 'landing.benefits.items.support.description',
  },
  {
    icon: 'verified',
    iconBg: 'bg-purple-500/10 dark:bg-purple-500/20',
    iconColor: 'text-purple-500',
    title: 'landing.benefits.items.badge.title',
    description: 'landing.benefits.items.badge.description',
  },
]

onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (entry.target === headerRef.value) {
            headerVisible.value = true
          }
          if (entry.target === gridRef.value) {
            cardsVisible.value = true
          }
          if (entry.target === ctaRef.value) {
            ctaVisible.value = true
          }
          observer?.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.15 }
  )

  if (headerRef.value) observer.observe(headerRef.value)
  if (gridRef.value) observer.observe(gridRef.value)
  if (ctaRef.value) observer.observe(ctaRef.value)
})

onUnmounted(() => {
  observer?.disconnect()
})
</script>

<style scoped>
/* Section header reveal - blur from bottom */
.section-reveal {
  opacity: 0;
  transform: translateY(50px);
  filter: blur(8px);
  transition: opacity 0.9s cubic-bezier(0.16, 1, 0.3, 1),
              transform 0.9s cubic-bezier(0.16, 1, 0.3, 1),
              filter 0.9s cubic-bezier(0.16, 1, 0.3, 1);
}

.section-reveal.revealed {
  opacity: 1;
  transform: translateY(0);
  filter: blur(0);
}

/* Benefit card - diagonal blur entrance */
.benefit-card {
  opacity: 0;
  transform: translateY(30px) translateX(-20px) scale(0.95);
  filter: blur(6px);
  transition: opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1),
              transform 0.7s cubic-bezier(0.16, 1, 0.3, 1),
              filter 0.7s cubic-bezier(0.16, 1, 0.3, 1),
              border-color 0.3s ease,
              box-shadow 0.3s ease;
}

.benefit-card.revealed {
  opacity: 1;
  transform: translateY(0) translateX(0) scale(1);
  filter: blur(0);
}

/* Hover lift with smooth transition */
.benefit-card:hover {
  transform: translateY(-8px) scale(1.02);
}

/* Icon container animation */
.icon-container {
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1),
              background 0.3s ease;
}

.benefit-card:hover .icon-container {
  transform: scale(1.15) rotate(5deg);
}

/* Decorative icon blur animation */
.decorative-icon {
  filter: blur(2px);
  transition: opacity 0.5s ease, filter 0.5s ease, transform 0.5s ease;
}

.benefit-card:hover .decorative-icon {
  filter: blur(0);
  transform: scale(1.1) rotate(-3deg);
}

/* CTA reveal - scale with blur */
.cta-reveal {
  opacity: 0;
  transform: scale(0.92);
  filter: blur(10px);
  transition: opacity 1s cubic-bezier(0.16, 1, 0.3, 1),
              transform 1s cubic-bezier(0.16, 1, 0.3, 1),
              filter 1s cubic-bezier(0.16, 1, 0.3, 1);
}

.cta-reveal.revealed {
  opacity: 1;
  transform: scale(1);
  filter: blur(0);
}

/* Button pulse animation */
.btn-pulse {
  animation: pulse-subtle 2.5s ease-in-out infinite;
}

@keyframes pulse-subtle {
  0%, 100% { 
    box-shadow: 0 0 0 0 rgba(var(--color-primary-rgb, 234, 98, 29), 0.4);
  }
  50% { 
    box-shadow: 0 0 0 10px rgba(var(--color-primary-rgb, 234, 98, 29), 0);
  }
}

/* Reduce motion for accessibility */
@media (prefers-reduced-motion: reduce) {
  .section-reveal,
  .benefit-card,
  .cta-reveal {
    opacity: 1;
    transform: none;
    filter: none;
    transition: border-color 0.3s ease, box-shadow 0.3s ease;
  }
  
  .btn-pulse {
    animation: none;
  }
  
  .benefit-card:hover .icon-container,
  .benefit-card:hover .decorative-icon {
    transform: none;
  }
}
</style>
