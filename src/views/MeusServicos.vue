<template>
  <AppLayout>
    <div class="space-y-3 sm:space-y-4 md:space-y-6 lg:space-8 w-full overflow-x-hidden max-w-full">
      <header class="flex flex-col gap-2 sm:gap-3">
        <h1 class="text-white text-xl sm:text-2xl md:text-3xl font-bold">{{ t('myServices.title') }}</h1>
        <p class="text-gray-400 text-xs sm:text-sm md:text-base">{{ t('myServices.subtitle') }}</p>
      </header>

      <!-- Tabs -->
      <div v-if="subscriptionsStore.hasActiveSubscription || createdServices.length > 0" class="flex gap-2 p-1 bg-surface-dark/30 rounded-lg w-max border border-white/5">
        <button 
          @click="activeTab = 'hired'"
          class="px-4 py-2 rounded-md text-sm font-bold transition-all"
          :class="activeTab === 'hired' ? 'bg-primary text-white shadow-lg' : 'text-gray-400 hover:text-white'"
        >
          Contratados
        </button>
        <button 
          @click="activeTab = 'created'"
          class="px-4 py-2 rounded-md text-sm font-bold transition-all"
          :class="activeTab === 'created' ? 'bg-primary text-white shadow-lg' : 'text-gray-400 hover:text-white'"
        >
          Meus Anúncios
        </button>
      </div>

      <div v-if="loading" class="flex justify-center py-8 sm:py-12 md:py-16 lg:py-20">
        <div class="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 border-b-2 border-primary"></div>
      </div>

      <!-- Tab Contratados -->
      <div v-else-if="activeTab === 'hired'">
        <div v-if="hiredServices.length === 0" class="bg-surface-dark/50 rounded-lg sm:rounded-xl md:rounded-2xl border border-white/10 backdrop-blur-sm px-3 sm:px-4 md:px-6 lg:px-8 py-8 sm:py-12 md:py-16 lg:py-20 text-center flex flex-col items-center gap-3 sm:gap-4">
          <div class="size-12 sm:size-16 rounded-full bg-white/5 flex items-center justify-center">
            <span class="material-symbols-outlined text-gray-500 text-3xl sm:text-4xl md:text-5xl">shopping_bag</span>
          </div>
          <div>
            <h3 class="text-white text-base sm:text-lg md:text-xl font-bold mb-1 sm:mb-2">{{ t('myServices.emptyTitle') }}</h3>
            <p class="text-gray-400 text-xs sm:text-sm md:text-base">{{ t('myServices.emptyDesc') }}</p>
          </div>
          <RouterLink to="/servicos">
            <button class="flex items-center justify-center rounded-lg h-9 sm:h-10 md:h-12 px-4 sm:px-6 bg-gradient-to-r from-primary to-secondary text-black text-xs sm:text-sm md:text-base font-bold transition-all shadow-[0_0_20px_rgba(0,243,255,0.3)] hover:shadow-[0_0_40px_rgba(0,243,255,0.5)] hover:scale-105">
              {{ t('myServices.exploreServices') }}
            </button>
          </RouterLink>
        </div>

        <div v-else class="space-y-3 sm:space-y-4 md:space-y-6">
          <div 
            v-for="item in hiredServices" 
            :key="item.id"
            class="bg-surface-dark/50 border border-white/10 rounded-lg sm:rounded-xl p-4 sm:p-6 flex flex-col gap-4 sm:gap-6 hover:border-primary/30 transition-all group"
          >
            <!-- (Mantendo o layout existente do card de serviço contratado) -->
            <div class="flex items-start gap-3 sm:gap-4">
              <div class="size-10 sm:size-12 md:size-14 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shrink-0">
                <span class="material-symbols-outlined text-lg sm:text-xl md:text-2xl">{{ getIcon(item.service?.categoria) }}</span>
              </div>
              <div class="flex-1 flex flex-col gap-1.5 sm:gap-2 min-w-0">
                <div class="flex items-center gap-2 flex-wrap">
                  <h3 class="text-white text-sm sm:text-base md:text-lg font-bold truncate">{{ item.service?.nome_pt }}</h3>
                  <span v-if="item.payment?.source === 'american_dream'" class="text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" title="Pagamento do American Dream">
                    American Dream
                  </span>
                  <span :class="getStatusClasses(item.request?.status)">
                    {{ getStatusLabel(item.request?.status) }}
                  </span>
                  <span v-if="item.payment?.status === 'completed'" class="text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-500">
                    {{ t('myServices.paid') }}
                  </span>
                </div>
                <p v-if="item.service?.descricao_pt" class="text-gray-400 text-xs sm:text-sm line-clamp-2">
                  {{ item.service.descricao_pt }}
                </p>
                <div class="flex flex-wrap items-center gap-3 sm:gap-4 mt-1">
                  <div class="flex items-center gap-1.5 text-xs sm:text-sm text-gray-400">
                    <span class="material-symbols-outlined text-base">calendar_today</span>
                    <span>{{ t('myServices.hiredOn', { date: formatDate(item.payment?.created_at || item.request?.created_at) }) }}</span>
                  </div>
                  <div v-if="item.payment" class="flex items-center gap-1.5 text-xs sm:text-sm text-gray-400">
                    <span class="material-symbols-outlined text-base">payments</span>
                    <span>{{ formatPrice(item.payment.amount, item.payment.currency) }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="flex items-center gap-2 sm:gap-3 pt-2 sm:pt-3 border-t border-white/10">
              <button 
                @click="viewDetails(item)"
                class="flex items-center gap-1.5 sm:gap-2 rounded-lg border border-white/10 hover:border-primary/50 hover:bg-white/5 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                <span class="material-symbols-outlined text-base sm:text-lg">visibility</span>
                {{ t('myServices.viewDetails') }}
              </button>
              <a 
                v-if="item.request?.status === 'pendente' || item.request?.status === 'em_andamento'"
                :href="getWhatsAppLink(item)"
                target="_blank"
                class="flex items-center gap-1.5 sm:gap-2 rounded-lg bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 hover:border-green-500/40 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-green-400 hover:text-green-300 transition-colors"
              >
                <span class="material-symbols-outlined text-base sm:text-lg">chat</span>
                {{ t('myServices.chatSupport') }}
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab Meus Serviços Criados -->
      <div v-if="activeTab === 'created'">
        <div v-if="createdServices.length === 0" class="bg-surface-dark/50 rounded-lg sm:rounded-xl md:rounded-2xl border border-white/10 backdrop-blur-sm px-3 sm:px-4 md:px-6 lg:px-8 py-8 sm:py-12 md:py-16 lg:py-20 text-center flex flex-col items-center gap-3 sm:gap-4">
          <div class="size-12 sm:size-16 rounded-full bg-white/5 flex items-center justify-center">
            <span class="material-symbols-outlined text-gray-500 text-3xl sm:text-4xl md:text-5xl">post_add</span>
          </div>
          <div>
            <h3 class="text-white text-base sm:text-lg md:text-xl font-bold mb-1 sm:mb-2">Você ainda não anunciou nenhum serviço</h3>
            <p class="text-gray-400 text-xs sm:text-sm md:text-base">Anuncie seus serviços aqui para que outros membros possam contratá-los.</p>
          </div>
          <RouterLink to="/servicos">
            <button class="flex items-center justify-center rounded-lg h-9 sm:h-10 md:h-12 px-4 sm:px-6 bg-gradient-to-r from-primary to-secondary text-black text-xs sm:text-sm md:text-base font-bold transition-all shadow-[0_0_20px_rgba(0,243,255,0.3)] hover:shadow-[0_0_40px_rgba(0,243,255,0.5)] hover:scale-105">
              Anunciar um Serviço
            </button>
          </RouterLink>
        </div>
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
          <ServiceCard
            v-for="service in createdServices"
            :key="service.id"
            :service="service"
            @request-service="handleRequestService"
            @edit-service="handleEditService"
          />
        </div>
      </div>
    </div>

    <!-- Details Modal -->
    <Modal
      v-if="selectedService"
      v-model="showDetailsModal"
      :title="t('myServices.modalTitle')"
    >
      <div class="flex flex-col gap-4 sm:gap-6">
        <div class="flex items-center justify-between flex-wrap gap-3">
          <div class="flex flex-col">
            <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{{ t('myServices.labels.service') }}</span>
            <span class="text-base sm:text-lg font-bold text-white">{{ selectedService.service?.nome_pt }}</span>
          </div>
          <div class="flex gap-2 flex-wrap">
            <span v-if="selectedService.payment?.source === 'american_dream'" class="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" title="Pagamento do American Dream">
              American Dream
            </span>
            <span :class="getStatusClasses(selectedService.request?.status)">
              {{ getStatusLabel(selectedService.request?.status) }}
            </span>
            <span v-if="selectedService.payment?.status === 'completed'" class="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-500">
              {{ t('myServices.paid') }}
            </span>
          </div>
        </div>

        <div v-if="selectedService.service?.descricao_pt" class="flex flex-col gap-1.5">
          <span class="text-xs font-bold text-gray-400 uppercase tracking-widest">{{ t('myServices.labels.description') }}</span>
          <p class="text-sm text-gray-300 leading-relaxed">{{ selectedService.service.descricao_pt }}</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div class="flex flex-col p-3 sm:p-4 rounded-lg bg-white/5 border border-white/10">
            <span class="text-[10px] font-bold text-gray-400 uppercase mb-1">{{ t('myServices.labels.hiringDate') }}</span>
            <span class="text-sm font-medium text-white">{{ formatDate(selectedService.payment?.created_at || selectedService.request?.created_at) }}</span>
          </div>
          <div v-if="selectedService.request?.updated_at" class="flex flex-col p-3 sm:p-4 rounded-lg bg-white/5 border border-white/10">
            <span class="text-[10px] font-bold text-gray-400 uppercase mb-1">{{ t('myServices.labels.lastUpdate') }}</span>
            <span class="text-sm font-medium text-white">{{ formatDate(selectedService.request.updated_at) }}</span>
          </div>
        </div>

        <div v-if="selectedService.payment" class="p-3 sm:p-4 rounded-lg bg-white/5 border border-white/10 space-y-2">
          <span class="text-xs font-bold text-gray-400 uppercase tracking-widest">{{ t('myServices.labels.paymentInfo') }}</span>
          <div class="flex justify-between items-center text-sm">
            <span class="text-gray-400">{{ t('myServices.labels.amountPaid') }}</span>
            <span class="text-white font-medium">{{ formatPrice(selectedService.payment.amount, selectedService.payment.currency) }}</span>
          </div>
          <div class="flex justify-between items-center text-sm">
            <span class="text-gray-400">{{ t('myServices.labels.method') }}</span>
            <span class="text-white font-medium capitalize">
              {{ selectedService.payment.payment_method === 'card' ? t('myServices.paymentMethods.card') : selectedService.payment.payment_method?.toUpperCase() }}
              <span v-if="selectedService.payment.payment_method === 'zelle'" class="ml-1 text-xs text-gray-400">(Zelle)</span>
            </span>
          </div>
          <div v-if="selectedService.payment.source === 'american_dream'" class="flex justify-between items-center text-sm">
            <span class="text-gray-400">Origem</span>
            <span class="text-blue-400 font-medium">American Dream</span>
          </div>
          <div class="flex justify-between items-center text-sm">
            <span class="text-gray-400">{{ t('myServices.labels.paymentStatus') }}</span>
            <span class="text-green-400 font-medium">{{ t('myServices.status.concluido') }}</span>
          </div>
        </div>

        <div v-if="selectedService.request?.mensagem" class="flex flex-col gap-1.5">
          <span class="text-xs font-bold text-gray-400 uppercase tracking-widest">{{ t('myServices.labels.yourMessage') }}</span>
          <div class="p-3 sm:p-4 rounded-lg bg-white/5 border-l-4 border-primary text-sm text-gray-300 italic">
            "{{ selectedService.request.mensagem }}"
          </div>
        </div>

        <div class="p-3 sm:p-4 rounded-xl bg-primary/5 border border-primary/10 flex items-start gap-3 sm:gap-4">
          <span class="material-symbols-outlined text-primary text-lg sm:text-xl">info</span>
          <div class="flex flex-col gap-1">
            <h4 class="text-sm font-bold text-white">{{ t('myServices.nextSteps.title') }}</h4>
            <p class="text-xs text-gray-400 leading-relaxed">
              <template v-if="selectedService.request?.status === 'pendente'">
                {{ t('myServices.nextSteps.pendente') }}
              </template>
              <template v-else-if="selectedService.request?.status === 'em_andamento'">
                {{ t('myServices.nextSteps.em_andamento') }}
              </template>
              <template v-else-if="selectedService.request?.status === 'concluido'">
                {{ t('myServices.nextSteps.concluido') }}
              </template>
            </p>
          </div>
        </div>
      </div>
    </Modal>

    <!-- Create/Edit Modal -->
    <Modal
      v-model="showEditModal"
      :title="'Editar Serviço'"
      size="lg"
    >
      <form @submit.prevent="submitEditService" class="p-4 space-y-4">
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">
            Nome do Serviço
          </label>
          <input
            v-model="newService.nome"
            type="text"
            required
            class="w-full rounded-lg border border-slate-300 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
            placeholder="Ex: Consultoria Jurídica"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">
            Categoria
          </label>
          <select
            v-model="newService.categoria"
            required
            class="w-full rounded-lg border border-slate-300 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
          >
            <option value="" disabled>Selecione uma categoria</option>
            <option value="legal">Jurídico</option>
            <option value="marketing">Marketing</option>
            <option value="finance">Finanças</option>
            <option value="mentoring">Mentoria</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">
            Preço (USD)
          </label>
          <div class="relative">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-gray-400">$</span>
            <input
              v-model="newService.preco"
              type="number"
              step="0.01"
              min="0"
              class="w-full rounded-lg border border-slate-300 dark:border-white/10 bg-white dark:bg-white/5 pl-8 pr-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
              placeholder="0.00"
            />
          </div>
          <p class="mt-1 text-xs text-slate-500 dark:text-gray-400">Deixe em branco ou 0 para "Sob Consulta"</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">
            Descrição
          </label>
          <textarea
            v-model="newService.descricao"
            rows="4"
            required
            class="w-full rounded-lg border border-slate-300 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
            placeholder="Descreva seu serviço detalhadamente..."
          ></textarea>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">
            Benefício para Membros (Opcional)
          </label>
          <input
            v-model="newService.beneficio_membro"
            type="text"
            class="w-full rounded-lg border border-slate-300 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
            placeholder="Ex: 10% de desconto na primeira consulta"
          />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">
              Termos e Condições (PT)
            </label>
            <textarea
              v-model="newService.terms_content_pt"
              rows="4"
              class="w-full rounded-lg border border-slate-300 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
              placeholder="Defina as condições para este serviço em português..."
            ></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">
              Terms & Conditions (EN)
            </label>
            <textarea
              v-model="newService.terms_content_en"
              rows="4"
              class="w-full rounded-lg border border-slate-300 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
              placeholder="Define the terms for this service in English..."
            ></textarea>
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-4">
          <button
            type="button"
            @click="showEditModal = false"
            class="px-4 py-2 rounded-lg text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/5 font-medium transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            :disabled="creatingService"
            class="px-6 py-2 rounded-lg bg-gradient-to-r from-primary to-secondary text-white font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ creatingService ? 'Salvando...' : 'Salvar Alterações' }}
          </button>
        </div>
      </form>
    </Modal>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSupabase } from '@/composables/useSupabase'
