import { ref } from 'vue'
import ParcelowService from '../lib/parcelowService'
import type { ParcelowCheckoutData } from '../types/parcelow.types'

export function useParcelowCheckout() {
    const checkoutData = ref<ParcelowCheckoutData | null>(null)
    const showConfirmationModal = ref(false)
    const isCreatingCheckout = ref(false)
    const error = ref<string | null>(null)

    /**
     * Criar checkout Parcelow
     */
    const createCheckout = async (paymentId: string, currency: 'USD' | 'BRL' = 'USD') => {
        isCreatingCheckout.value = true
        error.value = null

        try {
            const response = await ParcelowService.createCheckout(paymentId, currency)

            checkoutData.value = {
                checkout_url: response.checkout_url,
                total_usd: response.total_usd,
                total_brl: response.total_brl,
                order_amount: response.order_amount,
                order_id: response.order_id
            }

            // Abrir modal de confirmação
            showConfirmationModal.value = true

        } catch (err: any) {
            error.value = err.message || 'Failed to create checkout'
            console.error('[useParcelowCheckout] Error:', err)
            throw err
        } finally {
            isCreatingCheckout.value = false
        }
    }

    /**
     * Confirmar e redirecionar para Parcelow
     */
    const confirmAndRedirect = () => {
        if (!checkoutData.value?.checkout_url) {
            error.value = 'No checkout URL available'
            return
        }

        // Redirecionar para página de checkout Parcelow
        window.location.href = checkoutData.value.checkout_url
    }

    /**
     * Cancelar checkout
     */
    const cancelCheckout = () => {
        showConfirmationModal.value = false
        checkoutData.value = null
    }

    /**
     * Limpar erro
     */
    const clearError = () => {
        error.value = null
    }

    return {
        // Estado
        checkoutData,
        showConfirmationModal,
        isCreatingCheckout,
        error,

        // Métodos
        createCheckout,
        confirmAndRedirect,
        cancelCheckout,
        clearError
    }
}
