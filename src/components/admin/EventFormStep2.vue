<template>
  <div class="space-y-4">
    <div>
      <div class="flex justify-between items-center mb-2">
        <label class="block text-sm font-medium text-white">Date *</label>
        
        <!-- Program Date Info -->
        <span v-if="program" class="text-xs">
          <span v-if="isProgramExpired(program)" class="text-red-400 font-medium flex items-center gap-1">
             <span class="material-symbols-outlined text-[14px]">warning</span>
             Expired: {{ formatDate(program.program_end_date) }}
          </span>
          <span v-else class="text-emerald-400 font-medium tracking-wide">
             Validity: {{ formatDate(program.program_start_date) }} - {{ formatDate(program.program_end_date) }}
          </span>
        </span>
      </div>

      <div class="grid grid-cols-3 gap-3">
        <div>
          <label class="block text-xs text-slate-600 dark:text-white/60 mb-1">Day</label>
          <div class="relative">
            <select
              v-model="dateTime.day"
              required
              class="custom-select w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0a040f] p-3 pr-10 text-slate-900 dark:text-white focus:border-secondary focus:ring-1 focus:ring-secondary focus:shadow-[0_0_15px_rgba(0,243,255,0.3)] outline-none appearance-none cursor-pointer transition-all hover:border-secondary/50 dark:hover:border-white/20"
              @change="updateDateTime"
            >
              <option value="">Day</option>
              <option v-for="d in 31" :key="d" :value="d.toString().padStart(2, '0')">
                {{ d.toString().padStart(2, '0') }}
              </option>
            </select>
            <span class="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-white/60 pointer-events-none text-lg">
              expand_more
            </span>
          </div>
        </div>
        <div>
          <label class="block text-xs text-white/60 mb-1">Month</label>
          <div class="relative">
            <select
              v-model="dateTime.month"
              required
              class="custom-select w-full rounded-lg border border-white/10 bg-surface-dark p-3 pr-10 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none appearance-none cursor-pointer transition-all hover:border-white/20"
              @change="updateDateTime"
            >
              <option value="">Month</option>
              <option v-for="m in 12" :key="m" :value="m.toString().padStart(2, '0')">
                {{ getMonthName(m) }}
              </option>
            </select>
            <span class="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-white/60 pointer-events-none text-lg">
              expand_more
            </span>
          </div>
        </div>
        <div>
          <label class="block text-xs text-white/60 mb-1">Year</label>
          <div class="relative">
            <select
              v-model="dateTime.year"
              required
              class="custom-select w-full rounded-lg border border-white/10 bg-surface-dark p-3 pr-10 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none appearance-none cursor-pointer transition-all hover:border-white/20"
              @change="updateDateTime"
            >
              <option value="">Year</option>
              <option v-for="y in getYearOptions()" :key="y" :value="y">
                {{ y }}
              </option>
            </select>
            <span class="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-white/60 pointer-events-none text-lg">
              expand_more
            </span>
          </div>
        </div>
      </div>
    </div>

    <div>
      <label class="block text-sm font-medium text-white mb-2">Time *</label>
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-xs text-white/60 mb-1">Hour</label>
          <div class="relative">
            <select
              v-model="dateTime.hour"
              required
              class="custom-select w-full rounded-lg border border-white/10 bg-surface-dark p-3 pr-10 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none appearance-none cursor-pointer transition-all hover:border-white/20"
              @change="updateDateTime"
            >
              <option value="">Hour</option>
              <option v-for="h in 24" :key="h - 1" :value="(h - 1).toString().padStart(2, '0')">
                {{ (h - 1).toString().padStart(2, '0') }}
              </option>
            </select>
            <span class="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-white/60 pointer-events-none text-lg">
              expand_more
            </span>
          </div>
        </div>
        <div>
          <label class="block text-xs text-white/60 mb-1">Minute</label>
          <div class="relative">
            <select
              v-model="dateTime.minute"
              required
              class="custom-select w-full rounded-lg border border-white/10 bg-surface-dark p-3 pr-10 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none appearance-none cursor-pointer transition-all hover:border-white/20"
              @change="updateDateTime"
            >
              <option value="">Minute</option>
              <option v-for="m in 60" :key="m - 1" :value="(m - 1).toString().padStart(2, '0')">
                {{ (m - 1).toString().padStart(2, '0') }}
              </option>
            </select>
            <span class="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-white/60 pointer-events-none text-lg">
              expand_more
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium text-white mb-2">Local / Link (PT)</label>
        <input
          v-model="formData.local_pt"
          type="text"
          class="w-full rounded-lg border border-white/10 bg-surface-dark p-3 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
          :placeholder="formData.tipo === 'webinar' ? 'Link do webinar...' : 'Endereço do evento...'"
          @input="$emit('update:formData', { ...formData })"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-white mb-2">Location / Link (EN)</label>
        <input
          v-model="formData.local_en"
          type="text"
          class="w-full rounded-lg border border-white/10 bg-surface-dark p-3 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
          :placeholder="formData.tipo === 'webinar' ? 'Webinar link...' : 'Event address...'"
          @input="$emit('update:formData', { ...formData })"
        />
      </div>
    </div>

    <div>
      <label class="block text-sm font-medium text-white mb-2">Image (Optional)</label>
      
      <!-- Preview da imagem -->
      <div v-if="imagePreview" class="mb-3 relative">
        <img
          :src="imagePreview"
          alt="Preview"
          class="w-full h-48 object-cover rounded-lg border border-white/10"
        />
        <button
          type="button"
          @click="handleRemoveImage"
          class="absolute top-2 right-2 p-2 bg-red-500/80 hover:bg-red-500 rounded-full text-white transition-all"
        >
          <span class="material-symbols-outlined text-sm">close</span>
        </button>
      </div>

      <!-- Input de arquivo -->
      <label
        v-if="!imagePreview"
        class="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 dark:border-white/20 rounded-lg cursor-pointer bg-slate-50 dark:bg-[#0a040f] hover:bg-slate-100 dark:hover:bg-surface-highlight hover:border-secondary dark:hover:border-primary transition-all"
      >
        <div class="flex flex-col items-center justify-center pt-5 pb-6">
          <span class="material-symbols-outlined text-4xl text-slate-500 dark:text-white/60 mb-2">cloud_upload</span>
          <p class="mb-2 text-sm text-slate-600 dark:text-white/60">
            <span class="font-semibold">Click to upload</span> or drag and drop
          </p>
          <p class="text-xs text-slate-500 dark:text-white/40">PNG, JPG or WEBP (max. 20MB)</p>
        </div>
        <input
          type="file"
          accept="image/*"
          class="hidden"
          @change="handleImageSelect"
        />
      </label>
    </div>

    <div>
      <label class="flex items-center gap-2 cursor-pointer">
        <input
          v-model="formData.status"
          type="checkbox"
          :true-value="'approved'"
          :false-value="'pending'"
          class="w-4 h-4 rounded border-white/10 bg-surface-dark text-primary focus:ring-primary"
          @change="$emit('update:formData', { ...formData })"
        />
        <span class="text-sm text-slate-700 dark:text-white">Create already approved</span>
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { EventStatus } from '@/types/events'

