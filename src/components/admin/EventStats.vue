<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    <div class="bg-white dark:bg-surface-card rounded-xl p-6 border border-slate-200 dark:border-white/5 shadow-lg dark:shadow-xl">
      <div class="flex items-center justify-between mb-2">
        <span class="text-slate-600 dark:text-white/60 text-sm font-medium">Total</span>
        <span class="material-symbols-outlined text-slate-500 dark:text-white/40">event</span>
      </div>
      <div class="text-3xl font-black text-slate-900 dark:text-white">{{ stats.total }}</div>
    </div>

    <div class="bg-white dark:bg-surface-card rounded-xl p-6 border border-yellow-500/30 dark:border-yellow-500/20 shadow-lg dark:shadow-xl">
      <div class="flex items-center justify-between mb-2">
        <span class="text-yellow-600 dark:text-yellow-400 text-sm font-medium">Pendentes</span>
        <span class="material-symbols-outlined text-yellow-600 dark:text-yellow-400/60">schedule</span>
      </div>
      <div class="text-3xl font-black text-yellow-600 dark:text-yellow-400">{{ stats.pending }}</div>
    </div>

    <div class="bg-white dark:bg-surface-card rounded-xl p-6 border border-green-500/30 dark:border-green-500/20 shadow-lg dark:shadow-xl">
      <div class="flex items-center justify-between mb-2">
        <span class="text-green-600 dark:text-green-400 text-sm font-medium">Aprovados</span>
        <span class="material-symbols-outlined text-green-600 dark:text-green-400/60">check_circle</span>
      </div>
      <div class="text-3xl font-black text-green-600 dark:text-green-400">{{ stats.approved }}</div>
    </div>

    <div class="bg-white dark:bg-surface-card rounded-xl p-6 border border-red-500/30 dark:border-red-500/20 shadow-lg dark:shadow-xl">
      <div class="flex items-center justify-between mb-2">
        <span class="text-red-600 dark:text-red-400 text-sm font-medium">Rejeitados</span>
        <span class="material-symbols-outlined text-red-600 dark:text-red-400/60">cancel</span>
      </div>
      <div class="text-3xl font-black text-red-600 dark:text-red-400">{{ stats.rejected }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { EventStats } from '@/types/admin'

interface Props {
  stats: EventStats
}

defineProps<Props>()
</script>




