<template>
  <section 
    id="benefits"
    ref="sectionRef"
    class="py-16 sm:py-20 md:py-24 bg-white dark:bg-surface-dark"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Title -->
      <div 
        ref="headerRef"
        class="text-center mb-12 md:mb-16 section-reveal"
        :class="{ 'revealed': headerVisible }"
      >
        <h2 class="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4">
          {{ t('partners.benefits.title') }}
        </h2>
        <p class="text-lg text-slate-600 dark:text-gray-400 max-w-2xl mx-auto">
          {{ t('partners.benefits.description') }}
        </p>
        <div class="w-24 h-1 bg-neon-gradient mx-auto rounded-full mt-4"></div>
      </div>

      <!-- Benefits Grid -->
      <div 
        ref="gridRef"
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
      >
        <div
          v-for="(benefit, index) in benefits"
          :key="index"
          class="benefit-card group relative bg-slate-50 dark:bg-surface-lighter rounded-xl p-6 border border-slate-200 dark:border-slate-800 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10"
          :class="{ 'revealed': cardsVisible }"
          :style="{ transitionDelay: `${index * 80}ms` }"
        >
          <div 
            class="icon-container w-14 h-14 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center mb-4"
          >
            <span class="material-icons-outlined text-white text-3xl">{{ benefit.icon }}</span>
          </div>
          <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-2">
            {{ t(`partners.benefits.items.${benefit.key}.title`) }}
          </h3>
          <p class="text-slate-600 dark:text-gray-400 leading-relaxed">
            {{ t(`partners.benefits.items.${benefit.key}.description`) }}
          </p>

          <!-- Decorative -->
          <div class="decorative-icon absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-all duration-500">
            <span class="material-icons-outlined text-6xl text-primary">{{ benefit.icon }}</span>
          </div>
          
          <!-- Glow effect on hover -->
          <div class="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/0 via-primary/5 to-secondary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const sectionRef = ref<HTMLElement | null>(null)
const headerRef = ref<HTMLElement | null>(null)
const gridRef = ref<HTMLElement | null>(null)

const headerVisible = ref(false)
const cardsVisible = ref(false)

let observer: IntersectionObserver | null = null

const benefits = [
  { key: 'niche', icon: 'target' },
  { key: 'purchasing', icon: 'trending_up' },
  { key: 'regular', icon: 'event_repeat' },
  { key: 'activation', icon: 'qr_code_scanner' },
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
          observer?.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.15 }
  )

  if (headerRef.value) observer.observe(headerRef.value)
  if (gridRef.value) observer.observe(gridRef.value)
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

/* Reduce motion for accessibility */
@media (prefers-reduced-motion: reduce) {
  .section-reveal,
  .benefit-card {
    opacity: 1;
    transform: none;
    filter: none;
    transition: border-color 0.3s ease, box-shadow 0.3s ease;
  }
  
  .benefit-card:hover .icon-container,
  .benefit-card:hover .decorative-icon {
    transform: none;
  }
}
</style>

