<template>
  <Modal v-model="isOpen" :title="t('report.title')" size="md">
    <div class="space-y-4 sm:space-y-6">

      <!-- Motivo do Report -->
      <div>
        <label class="block text-slate-700 dark:text-white/80 text-xs sm:text-sm font-semibold mb-2 sm:mb-3">
          {{ t('report.reasonLabel') }} <span class="text-red-500 dark:text-red-400">*</span>
        </label>
        <div class="space-y-2">
          <label
            v-for="reason in reasons"
            :key="reason.value"
            :class="[
              'flex items-start sm:items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border cursor-pointer transition-all',
              formData.reason === reason.value
                ? 'bg-primary/10 dark:bg-primary/20 border-primary text-slate-900 dark:text-white'
                : 'bg-white dark:bg-surface-card border-slate-200 dark:border-white/10 text-slate-600 dark:text-white/60 hover:border-primary/50 dark:hover:border-primary/30'
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
              <div class="text-[10px] sm:text-xs text-slate-500 dark:text-white/40 mt-0.5">{{ reason.description }}</div>
            </div>
          </label>
        </div>
      </div>

      <!-- Descrição Opcional -->
      <div>
        <label class="block text-slate-700 dark:text-white/80 text-xs sm:text-sm font-semibold mb-2">
          {{ t('report.descriptionLabel') }}
        </label>
        <textarea
          v-model="formData.description"
          rows="3"
          class="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark p-2.5 sm:p-3 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/40 focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none"
          :placeholder="t('report.descriptionPlaceholder')"
        />
      </div>

      <!-- Erro -->
      <div v-if="error" class="bg-red-50 dark:bg-red-500/20 border border-red-200 dark:border-red-500/30 rounded-lg p-2.5 sm:p-3">
        <p class="text-red-600 dark:text-red-400 text-xs sm:text-sm">{{ error }}</p>
      </div>

      <!-- Botões -->
      <div class="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2 sm:pt-4">
        <button
          type="button"
          @click="handleSubmit"
          :disabled="!formData.reason || submitting"
          class="flex-1 px-4 py-2.5 sm:py-2 bg-gradient-to-r from-primary to-secondary text-black font-bold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm min-h-[44px] sm:min-h-0"
        >
          {{ submitting ? t('report.submitting') : t('report.submit') }}
        </button>
        <button
          type="button"
          @click="isOpen = false"
          class="px-4 py-2.5 sm:py-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 rounded-lg text-slate-700 dark:text-white font-medium transition-all text-xs sm:text-sm min-h-[44px] sm:min-h-0"
        >
          {{ t('report.cancel') }}
        </button>
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
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

const { t } = useI18n()
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

const reasons = computed<Array<{ value: ReportReason; label: string; description: string }>>(() => [
  {
    value: 'spam',
    label: t('report.reasons.spam'),
    description: t('report.reasons.spamDesc'),
  },
  {
    value: 'inappropriate',
    label: t('report.reasons.inappropriate'),
    description: t('report.reasons.inappropriateDesc'),
  },
  {
    value: 'harassment',
    label: t('report.reasons.harassment'),
    description: t('report.reasons.harassmentDesc'),
  },
  {
    value: 'fake_news',
    label: t('report.reasons.fake_news'),
    description: t('report.reasons.fake_newsDesc'),
  },
  {
    value: 'other',
    label: t('report.reasons.other'),
    description: t('report.reasons.otherDesc'),
  },
])

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
    error.value = t('report.selectReasonError')
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

    toast.success(t('report.success'), {
      description: t('report.successDesc'),
    })

    isOpen.value = false
    emit('reported')
  } catch (err: any) {
    error.value = err.message || t('report.error')
    console.error('Error creating report:', err)
  } finally {
    submitting.value = false
  }
}
</script>

