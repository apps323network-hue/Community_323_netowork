<template>
  <AppLayout hideSidebars fluid>
    <div class="min-h-[calc(100vh-80px)] bg-white dark:bg-background-dark flex flex-col items-center justify-center px-4 py-12 md:py-20 relative overflow-x-hidden transition-colors duration-500">
      <!-- Decorative Background Elements -->
      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-primary/5 rounded-full blur-[150px] pointer-events-none"></div>
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div class="absolute bottom-0 right-0 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[100px] pointer-events-none"></div>

      <!-- Already Subscribed State -->
      <div v-if="hasActiveSubscription" class="flex flex-col items-center text-center max-w-2xl relative z-10">
        <div class="relative mb-12">
          <div class="absolute inset-0 bg-gradient-to-r from-primary to-secondary blur-2xl opacity-50 animate-pulse"></div>
          <div class="relative w-24 h-24 rounded-[32px] bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-2xl transform rotate-12 hover:rotate-0 transition-transform duration-500">
            <span class="material-icons text-5xl text-black font-black">verified</span>
          </div>
        </div>

        <div class="space-y-4 mb-10">
          <h1 class="text-4xl md:text-5xl font-black text-slate-900 dark:text-white leading-tight tracking-tighter uppercase">
            {{ t('subscriptions.alreadySubscribed.title').split(' ')[0] }} {{ t('subscriptions.alreadySubscribed.title').split(' ')[1] }} <span class="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">{{ t('subscriptions.alreadySubscribed.title').split(' ').slice(2).join(' ') }}</span>
          </h1>
          <p class="text-slate-600 dark:text-slate-400 text-lg max-w-md mx-auto leading-relaxed">
            {{ t('subscriptions.alreadySubscribed.description') }}
          </p>
          <div v-if="subscriptionEndDate" class="text-sm text-slate-500 dark:text-slate-500">
            {{ t('subscriptions.alreadySubscribed.nextRenewal', { date: formatDate(subscriptionEndDate) }) }}
          </div>
        </div>

        <RouterLink
          to="/servicos"
          class="group relative px-8 py-5 rounded-2xl font-black text-black overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-primary/20"
        >
          <div class="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_auto] animate-gradient-x"></div>
          <span class="relative flex items-center justify-center gap-3 uppercase tracking-widest text-sm">
            <span class="material-icons">dashboard</span>
            {{ t('subscriptions.viewBenefits') }}
          </span>
        </RouterLink>
      </div>

      <!-- Subscription Plans -->
      <div v-else class="flex flex-col items-center text-center max-w-4xl relative z-10 w-full">
        <!-- Header -->
        <div class="space-y-4 mb-12">
          <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/5 dark:bg-secondary/10 border border-secondary/20 backdrop-blur-sm">
            <span class="material-icons text-secondary text-lg">workspace_premium</span>
            <span class="text-secondary text-xs font-bold uppercase tracking-widest">{{ t('subscriptions.plans.premium.badge') }}</span>
          </div>
          <h1 class="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white leading-tight tracking-tighter">
            {{ t('subscriptions.plans.premium.title').split(' ').slice(0, -1).join(' ') }} <span class="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">{{ t('subscriptions.plans.premium.title').split(' ').slice(-1)[0] }}</span>
          </h1>
          <p class="text-slate-600 dark:text-slate-400 text-lg max-w-xl mx-auto leading-relaxed">
            {{ t('subscriptions.plans.premium.description') }}
          </p>
        </div>

        <!-- Canceled Notice -->
        <div v-if="route.query.canceled" class="mb-8 px-6 py-4 rounded-2xl bg-yellow-500/5 dark:bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 dark:text-yellow-400 text-sm">
          <span class="material-icons text-base align-middle mr-2">info</span>
          {{ t('subscriptions.canceledNotice') }}
        </div>

        <!-- Pricing Card -->
        <div class="w-full max-w-md mb-10">
          <div class="group relative p-1 rounded-[32px] bg-gradient-to-r from-primary/30 via-secondary/30 to-primary/30 hover:from-primary hover:via-secondary hover:to-primary transition-all duration-500 shadow-xl shadow-slate-200/50 dark:shadow-none">
            <div class="bg-white dark:bg-slate-900/95 backdrop-blur-xl rounded-[30px] p-8 border border-slate-100 dark:border-white/5">
              <!-- Price -->
              <div class="text-center mb-8">
                <div class="flex items-baseline justify-center gap-1 mb-1">
                  <span class="text-5xl md:text-6xl font-black text-slate-900 dark:text-white">{{ displayBasePrice }}</span>
                  <span class="text-slate-500 dark:text-slate-400 text-lg">{{ t('subscriptions.plans.premium.monthly') }}</span>
                </div>
                <div class="flex flex-col items-center gap-1">
                  <p class="text-primary text-sm font-bold uppercase tracking-widest">{{ t('subscriptions.plans.premium.totalValue', { total: displayTotalWithFees }) }}</p>
                  <p class="text-slate-500 text-xs opacity-70">
                    {{ t('subscriptions.plans.premium.feesNote', { fees: displayStripeFee }) }}
                  </p>
                </div>
                <p class="text-slate-500 dark:text-slate-500 text-sm mt-4">{{ t('subscriptions.plans.premium.cancelAnytime') }}</p>
              </div>

              <!-- Benefits -->
              <ul class="space-y-4 mb-8">
                <li v-for="benefit in benefitsList" :key="benefit" class="flex items-start gap-3">
                  <div class="w-6 h-6 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center shrink-0 mt-0.5 shadow-light-secondary dark:shadow-none">
                    <span class="material-icons text-black text-sm">check</span>
                  </div>
                  <span class="text-slate-600 dark:text-slate-300 text-left font-medium">{{ benefit }}</span>
                </li>
              </ul>

              <!-- CTA Button -->
              <button
                @click="handleSubscribe"
                :disabled="loading"
                class="w-full py-5 rounded-2xl font-black text-black overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98] shadow-2xl shadow-primary/30 relative group"
              >
                <div class="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_auto] animate-gradient-x"></div>
                <span class="relative flex items-center justify-center gap-3 uppercase tracking-widest text-sm">
                  <template v-if="loading">
                    <span class="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></span>
                    {{ t('subscriptions.actions.processing') }}
                  </template>
                  <template v-else>
                    <span class="material-icons">rocket_launch</span>
                    {{ t('subscriptions.actions.subscribe') }}
                  </template>
                </span>
              </button>
            </div>
          </div>
        </div>

        <!-- Trust Badges -->
        <div class="flex flex-wrap items-center justify-center gap-6 text-slate-500 text-sm">
          <div class="flex items-center gap-2">
            <span class="material-icons text-lg">lock</span>
            <span>{{ t('subscriptions.badges.secure') }}</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="material-icons text-lg">credit_card</span>
            <span>{{ t('subscriptions.badges.stripe') }}</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="material-icons text-lg">autorenew</span>
            <span>{{ t('subscriptions.badges.cancelAnytime') }}</span>
          </div>
        </div>

        <!-- FAQ Section -->
        <div class="mt-16 w-full max-w-2xl">
          <h3 class="text-xl font-black text-slate-900 dark:text-white mb-6 uppercase tracking-wider">{{ t('subscriptions.faq.title') }}</h3>
          <div class="space-y-4">
            <div 
              v-for="faq in faqsList" 
              :key="faq.q"
              class="bg-slate-50 dark:bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-white/5 overflow-hidden transition-all hover:border-secondary/30"
            >
              <button 
                @click="toggleFaq(faq.q)"
                class="w-full px-6 py-4 flex items-center justify-between text-left group"
              >
                <span class="font-bold text-slate-800 dark:text-white group-hover:text-secondary transition-colors">{{ faq.q }}</span>
                <span class="material-icons text-slate-400 transition-transform" :class="{ 'rotate-180': openFaq === faq.q }">expand_more</span>
              </button>
              <Transition name="faq">
                <div v-if="openFaq === faq.q" class="px-6 pb-4 text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  {{ faq.a }}
                </div>
              </Transition>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { useSubscriptionsStore } from '@/stores/subscriptions'
