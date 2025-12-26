<template>
  <div class="bg-surface-dark/80 backdrop-blur rounded-2xl p-6 border border-input-border flex flex-col hover:border-secondary/30 transition-colors duration-300">
    <h3 class="text-lg font-bold text-white mb-6 flex items-center gap-3">
      <div class="p-2 rounded-lg bg-secondary/10 border border-secondary/30">
        <span class="material-symbols-outlined text-secondary">flag</span>
      </div>
      Objetivos
    </h3>
    <p class="text-sm text-text-muted mb-4">O que você busca na comunidade?</p>
    <div class="space-y-3 mb-4">
      <div
        v-for="(goal, index) in goals"
        :key="index"
        class="flex items-start gap-3 p-3 rounded-lg bg-input-bg/50 border border-transparent hover:border-secondary/30 transition-colors group"
      >
        <div class="mt-0.5 size-5 rounded border border-secondary/50 flex items-center justify-center bg-secondary/10 shadow-[0_0_5px_rgba(0,240,255,0.2)]">
          <span class="material-symbols-outlined text-[14px] text-secondary">check</span>
        </div>
        <span class="text-sm text-white leading-tight group-hover:text-secondary transition-colors flex-1">{{ goal }}</span>
        <button v-if="!readonly" @click="$emit('remove-goal', index)" class="text-text-muted hover:text-primary transition-colors">
          <span class="material-symbols-outlined text-[16px]">close</span>
        </button>
      </div>

      <p v-if="goals.length === 0 && !isAdding" class="text-sm text-text-muted italic py-2">
        Nenhum objetivo adicionado.
      </p>

      <!-- Inline Add Goal -->
      <div v-if="isAdding && !readonly" class="flex items-center gap-2 group/input">
        <input
          v-model="newGoal"
          @keyup.enter="handleAdd"
          @blur="handleBlur"
          placeholder="Digite seu objetivo..."
          class="flex-1 bg-input-bg border-input-border focus:border-secondary focus:ring-0 text-white placeholder-text-muted text-sm px-4 py-2 rounded-lg transition-all"
          autofocus
        />
      </div>
    </div>
    
    <button
      v-if="!isAdding && !readonly"
      @click="isAdding = true"
      class="mt-auto w-full py-3 rounded-xl border border-dashed border-input-border text-text-muted hover:text-white hover:border-secondary hover:bg-input-bg transition-all text-sm font-medium flex items-center justify-center gap-2 group"
    >
      <span class="material-symbols-outlined text-[20px] group-hover:text-secondary transition-colors">add_circle</span>
      Adicionar Objetivo
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  goals: string[]
  readonly?: boolean
}>()

const emit = defineEmits<{
  (e: 'add-goal', value: string): void
  (e: 'remove-goal', index: number): void
}>()

const isAdding = ref(false)
const newGoal = ref('')

function handleAdd() {
  if (newGoal.value.trim()) {
    emit('add-goal', newGoal.value.trim())
    newGoal.value = ''
    isAdding.value = false
  }
}

function handleBlur() {
  if (!newGoal.value.trim()) {
    isAdding.value = false
  } else {
    handleAdd()
  }
}
</script>
