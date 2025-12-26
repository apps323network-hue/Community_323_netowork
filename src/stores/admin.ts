import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from './auth'
import type { AdminEvent, EventStats, EventApprovalAction } from '@/types/admin'
import type { EventStatus } from '@/types/events'

export const useAdminStore = defineStore('admin', () => {
  const pendingEvents = ref<AdminEvent[]>([])
  const allEvents = ref<AdminEvent[]>([])
  const stats = ref<EventStats>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  })
  const loading = ref(false)
  const error = ref<string | null>(null)

  const authStore = useAuthStore()

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

  // Buscar eventos pendentes
  async function fetchPendingEvents() {
    loading.value = true
    error.value = null

    try {
      const { data, error: queryError } = await supabase
        .from('events')
        .select(`
          *,
          creator:profiles!events_created_by_fkey(id, nome)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      if (queryError) throw queryError

      pendingEvents.value = (data || []).map((event: any) => ({
        ...event,
        creator_name: event.creator?.nome || 'Usuário',
        partner_name: event.partner?.nome,
      }))
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
      let query = supabase
        .from('events')
        .select(`
          *,
          creator:profiles!events_created_by_fkey(id, nome)
        `)
        .order('created_at', { ascending: false })

      if (statusFilter) {
        query = query.eq('status', statusFilter)
      }

      const { data, error: queryError } = await query

      if (queryError) throw queryError

      allEvents.value = (data || []).map((event: any) => ({
        ...event,
        creator_name: event.creator?.nome || 'Usuário',
        partner_name: event.partner?.nome,
      }))
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
          rejection_reason: reason || null,
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

      return data
    } catch (err: any) {
      error.value = err.message
      console.error('Error rejecting event:', err)
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
    loading,
    error,
    checkIsAdmin,
    fetchPendingEvents,
    fetchAllEvents,
    approveEvent,
    rejectEvent,
    fetchEventStats,
    handleEventApproval,
  }
})

