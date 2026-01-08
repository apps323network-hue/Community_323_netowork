<template>
  <AdminLayout>
    <div class="relative overflow-x-hidden pb-20">
      <!-- Decorative Background Elements Removed -->

      <div class="relative z-10 max-w-[1600px] mx-auto px-4 lg:px-10 py-8">
        <!-- Hero Header -->
        <div class="mb-8">
          <h1 class="text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight mb-4">
            Gestão de <span class="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-primary animate-gradient-x bg-[length:200%_auto]">Membros</span>
          </h1>
          <p class="text-white/60 text-lg">
            Gerencie, filtre e analise todos os membros da comunidade com métricas de engajamento em tempo real
          </p>
        </div>

        <!-- Stats Dashboard -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <!-- Total Members -->
          <div class="relative rounded-[24px] p-6 bg-slate-900/50 backdrop-blur-sm border border-white/10 hover:border-primary/50 transition-all group">
            <div class="flex items-center gap-4">
              <div class="p-3 rounded-xl bg-primary/10 border border-primary/20">
                <span class="material-symbols-outlined text-primary text-2xl">group</span>
              </div>
              <div>
                <p class="text-white/50 text-xs font-medium mb-1">Total de Membros</p>
                <p class="text-white text  -2xl font-black">{{ usersStore.userStats.total }}</p>
              </div>
            </div>
          </div>

          <!-- Active Members -->
          <div class="relative rounded-[24px] p-6 bg-slate-900/50 backdrop-blur-sm border border-white/10 hover:border-green-500/50 transition-all group">
            <div class="flex items-center gap-4">
              <div class="p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                <span class="material-symbols-outlined text-green-500 text-2xl">check_circle</span>
              </div>
              <div>
                <p class="text-white/50 text-xs font-medium mb-1">Membros Ativos</p>
                <p class="text-white text-2xl font-black">{{ usersStore.userStats.active }}</p>
              </div>
            </div>
          </div>

          <!-- Pending Approvals -->
          <div class="relative rounded-[24px] p-6 bg-slate-900/50 backdrop-blur-sm border border-white/10 hover:border-yellow-500/50 transition-all group">
            <div class="flex items-center gap-4">
              <div class="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                <span class="material-symbols-outlined text-yellow-500 text-2xl">pending_actions</span>
              </div>
              <div>
                <p class="text-white/50 text-xs font-medium mb-1">Pendentes</p>
                <p class="text-white text-2xl font-black">{{ usersStore.userStats.pending }}</p>
              </div>
            </div>
          </div>

          <!-- New Today -->
          <div class="relative rounded-[24px] p-6 bg-slate-900/50 backdrop-blur-sm border border-white/10 hover:border-secondary/50 transition-all group">
            <div class="flex items-center gap-4">
              <div class="p-3 rounded-xl bg-secondary/10 border border-secondary/20">
                <span class="material-symbols-outlined text-secondary text-2xl">person_add</span>
              </div>
              <div>
                <p class="text-white/50 text-xs font-medium mb-1">Novos Hoje</p>
                <p class="text-white text-2xl font-black">{{ usersStore.userStats.newToday }}</p>
              </div>
            </div>
          </div>

          <!-- Engagement Rate -->
          <div class="relative rounded-[24px] p-6 bg-slate-900/50 backdrop-blur-sm border border-white/10 hover:border-purple-500/50 transition-all group">
            <div class="flex items-center gap-4">
              <div class="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                <span class="material-symbols-outlined text-purple-500 text-2xl">trending_up</span>
              </div>
              <div>
                <p class="text-white/50 text-xs font-medium mb-1">Engajamento</p>
                <p class="text-white text-2xl font-black">{{ engagementRateText }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Filters -->
        <MemberFilters v-model="currentFilters" @update:modelValue="handleFiltersChange" />

        <!-- Results Info -->
        <div class="flex items-center justify-between mb-6">
          <p class="text-white/60 text-sm">
            Mostrando <span class="text-white font-bold">{{ usersStore.paginatedMembers.length }}</span> de 
            <span class="text-white font-bold">{{ usersStore.pagination.totalItems }}</span> membros
          </p>

          <!-- View Toggle -->
          <div class="flex items-center gap-2">
            <button
              @click="viewMode = 'grid'"
              class="p-2 rounded-lg transition-all"
              :class="viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white hover:bg-white/5'"
            >
              <span class="material-symbols-outlined">grid_view</span>
            </button>
            <button
              @click="viewMode = 'list'"
              class="p-2 rounded-lg transition-all"
              :class="viewMode === 'list' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white hover:bg-white/5'"
            >
              <span class="material-symbols-outlined">view_list</span>
            </button>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="usersStore.loading" class="flex flex-col items-center justify-center py-20 gap-6">
          <div class="relative w-20 h-20">
            <div class="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
            <div class="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <div class="absolute inset-0 rounded-full shadow-[0_0_30px_rgba(244,37,244,0.3)] animate-pulse"></div>
          </div>
          <p class="text-white/60 font-medium animate-pulse tracking-widest uppercase text-sm">Carregando membros...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="usersStore.paginatedMembers.length === 0" class="flex flex-col items-center justify-center py-20 gap-6">
          <div class="w-20 h-20 rounded-[24px] bg-white/5 border border-white/10 flex items-center justify-center mb-4">
            <span class="material-symbols-outlined text-4xl text-white/40">search_off</span>
          </div>
          <h3 class="text-2xl font-black text-white uppercase tracking-tight">Nenhum membro encontrado</h3>
          <p class="text-white/60 text-center max-w-md">
            Não há membros que correspondam aos filtros selecionados. Tente ajustar os critérios de busca.
          </p>
          <button
            @click="handleClearFilters"
            class="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-all"
          >
            Limpar Filtros
          </button>
        </div>

        <!-- Members Grid -->
        <div v-else>
          <div 
            v-if="viewMode === 'grid'"
            class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
          >
            <MemberCard
              v-for="member in usersStore.paginatedMembers"
              :key="member.id"
              :user="member"
              @view-profile="handleViewProfile"
              @suspend="handleSuspend"
              @unsuspend="handleUnsuspend"
              @ban="handleBan"
              @unban="handleUnban"
            />
          </div>

          <!-- List View (Alternative layout) -->
          <div v-else class="space-y-4">
            <MemberCard
              v-for="member in usersStore.paginatedMembers"
              :key="member.id"
              :user="member"
              @view-profile="handleViewProfile"
              @suspend="handleSuspend"
              @unsuspend="handleUnsuspend"
              @ban="handleBan"
              @unban="handleUnban"
            />
          </div>
        </div>

        <!-- Pagination Controls -->
        <div v-if="usersStore.pagination.totalPages > 1" class="mt-12 flex flex-col items-center gap-6">
          <div class="flex items-center gap-2">
            <!-- Previous Button -->
            <button
              @click="handlePageChange(usersStore.pagination.currentPage - 1)"
              :disabled="usersStore.pagination.currentPage === 1"
              class="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <span class="material-symbols-outlined">chevron_left</span>
              Anterior
            </button>

            <!-- Page Numbers -->
            <div class="flex items-center gap-2">
              <template v-for="page in visiblePages" :key="page">
                <button
                  v-if="typeof page === 'number'"
                  @click="handlePageChange(page)"
                  class="w-10 h-10 rounded-xl font-bold transition-all"
                  :class="page === usersStore.pagination.currentPage 
                    ? 'bg-gradient-to-r from-primary to-secondary text-black' 
                    : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'"
                >
                  {{ page }}
                </button>
                <span v-else class="text-white/40 px-2">...</span>
              </template>
            </div>

            <!-- Next Button -->
            <button
              @click="handlePageChange(usersStore.pagination.currentPage + 1)"
              :disabled="usersStore.pagination.currentPage === usersStore.pagination.totalPages"
              class="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
            >
              Próximo
              <span class="material-symbols-outlined">chevron_right</span>
            </button>
          </div>

          <!-- Page Size Selector -->
          <div class="flex items-center gap-3 text-white/60 text-sm">
            <span>Itens por página:</span>
            <select
              :value="usersStore.pagination.pageSize"
              @change="handlePageSizeChange"
              class="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
            >
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Ban Confirmation Modal -->
    <Modal v-model="showBanModal" title="Confirmar Banimento">
      <div class="space-y-4">
        <div class="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg p-4">
          <div class="flex items-start gap-3">
            <span class="material-symbols-outlined text-red-500 text-2xl">warning</span>
            <div>
              <p class="text-slate-900 dark:text-white font-medium mb-1">Ação Irreversível</p>
              <p class="text-slate-600 dark:text-white/60 text-sm">
                Tem certeza que deseja banir este usuário? Esta ação impedirá completamente o acesso à plataforma.
              </p>
            </div>
          </div>
        </div>

        <div v-if="userToBan" class="bg-white dark:bg-surface-card rounded-lg p-4 border border-slate-200 dark:border-white/5">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
              <span class="material-symbols-outlined text-primary text-2xl">person</span>
            </div>
            <div>
              <p class="text-slate-900 dark:text-white font-medium">{{ userToBan.nome || 'Usuário' }}</p>
              <p class="text-slate-600 dark:text-white/60 text-sm">{{ userToBan.email || userToBan.area_atuacao }}</p>
            </div>
          </div>
        </div>

        <div>
          <label class="block text-slate-700 dark:text-white text-sm font-medium mb-2">
            Motivo do banimento (opcional)
          </label>
          <textarea
            v-model="banReason"
            rows="3"
            class="w-full px-4 py-3 bg-white dark:bg-surface-lighter border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/40 focus:border-secondary focus:ring-1 focus:ring-secondary focus:shadow-[0_0_15px_rgba(0,243,255,0.3)] focus:outline-none resize-none transition-all"
            placeholder="Descreva o motivo do banimento..."
          ></textarea>
        </div>

        <div class="flex gap-3 justify-end pt-2">
          <button
            @click="showBanModal = false"
            class="px-6 py-2.5 rounded-lg text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
          >
            Cancelar
          </button>
          <button
            @click="confirmBan"
            class="px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <span class="material-symbols-outlined text-lg">block</span>
            Banir Usuário
          </button>
        </div>
      </div>
    </Modal>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAdminUsersStore } from '@/stores/admin/users'
