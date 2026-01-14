<template>
  <AdminLayout>
    <div class="relative min-h-screen">
      <!-- Decorative Background Elements -->
      <div class="absolute -top-24 -right-24 w-96 h-96 bg-secondary/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div class="absolute bottom-1/4 -left-24 w-72 h-72 bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div class="relative z-10 w-full flex flex-col gap-10">
        <!-- Header Section -->
        <header class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div class="space-y-2">
            <h1 class="text-4xl md:text-6xl font-black tracking-tighter uppercase">
              <span class="text-slate-900 dark:text-white">Log de</span>
              <span class="block text-transparent bg-clip-text bg-gradient-to-r from-secondary via-primary to-secondary animate-gradient-x">Aceites Legais</span>
            </h1>
            <p class="text-slate-500 dark:text-slate-400 text-lg font-medium max-w-2xl">
              Rastreamento de conformidade e auditoria de aceitação de termos em tempo real.
            </p>
          </div>
          
          <div class="flex items-center gap-3">
             <Button
                variant="outline"
                @click="handleRefresh"
                class="h-14 px-6 rounded-2xl border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 transition-all flex items-center gap-2"
              >
                <span class="material-symbols-outlined" :class="{ 'animate-spin': loading }">refresh</span>
                Sincronizar
              </Button>
          </div>
        </header>

        <!-- Stats Section -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total de Aceites" 
            :value="stats.total" 
            icon="description" 
            color="slate" 
            :loading="initialLoading"
          />
          <StatCard 
            title="Termos de Uso" 
            :value="stats.terms_of_service" 
            icon="gavel" 
            color="primary" 
            :loading="initialLoading"
          />
          <StatCard 
            title="Privacidade" 
            :value="stats.privacy_policy" 
            icon="privacy_tip" 
            color="secondary" 
            :loading="initialLoading"
          />
          <StatCard 
            title="Hoje" 
            :value="stats.today" 
            icon="today" 
            color="green" 
            :loading="initialLoading"
          />
        </div>

        <!-- Filters & History Table -->
        <div class="flex flex-col gap-6">
          <!-- Filter Bar -->
          <div class="p-1 rounded-[2rem] bg-gradient-to-r from-slate-200 dark:from-white/10 to-transparent">
            <div class="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[1.9rem] p-4 flex flex-wrap items-end gap-6 border border-white/20 dark:border-white/5">
              <div class="flex-1 min-w-[200px] space-y-2">
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Tipo de Documento</label>
                <select v-model="filters.term_type" class="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-bold uppercase tracking-widest focus:ring-2 focus:ring-primary/50 transition-all outline-none">
                  <option value="">Todos os Tipos</option>
                  <option value="terms_of_service">Termos de Uso</option>
                  <option value="privacy_policy">Política de Privacidade</option>
                </select>
              </div>

              <div class="flex-1 min-w-[200px] space-y-2">
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Data Inicial</label>
                <input type="date" v-model="filters.start_date" class="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-bold focus:ring-2 focus:ring-primary/50 transition-all outline-none" />
              </div>

              <div class="flex-1 min-w-[200px] space-y-2">
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Data Final</label>
                <input type="date" v-model="filters.end_date" class="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-bold focus:ring-2 focus:ring-primary/50 transition-all outline-none" />
              </div>
              
              <button @click="clearFilters" class="h-12 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-colors">
                Limpar
              </button>
            </div>
          </div>

          <!-- Enhanced Table -->
          <div class="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-[2rem] border border-slate-200 dark:border-white/10 overflow-hidden shadow-xl">
            <div class="overflow-x-auto custom-scrollbar">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="border-b border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5">
                    <th class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Usuário</th>
                    <th class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Documento</th>
                    <th class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Data do Aceite</th>
                    <th class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Conexão (IP/UA)</th>
                    <th class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-white/5">
                  <template v-if="initialLoading">
                    <tr v-for="i in 5" :key="i" class="animate-pulse">
                      <td class="px-8 py-6"><div class="h-10 w-40 bg-slate-200 dark:bg-white/10 rounded-xl"></div></td>
                      <td class="px-8 py-6"><div class="h-10 w-32 bg-slate-200 dark:bg-white/10 rounded-xl"></div></td>
                      <td class="px-8 py-6"><div class="h-6 w-24 bg-slate-200 dark:bg-white/10 rounded-full mx-auto"></div></td>
                      <td class="px-8 py-6"><div class="space-y-2"><div class="h-4 w-20 bg-slate-200 dark:bg-white/10 rounded"></div><div class="h-2 w-32 bg-slate-200 dark:bg-white/10 rounded"></div></div></td>
                      <td class="px-8 py-6 text-right"><div class="h-10 w-10 bg-slate-200 dark:bg-white/10 rounded-xl ml-auto"></div></td>
                    </tr>
                  </template>
                  
                  <template v-else-if="paginatedAcceptances.length > 0">
                    <tr v-for="acceptance in paginatedAcceptances" :key="acceptance.id" class="group hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                      <td class="px-8 py-6">
                        <div class="flex items-center gap-4">
                          <div class="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                            <span class="material-symbols-outlined text-primary">person</span>
                          </div>
                          <div class="min-w-0">
                            <div class="text-sm font-black text-slate-900 dark:text-white truncate uppercase tracking-tight">{{ acceptance.user_name }}</div>
                            <div class="text-[10px] font-bold text-slate-400 lowercase truncate">{{ acceptance.user_email }}</div>
                          </div>
                        </div>
                      </td>
                      <td class="px-8 py-6">
                        <div class="flex flex-col">
                          <span class="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest mb-1">{{ acceptance.term?.title }}</span>
                          <span class="inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest w-fit" :class="acceptance.term_type === 'terms_of_service' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'">
                            v{{ acceptance.term?.version }}
                          </span>
                        </div>
                      </td>
                      <td class="px-8 py-6 text-center">
                        <span class="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-tighter">{{ formatDate(acceptance.accepted_at) }}</span>
                      </td>
                      <td class="px-8 py-6">
                        <div class="flex flex-col gap-1 max-w-[200px]">
                          <span class="text-[10px] font-mono font-bold text-slate-900 dark:text-white">{{ acceptance.ip_address || '0.0.0.0' }}</span>
                          <span class="text-[9px] text-slate-400 truncate leading-tight italic" :title="acceptance.user_agent || undefined">{{ acceptance.user_agent || 'Unknown Agent' }}</span>
                        </div>
                      </td>
                      <td class="px-8 py-6 text-right">
                        <button 
                          @click="handleDownloadPDF(acceptance.id)"
                          :disabled="downloadingPDF === acceptance.id"
                          class="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-primary hover:bg-white dark:hover:bg-surface-lighter transition-all group/btn flex items-center justify-center"
                          title="Baixar PDF de Aceite"
                        >
                          <span v-if="downloadingPDF === acceptance.id" class="material-symbols-outlined animate-spin">sync</span>
                          <span v-else class="material-symbols-outlined group-hover/btn:scale-110 transition-transform">picture_as_pdf</span>
                        </button>
                      </td>
                    </tr>
                  </template>

                  <tr v-else>
                    <td colspan="5" class="px-8 py-20 text-center">
                      <div class="flex flex-col items-center gap-4">
                        <span class="material-symbols-outlined text-6xl text-slate-200 dark:text-white/10">history_edu</span>
                        <p class="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-xs">Nenhum registro de aceite encontrado</p>
                        <button @click="clearFilters" class="text-primary font-black uppercase tracking-widest text-[10px] hover:underline">Limpar Filtros</button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Enhanced Pagination -->
            <div v-if="acceptances.length > 0" class="p-6 border-t border-slate-200 dark:border-white/10 bg-slate-50/30 dark:bg-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
              <div class="flex items-center gap-4">
                <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Exibir</span>
                <select v-model="itemsPerPage" class="h-10 px-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-[10px] font-black uppercase outline-none focus:ring-2 focus:ring-primary/50">
                  <option :value="5">5 itens</option>
                  <option :value="10">10 itens</option>
                  <option :value="25">25 itens</option>
                  <option :value="50">50 itens</option>
                </select>
                <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">de {{ filteredAcceptances.length }} registros</span>
              </div>

              <div class="flex items-center gap-2">
                <button 
                  @click="currentPage--" 
                  :disabled="currentPage === 1"
                  class="h-10 w-10 flex items-center justify-center rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-500 disabled:opacity-30 enabled:hover:bg-primary/10 enabled:hover:text-primary transition-all shadow-sm"
                >
                  <span class="material-symbols-outlined">chevron_left</span>
                </button>
                <div class="flex items-center gap-1">
                   <button 
                    v-for="page in displayedPages" 
                    :key="page"
                    @click="currentPage = page"
                    :class="currentPage === page ? 'bg-primary text-black scale-110' : 'bg-white dark:bg-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5'"
                    class="h-10 w-10 flex items-center justify-center rounded-xl border border-slate-200 dark:border-white/10 shadow-sm text-[11px] font-black transition-all"
                   >
                    {{ page }}
                   </button>
                </div>
                <button 
                  @click="currentPage++" 
                  :disabled="currentPage === totalPages"
                  class="h-10 w-10 flex items-center justify-center rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-500 disabled:opacity-30 enabled:hover:bg-primary/10 enabled:hover:text-primary transition-all shadow-sm"
                >
                  <span class="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import AdminLayout from '@/components/layout/admin/AdminLayout.vue'
