<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
    <div class="bg-surface-card rounded-xl p-4 sm:p-6 border border-white/5">
      <div class="flex items-center justify-between mb-2">
        <span class="text-white/60 text-xs sm:text-sm font-medium">Total</span>
        <span class="material-symbols-outlined text-white/40 text-lg sm:text-xl">people</span>
      </div>
      <div class="text-2xl sm:text-3xl font-black text-white">{{ stats.total }}</div>
    </div>

    <div class="bg-surface-card rounded-xl p-4 sm:p-6 border border-yellow-500/20">
      <div class="flex items-center justify-between mb-2">
        <span class="text-yellow-400 text-xs sm:text-sm font-medium">Pendentes</span>
        <span class="material-symbols-outlined text-yellow-400/60 text-lg sm:text-xl">schedule</span>
      </div>
      <div class="text-2xl sm:text-3xl font-black text-yellow-400">{{ stats.pending }}</div>
      <div v-if="stats.pending > 0" class="mt-1 text-[10px] sm:text-xs text-yellow-400/60">Requer atenção</div>
    </div>

    <div class="bg-surface-card rounded-xl p-4 sm:p-6 border border-green-500/20">
      <div class="flex items-center justify-between mb-2">
        <span class="text-green-400 text-xs sm:text-sm font-medium">Ativos</span>
        <span class="material-symbols-outlined text-green-400/60 text-lg sm:text-xl">check_circle</span>
      </div>
      <div class="text-2xl sm:text-3xl font-black text-green-400">{{ stats.active }}</div>
    </div>

    <div class="bg-surface-card rounded-xl p-4 sm:p-6 border border-blue-500/20">
      <div class="flex items-center justify-between mb-2">
        <span class="text-blue-400 text-xs sm:text-sm font-medium">Novos Hoje</span>
        <span class="material-symbols-outlined text-blue-400/60 text-lg sm:text-xl">new_releases</span>
      </div>
      <div class="text-2xl sm:text-3xl font-black text-blue-400">{{ stats.newToday }}</div>
    </div>

    <div class="bg-surface-card rounded-xl p-4 sm:p-6 border border-orange-500/20">
      <div class="flex items-center justify-between mb-2">
        <span class="text-orange-400 text-xs sm:text-sm font-medium">Suspensos</span>
        <span class="material-symbols-outlined text-orange-400/60 text-lg sm:text-xl">block</span>
      </div>
      <div class="text-2xl sm:text-3xl font-black text-orange-400">{{ stats.suspended }}</div>
    </div>

    <div class="bg-surface-card rounded-xl p-4 sm:p-6 border border-red-500/20">
      <div class="flex items-center justify-between mb-2">
        <span class="text-red-400 text-xs sm:text-sm font-medium">Banidos</span>
        <span class="material-symbols-outlined text-red-400/60 text-lg sm:text-xl">cancel</span>
      </div>
      <div class="text-2xl sm:text-3xl font-black text-red-400">{{ stats.banned }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { UserStats } from '@/types/admin'

interface Props {
  stats: UserStats
}

defineProps<Props>()
</script>

