<template>
  <Card variant="white" class="p-4 md:p-5 overflow-hidden shadow-premium hover:shadow-premium-hover transition-all duration-300 dark:bg-surface-dark dark:border-white/5 rounded-2xl">
    <!-- Pinned Badge -->
    <div v-if="post.fixado" class="mb-2 flex items-center gap-2 ml-12">
      <span class="material-icons-outlined text-[14px] text-secondary">push_pin</span>
      <span class="text-xs font-semibold text-secondary uppercase tracking-wider">Fixado</span>
    </div>

    <!-- Layout em Grid: Avatar à esquerda, conteúdo à direita -->
    <div class="grid grid-cols-[auto_1fr] gap-3 md:gap-4">
      <!-- Coluna 1: Avatar -->
      <div class="flex-shrink-0">
        <RouterLink :to="`/comunidade/${post.user_id}`" class="relative group no-underline block">
          <div class="absolute -inset-0.5 bg-gradient-to-b from-primary to-purple-600 rounded-full blur opacity-10 group-hover:opacity-40 transition-opacity"></div>
          <Avatar
            :src="authorAvatar"
            :name="authorName"
            size="md"
            class="relative border-2 border-white dark:border-gray-800"
          />
        </RouterLink>
      </div>

      <!-- Coluna 2: Todo o conteúdo (nome, meta, post) -->
      <div class="min-w-0">
        <!-- Header: Nome e Menu -->
        <div class="flex justify-between items-start mb-2">
          <div class="flex-1 min-w-0">
            <div class="flex flex-wrap items-center gap-x-2 gap-y-0">
              <RouterLink :to="`/comunidade/${post.user_id}`" class="no-underline group/link">
                <h4 class="font-bold text-[15px] md:text-base text-gray-900 dark:text-white group-hover/link:text-primary transition-colors">
                  {{ authorName }}
                </h4>
              </RouterLink>
              
              <span class="text-gray-400 text-xs md:text-sm whitespace-nowrap">
                • {{ formatTime(post.created_at) }}
              </span>

              <!-- Badges compactas -->
              <div class="flex gap-1 items-center">
                <Badge v-if="isPendingPost" variant="warning" size="sm" class="scale-75 origin-left -ml-1">
                  Pendente
                </Badge>
                <Badge v-if="post.edited_at" variant="secondary" size="sm" class="scale-75 origin-left -ml-1">
                  Editado
                </Badge>
              </div>
            </div>
            
            <!-- Cargo / Área de atuação -->
            <p class="text-[11px] md:text-xs text-gray-500 dark:text-gray-400 leading-none mt-1 line-clamp-1">
              {{ authorRole }}
            </p>
          </div>

          <!-- Menu Dropdown -->
          <div class="relative ml-2" ref="menuContainer">
            <button 
              class="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-full transition-all"
              @click.stop="showMenu = !showMenu"
            >
              <span class="material-icons-outlined text-xl">more_horiz</span>
            </button>
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
                <button v-if="isOwnPost && canEditPost" class="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-primary dark:text-secondary hover:bg-primary/5 transition-colors text-left" @click="handleEdit">
                  <span class="material-icons-outlined text-[20px]">edit</span>
                  {{ t('posts.editPost') }}
                </button>
                <button v-if="isOwnPost" class="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors text-left" @click="handleDelete">
                  <span class="material-icons-outlined text-[20px]">delete</span>
                  {{ t('posts.deletePost') }}
                </button>
                <button v-if="!isOwnPost" class="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-500/10 transition-colors text-left" @click="handleReport">
                  <span class="material-icons-outlined text-[20px]">report</span>
                  {{ t('posts.report') }}
                </button>
              </div>
            </Transition>
          </div>
        </div>

        <!-- Conteúdo do Post (alinhado com o nome) -->
        <div class="pr-1">
      <div class="mt-1"> <!-- Espaçamento para respiro visual -->
        <div 
          class="text-sm md:text-[15px] text-gray-800 dark:text-gray-200 leading-normal rich-text-content"
          :class="{ 'line-clamp-content': !isExpanded && isLongPost }"
          v-html="sanitizedContent"
        ></div>

        <button
          v-if="isLongPost"
          @click="toggleExpanded"
          class="mt-2 text-sm font-bold text-primary dark:text-secondary hover:underline transition-colors inline-flex items-center gap-0.5"
        >
          {{ isExpanded ? t('posts.showLess') : t('posts.showMore') }}
          <span class="material-icons-outlined text-[16px]">
            {{ isExpanded ? 'expand_less' : 'expand_more' }}
          </span>
        </button>
        
        <!-- Hashtags -->
        <div v-if="hashtags.length" class="mt-3 flex flex-wrap gap-x-3 gap-y-1">
          <span
            v-for="tag in hashtags"
            :key="tag"
            class="text-primary hover:underline transition-colors cursor-pointer font-medium text-sm"
          >
            {{ tag }}
          </span>
        </div>

        <!-- Imagem do Post -->
        <div
          v-if="post.image_url"
          class="mt-3 relative bg-gray-100 dark:bg-gray-900 group overflow-hidden rounded-2xl cursor-pointer border dark:border-white/5"
          @click="showImageLightbox = true"
        >
          <img
            :alt="'Imagem do post'"
            :src="post.image_url"
            class="w-full h-auto object-contain transition-transform duration-500 group-hover:scale-[1.01]"
          />
          <div class="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors pointer-events-none"></div>
        </div>

        <!-- Ações do Post -->
        <!-- Ações do Post -->
        <div class="mt-3 -ml-2 flex justify-between items-center">
          <!-- Esquerda: Like e Comentários -->
          <div class="flex gap-1 md:gap-4">
            <!-- Like -->
            <button
              class="flex items-center gap-1.5 px-2 py-1.5 rounded-full text-sm transition-all group"
              :class="post.isLiked ? 'text-rose-500' : 'text-gray-500 dark:text-gray-400 hover:text-rose-500 hover:bg-rose-500/10'"
              @click="handleToggleLike"
            >
              <span class="material-icons-outlined text-[19px] group-hover:scale-110 transition-transform" :class="{ 'like-animate': post.isLiked }">
                {{ post.isLiked ? 'favorite' : 'favorite_border' }}
              </span>
              <span class="font-medium text-xs">{{ post.likes_count || 0 }}</span>
            </button>
            
            <!-- Comentários -->
            <button
              class="flex items-center gap-1.5 px-2 py-1.5 rounded-full text-sm text-gray-500 dark:text-gray-400 hover:text-blue-500 hover:bg-blue-500/10 transition-all group"
              @click="handleToggleComments"
            >
              <span class="material-icons-outlined text-[19px] group-hover:scale-110 transition-transform">chat_bubble_outline</span>
              <span class="font-medium text-xs">{{ post.comments_count || 0 }}</span>
            </button>
          </div>

          <!-- Direita: Compartilhar e Salvar -->
          <div class="flex gap-1 md:gap-2">
            <!-- Compartilhar -->
            <button
              class="flex items-center px-2 py-1.5 rounded-full text-sm text-gray-500 dark:text-gray-400 hover:text-green-500 hover:bg-green-500/10 transition-all group"
              @click="handleShare"
            >
              <span class="material-icons-outlined text-[19px] group-hover:scale-110 transition-transform">share</span>
            </button>
            
            <!-- Salvar -->
            <button
              class="flex items-center px-2 py-1.5 rounded-full text-sm transition-all group"
              :class="[
                post.isBookmarked ? 'text-primary dark:text-secondary' : 'text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-secondary hover:bg-primary/10 dark:hover:bg-secondary/10',
                { 'bookmark-animate': bookmarkAnimating }
              ]"
              @click="handleToggleBookmark"
            >
              <span class="material-icons-outlined text-[19px] group-hover:scale-110 transition-transform" :class="{ 'bookmark-icon-animate': bookmarkAnimating }">
                {{ post.isBookmarked ? 'bookmark' : 'bookmark_border' }}
              </span>
            </button>
          </div>
        </div>
        </div>
        </div>
      </div>
    </div>

    <!-- Modais -->
    <ImageLightbox v-model="showImageLightbox" :image-url="post.image_url" :alt="`Imagem do post de ${authorName}`" />
    <ReportModal v-model="showReportModal" :item-type="'post'" :item-id="post.id" @reported="handleReportSubmitted" />
    <EditPostModal v-model="showEditModal" :post="post" @saved="handleEditSaved" />

    <!-- Comments Section -->
    <div v-if="showCommentsSection" class="border-t border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-surface-lighter">
      <div v-if="post.comments && post.comments.length > 0" class="px-6 pt-4 pb-2">
        <PostComment
          v-for="comment in post.comments"
          :key="comment.id"
          :comment="comment"
          @delete="(id) => $emit('delete-comment', id)"
        />
      </div>
      <slot name="comment-form" />
    </div>
  </Card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import DOMPurify from 'dompurify'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { usePosts } from '@/composables/usePosts'
