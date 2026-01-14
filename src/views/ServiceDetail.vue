<template>
  <AppLayout hideSidebars>
    <div v-if="loading" class="flex justify-center items-center min-h-[60vh]">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>

    <div v-else-if="!service" class="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <span class="material-symbols-outlined text-6xl text-slate-400">error</span>
      <h2 class="text-2xl font-bold text-slate-900 dark:text-white">{{ t('services.notFound') }}</h2>
      <p class="text-slate-600 dark:text-gray-400">{{ t('services.notFoundDesc') }}</p>
      <router-link to="/servicos">
        <Button variant="primary">{{ t('services.backToServices') }}</Button>
      </router-link>
    </div>

    <div v-else class="max-w-5xl mx-auto space-y-8">
      <!-- Header -->
      <div class="flex items-center gap-4">
        <router-link to="/servicos" class="hidden md:block p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors">
          <span class="material-symbols-outlined">arrow_back</span>
        </router-link>
        <div class="flex-1">
          <h1 class="text-3xl md:text-4xl font-black text-slate-900 dark:text-white">{{ service.nome }}</h1>
          <p class="text-slate-600 dark:text-gray-400 mt-1">{{ service.descricao }}</p>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Left Column - Service Details -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Service Image/Icon -->
          <div v-if="service.image_url" class="rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10">
            <img :src="service.image_url" :alt="service.nome" class="w-full h-64 object-cover" />
          </div>

          <!-- Description -->
          <div class="bg-white dark:bg-surface-card rounded-2xl border border-slate-200 dark:border-white/10 p-6">
            <h2 class="text-xl font-bold text-slate-900 dark:text-white mb-4">{{ t('services.about') }}</h2>
            <div class="prose dark:prose-invert max-w-none text-slate-600 dark:text-gray-300">
              {{ service.descricao }}
            </div>
          </div>

          <!-- Member Benefit -->
          <div v-if="service.beneficio_membro" class="bg-secondary/10 border border-secondary/20 rounded-2xl p-6">
            <div class="flex items-start gap-3">
              <span class="material-symbols-outlined text-secondary text-2xl">verified</span>
              <div>
                <h3 class="text-sm font-bold text-secondary uppercase mb-1">{{ t('services.memberBenefit') }}</h3>
                <p class="text-slate-600 dark:text-gray-300">{{ service.beneficio_membro }}</p>
              </div>
            </div>
          </div>

          <!-- Terms and Conditions -->
          <div v-if="service.terms_content_pt || service.terms_content_en" class="bg-white dark:bg-surface-card rounded-2xl border border-slate-200 dark:border-white/10 p-6">
            <h2 class="text-xl font-bold text-slate-900 dark:text-white mb-4">{{ t('services.terms') }}</h2>
            <div class="prose dark:prose-invert max-w-none text-sm text-slate-600 dark:text-gray-300 max-h-64 overflow-y-auto">
              {{ currentLocale === 'pt-BR' ? (service.terms_content_pt || service.terms_content_en) : (service.terms_content_en || service.terms_content_pt) }}
            </div>
          </div>
        </div>

        <!-- Right Column - Checkout Card -->
        <div class="lg:col-span-1">
          <div class="sticky top-24 bg-white dark:bg-surface-card rounded-2xl border border-slate-200 dark:border-white/10 p-6 space-y-6">
            <!-- Price -->
            <div class="text-center pb-6 border-b border-slate-200 dark:border-white/10">
              <div class="text-4xl font-black text-slate-900 dark:text-white mb-2">
                {{ formatPrice(service.preco, service.moeda) }}
              </div>
              <p class="text-sm text-slate-500 dark:text-gray-500">{{ t('services.oneTimePayment') }}</p>
            </div>

            <!-- Payment Method Selection (Only for internal services) -->
            <div v-if="!service.is_external" class="space-y-3">
              <label class="text-sm font-bold text-slate-700 dark:text-gray-300">{{ t('services.paymentMethod') }}</label>
              <div class="grid grid-cols-2 gap-3">
                <button
                  @click="paymentMethod = 'card'"
                  class="flex flex-col items-center gap-2 p-4 rounded-lg border transition-all"
                  :class="paymentMethod === 'card' 
                    ? 'border-primary bg-primary/10 text-slate-900 dark:text-white' 
                    : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/30 text-slate-600 dark:text-gray-400'"
                >
                  <span class="material-symbols-outlined text-2xl">credit_card</span>
                  <span class="text-sm font-bold">{{ t('services.card') }}</span>
                  <span class="text-[10px] text-slate-500 dark:text-gray-500">{{ t('services.debitOrCredit') }}</span>
                </button>
                <button
                  @click="paymentMethod = 'pix'"
                  class="flex flex-col items-center gap-2 p-4 rounded-lg border transition-all"
                  :class="paymentMethod === 'pix' 
                    ? 'border-secondary bg-secondary/10 text-slate-900 dark:text-white' 
                    : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/30 text-slate-600 dark:text-gray-400'"
                >
                  <span class="material-symbols-outlined text-2xl">qr_code_2</span>
                  <span class="text-sm font-bold">{{ t('services.pix') }}</span>
                  <span class="text-[10px] text-slate-500 dark:text-gray-500">{{ t('services.instantPayment') }}</span>
                </button>
              </div>
            </div>

            <!-- Price Breakdown (Internal Only) -->
            <div v-if="paymentMethod && !service.is_external" class="p-4 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-2">
              <div class="flex justify-between items-center text-sm">
                <span class="text-slate-500 dark:text-gray-400">{{ t('services.serviceValue') }}</span>
                <span class="text-slate-900 dark:text-white font-medium">{{ formatPrice(service.preco, service.moeda) }}</span>
              </div>
              
              <div class="flex justify-between items-center text-sm">
                <span class="text-slate-500 dark:text-gray-400">{{ t('services.stripeFee') }} ({{ paymentMethod === 'card' ? '3.9% + $0.30' : '~1.8%' }})</span>
                <span class="text-slate-900 dark:text-white font-medium">{{ formatPrice(calculateFee(service.preco, paymentMethod), paymentMethod === 'pix' ? 'BRL' : service.moeda) }}</span>
              </div>
              
              <div class="border-t border-slate-200 dark:border-white/10 pt-2 mt-2"></div>
              
              <div class="flex justify-between items-center">
                <span class="text-slate-700 dark:text-gray-300 font-bold">{{ t('services.totalToPay') }}</span>
                <span class="text-2xl font-bold text-slate-900 dark:text-white">
                  {{ formatPrice(calculateTotal(service.preco, paymentMethod), paymentMethod === 'pix' ? 'BRL' : service.moeda) }}
                </span>
              </div>
            </div>

            <!-- PIX Conversion Note -->
            <div v-if="paymentMethod === 'pix'" class="flex items-start gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <span class="material-symbols-outlined text-blue-400 text-base">info</span>
              <p class="text-xs text-blue-300">
                {{ t('services.pixConversion', { rate: exchangeRate.toFixed(2) }) }}
              </p>
            </div>

            <!-- Terms Acceptance -->
            <div v-if="service.terms_content_pt || service.terms_content_en" class="flex items-start gap-3 p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 cursor-pointer" @click="acceptedTerms = !acceptedTerms">
              <input
                v-model="acceptedTerms"
                type="checkbox"
                class="w-5 h-5 rounded border-2 border-slate-300 dark:border-white/20 text-primary focus:ring-primary bg-white dark:bg-surface-dark transition-all cursor-pointer mt-0.5"
                @click.stop
              />
              <p class="text-xs font-bold text-slate-700 dark:text-gray-300 leading-normal">
                {{ t('services.termsAgreement') }}
              </p>
            </div>

            <!-- Checkout Button or External Link -->
            <a
              v-if="service.is_external"
              :href="service.external_url"
              target="_blank"
              rel="noopener noreferrer"
              class="w-full py-4 rounded-xl flex items-center justify-center gap-2 font-bold text-lg transition-all shadow-lg hover:scale-[1.02] bg-gradient-to-r from-primary to-secondary text-black shadow-primary/25 hover:shadow-primary/40"
            >
              <span>{{ t('services.accessNow') }}</span>
              <span class="material-symbols-outlined">open_in_new</span>
            </a>

            <button
              v-else
              @click="handleCheckout"
              :disabled="submitting || !paymentMethod || ((service.terms_content_pt || service.terms_content_en) && !acceptedTerms)"
              class="w-full rounded-lg bg-gradient-to-r from-primary to-secondary py-3 text-sm font-bold text-black shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <template v-if="submitting">
                <span class="flex items-center justify-center gap-2">
                  <span class="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                  {{ t('services.processing') }}
                </span>
              </template>
              <template v-else>
                {{ t('services.pay') }} {{ paymentMethod ? formatPrice(calculateTotal(service.preco, paymentMethod), paymentMethod === 'pix' ? 'BRL' : service.moeda) : formatPrice(service.preco, service.moeda) }}
              </template>
            </button>

            <!-- Security Badge -->
            <p class="text-[10px] text-slate-500 dark:text-gray-500 text-center flex items-center justify-center gap-1">
              <span class="material-symbols-outlined text-[14px]">lock</span>
              {{ t('services.securePayment') }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useSupabase } from '@/composables/useSupabase'
