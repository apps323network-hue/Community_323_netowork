<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    <div class="bg-surface-card rounded-xl p-6 border border-white/5">
      <div class="flex items-center justify-between mb-2">
        <span class="text-white/60 text-sm font-medium">Total</span>
        <span class="material-symbols-outlined text-white/40">event</span>
      </div>
      <div class="text-3xl font-black text-white">{{ stats.total }}</div>
    </div>

    <div class="bg-surface-card rounded-xl p-6 border border-yellow-500/20">
      <div class="flex items-center justify-between mb-2">
        <span class="text-yellow-400 text-sm font-medium">Pendentes</span>
        <span class="material-symbols-outlined text-yellow-400/60">schedule</span>
      </div>
      <div class="text-3xl font-black text-yellow-400">{{ stats.pending }}</div>
    </div>

    <div class="bg-surface-card rounded-xl p-6 border border-green-500/20">
      <div class="flex items-center justify-between mb-2">
        <span class="text-green-400 text-sm font-medium">Aprovados</span>
        <span class="material-symbols-outlined text-green-400/60">check_circle</span>
      </div>
      <div class="text-3xl font-black text-green-400">{{ stats.approved }}</div>
    </div>

    <div class="bg-surface-card rounded-xl p-6 border border-red-500/20">
      <div class="flex items-center justify-between mb-2">
        <span class="text-red-400 text-sm font-medium">Rejeitados</span>
        <span class="material-symbols-outlined text-red-400/60">cancel</span>
      </div>
      <div class="text-3xl font-black text-red-400">{{ stats.rejected }}</div>
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




