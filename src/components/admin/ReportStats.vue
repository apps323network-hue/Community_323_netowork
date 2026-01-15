<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
    <template v-if="loading">
      <div v-for="i in 4" :key="i" class="bg-white dark:bg-surface-card rounded-xl p-6 border border-slate-200 dark:border-white/5 animate-pulse h-32"></div>
    </template>
    <template v-else>
      <div class="bg-white dark:bg-surface-card rounded-xl p-6 border border-slate-200 dark:border-white/5 hover:border-secondary/50 transition-all group shadow-lg dark:shadow-xl">
        <div class="flex items-center justify-between mb-4">
          <span class="text-slate-600 dark:text-white/70 text-sm font-medium">Total</span>
          <div class="p-2 bg-slate-100 dark:bg-white/5 rounded-lg">
            <span class="material-symbols-outlined text-slate-500 dark:text-white/50 text-xl">report</span>
          </div>
        </div>
        <div class="text-4xl font-black text-slate-900 dark:text-white mb-1">{{ stats.total }}</div>
        <div class="text-xs text-slate-500 dark:text-white/40">Received Reports</div>
      </div>

      <div class="bg-white dark:bg-surface-card rounded-xl p-6 border border-slate-200 dark:border-white/5 hover:border-secondary/50 transition-all group shadow-lg dark:shadow-xl">
        <div class="flex items-center justify-between mb-4">
          <span class="text-slate-600 dark:text-white/70 text-sm font-medium">Pending</span>
          <div class="p-2 bg-slate-100 dark:bg-white/5 rounded-lg">
            <span class="material-symbols-outlined text-slate-500 dark:text-white/50 text-xl">schedule</span>
          </div>
        </div>
        <div class="text-4xl font-black text-slate-900 dark:text-white mb-1">{{ stats.pending }}</div>
        <div v-if="stats.pending > 0" class="text-xs text-yellow-600 dark:text-yellow-400/70 font-medium">Requires attention</div>
        <div v-else class="text-xs text-slate-500 dark:text-white/40">No pending reports</div>
      </div>

      <div class="bg-white dark:bg-surface-card rounded-xl p-6 border border-slate-200 dark:border-white/5 hover:border-secondary/50 transition-all group shadow-lg dark:shadow-xl">
        <div class="flex items-center justify-between mb-4">
          <span class="text-slate-600 dark:text-white/70 text-sm font-medium">Resolved Today</span>
          <div class="p-2 bg-slate-100 dark:bg-white/5 rounded-lg">
            <span class="material-symbols-outlined text-slate-500 dark:text-white/50 text-xl">check_circle</span>
          </div>
        </div>
        <div class="text-4xl font-black text-slate-900 dark:text-white mb-1">{{ stats.resolvedToday }}</div>
        <div class="text-xs text-slate-500 dark:text-white/40">Resolved today</div>
      </div>

      <div class="bg-white dark:bg-surface-card rounded-xl p-6 border border-slate-200 dark:border-white/5 hover:border-secondary/50 transition-all group shadow-lg dark:shadow-xl">
        <div class="flex items-center justify-between mb-4">
          <span class="text-slate-600 dark:text-white/70 text-sm font-medium">Resolved</span>
          <div class="p-2 bg-slate-100 dark:bg-white/5 rounded-lg">
            <span class="material-symbols-outlined text-slate-500 dark:text-white/50 text-xl">done_all</span>
          </div>
        </div>
        <div class="text-4xl font-black text-slate-900 dark:text-white mb-1">{{ stats.resolved }}</div>
        <div class="text-xs text-slate-500 dark:text-white/40">Total resolved</div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { ReportStats } from '@/types/admin'

interface Props {
  stats: ReportStats
  loading?: boolean
}

defineProps<Props>()
</script>
