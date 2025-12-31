<template>
  <section 
    id="testimonials" 
    ref="sectionRef"
    class="relative py-20 lg:py-32 bg-white dark:bg-surface-dark overflow-hidden"
  >

    <div class="container mx-auto px-6 relative z-10">
      <!-- Section Header -->
      <div 
        ref="headerRef"
        class="text-center mb-16 section-reveal"
        :class="{ 'revealed': headerVisible }"
      >
        <h2 class="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-4">
          {{ t('landing.testimonials.title') }}
        </h2>
        <p class="text-lg text-slate-600 dark:text-gray-400 max-w-2xl mx-auto">
          {{ t('landing.testimonials.description') }}
        </p>
      </div>

      <!-- Testimonials Carousel -->
      <div 
        ref="carouselRef"
        class="relative max-w-4xl mx-auto section-reveal"
        :class="{ 'revealed': carouselVisible }"
      >
        <!-- Navigation Dots -->
        <div class="flex justify-center gap-2 mb-8">
          <button 
            v-for="(_, index) in testimonials" 
            :key="index"
            class="dot-button w-3 h-3 rounded-full transition-all duration-300"
            :class="currentIndex === index ? 'bg-primary w-8' : 'bg-slate-300 dark:bg-slate-700 hover:bg-slate-400'"
            @click="goTo(index)"
          />
        </div>

        <!-- Testimonial Card -->
        <transition name="testimonial" mode="out-in">
          <div 
            :key="currentIndex" 
            class="testimonial-card bg-slate-50 dark:bg-surface-lighter rounded-3xl p-8 md:p-12 border border-slate-200 dark:border-slate-800"
          >
            <div class="flex flex-col md:flex-row gap-8 items-center">
              <!-- Avatar -->
              <div class="flex-shrink-0">
                <div class="avatar-wrapper w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-primary/30">
                  <img 
                    :src="testimonials[currentIndex].avatar" 
                    :alt="testimonials[currentIndex].name"
                    class="w-full h-full object-cover"
                  />
                </div>
              </div>

              <!-- Content -->
              <div class="flex-1 text-center md:text-left">
                <p class="text-xl md:text-2xl text-slate-700 dark:text-gray-300 leading-relaxed italic mb-6">
                  "{{ testimonials[currentIndex].quote }}"
                </p>
                <div>
                  <div class="font-bold text-lg text-slate-900 dark:text-white">
                    {{ testimonials[currentIndex].name }}
                  </div>
                  <div class="text-sm text-slate-500 dark:text-gray-400">
                    {{ testimonials[currentIndex].role }} • {{ testimonials[currentIndex].location }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </transition>

        <!-- Navigation Arrows -->
        <button 
          class="nav-arrow absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 lg:-translate-x-12 w-10 h-10 rounded-full bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:text-primary hover:border-primary transition-all duration-300 shadow-lg hover:shadow-primary/20"
          @click="prev"
        >
          <span class="material-symbols-outlined">chevron_left</span>
        </button>
        <button 
          class="nav-arrow absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 lg:translate-x-12 w-10 h-10 rounded-full bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:text-primary hover:border-primary transition-all duration-300 shadow-lg hover:shadow-primary/20"
          @click="next"
        >
          <span class="material-symbols-outlined">chevron_right</span>
        </button>
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
const carouselRef = ref<HTMLElement | null>(null)

const headerVisible = ref(false)
const carouselVisible = ref(false)

const currentIndex = ref(0)
let autoplayInterval: ReturnType<typeof setInterval> | null = null
let observer: IntersectionObserver | null = null

// Mock testimonials
const testimonials = [
  {
    name: 'Lucas Mendes',
    role: 'Designer',
    location: 'Miami, FL',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
    quote: 'A 323 Network mudou minha trajetória nos EUA. Em poucos meses, consegui expandir minha rede de contatos e fechar parcerias que jamais imaginei.',
  },
  {
    name: 'Amanda Costa',
    role: 'Empresária',
    location: 'New York, NY',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80',
    quote: 'O networking VIP abriu portas que eu levaria anos para conseguir sozinha. A comunidade é genuína e todos se ajudam.',
  },
  {
    name: 'Rafael Santos',
    role: 'Tech Entrepreneur',
    location: 'Los Angeles, CA',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80',
    quote: 'Os eventos da 323 são de altíssima qualidade. Cada encontro é uma oportunidade real de crescimento profissional.',
  },
  {
    name: 'Beatriz Lima',
    role: 'Arquiteta',
    location: 'Austin, TX',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80',
    quote: 'Consegui organizar minha estratégia de visto com a mentoria. Me senti muito mais segura para aplicar. Recomendo demais!',
  },
]

function next() {
  currentIndex.value = (currentIndex.value + 1) % testimonials.length
}

function prev() {
  currentIndex.value = (currentIndex.value - 1 + testimonials.length) % testimonials.length
}

function goTo(index: number) {
  currentIndex.value = index
}

onMounted(() => {
  autoplayInterval = setInterval(next, 6000)

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (entry.target === headerRef.value) {
            headerVisible.value = true
          }
          if (entry.target === carouselRef.value) {
            carouselVisible.value = true
          }
          observer?.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.2 }
  )

  if (headerRef.value) observer.observe(headerRef.value)
  if (carouselRef.value) observer.observe(carouselRef.value)
})

onUnmounted(() => {
  if (autoplayInterval) clearInterval(autoplayInterval)
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

/* Testimonial slide transition */
.testimonial-enter-active,
.testimonial-leave-active {
  transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.testimonial-enter-from {
  opacity: 0;
  transform: translateX(50px) scale(0.95);
  filter: blur(4px);
}

.testimonial-leave-to {
  opacity: 0;
  transform: translateX(-50px) scale(0.95);
  filter: blur(4px);
}

/* Testimonial card hover effect */
.testimonial-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.testimonial-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

/* Avatar wrapper animation */
.avatar-wrapper {
  transition: transform 0.3s ease, border-color 0.3s ease;
}

.testimonial-card:hover .avatar-wrapper {
  transform: scale(1.05);
  border-color: var(--color-primary);
}

/* Navigation arrow hover effect */
.nav-arrow:hover {
  transform: translateY(-50%) scale(1.1);
}

/* Dot button animation */
.dot-button {
  position: relative;
  overflow: hidden;
}

.dot-button::after {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--color-primary);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.3s ease;
  border-radius: inherit;
}

/* Reduce motion for accessibility */
@media (prefers-reduced-motion: reduce) {
  .section-reveal {
    opacity: 1;
    transform: none;
    transition: none;
  }
  
  .testimonial-enter-active,
  .testimonial-leave-active {
    transition: opacity 0.3s ease;
  }
  
  .testimonial-enter-from,
  .testimonial-leave-to {
    transform: none;
    filter: none;
  }
}
</style>
