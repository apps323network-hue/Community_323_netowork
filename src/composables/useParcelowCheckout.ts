import { ref } from 'vue'
import ParcelowService from '../lib/parcelowService'

export function useParcelowCheckout() {
    const isCreatingCheckout = ref(false)
    const error = ref<string | null>(null)

    /**
     * Criar checkout Parcelow e redirecionar diretamente
     */
    const createCheckout = async (paymentId: string, currency: 'USD' | 'BRL' = 'USD') => {
        isCreatingCheckout.value = true
        error.value = null

        try {
            const response = await ParcelowService.createCheckout(paymentId, currency)

            // Redirecionar diretamente para o checkout Parcelow
            if (response.checkout_url) {
                window.location.href = response.checkout_url
            } else {
                throw new Error('No checkout URL returned from Parcelow')
            }

        } catch (err: any) {
            error.value = err.message || 'Failed to create checkout'
            console.error('[useParcelowCheckout] Error:', err)
            throw err
        } finally {
            isCreatingCheckout.value = false
        }
    }

    /**
     * Limpar erro
     */
    const clearError = () => {
        error.value = null
    }

    return {
        // Estado
        isCreatingCheckout,
        error,

        // Métodos
        createCheckout,
        clearError
    }
}
