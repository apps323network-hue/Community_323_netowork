<template>
  <div :class="borderClasses">
    <div :class="avatarClasses" class="overflow-hidden">
      <img
        v-if="shouldShowImage"
        :src="src"
        :alt="alt || name"
        class="w-full h-full rounded-full object-cover"
        @error="handleImageError"
      />
      <div
        v-else
        class="w-full h-full rounded-full bg-gradient-to-br from-secondary to-primary flex items-center justify-center text-white font-bold"
      >
        {{ initials }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface Props {
  src?: string
  alt?: string
  name?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  border?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  src: '',
  alt: '',
  name: '',
  size: 'md',
  border: true,
})

const imageError = ref(false)

function handleImageError() {
  imageError.value = true
}

const initials = computed(() => {
  if (!props.name) return '?'
  return props.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
})

const borderClasses = computed(() => {
  if (!props.border) return ''
  return 'p-[2px] bg-gradient-to-br from-secondary via-white to-primary shadow-glow-secondary rounded-full inline-block'
})

const avatarClasses = computed(() => {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-16 h-16 text-lg',
    xl: 'w-32 h-32 text-2xl',
    '2xl': 'w-40 h-40 text-3xl',
  }

  return [
    'relative flex-shrink-0 rounded-full',
    sizes[props.size],
  ].join(' ')
})

const shouldShowImage = computed(() => {
  return props.src && props.src.trim() && !imageError.value
})
</script>
