import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from './auth'
import type { Event, EventConfirmation, EventFilters, EventCreateInput } from '@/types/events'

export const useEventStore = defineStore('events', () => {
  const events = ref<Event[]>([])
  const featuredEvent = ref<Event | null>(null)
  const currentEvent = ref<Event | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const filters = ref<EventFilters>({ sortBy: 'upcoming' })

  const authStore = useAuthStore()
  const currentUserId = computed(() => authStore.user?.id)

  // Verificar se usuário é admin
  async function checkIsAdmin(): Promise<boolean> {
    if (!authStore.user) return false
    
    try {
      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', authStore.user.id)
        .single()

      if (profileError) return false
      return data?.role === 'admin'
    } catch {
      return false
    }
  }

  // Fetch events with filters
  async function fetchEvents(filtersParam: EventFilters = {}, reset = false) {
    if (reset) {
      events.value = []
    }

    loading.value = true
    error.value = null

    try {
      // Verificar se é admin
      const isAdminUser = await checkIsAdmin()

      let query = supabase
        .from('events')
        .select('*')
        .order('data_hora', { ascending: true })

      // Filtrar apenas eventos aprovados se não for admin
      if (!isAdminUser) {
        query = query.eq('status', 'approved')
      }

      // Apply filters
      if (filtersParam.search) {
        const searchTerm = `%${filtersParam.search}%`
        query = query.or(`titulo.ilike.${searchTerm},local.ilike.${searchTerm}`)
      }

      const { data, error: queryError } = await query

      if (queryError) throw queryError

      if (!data || data.length === 0) {
        if (reset) {
          events.value = []
        }
        return []
      }

      // Filter by type if needed (after fetching, since we need to map tipos)
      let filteredData = data
      if (filtersParam.tipo && filtersParam.tipo !== 'all') {
        // Map filter types to event types
        const typeMap: Record<string, string> = {
          'networking': 'presencial',
          'showcase': 'presencial',
          'workshop': 'webinar',
          'social': 'presencial',
        }
        const eventType = typeMap[filtersParam.tipo]
        if (eventType) {
          filteredData = data.filter((e: any) => e.tipo === eventType)
        }
      }

      // Fetch confirmations for all events
      const eventIds = filteredData.map((e: any) => e.id)
      const { data: confirmationsData } = await supabase
        .from('event_confirmations')
        .select('event_id, user_id')
        .in('event_id', eventIds)

      // Count confirmations per event
      const confirmationsCountMap = new Map<string, number>()
      const userConfirmationsSet = new Set<string>()

      confirmationsData?.forEach((conf: any) => {
        const count = confirmationsCountMap.get(conf.event_id) || 0
        confirmationsCountMap.set(conf.event_id, count + 1)
        
        if (conf.user_id === currentUserId.value) {
          userConfirmationsSet.add(conf.event_id)
        }
      })

      // Transform data to match Event interface
      const transformedEvents: Event[] = filteredData.map((event: any) => ({
        id: event.id,
        titulo: event.titulo,
        descricao: event.descricao,
        data_hora: event.data_hora,
        tipo: event.tipo,
        local: event.local,
        link_gravacao: event.link_gravacao,
        image_url: event.image_url,
        created_by: event.created_by,
        created_at: event.created_at,
        updated_at: event.updated_at,
        status: event.status,
        partner_id: event.partner_id,
        approved_by: event.approved_by,
        approved_at: event.approved_at,
        rejection_reason: event.rejection_reason,
        confirmations_count: confirmationsCountMap.get(event.id) || 0,
        is_confirmed: userConfirmationsSet.has(event.id),
      }))

      // Sort by upcoming (default) or recent
      if (filtersParam.sortBy === 'recent') {
        transformedEvents.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
      } else {
        // Upcoming: events in the future first
        const now = new Date()
        transformedEvents.sort((a, b) => {
          const dateA = new Date(a.data_hora)
          const dateB = new Date(b.data_hora)
          const aIsPast = dateA < now
          const bIsPast = dateB < now
          
          if (aIsPast && !bIsPast) return 1
          if (!aIsPast && bIsPast) return -1
          return dateA.getTime() - dateB.getTime()
        })
      }

      if (reset) {
        events.value = transformedEvents
      } else {
        events.value = [...events.value, ...transformedEvents]
      }

      filters.value = { ...filters.value, ...filtersParam }

      return transformedEvents
    } catch (err: any) {
      error.value = err.message
      console.error('Error fetching events:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Fetch featured event (next upcoming event)
  async function fetchFeaturedEvent(): Promise<Event | null> {
    loading.value = true
    error.value = null

    try {
      // Verificar se é admin
      const isAdminUser = await checkIsAdmin()

      const now = new Date().toISOString()
      let query = supabase
        .from('events')
        .select('*')
        .gte('data_hora', now)
        .order('data_hora', { ascending: true })
        .limit(1)

      // Filtrar apenas eventos aprovados se não for admin
      if (!isAdminUser) {
        query = query.eq('status', 'approved')
      }

      const { data, error: queryError } = await query.maybeSingle()

      if (queryError) throw queryError

      if (!data) {
        featuredEvent.value = null
        return null
      }

      // Fetch confirmations
      const { data: confirmationsData } = await supabase
        .from('event_confirmations')
        .select('event_id, user_id')
        .eq('event_id', data.id)

      const confirmationsCount = confirmationsData?.length || 0
      const isConfirmed = currentUserId.value
        ? (confirmationsData?.some((c: any) => c.user_id === currentUserId.value) || false)
        : false

      const event: Event = {
        id: data.id,
        titulo: data.titulo,
        descricao: data.descricao,
        data_hora: data.data_hora,
        tipo: data.tipo,
        local: data.local,
        link_gravacao: data.link_gravacao,
        image_url: data.image_url,
        created_by: data.created_by,
        created_at: data.created_at,
        updated_at: data.updated_at,
        status: data.status,
        partner_id: data.partner_id,
        approved_by: data.approved_by,
        approved_at: data.approved_at,
        rejection_reason: data.rejection_reason,
        confirmations_count: confirmationsCount,
        is_confirmed: isConfirmed,
      }

      featuredEvent.value = event
      return event
    } catch (err: any) {
      error.value = err.message
      console.error('Error fetching featured event:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Fetch single event by ID
  async function fetchEventById(eventId: string): Promise<Event | null> {
    loading.value = true
    error.value = null

    try {
      // Verificar se é admin para permitir ver eventos não aprovados
      const isAdminUser = await checkIsAdmin()

      let query = supabase
        .from('events')
        .select('*')
        .eq('id', eventId)

      // Se não for admin, apenas eventos aprovados
      if (!isAdminUser) {
        query = query.eq('status', 'approved')
      }

      const { data, error: queryError } = await query.single()

      if (queryError) throw queryError

      // Fetch confirmations
      const { data: confirmationsData } = await supabase
        .from('event_confirmations')
        .select('user_id')
        .eq('event_id', eventId)

      const confirmationsCount = confirmationsData?.length || 0
      const isConfirmed = currentUserId.value
        ? (confirmationsData?.some((c: any) => c.user_id === currentUserId.value) || false)
        : false

      const event: Event = {
        id: data.id,
        titulo: data.titulo,
        descricao: data.descricao,
        data_hora: data.data_hora,
        tipo: data.tipo,
        local: data.local,
        link_gravacao: data.link_gravacao,
        image_url: data.image_url,
        created_by: data.created_by,
        created_at: data.created_at,
        updated_at: data.updated_at,
        status: data.status,
        partner_id: data.partner_id,
        approved_by: data.approved_by,
        approved_at: data.approved_at,
        rejection_reason: data.rejection_reason,
        confirmations_count: confirmationsCount,
        is_confirmed: isConfirmed,
      }

      currentEvent.value = event
      return event
    } catch (err: any) {
      error.value = err.message
      console.error('Error fetching event:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Confirm event attendance (optimistic update)
  async function confirmEvent(eventId: string): Promise<void> {
    if (!currentUserId.value) {
      throw new Error('User must be authenticated to confirm events')
    }

    const event = events.value.find(e => e.id === eventId) || featuredEvent.value || currentEvent.value
    if (!event) {
      throw new Error('Event not found')
    }

    // Optimistic update
    const wasConfirmed = event.is_confirmed
    event.is_confirmed = true
    event.confirmations_count = (event.confirmations_count || 0) + (wasConfirmed ? 0 : 1)

    try {
      const { error: insertError } = await supabase
        .from('event_confirmations')
        .insert({
          event_id: eventId,
          user_id: currentUserId.value,
        })

      if (insertError) {
        // Check if it's a duplicate key error (already confirmed)
        if (insertError.code === '23505') {
          // Already confirmed, revert the count increment
          event.confirmations_count = (event.confirmations_count || 0) - 1
          event.is_confirmed = true // Keep as confirmed
          return
        }
        throw insertError
      }
    } catch (err: any) {
      // Revert optimistic update on error
      event.is_confirmed = wasConfirmed
      if (!wasConfirmed) {
        event.confirmations_count = Math.max(0, (event.confirmations_count || 0) - 1)
      }
      console.error('Error confirming event:', err)
      throw err
    }
  }

  // Cancel confirmation (optimistic update)
  async function cancelConfirmation(eventId: string): Promise<void> {
    if (!currentUserId.value) {
      throw new Error('User must be authenticated to cancel confirmations')
    }

    const event = events.value.find(e => e.id === eventId) || featuredEvent.value || currentEvent.value
    if (!event) {
      throw new Error('Event not found')
    }

    // Optimistic update
    const wasConfirmed = event.is_confirmed
    event.is_confirmed = false
    event.confirmations_count = Math.max(0, (event.confirmations_count || 0) - 1)

    try {
      const { error: deleteError } = await supabase
        .from('event_confirmations')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', currentUserId.value)

      if (deleteError) throw deleteError
    } catch (err: any) {
      // Revert optimistic update on error
      event.is_confirmed = wasConfirmed
      if (wasConfirmed) {
        event.confirmations_count = (event.confirmations_count || 0) + 1
      }
      console.error('Error canceling confirmation:', err)
      throw err
    }
  }

  // Create event
  async function createEvent(input: EventCreateInput): Promise<Event> {
    if (!currentUserId.value) {
      throw new Error('User must be authenticated to create events')
    }

    loading.value = true
    error.value = null

    try {
      const { data, error: insertError } = await supabase
        .from('events')
        .insert({
          titulo: input.titulo,
          descricao: input.descricao || null,
          data_hora: input.data_hora,
          tipo: input.tipo,
          local: input.local || null,
          image_url: input.image_url || null,
          status: 'pending', // Sempre criar como pending
          created_by: currentUserId.value,
          partner_id: input.partner_id || null,
        })
        .select('*')
        .single()

      if (insertError) throw insertError

      const newEvent: Event = {
        id: data.id,
        titulo: data.titulo,
        descricao: data.descricao,
        data_hora: data.data_hora,
        tipo: data.tipo,
        local: data.local,
        link_gravacao: data.link_gravacao,
        image_url: data.image_url,
        created_by: data.created_by,
        created_at: data.created_at,
        updated_at: data.updated_at,
        status: data.status,
        partner_id: data.partner_id,
        approved_by: data.approved_by,
        approved_at: data.approved_at,
        rejection_reason: data.rejection_reason,
        confirmations_count: 0,
        is_confirmed: false,
      }

      // Add to beginning of events array
      events.value = [newEvent, ...events.value]

      return newEvent
    } catch (err: any) {
      error.value = err.message
      console.error('Error creating event:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Reset store
  function reset() {
    events.value = []
    featuredEvent.value = null
    currentEvent.value = null
    loading.value = false
    error.value = null
    filters.value = { sortBy: 'upcoming' }
  }

  // Computed getters
  const upcomingEvents = computed(() => {
    const now = new Date()
    return events.value.filter(e => new Date(e.data_hora) >= now)
  })

  const pastEvents = computed(() => {
    const now = new Date()
    return events.value.filter(e => new Date(e.data_hora) < now)
  })

  return {
    // State
    events,
    featuredEvent,
    currentEvent,
    loading,
    error,
    filters,
    // Computed
    upcomingEvents,
    pastEvents,
    // Actions
    fetchEvents,
    fetchFeaturedEvent,
    fetchEventById,
    confirmEvent,
    cancelConfirmation,
    createEvent,
    reset,
  }
})

