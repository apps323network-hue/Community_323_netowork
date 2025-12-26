<template>
  <AppLayout>
    <div class="w-full flex flex-col gap-6 sm:gap-8">
      <!-- Header -->
      <div class="flex flex-col lg:flex-row gap-4 sm:gap-6 justify-between items-start lg:items-center">
        <div>
          <h1 class="text-white text-2xl sm:text-3xl lg:text-4xl font-black mb-2">
            Gestão de <span class="bg-clip-text text-transparent bg-neon-gradient">Membros</span>
          </h1>
          <p class="text-white/60 text-sm sm:text-base">
            Aprove, rejeite e gerencie membros da comunidade
          </p>
        </div>
      </div>

      <!-- Stats -->
      <UserStats :stats="userStats" />

      <!-- Tabs -->
      <div class="flex gap-2 sm:gap-3 overflow-x-auto no-scrollbar pb-1 border-b border-white/10">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          class="flex h-9 sm:h-10 shrink-0 items-center justify-center rounded-t-lg px-4 sm:px-6 text-xs sm:text-sm font-medium transition-all relative"
          :class="activeTab === tab.id
            ? 'bg-surface-card text-white border-t-2 border-primary'
            : 'text-white/60 hover:text-white border-t-2 border-transparent'"
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
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAdminStore } from '@/stores/admin'
import AppLayout from '@/components/layout/AppLayout.vue'
import UserStats from '@/components/admin/UserStats.vue'
import AdminPendingUsersList from '@/components/admin/AdminPendingUsersList.vue'
import AdminUsersList from '@/components/admin/AdminUsersList.vue'
import UserApprovalModal from '@/components/admin/UserApprovalModal.vue'
import type { AdminUser } from '@/types/admin'
import { toast } from 'vue-sonner'

const router = useRouter()
const adminStore = useAdminStore()

const activeTab = ref<'pending' | 'all' | 'suspended' | 'banned'>('pending')
const showApprovalModal = ref(false)
const selectedUser = ref<AdminUser | null>(null)

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
    await adminStore.fetchPendingUsers()
    await adminStore.fetchUserStats()
    toast.success('Usuário aprovado com sucesso!')
    showApprovalModal.value = false
    selectedUser.value = null
  } catch (error: any) {
    toast.error(error.message || 'Erro ao aprovar usuário')
    console.error('Error approving user:', error)
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

function handleBan(_userId: string) {
  // TODO: Implementar banimento (Sprint 2)
  toast.info('Funcionalidade de banimento será implementada em breve')
}

function handleUnsuspend(_userId: string) {
  // TODO: Implementar remoção de suspensão (Sprint 2)
  toast.info('Funcionalidade será implementada em breve')
}

function handleViewHistory(_userId: string) {
  // TODO: Implementar visualização de histórico (Sprint 2)
  toast.info('Funcionalidade de histórico será implementada em breve')
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

.no-scrollbar::-webkit-scrollbar {
  display: none;
}

.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>

