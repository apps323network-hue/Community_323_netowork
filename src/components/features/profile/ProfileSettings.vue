<template>
  <div class="bg-white dark:bg-surface-dark/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200 dark:border-input-border shadow-xl shadow-slate-100 dark:shadow-none hover:border-secondary/50 dark:hover:border-secondary/30 transition-all duration-300">
    <h3 class="text-xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-3">
      <div class="p-2 rounded-lg bg-secondary/10 border border-secondary/20">
        <span class="material-symbols-outlined text-secondary font-bold">settings</span>
      </div>
      {{ t('profile.settingsTitle') }}
    </h3>
    <div class="space-y-4">
      <!-- Public Profile Toggle -->
      <div class="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-input-bg/50 border border-slate-300 dark:border-transparent">
        <div class="flex flex-col">
          <span class="text-slate-900 dark:text-white font-black text-sm uppercase tracking-wider">{{ t('profile.publicProfile') }}</span>
          <p class="text-[11px] text-slate-500 dark:text-text-muted mt-1 font-medium">{{ t('profile.publicProfileDesc') }}</p>
        </div>
        <button 
          @click="$emit('toggle-public')"
          class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
          :class="isPublic ? 'bg-secondary shadow-[0_0_10px_rgba(0,240,255,0.4)]' : 'bg-slate-300 dark:bg-gray-700'"
        >
          <span
            aria-hidden="true"
            :class="[
              isPublic ? 'translate-x-5' : 'translate-x-0',
              'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out'
            ]"
          ></span>
        </button>
      </div>

      <!-- Show Email Toggle -->
      <div class="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-input-bg/50 border border-slate-300 dark:border-transparent">
        <div class="flex flex-col">
          <span class="text-slate-900 dark:text-white font-black text-sm uppercase tracking-wider">{{ t('profile.showEmail') }}</span>
          <p class="text-[11px] text-slate-500 dark:text-text-muted mt-1 font-medium">{{ t('profile.showEmailDesc') }}</p>
        </div>
        <button 
          @click="$emit('toggle-email')"
          class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
          :class="showEmail ? 'bg-secondary shadow-[0_0_10px_rgba(0,240,255,0.4)]' : 'bg-slate-300 dark:bg-gray-700'"
        >
          <span
            aria-hidden="true"
            :class="[
              showEmail ? 'translate-x-5' : 'translate-x-0',
              'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out'
            ]"
          ></span>
        </button>
      </div>

      <!-- Subscription Management (Only for Premium) -->
      <div v-if="isPremium" class="mt-8 pt-6 border-t border-input-border">
        <div class="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-input-bg/50 border border-slate-100 dark:border-transparent">
          <div class="flex items-center gap-4">
            <div class="p-2 rounded-lg bg-primary/10 border border-primary/20">
              <span class="material-symbols-outlined text-primary font-bold">workspace_premium</span>
            </div>
            <div class="flex flex-col">
              <span class="text-slate-900 dark:text-white font-black text-sm uppercase tracking-wider">{{ t('profile.premiumAccount') }}</span>
              <p class="text-[11px] text-slate-500 dark:text-text-muted mt-1 font-medium">{{ t('profile.manageSubscription') }}</p>
            </div>
          </div>
          <button 
            @click="$emit('manage-subscription')"
            class="px-5 py-2 rounded-xl bg-white dark:bg-transparent border border-slate-200 dark:border-input-border text-slate-600 dark:text-white text-xs font-black uppercase tracking-widest hover:border-primary hover:text-primary transition-all shadow-sm"
          >
            {{ t('profile.manage') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineProps<{
  isPublic?: boolean
  showWhatsapp?: boolean
  showEmail?: boolean
  isPremium?: boolean
}>()

defineEmits<{
  (e: 'toggle-whatsapp'): void
  (e: 'toggle-email'): void
  (e: 'toggle-public'): void
  (e: 'manage-subscription'): void
}>()
</script>
