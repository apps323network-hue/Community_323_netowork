<template>
  <Modal v-model="isOpen" title="Reportar Conteúdo" size="md">
    <div class="space-y-4 sm:space-y-6">
      <!-- Informação do item reportado -->
      <div class="bg-surface-card rounded-lg p-3 sm:p-4 border border-white/5">
        <p class="text-white/60 text-xs sm:text-sm mb-1.5 sm:mb-2">Você está reportando:</p>
        <p class="text-white font-semibold text-sm sm:text-base">
          {{ itemType === 'post' ? 'Post' : itemType === 'comment' ? 'Comentário' : 'Usuário' }}
        </p>
      </div>

      <!-- Motivo do Report -->
      <div>
        <label class="block text-white/80 text-xs sm:text-sm font-semibold mb-2 sm:mb-3">
          Motivo do Report <span class="text-red-400">*</span>
        </label>
        <div class="space-y-2">
          <label
            v-for="reason in reasons"
            :key="reason.value"
            :class="[
              'flex items-start sm:items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border cursor-pointer transition-all',
              formData.reason === reason.value
                ? 'bg-primary/20 border-primary text-white'
                : 'bg-surface-card border-white/10 text-white/60 hover:border-primary/30'
            ]"
          >
            <input
              v-model="formData.reason"
              type="radio"
              :value="reason.value"
              class="mt-0.5 sm:mt-0 w-4 h-4 sm:w-5 sm:h-5 text-primary focus:ring-primary flex-shrink-0"
            />
            <div class="flex-1 min-w-0">
              <div class="font-medium text-xs sm:text-sm">{{ reason.label }}</div>
              <div class="text-[10px] sm:text-xs text-white/40 mt-0.5">{{ reason.description }}</div>
            </div>
          </label>
        </div>
      </div>

      <!-- Descrição Opcional -->
      <div>
        <label class="block text-white/80 text-xs sm:text-sm font-semibold mb-2">
          Descrição (opcional)
        </label>
        <textarea
          v-model="formData.description"
          rows="3"
          class="w-full rounded-lg border border-white/10 bg-surface-dark p-2.5 sm:p-3 text-xs sm:text-sm text-white placeholder-white/40 focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none"
          placeholder="Adicione mais detalhes sobre o problema..."
        />
      </div>

      <!-- Erro -->
      <div v-if="error" class="bg-red-500/20 border border-red-500/30 rounded-lg p-2.5 sm:p-3">
        <p class="text-red-400 text-xs sm:text-sm">{{ error }}</p>
      </div>

      <!-- Botões -->
      <div class="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2 sm:pt-4">
        <button
          type="button"
          @click="handleSubmit"
          :disabled="!formData.reason || submitting"
          class="flex-1 px-4 py-2.5 sm:py-2 bg-gradient-to-r from-primary to-secondary text-black font-bold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm min-h-[44px] sm:min-h-0"
        >
          {{ submitting ? 'Enviando...' : 'Enviar Report' }}
        </button>
        <button
          type="button"
          @click="isOpen = false"
          class="px-4 py-2.5 sm:py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white font-medium transition-all text-xs sm:text-sm min-h-[44px] sm:min-h-0"
        >
          Cancelar
        </button>
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useAdminStore } from '@/stores/admin'
import Modal from '@/components/ui/Modal.vue'
import { toast } from 'vue-sonner'
import type { ReportItemType, ReportReason } from '@/types/admin'

interface Props {
  modelValue: boolean
  itemType: ReportItemType
  itemId: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'reported': []
}>()

const adminStore = useAdminStore()

const isOpen = ref(props.modelValue)
const submitting = ref(false)
const error = ref<string | null>(null)

const formData = ref<{
  reason: ReportReason | ''
  description: string
}>({
  reason: '',
  description: '',
})

const reasons: Array<{ value: ReportReason; label: string; description: string }> = [
  {
    value: 'spam',
    label: 'Spam',
    description: 'Conteúdo promocional ou repetitivo',
  },
  {
    value: 'inappropriate',
    label: 'Conteúdo Inapropriado',
    description: 'Conteúdo ofensivo ou inadequado',
  },
  {
    value: 'harassment',
    label: 'Assédio',
    description: 'Bullying, assédio ou comportamento abusivo',
  },
  {
    value: 'fake_news',
    label: 'Informação Falsa',
    description: 'Notícias falsas ou informações enganosas',
  },
  {
    value: 'other',
    label: 'Outro',
    description: 'Outro motivo não listado',
  },
]

watch(() => props.modelValue, (newVal) => {
  isOpen.value = newVal
  if (!newVal) {
    // Reset form when modal closes
    formData.value = {
      reason: '',
      description: '',
    }
    error.value = null
  }
})

watch(isOpen, (newVal) => {
  emit('update:modelValue', newVal)
})

async function handleSubmit() {
  if (!formData.value.reason) {
    error.value = 'Por favor, selecione um motivo'
    return
  }

  submitting.value = true
  error.value = null

  try {
    await adminStore.createReport({
      reported_item_type: props.itemType,
      reported_item_id: props.itemId,
      reason: formData.value.reason,
      description: formData.value.description || undefined,
    })

    toast.success('Report enviado com sucesso!', {
      description: 'Nossa equipe irá analisar o conteúdo reportado.',
    })

    isOpen.value = false
    emit('reported')
  } catch (err: any) {
    error.value = err.message || 'Erro ao enviar report. Tente novamente.'
    console.error('Error creating report:', err)
  } finally {
    submitting.value = false
  }
}
</script>

