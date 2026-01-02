<template>
  <section 
    id="about"
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
          {{ t('partners.about.title') }}
        </h2>
        <div class="w-24 h-1 bg-neon-gradient mx-auto rounded-full"></div>
      </div>

      <!-- Description -->
      <div 
        ref="descriptionRef"
        class="max-w-4xl mx-auto mb-12 section-reveal"
        :class="{ 'revealed': descriptionVisible }"
        style="transition-delay: 0.1s"
      >
        <p class="text-lg sm:text-xl text-slate-700 dark:text-gray-300 leading-relaxed mb-6">
          {{ t('partners.about.description1') }}
        </p>
        <p class="text-lg sm:text-xl text-slate-700 dark:text-gray-300 leading-relaxed">
          {{ t('partners.about.description2') }}
        </p>
      </div>

      <!-- What We Do -->
      <div class="mt-16">
        <h3 
          ref="whatWeDoHeaderRef"
          class="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-8 text-center section-reveal"
          :class="{ 'revealed': whatWeDoHeaderVisible }"
        >
          {{ t('partners.about.whatWeDo') }}
        </h3>
        <div 
          ref="whatWeDoGridRef"
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <div
            v-for="(item, index) in whatWeDoItems"
            :key="index"
            class="feature-card bg-slate-50 dark:bg-surface-lighter rounded-xl p-6 border border-slate-200 dark:border-slate-800 hover:border-primary/50 transition-all duration-500 hover:shadow-xl hover:shadow-primary/10"
            :class="{ 'revealed': cardsVisible }"
            :style="{ transitionDelay: `${index * 100}ms` }"
          >
            <div class="icon-wrapper w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <span class="material-icons-outlined text-white text-2xl">{{ item.icon }}</span>
            </div>
            <h4 class="text-lg font-bold text-slate-900 dark:text-white mb-2">
              {{ t(`partners.about.items.${item.key}.title`) }}
            </h4>
            <p class="text-slate-600 dark:text-gray-400 text-sm leading-relaxed">
              {{ t(`partners.about.items.${item.key}.description`) }}
            </p>
            
            <!-- Glow Effect on Hover -->
            <div class="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/0 via-primary/5 to-secondary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
          </div>
        </div>
      </div>

      <!-- Statistics -->
      <div 
        ref="statsRef"
        class="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6"
      >
        <div
          v-for="(stat, index) in statistics"
          :key="index"
          class="stat-card text-center bg-slate-50 dark:bg-surface-lighter rounded-xl p-6 border border-slate-200 dark:border-slate-800 hover:border-primary/50 transition-all duration-300 group hover:shadow-lg hover:shadow-primary/10"
          :class="{ 'revealed': statsVisible }"
          :style="{ transitionDelay: `${index * 100}ms` }"
        >
          <div class="text-3xl sm:text-4xl md:text-5xl font-black bg-clip-text text-transparent bg-neon-gradient mb-2">
            {{ stat.value }}
          </div>
          <div class="text-sm sm:text-base text-slate-600 dark:text-gray-400 font-medium">
            {{ t(`partners.about.stats.${stat.key}`) }}
          </div>
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
const descriptionRef = ref<HTMLElement | null>(null)
const whatWeDoHeaderRef = ref<HTMLElement | null>(null)
const whatWeDoGridRef = ref<HTMLElement | null>(null)
const statsRef = ref<HTMLElement | null>(null)

const headerVisible = ref(false)
const descriptionVisible = ref(false)
const whatWeDoHeaderVisible = ref(false)
const cardsVisible = ref(false)
const statsVisible = ref(false)

let observer: IntersectionObserver | null = null

const whatWeDoItems = [
  { key: 'artists', icon: 'mic' },
  { key: 'events', icon: 'event' },
  { key: 'projects', icon: 'rocket_launch' },
  { key: 'content', icon: 'campaign' },
]

const statistics = [
  { key: 'members', value: '5000+' },
  { key: 'events', value: '50+' },
  { key: 'cities', value: '10+' },
  { key: 'years', value: '3+' },
]

onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (entry.target === headerRef.value) {
            headerVisible.value = true
          }
          if (entry.target === descriptionRef.value) {
            descriptionVisible.value = true
          }
          if (entry.target === whatWeDoHeaderRef.value) {
            whatWeDoHeaderVisible.value = true
          }
          if (entry.target === whatWeDoGridRef.value) {
            cardsVisible.value = true
          }
          if (entry.target === statsRef.value) {
            statsVisible.value = true
          }
          observer?.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.15 }
  )

  if (headerRef.value) observer.observe(headerRef.value)
  if (descriptionRef.value) observer.observe(descriptionRef.value)
  if (whatWeDoHeaderRef.value) observer.observe(whatWeDoHeaderRef.value)
  if (whatWeDoGridRef.value) observer.observe(whatWeDoGridRef.value)
  if (statsRef.value) observer.observe(statsRef.value)
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
  filter: blur(8px);
  transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1),
              transform 0.8s cubic-bezier(0.16, 1, 0.3, 1),
              filter 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

.section-reveal.revealed {
  opacity: 1;
  transform: translateY(0);
  filter: blur(0);
}

/* Feature card staggered animation with blur */
.feature-card {
  position: relative;
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
  .feature-card,
  .stat-card {
    opacity: 1;
    transform: none;
    filter: none;
    transition: border-color 0.3s ease, box-shadow 0.3s ease;
  }
  
  .feature-card:hover .icon-wrapper {
    animation: none;
  }
}
</style>

