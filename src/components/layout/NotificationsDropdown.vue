<template>
  <div class="relative" ref="dropdownContainer">
    <button
      class="relative p-2 rounded-full text-slate-600 dark:text-gray-400 hover:text-primary dark:hover:text-secondary transition-colors group focus:outline-none"
      @click="toggleDropdown"
    >
      <span class="material-icons-outlined">notifications</span>
      <span
        v-if="unreadCount > 0"
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
            {{ t('notifications.notifications') }}
            <span v-if="unreadCount > 0" class="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-full font-black">
              {{ unreadCount }} {{ t('notifications.new') }}
            </span>
          </h3>
          <button 
            v-if="unreadCount > 0"
            @click="handleMarkAllAsRead"
            class="text-xs text-primary hover:text-primary/80 font-bold transition-colors"
          >
            {{ t('notifications.markAllAsRead') }}
          </button>
        </div>

        <div class="max-h-[400px] overflow-y-auto no-scrollbar">
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
              v-for="notification in notifications"
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
                <div v-if="!notification.read" class="absolute right-4 top-1/2 -translate-y-1/2">
                  <div class="h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_rgba(244,37,244,0.6)]"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </Transition>

    <!-- Mobile Modal -->
    <Modal v-model="isOpen" :title="t('notifications.notifications')" :closable="true" v-if="isMobile">
      <div class="flex items-center justify-between mb-4" v-if="unreadCount > 0">
        <span class="text-sm text-slate-600 dark:text-gray-400">
          {{ unreadCount }} {{ t('notifications.newNotifications') }}
        </span>
        <button 
          @click="handleMarkAllAsRead"
          class="text-xs text-primary hover:text-primary/80 font-bold transition-colors"
        >
          {{ t('notifications.markAllAsRead') }}
        </button>
      </div>

      <div class="max-h-[60vh] overflow-y-auto -mx-6 px-6">
        <div v-if="loading && notifications.length === 0" class="p-8 text-center">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </div>
        
        <div v-else-if="notifications.length === 0" class="p-10 text-center flex flex-col items-center gap-3">
          <div class="size-12 rounded-full bg-slate-50 dark:bg-surface-lighter flex items-center justify-center text-slate-400">
            <span class="material-icons-outlined">notifications_off</span>
          </div>
          <p class="text-sm text-slate-500 dark:text-gray-400">{{ t('notifications.noNotifications') }}</p>
        </div>

        <div v-else class="space-y-2">
          <div
            v-for="notification in notifications"
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
              <div v-if="!notification.read" class="absolute right-4 top-1/2 -translate-y-1/2">
                <div class="h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_rgba(244,37,244,0.6)]"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useNotifications } from '@/composables/useNotifications'
import { useLocale } from '@/composables/useLocale'
import Modal from '@/components/ui/Modal.vue'

const { t } = useLocale()
const router = useRouter()
const {
  notifications,
  loading,
  unreadCount,
  fetchNotifications,
  markAsRead,
  markAllAsRead,
  subscribeToNotifications,
  unsubscribeFromNotifications
} = useNotifications()

const isOpen = ref(false)
const dropdownContainer = ref<HTMLElement | null>(null)
const isMobile = computed(() => window.innerWidth < 768)

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
    await markAsRead(notification.id)
  }
  
  isOpen.value = false
  
  // Redirecionar baseado no tipo de notificação
  if (notification.type === 'connection_request') {
    router.push('/comunidade')
  } else if (notification.type === 'post_like' && notification.metadata?.post_id) {
    router.push(`/?post=${notification.metadata.post_id}`)
  } else if (notification.type === 'youtube_upload' && notification.metadata?.program_id) {
    router.push(`/professor/programa/${notification.metadata.program_id}`)
  }
}

function getIcon(type: string) {
  switch (type) {
    case 'connection_request': return 'person_add'
    case 'post_like': return 'favorite'
    case 'post_comment': return 'chat_bubble'
    case 'event_reminder': return 'event'
    case 'service_update': return 'assignment'
    case 'youtube_upload': return 'play_circle'
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
    default: return 'bg-primary/10 text-primary'
  }
}

function formatTime(date: string) {
  const now = new Date()
  const postDate = new Date(date)
  const diffInSeconds = Math.floor((now.getTime() - postDate.getTime()) / 1000)

  if (diffInSeconds < 60) return 'agora'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`
  return postDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
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
