<template>
  <span
    class="inline-flex items-center gap-1.5 rounded-full font-semibold"
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
  size?: 'sm' | 'md'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md'
})

const label = computed(() => {
  const labels: Record<UserStatus, string> = {
    pending: 'Pending',
    active: 'Active',
    suspended: 'Suspended',
    banned: 'Banned',
  }
  return labels[props.status]
})

const badgeClass = computed(() => {
  const baseClasses: Record<UserStatus, string> = {
    pending: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
    active: 'bg-green-500/20 text-green-400 border border-green-500/30',
    suspended: 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
    banned: 'bg-red-500/20 text-red-400 border border-red-500/30',
  }

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2 sm:px-3 py-1 text-xs'
  }

  return `${baseClasses[props.status]} ${sizeClasses[props.size]}`
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

