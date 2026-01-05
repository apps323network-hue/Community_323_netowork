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
      class="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 hover:border-secondary/50 dark:hover:border-primary/50 transition-all shadow-sm hover:shadow-md"
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
            <h3 class="text-slate-900 dark:text-white text-xl font-bold mb-1 truncate">
              {{ user.nome || 'Usuário sem nome' }}
            </h3>
            <div class="space-y-1 text-sm text-slate-600 dark:text-slate-300">
              <p v-if="user.area_atuacao" class="flex items-center gap-2">
                <span class="material-symbols-outlined text-base">work</span>
                <span class="truncate">{{ user.area_atuacao }}</span>
              </p>
              <p v-if="user.cidade || user.pais" class="flex items-center gap-2">
                <span class="material-symbols-outlined text-base">location_on</span>
                <span class="truncate">{{ [user.cidade, user.pais].filter(Boolean).join(', ') }}</span>
              </p>
              <p class="flex items-center gap-2 text-xs opacity-75">
                <span class="material-symbols-outlined text-base">calendar_today</span>
                <span>Cadastrado em {{ formattedDate(user.created_at) }}</span>
              </p>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <button
            class="flex items-center justify-center gap-2 px-4 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-600 dark:text-green-400 border border-green-500/20 hover:border-green-500/40 rounded-lg font-semibold transition-all"
            title="Aprovar"
            @click="$emit('approve', user.id)"
          >
            <span class="material-symbols-outlined">check</span>
            <span class="sm:hidden">Aprovar</span>
          </button>
          
          <button
            class="flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20 hover:border-red-500/40 rounded-lg font-semibold transition-all"
            title="Rejeitar"
            @click="$emit('reject', user.id)"
          >
            <span class="material-symbols-outlined">close</span>
            <span class="sm:hidden">Rejeitar</span>
          </button>

          <button
            class="flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-white border border-slate-200 dark:border-slate-600 rounded-lg font-semibold transition-all"
            @click="$emit('view-profile', user.id)"
          >
            <span class="material-symbols-outlined">visibility</span>
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

