<template>
  <AdminLayout>
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold text-slate-900 dark:text-white">Assinaturas</h1>
          <p class="text-slate-600 dark:text-gray-400 mt-1">Gerenciar assinaturas e configurar preços</p>
        </div>
        <button
          @click="showPriceModal = true"
          class="flex items-center gap-2 px-4 py-2.5 bg-primary dark:bg-secondary text-white font-bold rounded-lg hover:opacity-90 transition"
        >
          <span class="material-icons text-lg">settings</span>
          Configurar Preço
        </button>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div class="bg-white dark:bg-surface-dark rounded-xl p-5 border border-slate-200 dark:border-white/5">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
              <span class="material-icons text-green-500 text-xl">check_circle</span>
            </div>
            <div>
              <p class="text-[10px] uppercase font-bold text-slate-500 dark:text-gray-400">Ativas</p>
              <p class="text-xl font-black text-slate-900 dark:text-white">{{ stats.active }}</p>
            </div>
          </div>
        </div>
        <div class="bg-white dark:bg-surface-dark rounded-xl p-5 border border-slate-200 dark:border-white/5">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
              <span class="material-icons text-yellow-500 text-xl">pending</span>
            </div>
            <div>
              <p class="text-[10px] uppercase font-bold text-slate-500 dark:text-gray-400">Pendentes</p>
              <p class="text-xl font-black text-slate-900 dark:text-white">{{ stats.pending }}</p>
            </div>
          </div>
        </div>
        <div class="bg-white dark:bg-surface-dark rounded-xl p-5 border border-slate-200 dark:border-white/5">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
              <span class="material-icons text-red-500 text-xl">trending_down</span>
            </div>
            <div>
              <p class="text-[10px] uppercase font-bold text-slate-500 dark:text-gray-400">Churn</p>
              <p class="text-xl font-black text-slate-900 dark:text-white">{{ stats.churnRate }}%</p>
            </div>
          </div>
        </div>
        <div class="bg-white dark:bg-surface-dark rounded-xl p-5 border border-slate-200 dark:border-white/5">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <span class="material-icons text-blue-500 text-xl">analytics</span>
            </div>
            <div>
              <p class="text-[10px] uppercase font-bold text-slate-500 dark:text-gray-400">ARPU</p>
              <p class="text-xl font-black text-slate-900 dark:text-white">{{ formatCurrency(stats.arpu) }}</p>
            </div>
          </div>
        </div>
        <div class="bg-white dark:bg-surface-dark rounded-xl p-5 border border-slate-200 dark:border-white/5">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <span class="material-icons text-primary text-xl">payments</span>
            </div>
            <div>
              <p class="text-[10px] uppercase font-bold text-slate-500 dark:text-gray-400">MRR</p>
              <p class="text-xl font-black text-slate-900 dark:text-white">{{ formatCurrency(stats.mrr) }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Search and Filters -->
      <div class="flex flex-col md:flex-row items-center justify-between gap-4">
        <div class="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto">
          <button
            v-for="filter in statusFilters"
            :key="filter.value"
            @click="activeFilter = filter.value"
            :class="[
              'px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap',
              activeFilter === filter.value
                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                : 'bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-white/5'
            ]"
          >
            {{ filter.label }}
          </button>
        </div>

        <div class="relative w-full md:w-64">
          <span class="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
          <input 
            v-model="searchQuery"
            type="text"
            placeholder="Buscar por nome ou e-mail..."
            class="w-full pl-9 pr-4 py-2 rounded-xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 text-sm focus:border-secondary focus:ring-0 transition-all"
          />
        </div>
      </div>

      <!-- Subscriptions Table -->
      <div class="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-white/5 overflow-hidden">
        <div v-if="loading" class="flex justify-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>

        <div v-else-if="filteredSubscriptions.length === 0" class="py-12 text-center">
          <span class="material-icons text-4xl text-slate-400">inbox</span>
          <p class="mt-2 text-slate-500 dark:text-gray-400">Nenhuma assinatura encontrada</p>
        </div>

        <table v-else class="w-full">
          <thead class="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Usuário</th>
              <th class="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Valor</th>
              <th class="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Período</th>
              <th class="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Criado em</th>
              <th class="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 dark:divide-white/5">
            <tr v-for="sub in filteredSubscriptions" :key="sub.id" class="hover:bg-slate-50 dark:hover:bg-white/5">
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span class="text-primary font-bold">{{ sub.profile?.nome?.charAt(0) || '?' }}</span>
                  </div>
                  <div>
                    <p class="font-medium text-slate-900 dark:text-white">{{ sub.profile?.nome || 'Usuário' }}</p>
                    <p class="text-xs text-slate-500">{{ sub.profile?.email || sub.user_id?.slice(0, 8) }}</p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <span :class="getStatusClasses(sub.status)">
                  {{ getStatusLabel(sub.status) }}
                </span>
              </td>
              <td class="px-6 py-4 text-slate-700 dark:text-gray-300">
                {{ formatCurrency(sub.price_cents) }}
              </td>
              <td class="px-6 py-4 text-sm text-slate-500">
                <template v-if="sub.current_period_end">
                  até {{ formatDate(sub.current_period_end) }}
                </template>
                <template v-else>-</template>
              </td>
              <td class="px-6 py-4 text-sm text-slate-500">
                {{ formatDate(sub.created_at) }}
              </td>
              <td class="px-6 py-4 text-right">
                <button
                  v-if="sub.status === 'active'"
                  @click="confirmCancel(sub)"
                  class="text-red-500 hover:text-red-600 text-sm font-medium"
                >
                  Cancelar
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Price Config Modal -->
    <Modal v-model="showPriceModal" title="Configurar Preço da Assinatura">
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2">Preço Mensal (em centavos USD)</label>
          <div class="relative">
            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">$</span>
            <input
              v-model.number="priceConfig.price_cents"
              type="number"
              step="100"
              min="100"
              class="w-full pl-8 pr-4 py-3 rounded-lg border border-slate-300 dark:border-gray-700 bg-white dark:bg-surface-dark text-slate-900 dark:text-white"
            />
          </div>
          <p class="text-xs text-slate-500 mt-1">
            Valor atual: {{ formatCurrency(priceConfig.price_cents) }} por mês
          </p>
        </div>

        <div class="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 text-sm">
          <span class="material-icons text-base align-middle mr-1">warning</span>
          Alterar o preço afetará apenas novas assinaturas. Assinaturas existentes manterão o valor atual.
        </div>

        <div class="flex gap-3">
          <button
            @click="showPriceModal = false"
            class="flex-1 px-4 py-3 rounded-lg border border-slate-200 dark:border-white/10 text-slate-700 dark:text-gray-300 font-medium hover:bg-slate-50 dark:hover:bg-white/5"
          >
            Cancelar
          </button>
          <button
            @click="savePrice"
            :disabled="savingPrice"
            class="flex-1 px-4 py-3 rounded-lg bg-primary text-white font-bold hover:opacity-90 disabled:opacity-50"
          >
            {{ savingPrice ? 'Salvando...' : 'Salvar' }}
          </button>
        </div>
      </div>
    </Modal>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import AdminLayout from '@/components/layout/admin/AdminLayout.vue'
