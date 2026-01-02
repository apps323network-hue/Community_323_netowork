<template>
  <div class="space-y-4">
    <!-- Filters and Search -->
    <div class="flex flex-col sm:flex-row gap-3 sm:gap-4">
      <!-- Search -->
      <div class="flex-1 relative">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span class="material-symbols-outlined text-slate-400 dark:text-white/40 text-lg">search</span>
        </div>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar por nome, email ou área..."
          class="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-white/10 rounded-lg bg-white dark:bg-[#0a040f] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-secondary focus:border-secondary focus:shadow-[0_0_15px_rgba(0,243,255,0.3)] transition-all text-sm sm:text-base"
        />
      </div>

      <!-- Status Filter -->
      <select
        v-model="statusFilter"
        class="px-4 py-2.5 border border-slate-200 dark:border-white/10 rounded-lg bg-white dark:bg-[#0a040f] text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-secondary focus:border-secondary focus:shadow-[0_0_15px_rgba(0,243,255,0.3)] transition-all text-sm sm:text-base"
      >
        <option value="">Todos os Status</option>
        <option value="active">Ativos</option>
        <option value="pending">Pendentes</option>
        <option value="banned">Banidos</option>
      </select>
    </div>

    <!-- Loading State -->
    <div v-if="loading && filteredUsers.length === 0" class="space-y-3">
      <div v-for="i in 5" :key="i" class="bg-white dark:bg-surface-card rounded-xl p-4 animate-pulse border border-slate-200 dark:border-white/5">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-slate-200 dark:bg-gray-700 rounded-full"></div>
          <div class="flex-1">
            <div class="h-4 bg-slate-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
            <div class="h-3 bg-slate-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!loading && filteredUsers.length === 0" class="text-center py-12">
      <span class="material-symbols-outlined text-slate-400 dark:text-white/40 text-6xl mb-4">people_outline</span>
      <p class="text-slate-600 dark:text-white/60 text-lg">Nenhum usuário encontrado</p>
      <p v-if="searchQuery || statusFilter" class="text-slate-500 dark:text-white/40 text-sm mt-2">
        Tente ajustar os filtros de busca
      </p>
    </div>

    <!-- Users Table -->
    <div v-else class="bg-white dark:bg-surface-card rounded-xl border border-slate-200 dark:border-white/5 overflow-hidden shadow-lg dark:shadow-xl">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-slate-50 dark:bg-surface-lighter border-b border-slate-200 dark:border-white/10">
            <tr>
              <th class="px-4 py-3 text-left text-xs sm:text-sm font-semibold text-slate-700 dark:text-white/80">Usuário</th>
              <th class="px-4 py-3 text-left text-xs sm:text-sm font-semibold text-slate-700 dark:text-white/80 hidden sm:table-cell">Área</th>
              <th class="px-4 py-3 text-left text-xs sm:text-sm font-semibold text-slate-700 dark:text-white/80">Status</th>
              <th class="px-4 py-3 text-right text-xs sm:text-sm font-semibold text-slate-700 dark:text-white/80">Ações</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 dark:divide-white/5">
            <tr
              v-for="user in filteredUsers"
              :key="user.id"
              class="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
            >
              <td class="px-4 py-4">
                <div class="flex items-center gap-3">
                  <Avatar
                    :src="user.avatar_url"
                    :name="user.nome || 'Usuário'"
                    size="md"
                  />
                  <div class="min-w-0">
                    <p class="text-slate-900 dark:text-white font-semibold text-sm sm:text-base truncate">
                      {{ user.nome || 'Usuário sem nome' }}
                    </p>
                    <p v-if="user.email" class="text-slate-500 dark:text-white/50 text-xs sm:text-sm truncate">
                      {{ user.email }}
                    </p>
                  </div>
                </div>
              </td>
              <td class="px-4 py-4 text-slate-600 dark:text-white/70 text-sm hidden sm:table-cell">
                {{ user.area_atuacao || '-' }}
              </td>
              <td class="px-4 py-4">
                <UserStatusBadge :status="user.status" />
              </td>
              <td class="px-4 py-4">
                <div class="flex items-center justify-end gap-2">
                  <button
                    v-if="user.status !== 'banned'"
                    class="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-all"
                    title="Banir"
                    @click="$emit('ban', user.id)"
                  >
                    <span class="material-symbols-outlined text-base sm:text-lg">cancel</span>
                  </button>
                  <button
                    v-if="user.status === 'banned'"
                    class="p-2 text-green-400 hover:bg-green-500/20 rounded-lg transition-all"
                    title="Desbanir Usuário"
                    @click="$emit('unban', user.id)"
                  >
                    <span class="material-symbols-outlined text-base sm:text-lg">check_circle</span>
                  </button>

                  <button
                    class="p-2 text-slate-600 dark:text-white/60 hover:bg-slate-50 dark:hover:bg-white/10 rounded-lg transition-all"
                    title="Ver Histórico"
                    @click="$emit('view-history', user.id)"
                  >
                    <span class="material-symbols-outlined text-base sm:text-lg">history</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { AdminUser, UserStatus } from '@/types/admin'
import Avatar from '@/components/ui/Avatar.vue'
import UserStatusBadge from '@/components/ui/UserStatusBadge.vue'

interface Props {
  users: AdminUser[]
  loading: boolean
}

const props = defineProps<Props>()

defineEmits<{
  suspend: [userId: string]
  ban: [userId: string]
  unban: [userId: string]
  'view-history': [userId: string]
}>()

const searchQuery = ref('')
const statusFilter = ref<UserStatus | ''>('')

const filteredUsers = computed(() => {
  let filtered = [...props.users]

  // Filter by status
  if (statusFilter.value) {
    filtered = filtered.filter(u => u.status === statusFilter.value)
  }

  // Filter by search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    filtered = filtered.filter(u => {
      const nome = (u.nome || '').toLowerCase()
      const email = (u.email || '').toLowerCase()
      const area = (u.area_atuacao || '').toLowerCase()
      return nome.includes(query) || email.includes(query) || area.includes(query)
    })
  }

  return filtered
})
</script>