import { useAuthStore } from '@/stores/auth'
import { useLocale } from '@/composables/useLocale'
import { calculateStripeFee, calculateTotalWithFees, formatCurrency } from '@/lib/finance'
import AppLayout from '@/components/layout/AppLayout.vue'
import { toast } from 'vue-sonner'

const route = useRoute()
const router = useRouter()
const subscriptionsStore = useSubscriptionsStore()
const authStore = useAuthStore()
const { t, locale: currentLocale } = useLocale()

const loading = computed(() => subscriptionsStore.loading)
const hasActiveSubscription = computed(() => subscriptionsStore.hasActiveSubscription)
const subscriptionEndDate = computed(() => subscriptionsStore.subscriptionEndDate)

// Pricing broken down
const basePriceCents = computed(() => subscriptionsStore.price?.price_cents || 1000)
const stripeFeeCents = computed(() => calculateStripeFee(basePriceCents.value))
const totalWithFeesCents = computed(() => calculateTotalWithFees(basePriceCents.value))

const displayBasePrice = computed(() => formatCurrency(basePriceCents.value, subscriptionsStore.price?.currency || 'USD', currentLocale.value))
const displayStripeFee = computed(() => formatCurrency(stripeFeeCents.value, subscriptionsStore.price?.currency || 'USD', currentLocale.value))
const displayTotalWithFees = computed(() => formatCurrency(totalWithFeesCents.value, subscriptionsStore.price?.currency || 'USD', currentLocale.value))

