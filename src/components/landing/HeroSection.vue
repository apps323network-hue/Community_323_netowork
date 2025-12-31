<template>
  <section 
    id="hero" 
    ref="heroRef"
    class="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-slate-900"
  >
    <!-- Base Background Gradient -->
    <div class="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"></div>
    
    <!-- Animated Background Blobs -->
    <div class="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[200px] animate-blob"></div>
    <div class="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-secondary/20 rounded-full blur-[180px] animate-blob" style="animation-delay: 3s"></div>
    <div class="absolute top-1/2 right-1/3 w-[400px] h-[400px] bg-cyan-500/15 rounded-full blur-[150px] animate-blob" style="animation-delay: 6s"></div>
    
    <!-- Logo Animation Container -->
    <div class="absolute inset-0 flex items-center justify-center pointer-events-none z-[5]">
      <div class="relative flex flex-col items-center">
        <!-- 323 Logo - comes from left -->
        <div 
          class="logo-323"
          :class="{ 'animate-connect': animationStarted }"
          :style="{ 
            transform: `translate3d(${mouseX * 0.015}px, ${parallaxOffset * 0.2 + mouseY * 0.015}px, 0)`,
            filter: `blur(${logoBlur}px)`
          }"
        >
          <img 
            src="/parallax-323.png" 
            alt="" 
            class="w-[280px] md:w-[380px] lg:w-[450px] h-auto select-none"
            :style="{ opacity: logoOpacity }"
          />
        </div>
        
        <!-- NETWORK Text - comes from right -->
        <div 
          class="logo-network -mt-10 md:-mt-14 lg:-mt-16"
          :class="{ 'animate-connect': animationStarted }"
          :style="{ 
            transform: `translate3d(${mouseX * -0.02}px, ${parallaxOffset * 0.35 + mouseY * -0.02}px, 0)`,
            filter: `blur(${networkBlur}px)`
          }"
        >
          <img 
            src="/parallax-network.png" 
            alt="" 
            class="w-[220px] md:w-[320px] lg:w-[400px] h-auto select-none"
            :style="{ opacity: networkOpacity }"
          />
        </div>
      </div>
    </div>
    
    <!-- Noise Overlay -->
    <div class="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] z-10 pointer-events-none"></div>
    
    <!-- Gradient Overlay for readability -->
    <div class="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/30 to-slate-900/80 z-10"></div>

    <!-- Content -->
    <div 
      class="relative z-20 container mx-auto px-6 pt-16 pb-20 text-center max-w-5xl"
      :class="{ 'blur-transition': hasScrolled }"
      :style="{ opacity: contentOpacity, filter: `blur(${contentBlur}px)` }"
    >
      <!-- Headline with split-text effect -->
      <h1 class="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-tight tracking-tight">
        <span 
          class="hero-element block" 
          :class="{ 'animate-reveal': contentReady }"
          style="animation-delay: 0.1s"
        >
          {{ t('landing.hero.title1') }}
        </span>
        <span 
          class="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_auto] animate-gradient hero-element block"
          :class="{ 'animate-reveal': contentReady }"
          style="animation-delay: 0.2s"
        >
          {{ t('landing.hero.title2') }}
        </span>
      </h1>

      <!-- Subtitle -->
      <p 
        class="text-lg md:text-xl text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed hero-element"
        :class="{ 'animate-reveal': contentReady }"
        style="animation-delay: 0.3s"
      >
        {{ t('landing.hero.subtitle') }}
      </p>

      <!-- CTAs -->
      <div 
        class="flex flex-col sm:flex-row gap-4 justify-center items-center hero-element"
        :class="{ 'animate-reveal': contentReady }"
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
      <div class="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
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
const animationStarted = ref(false)
const contentReady = ref(false)
const scrollY = ref(0)
const mouseX = ref(0)
const mouseY = ref(0)
const hasScrolled = ref(false)

// Parallax offset based on scroll
const parallaxOffset = computed(() => scrollY.value * 0.5)

// Logo opacity (fades slightly on scroll)
const logoOpacity = computed(() => {
  const base = 0.35
  const fadeStart = 200
  const fadeEnd = 600
  if (scrollY.value < fadeStart) return base
  if (scrollY.value > fadeEnd) return 0.15
  return base - ((scrollY.value - fadeStart) / (fadeEnd - fadeStart)) * 0.2
})

