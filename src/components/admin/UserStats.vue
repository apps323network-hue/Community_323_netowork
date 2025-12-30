<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
    <div class="bg-white dark:bg-surface-card rounded-xl p-6 border border-slate-200 dark:border-white/5 hover:border-secondary/50 transition-all group shadow-lg dark:shadow-xl">
      <div class="flex items-center justify-between mb-4">
        <span class="text-slate-600 dark:text-white/70 text-sm font-medium">Total</span>
        <div class="p-2 bg-slate-100 dark:bg-white/5 rounded-lg">
          <span class="material-symbols-outlined text-slate-500 dark:text-white/50 text-xl">people</span>
        </div>
      </div>
      <div class="text-4xl font-black text-slate-900 dark:text-white mb-1">{{ stats.total }}</div>
      <div class="text-xs text-slate-500 dark:text-white/40">Membros cadastrados</div>
    </div>

    <div class="bg-surface-dark rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all group">
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

    <div class="bg-surface-dark rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all group">
      <div class="flex items-center justify-between mb-4">
        <span class="text-slate-600 dark:text-white/70 text-sm font-medium">Ativos</span>
        <div class="p-2 bg-slate-100 dark:bg-white/5 rounded-lg">
          <span class="material-symbols-outlined text-slate-500 dark:text-white/50 text-xl">check_circle</span>
        </div>
      </div>
      <div class="text-4xl font-black text-slate-900 dark:text-white mb-1">{{ stats.active }}</div>
      <div class="text-xs text-slate-500 dark:text-white/40">Membros ativos</div>
    </div>

    <div class="bg-surface-dark rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all group">
      <div class="flex items-center justify-between mb-4">
        <span class="text-slate-600 dark:text-white/70 text-sm font-medium">Novos Hoje</span>
        <div class="p-2 bg-slate-100 dark:bg-white/5 rounded-lg">
          <span class="material-symbols-outlined text-slate-500 dark:text-white/50 text-xl">new_releases</span>
        </div>
      </div>
      <div class="text-4xl font-black text-slate-900 dark:text-white mb-1">{{ stats.newToday }}</div>
      <div class="text-xs text-slate-500 dark:text-white/40">Cadastros hoje</div>
    </div>

    <div class="bg-surface-dark rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all group">
      <div class="flex items-center justify-between mb-4">
        <span class="text-slate-600 dark:text-white/70 text-sm font-medium">Suspensos</span>
        <div class="p-2 bg-slate-100 dark:bg-white/5 rounded-lg">
          <span class="material-symbols-outlined text-slate-500 dark:text-white/50 text-xl">block</span>
        </div>
      </div>
      <div class="text-4xl font-black text-slate-900 dark:text-white mb-1">{{ stats.suspended }}</div>
      <div class="text-xs text-slate-500 dark:text-white/40">Membros suspensos</div>
    </div>

    <div class="bg-surface-dark rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all group">
      <div class="flex items-center justify-between mb-4">
        <span class="text-slate-600 dark:text-white/70 text-sm font-medium">Banidos</span>
        <div class="p-2 bg-slate-100 dark:bg-white/5 rounded-lg">
          <span class="material-symbols-outlined text-slate-500 dark:text-white/50 text-xl">cancel</span>
        </div>
      </div>
      <div class="text-4xl font-black text-slate-900 dark:text-white mb-1">{{ stats.banned }}</div>
      <div class="text-xs text-slate-500 dark:text-white/40">Membros banidos</div>
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

