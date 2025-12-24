<template>
  <AppLayout>
    <div class="w-full flex flex-col gap-4 sm:gap-6 md:gap-8 overflow-x-hidden">
      <!-- Featured Event Hero -->
      <EventHero
        v-if="displayedFeaturedEvent"
        :event="displayedFeaturedEvent"
        @register="handleRegister"
        @learn-more="handleLearnMore"
      />

      <!-- Filters and Search (Sticky apenas no desktop) -->
      <section class="flex flex-col lg:flex-row gap-4 sm:gap-6 justify-between items-start lg:items-center lg:sticky lg:top-[69px] z-40 bg-background-dark/80 backdrop-blur-md py-3 sm:py-4 px-0 lg:-mx-10 lg:px-10 border-b border-white/5">
        <EventFilters :active-filter="activeFilter" @filter-change="handleFilterChange" />
        <EventSearch @search-change="handleSearchChange" />
      </section>

      <!-- Events List -->
      <section>
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-6 sm:mb-8">
          <h3 class="text-white text-xl sm:text-2xl font-bold flex items-center gap-2 sm:gap-3">
            <span class="material-symbols-outlined text-secondary text-2xl sm:text-3xl drop-shadow-[0_0_5px_rgba(0,240,255,0.8)]">
              calendar_month
            </span>
            Próximos Eventos
          </h3>
          <router-link
            to="/eventos/calendario"
            class="group text-xs sm:text-sm font-bold flex items-center gap-1 text-white hover:text-primary transition-colors whitespace-nowrap"
          >
            Ver calendário completo
            <span class="material-symbols-outlined text-primary text-base sm:text-lg group-hover:translate-x-1 transition-transform">
              arrow_forward
            </span>
          </router-link>
        </div>

        <!-- Loading State -->
        <div v-if="loading && events.length === 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div
            v-for="i in 6"
            :key="i"
            class="bg-surface-card rounded-xl p-6 animate-pulse border border-white/5"
          >
            <div class="h-52 bg-gray-700 rounded-lg mb-4"></div>
            <div class="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
            <div class="h-4 bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>

        <!-- Empty State -->
        <EmptyState
          v-else-if="!loading && displayedEvents.length === 0"
          title="Nenhum evento encontrado"
          description="Não há eventos disponíveis no momento. Verifique os filtros ou tente novamente mais tarde."
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
        <div v-if="displayedEvents.length > 0" class="mt-12 flex justify-center">
          <button
            class="flex items-center gap-2 text-white/60 hover:text-white hover:border-white text-sm font-bold transition-all px-8 py-3 border border-white/10 rounded-full hover:bg-white/5 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]"
            @click="loadMore"
          >
            <span class="material-symbols-outlined animate-spin-slow">refresh</span>
            Carregar mais eventos
          </button>
        </div>
      </section>

      <!-- Newsletter Section (Optional) -->
      <section class="mt-8 rounded-xl bg-surface-card border border-white/5 p-4 sm:p-6 md:p-8 lg:p-12 text-center relative overflow-hidden group">
        <div class="absolute top-0 right-0 w-32 h-32 sm:w-48 sm:h-48 lg:w-64 lg:h-64 bg-primary/20 blur-[100px] rounded-full pointer-events-none group-hover:bg-primary/30 transition-colors duration-500"></div>
        <div class="absolute bottom-0 left-0 w-32 h-32 sm:w-48 sm:h-48 lg:w-64 lg:h-64 bg-secondary/20 blur-[100px] rounded-full pointer-events-none group-hover:bg-secondary/30 transition-colors duration-500"></div>
        <div class="relative z-10 flex flex-col items-center gap-3 sm:gap-4">
          <div class="size-12 sm:size-14 md:size-16 rounded-full bg-surface-dark border border-white/10 flex items-center justify-center mb-1 sm:mb-2 shadow-neon-mixed">
            <span class="material-symbols-outlined text-white text-2xl sm:text-2xl md:text-3xl">mail</span>
          </div>
          <h3 class="text-white text-xl sm:text-2xl md:text-2xl lg:text-3xl font-black tracking-tight px-2">
            Não perca nenhum <span class="text-primary">E</span><span class="text-secondary">vento</span>
          </h3>
          <p class="text-white/60 max-w-lg mx-auto mb-4 sm:mb-6 text-sm sm:text-base md:text-lg px-4">
            Receba atualizações exclusivas, descontos e oportunidades da 323 Network diretamente.
          </p>
          <form class="flex w-full max-w-md flex-col sm:flex-row gap-2 sm:gap-3 px-4 sm:px-0" @submit.prevent="handleNewsletterSubmit">
            <input
              v-model="newsletterEmail"
              class="flex-1 rounded-lg bg-black/50 border border-white/10 px-3 sm:px-4 py-2.5 sm:py-3 text-white text-sm sm:text-base placeholder:text-white/30 focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all"
              placeholder="Seu melhor e-mail"
              type="email"
            />
            <button
              class="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-black font-black py-2.5 sm:py-3 px-6 sm:px-8 rounded-lg text-sm sm:text-base transition-all shadow-[0_0_20px_rgba(244,37,244,0.3)] hover:shadow-[0_0_30px_rgba(0,240,255,0.4)] transform hover:-translate-y-1 whitespace-nowrap"
              type="submit"
            >
              Inscrever
            </button>
          </form>
        </div>
      </section>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useEvents } from '@/composables/useEvents'
import AppLayout from '@/components/layout/AppLayout.vue'
import EventHero from '@/components/features/events/EventHero.vue'
import EventListCard from '@/components/features/events/EventListCard.vue'
import EventFilters from '@/components/features/events/EventFilters.vue'
import EventSearch from '@/components/features/events/EventSearch.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import type { EventFilters as EventFiltersType, Event } from '@/types/events'

const router = useRouter()
const {
  events,
  featuredEvent,
  loading,
  loadEvents,
  loadFeaturedEvent,
  confirmEvent,
  cancelConfirmation,
} = useEvents()

const activeFilter = ref<string>('all')
const searchQuery = ref('')
const newsletterEmail = ref('')

const currentFilters = ref<EventFiltersType>({
  tipo: 'all',
  search: '',
  sortBy: 'upcoming',
})

const displayedEvents = computed(() => {
  return events.value
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
    // Reload events to update confirmation counts
    await loadEvents(currentFilters.value, false)
  } catch (error) {
    console.error('Error confirming event:', error)
    alert('Erro ao confirmar presença. Tente novamente.')
  }
}

async function handleCancel(eventId: string) {
  try {
    await cancelConfirmation(eventId)
    // Reload events to update confirmation counts
    await loadEvents(currentFilters.value, false)
  } catch (error) {
    console.error('Error canceling confirmation:', error)
    alert('Erro ao cancelar confirmação. Tente novamente.')
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
  alert('Newsletter subscription será implementado em breve!')
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
