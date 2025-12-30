import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from './auth'
import { checkBannedWords, invalidateBannedWordsCache } from '@/lib/bannedWords'
import { logAdminAction } from '@/lib/auditLog'
import type { AdminEvent, EventStats, EventApprovalAction, AdminUser, UserStats, UserStatus, AdminPost, PostStats, AdminService, ServiceStats, BannedWord, BannedWordStats, Report, ReportStats, ReportCreateInput, ReportResolveInput, ReportStatus, ReportItemType, Challenge, ChallengeStats, ChallengeCreateInput, ChallengeUpdateInput } from '@/types/admin'
import type { EventStatus } from '@/types/events'
import type { PostStatus } from '@/types/posts'

export const useAdminStore = defineStore('admin', () => {
  const pendingEvents = ref<AdminEvent[]>([])
  const allEvents = ref<AdminEvent[]>([])
  const stats = ref<EventStats>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  })
  const pendingUsers = ref<AdminUser[]>([])
  const allUsers = ref<AdminUser[]>([])
  const userStats = ref<UserStats>({
    total: 0,
    pending: 0,
    active: 0,
    suspended: 0,
    banned: 0,
    newToday: 0,
  })
  const pendingPosts = ref<AdminPost[]>([])
  const allPosts = ref<AdminPost[]>([])
  const postStats = ref<PostStats>({
    total: 0,
    pending: 0,
    approved: 0,
    hidden: 0,
    removed: 0,
    spam: 0,
    removedToday: 0,
  })
  const allServices = ref<AdminService[]>([])
  const serviceStats = ref<ServiceStats>({
    total: 0,
    active: 0,
    inactive: 0,
    featured: 0,
  })
  const bannedWords = ref<BannedWord[]>([])
  const bannedWordStats = ref<BannedWordStats>({
    total: 0,
    byCategory: {},
    byAction: {},
  })
  const reports = ref<Report[]>([])
  const reportStats = ref<ReportStats>({
    total: 0,
    pending: 0,
    reviewed: 0,
    resolved: 0,
    dismissed: 0,
    byType: { post: 0, comment: 0, user: 0 },
    byReason: { spam: 0, inappropriate: 0, harassment: 0, fake_news: 0, other: 0 },
    resolvedToday: 0,
  })
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
      // Buscar eventos pendentes
      const { data: eventsData, error: queryError } = await supabase
        .from('events')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      if (queryError) throw queryError

      if (!eventsData || eventsData.length === 0) {
        pendingEvents.value = []
        return
      }

      // Buscar profiles dos criadores
      const creatorIds = [...new Set(eventsData.map((e: any) => e.created_by).filter(Boolean))]
      let creatorsMap = new Map<string, any>()

      if (creatorIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, nome')
          .in('id', creatorIds)

        profilesData?.forEach((profile: any) => {
          creatorsMap.set(profile.id, profile)
        })
      }

      // Combinar eventos com profiles
      pendingEvents.value = eventsData.map((event: any) => {
        const creator = event.created_by ? creatorsMap.get(event.created_by) : null
        return {
          ...event,
          creator_name: creator?.nome || 'Usuário',
          partner_name: event.partner?.nome,
        }
      })
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
      // Buscar eventos
      let query = supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false })

      if (statusFilter) {
        query = query.eq('status', statusFilter)
      }

      const { data: eventsData, error: queryError } = await query

      if (queryError) throw queryError

      if (!eventsData || eventsData.length === 0) {
        allEvents.value = []
        return
      }

      // Buscar profiles dos criadores
      const creatorIds = [...new Set(eventsData.map((e: any) => e.created_by).filter(Boolean))]
      let creatorsMap = new Map<string, any>()

      if (creatorIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, nome')
          .in('id', creatorIds)

        profilesData?.forEach((profile: any) => {
          creatorsMap.set(profile.id, profile)
        })
      }

      // Combinar eventos com profiles
      allEvents.value = eventsData.map((event: any) => {
        const creator = event.created_by ? creatorsMap.get(event.created_by) : null
        return {
          ...event,
          creator_name: creator?.nome || 'Usuário',
          partner_name: event.partner?.nome,
        }
      })
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

      // Log da ação
      logAdminAction(authStore.user.id, {
        action: 'approve_event',
        targetId: eventId,
        targetType: 'event',
        details: { titulo: data.titulo }
      })

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
          rejection_reason: reason || undefined,
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

      // Log da ação
      logAdminAction(authStore.user.id, {
        action: 'reject_event',
        targetId: eventId,
        targetType: 'event',
        details: { reason }
      })

      return data
    } catch (err: any) {
      error.value = err.message
      console.error('Error rejecting event:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Toggle destaque de evento (admin)
  async function toggleEventDestaque(eventId: string, destaque: boolean) {
    if (!authStore.user) {
      throw new Error('Usuário não autenticado')
    }

    loading.value = true
    error.value = null

    try {
      // Se está marcando como destaque, desmarcar todos os outros primeiro
      if (destaque) {
        await supabase
          .from('events')
          .update({ destaque: false })
          .neq('id', eventId)
      }

      // Atualizar o evento atual
      const { data, error: updateError } = await supabase
        .from('events')
        .update({ destaque })
        .eq('id', eventId)
        .select()
        .single()

      if (updateError) throw updateError

      // Atualizar lista local
      const eventIndex = allEvents.value.findIndex(e => e.id === eventId)
      if (eventIndex !== -1) {
        allEvents.value[eventIndex] = { ...allEvents.value[eventIndex], destaque }
      }

      return data
    } catch (err: any) {
      error.value = err.message
      console.error('Error toggling event destaque:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Deletar evento (admin)
  async function deleteEvent(eventId: string) {
    console.log('[ADMIN STORE] deleteEvent chamada com eventId:', eventId)
    if (!authStore.user) {
      throw new Error('Usuário não autenticado')
    }

    loading.value = true
    error.value = null

    try {
      const { error: deleteError } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId)

      if (deleteError) throw deleteError

      // Remover da lista local
      const pendingIndex = pendingEvents.value.findIndex(e => e.id === eventId)
      if (pendingIndex !== -1) {
        pendingEvents.value.splice(pendingIndex, 1)
      }

      const allIndex = allEvents.value.findIndex(e => e.id === eventId)
      if (allIndex !== -1) {
        allEvents.value.splice(allIndex, 1)
      }

      // Atualizar stats
      await fetchEventStats()

      return true
    } catch (err: any) {
      error.value = err.message
      console.error('Error deleting event:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Criar novo evento (admin)
  async function createEvent(eventData: { titulo: string; descricao?: string; data_hora: string; tipo: string; local?: string; status?: EventStatus; image_url?: string; partner_id?: string }) {
    if (!authStore.user) {
      throw new Error('Usuário não autenticado')
    }

    loading.value = true
    error.value = null

    try {
      const { data, error: insertError } = await supabase
        .from('events')
        .insert({
          titulo: eventData.titulo,
          descricao: eventData.descricao || null,
          data_hora: eventData.data_hora,
          tipo: eventData.tipo,
          local: eventData.local || null,
          image_url: eventData.image_url || null,
          status: eventData.status || 'approved', // Admin pode criar já aprovado
          created_by: authStore.user.id,
          partner_id: eventData.partner_id || null,
        })
        .select()
        .single()

      if (insertError) throw insertError

      // Recarregar listas
      await fetchPendingEvents()
      await fetchAllEvents()
      await fetchEventStats()

      // Log da ação
      logAdminAction(authStore.user.id, {
        action: 'create_event',
        targetId: data.id,
        targetType: 'event',
        details: { titulo: data.titulo, tipo: data.tipo, status: data.status }
      })

      return data
    } catch (err: any) {
      error.value = err.message
      console.error('Error creating event:', err)
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

  // ============================================
  // FUNÇÕES DE GESTÃO DE USUÁRIOS
  // ============================================

  // Buscar usuários pendentes
  async function fetchPendingUsers() {
    loading.value = true
    error.value = null

    try {
      console.log('[ADMIN] Buscando usuários pendentes...')
      const { data, error: queryError } = await supabase
        .from('profiles')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      if (queryError) {
        console.error('[ADMIN] Erro ao buscar usuários pendentes:', queryError)
        throw queryError
      }

      console.log(`[ADMIN] Usuários pendentes encontrados: ${data?.length || 0}`)
      if (data && data.length > 0) {
        console.log('[ADMIN] IDs dos usuários pendentes:', data.map((u: any) => ({ id: u.id, nome: u.nome, status: u.status })))
      }

      pendingUsers.value = (data || []).map((profile: any) => ({
        ...profile,
        email: '', // Email será buscado separadamente se necessário
        status: profile.status || 'pending',
        strikes: profile.strikes || 0,
      })) as AdminUser[]
    } catch (err: any) {
      error.value = err.message
      console.error('Error fetching pending users:', err)
    } finally {
      loading.value = false
    }
  }

  // Buscar todos os usuários (para admin)
  async function fetchAllUsers(statusFilter?: UserStatus) {
    loading.value = true
    error.value = null

    try {
      let query = supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (statusFilter) {
        query = query.eq('status', statusFilter)
      }

      const { data, error: queryError } = await query

      if (queryError) throw queryError

      allUsers.value = (data || []).map((profile: any) => ({
        ...profile,
        email: '', // Email será buscado separadamente se necessário
        status: profile.status || 'pending',
        strikes: profile.strikes || 0,
      })) as AdminUser[]
    } catch (err: any) {
      error.value = err.message
      console.error('Error fetching all users:', err)
    } finally {
      loading.value = false
    }
  }

  // Aprovar usuário
  async function approveUser(userId: string) {
    if (!authStore.user) {
      throw new Error('Usuário não autenticado')
    }

    loading.value = true
    error.value = null

    try {
      console.log('[ADMIN] Aprovando usuário:', userId)

      const { data, error: updateError } = await supabase
        .from('profiles')
        .update({
          status: 'active',
          approved_by: authStore.user.id,
          approved_at: new Date().toISOString(),
          rejection_reason: null,
        })
        .eq('id', userId)
        .select()
        .single()

      if (updateError) {
        console.error('[ADMIN] Erro ao atualizar perfil:', updateError)
        throw updateError
      }

      console.log('[ADMIN] Usuário aprovado com sucesso:', data)

      // Recarregar lista de pendentes para garantir sincronização
      await fetchPendingUsers()

      // Atualizar stats
      await fetchUserStats()

      // Log da ação
      logAdminAction(authStore.user.id, {
        action: 'approve_user',
        targetId: userId,
        targetType: 'user'
      })

      return data
    } catch (err: any) {
      error.value = err.message
      console.error('Error approving user:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Rejeitar usuário
  async function rejectUser(userId: string, reason?: string) {
    if (!authStore.user) {
      throw new Error('Usuário não autenticado')
    }

    loading.value = true
    error.value = null

    try {
      const { data, error: updateError } = await supabase
        .from('profiles')
        .update({
          rejection_reason: reason || undefined,
          approved_by: authStore.user.id,
          approved_at: new Date().toISOString(),
          // Status permanece 'pending' mas registra motivo da rejeição
        })
        .eq('id', userId)
        .select()
        .single()

      if (updateError) throw updateError

      // Atualizar lista local (remover da lista de pendentes)
      const index = pendingUsers.value.findIndex(u => u.id === userId)
      if (index !== -1) {
        pendingUsers.value.splice(index, 1)
      }

      // Atualizar stats
      await fetchUserStats()

      // Log da ação
      logAdminAction(authStore.user.id, {
        action: 'reject_user',
        targetId: userId,
        targetType: 'user',
        details: { reason }
      })

      return data
    } catch (err: any) {
      error.value = err.message
      console.error('Error rejecting user:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Banir usuário
  async function banUser(userId: string, reason?: string) {
    if (!authStore.user) {
      throw new Error('Usuário não autenticado')
    }

    loading.value = true
    error.value = null

    try {
      const { data, error: updateError } = await supabase
        .from('profiles')
        .update({
          status: 'banned',
          approved_by: authStore.user.id,
          approved_at: new Date().toISOString(),
          rejection_reason: reason || 'Banido por violação dos termos de uso',
        })
        .eq('id', userId)
        .select()
        .single()

      if (updateError) throw updateError

      // Recarregar listas
      await fetchAllUsers()
      await fetchUserStats()

      // Log da ação
      logAdminAction(authStore.user.id, {
        action: 'ban_user',
        targetId: userId,
        targetType: 'user',
        details: { reason: reason || 'Banido por violação dos termos de uso' }
      })

      return data
    } catch (err: any) {
      error.value = err.message
      console.error('Error banning user:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Desbanir usuário (restaurar para ativo)
  async function unbanUser(userId: string) {
    if (!authStore.user) {
      throw new Error('Usuário não autenticado')
    }

    loading.value = true
    error.value = null

    try {
      const { data, error: updateError } = await supabase
        .from('profiles')
        .update({
          status: 'active',
          rejection_reason: null,
        })
        .eq('id', userId)
        .select()
        .single()

      if (updateError) throw updateError

      await fetchAllUsers()
      await fetchUserStats()

      // Log da ação
      logAdminAction(authStore.user.id, {
        action: 'unban_user',
        targetId: userId,
        targetType: 'user'
      })

      return data
    } catch (err: any) {
      error.value = err.message
      console.error('Error unbanning user:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Buscar estatísticas de usuários
  async function fetchUserStats() {
    try {
      const { data, error: queryError } = await supabase
        .from('profiles')
        .select('status, created_at')

      if (queryError) throw queryError

      const total = data?.length || 0
      const pending = data?.filter(u => u.status === 'pending').length || 0
      const active = data?.filter(u => u.status === 'active').length || 0
      const suspended = data?.filter(u => u.status === 'suspended').length || 0
      const banned = data?.filter(u => u.status === 'banned').length || 0

      // Contar novos hoje
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const newToday = data?.filter(u => {
        const createdDate = new Date(u.created_at)
        return createdDate >= today
      }).length || 0

      userStats.value = {
        total,
        pending,
        active,
        suspended,
        banned,
        newToday,
      }
    } catch (err: any) {
      console.error('Error fetching user stats:', err)
    }
  }

  // ============================================
  // FUNÇÕES DE GESTÃO DE POSTS
  // ============================================

  // Buscar posts pendentes
  async function fetchPendingPosts() {
    loading.value = true
    error.value = null

    try {
      // Buscar posts pendentes
      const { data: postsData, error: queryError } = await supabase
        .from('posts')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      if (queryError) {
        console.error('[ADMIN] Erro ao buscar posts pendentes:', queryError)
        throw queryError
      }

      console.log('[ADMIN] Posts pendentes encontrados:', postsData?.length || 0)

      if (!postsData || postsData.length === 0) {
        pendingPosts.value = []
        return
      }

      // Buscar profiles dos autores
      const userIds = [...new Set(postsData.map((p: any) => p.user_id))]
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, nome, area_atuacao, avatar_url')
        .in('id', userIds)

      if (profilesError) {
        console.error('[ADMIN] Erro ao buscar profiles:', profilesError)
      }

      // Criar mapa de profiles
      const profilesMap = new Map<string, any>()
      profilesData?.forEach((profile: any) => {
        profilesMap.set(profile.id, profile)
      })

      // Combinar posts com profiles
      pendingPosts.value = postsData.map((post: any) => {
        const author = profilesMap.get(post.user_id)
        return {
          ...post,
          status: post.status || 'pending',
          author_name: author?.nome || 'Usuário',
          author_email: '',
          author: author || null,
        } as AdminPost
      })

      console.log('[ADMIN] Posts pendentes processados:', pendingPosts.value.length)
    } catch (err: any) {
      error.value = err.message
      console.error('Error fetching pending posts:', err)
    } finally {
      loading.value = false
    }
  }

  // Buscar todos os posts (para admin)
  async function fetchAllPosts(statusFilter?: PostStatus) {
    loading.value = true
    error.value = null

    try {
      // Buscar posts
      let query = supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })

      if (statusFilter) {
        query = query.eq('status', statusFilter)
      }

      const { data: postsData, error: queryError } = await query

      if (queryError) throw queryError

      if (!postsData || postsData.length === 0) {
        allPosts.value = []
        return
      }

      // Buscar profiles dos autores
      const userIds = [...new Set(postsData.map((p: any) => p.user_id))]
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, nome, area_atuacao, avatar_url')
        .in('id', userIds)

      // Criar mapa de profiles
      const profilesMap = new Map<string, any>()
      profilesData?.forEach((profile: any) => {
        profilesMap.set(profile.id, profile)
      })

      // Combinar posts com profiles
      allPosts.value = postsData.map((post: any) => {
        const author = profilesMap.get(post.user_id)
        return {
          ...post,
          status: post.status || 'pending',
          author_name: author?.nome || 'Usuário',
          author_email: '',
          author: author || null,
        } as AdminPost
      })
    } catch (err: any) {
      error.value = err.message
      console.error('Error fetching all posts:', err)
    } finally {
      loading.value = false
    }
  }

  // Aprovar post
  async function approvePost(postId: string) {
    if (!authStore.user) {
      throw new Error('Usuário não autenticado')
    }

    loading.value = true
    error.value = null

    try {
      const { data, error: updateError } = await supabase
        .from('posts')
        .update({
          status: 'approved',
          approved_by: authStore.user.id,
          approved_at: new Date().toISOString(),
          rejection_reason: null,
        })
        .eq('id', postId)
        .select()
        .single()

      if (updateError) throw updateError

      // Atualizar lista local
      const index = pendingPosts.value.findIndex(p => p.id === postId)
      if (index !== -1) {
        pendingPosts.value.splice(index, 1)
      }

      // Atualizar stats
      await fetchPostStats()

      // Log da ação
      logAdminAction(authStore.user.id, {
        action: 'approve_post',
        targetId: postId,
        targetType: 'post',
        details: { conteudo: data?.conteudo }
      })

      return data
    } catch (err: any) {
      error.value = err.message
      console.error('Error approving post:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Ocultar post
  async function hidePost(postId: string, reason?: string) {
    if (!authStore.user) {
      throw new Error('Usuário não autenticado')
    }

    loading.value = true
    error.value = null

    try {
      const { data, error: updateError } = await supabase
        .from('posts')
        .update({
          status: 'hidden',
          moderated_by: authStore.user.id,
          moderated_at: new Date().toISOString(),
          rejection_reason: reason || undefined,
        })
        .eq('id', postId)
        .select()
        .single()

      if (updateError) throw updateError

      // Atualizar lista local
      const pendingIndex = pendingPosts.value.findIndex(p => p.id === postId)
      if (pendingIndex !== -1) {
        pendingPosts.value.splice(pendingIndex, 1)
      }

      // Atualizar allPosts - atualizar status
      const allIndex = allPosts.value.findIndex(p => p.id === postId)
      if (allIndex !== -1) {
        allPosts.value[allIndex] = {
          ...allPosts.value[allIndex],
          status: 'hidden',
          moderated_by: authStore.user.id,
          moderated_at: new Date().toISOString(),
          rejection_reason: reason || undefined,
        }
      }

      // Atualizar stats
      await fetchPostStats()

      // Log da ação
      logAdminAction(authStore.user.id, {
        action: 'hide_post',
        targetId: postId,
        targetType: 'post',
        details: { reason, conteudo: data?.conteudo }
      })

      return data
    } catch (err: any) {
      error.value = err.message
      console.error('Error hiding post:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Remover post
  async function removePost(postId: string, reason?: string, addStrike: boolean = false) {
    if (!authStore.user) {
      throw new Error('Usuário não autenticado')
    }

    loading.value = true
    error.value = null

    try {
      // Buscar post para pegar user_id
      const { data: postData } = await supabase
        .from('posts')
        .select('user_id')
        .eq('id', postId)
        .single()

      // Atualizar post
      const { data, error: updateError } = await supabase
        .from('posts')
        .update({
          status: 'removed',
          moderated_by: authStore.user.id,
          moderated_at: new Date().toISOString(),
          rejection_reason: reason || undefined,
          strikes_added: addStrike,
        })
        .eq('id', postId)
        .select()
        .single()

      if (updateError) throw updateError

      // Adicionar strike se solicitado
      if (addStrike && postData?.user_id) {
        await addStrikeToUser(postData.user_id, `Post removido: ${reason || 'Sem motivo especificado'}`)
      }

      // Atualizar lista local
      const pendingIndex = pendingPosts.value.findIndex(p => p.id === postId)
      if (pendingIndex !== -1) {
        pendingPosts.value.splice(pendingIndex, 1)
      }

      // Atualizar allPosts - atualizar status ou remover da lista
      const allIndex = allPosts.value.findIndex(p => p.id === postId)
      if (allIndex !== -1) {
        // Atualizar o status do post na lista
        allPosts.value[allIndex] = {
          ...allPosts.value[allIndex],
          status: 'removed',
          moderated_by: authStore.user.id,
          moderated_at: new Date().toISOString(),
          rejection_reason: reason || undefined,
          strikes_added: addStrike,
        }
      }

      // Atualizar stats
      await fetchPostStats()

      // Log da ação
      logAdminAction(authStore.user.id, {
        action: 'remove_post',
        targetId: postId,
        targetType: 'post',
        details: { reason, addStrike, userId: postData?.user_id, conteudo: data?.conteudo }
      })

      return data
    } catch (err: any) {
      error.value = err.message
      console.error('Error removing post:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Marcar como spam
  async function markAsSpam(postId: string) {
    if (!authStore.user) {
      throw new Error('Usuário não autenticado')
    }

    loading.value = true
    error.value = null

    try {
      // Buscar post para pegar user_id
      const { data: postData } = await supabase
        .from('posts')
        .select('user_id')
        .eq('id', postId)
        .single()

      // Atualizar post
      const { data, error: updateError } = await supabase
        .from('posts')
        .update({
          status: 'spam',
          moderated_by: authStore.user.id,
          moderated_at: new Date().toISOString(),
          rejection_reason: 'Marcado como spam',
          strikes_added: true,
        })
        .eq('id', postId)
        .select()
        .single()

      if (updateError) throw updateError

      // Adicionar strike automaticamente ao autor
      if (postData?.user_id) {
        await addStrikeToUser(postData.user_id, 'Post marcado como spam')
      }

      // Atualizar lista local
      const pendingIndex = pendingPosts.value.findIndex(p => p.id === postId)
      if (pendingIndex !== -1) {
        pendingPosts.value.splice(pendingIndex, 1)
      }

      // Atualizar allPosts - atualizar status
      const allIndex = allPosts.value.findIndex(p => p.id === postId)
      if (allIndex !== -1) {
        allPosts.value[allIndex] = {
          ...allPosts.value[allIndex],
          status: 'spam',
          moderated_by: authStore.user.id,
          moderated_at: new Date().toISOString(),
          rejection_reason: 'Marcado como spam',
          strikes_added: true,
        }
      }

      // Atualizar stats
      await fetchPostStats()

      // Log da ação
      logAdminAction(authStore.user.id, {
        action: 'mark_spam',
        targetId: postId,
        targetType: 'post',
        details: { userId: postData?.user_id, conteudo: data?.conteudo }
      })

      return data
    } catch (err: any) {
      error.value = err.message
      console.error('Error marking post as spam:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Adicionar strike ao usuário (função auxiliar)
  async function addStrikeToUser(userId: string, _reason: string) {
    if (!authStore.user) return

    try {
      // Buscar strikes atuais
      const { data: profile } = await supabase
        .from('profiles')
        .select('strikes')
        .eq('id', userId)
        .single()

      const currentStrikes = profile?.strikes || 0
      const newStrikes = currentStrikes + 1

      // Atualizar strikes
      await supabase
        .from('profiles')
        .update({ strikes: newStrikes })
        .eq('id', userId)

      // Se chegou a 3 strikes, banir automaticamente
      if (newStrikes >= 3) {
        await supabase
          .from('profiles')
          .update({
            status: 'banned',
            moderated_by: authStore.user.id,
            moderated_at: new Date().toISOString(),
          })
          .eq('id', userId)
      }
    } catch (err: any) {
      console.error('Error adding strike to user:', err)
    }
  }

  // Criar novo post (admin)
  async function createPost(postData: { conteudo: string; tipo: string; status?: PostStatus; image_url?: string }) {
    if (!authStore.user) {
      throw new Error('Usuário não autenticado')
    }

    const wasLoading = loading.value
    loading.value = true
    error.value = null

    try {
      console.log('[ADMIN] Criando post:', { tipo: postData.tipo, status: postData.status, hasImage: !!postData.image_url })

      // Verificar palavras proibidas (admins podem criar mesmo assim, mas vamos avisar)
      const bannedCheck = await checkBannedWords(postData.conteudo)
      if (bannedCheck.found && bannedCheck.action === 'replace' && bannedCheck.sanitizedContent) {
        // Se for replace, usar conteúdo sanitizado
        postData.conteudo = bannedCheck.sanitizedContent
      }
      // Admins podem criar posts mesmo com palavras proibidas (não bloqueamos)

      const { data, error: insertError } = await supabase
        .from('posts')
        .insert({
          user_id: authStore.user.id,
          conteudo: postData.conteudo,
          tipo: postData.tipo,
          status: postData.status || 'approved', // Admin pode criar já aprovado
          image_url: postData.image_url || null,
        })
        .select()
        .single()

      if (insertError) {
        console.error('[ADMIN] Erro ao inserir post:', insertError)
        throw insertError
      }

      console.log('[ADMIN] Post criado com sucesso, recarregando listas...')

      // Recarregar listas em paralelo para ser mais rápido
      await Promise.all([
        fetchPendingPosts(),
        fetchAllPosts(),
        fetchPostStats()
      ])

      console.log('[ADMIN] Listas recarregadas com sucesso')

      // Log da ação
      logAdminAction(authStore.user.id, {
        action: 'create_post',
        targetId: data.id,
        targetType: 'post',
        details: { tipo: data.tipo }
      })

      return data
    } catch (err: any) {
      error.value = err.message
      console.error('[ADMIN] Error creating post:', err)
      throw err
    } finally {
      loading.value = wasLoading
    }
  }

  // Buscar estatísticas de posts
  async function fetchPostStats() {
    try {
      const { data, error: queryError } = await supabase
        .from('posts')
        .select('status, moderated_at')

      if (queryError) throw queryError

      const total = data?.length || 0
      const pending = data?.filter(p => p.status === 'pending').length || 0
      const approved = data?.filter(p => p.status === 'approved').length || 0
      const hidden = data?.filter(p => p.status === 'hidden').length || 0
      const removed = data?.filter(p => p.status === 'removed').length || 0
      const spam = data?.filter(p => p.status === 'spam').length || 0

      // Contar removidos hoje
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const removedToday = data?.filter(p => {
        if (p.status !== 'removed' || !p.moderated_at) return false
        const moderatedDate = new Date(p.moderated_at)
        return moderatedDate >= today
      }).length || 0

      postStats.value = {
        total,
        pending,
        approved,
        hidden,
        removed,
        spam,
        removedToday,
      }
    } catch (err: any) {
      console.error('Error fetching post stats:', err)
    }
  }

  // ============================================
  // FUNÇÕES DE GESTÃO DE SERVIÇOS
  // ============================================

  // Buscar todos os serviços
  async function fetchAllServices() {
    loading.value = true
    error.value = null

    try {
      const { data: servicesData, error: queryError } = await supabase
        .from('services')
        .select('*')
        .order('created_at', { ascending: false })

      if (queryError) throw queryError

      if (!servicesData || servicesData.length === 0) {
        allServices.value = []
        return
      }

      // Buscar nomes dos parceiros se houver
      const partnerIds = [...new Set(servicesData.map((s: any) => s.parceiro_id).filter(Boolean))]
      let partnersMap = new Map<string, any>()

      if (partnerIds.length > 0) {
        const { data: partnersData } = await supabase
          .from('partners')
          .select('id, nome')
          .in('id', partnerIds)

        partnersData?.forEach((partner: any) => {
          partnersMap.set(partner.id, partner)
        })
      }

      // Combinar serviços com nomes dos parceiros
      allServices.value = servicesData.map((service: any) => {
        const partner = service.parceiro_id ? partnersMap.get(service.parceiro_id) : null
        return {
          ...service,
          partner_name: partner?.nome,
        } as AdminService
      })
    } catch (err: any) {
      error.value = err.message
      console.error('Error fetching services:', err)
    } finally {
      loading.value = false
    }
  }

  // Criar serviço
  async function createService(serviceData: Partial<AdminService>) {
    if (!authStore.user) {
      throw new Error('Usuário não autenticado')
    }

    loading.value = true
    error.value = null

    try {
      // Clean up empty strings and convert to null
      const cleanData: any = {
        nome: serviceData.nome,
        descricao: serviceData.descricao && serviceData.descricao.trim() ? serviceData.descricao : null,
        parceiro_id: serviceData.parceiro_id && serviceData.parceiro_id.trim() ? serviceData.parceiro_id : null,
        categoria: serviceData.categoria && serviceData.categoria.trim() ? serviceData.categoria : null,
        beneficio_membro: serviceData.beneficio_membro && serviceData.beneficio_membro.trim() ? serviceData.beneficio_membro : null,
        destaque: serviceData.destaque || false,
        ativo: serviceData.ativo !== undefined ? serviceData.ativo : true,
        preco: serviceData.preco && serviceData.preco > 0 ? serviceData.preco : null,
        moeda: serviceData.moeda && (serviceData.moeda === 'USD' || serviceData.moeda === 'BRL') ? serviceData.moeda : 'USD',
      }

      const { data, error: insertError } = await supabase
        .from('services')
        .insert(cleanData)
        .select()
        .single()

      if (insertError) {
        console.error('[ADMIN] Erro ao criar serviço:', insertError)
        throw insertError
      }

      // Atualizar lista
      await fetchAllServices()
      await fetchServiceStats()

      // Log da ação
      logAdminAction(authStore.user.id, {
        action: 'create_service',
        targetId: data.id,
        targetType: 'service',
        details: { nome: data.nome, categoria: data.categoria }
      })

      return data
    } catch (err: any) {
      error.value = err.message
      console.error('Error creating service:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Atualizar serviço
  async function updateService(serviceId: string, updates: Partial<AdminService>) {
    if (!authStore.user) {
      throw new Error('Usuário não autenticado')
    }

    loading.value = true
    error.value = null

    try {
      // Clean up empty strings and convert to null
      const cleanData: any = {
        updated_at: new Date().toISOString(),
      }

      if (updates.nome !== undefined) cleanData.nome = updates.nome
      if (updates.descricao !== undefined) {
        cleanData.descricao = updates.descricao && updates.descricao.trim() ? updates.descricao : null
      }
      if (updates.parceiro_id !== undefined) {
        cleanData.parceiro_id = updates.parceiro_id && updates.parceiro_id.trim() ? updates.parceiro_id : null
      }
      if (updates.categoria !== undefined) {
        cleanData.categoria = updates.categoria && updates.categoria.trim() ? updates.categoria : null
      }
      if (updates.beneficio_membro !== undefined) {
        cleanData.beneficio_membro = updates.beneficio_membro && updates.beneficio_membro.trim() ? updates.beneficio_membro : null
      }
      if (updates.destaque !== undefined) cleanData.destaque = updates.destaque
      if (updates.ativo !== undefined) cleanData.ativo = updates.ativo
      if (updates.preco !== undefined) {
        cleanData.preco = updates.preco && updates.preco > 0 ? updates.preco : null
      }
      if (updates.moeda !== undefined) {
        cleanData.moeda = updates.moeda && (updates.moeda === 'USD' || updates.moeda === 'BRL') ? updates.moeda : 'USD'
      }

      const { data, error: updateError } = await supabase
        .from('services')
        .update(cleanData)
        .eq('id', serviceId)
        .select()
        .single()

      if (updateError) {
        console.error('[ADMIN] Erro ao atualizar serviço:', updateError)
        throw updateError
      }

      // Atualizar lista
      await fetchAllServices()
      await fetchServiceStats()

      // Log da ação
      logAdminAction(authStore.user.id, {
        action: 'update_service',
        targetId: serviceId,
        targetType: 'service',
        details: { updates: Object.keys(cleanData) }
      })

      return data
    } catch (err: any) {
      error.value = err.message
      console.error('Error updating service:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Deletar serviço
  async function deleteService(serviceId: string) {
    if (!authStore.user) {
      throw new Error('Usuário não autenticado')
    }

    loading.value = true
    error.value = null

    try {
      const { error: deleteError } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceId)

      if (deleteError) throw deleteError

      // Atualizar lista
      await fetchAllServices()
      await fetchServiceStats()

      // Log da ação
      logAdminAction(authStore.user.id, {
        action: 'delete_service',
        targetId: serviceId,
        targetType: 'service'
      })
    } catch (err: any) {
      error.value = err.message
      console.error('Error deleting service:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Buscar estatísticas de serviços
  async function fetchServiceStats() {
    try {
      const { data, error: queryError } = await supabase
        .from('services')
        .select('ativo, destaque')

      if (queryError) throw queryError

      const total = data?.length || 0
      const active = data?.filter(s => s.ativo).length || 0
      const inactive = data?.filter(s => !s.ativo).length || 0
      const featured = data?.filter(s => s.destaque).length || 0

      serviceStats.value = {
        total,
        active,
        inactive,
        featured,
      }
    } catch (err: any) {
      console.error('Error fetching service stats:', err)
    }
  }

  // ============================================
  // BANNED WORDS MANAGEMENT
  // ============================================

  // Buscar todas as palavras proibidas
  async function fetchBannedWords() {
    loading.value = true
    error.value = null

    try {
      const { data, error: queryError } = await supabase
        .from('banned_words')
        .select('*')
        .order('word', { ascending: true })

      if (queryError) throw queryError

      bannedWords.value = data || []

      // Calcular estatísticas
      const stats: BannedWordStats = {
        total: data?.length || 0,
        byCategory: {},
        byAction: {},
      }

      data?.forEach(word => {
        stats.byCategory[word.category] = (stats.byCategory[word.category] || 0) + 1
        stats.byAction[word.action] = (stats.byAction[word.action] || 0) + 1
      })

      bannedWordStats.value = stats
    } catch (err: any) {
      error.value = err.message
      console.error('Error fetching banned words:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Criar nova palavra proibida
  async function createBannedWord(wordData: { word: string; category: 'spam' | 'ofensivo' | 'outro'; action: 'block' | 'warn' | 'replace' }) {
    if (!authStore.user) {
      throw new Error('Usuário não autenticado')
    }

    loading.value = true
    error.value = null

    try {
      // Validar que palavra não está vazia
      if (!wordData.word || !wordData.word.trim()) {
        throw new Error('A palavra não pode estar vazia')
      }

      const { data, error: insertError } = await supabase
        .from('banned_words')
        .insert({
          word: wordData.word.trim(),
          category: wordData.category,
          action: wordData.action,
          created_by: authStore.user.id,
        })
        .select()
        .single()

      if (insertError) {
        if (insertError.code === '23505') { // Unique violation
          throw new Error('Esta palavra já está cadastrada')
        }
        throw insertError
      }

      // Invalidar cache
      invalidateBannedWordsCache()

      // Recarregar lista
      await fetchBannedWords()

      // Log da ação
      logAdminAction(authStore.user.id, {
        action: 'create_banned_word',
        targetId: data.id,
        targetType: 'banned_word',
        details: { word: data.word, category: data.category, action: data.action }
      })

      return data
    } catch (err: any) {
      error.value = err.message
      console.error('Error creating banned word:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Atualizar palavra proibida
  async function updateBannedWord(id: string, wordData: { word: string; category: 'spam' | 'ofensivo' | 'outro'; action: 'block' | 'warn' | 'replace' }) {
    if (!authStore.user) {
      throw new Error('Usuário não autenticado')
    }

    loading.value = true
    error.value = null

    try {
      if (!wordData.word || !wordData.word.trim()) {
        throw new Error('A palavra não pode estar vazia')
      }

      const { data, error: updateError } = await supabase
        .from('banned_words')
        .update({
          word: wordData.word.trim(),
          category: wordData.category,
          action: wordData.action,
        })
        .eq('id', id)
        .select()
        .single()

      if (updateError) {
        if (updateError.code === '23505') {
          throw new Error('Esta palavra já está cadastrada')
        }
        throw updateError
      }

      // Invalidar cache
      invalidateBannedWordsCache()

      // Recarregar lista
      await fetchBannedWords()

      // Log da ação
      logAdminAction(authStore.user.id, {
        action: 'update_banned_word',
        targetId: id,
        targetType: 'banned_word',
        details: { word: data.word, category: data.category, action: data.action }
      })

      return data
    } catch (err: any) {
      error.value = err.message
      console.error('Error updating banned word:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Deletar palavra proibida
  async function deleteBannedWord(id: string) {
    loading.value = true
    error.value = null

    try {
      const { error: deleteError } = await supabase
        .from('banned_words')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError

      // Invalidar cache
      invalidateBannedWordsCache()

      // Recarregar lista
      await fetchBannedWords()

      // Log da ação
      if (authStore.user) {
        logAdminAction(authStore.user.id, {
          action: 'delete_banned_word',
          targetId: id,
          targetType: 'banned_word'
        })
      }
    } catch (err: any) {
      error.value = err.message
      console.error('Error deleting banned word:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // ============================================
  // REPORTS MANAGEMENT
  // ============================================

  // Buscar reports com filtros
  async function fetchReports(filters?: { status?: ReportStatus; itemType?: ReportItemType; reason?: string }) {
    loading.value = true
    error.value = null

    try {
      let query = supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false })

      if (filters?.status) {
        query = query.eq('status', filters.status)
      }

      if (filters?.itemType) {
        query = query.eq('reported_item_type', filters.itemType)
      }

      if (filters?.reason) {
        query = query.eq('reason', filters.reason)
      }

      const { data, error: queryError } = await query

      if (queryError) throw queryError

      if (!data || data.length === 0) {
        reports.value = []
        return
      }

      // Buscar informações dos reportadores e resolvedores
      const reporterIds = [...new Set(data.map((r: any) => r.reported_by).filter(Boolean))]
      const resolverIds = [...new Set(data.map((r: any) => r.resolved_by).filter(Boolean))]
      const allUserIds = [...new Set([...reporterIds, ...resolverIds])]

      let usersMap = new Map<string, any>()

      if (allUserIds.length > 0) {
        const { data: usersData } = await supabase
          .from('profiles')
          .select('id, nome, email')
          .in('id', allUserIds)

        if (usersData) {
          usersData.forEach((user: any) => {
            usersMap.set(user.id, user)
          })
        }
      }

      // Enriquecer reports com dados dos usuários
      const enrichedReports: Report[] = data.map((report: any) => {
        const reporter = usersMap.get(report.reported_by)
        const resolver = report.resolved_by ? usersMap.get(report.resolved_by) : null

        return {
          ...report,
          reporter_name: reporter?.nome || null,
          reporter_email: reporter?.email || null,
          resolver_name: resolver?.nome || null,
        }
      })

      reports.value = enrichedReports
    } catch (err: any) {
      error.value = err.message
      console.error('Error fetching reports:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Buscar report específico
  async function fetchReportById(id: string): Promise<Report | null> {
    loading.value = true
    error.value = null

    try {
      const { data, error: queryError } = await supabase
        .from('reports')
        .select('*')
        .eq('id', id)
        .single()

      if (queryError) throw queryError

      if (!data) return null

      // Buscar informações dos usuários
      const reporterId = data.reported_by
      const resolverId = data.resolved_by

      const userIds = [reporterId, resolverId].filter(Boolean) as string[]

      let usersMap = new Map<string, any>()

      if (userIds.length > 0) {
        const { data: usersData } = await supabase
          .from('profiles')
          .select('id, nome, email')
          .in('id', userIds)

        if (usersData) {
          usersData.forEach((user: any) => {
            usersMap.set(user.id, user)
          })
        }
      }

      // Buscar item reportado
      let reportedItem = null
      if (data.reported_item_type === 'post') {
        const { data: postData } = await supabase
          .from('posts')
          .select('*')
          .eq('id', data.reported_item_id)
          .single()
        reportedItem = postData
      } else if (data.reported_item_type === 'comment') {
        const { data: commentData } = await supabase
          .from('post_comments')
          .select('*')
          .eq('id', data.reported_item_id)
          .single()
        reportedItem = commentData
      } else if (data.reported_item_type === 'user') {
        const { data: userData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.reported_item_id)
          .single()
        reportedItem = userData
      }

      const reporter = usersMap.get(reporterId)
      const resolver = resolverId ? usersMap.get(resolverId) : null

      return {
        ...data,
        reporter_name: reporter?.nome || null,
        reporter_email: reporter?.email || null,
        resolver_name: resolver?.nome || null,
        reported_item: reportedItem,
      }
    } catch (err: any) {
      error.value = err.message
      console.error('Error fetching report:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Criar report
  async function createReport(input: ReportCreateInput): Promise<Report> {
    if (!authStore.user) {
      throw new Error('Usuário não autenticado')
    }

    loading.value = true
    error.value = null

    try {
      // Verificar se usuário já reportou este item
      const { data: existingReport } = await supabase
        .from('reports')
        .select('id')
        .eq('reported_by', authStore.user.id)
        .eq('reported_item_type', input.reported_item_type)
        .eq('reported_item_id', input.reported_item_id)
        .eq('status', 'pending')
        .single()

      if (existingReport) {
        throw new Error('Você já reportou este item. Aguarde a análise do administrador.')
      }

      const { data, error: insertError } = await supabase
        .from('reports')
        .insert({
          reported_by: authStore.user.id,
          reported_item_type: input.reported_item_type,
          reported_item_id: input.reported_item_id,
          reason: input.reason,
          description: input.description || null,
          status: 'pending',
        })
        .select()
        .single()

      if (insertError) throw insertError

      // Log da ação
      logAdminAction(authStore.user.id, {
        action: 'create_report',
        targetId: data.id,
        targetType: 'report',
        details: { item_type: input.reported_item_type, reason: input.reason }
      })

      // Recarregar lista se estiver em contexto admin
      if (await checkIsAdmin()) {
        await fetchReports()
        await fetchReportStats()
      }

      return data
    } catch (err: any) {
      error.value = err.message
      console.error('Error creating report:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Resolver report
  async function resolveReport(id: string, input: ReportResolveInput): Promise<void> {
    if (!authStore.user) {
      throw new Error('Usuário não autenticado')
    }

    if (!(await checkIsAdmin())) {
      throw new Error('Apenas admins podem resolver reports')
    }

    loading.value = true
    error.value = null

    try {
      // Buscar report
      const report = await fetchReportById(id)
      if (!report) {
        throw new Error('Report não encontrado')
      }

      // Executar ação baseada no tipo
      if (input.action === 'remove_content') {
        if (report.reported_item_type === 'post') {
          await removePost(report.reported_item_id, input.details || 'Removido por report', input.add_strike || false)
        } else if (report.reported_item_type === 'comment') {
          // Marcar comentário como removido (soft-delete)
          const { error: updateError } = await supabase
            .from('post_comments')
            .update({
              status: 'removed',
              moderated_at: new Date().toISOString(),
              moderated_by: authStore.user.id,
              rejection_reason: input.details || 'Removido por report'
            })
            .eq('id', report.reported_item_id)

          if (updateError) throw updateError

          if (input.add_strike && report.reported_item) {
            const commentUserId = (report.reported_item as any).user_id
            if (commentUserId) {
              await addStrikeToUser(commentUserId, input.details || 'Comentário removido por report')
            }
          }
        }
      } else if (input.action === 'suspend_user') {
        const userId = report.reported_item_type === 'user'
          ? report.reported_item_id
          : (report.reported_item as any)?.user_id

        if (userId) {
          // Suspender por 7 dias por padrão
          const suspendUntil = new Date()
          suspendUntil.setDate(suspendUntil.getDate() + 7)

          await supabase
            .from('profiles')
            .update({
              status: 'suspended',
              suspended_until: suspendUntil.toISOString(),
            })
            .eq('id', userId)
        }
      } else if (input.action === 'ban_user') {
        const userId = report.reported_item_type === 'user'
          ? report.reported_item_id
          : (report.reported_item as any)?.user_id

        if (userId) {
          // Usar a função banUser para garantir rastreamento completo
          const reason = input.details || `Banido por violação reportada (Report #${id})`
          await banUser(userId, reason)
        }
      } else if (input.action === 'add_strike') {
        const userId = report.reported_item_type === 'user'
          ? report.reported_item_id
          : (report.reported_item as any)?.user_id

        if (userId) {
          await addStrikeToUser(userId, input.details || 'Strike adicionado por report')
        }
      }

      // Atualizar status do report
      const { error: updateError } = await supabase
        .from('reports')
        .update({
          status: 'resolved',
          resolved_by: authStore.user.id,
          resolved_at: new Date().toISOString(),
        })
        .eq('id', id)

      if (updateError) throw updateError

      // Recarregar lista e estatísticas
      await fetchReports()
      await fetchReportStats()

      // Se foi removido conteúdo, emitir evento para atualizar feed
      if (input.action === 'remove_content') {
        // Disparar evento customizado para atualizar o feed
        window.dispatchEvent(new CustomEvent('post-removed', {
          detail: {
            itemId: report.reported_item_id,
            itemType: report.reported_item_type
          }
        }))
      }

      // Log da ação
      logAdminAction(authStore.user.id, {
        action: 'resolve_report',
        targetId: id,
        targetType: 'report',
        details: {
          action: input.action,
          reportedItemType: report.reported_item_type,
          reportedItemId: report.reported_item_id,
          conteudo: (report.reported_item as any)?.conteudo || (report.reported_item as any)?.titulo
        }
      })
    } catch (err: any) {
      error.value = err.message
      console.error('Error resolving report:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Descartar report
  async function dismissReport(id: string, _reason?: string): Promise<void> {
    if (!authStore.user) {
      throw new Error('Usuário não autenticado')
    }

    if (!(await checkIsAdmin())) {
      throw new Error('Apenas admins podem descartar reports')
    }

    loading.value = true
    error.value = null

    try {
      const { error: updateError } = await supabase
        .from('reports')
        .update({
          status: 'dismissed',
          resolved_by: authStore.user.id,
          resolved_at: new Date().toISOString(),
        })
        .eq('id', id)

      if (updateError) throw updateError

      // Recarregar lista e estatísticas
      await fetchReports()
      await fetchReportStats()

      // Log da ação
      logAdminAction(authStore.user.id, {
        action: 'dismiss_report',
        targetId: id,
        targetType: 'report'
      })
    } catch (err: any) {
      error.value = err.message
      console.error('Error dismissing report:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Buscar estatísticas de reports
  async function fetchReportStats() {
    loading.value = true
    error.value = null

    try {
      const { data, error: queryError } = await supabase
        .from('reports')
        .select('*')

      if (queryError) throw queryError

      const stats: ReportStats = {
        total: data?.length || 0,
        pending: 0,
        reviewed: 0,
        resolved: 0,
        dismissed: 0,
        byType: { post: 0, comment: 0, user: 0 },
        byReason: { spam: 0, inappropriate: 0, harassment: 0, fake_news: 0, other: 0 },
        resolvedToday: 0,
      }

      const today = new Date()
      today.setHours(0, 0, 0, 0)

      data?.forEach((report: any) => {
        // Por status
        if (report.status === 'pending') stats.pending++
        else if (report.status === 'reviewed') stats.reviewed++
        else if (report.status === 'resolved') {
          stats.resolved++
          // Resolvidos hoje
          if (report.resolved_at) {
            const resolvedDate = new Date(report.resolved_at)
            if (resolvedDate >= today) {
              stats.resolvedToday++
            }
          }
        }
        else if (report.status === 'dismissed') stats.dismissed++

        // Por tipo
        if (report.reported_item_type === 'post') stats.byType.post++
        else if (report.reported_item_type === 'comment') stats.byType.comment++
        else if (report.reported_item_type === 'user') stats.byType.user++

        // Por motivo
        if (report.reason === 'spam') stats.byReason.spam++
        else if (report.reason === 'inappropriate') stats.byReason.inappropriate++
        else if (report.reason === 'harassment') stats.byReason.harassment++
        else if (report.reason === 'fake_news') stats.byReason.fake_news++
        else if (report.reason === 'other') stats.byReason.other++
      })

      reportStats.value = stats
    } catch (err: any) {
      error.value = err.message
      console.error('Error fetching report stats:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // ============================================
  // GAMIFICAÇÃO - DESAFIOS
  // ============================================

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
    if (!(await checkIsAdmin())) {
      throw new Error('Apenas admins podem buscar estatísticas de desafios')
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

  const returnObject = {
    pendingEvents,
    allEvents,
    stats,
    pendingUsers,
    allUsers,
    userStats,
    pendingPosts,
    allPosts,
    postStats,
    allServices,
    serviceStats,
    bannedWords,
    bannedWordStats,
    reports,
    reportStats,
    challenges,
    challengeStats,
    loading,
    error,
    checkIsAdmin,
    fetchPendingEvents,
    fetchAllEvents,
    createEvent,
    toggleEventDestaque,
    approveEvent,
    rejectEvent,
    deleteEvent,
    fetchEventStats,
    handleEventApproval,
    fetchPendingUsers,
    fetchAllUsers,
    approveUser,
    rejectUser,
    banUser,
    unbanUser,
    fetchUserStats,
    fetchPendingPosts,
    fetchAllPosts,
    createPost,
    approvePost,
    hidePost,
    removePost,
    markAsSpam,
    fetchPostStats,
    fetchAllServices,
    createService,
    updateService,
    deleteService,
    fetchServiceStats,
    fetchBannedWords,
    createBannedWord,
    updateBannedWord,
    deleteBannedWord,
    fetchReports,
    fetchReportById,
    createReport,
    resolveReport,
    dismissReport,
    fetchReportStats,
    fetchChallenges,
    createChallenge,
    updateChallenge,
    deleteChallenge,
    fetchChallengeStats,
  }

  return returnObject
})

