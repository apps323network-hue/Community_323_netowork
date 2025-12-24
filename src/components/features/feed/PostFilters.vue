<template>
  <div class="flex flex-wrap gap-2 sm:gap-3">
    <button
      v-for="filter in filters"
      :key="filter.id"
      :class="[
        'flex h-10 shrink-0 items-center justify-center gap-2 rounded-full px-4 sm:px-5 transition-all text-sm font-medium whitespace-nowrap',
        activeFilter === filter.id
          ? 'bg-primary text-white shadow-[0_0_15px_rgba(244,37,244,0.4)]'
          : 'bg-white dark:bg-surface-lighter border border-slate-200 dark:border-white/10 hover:border-primary hover:text-primary dark:hover:text-primary'
      ]"
      @click="$emit('filter-change', filter.id)"
    >
      <span v-if="filter.icon" class="text-base sm:text-lg leading-none">{{ filter.icon }}</span>
      <span class="leading-tight">{{ filter.label }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import type { PostType } from '@/types/posts'

interface Filter {
  id: PostType | 'all'
  label: string
  icon?: string
}

interface Props {
  activeFilter: PostType | 'all'
}

defineProps<Props>()

defineEmits<{
  'filter-change': [filter: PostType | 'all']
}>()

const filters: Filter[] = [
  { id: 'all', label: 'Todos', icon: '📋' },
  { id: 'networking', label: 'Networking', icon: '🤝' },
  { id: 'ofereco_servico', label: 'Ofereço Serviço', icon: '💼' },
  { id: 'procuro_ajuda', label: 'Procuro Ajuda', icon: '🔎' },
  { id: 'oportunidade', label: 'Oportunidade', icon: '📣' },
]
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>