import AppLayout from '@/components/layout/AppLayout.vue'
import Modal from '@/components/ui/Modal.vue'
import { RouterLink, useRouter } from 'vue-router'
import { useSubscriptionsStore } from '@/stores/subscriptions'
import ServiceCard from '@/components/features/services/ServiceCard.vue'
import { toast } from 'vue-sonner'

const { t, locale } = useI18n()
const router = useRouter()
const subscriptionsStore = useSubscriptionsStore()

const { supabase } = useSupabase()
const loading = ref(true)
const hiredServices = ref<any[]>([])
const createdServices = ref<any[]>([])
const activeTab = ref<'hired' | 'created'>('hired')

const showDetailsModal = ref(false)
const showEditModal = ref(false)
const selectedService = ref<any>(null)
const editingServiceId = ref<string | null>(null)
const creatingService = ref(false)

// Estado do formulário de edição
const newService = ref({
  nome: '',
  descricao: '',
  categoria: '',
  preco: null as number | null,
  beneficio_membro: '',
  terms_content_pt: '',
  terms_content_en: ''
})

async function fetchHiredServices() {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('service_payments')
      .select(`
        id,
        amount,
        currency,
        payment_method,
        status,
        source,
        external_payment_id,
        created_at,
        service_id,
        service_request_id,
        services!service_payments_service_id_fkey (
          id,
          nome_pt,
          descricao_pt,
          categoria
        ),
        service_requests!service_payments_service_request_id_fkey (
          id,
          status,
          mensagem,
          created_at,
          updated_at
        )
      `)
      .eq('user_id', user.id)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    hiredServices.value = (data || []).map((payment: any) => {
      const service = Array.isArray(payment.services) ? payment.services[0] : payment.services
      const request = Array.isArray(payment.service_requests) ? payment.service_requests[0] : payment.service_requests
      
      return {
        id: payment.id,
        payment: {
          id: payment.id,
          amount: payment.amount,
          currency: payment.currency,
          payment_method: payment.payment_method,
          status: payment.status,
          source: payment.source || '323_network',
          external_payment_id: payment.external_payment_id,
          created_at: payment.created_at
        },
        service: service || null,
        request: request || null
      }
    })
  } catch (error) {
    console.error('Erro ao buscar serviços contratados:', error)
  }
}

