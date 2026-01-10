<template>
  <AppLayout>
    <div class="w-full flex flex-col gap-8">
      <!-- Header -->
      <div class="flex flex-col gap-6 pt-8">
        <!-- Top Row: Back Button and Filters -->
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <!-- Back to Events Button -->
          <router-link
            to="/eventos"
            class="group text-xs sm:text-sm font-bold flex items-center gap-1 text-white hover:text-primary transition-colors whitespace-nowrap"
          >
            <span class="material-symbols-outlined text-primary text-base sm:text-lg group-hover:-translate-x-1 transition-transform">
              arrow_back
            </span>
            {{ t('events.backToEvents') }}
          </router-link>
          
          <!-- Filters -->
          <EventFilters :active-filter="activeFilter" @filter-change="handleFilterChange" />
        </div>
        
        <!-- Title Section -->
        <div>
          <h1 class="text-white text-3xl lg:text-4xl font-black mb-2">
            {{ t('calendar.title') }} <span class="neon-text-gradient">{{ t('calendar.titleHighlight') }}</span>
          </h1>
          <p class="text-white/60">
            {{ t('calendar.subtitle') }}
          </p>
        </div>
      </div>

      <!-- Calendar -->
      <div class="bg-surface-card rounded-xl p-4 lg:p-6 border border-white/5">
        <FullCalendar
          :options="calendarOptions"
          class="event-calendar"
        />
      </div>

      <!-- Legend -->
      <div class="flex flex-wrap gap-4 items-center justify-center lg:justify-start">
        <div class="flex items-center gap-2">
          <div class="w-4 h-4 rounded bg-primary/20 border border-primary"></div>
          <span class="text-white/80 text-sm">{{ t('calendar.legend.presencial') }}</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-4 h-4 rounded bg-secondary/20 border border-secondary"></div>
          <span class="text-white/80 text-sm">{{ t('calendar.legend.webinar') }}</span>
        </div>
      </div>

      <!-- Event Details Modal -->
      <Modal v-model="showDetailsModal" :title="selectedEvent?.isRecurring ? t('calendar.modal.recurringTitle') : t('calendar.modal.title')">
        <div v-if="selectedEvent" class="space-y-4">
          <div v-if="selectedEvent.isRecurring" class="p-4 rounded-xl bg-secondary/10 border border-secondary/30">
            <p class="text-white text-sm leading-relaxed">
              {{ t('calendar.modal.recurringMessage') }}
            </p>
          </div>
          <div v-else class="space-y-3">
            <div class="flex items-start gap-4">
              <span class="material-symbols-outlined text-secondary shrink-0">event</span>
              <div>
                <p class="text-xs text-text-muted uppercase font-bold">{{ t('calendar.modal.date') }}</p>
                <p class="text-white">{{ formatDate(selectedEvent.start) }}</p>
              </div>
            </div>
            <div class="flex items-start gap-4">
              <span class="material-symbols-outlined text-secondary shrink-0">location_on</span>
              <div>
                <p class="text-xs text-text-muted uppercase font-bold">{{ t('calendar.modal.location') }}</p>
                <p class="text-white">{{ selectedEvent.local || '---' }}</p>
              </div>
            </div>
            <div class="flex items-start gap-4">
              <span class="material-symbols-outlined text-secondary shrink-0">info</span>
              <div>
                <p class="text-xs text-text-muted uppercase font-bold">{{ t('calendar.modal.type') }}</p>
                <p class="text-white capitalize">{{ selectedEvent.tipo }}</p>
              </div>
            </div>
          </div>
        </div>
        <template #footer>
          <button 
            @click="showDetailsModal = false"
            class="px-6 py-2 rounded-xl border border-input-border text-white hover:bg-white/5 transition-colors"
          >
            {{ t('calendar.modal.close') }}
          </button>
          <button 
            v-if="!selectedEvent?.isRecurring"
            @click="goToEvent"
            class="px-6 py-2 rounded-xl bg-neon-gradient text-black font-bold shadow-lg"
          >
            {{ t('calendar.modal.viewEvent') }}
          </button>
        </template>
      </Modal>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import ptBrLocale from '@fullcalendar/core/locales/pt-br'
import enUsLocale from '@fullcalendar/core/locales/en-gb'
import type { EventInput } from '@fullcalendar/core'
import AppLayout from '@/components/layout/AppLayout.vue'
import EventFilters from '@/components/features/events/EventFilters.vue'
import Modal from '@/components/ui/Modal.vue'
import { useEvents } from '@/composables/useEvents'
import type { EventFilterType } from '@/types/events'

const router = useRouter()
const { t, locale } = useI18n()
const { events, loadEvents } = useEvents()

const activeFilter = ref<EventFilterType>('all')
const showDetailsModal = ref(false)
const selectedEvent = ref<any>(null)

// Weekly recurring event (MVP: 1 evento fixo semanal)
// Quarta-feira às 18:00 (repetindo semanalmente)
// Generate weekly events for the next 6 months
const calendarOptions = computed(() => {
  const filteredEvents = getFilteredEvents()
  const calendarEvents: EventInput[] = [
    ...filteredEvents.map((event) => ({
      id: event.id,
      title: event.titulo,
      start: event.data_hora,
      end: new Date(new Date(event.data_hora).getTime() + 2 * 60 * 60 * 1000).toISOString(), // +2 horas
      color: event.tipo === 'presencial' ? '#f425f4' : '#00f0ff',
      borderColor: event.tipo === 'presencial' ? '#f425f4' : '#00f0ff',
      textColor: '#ffffff',
      extendedProps: {
        tipo: event.tipo,
        local: event.local,
        descricao: event.descricao,
        isRecurring: false,
      },
    })),
  ]

  return {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay',
    },
    locale: locale.value.startsWith('pt') ? ptBrLocale : enUsLocale,
    events: calendarEvents,
    eventClick: handleEventClick,
    eventClassNames: (arg: any) => {
      const classes = []
      if (arg.event.extendedProps.isRecurring) {
        classes.push('recurring-event')
      }
      return classes
    },
    height: 'auto',
    contentHeight: 'auto',
    aspectRatio: 1.8,
    eventDisplay: 'block',
    editable: false,
    selectable: false,
    weekends: true,
    firstDay: 0, // Sunday
    buttonText: {
      today: t('calendar.buttons.today'),
      month: t('calendar.buttons.month'),
      week: t('calendar.buttons.week'),
      day: t('calendar.buttons.day'),
    },
  }
})

