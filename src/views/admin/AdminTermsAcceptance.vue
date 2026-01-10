<template>
  <AdminLayout>
    <div class="w-full flex flex-col gap-8">
      <!-- Header -->
      <div class="mb-6 flex items-start justify-between">
        <div>
          <h1 class="text-slate-900 dark:text-white text-4xl lg:text-5xl font-black mb-3">
            <span class="bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-primary animate-gradient">
              {{ t('adminTerms.title') }}
            </span>
          </h1>
          <p class="text-slate-600 dark:text-white/60 text-lg">
            {{ t('adminTerms.description') }}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          @click="handleRefresh"
          :loading="loading"
          class="flex items-center gap-2"
        >
          <span class="material-symbols-outlined">refresh</span>
          {{ t('common.refresh') }}
        </Button>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="bg-white dark:bg-surface-card rounded-xl p-6 border border-slate-200 dark:border-white/5 hover:border-secondary/50 transition-all shadow-lg dark:shadow-xl">
          <div class="flex items-center justify-between mb-4">
            <span class="text-slate-600 dark:text-white/70 text-sm font-medium">{{ t('adminTerms.stats.total') }}</span>
            <div class="p-2 bg-slate-100 dark:bg-white/5 rounded-lg">
              <span class="material-symbols-outlined text-slate-500 dark:text-white/50 text-xl">description</span>
            </div>
          </div>
          <div class="text-3xl font-black text-slate-900 dark:text-white mb-1">{{ stats.total }}</div>
          <div class="text-xs text-slate-500 dark:text-white/40">{{ t('adminTerms.stats.totalDescription') }}</div>
        </div>

        <div class="bg-white dark:bg-surface-card rounded-xl p-6 border border-slate-200 dark:border-white/5 hover:border-secondary/50 transition-all shadow-lg dark:shadow-xl">
          <div class="flex items-center justify-between mb-4">
            <span class="text-slate-600 dark:text-white/70 text-sm font-medium">{{ t('adminTerms.stats.terms') }}</span>
            <div class="p-2 bg-primary/10 dark:bg-primary/20 rounded-lg">
              <span class="material-symbols-outlined text-primary text-xl">gavel</span>
            </div>
          </div>
          <div class="text-3xl font-black text-slate-900 dark:text-white mb-1">{{ stats.terms_of_service }}</div>
          <div class="text-xs text-slate-500 dark:text-white/40">{{ t('adminTerms.stats.termsDescription') }}</div>
        </div>

        <div class="bg-white dark:bg-surface-card rounded-xl p-6 border border-slate-200 dark:border-white/5 hover:border-secondary/50 transition-all shadow-lg dark:shadow-xl">
          <div class="flex items-center justify-between mb-4">
            <span class="text-slate-600 dark:text-white/70 text-sm font-medium">{{ t('adminTerms.stats.privacy') }}</span>
            <div class="p-2 bg-secondary/10 dark:bg-secondary/20 rounded-lg">
              <span class="material-symbols-outlined text-secondary text-xl">privacy_tip</span>
            </div>
          </div>
          <div class="text-3xl font-black text-slate-900 dark:text-white mb-1">{{ stats.privacy_policy }}</div>
          <div class="text-xs text-slate-500 dark:text-white/40">{{ t('adminTerms.stats.privacyDescription') }}</div>
        </div>

        <div class="bg-white dark:bg-surface-card rounded-xl p-6 border border-slate-200 dark:border-white/5 hover:border-secondary/50 transition-all shadow-lg dark:shadow-xl">
          <div class="flex items-center justify-between mb-4">
            <span class="text-slate-600 dark:text-white/70 text-sm font-medium">{{ t('adminTerms.stats.today') }}</span>
            <div class="p-2 bg-green-100 dark:bg-green-500/20 rounded-lg">
              <span class="material-symbols-outlined text-green-600 dark:text-green-400 text-xl">today</span>
            </div>
          </div>
          <div class="text-3xl font-black text-slate-900 dark:text-white mb-1">{{ stats.today }}</div>
          <div class="text-xs text-slate-500 dark:text-white/40">{{ t('adminTerms.stats.todayDescription') }}</div>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white dark:bg-surface-card rounded-xl p-6 border border-slate-200 dark:border-white/5 shadow-lg">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-white mb-2">
              {{ t('adminTerms.filters.type') }}
            </label>
            <select
              v-model="filters.term_type"
              class="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">{{ t('common.all') }}</option>
              <option value="terms_of_service">{{ t('adminTerms.filters.termsOfService') }}</option>
              <option value="privacy_policy">{{ t('adminTerms.filters.privacyPolicy') }}</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-white mb-2">
              {{ t('adminTerms.filters.startDate') }}
            </label>
            <input
              v-model="filters.start_date"
              type="date"
              class="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-white mb-2">
              {{ t('adminTerms.filters.endDate') }}
            </label>
            <input
              v-model="filters.end_date"
              type="date"
              class="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div class="flex items-end">
            <Button
              variant="primary"
              @click="applyFilters"
              :loading="loading"
              full-width
            >
              {{ t('common.apply') }}
            </Button>
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="bg-white dark:bg-surface-card rounded-xl border border-slate-200 dark:border-white/5 shadow-lg overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-slate-50 dark:bg-surface-lighter border-b border-slate-200 dark:border-white/10">
              <tr>
                <th class="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-white/60 uppercase tracking-wider">
                  {{ t('adminTerms.table.user') }}
                </th>
                <th class="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-white/60 uppercase tracking-wider">
                  {{ t('adminTerms.table.term') }}
                </th>
                <th class="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-white/60 uppercase tracking-wider">
                  {{ t('adminTerms.table.type') }}
                </th>
                <th class="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-white/60 uppercase tracking-wider">
                  {{ t('adminTerms.table.acceptedAt') }}
                </th>
                <th class="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-white/60 uppercase tracking-wider">
                  {{ t('adminTerms.table.ipAddress') }}
                </th>
                <th class="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-white/60 uppercase tracking-wider">
                  {{ t('adminTerms.table.actions') }}
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 dark:divide-white/10">
              <tr
                v-if="loading && acceptances.length === 0"
                class="bg-white dark:bg-surface-card"
              >
                <td colspan="6" class="px-6 py-12 text-center">
                  <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
                  <p class="mt-4 text-slate-600 dark:text-slate-400">{{ t('common.loading') }}</p>
                </td>
              </tr>

              <tr
                v-else-if="acceptances.length === 0"
                class="bg-white dark:bg-surface-card"
              >
                <td colspan="6" class="px-6 py-12 text-center">
                  <span class="material-symbols-outlined text-6xl text-slate-400 dark:text-slate-500 mb-4">description</span>
                  <p class="text-slate-600 dark:text-slate-400">{{ t('adminTerms.noAcceptances') }}</p>
                </td>
              </tr>

              <tr
                v-else
                v-for="acceptance in acceptances"
                :key="acceptance.id"
                class="bg-white dark:bg-surface-card hover:bg-slate-50 dark:hover:bg-surface-lighter transition-colors"
              >
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                      <span class="material-symbols-outlined text-primary text-xl">person</span>
                    </div>
                    <div>
                      <div class="text-sm font-medium text-slate-900 dark:text-white">
                        {{ acceptance.user_name || 'N/A' }}
                      </div>
                      <div class="text-xs text-slate-500 dark:text-slate-400">
                        {{ acceptance.user_email || 'N/A' }}
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div class="text-sm text-slate-900 dark:text-white font-medium">
                    {{ acceptance.term?.title || 'N/A' }}
                  </div>
                  <div class="text-xs text-slate-500 dark:text-slate-400">
                    {{ t('adminTerms.table.version') }} {{ acceptance.term?.version || 'N/A' }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    class="px-2 py-1 text-xs font-medium rounded-full"
                    :class="
                      acceptance.term_type === 'terms_of_service'
                        ? 'bg-primary/10 text-primary dark:bg-primary/20'
                        : 'bg-secondary/10 text-secondary dark:bg-secondary/20'
                    "
                  >
                    {{
                      acceptance.term_type === 'terms_of_service'
                        ? t('adminTerms.filters.termsOfService')
                        : t('adminTerms.filters.privacyPolicy')
                    }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                  {{ formatDate(acceptance.accepted_at) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400 font-mono">
                  {{ acceptance.ip_address || 'N/A' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <Button
                    variant="outline"
                    size="sm"
                    @click="handleDownloadPDF(acceptance.id)"
                    :disabled="downloadingPDF === acceptance.id"
                  >
                    <span class="material-symbols-outlined text-sm mr-1">download</span>
                    {{ t('adminTerms.downloadPDF') }}
                  </Button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import AdminLayout from '@/components/layout/admin/AdminLayout.vue'
import Button from '@/components/ui/Button.vue'
import { useAdminTermsAcceptanceStore } from '@/stores/admin/termsAcceptance'
import { toast } from 'vue-sonner'

const { t } = useI18n()
const route = useRoute()
const store = useAdminTermsAcceptanceStore()

// Usar storeToRefs para manter reatividade
const { acceptances, stats, loading } = storeToRefs(store)
const downloadingPDF = ref<string | null>(null)

const filters = ref<{
  term_type: 'terms_of_service' | 'privacy_policy' | ''
  start_date: string
  end_date: string
}>({
  term_type: '',
  start_date: '',
  end_date: '',
})

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleString('pt-BR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

async function applyFilters() {
  await store.fetchAcceptances({
    term_type: filters.value.term_type || undefined,
    start_date: filters.value.start_date || undefined,
    end_date: filters.value.end_date || undefined,
  } as {
    term_type?: 'terms_of_service' | 'privacy_policy'
    start_date?: string
    end_date?: string
  })
}

async function handleDownloadPDF(acceptanceId: string) {
  downloadingPDF.value = acceptanceId
  try {
    await store.downloadAcceptancePDF(acceptanceId)
    toast.success(t('adminTerms.pdfDownloaded'))
  } catch (error: any) {
    toast.error(error.message || t('adminTerms.pdfError'))
  } finally {
    downloadingPDF.value = null
  }
}

async function handleRefresh() {
  try {
    // Forçar atualização - sempre buscar dados frescos do servidor
    await Promise.all([
      store.fetchStats(),
      store.fetchAcceptances({
        term_type: filters.value.term_type || undefined,
        start_date: filters.value.start_date || undefined,
        end_date: filters.value.end_date || undefined,
      } as {
        term_type?: 'terms_of_service' | 'privacy_policy'
        start_date?: string
        end_date?: string
      }),
    ])
    // Removido toast de sucesso conforme solicitado
  } catch (error: any) {
    toast.error(error.message || t('common.refreshError'))
  }
}

// Watch na rota para recarregar quando acessar a página
watch(
  () => route.path,
  async (newPath) => {
    if (newPath === '/admin/termos-aceites') {
      // Sempre recarregar quando acessar a página
      await handleRefresh()
    }
  },
  { immediate: true }
)

onMounted(async () => {
  // Garantir que os dados sejam carregados sempre que a página é acessada
  await handleRefresh()
})
</script>

<style scoped>
@keyframes gradient {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

.animate-gradient {
  background-size: 200% 200%;
  animation: gradient 3s ease infinite;
}
</style>
