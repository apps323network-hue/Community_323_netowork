<template>
  <AdminLayout>
    <div class="w-full flex flex-col gap-6 sm:gap-8">
      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-slate-900 dark:text-white text-4xl lg:text-5xl font-black mb-3">
          <span class="bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-primary animate-gradient">Challenges</span>
        </h1>
        <p class="text-slate-600 dark:text-white/60 text-lg">
          Manage challenges for gamification and community engagement
        </p>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div class="bg-white dark:bg-surface-card rounded-xl p-6 border border-slate-200 dark:border-white/5 hover:border-secondary/50 transition-all shadow-lg dark:shadow-xl">
          <div class="flex items-center justify-between mb-4">
            <span class="text-slate-600 dark:text-white/70 text-sm font-medium">Total</span>
            <div class="p-2 bg-slate-100 dark:bg-white/5 rounded-lg">
              <span class="material-symbols-outlined text-slate-500 dark:text-white/50 text-xl">emoji_events</span>
            </div>
          </div>
          <div class="text-4xl font-black text-slate-900 dark:text-white mb-1">{{ challengeStats.total }}</div>
          <div class="text-xs text-slate-500 dark:text-white/40">Registered Challenges</div>
        </div>

        <div class="bg-white dark:bg-surface-card rounded-xl p-6 border border-slate-200 dark:border-white/5 hover:border-secondary/50 transition-all shadow-lg dark:shadow-xl">
          <div class="flex items-center justify-between mb-4">
            <span class="text-slate-600 dark:text-white/70 text-sm font-medium">Active</span>
            <div class="p-2 bg-slate-100 dark:bg-white/5 rounded-lg">
              <span class="material-symbols-outlined text-slate-500 dark:text-white/50 text-xl">check_circle</span>
            </div>
          </div>
          <div class="text-4xl font-black text-slate-900 dark:text-white mb-1">{{ challengeStats.active }}</div>
          <div class="text-xs text-slate-500 dark:text-white/40">Active Challenges</div>
        </div>

        <div class="bg-white dark:bg-surface-card rounded-xl p-6 border border-slate-200 dark:border-white/5 hover:border-secondary/50 transition-all shadow-lg dark:shadow-xl">
          <div class="flex items-center justify-between mb-4">
            <span class="text-slate-600 dark:text-white/70 text-sm font-medium">Participants</span>
            <div class="p-2 bg-slate-100 dark:bg-white/5 rounded-lg">
              <span class="material-symbols-outlined text-slate-500 dark:text-white/50 text-xl">people</span>
            </div>
          </div>
          <div class="text-4xl font-black text-slate-900 dark:text-white mb-1">{{ challengeStats.totalParticipants }}</div>
          <div class="text-xs text-slate-500 dark:text-white/40">Total Participants</div>
        </div>

        <div class="bg-white dark:bg-surface-card rounded-xl p-6 border border-slate-200 dark:border-white/5 hover:border-secondary/50 transition-all shadow-lg dark:shadow-xl">
          <div class="flex items-center justify-between mb-4">
            <span class="text-slate-600 dark:text-white/70 text-sm font-medium">Completed</span>
            <div class="p-2 bg-slate-100 dark:bg-white/5 rounded-lg">
              <span class="material-symbols-outlined text-slate-500 dark:text-white/50 text-xl">stars</span>
            </div>
          </div>
          <div class="text-4xl font-black text-slate-900 dark:text-white mb-1">{{ challengeStats.totalCompleted }}</div>
          <div class="text-xs text-slate-500 dark:text-white/40">Completed Challenges</div>
        </div>
      </div>

      <!-- Componente de Gerenciamento -->
      <AdminChallenges />
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAdminStore } from '@/stores/admin'
import AdminLayout from '@/components/layout/admin/AdminLayout.vue'
import AdminChallenges from '@/components/admin/AdminChallenges.vue'

const router = useRouter()
const adminStore = useAdminStore()

const challengeStats = computed(() => adminStore.challengeStats)

onMounted(async () => {
  // Verificar se é admin
  const isAdmin = await adminStore.checkIsAdmin()
  if (!isAdmin) {
    router.push('/')
    return
  }

  await Promise.all([
    adminStore.fetchChallenges(),
    adminStore.fetchChallengeStats()
  ])
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

