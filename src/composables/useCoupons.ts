import { ref } from 'vue'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth'

export interface Coupon {
    id: string
    code: string
    description?: string
    discount_type: 'percentage' | 'fixed'
    discount_value: number
    max_uses?: number
    current_uses: number
    scope_type: 'all' | 'specific_programs' | 'category'
    applicable_programs?: string[]
    applicable_category?: string
    valid_from?: string
    valid_until?: string
    is_active: boolean
    created_at: string
}

export interface CouponValidationResult {
    valid: boolean
    coupon?: Coupon
    discount?: number
    error?: string
}

export function useCoupons() {
    const authStore = useAuthStore()
    const loading = ref(false)

    /**
     * Validate a coupon code for a specific program
     */
    async function validateCoupon(
        code: string,
        programId: string
    ): Promise<CouponValidationResult> {
        loading.value = true

        try {
            // Fetch coupon by code
            const { data: coupon, error: fetchError } = await supabase
                .from('coupons')
                .select('*')
                .eq('code', code.toUpperCase())
                .single()

            if (fetchError || !coupon) {
                return { valid: false, error: 'invalid' }
            }

            // Check if active
            if (!coupon.is_active) {
                return { valid: false, error: 'invalid' }
            }

            // Check validity dates
            const now = new Date()
            if (coupon.valid_from && new Date(coupon.valid_from) > now) {
                return { valid: false, error: 'notYetValid' }
            }
            if (coupon.valid_until && new Date(coupon.valid_until) < now) {
                return { valid: false, error: 'expired' }
            }

            // Check max uses
            if (coupon.max_uses && coupon.current_uses >= coupon.max_uses) {
                return { valid: false, error: 'maxUsesReached' }
            }

            // Check scope applicability
            if (coupon.scope_type === 'specific_programs') {
                if (!coupon.applicable_programs || !coupon.applicable_programs.includes(programId)) {
                    return { valid: false, error: 'notApplicable' }
                }
            } else if (coupon.scope_type === 'category') {
                // Fetch program category
                const { data: program } = await supabase
                    .from('programs')
                    .select('category')
                    .eq('id', programId)
                    .single()

                if (!program || program.category !== coupon.applicable_category) {
                    return { valid: false, error: 'notApplicable' }
                }
            }

            return { valid: true, coupon }
        } catch (error) {
            console.error('Error validating coupon:', error)
            return { valid: false, error: 'invalid' }
        } finally {
            loading.value = false
        }
    }

    /**
     * Calculate discount amount based on coupon and original price
     */
    function calculateDiscount(coupon: Coupon, originalPrice: number): number {
        if (coupon.discount_type === 'percentage') {
            return (originalPrice * coupon.discount_value) / 100
        } else {
            // Fixed amount is stored in dollars in DB, but originalPrice is in cents.
            // We return the discount in cents to match originalPrice.
            return Math.min(Number(coupon.discount_value) * 100, originalPrice)
        }
    }

    /**
     * Apply coupon and return final price with discount
     */
    async function applyCoupon(
        code: string,
        programId: string,
        originalPrice: number
    ): Promise<CouponValidationResult & { finalPrice?: number }> {
        const validation = await validateCoupon(code, programId)

        if (!validation.valid || !validation.coupon) {
            return validation
        }

        const discount = calculateDiscount(validation.coupon, originalPrice)
        const finalPrice = originalPrice - discount

        return {
            ...validation,
            discount,
            finalPrice
        }
    }

    /**
     * Record coupon usage after successful payment
     */
    async function recordCouponUse(
        couponId: string,
        programId: string,
        discountApplied: number
    ): Promise<{ success: boolean; error?: string }> {
        if (!authStore.user) {
            return { success: false, error: 'Not authenticated' }
        }

        try {
            // Insert coupon use
            const { error: insertError } = await supabase.from('coupon_uses').insert({
                coupon_id: couponId,
                user_id: authStore.user.id,
                program_id: programId,
                discount_applied: discountApplied / 100 // Convert cents back to dollars for DB
            })

            if (insertError) throw insertError

            // Increment current_uses on coupon
            const { error: updateError } = await supabase.rpc('increment_coupon_uses', {
                coupon_id: couponId
            })

            if (updateError) {
                console.error('Error incrementing coupon uses:', updateError)
                // Not critical - continue anyway
            }

            return { success: true }
        } catch (error: any) {
            console.error('Error recording coupon use:', error)
            return { success: false, error: error.message }
        }
    }

    return {
        loading,
        validateCoupon,
        calculateDiscount,
        applyCoupon,
        recordCouponUse
    }
}
