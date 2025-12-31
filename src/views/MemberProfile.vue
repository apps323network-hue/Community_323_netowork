<template>
  <AppLayout>
    <div class="max-w-5xl mx-auto space-y-8">
      <!-- Back Button -->
      <button
        class="flex items-center gap-2 text-gray-400 hover:text-secondary transition-colors group"
        @click="router.back()"
      >
        <span class="material-icons text-[20px] group-hover:-translate-x-1 transition-transform"
          >arrow_back</span
        >
        Voltar para comunidade
      </button>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center py-20">
        <div class="relative">
          <div
            class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"
          ></div>
          <div class="absolute inset-0 rounded-full shadow-neon-blue animate-pulse"></div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-20">
        <div
          class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500/10 mb-6"
        >
          <span class="material-icons text-6xl text-red-500">error</span>
        </div>
        <h2 class="text-2xl font-bold text-white mb-2">
          Erro ao carregar perfil
        </h2>
        <p class="text-gray-400">{{ error }}</p>
      </div>

      <!-- Profile Content -->
      <template v-else-if="member">
        <!-- Profile Card -->
        <div
          class="relative group rounded-2xl overflow-hidden bg-card-dark border border-white/5 shadow-xl"
        >
          <!-- Gradient Cover -->
          <div class="h-32 sm:h-48 bg-gradient-to-r from-blue-700 via-blue-500 to-blue-400"></div>

          <!-- Profile Info -->
          <div class="px-6 sm:px-8 pb-8 relative">
            <!-- Avatar -->
            <div class="absolute -top-16 sm:-top-20 left-6 sm:left-8">
              <Avatar
                :src="member.avatar_url"
                :name="member.nome"
                size="2xl"
                :border="false"
                class="ring-2 ring-transparent group-hover:ring-secondary/50 transition-all shadow-2xl rounded-2xl"
              />
            </div>

            <!-- Actions Row (Top Right) -->
            <div class="flex justify-end pt-4 gap-2">
              <button
                :class="[
                  'p-3 rounded-xl border transition-all duration-300',
                  isBookmarked
                    ? 'border-secondary/40 text-secondary bg-secondary/10 hover:bg-secondary/20 hover:shadow-neon-blue'
                    : 'border-gray-700 hover:border-secondary hover:bg-secondary/10 hover:text-secondary hover:shadow-neon-blue text-gray-400'
                ]"
                @click="handleToggleBookmark"
                :disabled="bookmarkLoading"
              >
                <span class="material-icons">
                  {{ isBookmarked ? 'bookmark' : 'bookmark_border' }}
                </span>
              </button>
            </div>

            <!-- Name and Info -->
            <div class="pt-20 sm:pt-24 space-y-4">
              <div>
                <div class="flex items-center gap-3 flex-wrap mb-2">
                  <h1 class="text-3xl sm:text-4xl font-bold text-white">
                    {{ member.nome }}
                  </h1>
                  <BadgeDisplay v-if="member.badge" :badge-id="member.badge" size="md" />
                </div>
                <p
                  v-if="member.area_atuacao"
                  class="text-secondary font-bold text-lg tracking-wide uppercase"
                >
                  {{ member.area_atuacao }}
                </p>
                <div
                  v-if="member.cidade || member.pais"
                  class="flex items-center gap-1 text-gray-400 mt-2"
                >
                  <span class="material-icons text-[18px]">place</span>
                  {{ [member.cidade, member.pais].filter(Boolean).join(', ') }}
                </div>
              </div>


              <!-- Action Buttons -->
              <div class="flex flex-wrap gap-3 pt-4">
                <button
                  class="flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl border font-bold transition-all min-w-[160px]"
                  :class="[
                    connectionStatus === 'accepted'
                    ? 'border-green-500/40 text-green-500 bg-green-500/5 cursor-default'
                    : connectionStatus === 'pending'
                    ? 'border-yellow-500/40 text-yellow-500 bg-yellow-500/5 cursor-default'
                    : 'border-secondary/40 text-secondary bg-secondary/5 hover:bg-secondary/10 hover:border-secondary shadow-[0_0_10px_rgba(0,240,255,0.1)] hover:shadow-neon-blue'
                  ]"
                  @click="handleConnect"
                  :disabled="requesting || !!connectionStatus"
                >
                  <div v-if="requesting" class="w-5 h-5 border-2 border-secondary border-t-transparent rounded-full animate-spin"></div>
                  <template v-else>
                    <span class="material-icons">{{ connectionStatus === 'accepted' ? 'check' : connectionStatus === 'pending' ? 'schedule' : 'person_add' }}</span>
                    {{ connectionStatus === 'accepted' ? 'Conectado' : connectionStatus === 'pending' ? 'Pendente' : 'Conectar' }}
                  </template>
                </button>
                <button
                  class="flex items-center gap-2 px-8 py-3.5 rounded-xl border border-gray-700 hover:border-secondary hover:bg-secondary/10 hover:text-secondary hover:shadow-neon-blue text-gray-400 transition-all duration-300 font-bold"
                >
                  <span class="material-icons">chat_bubble_outline</span>
                  Mensagem
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Info Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <!-- Plano Card -->
          <div
            class="bg-card-dark rounded-xl p-6 border border-white/5 shadow-lg hover:shadow-neon-blue/20 transition-all"
          >
            <div class="flex items-center gap-3 mb-4">
              <div class="p-2 rounded-lg bg-secondary/10 border border-secondary/20">
                <span class="material-icons text-secondary text-xl">workspace_premium</span>
              </div>
              <h3
                class="text-sm font-semibold text-gray-400 uppercase tracking-wide"
              >
                Plano
              </h3>
            </div>
            <div class="flex items-center gap-2">
              <span
                :class="[
                  'px-4 py-2 rounded-full text-sm font-bold',
                  member.plano === 'Premium'
                    ? 'bg-gradient-to-r from-secondary to-purple-600 text-white shadow-neon-pink'
                    : member.plano === 'Member'
                      ? 'bg-gradient-to-r from-blue-400 to-blue-600 text-white shadow-neon-blue'
                      : 'bg-gray-800 text-gray-400',
                ]"
              >
                {{ member.plano || 'Free' }}
              </span>
            </div>
          </div>

          <!-- Membro Desde Card -->
          <div
            class="bg-card-dark rounded-xl p-6 border border-white/5 shadow-lg hover:shadow-neon-blue/20 transition-all"
          >
            <div class="flex items-center gap-3 mb-4">
              <div class="p-2 rounded-lg bg-secondary/10 border border-secondary/20">
                <span class="material-icons text-secondary text-xl">calendar_today</span>
              </div>
              <h3
                class="text-sm font-semibold text-gray-400 uppercase tracking-wide"
              >
                Membro desde
              </h3>
            </div>
            <p class="text-white text-lg font-semibold">
              {{ formatDate(member.created_at) }}
            </p>
          </div>

          <!-- Posts Count Card -->
          <div
            class="bg-card-dark rounded-xl p-6 border border-white/5 shadow-lg hover:shadow-neon-blue/20 transition-all"
          >
            <div class="flex items-center gap-3 mb-4">
              <div class="p-2 rounded-lg bg-secondary/10 border border-secondary/20">
                <span class="material-icons text-secondary text-xl">article</span>
              </div>
              <h3
                class="text-sm font-semibold text-gray-400 uppercase tracking-wide"
              >
                Posts
              </h3>
            </div>
            <p class="text-white text-2xl font-bold">
              {{ memberPosts.length }}
            </p>
          </div>

          <!-- Localização Card -->
          <div
            class="bg-card-dark rounded-xl p-6 border border-white/5 shadow-lg hover:shadow-neon-blue/20 transition-all"
          >
            <div class="flex items-center gap-3 mb-4">
              <div class="p-2 rounded-lg bg-secondary/10 border border-secondary/20">
                <span class="material-icons text-secondary text-xl">place</span>
              </div>
              <h3
                class="text-sm font-semibold text-gray-400 uppercase tracking-wide"
              >
                Localização
              </h3>
            </div>
            <p class="text-white text-lg font-semibold">
              {{ [member.cidade, member.pais].filter(Boolean).join(', ') || 'Não informado' }}
            </p>
          </div>
        </div>

        <!-- Contact & Social Section -->
        <div v-if="member.whatsapp || member.linkedin" class="bg-card-dark rounded-xl p-6 border border-white/5 shadow-lg">
          <h3 class="text-white font-bold mb-6 flex items-center gap-2 text-lg">
            <span class="material-icons text-secondary">link</span>
            <span>Redes Sociais e Contato</span>
          </h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a
              v-if="member.whatsapp"
              :href="whatsappLink"
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-green-500/10 to-green-600/10 border border-green-500/20 hover:border-green-500/40 hover:bg-green-500/20 transition-all group"
            >
              <div class="p-3 rounded-lg bg-green-500/20 group-hover:bg-green-500/30 transition-colors">
                <span class="material-icons text-green-400 text-2xl">chat</span>
              </div>
              <div class="flex-1">
                <p class="text-gray-400 text-sm uppercase tracking-wide">WhatsApp</p>
                <p class="text-white font-semibold">{{ member.whatsapp }}</p>
              </div>
              <span class="material-icons text-gray-400 group-hover:text-green-400 transition-colors">open_in_new</span>
            </a>
            <a
              v-if="member.linkedin"
              :href="linkedinLink"
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-blue-600/10 to-blue-700/10 border border-blue-600/20 hover:border-blue-600/40 hover:bg-blue-600/20 transition-all group"
            >
              <div class="p-3 rounded-lg bg-blue-600/20 group-hover:bg-blue-600/30 transition-colors">
                <span class="material-icons text-blue-400 text-2xl">link</span>
              </div>
              <div class="flex-1">
                <p class="text-gray-400 text-sm uppercase tracking-wide">LinkedIn</p>
                <p class="text-white font-semibold truncate">{{ member.linkedin.replace('https://linkedin.com/in/', '').replace('https://www.linkedin.com/in/', '') }}</p>
              </div>
              <span class="material-icons text-gray-400 group-hover:text-blue-400 transition-colors">open_in_new</span>
            </a>
          </div>
        </div>

        <!-- About Section -->
        <div v-if="member.objetivo || member.area_atuacao" class="bg-card-dark rounded-xl p-6 border border-white/5 shadow-lg">
          <h3 class="text-white font-bold mb-4 flex items-center gap-2 text-lg">
            <span class="material-icons text-secondary">info</span>
            <span>Sobre</span>
          </h3>
          <div class="space-y-4">
            <div v-if="member.area_atuacao">
              <p class="text-gray-400 text-sm uppercase tracking-wide mb-2">Área de Atuação</p>
              <p class="text-white text-lg font-semibold">{{ member.area_atuacao }}</p>
            </div>
            <div v-if="member.objetivo">
              <p class="text-gray-400 text-sm uppercase tracking-wide mb-2">Objetivo</p>
              <p class="text-white text-lg">{{ member.objetivo }}</p>
            </div>
          </div>
        </div>

        <!-- Posts Section -->
        <div class="space-y-6">
          <h2 class="text-2xl font-bold text-white flex items-center gap-3">
            <span class="material-icons text-secondary">article</span>
            Posts
          </h2>

          <!-- Loading Posts -->
          <div v-if="postsLoading" class="flex justify-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary"></div>
          </div>

          <!-- Posts List -->
          <div v-else-if="memberPosts.length > 0" class="space-y-6">
            <PostCard
              v-for="post in memberPosts"
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
            <div v-if="postsHasMore" class="flex justify-center py-4">
              <button
                v-if="!postsLoading"
                class="px-6 py-3 rounded-xl border border-secondary/40 text-secondary bg-secondary/5 hover:bg-secondary/10 hover:border-secondary transition-all shadow-[0_0_10px_rgba(0,240,255,0.1)] hover:shadow-neon-blue font-bold"
                @click="handleLoadMorePosts"
              >
                Carregar mais posts
              </button>
              <div v-else class="text-gray-400 text-sm">Carregando...</div>
            </div>
          </div>

          <!-- Empty State for Posts -->
          <div v-else class="text-center py-12 bg-card-dark rounded-xl border border-white/5">
            <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-500/10 mb-4">
              <span class="material-icons text-4xl text-gray-400">article</span>
            </div>
            <p class="text-gray-400">Este membro ainda não publicou nenhum post.</p>
          </div>
        </div>
      </template>

      <!-- Not Found -->
      <div v-else-if="!loading && !member" class="text-center py-20">
        <div
          class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-500/10 mb-6"
        >
          <span class="material-icons text-6xl text-gray-400">person_off</span>
        </div>
        <h2 class="text-2xl font-bold text-white mb-2">Membro não encontrado</h2>
        <p class="text-gray-400 mb-6">
          O membro que você está procurando não existe ou foi removido.
        </p>
        <button
          class="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-400 to-blue-600 hover:from-blue-300 hover:to-blue-500 text-black font-bold transition-all shadow-glow-secondary hover:shadow-neon-blue"
          @click="router.push('/comunidade')"
        >
          Ver toda a comunidade
        </button>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppLayout from '@/components/layout/AppLayout.vue'
