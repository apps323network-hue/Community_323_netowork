<template>
  <div class="space-y-4">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium text-slate-700 dark:text-white mb-2">Título (PT) *</label>
        <input
          v-model="formData.titulo_pt"
          type="text"
          required
          class="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0a040f] p-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-secondary focus:ring-1 focus:ring-secondary focus:shadow-[0_0_15px_rgba(0,243,255,0.3)] outline-none transition-all"
          placeholder="Nome do evento..."
          @input="$emit('update:formData', { ...formData })"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-slate-700 dark:text-white mb-2">Title (EN) *</label>
        <input
          v-model="formData.titulo_en"
          type="text"
          required
          class="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0a040f] p-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-secondary focus:ring-1 focus:ring-secondary focus:shadow-[0_0_15px_rgba(0,243,255,0.3)] outline-none transition-all"
          placeholder="Event name..."
          @input="$emit('update:formData', { ...formData })"
        />
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium text-slate-700 dark:text-white mb-2">Descrição (PT)</label>
        <textarea
          v-model="formData.descricao_pt"
          rows="4"
          class="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0a040f] p-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-secondary focus:ring-1 focus:ring-secondary focus:shadow-[0_0_15px_rgba(0,243,255,0.3)] outline-none transition-all"
          placeholder="Descrição do evento..."
          @input="$emit('update:formData', { ...formData })"
        ></textarea>
      </div>
      <div>
        <label class="block text-sm font-medium text-slate-700 dark:text-white mb-2">Description (EN)</label>
        <textarea
          v-model="formData.descricao_en"
          rows="4"
          class="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0a040f] p-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-secondary focus:ring-1 focus:ring-secondary focus:shadow-[0_0_15px_rgba(0,243,255,0.3)] outline-none transition-all"
          placeholder="Event description..."
          @input="$emit('update:formData', { ...formData })"
        ></textarea>
      </div>
    </div>

    <div>
      <label class="block text-sm font-medium text-slate-700 dark:text-white mb-2">Type *</label>
      <select
        v-model="formData.tipo"
        required
        class="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0a040f] p-3 text-slate-900 dark:text-white focus:border-secondary focus:ring-1 focus:ring-secondary focus:shadow-[0_0_15px_rgba(0,243,255,0.3)] outline-none transition-all"
        @change="$emit('update:formData', { ...formData })"
      >
        <option value="">Select...</option>
        <option value="presencial">In-Person</option>
        <option value="webinar">Webinar</option>
      </select>
    </div>

    <div>
      <label class="block text-sm font-medium text-slate-700 dark:text-white mb-2">Program *</label>
      <select
        v-model="formData.program_id"
        required
        class="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0a040f] p-3 text-slate-900 dark:text-white focus:border-secondary focus:ring-1 focus:ring-secondary focus:shadow-[0_0_15px_rgba(0,243,255,0.3)] outline-none transition-all"
        @change="$emit('update:formData', { ...formData })"
      >
        <option value="">Select a program...</option>
        <option v-for="program in availablePrograms" :key="program.id" :value="program.id">
          {{ program.title_pt }} {{ isProgramExpired(program) ? '(Expired)' : '' }}
        </option>
      </select>
      
      <!-- Program Date Information -->
      <div v-if="selectedProgram" class="mt-2 text-xs">
        <div class="flex flex-col gap-1">
          <div class="flex items-center gap-2">
            <span class="text-slate-500 dark:text-gray-400">Program Period:</span>
            <span class="font-medium text-slate-700 dark:text-gray-200">
              {{ formatDate(selectedProgram.program_start_date) }} - {{ formatDate(selectedProgram.program_end_date) }}
            </span>
          </div>
          
          <div v-if="isProgramExpired(selectedProgram)" class="text-red-500 font-medium flex items-center gap-1">
            <span class="material-symbols-outlined text-sm">warning</span>
            Program Expired - Cannot create events
          </div>
          <div v-else class="text-green-500 font-medium flex items-center gap-1">
            <span class="material-symbols-outlined text-sm">check_circle</span>
            Active Program
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { EventStatus } from '@/types/events'
import { computed, ref, onMounted, watch } from 'vue'
import { supabase } from '@/lib/supabase'

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

interface Props {
  formData: EventFormData
}

interface Emits {
  (e: 'update:formData', data: EventFormData): void
  (e: 'select-program', program: any): void
}


const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const availablePrograms = ref<any[]>([])

const selectedProgram = computed(() => {
  return availablePrograms.value.find(p => p.id === props.formData.program_id)
})

watch(selectedProgram, (newVal) => {
  if (newVal) {
    emit('select-program', newVal)
  }
})

function formatDate(dateString: string | null) {
  if (!dateString) return 'Undefined date'
  return new Date(dateString).toLocaleDateString('pt-BR')
}

function isProgramExpired(program: any) {
  if (!program.program_end_date) return false
  return new Date(program.program_end_date) < new Date()
}

onMounted(async () => {
  await fetchPrograms()
})

async function fetchPrograms() {
  try {
    const { data, error } = await supabase
      .from('programs')
      .select('id, title_pt, program_start_date, program_end_date')
      .order('title_pt')

    if (error) throw error
    availablePrograms.value = data || []
  } catch (err) {
    console.error('Error fetching programs:', err)
  }
}
</script>

