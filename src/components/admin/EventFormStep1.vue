<template>
  <div class="space-y-4">
    <div>
      <label class="block text-sm font-medium text-slate-700 dark:text-white mb-2">Título *</label>
      <input
        v-model="formData.titulo"
        type="text"
        required
        class="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0a040f] p-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-secondary focus:ring-1 focus:ring-secondary focus:shadow-[0_0_15px_rgba(0,243,255,0.3)] outline-none transition-all"
        placeholder="Nome do evento..."
        @input="$emit('update:formData', { ...formData })"
      />
    </div>

    <div>
      <label class="block text-sm font-medium text-slate-700 dark:text-white mb-2">Descrição</label>
      <textarea
        v-model="formData.descricao"
        rows="4"
        class="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0a040f] p-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-secondary focus:ring-1 focus:ring-secondary focus:shadow-[0_0_15px_rgba(0,243,255,0.3)] outline-none transition-all"
        placeholder="Descrição do evento..."
        @input="$emit('update:formData', { ...formData })"
      ></textarea>
    </div>

    <div>
      <label class="block text-sm font-medium text-slate-700 dark:text-white mb-2">Tipo *</label>
      <select
        v-model="formData.tipo"
        required
        class="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0a040f] p-3 text-slate-900 dark:text-white focus:border-secondary focus:ring-1 focus:ring-secondary focus:shadow-[0_0_15px_rgba(0,243,255,0.3)] outline-none transition-all"
        @change="$emit('update:formData', { ...formData })"
      >
        <option value="">Selecione...</option>
        <option value="presencial">Presencial</option>
        <option value="webinar">Webinar</option>
      </select>
    </div>

    <div>
      <label class="block text-sm font-medium text-slate-700 dark:text-white mb-2">Programa *</label>
      <select
        v-model="formData.program_id"
        required
        class="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0a040f] p-3 text-slate-900 dark:text-white focus:border-secondary focus:ring-1 focus:ring-secondary focus:shadow-[0_0_15px_rgba(0,243,255,0.3)] outline-none transition-all"
        @change="$emit('update:formData', { ...formData })"
      >
        <option value="">Selecione um programa...</option>
        <option v-for="program in availablePrograms" :key="program.id" :value="program.id">
          {{ program.title_pt }} {{ isProgramExpired(program) ? '(Expirado)' : '' }}
        </option>
      </select>
      
      <!-- Informação de Datas do Programa -->
      <div v-if="selectedProgram" class="mt-2 text-xs">
        <div class="flex flex-col gap-1">
          <div class="flex items-center gap-2">
            <span class="text-slate-500 dark:text-gray-400">Período do Programa:</span>
            <span class="font-medium text-slate-700 dark:text-gray-200">
              {{ formatDate(selectedProgram.program_start_date) }} - {{ formatDate(selectedProgram.program_end_date) }}
            </span>
          </div>
          
          <div v-if="isProgramExpired(selectedProgram)" class="text-red-500 font-medium flex items-center gap-1">
            <span class="material-symbols-outlined text-sm">warning</span>
            Programa Expirado - Não é possível criar eventos
          </div>
          <div v-else class="text-green-500 font-medium flex items-center gap-1">
            <span class="material-symbols-outlined text-sm">check_circle</span>
            Programa Ativo
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
  titulo: string
  descricao: string
  tipo: string
  local: string
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
  if (!dateString) return 'Data indefinida'
  return new Date(dateString).toLocaleDateString()
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