function getFilteredEvents() {
  if (activeFilter.value === 'all') {
    return events.value
  }
  
  // Map filter types to event types
  const filterTypeMap: Record<EventFilterType, 'presencial' | 'webinar' | undefined> = {
    'all': undefined,
    'networking': 'presencial',
    'showcase': 'presencial',
    'workshop': 'webinar',
    'social': 'presencial',
  }
  
  const eventType = filterTypeMap[activeFilter.value]
  if (!eventType) return events.value
  
  return events.value.filter((e) => e.tipo === eventType)
}

function handleFilterChange(filter: string) {
  activeFilter.value = filter as EventFilterType
  // Calendar will automatically update via computed
}

function handleEventClick(info: any) {
  selectedEvent.value = {
    id: info.event.id,
    title: info.event.title,
    start: info.event.start,
    local: info.event.extendedProps.local,
    tipo: info.event.extendedProps.tipo,
    isRecurring: info.event.extendedProps.isRecurring
  }
  showDetailsModal.value = true
}

function goToEvent() {
  if (selectedEvent.value?.id) {
    router.push(`/eventos/${selectedEvent.value.id}`)
  }
}

function formatDate(date: any) {
  if (!date) return ''
  return new Date(date).toLocaleString(locale.value, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(async () => {
  await loadEvents({ tipo: 'all' }, true)
})
</script>

<style scoped>
:deep(.event-calendar) {
  --fc-border-color: rgba(255, 255, 255, 0.1);
  --fc-daygrid-event-dot-width: 8px;
  --fc-event-border-radius: 6px;
  --fc-today-bg-color: rgba(244, 37, 244, 0.1);
}

:deep(.fc) {
  color: white;
  font-family: inherit;
}

:deep(.fc-header-toolbar) {
  margin-bottom: 1.5rem;
}

:deep(.fc-button) {
  background-color: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
  color: white;
  padding: 0.5rem 1rem;
  font-weight: 600;
  transition: all 0.2s;
}

:deep(.fc-button:hover) {
  background-color: rgba(244, 37, 244, 0.2);
  border-color: #f425f4;
}

:deep(.fc-button-active) {
  background: linear-gradient(135deg, #f425f4 0%, #00f0ff 100%);
  border-color: transparent;
  color: black;
  font-weight: 800;
}

:deep(.fc-today-button) {
  background-color: rgba(0, 240, 255, 0.2);
  border-color: #00f0ff;
}

:deep(.fc-today-button:hover) {
  background-color: rgba(0, 240, 255, 0.3);
}

:deep(.fc-daygrid-day) {
  background-color: rgba(255, 255, 255, 0.02);
}

:deep(.fc-daygrid-day:hover) {
  background-color: rgba(255, 255, 255, 0.05);
}

:deep(.fc-day-today) {
  background-color: rgba(244, 37, 244, 0.1) !important;
}

:deep(.fc-col-header-cell) {
  background-color: rgba(255, 255, 255, 0.03) !important;
  border-color: rgba(255, 255, 255, 0.1) !important;
}

:deep(.fc-col-header-cell-cushion) {
  color: white !important;
  padding: 0.75rem;
  display: block;
  text-decoration: none !important;
}

:deep(.fc-theme-standard td), :deep(.fc-theme-standard th) {
  border-color: rgba(255, 255, 255, 0.1) !important;
}

:deep(.fc-scrollgrid), :deep(.fc-scrollgrid-section), :deep(.fc-scrollgrid-section td), :deep(.fc-scrollgrid-section th) {
  border-color: rgba(255, 255, 255, 0.1) !important;
  background: transparent !important;
}

:deep(.fc-daygrid-day-number), :deep(.fc-daygrid-day-top) {
  color: white;
  padding: 0.5rem;
  text-decoration: none !important;
}

:deep(.fc-timegrid-slot) {
  height: 3.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  background: transparent !important;
}

:deep(.fc-timegrid-axis-cushion), :deep(.fc-timegrid-slot-label-cushion) {
  color: rgba(255, 255, 255, 0.6);
}

:deep(.fc-timegrid-col) {
  background: transparent !important;
}

:deep(.fc-event) {
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 0.125rem 0.25rem;
  font-weight: 600;
  font-size: 0.8rem;
  transition: all 0.2s;
  border-radius: 4px;
}

:deep(.fc-event:hover) {
  transform: translateY(-1px);
  filter: brightness(1.2);
}

:deep(.fc-daygrid-event) {
  margin: 1px 0;
}

:deep(.fc-toolbar-title) {
  color: white;
  font-weight: 800;
  font-size: 1.5rem;
}

/* Fix for white header in week/day view */
:deep(.fc-col-header), :deep(.fc-timegrid-header) {
  background-color: transparent !important;
}



.bg-neon-gradient {
  background: linear-gradient(135deg, #f425f4 0%, #00f0ff 100%);
}

.neon-text-gradient {
  background: linear-gradient(135deg, #f425f4 0%, #00f0ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
</style>

