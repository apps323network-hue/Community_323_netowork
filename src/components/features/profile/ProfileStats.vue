<template>
  <div class="w-full space-y-3">
    <div
      v-if="stats.profileViews !== undefined"
      class="flex items-center justify-between text-sm group/stat cursor-default"
    >
      <span class="text-text-muted flex items-center gap-2 group-hover/stat:text-secondary transition-colors">
        <span class="material-symbols-outlined text-[18px]">visibility</span>
        {{ t('navigation.profile') }}
      </span>
      <span class="text-white font-medium">{{ formatNumber(stats.profileViews) }} views</span>
    </div>
    <div
      v-if="stats.connections !== undefined"
      class="flex items-center justify-between text-sm group/stat cursor-default"
    >
      <span class="text-text-muted flex items-center gap-2 group-hover/stat:text-primary transition-colors">
        <span class="material-symbols-outlined text-[18px]">group</span>
        {{ t('profile.connections') }}
      </span>
      <span class="text-white font-medium">{{ formatNumber(stats.connections) }}</span>
    </div>
    <div
      v-if="stats.posts !== undefined"
      class="flex items-center justify-between text-sm group/stat cursor-default"
    >
      <span class="text-text-muted flex items-center gap-2 group-hover/stat:text-secondary transition-colors">
        <span class="material-symbols-outlined text-[18px]">article</span>
        {{ t('profile.posts') }}
      </span>
      <span class="text-white font-medium">{{ formatNumber(stats.posts) }}</span>
    </div>
    <div
      v-if="stats.events !== undefined"
      class="flex items-center justify-between text-sm group/stat cursor-default"
    >
      <span class="text-text-muted flex items-center gap-2 group-hover/stat:text-primary transition-colors">
        <span class="material-symbols-outlined text-[18px]">event</span>
        {{ t('navigation.events') }}
      </span>
      <span class="text-white font-medium">{{ formatNumber(stats.events) }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
interface Stats {
  profileViews?: number
  connections?: number
  posts?: number
  events?: number
}

interface Props {
  stats: Stats
}

defineProps<Props>()

function formatNumber(num: number): string {
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`
  }
  return num.toString()
}
</script>

