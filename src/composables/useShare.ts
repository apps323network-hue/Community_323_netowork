import { ref } from 'vue'
import { toast } from 'vue-sonner'
import { useI18n } from 'vue-i18n'

export interface ShareOptions {
    url: string
    title: string
    description?: string
    imageUrl?: string
}

export function useShare() {
    const { t } = useI18n()
    const isSharing = ref(false)

    const getFullUrl = (path: string): string => {
        const baseUrl = window.location.origin
        return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`
    }

    const shareToWhatsApp = (options: ShareOptions) => {
        const fullUrl = getFullUrl(options.url)
        const text = `${options.title}\n\n${options.description || ''}\n\n${fullUrl}`
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`

        window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
    }

    const shareToInstagram = (options: ShareOptions) => {
        copyToClipboard(options)
        toast.info(t('share.instagramInstructions'), {
            description: t('share.instagramInstructionsDesc'),
            duration: 5000,
        })
    }

    const copyToClipboard = async (options: ShareOptions) => {
        const fullUrl = getFullUrl(options.url)

        try {
            await navigator.clipboard.writeText(fullUrl)
            toast.success(t('share.linkCopied'))
        } catch (err) {
            const textArea = document.createElement('textarea')
            textArea.value = fullUrl
            textArea.style.position = 'fixed'
            textArea.style.left = '-999999px'
            document.body.appendChild(textArea)
            textArea.select()

            try {
                document.execCommand('copy')
                toast.success(t('share.linkCopied'))
            } catch (e) {
                toast.error(t('share.copyFailed'))
            }

            document.body.removeChild(textArea)
        }
    }

    const shareNative = async (options: ShareOptions) => {
        const fullUrl = getFullUrl(options.url)

        if (!navigator.share) {
            await copyToClipboard(options)
            return
        }

        isSharing.value = true

        try {
            await navigator.share({
                title: options.title,
                text: options.description,
                url: fullUrl,
            })
        } catch (err: any) {
            if (err.name !== 'AbortError') {
                console.error('Error sharing:', err)
                toast.error(t('share.shareFailed'))
            }
        } finally {
            isSharing.value = false
        }
    }

    const canUseNativeShare = (): boolean => {
        return typeof navigator !== 'undefined' && !!navigator.share
    }

    return {
        isSharing,
        shareToWhatsApp,
        shareToInstagram,
        copyToClipboard,
        shareNative,
        canUseNativeShare,
    }
}
