<template>
  <AdminLayout>
    <div class="w-full flex flex-col gap-8">
      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-slate-900 dark:text-white text-4xl lg:text-5xl font-black mb-3">
          Gestão de <span class="bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-primary animate-gradient">Membros</span>
        </h1>
        <p class="text-slate-600 dark:text-white/60 text-lg">
          Aprove, rejeite e gerencie membros da comunidade
        </p>
      </div>

      <!-- Stats -->
      <UserStats :stats="userStats" />

      <!-- Tabs -->
      <div class="flex gap-2 sm:gap-3 overflow-x-auto no-scrollbar pb-1 border-b border-slate-200 dark:border-white/10">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          class="flex h-9 sm:h-10 shrink-0 items-center justify-center rounded-t-lg px-4 sm:px-6 text-xs sm:text-sm font-medium transition-all relative"
          :class="activeTab === tab.id
            ? 'bg-white dark:bg-surface-card text-slate-900 dark:text-white border-t-2 border-primary'
            : 'text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white border-t-2 border-transparent'"
          @click="handleTabChange(tab.id)"
        >
          {{ tab.label }}
          <span
            v-if="tab.badge"
            class="ml-2 px-1.5 py-0.5 rounded-full text-[10px] font-bold"
            :class="tab.badgeClass"
          >
            {{ tab.badge }}
          </span>
        </button>
      </div>

      <!-- Content based on active tab -->
      <div v-if="activeTab === 'pending'">
        <AdminPendingUsersList
          :users="pendingUsers"
          :loading="loading"
          @approve="handleApprove"
          @reject="handleReject"
          @view-profile="handleViewProfile"
        />
      </div>

      <div v-else>
        <AdminUsersList
          :users="displayedUsers"
          :loading="loading"
          @suspend="handleSuspend"
          @ban="handleBan"
          @unban="handleUnban"
          @unsuspend="handleUnsuspend"
          @view-history="handleViewHistory"
        />
      </div>

      <!-- Approval Modal -->
      <UserApprovalModal
        v-model="showApprovalModal"
        :user="selectedUser"
        @approve="handleModalApprove"
        @reject="handleModalReject"
      />
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
import { useAdminStore } from '@/stores/admin'
import AdminLayout from '@/components/layout/admin/AdminLayout.vue'
import UserStats from '@/components/admin/UserStats.vue'
import AdminPendingUsersList from '@/components/admin/AdminPendingUsersList.vue'
import AdminUsersList from '@/components/admin/AdminUsersList.vue'
import UserApprovalModal from '@/components/admin/UserApprovalModal.vue'
import Modal from '@/components/ui/Modal.vue'
import type { AdminUser } from '@/types/admin'
import { toast } from 'vue-sonner'

const router = useRouter()
const adminStore = useAdminStore()

const activeTab = ref<'pending' | 'all' | 'suspended' | 'banned'>('pending')
const showApprovalModal = ref(false)
const selectedUser = ref<AdminUser | null>(null)
const showBanModal = ref(false)
const userToBan = ref<AdminUser | null>(null)
const banReason = ref('')

const tabs = computed(() => [
  {
    id: 'pending' as const,
    label: 'Pendentes',
    badge: adminStore.userStats.pending > 0 ? adminStore.userStats.pending : undefined,
    badgeClass: 'bg-yellow-500/20 text-yellow-400',
  },
  {
    id: 'all' as const,
    label: 'Todos',
  },
  {
    id: 'suspended' as const,
    label: 'Suspensos',
    badge: adminStore.userStats.suspended > 0 ? adminStore.userStats.suspended : undefined,
    badgeClass: 'bg-orange-500/20 text-orange-400',
  },
  {
    id: 'banned' as const,
    label: 'Banidos',
    badge: adminStore.userStats.banned > 0 ? adminStore.userStats.banned : undefined,
    badgeClass: 'bg-red-500/20 text-red-400',
  },
])

const pendingUsers = computed(() => adminStore.pendingUsers)
const userStats = computed(() => adminStore.userStats)
const loading = computed(() => adminStore.loading)

