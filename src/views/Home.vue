<template>
  <HomeLayout>
    <div class="space-y-8 w-full">
      <!-- Post Form (only for authenticated users) -->
      <PostForm v-if="isAuthenticated" @post-created="handlePostCreated" @event-created="handleEventCreated" />
      
      <!-- Guest Banner -->
      <div v-else class="bg-gradient-to-r from-secondary/10 to-primary/10 border border-secondary/20 dark:border-white/5 rounded-2xl p-8 text-center shadow-premium dark:shadow-none">
        <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-2">{{ t('home.guestBannerTitle') }}</h3>
        <p class="text-slate-600 dark:text-gray-300 mb-6 font-medium">{{ t('home.guestBannerDescription') }}</p>
        <button 
          @click="showAuthModal('signup')"
          class="px-8 py-3 bg-gradient-to-r from-secondary to-primary text-white font-black rounded-xl hover:shadow-lg transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-2 mx-auto"
        >
          {{ t('auth.register') || 'Criar Conta Grátis' }}
          <span class="material-icons-outlined text-sm">arrow_forward</span>
        </button>
      </div>

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
      <div v-else class="space-y-8 relative">
        <PostCard
          v-for="post in displayPosts"
          :key="post.id"
          :post="post"
          :show-comments="expandedComments.has(post.id)"
          @toggle-comments="handleToggleComments"
          @delete-comment="handleDeleteComment"
          @delete-post="handleDeletePost"
        >
          <template #comment-form>
            <CommentForm v-if="isAuthenticated" :post-id="post.id" @comment-added="handleCommentAdded(post.id)" />
          </template>
        </PostCard>
        
        <!-- Guest Blocker -->
        <div 
          v-if="!isAuthenticated && posts.length > guestLimit"
          class="relative mt-4"
        >
          <!-- Fade out overlay on the last post area -->
          <div class="absolute -top-64 left-0 right-0 h-64 bg-gradient-to-t from-background-dark via-background-dark/80 to-transparent pointer-events-none z-10"></div>
          
          <GuestBlocker
            :show="true"
            variant="inline"
            :title="t('home.moreContentTitle')"
            :message="t('home.moreContentMessage')"
            :cta="t('common.guestBlocker.cta')"
          />
        </div>

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
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { usePosts } from '@/composables/usePosts'
import { useEvents } from '@/composables/useEvents'
import { usePublicAccess } from '@/composables/usePublicAccess'
import HomeLayout from '@/components/layout/HomeLayout.vue'
import PostForm from '@/components/features/feed/PostForm.vue'
import PostCard from '@/components/features/feed/PostCard.vue'
import CommentForm from '@/components/features/feed/CommentForm.vue'
import EventCard from '@/components/features/events/EventCard.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import Button from '@/components/ui/Button.vue'
import GuestBlocker from '@/components/common/GuestBlocker.vue'
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
const { isAuthenticated, showAuthModal, getContentLimit } = usePublicAccess()

const router = useRouter()
const { t } = useI18n()
const expandedComments = ref(new Set<string>())
const loadMoreRef = ref<HTMLElement | null>(null)
const filters = ref<PostFiltersType>({ sortBy: 'recent' })

const guestLimit = getContentLimit('feed')
const displayPosts = computed(() => {
  if (isAuthenticated.value) {
    return posts.value
  }
  return posts.value.slice(0, guestLimit)
})

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
