import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from './auth'
import { usePointsToast } from '@/composables/usePointsToast'
import type { Challenge, UserChallenge, PointsOrigin } from '@/types/admin'

export const useGamificationStore = defineStore('gamification', () => {
    const userChallenges = ref<UserChallenge[]>([])
    const activeChallenges = ref<Challenge[]>([])
    const leaderboard = ref<any[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)

    const authStore = useAuthStore()
    const userId = computed(() => authStore.user?.id)
    const { showPointsGained } = usePointsToast()

    // Fetch all active challenges
    async function fetchActiveChallenges() {
        loading.value = true
        try {
            const { data, error: err } = await supabase
                .from('challenges')
                .select('*')
                .eq('ativo', true)
                .order('created_at', { ascending: false })

            if (err) throw err
            activeChallenges.value = data || []
        } catch (err: any) {
            error.value = err.message
            console.error('Error fetching active challenges:', err)
        } finally {
            loading.value = false
        }
    }

    // Fetch user challenges progress
    async function fetchUserChallenges() {
        if (!userId.value) return
        loading.value = true
        try {
            const { data, error: err } = await supabase
                .from('user_challenges')
                .select(`
          *,
          challenge:challenges(*)
        `)
                .eq('user_id', userId.value)

            if (err) throw err
            userChallenges.value = data || []
        } catch (err: any) {
            error.value = err.message
            console.error('Error fetching user challenges:', err)
        } finally {
            loading.value = false
        }
    }

    // Award points to user
    async function awardPoints(points: number, origin: PointsOrigin, originId?: string, description?: string, unique: boolean = false) {
        if (!userId.value) return
        try {
            if (unique) {
                // Check if already awarded for this origin
                const { count, error: countErr } = await supabase
                    .from('user_points')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', userId.value)
                    .eq('origem', origin)

                if (countErr) throw countErr
                if (count && count > 0) {
                    alert(`DEBUG: Bloqueado por verificação única! Encontrados ${count} registros de '${origin}' no banco.`)
                    return // Already awarded
                }
            }

            const { error: err } = await supabase
                .from('user_points')
                .insert({
                    user_id: userId.value,
                    pontos: points,
                    origem: origin,
                    origem_id: originId,
                    descricao: description
                })

            if (err) throw err

            // Show toast notification
            const icons: Record<PointsOrigin, string> = {
                post: 'article',
                comment: 'chat_bubble',
                event: 'event_available',
                connection: 'person_add',
                challenge: 'emoji_events',
                manual: 'person',
                other: 'stars'
            }

            showPointsGained(points, description || 'Você ganhou pontos!', icons[origin] || 'stars')

            // Points are updated in profile via DB trigger
            // We might want to trigger a refresh of the user profile here if needed
        } catch (err: any) {
            console.error('Error awarding points:', err)
        }
    }

    // Update challenge progress
    async function updateChallengeProgress(challengeId: string, increment: number = 1) {
        if (!userId.value) return
        try {
            // Find if user already started this challenge
            const { data: existing, error: fetchErr } = await supabase
                .from('user_challenges')
                .select('*')
                .eq('user_id', userId.value)
                .eq('challenge_id', challengeId)
                .single()

            if (fetchErr && fetchErr.code !== 'PGRST116') throw fetchErr

            if (existing) {
                if (existing.completado) return // Already done

                const newProgress = (existing.progresso || 0) + increment
                // Check if completed (this logic might be more complex depending on requirements, 
                // but for simple challenges we can assume a goal exists in challenge description or meta)
                // For now, let's just update progress. Completion logic might reside in DB triggers or specific actions.

                const { error: updateErr } = await supabase
                    .from('user_challenges')
                    .update({
                        progresso: newProgress,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', existing.id)

                if (updateErr) throw updateErr
            } else {
                // Start new challenge
                const { error: insertErr } = await supabase
                    .from('user_challenges')
                    .insert({
                        user_id: userId.value,
                        challenge_id: challengeId,
                        progresso: increment
                    })

                if (insertErr) throw insertErr
            }

            await fetchUserChallenges()
        } catch (err: any) {
            console.error('Error updating challenge progress:', err)
        }
    }

    // Fetch leaderboard
    async function fetchLeaderboard(limit = 10) {
        loading.value = true
        try {
            const { data, error: err } = await supabase
                .from('profiles')
                .select('id, nome, avatar_url, total_points, badge')
                .order('total_points', { ascending: false })
                .limit(limit)

            if (err) throw err
            leaderboard.value = data || []
        } catch (err: any) {
            error.value = err.message
            console.error('Error fetching leaderboard:', err)
        } finally {
            loading.value = false
        }
    }

    return {
        userChallenges,
        activeChallenges,
        leaderboard,
        loading,
        error,
        fetchActiveChallenges,
        fetchUserChallenges,
        awardPoints,
        updateChallengeProgress,
        fetchLeaderboard
    }
})
