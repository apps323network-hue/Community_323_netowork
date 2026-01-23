<template>
  <div class="space-y-4 sm:space-y-6">
    <div class="text-center mb-4 sm:mb-6 md:mb-8">
      <h2 class="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-1 sm:mb-2">{{ t('onboarding.step1.title') }}</h2>
      <p class="text-sm sm:text-base text-slate-600 dark:text-text-muted px-2">{{ t('onboarding.step1.subtitle') }}</p>
    </div>

    <!-- Avatar Upload -->
    <div class="flex flex-col items-center mb-4 sm:mb-6 md:mb-8">
      <div 
        @click="triggerFileInput"
        class="relative group cursor-pointer"
      >
        <div class="size-24 sm:size-28 md:size-32 rounded-full border-2 sm:border-4 border-slate-200 dark:border-input-border/50 bg-slate-100 dark:bg-surface-dark flex items-center justify-center overflow-hidden transition-all hover:border-primary/50 dark:hover:border-text-muted/50 active:scale-95">
          <img 
            v-if="avatarUrl" 
            :src="avatarUrl" 
            alt="Avatar" 
            class="w-full h-full object-cover"
          />
          <span v-else class="material-symbols-outlined text-4xl sm:text-5xl md:text-6xl text-slate-400 dark:text-text-muted group-hover:text-primary transition-colors">
            account_circle
          </span>
        </div>
        <div class="absolute bottom-0 right-0 bg-white dark:bg-surface-dark/90 backdrop-blur-sm rounded-full p-1.5 sm:p-2 shadow-md border border-slate-200 dark:border-transparent transition-all">
          <span class="material-symbols-outlined text-slate-500 dark:text-text-muted/70 group-hover:text-primary text-base sm:text-lg">camera_alt</span>
        </div>
        <input 
          type="file" 
          ref="fileInput" 
          class="hidden" 
          accept="image/png, image/jpeg, image/gif"
          @change="handleFileUpload"
        />
      </div>
      <p class="text-xs sm:text-sm text-slate-600 dark:text-text-muted mt-2 text-center px-4">{{ t('onboarding.step1.avatarHint') }}</p>
      <div v-if="isUploading" class="mt-2 flex items-center gap-2 text-secondary">
        <div class="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-2 border-secondary border-t-transparent"></div>
        <span class="text-xs sm:text-sm">{{ t('onboarding.step1.uploading') }}</span>
      </div>
    </div>

    <!-- Form Fields -->
    <div class="space-y-4 sm:space-y-5">
      <!-- Nome Completo -->
      <label class="block space-y-1.5 sm:space-y-2">
        <span class="text-xs sm:text-sm font-medium text-slate-700 dark:text-text-muted">
          {{ t('profile.fullName') }} <span class="text-red-500">*</span>
        </span>
        <input
          :value="name"
          @input="$emit('update:name', ($event.target as HTMLInputElement).value)"
          type="text"
          :class="[
            'w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl bg-slate-50 dark:bg-input-bg border text-sm sm:text-base text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-text-muted/50 transition-all',
            nameError ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'border-slate-200 dark:border-input-border focus:border-secondary focus:ring-1 focus:ring-secondary',
            'focus:shadow-[0_0_10px_rgba(0,240,255,0.2)]'
          ]"
          :placeholder="t('onboarding.step1.namePlaceholder')"
          required
        />
        <p v-if="nameError" class="text-xs text-red-500">{{ nameError }}</p>
      </label>

      <!-- Área de Atuação -->
      <label class="block space-y-1.5 sm:space-y-2">
        <span class="text-xs sm:text-sm font-medium text-slate-700 dark:text-text-muted">
          {{ t('profile.areaOfWork') }} <span class="text-red-500">*</span>
        </span>
        <input
          :value="profession"
          @input="$emit('update:profession', ($event.target as HTMLInputElement).value)"
          type="text"
          :class="[
            'w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl bg-slate-50 dark:bg-input-bg border text-sm sm:text-base text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-text-muted/50 transition-all',
            professionError ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'border-slate-200 dark:border-input-border focus:border-secondary focus:ring-1 focus:ring-secondary',
            'focus:shadow-[0_0_10px_rgba(0,240,255,0.2)]'
          ]"
          :placeholder="t('onboarding.step1.professionPlaceholder')"
          required
        />
        <p v-if="professionError" class="text-xs text-red-500">{{ professionError }}</p>
      </label>

      <!-- Nacionalidade -->
      <label class="block space-y-1.5 sm:space-y-2">
        <span class="text-xs sm:text-sm font-medium text-slate-700 dark:text-text-muted">
          {{ t('profile.nationality') }}
        </span>
        <select
          :value="nationality"
          @change="$emit('update:nationality', ($event.target as HTMLSelectElement).value)"
          class="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl bg-slate-50 dark:bg-input-bg border border-slate-200 dark:border-input-border text-sm sm:text-base text-slate-900 dark:text-white focus:border-secondary focus:ring-1 focus:ring-secondary transition-all shadow-sm focus:shadow-[0_0_10px_rgba(0,240,255,0.2)] appearance-none cursor-pointer"
        >
          <option value="">{{ t('profile.selectNationality') }}</option>
          <option v-for="nat in nationalities" :key="nat" :value="nat">{{ nat }}</option>
        </select>
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/lib/supabase'
import { getNationalities } from '@/utils/location'

const { t, locale } = useI18n()
const authStore = useAuthStore()

defineProps<{
  name: string
  profession: string
  nationality: string
  avatarUrl: string
  nameError?: string
  professionError?: string
}>()

const emit = defineEmits<{
  (e: 'update:name', value: string): void
  (e: 'update:profession', value: string): void
  (e: 'update:nationality', value: string): void
  (e: 'update:avatarUrl', value: string): void
}>()

const fileInput = ref<HTMLInputElement | null>(null)
const isUploading = ref(false)

const nationalities = computed(() => getNationalities(locale.value as string))

function triggerFileInput() {
  fileInput.value?.click()
}

async function handleFileUpload(event: Event) {
  const input = event.target as HTMLInputElement
  if (!input.files || input.files.length === 0) return

  const file = input.files[0]
  const fileExt = file.name.split('.').pop()
  const fileName = `${authStore.user?.id}/${Date.now()}.${fileExt}`
  const filePath = `${fileName}`

  // Validate size (max 2MB)
  if (file.size > 2 * 1024 * 1024) {
    alert(t('profile.maxSizeError'))
    return
  }

  isUploading.value = true

  try {
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file)

    if (uploadError) throw uploadError

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath)

    emit('update:avatarUrl', publicUrl)
  } catch (error: any) {
    console.error('Error uploading avatar:', error.message)
    alert(t('profile.uploadError'))
  } finally {
    isUploading.value = false
  }
}
</script>

<style scoped>
select {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2364748b' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 0.5rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
  padding-right: 2.5rem;
}

.dark select {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ffffff80' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
}

select option {
  background-color: white;
  color: #1e293b;
}

.dark select option {
  background-color: #1a151a;
  color: white;
}
</style>
