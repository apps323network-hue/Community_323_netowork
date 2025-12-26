<template>
  <div class="group relative flex flex-col justify-end overflow-hidden rounded-xl h-72 bg-background-card border border-border-dark hover:border-primary transition-all duration-300 neon-glow cursor-pointer shadow-lg">
    <!-- Imagem de Fundo -->
    <div 
      v-if="benefit.imagem_url"
      class="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
      :style="`background-image: url('${benefit.imagem_url}');`"
    ></div>
    <div v-else class="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20"></div>
    
    <!-- Overlay Gradient -->
    <div class="absolute inset-0 bg-gradient-to-t from-background-dark via-background-card/90 to-transparent opacity-90"></div>
    
    <!-- Conteúdo -->
    <div class="relative z-10 p-6 flex flex-col gap-3">
      <div class="flex items-center justify-between mb-1">
        
        <!-- Badge -->
        <span 
          v-if="!isLocked && !isClaimed"
          class="text-xs font-bold bg-primary/20 border border-primary text-primary px-3 py-1 rounded-full shadow-[0_0_10px_rgba(244,37,244,0.3)]"
        >
          {{ badgeText }}
        </span>
        <span 
          v-else-if="isClaimed"
          class="text-xs font-bold bg-emerald-500/20 border border-emerald-500 text-emerald-400 px-3 py-1 rounded-full"
        >
          Resgatado
        </span>
        <span 
          v-else-if="isLocked"
          class="text-xs font-bold bg-white/10 border border-white/20 text-white/60 px-3 py-1 rounded-full flex items-center gap-1"
        >
          <span class="material-symbols-outlined text-[14px]">lock</span>
          {{ benefit.plano_requerido }}
        </span>
      </div>
      
      <div>
        <h4 class="text-xl font-bold text-white group-hover:text-primary transition-colors">{{ benefit.nome }}</h4>
        <p class="text-sm text-gray-300 mt-1 line-clamp-2">{{ benefit.descricao }}</p>
      </div>
      
      <!-- Botão/Ação -->
      <button
        v-if="!isClaimed && !isLocked"
        @click="$emit('claim')"
        class="mt-2 w-full py-2 rounded-lg bg-primary/20 border border-primary/40 text-primary font-bold text-sm hover:bg-primary hover:text-white transition-all"
      >
        Resgatar Agora
      </button>
      <button
        v-else-if="isLocked"
        @click="$emit('upgrade')"
        class="mt-2 w-full py-2 rounded-lg bg-white/5 border border-white/10 text-white/60 font-bold text-sm hover:bg-white/10 transition-all"
      >
        Fazer Upgrade
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

const badgeText = computed(() => {
  if (props.benefit.categoria) return props.benefit.categoria.toUpperCase()
  if (props.benefit.tipo === 'mensal') return 'MÊS ATUAL'
  return 'DESTAQUE'
})
</script>

<style scoped>
.neon-glow:hover {
  box-shadow: 0 0 25px rgba(244, 37, 244, 0.25), 0 0 10px rgba(0, 243, 255, 0.15);
  border-color: #f425f4;
}
</style>
