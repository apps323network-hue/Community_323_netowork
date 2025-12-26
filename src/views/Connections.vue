<template>
  <AppLayout :hide-sidebars="true">
    <div class="max-w-4xl mx-auto space-y-8">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold text-white mb-2">Minha Rede</h1>
          <p class="text-gray-400">Gerencie suas conexões e solicitações pendentes.</p>
        </div>
        <div class="flex bg-surface-dark p-1 rounded-xl border border-white/5">
          <button 
            v-for="tab in tabs" 
            :key="tab.id"
            @click="activeTab = tab.id"
            class="px-6 py-2 rounded-lg text-sm font-bold transition-all"
            :class="activeTab === tab.id 
              ? 'bg-secondary text-black shadow-lg shadow-secondary/20' 
              : 'text-gray-400 hover:text-white'"
          >
            {{ tab.label }}
            <span v-if="tab.id === 'requests' && pendingRequests.length > 0" class="ml-2 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
              {{ pendingRequests.length }}
            </span>
          </button>
        </div>
      </div>

      <!-- Content -->
      <div v-if="loading && !pendingRequests.length && !connections.length" class="flex justify-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-4 border-secondary border-t-transparent"></div>
      </div>

      <div v-else>
        <!-- Tab: Requests -->
        <div v-if="activeTab === 'requests'" class="space-y-4">
          <div v-if="pendingRequests.length === 0" class="text-center py-20 bg-surface-dark rounded-2xl border border-dashed border-white/10">
            <span class="material-icons-outlined text-6xl text-gray-700 mb-4">person_search</span>
            <p class="text-gray-500 text-lg">Nenhuma solicitação pendente no momento.</p>
            <RouterLink to="/membros" class="text-secondary hover:underline mt-2 block">Explorar novos membros</RouterLink>
          </div>

          <div 
            v-for="request in pendingRequests" 
            :key="request.id"
            class="bg-surface-dark p-4 rounded-xl border border-white/5 flex items-center justify-between hover:border-secondary/30 transition-all group"
          >
            <div class="flex items-center gap-4">
              <Avatar 
                :src="request.profiles.avatar_url" 
                :name="request.profiles.nome" 
                size="lg"
                class="ring-2 ring-transparent group-hover:ring-secondary/50 transition-all"
              />
              <div>
                <h3 class="font-bold text-white text-lg">{{ request.profiles.nome }}</h3>
                <p class="text-secondary text-sm font-medium">{{ request.profiles.area_atuacao || 'Membro' }}</p>
                <p class="text-xs text-gray-500 mt-1">Solicitado em {{ formatDate(request.created_at) }}</p>
              </div>
            </div>

            <div class="flex gap-2">
              <button 
                @click="handleStatusUpdate(request.id, 'rejected')"
                :disabled="actionLoading === request.id"
                class="px-4 py-2 rounded-lg border border-gray-700 text-gray-400 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/50 transition-all text-sm font-bold"
              >
                Recusar
              </button>
              <button 
                @click="handleStatusUpdate(request.id, 'accepted')"
                :disabled="actionLoading === request.id"
                class="px-4 py-2 rounded-lg bg-secondary text-black hover:bg-secondary-light transition-all text-sm font-bold flex items-center gap-2"
              >
                <div v-if="actionLoading === request.id" class="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                Aceitar
              </button>
            </div>
          </div>
        </div>

        <!-- Tab: Connections -->
        <div v-if="activeTab === 'connections'" class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div v-if="connections.length === 0" class="col-span-full text-center py-20 bg-surface-dark rounded-2xl border border-dashed border-white/10">
            <span class="material-icons-outlined text-6xl text-gray-700 mb-4">groups</span>
            <p class="text-gray-500 text-lg">Você ainda não possui conexões.</p>
            <p class="text-sm text-gray-600">Conecte-se com membros para expandir sua rede.</p>
          </div>

          <div 
            v-for="conn in connections" 
            :key="conn.id"
            class="bg-surface-dark p-4 rounded-xl border border-white/5 flex items-center justify-between hover:border-secondary/30 transition-all cursor-pointer"
            @click="router.push(`/membros/${getOtherMember(conn).id}`)"
          >
            <div class="flex items-center gap-3">
              <Avatar 
                :src="getOtherMember(conn).avatar_url" 
                :name="getOtherMember(conn).nome" 
                size="md"
              />
              <div class="min-w-0">
                <h3 class="font-bold text-white truncate">{{ getOtherMember(conn).nome }}</h3>
                <p class="text-gray-500 text-xs truncate">{{ getOtherMember(conn).area_atuacao || 'Membro' }}</p>
              </div>
            </div>
            <span class="material-icons-outlined text-gray-700 group-hover:text-secondary transition-colors">chevron_right</span>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useConnections } from '@/composables/useConnections'
import { supabase } from '@/lib/supabase'
import AppLayout from '@/components/layout/AppLayout.vue'
import Avatar from '@/components/ui/Avatar.vue'
import { toast } from 'vue-sonner'

const router = useRouter()
const authStore = useAuthStore()
const { fetchPendingRequests, updateConnectionStatus, loading } = useConnections()

const activeTab = ref('requests')
const tabs = [
  { id: 'requests', label: 'Solicitações Recebidas' },
  { id: 'connections', label: 'Minhas Conexões' }
]

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
      requester:requester_id (id, nome, avatar_url, area_atuacao),
      responder:responder_id (id, nome, avatar_url, area_atuacao)
    `)
    .or(`requester_id.eq.${authStore.user.id},responder_id.eq.${authStore.user.id}`)
    .eq('status', 'accepted')
  
  if (!error) {
    connections.value = data
  }
}

function getOtherMember(conn: any) {
  if (conn.requester_id === authStore.user?.id) {
    return conn.responder
  }
  return conn.requester
}

async function handleStatusUpdate(connectionId: string, status: 'accepted' | 'rejected') {
  actionLoading.value = connectionId
  const { success, error } = await updateConnectionStatus(connectionId, status)
  
  if (success) {
    toast.success(status === 'accepted' ? 'Conexão aceita!' : 'Solicitação removida.')
    await loadData()
  } else {
    toast.error('Erro ao processar solicitação: ' + error)
  }
  actionLoading.value = null
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short'
  })
}

onMounted(() => {
  loadData()
})
</script>
