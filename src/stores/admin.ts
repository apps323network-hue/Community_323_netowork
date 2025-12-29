import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from './auth'
import type { AdminEvent, EventStats, EventApprovalAction, AdminUser, UserStats, UserStatus, AdminPost, PostStats } from '@/types/admin'
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
      const { data, error: queryError } = await supabase
        .from('events')
        .select(`
          *,
          creator:profiles!created_by(id, nome)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      if (queryError) throw queryError

      pendingEvents.value = (data || []).map((event: any) => ({
        ...event,
        creator_name: event.creator?.nome || 'Usuário',
        partner_name: event.partner?.nome,
      }))
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
      let query = supabase
        .from('events')
        .select(`
          *,
          creator:profiles!created_by(id, nome)
        `)
        .order('created_at', { ascending: false })

      if (statusFilter) {
        query = query.eq('status', statusFilter)
      }

      const { data, error: queryError } = await query

      if (queryError) throw queryError

      allEvents.value = (data || []).map((event: any) => ({
        ...event,
        creator_name: event.creator?.nome || 'Usuário',
        partner_name: event.partner?.nome,
      }))
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
          rejection_reason: reason || null,
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

      return data
    } catch (err: any) {
      error.value = err.message
      console.error('Error rejecting event:', err)
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
      const { data, error: queryError } = await supabase
        .from('profiles')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      if (queryError) throw queryError

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

      if (updateError) throw updateError

      // Atualizar lista local
      const index = pendingUsers.value.findIndex(u => u.id === userId)
      if (index !== -1) {
        pendingUsers.value.splice(index, 1)
      }

      // Atualizar stats
      await fetchUserStats()

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
          rejection_reason: reason || null,
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

      return data
    } catch (err: any) {
      error.value = err.message
      console.error('Error rejecting user:', err)
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
      const { data, error: queryError } = await supabase
        .from('posts')
        .select(`
          *,
          author:profiles!user_id(id, nome, area_atuacao, avatar_url)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      if (queryError) throw queryError

      pendingPosts.value = (data || []).map((post: any) => ({
        ...post,
        status: post.status || 'pending',
        author_name: post.author?.nome || 'Usuário',
        author_email: '',
      })) as AdminPost[]
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
      let query = supabase
        .from('posts')
        .select(`
          *,
          author:profiles!user_id(id, nome, area_atuacao, avatar_url)
        `)
        .order('created_at', { ascending: false })

      if (statusFilter) {
        query = query.eq('status', statusFilter)
      }

      const { data, error: queryError } = await query

      if (queryError) throw queryError

      allPosts.value = (data || []).map((post: any) => ({
        ...post,
        status: post.status || 'pending',
        author_name: post.author?.nome || 'Usuário',
        author_email: '',
      })) as AdminPost[]
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
          rejection_reason: reason || null,
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
          rejection_reason: reason || null,
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
      const index = pendingPosts.value.findIndex(p => p.id === postId)
      if (index !== -1) {
        pendingPosts.value.splice(index, 1)
      }

      // Atualizar stats
      await fetchPostStats()

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
      const index = pendingPosts.value.findIndex(p => p.id === postId)
      if (index !== -1) {
        pendingPosts.value.splice(index, 1)
      }

      // Atualizar stats
      await fetchPostStats()

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

  return {
    pendingEvents,
    allEvents,
    stats,
    pendingUsers,
    allUsers,
    userStats,
    pendingPosts,
    allPosts,
    postStats,
    loading,
    error,
    checkIsAdmin,
    fetchPendingEvents,
    fetchAllEvents,
    approveEvent,
    rejectEvent,
    fetchEventStats,
    handleEventApproval,
    fetchPendingUsers,
    fetchAllUsers,
    approveUser,
    rejectUser,
    fetchUserStats,
    fetchPendingPosts,
    fetchAllPosts,
    approvePost,
    hidePost,
    removePost,
    markAsSpam,
    fetchPostStats,
  }
})

