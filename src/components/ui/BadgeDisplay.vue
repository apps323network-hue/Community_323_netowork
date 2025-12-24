<template>
  <div
    :class="[
      'inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border transition-all',
      badgeClasses
    ]"
  >
    <span v-if="showIcon && badge.icon" class="material-symbols-outlined text-[14px]">
      {{ badge.icon }}
    </span>
    <span>{{ badge.name }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getBadgeById, BADGES } from '@/types/badges'
import type { Badge } from '@/types/badges'

interface Props {
  badgeId?: string
  badge?: Badge
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  showIcon: true,
})

const badge = computed<Badge>(() => {
  if (props.badge) return props.badge
  if (props.badgeId) {
    const foundBadge = getBadgeById(props.badgeId)
    if (foundBadge) return foundBadge
  }
  return BADGES.Free
})

const badgeClasses = computed(() => {
  const base = 'border'
  
  const colorClasses = {
    gray: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    primary: 'bg-primary/10 text-primary border-primary/20 shadow-glow-primary',
    secondary: 'bg-secondary/10 text-secondary border-secondary/20 shadow-glow-secondary',
    yellow: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  }

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-3 py-1 text-xs',
    lg: 'px-4 py-1.5 text-sm',
  }

  return [
    base,
    colorClasses[badge.value.color as keyof typeof colorClasses] || colorClasses.gray,
    sizeClasses[props.size],
  ].join(' ')
})
</script>

