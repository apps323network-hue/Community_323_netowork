<template>
  <section 
    id="gallery"
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
          {{ t('partners.gallery.title') }}
        </h2>
        <p class="text-lg text-slate-600 dark:text-gray-400 max-w-2xl mx-auto">
          {{ t('partners.gallery.description') }}
        </p>
        <div class="w-24 h-1 bg-neon-gradient mx-auto rounded-full mt-4"></div>
      </div>

      <!-- Gallery Grid -->
      <div 
        ref="gridRef"
        class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
      >
        <div
          v-for="(image, index) in placeholderImages"
          :key="index"
          class="gallery-item relative aspect-square bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden cursor-pointer group"
          :class="{ 'revealed': gridVisible }"
          :style="{ transitionDelay: `${index * 80}ms` }"
          @click="openLightbox(image.url, image.alt)"
        >
          <img
            :src="image.url"
            :alt="image.alt"
            class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />

          <!-- Overlay on Hover -->
          <div class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
            <span class="material-icons-outlined text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-3xl">
              zoom_in
            </span>
          </div>

          <!-- Shine effect on hover -->
          <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none"></div>
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-if="placeholderImages.length === 0"
        class="text-center py-12"
      >
        <span class="material-icons-outlined text-6xl text-slate-300 mb-4 block">photo_library</span>
        <p class="text-slate-500">
          {{ t('partners.gallery.noImages') }}
        </p>
      </div>
    </div>

    <!-- Image Lightbox -->
    <ImageLightbox
      v-model="lightboxOpen"
      :image-url="selectedImageUrl"
      :alt="selectedImageAlt"
    />
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import ImageLightbox from '@/components/ui/ImageLightbox.vue'

const { t } = useI18n()

const sectionRef = ref<HTMLElement | null>(null)
const headerRef = ref<HTMLElement | null>(null)
const gridRef = ref<HTMLElement | null>(null)

const headerVisible = ref(false)
const gridVisible = ref(false)

let observer: IntersectionObserver | null = null

const lightboxOpen = ref(false)
const selectedImageUrl = ref<string | null>(null)
const selectedImageAlt = ref('')

// Imagens reais dos eventos
const placeholderImages = [
  { url: '/event-audience-Fdoh4fv4.jpg', alt: 'Audiência engajada no evento' },
  { url: '/event-dinner-BnxMiYA_.jpg', alt: 'Networking durante jantar' },
  { url: '/event-griffith-DJdTtNs_.jpg', alt: 'Grupo no Griffith Observatory' },
  { url: '/event-group1-D5Kh4W-j.jpg', alt: 'Participantes do evento 323 Network' },
  { url: '/event-group2-BV0jtbes.jpg', alt: 'Grupo de networking' },
  { url: '/event-handshake-BaGACNmp.jpg', alt: 'Conexões de negócios' },
  { url: '/event-hollywood-CK63ClAF.jpg', alt: 'Hollywood Sign - Los Angeles' },
  { url: '/event-speaker1-Dcs9GXUv.jpg', alt: 'Palestrante no evento' },
  { url: '/event-speaker2-v3CrsTNQ.jpg', alt: 'Apresentação no evento' },
]

function openLightbox(url: string | null, alt: string) {
  if (!url) return
  selectedImageUrl.value = url
  selectedImageAlt.value = alt
  lightboxOpen.value = true
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

/* Reduce motion for accessibility */
@media (prefers-reduced-motion: reduce) {
  .section-reveal,
  .gallery-item {
    opacity: 1;
    transform: none;
    filter: none;
    transition: none;
  }
}
</style>

