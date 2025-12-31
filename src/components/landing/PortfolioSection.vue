<template>
  <section 
    id="portfolio" 
    ref="sectionRef"
    class="relative py-20 lg:py-32 bg-slate-900 dark:bg-background-dark overflow-hidden"
  >
    <!-- Background Gradient -->
    <div class="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-900"></div>
    <div class="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[150px] animate-pulse-slow"></div>
    <div class="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-[150px] animate-pulse-slow" style="animation-delay: 2s"></div>

    <div class="container mx-auto px-6 relative z-10">
      <!-- Section Header -->
      <div 
        ref="headerRef"
        class="text-center mb-16 section-reveal"
        :class="{ 'revealed': headerVisible }"
      >
        <h2 class="text-3xl md:text-5xl font-black text-white mb-4">
          {{ t('landing.portfolio.title1') }}
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
            {{ t('landing.portfolio.title2') }}
          </span>
        </h2>
        <p class="text-lg text-gray-400 max-w-2xl mx-auto">
          {{ t('landing.portfolio.description') }}
        </p>
      </div>

      <!-- Gallery Grid with Parallax Effect -->
      <div ref="gridRef" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div 
          v-for="(item, index) in galleryItems" 
          :key="index"
          class="gallery-item group relative aspect-square rounded-xl overflow-hidden cursor-pointer"
          :class="[
            { 'md:col-span-2 md:row-span-2': item.featured },
            { 'revealed': gridVisible }
          ]"
          :style="{ transitionDelay: `${index * 80}ms` }"
          @click="openLightbox(index)"
        >
          <img 
            :src="item.image" 
            :alt="item.alt"
            class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
          
          <!-- Overlay -->
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
            <div class="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
              <p class="text-white font-semibold">{{ item.title }}</p>
              <p class="text-gray-300 text-sm">{{ item.event }}</p>
            </div>
          </div>

          <!-- Play Icon for Videos -->
          <div 
            v-if="item.isVideo"
            class="absolute inset-0 flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity"
          >
            <div class="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-primary/80 transition-colors group-hover:scale-110 duration-300">
              <span class="material-symbols-outlined text-white text-3xl">play_arrow</span>
            </div>
          </div>

          <!-- Shine effect on hover -->
          <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none"></div>
        </div>
      </div>

      <!-- View More Button -->
      <div 
        class="text-center mt-12 section-reveal"
        :class="{ 'revealed': gridVisible }"
        style="transition-delay: 600ms"
      >
        <router-link to="/login">
          <Button variant="primary" size="lg" class="btn-glow">
            {{ t('landing.portfolio.viewMore') }}
            <span class="material-symbols-outlined text-lg ml-2">photo_library</span>
          </Button>
        </router-link>
      </div>
    </div>

    <!-- Lightbox -->
    <Teleport to="body">
      <Transition name="lightbox">
        <div 
          v-if="lightboxOpen" 
          class="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4"
          @click="closeLightbox"
        >
          <button 
            class="absolute top-4 right-4 text-white/60 hover:text-white p-2 hover:bg-white/10 rounded-full transition-colors"
            @click="closeLightbox"
          >
            <span class="material-symbols-outlined text-3xl">close</span>
          </button>
          
          <button 
            class="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white p-2 hover:bg-white/10 rounded-full transition-colors"
            @click.stop="prevImage"
          >
            <span class="material-symbols-outlined text-4xl">chevron_left</span>
          </button>
          
          <button 
            class="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white p-2 hover:bg-white/10 rounded-full transition-colors"
            @click.stop="nextImage"
          >
            <span class="material-symbols-outlined text-4xl">chevron_right</span>
          </button>

          <img 
            :src="galleryItems[currentIndex]?.image" 
            :alt="galleryItems[currentIndex]?.alt"
            class="max-w-full max-h-[90vh] object-contain rounded-lg lightbox-image"
            @click.stop
          />
        </div>
      </Transition>
    </Teleport>
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
const gridVisible = ref(false)

const lightboxOpen = ref(false)
const currentIndex = ref(0)

