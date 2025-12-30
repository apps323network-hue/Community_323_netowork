<template>
  <Card variant="white" class="p-0 overflow-hidden shadow-sm hover:shadow-lg transition-shadow dark:bg-surface-dark dark:border-gray-800">
    <!-- Pinned Badge -->
    <div v-if="post.fixado" class="px-5 pt-4 pb-2">
      <Badge variant="primary" size="sm">
        <span class="material-icons-outlined text-[14px] mr-1">push_pin</span>
        Fixado
      </Badge>
    </div>

    <!-- Post Header -->
    <div class="p-6 dark:p-6 flex justify-between items-start border-b border-slate-200 dark:border-gray-800">
      <div class="flex gap-3">

        <RouterLink :to="`/comunidade/${post.user_id}`" class="relative group no-underline">
          <div class="absolute -inset-0.5 bg-gradient-to-b from-primary to-purple-600 rounded-full blur opacity-50 group-hover:opacity-100 transition-opacity"></div>
          <Avatar
            :src="authorAvatar"
            :name="authorName"
            size="md"
            class="relative border-2 border-white"
          />
        </RouterLink>
        <div>
          <div class="flex items-center gap-2">
            <RouterLink :to="`/comunidade/${post.user_id}`" class="author-link" style="text-decoration: none !important;">
              <h4 class="font-bold text-base text-gray-900 dark:text-white hover:text-primary dark:hover:text-secondary transition-colors">
                {{ authorName }}
              </h4>
            </RouterLink>
            <!-- Badge de post pendente (apenas para o próprio usuário) -->
            <Badge 
              v-if="isPendingPost" 
              variant="warning" 
              size="sm"
            >
              <span class="material-icons-outlined text-[10px] mr-1">schedule</span>
              Pendente
            </Badge>
          </div>
          <p class="text-xs text-gray-400">
            {{ authorRole }} • <span class="text-secondary">{{ formatTime(post.created_at) }}</span>
          </p>
        </div>
      </div>
      <div class="relative" ref="menuContainer">
        <button 
          class="text-gray-500 dark:text-gray-400 hover:text-white transition-colors"
          @click.stop="showMenu = !showMenu"
        >
          <span class="material-icons-outlined">more_horiz</span>
        </button>
        <!-- Dropdown Menu -->
        <Transition
          enter-active-class="transition-all duration-200"
          enter-from-class="opacity-0 scale-95 translate-y-2"
          enter-to-class="opacity-100 scale-100 translate-y-0"
          leave-active-class="transition-all duration-200"
          leave-from-class="opacity-100 scale-100 translate-y-0"
          leave-to-class="opacity-0 scale-95 translate-y-2"
        >
          <div
            v-if="showMenu"
            class="absolute right-0 mt-2 w-48 rounded-xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 shadow-2xl z-50 overflow-hidden"
            @click.stop
          >
            <!-- Botão Deletar (apenas para posts próprios) -->
            <button
              v-if="isOwnPost"
              class="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors text-left"
              @click="handleDelete"
            >
              <span class="material-icons-outlined text-[20px]">delete</span>
              {{ t('posts.deletePost') }}
            </button>
            <!-- Botão Reportar (apenas para posts de outros usuários) -->
            <button
              v-if="!isOwnPost"
              class="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-500/10 transition-colors text-left"
              @click="handleReport"
            >
              <span class="material-icons-outlined text-[20px]">report</span>
              {{ t('posts.report') }}
            </button>
          </div>
        </Transition>
      </div>
    </div>

    <!-- Post Content -->
    <div class="px-6 py-5 md:px-8 md:py-6">
      <p class="text-base md:text-lg text-gray-900 dark:text-gray-300 leading-relaxed whitespace-pre-line">
        {{ post.conteudo }}
      </p>
      <div v-if="hashtags.length" class="mt-4 flex flex-wrap gap-2">
        <span
          v-for="tag in hashtags"
          :key="tag"
          class="text-secondary hover:text-primary transition-colors cursor-pointer font-medium text-sm md:text-base"
        >
          {{ tag }}
        </span>
      </div>
    </div>

    <!-- Post Image -->
    <div
      v-if="post.image_url"
      class="mt-2 relative bg-gray-900 group overflow-hidden rounded-xl cursor-pointer"
      @click="showImageLightbox = true"
    >
      <img
        :alt="'Imagem do post'"
        :src="post.image_url"
        class="w-full h-auto max-h-[600px] md:max-h-[700px] object-contain bg-gray-50 dark:bg-gray-900 transition-transform duration-500 group-hover:scale-[1.02]"
      />
      <div class="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors pointer-events-none"></div>
      <!-- Zoom Icon Overlay -->
      <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <div class="bg-black/60 backdrop-blur-sm rounded-full p-4 shadow-xl">
          <span class="material-symbols-outlined text-white text-3xl">zoom_in</span>
        </div>
      </div>
    </div>

    <!-- Image Lightbox -->
    <ImageLightbox
      v-model="showImageLightbox"
      :image-url="post.image_url"
      :alt="`Imagem do post de ${authorName}`"
    />

    <!-- Post Actions -->
    <div class="px-6 py-4 border-t border-slate-200 dark:border-gray-800 flex justify-between items-center text-gray-400">
      <div class="flex gap-6">
        <button
          class="flex items-center gap-2 text-sm hover:text-primary dark:hover:text-secondary transition-all group"
          :class="post.isLiked ? 'text-primary dark:text-secondary' : ''"
          @click="handleToggleLike"
        >
          <span class="material-icons-outlined group-hover:scale-110 transition-transform">
            {{ post.isLiked ? 'favorite' : 'favorite_border' }}
          </span>
          <span class="font-medium">{{ post.likes_count || 0 }}</span>
        </button>
        <button
          class="flex items-center gap-2 text-sm hover:text-secondary transition-all group"
          @click="handleToggleComments"
        >
          <span class="material-icons-outlined group-hover:scale-110 transition-transform">chat_bubble_outline</span>
          <span class="font-medium">{{ post.comments_count || 0 }}</span>
        </button>
      </div>
      <button class="flex items-center gap-1.5 text-sm hover:text-white transition-colors" @click="$emit('share', post.id)">
        <span class="material-icons-outlined">share</span>
      </button>
    </div>

    <!-- Report Modal -->
    <ReportModal
      v-model="showReportModal"
      :item-type="'post'"
      :item-id="post.id"
      @reported="handleReportSubmitted"
    />

    <!-- Comments Section -->
    <div v-if="showCommentsSection" class="border-t border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-surface-lighter">
      <div v-if="post.comments && post.comments.length > 0" class="px-6 pt-4 pb-2">
        <PostComment
          v-for="comment in post.comments"
          :key="comment.id"
          :comment="comment"
          @edit="(id) => $emit('edit-comment', id)"
          @delete="(id) => $emit('delete-comment', id)"
        />
      </div>
      <slot name="comment-form" />
    </div>
  </Card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { usePosts } from '@/composables/usePosts'
