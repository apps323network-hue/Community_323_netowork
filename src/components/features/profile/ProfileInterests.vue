<template>
  <div class="bg-surface-dark/80 backdrop-blur rounded-2xl p-6 border border-input-border flex flex-col hover:border-primary/30 transition-colors duration-300">
    <h3 class="text-lg font-bold text-white mb-6 flex items-center gap-3">
      <div class="p-2 rounded-lg bg-primary/10 border border-primary/30">
        <span class="material-symbols-outlined text-primary">interests</span>
      </div>
      {{ t('profile.interestsTitle') }}
    </h3>
    <p class="text-sm text-text-muted mb-4">{{ t('profile.interestsSubtitle') }}</p>
    <div class="flex flex-wrap gap-2 mb-4">
      <div
        v-for="(tag, index) in tags"
        :key="index"
        class="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/40 text-primary text-sm font-medium shadow-[0_0_8px_rgba(255,0,153,0.15)] hover:bg-primary/20 transition-colors cursor-pointer"
      >
        #{{ tag }}
        <button v-if="!readonly" @click="$emit('remove-tag', index)" class="hover:text-white ml-1">
          <span class="material-symbols-outlined text-[16px]">close</span>
        </button>
      </div>
    </div>
    
    <div v-if="!readonly" class="mt-4">
      <p class="text-xs text-text-muted mb-3 font-medium uppercase tracking-wider">{{ t('profile.availableTags') }}</p>
      <div class="flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
        <button
          v-for="tag in availableTags"
          :key="tag"
          @click="toggleTag(tag)"
          class="px-3 py-1.5 rounded-lg border text-xs font-bold transition-all duration-300"
          :class="[
            tags.includes(tag)
              ? 'bg-primary/20 border-primary text-primary shadow-[0_0_10px_rgba(255,0,153,0.3)]'
              : 'bg-input-bg border-input-border text-gray-400 hover:border-gray-500 hover:text-white'
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
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}
</style>