async function fetchCreatedServices() {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('created_by', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    createdServices.value = data || []
  } catch (error) {
    console.error('Erro ao buscar serviços criados:', error)
  }
}

async function fetchAll() {
  loading.value = true
  await Promise.all([
    fetchHiredServices(), 
    fetchCreatedServices(),
    subscriptionsStore.init() // Garantir que a subscription esteja carregada
  ])
  
  // Se não tiver serviços contratados mas tiver criados, muda a aba automaticamente
  if (hiredServices.value.length === 0 && createdServices.value.length > 0) {
    activeTab.value = 'created'
  }
  
  loading.value = false
}

// Funções auxiliares (mesmas do anterior)
function getStatusLabel(status: string) {
  switch (status) {
    case 'pendente': return t('myServices.status.pendente')
    case 'em_andamento': return t('myServices.status.em_andamento')
    case 'concluido': return t('myServices.status.concluido')
    default: return status || t('myServices.status.pendente')
  }
}

function getStatusClasses(status: string) {
  const base = 'text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider'
  switch (status) {
    case 'pendente': return `${base} bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-500`
    case 'em_andamento': return `${base} bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-500`
    case 'concluido': return `${base} bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-500`
    default: return `${base} bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300`
  }
}

function getIcon(category: string) {
  switch (category) {
    case 'legal': return 'gavel'
    case 'finance': return 'account_balance'
    case 'mentoring': return 'school'
    case 'marketing': return 'campaign'
    default: return 'shopping_bag'
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

function formatPrice(cents: number, currency: string = 'USD'): string {
  const amount = cents / 100
  return new Intl.NumberFormat(locale.value, { style: 'currency', currency }).format(amount)
}

function viewDetails(service: any) {
  selectedService.value = service
  showDetailsModal.value = true
}

function getWhatsAppLink(item: any) {
  const message = encodeURIComponent(t('myServices.whatsappMessage', { name: item.service?.nome_pt }))
  return `https://wa.me/5511999999999?text=${message}`
}

// Ações para serviços criados (reaproveitada do Services.vue)
function handleEditService(service: any) {
  editingServiceId.value = service.id
  newService.value = {
    nome: service.nome_pt,
    descricao: service.descricao_pt,
    categoria: service.categoria,
    preco: service.preco ? service.preco / 100 : null,
    beneficio_membro: service.beneficio_membro_pt,
    terms_content_pt: service.terms_content_pt || '',
    terms_content_en: service.terms_content_en || ''
  }
  showEditModal.value = true
}

async function submitEditService() {
  if (!editingServiceId.value) return
  
  try {
    creatingService.value = true

    const { error } = await supabase
      .from('services')
      .update({
        nome_pt: newService.value.nome,
        nome_en: newService.value.nome,
        descricao_pt: newService.value.descricao,
        descricao_en: newService.value.descricao,
        categoria: newService.value.categoria,
        preco: newService.value.preco ? Math.round(newService.value.preco * 100) : null,
        beneficio_membro_pt: newService.value.beneficio_membro || null,
        beneficio_membro_en: newService.value.beneficio_membro || null,
        terms_content_pt: newService.value.terms_content_pt || null,
        terms_content_en: newService.value.terms_content_en || null,
        status: 'pending', 
        rejection_reason: null
      })
      .eq('id', editingServiceId.value)

    if (error) throw error
    
    toast.success('Serviço atualizado e enviado para nova análise!')
    showEditModal.value = false
    await fetchCreatedServices()
  } catch (error) {
    console.error('Erro ao atualizar serviço:', error)
    toast.error('Erro ao atualizar serviço')
  } finally {
    creatingService.value = false
  }
}

function handleRequestService(_service: any) {
  // Lógica de "ver como usuário" se necessário, ou redirecionar
  router.push('/servicos')
}

onMounted(() => {
  fetchAll()
})
</script>

