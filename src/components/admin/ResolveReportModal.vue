<template>
  <Modal v-model="isOpen" title="Resolver Report" size="lg">
    <div class="space-y-6">
      <!-- Informações do Report -->
      <div class="bg-slate-50 dark:bg-surface-card rounded-lg p-4 border border-slate-200 dark:border-white/5">
        <div class="space-y-3">
          <div>
            <p class="text-slate-600 dark:text-white/60 text-xs mb-1">Tipo de Item</p>
            <span
              class="inline-block px-2 py-1 rounded-full text-xs font-bold"
              :class="getItemTypeClass(report?.reported_item_type || '')"
            >
              {{ getItemTypeLabel(report?.reported_item_type || '') }}
            </span>
          </div>
          <div>
            <p class="text-slate-600 dark:text-white/60 text-xs mb-1">Motivo</p>
            <span
              class="inline-block px-2 py-1 rounded-full text-xs font-bold"
              :class="getReasonClass(report?.reason || '')"
            >
              {{ getReasonLabel(report?.reason || '') }}
            </span>
          </div>
          <div>
            <p class="text-slate-600 dark:text-white/60 text-xs mb-1">Reportado por</p>
            <p class="text-slate-900 dark:text-white font-medium">{{ report?.reporter_name || 'Usuário' }}</p>
          </div>
          <div v-if="report?.description">
            <p class="text-slate-600 dark:text-white/60 text-xs mb-1">Descrição</p>
            <p class="text-slate-700 dark:text-white/80 text-sm">{{ report.description }}</p>
          </div>
        </div>
      </div>

      <!-- Preview do Item Reportado -->
      <div class="bg-slate-50 dark:bg-surface-card rounded-lg p-4 border border-slate-200 dark:border-white/5">
        <p class="text-slate-600 dark:text-white/60 text-xs mb-3">Conteúdo Reportado:</p>
        <div v-if="report?.reported_item">
          <div v-if="report.reported_item_type === 'post' || report.reported_item_type === 'comment'">
            <p class="text-slate-700 dark:text-white/80 text-sm whitespace-pre-line">{{ (report.reported_item as any).conteudo }}</p>
            <div
              v-if="(report.reported_item as any).image_url"
              class="mt-3 rounded-lg overflow-hidden max-w-xs"
            >
              <img
                :src="(report.reported_item as any).image_url"
                alt="Imagem do conteúdo"
                class="w-full h-auto max-h-40 object-cover"
              />
            </div>
          </div>
          <div v-else-if="report.reported_item_type === 'user'">
            <div class="flex items-center gap-3">
              <div
                v-if="(report.reported_item as any).avatar_url"
                class="w-12 h-12 rounded-full overflow-hidden"
              >
                <img
                  :src="(report.reported_item as any).avatar_url"
                  :alt="(report.reported_item as any).nome"
                  class="w-full h-full object-cover"
                />
              </div>
              <div>
                <p class="text-slate-900 dark:text-white font-medium">{{ (report.reported_item as any).nome || 'Usuário' }}</p>
                <p class="text-slate-600 dark:text-white/60 text-xs">{{ (report.reported_item as any).email || '' }}</p>
                <p class="text-slate-600 dark:text-white/60 text-xs">{{ (report.reported_item as any).area_atuacao || '' }}</p>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="text-slate-500 dark:text-white/40 text-sm">
          Carregando conteúdo...
        </div>
      </div>

      <!-- Seleção de Ação -->
      <div>
        <label class="block text-slate-900 dark:text-white/80 text-sm font-semibold mb-3">Ação a Tomar *</label>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            :class="[
              'flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all text-sm',
              action === 'remove_content'
                ? 'bg-red-500/20 text-red-600 dark:text-red-400 border-2 border-red-500'
                : 'bg-slate-50 dark:bg-surface-card text-slate-700 dark:text-white/60 border border-slate-200 dark:border-white/10 hover:border-red-500/30',
            ]"
            @click="action = 'remove_content'"
          >
            <span class="material-symbols-outlined text-lg">delete</span>
            Remover Conteúdo
          </button>
          <button
            :class="[
              'flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all text-sm',
              action === 'ban_user'
                ? 'bg-red-600/20 text-red-600 dark:text-red-500 border-2 border-red-600'
                : 'bg-slate-50 dark:bg-surface-card text-slate-700 dark:text-white/60 border border-slate-200 dark:border-white/10 hover:border-red-600/30',
            ]"
            @click="action = 'ban_user'"
          >
            <span class="material-symbols-outlined text-lg">person_off</span>
            Banir Usuário
          </button>
          <button
            :class="[
              'flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all text-sm',
              action === 'add_strike'
                ? 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-2 border-yellow-500'
                : 'bg-slate-50 dark:bg-surface-card text-slate-700 dark:text-white/60 border border-slate-200 dark:border-white/10 hover:border-yellow-500/30',
            ]"
            @click="action = 'add_strike'"
          >
            <span class="material-symbols-outlined text-lg">warning</span>
            Adicionar Strike
          </button>
          <button
            :class="[
              'flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all text-sm',
              action === 'dismiss'
                ? 'bg-gray-500/20 text-gray-600 dark:text-gray-400 border-2 border-gray-500'
                : 'bg-slate-50 dark:bg-surface-card text-slate-700 dark:text-white/60 border border-slate-200 dark:border-white/10 hover:border-gray-500/30',
            ]"
            @click="action = 'dismiss'"
          >
            <span class="material-symbols-outlined text-lg">close</span>
            Descartar Report
          </button>
        </div>
      </div>

      <!-- Campo de Detalhes -->
      <div v-if="action && action !== 'dismiss'">
        <label class="block text-slate-900 dark:text-white/80 text-sm font-semibold mb-2">Detalhes (opcional)</label>
        <textarea
          v-model="details"
          rows="3"
          class="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark p-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/40 focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none"
          placeholder="Adicione observações sobre a ação tomada..."
        />
      </div>

      <!-- Checkbox para adicionar strike (quando remover conteúdo) -->
      <div v-if="action === 'remove_content'" class="flex items-start gap-3">
        <input
          v-model="addStrike"
          type="checkbox"
          id="addStrike"
          class="mt-1 w-4 h-4 rounded border-slate-300 dark:border-white/20 bg-white dark:bg-surface-card text-primary focus:ring-primary focus:ring-offset-0"
        />
        <label for="addStrike" class="text-slate-900 dark:text-white/80 text-sm flex-1">
          Adicionar strike ao autor
          <p class="text-slate-600 dark:text-white/60 text-xs mt-1">
            Adicionar um strike ao autor por este conteúdo inapropriado.
          </p>
        </label>
      </div>

      <!-- Warning para ações destrutivas -->
      <div v-if="action === 'remove_content' || action === 'ban_user'" class="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
        <div class="flex items-start gap-2">
          <span class="material-symbols-outlined text-red-400 text-lg">warning</span>
          <div class="flex-1">
            <p class="text-red-400 text-sm font-semibold">Ação Destrutiva</p>
            <p class="text-red-400/80 text-xs mt-1">
              {{ action === 'ban_user' ? 'Banir o usuário é uma ação permanente e não pode ser desfeita facilmente.' : 'Remover o conteúdo é uma ação permanente e não pode ser desfeita.' }}
            </p>
          </div>
        </div>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
        <p class="text-red-400 text-sm">{{ error }}</p>
      </div>
    </div>

    <template #footer>
      <div class="flex gap-3">
        <button
          @click="isOpen = false"
          class="px-4 py-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 rounded-lg text-slate-700 dark:text-white font-medium transition-all"
        >
          Cancelar
        </button>
        <button
          @click="handleSubmit"
          :disabled="!action || processing"
          class="px-4 py-2 bg-gradient-to-r from-primary to-secondary text-black font-bold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ processing ? 'Processando...' : 'Confirmar Ação' }}
        </button>
      </div>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useAdminStore } from '@/stores/admin'
