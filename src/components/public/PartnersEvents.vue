<template>
  <section 
    id="events"
    ref="sectionRef"
    class="py-16 sm:py-20 md:py-24 bg-slate-900 dark:bg-background-dark overflow-hidden"
  >
    <!-- Background Decoration -->
    <div class="absolute top-0 right-0 w-1/3 h-1/2 bg-gradient-to-bl from-primary/5 to-transparent dark:from-primary/10 rounded-bl-[200px] pointer-events-none"></div>
    
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <!-- Title -->
      <div 
        ref="headerRef"
        class="text-center mb-12 md:mb-16 section-header"
        :class="{ 'revealed': headerVisible }"
      >
        <h2 class="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4">
          {{ t('partners.events.title') }}
        </h2>
        <p class="text-lg text-gray-300 max-w-2xl mx-auto">
          {{ t('partners.events.description') }}
        </p>
        <div class="w-24 h-1 bg-neon-gradient mx-auto rounded-full mt-4"></div>
      </div>

      <!-- Events Grid -->
      <div 
        ref="gridRef"
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
      >
        <div
          v-for="(event, index) in placeholderEvents"
          :key="index"
          class="event-card bg-slate-800 dark:bg-surface-lighter rounded-xl overflow-hidden border border-slate-700 dark:border-slate-800 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 group"
          :class="{ 'revealed': cardsVisible }"
          :style="{ transitionDelay: `${index * 120}ms` }"
        >
          <!-- Event Image -->
          <div class="relative h-48 bg-gradient-to-br from-primary/20 to-secondary/20 overflow-hidden">
            <img
              v-if="event.image"
              :src="event.image"
              :alt="event.title"
              class="event-image w-full h-full object-cover"
            />
            <div
              v-else
              class="absolute inset-0 flex items-center justify-center"
            >
              <span class="material-icons-outlined text-6xl text-primary/30">event</span>
            </div>
            
            <!-- Shimmer effect on hover -->
            <div class="shimmer-effect absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none"></div>
          </div>

          <!-- Event Content -->
          <div class="event-content p-6">
            <div class="flex items-center gap-2 mb-2">
              <span class="material-icons-outlined text-primary text-sm">calendar_month</span>
              <span class="text-sm text-gray-300 font-medium">
                {{ event.date }}
              </span>
            </div>
            <h3 class="text-xl font-bold text-white mb-2 group-hover:text-primary transition-colors">
              {{ event.title }}
            </h3>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="material-icons-outlined text-gray-400 text-sm">location_on</span>
                <span class="text-sm text-gray-300">
                  {{ event.location }}
                </span>
              </div>
              <span
                class="px-3 py-1 bg-primary/20 text-primary rounded-full text-xs font-bold"
              >
                {{ event.type }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State (quando não houver eventos) -->
      <div
        v-if="placeholderEvents.length === 0"
        class="text-center py-12"
      >
        <span class="material-icons-outlined text-6xl text-gray-600 mb-4 block">event_busy</span>
        <p class="text-gray-400">
          {{ t('partners.events.noEvents') }}
        </p>
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

// Eventos com imagens reais
const placeholderEvents = [
  {
    title: 'Networking Event - Los Angeles',
    date: '15 Jan 2025',
    location: 'Los Angeles, California',
    type: 'Presencial',
    image: '/event-griffith-DJdTtNs_.jpg',
  },
  {
    title: 'Workshop: American Dream',
    date: '22 Jan 2025',
    location: 'Los Angeles, California',
    type: 'Presencial',
    image: '/event-speaker1-Dcs9GXUv.jpg',
  },
  {
    title: 'Showcase: Brazilian Artists',
    date: '5 Feb 2025',
    location: 'Los Angeles, California',
    type: 'Presencial',
    image: '/event-group1-D5Kh4W-j.jpg',
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
/* Section header reveal - horizontal slide with blur */
.section-header {
  opacity: 0;
  transform: translateX(-60px);
  filter: blur(12px);
  transition: opacity 0.9s cubic-bezier(0.16, 1, 0.3, 1),
              transform 0.9s cubic-bezier(0.16, 1, 0.3, 1),
              filter 0.9s cubic-bezier(0.16, 1, 0.3, 1);
}

.section-header.revealed {
  opacity: 1;
  transform: translateX(0);
  filter: blur(0);
}

/* Event card - 3D rotate entrance with blur */
.event-card {
  opacity: 0;
  transform: perspective(1000px) rotateY(-15deg) translateZ(-50px);
  filter: blur(8px);
  transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1),
              transform 0.8s cubic-bezier(0.16, 1, 0.3, 1),
              filter 0.8s cubic-bezier(0.16, 1, 0.3, 1),
              border-color 0.3s ease,
              box-shadow 0.3s ease;
  transform-style: preserve-3d;
}

.event-card.revealed {
  opacity: 1;
  transform: perspective(1000px) rotateY(0) translateZ(0);
  filter: blur(0);
}

/* Card hover effects */
.event-card:hover {
  transform: translateY(-10px) scale(1.02);
}

/* Image zoom and filter on hover */
.event-image {
  transition: transform 0.7s cubic-bezier(0.16, 1, 0.3, 1),
              filter 0.5s ease;
}

.event-card:hover .event-image {
  transform: scale(1.15);
}

/* Content fade-in */
.event-content {
  transform: translateY(15px);
  opacity: 0;
  transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1),
              opacity 0.6s ease;
  transition-delay: 0.5s;
}

.event-card.revealed .event-content {
  transform: translateY(0);
  opacity: 1;
}

/* Shimmer effect */
.shimmer-effect {
  transition: transform 0.7s ease;
}

/* Reduce motion for accessibility */
@media (prefers-reduced-motion: reduce) {
  .section-header,
  .event-card {
    opacity: 1;
    transform: none;
    filter: none;
    transition: border-color 0.3s ease, box-shadow 0.3s ease;
  }
  
  .event-content {
    opacity: 1;
    transform: none;
    transition: none;
  }
  
  .event-image {
    transition: none;
  }
  
  .event-card:hover .event-image {
    transform: none;
  }
  
  .shimmer-effect {
    display: none;
  }
}
</style>

