<template>
  <AppLayout :hide-sidebars="true">
    <div class="max-w-4xl mx-auto space-y-8">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold text-slate-900 dark:text-white mb-2">{{ t('connections.title') }}</h1>
          <p class="text-slate-600 dark:text-gray-400 font-medium">{{ t('connections.subtitle') }}</p>
        </div>
        <div class="relative">
          <button 
            @click="showRequestsDropdown = !showRequestsDropdown"
            class="relative flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 hover:border-secondary transition-all font-bold text-sm text-slate-700 dark:text-white"
            :class="{ 'border-secondary/50 ring-1 ring-secondary/20 shadow-lg': showRequestsDropdown }"
          >
            <span class="material-icons-outlined text-secondary">person_add</span>
            {{ t('connections.tabs.receivedRequests') }}
            
            <div v-if="pendingRequests.length > 0" class="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-white text-[10px] items-center justify-center font-bold">
                {{ pendingRequests.length }}
              </span>
            </div>
            
            <span class="material-icons-outlined text-xs transition-transform" :class="{ 'rotate-180': showRequestsDropdown }">expand_more</span>
          </button>

          <!-- Dropdown de Solicitações -->
          <Transition
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="translate-y-1 opacity-0"
            enter-to-class="translate-y-0 opacity-100"
            leave-active-class="transition duration-150 ease-in"
            leave-from-class="translate-y-0 opacity-100"
            leave-to-class="translate-y-1 opacity-0"
          >
            <div 
              v-if="showRequestsDropdown"
              class="absolute right-0 mt-2 w-80 md:w-96 max-h-[450px] overflow-y-auto bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl z-50 p-2 space-y-2 no-scrollbar"
            >
              <div class="px-3 py-2 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                <span class="text-xs font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest">{{ t('connections.tabs.receivedRequests') }}</span>
                <span class="text-[10px] bg-secondary/10 text-secondary px-2 py-0.5 rounded-full font-bold">{{ pendingRequests.length }}</span>
              </div>

              <div v-if="pendingRequests.length === 0" class="py-12 text-center">
                <span class="material-icons-outlined text-4xl text-slate-300 dark:text-gray-700 mb-2">person_search</span>
                <p class="text-slate-500 dark:text-gray-500 text-sm">{{ t('connections.emptyRequests') }}</p>
              </div>

              <div 
                v-for="request in pendingRequests" 
                :key="request.id"
                class="p-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-white/10 transition-all space-y-3"
              >
                <div class="flex items-center gap-3">
                  <Avatar 
                    :src="request.profiles.avatar_url" 
                    :name="request.profiles.nome" 
                    size="md"
                  />
                  <div class="min-w-0 flex-1">
                    <h4 class="font-bold text-slate-900 dark:text-white text-sm truncate">{{ request.profiles.nome }}</h4>
                    <p class="text-secondary text-[10px] font-medium truncate">{{ request.profiles.area_atuacao || t('connections.member') }}</p>
                  </div>
                </div>

                <div class="flex gap-2">
                  <button 
                    @click.stop="handleStatusUpdate(request.id, 'rejected')"
                    :disabled="actionLoading === request.id"
                    class="flex-1 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 text-slate-500 dark:text-gray-400 hover:bg-red-500 hover:text-white transition-all text-[10px] font-bold"
                  >
                    {{ t('connections.decline') }}
                  </button>
                  <button 
                    @click.stop="handleStatusUpdate(request.id, 'accepted')"
                    :disabled="actionLoading === request.id"
                    class="flex-1 py-1.5 rounded-lg bg-secondary text-black hover:shadow-lg hover:brightness-110 transition-all text-[10px] font-bold"
                  >
                    {{ t('connections.accept') }}
                  </button>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>

      <!-- Content -->
      <div v-if="loading && !pendingRequests.length && !connections.length" class="flex justify-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-4 border-secondary border-t-transparent"></div>
      </div>

      <div v-else>
        <!-- Main Area: Always show Connections -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div v-if="connections.length === 0" class="col-span-full text-center py-20 bg-white dark:bg-surface-dark rounded-2xl border border-dashed border-slate-300 dark:border-white/10">
            <span class="material-icons-outlined text-6xl text-slate-200 dark:text-gray-700 mb-4">groups</span>
            <p class="text-slate-500 dark:text-gray-500 text-lg font-bold">{{ t('connections.emptyConnections') }}</p>
            <p class="text-sm text-slate-400 dark:text-gray-600">{{ t('connections.expandNetwork') }}</p>
            <RouterLink to="/membros" class="text-secondary hover:underline mt-4 inline-block font-bold">
              {{ t('connections.exploreMembers') }}
            </RouterLink>
          </div>

          <div 
            v-for="conn in connections" 
            :key="conn.id"
            class="bg-white dark:bg-surface-dark p-4 rounded-2xl border border-slate-200 dark:border-white/5 flex items-center justify-between hover:border-secondary transition-all cursor-pointer group shadow-sm hover:shadow-xl dark:shadow-none"
            @click="handleMemberClick(conn)"
          >
            <div class="flex items-center gap-3">
              <Avatar 
                :src="getOtherMember(conn)?.avatar_url" 
                :name="getOtherMember(conn)?.nome || ''" 
                size="md"
                class="group-hover:ring-2 ring-secondary/30 transition-all"
              />
              <div class="min-w-0">
                <h3 class="font-bold text-slate-900 dark:text-white truncate group-hover:text-secondary transition-colors">{{ getOtherMember(conn)?.nome || 'Membro' }}</h3>
                <p class="text-slate-500 dark:text-gray-500 text-xs truncate">{{ getOtherMember(conn)?.area_atuacao || t('connections.member') }}</p>
              </div>
            </div>
            <span class="material-icons-outlined text-slate-300 dark:text-gray-700 group-hover:text-secondary group-hover:translate-x-1 transition-all">chevron_right</span>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { useConnections } from '@/composables/useConnections'
