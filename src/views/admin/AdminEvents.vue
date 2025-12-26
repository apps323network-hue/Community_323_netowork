<template>
  <AppLayout>
    <div class="w-full flex flex-col gap-8">
      <!-- Header -->
      <div class="flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center">
        <div>
          <h1 class="text-white text-3xl lg:text-4xl font-black mb-2">
            Admin de <span class="bg-clip-text text-transparent bg-neon-gradient">Eventos</span>
          </h1>
          <p class="text-white/60">
            Gerencie e aprove eventos da comunidade
          </p>
        </div>
      </div>

      <!-- Stats -->
      <EventStats :stats="stats" />

      <!-- Filters -->
      <div class="flex gap-3 overflow-x-auto no-scrollbar pb-1">
        <button
          v-for="filter in filters"
          :key="filter.id"
          class="flex h-9 shrink-0 items-center justify-center rounded-full px-6 text-sm font-medium transition-all"
          :class="activeFilter === filter.id
            ? 'bg-neon-gradient text-black font-black shadow-neon-pink'
            : 'bg-surface-card hover:bg-surface-highlight text-white/80 hover:text-secondary border border-white/10 hover:border-secondary'"
          @click="handleFilterChange(filter.id)"
        >
          {{ filter.label }}
        </button>
      </div>

      <!-- Events List -->
      <AdminEventList
        :events="displayedEvents"
        :loading="loading"
        @approve="handleApprove"
        @reject="handleReject"
        @view-details="handleViewDetails"
      />

      <!-- Approval Modal -->
      <EventApprovalModal
        v-model="showApprovalModal"
        :event="selectedEvent"
        @approve="handleModalApprove"
        @reject="handleModalReject"
      />
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAdmin } from '@/composables/useAdmin'
import AppLayout from '@/components/layout/AppLayout.vue'
import EventStats from '@/components/admin/EventStats.vue'
import AdminEventList from '@/components/admin/AdminEventList.vue'
import EventApprovalModal from '@/components/admin/EventApprovalModal.vue'
import type { AdminEvent } from '@/types/admin'
import type { EventStatus } from '@/types/events'

const router = useRouter()
const {
  allEvents,
  stats,
  loading,
  isAdmin,
  loadAllEvents,
  loadEventStats,
  handleApproval,
} = useAdmin()

const activeFilter = ref<EventStatus | 'all'>('all')
const showApprovalModal = ref(false)
const selectedEvent = ref<AdminEvent | null>(null)

const filters = [
  { id: 'all' as const, label: 'Todos' },
  { id: 'pending' as const, label: 'Pendentes' },
  { id: 'approved' as const, label: 'Aprovados' },
  { id: 'rejected' as const, label: 'Rejeitados' },
]

const displayedEvents = computed(() => {
  if (activeFilter.value === 'all') {
    return allEvents.value
  }
  return allEvents.value.filter(e => e.status === activeFilter.value)
})

async function handleFilterChange(filterId: EventStatus | 'all') {
  activeFilter.value = filterId
  if (filterId === 'all') {
    await loadAllEvents()
  } else {
    await loadAllEvents(filterId)
  }
}

function handleApprove(eventId: string) {
  const event = allEvents.value.find(e => e.id === eventId)
  if (event) {
    selectedEvent.value = event
    showApprovalModal.value = true
  }
}

function handleReject(eventId: string) {
  const event = allEvents.value.find(e => e.id === eventId)
  if (event) {
    selectedEvent.value = event
    showApprovalModal.value = true
  }
}

async function handleModalApprove(eventId: string) {
  try {
    await handleApproval({
      eventId,
      action: 'approve',
    })
    await loadAllEvents(activeFilter.value === 'all' ? undefined : activeFilter.value)
    await loadEventStats()
    showApprovalModal.value = false
    selectedEvent.value = null
  } catch (error) {
    console.error('Error approving event:', error)
  }
}

async function handleModalReject(eventId: string, reason: string) {
  try {
    await handleApproval({
      eventId,
      action: 'reject',
      reason,
    })
    await loadAllEvents(activeFilter.value === 'all' ? undefined : activeFilter.value)
    await loadEventStats()
    showApprovalModal.value = false
    selectedEvent.value = null
  } catch (error) {
    console.error('Error rejecting event:', error)
  }
}

function handleViewDetails(eventId: string) {
  router.push(`/eventos/${eventId}`)
}

onMounted(async () => {
  // Verificar se é admin
  if (!isAdmin.value) {
    router.push('/')
    return
  }

  await loadAllEvents()
  await loadEventStats()
})
</script>

<style scoped>
.bg-neon-gradient {
  background: linear-gradient(135deg, #f425f4 0%, #00f0ff 100%);
}

.shadow-neon-pink {
  box-shadow: 0 0 15px rgba(244, 37, 244, 0.3);
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}

.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>



