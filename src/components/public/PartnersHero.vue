<template>
  <section 
    id="hero" 
    ref="heroRef"
    class="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-slate-900 dark:bg-background-dark"
  >
    <!-- Background Effects -->
    <div
      class="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 z-0"
    ></div>
    <div
      class="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-secondary/20 dark:bg-secondary/25 rounded-full mix-blend-screen filter blur-[120px] animate-glow z-0"
    ></div>
    <div
      class="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-primary/20 dark:bg-primary/25 rounded-full mix-blend-screen filter blur-[120px] animate-glow z-0"
      style="animation-delay: 2.5s"
    ></div>

    <!-- Content -->
    <div 
      ref="contentRef"
      class="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20"
      :class="{ 'blur-transition': hasScrolled }"
      :style="{ opacity: contentOpacity, filter: `blur(${blurAmount}px)` }"
    >
      <!-- Headline with split-text effect -->
      <h1 class="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-tight">
        <span 
          class="hero-element block" 
          :class="{ 'animate-reveal': isLoaded }"
          style="animation-delay: 0.1s"
        >
          {{ t('partners.hero.title') }}
        </span>
        <div 
          class="font-display font-extrabold tracking-tighter flex items-center justify-center gap-2 hero-element"
          :class="{ 'animate-reveal': isLoaded }"
          style="animation-delay: 0.2s"
        >
          <span class="text-primary dark:text-secondary">323</span>
          <span
            class="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary font-extrabold"
          >NETWORK</span>
        </div>
      </h1>
      
      <!-- Description -->
      <p 
        class="text-lg sm:text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed hero-element"
        :class="{ 'animate-reveal': isLoaded }"
        style="animation-delay: 0.3s"
      >
        {{ t('partners.hero.description') }}
      </p>
    </div>

    <!-- Scroll Indicator -->
    <div class="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 animate-bounce">
      <a href="#about" class="text-gray-400 hover:text-primary dark:hover:text-secondary transition-colors">
        <span class="material-icons-outlined text-3xl">keyboard_arrow_down</span>
      </a>
    </div>
</section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const heroRef = ref<HTMLElement | null>(null)
const contentRef = ref<HTMLElement | null>(null)
const isLoaded = ref(false)
const scrollY = ref(0)
const hasScrolled = ref(false)

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

/* Animated gradient for subtitle */
@keyframes gradient {
  0% { background-position: 0% center; }
  50% { background-position: 100% center; }
  100% { background-position: 0% center; }
}

.animate-gradient {
  animation: gradient 4s ease infinite;
}

/* Blur transition class */
.blur-transition {
  transition: filter 0.3s ease, opacity 0.3s ease;
  will-change: filter, opacity;
}

@keyframes glow {
  0%, 100% {
    opacity: 0.3;
    filter: blur(120px);
  }
  50% {
    opacity: 0.6;
    filter: blur(140px);
  }
}

.animate-glow {
  animation: glow 5s ease-in-out infinite;
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
  
  .blur-transition {
    transition: none;
  }
}
</style>

