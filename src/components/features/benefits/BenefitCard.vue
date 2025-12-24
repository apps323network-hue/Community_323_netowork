<template>
  <div
    class="bg-background-card p-6 rounded-2xl border border-border-dark hover:border-primary/50 dark:hover:border-primary/50 hover:shadow-[0_0_20px_rgba(244,37,244,0.15)] transition-all flex flex-col gap-4 group relative overflow-hidden"
    :class="locked ? 'opacity-60' : ''"
  >
    <!-- Locked Overlay -->
    <BenefitLocked v-if="locked" :required-plan="requiredPlan || 'Member'" @upgrade="$emit('upgrade')" />

    <div class="flex justify-between items-start">
      <div
        class="size-12 rounded-xl bg-background-dark flex items-center justify-center border border-border-dark transition-all duration-300"
        :class="[
          locked
            ? 'group-hover:border-gray-600'
            : variant === 'primary'
              ? 'group-hover:border-primary group-hover:shadow-[0_0_10px_rgba(244,37,244,0.4)]'
              : 'group-hover:border-secondary group-hover:shadow-[0_0_10px_rgba(0,243,255,0.4)]'
        ]"
      >
        <span
          class="material-symbols-outlined text-[28px] transition-colors"
          :class="[
            locked
              ? 'text-gray-600'
              : variant === 'primary'
                ? 'text-gray-400 group-hover:text-primary'
                : 'text-gray-400 group-hover:text-secondary'
          ]"
        >
          {{ benefit.icon || 'card_giftcard' }}
        </span>
      </div>
      <Badge :variant="variant" size="sm">
        {{ benefit.categoria }}
      </Badge>
    </div>
    <div>
      <h5
        class="text-lg font-bold text-white mb-1 transition-colors"
        :class="[
          locked
            ? ''
            : variant === 'primary'
              ? 'group-hover:text-primary'
              : 'group-hover:text-secondary'
        ]"
      >
        {{ benefit.titulo }}
      </h5>
      <p class="text-sm text-gray-400 leading-snug">
        {{ benefit.descricao }}
      </p>
    </div>
    <button
      v-if="!locked"
      class="mt-auto w-full py-2.5 rounded-lg bg-background-dark border border-border-dark text-sm font-bold text-white transition-all"
      :class="[
        variant === 'primary'
          ? 'group-hover:bg-primary group-hover:border-primary group-hover:shadow-[0_0_15px_rgba(244,37,244,0.3)]'
          : 'group-hover:bg-secondary group-hover:text-background-dark group-hover:border-secondary group-hover:shadow-[0_0_15px_rgba(0,243,255,0.4)]'
      ]"
      @click="$emit('activate', benefit.id)"
    >
      Ver Detalhes
    </button>
  </div>
</template>

<script setup lang="ts">
import Badge from '@/components/ui/Badge.vue'
import BenefitLocked from './BenefitLocked.vue'

interface Benefit {
  id: string
  titulo: string
  descricao: string
  categoria: string
  icon?: string
  locked?: boolean
  requiredPlan?: 'Member' | 'Premium'
}

interface Props {
  benefit: Benefit
  variant?: 'primary' | 'secondary'
  locked?: boolean
  requiredPlan?: 'Member' | 'Premium'
}

withDefaults(defineProps<Props>(), {
  variant: 'primary',
  locked: false,
})

defineEmits<{
  activate: [benefitId: string]
  upgrade: []
}>()
</script>

