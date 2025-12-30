<template>
  <AdminLayout>
    <div class="w-full flex flex-col gap-6 sm:gap-8">
      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-slate-900 dark:text-white text-4xl lg:text-5xl font-black mb-3">
          Gestão de <span class="bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-primary animate-gradient">Posts</span>
        </h1>
        <p class="text-slate-600 dark:text-white/60 text-lg">
          Aprove, oculte, remova e gerencie posts da comunidade
        </p>
      </div>

      <!-- Stats -->
      <PostStats :stats="postStats" />

      <!-- Actions -->
      <div class="flex justify-end mb-4">
        <button
          @click="showCreateModal = true"
          class="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-secondary text-black font-bold rounded-lg hover:shadow-lg hover:shadow-primary/30 transition-all"
        >
          <span class="material-symbols-outlined">add</span>
          <span class="hidden sm:inline">Novo Post</span>
        </button>
      </div>

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

      <!-- Create Post Modal -->
      <Modal
        v-model="showCreateModal"
        title="Criar Novo Post"
        size="lg"
      >
        <form @submit.prevent="handleCreatePost" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-white mb-2">Tipo *</label>
            <select
              v-model="newPostData.tipo"
              required
              class="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0a040f] p-3 text-slate-900 dark:text-white focus:border-secondary focus:ring-1 focus:ring-secondary focus:shadow-[0_0_15px_rgba(0,243,255,0.3)] outline-none transition-all"
            >
              <option value="">Selecione...</option>
              <option value="networking">Networking</option>
              <option value="ofereco_servico">Ofereço Serviço</option>
              <option value="procuro_ajuda">Procuro Ajuda</option>
              <option value="oportunidade">Oportunidade</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-white mb-2">Conteúdo *</label>
            <textarea
              v-model="newPostData.conteudo"
              rows="6"
              required
              class="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0a040f] p-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-secondary focus:ring-1 focus:ring-secondary focus:shadow-[0_0_15px_rgba(0,243,255,0.3)] outline-none transition-all"
              placeholder="Escreva o conteúdo do post..."
            ></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium text-white mb-2">Imagem (Opcional)</label>
            
            <!-- Preview da imagem -->
            <div v-if="imagePreview" class="mb-3 relative">
              <img
                :src="imagePreview"
                alt="Preview"
                class="w-full h-48 object-cover rounded-lg border border-slate-200 dark:border-white/10"
              />
              <button
                type="button"
                @click="removeImage"
                class="absolute top-2 right-2 p-2 bg-red-500/80 hover:bg-red-500 rounded-full text-white transition-all"
              >
                <span class="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            <!-- Input de arquivo -->
            <label
              v-if="!imagePreview"
              class="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 dark:border-white/20 rounded-lg cursor-pointer bg-slate-50 dark:bg-[#0a040f] hover:bg-slate-100 dark:hover:bg-surface-highlight hover:border-secondary transition-all"
            >
              <div class="flex flex-col items-center justify-center pt-5 pb-6">
                <span class="material-symbols-outlined text-4xl text-slate-500 dark:text-white/60 mb-2">cloud_upload</span>
                <p class="mb-2 text-sm text-slate-600 dark:text-white/60">
                  <span class="font-semibold">Clique para fazer upload</span> ou arraste e solte
                </p>
                <p class="text-xs text-slate-500 dark:text-white/40">PNG, JPG ou WEBP (máx. 20MB)</p>
              </div>
              <input
                type="file"
                accept="image/*"
                class="hidden"
                @change="handleImageSelect"
              />
            </label>
          </div>

          <div>
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                v-model="newPostData.status"
                type="checkbox"
                :true-value="'approved'"
                :false-value="'pending'"
                class="w-4 h-4 rounded border-slate-300 dark:border-white/10 bg-white dark:bg-[#0a040f] text-primary focus:ring-primary"
              />
              <span class="text-sm text-slate-700 dark:text-white">Criar já aprovado</span>
            </label>
          </div>

          <div class="flex gap-3 pt-4">
            <button
              type="submit"
              :disabled="submitting"
              class="flex-1 px-4 py-2 bg-gradient-to-r from-primary to-secondary text-black font-bold rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
            >
              {{ submitting ? 'Criando...' : 'Criar Post' }}
            </button>
            <button
              type="button"
              @click="showCreateModal = false"
              class="px-4 py-2 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 rounded-lg text-slate-700 dark:text-white font-medium transition-all"
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
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/lib/supabase'
import AdminLayout from '@/components/layout/admin/AdminLayout.vue'
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
const authStore = useAuthStore()

