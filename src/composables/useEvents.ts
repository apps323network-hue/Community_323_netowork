import { computed } from 'vue'
import { useEventStore } from '@/stores/events'
import type { EventFilters, EventCreateInput } from '@/types/events'

export function useEvents() {
  const eventStore = useEventStore()

  // Computed
  const events = computed(() => eventStore.events)
  const featuredEvent = computed(() => eventStore.featuredEvent)
  const currentEvent = computed(() => eventStore.currentEvent)
  const loading = computed(() => eventStore.loading)
  const error = computed(() => eventStore.error)
  const filters = computed(() => eventStore.filters)
  const hasMore = computed(() => eventStore.hasMore)
  const upcomingEvents = computed(() => eventStore.upcomingEvents)
  const pastEvents = computed(() => eventStore.pastEvents)

  // Actions
  async function loadEvents(filtersParam: EventFilters = {}, reset = true) {
    return await eventStore.fetchEvents(filtersParam, reset)
  }

  async function loadMoreEvents(filtersParam: EventFilters = {}) {
    return await eventStore.fetchEvents(filtersParam, false)
  }

  async function loadFeaturedEvent() {
    return await eventStore.fetchFeaturedEvent()
  }

  async function getEventById(eventId: string) {
    return await eventStore.fetchEventById(eventId)
  }

  async function confirmEvent(eventId: string) {
    return await eventStore.confirmEvent(eventId)
  }

  async function cancelConfirmation(eventId: string) {
    return await eventStore.cancelConfirmation(eventId)
  }

  async function createEvent(input: EventCreateInput) {
    return await eventStore.createEvent(input)
  }

  function reset() {
    eventStore.reset()
  }

  return {
    // State
    events,
    featuredEvent,
    currentEvent,
    loading,
    error,
    filters,
    hasMore,
    upcomingEvents,
    pastEvents,
    // Actions
    loadEvents,
    loadMoreEvents,
    loadFeaturedEvent,
    getEventById,
    confirmEvent,
    cancelConfirmation,
    createEvent,
    reset,
  }
}







