/**
 * Utility functions for sharing posts
 */

/**
 * Generate a shareable URL for a post
 */
export function getPostShareUrl(postId: string): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  return `${origin}/feed/${postId}`
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      const successful = document.execCommand('copy')
      document.body.removeChild(textArea)
      return successful
    }
  } catch (err) {
    console.error('Error copying to clipboard:', err)
    return false
  }
}

/**
 * Generate WhatsApp share URL
 */
export function getWhatsAppShareUrl(text: string, url: string): string {
  const message = encodeURIComponent(`${text}\n\n${url}`)
  return `https://wa.me/?text=${message}`
}

/**
 * Generate LinkedIn share URL
 */
export function getLinkedInShareUrl(url: string): string {
  return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
}

/**
 * Generate Email share URL (mailto)
 */
export function getEmailShareUrl(subject: string, body: string): string {
  const encodedSubject = encodeURIComponent(subject)
  const encodedBody = encodeURIComponent(body)
  return `mailto:?subject=${encodedSubject}&body=${encodedBody}`
}

