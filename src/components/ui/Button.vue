<template>
  <button
    :class="buttonClasses"
    :disabled="disabled || loading"
    @click="$emit('click', $event)"
  >
    <span v-if="loading" class="inline-flex items-center justify-center">
      <span class="material-icons-outlined animate-spin mr-2 text-base">refresh</span>
    </span>
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  fullWidth?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
  fullWidth: false,
})

defineEmits<{
  click: [event: MouseEvent]
}>()

const buttonClasses = computed(() => {
  const base = 'font-bold rounded-lg transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none'

  const variants = {
    primary: 'bg-neon-gradient text-white dark:text-black hover:shadow-neon-pink dark:hover:shadow-neon-pink hover:shadow-light-primary hover:text-black dark:hover:text-black',
    secondary: 'bg-secondary text-black hover:shadow-neon-blue dark:hover:shadow-neon-blue hover:shadow-light-secondary',
    outline: 'bg-transparent border border-secondary-dark dark:border-secondary text-secondary-dark dark:text-secondary hover:bg-secondary hover:text-black dark:hover:bg-secondary dark:hover:text-black',
    ghost: 'bg-transparent text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10',
  }

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  }

  return [
    base,
    variants[props.variant],
    sizes[props.size],
    props.fullWidth && 'w-full',
  ].filter(Boolean).join(' ')
})
</script>