import { usePostBookmarks } from '@/composables/usePostBookmarks'
import { usePostStore } from '@/stores/posts'
import Card from '@/components/ui/Card.vue'
import Avatar from '@/components/ui/Avatar.vue'
import Badge from '@/components/ui/Badge.vue'
import PostComment from './PostComment.vue'
import ImageLightbox from '@/components/ui/ImageLightbox.vue'
import ReportModal from './ReportModal.vue'
import EditPostModal from './EditPostModal.vue'
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
  'delete-comment': [commentId: string]
  'delete-post': [postId: string]
  'like-toggled': [postId: string]
}>()

const authStore = useAuthStore()
const { toggleLike, loadComments, deletePost } = usePosts()
const { toggleBookmark, bookmarks: bookmarksSet } = usePostBookmarks()
const commentsLoaded = ref(false)
const bookmarkAnimating = ref(false)
const showCommentsSection = ref(props.showComments)
const showMenu = ref(false)
const menuContainer = ref<HTMLElement | null>(null)
const showImageLightbox = ref(false)
const showReportModal = ref(false)
const showEditModal = ref(false)

// Estados para controle de "Mostrar mais"
const isExpanded = ref(false)
const MAX_CONTENT_LENGTH = 600 // Aumentado para evitar truncamento prematuro
const MAX_NEWLINES = 6

