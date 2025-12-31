<template>
  <section 
    id="what-we-do" 
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
          {{ t('landing.whatWeDo.title') }}
        </h2>
        <p class="text-lg text-slate-600 dark:text-gray-400 max-w-2xl mx-auto">
          {{ t('landing.whatWeDo.description') }}
        </p>
      </div>

      <!-- Features Grid with Staggered Animation -->
      <div ref="gridRef" class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div 
          v-for="(feature, index) in features" 
          :key="feature.title"
          class="feature-card group relative p-8 rounded-2xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-800 hover:border-primary/50 transition-all duration-500 hover:shadow-xl hover:shadow-primary/10"
          :class="{ 'revealed': cardsVisible }"
          :style="{ transitionDelay: `${index * 100}ms` }"
        >
          <!-- Icon -->
          <div class="icon-wrapper w-14 h-14 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 dark:from-primary/20 dark:to-secondary/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
            <span class="material-symbols-outlined text-3xl text-primary dark:text-secondary">
              {{ feature.icon }}
            </span>
          </div>

          <!-- Content -->
          <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-3">
            {{ t(feature.title) }}
          </h3>
          <p class="text-slate-600 dark:text-gray-400 leading-relaxed">
            {{ t(feature.description) }}
          </p>

          <!-- Glow Effect on Hover -->
          <div class="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/0 via-primary/5 to-secondary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
          
          <!-- Corner accent -->
          <div class="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-primary/10 to-transparent rounded-tr-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
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

const features = [
  {
    icon: 'celebration',
    title: 'landing.whatWeDo.features.events.title',
    description: 'landing.whatWeDo.features.events.description',
  },
  {
    icon: 'groups',
    title: 'landing.whatWeDo.features.community.title',
    description: 'landing.whatWeDo.features.community.description',
  },
  {
    icon: 'work',
    title: 'landing.whatWeDo.features.opportunities.title',
    description: 'landing.whatWeDo.features.opportunities.description',
  },
  {
    icon: 'redeem',
    title: 'landing.whatWeDo.features.benefits.title',
    description: 'landing.whatWeDo.features.benefits.description',
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
/* Section reveal animation */
.section-reveal {
  opacity: 0;
  transform: translateY(40px);
  transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1),
              transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

.section-reveal.revealed {
  opacity: 1;
  transform: translateY(0);
}

/* Feature card staggered animation with blur */
.feature-card {
  opacity: 0;
  transform: translateY(50px) scale(0.95);
  filter: blur(10px);
  transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1),
              transform 0.8s cubic-bezier(0.16, 1, 0.3, 1),
              filter 0.8s cubic-bezier(0.16, 1, 0.3, 1),
              border-color 0.3s ease,
              box-shadow 0.3s ease;
}

.feature-card.revealed {
  opacity: 1;
  transform: translateY(0) scale(1);
  filter: blur(0);
}

/* Hover lift effect with enhanced shadow */
.feature-card:hover {
  transform: translateY(-10px) scale(1.02);
}

/* Icon animation on card hover */
.feature-card:hover .icon-wrapper {
  animation: icon-bounce 0.6s ease;
}

@keyframes icon-bounce {
  0%, 100% { transform: scale(1.1); }
  50% { transform: scale(1.2); }
}

/* Reduce motion for accessibility */
@media (prefers-reduced-motion: reduce) {
  .section-reveal,
  .feature-card {
    opacity: 1;
    transform: none;
    transition: border-color 0.3s ease, box-shadow 0.3s ease;
  }
  
  .feature-card:hover .icon-wrapper {
    animation: none;
  }
}
</style>
