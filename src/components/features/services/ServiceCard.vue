<template>
  <div class="group relative flex flex-col justify-between gap-2.5 sm:gap-3 md:gap-4 rounded-lg sm:rounded-xl border border-slate-200 dark:border-white/5 bg-white dark:bg-surface-card backdrop-blur-sm p-3 sm:p-4 md:p-6 transition-all duration-300 hover:-translate-y-1 hover:border-secondary/50 hover:shadow-[0_0_30px_-5px_rgba(0,243,255,0.15)]">
    <!-- Featured Badge -->
    <div
      v-if="service.destaque"
      class="absolute top-2 sm:top-3 md:top-4 right-2 sm:right-3 md:right-4 z-10 opacity-100 group-hover:opacity-0 transition-opacity"
    >
      <span class="bg-primary/20 text-primary text-[8px] sm:text-[9px] md:text-[10px] font-bold px-1 sm:px-1.5 md:px-2 py-0.5 rounded uppercase tracking-wide border border-primary/20 shadow-[0_0_10px_rgba(244,37,244,0.3)]">
        {{ t('services.featured') }}
      </span>
    </div>

    <!-- Arrow on hover -->
    <div class="absolute top-0 right-0 p-1.5 sm:p-2 md:p-4 opacity-0 group-hover:opacity-100 transition-opacity z-20">
      <span class="material-symbols-outlined text-secondary text-base sm:text-lg md:text-xl">arrow_outward</span>
    </div>

    <div>
      <!-- Icon based on category or default -->
      <div class="mb-2.5 sm:mb-3 md:mb-4 inline-flex items-center justify-center rounded-lg border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 p-1.5 sm:p-2 md:p-3 text-secondary shadow-[0_0_10px_rgba(0,243,255,0.1)] group-hover:bg-secondary group-hover:text-black group-hover:shadow-[0_0_20px_rgba(0,243,255,0.6)] transition-all duration-300">
        <span class="material-symbols-outlined text-xl sm:text-2xl md:text-[28px] lg:text-[32px]">{{ getIcon(service.categoria) }}</span>
      </div>

      <!-- Title -->
      <h3 class="text-slate-900 dark:text-white text-base sm:text-lg md:text-xl font-bold leading-tight mb-1 sm:mb-1.5 md:mb-2">
        {{ service.nome }}
      </h3>

      <!-- Description -->
      <p class="text-slate-600 dark:text-gray-400 text-[11px] sm:text-xs md:text-sm font-normal leading-relaxed mb-2.5 sm:mb-3 md:mb-4 line-clamp-2">
        {{ service.descricao }}
      </p>

      <!-- Price Section -->
      <div v-if="service.preco" class="mb-4">
        <div v-if="isAuthenticated" class="flex items-baseline gap-2">
          <span class="text-2xl font-bold text-slate-900 dark:text-white">{{ formatPrice(service.preco, service.moeda) }}</span>
          <span class="text-xs text-slate-500 dark:text-gray-500 uppercase">{{ service.moeda || 'USD' }}</span>
        </div>
        <div v-else class="flex items-center gap-2">
          <div class="px-3 py-1 bg-white/5 border border-white/10 rounded-md backdrop-blur-sm grayscale opacity-50 select-none cursor-pointer" @click="showAuthModal('signup')">
            <span class="text-sm font-bold text-white/50 blur-[2px]">$99.99</span>
          </div>
          <span class="text-[10px] font-bold text-secondary uppercase tracking-tight">Login para ver preço</span>
        </div>
      </div>

      <!-- Benefit Section -->
      <div v-if="service.beneficio_membro" class="flex flex-col gap-1 sm:gap-1.5 p-2 sm:p-2.5 md:p-3 rounded-lg bg-secondary/5 border border-secondary/20 group-hover:bg-secondary/10 transition-colors">
        <div class="flex items-center gap-1 sm:gap-1.5 text-secondary">
          <span class="material-symbols-outlined text-sm sm:text-base md:text-[18px]">workspace_premium</span>
          <span class="text-[9px] sm:text-[10px] md:text-xs font-bold uppercase tracking-wider">{{ t('services.memberBenefit') }}</span>
        </div>
        <p class="text-slate-600 dark:text-gray-300 text-[10px] sm:text-[11px] md:text-xs font-medium leading-relaxed">
          {{ service.beneficio_membro }}
        </p>
      </div>
    </div>

    <!-- Button -->
    <button
      class="mt-2 w-full rounded-lg py-2.5 text-center text-sm font-bold transition-all duration-300"
      :class="service.preco 
        ? 'bg-gradient-to-r from-primary to-secondary text-black hover:shadow-[0_0_20px_rgba(244,37,244,0.4)]' 
        : 'border border-secondary/50 bg-transparent text-secondary group-hover:bg-secondary group-hover:text-black hover:shadow-[0_0_15px_rgba(0,243,255,0.4)]'"
      @click="handleAction"
    >
      {{ service.preco ? t('services.contractService') : t('services.requestSupport') }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { usePublicAccess } from '@/composables/usePublicAccess'

const { t } = useI18n()
const { isAuthenticated, showAuthModal } = usePublicAccess()

interface Service {
  id: string
  nome: string
  descricao: string
  categoria: string
  beneficio_membro: string
  destaque: boolean
  parceiro_id: string
  preco?: number
  moeda?: string
}

const props = defineProps<{
  service: Service
}>()

const emit = defineEmits<{
  'request-service': [service: Service]
}>()

function getIcon(category: string) {
  switch (category) {
    case 'legal': return 'domain'
    case 'finance': return 'account_balance'
    case 'mentoring': return 'badge'
    case 'marketing': return 'campaign'
    default: return 'hub'
  }
}

function formatPrice(cents: number, currency: string = 'USD'): string {
  const amount = cents / 100
  if (currency === 'BRL') {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount)
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

function handleAction() {
  if (!isAuthenticated.value) {
    showAuthModal('signup')
    return
  }
  emit('request-service', props.service)
}
</script>
