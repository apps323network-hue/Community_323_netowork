<template>
  <div class="space-y-4 sm:space-y-6">
    <div class="text-center mb-4 sm:mb-6 md:mb-8">
      <h2 class="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-1 sm:mb-2">{{ t('onboarding.step3.title') }}</h2>
      <p class="text-sm sm:text-base text-slate-600 dark:text-text-muted px-2">{{ t('onboarding.step3.subtitle') }}</p>
    </div>

    <div class="space-y-4 sm:space-y-6">
      <!-- Bio -->
      <label class="block space-y-1.5 sm:space-y-2">
        <span class="text-xs sm:text-sm font-medium text-slate-700 dark:text-text-muted">
          {{ t('profile.bioPlaceholder') }}
        </span>
        <textarea
          :value="bio"
          @input="$emit('update:bio', ($event.target as HTMLTextAreaElement).value)"
          class="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl bg-slate-50 dark:bg-input-bg border border-slate-200 dark:border-input-border text-sm sm:text-base text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-text-muted/50 resize-none transition-all focus:border-secondary focus:ring-1 focus:ring-secondary focus:shadow-[0_0_10px_rgba(0,240,255,0.2)]"
          rows="4"
          maxlength="500"
          :placeholder="t('onboarding.step3.bioPlaceholder')"
        ></textarea>
        <p class="text-xs text-slate-600 dark:text-text-muted">{{ t('onboarding.step3.bioHint') }}</p>
      </label>

      <!-- Redes Sociais -->
      <div class="space-y-3 sm:space-y-4">
        <h3 class="text-base sm:text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <span class="material-symbols-outlined text-primary text-lg sm:text-xl">link</span>
          {{ t('profile.socialMedia') }}
        </h3>
        
        <!-- LinkedIn -->
        <label class="block space-y-1.5 sm:space-y-2">
          <span class="text-xs sm:text-sm font-medium text-slate-700 dark:text-text-muted">
            {{ t('profile.linkedin') }}
          </span>
          <div class="relative">
            <span class="material-symbols-outlined absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-text-muted text-base sm:text-lg">link</span>
            <input
              :value="linkedin"
              @input="$emit('update:linkedin', ($event.target as HTMLInputElement).value)"
              type="text"
              class="w-full pl-9 sm:pl-11 pr-3 sm:pr-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl bg-slate-50 dark:bg-input-bg border border-slate-200 dark:border-input-border text-sm sm:text-base text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-text-muted/50 transition-all focus:border-secondary focus:ring-1 focus:ring-secondary focus:shadow-[0_0_10px_rgba(0,240,255,0.2)]"
              :placeholder="t('profile.linkedinPlaceholder')"
            />
          </div>
        </label>

        <!-- Instagram -->
        <label class="block space-y-1.5 sm:space-y-2">
          <span class="text-xs sm:text-sm font-medium text-slate-700 dark:text-text-muted">
            {{ t('profile.instagram') }}
          </span>
          <div class="relative">
            <span class="material-symbols-outlined absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-text-muted text-base sm:text-lg">photo</span>
            <input
              :value="instagram"
              @input="$emit('update:instagram', ($event.target as HTMLInputElement).value)"
              type="text"
              class="w-full pl-9 sm:pl-11 pr-3 sm:pr-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl bg-slate-50 dark:bg-input-bg border border-slate-200 dark:border-input-border text-sm sm:text-base text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-text-muted/50 transition-all focus:border-secondary focus:ring-1 focus:ring-secondary focus:shadow-[0_0_10px_rgba(0,240,255,0.2)]"
              :placeholder="t('profile.instagramPlaceholder')"
            />
          </div>
        </label>
      </div>

      <!-- Tags/Interesses (Opcional) -->
      <div class="border-t border-slate-200 dark:border-input-border pt-4 sm:pt-6">
        <div class="flex items-center justify-between mb-3 sm:mb-4">
          <h3 class="text-base sm:text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <span class="material-symbols-outlined text-primary text-lg sm:text-xl">interests</span>
            {{ t('profile.interestsTitle') }}
          </h3>
          <button
            @click="showTags = !showTags"
            class="text-xs sm:text-sm text-secondary hover:text-primary transition-colors active:scale-95"
          >
            {{ showTags ? t('common.hide') : t('common.show') }}
          </button>
        </div>
        <p class="text-xs text-slate-600 dark:text-text-muted mb-3 sm:mb-4">{{ t('onboarding.step3.tagsHint') }}</p>
        
        <div v-if="showTags" class="space-y-3 sm:space-y-4">
          <!-- Tags selecionadas -->
          <div v-if="tags.length > 0" class="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
            <div
              v-for="(tag, index) in tags"
              :key="index"
              class="inline-flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-primary/10 border border-primary/40 text-primary text-xs sm:text-sm font-medium"
            >
              #{{ getTagLabel(tag) }}
              <button @click="handleRemoveTag(index)" class="hover:text-white ml-0.5 sm:ml-1 active:scale-90">
                <span class="material-symbols-outlined text-[14px] sm:text-[16px]">close</span>
              </button>
            </div>
          </div>

          <!-- Tags disponíveis -->
          <div class="flex flex-wrap gap-1.5 sm:gap-2 max-h-32 sm:max-h-40 overflow-y-auto pr-1 sm:pr-2 custom-scrollbar">
            <button
              v-for="tag in availableTags"
              :key="tag"
              @click="handleAddTag(tag)"
              class="px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border text-xs font-bold transition-all active:scale-95"
              :class="[
                tags.includes(tag)
                  ? 'bg-primary/20 border-primary text-primary'
                  : 'bg-slate-50 dark:bg-input-bg border-slate-200 dark:border-input-border text-slate-500 dark:text-gray-400 hover:border-primary dark:hover:border-gray-500 dark:hover:text-white'
              ]"
            >
              {{ getTagLabel(tag) }}
            </button>
          </div>
        </div>
      </div>

      <!-- Objetivos (Opcional) -->
      <div class="border-t border-slate-200 dark:border-input-border pt-4 sm:pt-6">
        <div class="flex items-center justify-between mb-3 sm:mb-4">
          <h3 class="text-base sm:text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <span class="material-symbols-outlined text-secondary text-lg sm:text-xl">flag</span>
            {{ t('profile.goalsTitle') }}
          </h3>
          <button
            @click="showGoals = !showGoals"
            class="text-xs sm:text-sm text-secondary hover:text-primary transition-colors active:scale-95"
          >
            {{ showGoals ? t('common.hide') : t('common.show') }}
          </button>
        </div>
        <p class="text-xs text-slate-600 dark:text-text-muted mb-3 sm:mb-4">{{ t('onboarding.step3.goalsHint') }}</p>

        <div v-if="showGoals" class="space-y-2 sm:space-y-3">
          <!-- Objetivos adicionados -->
          <div v-if="goals.length > 0" class="space-y-2">
            <div
              v-for="(goal, index) in goals"
              :key="index"
              class="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-slate-50 dark:bg-input-bg/50 border border-slate-100 dark:border-transparent"
            >
              <div class="mt-0.5 size-4 sm:size-5 rounded border border-secondary/50 flex items-center justify-center bg-secondary/10 flex-shrink-0">
                <span class="material-symbols-outlined text-[12px] sm:text-[14px] text-secondary">check</span>
              </div>
              <span class="text-xs sm:text-sm text-slate-900 dark:text-white leading-tight flex-1 break-words">{{ goal }}</span>
              <button @click="handleRemoveGoal(index)" class="text-slate-600 dark:text-text-muted hover:text-primary transition-colors active:scale-90 flex-shrink-0">
                <span class="material-symbols-outlined text-[14px] sm:text-[16px]">close</span>
              </button>
            </div>
          </div>

          <!-- Adicionar objetivo -->
          <div class="flex items-center gap-2">
            <input
              v-model="newGoal"
              @keyup.enter="handleAddGoal"
              :placeholder="t('profile.goalPlaceholder')"
              class="flex-1 bg-slate-50 dark:bg-input-bg border border-slate-200 dark:border-input-border focus:border-secondary focus:ring-0 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-text-muted text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-lg transition-all"
            />
            <button
              @click="handleAddGoal"
              :disabled="!newGoal.trim()"
              class="px-3 sm:px-4 py-2 rounded-lg bg-secondary/20 border border-secondary/40 text-secondary text-xs sm:text-sm font-medium hover:bg-secondary/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
            >
              {{ t('profile.addGoal') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { INTEREST_TAGS, TAG_KEYS } from '@/types/members'

const { t } = useI18n()

const props = defineProps<{
  bio: string
  linkedin: string
  instagram: string
  tags: string[]
  goals: string[]
}>()

const emit = defineEmits<{
  (e: 'update:bio', value: string): void
  (e: 'update:linkedin', value: string): void
  (e: 'update:instagram', value: string): void
  (e: 'update:tags', value: string[]): void
  (e: 'update:goals', value: string[]): void
}>()

const showTags = ref(false)
const showGoals = ref(false)
const newGoal = ref('')

const availableTags = computed(() => {
  return INTEREST_TAGS.filter(tag => !props.tags.includes(tag))
})

function handleAddTag(tag: string) {
  if (!props.tags.includes(tag)) {
    emit('update:tags', [...props.tags, tag])
  }
}

function handleRemoveTag(index: number) {
  const newTags = [...props.tags]
  newTags.splice(index, 1)
  emit('update:tags', newTags)
}

function handleAddGoal() {
  if (newGoal.value.trim()) {
    emit('update:goals', [...props.goals, newGoal.value.trim()])
    newGoal.value = ''
  }
}

function handleRemoveGoal(index: number) {
  const newGoals = [...props.goals]
  newGoals.splice(index, 1)
  emit('update:goals', newGoals)
}

function getTagLabel(tag: string) {
  const key = TAG_KEYS[tag]
  return key ? t(`interests.${key}`) : tag
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
}
.dark .custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.2);
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}
</style>
