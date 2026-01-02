<template>
  <AppLayout>
    <div class="max-w-4xl mx-auto px-4 py-8">
      <!-- Header Section -->
      <div class="mb-10 text-center relative">
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-secondary/10 blur-3xl rounded-full"></div>
        <h1 class="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white mb-4 relative z-10">
          <span class="bg-clip-text text-transparent bg-gradient-to-r from-secondary to-primary">
            Ranking Global
          </span>
        </h1>
        <p class="text-lg text-slate-600 dark:text-gray-400 max-w-2xl mx-auto">
          Veja quem são os membros mais ativos e influentes da nossa rede. Conecte-se e cresça com os melhores!
        </p>
      </div>

      <!-- Top 3 Podium (Optional but looks premium) -->
      <div v-if="!gamificationStore.loading && gamificationStore.leaderboard.length >= 3" class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 items-end">
        <!-- 2nd Place -->
        <div class="order-2 md:order-1 bg-white dark:bg-surface-dark rounded-2xl p-6 border border-slate-200 dark:border-white/5 shadow-xl text-center flex flex-col items-center">
          <div class="relative mb-4">
            <img 
              :src="gamificationStore.leaderboard[1].avatar_url || 'https://ui-avatars.com/api/?name=' + (gamificationStore.leaderboard[1].nome || 'U')" 
              class="w-20 h-20 rounded-full border-4 border-slate-300 dark:border-gray-600 shadow-lg object-cover"
            />
            <div class="absolute -bottom-2 -right-2 bg-slate-400 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold border-2 border-white dark:border-surface-dark">2</div>
          </div>
          <h3 class="font-bold text-slate-900 dark:text-white truncate w-full">{{ gamificationStore.leaderboard[1].nome }}</h3>
          <p class="text-secondary font-black">{{ gamificationStore.leaderboard[1].total_points }} PTS</p>
        </div>

        <!-- 1st Place -->
        <div class="order-1 md:order-2 bg-white dark:bg-surface-dark rounded-3xl p-8 border-2 border-secondary shadow-[0_0_30px_rgba(0,240,255,0.2)] text-center scale-110 relative z-20 flex flex-col items-center">
          <div class="absolute -top-6 left-1/2 -translate-x-1/2">
            <span class="material-symbols-outlined text-4xl text-secondary animate-bounce">emoji_events</span>
          </div>
          <div class="relative mb-4">
            <img 
              :src="gamificationStore.leaderboard[0].avatar_url || 'https://ui-avatars.com/api/?name=' + (gamificationStore.leaderboard[0].nome || 'U')" 
              class="w-24 h-24 rounded-full border-4 border-secondary shadow-lg object-cover"
            />
            <div class="absolute -bottom-2 -right-2 bg-secondary text-black w-10 h-10 rounded-full flex items-center justify-center font-black border-2 border-white dark:border-surface-dark">1</div>
          </div>
          <h3 class="text-xl font-black text-slate-900 dark:text-white truncate w-full">{{ gamificationStore.leaderboard[0].nome }}</h3>
          <p class="text-secondary text-2xl font-black">{{ gamificationStore.leaderboard[0].total_points }} PTS</p>
        </div>

        <!-- 3rd Place -->
        <div class="order-3 bg-white dark:bg-surface-dark rounded-2xl p-6 border border-slate-200 dark:border-white/5 shadow-xl text-center flex flex-col items-center">
          <div class="relative mb-4">
            <img 
              :src="gamificationStore.leaderboard[2].avatar_url || 'https://ui-avatars.com/api/?name=' + (gamificationStore.leaderboard[2].nome || 'U')" 
              class="w-20 h-20 rounded-full border-4 border-orange-700/50 shadow-lg object-cover"
            />
            <div class="absolute -bottom-2 -right-2 bg-orange-700/80 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold border-2 border-white dark:border-surface-dark">3</div>
          </div>
          <h3 class="font-bold text-slate-900 dark:text-white truncate w-full">{{ gamificationStore.leaderboard[2].nome }}</h3>
          <p class="text-secondary font-black">{{ gamificationStore.leaderboard[2].total_points }} PTS</p>
        </div>
      </div>

      <!-- Ranking Table -->
      <div class="bg-white dark:bg-surface-dark rounded-3xl border border-slate-200 dark:border-white/5 shadow-2xl overflow-hidden">
        <div v-if="gamificationStore.loading" class="flex flex-col items-center justify-center py-20 gap-4">
          <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary"></div>
          <p class="text-slate-500 dark:text-gray-400">Carregando ranking...</p>
        </div>

        <div v-else class="divide-y divide-slate-100 dark:divide-white/5">
          <div 
            v-for="(user, index) in gamificationStore.leaderboard" 
            :key="user.id"
            class="flex items-center gap-4 p-5 transition-all hover:bg-slate-50 dark:hover:bg-white/5"
            :class="{'bg-secondary/5': user.id === userStore.profile?.id}"
          >
            <!-- Rank Number -->
            <div class="w-10 text-center font-black" :class="index < 3 ? 'text-secondary' : 'text-slate-400 dark:text-gray-600'">
              {{ index + 1 }}
            </div>

            <!-- Avatar -->
            <img 
              :src="user.avatar_url || 'https://ui-avatars.com/api/?name=' + (user.nome || 'U')" 
              class="w-12 h-12 rounded-full border-2 border-slate-100 dark:border-white/10 object-cover"
            />

            <!-- User Info -->
            <div class="flex-grow">
              <div class="flex items-center gap-2">
                <h4 class="font-bold text-slate-900 dark:text-white">{{ user.nome || 'Membro da Rede' }}</h4>
                <div v-if="user.badge" class="bg-primary/20 text-primary text-[10px] px-2 py-0.5 rounded-full font-black uppercase">
                  {{ user.badge }}
                </div>
              </div>
              <p class="text-xs text-slate-500 dark:text-gray-400">{{ user.id === userStore.profile?.id ? 'Você' : 'Membro' }}</p>
            </div>

            <!-- Points -->
            <div class="text-right">
              <span class="text-lg font-black text-slate-900 dark:text-white">{{ user.total_points || 0 }}</span>
              <span class="text-[10px] font-bold text-secondary ml-1">PTS</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useGamificationStore } from '@/stores/gamification'
import { useUserStore } from '@/stores/user'
import AppLayout from '@/components/layout/AppLayout.vue'

const gamificationStore = useGamificationStore()
const userStore = useUserStore()

onMounted(async () => {
  await gamificationStore.fetchLeaderboard()
})
</script>
