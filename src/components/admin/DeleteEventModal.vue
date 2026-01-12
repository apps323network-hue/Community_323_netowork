<template>
  <Modal
    v-model="isOpen"
    title="Confirmar Exclusão"
    size="md"
  >
    <div class="space-y-4">
      <div class="flex items-start gap-4">
        <div class="flex-shrink-0 w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
          <span class="material-symbols-outlined text-red-400 text-2xl">warning</span>
        </div>
        <div class="flex-1">
          <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-2">
            Tem certeza que deseja apagar este evento?
          </h3>
          <p class="text-slate-600 dark:text-gray-300 text-sm leading-relaxed">
            Esta ação não pode ser desfeita. O evento será permanentemente removido do sistema.
          </p>
          <div v-if="event" class="mt-4 p-3 bg-slate-100 dark:bg-surface-lighter rounded-lg border border-slate-200 dark:border-white/10">
            <p class="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-1">Evento a ser deletado:</p>
            <p class="text-sm font-medium text-slate-900 dark:text-white">{{ event.titulo_pt }}</p>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex gap-3">
        <button
          @click="handleCancel"
          class="px-6 py-2.5 bg-white dark:bg-surface-lighter hover:bg-slate-50 dark:hover:bg-surface-highlight border border-slate-200 dark:border-white/10 rounded-lg text-slate-700 dark:text-white font-medium transition-all"
        >
          Cancelar
        </button>
        <button
          @click="handleConfirm"
          class="px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg font-bold transition-all shadow-lg hover:shadow-red-500/30"
        >
          Apagar Evento
        </button>
      </div>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Modal from '@/components/ui/Modal.vue'
import type { AdminEvent } from '@/types/admin'

interface Props {
  modelValue: boolean
  event: AdminEvent | null
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm'): void
  (e: 'cancel'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

function handleConfirm() {
  emit('confirm')
}

function handleCancel() {
  emit('cancel')
  isOpen.value = false
}
</script>

