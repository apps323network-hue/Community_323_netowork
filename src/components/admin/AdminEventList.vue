<template>
  <div v-if="loading && events.length === 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <div v-for="i in 3" :key="i" class="bg-white dark:bg-surface-card rounded-xl p-6 animate-pulse border border-slate-200 dark:border-white/5 h-80">
      <div class="h-48 bg-slate-200 dark:bg-white/10 rounded-lg mb-4"></div>
      <div class="h-6 bg-slate-200 dark:bg-white/10 rounded w-3/4 mb-2"></div>
      <div class="h-4 bg-slate-200 dark:bg-white/10 rounded w-1/2"></div>
    </div>
  </div>

  <div v-else-if="!loading && events.length === 0" class="flex flex-col items-center justify-center py-12 bg-slate-50 dark:bg-surface-dark/50 rounded-xl border border-slate-200 dark:border-white/10 w-full col-span-full">
    <span class="material-symbols-outlined text-slate-400 dark:text-gray-500 text-6xl mb-4">event_busy</span>
    <p class="text-slate-500 dark:text-gray-400 font-medium">No events found</p>
  </div>

  <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <AdminEventCard
        v-for="event in events"
        :key="event.id"
        :event="event"
        @approve="handleApprove(event.id)"
        @reject="handleReject(event.id)"
        @view-details="handleViewDetails(event.id)"
        @view-attendees="handleViewAttendees(event)"
        @toggle-destaque="handleToggleDestaque(event.id)"
        @delete="handleDelete(event.id)"
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
  'view-attendees': [event: AdminEvent]
  'toggle-destaque': [eventId: string]
  delete: [eventId: string]
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

function handleViewAttendees(event: AdminEvent) {
  emit('view-attendees', event)
}

function handleToggleDestaque(eventId: string) {
  emit('toggle-destaque', eventId)
}

function handleDelete(eventId: string) {
  emit('delete', eventId)
}
</script>




