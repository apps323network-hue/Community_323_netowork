<template>
  <AdminLayout>
    <div class="w-full flex flex-col gap-6 sm:gap-8">
      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-slate-900 dark:text-white text-4xl lg:text-5xl font-black mb-3">
          <span class="bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-primary animate-gradient">Services</span> Management
        </h1>
        <p class="text-slate-600 dark:text-white/60 text-lg">
          Create, edit and manage community services
        </p>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div class="bg-white dark:bg-surface-card rounded-xl p-6 border border-slate-200 dark:border-white/5 hover:border-secondary/50 transition-all shadow-lg dark:shadow-xl">
          <div class="flex items-center justify-between mb-4">
            <span class="text-slate-600 dark:text-white/70 text-sm font-medium">Total</span>
            <div class="p-2 bg-slate-100 dark:bg-white/5 rounded-lg">
              <span class="material-symbols-outlined text-slate-500 dark:text-white/50 text-xl">business_center</span>
            </div>
          </div>
          <div class="text-4xl font-black text-slate-900 dark:text-white mb-1">{{ serviceStats.total }}</div>
          <div class="text-xs text-slate-500 dark:text-white/40">Registered services</div>
        </div>

        <div class="bg-white dark:bg-surface-card rounded-xl p-6 border border-slate-200 dark:border-white/5 hover:border-secondary/50 transition-all shadow-lg dark:shadow-xl">
          <div class="flex items-center justify-between mb-4">
            <span class="text-slate-600 dark:text-white/70 text-sm font-medium">Active</span>
            <div class="p-2 bg-slate-100 dark:bg-white/5 rounded-lg">
              <span class="material-symbols-outlined text-slate-500 dark:text-white/50 text-xl">check_circle</span>
            </div>
          </div>
          <div class="text-4xl font-black text-slate-900 dark:text-white mb-1">{{ serviceStats.active }}</div>
          <div class="text-xs text-slate-500 dark:text-white/40">Active services</div>
        </div>

        <div class="bg-white dark:bg-surface-card rounded-xl p-6 border border-slate-200 dark:border-white/5 hover:border-secondary/50 transition-all shadow-lg dark:shadow-xl">
          <div class="flex items-center justify-between mb-4">
            <span class="text-slate-600 dark:text-white/70 text-sm font-medium">Inactive</span>
            <div class="p-2 bg-slate-100 dark:bg-white/5 rounded-lg">
              <span class="material-symbols-outlined text-slate-500 dark:text-white/50 text-xl">cancel</span>
            </div>
          </div>
          <div class="text-4xl font-black text-slate-900 dark:text-white mb-1">{{ serviceStats.inactive }}</div>
          <div class="text-xs text-slate-500 dark:text-white/40">Inactive services</div>
        </div>

        <div class="bg-white dark:bg-surface-card rounded-xl p-6 border border-slate-200 dark:border-white/5 hover:border-secondary/50 transition-all shadow-lg dark:shadow-xl">
          <div class="flex items-center justify-between mb-4">
            <span class="text-slate-600 dark:text-white/70 text-sm font-medium">Featured</span>
            <div class="p-2 bg-slate-100 dark:bg-white/5 rounded-lg">
              <span class="material-symbols-outlined text-slate-500 dark:text-white/50 text-xl">star</span>
            </div>
          </div>
          <div class="text-4xl font-black text-slate-900 dark:text-white mb-1">{{ serviceStats.featured }}</div>
          <div class="text-xs text-slate-500 dark:text-white/40">Featured services</div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex justify-between items-center">
        <div class="flex gap-2 sm:gap-3 overflow-x-auto no-scrollbar pb-1">
          <button
            v-for="filter in filters"
            :key="filter.id"
            class="flex h-9 sm:h-10 shrink-0 items-center justify-center rounded-lg px-4 sm:px-6 text-xs sm:text-sm font-medium transition-all"
            :class="activeFilter === filter.id
              ? 'bg-surface-card text-white border-t-2 border-primary'
              : 'text-white/60 hover:text-white border-t-2 border-transparent'"
            @click="activeFilter = filter.id"
          >
            {{ filter.label }}
          </button>
        </div>
        <button
          @click="showCreateModal = true"
          class="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-secondary text-black font-bold rounded-lg hover:shadow-lg hover:shadow-primary/30 transition-all"
        >
          <span class="material-symbols-outlined">add</span>
          <span class="hidden sm:inline">New Service</span>
        </button>
      </div>

      <!-- Services List -->
      <div v-if="loading && allServices.length === 0" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>

      <div v-else-if="displayedServices.length === 0" class="flex flex-col items-center justify-center py-12 bg-slate-50 dark:bg-surface-dark/50 rounded-xl border border-slate-200 dark:border-white/10">
        <span class="material-symbols-outlined text-slate-400 dark:text-gray-500 text-6xl mb-4">business_center</span>
        <p class="text-slate-500 dark:text-gray-400 font-medium">No services found</p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="service in displayedServices"
          :key="service.id"
          class="bg-white dark:bg-surface-card rounded-xl p-6 border border-slate-200 dark:border-white/10 hover:border-primary/50 transition-all shadow-lg dark:shadow-xl"
        >
          <div class="flex items-start justify-between mb-4">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-2">
                <h3 class="text-slate-900 dark:text-white font-bold text-lg">{{ service.nome_pt }}</h3>
                <span
                  v-if="service.destaque"
                  class="px-2 py-0.5 rounded-full text-xs font-bold bg-yellow-500/20 text-yellow-400"
                >
                  Featured
                </span>
                <span
                  v-if="service.status === 'pending'"
                  class="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400"
                >
                  Pendente
                </span>
                <span
                  v-if="service.status === 'rejected'"
                  class="px-2 py-0.5 rounded-full text-xs font-bold bg-red-500/20 text-red-400"
                >
                  Recusado
                </span>
                <span
                  v-if="!service.ativo && service.status === 'approved'"
                  class="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-500/20 text-slate-400"
                >
                  Inativo
                </span>
              </div>
              <p v-if="service.categoria" class="text-slate-600 dark:text-white/60 text-sm mb-2">
                {{ service.categoria }}
              </p>
              <p v-if="service.descricao_pt" class="text-slate-500 dark:text-white/40 text-sm line-clamp-2">
                {{ service.descricao_pt }}
              </p>
            </div>
          </div>

          <div v-if="service.preco" class="mb-4">
            <div class="text-2xl font-black text-slate-900 dark:text-white">
              {{ formatPrice(service.preco, service.moeda || 'USD') }}
            </div>
          </div>

          <div v-if="service.beneficio_membro_pt" class="mb-4 p-3 rounded-lg bg-secondary/10 border border-secondary/20">
            <p class="text-xs font-bold text-secondary uppercase mb-1">Member Benefit:</p>
            <p class="text-sm text-slate-700 dark:text-gray-300">{{ service.beneficio_membro_pt }}</p>
          </div>

          <div class="flex gap-2 mt-4">
            <template v-if="service.status === 'pending'">
              <button
                @click="handleApprove(service.id)"
                class="flex-1 px-4 py-2 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 rounded-lg text-green-400 text-sm font-bold transition-all"
              >
                Aprovar
              </button>
              <button
                @click="handleReject(service.id)"
                class="flex-1 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg text-red-400 text-sm font-bold transition-all"
              >
                Recusar
              </button>
            </template>
            <template v-else>
              <button
                @click="editService(service)"
                class="flex-1 px-4 py-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white text-sm font-medium transition-all"
              >
                Editar
              </button>
              <button
                @click="deleteService(service.id)"
                class="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg text-red-400 text-sm font-medium transition-all"
              >
                <span class="material-symbols-outlined text-lg">delete</span>
              </button>
            </template>
          </div>
        </div>
      </div>

      <!-- Create/Edit Modal -->
      <Modal
        v-model="showModal"
        :title="showEditModal ? 'Edit Service' : 'Create New Service'"
        size="lg"
      >
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-900 dark:text-white mb-2">Nome (PT) *</label>
              <input
                v-model="formData.nome_pt"
                type="text"
                required
                class="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-lighter p-3 text-slate-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                placeholder="Nome em português"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-900 dark:text-white mb-2">Name (EN) *</label>
              <input
                v-model="formData.nome_en"
                type="text"
                required
                class="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-lighter p-3 text-slate-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                placeholder="Name in English"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-900 dark:text-white mb-2">Descrição (PT)</label>
              <textarea
                v-model="formData.descricao_pt"
                rows="4"
                class="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-lighter p-3 text-slate-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                placeholder="Descrição em português"
              ></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-900 dark:text-white mb-2">Description (EN)</label>
              <textarea
                v-model="formData.descricao_en"
                rows="4"
                class="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-lighter p-3 text-slate-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                placeholder="Description in English"
              ></textarea>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-900 dark:text-white mb-2">Category</label>
              <select
                v-model="formData.categoria"
                class="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-lighter p-3 text-slate-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              >
                <option value="">Select...</option>
                <option value="legal">Legal & Bureaucracy</option>
                <option value="marketing">Marketing & Brand</option>
                <option value="finance">Finance</option>
                <option value="mentoring">Mentoring</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-900 dark:text-white mb-2">Partner</label>
              <input
                v-model="formData.parceiro_id"
                type="text"
                class="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-lighter p-3 text-slate-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                placeholder="Partner ID (optional)"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-900 dark:text-white mb-2">Benefício Membro (PT)</label>
              <input
                v-model="formData.beneficio_membro_pt"
                type="text"
                class="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-lighter p-3 text-slate-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                placeholder="Ex: 20% de desconto exclusivo"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-900 dark:text-white mb-2">Member Benefit (EN)</label>
              <input
                v-model="formData.beneficio_membro_en"
                type="text"
                class="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-lighter p-3 text-slate-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                placeholder="Ex: 20% exclusive discount"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-900 dark:text-white mb-2">Price (in cents)</label>
              <input
                v-model.number="formData.preco"
                type="number"
                min="0"
                class="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-lighter p-3 text-slate-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                placeholder="9900 = $99.00"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-900 dark:text-white mb-2">Currency</label>
              <select
                v-model="formData.moeda"
                class="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-lighter p-3 text-slate-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              >
                <option value="USD">USD</option>
                <option value="BRL">BRL</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-900 dark:text-white mb-2">Status do Serviço</label>
            <select
              v-model="formData.status"
              class="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-lighter p-3 text-slate-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            >
              <option value="pending">Pendente (Em análise)</option>
              <option value="approved">Aprovado (Ativo)</option>
              <option value="rejected">Recusado</option>
            </select>
          </div>

          <div v-if="formData.status === 'rejected'" class="mt-2">
            <label class="block text-sm font-medium text-slate-900 dark:text-white mb-2">Motivo da Recusa</label>
            <textarea
              v-model="formData.rejection_reason"
              rows="2"
              class="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-lighter p-3 text-slate-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              placeholder="Descreva o motivo da recusa para o usuário..."
            ></textarea>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-900 dark:text-white mb-2">Termos e Condições (PT)</label>
              <textarea
                v-model="formData.terms_content_pt"
                rows="6"
                class="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-lighter p-3 text-slate-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                placeholder="Termos específicos para este serviço em português..."
              ></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-900 dark:text-white mb-2">Terms & Conditions (EN)</label>
              <textarea
                v-model="formData.terms_content_en"
                rows="6"
                class="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-lighter p-3 text-slate-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                placeholder="Specific terms for this service in English..."
              ></textarea>
            </div>
          </div>

          <div class="flex gap-4">
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                v-model="formData.destaque"
                type="checkbox"
                class="w-4 h-4 rounded border-slate-300 dark:border-white/10 bg-white dark:bg-surface-lighter text-primary focus:ring-primary"
              />
              <span class="text-sm text-slate-900 dark:text-white">Featured</span>
            </label>

            <label class="flex items-center gap-2 cursor-pointer">
              <input
                v-model="formData.ativo"
                type="checkbox"
                class="w-4 h-4 rounded border-slate-300 dark:border-white/10 bg-white dark:bg-surface-lighter text-primary focus:ring-primary"
              />
              <span class="text-sm text-slate-900 dark:text-white">Active</span>
            </label>
          </div>

          <div class="flex gap-3 pt-4">
            <button
              type="submit"
              :disabled="submitting"
              class="flex-1 px-4 py-2 bg-gradient-to-r from-primary to-secondary text-black font-bold rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
            >
              {{ submitting ? 'Saving...' : (showEditModal ? 'Save Changes' : 'Create Service') }}
            </button>
            <button
              type="button"
              @click="closeModal"
              class="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white font-medium transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
      
      <!-- Modal de Recusa -->
      <Modal
        v-model="showRejectModal"
        title="Motivo da Recusa"
      >
        <div class="space-y-4">
          <p class="text-slate-600 dark:text-white/60 text-sm">
            Informe ao usuário o motivo pelo qual este serviço está sendo recusado.
          </p>
          <textarea
            v-model="rejectionReason"
            rows="4"
            class="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-lighter p-3 text-slate-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            placeholder="Ex: Descrição incompleta, imagem inadequada, etc..."
          ></textarea>
          
          <div class="flex pt-2">
            <button
              @click="confirmReject"
              :disabled="submitting || !rejectionReason.trim()"
              class="w-full px-4 py-3 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 transition-all disabled:opacity-50"
            >
              {{ submitting ? 'Recusando...' : 'Confirmar Recusa' }}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAdminStore } from '@/stores/admin'
