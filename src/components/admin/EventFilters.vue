<template>
  <div class="flex gap-3 overflow-x-auto no-scrollbar pb-1">
    <button
      v-for="filter in filters"
      :key="filter.id"
      class="flex h-9 shrink-0 items-center justify-center rounded-full px-6 text-sm font-medium transition-all"
      :class="activeFilter === filter.id
        ? 'bg-neon-gradient text-black font-black shadow-neon-pink'
        : 'bg-white dark:bg-surface-card hover:bg-slate-50 dark:hover:bg-surface-highlight text-slate-700 dark:text-white/80 hover:text-secondary border border-slate-200 dark:border-white/10 hover:border-secondary'"
      @click="handleFilterClick(filter.id)"
    >
      {{ filter.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
import type { EventStatus } from '@/types/events'

interface Filter {
  id: EventStatus | 'all'
  label: string
}

interface Props {
  activeFilter: EventStatus | 'all'
}

interface Emits {
  (e: 'filter-change', filterId: EventStatus | 'all'): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const filters: Filter[] = [
  { id: 'all', label: 'Todos' },
  { id: 'pending', label: 'Pendentes' },
  { id: 'approved', label: 'Aprovados' },
  { id: 'rejected', label: 'Rejeitados' },
]

function handleFilterClick(filterId: EventStatus | 'all') {
  emit('filter-change', filterId)
}
</script>

<style scoped>
.bg-neon-gradient {
  background: linear-gradient(135deg, #f425f4 0%, #00f0ff 100%);
}

.shadow-neon-pink {
  box-shadow: 0 0 15px rgba(244, 37, 244, 0.3);
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}

.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>

