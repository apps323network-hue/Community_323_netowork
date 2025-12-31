import { defineStore } from 'pinia'
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { supabase } from '@/lib/supabase'
import { invalidateBannedWordsCache } from '@/lib/bannedWords'
import { logAdminAction } from '@/lib/auditLog'
import { useAdminBaseStore } from './base'
import type { BannedWord, BannedWordStats } from '@/types/admin'

export const useAdminBannedWordsStore = defineStore('admin-banned-words', () => {
  const baseStore = useAdminBaseStore()
  const { loading, error } = storeToRefs(baseStore)
  const authStore = baseStore.authStore

  const bannedWords = ref<BannedWord[]>([])
  const bannedWordStats = ref<BannedWordStats>({
    total: 0,
    byCategory: {},
    byAction: {},
  })

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

  return {
    bannedWords,
    bannedWordStats,
    fetchBannedWords,
    createBannedWord,
    updateBannedWord,
    deleteBannedWord,
  }
})