import Modal from '@/components/ui/Modal.vue'
import { supabase } from '@/lib/supabase'
import { toast } from 'vue-sonner'

interface Subscription {
  id: string
  user_id: string
  status: string
  price_cents: number
  currency: string
  current_period_end: string | null
  created_at: string
  profile?: {
    nome: string
    email?: string
  }
}

const loading = ref(true)
const subscriptions = ref<Subscription[]>([])
const activeFilter = ref('all')
const searchQuery = ref('')
const showPriceModal = ref(false)
const savingPrice = ref(false)
const priceConfig = ref({
  id: '',
  price_cents: 1000
})

const statusFilters = [
  { value: 'all', label: 'Todas' },
  { value: 'active', label: 'Ativas' },
  { value: 'pending', label: 'Pendentes' },
  { value: 'canceled', label: 'Canceladas' },
  { value: 'past_due', label: 'Inadimplentes' }
]

const stats = computed(() => {
  const active = subscriptions.value.filter(s => s.status === 'active').length
  const pending = subscriptions.value.filter(s => s.status === 'pending').length
  const canceled = subscriptions.value.filter(s => s.status === 'canceled').length
  const mrr = subscriptions.value
    .filter(s => s.status === 'active')
    .reduce((sum, s) => sum + s.price_cents, 0)
  
  const churnRate = subscriptions.value.length > 0 
    ? ((canceled / subscriptions.value.length) * 100).toFixed(1)
    : 0

  const arpu = active > 0 ? mrr / active : 0
  
  return { active, pending, canceled, mrr, churnRate, arpu }
})

