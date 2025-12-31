<template>
  <section 
    id="events" 
    ref="sectionRef"
    class="relative py-20 lg:py-32 bg-white dark:bg-surface-dark overflow-hidden"
  >
    <!-- Background Decoration -->
    <div class="absolute top-0 right-0 w-1/3 h-1/2 bg-gradient-to-bl from-primary/5 to-transparent dark:from-primary/10 rounded-bl-[200px] pointer-events-none"></div>
    
    <div class="container mx-auto px-6 relative z-10">
      <!-- Section Header -->
      <div 
        ref="headerRef"
        class="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-12 section-header"
        :class="{ 'revealed': headerVisible }"
      >
        <div>
          <h2 class="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-4">
            {{ t('landing.events.title') }}
          </h2>
          <p class="text-lg text-slate-600 dark:text-gray-400 max-w-xl">
            {{ t('landing.events.description') }}
          </p>
        </div>
        <router-link to="/login" class="mt-6 lg:mt-0">
          <Button variant="outline" size="md" class="btn-slide">
            {{ t('landing.events.viewAll') }}
            <span class="material-symbols-outlined text-lg ml-1">arrow_forward</span>
          </Button>
        </router-link>
      </div>

      <!-- Events Grid -->
      <div ref="gridRef" class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
          v-for="(event, index) in events" 
          :key="index"
          class="event-card group relative bg-slate-50 dark:bg-surface-lighter rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10"
          :class="{ 'revealed': cardsVisible }"
          :style="{ transitionDelay: `${index * 120}ms` }"
        >
          <!-- Image -->
          <div class="relative h-48 overflow-hidden">
            <img 
              :src="event.image" 
              :alt="event.title"
              class="event-image w-full h-full object-cover"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            
            <!-- Badge -->
            <div class="badge-container absolute top-4 left-4">
              <span class="px-3 py-1 rounded-full text-xs font-bold bg-primary text-white uppercase">
                {{ event.type }}
              </span>
            </div>

            <!-- Date Badge -->
            <div class="date-badge absolute bottom-4 left-4 text-white">
              <div class="text-2xl font-black">{{ event.day }}</div>
              <div class="text-xs uppercase tracking-wider opacity-80">{{ event.month }}</div>
            </div>
            
            <!-- Shimmer effect on hover -->
            <div class="shimmer-effect absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none"></div>
          </div>

          <!-- Content -->
          <div class="event-content p-6">
            <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-primary transition-colors">
              {{ event.title }}
            </h3>
            <p class="text-sm text-slate-500 dark:text-gray-400 flex items-center gap-1">
              <span class="material-symbols-outlined text-base">location_on</span>
              {{ event.location }}
            </p>
            <p class="text-sm text-slate-500 dark:text-gray-400 flex items-center gap-1 mt-1">
              <span class="material-symbols-outlined text-base">group</span>
              {{ event.participants }} {{ t('landing.events.participants') }}
            </p>
          </div>
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

const headerVisible = ref(false)
const cardsVisible = ref(false)

let observer: IntersectionObserver | null = null

// Mock events data
const events = [
  {
    title: 'Networking Night Miami',
    type: 'Networking',
    day: '15',
    month: 'JAN',
    location: 'Miami, FL',
    participants: 120,
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=600&q=80',
  },
  {
    title: 'Brazilian Entrepreneurs Summit',
    type: 'Showcase',
    day: '28',
    month: 'JAN',
    location: 'Los Angeles, CA',
    participants: 250,
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80',
  },
  {
    title: 'Workshop: Vistos & Imigração',
    type: 'Workshop',
    day: '05',
    month: 'FEV',
    location: 'Online/Webinar',
    participants: 85,
    image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=600&q=80',
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

/* Badge pop-in effect */
.badge-container {
  transform: scale(0.8);
  opacity: 0;
  transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1),
              opacity 0.5s ease;
  transition-delay: 0.3s;
}

.event-card.revealed .badge-container {
  transform: scale(1);
  opacity: 1;
}

/* Date badge slide-up */
.date-badge {
  transform: translateY(20px);
  opacity: 0;
  transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1),
              opacity 0.6s ease;
  transition-delay: 0.4s;
}

.event-card.revealed .date-badge {
  transform: translateY(0);
  opacity: 1;
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

/* Button slide effect */
.btn-slide {
  position: relative;
  overflow: hidden;
}

.btn-slide::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transition: left 0.5s ease;
}

.btn-slide:hover::before {
  left: 100%;
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
  
  .badge-container,
  .date-badge,
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
