<template>
  <section class="py-16 sm:py-20 md:py-24 bg-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Title -->
      <div class="text-center mb-12 md:mb-16">
        <h2 class="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 mb-4">
          {{ t('partners.plans.title') }}
        </h2>
        <p class="text-lg text-slate-600 max-w-2xl mx-auto">
          {{ t('partners.plans.description') }}
        </p>
        <div class="w-24 h-1 bg-neon-gradient mx-auto rounded-full mt-4"></div>
      </div>

      <!-- Plans Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        <div
          v-for="(plan, index) in plans"
          :key="index"
            :class="[
            'relative bg-slate-50 rounded-xl p-6 lg:p-8 border-2 transition-all duration-300',
            plan.popular
              ? 'border-primary shadow-xl scale-105'
              : 'border-slate-200 hover:border-primary/50 hover:shadow-lg'
          ]"
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
            <h3 class="text-2xl font-black text-slate-900 mb-2">
              {{ t(`partners.plans.${plan.key}.title`) }}
            </h3>
            <p class="text-slate-600 text-sm mb-4">
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
              <span class="material-icons-outlined text-primary text-lg flex-shrink-0 mt-0.5">check_circle</span>
              <span class="text-slate-700 text-sm leading-relaxed">
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
import { useI18n } from 'vue-i18n'
import Button from '@/components/ui/Button.vue'

const { t } = useI18n()

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
</script>

