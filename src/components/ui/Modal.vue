<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-300"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-hidden"
        @click.self="closeModal"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm"></div>

        <!-- Modal Content -->
        <Transition
          enter-active-class="transition-all duration-300"
          enter-from-class="opacity-0 scale-95 translate-y-4"
          enter-to-class="opacity-100 scale-100 translate-y-0"
          leave-active-class="transition-all duration-300"
          leave-from-class="opacity-100 scale-100 translate-y-0"
          leave-to-class="opacity-0 scale-95 translate-y-4"
        >
          <div
            v-if="modelValue"
            :class="[
              'relative z-10 w-full max-w-lg rounded-xl sm:rounded-2xl',
              'bg-white dark:bg-surface-dark',
              'border border-slate-200 dark:border-white/10',
              'shadow-2xl',
              'max-h-[90vh] sm:max-h-[85vh] flex flex-col overflow-hidden',
              'h-[90vh] sm:h-[85vh]',
              sizeClasses
            ]"
          >
            <!-- Header -->
            <div v-if="$slots.header || title" class="flex items-center justify-between p-4 sm:p-6 border-b border-slate-200 dark:border-white/10 flex-shrink-0">
              <h3 v-if="title" class="text-lg sm:text-xl font-bold text-slate-900 dark:text-white pr-2">
                {{ title }}
              </h3>
              <slot name="header" />
              <button
                v-if="closable"
                class="ml-auto p-2 rounded-lg text-slate-400 hover:text-primary dark:hover:text-secondary transition-colors flex-shrink-0 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"
                @click="closeModal"
              >
                <span class="material-symbols-outlined text-xl sm:text-base">close</span>
              </button>
            </div>

            <!-- Body -->
            <div class="p-4 sm:p-6 flex-1 overflow-y-auto overflow-x-hidden min-h-0">
              <slot />
            </div>

            <!-- Footer -->
            <div v-if="$slots.footer" class="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 p-4 sm:p-6 border-t border-slate-200 dark:border-white/10 flex-shrink-0">
              <slot name="footer" />
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  modelValue: boolean
  title?: string
  closable?: boolean
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const props = withDefaults(defineProps<Props>(), {
  closable: true,
  size: 'md',
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const sizeClasses = computed(() => {
  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }
  return sizes[props.size]
})

function closeModal() {
  emit('update:modelValue', false)
}
</script>

