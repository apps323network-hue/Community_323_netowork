<template>
  <div class="bg-surface-card rounded-xl p-6 border border-white/5">
    <h2 class="text-white text-xl font-bold mb-6">
      {{ isEditing ? 'Editar Evento' : 'Criar Novo Evento' }}
    </h2>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Programa -->
      <div>
        <div class="flex justify-between items-center mb-2">
          <label class="block text-white/80 text-sm font-semibold">
            Programa <span class="text-red-400">*</span>
          </label>
          <router-link to="/programs" class="text-xs text-primary hover:underline flex items-center gap-1">
            {{ t('programs.viewPrograms') }} <span class="material-symbols-outlined text-xs">open_in_new</span>
          </router-link>
        </div>
        <Select
          v-model="form.program_id"
          :options="programOptions"
          placeholder="Selecione um programa..."
          class="w-full"
        />
        <p v-if="programs.length > 0 && !programs.some(p => p.isEnrolled) && !processing" class="text-xs text-yellow-500 mt-1">
          Você precisa estar matriculado em um programa para criar eventos.
        </p>
      </div>

      <!-- Título -->
      <div>
        <label class="block text-white/80 text-sm font-semibold mb-2">
          Título do Evento <span class="text-red-400">*</span>
        </label>
        <input
          v-model="form.titulo_pt"
          type="text"
          required
          class="w-full px-4 py-3 border border-white/10 rounded-lg bg-surface-dark text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
          placeholder="Ex: Networking em Miami"
        />
      </div>

      <!-- Descrição -->
      <div>
        <label class="block text-white/80 text-sm font-semibold mb-2">Descrição</label>
        <textarea
          v-model="form.descricao_pt"
          rows="4"
          class="w-full px-4 py-3 border border-white/10 rounded-lg bg-surface-dark text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
          placeholder="Descreva o evento..."
        ></textarea>
      </div>

      <!-- Banner -->
      <div>
        <label class="block text-white/80 text-sm font-semibold mb-2">Banner do Evento</label>
        <div v-if="imagePreview" class="mb-3">
          <img :src="imagePreview" alt="Preview" class="w-full h-48 object-cover rounded-lg" />
        </div>
        <input
          type="file"
          accept="image/*"
          @change="handleImageSelect"
          class="w-full px-4 py-3 border border-white/10 rounded-lg bg-surface-dark text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-black hover:file:bg-primary/90"
        />
      </div>

      <!-- Data/Hora e Tipo -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-white/80 text-sm font-semibold mb-2">
            Data e Hora <span class="text-red-400">*</span>
          </label>
          <input
            v-model="form.data_hora"
            type="datetime-local"
            required
            class="w-full px-4 py-3 border border-white/10 rounded-lg bg-surface-dark text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
          />
        </div>
        <div>
          <label class="block text-white/80 text-sm font-semibold mb-2">
            Tipo <span class="text-red-400">*</span>
          </label>
          <select
            v-model="form.tipo"
            required
            class="w-full px-4 py-3 border border-white/10 rounded-lg bg-surface-dark text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
          >
            <option value="presencial">Presencial</option>
            <option value="webinar">Webinar</option>
          </select>
        </div>
      </div>

      <!-- Local (se presencial) -->
      <div v-if="form.tipo === 'presencial'">
        <label class="block text-white/80 text-sm font-semibold mb-2">Local</label>
        <input
          v-model="form.local_pt"
          type="text"
          class="w-full px-4 py-3 border border-white/10 rounded-lg bg-surface-dark text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
          placeholder="Ex: Miami, FL"
        />
      </div>

      <!-- Error Message -->
      <div v-if="error" class="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
        <p class="text-red-400 text-sm">{{ error }}</p>
      </div>

      <!-- Success Message -->
      <div v-if="success" class="bg-green-500/20 border border-green-500/30 rounded-lg p-3">
        <p class="text-green-400 text-sm">{{ success }}</p>
      </div>

      <!-- Actions -->
      <div class="flex gap-3">
        <button
          type="button"
          class="flex-1 px-4 py-3 bg-surface-lighter hover:bg-surface-highlight text-white border border-white/10 rounded-lg font-semibold transition-all"
          @click="$emit('cancel')"
        >
          Cancelar
        </button>
        <button
          type="submit"
          :disabled="!canSubmit || processing"
          class="flex-1 px-4 py-3 bg-neon-gradient hover:bg-neon-gradient-hover text-black font-black rounded-lg transition-all shadow-neon-pink disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="processing">{{ t('common.processing') }}</span>
          <span v-else>{{ isEditing ? t('common.saveChanges') : t('events.createEvent') }}</span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import Select from '@/components/ui/Select.vue'
import { supabase } from '@/lib/supabase'
import { usePartner } from '@/composables/usePartner'
import type { Event, EventCreateInput } from '@/types/events'

interface Props {
  event?: Event | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'event-created': [event: Event]
  'event-updated': [event: Event]
  cancel: []
}>()

const { t } = useI18n()
const { createEvent, updateEvent } = usePartner()

const isEditing = computed(() => !!props.event)

const form = ref<EventCreateInput>({
  titulo_pt: '',
  titulo_en: '',
  descricao_pt: '',
  descricao_en: '',
  data_hora: '',
  tipo: 'presencial',
  local_pt: '',
  local_en: '',
  image_url: '',
  program_id: '',
})

const imageFile = ref<File | null>(null)
const imagePreview = ref<string | null>(null)
const programs = ref<any[]>([])