import AdminLayout from '@/components/layout/admin/AdminLayout.vue'
import Modal from '@/components/ui/Modal.vue'
import type { AdminService } from '@/types/admin'
import { toast } from 'vue-sonner'

const router = useRouter()
const adminStore = useAdminStore()

const activeFilter = ref<'all' | 'active' | 'inactive' | 'featured' | 'pending'>('all')
const showCreateModal = ref(false)
const showEditModal = ref(false)
const submitting = ref(false)
const editingService = ref<AdminService | null>(null)

const showRejectModal = ref(false)
const rejectionReason = ref('')
const serviceToReject = ref<string | null>(null)

const showModal = computed({
  get: () => showCreateModal.value || showEditModal.value,
  set: (value: boolean) => {
    if (!value) {
      showCreateModal.value = false
      showEditModal.value = false
    }
  }
})

const filters = [
  { id: 'all' as const, label: 'Todos' },
  { id: 'pending' as const, label: 'Pendentes' },
  { id: 'active' as const, label: 'Ativos' },
  { id: 'inactive' as const, label: 'Inativos' },
  { id: 'featured' as const, label: 'Em Destaque' },
]

const allServices = computed(() => adminStore.allServices)
const serviceStats = computed(() => adminStore.serviceStats)
const loading = computed(() => adminStore.loading)

