<template>
  <AppLayout hideSidebars>
    <!-- Loading State -->
    <div v-if="loading" class="flex flex-col justify-center items-center min-h-[60vh] gap-4">
      <div class="relative w-16 h-16">
        <div class="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
        <div class="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
      <p class="text-slate-400 font-bold uppercase tracking-widest text-xs animate-pulse">Loading service...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="!service" class="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div class="inline-flex w-24 h-24 items-center justify-center bg-slate-200 dark:bg-white/10 rounded-[32px] mb-4">
         <span class="text-5xl">🔭</span>
      </div>
      <h2 class="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">{{ t('services.notFound') }}</h2>
      <p class="text-slate-600 dark:text-gray-400 max-w-md text-center">{{ t('services.notFoundDesc') }}</p>
      <router-link to="/servicos">
        <Button variant="primary">{{ t('services.backToServices') }}</Button>
        <Button variant="primary" class="mt-4">Back to Services</Button>
      </router-link>
    </div>

    <!-- Service Content -->
    <div v-else class="max-w-7xl mx-auto px-4 py-8">
      <!-- Hero Section (Banner style like ProgramDetail) -->
      <div class="relative w-full h-[350px] md:h-[450px] rounded-[32px] overflow-hidden shadow-2xl mb-12">
        <!-- Background Image -->
        <div class="absolute inset-0">
          <img
            v-if="service.image_url"
            :src="service.image_url"
            :alt="service.nome"
            class="w-full h-full object-cover"
          />
          <div v-else class="w-full h-full bg-gradient-to-br from-slate-900 via-primary/20 to-secondary/20"></div>
          
          <!-- Overlays -->
          <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
          <div class="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent hidden md:block"></div>
        </div>

        <!-- Hero Content -->
        <div class="absolute inset-0 flex flex-col justify-end p-6 md:p-12">
          <div class="max-w-3xl space-y-4 md:space-y-6">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-black uppercase tracking-widest w-fit">
              <span class="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
              {{ service.categoria?.replace('_', ' ') || 'Service' }}
            </div>

            <h1 class="text-3xl md:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight">
              {{ service.nome }}
            </h1>

            <div class="flex flex-wrap items-center gap-4 md:gap-6 text-white/90">
              <div v-if="service.creator" class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-secondary p-0.5 shadow-lg">
                  <div class="w-full h-full rounded-full bg-slate-900 flex items-center justify-center font-bold text-[10px] text-white uppercase">
                    <img v-if="service.creator.avatar_url" :src="service.creator.avatar_url" class="w-full h-full rounded-full object-cover" />
                    <span v-else>{{ service.creator.name.substring(0, 2) }}</span>
                  </div>
                </div>
                <div>
                  <p class="text-[8px] font-bold uppercase tracking-wider text-white/50 leading-none mb-1">Provider</p>
                  <p class="font-bold text-xs md:text-base text-white">{{ service.creator.name }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="relative z-10 pb-20">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <!-- Main Content (Left Column) -->
          <div class="lg:col-span-8 space-y-8">
            <!-- About Section -->
            <section class="bg-white dark:bg-surface-dark rounded-3xl p-6 md:p-8 shadow-xl border border-slate-200 dark:border-white/5">
              <div class="flex items-center gap-3 mb-6">
                <div class="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  <span class="material-symbols-outlined text-lg md:text-2xl">description</span>
                </div>
                <h2 class="text-xl md:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  About this service
                </h2>
              </div>
              <div class="text-slate-700 dark:text-gray-300 whitespace-pre-line leading-relaxed text-base md:text-lg">
                {{ service.descricao }}
              </div>
            </section>

            <!-- Member Benefit Section -->
            <section v-if="service.beneficio_membro" class="bg-gradient-to-br from-secondary/10 to-primary/5 border border-secondary/20 rounded-3xl p-6 md:p-8 shadow-lg">
              <div class="flex items-start gap-4">
                <div class="w-12 h-12 rounded-2xl bg-secondary/20 flex items-center justify-center text-secondary shrink-0">
                  <span class="material-symbols-outlined text-2xl">verified</span>
                </div>
                <div>
                  <h3 class="text-sm font-black text-secondary uppercase tracking-widest mb-2">{{ t('services.memberBenefit') }}</h3>
                  <p class="text-slate-700 dark:text-gray-200 text-lg leading-relaxed font-medium">
                    {{ service.beneficio_membro }}
                  </p>
                </div>
              </div>
            </section>

            <!-- Provider Info Section (Mirroring ProgramDetail) -->
            <section v-if="service.creator" class="bg-gradient-to-br from-slate-900 to-black rounded-3xl p-8 shadow-2xl border border-white/5 relative overflow-hidden group">
               <div class="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                  <span class="material-symbols-outlined text-9xl">person</span>
               </div>
               
               <div class="relative flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
                  <div class="w-32 h-32 rounded-3xl bg-gradient-to-tr from-primary to-secondary p-1 rotate-3 group-hover:rotate-6 transition-transform shadow-2xl overflow-hidden shrink-0">
                     <div class="w-full h-full rounded-[20px] bg-slate-900 flex items-center justify-center overflow-hidden text-3xl font-black text-white">
                        <img v-if="service.creator.avatar_url" :src="service.creator.avatar_url" class="w-full h-full object-cover" />
                        <span v-else>{{ service.creator.name.substring(0, 2).toUpperCase() }}</span>
                     </div>
                  </div>
                  
                  <div class="space-y-4 max-w-xl">
                     <div>
                        <p class="text-xs font-bold text-primary uppercase tracking-widest mb-1">Service Provider</p>
                        <h3 class="text-3xl font-black text-white tracking-tight">{{ service.creator.name }}</h3>
                     </div>
                     <p v-if="service.creator.bio" class="text-slate-400 leading-relaxed italic">
                        "{{ service.creator.bio }}"
                     </p>
                     <div class="flex gap-4 justify-center md:justify-start">
                        <div class="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-bold flex items-center gap-2">
                           <span class="material-symbols-outlined text-sm">verified</span>
                           Verified Specialist
                        </div>
                     </div>
                  </div>
               </div>
            </section>
          </div>

          <!-- Checkout Sidebar (Right Column) -->
          <div class="lg:col-span-4 lg:sticky lg:top-24 h-fit space-y-6">
            <div class="bg-white dark:bg-surface-dark rounded-[32px] p-8 shadow-2xl border border-slate-200 dark:border-white/5 overflow-hidden relative group">
              <!-- Decorative background -->
              <div class="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-colors"></div>

              <div class="relative space-y-8">
                <!-- Price Header -->
                <div class="text-center space-y-2">
                  <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                    {{ t('programs.bestOffer') || 'One-time Payment' }}
                  </div>
                  <div class="flex justify-center items-baseline gap-1">
                    <span class="text-2xl font-black text-slate-900 dark:text-white leading-none">
                      {{ service.moeda === 'BRL' ? 'R$' : '$' }}
                    </span>
                    <span class="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-slate-900 via-primary to-secondary dark:from-white leading-none tracking-tighter">
                      {{ (service.preco / 100).toFixed(2) }}
                    </span>
                  </div>
                  <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Full Access</p>
                </div>

                <!-- Payment Method Selection -->
                <div class="space-y-4">
                  <label class="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-gray-400">{{ t('services.paymentMethod') }}</label>
                  <div class="grid grid-cols-2 gap-3">
                    <button
                      @click="paymentMethod = 'card'"
                      class="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all group"
                      :class="paymentMethod === 'card' 
                        ? 'border-primary bg-primary/10 text-slate-900 dark:text-white shadow-lg shadow-primary/10' 
                        : 'border-slate-100 dark:border-white/5 hover:border-primary/30 text-slate-500 dark:text-gray-400'"
                    >
                      <span class="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform">credit_card</span>
                      <span class="text-[10px] font-black uppercase tracking-tight">{{ t('services.card') }}</span>
                    </button>
                    <button
                      @click="paymentMethod = 'pix'"
                      class="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all group"
                      :class="paymentMethod === 'pix' 
                        ? 'border-secondary bg-secondary/10 text-slate-900 dark:text-white shadow-lg shadow-secondary/10' 
                        : 'border-slate-100 dark:border-white/5 hover:border-secondary/30 text-slate-500 dark:text-gray-400'"
                    >
                      <span class="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform">qr_code_2</span>
                      <span class="text-[10px] font-black uppercase tracking-tight">{{ t('services.pix') }}</span>
                    </button>
                  </div>
                </div>

                <!-- Price Breakdown -->
                <div v-if="paymentMethod" class="p-5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-4">
                  <div class="flex justify-between items-center text-xs">
                    <span class="text-slate-500 dark:text-gray-400">Base Price</span>
                    <span class="text-slate-900 dark:text-white font-bold">{{ formatPrice(service.preco, service.moeda) }}</span>
                  </div>
                  
                  <div class="flex justify-between items-center text-xs">
                    <span class="text-slate-500 dark:text-gray-400">Processing Fees</span>
                    <span class="text-slate-900 dark:text-white font-bold">
                      {{ formatPrice(calculateFee(service.preco, paymentMethod), paymentMethod === 'pix' ? 'BRL' : service.moeda) }}
                    </span>
                  </div>
                  
                  <div class="border-t border-dashed border-slate-300 dark:border-white/10 pt-4">
                    <div class="flex justify-between items-center">
                      <span class="text-slate-900 dark:text-white font-black uppercase text-[10px] tracking-widest">Total Total</span>
                      <span class="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                        {{ formatPrice(calculateTotal(service.preco, paymentMethod), paymentMethod === 'pix' ? 'BRL' : service.moeda) }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Terms Acceptance (Login style/ProgramDetail style) -->
                <div v-if="service.terms_content_pt || service.terms_content_en" class="space-y-3">
                  <div class="flex items-start gap-3 p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 group cursor-pointer" @click="acceptedTerms = !acceptedTerms">
                    <div class="flex items-center justify-center pt-0.5">
                      <input
                        v-model="acceptedTerms"
                        type="checkbox"
                        class="w-5 h-5 rounded border-2 border-slate-300 dark:border-white/20 text-primary focus:ring-primary bg-white dark:bg-surface-dark transition-all cursor-pointer"
                        @click.stop
                      />
                    </div>
                    <div class="flex-1">
                      <p class="text-[10px] font-bold text-slate-700 dark:text-gray-300 leading-normal">
                        I have read and agree to the <button type="button" @click.stop="showTermsModal = true" class="text-primary hover:underline decoration-2 underline-offset-2">Terms and Conditions</button> specific to this service.
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Checkout Button -->
                <button
                  @click="handleCheckout"
                  :disabled="submitting || !paymentMethod || ((service.terms_content_pt || service.terms_content_en) && !acceptedTerms)"
                  class="w-full relative group py-5 px-6 rounded-2xl font-black text-black overflow-hidden transition-all duration-300 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed shadow-2xl shadow-primary/30"
                >
                  <div class="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_auto] animate-gradient-x transition-all"></div>
                  <span class="relative flex items-center justify-center gap-3 uppercase tracking-widest text-xs">
                    <template v-if="submitting">
                      <span class="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                      {{ t('services.processing') }}
                    </template>
                    <template v-else>
                      {{ t('services.pay') }} Now
                      <span class="material-symbols-outlined text-sm font-bold group-hover:translate-x-1 transition-transform">arrow_forward</span>
                    </template>
                  </span>
                </button>

                <!-- Security Badge -->
                <p class="text-[10px] text-slate-500 dark:text-gray-500 text-center flex items-center justify-center gap-1">
                  <span class="material-symbols-outlined text-[14px]">lock</span>
                  {{ t('services.securePayment') }}
                </p>
              </div>
            </div>

            <!-- Support Card -->
            <div class="p-6 rounded-3xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center gap-4 border border-white/10 shadow-xl group cursor-pointer overflow-hidden relative">
               <div class="absolute -right-4 -bottom-4 opacity-10 group-hover:rotate-12 transition-transform">
                  <span class="material-symbols-outlined text-7xl">support_agent</span>
               </div>
               <div class="w-12 h-12 rounded-2xl bg-white/10 dark:bg-black/10 flex items-center justify-center shrink-0">
                  <span class="material-symbols-outlined">help</span>
               </div>
                <div>
                  <h4 class="font-bold text-sm leading-tight">Questions about this service?</h4>
                  <p class="text-[10px] opacity-60">Talk to our specialized support</p>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Terms Modal -->
    <Modal
      v-if="service"
      v-model="showTermsModal"
      title="Terms and Conditions"
      size="lg"
    >
      <div class="p-2 space-y-4">
        <div class="prose dark:prose-invert max-w-none">
          <div class="text-sm text-slate-700 dark:text-gray-300 leading-relaxed h-[60vh] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent" v-html="currentLocale === 'pt-BR' ? (service.terms_content_pt || service.terms_content_en) : (service.terms_content_en || service.terms_content_pt)">
          </div>
        </div>
        <div class="flex justify-end pt-4 border-t border-slate-100 dark:border-white/5">
          <button
            @click="showTermsModal = false"
            class="px-6 py-2 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-white font-bold hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useSupabase } from '@/composables/useSupabase'
import AppLayout from '@/components/layout/AppLayout.vue'
import Button from '@/components/ui/Button.vue'
import Modal from '@/components/ui/Modal.vue'
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
const exchangeRate = ref(5.95)
const acceptedTerms = ref(false)
const showTermsModal = ref(false)

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

const DEFAULT_SERVICE_IMAGE = 'https://images.unsplash.com/photo-1454165833773-fa99218d255d?auto=format&fit=crop&q=80&w=2070'

async function fetchService() {
  try {
    loading.value = true
    const serviceId = route.params.id

    // 1. Fetch service data
    const { data: serviceData, error: serviceError } = await supabase
      .from('services')
      .select('*')
      .eq('id', serviceId)
      .single()

    if (serviceError) throw serviceError

    // 2. Fetch creator profile in a separate call if created_by exists
    let creator = null
    if (serviceData.created_by) {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, avatar_url, bio')
        .eq('id', serviceData.created_by)
        .single()
      
      if (profileData) {
        creator = {
          name: `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim(),
          avatar_url: profileData.avatar_url,
          bio: profileData.bio
        }
      }
    }

    // Get the localized name and description
    const locale = currentLocale.value === 'pt-BR' ? 'pt' : 'en'
    
    service.value = {
      ...serviceData,
      nome: serviceData[`nome_${locale}`] || serviceData.nome_pt || serviceData.nome_en,
      descricao: serviceData[`descricao_${locale}`] || serviceData.descricao_pt || serviceData.descricao_en,
      beneficio_membro: serviceData[`beneficio_membro_${locale}`] || serviceData.beneficio_membro_pt || serviceData.beneficio_membro_en,
      moeda: serviceData.currency || 'USD',
      image_url: serviceData.image_url || DEFAULT_SERVICE_IMAGE,
      creator
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

<style scoped>
@keyframes gradient-x {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.animate-gradient-x {
  animation: gradient-x 3s ease infinite;
}
</style>
