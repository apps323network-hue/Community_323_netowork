<template>
  <section 
    id="plans"
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
          {{ t('partners.plans.title') }}
        </h2>
        <p class="text-lg text-slate-600 dark:text-gray-400 max-w-2xl mx-auto">
          {{ t('partners.plans.description') }}
        </p>
        <div class="w-24 h-1 bg-neon-gradient mx-auto rounded-full mt-4"></div>
      </div>

      <!-- Plans Grid -->
      <div 
        ref="gridRef"
        class="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8"
      >
        <div
          v-for="(plan, index) in plans"
          :key="index"
          :class="[
            'plan-card relative bg-white dark:bg-surface-lighter rounded-xl p-6 lg:p-8 border-2 transition-all duration-300',
            plan.popular
              ? 'border-primary shadow-xl scale-105 plan-popular'
              : 'border-slate-200 dark:border-slate-800 hover:border-primary/50 hover:shadow-lg',
            { 'revealed': cardsVisible }
          ]"
          :style="{ transitionDelay: `${index * 150}ms` }"
        >
          <!-- Popular Badge -->
          <div
            v-if="plan.popular"
            class="absolute -top-4 left-1/2 transform -translate-x-1/2"
          >
            <span class="bg-neon-gradient text-white px-4 py-1 rounded-full text-xs font-bold">
              {{ t('partners.plans.mostPopular') }}
            </span>
          </div>

          <!-- Plan Header -->
          <div class="mb-6">
            <h3 class="text-2xl font-black text-slate-900 dark:text-white mb-2">
              {{ t(`partners.plans.${plan.key}.title`) }}
            </h3>
            <p class="text-slate-700 dark:text-gray-300 text-sm mb-4 font-medium">
              {{ t(`partners.plans.${plan.key}.goal`) }}
            </p>
            <div class="text-3xl font-black bg-clip-text text-transparent bg-neon-gradient">
              {{ t('partners.plans.price') }}
            </div>
          </div>

          <!-- Plan Features -->
          <ul class="space-y-3 mb-8">
            <li
              v-for="(feature, featureIndex) in plan.features"
              :key="featureIndex"
              class="flex items-start gap-3"
            >
              <span class="material-icons-outlined text-primary dark:text-secondary text-lg flex-shrink-0 mt-0.5">check_circle</span>
              <span class="text-slate-900 dark:text-gray-200 text-sm leading-relaxed font-medium">
                {{ t(`partners.plans.${plan.key}.features.${feature}`) }}
              </span>
            </li>
          </ul>

          <!-- CTA Button -->
          <Button
            :variant="plan.popular ? 'primary' : 'outline'"
            :full-width="true"
            @click="openContactForm(plan.key)"
          >
            {{ t('partners.plans.cta') }}
          </Button>
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

const plans = [
  {
    key: 'start',
    popular: false,
    features: ['logo', 'post', 'stories', 'presentation', 'website'],
  },
  {
    key: 'grow',
    popular: true,
    features: ['everything', 'dedicated', 'mention', 'qr', 'offer'],
  },
  {
    key: 'impact',
    popular: false,
    features: ['everything', 'video', 'space', 'speaking', 'cta', 'report'],
  },
]

function openContactForm(_planKey: string) {
  const contactSection = document.getElementById('contact-form')
  if (contactSection) {
    contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
    // Aqui pode adicionar lógica para preencher o formulário com o plano selecionado
    // O parâmetro _planKey será usado futuramente para preencher o formulário
  }
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
/* Section reveal animation */
.section-reveal {
  opacity: 0;
  transform: translateY(40px);
  filter: blur(8px);
  transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1),
              transform 0.8s cubic-bezier(0.16, 1, 0.3, 1),
              filter 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

.section-reveal.revealed {
  opacity: 1;
  transform: translateY(0);
  filter: blur(0);
}

/* Plan card staggered animation with blur */
.plan-card {
  opacity: 0;
  transform: translateY(40px) scale(0.92);
  filter: blur(10px);
  transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1),
              transform 0.8s cubic-bezier(0.16, 1, 0.3, 1),
              filter 0.8s cubic-bezier(0.16, 1, 0.3, 1),
              border-color 0.3s ease,
              box-shadow 0.3s ease;
}

.plan-card.revealed {
  opacity: 1;
  transform: translateY(0) scale(1);
  filter: blur(0);
}

/* Popular plan glow effect */
.plan-popular {
  position: relative;
}

.plan-popular::before {
  content: '';
  position: absolute;
  inset: -2px;
  background: linear-gradient(45deg, var(--color-primary), var(--color-secondary), var(--color-primary));
  border-radius: inherit;
  z-index: -1;
  opacity: 0.3;
  filter: blur(15px);
  animation: glow-pulse 3s ease-in-out infinite;
}

@keyframes glow-pulse {
  0%, 100% { opacity: 0.3; filter: blur(15px); }
  50% { opacity: 0.5; filter: blur(20px); }
}

/* Hover effect */
.plan-card:hover {
  transform: translateY(-8px) scale(1.02);
}

/* Reduce motion for accessibility */
@media (prefers-reduced-motion: reduce) {
  .section-reveal,
  .plan-card {
    opacity: 1;
    transform: none;
    filter: none;
    transition: border-color 0.3s ease, box-shadow 0.3s ease;
  }
  
  .plan-popular::before {
    animation: none;
  }
}
</style>

