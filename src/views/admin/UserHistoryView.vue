<template>
  <AdminLayout>
    <div class="w-full flex flex-col gap-6">
      <!-- Header with Back Button -->
      <div class="flex items-center gap-4 mb-2">
        <button
          @click="goBack"
          class="p-2 rounded-lg bg-surface-card hover:bg-surface-lighter text-white/60 hover:text-white transition-all"
        >
          <span class="material-symbols-outlined">arrow_back</span>
        </button>
        <div>
          <h1 class="text-white text-3xl lg:text-4xl font-black">
            Histórico de <span class="bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-primary animate-gradient">{{ userName }}</span>
          </h1>
          <p class="text-white/60">
            Timeline completa de ações administrativas
          </p>
        </div>
      </div>

      <!-- User Info Card -->
      <div v-if="userProfile" class="bg-surface-card rounded-xl p-4 border border-white/5">
        <div class="flex items-center gap-4">
          <div class="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
            <img
              v-if="userProfile.avatar_url"
              :src="userProfile.avatar_url"
              :alt="userProfile.nome"
              class="w-full h-full object-cover"
            />
            <span v-else class="material-symbols-outlined text-primary text-3xl">person</span>
          </div>
          <div class="flex-1">
            <h2 class="text-white text-xl font-bold">{{ userProfile.nome }}</h2>
            <p class="text-white/60 text-sm">{{ userProfile.area_atuacao || 'Sem área definida' }}</p>
            <div class="flex items-center gap-3 mt-1">
              <span
                class="px-2 py-0.5 rounded-full text-xs font-medium"
                :class="statusClass"
              >
                {{ statusLabel }}
              </span>
              <span v-if="userProfile.role === 'admin'" class="px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded-full text-xs font-bold border border-purple-500/30">
                Administrador
              </span>
              <span v-if="userProfile.strikes" class="text-orange-400 text-xs">
                {{ userProfile.strikes }} strike(s)
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="flex flex-wrap gap-3">
        <select
          v-model="filterAction"
          class="px-4 py-2 bg-surface-card border border-white/10 rounded-lg text-white text-sm focus:border-primary focus:outline-none"
        >
          <option value="">Todas as ações</option>
          <optgroup label="Usuário">
            <option value="approve_user">Aprovação</option>
            <option value="reject_user">Rejeição</option>
            <option value="ban_user">Banimento</option>
            <option value="unban_user">Desbanimento</option>
            <option value="add_strike">Strike</option>
          </optgroup>
          <optgroup label="Conteúdo">
            <option value="remove_post">Post Removido</option>
            <option value="mark_spam">Marcado Spam</option>
          </optgroup>
          <optgroup label="Denúncias">
            <option value="resolve_report">Denúncia Resolvida</option>
            <option value="create_report">Denúncia Enviada</option>
          </optgroup>
          <optgroup label="Sua Atividade">
            <option value="user_create_post">Posts Criados</option>
            <option value="user_add_comment">Comentários</option>
            <option value="user_update_profile">Perfil Atualizado</option>
            <option value="user_like_post">Curtidas</option>
          </optgroup>
        </select>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>

      <!-- Empty State -->
      <div v-else-if="logs.length === 0" class="flex flex-col items-center justify-center py-12 text-center">
        <span class="material-symbols-outlined text-white/20 text-6xl mb-4">history</span>
        <h3 class="text-white/60 text-lg font-medium">Nenhum histórico encontrado</h3>
        <p class="text-white/40 text-sm">Este usuário não possui ações registradas.</p>
      </div>

      <!-- Timeline -->
      <div v-else class="space-y-4">
        <div
          v-for="log in logs"
          :key="log.id"
          class="relative flex gap-4 pl-6 before:absolute before:left-[9px] before:top-10 before:bottom-0 before:w-0.5 before:bg-white/10 last:before:hidden"
        >
          <!-- Timeline dot -->
          <div
            class="absolute left-0 w-5 h-5 rounded-full flex items-center justify-center z-10"
            :class="getActionDotClass(log.action)"
          >
            <span class="material-symbols-outlined text-xs">{{ getActionIcon(log.action) }}</span>
          </div>

          <!-- Content -->
          <div class="flex-1 bg-surface-card rounded-xl p-4 border border-white/5">
            <div class="flex items-start justify-between gap-4">
              <div>
                <span class="text-white font-medium">{{ getActionLabel(log.action) }}</span>
                <p v-if="log.details && Object.keys(log.details).length > 0" class="text-white/60 text-sm mt-1">
                  {{ formatDetails(log.details) }}
                </p>
                <div class="flex items-center gap-2 mt-2 text-white/40 text-xs">
                  <span class="material-symbols-outlined text-xs">schedule</span>
                  <span>{{ formatDate(log.created_at) }}</span>
                  <template v-if="log.adminName">
                    <span>•</span>
                    <span>por {{ log.adminName }}</span>
                  </template>
                </div>
              </div>
              <span
                class="shrink-0 px-2 py-1 rounded-lg text-xs font-medium"
                :class="getRoleBadgeClass(log.adminRole)"
              >
                {{ log.adminRole === 'admin' ? 'Administrador' : 'Usuário' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalLogs > pageSize" class="flex justify-center gap-2 pt-4">
        <button
          :disabled="currentPage === 0"
          @click="currentPage--"
          class="px-4 py-2 rounded-lg bg-surface-card text-white/60 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          Anterior
        </button>
        <span class="px-4 py-2 text-white/60">
          {{ currentPage + 1 }} / {{ Math.ceil(totalLogs / pageSize) }}
        </span>
        <button
          :disabled="(currentPage + 1) * pageSize >= totalLogs"
          @click="currentPage++"
          class="px-4 py-2 rounded-lg bg-surface-card text-white/60 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          Próximo
        </button>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase'
import { actionLabels, type AdminLog, type AdminAction } from '@/lib/auditLog'
import AdminLayout from '@/components/layout/admin/AdminLayout.vue'

const route = useRoute()
const router = useRouter()

const userId = computed(() => route.params.userId as string)
const userProfile = ref<any>(null)
const logs = ref<(AdminLog & { adminName?: string; adminRole?: string })[]>([])
const totalLogs = ref(0)
const loading = ref(true)
const filterAction = ref('')
const currentPage = ref(0)
const pageSize = 20

const userName = computed(() => userProfile.value?.nome || 'Usuário')

const statusClass = computed(() => {
  switch (userProfile.value?.status) {
    case 'active': return 'bg-green-500/20 text-green-400'
    case 'pending': return 'bg-yellow-500/20 text-yellow-400'
    case 'suspended': return 'bg-orange-500/20 text-orange-400'
    case 'banned': return 'bg-red-500/20 text-red-400'
    default: return 'bg-white/20 text-white/60'
  }
})

const statusLabel = computed(() => {
  switch (userProfile.value?.status) {
    case 'active': return 'Ativo'
    case 'pending': return 'Pendente'
    case 'suspended': return 'Suspenso'
    case 'banned': return 'Banido'
    default: return 'Desconhecido'
  }
})

function goBack() {
  router.back()
}

function getActionLabel(action: AdminAction): string {
  return actionLabels[action] || action
}

function getActionIcon(action: AdminAction): string {
  const icons: Record<string, string> = {
    approve_user: 'check_circle',
    reject_user: 'cancel',
    ban_user: 'block',
    unban_user: 'check',
    add_strike: 'warning',
    approve_post: 'check',
    hide_post: 'visibility_off',
    remove_post: 'delete',
    mark_spam: 'report',
    resolve_report: 'task_alt',
    dismiss_report: 'close',
    create_report: 'flag',
    // User actions
    user_create_post: 'add_box',
    user_update_post: 'edit',
    user_delete_post: 'delete_outline',
    user_like_post: 'favorite',
    user_unlike_post: 'heart_broken',
    user_add_comment: 'comment',
    user_update_comment: 'edit_note',
    user_delete_comment: 'delete_sweep',
    user_update_profile: 'manage_accounts',
    create_event: 'event_available',
  }
  return icons[action] || 'info'
}

function getActionDotClass(action: AdminAction): string {
  if (action.includes('approve') || action === 'unban_user') {
    return 'bg-green-500 text-white'
  }
  if (action.includes('ban') || action.includes('remove') || action === 'mark_spam') {
    return 'bg-red-500 text-white'
  }
  if (action.includes('reject') || action === 'add_strike') {
    return 'bg-orange-500 text-white'
  }
  if (action === 'user_like_post' || action === 'user_add_comment' || action === 'user_create_post') {
    return 'bg-blue-500 text-white'
  }
  if (action === 'user_update_profile') {
    return 'bg-indigo-500 text-white'
  }
  return 'bg-slate-500 text-white'
}

function getRoleBadgeClass(role?: string): string {
  if (role === 'admin') return 'bg-purple-500/20 text-purple-400 border border-purple-500/20'
  return 'bg-blue-500/20 text-blue-400 border border-blue-500/20'
}

function formatDetails(details: Record<string, any>): string {
  const parts: string[] = []
  
  if (details.titulo) parts.push(`Título: ${details.titulo}`)
  if (details.tipo) parts.push(`Tipo: ${details.tipo}`)
  if (details.reason) parts.push(`Motivo: ${details.reason}`)
  if (details.updates) parts.push(`Campos: ${details.updates.join(', ')}`)
  if (details.conteudo) {
    const text = details.conteudo.length > 80 ? details.conteudo.substring(0, 80) + '...' : details.conteudo
    parts.push(`Conteúdo: "${text}"`)
  }
  
  return parts.join(' | ')
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (minutes < 1) return 'Agora'
  if (minutes < 60) return `${minutes}min atrás`
  if (hours < 24) return `${hours}h atrás`
  if (days < 7) return `${days}d atrás`

  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

async function fetchUserProfile() {
  if (!userId.value) return

  const { data, error } = await supabase
    .from('profiles')
    .select('id, nome, area_atuacao, avatar_url, status, strikes, role')
    .eq('id', userId.value)
    .single()

  if (!error && data) {
    userProfile.value = data
  }
}

async function fetchLogs() {
  if (!userId.value) return

  loading.value = true
  try {
    // Busca logs onde o usuário é:
    // 1. O autor da ação (admin_id)
    // 2. O alvo da ação (target_id)
    // 3. O dono do recurso afetado (details->>'userId')
    
    let query = supabase
      .from('admin_logs')
      .select('*', { count: 'exact' })
      .or(`admin_id.eq.${userId.value},target_id.eq.${userId.value},details->>userId.eq.${userId.value}`)
      .order('created_at', { ascending: false })
      .range(currentPage.value * pageSize, (currentPage.value + 1) * pageSize - 1)

    if (filterAction.value) {
      query = query.eq('action', filterAction.value)
    }

    const { data: logsData, error, count } = await query

    if (error) throw error

    totalLogs.value = count || 0

    // Fetch admin details (name and role)
    const adminIds = [...new Set(logsData.map(l => l.admin_id).filter(Boolean))]
    let adminInfoMap = new Map<string, { nome: string; role: string }>()

    if (adminIds.length > 0) {
      const { data: admins } = await supabase
        .from('profiles')
        .select('id, nome, role')
        .in('id', adminIds)

      admins?.forEach(a => adminInfoMap.set(a.id, { nome: a.nome, role: a.role }))
    }

    // Filter by action if selected
    let filteredLogs = logsData
    if (filterAction.value) {
      filteredLogs = logsData.filter(l => l.action === filterAction.value)
    }

    logs.value = filteredLogs.map(log => {
      const adminInfo = log.admin_id ? adminInfoMap.get(log.admin_id) : undefined
      return {
        ...log,
        adminName: adminInfo?.nome,
        adminRole: adminInfo?.role || 'user'
      }
    })
  } catch (err) {
    console.error('Error fetching logs:', err)
  } finally {
    loading.value = false
  }
}

watch([currentPage, filterAction], () => {
  fetchLogs()
})

onMounted(async () => {
  await fetchUserProfile()
  await fetchLogs()
})
</script>

<style scoped>
@keyframes gradient {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

.animate-gradient {
  background-size: 200% 200%;
  animation: gradient 3s ease infinite;
}
</style>
