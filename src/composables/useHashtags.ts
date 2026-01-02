import { ref } from 'vue'
import { supabase } from '@/lib/supabase'
import { parseHashtags } from '@/lib/hashtagParser'

export function useHashtags() {
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Save hashtags for a post or comment
   */
  async function saveHashtags(
    postId: string | null,
    commentId: string | null,
    text: string
  ): Promise<void> {
    if (!text) return

    loading.value = true
    error.value = null

    try {
      const hashtags = parseHashtags(text)
      
      if (hashtags.length === 0) return

      // Create hashtag records (lowercase)
      const hashtagRecords = hashtags.map((hashtag) => ({
        post_id: postId,
        comment_id: commentId,
        hashtag: hashtag.toLowerCase(),
      }))

      // Insert hashtags (unique index will prevent duplicates)
      const { error: insertError } = await supabase
        .from('post_hashtags')
        .insert(hashtagRecords)

      if (insertError) throw insertError
    } catch (err: any) {
      error.value = err.message || 'Erro ao salvar hashtags'
      console.error('Error saving hashtags:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Get hashtags for a post
   */
  async function getHashtagsForPost(postId: string) {
    loading.value = true
    error.value = null

    try {
      const { data, error: queryError } = await supabase
        .from('post_hashtags')
        .select('hashtag, created_at')
        .eq('post_id', postId)
        .order('created_at', { ascending: false })

      if (queryError) throw queryError

      return data?.map((h) => h.hashtag) || []
    } catch (err: any) {
      error.value = err.message || 'Erro ao buscar hashtags'
      console.error('Error fetching hashtags:', err)
      return []
    } finally {
      loading.value = false
    }
  }

  /**
   * Search posts by hashtag
   */
  async function searchPostsByHashtag(hashtag: string) {
    loading.value = true
    error.value = null

    try {
      const normalizedHashtag = hashtag.toLowerCase().replace('#', '')

      const { data, error: queryError } = await supabase
        .from('post_hashtags')
        .select('post_id')
        .eq('hashtag', normalizedHashtag)
        .not('post_id', 'is', null)

      if (queryError) throw queryError

      const postIds = data?.map((h) => h.post_id).filter((id): id is string => id !== null) || []

      if (postIds.length === 0) {
        return []
      }

      // Fetch posts
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .in('id', postIds)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })

      if (postsError) throw postsError

      return postsData || []
    } catch (err: any) {
      error.value = err.message || 'Erro ao buscar posts por hashtag'
      console.error('Error searching posts by hashtag:', err)
      return []
    } finally {
      loading.value = false
    }
  }

  /**
   * Get popular hashtags
   */
  async function getPopularHashtags(limit: number = 10) {
    loading.value = true
    error.value = null

    try {
      const { data, error: queryError } = await supabase
        .from('post_hashtags')
        .select('hashtag')
        .not('post_id', 'is', null)

      if (queryError) throw queryError

      // Count occurrences
      const hashtagCounts = new Map<string, number>()
      data?.forEach((h) => {
        const count = hashtagCounts.get(h.hashtag) || 0
        hashtagCounts.set(h.hashtag, count + 1)
      })

      // Sort by count and return top N
      return Array.from(hashtagCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([hashtag]) => hashtag)
    } catch (err: any) {
      error.value = err.message || 'Erro ao buscar hashtags populares'
      console.error('Error fetching popular hashtags:', err)
      return []
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    saveHashtags,
    getHashtagsForPost,
    searchPostsByHashtag,
    getPopularHashtags,
  }
}

