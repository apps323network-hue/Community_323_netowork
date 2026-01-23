<template>
  <AppLayout>
    <div class="w-full flex flex-col gap-4 sm:gap-6 md:gap-8 overflow-x-hidden">
      <!-- Featured Event Hero -->
      <div class="pt-4 sm:pt-6 md:pt-8">
        <EventHero
          v-if="displayedFeaturedEvent"
          :event="displayedFeaturedEvent"
          @register="handleRegister"
          @learn-more="handleLearnMore"
        />
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
            <span class="material-symbols-outlined text-secondary text-2xl sm:text-3xl drop-shadow-[0_0_5px_rgba(0,240,255,0.8)]">
              calendar_month
            </span>
            {{ t('events.title') }}
          </h3>
          <div class="flex items-center gap-3 sm:gap-4">
            <router-link
              to="/eventos/anteriores"
              class="group text-xs sm:text-sm font-bold flex items-center gap-1 text-slate-700 dark:text-white hover:text-primary transition-colors whitespace-nowrap"
            >
              {{ t('events.viewPastEvents') }}
              <span class="material-symbols-outlined text-primary text-base sm:text-lg group-hover:translate-x-1 transition-transform">
                history
              </span>
            </router-link>
            <router-link
              to="/eventos/calendario"
              class="group text-xs sm:text-sm font-bold flex items-center gap-1 text-slate-700 dark:text-white hover:text-primary transition-colors whitespace-nowrap"
            >
              {{ t('events.viewFullCalendar') }}
              <span class="material-symbols-outlined text-primary text-base sm:text-lg group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </router-link>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading && events.length === 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
          v-else-if="!loading && displayedEvents.length === 0"
          :title="t('events.noEventsFound')"
          :description="t('events.noEventsFoundDesc')"
          icon="event"
        />

        <!-- Events Grid -->
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          <EventListCard
            v-for="event in displayedEvents"
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
import { useDynamicMeta } from '@/composables/useDynamicMeta'
import AppLayout from '@/components/layout/AppLayout.vue'
import EventHero from '@/components/features/events/EventHero.vue'
import EventListCard from '@/components/features/events/EventListCard.vue'
import EventFilters from '@/components/features/events/EventFilters.vue'
import EventSearch from '@/components/features/events/EventSearch.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import type { EventFilters as EventFiltersType } from '@/types/events'

const router = useRouter()
const {
  events,
  featuredEvent,
  loading,
  hasMore,
  loadEvents,
  loadFeaturedEvent,
  confirmEvent,
  cancelConfirmation,
} = useEvents()

const activeFilter = ref<string>('all')
const searchQuery = ref('')
const { t } = useI18n()

// SEO
useDynamicMeta(() => ({
  title: t('events.title'),
  description: t('events.noEventsFoundDesc'),
  url: '/eventos'
}))
const newsletterEmail = ref('')

const currentFilters = ref<EventFiltersType>({
  tipo: 'all',
  search: '',
  sortBy: 'upcoming',
})

const displayedEvents = computed(() => {
  // Remover apenas duplicatas por ID (mantém o evento em destaque na lista)
  const seenIds = new Set<string>()
  let filtered = events.value.filter(event => {
    // Remover duplicatas
    if (seenIds.has(event.id)) {
      return false
    }
    seenIds.add(event.id)
    
    // Não excluir o evento em destaque - ele deve aparecer tanto no banner quanto na lista
    return true
  })
  
  return filtered
})

const displayedFeaturedEvent = computed(() => {
  return featuredEvent.value
})

async function handleFilterChange(filter: string) {
  activeFilter.value = filter
  currentFilters.value.tipo = filter as any
  await loadEvents(currentFilters.value, true)
}

async function handleSearchChange(query: string) {
  searchQuery.value = query
  currentFilters.value.search = query
  await loadEvents(currentFilters.value, true)
}

async function handleEventClick(eventId: string) {
  router.push(`/eventos/${eventId}`)
}

async function handleConfirm(eventId: string) {
  try {
    await confirmEvent(eventId)
    // Reload events to update confirmation counts - use reset=true to replace, not append
    await loadEvents(currentFilters.value, true)
  } catch (error) {
    console.error('Error confirming event:', error)
    alert(t('events.errorConfirming'))
  }
}

async function handleCancel(eventId: string) {
  try {
    await cancelConfirmation(eventId)
    // Reload events to update confirmation counts - use reset=true to replace, not append
    await loadEvents(currentFilters.value, true)
  } catch (error) {
    console.error('Error canceling confirmation:', error)
    alert(t('events.errorCanceling'))
  }
}

async function handleRegister() {
  if (featuredEvent.value) {
    await handleConfirm(featuredEvent.value.id)
  }
}

function handleLearnMore() {
  if (featuredEvent.value) {
    router.push(`/eventos/${featuredEvent.value.id}`)
  }
}

async function loadMore() {
  if (!loading.value) {
    await loadEvents(currentFilters.value, false)
  }
}

function handleNewsletterSubmit() {
  // TODO: Implement newsletter subscription
  console.log('Newsletter subscription:', newsletterEmail.value)
  alert(t('events.newsletterAlert'))
  newsletterEmail.value = ''
}

onMounted(async () => {
  await Promise.all([
    loadFeaturedEvent(),
    loadEvents(currentFilters.value, true),
  ])
})
</script>

<style scoped>
.shadow-neon-mixed {
  box-shadow: -5px 0 15px rgba(244, 37, 244, 0.2), 5px 0 15px rgba(0, 240, 255, 0.2);
}

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
