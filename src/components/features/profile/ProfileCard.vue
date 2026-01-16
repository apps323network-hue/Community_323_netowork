<template>
  <div class="bg-white dark:bg-surface-dark/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200 dark:border-input-border hover:border-secondary/50 dark:hover:border-secondary/30 transition-all duration-300 flex flex-col items-center text-center relative overflow-hidden group shadow-xl shadow-slate-200/50 dark:shadow-none">
    <!-- Gradient Background -->
    <div class="absolute top-0 left-0 w-full h-28 bg-gradient-to-b from-primary/20 via-secondary/10 to-transparent opacity-60"></div>

    <!-- Avatar -->
    <div class="relative mt-6 mb-4">
      <div class="size-32 rounded-full p-[3px] bg-gradient-to-br from-secondary via-slate-200 dark:via-white to-primary shadow-xl dark:shadow-[0_0_20px_rgba(255,0,153,0.3)]">
        <div
          class="w-full h-full rounded-full bg-cover bg-center border-4 border-white dark:border-surface-dark relative z-10"
          :style="{ backgroundImage: avatarUrl ? `url('${avatarUrl}')` : 'none' }"
        >
          <div v-if="!avatarUrl" class="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-input-bg text-slate-400 dark:text-text-muted text-4xl font-black rounded-full">
            {{ initials }}
          </div>
        </div>
      </div>
      <button
        v-if="!readonly"
        @click="$emit('edit-avatar')"
        class="absolute bottom-1 right-1 bg-white dark:bg-surface-dark text-slate-600 dark:text-white p-2.5 rounded-full border border-slate-200 dark:border-secondary hover:bg-secondary dark:hover:bg-secondary hover:text-white dark:hover:text-surface-dark transition-all shadow-lg z-20 flex items-center justify-center"
      >
        <span class="material-symbols-outlined text-[18px]">photo_camera</span>
      </button>
    </div>

    <!-- Name & Title -->
    <h2 class="text-2xl font-black text-slate-900 dark:text-white">{{ name }}</h2>
    <p v-if="email && showEmail" class="text-slate-500 dark:text-text-muted text-xs font-bold truncate max-w-full px-4 mb-1">{{ email }}</p>
    <p class="neon-text-gradient font-black text-xs mt-1 uppercase tracking-[0.2em]">{{ profession }}</p>

    <!-- Verified Badge -->
    <div
      v-if="verified"
      class="mt-3 flex items-center gap-1.5 bg-secondary/10 text-secondary px-3 py-1 rounded-full text-[10px] font-black border border-secondary/20 shadow-sm"
    >
      <span class="material-symbols-outlined text-[14px] font-bold">verified</span>
      <span class="uppercase tracking-widest">{{ t('profile.verified') }}</span>
    </div>

    <!-- Member Info -->
    <p class="text-slate-500 dark:text-text-muted text-sm mt-4 px-2 font-medium leading-relaxed">
      {{ t('profile.memberSince') }} <span class="text-slate-900 dark:text-white font-black">{{ memberSince }}</span> <br />
      <span class="flex items-center justify-center gap-1 mt-1">
        <span class="material-symbols-outlined text-[14px] opacity-70 transition-transform group-hover:scale-110">location_on</span>
        {{ city }}{{ state ? `, ${state}` : '' }} • {{ country }}
      </span>
    </p>

    <!-- Divider -->
    <div class="w-full h-px bg-gradient-to-r from-transparent via-slate-300 dark:via-input-border to-transparent my-6"></div>

    <!-- Stats -->
    <div class="w-full space-y-3">
      <div class="flex items-center justify-between text-sm group/stat cursor-default">
        <span class="text-slate-500 dark:text-text-muted font-bold flex items-center gap-2 group-hover/stat:text-primary transition-colors">
          <span class="material-symbols-outlined text-[18px]">group</span>
          {{ t('profile.connections') }}
        </span>
        <span class="text-slate-900 dark:text-white font-black">{{ connections }}</span>
      </div>
      <!-- ============================================
           FUNCIONALIDADE DESATIVADA: PONTOS
           ============================================
           Esta funcionalidade foi temporariamente desativada.
           Para reativar: altere v-if="false" para v-if="true" ou remova a diretiva v-if
           Localização: ProfileCard.vue linha ~59
           ============================================ -->
      <div v-if="false" class="flex items-center justify-between text-sm group/stat cursor-default">
        <span class="text-text-muted flex items-center gap-2 group-hover/stat:text-secondary transition-colors">
          <span class="material-symbols-outlined text-[18px]">stars</span>
          Pontos
        </span>
        <span class="text-secondary font-black">{{ points }}</span>
      </div>
      <div class="flex items-center justify-between text-sm group/stat cursor-default">
        <span class="text-slate-500 dark:text-text-muted font-bold flex items-center gap-2 group-hover/stat:text-primary transition-colors">
          <span class="material-symbols-outlined text-[18px]">article</span>
          Publicações
        </span>
        <span class="text-slate-900 dark:text-white font-black">{{ posts }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = withDefaults(defineProps<Props>(), {
  country: 'USA',
  connections: 0,
  points: 0,
  posts: 0
})

interface Props {
  name: string
  email?: string
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
  showEmail?: boolean
}

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