let observer: IntersectionObserver | null = null

// Mock gallery data
const galleryItems = [
  { 
    image: '/event-group1-D5Kh4W-j.jpg',
    alt: 'Event Photo 1',
    title: 'Opening Night',
    event: 'Networking LA 2024',
    featured: true,
  },
  { 
    image: '/event-audience-Fdoh4fv4.jpg',
    alt: 'Event Photo 2',
    title: 'Panel Discussion',
    event: 'Summit LA',
  },
  { 
    image: '/event-dinner-BnxMiYA_.jpg',
    alt: 'Event Photo 3',
    title: 'Networking Dinner',
    event: 'Business Series',
  },
  { 
    image: '/event-group2-BV0jtbes.jpg',
    alt: 'Event Photo 4',
    title: 'Group Session',
    event: 'Team Event',
  },
  { 
    image: '/event-handshake-BaGACNmp.jpg',
    alt: 'Event Photo 5',
    title: 'Business Connections',
    event: 'Partner Event',
  },
  { 
    image: '/event-speaker2-v3CrsTNQ.jpg',
    alt: 'Event Photo 6',
    title: 'Expert Session',
    event: 'Conference 2024',
    isVideo: true,
  },
  { 
    image: '/event-hollywood-CK63ClAF.jpg',
    alt: 'Event Photo 7',
    title: 'Los Angeles Experience',
    event: 'Tour 2024',
  },
]

function openLightbox(index: number) {
  currentIndex.value = index
  lightboxOpen.value = true
  document.body.style.overflow = 'hidden'
}

function closeLightbox() {
  lightboxOpen.value = false
  document.body.style.overflow = ''
}

function nextImage() {
  currentIndex.value = (currentIndex.value + 1) % galleryItems.length
}

function prevImage() {
  currentIndex.value = (currentIndex.value - 1 + galleryItems.length) % galleryItems.length
}

onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (entry.target === headerRef.value) {
            headerVisible.value = true
          }
          if (entry.target === gridRef.value) {
            gridVisible.value = true
          }
          observer?.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.1 }
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

/* Gallery item staggered animation with blur */
.gallery-item {
  opacity: 0;
  transform: scale(0.85) rotate(-2deg);
  filter: blur(10px) saturate(0.5);
  transition: opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1),
              transform 0.7s cubic-bezier(0.16, 1, 0.3, 1),
              filter 0.7s cubic-bezier(0.16, 1, 0.3, 1);
}

.gallery-item.revealed {
  opacity: 1;
  transform: scale(1) rotate(0);
  filter: blur(0) saturate(1);
}

/* Gallery item hover with subtle rotation */
.gallery-item:hover {
  transform: scale(1.02);
  z-index: 10;
}

/* Slow pulsing animation for background blobs */
@keyframes pulse-slow {
  0%, 100% { opacity: 0.2; transform: scale(1); }
  50% { opacity: 0.3; transform: scale(1.1); }
}

.animate-pulse-slow {
  animation: pulse-slow 8s ease-in-out infinite;
}

/* Button glow */
.btn-glow {
  position: relative;
}

.btn-glow::after {
  content: '';
  position: absolute;
  inset: -2px;
  background: linear-gradient(45deg, var(--color-primary), var(--color-secondary));
  border-radius: inherit;
  z-index: -1;
  opacity: 0;
  filter: blur(15px);
  transition: opacity 0.3s ease;
}

.btn-glow:hover::after {
  opacity: 0.5;
}

/* Lightbox transitions */
.lightbox-enter-active,
.lightbox-leave-active {
  transition: opacity 0.3s ease;
}

.lightbox-enter-from,
.lightbox-leave-to {
  opacity: 0;
}

.lightbox-image {
  animation: lightbox-scale 0.3s ease;
}

@keyframes lightbox-scale {
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

/* Reduce motion for accessibility */
@media (prefers-reduced-motion: reduce) {
  .section-reveal,
  .gallery-item {
    opacity: 1;
    transform: none;
    transition: none;
  }
  
  .animate-pulse-slow {
    animation: none;
  }
}
</style>
