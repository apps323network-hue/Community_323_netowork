<template>
  <HomeLayout>
    <div class="space-y-8 w-full">
      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-slate-900 dark:text-white text-4xl lg:text-5xl font-black mb-3">
          Posts <span class="bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-primary animate-gradient">Salvos</span>
        </h1>
        <p class="text-slate-600 dark:text-white/60 text-lg">
          Seus posts favoritos em um só lugar
        </p>
      </div>

      <!-- Loading State - Skeleton -->
      <div v-if="loading" class="space-y-8">
        <div v-for="i in 3" :key="i" class="bg-white dark:bg-surface-dark rounded-xl overflow-hidden shadow-sm border border-slate-200 dark:border-white/10 animate-pulse">
          <!-- Header Skeleton -->
          <div class="p-6 border-b border-slate-200 dark:border-gray-800">
            <div class="flex gap-3">
              <div class="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-700 flex-shrink-0"></div>
              <div class="flex-1">
                <div class="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
                <div class="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
              </div>
              <div class="w-6 h-6 rounded bg-gray-300 dark:bg-gray-700"></div>
            </div>
          </div>
          
          <!-- Content Skeleton -->
          <div class="px-6 py-5">
            <div class="space-y-2">
              <div class="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
              <div class="h-4 bg-gray-300 dark:bg-gray-700 rounded w-5/6"></div>
              <div class="h-4 bg-gray-300 dark:bg-gray-700 rounded w-4/6"></div>
            </div>
          </div>
          
          <!-- Actions Skeleton -->
          <div class="px-6 py-4 border-t border-slate-200 dark:border-gray-800 flex items-center justify-between">
            <div class="flex gap-6">
              <div class="flex items-center gap-2">
                <div class="w-5 h-5 rounded bg-gray-300 dark:bg-gray-700"></div>
                <div class="h-4 w-8 bg-gray-300 dark:bg-gray-700 rounded"></div>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-5 h-5 rounded bg-gray-300 dark:bg-gray-700"></div>
                <div class="h-4 w-8 bg-gray-300 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
            <div class="flex gap-3">
              <div class="w-5 h-5 rounded bg-gray-300 dark:bg-gray-700"></div>
              <div class="w-5 h-5 rounded bg-gray-300 dark:bg-gray-700"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <EmptyState
        v-if="!loading && posts.length === 0"
        :title="t('posts.noSavedPosts')"
        :description="t('posts.startSavingPosts')"
        icon="bookmark_border"
      />

      <!-- Posts List -->
      <div v-if="!loading && posts.length > 0" class="space-y-8">
        <PostCard
          v-for="post in posts"
          :key="post.id"
          :post="post"
          :show-comments="expandedComments.has(post.id)"
          @toggle-comments="handleToggleComments"
          @like-toggled="handleLikeToggled"
          @delete-comment="handleDeleteComment"
          @delete-post="handleDeletePost"
        >
          <template #comment-form>
            <CommentForm :post-id="post.id" @comment-added="handleCommentAdded(post.id)" />
          </template>
        </PostCard>
      </div>
    </div>
  </HomeLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePostStore } from '@/stores/posts'
import { usePosts } from '@/composables/usePosts'
import HomeLayout from '@/components/layout/HomeLayout.vue'
import PostCard from '@/components/features/feed/PostCard.vue'
import CommentForm from '@/components/features/feed/CommentForm.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import { toast } from 'vue-sonner'
import type { Post } from '@/types/posts'

const postStore = usePostStore()
const { loadComments, removeComment } = usePosts()
const { t } = useI18n()

const posts = ref<Post[]>([]) // Inicializar vazio para não mostrar posts do feed
const loading = ref(true) // Começar como true para mostrar skeleton imediatamente
const expandedComments = ref(new Set<string>())

