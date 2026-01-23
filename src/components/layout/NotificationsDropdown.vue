<template>
  <div class="relative" ref="dropdownContainer">
    <button
      class="relative p-2 rounded-full text-slate-600 dark:text-gray-400 hover:text-primary dark:hover:text-secondary transition-colors group focus:outline-none"
      @click="toggleDropdown"
    >
      <span class="material-icons-outlined">notifications</span>
      <span
        v-if="unreadCount > 0 || !isProfileComplete"
        class="absolute top-2 right-2 block h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-white dark:ring-surface-dark animate-pulse"
      ></span>
    </button>

    <!-- Desktop Dropdown -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="transform scale-95 opacity-0 translate-y-2"
      enter-to-class="transform scale-100 opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="transform scale-100 opacity-100 translate-y-0"
      leave-to-class="transform scale-95 opacity-0 translate-y-2"
    >
      <div
        v-if="isOpen && !isMobile"
        class="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 shadow-2xl z-50 overflow-hidden"
      >
        <div class="p-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-surface-lighter/30">
          <h3 class="font-bold text-slate-900 dark:text-white flex items-center gap-2">
            {{ t('notifications.title') }}
            <span v-if="totalNotificationCount > 0" class="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-full font-black">
              {{ totalNotificationCount }} {{ t('notifications.new') }}
            </span>
          </h3>
          <button 
            v-if="unreadCount > 0"
            @click="handleMarkAllAsRead"
            class="text-xs text-primary hover:text-primary/80 font-bold transition-colors"
          >
            {{ t('notifications.markAllRead') }}
          </button>
        </div>

        <div class="max-h-[400px] overflow-y-auto no-scrollbar">
          <!-- Persistent Profile Completion Notification -->
          <div 
            v-if="!isProfileComplete"
            class="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-b-2 border-yellow-400 dark:border-yellow-600 cursor-pointer hover:from-yellow-100 hover:to-orange-100 dark:hover:from-yellow-900/30 dark:hover:to-orange-900/30 transition-all sticky top-0 z-10"
            @click="router.push('/perfil')"
          >
            <div class="flex flex-col gap-1 flex-1">
                <div class="flex items-center justify-between gap-2">
                  <span class="text-sm font-black text-yellow-900 dark:text-yellow-300">
                    {{ t('notifications.completeProfile') }}
                  </span>
                  <span class="text-[10px] bg-yellow-500 text-white px-2 py-0.5 rounded-full font-black uppercase tracking-wide">
                    {{ t('notifications.actionRequired') }}
                  </span>
                </div>
                <p class="text-xs text-yellow-800 dark:text-yellow-400/90 leading-relaxed">
                  {{ t('notifications.profileIncompleteMessage') }}
                </p>
              </div>
          </div>

          <div v-if="loading && notifications.length === 0" class="p-8 text-center">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          </div>
          
          <div v-else-if="notifications.length === 0" class="p-10 text-center flex flex-col items-center gap-3">
            <div class="size-12 rounded-full bg-slate-50 dark:bg-surface-lighter flex items-center justify-center text-slate-400">
              <span class="material-icons-outlined">notifications_off</span>
            </div>
            <p class="text-sm text-slate-500 dark:text-gray-400">{{ t('notifications.noNotifications') }}</p>
          </div>

          <div v-else class="divide-y divide-slate-50 dark:divide-white/5">
            <div
              v-for="notification in groupedNotifications"
              :key="notification.id"
              class="p-4 hover:bg-slate-50 dark:hover:bg-surface-lighter transition-colors cursor-pointer relative group"
              :class="[!notification.read ? 'bg-primary/5 dark:bg-primary/5' : '']"
              @click="handleNotificationClick(notification)"
            >
              <div class="flex gap-3">
                <div class="size-10 rounded-full shrink-0 flex items-center justify-center" :class="getIconBg(notification.type)">
                  <span class="material-icons-outlined text-xl">{{ getIcon(notification.type) }}</span>
                </div>
                <div class="flex flex-col gap-0.5 flex-1 min-w-0">
                  <div class="flex items-center justify-between gap-2">
                    <span class="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {{ notification.title }}
                    </span>
                    <span class="text-[10px] text-slate-400 dark:text-gray-500 shrink-0 font-medium tracking-tight">
                      {{ formatTime(notification.created_at) }}
                    </span>
                  </div>
                  <p class="text-xs text-slate-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                    {{ notification.content }}
                  </p>
                </div>
                <!-- Action Buttons (Delete) -->
                <div class="flex flex-col gap-1 items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    @click.stop="handleDeleteNotification(notification.ids)"
                    class="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-all"
                    :title="t('notifications.delete')"
                  >
                    <span class="material-icons-outlined text-sm">delete</span>
                  </button>
                  <div v-if="!notification.read" class="h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_rgba(244,37,244,0.6)]"></div>
                </div>
              </div>
            </div>

            <!-- Load More Button -->
            <div v-if="hasMore" class="p-4 border-t border-slate-50 dark:divide-white/5 flex justify-center">
              <button 
                @click.stop="handleLoadMore"
                :disabled="loading"
                class="text-xs font-bold text-slate-600 dark:text-gray-400 hover:text-primary transition-colors flex items-center gap-2"
              >
                <span v-if="loading" class="animate-spin material-icons-outlined text-sm">refresh</span>
                {{ loading ? t('common.loading') : t('notifications.loadMore') }}
              </button>
            </div>
          </div>
        </div>

      </div>
    </Transition>

    <!-- Mobile Modal -->
    <Modal v-model="isOpen" title="Notifications" :closable="true" v-if="isMobile">
      <div class="flex items-center justify-between mb-4" v-if="unreadCount > 0">
        <span class="text-sm text-slate-600 dark:text-gray-400">
          {{ unreadCount }} new notifications
        </span>
        <button 
          @click="handleMarkAllAsRead"
          class="text-xs text-primary hover:text-primary/80 font-bold transition-colors"
        >
          Mark all as read
        </button>
      </div>

      <div class="max-h-[60vh] overflow-y-auto -mx-6 px-6">
        <!-- Persistent Profile Completion Notification (Mobile) -->
        <div 
          v-if="!isProfileComplete"
          class="p-4 mb-3 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-2 border-yellow-400 dark:border-yellow-600 rounded-xl cursor-pointer hover:from-yellow-100 hover:to-orange-100 dark:hover:from-yellow-900/30 dark:hover:to-orange-900/30 transition-all"
          @click="router.push('/perfil'); isOpen = false"
        >
          <div class="flex flex-col gap-1 flex-1">
              <div class="flex items-center justify-between gap-2">
                <span class="text-sm font-black text-yellow-900 dark:text-yellow-300">
                  {{ t('notifications.completeProfile') }}
                </span>
                <span class="text-[10px] bg-yellow-500 text-white px-2 py-0.5 rounded-full font-black uppercase tracking-wide">
                  {{ t('notifications.actionRequired') }}
                </span>
              </div>
              <p class="text-xs text-yellow-800 dark:text-yellow-400/90 leading-relaxed">
                {{ t('notifications.profileIncompleteMobile') }}
              </p>
            </div>
        </div>

        <div v-if="loading && notifications.length === 0" class="p-8 text-center">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </div>
        
        <div v-else-if="notifications.length === 0" class="p-10 text-center flex flex-col items-center gap-3">
          <div class="size-12 rounded-full bg-slate-50 dark:bg-surface-lighter flex items-center justify-center text-slate-400">
            <span class="material-icons-outlined">notifications_off</span>
          </div>
          <p class="text-sm text-slate-500 dark:text-gray-400">No notifications</p>
        </div>

        <div v-else class="space-y-2">
          <div
            v-for="notification in groupedNotifications"
            :key="notification.id"
            class="p-4 hover:bg-slate-50 dark:hover:bg-surface-lighter transition-colors cursor-pointer relative rounded-xl border"
            :class="[
              !notification.read 
                ? 'bg-primary/5 dark:bg-primary/5 border-primary/20 dark:border-primary/20' 
                : 'bg-white dark:bg-surface-dark border-slate-200 dark:border-white/10'
            ]"
            @click="handleNotificationClick(notification)"
          >
            <div class="flex gap-3">
              <div class="size-10 rounded-full shrink-0 flex items-center justify-center" :class="getIconBg(notification.type)">
                <span class="material-icons-outlined text-xl">{{ getIcon(notification.type) }}</span>
              </div>
              <div class="flex flex-col gap-0.5 flex-1 min-w-0">
                <div class="flex items-center justify-between gap-2">
                  <span class="text-sm font-bold text-slate-900 dark:text-white truncate">
                    {{ notification.title }}
                  </span>
                  <span class="text-[10px] text-slate-400 dark:text-gray-500 shrink-0 font-medium tracking-tight">
                    {{ formatTime(notification.created_at) }}
                  </span>
                </div>
                <p class="text-xs text-slate-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                  {{ notification.content }}
                </p>
              </div>
              
              <div class="flex flex-col gap-2 items-center justify-center">
                  <button 
                    @click.stop="handleDeleteNotification(notification.ids)"
                    class="p-2 text-slate-400 hover:text-red-500 rounded-lg transition-all"
                  >
                    <span class="material-icons-outlined text-base">delete</span>
                  </button>
                  <div v-if="!notification.read" class="h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_rgba(244,37,244,0.6)]"></div>
              </div>
            </div>
          </div>

          <!-- Mobile Load More -->
          <button 
            v-if="hasMore"
            @click.stop="handleLoadMore"
            :disabled="loading"
            class="w-full py-4 text-sm font-bold text-slate-600 dark:text-gray-400 flex items-center justify-center gap-2 border border-dashed rounded-xl"
          >
            <span v-if="loading" class="animate-spin material-icons-outlined text-sm">refresh</span>
            {{ loading ? t('common.loading') : t('notifications.loadMore') }}
          </button>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useNotifications } from '@/composables/useNotifications'