import Button from '@/components/ui/Button.vue'
import { useAdminTermsAcceptanceStore } from '@/stores/admin/termsAcceptance'
import { toast } from 'vue-sonner'

// StatCard inner component for clean code
const StatCard = {
  props: ['title', 'value', 'icon', 'color', 'loading'],
  template: `
    <div class="bg-white/40 dark:bg-slate-900/40 backdrop-blur-md rounded-[2rem] p-6 border border-white/40 dark:border-white/5 hover:border-primary/30 transition-all group shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <div class="p-3 rounded-2xl bg-white dark:bg-white/5 shadow-sm group-hover:scale-110 transition-transform">
          <span class="material-symbols-outlined shrink-0" :class="{
            'text-slate-400': color === 'slate',
            'text-primary': color === 'primary',
            'text-secondary': color === 'secondary',
            'text-green-500': color === 'green'
          }">{{ icon }}</span>
        </div>
        <div v-if="loading" class="h-2 w-12 bg-slate-200 dark:bg-white/10 rounded-full animate-pulse"></div>
      </div>
      <div v-if="loading" class="h-8 w-24 bg-slate-200 dark:bg-white/10 rounded-xl mb-2 animate-pulse"></div>
      <div v-else class="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{{ value }}</div>
      <div class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ title }}</div>
    </div>
  `
}