// Sincronizar posts locais com o postStore quando houver mudanças
// Usar watch para manter os posts sincronizados como fallback
watch(
  () => postStore.posts,
  (storePosts) => {
    // Atualizar apenas os posts que já estão na lista local
    posts.value.forEach((localPost, index) => {
      const updatedPost = storePosts.find(p => p.id === localPost.id)
      if (updatedPost) {
        // Comparar se houve mudanças significativas antes de atualizar
        const hasChanges = 
          updatedPost.isLiked !== localPost.isLiked ||
          updatedPost.likes_count !== localPost.likes_count ||
          updatedPost.comments_count !== localPost.comments_count ||
          (updatedPost.comments?.length || 0) !== (localPost.comments?.length || 0)
        
        if (hasChanges) {
          // Preservar o estado de comentários expandidos
          const wasExpanded = expandedComments.value.has(localPost.id)
          posts.value[index] = { ...updatedPost }
          if (wasExpanded && !expandedComments.value.has(localPost.id)) {
            expandedComments.value.add(localPost.id)
          }
        }
      }
    })
  },
  { deep: true }
)

async function loadSavedPosts() {
  loading.value = true
  try {
    const savedPosts = await postStore.fetchBookmarkedPosts()
    posts.value = savedPosts
  } catch (error) {
    console.error('Error loading saved posts:', error)
    toast.error(t('posts.loadSavedPostsError') || 'Erro ao carregar posts salvos')
  } finally {
    loading.value = false
  }
}

async function handleToggleComments(postId: string) {
  if (expandedComments.value.has(postId)) {
    expandedComments.value.delete(postId)
  } else {
    expandedComments.value.add(postId)
    const post = posts.value.find(p => p.id === postId)
    if (post && !post.comments) {
      try {
        await loadComments(postId)
      } catch (error) {
        console.error('Error loading comments:', error)
      }
    }
  }
}


async function handleDeleteComment(commentId: string) {
  try {
    await removeComment(commentId)
    
    // Encontrar o post que contém o comentário deletado
    const postWithComment = posts.value.find(p => p.comments?.some(c => c.id === commentId))
    if (postWithComment) {
      // Atualizar o post local com os dados atualizados do store
      const updatedPost = postStore.posts.find(p => p.id === postWithComment.id)
      if (updatedPost) {
        const localIndex = posts.value.findIndex(p => p.id === postWithComment.id)
        if (localIndex !== -1) {
          posts.value[localIndex] = { ...updatedPost }
        }
      }
    }
    
    toast.success(t('posts.commentDeleted') || 'Comentário deletado')
  } catch (error) {
    console.error('Error deleting comment:', error)
    toast.error(t('errors.genericError') || 'Erro ao deletar comentário')
  }
}

async function handleCommentAdded(postId: string) {
  try {
    // O addComment já atualiza o post no store, então só precisamos sincronizar
    // Aguardar um pouco para garantir que o store foi atualizado
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // Atualizar o post local com os dados atualizados do store
    const updatedPost = postStore.posts.find(p => p.id === postId)
    if (updatedPost) {
      const localIndex = posts.value.findIndex(p => p.id === postId)
      if (localIndex !== -1) {
        // Preservar o estado de comentários expandidos
        const wasExpanded = expandedComments.value.has(postId)
        posts.value[localIndex] = { ...updatedPost }
        // Recarregar comentários se estavam expandidos
        if (wasExpanded) {
          await loadComments(postId)
        }
      }
    }
  } catch (error) {
    console.error('Error handling comment added:', error)
  }
}

async function handleLikeToggled(postId: string) {
  // Atualizar o post local com os dados atualizados do store
  const updatedPost = postStore.posts.find(p => p.id === postId)
  if (updatedPost) {
    const localIndex = posts.value.findIndex(p => p.id === postId)
    if (localIndex !== -1) {
      posts.value[localIndex] = { ...updatedPost }
    }
  }
}

async function handleDeletePost() {
  await loadSavedPosts()
}

onMounted(async () => {
  await loadSavedPosts()
})
</script>