import { useAdminBaseStore } from '@/stores/admin/base'
import AdminLayout from '@/components/layout/admin/AdminLayout.vue'
import MemberCard from '@/components/admin/MemberCard.vue'
import MemberFilters from '@/components/admin/MemberFilters.vue'
import Modal from '@/components/ui/Modal.vue'
import type { AdminUser, MemberFilters as MemberFiltersType } from '@/types/admin'
import { toast } from 'vue-sonner'

const router = useRouter()
const usersStore = useAdminUsersStore()
const baseStore = useAdminBaseStore()

const currentFilters = ref<MemberFiltersType>({})
const viewMode = ref<'grid' | 'list'>('list')
const showBanModal = ref(false)
const userToBan = ref<AdminUser | null>(null)
const banReason = ref('')

const engagementRateText = computed(() => {
  const rate = usersStore.userStats.engagementRate || 0
  return `${Math.round(rate)}%`
})

const visiblePages = computed(() => {
  const current = usersStore.pagination.currentPage
  const total = usersStore.pagination.totalPages
  const pages: (number | string)[] = []

  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    pages.push(1)
    
    if (current > 3) {
      pages.push('...')
    }
    
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
      pages.push(i)
    }
    
    if (current < total - 2) {
      pages.push('...')
    }
    
    pages.push(total)
  }

  return pages
})

