<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
    <div class="bg-white dark:bg-surface-card rounded-xl p-6 border border-slate-200 dark:border-white/5 hover:border-secondary/50 transition-all group shadow-lg dark:shadow-xl">
      <div class="flex items-center justify-between mb-4">
        <span class="text-slate-600 dark:text-white/70 text-sm font-medium">Total</span>
        <div class="p-2 bg-slate-100 dark:bg-white/5 rounded-lg">
          <span class="material-symbols-outlined text-slate-500 dark:text-white/50 text-xl">article</span>
        </div>
      </div>
      <div class="text-4xl font-black text-slate-900 dark:text-white mb-1">{{ stats.total }}</div>
      <div class="text-xs text-slate-500 dark:text-white/40">Posts publicados</div>
    </div>

    <div class="bg-white dark:bg-surface-card rounded-xl p-6 border border-slate-200 dark:border-white/5 hover:border-secondary/50 transition-all group shadow-lg dark:shadow-xl">
      <div class="flex items-center justify-between mb-4">
        <span class="text-slate-600 dark:text-white/70 text-sm font-medium">Pendentes</span>
        <div class="p-2 bg-slate-100 dark:bg-white/5 rounded-lg">
          <span class="material-symbols-outlined text-slate-500 dark:text-white/50 text-xl">schedule</span>
        </div>
      </div>
      <div class="text-4xl font-black text-slate-900 dark:text-white mb-1">{{ stats.pending }}</div>
      <div v-if="stats.pending > 0" class="text-xs text-yellow-600 dark:text-yellow-400/70 font-medium">Requer atenção</div>
      <div v-else class="text-xs text-slate-500 dark:text-white/40">Nenhum pendente</div>
    </div>

    <div class="bg-white dark:bg-surface-card rounded-xl p-6 border border-slate-200 dark:border-white/5 hover:border-secondary/50 transition-all group shadow-lg dark:shadow-xl">
      <div class="flex items-center justify-between mb-4">
        <span class="text-slate-600 dark:text-white/70 text-sm font-medium">Ocultos</span>
        <div class="p-2 bg-slate-100 dark:bg-white/5 rounded-lg">
          <span class="material-symbols-outlined text-slate-500 dark:text-white/50 text-xl">visibility_off</span>
        </div>
      </div>
      <div class="text-4xl font-black text-slate-900 dark:text-white mb-1">{{ stats.hidden }}</div>
      <div class="text-xs text-slate-500 dark:text-white/40">Posts ocultos</div>
    </div>

    <div class="bg-white dark:bg-surface-card rounded-xl p-6 border border-slate-200 dark:border-white/5 hover:border-secondary/50 transition-all group shadow-lg dark:shadow-xl">
      <div class="flex items-center justify-between mb-4">
        <span class="text-slate-600 dark:text-white/70 text-sm font-medium">Spam</span>
        <div class="p-2 bg-slate-100 dark:bg-white/5 rounded-lg">
          <span class="material-symbols-outlined text-slate-500 dark:text-white/50 text-xl">report</span>
        </div>
      </div>
      <div class="text-4xl font-black text-slate-900 dark:text-white mb-1">{{ stats.spam }}</div>
      <div class="text-xs text-slate-500 dark:text-white/40">Marcados como spam</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PostStats } from '@/types/admin'

interface Props {
  stats: PostStats
}

defineProps<Props>()
</script>