const route = useRoute()
const store = useAdminTermsAcceptanceStore()

// Usar storeToRefs para manter reatividade
const { acceptances, stats, loading } = storeToRefs(store)
const initialLoading = ref(true)
const downloadingPDF = ref<string | null>(null)

const filters = ref<{
  term_type: 'terms_of_service' | 'privacy_policy' | ''
  term_id: string
  start_date: string
  end_date: string
}>({
  term_type: '',
  term_id: '',
  start_date: '',
  end_date: '',
})

// Pagination
const currentPage = ref(1)
const itemsPerPage = ref(10)

const filteredAcceptances = computed(() => {
  return acceptances.value
})

const totalPages = computed(() => Math.ceil(filteredAcceptances.value.length / itemsPerPage.value))

const paginatedAcceptances = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredAcceptances.value.slice(start, end)
})

const displayedPages = computed(() => {
  const pages = []
  const maxDisplayed = 5
  const totalSlots = Math.min(totalPages.value, maxDisplayed)
  
  let start = Math.max(1, currentPage.value - Math.floor(totalSlots / 2))
  let end = start + totalSlots - 1
  
  if (end > totalPages.value) {
    end = totalPages.value
    start = Math.max(1, end - totalSlots + 1)
  }
  
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

watch(itemsPerPage, () => {
  currentPage.value = 1
})

// Watch filters to fetch data
watch(filters, async () => {
  currentPage.value = 1
  await applyFilters()
}, { deep: true })

function formatDate(dateString: string) {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

async function applyFilters() {
  await store.fetchAcceptances({
    term_type: filters.value.term_type || undefined,
    term_id: filters.value.term_id || undefined,
    start_date: filters.value.start_date || undefined,
    end_date: filters.value.end_date || undefined,
  })
}

function clearFilters() {
  filters.value = {
    term_type: '',
    term_id: '',
    start_date: '',
    end_date: '',
  }
}

async function handleDownloadPDF(acceptanceId: string) {
  downloadingPDF.value = acceptanceId
  try {
    await store.downloadAcceptancePDF(acceptanceId)
    toast.success('Download do PDF iniciado com sucesso')
  } catch (error: any) {
    toast.error(error.message || 'Erro ao baixar PDF')
  } finally {
    downloadingPDF.value = null
  }
}

async function handleRefresh() {
  try {
    await Promise.all([
      store.fetchStats(),
      applyFilters()
    ])
  } catch (error: any) {
    toast.error(error.message || 'Erro ao sincronizar dados')
  }
}

// Watch na rota para recarregar quando acessar a página
watch(
  () => route.path,
  async (newPath) => {
    if (newPath === '/admin/termos-aceitos') {
      // Sempre recarregar quando acessar a página
      await handleRefresh()
    }
  },
  { immediate: true }
)

onMounted(async () => {
  initialLoading.value = true
  try {
    const { useAdminBaseStore } = await import('@/stores/admin/base')
    const baseStore = useAdminBaseStore()
    
    // Check admin permissions
    const isAdmin = await baseStore.checkIsAdmin()
    if (!isAdmin) {
      const router = (await import('@/router')).default
      router.push('/')
      return
    }

    await handleRefresh()
  } finally {
    initialLoading.value = false
  }
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
