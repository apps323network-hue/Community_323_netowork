<template>
  <AppLayout :hideSidebars="true">
    <div class="max-w-7xl mx-auto space-y-4 px-4 sm:px-6 lg:px-8 pb-8">
      <!-- Background Neon Effects -->
      <div class="fixed top-20 left-10 w-64 h-64 bg-secondary rounded-full filter blur-[120px] opacity-10 pointer-events-none z-0"></div>
      <div class="fixed bottom-20 right-10 w-64 h-64 bg-primary rounded-full filter blur-[120px] opacity-10 pointer-events-none z-0"></div>

      <!-- Back Button -->
      <button
        class="flex items-center gap-2 text-gray-400 hover:text-secondary transition-colors group relative z-10"
        @click="router.back()"
      >
        <span class="material-icons text-[20px] group-hover:-translate-x-1 transition-transform"
          >arrow_back</span
        >
        {{ t('profile.backToCommunity') }}
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
        <h2 class="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          {{ t('common.error') }}
        </h2>
        <p class="text-gray-400">{{ error }}</p>
      </div>

      <!-- Profile Content -->
      <template v-else-if="member">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
          <!-- Left Column - Sidebar -->
          <div class="lg:col-span-4 xl:col-span-3 space-y-6">
            <ProfileCard
              :name="member.nome"
              :email="(member.show_email || isAdmin) ? member.email : ''"
              :profession="member.area_atuacao || ''"
              :avatarUrl="member.avatar_url"
              :verified="member.badge === 'Verified' || member.plano === 'Premium'"
              :memberSince="formatYearOnly(member.created_at)"
              :city="member.cidade"
              :state="member.estado"
              :country="member.pais || 'USA'"
              :connections="memberConnections"
              :points="member.total_points || 0"
              :posts="memberPosts.length"
              :readonly="true"
            />

            <!-- Connection Actions -->
            <div class="space-y-3">
              <button
                class="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border font-bold transition-all shadow-lg overflow-hidden group/btn relative"
                :class="[
                  connectionStatus === 'accepted'
                  ? 'border-green-500/40 text-green-500 bg-green-500/5 cursor-default'
                  : connectionStatus === 'pending'
                  ? 'border-yellow-500/40 text-yellow-500 bg-yellow-500/5 cursor-default'
                  : 'bg-gradient-to-r from-secondary/20 to-primary/20 border-secondary/40 text-slate-600 dark:text-white hover:border-secondary hover:shadow-neon-blue'
                ]"
                @click="handleConnect"
                :disabled="requesting || !!connectionStatus"
              >
                <div v-if="requesting" class="w-5 h-5 border-2 border-secondary border-t-transparent rounded-full animate-spin"></div>
                <template v-else>
                  <span class="material-symbols-outlined">{{ connectionStatus === 'accepted' ? 'check_circle' : connectionStatus === 'pending' ? 'schedule' : 'person_add' }}</span>
                  {{ connectionStatus === 'accepted' ? t('profile.connected') : connectionStatus === 'pending' ? t('profile.pending') : t('profile.connect') }}
                </template>
              </button>

              <button
                class="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl border transition-all duration-300 font-bold"
                :class="[
                  isBookmarked
                    ? 'border-secondary/40 text-secondary bg-secondary/10 hover:bg-secondary/20 shadow-neon-blue'
                    : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-white/10 hover:border-slate-300 dark:hover:border-white/20 hover:text-slate-900 dark:hover:text-white'
                ]"
                @click="handleToggleBookmark"
                :disabled="bookmarkLoading"
              >
                <span class="material-symbols-outlined text-lg">
                  {{ isBookmarked ? 'bookmark_added' : 'bookmark_add' }}
                </span>
                {{ isBookmarked ? t('profile.saved') : t('profile.saveProfile') }}
              </button>
            </div>

            <ProfileSocialLinks
              :linkedin="member.linkedin"
              :instagram="member.instagram"
              :readonly="true"
            />

            <!-- Quick Contacts (Email/WhatsApp) -->
            <div v-if="(member.show_whatsapp && member.whatsapp) || ((member.show_email || isAdmin) && member.email)" class="bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/5 rounded-2xl p-5 space-y-4 shadow-xl shadow-slate-200/50 dark:shadow-none">
              <h4 class="text-xs font-black text-gray-500 uppercase tracking-widest">{{ t('profile.directContacts') }}</h4>
              
              <a v-if="member.show_whatsapp && member.whatsapp" :href="whatsappLink" target="_blank" class="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/5 hover:bg-green-500/10 border border-slate-300 dark:border-transparent hover:border-green-500/30 transition-all group">
                <span class="material-symbols-outlined text-green-400">chat</span>
                <span class="text-sm text-slate-600 dark:text-gray-300 group-hover:text-slate-900 dark:group-hover:text-white truncate">WhatsApp</span>
              </a>
              
              <div v-if="isAdmin && member.email && !member.show_email" class="px-3 py-1 bg-secondary/10 border border-secondary/20 rounded-lg mb-2">
                <span class="text-[10px] text-secondary font-bold uppercase tracking-wider">{{ t('profile.visibleOnlyAdmin') }}</span>
              </div>

              <a v-if="(member.show_email || isAdmin) && member.email" :href="`mailto:${member.email}`" class="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/5 hover:bg-secondary/10 border border-slate-300 dark:border-transparent hover:border-secondary/30 transition-all group">
                <span class="material-symbols-outlined text-secondary">mail</span>
                <span class="text-sm text-slate-600 dark:text-gray-300 group-hover:text-slate-900 dark:group-hover:text-white truncate">{{ member.email }}</span>
              </a>
            </div>
          </div>

          <!-- Right Column - Main Content -->
          <div class="lg:col-span-8 xl:col-span-9 space-y-6">
            <!-- Detailed Info Section -->
            <ProfileInfoForm
              :name="member.nome"
              :profession="member.area_atuacao || ''"
              :country="member.pais || 'USA'"
              :city="member.cidade || ''"
              :state="member.estado || ''"
              :nationality="member.nacionalidade || ''"
              :email="(member.show_email || isAdmin) ? member.email : ''"
              :whatsapp="member.show_whatsapp ? member.whatsapp : ''"
              :bio="member.bio || member.objetivo || ''"
              :readonly="true"
            />

            <!-- ============================================
                 FUNCIONALIDADE DESATIVADA: CONQUISTAS E DESAFIOS
                 ============================================
                 Esta funcionalidade foi temporariamente desativada.
                 Para reativar: altere v-if="false" para v-if="true" ou remova a diretiva v-if
                 Localização: MemberProfile.vue linha ~139
                 Nota: Esta seção exibe as conquistas completadas pelo membro visualizado
                 ============================================ -->
            <div v-if="false" class="bg-surface-dark border border-white/5 rounded-2xl p-8 shadow-xl">
              <h3 class="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <span class="material-symbols-outlined text-secondary">stars</span>
                Conquistas e Desafios
              </h3>
              
              <div v-if="memberChallenges.length === 0" class="text-center py-8 border border-dashed border-white/10 rounded-2xl">
                <p class="text-gray-500 text-sm italic">Este membro ainda não completou desafios.</p>
              </div>
              
              <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                <div 
                  v-for="uc in memberChallenges" 
                  :key="uc.id"
                  class="flex flex-col items-center text-center p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-secondary/30 transition-all group"
                >
                  <div class="p-3 bg-secondary/10 rounded-full mb-3 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(0,240,255,0.1)]">
                    <span class="material-symbols-outlined text-secondary text-2xl">{{ getIconForType(uc.challenge?.tipo || 'other') }}</span>
                  </div>
                  <p class="text-[11px] font-black text-white uppercase tracking-tighter line-clamp-1 mb-1">{{ uc.challenge?.nome }}</p>
                  <p class="text-[10px] text-secondary font-bold">{{ uc.challenge?.pontos }} PTS</p>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Interests -->
              <div class="bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/5 rounded-2xl p-8 shadow-xl shadow-slate-200/50 dark:shadow-none">
                <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                  <span class="material-symbols-outlined text-secondary">interests</span>
                  {{ t('profile.interestsTitle') }}
                </h3>
                <div v-if="member.tags?.length" class="flex flex-wrap gap-2">
                  <span v-for="tag in member.tags" :key="tag" class="px-3 py-1.5 rounded-lg bg-secondary/10 border border-secondary-dark/20 dark:border-secondary/20 text-secondary-dark dark:text-secondary text-xs font-bold">
                    #{{ getTagLabel(tag) }}
                  </span>
                </div>
                <p v-else class="text-gray-500 text-sm italic">{{ t('profile.noInterests') }}</p>
              </div>

              <!-- Goals -->
              <div class="bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/5 rounded-2xl p-8 shadow-xl shadow-slate-200/50 dark:shadow-none">
                <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                  <span class="material-symbols-outlined text-secondary">rocket_launch</span>
                  {{ t('profile.goalsTitle') }}
                </h3>
                <div v-if="member.goals?.length" class="space-y-3">
                  <div v-for="goal in member.goals" :key="goal" class="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-300 dark:border-white/5">
                    <span class="material-symbols-outlined text-primary text-sm">check_circle</span>
                    <span class="text-slate-600 dark:text-gray-300 text-sm font-medium">{{ goal }}</span>
                  </div>
                </div>
                <p v-else class="text-gray-500 text-sm italic">{{ t('profile.noGoals') }}</p>
              </div>
            </div>

            <!-- Posts Section -->
            <div class="bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-none space-y-6">
              <h3 class="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                <div class="p-2 rounded-lg bg-secondary/10 border border-secondary/20">
                  <span class="material-symbols-outlined text-secondary font-bold">feed</span>
                </div>
                {{ t('profile.recentPosts') }}
              </h3>

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
                {{ t('profile.loadMorePosts') }}
              </button>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else class="text-center py-8 px-4">
            <p class="text-slate-500 dark:text-gray-400 text-sm font-medium italic">{{ t('members.noPostsYet') }}</p>
          </div>

            </div> <!-- End Posts Area -->
          </div> <!-- End Right Column -->
        </div> <!-- End Grid -->
      </template>

      <!-- Not Found -->
      <div v-else-if="!loading && !member" class="text-center py-20">
        <div
          class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-500/10 mb-6"
        >
          <span class="material-icons text-6xl text-gray-400">person_off</span>
        </div>
        <h2 class="text-2xl font-bold text-slate-900 dark:text-white mb-2">Membro não encontrado</h2>
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
import { useI18n } from 'vue-i18n'
import AppLayout from '@/components/layout/AppLayout.vue'
import PostCard from '@/components/features/feed/PostCard.vue'
import CommentForm from '@/components/features/feed/CommentForm.vue'
import ProfileCard from '@/components/features/profile/ProfileCard.vue'
import ProfileSocialLinks from '@/components/features/profile/ProfileSocialLinks.vue'
import ProfileInfoForm from '@/components/features/profile/ProfileInfoForm.vue'
import { useMembers } from '@/composables/useMembers'
import { usePosts } from '@/composables/usePosts'
import { useBookmarks } from '@/composables/useBookmarks'
import { useConnections } from '@/composables/useConnections'
import { useAuthStore } from '@/stores/auth'
import { useUserStore } from '@/stores/user'
import { supabase } from '@/lib/supabase'
import { toast } from 'vue-sonner'
import { sendConnectionRequestEmail } from '@/lib/emails'
import type { Member } from '@/types/members'
import { TAG_KEYS } from '@/types/members'
import { useDynamicMeta } from '@/composables/useDynamicMeta'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const member = ref<Member | null>(null)

