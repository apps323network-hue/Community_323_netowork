<template>
  <HomeLayout>
    <div class="space-y-8 w-full">
      <!-- Post Form -->
      <PostForm @post-created="handlePostCreated" @event-created="handleEventCreated" />

      <!-- Featured Event Card -->
      <EventCard
        v-if="featuredEvent"
        :event="featuredEvent"
        @click="handleEventClick"
      />


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
        :title="t('posts.noPostsYet')"
        :description="t('posts.beTheFirst')"
        icon="chat_bubble_outline"
      />

      <!-- Posts List -->
      <div v-else class="space-y-8">
        <PostCard
          v-for="post in posts"
          :key="post.id"
          :post="post"
          :show-comments="expandedComments.has(post.id)"
          @toggle-comments="handleToggleComments"
          @share="handleShare"
          @delete-comment="handleDeleteComment"
          @delete-post="handleDeletePost"
        >
          <template #comment-form>
            <CommentForm :post-id="post.id" @comment-added="handleCommentAdded(post.id)" />
          </template>
        </PostCard>

        <!-- Load More -->
        <div v-if="hasMore" ref="loadMoreRef" class="flex justify-center py-4">
          <Button
            v-if="!loading"
            variant="outline"
            @click="loadMore"
          >
            {{ t('common.loadMore') }}
          </Button>
          <div v-else class="text-slate-400 text-sm">{{ t('common.loading') }}</div>
        </div>
      </div>
    </div>
  </HomeLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { usePosts } from '@/composables/usePosts'
import { useEvents } from '@/composables/useEvents'
import HomeLayout from '@/components/layout/HomeLayout.vue'
import PostForm from '@/components/features/feed/PostForm.vue'
import PostCard from '@/components/features/feed/PostCard.vue'
import CommentForm from '@/components/features/feed/CommentForm.vue'
import EventCard from '@/components/features/events/EventCard.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import Button from '@/components/ui/Button.vue'
import { toast } from 'vue-sonner'
import type { PostFilters as PostFiltersType } from '@/types/posts'

const {
  posts,
  loading,
  hasMore,
  loadPosts,
  loadMorePosts,
  removeComment,
} = usePosts()

const { featuredEvent, loadFeaturedEvent: fetchFeaturedEvent } = useEvents()

const router = useRouter()
const { t } = useI18n()
const expandedComments = ref(new Set<string>())
const loadMoreRef = ref<HTMLElement | null>(null)
const filters = ref<PostFiltersType>({ sortBy: 'recent' })

async function handlePostCreated() {
  // Reload posts to show the new one
  await loadPosts(filters.value, true)
}

// Listener para quando um post é removido (via report)
function handlePostRemoved(event: CustomEvent) {
  const { itemId, itemType } = event.detail
  
  if (itemType === 'post') {
    // Remover post do cache local
    const postIndex = posts.value.findIndex(p => p.id === itemId)
    if (postIndex !== -1) {
      posts.value.splice(postIndex, 1)
    }
  } else if (itemType === 'comment') {
    // Remover comentário do cache local de todos os posts
    posts.value.forEach(post => {
      if (post.comments) {
        const commentIndex = post.comments.findIndex(c => c.id === itemId)
        if (commentIndex !== -1) {
          post.comments.splice(commentIndex, 1)
          post.comments_count = (post.comments_count || 1) - 1
        }
      }
    })
  }
  
  // Recarregar posts para garantir sincronização
  loadPosts(filters.value, true)
}

async function handleEventCreated() {
  // Evento criado - já foi criado um post sobre ele
  // Recarregar eventos em destaque usando a store que prioriza destaque = true
  await fetchFeaturedEvent()
}


function handleEventClick(eventId: string) {
  router.push(`/eventos/${eventId}`)
}

async function handleToggleComments(postId: string) {
  if (expandedComments.value.has(postId)) {
    expandedComments.value.delete(postId)
  } else {
    expandedComments.value.add(postId)
    // Load comments if not already loaded
    const post = posts.value.find(p => p.id === postId)
    if (post && !post.comments) {
      const { loadComments } = usePosts()
      try {
        await loadComments(postId)
      } catch (error) {
        console.error('Error loading comments:', error)
      }
    }
  }
}

async function handleShare(postId: string) {
  const url = `${window.location.origin}/?post=${postId}`
  
  try {
    if (navigator.share) {
      // Use Web Share API if available
      await navigator.share({
        title: '323 Network - Post',
        text: 'Confira este post na 323 Network',
        url: url,
      })
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(url)
      toast.success(t('posts.linkCopied'))
    }
  } catch (error: any) {
    // User cancelled or error occurred
    if (error.name !== 'AbortError') {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(url)
        toast.success(t('posts.linkCopied'))
      } catch (clipboardError) {
        console.error('Error copying to clipboard:', clipboardError)
      }
    }
  }
}


async function handleDeleteComment(commentId: string) {
  try {
    await removeComment(commentId)
    toast.success(t('posts.deletePost'))
  } catch (error) {
    console.error('Error deleting comment:', error)
    toast.error(t('errors.genericError'))
  }
}

async function handleCommentAdded(postId: string) {
  // Reload comments for this post
  const { loadComments } = usePosts()
  await loadComments(postId)
}

async function handleDeletePost() {
  // Post já foi deletado no store, apenas recarregar a lista
  await loadPosts(filters.value, true)
}

async function loadMore() {
  if (!loading.value && hasMore.value) {
    await loadMorePosts(filters.value)
  }
}


// Infinite scroll setup
let observer: IntersectionObserver | null = null

onMounted(async () => {
  await loadPosts(filters.value, true)
  await fetchFeaturedEvent()

  // Listener para posts removidos via reports
  window.addEventListener('post-removed', handlePostRemoved as EventListener)

  // Setup intersection observer for infinite scroll
  if (loadMoreRef.value) {
    observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore.value && !loading.value) {
          loadMore()
        }
      },
      { threshold: 0.1 }
    )
    observer.observe(loadMoreRef.value)
  }
})

onUnmounted(() => {
  if (observer && loadMoreRef.value) {
    observer.unobserve(loadMoreRef.value)
    observer.disconnect()
  }
  
  // Remover listener
  window.removeEventListener('post-removed', handlePostRemoved as EventListener)
})
</script>