interface EventFormData {
  titulo_pt: string
  titulo_en: string
  descricao_pt: string
  descricao_en: string
  tipo: string
  local_pt: string
  local_en: string
  image_url: string
  status: EventStatus
  program_id: string
}

interface DateTimeData {
  day: string
  month: string
  year: string
  hour: string
  minute: string
}

interface Props {
  formData: EventFormData
  dateTime: DateTimeData
  imagePreview: string | null
  program?: any
}

interface Emits {
  (e: 'update:formData', data: EventFormData): void
  (e: 'update:dateTime', data: DateTimeData): void
  (e: 'image-select', file: File): void
  (e: 'image-remove'): void
  (e: 'image-error', message: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const dateTime = ref<DateTimeData>({ ...props.dateTime })

watch(() => props.dateTime, (newVal) => {
  dateTime.value = { ...newVal }
}, { deep: true })

function formatDate(dateString: string | null) {
  if (!dateString) return 'Undefined date'
  return new Date(dateString).toLocaleDateString('pt-BR')
}

function isProgramExpired(program: any) {
  if (!program?.program_end_date) return false
  return new Date(program.program_end_date) < new Date()
}

function getMonthName(month: number): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  return months[month - 1]
}

function getYearOptions(): number[] {
  const currentYear = new Date().getFullYear()
  const years = []
  for (let i = currentYear; i <= currentYear + 5; i++) {
    years.push(i)
  }
  return years
}

function updateDateTime() {
  emit('update:dateTime', { ...dateTime.value })
}

function handleImageSelect(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return

  if (!file.type.startsWith('image/')) {
    emit('image-error', 'Please select only image files')
    return
  }

  if (file.size > 20 * 1024 * 1024) {
    emit('image-error', 'Image must be at most 20MB')
    return
  }

  emit('image-select', file)
}

function handleRemoveImage() {
  emit('image-remove')
}
</script>

<style scoped>
.custom-select {
  background-image: none;
  -webkit-appearance: none;
  -moz-appearance: none;
}

.custom-select option {
  background-color: #1a1a1a;
  color: white;
  padding: 12px;
}

.custom-select:focus {
  box-shadow: 0 0 0 1px rgba(244, 37, 244, 0.5);
}

@media (max-width: 640px) {
  .custom-select {
    max-height: calc(3rem * 10);
    overflow-y: auto;
  }
  
  .custom-select option {
    padding: 10px 12px;
    font-size: 14px;
  }
}

.custom-select::-webkit-scrollbar {
  width: 6px;
}

.custom-select::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 3px;
}

.custom-select::-webkit-scrollbar-thumb {
  background: rgba(244, 37, 244, 0.5);
  border-radius: 3px;
}

.custom-select::-webkit-scrollbar-thumb:hover {
  background: rgba(244, 37, 244, 0.7);
}

.custom-select {
  transition: all 0.2s ease;
}

.custom-select:hover {
  background-color: rgba(255, 255, 255, 0.03);
}

.custom-select:active {
  transform: scale(0.98);
}
</style>

