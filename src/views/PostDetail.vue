<template>
  <HomeLayout>
    <div class="space-y-8 w-full">
      <!-- Back Button -->
      <button
        @click="$router.push('/')"
        class="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-secondary transition-colors mb-4"
      >
        <span class="material-icons-outlined">arrow_back</span>
        <span>{{ t('common.back') }}</span>
      </button>

      <!-- Loading State -->
      <div v-if="loading" class="space-y-4">
        <div class="bg-white dark:bg-surface-dark rounded-xl p-6 animate-pulse border border-slate-200 dark:border-white/10">
          <div class="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
          <div class="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="p-6 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
        <p class="text-red-800 dark:text-red-200">{{ error }}</p>
      </div>

      <!-- Post Not Found -->
      <EmptyState
        v-else-if="!post"
        :title="t('posts.postNotFound')"
        :description="t('posts.postNotFoundDesc')"
        icon="article"
      />

      <!-- Post Card -->
      <PostCard
        v-else
        :post="post"
        :show-comments="true"
        @toggle-comments="handleToggleComments"
        @delete-comment="handleDeleteComment"
        @delete-post="handleDeletePost"
      >
        <template #comment-form>
          <CommentForm :post-id="post.id" @comment-added="handleCommentAdded" />
        </template>
      </PostCard>
    </div>
  </HomeLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { usePosts } from '@/composables/usePosts'
import HomeLayout from '@/components/layout/HomeLayout.vue'
import PostCard from '@/components/features/feed/PostCard.vue'
import CommentForm from '@/components/features/feed/CommentForm.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import { toast } from 'vue-sonner'
import type { Post } from '@/types/posts'
import { useDynamicMeta } from '@/composables/useDynamicMeta'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const { getPostById, loadComments, removeComment } = usePosts()

const post = ref<Post | null>(null)

// SEO
useDynamicMeta(() => ({
  title: post.value?.conteudo?.substring(0, 50) || t('navigation.home'),
  description: post.value?.conteudo?.substring(0, 160) || '',
  image: post.value?.image_url,
  url: `/feed/${post.value?.id}`,
  type: 'article'
}))
const loading = ref(false)
const error = ref<string | null>(null)

async function loadPost() {
  const postId = route.params.postId as string
  if (!postId) {
    error.value = t('posts.postNotFound')
    return
  }

  loading.value = true
  error.value = null

  try {
    const postData = await getPostById(postId)
    if (postData) {
      post.value = postData
      // Load comments
      await loadComments(postId)
    } else {
      error.value = t('posts.postNotFound')
    }
  } catch (err: any) {
    error.value = err.message || t('posts.loadPostError') || 'Erro ao carregar post'
    console.error('Error loading post:', err)
  } finally {
    loading.value = false
  }
}

async function handleToggleComments() {
  // Comments are always shown on detail page
}


async function handleDeleteComment(commentId: string) {
  try {
    await removeComment(commentId)
    toast.success(t('posts.commentDeleted') || 'Comentário deletado')
    // Reload post to refresh comments
    await loadPost()
  } catch (error) {
    console.error('Error deleting comment:', error)
    toast.error(t('errors.genericError') || 'Erro ao deletar comentário')
  }
}

async function handleCommentAdded() {
  // Reload post to refresh comments
  await loadPost()
}

async function handleDeletePost() {
  router.push('/')
}

onMounted(async () => {
  await loadPost()
})
</script>

