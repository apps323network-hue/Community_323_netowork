import { defineStore } from 'pinia'
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { supabase } from '@/lib/supabase'
import { logAdminAction } from '@/lib/auditLog'
import { useAdminBaseStore } from './base'
import type { Challenge, ChallengeStats, ChallengeCreateInput, ChallengeUpdateInput } from '@/types/admin'

export const useAdminChallengesStore = defineStore('admin-challenges', () => {
  const baseStore = useAdminBaseStore()
  const { loading, error } = storeToRefs(baseStore)
  const authStore = baseStore.authStore
  const checkIsAdmin = baseStore.checkIsAdmin

  const challenges = ref<Challenge[]>([])
  const challengeStats = ref<ChallengeStats>({
    total: 0,
    active: 0,
    inactive: 0,
    byType: { post: 0, comment: 0, event: 0, connection: 0, engagement: 0, other: 0 },
    totalParticipants: 0,
    totalCompleted: 0,
    averagePoints: 0,
  })

  // Buscar todos os desafios
  async function fetchChallenges() {
    if (!(await checkIsAdmin())) {
      throw new Error('Apenas admins podem buscar desafios')
    }

    loading.value = true
    error.value = null

    try {
      const { data, error: queryError } = await supabase
        .from('challenges')
        .select(`
          *,
          creator:profiles!challenges_created_by_fkey(nome)
        `)
        .order('created_at', { ascending: false })

      if (queryError) throw queryError

      // Buscar estatísticas de participantes e completados
      const challengesWithStats = await Promise.all(
        (data || []).map(async (challenge: any) => {
          const { count: participantsCount } = await supabase
            .from('user_challenges')
            .select('*', { count: 'exact', head: true })
            .eq('challenge_id', challenge.id)

          const { count: completedCount } = await supabase
            .from('user_challenges')
            .select('*', { count: 'exact', head: true })
            .eq('challenge_id', challenge.id)
            .eq('completado', true)

          return {
            ...challenge,
            creator_name: challenge.creator?.nome || 'Admin',
            total_participants: participantsCount || 0,
            total_completed: completedCount || 0,
          }
        })
      )

      challenges.value = challengesWithStats
    } catch (err: any) {
      error.value = err.message
      console.error('Error fetching challenges:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Criar desafio
  async function createChallenge(input: ChallengeCreateInput): Promise<Challenge> {
    if (!authStore.user) {
      throw new Error('Usuário não autenticado')
    }

    if (!(await checkIsAdmin())) {
      throw new Error('Apenas admins podem criar desafios')
    }

    loading.value = true
    error.value = null

    try {
      const { data, error: insertError } = await supabase
        .from('challenges')
        .insert({
          nome: input.nome,
          descricao: input.descricao || null,
          tipo: input.tipo,
          pontos: input.pontos,
          prazo: input.prazo || null,
          ativo: input.ativo !== undefined ? input.ativo : true,
          created_by: authStore.user.id,
        })
        .select()
        .single()

      if (insertError) throw insertError

      // Recarregar lista e estatísticas
      await fetchChallenges()
      await fetchChallengeStats()

      // Log da ação
      logAdminAction(authStore.user.id, {
        action: 'create_challenge',
        targetId: data.id,
        targetType: 'challenge',
        details: { nome: data.nome, tipo: data.tipo }
      })

      return data
    } catch (err: any) {
      error.value = err.message
      console.error('Error creating challenge:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Atualizar desafio
  async function updateChallenge(id: string, input: ChallengeUpdateInput): Promise<Challenge> {
    if (!authStore.user) {
      throw new Error('Usuário não autenticado')
    }

    if (!(await checkIsAdmin())) {
      throw new Error('Apenas admins podem atualizar desafios')
    }

    loading.value = true
    error.value = null

    try {
      const updateData: any = {}
      if (input.nome !== undefined) updateData.nome = input.nome
      if (input.descricao !== undefined) updateData.descricao = input.descricao
      if (input.tipo !== undefined) updateData.tipo = input.tipo
      if (input.pontos !== undefined) updateData.pontos = input.pontos
      if (input.prazo !== undefined) updateData.prazo = input.prazo
      if (input.ativo !== undefined) updateData.ativo = input.ativo

      const { data, error: updateError } = await supabase
        .from('challenges')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (updateError) throw updateError

      // Recarregar lista e estatísticas
      await fetchChallenges()
      await fetchChallengeStats()

      // Log da ação
      logAdminAction(authStore.user.id, {
        action: 'update_challenge',
        targetId: id,
        targetType: 'challenge',
        details: { updates: Object.keys(updateData) }
      })

      return data
    } catch (err: any) {
      error.value = err.message
      console.error('Error updating challenge:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Deletar desafio
  async function deleteChallenge(id: string): Promise<void> {
    if (!authStore.user) {
      throw new Error('Usuário não autenticado')
    }

    if (!(await checkIsAdmin())) {
      throw new Error('Apenas admins podem deletar desafios')
    }

    loading.value = true
    error.value = null

    try {
      const { error: deleteError } = await supabase
        .from('challenges')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError

      // Recarregar lista e estatísticas
      await fetchChallenges()
      await fetchChallengeStats()

      // Log da ação
      logAdminAction(authStore.user.id, {
        action: 'delete_challenge',
        targetId: id,
        targetType: 'challenge'
      })
    } catch (err: any) {
      error.value = err.message
      console.error('Error deleting challenge:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Buscar estatísticas de desafios
  async function fetchChallengeStats() {
    const isAdmin = await checkIsAdmin()
    if (!isAdmin) {
      console.warn('[ADMIN] fetchChallengeStats: Usuário não é admin, retornando stats vazias')
      challengeStats.value = {
        total: 0,
        active: 0,
        completed: 0,
        rewardsGiven: 0,
      }
      return
    }

    loading.value = true
    error.value = null

    try {
      const { data: challengesData, error: challengesError } = await supabase
        .from('challenges')
        .select('*')

      if (challengesError) throw challengesError

      const { data: userChallengesData, error: userChallengesError } = await supabase
        .from('user_challenges')
        .select('*')

      if (userChallengesError) throw userChallengesError

      const stats: ChallengeStats = {
        total: challengesData?.length || 0,
        active: 0,
        inactive: 0,
        byType: { post: 0, comment: 0, event: 0, connection: 0, engagement: 0, other: 0 },
        totalParticipants: userChallengesData?.length || 0,
        totalCompleted: 0,
        averagePoints: 0,
      }

      let totalPoints = 0

      challengesData?.forEach((challenge: any) => {
        // Por status
        if (challenge.ativo) stats.active++
        else stats.inactive++

        // Por tipo
        if (challenge.tipo === 'post') stats.byType.post++
        else if (challenge.tipo === 'comment') stats.byType.comment++
        else if (challenge.tipo === 'event') stats.byType.event++
        else if (challenge.tipo === 'connection') stats.byType.connection++
        else if (challenge.tipo === 'engagement') stats.byType.engagement++
        else if (challenge.tipo === 'other') stats.byType.other++

        totalPoints += challenge.pontos || 0
      })

      userChallengesData?.forEach((uc: any) => {
        if (uc.completado) stats.totalCompleted++
      })

      // Calcular média de pontos
      if (stats.total > 0) {
        stats.averagePoints = Math.round(totalPoints / stats.total)
      }

      challengeStats.value = stats
    } catch (err: any) {
      error.value = err.message
      console.error('Error fetching challenge stats:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    challenges,
    challengeStats,
    fetchChallenges,
    createChallenge,
    updateChallenge,
    deleteChallenge,
    fetchChallengeStats,
  }
})