import Card from '@/components/ui/Card.vue'
import Avatar from '@/components/ui/Avatar.vue'
import Badge from '@/components/ui/Badge.vue'
import PostComment from './PostComment.vue'
import ImageLightbox from '@/components/ui/ImageLightbox.vue'
import ReportModal from './ReportModal.vue'
import { toast } from 'vue-sonner'
import type { Post } from '@/types/posts'

const { t, locale } = useI18n()

interface Props {
  post: Post
  showComments?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showComments: false,
})

const emit = defineEmits<{
  'toggle-comments': [postId: string]
  'share': [postId: string]
  'edit-comment': [commentId: string]
  'delete-comment': [commentId: string]
  'delete-post': [postId: string]
}>()

const authStore = useAuthStore()
const { toggleLike, loadComments, deletePost } = usePosts()
const commentsLoaded = ref(false)
const showCommentsSection = ref(props.showComments)
const showMenu = ref(false)
const menuContainer = ref<HTMLElement | null>(null)
const showImageLightbox = ref(false)
const showReportModal = ref(false)

const isOwnPost = computed(() => {
  const userId = authStore.user?.id
  const postUserId = props.post.user_id
  
  // Garantir que ambos sejam strings e fazer comparação estrita
  const result = userId && postUserId && String(userId).trim() === String(postUserId).trim()
  
  // Debug temporário - remover depois
  if (showMenu.value) {
    console.log('[PostCard] Menu aberto - Debug:', {
      userId,
      postUserId,
      isOwnPost: result,
      shouldShowReport: !result,
      postId: props.post.id
    })
  }
  
  return result || false
})

// Debug: verificar status do post
const isPendingPost = computed(() => {
  const result = isOwnPost.value && props.post.status === 'pending'
  return result
})

// Computed for author display
const authorName = computed(() => props.post.author?.nome || 'Usuário')
const authorRole = computed(() => {
  const area = props.post.author?.area_atuacao
  return area && area.trim() ? area : 'Membro'
})
const authorAvatar = computed(() => props.post.author?.avatar_url || '')

// Extract hashtags from content
const hashtags = computed(() => {
  const matches = props.post.conteudo.match(/#\w+/g)
  return matches || []
})

async function handleToggleLike() {
  try {
    await toggleLike(props.post.id)
  } catch (error) {
    console.error('Error toggling like:', error)
  }
}

async function handleToggleComments() {
  showCommentsSection.value = !showCommentsSection.value
  
  if (showCommentsSection.value && !commentsLoaded.value && !props.post.comments) {
    try {
      await loadComments(props.post.id)
      commentsLoaded.value = true
    } catch (error) {
      console.error('Error loading comments:', error)
    }
  }
  
  emit('toggle-comments', props.post.id)
}

function formatTime(date: string) {
  const now = new Date()
  const postDate = new Date(date)
  const diffInSeconds = Math.floor((now.getTime() - postDate.getTime()) / 1000)

  if (diffInSeconds < 60) return t('common.now')
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}${t('common.minutesAgo')}`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}${t('common.hoursAgo')}`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}${t('common.daysAgo')}`
  return postDate.toLocaleDateString(locale.value)
}

async function handleDelete() {
  // Simplificando sem confirm por enquanto, como solicitado pelo usuário
  try {
    await deletePost(props.post.id)
    emit('delete-post', props.post.id)
    showMenu.value = false
    toast.success(t('posts.postDeleted'))
  } catch (error) {
    console.error('Error deleting post:', error)
    toast.error(t('posts.deletePostError'))
  }
}

function handleReport() {
  showReportModal.value = true
  showMenu.value = false
}

function handleReportSubmitted() {
  showReportModal.value = false
}

function handleClickOutside(event: MouseEvent) {
  if (menuContainer.value && !menuContainer.value.contains(event.target as Node)) {
    showMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.author-link, .author-link:hover, .author-link:focus, .author-link:active {
  text-decoration: none !important;
  border: none !important;
  outline: none !important;
}
</style>

