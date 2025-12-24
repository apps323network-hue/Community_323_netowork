<template>
  <AppLayout>
    <div class="w-full flex flex-col gap-8">
      <!-- Header -->
      <div class="flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center">
        <div>
          <h1 class="text-white text-3xl lg:text-4xl font-black mb-2">
            Calendário de <span class="bg-clip-text text-transparent bg-neon-gradient">Eventos</span>
          </h1>
          <p class="text-white/60">
            Visualize todos os eventos da 323 Network em formato de calendário
          </p>
        </div>
        
        <!-- Filters -->
        <EventFilters :active-filter="activeFilter" @filter-change="handleFilterChange" />
      </div>

      <!-- Calendar -->
      <div class="bg-surface-card rounded-xl p-4 lg:p-6 border border-white/5">
        <FullCalendar
          ref="calendarRef"
          :options="calendarOptions"
          class="event-calendar"
        />
      </div>

      <!-- Legend -->
      <div class="flex flex-wrap gap-4 items-center justify-center lg:justify-start">
        <div class="flex items-center gap-2">
          <div class="w-4 h-4 rounded bg-primary/20 border border-primary"></div>
          <span class="text-white/80 text-sm">Presencial</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-4 h-4 rounded bg-secondary/20 border border-secondary"></div>
          <span class="text-white/80 text-sm">Webinar</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-4 h-4 rounded bg-neon-gradient border border-primary"></div>
          <span class="text-white/80 text-sm">Evento Semanal</span>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import ptBrLocale from '@fullcalendar/core/locales/pt-br'
import type { EventInput } from '@fullcalendar/core'
import AppLayout from '@/components/layout/AppLayout.vue'
import EventFilters from '@/components/features/events/EventFilters.vue'
import { useEvents } from '@/composables/useEvents'
import type { EventFilterType } from '@/types/events'

const router = useRouter()
const { events, loadEvents } = useEvents()

const calendarRef = ref<InstanceType<typeof FullCalendar> | null>(null)
const activeFilter = ref<EventFilterType>('all')

// Weekly recurring event (MVP: 1 evento fixo semanal)
// Quarta-feira às 18:00 (repetindo semanalmente)
// Generate weekly events for the next 6 months
function generateWeeklyEvents(): EventInput[] {
  const events: EventInput[] = []
  const today = new Date()
  const nextWednesday = new Date(today)
  const dayOfWeek = today.getDay() // 0 = Sunday, 3 = Wednesday
  const daysUntilWednesday = (3 - dayOfWeek + 7) % 7 || 7
  nextWednesday.setDate(today.getDate() + daysUntilWednesday)
  nextWednesday.setHours(18, 0, 0, 0)
  
  // Generate events for next 6 months (approximately 26 weeks)
  for (let i = 0; i < 26; i++) {
    const eventDate = new Date(nextWednesday)
    eventDate.setDate(nextWednesday.getDate() + (i * 7))
    
    events.push({
      id: `weekly-networking-${i}`,
      title: 'Networking Semanal 323',
      start: eventDate.toISOString(),
      end: new Date(eventDate.getTime() + 2 * 60 * 60 * 1000).toISOString(), // +2 horas
      color: '#f425f4',
      borderColor: '#00f0ff',
      textColor: '#ffffff',
      classNames: ['recurring-event'],
      extendedProps: {
        tipo: 'presencial',
        local: 'Online (Zoom)',
        isRecurring: true,
      },
    })
  }
  
  return events
}

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
    // Add weekly recurring events (only if filter allows or is 'all')
    ...(activeFilter.value === 'all' || activeFilter.value === 'networking' ? generateWeeklyEvents() : []),
  ]

  return {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay',
    },
    locale: ptBrLocale,
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
      today: 'Hoje',
      month: 'Mês',
      week: 'Semana',
      day: 'Dia',
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

function handleFilterChange(filter: EventFilterType) {
  activeFilter.value = filter
  // Calendar will automatically update via computed
}

function handleEventClick(info: any) {
  const eventId = info.event.id
  if (eventId && eventId.startsWith('weekly-networking')) {
    // For recurring events, show a modal or navigate to a special page
    alert('Este é um evento semanal recorrente que acontece toda quarta-feira às 18:00. Participe do nosso Networking Semanal 323!')
  } else if (eventId) {
    router.push(`/eventos/${eventId}`)
  }
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
  background-color: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
  color: white;
  font-weight: 600;
  padding: 0.75rem;
}

:deep(.fc-daygrid-day-number) {
  color: white;
  padding: 0.5rem;
}

:deep(.fc-daygrid-day-top) {
  flex-direction: row;
  justify-content: flex-start;
}

:deep(.fc-event) {
  cursor: pointer;
  border: 2px solid;
  padding: 0.25rem 0.5rem;
  font-weight: 600;
  font-size: 0.875rem;
  transition: all 0.2s;
}

:deep(.fc-event:hover) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  filter: brightness(1.1);
}

:deep(.fc-event.recurring-event) {
  background: linear-gradient(135deg, #f425f4 0%, #00f0ff 100%);
  border-color: #00f0ff;
  box-shadow: 0 0 10px rgba(244, 37, 244, 0.4);
}

:deep(.fc-daygrid-event) {
  margin: 0.125rem 0;
}

:deep(.fc-toolbar-title) {
  color: white;
  font-weight: 800;
  font-size: 1.5rem;
}

.bg-neon-gradient {
  background: linear-gradient(135deg, #f425f4 0%, #00f0ff 100%);
}
</style>

