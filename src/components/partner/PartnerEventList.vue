<template>
  <div class="space-y-6">
    <!-- Filters -->
    <div class="flex gap-3 overflow-x-auto no-scrollbar pb-1">
      <button
        v-for="filter in filters"
        :key="filter.id"
        class="flex h-9 shrink-0 items-center justify-center rounded-full px-6 text-sm font-medium transition-all"
        :class="activeFilter === filter.id
          ? 'bg-neon-gradient text-black font-black shadow-neon-pink'
          : 'bg-surface-card hover:bg-surface-highlight text-white/80 hover:text-secondary border border-white/10 hover:border-secondary'"
        @click="activeFilter = filter.id"
      >
        {{ filter.label }}
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading && events.length === 0" class="space-y-4">
      <div v-for="i in 3" :key="i" class="bg-surface-card rounded-xl p-6 animate-pulse border border-white/5">
        <div class="h-32 bg-gray-700 rounded-lg mb-4"></div>
        <div class="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
        <div class="h-4 bg-gray-700 rounded w-1/2"></div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!loading && filteredEvents.length === 0" class="text-center py-12">
      <span class="material-symbols-outlined text-white/40 text-6xl mb-4">event_busy</span>
      <p class="text-white/60 text-lg">Nenhum evento encontrado</p>
    </div>

    <!-- Events Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="event in filteredEvents"
        :key="event.id"
        class="bg-surface-card rounded-xl border border-white/5 overflow-hidden hover:border-white/10 transition-all"
      >
        <!-- Banner -->
        <div
          v-if="event.image_url"
          class="h-32 bg-cover bg-center"
          :style="{ backgroundImage: `url(${event.image_url})` }"
        ></div>
        <div v-else class="h-32 bg-gradient-to-br from-primary/20 to-secondary/20"></div>

        <!-- Content -->
        <div class="p-4">
          <div class="flex items-start justify-between mb-2">
            <h3 class="text-white font-bold text-lg flex-1 line-clamp-2">{{ event.titulo }}</h3>
            <StatusBadge :status="event.status || 'pending'" />
          </div>

          <p v-if="event.descricao" class="text-white/60 text-sm mb-3 line-clamp-2">
            {{ event.descricao }}
          </p>

          <div class="flex items-center gap-2 text-white/70 text-sm mb-4">
            <span class="material-symbols-outlined text-base">calendar_today</span>
            <span>{{ formattedDate(event.data_hora) }}</span>
          </div>

          <div class="flex gap-2">
            <button
              v-if="event.status === 'pending'"
              class="flex-1 px-3 py-2 bg-surface-lighter hover:bg-surface-highlight text-white border border-white/10 rounded-lg font-semibold transition-all text-sm"
              @click="$emit('edit', event.id)"
            >
              Editar
            </button>
            <button
              class="flex-1 px-3 py-2 bg-surface-lighter hover:bg-surface-highlight text-white border border-white/10 rounded-lg font-semibold transition-all text-sm"
              @click="$emit('view-details', event.id)"
            >
              Ver Detalhes
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Event } from '@/types/events'
import type { EventStatus } from '@/types/events'
import StatusBadge from '@/components/ui/StatusBadge.vue'

interface Props {
  events: Event[]
  loading: boolean
}

const props = defineProps<Props>()

defineEmits<{
  edit: [eventId: string]
  'view-details': [eventId: string]
}>()

const activeFilter = ref<EventStatus | 'all'>('all')

const filters = [
  { id: 'all' as const, label: 'Todos' },
  { id: 'pending' as const, label: 'Pendentes' },
  { id: 'approved' as const, label: 'Aprovados' },
  { id: 'rejected' as const, label: 'Rejeitados' },
]

const filteredEvents = computed(() => {
  if (activeFilter.value === 'all') {
    return props.events
  }
  return props.events.filter(e => e.status === activeFilter.value)
})

function formattedDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}
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

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>