import AppLayout from '@/components/layout/AppLayout.vue'
import Button from '@/components/ui/Button.vue'
import { toast } from 'vue-sonner'
import { fetchExchangeRate, calculatePixAmount } from '@/lib/exchange'

const route = useRoute()
const router = useRouter()
const { t, locale: currentLocale } = useI18n()
const { supabase } = useSupabase()

const service = ref<any>(null)
const loading = ref(true)
const submitting = ref(false)
const paymentMethod = ref<'card' | 'pix' | null>(null)
const exchangeRate = ref(5.90)
const acceptedTerms = ref(false)

// Taxas Stripe
const CARD_FEE_PERCENTAGE = 0.039 // 3.9%
const CARD_FEE_FIXED = 30 // $0.30 em centavos

function formatPrice(cents: number, currency: string = 'USD'): string {
  const amount = cents / 100
  if (currency === 'BRL') {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount)
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

function calculateFee(basePriceCents: number, method: 'card' | 'pix'): number {
  if (method === 'card') {
    return Math.round((basePriceCents * CARD_FEE_PERCENTAGE) + CARD_FEE_FIXED)
  } else {
    const usdAmount = basePriceCents / 100
    const grossAmountBRL = calculatePixAmount(usdAmount, exchangeRate.value)
    const baseAmountBRL = usdAmount * exchangeRate.value
    const feeAmountBRL = grossAmountBRL - baseAmountBRL
    return Math.round(feeAmountBRL * 100)
  }
}

function calculateTotal(basePriceCents: number, method: 'card' | 'pix'): number {
  if (method === 'card') {
    return basePriceCents + calculateFee(basePriceCents, method)
  } else {
    const usdAmount = basePriceCents / 100
    const grossAmountBRL = calculatePixAmount(usdAmount, exchangeRate.value)
    return Math.round(grossAmountBRL * 100)
  }
}

async function fetchService() {
  try {
    loading.value = true
    const serviceId = route.params.id

    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('id', serviceId)
      .single()

    if (error) throw error

    // Get the localized name and description
    const locale = currentLocale.value === 'pt-BR' ? 'pt' : 'en'
    service.value = {
      ...data,
      nome: data[`nome_${locale}`] || data.nome_pt || data.nome_en,
      descricao: data[`descricao_${locale}`] || data.descricao_pt || data.descricao_en,
      beneficio_membro: data[`beneficio_membro_${locale}`] || data.beneficio_membro_pt || data.beneficio_membro_en,
      moeda: data.currency || 'USD'
    }
  } catch (error) {
    console.error('Error fetching service:', error)
    toast.error('Error loading service')
  } finally {
    loading.value = false
  }
}

async function handleCheckout() {
  if (!service.value || !paymentMethod.value) return

  try {
    submitting.value = true
    
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      toast.error(t('services.mustBeLoggedInToContract'))
      router.push(`/login?redirect=/servicos/${service.value.id}`)
      return
    }

    const { data, error } = await supabase.functions.invoke('create-service-checkout', {
      body: {
        service_id: service.value.id,
        payment_method: paymentMethod.value,
        exchange_rate: exchangeRate.value,
        mensagem: '',
        accepted_terms: acceptedTerms.value
      }
    })

    if (error) throw error

    if (data?.checkout_url) {
      window.location.href = data.checkout_url
    } else {
      throw new Error('URL de checkout não retornada')
    }
  } catch (error: any) {
    console.error('Erro ao iniciar checkout:', error)
    toast.error(error.message || t('services.checkoutError'))
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  await fetchService()
  const rate = await fetchExchangeRate()
  exchangeRate.value = rate
})
</script>
