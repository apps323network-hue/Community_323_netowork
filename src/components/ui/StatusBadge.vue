<template>
  <span
    class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
    :class="badgeClass"
  >
    <span class="w-1.5 h-1.5 rounded-full" :class="dotClass"></span>
    {{ label }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { EventStatus } from '@/types/events'

interface Props {
  status: EventStatus
}

const props = defineProps<Props>()

const label = computed(() => {
  const labels: Record<EventStatus, string> = {
    pending: 'Pendente',
    approved: 'Aprovado',
    rejected: 'Rejeitado',
  }
  return labels[props.status]
})

const badgeClass = computed(() => {
  const classes: Record<EventStatus, string> = {
    pending: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
    approved: 'bg-green-500/20 text-green-400 border border-green-500/30',
    rejected: 'bg-red-500/20 text-red-400 border border-red-500/30',
  }
  return classes[props.status]
})

const dotClass = computed(() => {
  const classes: Record<EventStatus, string> = {
    pending: 'bg-yellow-400',
    approved: 'bg-green-400',
    rejected: 'bg-red-400',
  }
  return classes[props.status]
})
</script>


