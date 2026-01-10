import { computed } from 'vue'
import { useAdminStore } from '@/stores/admin'
import { useUserStore } from '@/stores/user'
import type { EventApprovalAction } from '@/types/admin'
import type { EventStatus } from '@/types/events'

export function useAdmin() {
  const adminStore = useAdminStore()
  const userStore = useUserStore()

  const isAdmin = computed(() => {
    return userStore.profile?.role === 'admin'
  })

  const isPartner = computed(() => {
    return userStore.profile?.role === 'partner' || isAdmin.value
  })

  async function checkIsAdmin(): Promise<boolean> {
    return await adminStore.checkIsAdmin()
  }

  async function loadPendingEvents() {
    await adminStore.fetchPendingEvents()
  }

  async function loadAllEvents(statusFilter?: EventStatus) {
    await adminStore.fetchAllEvents(statusFilter)
  }

  async function approveEvent(eventId: string) {
    return await adminStore.approveEvent(eventId)
  }

  async function rejectEvent(eventId: string, reason?: string) {
    return await adminStore.rejectEvent(eventId, reason)
  }

  async function loadEventStats() {
    await adminStore.fetchEventStats()
  }

  async function handleApproval(action: EventApprovalAction) {
    return await adminStore.handleEventApproval(action)
  }

  async function createEvent(eventData: { titulo_pt: string; titulo_en: string; descricao_pt?: string; descricao_en?: string; data_hora: string; tipo: string; local_pt?: string; local_en?: string; status?: EventStatus; image_url?: string; partner_id?: string; program_id: string }) {
    if (!adminStore.createEvent) {
      console.error('[useAdmin] createEvent não está disponível no store')
      throw new Error('Função createEvent não está disponível. Por favor, recarregue a página.')
    }
    return await adminStore.createEvent(eventData)
  }

  async function toggleEventDestaque(eventId: string, destaque: boolean) {
    return await adminStore.toggleEventDestaque(eventId, destaque)
  }

  async function deleteEvent(eventId: string) {
    // Verificar se a função existe no store
    const storeKeys = Object.keys(adminStore)
    const hasDeleteEvent = 'deleteEvent' in adminStore && typeof adminStore.deleteEvent === 'function'

    if (!hasDeleteEvent) {
      console.error('[useAdmin] deleteEvent não está disponível no store')
      console.error('[useAdmin] Store keys (primeiras 20):', storeKeys.slice(0, 20))
      console.error('[useAdmin] Store keys (todas):', storeKeys)
      console.error('[useAdmin] Store type:', typeof adminStore)
      console.error('[useAdmin] deleteEvent in store:', 'deleteEvent' in adminStore)
      console.error('[useAdmin] adminStore.deleteEvent:', adminStore.deleteEvent)
      console.error('[useAdmin] Verificando funções relacionadas a eventos:', storeKeys.filter(k => k.toLowerCase().includes('event')))

      // Tentar acessar diretamente do store
      const adminStoreDirect = useAdminStore()
      console.log('[useAdmin] Tentando acessar store direto...')
      console.log('[useAdmin] Store direto keys (primeiras 20):', Object.keys(adminStoreDirect).slice(0, 20))
      console.log('[useAdmin] deleteEvent no store direto:', 'deleteEvent' in adminStoreDirect, typeof adminStoreDirect.deleteEvent)

      if (typeof adminStoreDirect.deleteEvent === 'function') {
        console.log('[useAdmin] Encontrado deleteEvent no store direto, usando...')
        return await adminStoreDirect.deleteEvent(eventId)
      }

      throw new Error('Função deleteEvent não está disponível. Por favor, recarregue a página completamente (F5) ou reinicie o servidor de desenvolvimento.')
    }
    return await adminStore.deleteEvent(eventId)
  }

  return {
    // State
    pendingEvents: computed(() => adminStore.pendingEvents),
    allEvents: computed(() => adminStore.allEvents),
    stats: computed(() => adminStore.stats),
    loading: computed(() => adminStore.loading),
    error: computed(() => adminStore.error),

    // Computed
    isAdmin,
    isPartner,

    // Methods
    checkIsAdmin,
    loadPendingEvents,
    loadAllEvents,
    approveEvent,
    rejectEvent,
    loadEventStats,
    handleApproval,
    createEvent,
    toggleEventDestaque,
    deleteEvent,
  }
}