// SEO
useDynamicMeta(() => ({
  title: member.value ? `${member.value.nome} - @${member.value.username || member.value.nome.toLowerCase().replace(' ', '.')}` : t('members.title'),
  description: member.value?.bio || member.value?.area_atuacao || t('members.description'),
  image: member.value?.avatar_url,
  url: `/comunidade/membro/${member.value?.id}`,
  type: 'profile'
}))
const { fetchMemberById, loading, error } = useMembers()
loading.value = true // Prevent flash of not found state
const { posts: memberPosts, loading: postsLoading, hasMore: postsHasMore, loadPosts, loadMorePosts, removeComment } = usePosts()
const { isBookmarked: checkBookmarked, toggleBookmark, fetchBookmarks, loading: bookmarkLoading } = useBookmarks()
const { sendConnectionRequest, getConnectionStatus, fetchConnectionsCount } = useConnections()
const authStore = useAuthStore()
const userStore = useUserStore()

const isAdmin = computed(() => userStore.profile?.role === 'admin')

const memberConnections = ref(0)
const memberChallenges = ref<any[]>([])
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
      // Fetch member connections and challenges
      memberConnections.value = await fetchConnectionsCount(member.value.id)
      await fetchMemberChallenges(member.value.id)
      
      // Verificar status de conexão
      if (authStore.user) {
        connectionStatus.value = await getConnectionStatus(authStore.user.id, member.value.id)
      }
    }
  }
})

