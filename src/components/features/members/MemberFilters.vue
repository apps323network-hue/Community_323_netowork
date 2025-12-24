<template>
  <div class="space-y-4">
    <!-- Search Bar -->
    <div class="relative">
      <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <span class="material-symbols-outlined text-gray-400 text-[20px]">search</span>
      </div>
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Buscar por nome, área ou cidade..."
        class="block w-full pl-12 pr-4 py-3 border border-white/10 rounded-xl bg-surface-dark text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
        @input="debouncedSearch"
      />
    </div>

    <!-- Filter Row -->
    <div class="flex flex-wrap gap-3 items-center">
      <!-- Area Filter -->
      <select
        v-model="filters.area_atuacao"
        class="px-4 py-2.5 rounded-lg border border-white/10 bg-surface-dark text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
        @change="emitFilters"
      >
        <option value="">Todas as áreas</option>
        <option v-for="area in AREAS_ATUACAO" :key="area" :value="area">
          {{ area }}
        </option>
      </select>

      <!-- City Filter -->
      <input
        v-model="filters.cidade"
        type="text"
        placeholder="Cidade"
        class="px-4 py-2.5 rounded-lg border border-white/10 bg-surface-dark text-gray-300 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all w-32"
        @input="debouncedSearch"
      />

      <!-- Objetivo Filter -->
      <select
        v-model="filters.objetivo"
        class="px-4 py-2.5 rounded-lg border border-white/10 bg-surface-dark text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
        @change="emitFilters"
      >
        <option value="">Todos os objetivos</option>
        <option v-for="obj in OBJETIVOS" :key="obj" :value="obj">
          {{ obj }}
        </option>
      </select>

      <!-- Plan Filter -->
      <select
        v-model="filters.plano"
        class="px-4 py-2.5 rounded-lg border border-white/10 bg-surface-dark text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
        @change="emitFilters"
      >
        <option value="">Todos os planos</option>
        <option value="Free">Free</option>
        <option value="Member">Member</option>
        <option value="Premium">Premium</option>
      </select>

      <!-- Spacer -->
      <div class="flex-1"></div>

      <!-- View Toggle -->
      <div class="flex items-center gap-1 bg-surface-lighter rounded-lg p-1">
        <button
          :class="[
            'p-2 rounded-md transition-all',
            viewMode === 'grid'
              ? 'bg-surface-dark text-primary shadow-sm'
              : 'text-gray-400 hover:text-gray-200',
          ]"
          @click="$emit('update:viewMode', 'grid')"
        >
          <span class="material-symbols-outlined text-[20px]">grid_view</span>
        </button>
        <button
          :class="[
            'p-2 rounded-md transition-all',
            viewMode === 'list'
              ? 'bg-surface-dark text-primary shadow-sm'
              : 'text-gray-400 hover:text-gray-200',
          ]"
          @click="$emit('update:viewMode', 'list')"
        >
          <span class="material-symbols-outlined text-[20px]">view_list</span>
        </button>
      </div>

      <!-- Clear Filters -->
      <button
        v-if="hasActiveFilters"
        class="px-4 py-2.5 rounded-lg border border-red-500/30 text-red-500 text-sm font-medium hover:bg-red-500/10 transition-all"
        @click="clearFilters"
      >
        Limpar filtros
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { AREAS_ATUACAO, OBJETIVOS } from '@/types/members'
import type { MemberFilters } from '@/types/members'

interface Props {
  modelValue: MemberFilters
  viewMode?: 'grid' | 'list'
}

const props = withDefaults(defineProps<Props>(), {
  viewMode: 'grid',
})

const emit = defineEmits<{
  'update:modelValue': [filters: MemberFilters]
  'update:viewMode': [mode: 'grid' | 'list']
}>()

const searchQuery = ref(props.modelValue.search || '')
const filters = ref<MemberFilters>({
  area_atuacao: props.modelValue.area_atuacao || '',
  cidade: props.modelValue.cidade || '',
  objetivo: props.modelValue.objetivo || '',
  plano: props.modelValue.plano || '',
})

const hasActiveFilters = computed(() => {
  return (
    searchQuery.value ||
    filters.value.area_atuacao ||
    filters.value.cidade ||
    filters.value.objetivo ||
    filters.value.plano
  )
})

let debounceTimeout: ReturnType<typeof setTimeout> | null = null

function debouncedSearch() {
  if (debounceTimeout) {
    clearTimeout(debounceTimeout)
  }
  debounceTimeout = setTimeout(() => {
    emitFilters()
  }, 300)
}

function emitFilters() {
  emit('update:modelValue', {
    search: searchQuery.value || undefined,
    area_atuacao: filters.value.area_atuacao || undefined,
    cidade: filters.value.cidade || undefined,
    objetivo: filters.value.objetivo || undefined,
    plano: filters.value.plano || undefined,
  })
}

function clearFilters() {
  searchQuery.value = ''
  filters.value = {
    area_atuacao: '',
    cidade: '',
    objetivo: '',
    plano: '',
  }
  emitFilters()
}

// Sync with external changes
watch(
  () => props.modelValue,
  (newValue) => {
    searchQuery.value = newValue.search || ''
    filters.value = {
      area_atuacao: newValue.area_atuacao || '',
      cidade: newValue.cidade || '',
      objetivo: newValue.objetivo || '',
      plano: newValue.plano || '',
    }
  },
  { deep: true }
)
</script>
