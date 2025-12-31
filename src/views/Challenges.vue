<template>
  <AppLayout>
    <div class="max-w-7xl mx-auto px-4 py-8">
      <!-- Header Section -->
      <div class="mb-10 text-center lg:text-left relative">
        <div class="absolute -top-10 -left-10 w-40 h-40 bg-primary/10 blur-3xl rounded-full animate-pulse"></div>
        <h1 class="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white mb-4 relative z-10">
          <span class="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
            Desafios da Comunidade
          </span>
        </h1>
        <p class="text-lg text-slate-600 dark:text-gray-400 max-w-2xl">
          Complete desafios, ganhe pontos e suba no ranking da nossa rede. Cada ação conta para o seu crescimento!
        </p>
      </div>

      <!-- Stats Summary -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div class="bg-white dark:bg-surface-dark rounded-2xl p-6 border border-slate-200 dark:border-white/5 shadow-xl transition-all hover:scale-[1.02]">
          <div class="flex items-center gap-4 mb-2">
            <div class="p-3 bg-secondary/10 rounded-xl">
              <span class="material-symbols-outlined text-secondary">stars</span>
            </div>
            <div>
              <p class="text-sm text-slate-500 dark:text-gray-400 font-medium">Seus Pontos</p>
              <p class="text-3xl font-black text-slate-900 dark:text-white">{{ userStore.profile?.total_points || 0 }}</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white dark:bg-surface-dark rounded-2xl p-6 border border-slate-200 dark:border-white/5 shadow-xl transition-all hover:scale-[1.02]">
          <div class="flex items-center gap-4 mb-2">
            <div class="p-3 bg-primary/10 rounded-xl">
              <span class="material-symbols-outlined text-primary">task_alt</span>
            </div>
            <div>
              <p class="text-sm text-slate-500 dark:text-gray-400 font-medium">Completados</p>
              <p class="text-3xl font-black text-slate-900 dark:text-white">{{ completedCount }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-surface-dark rounded-2xl p-6 border border-slate-200 dark:border-white/5 shadow-xl transition-all hover:scale-[1.02]">
          <div class="flex items-center gap-4 mb-2">
            <div class="p-3 bg-orange-500/10 rounded-xl">
              <span class="material-symbols-outlined text-orange-500">trending_up</span>
            </div>
            <div>
              <p class="text-sm text-slate-500 dark:text-gray-400 font-medium">Posição</p>
              <p class="text-3xl font-black text-slate-900 dark:text-white">#{{ getPosition() }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Challenges List -->
      <div v-if="gamificationStore.loading" class="flex flex-col items-center justify-center py-20 gap-4">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary"></div>
        <p class="text-slate-500 dark:text-gray-400 animate-pulse">Carregando desafios...</p>
      </div>

      <div v-else-if="gamificationStore.activeChallenges.length === 0" class="text-center py-20 bg-slate-50 dark:bg-surface-dark/50 rounded-3xl border border-dashed border-slate-200 dark:border-white/10">
        <span class="material-symbols-outlined text-6xl text-slate-300 dark:text-gray-700 mb-4">emoji_events</span>
        <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-2">Nenhum desafio ativo</h3>
        <p class="text-slate-500 dark:text-gray-400">Volte em breve para novos desafios!</p>
      </div>

      <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div 
          v-for="challenge in sortedChallenges" 
          :key="challenge.id"
          class="group relative bg-white dark:bg-surface-dark rounded-2xl p-6 border border-slate-200 dark:border-white/5 shadow-lg transition-all hover:border-secondary/50 overflow-hidden"
        >
          <!-- Progress background glow -->
          <div 
            class="absolute inset-0 bg-gradient-to-r from-secondary/5 to-transparent transition-opacity"
            :style="{ opacity: getProgressPercent(challenge.id) / 100 }"
          ></div>

          <div class="relative z-10 flex flex-col h-full">
            <div class="flex justify-between items-start mb-4">
              <div class="flex items-center gap-3">
                <div class="p-2 bg-slate-100 dark:bg-white/5 rounded-lg group-hover:bg-secondary/20 transition-colors">
                  <span class="material-symbols-outlined text-slate-500 dark:text-white/60 group-hover:text-secondary">
                    {{ getIconForType(challenge.tipo) }}
                  </span>
                </div>
                <div>
                  <h3 class="font-bold text-slate-900 dark:text-white group-hover:text-secondary transition-colors">{{ challenge.nome }}</h3>
                  <p class="text-xs text-slate-500 dark:text-gray-400 uppercase tracking-wider font-bold">{{ challenge.tipo }}</p>
                </div>
              </div>
              <div class="flex flex-col items-end">
                <span class="text-lg font-black text-secondary">{{ challenge.pontos }} PTS</span>
              </div>
            </div>

            <p class="text-sm text-slate-600 dark:text-gray-400 mb-6 flex-grow">
              {{ challenge.descricao }}
            </p>

            <!-- Progress Bar -->
            <div class="mt-auto">
              <div class="flex justify-between items-end mb-2">
                <span class="text-xs font-bold text-slate-500 dark:text-gray-400">Progresso</span>
                <span class="text-xs font-black text-slate-900 dark:text-white">
                  {{ getProgressValue(challenge.id) }}%
                </span>
              </div>
              <div class="h-2 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                <div 
                  class="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-1000 ease-out"
                  :style="{ width: getProgressPercent(challenge.id) + '%' }"
                ></div>
              </div>
            </div>
            
            <div v-if="isCompleted(challenge.id)" class="absolute top-4 right-4 animate-bounce">
              <span class="material-symbols-outlined text-green-500 text-3xl drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]">
                verified
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useGamificationStore } from '@/stores/gamification'
import { useUserStore } from '@/stores/user'
import AppLayout from '@/components/layout/AppLayout.vue'