// Verifica se o post é longo (baseado no conteúdo e quebras de linha)
const isLongPost = computed(() => {
  // Texto puro sem tags
  const textContent = props.post.conteudo.replace(/<[^>]*>/g, '').trim()
  
  // Contar quebras de linha (parágrafos fechados ou brs)
  // Isso ajuda a detectar textos verticais que têm poucos caracteres mas muitas linhas
  const newLinesHelpers = props.post.conteudo.match(/<\/p>|<br>|<br\s*\/>/gi) || []
  const lineCount = newLinesHelpers.length

  // Considerar longo se tiver muitos caracteres OU muitas linhas visuais
  return textContent.length > MAX_CONTENT_LENGTH || lineCount > MAX_NEWLINES
})

// Função para alternar entre expandido/colapsado
function toggleExpanded() {
  isExpanded.value = !isExpanded.value
}


const isOwnPost = computed(() => {
  const userId = authStore.user?.id
  const postUserId = props.post.user_id
  
  // Garantir que ambos sejam strings e fazer comparação estrita
  const result = userId && postUserId && String(userId).trim() === String(postUserId).trim()
  
  return result || false
})

// Debug: verificar status do post
const isPendingPost = computed(() => {
  const result = isOwnPost.value && props.post.status === 'pending'
  return result
})

// Verificar se o post ainda pode ser editado (dentro de 5 minutos)
const canEditPost = computed(() => {
  if (!isOwnPost.value) return false
  
  const createdAt = new Date(props.post.created_at).getTime()
  const now = Date.now()
  const timeDiff = now - createdAt
  const fiveMinutes = 5 * 60 * 1000
  
  return timeDiff <= fiveMinutes
})

// Computed for author display
const authorName = computed(() => props.post.author?.nome || 'Usuário')
const authorRole = computed(() => {
  const area = props.post.author?.area_atuacao
  return area && area.trim() ? area : 'Membro'
})
const authorAvatar = computed(() => props.post.author?.avatar_url || '')