import { useProfileCompletion } from '@/composables/useProfileCompletion'
import Modal from '@/components/ui/Modal.vue'

const router = useRouter()
const { t, locale } = useI18n()
const {
  notifications,
  groupedNotifications,
  loading,
  unreadCount,
  hasMore,
  fetchNotifications,
  markAsRead,
  deleteNotification,
  markAllAsRead,
  subscribeToNotifications,
  unsubscribeFromNotifications
} = useNotifications()

const { isProfileComplete } = useProfileCompletion()

const isOpen = ref(false)
const dropdownContainer = ref<HTMLElement | null>(null)
const isMobile = computed(() => window.innerWidth < 768)

// Total notification count including profile completion
const totalNotificationCount = computed(() => {
  let count = unreadCount.value
  if (!isProfileComplete.value) {
    count += 1
  }
  return count
})

function toggleDropdown() {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    fetchNotifications()
  }
}

async function handleMarkAllAsRead() {
  await markAllAsRead()
}

async function handleNotificationClick(notification: any) {
  if (!notification.read) {
    await markAsRead(notification.ids)
  }
  
  isOpen.value = false
  
  // Redirecionar baseado no tipo de notificação
  if (notification.type === 'connection_request') {
    router.push('/comunidade')
  } else if ((notification.type === 'post_like' || notification.type === 'post_comment') && notification.metadata?.post_id) {
    router.push(`/?post=${notification.metadata.post_id}`)
  } else if (notification.type === 'youtube_upload' && notification.metadata?.program_id) {
    router.push(`/professor/programa/${notification.metadata.program_id}`)
  } else if ((notification.type === 'event_approved' || notification.type === 'event_confirmation' || notification.type === 'event_rejected') && notification.metadata?.event_id) {
    router.push(`/eventos/${notification.metadata.event_id}`)
  } else if ((notification.type === 'new_lesson' || notification.type === 'program_starting' || notification.type === 'program_expiring' || notification.type === 'enrollment_confirmed' || notification.type === 'program_completed' || notification.type === 'certificate_issued' || notification.type === 'progress_milestone') && notification.metadata?.program_id) {
    router.push(`/programas/${notification.metadata.program_id}`)
  } else if (notification.type === 'payment_success' || notification.type === 'payment_failed') {
    router.push('/meus-servicos')
  } else if (notification.type === 'subscription_activated') {
    router.push('/perfil')
  } else if (notification.type === 'program_payment_failed' && notification.metadata?.program_id) {
    router.push(`/programas/${notification.metadata.program_id}`)
  }
}

