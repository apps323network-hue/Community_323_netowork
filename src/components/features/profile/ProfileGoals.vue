<template>
  <div class="bg-white dark:bg-surface-dark/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200 dark:border-input-border flex flex-col hover:border-secondary/50 dark:hover:border-secondary/30 transition-all duration-300 shadow-xl shadow-slate-100 dark:shadow-none">
    <h3 class="text-lg font-black text-slate-900 dark:text-white mb-6 flex items-center gap-3">
      <div class="p-2 rounded-lg bg-secondary/10 border border-secondary/20">
        <span class="material-symbols-outlined text-secondary font-bold">flag</span>
      </div>
      {{ t('profile.goalsTitle') }}
    </h3>
    <p class="text-sm text-slate-500 dark:text-text-muted mb-4 font-medium">{{ t('profile.goalsSubtitle') }}</p>
    <div class="space-y-3 mb-4">
      <div
        v-for="(goal, index) in goals"
        :key="index"
        class="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-input-bg/50 border border-slate-100 dark:border-transparent hover:border-secondary/50 transition-all group"
      >
        <div class="mt-0.5 size-5 rounded border border-secondary/50 flex items-center justify-center bg-secondary/10 shadow-sm">
          <span class="material-symbols-outlined text-[14px] text-secondary font-black">check</span>
        </div>
        <span class="text-sm text-slate-700 dark:text-white font-medium leading-tight group-hover:text-secondary transition-colors flex-1">{{ goal }}</span>
        <button v-if="!readonly" @click="$emit('remove-goal', index)" class="text-slate-400 dark:text-text-muted hover:text-primary transition-colors">
          <span class="material-symbols-outlined text-[18px]">delete_sweep</span>
        </button>
      </div>

      <p v-if="goals.length === 0 && !isAdding" class="text-sm text-text-muted italic py-2">
        {{ t('profile.noGoals') }}
      </p>

      <!-- Inline Add Goal -->
      <div v-if="isAdding && !readonly" class="flex items-center gap-2 group/input">
        <input
          v-model="newGoal"
          @keyup.enter="handleAdd"
          @blur="handleBlur"
          :placeholder="t('profile.goalPlaceholder')"
          class="flex-1 bg-slate-50 dark:bg-input-bg border border-slate-200 dark:border-input-border focus:bg-white dark:focus:bg-input-bg focus:border-secondary focus:ring-0 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-text-muted text-sm px-4 py-2 rounded-lg transition-all font-medium"
          autofocus
        />
      </div>
    </div>
    
    <button
      v-if="!isAdding && !readonly"
      @click="isAdding = true"
      class="mt-auto w-full py-3 rounded-xl border-2 border-dashed border-slate-200 dark:border-input-border text-slate-400 dark:text-text-muted hover:text-secondary dark:hover:text-white hover:border-secondary hover:bg-slate-50 dark:hover:bg-input-bg transition-all text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 group"
    >
      <span class="material-symbols-outlined text-[20px] group-hover:text-secondary transition-colors">add_circle</span>
      {{ t('profile.addGoal') }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

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