const activeTab = ref<'pending' | 'all' | 'hidden' | 'removed' | 'spam'>('pending')
const showModerationModal = ref(false)
const showPostViewModal = ref(false)
const showCreateModal = ref(false)
const submitting = ref(false)
const selectedPost = ref<AdminPost | null>(null)
const viewedPost = ref<AdminPost | null>(null)

const newPostData = ref({
  conteudo: '',
  tipo: '',
  status: 'approved' as PostStatus,
  image_url: '',
})

const selectedImageFile = ref<File | null>(null)
const imagePreview = ref<string | null>(null)
const uploadingImage = ref(false)

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

function handleImageSelect(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return

  // Validar tipo de arquivo
  if (!file.type.startsWith('image/')) {
    toast.error('Por favor, selecione apenas arquivos de imagem')
    return
  }

  // Validar tamanho (máximo 20MB)
  if (file.size > 20 * 1024 * 1024) {
    toast.error('A imagem deve ter no máximo 20MB')
    return
  }

  selectedImageFile.value = file
  
  // Criar preview
  const reader = new FileReader()
  reader.onload = (e) => {
    imagePreview.value = e.target?.result as string
  }
  reader.readAsDataURL(file)
}

function removeImage() {
  selectedImageFile.value = null
  imagePreview.value = null
  newPostData.value.image_url = ''
}

async function uploadImage(): Promise<string | null> {
  if (!selectedImageFile.value || !authStore.user) return null

  uploadingImage.value = true
  try {
    const fileExt = selectedImageFile.value.name.split('.').pop()
    const fileName = `admin-${authStore.user.id}-${Date.now()}.${fileExt}`
    const filePath = `posts/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('post-images')
      .upload(filePath, selectedImageFile.value, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) throw uploadError

    // Obter URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('post-images')
      .getPublicUrl(filePath)

    return publicUrl
  } catch (err: any) {
    console.error('Error uploading image:', err)
    toast.error('Erro ao fazer upload da imagem. Tente novamente.')
    return null
  } finally {
    uploadingImage.value = false
  }
}

async function handleCreatePost() {
  try {
    submitting.value = true
    console.log('[AdminPosts] Iniciando criação de post...')

    // Upload da imagem se houver
    let imageUrl: string | null = null
    if (selectedImageFile.value) {
      console.log('[AdminPosts] Fazendo upload da imagem...')
      imageUrl = await uploadImage()
      if (!imageUrl) {
        console.error('[AdminPosts] Upload da imagem falhou')
        submitting.value = false
        return
      }
      console.log('[AdminPosts] Upload da imagem concluído:', imageUrl)
    } else if (newPostData.value.image_url) {
      // Se tiver URL manual, usar ela
      imageUrl = newPostData.value.image_url
    }

    console.log('[AdminPosts] Criando post no store...', {
      conteudo: newPostData.value.conteudo.substring(0, 50) + '...',
      tipo: newPostData.value.tipo,
      status: newPostData.value.status,
      hasImage: !!imageUrl
    })

    const createdPost = await adminStore.createPost({
      ...newPostData.value,
      image_url: imageUrl || undefined,
    })
    
    console.log('[AdminPosts] Post criado com sucesso:', createdPost?.id)
    
    toast.success('Post criado com sucesso!')
    showCreateModal.value = false
    
    // Reset form
    newPostData.value = {
      conteudo: '',
      tipo: '',
      status: 'approved',
      image_url: '',
    }
    selectedImageFile.value = null
    imagePreview.value = null
  } catch (error: any) {
    console.error('[AdminPosts] Erro ao criar post:', error)
    toast.error(error.message || 'Erro ao criar post')
  } finally {
    submitting.value = false
    console.log('[AdminPosts] Finalizando criação de post')
  }
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