async function fetchMemberChallenges(id: string) {
  try {
    const { data, error } = await supabase
      .from('user_challenges')
      .select('*, challenge:challenges(*)')
      .eq('user_id', id)
      .eq('completado', true)
    
    if (error) throw error
    memberChallenges.value = data || []
  } catch (err) {
    console.error('Error fetching member challenges:', err)
  }
}

watch(() => member.value?.id, async (newId) => {
  if (newId) {
    await loadMemberPosts()
    memberConnections.value = await fetchConnectionsCount(newId)
    await fetchMemberChallenges(newId)
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
    toast.error(t('profile.mustBeLoggedInToConnect'))
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
        title: t('profile.newConnectionRequest'),
        content: `${authStore.user.user_metadata?.nome || t('members.someMember')} ${t('profile.wantsToConnect')}`,
        metadata: { 
          requester_id: authStore.user.id,
          actor_name: authStore.user.user_metadata?.nome || t('members.someMember')
        }
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
          profile.nome || t('members.member'),
          authStore.user.user_metadata?.nome || t('members.someMember')
        )
      }

      toast.success(t('profile.connectionRequestSent'))
    } else {
      if (error === 'Request already exists') {
        connectionStatus.value = 'pending'
        toast.info(t('profile.alreadySent'))
      } else {
        toast.error(t('profile.errorConnecting'))
      }
    }
  } catch (err) {
    console.error(err)
    toast.error(t('profile.errorProcessing'))
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

async function handleCommentAdded(_postId: string) {
  // Recarregar posts para atualizar contagem de comentários
  loadMemberPosts()
}

const whatsappLink = computed(() => {
  if (!member.value?.whatsapp) return ''
  const phone = member.value.whatsapp.replace(/\D/g, '')
  return `https://wa.me/${phone}`
})

function formatYearOnly(dateString?: string): string {
  if (!dateString) return new Date().getFullYear().toString()
  return new Date(dateString).getFullYear().toString()
}

function getIconForType(type: string) {
  const icons: Record<string, string> = {
    post: 'article',
    comment: 'chat_bubble',
    event: 'event_available',
    connection: 'person_add',
    engagement: 'thumb_up',
    other: 'extension'
  }
  return icons[type] || 'emoji_events'
}

function getTagLabel(tag: string) {
  const key = TAG_KEYS[tag]
  return key ? t(`interests.${key}`) : tag
}
</script>
