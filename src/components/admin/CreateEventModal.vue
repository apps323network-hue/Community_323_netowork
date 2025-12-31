<template>
  <Modal
    v-model="isOpen"
    :title="`Criar Novo Evento - Etapa ${currentStep} de 2`"
    size="lg"
  >
    <!-- Progress Indicator -->
    <div class="mb-6">
      <div class="flex items-center justify-between mb-2">
        <span class="text-xs text-slate-600 dark:text-white/60">Etapa {{ currentStep }} de 2</span>
        <span class="text-xs text-slate-600 dark:text-white/60">{{ currentStep === 1 ? 'Informações Básicas' : 'Data e Localização' }}</span>
      </div>
      <div class="w-full bg-slate-200 dark:bg-white/10 rounded-full h-2">
        <div 
          class="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all duration-300"
          :style="{ width: `${(currentStep / 2) * 100}%` }"
        ></div>
      </div>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-4">
      <!-- Step 1: Basic Information -->
      <EventFormStep1
        v-if="currentStep === 1"
        :form-data="formData"
        @update:form-data="handleFormDataUpdate"
      />

      <!-- Step 2: Date, Time and Location -->
      <EventFormStep2
        v-if="currentStep === 2"
        :form-data="formData"
        :date-time="dateTime"
        :image-preview="imagePreview"
        @update:form-data="handleFormDataUpdate"
        @update:date-time="handleDateTimeUpdate"
        @image-select="handleImageSelect"
        @image-remove="handleImageRemove"
        @image-error="(message) => emit('validation-error', message)"
      />

      <!-- Navigation Buttons -->
      <div class="flex gap-3 pt-4">
        <button
          v-if="currentStep === 1"
          type="button"
          @click="nextStep"
          class="flex-1 px-4 py-2 bg-gradient-to-r from-primary to-secondary text-black font-bold rounded-lg hover:shadow-lg transition-all"
        >
          Próximo
        </button>
        <button
          v-if="currentStep === 2"
          type="button"
          @click="prevStep"
          class="px-4 py-2 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 rounded-lg text-slate-700 dark:text-white font-medium transition-all"
        >
          Voltar
        </button>
        <button
          v-if="currentStep === 2"
          type="submit"
          :disabled="submitting"
          class="flex-1 px-4 py-2 bg-gradient-to-r from-primary to-secondary text-black font-bold rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
        >
          {{ submitting ? 'Criando...' : 'Criar Evento' }}
        </button>
        <button
          v-if="currentStep === 1"
          type="button"
          @click="handleCancel"
          class="px-4 py-2 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 rounded-lg text-slate-700 dark:text-white font-medium transition-all"
        >
          Cancelar
        </button>
      </div>
    </form>
  </Modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import Modal from '@/components/ui/Modal.vue'
import EventFormStep1 from './EventFormStep1.vue'
import EventFormStep2 from './EventFormStep2.vue'
import type { EventStatus } from '@/types/events'

interface EventFormData {
  titulo: string
  descricao: string
  tipo: string
  local: string
  image_url: string
  status: EventStatus
}

interface DateTimeData {
  day: string
  month: string
  year: string
  hour: string
  minute: string
}

interface Props {
  modelValue: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'submit', data: { formData: EventFormData; dateTime: DateTimeData; imageFile: File | null }): void
  (e: 'cancel'): void
  (e: 'validation-error', message: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const currentStep = ref(1)
const submitting = ref(false)

const formData = ref<EventFormData>({
  titulo: '',
  descricao: '',
  tipo: '',
  local: '',
  image_url: '',
  status: 'approved',
})

const dateTime = ref<DateTimeData>({
  day: '',
  month: '',
  year: '',
  hour: '',
  minute: '',
})

const selectedImageFile = ref<File | null>(null)
const imagePreview = ref<string | null>(null)

// Reset form when modal closes
watch(isOpen, (newVal) => {
  if (!newVal) {
    resetForm()
  }
})

function resetForm() {
  currentStep.value = 1
  formData.value = {
    titulo: '',
    descricao: '',
    tipo: '',
    local: '',
    image_url: '',
    status: 'approved',
  }
  dateTime.value = {
    day: '',
    month: '',
    year: '',
    hour: '',
    minute: '',
  }
  selectedImageFile.value = null
  imagePreview.value = null
}

function handleFormDataUpdate(data: EventFormData) {
  formData.value = { ...data }
}

function handleDateTimeUpdate(data: DateTimeData) {
  dateTime.value = { ...data }
}

function handleImageSelect(file: File) {
  selectedImageFile.value = file
  
  const reader = new FileReader()
  reader.onload = (e) => {
    imagePreview.value = e.target?.result as string
  }
  reader.readAsDataURL(file)
}

function handleImageRemove() {
  selectedImageFile.value = null
  imagePreview.value = null
  formData.value.image_url = ''
}

function nextStep() {
  // Validar campos da etapa 1
  if (!formData.value.titulo || !formData.value.tipo) {
    emit('validation-error', 'Por favor, preencha todos os campos obrigatórios')
    return false
  }
  currentStep.value = 2
  return true
}

function prevStep() {
  currentStep.value = 1
}

function handleSubmit() {
  if (currentStep.value === 1) {
    const success = nextStep()
    if (!success) {
      // Validação falhou, não avança
      return
    }
  } else {
    // Validar campos da etapa 2
    if (!dateTime.value.day || !dateTime.value.month || !dateTime.value.year || 
        !dateTime.value.hour || !dateTime.value.minute) {
      emit('validation-error', 'Por favor, preencha todos os campos de data e hora')
      return
    }
    
    emit('submit', {
      formData: formData.value,
      dateTime: dateTime.value,
      imageFile: selectedImageFile.value,
    })
  }
}

function handleCancel() {
  emit('cancel')
  isOpen.value = false
}

// Expose methods for parent component
defineExpose({
  setSubmitting: (value: boolean) => {
    submitting.value = value
  },
})
</script>