import Avatar from '@/components/ui/Avatar.vue'
import BadgeDisplay from '@/components/ui/BadgeDisplay.vue'
import PostCard from '@/components/features/feed/PostCard.vue'
import CommentForm from '@/components/features/feed/CommentForm.vue'
import { useMembers } from '@/composables/useMembers'
import { usePosts } from '@/composables/usePosts'
import { useBookmarks } from '@/composables/useBookmarks'
import { useConnections } from '@/composables/useConnections'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/lib/supabase'
import { toast } from 'vue-sonner'
import { sendConnectionRequestEmail } from '@/lib/emails'
import type { Member } from '@/types/members'

const route = useRoute()
const router = useRouter()
const { fetchMemberById, loading, error } = useMembers()
loading.value = true // Prevent flash of not found state
const { posts: memberPosts, loading: postsLoading, hasMore: postsHasMore, loadPosts, loadMorePosts, removeComment } = usePosts()
const { isBookmarked: checkBookmarked, toggleBookmark, fetchBookmarks, loading: bookmarkLoading } = useBookmarks()
const { sendConnectionRequest, getConnectionStatus } = useConnections()
const authStore = useAuthStore()

const member = ref<Member | null>(null)
const expandedComments = ref(new Set<string>())
const requesting = ref(false)
const connectionStatus = ref<string | null>(null)

