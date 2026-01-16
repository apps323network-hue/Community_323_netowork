<template>
  <AppLayout>
    <div class="space-y-12">
      <!-- Hero -->
      <div class="relative overflow-hidden rounded-2xl bg-white dark:bg-[#1a0a1f] border border-slate-200 dark:border-white/5 shadow-2xl min-h-[400px]">
        <!-- Interactive Grid Pattern Background -->
        <InteractiveGridPattern
          :width="50"
          :height="50"
          :squares="[30, 12]"
          class="opacity-30 dark:block hidden"
          squaresClassName="fill-primary/20 hover:fill-primary/40 transition-all duration-500"
        />
        
        <!-- Background gradiente escuro -->
        <div class="absolute inset-0 bg-gradient-to-br from-white/70 via-white/80 to-white/70 dark:from-[#0f0515]/70 dark:via-[#1a0a1f]/80 dark:to-[#0a0410]/70 pointer-events-none"></div>
        
        <!-- Glow subtil no canto -->
        <div class="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-secondary/5 via-transparent to-transparent rounded-full blur-3xl"></div>
        <div class="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-primary/5 via-transparent to-transparent rounded-full blur-3xl"></div>
        
        <div class="relative z-10 flex flex-col gap-6 p-8 md:p-12 lg:p-16 max-w-2xl">
          <!-- Badge -->
          <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/30 w-fit backdrop-blur-sm">
            <span class="material-symbols-outlined text-slate-900 dark:text-secondary text-[16px]">verified</span>
            <span class="text-[11px] font-bold text-slate-900 dark:text-secondary tracking-wider uppercase">{{ t('benefits.exclusiveForMembers') }}</span>
          </div>
          
          <!-- Título -->
          <h1 class="text-4xl md:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight">
            <span class="text-slate-900 dark:text-white">{{ t('benefits.heroTitle1') }}<br/></span><span class="bg-gradient-to-r from-[#b845f4] via-[#c855ff] to-[#d865ff] bg-clip-text text-transparent">{{ t('benefits.heroTitle2') }}</span>
          </h1>
          
          <!-- Descrição -->
          <p class="text-slate-600 dark:text-gray-400 text-base md:text-lg font-normal leading-relaxed max-w-lg">
            {{ t('benefits.description') }}
          </p>
          
          <!-- Botões -->
          <div class="flex flex-wrap gap-4 pt-2">
            <button 
              @click="scrollToBenefits"
              class="flex items-center justify-center gap-2 rounded-lg bg-transparent hover:bg-slate-100 dark:hover:bg-white/5 border border-slate-200 dark:border-white/20 hover:border-slate-300 dark:hover:border-white/40 transition-all h-12 px-8 text-slate-700 dark:text-white text-base font-medium group"
            >
              <span>{{ t('common.seeAll') }}</span>
              <span class="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Filtros -->
      <div ref="benefitsSection" class="flex flex-col md:flex-row justify-between items-center gap-4 border-b border-slate-200 dark:border-white/10 pb-6">
        <div class="flex gap-3 overflow-x-auto pb-2 md:pb-0 max-w-full no-scrollbar">
          <button 
            v-for="filter in filters" 
            :key="filter.id"
            @click="activeFilter = filter.id"
            :class="[
              'flex h-10 shrink-0 items-center gap-2 rounded-full px-6 transition-all active:scale-95',
              activeFilter === filter.id
                ? 'bg-gradient-to-r from-primary to-primary/80 shadow-[0_0_10px_rgba(244,37,244,0.3)] hover:brightness-110'
                : 'bg-white dark:bg-surface-card hover:bg-slate-50 dark:hover:bg-secondary/10 border border-slate-200 dark:border-white/10 hover:border-secondary/50 group'
            ]"
          >
            <span 
              v-if="filter.icon" 
              :class="[
                'material-symbols-outlined text-[18px] transition-colors',
                activeFilter === filter.id ? 'text-white' : 'text-slate-500 dark:text-gray-400 group-hover:text-secondary'
              ]"
            >{{ filter.icon }}</span>
            <span 
              :class="[
                'text-sm font-medium transition-colors',
                activeFilter === filter.id ? 'text-white font-bold' : 'text-slate-700 dark:text-gray-300 group-hover:text-slate-900 dark:group-hover:text-white'
              ]"
            >{{ filter.label }}</span>
          </button>
        </div>
        <div class="text-sm text-slate-600 dark:text-gray-400">
          {{ t('benefits.showingBenefits', { count: filteredBenefits.length }) }}
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex justify-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>

      <template v-else>

        <!-- Todos os Benefícios (grid 4 colunas, sem imagem) -->
        <section>
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{{ t('benefits.allBenefits') }}</h3>
            <div class="hidden md:flex items-center gap-2 text-sm text-slate-600 dark:text-gray-400 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors">
              <span>{{ t('benefits.sortBy') }} <span class="text-secondary font-medium">{{ t('benefits.latest') }}</span></span>
              <span class="material-symbols-outlined text-secondary">expand_more</span>
            </div>
          </div>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative">
            <BenefitCard
              v-for="(benefit, index) in displayedOtherBenefits"
              :key="benefit.id"
              :benefit="benefit"
              :is-claimed="isBenefitClaimed(benefit.id)"
              :class="{
                'blur-sm opacity-60 pointer-events-none': !isAuthenticated && index >= guestLimit - 3
              }"
              @claim="handleClaimBenefit(benefit.id)"
            />
            
            <!-- Guest Blocker Overlay -->
            <div 
              v-if="!isAuthenticated && otherBenefits.length >= guestLimit - 3"
              class="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <div class="pointer-events-auto bg-white/95 dark:bg-surface-card/95 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-2xl p-8 max-w-md text-center shadow-2xl">
                <div class="mb-4">
                  <span class="material-symbols-outlined text-5xl text-secondary">lock_open</span>
                </div>
                <h3 class="text-2xl font-black text-slate-900 dark:text-white mb-3">
                  {{ t('benefits.guestBlockerTitle') }}
                </h3>

                <div class="flex justify-center w-full">
                  <button 
                    @click="showAuthModal('login')"
                    class="px-8 py-3 bg-gradient-to-r from-primary to-secondary text-white font-black rounded-lg hover:shadow-lg hover:scale-105 transition-all w-full sm:w-auto"
                  >
                    {{ t('auth.loginOrRegister') }}
                  </button>
                </div>
              </div>
            </div>
            
            <!-- Card "Sugerir Parceiro" -->
            <!-- <div class="bg-[#1a0a1f] p-6 rounded-2xl border border-white/10 hover:border-white/20 transition-colors flex flex-col items-center justify-center gap-4 group cursor-pointer text-center h-full">
              <div class="size-16 rounded-full bg-[#6b1d6b]/30 flex items-center justify-center group-hover:bg-[#6b1d6b]/50 text-gray-300 group-hover:text-white transition-all duration-300">
                <span class="material-symbols-outlined text-[32px]">add</span>
              </div>
              <div>
                <h5 class="text-lg font-bold text-white mb-1">Sugerir Parceiro</h5>
                <p class="text-sm text-gray-500">Sentiu falta de algo? Indique uma empresa.</p>
              </div>
            </div> -->
          </div>
        </section>

        <!-- CTA Parceria -->
        <section class="mt-8 mb-10 w-full rounded-2xl bg-white dark:bg-surface-card p-8 md:p-12 border border-slate-200 dark:border-white/5 relative overflow-hidden shadow-xl dark:shadow-2xl">
          <!-- Glow effects adaptativos -->
          <div class="absolute -top-32 -right-32 w-80 h-80 bg-primary/10 dark:bg-primary/20 rounded-full blur-[80px] pointer-events-none"></div>
          <div class="absolute -bottom-32 -left-32 w-80 h-80 bg-secondary/10 dark:bg-secondary/20 rounded-full blur-[80px] pointer-events-none"></div>
          
          <div class="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
            <div class="flex flex-col gap-4 max-w-xl">
              <h2 class="text-3xl font-black text-slate-900 dark:text-white leading-tight">{{ t('benefits.businessOwnerTitle') }}</h2>
              <p class="text-slate-600 dark:text-white/80 text-lg leading-relaxed">
                {{ t('benefits.businessOwnerDescription') }}
              </p>
              <ul class="flex flex-col sm:flex-row justify-center md:justify-start gap-4 mt-2">
                <li class="flex items-center gap-2 text-sm text-slate-700 dark:text-white/80 bg-slate-100 dark:bg-surface-lighter px-3 py-1.5 rounded-full border border-slate-200 dark:border-white/10">
                  <span class="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                  {{ t('benefits.brandVisibility') }}
                </li>
                <li class="flex items-center gap-2 text-sm text-slate-700 dark:text-white/80 bg-slate-100 dark:bg-surface-lighter px-3 py-1.5 rounded-full border border-slate-200 dark:border-white/10">
                  <span class="material-symbols-outlined text-secondary text-[20px]">check_circle</span>
                  {{ t('benefits.qualifiedNetworking') }}
                </li>
              </ul>
            </div>
            <button 
              @click="router.push('/contact-us')"
              class="shrink-0 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-gray-100 px-8 py-4 font-bold text-lg shadow-lg dark:shadow-xl hover:shadow-xl dark:hover:shadow-2xl transition-all hover:scale-105"
            >
              {{ t('benefits.beAPartner') }}
            </button>
          </div>
        </section>
      </template>
    </div>

  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { usePublicAccess } from '@/composables/usePublicAccess'