const gamificationStore = useGamificationStore()
const userStore = useUserStore()

const completedCount = computed(() => {
  return gamificationStore.userChallenges.filter(uc => uc.completado).length
})

const sortedChallenges = computed(() => {
  return [...gamificationStore.activeChallenges].sort((a, b) => {
    const aDone = isCompleted(a.id)
    const bDone = isCompleted(b.id)
    if (aDone && !bDone) return 1
    if (!aDone && bDone) return -1
    return 0
  })
})

function getProgressPercent(challengeId: string) {
  const uc = gamificationStore.userChallenges.find(u => u.challenge_id === challengeId)
  if (!uc) return 0
  // For now simple completion check
  if (uc.completado) return 100
  // If we had a goal field, we'd use it: Math.min(100, (uc.progresso / challenge.goal) * 100)
  // For demonstration, let's assume if they have progress but not completed, it's 50%
  return uc.progresso > 0 ? 50 : 0
}

function getProgressValue(challengeId: string) {
  return getProgressPercent(challengeId)
}

function isCompleted(challengeId: string) {
  return gamificationStore.userChallenges.some(uc => uc.challenge_id === challengeId && uc.completado)
}

function getIconForType(type: string) {
  const icons: Record<string, string> = {
    post: 'article',
    comment: 'chat_bubble',
    event: 'event_available',
    connection: 'person_add',
    engagement: 'thumb_up',
    other: 'extension'
  }
  return icons[type] || 'emoji_events'
}

function getPosition() {
  if (!gamificationStore.leaderboard.length) return '--'
  const index = gamificationStore.leaderboard.findIndex(u => u.id === userStore.profile?.id)
  return index !== -1 ? index + 1 : '--'
}

onMounted(async () => {
  await Promise.all([
    gamificationStore.fetchActiveChallenges(),
    gamificationStore.fetchUserChallenges(),
    gamificationStore.fetchLeaderboard(100) // Fetch top 100 to find user rank
  ])
})
</script>

<style scoped>
.shadow-neon-blue {
  box-shadow: 0 0 15px rgba(0, 240, 255, 0.2);
}
</style>
