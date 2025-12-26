<template>
  <span
    class="inline-flex items-center gap-1.5 px-2 sm:px-3 py-1 rounded-full text-xs font-semibold"
    :class="badgeClass"
  >
    <span class="w-1.5 h-1.5 rounded-full" :class="dotClass"></span>
    {{ label }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { UserStatus } from '@/types/admin'

interface Props {
  status: UserStatus
}

const props = defineProps<Props>()

const label = computed(() => {
  const labels: Record<UserStatus, string> = {
    pending: 'Pendente',
    active: 'Ativo',
    suspended: 'Suspenso',
    banned: 'Banido',
  }
  return labels[props.status]
})

const badgeClass = computed(() => {
  const classes: Record<UserStatus, string> = {
    pending: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
    active: 'bg-green-500/20 text-green-400 border border-green-500/30',
    suspended: 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
    banned: 'bg-red-500/20 text-red-400 border border-red-500/30',
  }
  return classes[props.status]
})

const dotClass = computed(() => {
  const classes: Record<UserStatus, string> = {
    pending: 'bg-yellow-400',
    active: 'bg-green-400',
    suspended: 'bg-orange-400',
    banned: 'bg-red-400',
  }
  return classes[props.status]
})
</script>

