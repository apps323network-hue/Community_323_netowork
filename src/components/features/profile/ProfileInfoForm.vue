<template>
  <div class="bg-surface-dark/80 backdrop-blur rounded-2xl p-6 border border-input-border shadow-lg hover:border-secondary/30 transition-colors duration-300">
    <div class="flex items-center justify-between mb-6 pb-4 border-b border-input-border">
      <h3 class="text-xl font-bold text-white flex items-center gap-3">
        <div class="p-2 rounded-lg bg-secondary/10 border border-secondary/30">
          <span class="material-symbols-outlined text-secondary">person</span>
        </div>
        {{ t('profile.personalInfo') }}
      </h3>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Full Name -->
      <label class="block space-y-2 group">
        <span class="text-sm font-medium text-text-muted group-hover:text-secondary transition-colors">{{ t('profile.fullName') }}</span>
        <input
          :value="name"
          @input="$emit('update:name', ($event.target as HTMLInputElement).value)"
          type="text"
          :disabled="readonly"
          class="form-input w-full px-4 rounded-xl bg-input-bg border-input-border text-white focus:border-secondary focus:ring-1 focus:ring-secondary placeholder-text-muted/50 h-12 transition-all shadow-sm focus:shadow-[0_0_10px_rgba(0,240,255,0.2)] disabled:opacity-60 disabled:cursor-default disabled:border-transparent"
        />
      </label>

      <!-- Profession -->
      <label class="block space-y-2 group">
        <span class="text-sm font-medium text-text-muted group-hover:text-secondary transition-colors">{{ t('profile.areaOfWork') }}</span>
        <input
          :value="profession"
          @input="$emit('update:profession', ($event.target as HTMLInputElement).value)"
          type="text"
          :disabled="readonly"
          class="form-input w-full px-4 rounded-xl bg-input-bg border-input-border text-white focus:border-secondary focus:ring-1 focus:ring-secondary placeholder-text-muted/50 h-12 transition-all shadow-sm focus:shadow-[0_0_10px_rgba(0,240,255,0.2)] disabled:opacity-60 disabled:cursor-default disabled:border-transparent"
        />
      </label>

      <!-- City -->
      <label class="block space-y-2 group">
        <span class="text-sm font-medium text-text-muted group-hover:text-secondary transition-colors">{{ t('profile.city') }}</span>
        <input
          :value="city"
          @input="$emit('update:city', ($event.target as HTMLInputElement).value)"
          type="text"
          :disabled="readonly"
          class="form-input w-full px-4 rounded-xl bg-input-bg border-input-border text-white focus:border-secondary focus:ring-1 focus:ring-secondary placeholder-text-muted/50 h-12 transition-all shadow-sm focus:shadow-[0_0_10px_rgba(0,240,255,0.2)] disabled:opacity-60 disabled:cursor-default disabled:border-transparent"
        />
      </label>

      <!-- State -->
      <label class="block space-y-2 group">
        <span class="text-sm font-medium text-text-muted group-hover:text-secondary transition-colors">{{ t('profile.state') }}</span>
        <input
          :value="state"
          @input="$emit('update:state', ($event.target as HTMLInputElement).value)"
          type="text"
          :disabled="readonly"
          class="form-input w-full px-4 rounded-xl bg-input-bg border-input-border text-white focus:border-secondary focus:ring-1 focus:ring-secondary placeholder-text-muted/50 h-12 transition-all shadow-sm focus:shadow-[0_0_10px_rgba(0,240,255,0.2)] disabled:opacity-60 disabled:cursor-default disabled:border-transparent"
        />
      </label>

      <!-- Bio -->
      <label class="block space-y-2 md:col-span-2 group">
        <span class="text-sm font-medium text-text-muted group-hover:text-secondary transition-colors">{{ t('profile.bioPlaceholder') }}</span>
        <textarea
          :value="bio"
          @input="$emit('update:bio', ($event.target as HTMLTextAreaElement).value)"
          class="form-textarea w-full rounded-xl bg-input-bg border-input-border text-white focus:border-secondary focus:ring-1 focus:ring-secondary placeholder-text-muted/50 resize-none p-4 leading-relaxed transition-all shadow-sm focus:shadow-[0_0_10px_rgba(0,240,255,0.2)] disabled:opacity-60 disabled:cursor-default disabled:border-transparent"
          rows="4"
          maxlength="500"
          :disabled="readonly"
        ></textarea>
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineProps<{
  name: string
  profession: string
  city: string
  state: string
  bio: string
  readonly?: boolean
}>()

defineEmits<{
  (e: 'update:name', value: string): void
  (e: 'update:profession', value: string): void
  (e: 'update:city', value: string): void
  (e: 'update:state', value: string): void
  (e: 'update:bio', value: string): void
}>()
</script>
