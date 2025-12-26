import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

export interface Connection {
    id: string
    requester_id: string
    responder_id: string
    status: 'pending' | 'accepted' | 'rejected'
    created_at: string
}

export function useConnections() {
    const loading = ref(false)

    async function fetchConnectionsCount(userId: string) {
        // Count accepted connections where user is requester OR responder
        const { count, error } = await supabase
            .from('connections')
            .select('*', { count: 'exact', head: true })
            .or(`requester_id.eq.${userId},responder_id.eq.${userId}`)
            .eq('status', 'accepted')

        if (error) {
            console.error('Error fetching connections count:', error)
            return 0
        }
        return count || 0
    }

    async function sendConnectionRequest(requesterId: string, responderId: string) {
        if (requesterId === responderId) return { success: false, error: 'Cannot connect to self' }

        loading.value = true
        try {
            const { error } = await supabase
                .from('connections')
                .insert({
                    requester_id: requesterId,
                    responder_id: responderId,
                    status: 'pending'
                })

            if (error) {
                if (error.code === '23505') {
                    return { success: false, error: 'Request already exists' }
                }
                throw error
            }

            return { success: true }
        } catch (error: any) {
            console.error('Error sending request:', error)
            return { success: false, error: error.message }
        } finally {
            loading.value = false
        }
    }

    async function getConnectionStatus(requesterId: string, responderId: string) {
        try {
            const { data, error } = await supabase
                .from('connections')
                .select('status')
                .or(`and(requester_id.eq.${requesterId},responder_id.eq.${responderId}),and(requester_id.eq.${responderId},responder_id.eq.${requesterId})`)
                .maybeSingle()

            if (error) throw error
            return data ? data.status : null
        } catch (error) {
            console.error('Error fetching connection status:', error)
            return null
        }
    }

    return {
        loading,
        fetchConnectionsCount,
        sendConnectionRequest,
        getConnectionStatus
    }
}
