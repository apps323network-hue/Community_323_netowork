<template>
  <Modal v-model="isOpen" title="Aprovar/Rejeitar Usuário" size="lg">
    <div class="space-y-6">
      <!-- User Info -->
      <div class="bg-surface-card rounded-lg p-4 border border-white/5">
        <h3 class="text-white font-bold text-lg mb-2">{{ user?.nome || 'Usuário sem nome' }}</h3>
        <div class="space-y-2 text-white/70 text-sm">
          <div v-if="user?.area_atuacao" class="flex items-center gap-2">
            <span class="material-symbols-outlined text-base">work</span>
            <span>{{ user.area_atuacao }}</span>
          </div>
          <div v-if="user?.cidade || user?.pais" class="flex items-center gap-2">
            <span class="material-symbols-outlined text-base">location_on</span>
            <span>{{ [user.cidade, user.pais].filter(Boolean).join(', ') }}</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-base">calendar_today</span>
            <span>Cadastrado em {{ formattedDate }}</span>
          </div>
        </div>
      </div>

      <!-- Action Selection -->
      <div>
        <label class="block text-white/80 text-sm font-semibold mb-3">Ação</label>
        <div class="flex gap-3">
          <button
            :class="[
              'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all',
              action === 'approve'
                ? 'bg-green-500/20 text-green-400 border-2 border-green-500'
                : 'bg-surface-card text-white/60 border border-white/10 hover:border-green-500/30',
            ]"
            @click="action = 'approve'"
          >
            <span class="material-symbols-outlined">check_circle</span>
            Aprovar
          </button>
          <button
            :class="[
              'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all',
              action === 'reject'
                ? 'bg-red-500/20 text-red-400 border-2 border-red-500'
                : 'bg-surface-card text-white/60 border border-white/10 hover:border-red-500/30',
            ]"
            @click="action = 'reject'"
          >
            <span class="material-symbols-outlined">cancel</span>
            Rejeitar
          </button>
        </div>
      </div>

      <!-- Reason (required for rejection) -->
      <div v-if="action === 'reject'">
        <label class="block text-white/80 text-sm font-semibold mb-2">
          Motivo da Rejeição <span class="text-red-400">*</span>
        </label>
        <textarea
          v-model="reason"
          rows="4"
          class="w-full px-3 py-2 border border-white/10 rounded-lg bg-surface-card text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
          placeholder="Descreva o motivo da rejeição..."
        ></textarea>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
        <p class="text-red-400 text-sm">{{ error }}</p>
      </div>
    </div>

    <template #footer>
      <div class="flex gap-3">
        <Button variant="outline" @click="handleCancel">Cancelar</Button>
        <Button
          variant="primary"
          :disabled="!canSubmit || processing"
          @click="handleSubmit"
        >
          <span v-if="processing" class="animate-spin">⏳</span>
          <span v-else>{{ action === 'approve' ? 'Aprovar' : 'Rejeitar' }}</span>
        </Button>
      </div>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { AdminUser } from '@/types/admin'
import Modal from '@/components/ui/Modal.vue'
import Button from '@/components/ui/Button.vue'

interface Props {
  modelValue: boolean
  user: AdminUser | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  approve: [userId: string]
  reject: [userId: string, reason: string]
}>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const action = ref<'approve' | 'reject'>('approve')
const reason = ref('')
const error = ref<string | null>(null)
const processing = ref(false)

const canSubmit = computed(() => {
  if (action.value === 'reject') {
    return reason.value.trim().length > 0
  }
  return true
})

const formattedDate = computed(() => {
  if (!props.user?.created_at) return ''
  const date = new Date(props.user.created_at)
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
})

watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    // Reset form when modal opens
    action.value = 'approve'
    reason.value = ''
    error.value = null
    processing.value = false
  }
})

function handleCancel() {
  isOpen.value = false
}

async function handleSubmit() {
  if (!props.user) return

  if (action.value === 'reject' && !reason.value.trim()) {
    error.value = 'Por favor, informe o motivo da rejeição'
    return
  }

  processing.value = true
  error.value = null

  try {
    if (action.value === 'approve') {
      emit('approve', props.user.id)
    } else {
      emit('reject', props.user.id, reason.value.trim())
    }
    isOpen.value = false
  } catch (err: any) {
    error.value = err.message || 'Erro ao processar ação. Tente novamente.'
  } finally {
    processing.value = false
  }
}
</script>

