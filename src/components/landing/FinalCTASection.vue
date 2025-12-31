<template>
  <section 
    id="cta" 
    ref="sectionRef"
    class="relative py-20 lg:py-32 overflow-hidden"
  >
    <!-- Background -->
    <div class="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"></div>
    <div class="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30"></div>
    
    <!-- Animated Blobs with enhanced animation -->
    <div class="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/30 rounded-full blur-[150px] animate-blob"></div>
    <div class="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-secondary/30 rounded-full blur-[150px] animate-blob" style="animation-delay: 2s"></div>

    <div class="container mx-auto px-6 relative z-10">
      <div 
        ref="contentRef"
        class="max-w-4xl mx-auto text-center cta-content"
        :class="{ 'revealed': contentVisible }"
      >
        <!-- Badge -->
        <div 
          class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/80 text-sm mb-8 badge-float"
          style="animation-delay: 0.2s"
        >
          <span class="material-symbols-outlined text-lg text-secondary animate-pulse">stars</span>
          {{ t('landing.cta.badge') }}
        </div>

        <!-- Headline with scale effect -->
        <h2 class="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-tight headline-reveal">
          <span class="block" style="animation-delay: 0.1s">{{ t('landing.cta.title1') }}</span>
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary block" style="animation-delay: 0.2s">
            {{ t('landing.cta.title2') }}
          </span>
        </h2>

        <!-- Description -->
        <p 
          class="text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed desc-reveal"
          style="animation-delay: 0.3s"
        >
          {{ t('landing.cta.description') }}
        </p>

        <!-- CTAs with glow -->
        <div class="flex flex-col sm:flex-row gap-4 justify-center items-center cta-buttons" style="animation-delay: 0.4s">
          <router-link to="/register">
            <Button variant="primary" size="lg" class="min-w-[220px] shadow-lg shadow-primary/30 group btn-glow">
              <span class="flex items-center gap-2">
                {{ t('landing.cta.button') }}
                <span class="material-symbols-outlined text-xl group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </span>
            </Button>
          </router-link>
          <router-link to="/login">
            <Button variant="outline" size="lg" class="min-w-[220px] text-white border-white/30 hover:bg-white/10 hover:border-white/50 transition-all duration-300">
              {{ t('landing.cta.loginButton') }}
            </Button>
          </router-link>
        </div>

        <!-- Trust Badges -->
        <div 
          class="mt-12 flex flex-wrap justify-center gap-8 text-gray-400 text-sm trust-badges"
          style="animation-delay: 0.5s"
        >
          <div class="flex items-center gap-2 hover:text-gray-300 transition-colors">
            <span class="material-symbols-outlined text-secondary">verified</span>
            {{ t('landing.cta.trust1') }}
          </div>
          <div class="flex items-center gap-2 hover:text-gray-300 transition-colors">
            <span class="material-symbols-outlined text-primary">lock</span>
            {{ t('landing.cta.trust2') }}
          </div>
          <div class="flex items-center gap-2 hover:text-gray-300 transition-colors">
            <span class="material-symbols-outlined text-green-400">bolt</span>
            {{ t('landing.cta.trust3') }}
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
const contentRef = ref<HTMLElement | null>(null)
const contentVisible = ref(false)

let observer: IntersectionObserver | null = null

onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          contentVisible.value = true
          observer?.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.2 }
  )

  if (contentRef.value) observer.observe(contentRef.value)
})

onUnmounted(() => {
  observer?.disconnect()
})
</script>

<style scoped>
/* CTA content reveal animation */
.cta-content {
  opacity: 0;
  transform: translateY(50px) scale(0.95);
  transition: opacity 1s cubic-bezier(0.16, 1, 0.3, 1),
              transform 1s cubic-bezier(0.16, 1, 0.3, 1);
}

.cta-content.revealed {
  opacity: 1;
  transform: translateY(0) scale(1);
}

/* Staggered child animations */
.cta-content.revealed .badge-float,
.cta-content.revealed .headline-reveal span,
.cta-content.revealed .desc-reveal,
.cta-content.revealed .cta-buttons,
.cta-content.revealed .trust-badges {
  animation: fadeSlideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  opacity: 0;
}

@keyframes fadeSlideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Floating badge animation */
.badge-float {
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

/* Enhanced blob animation */
@keyframes blob {
  0%, 100% { 
    opacity: 0.3; 
    transform: scale(1) translate(0, 0); 
  }
  33% { 
    opacity: 0.4; 
    transform: scale(1.1) translate(20px, -20px); 
  }
  66% { 
    opacity: 0.25; 
    transform: scale(0.9) translate(-20px, 20px); 
  }
}

.animate-blob {
  animation: blob 12s ease-in-out infinite;
}

/* Button glow effect */
.btn-glow {
  position: relative;
  overflow: visible;
}

.btn-glow::before {
  content: '';
  position: absolute;
  inset: -3px;
  background: linear-gradient(45deg, var(--color-primary), var(--color-secondary), var(--color-primary));
  border-radius: inherit;
  z-index: -1;
  opacity: 0.6;
  filter: blur(20px);
  animation: glow-pulse 3s ease-in-out infinite;
}

@keyframes glow-pulse {
  0%, 100% { opacity: 0.4; filter: blur(20px); }
  50% { opacity: 0.7; filter: blur(25px); }
}

/* Reduce motion for accessibility */
@media (prefers-reduced-motion: reduce) {
  .cta-content {
    opacity: 1;
    transform: none;
    transition: none;
  }
  
  .cta-content.revealed .badge-float,
  .cta-content.revealed .headline-reveal span,
  .cta-content.revealed .desc-reveal,
  .cta-content.revealed .cta-buttons,
  .cta-content.revealed .trust-badges {
    animation: none;
    opacity: 1;
  }
  
  .badge-float,
  .animate-blob {
    animation: none;
  }
  
  .btn-glow::before {
    animation: none;
  }
}
</style>