// Network opacity
const networkOpacity = computed(() => {
  const base = 0.30
  const fadeStart = 200
  const fadeEnd = 600
  if (scrollY.value < fadeStart) return base
  if (scrollY.value > fadeEnd) return 0.12
  return base - ((scrollY.value - fadeStart) / (fadeEnd - fadeStart)) * 0.18
})

// Logo blur on scroll
const logoBlur = computed(() => {
  const blurStart = 150
  const blurMax = 500
  if (scrollY.value < blurStart) return 0
  if (scrollY.value > blurMax) return 5
  return ((scrollY.value - blurStart) / (blurMax - blurStart)) * 5
})

// Network blur on scroll
const networkBlur = computed(() => {
  const blurStart = 100
  const blurMax = 450
  if (scrollY.value < blurStart) return 0
  if (scrollY.value > blurMax) return 6
  return ((scrollY.value - blurStart) / (blurMax - blurStart)) * 6
})

// Content opacity fades on scroll
const contentOpacity = computed(() => {
  const fadeStart = 100
  const fadeEnd = 400
  if (scrollY.value < fadeStart) return 1
  if (scrollY.value > fadeEnd) return 0.3
  return 1 - ((scrollY.value - fadeStart) / (fadeEnd - fadeStart)) * 0.7
})

// Content blur on scroll
const contentBlur = computed(() => {
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

function handleMouseMove(e: MouseEvent) {
  const centerX = window.innerWidth / 2
  const centerY = window.innerHeight / 2
  mouseX.value = (e.clientX - centerX) * 0.5
  mouseY.value = (e.clientY - centerY) * 0.5
}

onMounted(() => {
  // Start logo connection animation
  setTimeout(() => {
    animationStarted.value = true
  }, 200)
  
  // Show content after logos connect
  setTimeout(() => {
    contentReady.value = true
  }, 1400)

  window.addEventListener('scroll', handleScroll, { passive: true })
  window.addEventListener('mousemove', handleMouseMove, { passive: true })
  handleScroll()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('mousemove', handleMouseMove)
})
</script>

<style scoped>
/* Logo 323 - starts from left, off-screen */
.logo-323 {
  opacity: 0;
  transform: translateX(-100vw);
  transition: none;
}

.logo-323.animate-connect {
  animation: slideFromLeft 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes slideFromLeft {
  0% {
    opacity: 0;
    transform: translateX(-60vw) scale(0.8);
    filter: blur(15px);
  }
  40% {
    opacity: 0.4;
    filter: blur(5px);
  }
  100% {
    opacity: 1;
    transform: translateX(0) scale(1);
    filter: blur(0);
  }
}

/* Logo NETWORK - starts from right, off-screen */
.logo-network {
  opacity: 0;
  transform: translateX(100vw);
  transition: none;
}

.logo-network.animate-connect {
  animation: slideFromRight 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  animation-delay: 0.15s;
}

@keyframes slideFromRight {
  0% {
    opacity: 0;
    transform: translateX(60vw) scale(0.8);
    filter: blur(15px);
  }
  40% {
    opacity: 0.35;
    filter: blur(5px);
  }
  100% {
    opacity: 1;
    transform: translateX(0) scale(1);
    filter: blur(0);
  }
}

/* Reveal animation for hero elements */
.hero-element {
  opacity: 0;
  transform: translateY(40px);
  transition: opacity 0.9s cubic-bezier(0.16, 1, 0.3, 1), 
              transform 0.9s cubic-bezier(0.16, 1, 0.3, 1);
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

/* Animated gradient for title */
@keyframes gradient {
  0% { background-position: 0% center; }
  50% { background-position: 100% center; }
  100% { background-position: 0% center; }
}

.animate-gradient {
  animation: gradient 4s ease infinite;
}

/* Blob animation */
@keyframes blob {
  0%, 100% { 
    opacity: 0.2; 
    transform: scale(1) translate(0, 0); 
  }
  33% { 
    opacity: 0.3; 
    transform: scale(1.1) translate(30px, -30px); 
  }
  66% { 
    opacity: 0.15; 
    transform: scale(0.95) translate(-20px, 20px); 
  }
}

.animate-blob {
  animation: blob 15s ease-in-out infinite;
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
  
  .animate-gradient,
  .animate-blob {
    animation: none;
  }
  
  .logo-323,
  .logo-network {
    opacity: 0.3;
    transform: none !important;
    filter: none !important;
  }
  
  .logo-323.animate-connect,
  .logo-network.animate-connect {
    animation: none;
    opacity: 0.3;
  }
}
</style>
