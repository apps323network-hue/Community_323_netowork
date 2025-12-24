<template>
  <div class="flex gap-3 overflow-x-auto no-scrollbar w-full lg:w-auto pb-1 items-center">
    <button
      v-for="filter in filters"
      :key="filter.id"
      class="flex h-9 shrink-0 items-center justify-center rounded-full text-sm transition-all"
      :class="getButtonClass(filter.id)"
      @click="$emit('filter-change', filter.id)"
    >
      {{ filter.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
interface Filter {
  id: string
  label: string
}

interface Props {
  activeFilter: string
}

const props = defineProps<Props>()

defineEmits<{
  'filter-change': [filter: string]
}>()

const filters: Filter[] = [
  { id: 'all', label: 'Todos' },
  { id: 'networking', label: 'Networking' },
  { id: 'showcase', label: 'Showcase' },
  { id: 'workshop', label: 'Workshop' },
  { id: 'social', label: 'Social' },
]

function getButtonClass(filterId: string): string {
  if (filterId === props.activeFilter) {
    return 'px-8 bg-neon-gradient text-black font-black transition-transform active:scale-95 shadow-neon-pink'
  }
  
  // Hover colors based on filter type (matching Stitch design)
  const hoverColors: Record<string, string> = {
    'networking': 'group px-6 bg-surface-card hover:bg-surface-highlight text-white/80 hover:text-secondary border border-white/10 hover:border-secondary',
    'showcase': 'group px-6 bg-surface-card hover:bg-surface-highlight text-white/80 hover:text-primary border border-white/10 hover:border-primary',
    'workshop': 'group px-6 bg-surface-card hover:bg-surface-highlight text-white/80 hover:text-secondary border border-white/10 hover:border-secondary',
    'social': 'group px-6 bg-surface-card hover:bg-surface-highlight text-white/80 hover:text-primary border border-white/10 hover:border-primary',
  }
  
  return hoverColors[filterId] || 'group px-6 bg-surface-card hover:bg-surface-highlight text-white/80 hover:text-secondary border border-white/10 hover:border-secondary'
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

