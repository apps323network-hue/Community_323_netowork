<template>
  <div class="group relative flex flex-col justify-between gap-2.5 sm:gap-3 md:gap-4 rounded-lg sm:rounded-xl border border-white/10 bg-surface-dark/50 backdrop-blur-sm p-3 sm:p-4 md:p-6 transition-all duration-300 hover:-translate-y-1 hover:border-secondary/50 hover:shadow-[0_0_30px_-5px_rgba(0,243,255,0.15)]">
    <!-- Featured Badge -->
    <div
      v-if="service.destaque"
      class="absolute top-2 sm:top-3 md:top-4 right-2 sm:right-3 md:right-4 z-10 opacity-100 group-hover:opacity-0 transition-opacity"
    >
      <span class="bg-primary/20 text-primary text-[8px] sm:text-[9px] md:text-[10px] font-bold px-1 sm:px-1.5 md:px-2 py-0.5 rounded uppercase tracking-wide border border-primary/20 shadow-[0_0_10px_rgba(244,37,244,0.3)]">
        Destaque
      </span>
    </div>

    <!-- Arrow on hover -->
    <div class="absolute top-0 right-0 p-1.5 sm:p-2 md:p-4 opacity-0 group-hover:opacity-100 transition-opacity z-20">
      <span class="material-symbols-outlined text-secondary text-base sm:text-lg md:text-xl">arrow_outward</span>
    </div>

    <div>
      <!-- Icon based on category or default -->
      <div class="mb-2.5 sm:mb-3 md:mb-4 inline-flex items-center justify-center rounded-lg border border-white/10 bg-white/5 p-1.5 sm:p-2 md:p-3 text-secondary shadow-[0_0_10px_rgba(0,243,255,0.1)] group-hover:bg-secondary group-hover:text-black group-hover:shadow-[0_0_20px_rgba(0,243,255,0.6)] transition-all duration-300">
        <span class="material-symbols-outlined text-xl sm:text-2xl md:text-[28px] lg:text-[32px]">{{ getIcon(service.categoria) }}</span>
      </div>

      <!-- Title -->
      <h3 class="text-white text-base sm:text-lg md:text-xl font-bold leading-tight mb-1 sm:mb-1.5 md:mb-2">
        {{ service.nome }}
      </h3>

      <!-- Description -->
      <p class="text-gray-400 text-[11px] sm:text-xs md:text-sm font-normal leading-relaxed mb-2.5 sm:mb-3 md:mb-4 line-clamp-2">
        {{ service.descricao }}
      </p>

      <!-- Benefit Section -->
      <div v-if="service.beneficio_membro" class="flex flex-col gap-1 sm:gap-1.5 p-2 sm:p-2.5 md:p-3 rounded-lg bg-secondary/5 border border-secondary/20 group-hover:bg-secondary/10 transition-colors">
        <div class="flex items-center gap-1 sm:gap-1.5 text-secondary">
          <span class="material-symbols-outlined text-sm sm:text-base md:text-[18px]">workspace_premium</span>
          <span class="text-[9px] sm:text-[10px] md:text-xs font-bold uppercase tracking-wider">Benefício Membro</span>
        </div>
        <p class="text-gray-300 text-[10px] sm:text-[11px] md:text-xs font-medium leading-relaxed">
          {{ service.beneficio_membro }}
        </p>
      </div>
    </div>

    <!-- Button -->
    <button
      class="mt-2 w-full rounded-lg border border-secondary/50 bg-transparent py-1.5 sm:py-2 md:py-2.5 text-center text-[10px] sm:text-xs md:text-sm font-bold text-secondary transition-all duration-300 group-hover:bg-secondary group-hover:text-black hover:shadow-[0_0_15px_rgba(0,243,255,0.4)]"
      @click="$emit('request-service', service)"
    >
      Solicitar Atendimento
    </button>
  </div>
</template>

<script setup lang="ts">
interface Service {
  id: string
  nome: string
  descricao: string
  categoria: string
  beneficio_membro: string
  destaque: boolean
  parceiro_id: string
}

defineProps<{
  service: Service
}>()

defineEmits<{
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
</script>
