<template>
  <AppLayout>
    <div class="w-full flex flex-col gap-4 sm:gap-6 md:gap-8 overflow-x-hidden">
      <!-- Back to Events Button -->
      <div class="pt-4 sm:pt-6 md:pt-8">
        <router-link
          to="/eventos"
          class="group text-xs sm:text-sm font-bold flex items-center gap-1 text-slate-700 dark:text-white hover:text-primary transition-colors whitespace-nowrap w-fit mb-4"
        >
          <span class="material-symbols-outlined text-primary text-base sm:text-lg group-hover:-translate-x-1 transition-transform">
            arrow_back
          </span>
          {{ t('events.backToEvents') }}
        </router-link>
      </div>

      <!-- Filters and Search (Sticky apenas no desktop) -->
      <section class="flex flex-col lg:flex-row gap-4 sm:gap-6 justify-between items-start lg:items-center lg:sticky lg:top-[69px] z-40 bg-background-light dark:bg-background-dark py-3 sm:py-4 px-0 lg:-mx-10 lg:px-10 border-b border-slate-200 dark:border-white/5">
        <EventFilters :active-filter="activeFilter" @filter-change="handleFilterChange" />
        <EventSearch @search-change="handleSearchChange" />
      </section>

      <!-- Events List -->
      <section>
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-6 sm:mb-8">
          <h3 class="text-slate-900 dark:text-white text-xl sm:text-2xl font-bold flex items-center gap-2 sm:gap-3">
            <span class="material-symbols-outlined text-primary text-2xl sm:text-3xl drop-shadow-[0_0_5px_rgba(244,37,244,0.8)]">
              history
            </span>
            {{ t('events.pastEventsTitle') }}
          </h3>
        </div>

        <!-- Loading State -->
        <div v-if="loading && displayedPastEvents.length === 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div
            v-for="i in 6"
            :key="i"
            class="bg-white dark:bg-surface-card rounded-xl p-6 animate-pulse border border-slate-200 dark:border-white/5"
          >
            <div class="h-52 bg-gray-300 dark:bg-gray-700 rounded-lg mb-4"></div>
            <div class="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
            <div class="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>

        <!-- Empty State -->
        <EmptyState
          v-else-if="!loading && displayedPastEvents.length === 0"
          :title="t('events.noPastEventsFound')"
          :description="t('events.noPastEventsFoundDesc')"
          icon="history"
        />

        <!-- Events Grid -->
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          <EventListCard
            v-for="event in displayedPastEvents"
            :key="event.id"
            :event="event"
            @click="handleEventClick"
            @confirm="handleConfirm"
            @cancel="handleCancel"
          />
        </div>

        <!-- Load More Button -->
        <div v-if="hasMore" class="mt-12 flex justify-center">
          <button
            class="flex items-center gap-2 text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-white text-sm font-bold transition-all px-8 py-3 border border-slate-200 dark:border-white/10 rounded-full hover:bg-slate-50 dark:hover:bg-white/5 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]"
            @click="loadMore"
          >
            <span class="material-symbols-outlined animate-spin-slow">refresh</span>
            {{ t('events.loadMoreEvents') }}
          </button>
        </div>
      </section>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useEvents } from '@/composables/useEvents'
import AppLayout from '@/components/layout/AppLayout.vue'
import EventListCard from '@/components/features/events/EventListCard.vue'
import EventFilters from '@/components/features/events/EventFilters.vue'
import EventSearch from '@/components/features/events/EventSearch.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import type { EventFilters as EventFiltersType } from '@/types/events'

const router = useRouter()
const {
  pastEvents,
  loading,
  hasMore,
  loadEvents,
  confirmEvent,
  cancelConfirmation,
} = useEvents()

const activeFilter = ref<string>('all')
const searchQuery = ref('')
const { t } = useI18n()

const currentFilters = ref<EventFiltersType>({
  tipo: 'all',
  search: '',
  sortBy: 'recent', // Para eventos passados, ordenar por mais recentes primeiro
})

const displayedPastEvents = computed(() => {
  // Filtrar eventos passados e aplicar filtros de tipo e busca
  let filtered = pastEvents.value

  // Aplicar filtro de tipo
  if (activeFilter.value !== 'all') {
    const typeMap: Record<string, string> = {
      'networking': 'presencial',
      'showcase': 'presencial',
      'workshop': 'webinar',
      'social': 'presencial',
    }
    const mappedType = typeMap[activeFilter.value]
    if (mappedType) {
      filtered = filtered.filter(e => e.tipo === mappedType)
    }
  }

  // Aplicar filtro de busca
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(e => 
      e.titulo_pt.toLowerCase().includes(query) ||
      (e.local_pt && e.local_pt.toLowerCase().includes(query))
    )
  }

  // Ordenar por data (mais recentes primeiro)
  return filtered.sort((a, b) => {
    const dateA = new Date(a.data_hora).getTime()
    const dateB = new Date(b.data_hora).getTime()
    return dateB - dateA
  })
})

async function handleFilterChange(filter: string) {
  activeFilter.value = filter
  currentFilters.value.tipo = filter as any
  // Recarregar eventos para garantir que temos todos os dados
  await loadEvents(currentFilters.value, true)
}

async function handleSearchChange(query: string) {
  searchQuery.value = query
  currentFilters.value.search = query
  // Não precisa recarregar, pois filtramos no computed
}

async function handleEventClick(eventId: string) {
  router.push(`/eventos/${eventId}`)
}

async function handleConfirm(eventId: string) {
  try {
    await confirmEvent(eventId)
    // Reload events to update confirmation counts
    await loadEvents(currentFilters.value, true)
  } catch (error) {
    console.error('Error confirming event:', error)
    alert(t('events.errorConfirming'))
  }
}

async function handleCancel(eventId: string) {
  try {
    await cancelConfirmation(eventId)
    // Reload events to update confirmation counts
    await loadEvents(currentFilters.value, true)
  } catch (error) {
    console.error('Error canceling confirmation:', error)
    alert(t('events.errorCanceling'))
  }
}

async function loadMore() {
  if (!loading.value) {
    await loadEvents(currentFilters.value, false)
  }
}

onMounted(async () => {
  // Carregar todos os eventos para que pastEvents tenha dados
  // Como a query ordena por data_hora ascendente, eventos passados podem estar em páginas posteriores
  // Vamos carregar múltiplas páginas para garantir que temos eventos passados
  await loadEvents({ tipo: 'all' }, true)
  
  // Continuar carregando enquanto houver mais eventos e ainda não tivermos eventos passados
  // Limitar a 10 páginas para evitar carregamento excessivo
  let pagesLoaded = 1
  const maxPages = 10
  
  while (hasMore.value && pagesLoaded < maxPages) {
    // Se já temos eventos passados, podemos parar
    if (pastEvents.value.length > 0) {
      break
    }
    await loadEvents({ tipo: 'all' }, false)
    pagesLoaded++
  }
})
</script>

<style scoped>
@keyframes spin-slow {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin-slow {
  animation: spin-slow 3s linear infinite;
}
</style>
