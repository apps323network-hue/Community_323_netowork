import { useHead } from '@unhead/vue'
import { watch, onUnmounted } from 'vue'

export interface MetaOptions {
    title: string
    description: string
    image?: string
    url: string
    type?: 'website' | 'article' | 'event'
}

export function useDynamicMeta(options: MetaOptions) {
    const baseUrl = 'https://323network.com'
    const defaultImage = `${baseUrl}/favicon.png`

    const fullUrl = options.url.startsWith('http')
        ? options.url
        : `${baseUrl}${options.url.startsWith('/') ? options.url : `/${options.url}`}`

    const imageUrl = options.image || defaultImage
    const fullImageUrl = imageUrl.startsWith('http') ? imageUrl : `${baseUrl}${imageUrl}`

    useHead({
        title: options.title,
        meta: [
            // Primary Meta Tags
            { name: 'title', content: options.title },
            { name: 'description', content: options.description },

            // Open Graph / Facebook
            { property: 'og:type', content: options.type || 'website' },
            { property: 'og:url', content: fullUrl },
            { property: 'og:title', content: options.title },
            { property: 'og:description', content: options.description },
            { property: 'og:image', content: fullImageUrl },
            { property: 'og:image:width', content: '1200' },
            { property: 'og:image:height', content: '630' },

            // Twitter
            { property: 'twitter:card', content: 'summary_large_image' },
            { property: 'twitter:url', content: fullUrl },
            { property: 'twitter:title', content: options.title },
            { property: 'twitter:description', content: options.description },
            { property: 'twitter:image', content: fullImageUrl },

            // WhatsApp (uses Open Graph)
            { property: 'og:site_name', content: '323 Network' },
            { property: 'og:locale', content: 'pt_BR' },
        ],
    })
}
