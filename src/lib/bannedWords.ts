import { supabase } from './supabase'
import type { BannedWord, BannedWordCheck } from '@/types/admin'

// Cache de palavras proibidas para performance
let bannedWordsCache: BannedWord[] | null = null
let cacheTimestamp: number = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

/**
 * Busca todas as palavras proibidas do banco (com cache)
 */
async function fetchBannedWords(): Promise<BannedWord[]> {
  const now = Date.now()
  
  // Retornar cache se ainda válido
  if (bannedWordsCache && (now - cacheTimestamp) < CACHE_DURATION) {
    return bannedWordsCache
  }

  try {
    const { data, error } = await supabase
      .from('banned_words')
      .select('*')
      .order('word', { ascending: true })

    if (error) {
      console.error('[BANNED_WORDS] Erro ao buscar palavras proibidas:', error)
      // Retornar cache antigo se houver erro
      return bannedWordsCache || []
    }

    // Atualizar cache
    bannedWordsCache = data || []
    cacheTimestamp = now
    
    return bannedWordsCache
  } catch (err) {
    console.error('[BANNED_WORDS] Erro ao buscar palavras proibidas:', err)
    return bannedWordsCache || []
  }
}

/**
 * Invalida o cache de palavras proibidas
 * Deve ser chamado quando admin adicionar/remover/atualizar palavras
 */
export function invalidateBannedWordsCache() {
  bannedWordsCache = null
  cacheTimestamp = 0
}

/**
 * Verifica se o conteúdo contém palavras proibidas
 * @param content - Texto a ser verificado
 * @returns Resultado da verificação com palavras encontradas e ação a tomar
 */
export async function checkBannedWords(content: string): Promise<BannedWordCheck> {
  if (!content || !content.trim()) {
    return {
      found: false,
      words: [],
      action: null,
    }
  }

  const bannedWords = await fetchBannedWords()
  
  if (bannedWords.length === 0) {
    return {
      found: false,
      words: [],
      action: null,
    }
  }

  const contentLower = content.toLowerCase()
  const foundWords: Array<{ word: string; category: string; action: string }> = []
  let sanitizedContent = content

  // Verificar cada palavra proibida
  for (const bannedWord of bannedWords) {
    const wordLower = bannedWord.word.toLowerCase()
    
    // Verificar se é uma frase completa (contém espaços) ou palavra única
    const isPhrase = bannedWord.word.includes(' ')
    
    let found = false
    
    if (isPhrase) {
      // Para frases, verificar match exato (case-insensitive)
      found = contentLower.includes(wordLower)
    } else {
      // Para palavras únicas, verificar se está contida no texto
      // Usar regex para encontrar palavra completa (não parte de outra palavra)
      const regex = new RegExp(`\\b${wordLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i')
      found = regex.test(content)
    }

    if (found) {
      foundWords.push({
        word: bannedWord.word,
        category: bannedWord.category,
        action: bannedWord.action,
      })

      // Se ação for 'replace', substituir por asteriscos
      if (bannedWord.action === 'replace') {
        const regex = new RegExp(bannedWord.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
        sanitizedContent = sanitizedContent.replace(regex, (match) => '*'.repeat(match.length))
      }
    }
  }

  if (foundWords.length === 0) {
    return {
      found: false,
      words: [],
      action: null,
    }
  }

  // Determinar ação mais severa (block > warn > replace)
  let action: 'block' | 'warn' | 'replace' | null = null
  
  if (foundWords.some(w => w.action === 'block')) {
    action = 'block'
  } else if (foundWords.some(w => w.action === 'warn')) {
    action = 'warn'
  } else if (foundWords.some(w => w.action === 'replace')) {
    action = 'replace'
  }

  return {
    found: true,
    words: foundWords,
    action,
    sanitizedContent: action === 'replace' ? sanitizedContent : undefined,
  }
}


