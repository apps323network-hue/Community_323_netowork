<template>
  <AdminLayout>
    <div class="w-full flex flex-col gap-6 sm:gap-8">
      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-slate-900 dark:text-white text-4xl lg:text-5xl font-black mb-3">
          Gestão de <span class="bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-primary animate-gradient">Serviços</span>
        </h1>
        <p class="text-slate-600 dark:text-white/60 text-lg">
          Crie, edite e gerencie serviços da comunidade
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
          <div class="text-xs text-slate-500 dark:text-white/40">Serviços cadastrados</div>
        </div>

        <div class="bg-white dark:bg-surface-card rounded-xl p-6 border border-slate-200 dark:border-white/5 hover:border-secondary/50 transition-all shadow-lg dark:shadow-xl">
          <div class="flex items-center justify-between mb-4">
            <span class="text-slate-600 dark:text-white/70 text-sm font-medium">Ativos</span>
            <div class="p-2 bg-slate-100 dark:bg-white/5 rounded-lg">
              <span class="material-symbols-outlined text-slate-500 dark:text-white/50 text-xl">check_circle</span>
            </div>
          </div>
          <div class="text-4xl font-black text-slate-900 dark:text-white mb-1">{{ serviceStats.active }}</div>
          <div class="text-xs text-slate-500 dark:text-white/40">Serviços ativos</div>
        </div>

        <div class="bg-white dark:bg-surface-card rounded-xl p-6 border border-slate-200 dark:border-white/5 hover:border-secondary/50 transition-all shadow-lg dark:shadow-xl">
          <div class="flex items-center justify-between mb-4">
            <span class="text-slate-600 dark:text-white/70 text-sm font-medium">Inativos</span>
            <div class="p-2 bg-slate-100 dark:bg-white/5 rounded-lg">
              <span class="material-symbols-outlined text-slate-500 dark:text-white/50 text-xl">cancel</span>
            </div>
          </div>
          <div class="text-4xl font-black text-slate-900 dark:text-white mb-1">{{ serviceStats.inactive }}</div>
          <div class="text-xs text-slate-500 dark:text-white/40">Serviços inativos</div>
        </div>

        <div class="bg-white dark:bg-surface-card rounded-xl p-6 border border-slate-200 dark:border-white/5 hover:border-secondary/50 transition-all shadow-lg dark:shadow-xl">
          <div class="flex items-center justify-between mb-4">
            <span class="text-slate-600 dark:text-white/70 text-sm font-medium">Em Destaque</span>
            <div class="p-2 bg-slate-100 dark:bg-white/5 rounded-lg">
              <span class="material-symbols-outlined text-slate-500 dark:text-white/50 text-xl">star</span>
            </div>
          </div>
          <div class="text-4xl font-black text-slate-900 dark:text-white mb-1">{{ serviceStats.featured }}</div>
          <div class="text-xs text-slate-500 dark:text-white/40">Serviços em destaque</div>
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
          <span class="hidden sm:inline">Novo Serviço</span>
        </button>
      </div>

      <!-- Services List -->
      <div v-if="loading && allServices.length === 0" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>

      <div v-else-if="displayedServices.length === 0" class="flex flex-col items-center justify-center py-12 bg-slate-50 dark:bg-surface-dark/50 rounded-xl border border-slate-200 dark:border-white/10">
        <span class="material-symbols-outlined text-slate-400 dark:text-gray-500 text-6xl mb-4">business_center</span>
        <p class="text-slate-500 dark:text-gray-400 font-medium">Nenhum serviço encontrado</p>
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
                <h3 class="text-slate-900 dark:text-white font-bold text-lg">{{ service.nome }}</h3>
                <span
                  v-if="service.destaque"
                  class="px-2 py-0.5 rounded-full text-xs font-bold bg-yellow-500/20 text-yellow-400"
                >
                  Destaque
                </span>
                <span
                  v-if="!service.ativo"
                  class="px-2 py-0.5 rounded-full text-xs font-bold bg-red-500/20 text-red-400"
                >
                  Inativo
                </span>
              </div>
              <p v-if="service.categoria" class="text-slate-600 dark:text-white/60 text-sm mb-2">
                {{ service.categoria }}
              </p>
              <p v-if="service.descricao" class="text-slate-500 dark:text-white/40 text-sm line-clamp-2">
                {{ service.descricao }}
              </p>
            </div>
          </div>

          <div v-if="service.preco" class="mb-4">
            <div class="text-2xl font-black text-slate-900 dark:text-white">
              {{ formatPrice(service.preco, service.moeda || 'USD') }}
            </div>
          </div>

          <div v-if="service.beneficio_membro" class="mb-4 p-3 rounded-lg bg-secondary/10 border border-secondary/20">
            <p class="text-xs font-bold text-secondary uppercase mb-1">Benefício Membro:</p>
            <p class="text-sm text-slate-700 dark:text-gray-300">{{ service.beneficio_membro }}</p>
          </div>

          <div class="flex gap-2 mt-4">
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
          </div>
        </div>
      </div>

      <!-- Create/Edit Modal -->
      <Modal
        v-model="showModal"
        :title="showEditModal ? 'Editar Serviço' : 'Criar Novo Serviço'"
        size="lg"
      >
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-900 dark:text-white mb-2">Nome *</label>
            <input
              v-model="formData.nome"
              type="text"
              required
              class="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-lighter p-3 text-slate-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              placeholder="Nome do serviço"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-900 dark:text-white mb-2">Descrição</label>
            <textarea
              v-model="formData.descricao"
              rows="4"
              class="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-lighter p-3 text-slate-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              placeholder="Descrição do serviço"
            ></textarea>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-900 dark:text-white mb-2">Categoria</label>
              <select
                v-model="formData.categoria"
                class="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-lighter p-3 text-slate-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              >
                <option value="">Selecione...</option>
                <option value="legal">Legal & Burocracia</option>
                <option value="marketing">Marketing & Brand</option>
                <option value="finance">Finanças</option>
                <option value="mentoring">Mentoria</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-900 dark:text-white mb-2">Parceiro</label>
              <input
                v-model="formData.parceiro_id"
                type="text"
                class="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-lighter p-3 text-slate-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                placeholder="ID do parceiro (opcional)"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-900 dark:text-white mb-2">Benefício para Membros</label>
            <input
              v-model="formData.beneficio_membro"
              type="text"
              class="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-lighter p-3 text-slate-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              placeholder="Ex: 20% de desconto exclusivo"
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-900 dark:text-white mb-2">Preço (em centavos)</label>
              <input
                v-model.number="formData.preco"
                type="number"
                min="0"
                class="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-lighter p-3 text-slate-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                placeholder="9900 = $99.00"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-900 dark:text-white mb-2">Moeda</label>
              <select
                v-model="formData.moeda"
                class="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-lighter p-3 text-slate-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              >
                <option value="USD">USD</option>
                <option value="BRL">BRL</option>
              </select>
            </div>
          </div>

          <div class="flex gap-4">
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                v-model="formData.destaque"
                type="checkbox"
                class="w-4 h-4 rounded border-slate-300 dark:border-white/10 bg-white dark:bg-surface-lighter text-primary focus:ring-primary"
              />
              <span class="text-sm text-slate-900 dark:text-white">Em destaque</span>
            </label>

            <label class="flex items-center gap-2 cursor-pointer">
              <input
                v-model="formData.ativo"
                type="checkbox"
                class="w-4 h-4 rounded border-slate-300 dark:border-white/10 bg-white dark:bg-surface-lighter text-primary focus:ring-primary"
              />
              <span class="text-sm text-slate-900 dark:text-white">Ativo</span>
            </label>
          </div>

          <div class="flex gap-3 pt-4">
            <button
              type="submit"
              :disabled="submitting"
              class="flex-1 px-4 py-2 bg-gradient-to-r from-primary to-secondary text-black font-bold rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
            >
              {{ submitting ? 'Salvando...' : (showEditModal ? 'Salvar Alterações' : 'Criar Serviço') }}
            </button>
            <button
              type="button"
              @click="closeModal"
              class="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white font-medium transition-all"
            >
              Cancelar
            </button>
          </div>
        </form>
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

