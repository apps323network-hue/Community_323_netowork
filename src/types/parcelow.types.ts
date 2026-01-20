export interface ParcelowCheckoutRequest {
    payment_id: string
    currency: 'USD' | 'BRL'
}

export interface ParcelowCheckoutResponse {
    success: boolean
    checkout_url: string
    order_id: number
    total_usd: number // em centavos
    total_brl: number // em centavos
    order_amount: number // em centavos
    status?: string
    error?: string
}

export interface ParcelowCheckoutData {
    checkout_url: string
    total_usd: number
    total_brl: number
    order_amount: number
    order_id: number
}