const displayedUsers = computed(() => {
  if (activeTab.value === 'all') {
    return adminStore.allUsers
  }
  return adminStore.allUsers.filter(u => u.status === activeTab.value)
})

async function handleTabChange(tabId: 'pending' | 'all' | 'suspended' | 'banned') {
  activeTab.value = tabId

  if (tabId === 'pending') {
    await adminStore.fetchPendingUsers()
  } else {
    const statusFilter = tabId === 'all' ? undefined : tabId
    await adminStore.fetchAllUsers(statusFilter)
  }
  await adminStore.fetchUserStats()
}

function handleApprove(userId: string) {
  const user = pendingUsers.value.find(u => u.id === userId)
  if (user) {
    selectedUser.value = user
    showApprovalModal.value = true
  }
}

function handleReject(userId: string) {
  const user = pendingUsers.value.find(u => u.id === userId)
  if (user) {
    selectedUser.value = user
    showApprovalModal.value = true
  }
}

async function handleModalApprove(userId: string) {
  try {
    await adminStore.approveUser(userId)
    // A função approveUser já recarrega a lista, mas vamos garantir
    await adminStore.fetchPendingUsers()
    await adminStore.fetchAllUsers()
    await adminStore.fetchUserStats()
    toast.success('Usuário aprovado com sucesso!')
    showApprovalModal.value = false
    selectedUser.value = null
  } catch (error: any) {
    toast.error(error.message || 'Erro ao aprovar usuário')
    console.error('Error approving user:', error)
    // Recarregar mesmo em caso de erro para garantir sincronização
    await adminStore.fetchPendingUsers()
    await adminStore.fetchUserStats()
  }
}

async function handleModalReject(userId: string, reason: string) {
  try {
    await adminStore.rejectUser(userId, reason)
    await adminStore.fetchPendingUsers()
    await adminStore.fetchUserStats()
    toast.success('Usuário rejeitado')
    showApprovalModal.value = false
    selectedUser.value = null
  } catch (error: any) {
    toast.error(error.message || 'Erro ao rejeitar usuário')
    console.error('Error rejecting user:', error)
  }
}

function handleViewProfile(userId: string) {
  router.push(`/comunidade/${userId}`)
}

function handleSuspend(_userId: string) {
  // TODO: Implementar suspensão (Sprint 2)
  toast.info('Funcionalidade de suspensão será implementada em breve')
}

function handleBan(userId: string) {
  const user = displayedUsers.value.find(u => u.id === userId)
  if (user) {
    userToBan.value = user
    banReason.value = ''
    showBanModal.value = true
  }
}

async function confirmBan() {
  if (!userToBan.value) return

  try {
    await adminStore.banUser(userToBan.value.id, banReason.value || undefined)
    toast.success('Usuário banido com sucesso')
    await adminStore.fetchAllUsers()
    await adminStore.fetchUserStats()
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
    await adminStore.unbanUser(userId)
    toast.success('Usuário desbanido com sucesso')
    await adminStore.fetchAllUsers()
    await adminStore.fetchUserStats()
  } catch (error: any) {
    toast.error(error.message || 'Erro ao desbanir usuário')
    console.error('Error unbanning user:', error)
  }
}

function handleUnsuspend(_userId: string) {
  // TODO: Implementar remoção de suspensão (Sprint 2)
  toast.info('Funcionalidade será implementada em breve')
}

function handleViewHistory(userId: string) {
  router.push({ name: 'UserHistory', params: { userId } })
}

onMounted(async () => {
  // Verificar se é admin
  const isAdmin = await adminStore.checkIsAdmin()
  if (!isAdmin) {
    router.push('/')
    return
  }

  await adminStore.fetchPendingUsers()
  await adminStore.fetchUserStats()
})
</script>

<style scoped>
.bg-neon-gradient {
  background: linear-gradient(135deg, #f425f4 0%, #00f0ff 100%);
}

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
</style>