import Modal from '@/components/ui/Modal.vue'
import { toast } from 'vue-sonner'
import type { Report, ReportResolveInput } from '@/types/admin'

interface Props {
  modelValue: boolean
  report: Report | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  resolved: []
}>()

const adminStore = useAdminStore()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const action = ref<'remove_content' | 'suspend_user' | 'ban_user' | 'add_strike' | 'dismiss' | ''>('')
const details = ref('')
const addStrike = ref(false)
const error = ref<string | null>(null)
const processing = ref(false)

watch(() => props.modelValue, (newVal) => {
  if (!newVal) {
    // Reset form when modal closes
    action.value = ''
    details.value = ''
    addStrike.value = false
    error.value = null
  } else if (props.report) {
    // Load report details when modal opens
    loadReportDetails()
  }
})

watch(() => props.report, () => {
  if (props.report && props.modelValue) {
    loadReportDetails()
  }
})

async function loadReportDetails() {
  if (!props.report) return

  try {
    const fullReport = await adminStore.fetchReportById(props.report.id)
    // Update report with full details
    if (fullReport) {
      Object.assign(props.report, fullReport)
    }
  } catch (err) {
    console.error('Error loading report details:', err)
  }
}

function getItemTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    post: 'Post',
    comment: 'Comentário',
    user: 'Usuário',
  }
  return labels[type] || type
}

function getItemTypeClass(type: string): string {
  const classes: Record<string, string> = {
    post: 'bg-blue-500/20 text-blue-400',
    comment: 'bg-purple-500/20 text-purple-400',
    user: 'bg-orange-500/20 text-orange-400',
  }
  return classes[type] || 'bg-gray-500/20 text-gray-400'
}

function getReasonLabel(reason: string): string {
  const labels: Record<string, string> = {
    spam: 'Spam',
    inappropriate: 'Inapropriado',
    harassment: 'Assédio',
    fake_news: 'Fake News',
    other: 'Outro',
  }
  return labels[reason] || reason
}

function getReasonClass(reason: string): string {
  const classes: Record<string, string> = {
    spam: 'bg-purple-500/20 text-purple-400',
    inappropriate: 'bg-red-500/20 text-red-400',
    harassment: 'bg-red-600/20 text-red-500',
    fake_news: 'bg-orange-500/20 text-orange-400',
    other: 'bg-gray-500/20 text-gray-400',
  }
  return classes[reason] || 'bg-gray-500/20 text-gray-400'
}

async function handleSubmit() {
  if (!action.value || !props.report) {
    error.value = 'Por favor, selecione uma ação'
    return
  }

  processing.value = true
  error.value = null

  try {
    if (action.value === 'dismiss') {
      await adminStore.dismissReport(props.report.id, details.value || undefined)
      toast.success('Report descartado com sucesso!')
    } else {
      const resolveInput: ReportResolveInput = {
        action: action.value,
        details: details.value || undefined,
        add_strike: addStrike.value,
      }

      await adminStore.resolveReport(props.report.id, resolveInput)
      toast.success('Report resolvido com sucesso!')
    }

    isOpen.value = false
    emit('resolved')
  } catch (err: any) {
    error.value = err.message || 'Erro ao resolver report. Tente novamente.'
    console.error('Error resolving report:', err)
  } finally {
    processing.value = false
  }
}
</script>

