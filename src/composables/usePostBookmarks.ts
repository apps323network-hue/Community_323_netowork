import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth'

export function usePostBookmarks() {
  const bookmarks = ref<Set<string>>(new Set())
  const loading = ref(false)
  const error = ref<string | null>(null)

  const authStore = useAuthStore()

  // Verificar se um post está marcado como bookmark
  const isBookmarked = computed(() => (postId: string) => {
    return bookmarks.value.has(postId)
  })

  // Buscar todos os bookmarks do usuário atual
  async function fetchBookmarks() {
    if (!authStore.user) {
      bookmarks.value = new Set()
      return
    }

    loading.value = true
    error.value = null

    try {
      const { data, error: queryError } = await supabase
        .from('post_bookmarks')
        .select('post_id')
        .eq('user_id', authStore.user.id)

      if (queryError) throw queryError

      bookmarks.value = new Set(data?.map((b) => b.post_id) || [])
    } catch (err: any) {
      console.error('Error fetching post bookmarks:', err)
      error.value = err.message || 'Erro ao buscar bookmarks'
    } finally {
      loading.value = false
    }
  }

  // Adicionar bookmark
  async function addBookmark(postId: string) {
    if (!authStore.user) {
      error.value = 'Usuário não autenticado'
      return false
    }

    loading.value = true
    error.value = null

    try {
      const { error: insertError } = await supabase
        .from('post_bookmarks')
        .insert({
          user_id: authStore.user.id,
          post_id: postId,
        })

      // Se der erro de duplicata (409), significa que já existe - tratar como sucesso
      if (insertError) {
        // Código 23505 = unique constraint violation (PostgreSQL)
        // Código PGRST116 = duplicate key (Supabase)
        if (insertError.code === '23505' || insertError.message?.includes('duplicate')) {
          // Já existe, então adicionar ao estado local e retornar sucesso
          bookmarks.value.add(postId)
          return true
        }
        throw insertError
      }

      bookmarks.value.add(postId)
      return true
    } catch (err: any) {
      console.error('Error adding post bookmark:', err)
      error.value = err.message || 'Erro ao adicionar bookmark'
      return false
    } finally {
      loading.value = false
    }
  }

  // Remover bookmark
  async function removeBookmark(postId: string) {
    if (!authStore.user) {
      error.value = 'Usuário não autenticado'
      return false
    }

    loading.value = true
    error.value = null

    try {
      const { error: deleteError } = await supabase
        .from('post_bookmarks')
        .delete()
        .eq('user_id', authStore.user.id)
        .eq('post_id', postId)

      // Se não encontrou nenhum registro para deletar, ainda é sucesso (já estava removido)
      if (deleteError && deleteError.code !== 'PGRST116') {
        throw deleteError
      }

      // Remover do estado local mesmo se não existia no banco
      bookmarks.value.delete(postId)
      return true
    } catch (err: any) {
      console.error('Error removing post bookmark:', err)
      error.value = err.message || 'Erro ao remover bookmark'
      // Mesmo em caso de erro, remover do estado local para sincronizar
      bookmarks.value.delete(postId)
      return false
    } finally {
      loading.value = false
    }
  }

  // Toggle bookmark (adiciona se não existe, remove se existe)
  // Aceita um parâmetro opcional para forçar o estado atual (útil quando o estado local pode estar desatualizado)
  async function toggleBookmark(postId: string, currentState?: boolean) {
    // Se currentState foi fornecido, usar ele. Caso contrário, usar o estado local
    const isCurrentlyBookmarked = currentState !== undefined 
      ? currentState 
      : isBookmarked.value(postId)
    
    if (isCurrentlyBookmarked) {
      return await removeBookmark(postId)
    } else {
      return await addBookmark(postId)
    }
  }

  // Buscar posts com bookmark (para a página de posts salvos)
  async function fetchBookmarkedPosts() {
    if (!authStore.user) {
      return []
    }

    loading.value = true
    error.value = null

    try {
      // Primeiro buscar os IDs dos posts com bookmark
      const { data: bookmarksData, error: bookmarksError } = await supabase
        .from('post_bookmarks')
        .select('post_id')
        .eq('user_id', authStore.user.id)
        .order('created_at', { ascending: false })

      if (bookmarksError) throw bookmarksError

      if (!bookmarksData || bookmarksData.length === 0) {
        return []
      }

      // Depois buscar os posts
      const postIds = bookmarksData.map((b) => b.post_id)
      
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .in('id', postIds)
        .order('created_at', { ascending: false })

      if (postsError) throw postsError

      return postsData || []
    } catch (err: any) {
      console.error('Error fetching bookmarked posts:', err)
      error.value = err.message || 'Erro ao buscar posts salvos'
      return []
    } finally {
      loading.value = false
    }
  }

  return {
    bookmarks,
    loading,
    error,
    isBookmarked,
    fetchBookmarks,
    addBookmark,
    removeBookmark,
    toggleBookmark,
    fetchBookmarkedPosts,
  }
}