const filteredSubscriptions = computed(() => {
  let filtered = subscriptions.value
  
  if (activeFilter.value !== 'all') {
    filtered = filtered.filter(s => s.status === activeFilter.value)
  }
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(s => 
      s.profile?.nome?.toLowerCase().includes(query) || 
      s.profile?.email?.toLowerCase().includes(query)
    )
  }
  
  return filtered
})

function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    active: 'Ativa',
    pending: 'Pendente',
    canceled: 'Cancelada',
    past_due: 'Inadimplente',
    paused: 'Pausada'
  }
  return labels[status] || status
}

function getStatusClasses(status: string) {
  const base = 'px-2.5 py-1 rounded-full text-xs font-bold uppercase'
  const classes: Record<string, string> = {
    active: `${base} bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400`,
    pending: `${base} bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400`,
    canceled: `${base} bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400`,
    past_due: `${base} bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400`,
    paused: `${base} bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400`
  }
  return classes[status] || base
}

function formatCurrency(cents: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(cents / 100)
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

async function fetchSubscriptions() {
  try {
    loading.value = true
    
    const { data, error } = await supabase
      .from('subscriptions')
      .select(`
        *,
        profile:profiles(nome)
      `)
      .order('created_at', { ascending: false })

    if (error) throw error
    subscriptions.value = data || []
  } catch (error) {
    console.error('Error fetching subscriptions:', error)
    toast.error('Erro ao carregar assinaturas')
  } finally {
    loading.value = false
  }
}

async function fetchPriceConfig() {
  try {
    const { data, error } = await supabase
      .from('subscription_prices')
      .select('*')
      .eq('plan_type', 'premium')
      .eq('active', true)
      .single()

    if (error) throw error
    if (data) {
      priceConfig.value = {
        id: data.id,
        price_cents: data.price_cents
      }
    }
  } catch (error) {
    console.error('Error fetching price config:', error)
  }
}

async function savePrice() {
  try {
    savingPrice.value = true
    
    const { error } = await supabase
      .from('subscription_prices')
      .update({
        price_cents: priceConfig.value.price_cents,
        stripe_price_id: null, // Clear to force new price creation
        updated_at: new Date().toISOString()
      })
      .eq('id', priceConfig.value.id)

    if (error) throw error
    
    toast.success('Preço atualizado com sucesso!')
    showPriceModal.value = false
  } catch (error) {
    console.error('Error saving price:', error)
    toast.error('Erro ao salvar preço')
  } finally {
    savingPrice.value = false
  }
}

async function confirmCancel(sub: Subscription) {
  if (!confirm('Tem certeza que deseja cancelar esta assinatura?')) return
  
  try {
    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: 'canceled',
        updated_at: new Date().toISOString()
      })
      .eq('id', sub.id)

    if (error) throw error
    
    toast.success('Assinatura cancelada')
    await fetchSubscriptions()
  } catch (error) {
    console.error('Error canceling subscription:', error)
    toast.error('Erro ao cancelar assinatura')
  }
}

onMounted(() => {
  fetchSubscriptions()
  fetchPriceConfig()
})
</script>
