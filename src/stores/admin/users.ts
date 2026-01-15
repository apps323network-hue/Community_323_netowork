import { defineStore } from 'pinia'
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { supabase } from '@/lib/supabase'
import { logAdminAction } from '@/lib/auditLog'
import { isLocalhost } from '@/utils/localhost'
import { useAdminBaseStore } from './base'
import type { AdminUser, UserStats, UserStatus, UserRole, MemberFilters, PaginationMeta, SortColumn, SortDirection } from '@/types/admin'

export const useAdminUsersStore = defineStore('admin-users', () => {
  const baseStore = useAdminBaseStore()
  const { loading, error } = storeToRefs(baseStore)
  const authStore = baseStore.authStore

  const pendingUsers = ref<AdminUser[]>([])
  const allUsers = ref<AdminUser[]>([])
  const userStats = ref<UserStats>({
    total: 0,
    pending: 0,
    active: 0,
    suspended: 0,
    banned: 0,
    newToday: 0,
    activeThisMonth: 0,
    engagementRate: 0,
  })

  // Pagination and filtering
  const paginatedMembers = ref<AdminUser[]>([])
  const pagination = ref<PaginationMeta>({
    currentPage: 1,
    pageSize: 20,
    totalItems: 0,
    totalPages: 0,
  })
  const filters = ref<MemberFilters>({})
  const sortBy = ref<SortColumn>('created_at')
  const sortDirection = ref<SortDirection>('desc')

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
      console.log('[ADMIN] Buscando todos os usuários...', { statusFilter })

      let query = supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (statusFilter) {
        query = query.eq('status', statusFilter)
      }

      const { data, error: queryError } = await query

      if (queryError) {
        console.error('[ADMIN] Erro ao buscar todos os usuários:', queryError)
        throw queryError
      }

      console.log(`[ADMIN] Usuários encontrados: ${data?.length || 0}`)
      if (data && data.length > 0) {
        console.log('[ADMIN] Primeiros 3 usuários:', data.slice(0, 3).map((u: any) => ({ id: u.id, nome: u.nome, status: u.status })))
      }

      allUsers.value = (data || []).map((profile: any) => ({
        ...profile,
        email: '', // Email será buscado separadamente se necessário
        status: profile.status || 'pending',
        strikes: profile.strikes || 0,
      })) as AdminUser[]
    } catch (err: any) {
      error.value = err.message
      console.error('[ADMIN] Error fetching all users:', err)
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
      console.log('[ADMIN] Buscando estatísticas de usuários...')

      const { data, error: queryError } = await supabase
        .from('profiles')
        .select('status, created_at')

      if (queryError) {
        console.error('[ADMIN] Erro ao buscar estatísticas de usuários:', queryError)
        throw queryError
      }

      console.log(`[ADMIN] Total de perfis encontrados: ${data?.length || 0}`)

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

      const stats = {
        total,
        pending,
        active,
        suspended,
        banned,
        newToday,
      }

      console.log('[ADMIN] Estatísticas de usuários calculadas:', stats)
      userStats.value = stats
    } catch (err: any) {
      console.error('[ADMIN] Error fetching user stats:', err)
    }
  }

  // Atualizar cargo do usuário
  async function updateUserRole(userId: string, role: UserRole) {
    if (!authStore.user) {
      throw new Error('Usuário não autenticado')
    }

    loading.value = true
    error.value = null

    try {
      console.log('[ADMIN] Atualizando cargo do usuário:', userId, 'para:', role)

      const { data, error: updateError } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', userId)
        .select()
        .single()

      if (updateError) throw updateError

      // Atualizar lista local
      const index = allUsers.value.findIndex(u => u.id === userId)
      if (index !== -1) {
        allUsers.value[index] = { ...allUsers.value[index], role }
      }

      // Log da ação
      logAdminAction(authStore.user.id, {
        action: 'update_user_role',
        targetId: userId,
        targetType: 'user',
        details: { role }
      })

      return data
    } catch (err: any) {
      error.value = err.message
      console.error('Error updating user role:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Fetch members with pagination and filters
  async function fetchMembersPaginated(page: number = 1, pageSize: number = 20) {
    loading.value = true
    error.value = null

    try {
      // Build query
      let query = supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .neq('status', 'rejected')

      // Excluir usuários de teste em produção (apenas mostrar em dev)
      if (!isLocalhost()) {
        query = query.eq('is_test_user', false)
      }

      // Apply filters
      if (filters.value.search) {
        query = query.or(`nome.ilike.%${filters.value.search}%,email.ilike.%${filters.value.search}%`)
      }

      if (filters.value.roles && filters.value.roles.length > 0) {
        query = query.in('role', filters.value.roles)
      }

      if (filters.value.plans && filters.value.plans.length > 0) {
        query = query.in('plano', filters.value.plans)
      }

      if (filters.value.statuses && filters.value.statuses.length > 0) {
        query = query.in('status', filters.value.statuses)
      }

      if (filters.value.countries && filters.value.countries.length > 0) {
        query = query.in('pais', filters.value.countries)
      }

      // Apply date range filter
      if (filters.value.dateRange && filters.value.dateRange !== 'all') {
        const now = new Date()
        let startDate: Date

        if (filters.value.dateRange === 'today') {
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        } else if (filters.value.dateRange === 'week') {
          // Start of this week (Sunday)
          const dayOfWeek = now.getDay()
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek)
        } else if (filters.value.dateRange === 'month') {
          // Start of this month
          startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        } else {
          startDate = new Date(0) // Fallback to beginning of time
        }

        query = query.gte('created_at', startDate.toISOString())
      }

      // Apply sorting
      query = query.order(sortBy.value, { ascending: sortDirection.value === 'asc' })

      // Apply pagination
      const from = (page - 1) * pageSize
      const to = from + pageSize - 1
      query = query.range(from, to)

      const { data: profiles, error: queryError, count } = await query

      if (queryError) throw queryError

      // Fetch engagement stats for these users
      const userIds = (profiles || []).map(p => p.id)

      let engagementData: Record<string, { post_count: number; comment_count: number; connections_count: number }> = {}

      if (userIds.length > 0) {
        // Fetch posts count
        const { data: postsData } = await supabase
          .from('posts')
          .select('user_id')
          .in('user_id', userIds)
          .neq('status', 'removed')

        // Fetch comments count  
        const { data: commentsData } = await supabase
          .from('post_comments')
          .select('user_id')
          .in('user_id', userIds)
          .neq('status', 'removed')

        // Fetch connections count
        const { data: connectionsData } = await supabase
          .from('connections')
          .select('follower_id, following_id')
          .or(`follower_id.in.(${userIds.join(',')}),following_id.in.(${userIds.join(',')})`)
          .eq('status', 'accepted')

        // Aggregate counts
        userIds.forEach(userId => {
          engagementData[userId] = {
            post_count: (postsData || []).filter(p => p.user_id === userId).length,
            comment_count: (commentsData || []).filter(c => c.user_id === userId).length,
            connections_count: (connectionsData || []).filter(
              c => c.follower_id === userId || c.following_id === userId
            ).length,
          }
        })
      }

      // Merge engagement data with profiles
      paginatedMembers.value = (profiles || []).map((profile: any) => ({
        ...profile,
        status: profile.status || 'pending',
        strikes: profile.strikes || 0,
        ...engagementData[profile.id],
      })) as AdminUser[]

      // Update pagination meta
      pagination.value = {
        currentPage: page,
        pageSize,
        totalItems: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize),
      }

    } catch (err: any) {
      error.value = err.message
      console.error('[ADMIN] Error fetching paginated members:', err)
    } finally {
      loading.value = false
    }
  }

  // Set filters
  function setFilters(newFilters: MemberFilters) {
    filters.value = newFilters
  }

  // Clear filters
  function clearFilters() {
    filters.value = {}
  }

  // Set sorting
  function setSorting(column: SortColumn, direction: SortDirection) {
    sortBy.value = column
    sortDirection.value = direction
  }

  // Set page size
  function setPageSize(size: number) {
    pagination.value.pageSize = size
  }

  return {
    pendingUsers,
    allUsers,
    paginatedMembers,
    pagination,
    filters,
    sortBy,
    sortDirection,
    userStats,
    fetchPendingUsers,
    fetchAllUsers,
    fetchMembersPaginated,
    setFilters,
    clearFilters,
    setSorting,
    setPageSize,
    approveUser,
    rejectUser,
    banUser,
    unbanUser,
    updateUserRole,
    fetchUserStats,
  }
})

