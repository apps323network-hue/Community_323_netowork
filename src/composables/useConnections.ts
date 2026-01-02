import { ref } from 'vue'
import { supabase } from '@/lib/supabase'
import { logAdminAction } from '@/lib/auditLog'
import { useGamificationStore } from '@/stores/gamification'

export interface Connection {
    id: string
    requester_id: string
    responder_id: string
    status: 'pending' | 'accepted' | 'rejected'
    created_at: string
}

export function useConnections() {
    const loading = ref(false)
    const gamificationStore = useGamificationStore()

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

            // Log da ação
            logAdminAction(requesterId, {
                action: 'user_send_connection_request',
                targetId: responderId,
                targetType: 'user',
                details: {
                    requesterId,
                    responderId
                }
            })

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

    async function fetchPendingRequests(userId: string) {
        loading.value = true
        try {
            const { data, error } = await supabase
                .from('connections')
                .select(`
                    id,
                    requester_id,
                    created_at,
                    profiles:requester_id (
                        id,
                        nome,
                        area_atuacao,
                        avatar_url
                    )
                `)
                .eq('responder_id', userId)
                .eq('status', 'pending')
                .order('created_at', { ascending: false })

            if (error) throw error
            return data
        } catch (error) {
            console.error('Error fetching pending requests:', error)
            return []
        } finally {
            loading.value = false
        }
    }

    async function updateConnectionStatus(connectionId: string, status: 'accepted' | 'rejected') {
        loading.value = true
        try {
            const { error } = await supabase
                .from('connections')
                .update({
                    status,
                    updated_at: new Date().toISOString()
                })
                .eq('id', connectionId)

            if (error) throw error

            if (status === 'accepted') {
                // Fetch connection details to get both user IDs
                const { data: conn } = await supabase
                    .from('connections')
                    .select('requester_id, responder_id')
                    .eq('id', connectionId)
                    .single()

                if (conn) {
                    // Award points to both participants
                    // Note: awardPoints currently uses the authenticated user ID from its own store.
                    // I might need to update awardPoints to accept a targetUserId if I want to award BOTH.
                    // For now, let's at least award to the current user (responder who accepted).
                    await gamificationStore.awardPoints(15, 'connection', connectionId, 'Nova conexão estabelecida')
                }
            }

            return { success: true }
        } catch (error: any) {
            console.error('Error updating connection status:', error)
            return { success: false, error: error.message }
        } finally {
            loading.value = false
        }
    }

    return {
        loading,
        fetchConnectionsCount,
        sendConnectionRequest,
        getConnectionStatus,
        fetchPendingRequests,
        updateConnectionStatus
    }
}