const displayedServices = computed(() => {
  if (activeFilter.value === 'all') {
    return allServices.value
  }
  if (activeFilter.value === 'active') {
    return allServices.value.filter(s => s.ativo)
  }
  if (activeFilter.value === 'inactive') {
    return allServices.value.filter(s => !s.ativo)
  }
  if (activeFilter.value === 'featured') {
    return allServices.value.filter(s => s.destaque)
  }
  if (activeFilter.value === 'pending') {
    return allServices.value.filter(s => s.status === 'pending')
  }
  return allServices.value
})

const formData = ref<Partial<AdminService>>({
  nome_pt: '',
  nome_en: '',
  descricao_pt: '',
  descricao_en: '',
  parceiro_id: '',
  categoria: '',
  beneficio_membro_pt: '',
  beneficio_membro_en: '',
  destaque: false,
  ativo: true,
  status: 'approved',
  rejection_reason: '',
  preco: undefined,
  moeda: 'USD',
  terms_content_pt: '',
  terms_content_en: '',
})

function formatPrice(cents: number, currency: string = 'USD'): string {
  const amount = cents / 100
  if (currency === 'BRL') {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount)
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

function editService(service: AdminService) {
  editingService.value = service
  formData.value = {
    nome_pt: service.nome_pt,
    nome_en: service.nome_en,
    descricao_pt: service.descricao_pt || '',
    descricao_en: service.descricao_en || '',
    parceiro_id: service.parceiro_id || '',
    categoria: service.categoria || '',
    beneficio_membro_pt: service.beneficio_membro_pt || '',
    beneficio_membro_en: service.beneficio_membro_en || '',
    destaque: service.destaque,
    ativo: service.ativo,
    status: service.status,
    rejection_reason: service.rejection_reason || '',
    preco: service.preco ? service.preco / 100 : undefined,
    moeda: service.moeda || 'USD',
    terms_content_pt: service.terms_content_pt || '',
    terms_content_en: service.terms_content_en || '',
  }
  showEditModal.value = true
}

async function handleSubmit() {
  try {
    submitting.value = true



    if (editingService.value) {
      await adminStore.updateService(editingService.value.id, formData.value)
      toast.success('Service updated successfully!')
    } else {
      await adminStore.createService(formData.value)
      toast.success('Service created successfully!')
    }

    closeModal()
  } catch (error: any) {
    toast.error(error.message || 'Error saving service')
    console.error('Error saving service:', error)
  } finally {
    submitting.value = false
  }
}

async function handleApprove(serviceId: string) {
  try {
    await adminStore.approveService(serviceId)
    toast.success('Serviço aprovado com sucesso!')
  } catch (error: any) {
    toast.error('Erro ao aprovar serviço')
  }
}

async function handleReject(serviceId: string) {
  serviceToReject.value = serviceId
  rejectionReason.value = ''
  showRejectModal.value = true
}

async function confirmReject() {
  if (!serviceToReject.value || !rejectionReason.value.trim()) return
  
  try {
    submitting.value = true
    await adminStore.rejectService(serviceToReject.value, rejectionReason.value)
    toast.success('Serviço recusado')
    showRejectModal.value = false
    serviceToReject.value = null
    rejectionReason.value = ''
  } catch (error: any) {
    toast.error('Erro ao recusar serviço')
  } finally {
    submitting.value = false
  }
}

async function deleteService(serviceId: string) {
  if (!confirm('Are you sure you want to delete this service?')) {
    return
  }

  try {
    await adminStore.deleteService(serviceId)
    toast.success('Service deleted successfully!')
  } catch (error: any) {
    toast.error(error.message || 'Error deleting service')
    console.error('Error deleting service:', error)
  }
}

function closeModal() {
  showCreateModal.value = false
  showEditModal.value = false
  editingService.value = null
  formData.value = {
    nome_pt: '',
    nome_en: '',
    descricao_pt: '',
    descricao_en: '',
    parceiro_id: '',
    categoria: '',
    beneficio_membro_pt: '',
    beneficio_membro_en: '',
    destaque: false,
    ativo: true,
    status: 'approved',
    rejection_reason: '',
    preco: undefined,
    moeda: 'USD',
    terms_content_pt: '',
    terms_content_en: '',
  }
}

onMounted(async () => {
  const isAdmin = await adminStore.checkIsAdmin()
  if (!isAdmin) {
    router.push('/')
    return
  }

  await adminStore.fetchAllServices()
  await adminStore.fetchServiceStats()
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

.no-scrollbar::-webkit-scrollbar {
  display: none;
}

.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>