import { supabase } from '@/lib/supabase'
import AppLayout from '@/components/layout/AppLayout.vue'
import Avatar from '@/components/ui/Avatar.vue'
import { toast } from 'vue-sonner'

const router = useRouter()
const authStore = useAuthStore()
const { t, locale } = useI18n()
const { fetchPendingRequests, updateConnectionStatus, loading } = useConnections()

const showRequestsDropdown = ref(false)
const tabs = computed(() => [
  { id: 'connections', label: t('connections.tabs.myConnections') },
  { id: 'requests', label: t('connections.tabs.receivedRequests') }
])

const pendingRequests = ref<any[]>([])
const connections = ref<any[]>([])
const actionLoading = ref<string | null>(null)

async function loadData() {
  if (!authStore.user) return

  // Load pending requests
  const requests = await fetchPendingRequests(authStore.user.id)
  pendingRequests.value = requests

  // Load accepted connections
  const { data, error } = await supabase
    .from('connections')
    .select(`
      id,
      requester_id,
      responder_id,
      requester:profiles!requester_id (id, nome, avatar_url, area_atuacao),
      responder:profiles!responder_id (id, nome, avatar_url, area_atuacao)
    `)
    .or(`requester_id.eq.${authStore.user.id},responder_id.eq.${authStore.user.id}`)
    .eq('status', 'accepted')
  
  if (error) {
    console.error('Error loading connections:', error)
    // Fallback: carregar sem join
    const { data: connectionsData } = await supabase
      .from('connections')
      .select('id, requester_id, responder_id')
      .or(`requester_id.eq.${authStore.user.id},responder_id.eq.${authStore.user.id}`)
      .eq('status', 'accepted')
    
    if (connectionsData && connectionsData.length > 0) {
      const userIds = new Set<string>()
      connectionsData.forEach(conn => {
        if (conn.requester_id) userIds.add(conn.requester_id)
        if (conn.responder_id) userIds.add(conn.responder_id)
      })
      
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, nome, avatar_url, area_atuacao')
        .in('id', Array.from(userIds))
      
      if (profiles) {
        const profilesMap = new Map(profiles.map((p: any) => [p.id, p]))
        connections.value = connectionsData.map(conn => ({
          ...conn,
          requester: profilesMap.get(conn.requester_id),
          responder: profilesMap.get(conn.responder_id)
        }))
      }
    }
  } else if (data) {
    connections.value = data
  }
}

function getOtherMember(conn: any) {
  if (conn.requester_id === authStore.user?.id) {
    return conn.responder || null
  }
  return conn.requester || null
}

function handleMemberClick(conn: any) {
  const member = getOtherMember(conn)
  if (member?.id) {
    router.push(`/comunidade/${member.id}`)
  } else {
    console.error('Member data not available:', conn)
    toast.error('Erro ao carregar perfil do membro')
  }
}

async function handleStatusUpdate(connectionId: string, status: 'accepted' | 'rejected') {
  actionLoading.value = connectionId
  const { success, error } = await updateConnectionStatus(connectionId, status)
  
  if (success) {
    toast.success(status === 'accepted' ? t('connections.acceptedSuccess') : t('connections.rejectedSuccess'))
    await loadData()
  } else {
    toast.error(t('connections.processError') + error)
  }
  actionLoading.value = null
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString(locale.value, {
    day: '2-digit',
    month: 'short'
  })
}

onMounted(() => {
  loadData()
})
</script>