// Extract hashtags from content (removing HTML tags first)
const hashtags = computed(() => {
  const textContent = props.post.conteudo.replace(/<[^>]*>/g, ' ')
  const matches = textContent.match(/#\w+/g)
  return matches || []
})

const sanitizedContent = computed(() => {
  let content = props.post.conteudo
  
  // Replace br/us text with emojis (only if they are standalone words and NOT inside HTML tags)
  // This handles lowercase and uppercase variations
  content = content.replace(/(?![^<]*>)\b(br|BR)\b/g, '🇧🇷')
  content = content.replace(/(?![^<]*>)\b(us|US)\b/g, '🇺🇸')
  
  return DOMPurify.sanitize(content)
})

async function handleToggleLike() {
  try {
    await toggleLike(props.post.id)
    emit('like-toggled', props.post.id)
  } catch (error) {
    console.error('Error toggling like:', error)
  }
}

async function handleToggleBookmark() {
  if (!authStore.user) {
    toast.error(t('common.loginRequired') || 'Você precisa estar logado para salvar posts')
    return
  }

  // Ativar animação
  bookmarkAnimating.value = true
  setTimeout(() => {
    bookmarkAnimating.value = false
  }, 600) // Duração da animação

  try {
    const wasBookmarked = props.post.isBookmarked || false
    // Passar o estado atual do post para garantir sincronização
    const success = await toggleBookmark(props.post.id, wasBookmarked)
    if (success) {
      // Update local post state
      const postStore = usePostStore()
      const postIndex = postStore.posts.findIndex(p => p.id === props.post.id)
      if (postIndex !== -1) {
        postStore.posts[postIndex].isBookmarked = !wasBookmarked
      }
      // Também atualizar o estado local do composable para sincronizar
      if (wasBookmarked) {
        // Remover do estado local
        bookmarksSet.value.delete(props.post.id)
      } else {
        // Adicionar ao estado local
        bookmarksSet.value.add(props.post.id)
      }
      toast.success(
        !wasBookmarked 
          ? (t('posts.bookmarkAdded') || 'Post salvo!') 
          : (t('posts.bookmarkRemoved') || 'Post removido dos salvos')
      )
    }
  } catch (error) {
    console.error('Error toggling bookmark:', error)
    toast.error(t('posts.bookmarkError') || 'Erro ao salvar post')
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

function handleEdit() {
  showEditModal.value = true
  showMenu.value = false
}

function handleEditSaved() {
  showEditModal.value = false
  // Post will be updated in store automatically
}

async function handleShare() {
  const postUrl = `${window.location.origin}/post/${props.post.id}`
  
  // Tentar usar a Web Share API (funciona em mobile)
  if (navigator.share) {
    try {
      await navigator.share({
        title: t('posts.shareText'),
        text: authorName.value,
        url: postUrl,
      })
    } catch (error) {
      // Usuário cancelou ou erro - não precisa fazer nada
      if ((error as Error).name !== 'AbortError') {
        console.error('Error sharing:', error)
      }
    }
  } else {
    // Fallback: copiar link para a área de transferência
    try {
      await navigator.clipboard.writeText(postUrl)
      toast.success(t('posts.linkCopied'))
    } catch (error) {
      console.error('Error copying link:', error)
      toast.error(t('posts.copyError'))
    }
  }
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

:deep(.rich-text-content ul) {
  list-style-type: disc;
  padding-left: 1.25rem;
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
}

:deep(.rich-text-content ol) {
  list-style-type: decimal;
  padding-left: 1.25rem;
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
}

:deep(.rich-text-content p) {
  margin-top: 0.25rem;
  margin-bottom: 0.25rem;
  min-height: 1em;
}

:deep(.rich-text-content strong) {
  font-weight: 700;
  color: #111827;
}

:deep(.rich-text-content b) {
  font-weight: 700;
  color: #111827;
}

.dark :deep(.rich-text-content strong),
.dark :deep(.rich-text-content b) {
  color: #ffffff !important;
}

:deep(.rich-text-content em) {
  font-style: italic;
}

/* Animação do bookmark */
@keyframes bookmarkBounce {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.3) rotate(10deg);
  }
  100% {
    transform: scale(1) rotate(0deg);
  }
}

.bookmark-icon-animate {
  animation: bookmarkBounce 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.bookmark-animate {
  transform: scale(0.95);
  transition: transform 0.1s ease-out;
}

/* Animação do like - estilo Instagram */
@keyframes likeHeartPop {
  0% {
    transform: scale(1);
  }
  25% {
    transform: scale(1.3);
  }
  50% {
    transform: scale(0.95);
  }
  100% {
    transform: scale(1);
  }
}

.like-animate {
  animation: likeHeartPop 0.45s cubic-bezier(0.17, 0.89, 0.32, 1.49);
}

/* Truncamento de conteúdo longo */
.line-clamp-content {
  display: -webkit-box;
  -webkit-line-clamp: 6;
  line-clamp: 6;
  -webkit-box-orient: vertical;
  overflow: hidden;
  position: relative;
}

</style>

