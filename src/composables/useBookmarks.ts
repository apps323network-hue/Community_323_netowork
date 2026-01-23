import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth'
import { isLocalhost } from '@/utils/localhost'

export function useBookmarks() {
  const bookmarks = ref<Set<string>>(new Set())
  const loading = ref(false)
  const error = ref<string | null>(null)

  const authStore = useAuthStore()

  // Verificar se um membro está marcado como bookmark
  const isBookmarked = computed(() => (memberId: string) => {
    return bookmarks.value.has(memberId)
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
        .from('member_bookmarks')
        .select('member_id')
        .eq('user_id', authStore.user.id)

      if (queryError) throw queryError

      bookmarks.value = new Set(data?.map((b) => b.member_id) || [])
    } catch (err: any) {
      console.error('Error fetching bookmarks:', err)
      error.value = err.message || 'Erro ao buscar bookmarks'
    } finally {
      loading.value = false
    }
  }

  // Adicionar bookmark
  async function addBookmark(memberId: string) {
    if (!authStore.user) {
      error.value = 'Usuário não autenticado'
      return false
    }

    // Não permitir bookmark do próprio perfil
    if (memberId === authStore.user.id) {
      error.value = 'Não é possível marcar seu próprio perfil como favorito'
      return false
    }

    loading.value = true
    error.value = null

    try {
      const { error: insertError } = await supabase
        .from('member_bookmarks')
        .insert({
          user_id: authStore.user.id,
          member_id: memberId,
        })

      if (insertError) throw insertError

      bookmarks.value.add(memberId)
      return true
    } catch (err: any) {
      console.error('Error adding bookmark:', err)
      error.value = err.message || 'Erro ao adicionar bookmark'
      return false
    } finally {
      loading.value = false
    }
  }

  // Remover bookmark
  async function removeBookmark(memberId: string) {
    if (!authStore.user) {
      error.value = 'Usuário não autenticado'
      return false
    }

    loading.value = true
    error.value = null

    try {
      const { error: deleteError } = await supabase
        .from('member_bookmarks')
        .delete()
        .eq('user_id', authStore.user.id)
        .eq('member_id', memberId)

      if (deleteError) throw deleteError

      bookmarks.value.delete(memberId)
      return true
    } catch (err: any) {
      console.error('Error removing bookmark:', err)
      error.value = err.message || 'Erro ao remover bookmark'
      return false
    } finally {
      loading.value = false
    }
  }

  // Toggle bookmark (adiciona se não existe, remove se existe)
  async function toggleBookmark(memberId: string) {
    if (isBookmarked.value(memberId)) {
      return await removeBookmark(memberId)
    } else {
      return await addBookmark(memberId)
    }
  }

  // Buscar membros com bookmark (para a seção "Em destaque")
  async function fetchBookmarkedMembers() {
    if (!authStore.user) {
      return []
    }

    loading.value = true
    error.value = null

    try {
      // Primeiro buscar os IDs dos membros com bookmark
      const { data: bookmarksData, error: bookmarksError } = await supabase
        .from('member_bookmarks')
        .select('member_id')
        .eq('user_id', authStore.user.id)
        .order('created_at', { ascending: false })

      if (bookmarksError) throw bookmarksError

      if (!bookmarksData || bookmarksData.length === 0) {
        return []
      }

      // Depois buscar os perfis dos membros, excluindo o próprio usuário
      const memberIds = bookmarksData.map((b) => b.member_id).filter((id) => id !== authStore.user?.id)

      if (memberIds.length === 0) {
        return []
      }

      let profilesQuery = supabase
        .from('profiles')
        .select('*')
        .in('id', memberIds)

      // Excluir usuários de teste em produção (apenas mostrar em dev)
      if (!isLocalhost()) {
        profilesQuery = profilesQuery.eq('is_test_user', false)
      }

      const { data: profilesData, error: profilesError } = await profilesQuery

      if (profilesError) throw profilesError

      return profilesData || []
    } catch (err: any) {
      console.error('Error fetching bookmarked members:', err)
      error.value = err.message || 'Erro ao buscar membros em destaque'
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
    fetchBookmarkedMembers,
  }
}

