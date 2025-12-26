<template>
  <div class="bg-[#1a0a1f] p-6 rounded-2xl border border-white/10 hover:border-primary/50 hover:shadow-[0_0_20px_rgba(244,37,244,0.15)] transition-all flex flex-col gap-4 group h-full">
    <div class="flex justify-between items-start">
      <div class="size-12 rounded-xl bg-[#0f0515] flex items-center justify-center border border-white/10 group-hover:border-primary group-hover:shadow-[0_0_10px_rgba(244,37,244,0.4)] transition-all duration-300">
        <span class="material-symbols-outlined text-gray-400 group-hover:text-primary text-[28px] transition-colors">{{ icon }}</span>
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
      <h5 class="text-lg font-bold text-white mb-1 group-hover:text-primary transition-colors">{{ benefit.nome }}</h5>
      <p class="text-sm text-gray-400 leading-snug">{{ benefit.descricao }}</p>
    </div>
    
    <!-- Estado -->
    <div class="mt-auto">
      <!-- Resgatado -->
      <div v-if="isClaimed" class="w-full py-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-sm font-bold text-emerald-400 text-center flex items-center justify-center gap-2">
        <span class="material-symbols-outlined text-[18px]">check_circle</span>
        Resgatado
      </div>
      
      <!-- Bloqueado -->
      <button
        v-else-if="isLocked"
        @click="$emit('upgrade')"
        class="mt-auto w-full py-2.5 rounded-lg bg-[#0f0515] border border-white/10 text-sm font-bold text-gray-400 hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-all flex items-center justify-center gap-1"
      >
        <span class="material-symbols-outlined text-[16px]">lock</span>
        Plano {{ benefit.plano_requerido }}
      </button>
      
      <!-- Disponível -->
      <button
        v-else
        @click="$emit('claim')"
        class="mt-auto w-full py-2.5 rounded-lg bg-[#0f0515] border border-white/10 text-sm font-bold text-white group-hover:bg-primary group-hover:border-primary group-hover:shadow-[0_0_15px_rgba(244,37,244,0.3)] transition-all"
      >
        Ver Detalhes
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Benefit } from '@/types/benefits'

interface Props {
  benefit: Benefit
  isClaimed?: boolean
  isLocked?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isClaimed: false,
  isLocked: false
})

defineEmits<{
  claim: []
  upgrade: []
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
const categoryBadgeMap: Record<string, { label: string, class: string }> = {
  'LIFESTYLE': { label: 'LIFESTYLE', class: 'bg-[#f425f4]/10 text-[#f425f4] border border-[#f425f4]/20' },
  'EDUCAÇÃO': { label: 'EDUCAÇÃO', class: 'bg-[#00f3ff]/10 text-[#00f3ff] border border-[#00f3ff]/20' },
  'TECH': { label: 'TECH', class: 'bg-blue-400/10 text-blue-400 border border-blue-400/20' },
  'SERVIÇOS': { label: 'SERVIÇOS', class: 'bg-purple-400/10 text-purple-400 border border-purple-400/20' },
  'EVENTOS': { label: 'EVENTOS', class: 'bg-yellow-400/10 text-yellow-400 border border-yellow-400/20' },
  'FINANÇAS': { label: 'FINANÇAS', class: 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20' },
  'COWORKING': { label: 'COWORKING', class: 'bg-orange-400/10 text-orange-400 border border-orange-400/20' },
  'VIAGEM': { label: 'VIAGEM', class: 'bg-sky-400/10 text-sky-400 border border-sky-400/20' },
  'JURÍDICO': { label: 'JURÍDICO', class: 'bg-indigo-400/10 text-indigo-400 border border-indigo-400/20' },
  
  // Fallbacks por tipo (mantendo compatibilidade)
  'fixo': { label: 'PARCEIRO', class: 'bg-[#f425f4]/10 text-[#f425f4] border border-[#f425f4]/20' },
  'mensal': { label: 'MENSAL', class: 'bg-[#00f3ff]/10 text-[#00f3ff] border border-[#00f3ff]/20' },
  'plano': { label: 'PLANO', class: 'bg-white/10 text-white border border-white/20' }
}

const categoryLabel = computed(() => {
  if (props.benefit.categoria) return props.benefit.categoria.toUpperCase()
  return categoryBadgeMap[props.benefit.tipo]?.label || props.benefit.tipo.toUpperCase()
})

const categoryBadgeClass = computed(() => {
  if (props.benefit.categoria && categoryBadgeMap[props.benefit.categoria]) {
    return categoryBadgeMap[props.benefit.categoria].class
  }
  return categoryBadgeMap[props.benefit.tipo]?.class || 'bg-gray-500/10 text-gray-400 border border-gray-500/20'
})
</script>
