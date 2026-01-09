import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from './auth'

export interface Subscription {
  id: string
  user_id: string
  stripe_subscription_id: string | null
  stripe_customer_id: string | null
  status: 'pending' | 'active' | 'canceled' | 'past_due' | 'paused'
  plan_type: string
  price_cents: number
  currency: string
  current_period_start: string | null
  current_period_end: string | null
  cancel_at_period_end: boolean
  created_at: string
  updated_at: string
}

export interface SubscriptionPrice {
  id: string
  plan_type: string
  price_cents: number
  currency: string
  stripe_price_id: string | null
  active: boolean
}

export const useSubscriptionsStore = defineStore('subscriptions', () => {
  const authStore = useAuthStore()
  
  const subscription = ref<Subscription | null>(null)
  const price = ref<SubscriptionPrice | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const hasActiveSubscription = computed(() => {
    return subscription.value?.status === 'active'
  })

  const canPublishServices = computed(() => {
    return hasActiveSubscription.value
  })

  const formattedPrice = computed(() => {
    if (!price.value) return '$10.00'
    const amount = price.value.price_cents / 100
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: price.value.currency
    }).format(amount)
  })

  const subscriptionEndDate = computed(() => {
    if (!subscription.value?.current_period_end) return null
    return new Date(subscription.value.current_period_end)
  })

  // Actions
  async function fetchSubscription() {
    if (!authStore.user) return

    loading.value = true
    error.value = null

    try {
      const { data, error: queryError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', authStore.user.id)
        .eq('plan_type', 'service_publisher')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (queryError) throw queryError
      subscription.value = data
    } catch (err: any) {
      console.error('Error fetching subscription:', err)
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  async function fetchPrice() {
    try {
      const { data, error: queryError } = await supabase
        .from('subscription_prices')
        .select('*')
        .eq('plan_type', 'service_publisher')
        .eq('active', true)
        .single()

      if (queryError) throw queryError
      price.value = data
    } catch (err: any) {
      console.error('Error fetching price:', err)
      // Use default price
      price.value = {
        id: 'default',
        plan_type: 'service_publisher',
        price_cents: 1000,
        currency: 'USD',
        stripe_price_id: null,
        active: true
      }
    }
  }

  async function createCheckout(): Promise<string | null> {
    if (!authStore.user) {
      error.value = 'Você precisa estar logado'
      return null
    }

    loading.value = true
    error.value = null

    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        throw new Error('Sessão não encontrada')
      }

      const { data, error: invokeError } = await supabase.functions.invoke(
        'create-subscription-checkout',
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`
          }
        }
      )

      if (invokeError) throw invokeError
      if (data?.error) throw new Error(data.error)

      return data?.checkout_url || null
    } catch (err: any) {
      console.error('Error creating checkout:', err)
      error.value = err.message
      return null
    } finally {
      loading.value = false
    }
  }

  async function verifySubscriptionStatus(sessionId: string): Promise<boolean> {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return false

      const { data, error: invokeError } = await supabase.functions.invoke(
        'check-payment-status',
        {
          body: { session_id: sessionId },
          headers: {
            Authorization: `Bearer ${session.access_token}`
          }
        }
      )

      if (invokeError) throw invokeError
      
      // Se o status for completed, atualiza localmente
      if (data?.status === 'completed') {
        await fetchSubscription()
        return true
      }

      return false
    } catch (err) {
      console.error('Error verifying subscription status:', err)
      return false
    }
  }

  async function init() {
    await Promise.all([
      fetchSubscription(),
      fetchPrice()
    ])
  }

  return {
    // State
    subscription,
    price,
    loading,
    error,
    // Computed
    hasActiveSubscription,
    canPublishServices,
    formattedPrice,
    subscriptionEndDate,
    // Actions
    fetchSubscription,
    fetchPrice,
    createCheckout,
    verifySubscriptionStatus,
    init
  }
})
