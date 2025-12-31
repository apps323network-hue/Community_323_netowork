<template>
  <HomeLayout>
    <div class="space-y-8 w-full">
      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-slate-900 dark:text-white text-4xl lg:text-5xl font-black mb-3">
          #<span class="bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-primary animate-gradient">{{ hashtag }}</span>
        </h1>
        <p class="text-slate-600 dark:text-white/60 text-lg">
          {{ posts.length }} {{ posts.length === 1 ? 'post encontrado' : 'posts encontrados' }}
        </p>
      </div>

      <!-- Loading State -->
      <div v-if="loading && posts.length === 0" class="space-y-4">
        <div v-for="i in 3" :key="i" class="bg-white dark:bg-surface-dark rounded-xl p-6 animate-pulse border border-slate-200 dark:border-white/10">
          <div class="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
          <div class="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>

      <!-- Empty State -->
      <EmptyState
        v-else-if="!loading && posts.length === 0"
        :title="t('posts.noPostsWithHashtag', { hashtag: `#${hashtag}` })"
        :description="t('posts.tryAnotherHashtag')"
        icon="tag"
      />

      <!-- Posts List -->
      <div v-else class="space-y-8">
        <PostCard
          v-for="post in posts"
          :key="post.id"
          :post="post"
          :show-comments="expandedComments.has(post.id)"
          @toggle-comments="handleToggleComments"
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
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useHashtags } from '@/composables/useHashtags'
import { usePosts } from '@/composables/usePosts'
import HomeLayout from '@/components/layout/HomeLayout.vue'
import PostCard from '@/components/features/feed/PostCard.vue'
import CommentForm from '@/components/features/feed/CommentForm.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import { toast } from 'vue-sonner'

const route = useRoute()
const { t } = useI18n()
const { searchPostsByHashtag } = useHashtags()
const { loadComments, removeComment } = usePosts()

const hashtag = ref('')
const posts = ref<any[]>([])
const loading = ref(false)
const expandedComments = ref(new Set<string>())

async function loadHashtagPosts() {
  const hashtagParam = route.params.hashtag as string
  if (!hashtagParam) return

  hashtag.value = hashtagParam.replace('#', '')
  loading.value = true

  try {
    const hashtagPosts = await searchPostsByHashtag(hashtag.value)
    
    // Transform posts to match Post interface (similar to PostStore)
    // For now, we'll use the raw data and let PostCard handle it
    posts.value = hashtagPosts
  } catch (error) {
    console.error('Error loading hashtag posts:', error)
    toast.error(t('posts.loadHashtagPostsError') || 'Erro ao carregar posts')
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
    toast.success(t('posts.commentDeleted') || 'Comentário deletado')
  } catch (error) {
    console.error('Error deleting comment:', error)
    toast.error(t('errors.genericError') || 'Erro ao deletar comentário')
  }
}

async function handleCommentAdded(postId: string) {
  try {
    await loadComments(postId)
  } catch (error) {
    console.error('Error loading comments:', error)
  }
}

async function handleDeletePost() {
  await loadHashtagPosts()
}

onMounted(async () => {
  await loadHashtagPosts()
})
</script>

