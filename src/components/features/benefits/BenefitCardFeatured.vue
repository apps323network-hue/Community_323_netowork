<template>
  <div class="group relative flex flex-col justify-end overflow-hidden rounded-xl h-72 bg-white dark:bg-surface-card border border-slate-200 dark:border-white/10 hover:border-primary transition-all duration-300 neon-glow cursor-pointer shadow-lg">
    <!-- Imagem de Fundo -->
    <div 
      v-if="benefit.imagem_url"
      class="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
      :style="`background-image: url('${benefit.imagem_url}');`"
    ></div>
    <div v-else class="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20"></div>
    
    <!-- Overlay Gradient -->
    <div class="absolute inset-0 bg-gradient-to-t from-white/90 via-white/80 to-transparent dark:from-background-dark dark:via-surface-card/90 dark:to-transparent opacity-90"></div>
    
    <!-- Conteúdo -->
    <div class="relative z-10 p-6 flex flex-col gap-3">
      <div class="flex items-center justify-between mb-1">
        
        <!-- Badge -->
        <span 
          v-if="!isClaimed"
          class="text-xs font-bold bg-primary/20 border border-primary text-primary px-3 py-1 rounded-full shadow-[0_0_10px_rgba(244,37,244,0.3)]"
        >
          {{ badgeText }}
        </span>
        <span 
          v-else
          class="text-xs font-bold bg-emerald-500/20 border border-emerald-500 text-emerald-400 px-3 py-1 rounded-full"
        >
          {{ t('benefits.claimed') }}
        </span>
      </div>
      
      <div>
        <h4 class="text-xl font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">{{ benefit.nome }}</h4>
        <p class="text-sm text-slate-700 dark:text-gray-300 mt-1 line-clamp-2">{{ benefit.descricao }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Benefit } from '@/types/benefits'

const { t } = useI18n()

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

const badgeText = computed(() => {
  if (props.benefit.categoria) {
    const key = `benefits.categories.${props.benefit.categoria.toLowerCase()}`
    const translated = t(key)
    return translated === key ? props.benefit.categoria.toUpperCase() : translated.toUpperCase()
  }
  if (props.benefit.tipo === 'mensal') return t('benefits.currentMonth')
  return t('benefits.featured')
})
</script>

<style scoped>
.neon-glow:hover {
  box-shadow: 0 0 25px rgba(244, 37, 244, 0.25), 0 0 10px rgba(0, 243, 255, 0.15);
  border-color: #f425f4;
}
</style>
