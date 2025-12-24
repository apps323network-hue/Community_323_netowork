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
        @deleted="handleEventDeleted"
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
        title="Nenhum post ainda"
        description="Seja o primeiro a compartilhar algo na comunidade!"
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
          @edit-comment="handleEditComment"
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
            Carregar mais
          </Button>
          <div v-else class="text-slate-400 text-sm">Carregando...</div>
        </div>
      </div>
    </div>
  </HomeLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePosts } from '@/composables/usePosts'
import { supabase } from '@/lib/supabase'
import HomeLayout from '@/components/layout/HomeLayout.vue'
import PostForm from '@/components/features/feed/PostForm.vue'
import PostCard from '@/components/features/feed/PostCard.vue'
import CommentForm from '@/components/features/feed/CommentForm.vue'
import EventCard from '@/components/features/events/EventCard.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import Button from '@/components/ui/Button.vue'
import type { PostFilters as PostFiltersType } from '@/types/posts'

const {
  posts,
  loading,
  hasMore,
  loadPosts,
  loadMorePosts,
  removeComment,
} = usePosts()

const router = useRouter()
const expandedComments = ref(new Set<string>())
const loadMoreRef = ref<HTMLElement | null>(null)
const filters = ref<PostFiltersType>({ sortBy: 'recent' })
const featuredEvent = ref<any>(null)

async function handlePostCreated() {
  // Reload posts to show the new one
  await loadPosts(filters.value, true)
}

async function handleEventCreated() {
  // Evento criado - já foi criado um post sobre ele
  // Recarregar eventos em destaque
  await loadFeaturedEvent()
}

async function loadFeaturedEvent() {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('id, titulo, descricao, data_hora, tipo, local, image_url, created_by')
      .gte('data_hora', new Date().toISOString())
      .order('data_hora', { ascending: true })
      .limit(1)
      .maybeSingle()

    if (error) throw error
    
    if (data) {
      featuredEvent.value = data
    } else {
      featuredEvent.value = null
    }
  } catch (error) {
    console.error('Error loading featured event:', error)
    featuredEvent.value = null
  }
}

function handleEventClick(eventId: string) {
  router.push(`/eventos/${eventId}`)
}

async function handleEventDeleted() {
  // Recarregar eventos em destaque
  await loadFeaturedEvent()
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
      alert('Link copiado para a área de transferência!')
    }
  } catch (error: any) {
    // User cancelled or error occurred
    if (error.name !== 'AbortError') {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(url)
        alert('Link copiado para a área de transferência!')
      } catch (clipboardError) {
        console.error('Error copying to clipboard:', clipboardError)
      }
    }
  }
}

async function handleEditComment(commentId: string) {
  // TODO: Implement edit comment modal/form
  console.log('Edit comment:', commentId)
}

async function handleDeleteComment(commentId: string) {
  if (confirm('Tem certeza que deseja deletar este comentário?')) {
    try {
      await removeComment(commentId)
    } catch (error) {
      console.error('Error deleting comment:', error)
    }
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
  await loadFeaturedEvent()

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
})
</script>