const isBookmarked = computed(() => {
  if (!member.value) return false
  return checkBookmarked.value(member.value.id)
})

onMounted(async () => {
  const id = route.params.id as string
  if (id) {
    await fetchBookmarks()
    member.value = await fetchMemberById(id)
    if (member.value) {
      await loadMemberPosts()
      // Verificar status de conexão
      if (authStore.user) {
        connectionStatus.value = await getConnectionStatus(authStore.user.id, member.value.id)
      }
    }
  }
})

watch(() => member.value?.id, async (newId) => {
  if (newId) {
    await loadMemberPosts()
  }
})

async function loadMemberPosts() {
  if (!member.value) return
  await loadPosts({ user_id: member.value.id }, true)
}

async function handleLoadMorePosts() {
  if (!member.value) return
  await loadMorePosts({ user_id: member.value.id })
}

async function handleToggleBookmark() {
  if (!member.value) return
  await toggleBookmark(member.value.id)
}

async function handleConnect() {
  if (!authStore.user || !member.value) {
    toast.error('Você precisa estar logado para conectar.')
    return
  }
  
  if (requesting.value || connectionStatus.value) return
  requesting.value = true

  try {
    const { success, error } = await sendConnectionRequest(authStore.user.id, member.value.id)
    
    if (success) {
      connectionStatus.value = 'pending'
      
      // 1. Notificação In-App
      await supabase.from('notifications').insert({
        user_id: member.value.id,
        type: 'connection_request',
        title: 'Nova solicitação de conexão',
        content: `${authStore.user.user_metadata?.nome || 'Um membro'} quer se conectar com você.`,
        metadata: { requester_id: authStore.user.id }
      })

      // 2. Notificação Email
      const { data: profile } = await supabase
        .from('profiles')
        .select('email, nome')
        .eq('id', member.value.id)
        .single()

      if (profile?.email) {
        await sendConnectionRequestEmail(
          profile.email,
          profile.nome || 'Membro',
          authStore.user.user_metadata?.nome || 'Um membro'
        )
      }

      toast.success('Solicitação de conexão enviada!')
    } else {
      if (error === 'Request already exists') {
        connectionStatus.value = 'pending'
        toast.info('Solicitação já enviada anteriormente.')
      } else {
        toast.error('Erro ao conectar. Tente novamente.')
      }
    }
  } catch (err) {
    console.error(err)
    toast.error('Erro ao processar solicitação.')
  } finally {
    requesting.value = false
  }
}

