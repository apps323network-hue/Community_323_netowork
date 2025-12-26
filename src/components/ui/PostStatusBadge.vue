<template>
  <span
    :class="[
      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold',
      badgeClass,
    ]"
  >
    <span class="material-symbols-outlined text-sm">{{ icon }}</span>
    {{ label }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PostStatus } from '@/types/posts'

interface Props {
  status: PostStatus
}

const props = defineProps<Props>()

const label = computed(() => {
  const labels: Record<PostStatus, string> = {
    pending: 'Pendente',
    approved: 'Aprovado',
    hidden: 'Oculto',
    removed: 'Removido',
    spam: 'Spam',
  }
  return labels[props.status] || props.status
})

const icon = computed(() => {
  const icons: Record<PostStatus, string> = {
    pending: 'schedule',
    approved: 'check_circle',
    hidden: 'visibility_off',
    removed: 'delete',
    spam: 'report',
  }
  return icons[props.status] || 'help'
})

const badgeClass = computed(() => {
  const classes: Record<PostStatus, string> = {
    pending: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
    approved: 'bg-green-500/20 text-green-400 border border-green-500/30',
    hidden: 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
    removed: 'bg-red-500/20 text-red-400 border border-red-500/30',
    spam: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
  }
  return classes[props.status] || 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
})
</script>