const activeFilter = ref<'all' | 'active' | 'inactive' | 'featured'>('all')
const showCreateModal = ref(false)
const showEditModal = ref(false)
const submitting = ref(false)
const editingService = ref<AdminService | null>(null)

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
  return allServices.value
})

const formData = ref<Partial<AdminService>>({
  nome: '',
  descricao: '',
  parceiro_id: '',
  categoria: '',
  beneficio_membro: '',
  destaque: false,
  ativo: true,
  preco: undefined,
  moeda: 'USD',
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
    nome: service.nome,
    descricao: service.descricao || '',
    parceiro_id: service.parceiro_id || '',
    categoria: service.categoria || '',
    beneficio_membro: service.beneficio_membro || '',
    destaque: service.destaque,
    ativo: service.ativo,
    preco: service.preco,
    moeda: service.moeda || 'USD',
  }
  showEditModal.value = true
}

async function handleSubmit() {
  try {
    submitting.value = true

    if (editingService.value) {
      await adminStore.updateService(editingService.value.id, formData.value)
      toast.success('Serviço atualizado com sucesso!')
    } else {
      await adminStore.createService(formData.value)
      toast.success('Serviço criado com sucesso!')
    }

    closeModal()
  } catch (error: any) {
    toast.error(error.message || 'Erro ao salvar serviço')
    console.error('Error saving service:', error)
  } finally {
    submitting.value = false
  }
}

async function deleteService(serviceId: string) {
  if (!confirm('Tem certeza que deseja deletar este serviço?')) {
    return
  }

  try {
    await adminStore.deleteService(serviceId)
    toast.success('Serviço deletado com sucesso!')
  } catch (error: any) {
    toast.error(error.message || 'Erro ao deletar serviço')
    console.error('Error deleting service:', error)
  }
}

function closeModal() {
  showCreateModal.value = false
  showEditModal.value = false
  editingService.value = null
  formData.value = {
    nome: '',
    descricao: '',
    parceiro_id: '',
    categoria: '',
    beneficio_membro: '',
    destaque: false,
    ativo: true,
    preco: undefined,
    moeda: 'USD',
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
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>