function handleToggleComments(postId: string) {
  if (expandedComments.value.has(postId)) {
    expandedComments.value.delete(postId)
  } else {
    expandedComments.value.add(postId)
  }
}

function handleShare(postId: string) {
  // Implementar compartilhamento se necessário
  console.log('Share post:', postId)
}

function handleEditComment(commentId: string) {
  // Implementar edição de comentário se necessário
  console.log('Edit comment:', commentId)
}

async function handleDeleteComment(commentId: string) {
  await removeComment(commentId)
  // Recarregar comentários do post se necessário
}

function handleDeletePost(postId: string) {
  // Implementar deleção de post se necessário
  console.log('Delete post:', postId)
}

function handleCommentAdded(_postId: string) {
  // Recarregar posts para atualizar contagem de comentários
  loadMemberPosts()
}

const whatsappLink = computed(() => {
  if (!member.value?.whatsapp) return ''
  const phone = member.value.whatsapp.replace(/\D/g, '')
  return `https://wa.me/${phone}`
})

const linkedinLink = computed(() => {
  if (!member.value?.linkedin) return ''
  if (member.value.linkedin.startsWith('http')) {
    return member.value.linkedin
  }
  return `https://linkedin.com/in/${member.value.linkedin}`
})

function formatDate(dateString?: string): string {
  if (!dateString) return 'data desconhecida'
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
}
</script>
