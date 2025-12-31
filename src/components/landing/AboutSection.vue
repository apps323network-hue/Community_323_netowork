<template>
  <section 
    id="about" 
    ref="sectionRef"
    class="relative py-20 lg:py-32 bg-white dark:bg-surface-dark"
  >
    <div class="container mx-auto px-6">
      <!-- Section Header -->
      <div 
        ref="headerRef"
        class="text-center mb-16 section-reveal"
        :class="{ 'revealed': headerVisible }"
      >
        <h2 class="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-4">
          {{ t('landing.about.title1') }}
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
            {{ t('landing.about.title2') }}
          </span>
        </h2>
        <p class="text-lg text-slate-600 dark:text-gray-400 max-w-2xl mx-auto">
          {{ t('landing.about.description') }}
        </p>
      </div>

      <!-- Stats Grid with Animated Counters -->
      <div ref="statsRef" class="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-16">
        <div 
          v-for="(stat, index) in stats" 
          :key="stat.label"
          class="stat-card text-center p-6 lg:p-8 rounded-2xl bg-slate-50 dark:bg-surface-lighter border border-slate-200 dark:border-slate-800 hover:border-primary/50 transition-all duration-300 group hover:shadow-lg hover:shadow-primary/10"
          :class="{ 'revealed': statsVisible }"
          :style="{ transitionDelay: `${index * 100}ms` }"
        >
          <div class="text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary mb-2">
            {{ animatedValues[index] }}{{ stat.suffix || '' }}
          </div>
          <div class="text-sm lg:text-base text-slate-600 dark:text-gray-400 font-medium">
            {{ t(stat.label) }}
          </div>
        </div>
      </div>

      <!-- Partners Section -->
      <div 
        ref="partnersRef"
        class="text-center section-reveal"
        :class="{ 'revealed': partnersVisible }"
      >
        <p class="text-sm text-slate-500 dark:text-gray-500 uppercase tracking-wider mb-6 font-medium">
          {{ t('landing.about.partnersTitle') }}
        </p>
        <div class="flex flex-wrap justify-center items-center gap-8 lg:gap-12 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
          <div class="w-24 h-12 bg-slate-300 dark:bg-slate-700 rounded flex items-center justify-center text-xs text-slate-500 dark:text-slate-400">BR News</div>
          <div class="w-24 h-12 bg-slate-300 dark:bg-slate-700 rounded flex items-center justify-center text-xs text-slate-500 dark:text-slate-400">Brazilian Times</div>
          <div class="w-24 h-12 bg-slate-300 dark:bg-slate-700 rounded flex items-center justify-center text-xs text-slate-500 dark:text-slate-400">Media 3</div>
          <div class="w-24 h-12 bg-slate-300 dark:bg-slate-700 rounded flex items-center justify-center text-xs text-slate-500 dark:text-slate-400">Media 4</div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, reactive } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const sectionRef = ref<HTMLElement | null>(null)
const headerRef = ref<HTMLElement | null>(null)
const statsRef = ref<HTMLElement | null>(null)
const partnersRef = ref<HTMLElement | null>(null)

const headerVisible = ref(false)
const statsVisible = ref(false)
const partnersVisible = ref(false)

const stats = [
  { value: 15, suffix: '+', label: 'landing.about.stats.events' },
  { value: 1500, suffix: '+', label: 'landing.about.stats.participants' },
  { value: 150, suffix: '+', label: 'landing.about.stats.artists' },
  { value: 10, suffix: '+', label: 'landing.about.stats.years' },
]

// Animated counter values
const animatedValues = reactive([0, 0, 0, 0])

let observer: IntersectionObserver | null = null
let animationFrames: number[] = []

function animateCounter(index: number, targetValue: number, duration: number = 2000) {
  const startTime = performance.now()
  const startValue = 0

  function animate(currentTime: number) {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    
    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3)
    animatedValues[index] = Math.round(startValue + (targetValue - startValue) * eased)

    if (progress < 1) {
      animationFrames[index] = requestAnimationFrame(animate)
    } else {
      animatedValues[index] = targetValue
    }
  }

  animationFrames[index] = requestAnimationFrame(animate)
}

function startCounterAnimations() {
  stats.forEach((stat, index) => {
    setTimeout(() => {
      animateCounter(index, stat.value)
    }, index * 150)
  })
}

onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (entry.target === headerRef.value) {
            headerVisible.value = true
          }
          if (entry.target === statsRef.value) {
            statsVisible.value = true
            startCounterAnimations()
          }
          if (entry.target === partnersRef.value) {
            partnersVisible.value = true
          }
          observer?.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.2 }
  )

  if (headerRef.value) observer.observe(headerRef.value)
  if (statsRef.value) observer.observe(statsRef.value)
  if (partnersRef.value) observer.observe(partnersRef.value)
})

onUnmounted(() => {
  observer?.disconnect()
  animationFrames.forEach((frame) => cancelAnimationFrame(frame))
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

/* Stat card staggered animation with blur */
.stat-card {
  opacity: 0;
  transform: translateY(40px) scale(0.9);
  filter: blur(12px);
  transition: opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1),
              transform 0.7s cubic-bezier(0.16, 1, 0.3, 1),
              filter 0.7s cubic-bezier(0.16, 1, 0.3, 1),
              border-color 0.3s ease,
              box-shadow 0.3s ease;
}

.stat-card.revealed {
  opacity: 1;
  transform: translateY(0) scale(1);
  filter: blur(0);
}

/* Hover effect enhancement with glow */
.stat-card:hover {
  transform: translateY(-6px) scale(1.03);
  box-shadow: 0 20px 40px -10px rgba(var(--color-primary-rgb, 234, 98, 29), 0.2);
}

/* Reduce motion for accessibility */
@media (prefers-reduced-motion: reduce) {
  .section-reveal,
  .stat-card {
    opacity: 1;
    transform: none;
    transition: border-color 0.3s ease, box-shadow 0.3s ease;
  }
}
</style>