const programOptions = computed(() => {
  return programs.value.map(p => ({
    value: p.id,
    label: p.title_pt,
    disabled: !p.isEnrolled,
    disabledMessage: 'Você precisa estar matriculado neste programa para criar um evento.'
  }))
})
const error = ref<string | null>(null)
const success = ref<string | null>(null)
const processing = ref(false)

const canSubmit = computed(() => {
  return form.value.titulo_pt.trim().length > 0 && 
         form.value.data_hora.length > 0 && 
         form.value.program_id.length > 0
})

watch(() => props.event, (newEvent) => {
  if (newEvent) {
    form.value = {
      titulo_pt: newEvent.titulo_pt,
      titulo_en: newEvent.titulo_en,
      descricao_pt: newEvent.descricao_pt || '',
      descricao_en: newEvent.descricao_en || '',
      data_hora: new Date(newEvent.data_hora).toISOString().slice(0, 16),
      tipo: newEvent.tipo,
      local_pt: newEvent.local_pt || '',
      local_en: newEvent.local_en || '',
      image_url: newEvent.image_url || '',
      program_id: newEvent.program_id || '',
    }
    imagePreview.value = newEvent.image_url || null
  } else {
    resetForm()
  }
}, { immediate: true })

import { useAuthStore } from '@/stores/auth'
import { onMounted } from 'vue'

const authStore = useAuthStore()

onMounted(async () => {
  await fetchProgramsForSelection()
})

async function fetchProgramsForSelection() {
  if (!authStore.user) return
  
  try {
    // Buscar todos os programas
    const { data: allPrograms, error: programsError } = await supabase
      .from('programs')
      .select('id, title_pt')
      .order('title_pt')

    if (programsError) throw programsError

    // Buscar matrículas do usuário
    const { data: enrollments, error: enrollmentsError } = await supabase
      .from('program_enrollments')
      .select('program_id')
      .eq('user_id', authStore.user.id)
      .eq('status', 'active')

    if (enrollmentsError) throw enrollmentsError

    const enrolledIds = new Set(enrollments?.map(e => e.program_id) || [])
    
    programs.value = (allPrograms || []).map(p => ({
      ...p,
      isEnrolled: enrolledIds.has(p.id)
    }))
  } catch (err: any) {
    console.error('Error fetching programs:', err)
  }
}

function resetForm() {
  form.value = {
    titulo_pt: '',
    titulo_en: '',
    descricao_pt: '',
    descricao_en: '',
    data_hora: '',
    tipo: 'presencial',
    local_pt: '',
    local_en: '',
    image_url: '',
    program_id: '',
  }
  imageFile.value = null
  imagePreview.value = null
  error.value = null
  success.value = null
}

function handleImageSelect(e: globalThis.Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return

  if (!file.type.startsWith('image/')) {
    error.value = 'Por favor, selecione apenas arquivos de imagem'
    return
  }

  if (file.size > 20 * 1024 * 1024) {
    error.value = 'A imagem deve ter no máximo 20MB'
    return
  }

  imageFile.value = file
  
  const reader = new FileReader()
  reader.onload = (e) => {
    imagePreview.value = e.target?.result as string
  }
  reader.readAsDataURL(file)
}

async function uploadImage(): Promise<string | null> {
  if (!imageFile.value) return null

  try {
    const fileExt = imageFile.value.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`
    const filePath = `events/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('event-images')
      .upload(filePath, imageFile.value, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) throw uploadError

    const { data: { publicUrl } } = supabase.storage
      .from('event-images')
      .getPublicUrl(filePath)

    return publicUrl
  } catch (err: any) {
    console.error('Error uploading image:', err)
    error.value = 'Erro ao fazer upload da imagem'
    return null
  }
}

async function handleSubmit() {
  if (!canSubmit.value) return

  processing.value = true
  error.value = null
  success.value = null

  try {
    // Upload image if selected
    let imageUrl: string | undefined = form.value.image_url
    if (imageFile.value) {
      const uploadedUrl = await uploadImage()
      if (!uploadedUrl) {
        processing.value = false
        return
      }
      imageUrl = uploadedUrl
    }

    const eventData: EventCreateInput = {
      ...form.value,
      // Mirror PT to EN if EN is empty
      titulo_en: form.value.titulo_en || form.value.titulo_pt,
      descricao_en: form.value.descricao_en || form.value.descricao_pt,
      local_en: form.value.local_en || form.value.local_pt,
      image_url: imageUrl || undefined,
    }

    let event: Event
    if (isEditing.value && props.event) {
      event = await updateEvent(props.event.id, eventData)
      emit('event-updated', event)
      success.value = 'Evento atualizado com sucesso! Aguardando aprovação.'
    } else {
      event = await createEvent(eventData)
      emit('event-created', event)
      success.value = 'Evento criado com sucesso! Aguardando aprovação.'
      resetForm()
    }

    setTimeout(() => {
      success.value = null
    }, 3000)
  } catch (err: any) {
    error.value = err.message || 'Erro ao salvar evento. Tente novamente.'
  } finally {
    processing.value = false
  }
}
</script>

<style scoped>
.bg-neon-gradient {
  background: linear-gradient(135deg, #f425f4 0%, #00f0ff 100%);
}

.bg-neon-gradient-hover {
  background: linear-gradient(135deg, #d914d9 0%, #00cce6 100%);
}

.shadow-neon-pink {
  box-shadow: 0 0 15px rgba(244, 37, 244, 0.3);
}
</style>




