import { defineStore } from 'pinia'
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { supabase } from '@/lib/supabase'
import { logAdminAction } from '@/lib/auditLog'
import { useAdminBaseStore } from './base'
import type { AdminEvent, EventStats, EventApprovalAction } from '@/types/admin'
import type { EventStatus } from '@/types/events'

export const useAdminEventsStore = defineStore('admin-events', () => {
  const baseStore = useAdminBaseStore()
  const { loading, error } = storeToRefs(baseStore)
  const authStore = baseStore.authStore

  const pendingEvents = ref<AdminEvent[]>([])
  const allEvents = ref<AdminEvent[]>([])
  const stats = ref<EventStats>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  })

  // Buscar eventos pendentes
  async function fetchPendingEvents() {
    loading.value = true
    error.value = null

    try {
      // Buscar eventos pendentes
      const { data: eventsData, error: queryError } = await supabase
        .from('events')
        .select(`
          *,
          programs (
            title_pt
          )
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      if (queryError) throw queryError

      if (!eventsData || eventsData.length === 0) {
        pendingEvents.value = []
        return
      }

      // Buscar profiles dos criadores
      const creatorIds = [...new Set(eventsData.map((e: any) => e.created_by).filter(Boolean))]
      let creatorsMap = new Map<string, any>()

      if (creatorIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, nome')
          .in('id', creatorIds)

        profilesData?.forEach((profile: any) => {
          creatorsMap.set(profile.id, profile)
        })
      }

      // Combinar eventos com profiles
      pendingEvents.value = eventsData.map((event: any) => {
        const creator = event.created_by ? creatorsMap.get(event.created_by) : null
        return {
          ...event,
          creator_name: creator?.nome || 'Usuário',
          partner_name: event.partner?.nome,
          program_name: event.programs?.title_pt,
        }
      })
    } catch (err: any) {
      error.value = err.message
      console.error('Error fetching pending events:', err)
    } finally {
      loading.value = false
    }
  }

  // Buscar todos os eventos (para admin)
  async function fetchAllEvents(statusFilter?: EventStatus) {
    loading.value = true
    error.value = null

    try {
      console.log('[ADMIN] Buscando todos os eventos...', { statusFilter })

      // Buscar eventos
      let query = supabase
        .from('events')
        .select(`
          *,
          programs (
            title_pt
          )
        `)
        .order('created_at', { ascending: false })

      if (statusFilter) {
        query = query.eq('status', statusFilter)
      }

      const { data: eventsData, error: queryError } = await query

      if (queryError) {
        console.error('[ADMIN] Erro ao buscar todos os eventos:', queryError)
        throw queryError
      }

      console.log(`[ADMIN] Eventos encontrados: ${eventsData?.length || 0}`)
      if (eventsData && eventsData.length > 0) {
        console.log('[ADMIN] Primeiros 3 eventos:', eventsData.slice(0, 3).map((e: any) => ({ id: e.id, titulo: e.titulo, status: e.status })))
      }

      if (!eventsData || eventsData.length === 0) {
        allEvents.value = []
        return
      }

      // Buscar profiles dos criadores
      const creatorIds = [...new Set(eventsData.map((e: any) => e.created_by).filter(Boolean))]
      let creatorsMap = new Map<string, any>()

      if (creatorIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, nome')
          .in('id', creatorIds)

        profilesData?.forEach((profile: any) => {
          creatorsMap.set(profile.id, profile)
        })
      }

      // Combinar eventos com profiles
      allEvents.value = eventsData.map((event: any) => {
        const creator = event.created_by ? creatorsMap.get(event.created_by) : null
        return {
          ...event,
          creator_name: creator?.nome || 'Usuário',
          partner_name: event.partner?.nome,
          program_name: event.programs?.title_pt,
        }
      })
    } catch (err: any) {
      error.value = err.message
      console.error('Error fetching all events:', err)
    } finally {
      loading.value = false
    }
  }

  // Aprovar evento
  async function approveEvent(eventId: string) {
    if (!authStore.user) {
      throw new Error('Usuário não autenticado')
    }

    loading.value = true
    error.value = null

    try {
      const { data, error: updateError } = await supabase
        .from('events')
        .update({
          status: 'approved',
          approved_by: authStore.user.id,
          approved_at: new Date().toISOString(),
          rejection_reason: null,
        })
        .eq('id', eventId)
        .select()
        .single()

      if (updateError) throw updateError

      // Atualizar lista local
      const index = pendingEvents.value.findIndex(e => e.id === eventId)
      if (index !== -1) {
        pendingEvents.value.splice(index, 1)
      }

      // Atualizar stats
      await fetchEventStats()

      // Log da ação
      logAdminAction(authStore.user.id, {
        action: 'approve_event',
        targetId: eventId,
        targetType: 'event',
        details: { titulo: data.titulo }
      })

      return data
    } catch (err: any) {
      error.value = err.message
      console.error('Error approving event:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Rejeitar evento
  async function rejectEvent(eventId: string, reason?: string) {
    if (!authStore.user) {
      throw new Error('Usuário não autenticado')
    }

    loading.value = true
    error.value = null

    try {
      const { data, error: updateError } = await supabase
        .from('events')
        .update({
          status: 'rejected',
          approved_by: authStore.user.id,
          approved_at: new Date().toISOString(),
          rejection_reason: reason || undefined,
        })
        .eq('id', eventId)
        .select()
        .single()

      if (updateError) throw updateError

      // Atualizar lista local
      const index = pendingEvents.value.findIndex(e => e.id === eventId)
      if (index !== -1) {
        pendingEvents.value.splice(index, 1)
      }

      // Atualizar stats
      await fetchEventStats()

      // Log da ação
      logAdminAction(authStore.user.id, {
        action: 'reject_event',
        targetId: eventId,
        targetType: 'event',
        details: { reason }
      })

      return data
    } catch (err: any) {
      error.value = err.message
      console.error('Error rejecting event:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Toggle destaque de evento (admin)
  async function toggleEventDestaque(eventId: string, destaque: boolean) {
    if (!authStore.user) {
      throw new Error('Usuário não autenticado')
    }

    loading.value = true
    error.value = null

    try {
      // Se está marcando como destaque, desmarcar todos os outros primeiro
      if (destaque) {
        await supabase
          .from('events')
          .update({ destaque: false })
          .neq('id', eventId)
      }

      // Atualizar o evento atual
      const { data, error: updateError } = await supabase
        .from('events')
        .update({ destaque })
        .eq('id', eventId)
        .select()
        .single()

      if (updateError) throw updateError

      // Atualizar lista local
      const eventIndex = allEvents.value.findIndex(e => e.id === eventId)
      if (eventIndex !== -1) {
        allEvents.value[eventIndex] = { ...allEvents.value[eventIndex], destaque }
      }

      return data
    } catch (err: any) {
      error.value = err.message
      console.error('Error toggling event destaque:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Deletar evento (admin)
  async function deleteEvent(eventId: string) {
    console.log('[ADMIN STORE] deleteEvent chamada com eventId:', eventId)
    if (!authStore.user) {
      throw new Error('Usuário não autenticado')
    }

    loading.value = true
    error.value = null

    try {
      const { error: deleteError } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId)

      if (deleteError) throw deleteError

      // Remover da lista local
      const pendingIndex = pendingEvents.value.findIndex(e => e.id === eventId)
      if (pendingIndex !== -1) {
        pendingEvents.value.splice(pendingIndex, 1)
      }

      const allIndex = allEvents.value.findIndex(e => e.id === eventId)
      if (allIndex !== -1) {
        allEvents.value.splice(allIndex, 1)
      }

      // Atualizar stats
      await fetchEventStats()

      return true
    } catch (err: any) {
      error.value = err.message
      console.error('Error deleting event:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Criar novo evento (admin)
  async function createEvent(eventData: { titulo: string; descricao?: string; data_hora: string; tipo: string; local?: string; status?: EventStatus; image_url?: string; partner_id?: string; program_id: string }) {
    if (!authStore.user) {
      throw new Error('Usuário não autenticado')
    }

    loading.value = true
    error.value = null

    try {
      const { data, error: insertError } = await supabase
        .from('events')
        .insert({
          titulo: eventData.titulo,
          descricao: eventData.descricao || null,
          data_hora: eventData.data_hora,
          tipo: eventData.tipo,
          local: eventData.local || null,
          image_url: eventData.image_url || null,
          status: eventData.status || 'approved', // Admin pode criar já aprovado
          created_by: authStore.user.id,
          partner_id: eventData.partner_id || null,
          program_id: eventData.program_id,
        })
        .select()
        .single()

      if (insertError) throw insertError

      // Recarregar listas
      await fetchPendingEvents()
      await fetchAllEvents()
      await fetchEventStats()

      // Log da ação
      logAdminAction(authStore.user.id, {
        action: 'create_event',
        targetId: data.id,
        targetType: 'event',
        details: { titulo: data.titulo, tipo: data.tipo, status: data.status }
      })

      return data
    } catch (err: any) {
      error.value = err.message
      console.error('Error creating event:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Buscar estatísticas de eventos
  async function fetchEventStats() {
    try {
      const { data, error: queryError } = await supabase
        .from('events')
        .select('status')

      if (queryError) throw queryError

      const total = data?.length || 0
      const pending = data?.filter(e => e.status === 'pending').length || 0
      const approved = data?.filter(e => e.status === 'approved').length || 0
      const rejected = data?.filter(e => e.status === 'rejected').length || 0

      stats.value = {
        total,
        pending,
        approved,
        rejected,
      }
    } catch (err: any) {
      console.error('Error fetching event stats:', err)
    }
  }

  // Aprovar ou rejeitar evento (ação combinada)
  async function handleEventApproval(action: EventApprovalAction) {
    if (action.action === 'approve') {
      return await approveEvent(action.eventId)
    } else {
      return await rejectEvent(action.eventId, action.reason)
    }
  }

  return {
    pendingEvents,
    allEvents,
    stats,
    fetchPendingEvents,
    fetchAllEvents,
    createEvent,
    toggleEventDestaque,
    approveEvent,
    rejectEvent,
    deleteEvent,
    fetchEventStats,
    handleEventApproval,
  }
})

