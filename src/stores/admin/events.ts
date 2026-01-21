import { defineStore } from 'pinia'
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { supabase } from '@/lib/supabase'
import { logAdminAction } from '@/lib/auditLog'
import { useAdminBaseStore } from './base'
import i18n from '@/i18n'
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
        console.log('[ADMIN] Primeiros 3 eventos:', eventsData.slice(0, 3).map((e: any) => ({ id: e.id, titulo_pt: e.titulo_pt, status: e.status })))
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

      // Buscar contagem de confirmações para cada evento
      const eventIds = eventsData.map((e: any) => e.id)
      let confirmationsMap = new Map<string, number>()

      if (eventIds.length > 0) {
        const { data: confirmationsData } = await supabase
          .from('event_confirmations')
          .select('event_id')
          .in('event_id', eventIds)

        // Contar confirmações por evento
        confirmationsData?.forEach((conf: any) => {
          const count = confirmationsMap.get(conf.event_id) || 0
          confirmationsMap.set(conf.event_id, count + 1)
        })
      }

      // Combinar eventos com profiles e contagem de confirmações
      allEvents.value = eventsData.map((event: any) => {
        const creator = event.created_by ? creatorsMap.get(event.created_by) : null
        return {
          ...event,
          creator_name: creator?.nome || 'Usuário',
          partner_name: event.partner?.nome,
          program_name: event.programs?.title_pt,
          confirmations_count: confirmationsMap.get(event.id) || 0,
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
          reviewed_by: authStore.user.id,
          reviewed_at: new Date().toISOString(),
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
        details: { titulo_pt: data.titulo_pt }
      })

      // Enviar notificação para o criador do evento
      if (data.created_by) {
        await supabase.from('notifications').insert({
          user_id: data.created_by,
          type: 'event_approved',
          title: i18n.global.t('notifications.eventApprovedTitle'),
          content: i18n.global.t('notifications.eventApprovedContent', { title: data.titulo_pt }),
          metadata: {
            event_id: eventId,
            event_title: data.titulo_pt
          }
        })
      }

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
          reviewed_by: authStore.user.id,
          reviewed_at: new Date().toISOString(),
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

      // Enviar notificação para o criador do evento
      if (data.created_by) {
        await supabase.from('notifications').insert({
          user_id: data.created_by,
          type: 'event_rejected',
          title: i18n.global.t('notifications.eventRejectedTitle'),
          content: i18n.global.t('notifications.eventRejectedContent', {
            title: data.titulo_pt,
            reason: reason || i18n.global.t('common.noReasonProvided')
          }),
          metadata: {
            event_id: eventId,
            event_title: data.titulo_pt,
            reason: reason
          }
        })
      }

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
  async function createEvent(eventData: { titulo_pt: string; titulo_en: string; descricao_pt?: string; descricao_en?: string; data_hora: string; tipo: string; local_pt?: string; local_en?: string; status?: EventStatus; image_url?: string; partner_id?: string; program_id: string }) {
    if (!authStore.user) {
      throw new Error('Usuário não autenticado')
    }

    loading.value = true
    error.value = null

    try {
      const { data, error: insertError } = await supabase
        .from('events')
        .insert({
          titulo_pt: eventData.titulo_pt,
          titulo_en: eventData.titulo_en,
          descricao_pt: eventData.descricao_pt || null,
          descricao_en: eventData.descricao_en || null,
          data_hora: eventData.data_hora,
          tipo: eventData.tipo,
          local_pt: eventData.local_pt || null,
          local_en: eventData.local_en || null,
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
        details: { titulo_pt: data.titulo_pt, tipo: data.tipo, status: data.status }
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

  // Buscar participantes confirmados de um evento
  async function fetchEventAttendees(eventId: string) {
    try {
      // Buscar confirmações do evento
      const { data: confirmations, error: confError } = await supabase
        .from('event_confirmations')
        .select('user_id, created_at')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false })

      if (confError) throw confError

      if (!confirmations || confirmations.length === 0) {
        return []
      }

      // Buscar perfis dos usuários confirmados
      const userIds = confirmations.map((c: any) => c.user_id)
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, nome, email, avatar_url, plano')
        .in('id', userIds)

      if (profilesError) throw profilesError

      // Montar mapa de perfis
      const profilesMap = new Map<string, any>()
      profiles?.forEach((p: any) => {
        profilesMap.set(p.id, p)
      })

      // Combinar confirmações com perfis
      return confirmations.map((conf: any) => {
        const profile = profilesMap.get(conf.user_id)
        return {
          user_id: conf.user_id,
          nome: profile?.nome || 'Usuário',
          email: profile?.email || '',
          avatar_url: profile?.avatar_url || '',
          plano: profile?.plano || 'Free',
          confirmed_at: conf.created_at,
        }
      })
    } catch (err: any) {
      console.error('Error fetching event attendees:', err)
      throw err
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
    fetchEventAttendees,
  }
})

