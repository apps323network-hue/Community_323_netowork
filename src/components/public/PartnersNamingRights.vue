<template>
  <section 
    id="naming-rights"
    ref="sectionRef"
    class="py-16 sm:py-20 md:py-24 bg-gradient-to-br from-primary/10 via-secondary/10 to-primary/10 dark:from-primary/5 dark:via-secondary/5 dark:to-primary/5 relative overflow-hidden"
  >
    <!-- Animated gradient background -->
    <div class="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-primary/5 animate-gradient-bg"></div>
    
    <div 
      ref="contentRef"
      class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 cta-content"
      :class="{ 'revealed': contentVisible }"
    >
      <h2 class="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 headline-reveal" style="animation-delay: 0.1s">
        {{ t('partners.namingRights.title') }}
      </h2>
      <p class="text-lg sm:text-xl text-slate-700 dark:text-gray-300 mb-8 leading-relaxed desc-reveal" style="animation-delay: 0.2s">
        {{ t('partners.namingRights.description') }}
      </p>
      <ul class="text-left max-w-2xl mx-auto space-y-4 mb-10 benefits-reveal" style="animation-delay: 0.3s">
        <li class="flex items-start gap-3">
          <span class="material-icons-outlined text-primary dark:text-secondary text-xl flex-shrink-0 mt-0.5">check_circle</span>
          <span class="text-slate-700 dark:text-gray-300">{{ t('partners.namingRights.benefit1') }}</span>
        </li>
        <li class="flex items-start gap-3">
          <span class="material-icons-outlined text-primary dark:text-secondary text-xl flex-shrink-0 mt-0.5">check_circle</span>
          <span class="text-slate-700 dark:text-gray-300">{{ t('partners.namingRights.benefit2') }}</span>
        </li>
        <li class="flex items-start gap-3">
          <span class="material-icons-outlined text-primary dark:text-secondary text-xl flex-shrink-0 mt-0.5">check_circle</span>
          <span class="text-slate-700 dark:text-gray-300">{{ t('partners.namingRights.benefit3') }}</span>
        </li>
      </ul>
      <div class="button-reveal" style="animation-delay: 0.4s">
        <Button
          variant="primary"
          size="lg"
          class="btn-glow"
          @click="scrollToContact"
        >
          <span class="material-icons-outlined mr-2">handshake</span>
          {{ t('partners.namingRights.cta') }}
        </Button>
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

function scrollToContact() {
  const contactSection = document.getElementById('contact-form')
  if (contactSection) {
    contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

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
.cta-content.revealed .headline-reveal,
.cta-content.revealed .desc-reveal,
.cta-content.revealed .benefits-reveal,
.cta-content.revealed .button-reveal {
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

/* Animated gradient background */
@keyframes gradient-bg {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

.animate-gradient-bg {
  background-size: 200% 200%;
  animation: gradient-bg 8s ease infinite;
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
  
  .cta-content.revealed .headline-reveal,
  .cta-content.revealed .desc-reveal,
  .cta-content.revealed .benefits-reveal,
  .cta-content.revealed .button-reveal {
    animation: none;
    opacity: 1;
  }
  
  .animate-gradient-bg {
    animation: none;
  }
  
  .btn-glow::before {
    animation: none;
  }
}
</style>

