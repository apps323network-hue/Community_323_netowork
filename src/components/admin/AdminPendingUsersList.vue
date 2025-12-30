<template>
  <div v-if="loading && users.length === 0" class="space-y-4">
    <div v-for="i in 3" :key="i" class="bg-white dark:bg-surface-card rounded-xl p-4 sm:p-6 animate-pulse border border-slate-200 dark:border-white/5">
      <div class="flex items-center gap-4">
        <div class="w-16 h-16 bg-slate-200 dark:bg-gray-700 rounded-full"></div>
        <div class="flex-1">
          <div class="h-4 bg-slate-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
          <div class="h-3 bg-slate-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    </div>
  </div>

  <div v-else-if="!loading && users.length === 0" class="text-center py-12">
    <span class="material-symbols-outlined text-slate-400 dark:text-white/40 text-6xl mb-4">people_outline</span>
    <p class="text-slate-600 dark:text-white/60 text-lg">Nenhum usuário pendente</p>
    <p class="text-slate-500 dark:text-white/40 text-sm mt-2">Todos os usuários foram processados</p>
  </div>

  <div v-else class="space-y-4">
    <div
      v-for="user in users"
      :key="user.id"
      class="bg-white dark:bg-gradient-to-br dark:from-surface-dark dark:to-surface-darker rounded-2xl p-6 border-2 border-slate-200 dark:border-white/10 hover:border-secondary/50 dark:hover:border-primary/30 transition-all shadow-lg dark:shadow-xl hover:shadow-xl dark:hover:shadow-primary/10 group"
    >
      <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <!-- Avatar and Info -->
        <div class="flex items-center gap-4 flex-1 min-w-0 w-full sm:w-auto">
          <Avatar
            :src="user.avatar_url"
            :name="user.nome || 'Usuário'"
            size="lg"
          />
          <div class="flex-1 min-w-0">
            <h3 class="text-slate-900 dark:text-white text-xl font-black mb-2 truncate">
              {{ user.nome || 'Usuário sem nome' }}
            </h3>
            <div class="space-y-2 text-sm text-slate-600 dark:text-white/70">
              <p v-if="user.area_atuacao" class="flex items-center gap-2">
                <span class="material-symbols-outlined text-base">work</span>
                <span class="truncate">{{ user.area_atuacao }}</span>
              </p>
              <p v-if="user.cidade || user.pais" class="flex items-center gap-2">
                <span class="material-symbols-outlined text-base">location_on</span>
                <span class="truncate">{{ [user.cidade, user.pais].filter(Boolean).join(', ') }}</span>
              </p>
              <p class="flex items-center gap-2">
                <span class="material-symbols-outlined text-base">calendar_today</span>
                <span>Cadastrado em {{ formattedDate(user.created_at) }}</span>
              </p>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <button
            class="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500/20 to-green-500/10 hover:from-green-500/30 hover:to-green-500/20 text-green-400 border-2 border-green-500/40 hover:border-green-500/60 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl hover:shadow-green-500/20"
            @click="$emit('approve', user.id)"
          >
            <span class="material-symbols-outlined text-xl">check_circle</span>
            <span>Aprovar</span>
          </button>
          <button
            class="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500/20 to-red-500/10 hover:from-red-500/30 hover:to-red-500/20 text-red-400 border-2 border-red-500/40 hover:border-red-500/60 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl hover:shadow-red-500/20"
            @click="$emit('reject', user.id)"
          >
            <span class="material-symbols-outlined text-xl">cancel</span>
            <span>Rejeitar</span>
          </button>
          <button
            class="flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-gradient-to-r dark:from-white/5 dark:to-white/0 hover:bg-slate-50 dark:hover:from-white/10 dark:hover:to-white/5 text-slate-700 dark:text-white border-2 border-slate-200 dark:border-white/20 hover:border-secondary dark:hover:border-white/30 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl"
            @click="$emit('view-profile', user.id)"
          >
            <span class="material-symbols-outlined text-xl">visibility</span>
            <span>Ver Perfil</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AdminUser } from '@/types/admin'
import Avatar from '@/components/ui/Avatar.vue'

interface Props {
  users: AdminUser[]
  loading: boolean
}

defineProps<Props>()

defineEmits<{
  approve: [userId: string]
  reject: [userId: string]
  'view-profile': [userId: string]
}>()

function formattedDate(dateString?: string) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}
</script>

