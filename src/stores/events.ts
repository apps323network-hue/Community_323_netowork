import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from './auth'
import { checkBannedWords } from '@/lib/bannedWords'
import type { Event, EventFilters, EventCreateInput } from '@/types/events'

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

    // 1. Verificar no metadata do JWT (mais rápido)
    const role = authStore.user.user_metadata?.role
    if (role === 'admin') return true

    // 2. Verificar no banco de dados (mais confiável)
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

  const page = ref(0)
  const pageSize = 9
  const hasMore = ref(true)

  // Fetch events with filters
  async function fetchEvents(filtersParam: EventFilters = {}, reset = false) {
    if (reset) {
      events.value = []
      page.value = 0
      hasMore.value = true
    }

    if (!hasMore.value && !reset) return events.value

    loading.value = true
    error.value = null

    try {
      // Verificar se é admin
      const isAdminUser = await checkIsAdmin()

      let query = supabase
        .from('events')
        .select('*')

      // Apply Filter by Status/Permissions directly in the query
      if (!isAdminUser) {
        if (currentUserId.value) {
          // Usuário logado: vê aprovados OU pendentes criados por ele mesmo
          query = query.or(`status.eq.approved,and(status.eq.pending,created_by.eq.${currentUserId.value})`)
        } else {
          // Visitante: vê apenas aprovados
          query = query.eq('status', 'approved')
        }
      }

      query = query.order('data_hora', { ascending: true })

      // Apply search filter
      if (filtersParam.search) {
        const searchTerm = `%${filtersParam.search}%`
        query = query.or(`titulo_pt.ilike.${searchTerm},local_pt.ilike.${searchTerm}`)
      }

      // Apply type filter
      if (filtersParam.tipo && filtersParam.tipo !== 'all') {
        const typeMap: Record<string, string> = {
          'networking': 'presencial',
          'showcase': 'presencial',
          'workshop': 'webinar',
          'social': 'presencial',
        }
        const mappedType = typeMap[filtersParam.tipo]
        if (mappedType) {
          query = query.eq('tipo', mappedType)
        }
      }

      // Apply Pagination
      const from = page.value * pageSize
      const to = from + pageSize - 1
      query = query.range(from, to)

      const { data, error: queryError } = await query

      if (queryError) throw queryError

      let filteredData = data || []

      if (!filteredData || filteredData.length === 0) {
        hasMore.value = false
        if (reset) {
          events.value = []
        }
        return []
      }

      // Check if we reached the end
      if (filteredData.length < pageSize) {
        hasMore.value = false
      }

      // Fetch confirmations for ALL fetched events
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
        titulo_pt: event.titulo_pt || '',
        titulo_en: event.titulo_en || '',
        descricao_pt: event.descricao_pt,
        descricao_en: event.descricao_en,
        data_hora: event.data_hora,
        tipo: event.tipo,
        local_pt: event.local_pt,
        local_en: event.local_en,
        link_gravacao: event.link_gravacao,
        image_url: event.image_url,
        created_by: event.created_by,
        created_at: event.created_at,
        updated_at: event.updated_at,
        status: event.status,
        partner_id: event.partner_id,
        reviewed_by: event.reviewed_by || event.approved_by,
        reviewed_at: event.reviewed_at || event.approved_at,
        rejection_reason: event.rejection_reason,
        destaque: event.destaque || false,
        confirmations_count: confirmationsCountMap.get(event.id) || 0,
        is_confirmed: userConfirmationsSet.has(event.id),
      }))

      // Sort by upcoming (default) or recent
      // Note: We already sorted by date in DB (data_hora).
      // If sortBy is 'recent' (created_at), we should strictly strictly handle that in DB query ideally.
      // But user seems to want mixed sorting logic sometimes.
      // For now, let's keep DB sort as data_hora which matches upcoming logic roughly?
      // Wait, 'recent' usually means created_at.
      // The previous code sorted in memory. If we want pagination, we MUST sort in DB matching the intent.

      // Let's refine the query sort above based on filtersParam.sortBy if possible, 
      // but the method signature has Fetch logic mixed with transformation.
      // Retaining memory sort on a PAGE of results is okay-ish but weird for pagination boundaries.
      // Better to rely on DB order for pagination consistency.

      // However, to minimize risk of changing sort behavior too much:
      // The previous code had `query.order('data_hora', { ascending: true })` AND then memory sort.
      // Ideally we stick to DB sort.
      // Let's assume data_hora ascending is the primary view (Upcoming).

      if (reset) {
        events.value = transformedEvents
      } else {
        // Append unique events just in case, though DB offset should handle it
        const existingIds = new Set(events.value.map(e => e.id))
        const uniqueNewEvents = transformedEvents.filter(e => !existingIds.has(e.id))
        events.value = [...events.value, ...uniqueNewEvents]
      }

      filters.value = { ...filters.value, ...filtersParam }

      // Increment page for next fetch
      if (hasMore.value) {
        page.value++
      }

      return transformedEvents
    } catch (err: any) {
      error.value = err.message
      console.error('Error fetching events:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Fetch featured event (prioridade: destaque manual > próximo evento)
  async function fetchFeaturedEvent(): Promise<Event | null> {
    loading.value = true
    error.value = null

    try {
      // Verificar se é admin
      const isAdminUser = await checkIsAdmin()

      const now = new Date().toISOString()

      // Primeiro, tentar buscar evento marcado como destaque pelo admin
      let query = supabase
        .from('events')
        .select('*')
        .eq('destaque', true)
        .gte('data_hora', now)
        .order('data_hora', { ascending: true })
        .limit(1)

      // Para não-admins, buscar apenas eventos aprovados em destaque
      if (!isAdminUser) {
        query = query.eq('status', 'approved')
      }

      let { data, error: queryError } = await query.maybeSingle()

      if (queryError) throw queryError

      // Filtrar no cliente: apenas aprovados (para não-admins)
      if (data && !isAdminUser) {
        if (data.status !== 'approved') {
          data = null // Não atende critérios, buscar próximo evento
        }
      }

      // Se não encontrou evento em destaque, buscar o próximo evento futuro (fallback)
      if (!data) {
        query = supabase
          .from('events')
          .select('*')
          .gte('data_hora', now)
          .order('data_hora', { ascending: true })
          .limit(1)

        if (!isAdminUser) {
          query = query.eq('status', 'approved')
        }

        const { data: fallbackData, error: fallbackError } = await query.maybeSingle()

        if (fallbackError) throw fallbackError

        if (fallbackData && !isAdminUser) {
          if (fallbackData.status !== 'approved') {
            featuredEvent.value = null
            return null
          }
        }

        data = fallbackData
      }

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
        titulo_pt: data.titulo_pt || '',
        titulo_en: data.titulo_en || '',
        descricao_pt: data.descricao_pt,
        descricao_en: data.descricao_en,
        data_hora: data.data_hora,
        tipo: data.tipo,
        local_pt: data.local_pt,
        local_en: data.local_en,
        link_gravacao: data.link_gravacao,
        image_url: data.image_url,
        created_by: data.created_by,
        created_at: data.created_at,
        updated_at: data.updated_at,
        status: data.status,
        partner_id: data.partner_id,
        reviewed_by: data.reviewed_by || data.approved_by,
        reviewed_at: data.reviewed_at || data.approved_at,
        rejection_reason: data.rejection_reason,
        destaque: data.destaque || false,
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

      // Filtrar eventos: aprovados OU próprios eventos pending para o criador
      // Não aplicamos filtro aqui, vamos filtrar após buscar os dados

      const { data, error: queryError } = await query.single()

      // Filtrar no cliente: aprovados OU próprios eventos pending
      if (data && !isAdminUser) {
        const isApproved = data.status === 'approved'
        const isCreator = currentUserId.value && data.created_by === currentUserId.value
        const isOwnPending = data.status === 'pending' && isCreator
        
        if (!isApproved && !isOwnPending) {
          console.warn('Access denied to event:', eventId, 'Status:', data.status)
          throw new Error('Event not found or not accessible')
        }
      }

      if (queryError) throw queryError

      // Fetch confirmations
      // Fetch confirmations with profiles
      const { data: confirmationsData, error: confirmationsError } = await supabase
        .from('event_confirmations')
        .select(`
          user_id,
          profiles:user_id (
            avatar_url,
            nome
          )
        `)
        .eq('event_id', eventId)

      if (confirmationsError) console.error('Error fetching confirmations:', confirmationsError)

      const confirmedUsers = (confirmationsData || [])
        .map((c: any) => {
          // Handle case where profile might be null or array (though it should be single obj here)
          const profile = Array.isArray(c.profiles) ? c.profiles[0] : c.profiles
          return {
            user_id: c.user_id,
            avatar_url: profile?.avatar_url,
            nome: profile?.nome
          }
        })
        // Filter out any where profile join failed if necessary, but keep if user_id exists
        .filter((u: any) => u.user_id)

      const confirmationsCount = confirmedUsers.length
      const isConfirmed = currentUserId.value
        ? (confirmedUsers.some((u: any) => u.user_id === currentUserId.value))
        : false

      const event: Event = {
        id: data.id,
        titulo_pt: data.titulo_pt || '',
        titulo_en: data.titulo_en || '',
        descricao_pt: data.descricao_pt,
        descricao_en: data.descricao_en,
        data_hora: data.data_hora,
        tipo: data.tipo,
        local_pt: data.local_pt,
        local_en: data.local_en,
        link_gravacao: data.link_gravacao,
        image_url: data.image_url,
        created_by: data.created_by,
        created_at: data.created_at,
        updated_at: data.updated_at,
        status: data.status,
        partner_id: data.partner_id,
        reviewed_by: data.reviewed_by || data.approved_by,
        reviewed_at: data.reviewed_at || data.approved_at,
        rejection_reason: data.rejection_reason,
        destaque: data.destaque || false,
        confirmations_count: confirmationsCount,
        is_confirmed: isConfirmed,
        confirmed_users: confirmedUsers,
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

  // Check if user can create events for a program (must be enrolled)
  async function canCreateEventForProgram(programId: string): Promise<boolean> {
    if (!currentUserId.value) return false

    try {
      const { data, error } = await supabase
        .from('program_enrollments')
        .select('id')
        .eq('program_id', programId)
        .eq('user_id', currentUserId.value)
        .eq('status', 'active')
        .single()

      return !!data && !error
    } catch {
      return false
    }
  }

  // Approve event (admin only)
  async function approveEvent(eventId: string): Promise<void> {
    if (!currentUserId.value) {
      throw new Error('Not authenticated')
    }

    loading.value = true
    error.value = null

    try {
      const { error: updateError } = await supabase
        .from('events')
        .update({
          status: 'approved',
          reviewed_by: currentUserId.value,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', eventId)

      if (updateError) throw updateError

      // Update local state
      const event = events.value.find(e => e.id === eventId)
      if (event) {
        event.status = 'approved'
      }
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Reject event (admin only)
  async function rejectEvent(eventId: string, reason: string): Promise<void> {
    if (!currentUserId.value) {
      throw new Error('Not authenticated')
    }

    loading.value = true
    error.value = null

    try {
      const { error: updateError } = await supabase
        .from('events')
        .update({
          status: 'rejected',
          reviewed_by: currentUserId.value,
          reviewed_at: new Date().toISOString(),
          rejection_reason: reason
        })
        .eq('id', eventId)

      if (updateError) throw updateError

      // Remove from local state
      events.value = events.value.filter(e => e.id !== eventId)
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Confirm event attendance with enrollment validation and auto-enroll
  async function confirmEvent(eventId: string): Promise<void> {
    if (!currentUserId.value) {
      throw new Error('User must be authenticated to confirm events')
    }

    const event = events.value.find(e => e.id === eventId) || featuredEvent.value || currentEvent.value
    if (!event) {
      throw new Error('Event not found')
    }

    // Fetch full event with program details
    const { data: fullEvent, error: fetchError } = await supabase
      .from('events')
      .select('*, programs(*)')
      .eq('id', eventId)
      .single()

    if (fetchError || !fullEvent) {
      throw new Error('Event not found')
    }

    // For PAID programs, check enrollment first
    if (fullEvent.programs && fullEvent.programs.price_usd > 0) {
      const { data: enrollment } = await supabase
        .from('program_enrollments')
        .select('*')
        .eq('program_id', fullEvent.program_id)
        .eq('user_id', currentUserId.value)
        .eq('status', 'active')
        .maybeSingle()

        if (!enrollment) {
          throw new Error(`ENROLLMENT_REQUIRED:${fullEvent.program_id}`)
        }
    }

    // Optimistic update
    const wasConfirmed = event.is_confirmed
    event.is_confirmed = true
    event.confirmations_count = (event.confirmations_count || 0) + (wasConfirmed ? 0 : 1)

    // Optimistic update for confirmed_users list
    if (authStore.user && !wasConfirmed) {
      if (!event.confirmed_users) event.confirmed_users = []
      event.confirmed_users.push({
        user_id: currentUserId.value,
        avatar_url: authStore.user.user_metadata?.avatar_url,
        nome: authStore.user.user_metadata?.full_name || authStore.user.user_metadata?.name || 'Você'
      })
    }

    try {
      const { error: insertError } = await supabase
        .from('event_confirmations')
        .insert({
          event_id: eventId,
          user_id: currentUserId.value,
        })

      if (insertError) {
        if (insertError.code === '23505') {
          event.confirmations_count = (event.confirmations_count || 0) - 1
          event.is_confirmed = true
          return
        }
        throw insertError
      }

      // For FREE programs, auto-enroll if not already enrolled
      if (fullEvent.programs && fullEvent.programs.price_usd === 0) {
        const { data: existingEnrollment } = await supabase
          .from('program_enrollments')
          .select('*')
          .eq('program_id', fullEvent.program_id)
          .eq('user_id', currentUserId.value)
          .maybeSingle()

        if (!existingEnrollment) {
          await supabase.from('program_enrollments').insert({
            program_id: fullEvent.program_id,
            user_id: currentUserId.value,
            status: 'active',
            payment_status: 'paid'
          })
        }
      }

      // Award 20 points (only once per event)
      const { data: existingPoints } = await supabase
        .from('event_points_awarded')
        .select('*')
        .eq('event_id', eventId)
        .eq('user_id', currentUserId.value)
        .single()

      if (!existingPoints) {
        await supabase.from('event_points_awarded').insert({
          event_id: eventId,
          user_id: currentUserId.value,
          points_awarded: 20
        })

        await supabase.rpc('add_user_points', {
          p_user_id: currentUserId.value,
          p_points: 20
        })
      }
    } catch (err: any) {
      // Revert optimistic update on error
      event.is_confirmed = wasConfirmed
      if (!wasConfirmed) {
        event.confirmations_count = Math.max(0, (event.confirmations_count || 0) - 1)
      }
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
      // Verificar palavras proibidas em título e descrição
      const titleCheckPt = await checkBannedWords(input.titulo_pt)
      const titleCheckEn = await checkBannedWords(input.titulo_en)
      const descCheckPt = input.descricao_pt ? await checkBannedWords(input.descricao_pt) : { found: false, action: null, words: [] }
      const descCheckEn = input.descricao_en ? await checkBannedWords(input.descricao_en) : { found: false, action: null, words: [] }

      // Bloquear qualquer palavra ofensiva encontrada
      if (titleCheckPt.found || titleCheckEn.found) {
        throw new Error('O título do evento contém palavras ofensivas. Por favor, revise o conteúdo.')
      }

      if (descCheckPt.found || descCheckEn.found) {
        throw new Error('A descrição do evento contém palavras ofensivas. Por favor, revise o conteúdo.')
      }

      const { data, error: insertError } = await supabase
        .from('events')
        .insert({
          titulo_pt: input.titulo_pt,
          titulo_en: input.titulo_en,
          descricao_pt: input.descricao_pt || null,
          descricao_en: input.descricao_en || null,
          data_hora: input.data_hora,
          tipo: input.tipo,
          local_pt: input.local_pt || null,
          local_en: input.local_en || null,
          image_url: input.image_url || null,
          status: 'pending', // Sempre criar como pending
          created_by: currentUserId.value,
          partner_id: input.partner_id || null,
          program_id: input.program_id, // Add program_id
        })
        .select('*')
        .single()

      if (insertError) throw insertError

      const newEvent: Event = {
        id: data.id,
        titulo_pt: data.titulo_pt || '',
        titulo_en: data.titulo_en || '',
        descricao_pt: data.descricao_pt,
        descricao_en: data.descricao_en,
        data_hora: data.data_hora,
        tipo: data.tipo,
        local_pt: data.local_pt,
        local_en: data.local_en,
        link_gravacao: data.link_gravacao,
        image_url: data.image_url,
        created_by: data.created_by,
        created_at: data.created_at,
        updated_at: data.updated_at,
        status: data.status,
        partner_id: data.partner_id,
        reviewed_by: data.reviewed_by || data.approved_by,
        reviewed_at: data.reviewed_at || data.approved_at,
        rejection_reason: data.rejection_reason,
        confirmations_count: 0,
        is_confirmed: false,
      }

      // Add to beginning of events array
      events.value = [newEvent, ...events.value]

      // Notificar admins se evento estiver pendente
      if (newEvent.status === 'pending') {
        // Buscar nome do criador
        const { data: creatorProfile } = await supabase
          .from('profiles')
          .select('nome')
          .eq('id', currentUserId.value)
          .single()

        const creatorName = creatorProfile?.nome || 'Usuário'

        // Chamar notificação de forma assíncrona sem bloquear
        import('@/lib/emails').then(({ notifyAdminsNewEvent }) => {
          notifyAdminsNewEvent(
            newEvent.id,
            newEvent.titulo_pt,
            newEvent.data_hora,
            newEvent.tipo,
            creatorName
          ).catch(err => {
            console.error('Failed to notify admins about new event:', err)
          })
        })
      }

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
    hasMore,
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
    canCreateEventForProgram,
    approveEvent,
    rejectEvent,
    reset,
  }
})

