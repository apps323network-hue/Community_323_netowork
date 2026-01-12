<template>
  <div class="bg-white dark:bg-surface-card p-6 rounded-2xl border border-slate-200 dark:border-white/5 hover:border-primary/50 hover:shadow-[0_0_20px_rgba(244,37,244,0.15)] transition-all flex flex-col gap-4 group h-full">
    <div class="flex justify-between items-start">
      <div class="size-12 rounded-xl bg-slate-100 dark:bg-[#0f0515] flex items-center justify-center border border-slate-200 dark:border-white/10 group-hover:border-primary group-hover:shadow-[0_0_10px_rgba(244,37,244,0.4)] transition-all duration-300">
        <span class="material-symbols-outlined text-slate-500 dark:text-gray-400 group-hover:text-primary text-[28px] transition-colors">{{ icon }}</span>
      </div>
      <span 
        :class="[
          'text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider',
          categoryBadgeClass
        ]"
      >
        {{ categoryLabel }}
      </span>
    </div>
    
    <div class="flex-grow">
      <h5 class="text-lg font-bold text-slate-900 dark:text-white mb-1 group-hover:text-primary transition-colors">{{ currentLocale === 'pt-BR' ? benefit.nome_pt : (benefit.nome_en || benefit.nome_pt) }}</h5>
      <p class="text-sm text-slate-600 dark:text-gray-400 leading-snug">{{ currentLocale === 'pt-BR' ? benefit.descricao_pt : (benefit.descricao_en || benefit.descricao_pt) }}</p>
    </div>
    
    <!-- Estado -->
    <div class="mt-auto">
      <!-- Resgatado -->
      <div v-if="isClaimed" class="w-full py-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-sm font-bold text-emerald-400 text-center flex items-center justify-center gap-2">
        <span class="material-symbols-outlined text-[18px]">check_circle</span>
        {{ t('benefits.claimed') }}
      </div>
      
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useLocale } from '@/composables/useLocale'
import type { Benefit } from '@/types/benefits'

const { locale: currentLocale, t } = useLocale()

interface Props {
  benefit: Benefit
  isClaimed?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isClaimed: false
})

defineEmits<{
  claim: []
}>()

// Map de ícones por tipo/categoria
const iconMap: Record<string, string> = {
  // Categorias
  'LIFESTYLE': 'fitness_center',
  'EDUCAÇÃO': 'school',
  'TECH': 'computer',
  'SERVIÇOS': 'handshake',
  'EVENTOS': 'event',
  'FINANÇAS': 'attach_money',
  'COWORKING': 'desk',
  'VIAGEM': 'flight',
  'JURÍDICO': 'gavel',
  // Fallbacks por tipo
  'fixo': 'star',
  'mensal': 'calendar_today',
  'plano': 'workspace_premium'
}

const icon = computed(() => {
  if (props.benefit.categoria && iconMap[props.benefit.categoria]) {
    return iconMap[props.benefit.categoria]
  }
  return iconMap[props.benefit.tipo] || 'card_giftcard'
})

// Map de badges coloridos por categoria
const categoryBadgeMap = computed<Record<string, { label: string, class: string }>>(() => ({
  'LIFESTYLE': { label: t('benefits.categories.lifestyle'), class: 'bg-[#f425f4]/10 text-[#f425f4] border border-[#f425f4]/20' },
  'EDUCAÇÃO': { label: t('benefits.categories.education'), class: 'bg-[#00f3ff]/10 text-[#00f3ff] border border-[#00f3ff]/20' },
  'TECH': { label: t('benefits.categories.tech'), class: 'bg-blue-400/10 text-blue-400 border border-blue-400/20' },
  'SERVIÇOS': { label: t('benefits.categories.services'), class: 'bg-purple-400/10 text-purple-400 border border-purple-400/20' },
  'EVENTOS': { label: t('benefits.categories.events'), class: 'bg-yellow-400/10 text-yellow-400 border border-yellow-400/20' },
  'FINANÇAS': { label: t('benefits.categories.finance'), class: 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20' },
  'COWORKING': { label: t('benefits.categories.coworking'), class: 'bg-orange-400/10 text-orange-400 border border-orange-400/20' },
  'VIAGEM': { label: t('benefits.categories.travel'), class: 'bg-sky-400/10 text-sky-400 border border-sky-400/20' },
  'JURÍDICO': { label: t('benefits.categories.legal'), class: 'bg-indigo-400/10 text-indigo-400 border border-indigo-400/20' },
  
  // Fallbacks por tipo (mantendo compatibilidade)
  'fixo': { label: t('benefits.categories.partner'), class: 'bg-[#f425f4]/10 text-[#f425f4] border border-[#f425f4]/20' },
  'mensal': { label: t('benefits.categories.monthly'), class: 'bg-[#00f3ff]/10 text-[#00f3ff] border border-[#00f3ff]/20' },
  'plano': { label: t('benefits.categories.plan'), class: 'bg-white/10 text-white border border-white/20' }
}))

const categoryLabel = computed(() => {
  if (props.benefit.categoria) {
    const key = `benefits.categories.${props.benefit.categoria.toLowerCase()}`
    const translated = t(key)
    return translated === key ? props.benefit.categoria.toUpperCase() : translated.toUpperCase()
  }
  return categoryBadgeMap.value[props.benefit.tipo]?.label || props.benefit.tipo.toUpperCase()
})

const categoryBadgeClass = computed(() => {
  if (props.benefit.categoria && categoryBadgeMap.value[props.benefit.categoria]) {
    return categoryBadgeMap.value[props.benefit.categoria].class
  }
  return categoryBadgeMap.value[props.benefit.tipo]?.class || 'bg-gray-500/10 text-gray-400 border border-gray-500/20'
})
</script>
