import { computed, ref } from 'vue'
import { useUserStore } from '@/stores/user'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth'
import type { Event, EventCreateInput } from '@/types/events'

export function usePartner() {
  const userStore = useUserStore()
  const authStore = useAuthStore()

  const isPartner = computed(() => {
    return userStore.profile?.role === 'partner' || userStore.profile?.role === 'admin'
  })

  const myEvents = ref<Event[]>([])
  const loading = ref(false)

  // Buscar eventos do parceiro
  async function fetchMyEvents() {
    if (!authStore.user) return []

    loading.value = true
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('created_by', authStore.user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Atualizar lista local
      myEvents.value = data || []
      return data || []
    } catch (err: any) {
      console.error('Error fetching partner events:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Criar evento (sempre com status='pending')
  async function createEvent(input: EventCreateInput): Promise<Event> {
    if (!authStore.user) {
      throw new Error('Usuário não autenticado')
    }

    if (!isPartner.value) {
      throw new Error('Apenas parceiros podem criar eventos')
    }

    try {
      const { data, error } = await supabase
        .from('events')
        .insert({
          ...input,
          status: 'pending', // Sempre criar como pending
          created_by: authStore.user.id,
          partner_id: userStore.profile?.role === 'partner' ? undefined : null, // Se for partner, pode vincular partner_id
        })
        .select()
        .single()

      if (error) throw error

      // Adicionar à lista local
      myEvents.value.unshift(data)

      return data
    } catch (err: any) {
      console.error('Error creating event:', err)
      throw err
    }
  }

  // Atualizar evento (apenas se pendente)
  async function updateEvent(eventId: string, input: Partial<EventCreateInput>): Promise<Event> {
    if (!authStore.user) {
      throw new Error('Usuário não autenticado')
    }

    try {
      // Verificar se evento existe e é do usuário e está pendente
      const { data: existingEvent, error: fetchError } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .eq('created_by', authStore.user.id)
        .single()

      if (fetchError) throw fetchError

      if (existingEvent.status !== 'pending') {
        throw new Error('Apenas eventos pendentes podem ser editados')
      }

      const { data, error } = await supabase
        .from('events')
        .update({
          ...input,
          updated_at: new Date().toISOString(),
        })
        .eq('id', eventId)
        .select()
        .single()

      if (error) throw error

      // Atualizar na lista local
      const index = myEvents.value.findIndex(e => e.id === eventId)
      if (index !== -1) {
        myEvents.value[index] = data
      }

      return data
    } catch (err: any) {
      console.error('Error updating event:', err)
      throw err
    }
  }

  // Obter status do evento
  function getEventStatus(eventId: string): string | undefined {
    const event = myEvents.value.find(e => e.id === eventId)
    return event?.status
  }

  return {
    isPartner,
    myEvents: computed(() => myEvents.value),
    loading: computed(() => loading.value),
    fetchMyEvents,
    createEvent,
    updateEvent,
    getEventStatus,
  }
}

