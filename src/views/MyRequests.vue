<template>
  <AppLayout>
    <div class="space-y-8 w-full max-w-4xl mx-auto">
      <header class="flex flex-col gap-2">
        <h1 class="text-3xl font-bold text-slate-900 dark:text-white">{{ t('myRequests.title') }}</h1>
        <p class="text-slate-500 dark:text-gray-400">{{ t('myRequests.subtitle') }}</p>
      </header>

      <div v-if="loading" class="flex justify-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>

      <div v-else-if="requests.length === 0" class="bg-white dark:bg-surface-dark p-12 rounded-2xl border border-slate-200 dark:border-white/10 text-center flex flex-col items-center gap-4">
        <div class="size-16 rounded-full bg-slate-50 dark:bg-surface-lighter flex items-center justify-center text-slate-400">
          <span class="material-symbols-outlined text-[40px]">assignment_late</span>
        </div>
        <div>
          <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-1">{{ t('myRequests.emptyTitle') }}</h3>
          <p class="text-slate-500 dark:text-gray-400 text-sm">{{ t('myRequests.emptyDesc') }}</p>
        </div>
        <RouterLink to="/servicos">
          <Button variant="primary">{{ t('myRequests.exploreMarketplace') }}</Button>
        </RouterLink>
      </div>

      <div v-else class="space-y-4">
        <div 
          v-for="request in requests" 
          :key="request.id"
          class="bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-primary/30 transition-all group"
        >
          <div class="flex items-start gap-4">
            <div class="size-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
              <span class="material-symbols-outlined">{{ getIcon(request.services?.categoria) }}</span>
            </div>
            <div class="flex flex-col gap-1">
              <div class="flex items-center gap-2">
                <h3 class="font-bold text-slate-900 dark:text-white">{{ request.services?.nome }}</h3>
                <span :class="getStatusClasses(request.status)">
                  {{ getStatusLabel(request.status) }}
                </span>
              </div>
              <p class="text-sm text-slate-500 dark:text-gray-400 line-clamp-1">
                {{ request.mensagem || t('myRequests.noMessage') }}
              </p>
              <p class="text-[10px] text-slate-400 dark:text-gray-500 uppercase font-bold tracking-wider mt-1">
                {{ t('myRequests.requestedOn') }} {{ formatDate(request.created_at) }}
              </p>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <Button variant="outline" size="sm" @click="viewDetails(request)">
              {{ t('myRequests.viewDetails') }}
            </Button>
          </div>
        </div>
      </div>
    </div>

    <!-- Details Modal -->
    <Modal
      v-if="selectedRequest"
      v-model="showDetailsModal"
      :title="t('myRequests.modalTitle')"
    >
      <div class="flex flex-col gap-6">
        <div class="flex items-center justify-between">
          <div class="flex flex-col">
            <span class="text-xs font-bold text-slate-400 uppercase tracking-widest">{{ t('myRequests.labels.service') }}</span>
            <span class="text-lg font-bold text-slate-900 dark:text-white">{{ selectedRequest.services?.nome }}</span>
          </div>
          <span :class="getStatusClasses(selectedRequest.status)">
            {{ getStatusLabel(selectedRequest.status) }}
          </span>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col p-3 rounded-lg bg-slate-50 dark:bg-surface-lighter">
            <span class="text-[10px] font-bold text-slate-400 uppercase">{{ t('myRequests.labels.requestDate') }}</span>
            <span class="text-sm font-medium dark:text-white">{{ formatDate(selectedRequest.created_at) }}</span>
          </div>
          <div v-if="selectedRequest.status_updated_at" class="flex flex-col p-3 rounded-lg bg-slate-50 dark:bg-surface-lighter">
            <span class="text-[10px] font-bold text-slate-400 uppercase">{{ t('myRequests.labels.lastUpdate') }}</span>
            <span class="text-sm font-medium dark:text-white">{{ formatDate(selectedRequest.status_updated_at) }}</span>
          </div>
        </div>

        <div v-if="selectedRequest.mensagem" class="flex flex-col gap-1.5">
          <span class="text-xs font-bold text-slate-400 uppercase tracking-widest">{{ t('myRequests.labels.yourMessage') }}</span>
          <div class="p-4 rounded-lg bg-slate-50 dark:bg-surface-lighter text-sm text-slate-600 dark:text-gray-300 italic border-l-4 border-slate-300">
            "{{ selectedRequest.mensagem }}"
          </div>
        </div>

        <div class="p-4 rounded-xl bg-primary/5 border border-primary/10 flex items-start gap-4">
          <span class="material-symbols-outlined text-primary">info</span>
          <div class="flex flex-col gap-1">
            <h4 class="text-sm font-bold text-slate-900 dark:text-white">{{ t('myRequests.nextSteps.title') }}</h4>
            <p class="text-xs text-slate-500 dark:text-gray-400 leading-relaxed">
              {{ t('myRequests.nextSteps.description') }}
            </p>
          </div>
        </div>
      </div>
    </Modal>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSupabase } from '@/composables/useSupabase'
import AppLayout from '@/components/layout/AppLayout.vue'
import Button from '@/components/ui/Button.vue'
import Modal from '@/components/ui/Modal.vue'

const { t, locale } = useI18n()

const { supabase } = useSupabase()
const loading = ref(true)
const requests = ref<any[]>([])

const showDetailsModal = ref(false)
const selectedRequest = ref<any>(null)

async function fetchRequests() {
  try {
    loading.value = true
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return

    const { data, error } = await supabase
      .from('service_requests')
      .select(`
        *,
        services (
          id,
          nome,
          categoria
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    requests.value = data || []
  } catch (error) {
    console.error('Erro ao buscar solicitações:', error)
  } finally {
    loading.value = false
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case 'pendente': return t('myRequests.status.pendente')
    case 'em_andamento': return t('myRequests.status.em_andamento')
    case 'concluido': return t('myRequests.status.concluido')
    default: return status
  }
}

function getStatusClasses(status: string) {
  const base = 'text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider'
  switch (status) {
    case 'pendente': return `${base} bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-500`
    case 'em_andamento': return `${base} bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-500`
    case 'concluido': return `${base} bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-500`
    default: return `${base} bg-slate-100 text-slate-700`
  }
}

function getIcon(category: string) {
  switch (category) {
    case 'legal': return 'domain'
    case 'finance': return 'account_balance'
    case 'mentoring': return 'badge'
    case 'marketing': return 'campaign'
    default: return 'assignment'
  }
}

function formatDate(date: string) {
  if (!date) return '-'
  return new Date(date).toLocaleDateString(locale.value, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

function viewDetails(request: any) {
  selectedRequest.value = request
  showDetailsModal.value = true
}

onMounted(() => {
  fetchRequests()
})
</script>
