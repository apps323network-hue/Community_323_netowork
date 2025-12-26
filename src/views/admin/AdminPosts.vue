<template>
  <AppLayout>
    <div class="w-full flex flex-col gap-6 sm:gap-8">
      <!-- Header -->
      <div class="flex flex-col lg:flex-row gap-4 sm:gap-6 justify-between items-start lg:items-center">
        <div>
          <h1 class="text-white text-2xl sm:text-3xl lg:text-4xl font-black mb-2">
            Gestão de <span class="bg-clip-text text-transparent bg-neon-gradient">Posts</span>
          </h1>
          <p class="text-white/60 text-sm sm:text-base">
            Aprove, oculte, remova e gerencie posts da comunidade
          </p>
        </div>
      </div>

      <!-- Stats -->
      <PostStats :stats="postStats" />

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
        <AdminPendingPostsList
          :posts="pendingPosts"
          :loading="loading"
          @approve="handleApprove"
          @hide="handleHide"
          @remove="handleRemove"
          @spam="handleSpam"
          @view-full="handleViewFull"
        />
      </div>

      <div v-else>
        <AdminPostsList
          :posts="displayedPosts"
          :loading="loading"
          @approve="handleApprove"
          @hide="handleHide"
          @remove="handleRemove"
          @view-details="handleViewDetails"
        />
      </div>

      <!-- Moderation Modal -->
      <PostModerationModal
        v-model="showModerationModal"
        :post="selectedPost"
        @approve="handleModalApprove"
        @hide="handleModalHide"
        @remove="handleModalRemove"
        @spam="handleModalSpam"
      />

      <!-- Post View Modal -->
      <Modal v-model="showPostViewModal" title="Visualizar Post Completo" size="xl">
        <AdminPostView
          v-if="viewedPost"
          :post="viewedPost"
          @approve="handleApproveFromView"
          @hide="handleHideFromView"
          @remove="handleRemoveFromView"
          @spam="handleSpamFromView"
        />
      </Modal>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAdminStore } from '@/stores/admin'
import AppLayout from '@/components/layout/AppLayout.vue'
import PostStats from '@/components/admin/PostStats.vue'
import AdminPendingPostsList from '@/components/admin/AdminPendingPostsList.vue'
import AdminPostsList from '@/components/admin/AdminPostsList.vue'
import PostModerationModal from '@/components/admin/PostModerationModal.vue'
import AdminPostView from '@/components/admin/AdminPostView.vue'
import Modal from '@/components/ui/Modal.vue'
import type { AdminPost } from '@/types/admin'
import type { PostStatus } from '@/types/posts'
import { toast } from 'vue-sonner'

const router = useRouter()
const adminStore = useAdminStore()

const activeTab = ref<'pending' | 'all' | 'hidden' | 'removed' | 'spam'>('pending')
const showModerationModal = ref(false)
const showPostViewModal = ref(false)
const selectedPost = ref<AdminPost | null>(null)
const viewedPost = ref<AdminPost | null>(null)

const tabs = computed(() => [
  {
    id: 'pending' as const,
    label: 'Pendentes',
    badge: adminStore.postStats.pending > 0 ? adminStore.postStats.pending : undefined,
    badgeClass: 'bg-yellow-500/20 text-yellow-400',
  },
  {
    id: 'all' as const,
    label: 'Todos',
  },
  {
    id: 'hidden' as const,
    label: 'Ocultos',
    badge: adminStore.postStats.hidden > 0 ? adminStore.postStats.hidden : undefined,
    badgeClass: 'bg-orange-500/20 text-orange-400',
  },
  {
    id: 'removed' as const,
    label: 'Removidos',
    badge: adminStore.postStats.removed > 0 ? adminStore.postStats.removed : undefined,
    badgeClass: 'bg-red-500/20 text-red-400',
  },
  {
    id: 'spam' as const,
    label: 'Spam',
    badge: adminStore.postStats.spam > 0 ? adminStore.postStats.spam : undefined,
    badgeClass: 'bg-purple-500/20 text-purple-400',
  },
])

const pendingPosts = computed(() => adminStore.pendingPosts)
const postStats = computed(() => adminStore.postStats)
const loading = computed(() => adminStore.loading)

const displayedPosts = computed(() => {
  if (activeTab.value === 'all') {
    return adminStore.allPosts
  }
  return adminStore.allPosts.filter(p => p.status === activeTab.value)
})