async function handleFiltersChange(filters: MemberFiltersType) {
  usersStore.setFilters(filters)
  await usersStore.fetchMembersPaginated(1, usersStore.pagination.pageSize)
}

async function handleClearFilters() {
  currentFilters.value = {}
  usersStore.clearFilters()
  await usersStore.fetchMembersPaginated(1, usersStore.pagination.pageSize)
}

async function handlePageChange(page: number) {
  await usersStore.fetchMembersPaginated(page, usersStore.pagination.pageSize)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

async function handlePageSizeChange(event: Event) {
  const size = parseInt((event.target as HTMLSelectElement).value)
  usersStore.setPageSize(size)
  await usersStore.fetchMembersPaginated(1, size)
}

function handleViewProfile(userId: string) {
  router.push(`/comunidade/${userId}`)
}

function handleSuspend(_userId: string) {
  toast.info('Funcionalidade de suspensão será implementada em breve')
}

function handleUnsuspend(_userId: string) {
  toast.info('Funcionalidade será implementada em breve')
}

function handleBan(userId: string) {
  const user = usersStore.paginatedMembers.find((u: AdminUser) => u.id === userId)
  if (user) {
    userToBan.value = user
    banReason.value = ''
    showBanModal.value = true
  }
}

async function confirmBan() {
  if (!userToBan.value) return

  try {
    await usersStore.banUser(userToBan.value.id, banReason.value || undefined)
    toast.success('Usuário banido com sucesso')
    await usersStore.fetchMembersPaginated(usersStore.pagination.currentPage, usersStore.pagination.pageSize)
    await usersStore.fetchUserStats()
    showBanModal.value = false
    userToBan.value = null
    banReason.value = ''
  } catch (error: any) {
    toast.error(error.message || 'Erro ao banir usuário')
    console.error('Error banning user:', error)
  }
}

async function handleUnban(userId: string) {
  try {
    await usersStore.unbanUser(userId)
    toast.success('Usuário desbanido com sucesso')
    await usersStore.fetchMembersPaginated(usersStore.pagination.currentPage, usersStore.pagination.pageSize)
    await usersStore.fetchUserStats()
  } catch (error: any) {
    toast.error(error.message || 'Erro ao desbanir usuário')
    console.error('Error unbanning user:', error)
  }
}

onMounted(async () => {
  // Check admin permissions
  const isAdmin = await baseStore.checkIsAdmin()
  if (!isAdmin) {
    router.push('/')
    return
  }

  // Load initial data
  await usersStore.fetchUserStats()
  await usersStore.fetchMembersPaginated(1, 20)
})
</script>

<style scoped>
.animate-gradient-x {
  background-size: 200% auto;
  animation: gradient-x 3s linear infinite;
}

@keyframes gradient-x {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
</style>
