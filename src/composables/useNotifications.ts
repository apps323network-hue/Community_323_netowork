import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth'
import { useI18n } from 'vue-i18n'

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

export interface GroupedNotification extends Notification {
    ids: string[]
    actor_names: string[]
    count: number
}

export function useNotifications() {
    const notifications = ref<Notification[]>([])
    const loading = ref(false)
    const unreadCount = ref(0)
    const hasMore = ref(true)
    const authStore = useAuthStore()
    const { t, locale } = useI18n()
    const PAGE_SIZE = 15

    const groupedNotifications = computed(() => {
        const groups: GroupedNotification[] = []

        // Sort notifications by date descending first
        const sortedNotifications = [...notifications.value].sort((a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )

        sortedNotifications.forEach(notif => {
            const isLike = notif.type === 'post_like'
            const isComment = notif.type === 'post_comment'

            const targetId = notif.metadata?.post_id

            const isConnection = notif.type === 'connection_request'

            if ((isLike || isComment) && targetId) {
                const existingGroup = groups.find(g =>
                    g.type === notif.type &&
                    g.metadata?.post_id === targetId &&
                    g.read === notif.read
                )

                if (existingGroup) {
                    existingGroup.ids.push(notif.id)
                    const actorName = notif.metadata?.actor_name || t('notifications.someone')
                    if (!existingGroup.actor_names.includes(actorName)) {
                        existingGroup.actor_names.push(actorName)
                    }
                    existingGroup.count++
                    return
                }
            } else if (isConnection) {
                const existingGroup = groups.find(g =>
                    g.type === 'connection_request' &&
                    g.read === notif.read
                )

                if (existingGroup) {
                    existingGroup.ids.push(notif.id)
                    const actorName = notif.metadata?.actor_name || t('notifications.someone')
                    if (!existingGroup.actor_names.includes(actorName)) {
                        existingGroup.actor_names.push(actorName)
                    }
                    existingGroup.count++
                    return
                }
            } else if (notif.type === 'event_confirmation' && notif.metadata?.event_id) {
                const existingGroup = groups.find(g =>
                    g.type === 'event_confirmation' &&
                    g.metadata?.event_id === notif.metadata?.event_id &&
                    g.read === notif.read
                )

                if (existingGroup) {
                    existingGroup.ids.push(notif.id)
                    const actorName = notif.metadata?.actor_name || t('notifications.someone')
                    if (!existingGroup.actor_names.includes(actorName)) {
                        existingGroup.actor_names.push(actorName)
                    }
                    existingGroup.count++
                    return
                }
            }

            groups.push({
                ...notif,
                ids: [notif.id],
                actor_names: notif.metadata?.actor_name ? [notif.metadata.actor_name] : [],
                count: 1
            })
        })

        return groups.map(group => {
            if (group.count > 1) {
                const othersCount = group.count - 1
                const firstActor = group.actor_names[0] || 'Someone'

                if (group.type === 'post_like') {
                    group.content = othersCount === 1
                        ? t('notifications.groupLikeOne', { actor: firstActor })
                        : t('notifications.groupLikeMany', { actor: firstActor, count: othersCount })
                } else if (group.type === 'post_comment') {
                    group.content = othersCount === 1
                        ? t('notifications.groupCommentOne', { actor: firstActor })
                        : t('notifications.groupCommentMany', { actor: firstActor, count: othersCount })
                } else if (group.type === 'connection_request') {
                    group.content = othersCount === 1
                        ? t('notifications.groupConnectionOne', { actor: firstActor })
                        : t('notifications.groupConnectionMany', { actor: firstActor, count: othersCount })
                } else if (group.type === 'event_confirmation') {
                    group.content = othersCount === 1
                        ? t('notifications.groupEventConfirmationOne', { actor: firstActor, title: group.metadata?.event_title })
                        : t('notifications.groupEventConfirmationMany', { actor: firstActor, count: othersCount, title: group.metadata?.event_title })
                }
            } else {
                // Translate single notifications based on type
                switch (group.type) {
                    case 'new_lesson':
                        group.title = t('notifications.newLessonTitle')
                        group.content = t('notifications.newLessonContent', {
                            lessonTitle: group.metadata?.lesson_title,
                            programTitle: group.metadata?.program_title
                        })
                        break
                    case 'program_starting':
                        group.title = t('notifications.programStartingTitle')
                        group.content = t('notifications.programStartingContent', {
                            programTitle: group.metadata?.program_title,
                            days: group.metadata?.days
                        })
                        break
                    case 'program_expiring':
                        group.title = t('notifications.programExpiringTitle')
                        group.content = t('notifications.programExpiringContent', {
                            programTitle: group.metadata?.program_title,
                            days: group.metadata?.days
                        })
                        break
                    case 'enrollment_confirmed':
                        group.title = t('notifications.enrollmentConfirmedTitle')
                        group.content = t('notifications.enrollmentConfirmedContent', {
                            programTitle: group.metadata?.program_title
                        })
                        break
                    case 'program_completed':
                        group.title = t('notifications.programCompletedTitle')
                        group.content = t('notifications.programCompletedContent', {
                            programTitle: group.metadata?.program_title
                        })
                        break
                    case 'certificate_issued':
                        group.title = t('notifications.certificateIssuedTitle')
                        group.content = t('notifications.certificateIssuedContent', {
                            programTitle: group.metadata?.program_title
                        })
                        break
                    case 'progress_milestone':
                        group.title = t('notifications.progressMilestoneTitle')
                        group.content = t('notifications.progressMilestoneContent', {
                            programTitle: group.metadata?.program_title,
                            percentage: group.metadata?.percentage
                        })
                        break
                    case 'payment_success':
                        group.title = t('notifications.paymentSuccessTitle')
                        group.content = t('notifications.paymentSuccessContent')
                        break
                    case 'payment_failed':
                        group.title = t('notifications.paymentFailedTitle')
                        group.content = t('notifications.paymentFailedContent')
                        break
                    case 'program_payment_failed':
                        group.title = t('notifications.enrollmentPaymentFailedTitle')
                        group.content = t('notifications.enrollmentPaymentFailedContent')
                        break
                    case 'subscription_activated':
                        group.title = t('notifications.subscriptionActivatedTitle')
                        group.content = t('notifications.subscriptionActivatedContent')
                        break
                }
            }
            return group
        })
    })

    async function fetchNotifications(append = false) {
        if (!authStore.user) return

        try {
            loading.value = true

            const from = append ? notifications.value.length : 0
            const to = from + PAGE_SIZE - 1

            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', authStore.user.id)
                .order('created_at', { ascending: false })
                .range(from, to)

            if (error) throw error

            if (append) {
                notifications.value = [...notifications.value, ...(data || [])]
            } else {
                notifications.value = data || []
            }

            hasMore.value = (data?.length || 0) === PAGE_SIZE
            updateUnreadCount()
        } catch (error) {
            console.error('Error fetching notifications:', error)
        } finally {
            loading.value = false
        }
    }

    async function markAsRead(ids: string | string[]) {
        const idList = Array.isArray(ids) ? ids : [ids]
        try {
            const { error } = await supabase
                .from('notifications')
                .update({ read: true })
                .in('id', idList)

            if (error) throw error

            idList.forEach(id => {
                const notification = notifications.value.find(n => n.id === id)
                if (notification) {
                    notification.read = true
                }
            })
            updateUnreadCount()
        } catch (error) {
            console.error('Error marking as read:', error)
        }
    }

    async function deleteNotification(ids: string | string[]) {
        const idList = Array.isArray(ids) ? ids : [ids]
        try {
            const { error } = await supabase
                .from('notifications')
                .delete()
                .in('id', idList)

            if (error) throw error

            notifications.value = notifications.value.filter(n => !idList.includes(n.id))
            updateUnreadCount()
        } catch (error) {
            console.error('Error deleting:', error)
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

    function formatTime(date: string) {
        const now = new Date()
        const postDate = new Date(date)
        const diffInSeconds = Math.floor((now.getTime() - postDate.getTime()) / 1000)

        if (diffInSeconds < 60) return t('common.now')
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`
        return postDate.toLocaleDateString(locale.value === 'pt-BR' ? 'pt-BR' : 'en-US', { day: '2-digit', month: '2-digit' })
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
        groupedNotifications,
        loading,
        unreadCount,
        hasMore,
        fetchNotifications,
        markAsRead,
        deleteNotification,
        markAllAsRead,
        subscribeToNotifications,
        unsubscribeFromNotifications
    }
}
