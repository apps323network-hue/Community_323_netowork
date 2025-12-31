import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from './auth'
import { checkBannedWords } from '@/lib/bannedWords'
import { logAdminAction } from '@/lib/auditLog'
import { useGamificationStore } from './gamification'
import type { Post, Comment, PostCreateInput, CommentCreateInput, PostFilters } from '@/types/posts'

export const usePostStore = defineStore('posts', () => {
  const posts = ref<Post[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const hasMore = ref(true)
  const currentPage = ref(0)
  const pageSize = ref(15)

  const authStore = useAuthStore()
  const gamificationStore = useGamificationStore()
  const currentUserId = computed(() => authStore.user?.id)

  // Verificar se usuário é admin
  // async function checkIsAdmin(): Promise<boolean> {
  //   if (!authStore.user) return false

  //   try {
  //     const { data, error: profileError } = await supabase
  //       .from('profiles')
  //       .select('role')
  //       .eq('id', authStore.user.id)
  //       .single()

  //     if (profileError) return false
  //     return data?.role === 'admin'
  //   } catch {
  //     return false
  //   }
  // }

  // Fetch posts with pagination and filters
  async function fetchPosts(filters: PostFilters = {}, reset = false) {
    if (reset) {
      posts.value = []
      currentPage.value = 0
      hasMore.value = true
    }

    loading.value = true
    error.value = null

    try {
      console.log('[POSTS] Buscando posts...')

      let query = supabase
        .from('posts')
        .select('*')
        .order('fixado', { ascending: false })
        .order('created_at', { ascending: false })
        .range(currentPage.value * pageSize.value, (currentPage.value + 1) * pageSize.value - 1)

      // Não filtrar por status aqui - deixar a RLS fazer o trabalho
      // A RLS já permite:
      // - Admins veem todos os posts
      // - Usuários autenticados veem apenas posts 'approved'
      // - Criador pode ver seu próprio post mesmo se 'pending' ou 'hidden'
      // Se filtrarmos aqui, podemos bloquear posts que a RLS permite ver

      // Apply filters
      if (filters.tipo && filters.tipo !== 'all') {
        query = query.eq('tipo', filters.tipo)
      }

      if (filters.search) {
        query = query.ilike('conteudo', `%${filters.search}%`)
      }

      if (filters.user_id) {
        query = query.eq('user_id', filters.user_id)
      }

      const { data, error: queryError } = await query

      if (queryError) {
        console.error('[POSTS] Erro ao buscar posts:', queryError)
        throw queryError
      }

      console.log(`[POSTS] Posts encontrados: ${data?.length || 0}`)
      if (data && data.length > 0) {
        console.log('[POSTS] Status dos posts:', data.map((p: any) => ({ id: p.id, status: p.status })))
      }

      if (!data || data.length === 0) {
        hasMore.value = false
        return []
      }

      // Fetch likes and comments counts for each post
      const userIds = [...new Set(data.map((p: any) => p.user_id))]

      // Fetch profiles for authors (with status to filter banned users)
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, nome, area_atuacao, avatar_url, status')
        .in('id', userIds)

      console.log('[POSTS] Profiles fetched:', profilesData?.length)

      // Criar mapa de perfis e filtrar usuários banidos
      const profilesMap = new Map<string, any>()
      const bannedUserIds = new Set<string>()

      profilesData?.forEach((profile: any) => {
        profilesMap.set(profile.id, profile)
        if (profile.status === 'banned') {
          bannedUserIds.add(profile.id)
          console.log('[POSTS] Usuário banido detectado:', profile.nome, profile.id)
        }
      })

      console.log('[POSTS] Total de usuários banidos:', bannedUserIds.size)
      console.log('[POSTS] Posts antes do filtro:', data.length)

      // Filtrar posts de usuários banidos
      const filteredData = data.filter((post: any) => {
        // Não mostrar posts de usuários banidos
        if (bannedUserIds.has(post.user_id)) {
          console.log('[POSTS] Filtrando post de usuário banido:', post.id)
          return false
        }
        return true
      })

      console.log('[POSTS] Posts depois do filtro:', filteredData.length)

      // Se todos os posts foram filtrados, retornar vazio
      if (filteredData.length === 0) {
        hasMore.value = false
        return []
      }

      // Usar filteredData em vez de data para buscar likes e comments
      const filteredPostIds = filteredData.map((p: any) => p.id)

      // Fetch likes counts
      const { data: likesData } = await supabase
        .from('post_likes')
        .select('post_id, user_id')
        .in('post_id', filteredPostIds)

      // Fetch comments counts
      const { data: commentsData } = await supabase
        .from('post_comments')
        .select('post_id')
        .in('post_id', filteredPostIds)
        .eq('status', 'approved')

      // Create maps for quick lookup (já não preciso mais do profilesMap aqui)

      // Count likes and comments per post
      const likesCountMap = new Map<string, number>()
      const commentsCountMap = new Map<string, number>()
      const userLikesSet = new Set<string>()

      likesData?.forEach((like: any) => {
        const count = likesCountMap.get(like.post_id) || 0
        likesCountMap.set(like.post_id, count + 1)

        if (like.user_id === currentUserId.value) {
          userLikesSet.add(like.post_id)
        }
      })

      commentsData?.forEach((comment: any) => {
        const count = commentsCountMap.get(comment.post_id) || 0
        commentsCountMap.set(comment.post_id, count + 1)
      })

      // Transform data to match Post interface
      // Filtrar posts removidos ou spam (RLS já deveria bloquear, mas garantimos aqui também)
      const transformedPosts: Post[] = filteredData
        .filter((post: any) => {
          // Filtrar posts removidos e spam (exceto se for o próprio criador)
          const isRemovedOrSpam = post.status === 'removed' || post.status === 'spam'
          const isOwner = post.user_id === currentUserId.value
          // Se for removido/spam e não for o dono, não mostrar
          if (isRemovedOrSpam && !isOwner) {
            return false
          }
          return true
        })
        .map((post: any) => {
          const profile = profilesMap.get(post.user_id)
          return {
            id: post.id,
            user_id: post.user_id,
            tipo: post.tipo,
            conteudo: post.conteudo,
            fixado: post.fixado,
            image_url: post.image_url || undefined,
            created_at: post.created_at,
            updated_at: post.updated_at,
            status: post.status || 'approved', // Incluir status do post
            author: profile ? {
              id: profile.id,
              nome: profile.nome || 'Usuário',
              area_atuacao: profile.area_atuacao,
              avatar_url: profile.avatar_url,
            } : {
              id: post.user_id,
              nome: 'Usuário',
            },
            likes_count: likesCountMap.get(post.id) || 0,
            comments_count: commentsCountMap.get(post.id) || 0,
            isLiked: userLikesSet.has(post.id),
          }
        })

      // Sort by popular if needed
      if (filters.sortBy === 'popular') {
        transformedPosts.sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0))
      }

      if (reset) {
        posts.value = transformedPosts
        currentPage.value = 1
      } else {
        posts.value = [...posts.value, ...transformedPosts]
        currentPage.value++
      }

      // Check if there are more posts
      hasMore.value = transformedPosts.length === pageSize.value

      return transformedPosts
    } catch (err: any) {
      error.value = err.message
      console.error('Error fetching posts:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Fetch single post by ID
  async function fetchPostById(postId: string): Promise<Post | null> {
    loading.value = true
    error.value = null

    try {
      let query = supabase
        .from('posts')
        .select('*')
        .eq('id', postId)

      // Não filtrar por status aqui - deixar a RLS fazer o trabalho
      // A RLS já permite que o criador veja seu próprio post mesmo se 'pending' ou 'hidden'

      const { data, error: queryError } = await query.single()

      if (queryError) throw queryError

      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, nome, area_atuacao, avatar_url')
        .eq('id', data.user_id)
        .single()

      // Fetch likes count
      const { data: likesData } = await supabase
        .from('post_likes')
        .select('user_id')
        .eq('post_id', postId)

      // Fetch comments count
      const { data: commentsData } = await supabase
        .from('post_comments')
        .select('id')
        .eq('post_id', postId)
        .eq('status', 'approved')

      const isLiked = currentUserId.value
        ? (likesData?.some((like: any) => like.user_id === currentUserId.value) || false)
        : false

      const post: Post = {
        id: data.id,
        user_id: data.user_id,
        tipo: data.tipo,
        conteudo: data.conteudo,
        fixado: data.fixado,
        created_at: data.created_at,
        updated_at: data.updated_at,
        status: data.status || 'approved', // Incluir status do post
        author: profileData ? {
          id: profileData.id,
          nome: profileData.nome || 'Usuário',
          area_atuacao: profileData.area_atuacao,
          avatar_url: profileData.avatar_url,
        } : {
          id: data.user_id,
          nome: 'Usuário',
        },
        likes_count: likesData?.length || 0,
        comments_count: commentsData?.length || 0,
        isLiked,
      }

      return post
    } catch (err: any) {
      error.value = err.message
      console.error('Error fetching post:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Create new post
  async function createPost(input: PostCreateInput): Promise<Post> {
    if (!currentUserId.value) {
      throw new Error('User must be authenticated to create posts')
    }

    loading.value = true
    error.value = null

    try {
      // Verificar palavras proibidas
      const bannedCheck = await checkBannedWords(input.conteudo)

      if (bannedCheck.found) {
        // Bloquear qualquer palavra ofensiva encontrada
        throw new Error('Seu post contém palavras ofensivas. Por favor, revise o conteúdo.')
      }

      // Determinar status baseado na verificação
      let postStatus: 'pending' | 'approved' = 'pending'
      if (bannedCheck.found && bannedCheck.action === 'warn') {
        postStatus = 'pending'
      } else if (!bannedCheck.found) {
        // Se não encontrou palavras proibidas, ainda cria como pending (padrão)
        postStatus = 'pending'
      }

      const { data, error: insertError } = await supabase
        .from('posts')
        .insert({
          user_id: currentUserId.value,
          tipo: input.tipo,
          conteudo: input.conteudo,
          image_url: input.image_url || null,
          status: postStatus,
        })
        .select('*')
        .single()

      if (insertError) throw insertError

      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, nome, area_atuacao, avatar_url')
        .eq('id', data.user_id)
        .single()

      const newPost: Post = {
        id: data.id,
        user_id: data.user_id,
        tipo: data.tipo,
        conteudo: data.conteudo,
        fixado: data.fixado,
        image_url: data.image_url || undefined,
        created_at: data.created_at,
        updated_at: data.updated_at,
        status: data.status || 'pending',
        author: profileData ? {
          id: profileData.id,
          nome: profileData.nome || 'Usuário',
          area_atuacao: profileData.area_atuacao,
          avatar_url: profileData.avatar_url,
        } : {
          id: data.user_id,
          nome: 'Usuário',
        },
        likes_count: 0,
        comments_count: 0,
        isLiked: false,
      }

      // Não adicionar à lista imediatamente se for pending (aguardar aprovação)
      // Ou adicionar mas mostrar badge de "Aguardando aprovação"
      // Por enquanto, vamos adicionar mas o RLS vai filtrar
      if (newPost.status === 'pending') {
        // Adicionar apenas se for o próprio usuário (ele pode ver seu próprio post pending)
        if (currentUserId.value === data.user_id) {
          posts.value = [newPost, ...posts.value]
        }
      } else {
        posts.value = [newPost, ...posts.value]
      }

      // Log da ação
      logAdminAction(currentUserId.value, {
        action: 'user_create_post',
        targetId: data.id,
        targetType: 'post',
        details: {
          tipo: data.tipo,
          status: data.status,
          conteudo: data.conteudo
        }
      })

      // Award points for creating a post (First time only)
      await gamificationStore.awardPoints(10, 'post', data.id, 'Primeiro post criado!', true)

      return newPost
    } catch (err: any) {
      error.value = err.message
      console.error('Error creating post:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Update post
  async function updatePost(postId: string, updates: Partial<PostCreateInput>): Promise<Post> {
    loading.value = true
    error.value = null

    try {
      const { data, error: updateError } = await supabase
        .from('posts')
        .update(updates)
        .eq('id', postId)
        .select('*')
        .single()

      if (updateError) throw updateError

      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, nome, area_atuacao, avatar_url')
        .eq('id', data.user_id)
        .single()

      const updatedPost: Post = {
        id: data.id,
        user_id: data.user_id,
        tipo: data.tipo,
        conteudo: data.conteudo,
        fixado: data.fixado,
        created_at: data.created_at,
        updated_at: data.updated_at,
        author: profileData ? {
          id: profileData.id,
          nome: profileData.nome || 'Usuário',
          area_atuacao: profileData.area_atuacao,
          avatar_url: profileData.avatar_url,
        } : {
          id: data.user_id,
          nome: 'Usuário',
        },
      }

      // Update in local state
      const index = posts.value.findIndex(p => p.id === postId)
      if (index !== -1) {
        posts.value[index] = { ...posts.value[index], ...updatedPost }
      }

      // Log da ação
      logAdminAction(currentUserId.value as string, {
        action: 'user_update_post',
        targetId: postId,
        targetType: 'post',
        details: { updates: Object.keys(updates) }
      })

      return updatedPost
    } catch (err: any) {
      error.value = err.message
      console.error('Error updating post:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Delete post
  async function deletePost(postId: string): Promise<void> {
    loading.value = true
    error.value = null

    try {
      const { error: deleteError } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId)

      if (deleteError) throw deleteError

      // Remove from local state
      posts.value = posts.value.filter(p => p.id !== postId)

      // Log da ação
      if (currentUserId.value) {
        logAdminAction(currentUserId.value, {
          action: 'user_delete_post',
          targetId: postId,
          targetType: 'post'
        })
      }
    } catch (err: any) {
      error.value = err.message
      console.error('Error deleting post:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Toggle like (optimistic update)
  async function toggleLike(postId: string): Promise<void> {
    if (!currentUserId.value) {
      throw new Error('User must be authenticated to like posts')
    }

    const post = posts.value.find(p => p.id === postId)
    if (!post) return

    // Optimistic update
    const wasLiked = post.isLiked
    post.isLiked = !wasLiked
    post.likes_count = (post.likes_count || 0) + (wasLiked ? -1 : 1)

    try {
      if (wasLiked) {
        // Unlike
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', currentUserId.value)

        if (error) throw error

        // Log da ação
        logAdminAction(currentUserId.value, {
          action: 'user_unlike_post',
          targetId: postId,
          targetType: 'post'
        })
      } else {
        // Like
        const { error } = await supabase
          .from('post_likes')
          .insert({
            post_id: postId,
            user_id: currentUserId.value,
          })

        if (error) throw error

        // Log da ação
        logAdminAction(currentUserId.value, {
          action: 'user_like_post',
          targetId: postId,
          targetType: 'post'
        })
      }
    } catch (err: any) {
      // Revert optimistic update on error
      post.isLiked = wasLiked
      post.likes_count = (post.likes_count || 0) + (wasLiked ? 1 : -1)
      console.error('Error toggling like:', err)
      throw err
    }
  }

  // Fetch comments for a post
  async function fetchComments(postId: string): Promise<Comment[]> {
    try {
      const { data, error: queryError } = await supabase
        .from('post_comments')
        .select('*')
        .eq('post_id', postId)
        .eq('status', 'approved')
        .order('created_at', { ascending: true })

      if (queryError) throw queryError

      if (!data || data.length === 0) {
        return []
      }

      // Fetch profiles for comment authors
      const userIds = [...new Set(data.map((c: any) => c.user_id))]
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, nome, area_atuacao, avatar_url')
        .in('id', userIds)

      const profilesMap = new Map<string, any>()
      profilesData?.forEach((profile: any) => {
        profilesMap.set(profile.id, profile)
      })

      const comments: Comment[] = data.map((comment: any) => {
        const profile = profilesMap.get(comment.user_id)
        return {
          id: comment.id,
          post_id: comment.post_id,
          user_id: comment.user_id,
          conteudo: comment.conteudo,
          created_at: comment.created_at,
          updated_at: comment.updated_at,
          author: profile ? {
            id: profile.id,
            nome: profile.nome || 'Usuário',
            area_atuacao: profile.area_atuacao,
            avatar_url: profile.avatar_url,
          } : {
            id: comment.user_id,
            nome: 'Usuário',
          },
        }
      })

      // Update post comments in local state
      const post = posts.value.find(p => p.id === postId)
      if (post) {
        post.comments = comments
      }

      return comments
    } catch (err: any) {
      console.error('Error fetching comments:', err)
      throw err
    }
  }

  // Add comment
  async function addComment(input: CommentCreateInput): Promise<Comment> {
    if (!currentUserId.value) {
      throw new Error('User must be authenticated to comment')
    }

    try {
      // Verificar palavras proibidas
      const bannedCheck = await checkBannedWords(input.conteudo)

      if (bannedCheck.found) {
        // Bloquear qualquer palavra ofensiva encontrada
        throw new Error('Seu comentário contém palavras ofensivas. Por favor, revise o conteúdo.')
      }

      const { data, error: insertError } = await supabase
        .from('post_comments')
        .insert({
          post_id: input.post_id,
          user_id: currentUserId.value,
          conteudo: input.conteudo,
        })
        .select('*')
        .single()

      if (insertError) throw insertError

      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, nome, area_atuacao, avatar_url')
        .eq('id', data.user_id)
        .single()

      const newComment: Comment = {
        id: data.id,
        post_id: data.post_id,
        user_id: data.user_id,
        conteudo: data.conteudo,
        created_at: data.created_at,
        updated_at: data.updated_at,
        author: profileData ? {
          id: profileData.id,
          nome: profileData.nome || 'Usuário',
          area_atuacao: profileData.area_atuacao,
          avatar_url: profileData.avatar_url,
        } : {
          id: data.user_id,
          nome: 'Usuário',
        },
      }

      // Update post comments in local state
      const post = posts.value.find(p => p.id === input.post_id)
      if (post) {
        if (!post.comments) {
          post.comments = []
        }
        post.comments.push(newComment)
        post.comments_count = (post.comments_count || 0) + 1
      }

      // Log da ação
      logAdminAction(currentUserId.value, {
        action: 'user_add_comment',
        targetId: data.id,
        targetType: 'comment',
        details: {
          post_id: input.post_id,
          conteudo: input.conteudo
        }
      })

      // Award points for adding a comment
      await gamificationStore.awardPoints(5, 'comment', data.id, 'Novo comentário adicionado')

      return newComment
    } catch (err: any) {
      console.error('Error adding comment:', err)
      throw err
    }
  }


  // Delete comment
  async function deleteComment(commentId: string): Promise<void> {
    try {
      // Find comment to get post_id and content for logging
      const post = posts.value.find(p => p.comments?.some(c => c.id === commentId))
      if (!post || !post.comments) return
      const comment = post.comments.find(c => c.id === commentId)

      const { error: deleteError } = await supabase
        .from('post_comments')
        .update({
          status: 'removed',
          moderated_at: new Date().toISOString(),
          moderated_by: currentUserId.value
        })
        .eq('id', commentId)

      if (deleteError) throw deleteError

      // Remove from local state
      post.comments = post.comments.filter(c => c.id !== commentId)
      post.comments_count = Math.max(0, (post.comments_count || 0) - 1)

      // Log da ação
      if (currentUserId.value) {
        logAdminAction(currentUserId.value, {
          action: 'user_delete_comment',
          targetId: commentId,
          targetType: 'comment',
          details: {
            post_id: post.id,
            conteudo: comment?.conteudo
          }
        })
      }
    } catch (err: any) {
      console.error('Error deleting comment:', err)
      throw err
    }
  }

  // Reset store
  function reset() {
    posts.value = []
    loading.value = false
    error.value = null
    hasMore.value = true
    currentPage.value = 0
  }

  return {
    // State
    posts,
    loading,
    error,
    hasMore,
    currentPage,
    // Actions
    fetchPosts,
    fetchPostById,
    createPost,
    updatePost,
    deletePost,
    toggleLike,
    fetchComments,
    addComment,
    deleteComment,
    reset,
  }
})

