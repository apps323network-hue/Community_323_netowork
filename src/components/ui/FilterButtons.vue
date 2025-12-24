<template>
  <div class="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
    <button
      v-for="filter in filters"
      :key="filter.id"
      :class="[
        'flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-full px-5 transition-all',
        modelValue === filter.id
          ? 'bg-primary text-white shadow-[0_0_15px_rgba(244,37,244,0.4)] hover:scale-105'
          : 'bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 hover:border-secondary hover:text-secondary-dark dark:hover:text-secondary text-slate-600 dark:text-gray-400 shadow-sm'
      ]"
      @click="$emit('update:modelValue', filter.id)"
    >
      <span v-if="filter.icon" class="material-symbols-outlined text-[18px]">{{ filter.icon }}</span>
      <span class="text-sm font-medium">{{ filter.label }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
interface Filter {
  id: string | number
  label: string
  icon?: string
}

interface Props {
  modelValue: string | number
  filters: Filter[]
}

defineProps<Props>()

defineEmits<{
  'update:modelValue': [value: string | number]
}>()
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

