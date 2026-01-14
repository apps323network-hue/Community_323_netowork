<template>
  <AdminLayout>
    <div class="w-full flex flex-col gap-8">
      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-slate-900 dark:text-white text-4xl lg:text-5xl font-black mb-3">
          <span class="bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-primary animate-gradient">Overview</span>
        </h1>
        <p class="text-slate-600 dark:text-white/60 text-lg">
          Administration dashboard overview
        </p>
      </div>

      <!-- Stats Grid -->
      <div v-if="initialLoading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div v-for="i in 4" :key="i" class="bg-white dark:bg-surface-card rounded-xl p-6 border border-slate-200 dark:border-white/5 animate-pulse h-32"></div>
      </div>
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <!-- Total Membros -->
        <div class="bg-white dark:bg-surface-card rounded-xl p-6 border border-slate-200 dark:border-white/5 hover:border-secondary/50 transition-all group shadow-lg dark:shadow-xl">
          <div class="flex items-center justify-between mb-4">
            <span class="text-slate-600 dark:text-white/70 text-sm font-medium">Total Members</span>
            <div class="p-2 bg-slate-100 dark:bg-white/5 rounded-lg">
              <span class="material-symbols-outlined text-slate-500 dark:text-white/50 text-xl">people</span>
            </div>
          </div>
          <div class="text-3xl font-black text-slate-900 dark:text-white mb-1">{{ userStats.total }}</div>
          <div class="text-xs text-slate-500 dark:text-white/40">Registered members</div>
        </div>

        <!-- Pendentes -->
        <div class="bg-white dark:bg-surface-card rounded-xl p-6 border border-slate-200 dark:border-white/5 hover:border-secondary/50 transition-all group shadow-lg dark:shadow-xl">
          <div class="flex items-center justify-between mb-4">
            <span class="text-slate-600 dark:text-white/70 text-sm font-medium">Pending</span>
            <div class="p-2 bg-slate-100 dark:bg-white/5 rounded-lg">
              <span class="material-symbols-outlined text-slate-500 dark:text-white/50 text-xl">schedule</span>
            </div>
          </div>
          <div class="text-3xl font-black text-slate-900 dark:text-white mb-1">{{ userStats.pending }}</div>
          <div v-if="userStats.pending > 0" class="text-xs text-yellow-600 dark:text-yellow-400/70 font-medium">Requires attention</div>
          <div v-else class="text-xs text-slate-500 dark:text-white/40">None pending</div>
        </div>

        <!-- Posts Pendentes -->
        <div class="bg-white dark:bg-surface-card rounded-xl p-6 border border-slate-200 dark:border-white/5 hover:border-secondary/50 transition-all group shadow-lg dark:shadow-xl">
          <div class="flex items-center justify-between mb-4">
            <span class="text-slate-600 dark:text-white/70 text-sm font-medium">Pending Posts</span>
            <div class="p-2 bg-slate-100 dark:bg-white/5 rounded-lg">
              <span class="material-symbols-outlined text-slate-500 dark:text-white/50 text-xl">article</span>
            </div>
          </div>
          <div class="text-3xl font-black text-slate-900 dark:text-white mb-1">{{ postStats.pending }}</div>
          <div v-if="postStats.pending > 0" class="text-xs text-yellow-600 dark:text-yellow-400/70 font-medium">Awaiting moderation</div>
          <div v-else class="text-xs text-slate-500 dark:text-white/40">None pending</div>
        </div>

        <!-- Total Posts -->
        <div class="bg-white dark:bg-surface-card rounded-xl p-6 border border-slate-200 dark:border-white/5 hover:border-secondary/50 transition-all group shadow-lg dark:shadow-xl">
          <div class="flex items-center justify-between mb-4">
            <span class="text-slate-600 dark:text-white/70 text-sm font-medium">Total Posts</span>
            <div class="p-2 bg-slate-100 dark:bg-white/5 rounded-lg">
              <span class="material-symbols-outlined text-slate-500 dark:text-white/50 text-xl">description</span>
            </div>
          </div>
          <div class="text-3xl font-black text-slate-900 dark:text-white mb-1">{{ postStats.total }}</div>
          <div class="text-xs text-slate-500 dark:text-white/40">Published posts</div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div v-if="initialLoading" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white dark:bg-surface-card rounded-xl p-6 border border-slate-200 dark:border-white/5 animate-pulse h-64"></div>
        <div class="bg-white dark:bg-surface-card rounded-xl p-6 border border-slate-200 dark:border-white/5 animate-pulse h-64"></div>
      </div>
      <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Ações Rápidas -->
        <div class="bg-white dark:bg-surface-card rounded-xl p-6 border border-slate-200 dark:border-white/5 shadow-lg dark:shadow-xl">
          <h2 class="text-slate-900 dark:text-white text-xl font-bold mb-4">Quick Actions</h2>
          <div class="space-y-3">
            <RouterLink
              to="/admin/membros"
              class="flex items-center gap-3 p-4 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors group"
            >
              <div class="p-2 bg-primary/10 dark:bg-primary/20 rounded-lg group-hover:bg-primary/20 dark:group-hover:bg-primary/30 transition-colors">
                <span class="material-symbols-outlined text-primary text-xl">people</span>
              </div>
              <div class="flex-1">
                <p class="text-slate-900 dark:text-white font-medium">Manage Members</p>
                <p class="text-slate-600 dark:text-white/50 text-sm">{{ userStats.pending }} pending</p>
              </div>
              <span class="material-symbols-outlined text-slate-400 dark:text-white/40 group-hover:text-slate-900 dark:group-hover:text-white">chevron_right</span>
            </RouterLink>

            <RouterLink
              to="/admin/posts"
              class="flex items-center gap-3 p-4 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors group"
            >
              <div class="p-2 bg-primary/10 dark:bg-primary/20 rounded-lg group-hover:bg-primary/20 dark:group-hover:bg-primary/30 transition-colors">
                <span class="material-symbols-outlined text-primary text-xl">article</span>
              </div>
              <div class="flex-1">
                <p class="text-slate-900 dark:text-white font-medium">Moderate Posts</p>
                <p class="text-slate-600 dark:text-white/50 text-sm">{{ postStats.pending }} pending</p>
              </div>
              <span class="material-symbols-outlined text-slate-400 dark:text-white/40 group-hover:text-slate-900 dark:group-hover:text-white">chevron_right</span>
            </RouterLink>

            <RouterLink
              to="/admin/eventos"
              class="flex items-center gap-3 p-4 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors group"
            >
              <div class="p-2 bg-primary/10 dark:bg-primary/20 rounded-lg group-hover:bg-primary/20 dark:group-hover:bg-primary/30 transition-colors">
                <span class="material-symbols-outlined text-primary text-xl">event</span>
              </div>
              <div class="flex-1">
                <p class="text-slate-900 dark:text-white font-medium">Manage Events</p>
                <p class="text-slate-600 dark:text-white/50 text-sm">View all events</p>
              </div>
              <span class="material-symbols-outlined text-slate-400 dark:text-white/40 group-hover:text-slate-900 dark:group-hover:text-white">chevron_right</span>
            </RouterLink>
          </div>
        </div>

        <!-- Estatísticas Detalhadas -->
        <div class="bg-white dark:bg-surface-card rounded-xl p-6 border border-slate-200 dark:border-white/5 shadow-lg dark:shadow-xl">
          <h2 class="text-slate-900 dark:text-white text-xl font-bold mb-4">Detailed Statistics</h2>
          <div class="space-y-4">
            <div class="flex items-center justify-between p-3 bg-slate-50 dark:bg-white/5 rounded-lg">
              <div class="flex items-center gap-3">
                <span class="material-symbols-outlined text-slate-500 dark:text-white/50">check_circle</span>
                <span class="text-slate-600 dark:text-white/70 text-sm">Active Members</span>
              </div>
              <span class="text-slate-900 dark:text-white font-bold">{{ userStats.active }}</span>
            </div>
            <div class="flex items-center justify-between p-3 bg-slate-50 dark:bg-white/5 rounded-lg">
              <div class="flex items-center gap-3">
                <span class="material-symbols-outlined text-slate-500 dark:text-white/50">new_releases</span>
                <span class="text-slate-600 dark:text-white/70 text-sm">New Today</span>
              </div>
              <span class="text-slate-900 dark:text-white font-bold">{{ userStats.newToday }}</span>
            </div>
            <div class="flex items-center justify-between p-3 bg-slate-50 dark:bg-white/5 rounded-lg">
              <div class="flex items-center gap-3">
                <span class="material-symbols-outlined text-slate-500 dark:text-white/50">block</span>
                <span class="text-slate-600 dark:text-white/70 text-sm">Suspended</span>
              </div>
              <span class="text-slate-900 dark:text-white font-bold">{{ userStats.suspended }}</span>
            </div>
            <div class="flex items-center justify-between p-3 bg-slate-50 dark:bg-white/5 rounded-lg">
              <div class="flex items-center gap-3">
                <span class="material-symbols-outlined text-slate-500 dark:text-white/50">cancel</span>
                <span class="text-slate-600 dark:text-white/70 text-sm">Banned</span>
              </div>
              <span class="text-slate-900 dark:text-white font-bold">{{ userStats.banned }}</span>
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

const initialLoading = ref(true)
const userStats = computed(() => adminStore.userStats)
const postStats = computed(() => adminStore.postStats)

onMounted(async () => {
  initialLoading.value = true
  try {
    // Verificar se é admin
    const isAdmin = await adminStore.checkIsAdmin()
    if (!isAdmin) {
      router.push('/')
      return
    }

    // Carregar estatísticas
    await Promise.all([
      adminStore.fetchUserStats(),
      adminStore.fetchPostStats()
    ])
  } finally {
    initialLoading.value = false
  }
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