async function handleDeleteNotification(ids: string[]) {
  await deleteNotification(ids)
}

async function handleLoadMore() {
  await fetchNotifications(true)
}

function getIcon(type: string) {
  switch (type) {
    case 'connection_request': return 'person_add'
    case 'post_like': return 'favorite'
    case 'post_comment': return 'chat_bubble'
    case 'event_reminder': 
    case 'event_confirmation':
    case 'event_approved':
    case 'event_rejected': return 'event'
    case 'service_update': return 'assignment'
    case 'youtube_upload':
    case 'new_lesson': return 'play_circle'
    case 'program_starting':
    case 'program_expiring': return 'school'
    case 'enrollment_confirmed': return 'check_circle'
    case 'program_completed': return 'workspace_premium'
    case 'certificate_issued': return 'card_membership'
    case 'progress_milestone': return 'trending_up'
    case 'profile_incomplete': return 'person_alert'
    case 'payment_success': return 'monetization_on'
    case 'payment_failed': return 'payment'
    case 'program_payment_failed': return 'credit_card_off'
    case 'subscription_activated': return 'star'
    default: return 'notifications'
  }
}

function getIconBg(type: string) {
  switch (type) {
    case 'connection_request': return 'bg-secondary/10 text-secondary'
    case 'post_like': return 'bg-red-500/10 text-red-500'
    case 'post_comment': return 'bg-blue-500/10 text-blue-500'
    case 'event_reminder': return 'bg-yellow-500/10 text-yellow-500'
    case 'service_update': return 'bg-green-500/10 text-green-500'
    case 'youtube_upload': return 'bg-red-600/10 text-red-600'
    case 'new_lesson': return 'bg-blue-500/10 text-blue-500'
    case 'program_starting': return 'bg-green-500/10 text-green-500'
    case 'program_expiring': return 'bg-orange-500/10 text-orange-500'
    case 'enrollment_confirmed': return 'bg-emerald-500/10 text-emerald-500'
    case 'program_completed': return 'bg-purple-500/10 text-purple-500'
    case 'certificate_issued': return 'bg-indigo-500/10 text-indigo-500'
    case 'progress_milestone': return 'bg-cyan-500/10 text-cyan-500'
    case 'profile_incomplete': return 'bg-yellow-500/10 text-yellow-500'
    case 'payment_success': return 'bg-green-500/10 text-green-500'
    case 'payment_failed': return 'bg-red-500/10 text-red-500'
    case 'program_payment_failed': return 'bg-red-500/10 text-red-500'
    case 'subscription_activated': return 'bg-purple-500/10 text-purple-500'
    default: return 'bg-primary/10 text-primary'
  }
}

function formatTime(date: string) {
  const now = new Date()
  const postDate = new Date(date)
  const diffInSeconds = Math.floor((now.getTime() - postDate.getTime()) / 1000)

  if (diffInSeconds < 60) return t('common.now')
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`
  return postDate.toLocaleDateString(locale.value === 'pt-BR' ? 'pt-BR' : 'en-US', { day: '2-digit', month: '2-digit' })
}

function handleClickOutside(event: MouseEvent) {
  // No mobile, o modal controla seu próprio fechamento
  if (isMobile.value) return
  
  if (dropdownContainer.value && !dropdownContainer.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => {
  fetchNotifications()
  subscribeToNotifications()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  unsubscribeFromNotifications()
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
