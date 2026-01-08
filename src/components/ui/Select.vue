<template>
  <div class="relative">
    <button
      type="button"
      :id="selectId"
      :class="[
        'w-full flex items-center justify-between px-4 py-3 rounded-lg border transition-all',
        'bg-white dark:bg-input-bg border-slate-200 dark:border-input-border',
        'text-slate-900 dark:text-white',
        'hover:border-primary dark:hover:border-secondary',
        'focus:outline-none focus:ring-1 focus:ring-primary dark:focus:ring-secondary',
        'focus:shadow-[0_0_15px_rgba(244,37,244,0.2)] dark:focus:shadow-neon-blue',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        sizeClasses
      ]"
      :disabled="disabled"
      @click="toggleDropdown"
    >
      <span :class="[!selectedOption ? 'text-slate-400 dark:text-gray-500' : '']">
        {{ selectedOption?.label || placeholder }}
      </span>
      <span
        class="material-symbols-outlined text-slate-400 dark:text-gray-500 transition-transform"
        :class="isOpen ? 'rotate-180' : ''"
      >
        expand_more
      </span>
    </button>

    <!-- Dropdown -->
    <Transition
      enter-active-class="transition-all duration-200"
      enter-from-class="opacity-0 scale-95 translate-y-2"
      enter-to-class="opacity-100 scale-100 translate-y-0"
      leave-active-class="transition-all duration-200"
      leave-from-class="opacity-100 scale-100 translate-y-0"
      leave-to-class="opacity-0 scale-95 translate-y-2"
    >
      <div
        v-if="isOpen"
        class="absolute z-50 w-full mt-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark shadow-2xl max-h-60 overflow-auto"
      >
        <div v-if="searchable" class="p-2 border-b border-slate-200 dark:border-white/10">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar..."
            class="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-input-bg border border-slate-200 dark:border-input-border text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div class="py-1">
          <button
            type="button"
            v-for="option in filteredOptions"
            :key="option.value"
            :disabled="option.disabled"
            :class="[
              'w-full text-left px-4 py-2 text-sm transition-colors flex items-center justify-between',
              option.disabled ? 'opacity-50 cursor-not-allowed grayscale' : 'hover:bg-slate-50 dark:hover:bg-surface-lighter cursor-pointer',
              modelValue === option.value && [
                'bg-primary/10 dark:bg-primary/20',
                'text-primary dark:text-secondary',
                'font-semibold'
              ]
            ]"
            @click="!option.disabled && selectOption(option)"
            :title="option.disabled ? (option.disabledMessage || 'Opção desabilitada') : ''"
          >
            <div class="flex items-center gap-2">
              <span v-if="option.disabled" class="material-symbols-outlined text-base">lock</span>
              <span>{{ option.label }}</span>
            </div>
            <span v-if="modelValue === option.value" class="material-symbols-outlined text-base">check</span>
          </button>
          <div v-if="filteredOptions.length === 0" class="px-4 py-2 text-sm text-slate-400 dark:text-gray-500 text-center">
            Nenhuma opção encontrada
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface Option {
  value: string | number
  label: string
  disabled?: boolean
  disabledMessage?: string
}

interface Props {
  modelValue: string | number | null
  options: Option[]
  placeholder?: string
  disabled?: boolean
  searchable?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Selecione uma opção',
  disabled: false,
  searchable: false,
  size: 'md',
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number | null]
}>()

const isOpen = ref(false)
const searchQuery = ref('')
const selectId = computed(() => `select-${Math.random().toString(36).substr(2, 9)}`)

const sizeClasses = computed(() => {
  const sizes = {
    sm: 'h-9 text-sm',
    md: 'h-10 text-base',
    lg: 'h-12 text-lg',
  }
  return sizes[props.size]
})

const selectedOption = computed(() => {
  return props.options.find(opt => opt.value === props.modelValue)
})

const filteredOptions = computed(() => {
  if (!props.searchable || !searchQuery.value) {
    return props.options
  }
  const query = searchQuery.value.toLowerCase()
  return props.options.filter(opt => opt.label.toLowerCase().includes(query))
})

function toggleDropdown() {
  if (!props.disabled) {
    isOpen.value = !isOpen.value
  }
}

function selectOption(option: Option) {
  emit('update:modelValue', option.value)
  isOpen.value = false
  searchQuery.value = ''
}

function handleClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement
  if (!target.closest(`#${selectId.value}`) && !target.closest('.absolute')) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

