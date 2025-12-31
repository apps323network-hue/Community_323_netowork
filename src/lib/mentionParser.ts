/**
 * Parser for @username mentions in text
 */

/**
 * Extract plain text from content, removing any HTML tags or escaped HTML
 * This ensures we always work with plain text, even if HTML was saved incorrectly
 */
export function extractPlainText(text: string): string {
  if (!text) return ''
  
  // First, check if text contains HTML tags (raw or escaped)
  const hasRawHtml = /<[^>]+>/g.test(text)
  const hasEscapedHtml = /&lt;|&gt;|&amp;/g.test(text)
  
  // If no HTML detected, return as is (it's already plain text)
  if (!hasRawHtml && !hasEscapedHtml) {
    return text
  }
  
  // Create temporary DOM element to extract text
  const tempDiv = document.createElement('div')
  
  // Decode HTML entities first
  let decoded = text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
  
  // Insert into temporary DOM element to extract plain text
  // This will automatically remove all HTML tags and extract only text content
  tempDiv.innerHTML = decoded
  
  // Extract only plain text (this removes all HTML tags)
  const plainText = tempDiv.textContent || tempDiv.innerText || ''
  
  // Clean up any remaining whitespace issues
  const result = plainText.trim()
  
  // Debug log in development
  if (import.meta.env.DEV && hasRawHtml) {
    console.log('[extractPlainText] Input:', text.substring(0, 100))
    console.log('[extractPlainText] Output:', result.substring(0, 100))
  }
  
  return result
}

/**
 * Extract all @username mentions from text
 * Returns array of usernames (without @)
 */
export function parseMentions(text: string): string[] {
  if (!text) return []
  
  // First extract plain text to avoid matching mentions inside HTML tags
  const plainText = extractPlainText(text)
  
  // Match @username (alphanumeric, underscore, hyphen, but not starting with number)
  const mentionRegex = /@([a-zA-Z_][a-zA-Z0-9_-]*)/g
  const matches = plainText.matchAll(mentionRegex)
  const mentions: string[] = []
  
  for (const match of matches) {
    if (match[1]) {
      mentions.push(match[1])
    }
  }
  
  return [...new Set(mentions)] // Remove duplicates
}

/**
 * Format text with mentions as clickable links
 * Returns HTML string with mentions wrapped in <a> tags
 */
export function formatMentions(text: string, baseUrl: string = '/comunidade'): string {
  if (!text) return ''
  
  // Always extract plain text first - this removes any HTML that might have been saved incorrectly
  const plainText = extractPlainText(text)
  
  // Escape HTML to prevent XSS (only escape special characters, not the entire text)
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
  
  // Split text by mentions to preserve formatting
  const mentionRegex = /@([a-zA-Z_][a-zA-Z0-9_-]*)/g
  const parts: Array<{ type: 'text' | 'mention'; content: string }> = []
  let lastIndex = 0
  let match
  
  while ((match = mentionRegex.exec(plainText)) !== null) {
    // Add text before mention
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: escapeHtml(plainText.substring(lastIndex, match.index))
      })
    }
    
    // Add mention as link
    const username = match[1]
    parts.push({
      type: 'mention',
      content: `<a href="${baseUrl}/${username}" class="mention-link text-primary dark:text-secondary hover:underline font-medium" data-user="${username}">@${username}</a>`
    })
    
    lastIndex = mentionRegex.lastIndex
  }
  
  // Add remaining text
  if (lastIndex < plainText.length) {
    parts.push({
      type: 'text',
      content: escapeHtml(plainText.substring(lastIndex))
    })
  }
  
  // If no mentions found, just return escaped text
  if (parts.length === 0) {
    return escapeHtml(plainText)
  }
  
  // Combine all parts
  return parts.map(part => part.content).join('')
}

/**
 * Check if text contains mentions
 */
export function hasMentions(text: string): boolean {
  if (!text) return false
  const mentionRegex = /@([a-zA-Z_][a-zA-Z0-9_-]*)/g
  return mentionRegex.test(text)
}