import AppLayout from '@/components/layout/AppLayout.vue'
import BenefitCard from '@/components/features/benefits/BenefitCard.vue'
import InteractiveGridPattern from '@/components/ui/InteractiveGridPattern.vue'
import { useBenefits } from '@/composables/useBenefits'
import { toast } from 'vue-sonner'

const { benefits, loading, fetchBenefits, fetchUserBenefits, claimBenefit, isBenefitClaimed } = useBenefits()
const { isAuthenticated, showAuthModal, getContentLimit } = usePublicAccess()
const { t } = useI18n()
const router = useRouter()
const activeFilter = ref('all')
const benefitsSection = ref<HTMLElement | null>(null)

const guestLimit = getContentLimit('benefits')

function scrollToBenefits() {
  if (benefitsSection.value) {
    benefitsSection.value.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'start' 
    })
  }
}

const filters = computed(() => [
  { id: 'all', label: t('navigation.allCategories'), icon: '' },
  { id: 'business', label: t('benefits.filterBusiness'), icon: 'business_center' },
  { id: 'lifestyle', label: t('benefits.filterLifestyle'), icon: 'flight_takeoff' },
  { id: 'events', label: t('benefits.filterEvents'), icon: 'event_seat' },
  { id: 'health', label: t('benefits.filterHealth'), icon: 'health_and_safety' }
])

const filteredBenefits = computed(() => {
  if (activeFilter.value === 'all') return benefits.value
  return benefits.value.filter(b => b.tipo === activeFilter.value)
})



const otherBenefits = computed(() => {
  return filteredBenefits.value.filter(b => !b.destaque_mes)
})

const displayedOtherBenefits = computed(() => {
  if (isAuthenticated.value) {
    return otherBenefits.value
  }
  return otherBenefits.value.slice(0, guestLimit)
})

async function handleClaimBenefit(benefitId: string) {
  if (!isAuthenticated.value) {
    showAuthModal('signup')
    return
  }
  
  const success = await claimBenefit(benefitId)
  if (success) {
    toast.success(t('benefits.claimSuccess'))
  } else {
    toast.error(t('benefits.claimError'))
  }
}

onMounted(async () => {
  await fetchBenefits()
  await fetchUserBenefits()
})
</script>

<style scoped>
.neon-text-gradient {
  background: linear-gradient(to right, #f425f4, #00f3ff);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
