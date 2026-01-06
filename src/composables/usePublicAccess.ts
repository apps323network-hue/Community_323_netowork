import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

export function usePublicAccess() {
    const authStore = useAuthStore()
    const router = useRouter()

    const isAuthenticated = computed(() => !!authStore.user)

    /**
     * Redirects to login with optional redirect path
     */
    function requireAuth(redirect?: string) {
        const redirectPath = redirect || router.currentRoute.value.fullPath
        router.push({ name: 'Login', query: { redirect: redirectPath } })
    }

    /**
     * Opens signup modal or redirects to register page
     */
    function showAuthModal(mode: 'login' | 'signup' = 'signup') {
        const redirectPath = router.currentRoute.value.fullPath
        router.push({
            name: mode === 'signup' ? 'Register' : 'Login',
            query: { redirect: redirectPath }
        })
    }

    /**
     * Check if content should be limited for current section
     */
    function isContentLimited(section: string): boolean {
        if (isAuthenticated.value) return false

        const limitedSections = ['feed', 'programs', 'events', 'services', 'benefits']
        return limitedSections.includes(section)
    }

    /**
     * Get content limit for a specific section
     */
    function getContentLimit(section: string): number {
        const limits: Record<string, number> = {
            feed: 3,           // Show first 3 posts then block
            benefits: 4,       // Show first 4 benefits
            community: 12,      // Show first 12 members
            events: 999,       // Show all events (but block participation)
            programs: 999,     // Show all programs (but block player)
            services: 999      // Show all services (but hide pricing)
        }

        return limits[section] || 5
    }

    /**
     * Check if user can perform an action
     */
    function canPerformAction(action: string): boolean {
        if (isAuthenticated.value) return true

        // All these actions require authentication
        const protectedActions = [
            'post',
            'comment',
            'enroll',
            'rsvp',
            'hire',
            'message',
            'connect',
            'play_video'
        ]

        return !protectedActions.includes(action)
    }

    return {
        isAuthenticated,
        requireAuth,
        showAuthModal,
        isContentLimited,
        getContentLimit,
        canPerformAction
    }
}
