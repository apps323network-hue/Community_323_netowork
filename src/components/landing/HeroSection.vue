<template>
  <section 
    id="hero" 
    ref="heroRef"
    class="relative min-h-[90vh] flex items-center justify-center overflow-hidden"
  >
    <!-- Background Image/Video Overlay -->
    <div class="absolute inset-0 bg-gradient-to-b from-slate-900/90 via-slate-900/80 to-slate-50 dark:to-background-dark z-10"></div>
    
    <!-- Background Pattern -->
    <div class="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 z-10"></div>
    
    <!-- Parallax Background Image -->
    <div 
      ref="bgRef"
      class="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-100 will-change-transform"
      :style="{ 
        backgroundImage: `url('https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1920&q=80')`,
        transform: `translateY(${parallaxOffset}px) scale(1.1)`
      }"
    ></div>

    <!-- Content -->
    <div 
      class="relative z-20 container mx-auto px-6 py-20 text-center max-w-5xl"
      :class="{ 'blur-transition': hasScrolled }"
      :style="{ opacity: contentOpacity, filter: `blur(${blurAmount}px)` }"
    >
      <!-- Logo -->
      <div class="mb-8 hero-element" :class="{ 'animate-reveal': isLoaded }">
        <img
          alt="323 Network Logo"
          class="w-40 md:w-56 h-auto object-contain mx-auto drop-shadow-2xl"
          src="/logo-removebg-preview.png"
        />
      </div>

      <!-- Headline with split-text effect -->
      <h1 class="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-tight tracking-tight">
        <span 
          class="hero-element block" 
          :class="{ 'animate-reveal': isLoaded }"
          style="animation-delay: 0.1s"
        >
          {{ t('landing.hero.title1') }}
        </span>
        <span 
          class="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_auto] animate-gradient hero-element block"
          :class="{ 'animate-reveal': isLoaded }"
          style="animation-delay: 0.2s"
        >
          {{ t('landing.hero.title2') }}
        </span>
      </h1>

      <!-- Subtitle -->
      <p 
        class="text-lg md:text-xl text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed hero-element"
        :class="{ 'animate-reveal': isLoaded }"
        style="animation-delay: 0.3s"
      >
        {{ t('landing.hero.subtitle') }}
      </p>

      <!-- CTAs -->
      <div 
        class="flex flex-col sm:flex-row gap-4 justify-center items-center hero-element"
        :class="{ 'animate-reveal': isLoaded }"
        style="animation-delay: 0.4s"
      >
        <router-link to="/login">
          <Button variant="primary" size="lg" class="min-w-[200px] group btn-glow">
            <span class="flex items-center gap-2">
              {{ t('landing.hero.ctaPrimary') }}
              <span class="material-symbols-outlined text-xl group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </span>
          </Button>
        </router-link>
        <a href="#portfolio">
          <Button variant="outline" size="lg" class="min-w-[200px] text-white border-white/30 hover:bg-white/10">
            {{ t('landing.hero.ctaSecondary') }}
          </Button>
        </a>
      </div>

      <!-- Scroll Indicator -->
      <div class="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
        <a href="#about" class="text-white/60 hover:text-white transition-colors">
          <span class="material-symbols-outlined text-3xl">keyboard_arrow_down</span>
        </a>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import Button from '@/components/ui/Button.vue'

const { t } = useI18n()

const heroRef = ref<HTMLElement | null>(null)
const bgRef = ref<HTMLElement | null>(null)
const isLoaded = ref(false)
const scrollY = ref(0)
const hasScrolled = ref(false)

// Parallax effect - background moves slower than scroll
const parallaxOffset = computed(() => scrollY.value * 0.4)

// Content fades and blurs as user scrolls
const contentOpacity = computed(() => {
  const fadeStart = 100
  const fadeEnd = 400
  if (scrollY.value < fadeStart) return 1
  if (scrollY.value > fadeEnd) return 0.3
  return 1 - ((scrollY.value - fadeStart) / (fadeEnd - fadeStart)) * 0.7
})

const blurAmount = computed(() => {
  const blurStart = 200
  const blurMax = 500
  if (scrollY.value < blurStart) return 0
  if (scrollY.value > blurMax) return 8
  return ((scrollY.value - blurStart) / (blurMax - blurStart)) * 8
})

function handleScroll() {
  scrollY.value = window.scrollY
  if (scrollY.value > 50) {
    hasScrolled.value = true
  }
}

onMounted(() => {
  // Trigger reveal animation after mount
  setTimeout(() => {
    isLoaded.value = true
  }, 100)

  window.addEventListener('scroll', handleScroll, { passive: true })
  handleScroll()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
/* Reveal animation for hero elements */
.hero-element {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), 
              transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

.hero-element.animate-reveal {
  opacity: 1;
  transform: translateY(0);
}

/* Staggered animation delays */
.hero-element:nth-child(1) { transition-delay: 0s; }
.hero-element:nth-child(2) { transition-delay: 0.1s; }
.hero-element:nth-child(3) { transition-delay: 0.2s; }
.hero-element:nth-child(4) { transition-delay: 0.3s; }
.hero-element:nth-child(5) { transition-delay: 0.4s; }

/* Animated gradient for title */
@keyframes gradient {
  0% { background-position: 0% center; }
  50% { background-position: 100% center; }
  100% { background-position: 0% center; }
}

.animate-gradient {
  animation: gradient 4s ease infinite;
}

/* Glow effect on primary button */
.btn-glow {
  position: relative;
  overflow: visible;
}

.btn-glow::before {
  content: '';
  position: absolute;
  inset: -2px;
  background: linear-gradient(45deg, var(--color-primary), var(--color-secondary), var(--color-primary));
  border-radius: inherit;
  z-index: -1;
  opacity: 0;
  filter: blur(15px);
  transition: opacity 0.3s ease;
}

.btn-glow:hover::before {
  opacity: 0.6;
  animation: pulse-glow 2s ease infinite;
}

@keyframes pulse-glow {
  0%, 100% { opacity: 0.6; filter: blur(15px); }
  50% { opacity: 0.3; filter: blur(20px); }
}

/* Blur transition class */
.blur-transition {
  transition: filter 0.3s ease, opacity 0.3s ease;
  will-change: filter, opacity;
}

/* Reduce motion for accessibility */
@media (prefers-reduced-motion: reduce) {
  .hero-element {
    opacity: 1;
    transform: none;
    transition: none;
  }
  
  .animate-gradient {
    animation: none;
  }
}
</style>
