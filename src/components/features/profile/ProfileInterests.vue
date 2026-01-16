<template>
  <div class="bg-white dark:bg-surface-dark/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200 dark:border-input-border flex flex-col hover:border-primary/50 dark:hover:border-primary/30 transition-all duration-300 shadow-xl shadow-slate-100 dark:shadow-none">
    <h3 class="text-lg font-black text-slate-900 dark:text-white mb-6 flex items-center gap-3">
      <div class="p-2 rounded-lg bg-primary/10 border border-primary/20">
        <span class="material-symbols-outlined text-primary font-bold">interests</span>
      </div>
      {{ t('profile.interestsTitle') }}
    </h3>
    <p class="text-sm text-slate-500 dark:text-text-muted mb-4 font-medium">{{ t('profile.interestsSubtitle') }}</p>
    <div class="flex flex-wrap gap-2 mb-4">
      <div
        v-for="(tag, index) in tags"
        :key="index"
        class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 dark:bg-primary/15 border border-primary/30 dark:border-primary/40 text-primary text-xs font-black shadow-sm hover:bg-primary/20 transition-all cursor-pointer transform hover:-translate-y-0.5"
      >
        #{{ tag }}
        <button v-if="!readonly" @click="$emit('remove-tag', index)" class="hover:text-primary-dark ml-1 flex items-center">
          <span class="material-symbols-outlined text-[14px] font-black">close</span>
        </button>
      </div>
    </div>
    
    <div v-if="!readonly" class="mt-4">
      <p class="text-[10px] text-slate-400 dark:text-text-muted mb-3 font-black uppercase tracking-[0.15em]">{{ t('profile.availableTags') }}</p>
      <div class="flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
        <button
          v-for="tag in availableTags"
          :key="tag"
          @click="toggleTag(tag)"
          class="px-3 py-1.5 rounded-lg border text-[11px] font-black transition-all duration-300 uppercase tracking-wide"
          :class="[
            tags.includes(tag)
              ? 'bg-primary/10 border-primary text-primary shadow-md'
              : 'bg-slate-50 dark:bg-input-bg border-slate-200 dark:border-input-border text-slate-400 dark:text-gray-400 hover:border-primary/50 hover:text-primary dark:hover:text-white'
          ]"
        >
          {{ tag }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { INTEREST_TAGS } from '@/types/members'

const { t } = useI18n()

const props = defineProps<{
  tags: string[]
  readonly?: boolean
}>()

const emit = defineEmits<{
  (e: 'add-tag', value: string): void
  (e: 'remove-tag', index: number): void
}>()

const availableTags = computed(() => {
  return INTEREST_TAGS.filter(tag => !props.tags.includes(tag))
})

function toggleTag(tag: string) {
  if (props.tags.includes(tag)) {
    const index = props.tags.indexOf(tag)
    emit('remove-tag', index)
  } else {
    emit('add-tag', tag)
  }
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.03);
  border-radius: 4px;
}
:deep(.dark) .custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}
:deep(.dark) .custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.2);
}
:deep(.dark) .custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}
</style>