async function handleTabChange(tabId: 'pending' | 'all' | 'hidden' | 'removed' | 'spam') {
  activeTab.value = tabId

  if (tabId === 'pending') {
    await adminStore.fetchPendingPosts()
  } else {
    const statusFilter = tabId === 'all' ? undefined : tabId
    await adminStore.fetchAllPosts(statusFilter)
  }
  await adminStore.fetchPostStats()
}

function handleApprove(postId: string) {
  const post = pendingPosts.value.find(p => p.id === postId) || 
               adminStore.allPosts.find(p => p.id === postId)
  if (post) {
    selectedPost.value = post
    showModerationModal.value = true
  }
}

function handleHide(postId: string) {
  const post = pendingPosts.value.find(p => p.id === postId) || 
               adminStore.allPosts.find(p => p.id === postId)
  if (post) {
    selectedPost.value = post
    showModerationModal.value = true
  }
}

function handleRemove(postId: string) {
  const post = pendingPosts.value.find(p => p.id === postId) || 
               adminStore.allPosts.find(p => p.id === postId)
  if (post) {
    selectedPost.value = post
    showModerationModal.value = true
  }
}

function handleSpam(postId: string) {
  const post = pendingPosts.value.find(p => p.id === postId) || 
               adminStore.allPosts.find(p => p.id === postId)
  if (post) {
    selectedPost.value = post
    showModerationModal.value = true
  }
}

async function handleModalApprove(postId: string) {
  try {
    await adminStore.approvePost(postId)
    await adminStore.fetchPendingPosts()
    await adminStore.fetchAllPosts()
    await adminStore.fetchPostStats()
    toast.success('Post aprovado com sucesso!')
    showModerationModal.value = false
    selectedPost.value = null
  } catch (error: any) {
    toast.error(error.message || 'Erro ao aprovar post')
    console.error('Error approving post:', error)
  }
}

async function handleModalHide(postId: string, reason: string) {
  try {
    await adminStore.hidePost(postId, reason)
    await adminStore.fetchPendingPosts()
    await adminStore.fetchAllPosts()
    await adminStore.fetchPostStats()
    toast.success('Post ocultado')
    showModerationModal.value = false
    selectedPost.value = null
  } catch (error: any) {
    toast.error(error.message || 'Erro ao ocultar post')
    console.error('Error hiding post:', error)
  }
}

async function handleModalRemove(postId: string, reason: string, addStrike: boolean) {
  try {
    await adminStore.removePost(postId, reason, addStrike)
    await adminStore.fetchPendingPosts()
    await adminStore.fetchAllPosts()
    await adminStore.fetchPostStats()
    toast.success('Post removido' + (addStrike ? ' e strike adicionado' : ''))
    showModerationModal.value = false
    selectedPost.value = null
  } catch (error: any) {
    toast.error(error.message || 'Erro ao remover post')
    console.error('Error removing post:', error)
  }
}

async function handleModalSpam(postId: string) {
  try {
    await adminStore.markAsSpam(postId)
    await adminStore.fetchPendingPosts()
    await adminStore.fetchAllPosts()
    await adminStore.fetchPostStats()
    toast.success('Post marcado como spam e strike adicionado')
    showModerationModal.value = false
    selectedPost.value = null
  } catch (error: any) {
    toast.error(error.message || 'Erro ao marcar como spam')
    console.error('Error marking post as spam:', error)
  }
}

function handleViewFull(postId: string) {
  const post = pendingPosts.value.find(p => p.id === postId) || 
               adminStore.allPosts.find(p => p.id === postId)
  if (post) {
    viewedPost.value = post
    showPostViewModal.value = true
  }
}

function handleViewDetails(postId: string) {
  handleViewFull(postId)
}

function handleApproveFromView(postId: string) {
  showPostViewModal.value = false
  handleApprove(postId)
}

function handleHideFromView(postId: string) {
  showPostViewModal.value = false
  handleHide(postId)
}

function handleRemoveFromView(postId: string) {
  showPostViewModal.value = false
  handleRemove(postId)
}

function handleSpamFromView(postId: string) {
  showPostViewModal.value = false
  handleSpam(postId)
}

onMounted(async () => {
  // Verificar se é admin
  const isAdmin = await adminStore.checkIsAdmin()
  if (!isAdmin) {
    router.push('/')
    return
  }

  await adminStore.fetchPendingPosts()
  await adminStore.fetchPostStats()
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

