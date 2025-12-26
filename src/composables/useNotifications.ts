import { ref } from 'vue'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth'

export interface Notification {
    id: string
    user_id: string
    type: string
    title: string
    content: string
    metadata: any
    read: boolean
    created_at: string
}

export function useNotifications() {
    const notifications = ref<Notification[]>([])
    const loading = ref(false)
    const unreadCount = ref(0)
    const authStore = useAuthStore()

    async function fetchNotifications() {
        if (!authStore.user) return

        try {
            loading.value = true
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', authStore.user.id)
                .order('created_at', { ascending: false })
                .limit(20)

            if (error) throw error
            notifications.value = data || []
            updateUnreadCount()
        } catch (error) {
            console.error('Error fetching notifications:', error)
        } finally {
            loading.value = false
        }
    }

    async function markAsRead(notificationId: string) {
        try {
            const { error } = await supabase
                .from('notifications')
                .update({ read: true })
                .eq('id', notificationId)

            if (error) throw error

            const notification = notifications.value.find(n => n.id === notificationId)
            if (notification) {
                notification.read = true
                updateUnreadCount()
            }
        } catch (error) {
            console.error('Error marking notification as read:', error)
        }
    }

    async function markAllAsRead() {
        if (!authStore.user) return

        try {
            const { error } = await supabase
                .from('notifications')
                .update({ read: true })
                .eq('user_id', authStore.user.id)
                .eq('read', false)

            if (error) throw error

            notifications.value.forEach(n => n.read = true)
            unreadCount.value = 0
        } catch (error) {
            console.error('Error marking all notifications as read:', error)
        }
    }

    function updateUnreadCount() {
        unreadCount.value = notifications.value.filter(n => !n.read).length
    }

    // Real-time subscription
    let subscription: any = null

    function subscribeToNotifications() {
        if (!authStore.user) return

        subscription = supabase
            .channel('public:notifications')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${authStore.user.id}`
                },
                (payload) => {
                    notifications.value.unshift(payload.new as Notification)
                    unreadCount.value++
                }
            )
            .subscribe()
    }

    function unsubscribeFromNotifications() {
        if (subscription) {
            supabase.removeChannel(subscription)
        }
    }

    return {
        notifications,
        loading,
        unreadCount,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        subscribeToNotifications,
        unsubscribeFromNotifications
    }
}
