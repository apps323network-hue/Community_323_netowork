import { defineStore } from 'pinia'
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { supabase } from '@/lib/supabase'
import { checkBannedWords } from '@/lib/bannedWords'
import { logAdminAction } from '@/lib/auditLog'
import { extractPlainText } from '@/lib/mentionParser'
import { useAdminBaseStore } from './base'
import type { AdminPost, PostStats } from '@/types/admin'
import type { PostStatus } from '@/types/posts'

export const useAdminPostsStore = defineStore('admin-posts', () => {
  const baseStore = useAdminBaseStore()
  const { loading, error } = storeToRefs(baseStore)
  const authStore = baseStore.authStore

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
      console.log('[ADMIN] Buscando todos os posts...', { statusFilter })
      
      // Buscar posts
      let query = supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })

      if (statusFilter) {
        query = query.eq('status', statusFilter)
      }

      const { data: postsData, error: queryError } = await query

      if (queryError) {
        console.error('[ADMIN] Erro ao buscar todos os posts:', queryError)
        throw queryError
      }

      console.log(`[ADMIN] Posts encontrados: ${postsData?.length || 0}`)
      if (postsData && postsData.length > 0) {
        console.log('[ADMIN] Primeiros 3 posts:', postsData.slice(0, 3).map((p: any) => ({ id: p.id, conteudo: p.conteudo?.substring(0, 50), status: p.status })))
      }

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

      // Sanitizar conteúdo: sempre salvar apenas texto puro (remove qualquer HTML)
      const sanitizedContent = extractPlainText(postData.conteudo)

      // Verificar palavras proibidas (admins podem criar mesmo assim, mas vamos avisar)
      const bannedCheck = await checkBannedWords(sanitizedContent)
      if (bannedCheck.found && bannedCheck.action === 'replace' && bannedCheck.sanitizedContent) {
        // Se for replace, usar conteúdo sanitizado
        postData.conteudo = bannedCheck.sanitizedContent
      } else {
        // Usar conteúdo sanitizado (sem HTML)
        postData.conteudo = sanitizedContent
      }
      // Admins podem criar posts mesmo com palavras proibidas (não bloqueamos)

      const { data, error: insertError } = await supabase
        .from('posts')
        .insert({
          user_id: authStore.user.id,
          conteudo: postData.conteudo, // Já sanitizado acima
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
      console.log('[ADMIN] Buscando estatísticas de posts...')
      
      const { data, error: queryError } = await supabase
        .from('posts')
        .select('status, moderated_at')

      if (queryError) {
        console.error('[ADMIN] Erro ao buscar estatísticas de posts:', queryError)
        throw queryError
      }

      console.log(`[ADMIN] Total de posts encontrados: ${data?.length || 0}`)

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

      const stats = {
        total,
        pending,
        approved,
        hidden,
        removed,
        spam,
        removedToday,
      }

      console.log('[ADMIN] Estatísticas de posts calculadas:', stats)
      postStats.value = stats
    } catch (err: any) {
      console.error('[ADMIN] Error fetching post stats:', err)
    }
  }

  return {
    pendingPosts,
    allPosts,
    postStats,
    fetchPendingPosts,
    fetchAllPosts,
    createPost,
    approvePost,
    hidePost,
    removePost,
    markAsSpam,
    fetchPostStats,
    addStrikeToUser,
  }
})

