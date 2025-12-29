<template>
  <div v-if="loading && events.length === 0" class="space-y-4">
    <div v-for="i in 3" :key="i" class="bg-surface-card rounded-xl p-6 animate-pulse border border-white/5">
      <div class="h-48 bg-gray-700 rounded-lg mb-4"></div>
      <div class="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
      <div class="h-4 bg-gray-700 rounded w-1/2"></div>
    </div>
  </div>

  <div v-else-if="!loading && events.length === 0" class="text-center py-12">
    <span class="material-symbols-outlined text-white/40 text-6xl mb-4">event_busy</span>
    <p class="text-white/60 text-lg">Nenhum evento encontrado</p>
  </div>

  <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <AdminEventCard
      v-for="event in events"
      :key="event.id"
      :event="event"
      @approve="handleApprove(event.id)"
      @reject="handleReject(event.id)"
      @view-details="handleViewDetails(event.id)"
    />
  </div>
</template>

<script setup lang="ts">
import type { AdminEvent } from '@/types/admin'
import AdminEventCard from './AdminEventCard.vue'

interface Props {
  events: AdminEvent[]
  loading: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  approve: [eventId: string]
  reject: [eventId: string]
  'view-details': [eventId: string]
}>()

function handleApprove(eventId: string) {
  emit('approve', eventId)
}

function handleReject(eventId: string) {
  emit('reject', eventId)
}

function handleViewDetails(eventId: string) {
  emit('view-details', eventId)
}
</script>




