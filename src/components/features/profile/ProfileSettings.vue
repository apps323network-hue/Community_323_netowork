<template>
  <div class="bg-surface-dark/80 backdrop-blur rounded-2xl p-6 border border-input-border">
    <h3 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
      <span class="material-symbols-outlined text-text-muted">settings</span>
      {{ t('profile.settingsTitle') }}
    </h3>
    <div class="space-y-4">
      <!-- Public Profile Toggle -->
      <div class="flex items-center justify-between py-2 p-3 rounded-lg hover:bg-white/5 transition-colors">
        <div>
          <p class="text-white font-medium text-sm">{{ t('profile.publicProfile') }}</p>
          <p class="text-text-muted text-xs">{{ t('profile.publicProfileDesc') }}</p>
        </div>
        <button
          @click="$emit('toggle-public')"
          :class="[
            'w-12 h-6 rounded-full relative transition-all focus:outline-none',
            isPublic
              ? 'bg-secondary/20 border border-secondary shadow-[0_0_8px_rgba(0,240,255,0.3)]'
              : 'bg-input-bg border border-text-muted/30'
          ]"
        >
          <span
            :class="[
              'absolute top-0.5 w-4 h-4 rounded-full transition-transform',
              isPublic
                ? 'right-1 bg-secondary shadow-[0_0_5px_rgba(0,240,255,0.8)]'
                : 'left-1 bg-text-muted'
            ]"
          ></span>
        </button>
      </div>

      <div class="w-full h-px bg-input-border"></div>

      <!-- Job Notifications Toggle -->
      <div class="flex items-center justify-between py-2 p-3 rounded-lg hover:bg-white/5 transition-colors">
        <div>
          <p class="text-white font-medium text-sm">{{ t('profile.jobNotifications') }}</p>
          <p class="text-text-muted text-xs">{{ t('profile.jobNotificationsDesc') }}</p>
        </div>
        <button
          @click="$emit('toggle-notifications')"
          :class="[
            'w-12 h-6 rounded-full relative transition-all focus:outline-none',
            jobNotifications
              ? 'bg-secondary/20 border border-secondary shadow-[0_0_8px_rgba(0,240,255,0.3)]'
              : 'bg-input-bg border border-text-muted/30'
          ]"
        >
          <span
            :class="[
              'absolute top-0.5 w-4 h-4 rounded-full transition-transform',
              jobNotifications
                ? 'right-1 bg-secondary shadow-[0_0_5px_rgba(0,240,255,0.8)]'
                : 'left-1 bg-text-muted'
            ]"
          ></span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineProps<{
  isPublic?: boolean
  jobNotifications?: boolean
}>()

defineEmits<{
  (e: 'toggle-public'): void
  (e: 'toggle-notifications'): void
}>()
</script>
