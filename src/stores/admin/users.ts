import { defineStore } from 'pinia'
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { supabase } from '@/lib/supabase'
import { logAdminAction } from '@/lib/auditLog'
import { useAdminBaseStore } from './base'
import type { AdminUser, UserStats, UserStatus } from '@/types/admin'

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
  })

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
  async function updateUserRole(userId: string, role: string) {
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

  return {
    pendingUsers,
    allUsers,
    userStats,
    fetchPendingUsers,
    fetchAllUsers,
    approveUser,
    rejectUser,
    banUser,
    unbanUser,
    updateUserRole,
    fetchUserStats,
  }
})

