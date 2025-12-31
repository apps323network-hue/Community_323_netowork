/**
 * Parser for #hashtag in text
 */

import { extractPlainText } from './mentionParser'

/**
 * Extract all #hashtag from text
 * Returns array of hashtags (without #, lowercase)
 */
export function parseHashtags(text: string): string[] {
  if (!text) return []
  
  // Match #hashtag (alphanumeric, underscore, but not starting with number)
  const hashtagRegex = /#([a-zA-Z_][a-zA-Z0-9_]*)/g
  const matches = text.matchAll(hashtagRegex)
  const hashtags: string[] = []
  
  for (const match of matches) {
    if (match[1]) {
      hashtags.push(match[1].toLowerCase())
    }
  }
  
  return [...new Set(hashtags)] // Remove duplicates
}

/**
 * Format text with hashtags as clickable links
 * Returns HTML string with hashtags wrapped in <a> tags
 * Note: This function works with plain text or HTML (from formatMentions)
 * It always extracts plain text first to find hashtags, then formats them
 * If the input already has HTML (from formatMentions), it preserves that HTML
 */
export function formatHashtags(text: string, baseUrl: string = '/hashtag'): string {
  if (!text) return ''
  
  // Check if text contains HTML (from formatMentions or saved incorrectly)
  const hasHtml = /<[^>]+>/g.test(text)
  
  // Always extract plain text first to find hashtags
  const plainText = extractPlainText(text)
  
  // Find hashtags in plain text
  const hashtagRegex = /#([a-zA-Z_][a-zA-Z0-9_]*)/g
  const hashtagMatches = [...plainText.matchAll(hashtagRegex)]
  
  // If no hashtags found, return original text (with HTML if present)
  if (hashtagMatches.length === 0) {
    return hasHtml ? text : plainText
  }
  
  // Escape HTML to prevent XSS
  const escapeHtml = (str: string) => {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }
    return str.replace(/[&<>"']/g, (m) => map[m])
  }
  
  if (hasHtml) {
    // Text already has HTML (from formatMentions)
    // Replace hashtags in the HTML, but preserve existing links
    let result = text
    
    // Replace hashtags that are NOT inside existing <a> tags
    for (const match of hashtagMatches.reverse()) {
      const hashtag = match[1]
      const fullMatch = match[0]
      const hashtagLink = `<a href="${baseUrl}/${hashtag.toLowerCase()}" class="hashtag-link text-primary dark:text-secondary hover:underline font-medium" data-hashtag="${hashtag.toLowerCase()}">${fullMatch}</a>`
      
      // Replace hashtag, but only if it's not inside an <a> tag
      // Use negative lookahead/lookbehind to avoid replacing inside tags
      const regex = new RegExp(`(?<!<[^>]*>)${fullMatch.replace('#', '\\#')}(?![^<]*</a>)`, 'g')
      result = result.replace(regex, hashtagLink)
    }
    
    return result
  } else {
    // Plain text, format hashtags normally
    const parts: Array<{ type: 'text' | 'hashtag'; content: string }> = []
    let lastIndex = 0
    
    for (const match of hashtagMatches) {
      // Add text before hashtag
      if (match.index! > lastIndex) {
        parts.push({
          type: 'text',
          content: escapeHtml(plainText.substring(lastIndex, match.index!))
        })
      }
      
      // Add hashtag as link
      const hashtag = match[1]
      parts.push({
        type: 'hashtag',
        content: `<a href="${baseUrl}/${hashtag.toLowerCase()}" class="hashtag-link text-primary dark:text-secondary hover:underline font-medium" data-hashtag="${hashtag.toLowerCase()}">#${hashtag}</a>`
      })
      
      lastIndex = match.index! + match[0].length
    }
    
    // Add remaining text
    if (lastIndex < plainText.length) {
      parts.push({
        type: 'text',
        content: escapeHtml(plainText.substring(lastIndex))
      })
    }
    
    return parts.map(part => part.content).join('')
  }
}

/**
 * Check if text contains hashtags
 */
export function hasHashtags(text: string): boolean {
  if (!text) return false
  const hashtagRegex = /#([a-zA-Z_][a-zA-Z0-9_]*)/g
  return hashtagRegex.test(text)
}

