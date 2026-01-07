<template>
  <div class="bg-surface-dark/80 backdrop-blur rounded-2xl p-6 border border-input-border hover:border-secondary/30 transition-colors flex flex-col items-center text-center relative overflow-hidden group">
    <!-- Gradient Background -->
    <div class="absolute top-0 left-0 w-full h-28 bg-gradient-to-b from-primary/20 via-secondary/10 to-transparent opacity-60"></div>

    <!-- Avatar -->
    <div class="relative mt-6 mb-4">
      <div class="size-32 rounded-full p-[3px] bg-gradient-to-br from-secondary via-white to-primary shadow-[0_0_20px_rgba(255,0,153,0.3)]">
        <div
          class="w-full h-full rounded-full bg-cover bg-center border-4 border-surface-dark relative z-10"
          :style="{ backgroundImage: avatarUrl ? `url('${avatarUrl}')` : 'none' }"
        >
          <div v-if="!avatarUrl" class="w-full h-full flex items-center justify-center bg-input-bg text-text-muted text-4xl font-bold rounded-full">
            {{ initials }}
          </div>
        </div>
      </div>
      <button
        v-if="!readonly"
        @click="$emit('edit-avatar')"
        class="absolute bottom-1 right-1 bg-surface-dark text-white p-2.5 rounded-full border border-secondary hover:bg-secondary hover:text-surface-dark transition-all shadow-[0_0_10px_rgba(0,240,255,0.5)] z-20 flex items-center justify-center"
      >
        <span class="material-symbols-outlined text-[18px]">photo_camera</span>
      </button>
    </div>

    <!-- Name & Title -->
    <h2 class="text-2xl font-bold text-white">{{ name }}</h2>
    <p class="neon-text-gradient font-semibold text-sm mt-1 uppercase tracking-wider">{{ profession }}</p>

    <!-- Verified Badge -->
    <div
      v-if="verified"
      class="mt-3 flex items-center gap-1 bg-secondary/10 text-secondary px-3 py-1 rounded-full text-xs font-semibold border border-secondary/30 shadow-[0_0_8px_rgba(0,240,255,0.15)]"
    >
      <span class="material-symbols-outlined text-[14px]">verified</span>
      <span>{{ t('profile.verified') }}</span>
    </div>

    <!-- Member Info -->
    <p class="text-text-muted text-sm mt-4 px-2">
      {{ t('profile.memberSince') }} {{ memberSince }} <br />
      {{ city }}{{ state ? `, ${state}` : '' }} • {{ country }}
    </p>

    <!-- Divider -->
    <div class="w-full h-px bg-gradient-to-r from-transparent via-input-border to-transparent my-6"></div>

    <!-- Stats -->
    <div class="w-full space-y-3">
      <div class="flex items-center justify-between text-sm group/stat cursor-default">
        <span class="text-text-muted flex items-center gap-2 group-hover/stat:text-primary transition-colors">
          <span class="material-symbols-outlined text-[18px]">group</span>
          {{ t('profile.connections') }}
        </span>
        <span class="text-white font-medium">{{ connections }}</span>
      </div>
      <div class="flex items-center justify-between text-sm group/stat cursor-default">
        <span class="text-text-muted flex items-center gap-2 group-hover/stat:text-secondary transition-colors">
          <span class="material-symbols-outlined text-[18px]">stars</span>
          Pontos
        </span>
        <span class="text-secondary font-black">{{ points }}</span>
      </div>
      <div class="flex items-center justify-between text-sm group/stat cursor-default">
        <span class="text-text-muted flex items-center gap-2 group-hover/stat:text-primary transition-colors">
          <span class="material-symbols-outlined text-[18px]">article</span>
          Publicações
        </span>
        <span class="text-white font-medium">{{ posts }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

interface Props {
  name: string
  profession: string
  avatarUrl?: string
  verified?: boolean
  memberSince: string
  city?: string
  state?: string
  country?: string
  connections?: string | number
  points?: number
  posts?: number
  readonly?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  country: 'USA',
  connections: 0,
  points: 0,
  posts: 0
})

defineEmits<{
  (e: 'edit-avatar'): void
}>()

const initials = computed(() => {
  if (!props.name) return '?'
  return props.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
})
</script>

<style scoped>
.neon-text-gradient {
  background: linear-gradient(90deg, #00f0ff, #ff0099);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
</style>
