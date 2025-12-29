<template>
  <AdminLayout>
    <div class="w-full flex flex-col gap-8">
      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-white text-4xl lg:text-5xl font-black mb-3">
          <span class="bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-primary animate-gradient">Overview</span>
        </h1>
        <p class="text-white/60 text-lg">
          Visão geral do dashboard de administração
        </p>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <!-- Total Membros -->
        <div class="bg-surface-dark rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all group">
          <div class="flex items-center justify-between mb-4">
            <span class="text-white/70 text-sm font-medium">Total de Membros</span>
            <div class="p-2 bg-white/5 rounded-lg">
              <span class="material-symbols-outlined text-white/50 text-xl">people</span>
            </div>
          </div>
          <div class="text-3xl font-black text-white mb-1">{{ userStats.total }}</div>
          <div class="text-xs text-white/40">Membros cadastrados</div>
        </div>

        <!-- Pendentes -->
        <div class="bg-surface-dark rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all group">
          <div class="flex items-center justify-between mb-4">
            <span class="text-white/70 text-sm font-medium">Pendentes</span>
            <div class="p-2 bg-white/5 rounded-lg">
              <span class="material-symbols-outlined text-white/50 text-xl">schedule</span>
            </div>
          </div>
          <div class="text-3xl font-black text-white mb-1">{{ userStats.pending }}</div>
          <div v-if="userStats.pending > 0" class="text-xs text-yellow-400/70 font-medium">Requer atenção</div>
          <div v-else class="text-xs text-white/40">Nenhum pendente</div>
        </div>

        <!-- Posts Pendentes -->
        <div class="bg-surface-dark rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all group">
          <div class="flex items-center justify-between mb-4">
            <span class="text-white/70 text-sm font-medium">Posts Pendentes</span>
            <div class="p-2 bg-white/5 rounded-lg">
              <span class="material-symbols-outlined text-white/50 text-xl">article</span>
            </div>
          </div>
          <div class="text-3xl font-black text-white mb-1">{{ postStats.pending }}</div>
          <div v-if="postStats.pending > 0" class="text-xs text-yellow-400/70 font-medium">Aguardando moderação</div>
          <div v-else class="text-xs text-white/40">Nenhum pendente</div>
        </div>

        <!-- Total Posts -->
        <div class="bg-surface-dark rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all group">
          <div class="flex items-center justify-between mb-4">
            <span class="text-white/70 text-sm font-medium">Total de Posts</span>
            <div class="p-2 bg-white/5 rounded-lg">
              <span class="material-symbols-outlined text-white/50 text-xl">description</span>
            </div>
          </div>
          <div class="text-3xl font-black text-white mb-1">{{ postStats.total }}</div>
          <div class="text-xs text-white/40">Posts publicados</div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Ações Rápidas -->
        <div class="bg-surface-dark rounded-xl p-6 border border-white/10">
          <h2 class="text-white text-xl font-bold mb-4">Ações Rápidas</h2>
          <div class="space-y-3">
            <RouterLink
              to="/admin/membros"
              class="flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-colors group"
            >
              <div class="p-2 bg-primary/20 rounded-lg group-hover:bg-primary/30 transition-colors">
                <span class="material-symbols-outlined text-primary text-xl">people</span>
              </div>
              <div class="flex-1">
                <p class="text-white font-medium">Gerenciar Membros</p>
                <p class="text-white/50 text-sm">{{ userStats.pending }} pendentes</p>
              </div>
              <span class="material-symbols-outlined text-white/40 group-hover:text-white">chevron_right</span>
            </RouterLink>

            <RouterLink
              to="/admin/posts"
              class="flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-colors group"
            >
              <div class="p-2 bg-primary/20 rounded-lg group-hover:bg-primary/30 transition-colors">
                <span class="material-symbols-outlined text-primary text-xl">article</span>
              </div>
              <div class="flex-1">
                <p class="text-white font-medium">Moderar Posts</p>
                <p class="text-white/50 text-sm">{{ postStats.pending }} pendentes</p>
              </div>
              <span class="material-symbols-outlined text-white/40 group-hover:text-white">chevron_right</span>
            </RouterLink>

            <RouterLink
              to="/admin/eventos"
              class="flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-colors group"
            >
              <div class="p-2 bg-primary/20 rounded-lg group-hover:bg-primary/30 transition-colors">
                <span class="material-symbols-outlined text-primary text-xl">event</span>
              </div>
              <div class="flex-1">
                <p class="text-white font-medium">Gerenciar Eventos</p>
                <p class="text-white/50 text-sm">Ver todos os eventos</p>
              </div>
              <span class="material-symbols-outlined text-white/40 group-hover:text-white">chevron_right</span>
            </RouterLink>
          </div>
        </div>

        <!-- Estatísticas Detalhadas -->
        <div class="bg-surface-dark rounded-xl p-6 border border-white/10">
          <h2 class="text-white text-xl font-bold mb-4">Estatísticas Detalhadas</h2>
          <div class="space-y-4">
            <div class="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div class="flex items-center gap-3">
                <span class="material-symbols-outlined text-white/50">check_circle</span>
                <span class="text-white/70 text-sm">Membros Ativos</span>
              </div>
              <span class="text-white font-bold">{{ userStats.active }}</span>
            </div>
            <div class="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div class="flex items-center gap-3">
                <span class="material-symbols-outlined text-white/50">new_releases</span>
                <span class="text-white/70 text-sm">Novos Hoje</span>
              </div>
              <span class="text-white font-bold">{{ userStats.newToday }}</span>
            </div>
            <div class="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div class="flex items-center gap-3">
                <span class="material-symbols-outlined text-white/50">block</span>
                <span class="text-white/70 text-sm">Suspensos</span>
              </div>
              <span class="text-white font-bold">{{ userStats.suspended }}</span>
            </div>
            <div class="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div class="flex items-center gap-3">
                <span class="material-symbols-outlined text-white/50">cancel</span>
                <span class="text-white/70 text-sm">Banidos</span>
              </div>
              <span class="text-white font-bold">{{ userStats.banned }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAdminStore } from '@/stores/admin'
import AdminLayout from '@/components/layout/admin/AdminLayout.vue'

const router = useRouter()
const adminStore = useAdminStore()

const userStats = computed(() => adminStore.userStats)
const postStats = computed(() => adminStore.postStats)

onMounted(async () => {
  // Verificar se é admin
  const isAdmin = await adminStore.checkIsAdmin()
  if (!isAdmin) {
    router.push('/')
    return
  }

  // Carregar estatísticas
  await adminStore.fetchUserStats()
  await adminStore.fetchPostStats()
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

