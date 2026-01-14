<template>
  <button
    type="button"
    :title="title"
    :disabled="disabled"
    class="w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-300"
    :class="[
      active 
        ? 'bg-primary/20 text-primary shadow-sm' 
        : 'text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-white/5 hover:text-primary dark:hover:text-white',
      disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'
    ]"
  >
    <span class="material-symbols-outlined text-xl">
      {{ icon }}
    </span>
  </button>
</template>

<script setup lang="ts">
defineProps<{
  icon: string
  title?: string
  active?: boolean
  disabled?: boolean
}>()
</script>
