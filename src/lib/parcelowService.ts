import { supabase } from './supabase'
import type { ParcelowCheckoutRequest, ParcelowCheckoutResponse } from '../types/parcelow.types'

class ParcelowService {
    /**
     * Criar checkout Parcelow
     */
    static async createCheckout(
        paymentId: string,
        currency: 'USD' | 'BRL' = 'USD'
    ): Promise<ParcelowCheckoutResponse> {
        const { data, error } = await supabase.functions.invoke('create-parcelow-checkout', {
            body: { payment_id: paymentId, currency } as ParcelowCheckoutRequest
        })

        if (error) {
            throw new Error(error.message || 'Failed to create Parcelow checkout')
        }

        if (!data.success) {
            throw new Error(data.error || 'Parcelow checkout creation failed')
        }

        return data
    }

    /**
     * Formatar valor de centavos para dólares/reais
     */
    static formatAmount(cents: number): string {
        return (cents / 100).toFixed(2)
    }

    /**
     * Calcular taxas da Parcelow
     */
    static calculateFees(totalCents: number, baseCents: number): number {
        return totalCents - baseCents
    }

    /**
     * Formatar CPF (adicionar pontuação)
     */
    static formatCPF(cpf: string): string {
        const cleaned = cpf.replace(/\D/g, '')

        if (cleaned.length !== 11) {
            return cpf
        }

        return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
    }

    /**
     * Validar CPF
     */
    static validateCPF(cpf: string): boolean {
        const cleaned = cpf.replace(/\D/g, '')
        return cleaned.length === 11
    }
}

export default ParcelowService
