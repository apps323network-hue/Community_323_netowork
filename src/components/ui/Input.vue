<template>
  <div class="relative group">
    <label v-if="label" :for="inputId" class="block text-sm font-semibold text-gray-300 mb-2">
      {{ label }}
    </label>
    <input
      :id="inputId"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :class="inputClasses"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      @focus="$emit('focus', $event)"
      @blur="$emit('blur', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  modelValue: string
  type?: string
  label?: string
  placeholder?: string
  disabled?: boolean
}

withDefaults(defineProps<Props>(), {
  type: 'text',
  label: '',
  placeholder: '',
  disabled: false,
})

defineEmits<{
  'update:modelValue': [value: string]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
}>()

const inputId = computed(() => `input-${Math.random().toString(36).substr(2, 9)}`)

const inputClasses = computed(() => {
  return [
    'block w-full px-4 py-3 border rounded-xl bg-input-bg border-input-border',
    'text-white placeholder-gray-500',
    'focus:outline-none focus:ring-1 focus:ring-secondary focus:border-secondary',
    'focus:shadow-neon-blue transition-all duration-300',
    'disabled:opacity-50 disabled:cursor-not-allowed',
  ].join(' ')
})
</script>

