import { ref } from 'vue'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth'
import { isLocalhost } from '@/utils/localhost'

export function useMentions() {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const authStore = useAuthStore()

  /**
   * Search users by name or email for autocomplete
   */
  async function searchUsers(query: string, limit: number = 10) {
    if (!query || query.length < 2) {
      return []
    }

    loading.value = true
    error.value = null

    try {
      let queryBuilder = supabase
        .from('profiles')
        .select('id, nome, email, avatar_url')
        .or(`nome.ilike.%${query}%,email.ilike.%${query}%`)
        .eq('status', 'active') // Only active users

      // Excluir usuários de teste em produção (apenas mostrar em dev)
      if (!isLocalhost()) {
        queryBuilder = queryBuilder.eq('is_test_user', false)
      }

      const { data, error: queryError } = await queryBuilder.limit(limit)

      if (queryError) throw queryError

      return data || []
    } catch (err: any) {
      error.value = err.message || 'Erro ao buscar usuários'
      console.error('Error searching users:', err)
      return []
    } finally {
      loading.value = false
    }
  }

  /**
   * Save mentions for a post or comment
   * mentionedUsernames can be either usernames (from parseMentions) or user IDs
   */
  async function saveMentions(
    postId: string | null,
    commentId: string | null,
    mentionedUsernames: string[]
  ): Promise<void> {
    if (!authStore.user) {
      throw new Error('Usuário não autenticado')
    }

    if (mentionedUsernames.length === 0) return

    loading.value = true
    error.value = null

    try {
      // First, find user IDs for the mentioned usernames
      // We'll search by nome (name) since we're using @username format
      // Use ilike for case-insensitive matching
      const mentionsPromises = mentionedUsernames.map(async (username) => {
        // Use the same search logic as searchUsers for consistency
        let mentionQuery = supabase
          .from('profiles')
          .select('id')
          .or(`nome.ilike.%${username}%,email.ilike.%${username}%`)
          .eq('status', 'active')

        // Excluir usuários de teste em produção (apenas mostrar em dev)
        if (!isLocalhost()) {
          mentionQuery = mentionQuery.eq('is_test_user', false)
        }

        const { data: userDataArray, error: userError } = await mentionQuery.limit(1)

        if (userError || !userDataArray || userDataArray.length === 0) {
          console.warn(`User not found for mention: @${username}`)
          return null
        }

        const userData = userDataArray[0]

        return {
          post_id: postId,
          comment_id: commentId,
          mentioned_user_id: userData.id,
          mentioned_by_user_id: authStore.user!.id,
        }
      })

      const mentions = (await Promise.all(mentionsPromises)).filter((m): m is NonNullable<typeof m> => m !== null)

      if (mentions.length === 0) {
        // No valid mentions found
        return
      }

      const { error: insertError } = await supabase
        .from('post_mentions')
        .insert(mentions)

      if (insertError) throw insertError
    } catch (err: any) {
      error.value = err.message || 'Erro ao salvar menções'
      console.error('Error saving mentions:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Get mentions for a post
   */
  async function getMentionsForPost(postId: string) {
    loading.value = true
    error.value = null

    try {
      const { data, error: queryError } = await supabase
        .from('post_mentions')
        .select('*, mentioned_user:profiles!post_mentions_mentioned_user_id_fkey(id, nome, avatar_url)')
        .eq('post_id', postId)

      if (queryError) throw queryError

      return data || []
    } catch (err: any) {
      error.value = err.message || 'Erro ao buscar menções'
      console.error('Error fetching mentions:', err)
      return []
    } finally {
      loading.value = false
    }
  }

  /**
   * Get mentions for a comment
   */
  async function getMentionsForComment(commentId: string) {
    loading.value = true
    error.value = null

    try {
      const { data, error: queryError } = await supabase
        .from('post_mentions')
        .select('*, mentioned_user:profiles!post_mentions_mentioned_user_id_fkey(id, nome, avatar_url)')
        .eq('comment_id', commentId)

      if (queryError) throw queryError

      return data || []
    } catch (err: any) {
      error.value = err.message || 'Erro ao buscar menções'
      console.error('Error fetching mentions:', err)
      return []
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    searchUsers,
    saveMentions,
    getMentionsForPost,
    getMentionsForComment,
  }
}

