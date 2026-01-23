import { useHead } from '@unhead/vue'
import { computed } from 'vue'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from '@vueuse/core'

export interface MetaOptions {
    title: string
    description: string
    keywords?: string
    image?: string
    url: string
    type?: 'website' | 'article' | 'event' | 'profile'
}

export function useDynamicMeta(options: MaybeRefOrGetter<MetaOptions>) {
    const baseUrl = import.meta.env.VITE_SITE_URL || 'https://323network.com'
    const siteName = '323 Network'
    const defaultImage = `${baseUrl}/logo.png`

    const seo = computed(() => {
        const opts = toValue(options)

        const title = opts.title.includes(siteName)
            ? opts.title
            : `${opts.title} | ${siteName}`

        const description = opts.description || 'Comunidade 323 Network - Conectando brasileiros nos EUA para networking e negócios.'
        const keywords = opts.keywords || '323 network, brasileiros nos eua, networking eua, negócios estados unidos, comunidade brasileira'

        const fullUrl = opts.url.startsWith('http')
            ? opts.url
            : `${baseUrl}${opts.url.startsWith('/') ? opts.url : `/${opts.url}`}`

        const imageUrl = opts.image || defaultImage
        const fullImageUrl = imageUrl.startsWith('http') ? imageUrl : `${baseUrl}${imageUrl}`

        return {
            title,
            description,
            keywords,
            url: fullUrl,
            image: fullImageUrl,
            type: opts.type || 'website'
        }
    })

    useHead({
        title: () => seo.value.title,
        meta: [
            // Primary Meta Tags
            { name: 'description', content: () => seo.value.description },
            { name: 'keywords', content: () => seo.value.keywords },

            // Open Graph / Facebook
            { property: 'og:type', content: () => seo.value.type },
            { property: 'og:url', content: () => seo.value.url },
            { property: 'og:title', content: () => seo.value.title },
            { property: 'og:description', content: () => seo.value.description },
            { property: 'og:image', content: () => seo.value.image },
            { property: 'og:image:width', content: '1200' },
            { property: 'og:image:height', content: '630' },
            { property: 'og:site_name', content: siteName },

            // Twitter
            { name: 'twitter:card', content: 'summary_large_image' },
            { name: 'twitter:url', content: () => seo.value.url },
            { name: 'twitter:title', content: () => seo.value.title },
            { name: 'twitter:description', content: () => seo.value.description },
            { name: 'twitter:image', content: () => seo.value.image },

            // WhatsApp / Mobile
            { property: 'og:locale', content: 'pt_BR' },
        ],
        link: [
            { rel: 'canonical', href: () => seo.value.url }
        ]
    })
}