const openFaq = ref<string | null>(null)

const benefitsList = computed(() => [
  t('subscriptions.benefits.verified'),
  t('subscriptions.benefits.unlimitedServices'),
  t('subscriptions.benefits.priorityHighlight'),
  t('subscriptions.benefits.earlyAccess'),
  t('subscriptions.benefits.boostedProfile'),
  t('subscriptions.benefits.prioritySupport')
])

const faqsList = computed(() => [
  {
    q: t('subscriptions.faq.items.whatIs.q'),
    a: t('subscriptions.faq.items.whatIs.a')
  },
  {
    q: t('subscriptions.faq.items.benefits.q'),
    a: t('subscriptions.faq.items.benefits.a')
  },
  {
    q: t('subscriptions.faq.items.cancel.q'),
    a: t('subscriptions.faq.items.cancel.a')
  }
])

function toggleFaq(q: string) {
  openFaq.value = openFaq.value === q ? null : q
}

function formatDate(date: Date) {
  return date.toLocaleDateString(currentLocale.value, {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })
}

async function handleSubscribe() {
  if (!authStore.user) {
    toast.error(t('auth.loginRequired'))
    router.push(`/login?redirect=${route.path}`)
    return
  }

  const checkoutUrl = await subscriptionsStore.createCheckout()
  
  if (checkoutUrl) {
    window.location.href = checkoutUrl
  } else if (subscriptionsStore.error) {
    toast.error(subscriptionsStore.error)
  }
}

onMounted(() => {
  subscriptionsStore.init()
})
</script>

<style scoped>
.animate-gradient-x {
  background-size: 200% auto;
  animation: gradient-x 3s linear infinite;
}

@keyframes gradient-x {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.faq-enter-active,
.faq-leave-active {
  transition: all 0.3s ease;
}

.faq-enter-from,
.faq-leave-to {
  opacity: 0;
  max-height: 0;
}

.faq-enter-to,
.faq-leave-from {
  opacity: 1;
  max-height: 200px;
}
</style>
