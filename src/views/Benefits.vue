<template>
  <AppLayout>
    <div class="space-y-12">
      <!-- Hero -->
      <div class="relative overflow-hidden rounded-2xl bg-[#1a0a1f] border border-white/5 shadow-2xl min-h-[400px]">
        <!-- Interactive Grid Pattern Background -->
        <InteractiveGridPattern
          :width="50"
          :height="50"
          :squares="[30, 12]"
          class="opacity-30"
          squaresClassName="fill-primary/20 hover:fill-primary/40 transition-all duration-500"
        />
        
        <!-- Background gradiente escuro -->
        <div class="absolute inset-0 bg-gradient-to-br from-[#0f0515]/70 via-[#1a0a1f]/80 to-[#0a0410]/70 pointer-events-none"></div>
        
        <!-- Glow subtil no canto -->
        <div class="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-secondary/5 via-transparent to-transparent rounded-full blur-3xl"></div>
        <div class="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-primary/5 via-transparent to-transparent rounded-full blur-3xl"></div>
        
        <div class="relative z-10 flex flex-col gap-6 p-8 md:p-12 lg:p-16 max-w-2xl">
          <!-- Badge -->
          <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/30 w-fit backdrop-blur-sm">
            <span class="material-symbols-outlined text-secondary text-[16px]">verified</span>
            <span class="text-[11px] font-bold text-secondary tracking-wider uppercase">Exclusivo para Membros</span>
          </div>
          
          <!-- Título -->
          <h1 class="text-4xl md:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight">
            <span class="text-white">Benefícios que<br/>impulsionam </span><span class="bg-gradient-to-r from-[#b845f4] via-[#c855ff] to-[#d865ff] bg-clip-text text-transparent">seu<br/>sucesso.</span>
          </h1>
          
          <!-- Descrição -->
          <p class="text-gray-400 text-base md:text-lg font-normal leading-relaxed max-w-lg">
            Desbloqueie descontos em softwares, acessos a coworkings e consultorias exclusivas para brasileiros nos EUA.
          </p>
          
          <!-- Botões -->
          <div class="flex flex-wrap gap-4 pt-2">
            <button 
              @click="showUpgradeModal = true"
              class="flex items-center justify-center gap-2 rounded-lg bg-[#f425f4] hover:brightness-110 transition-all h-12 px-8 text-white text-base font-bold"
            >
              <span class="material-symbols-outlined text-[20px]">diamond</span>
              <span>Tornar-se VIP</span>
            </button>
            <button class="flex items-center justify-center gap-2 rounded-lg bg-transparent hover:bg-white/5 border border-white/20 hover:border-white/40 transition-all h-12 px-8 text-white text-base font-medium group">
              <span>Ver todos</span>
              <span class="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Filtros -->
      <div class="flex flex-col md:flex-row justify-between items-center gap-4 border-b border-border-dark pb-6">
        <div class="flex gap-3 overflow-x-auto pb-2 md:pb-0 max-w-full no-scrollbar">
          <button 
            v-for="filter in filters" 
            :key="filter.id"
            @click="activeFilter = filter.id"
            :class="[
              'flex h-10 shrink-0 items-center gap-2 rounded-full px-6 transition-all active:scale-95',
              activeFilter === filter.id
                ? 'bg-gradient-to-r from-primary to-primary/80 shadow-[0_0_10px_rgba(244,37,244,0.3)] hover:brightness-110'
                : 'bg-background-card hover:bg-secondary/10 border border-border-dark hover:border-secondary/50 group'
            ]"
          >
            <span 
              v-if="filter.icon" 
              :class="[
                'material-symbols-outlined text-[18px] transition-colors',
                activeFilter === filter.id ? 'text-white' : 'text-gray-400 group-hover:text-secondary'
              ]"
            >{{ filter.icon }}</span>
            <span 
              :class="[
                'text-sm font-medium transition-colors',
                activeFilter === filter.id ? 'text-white font-bold' : 'text-gray-300 group-hover:text-white'
              ]"
            >{{ filter.label }}</span>
          </button>
        </div>
        <div class="text-sm text-text-secondary">
          Mostrando <span class="text-white font-bold">{{ filteredBenefits.length }}</span> benefícios
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex justify-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>

      <template v-else>
        <!-- Parceiros em Destaque (3 cards grandes com imagem) -->
        <section v-if="featuredBenefits.length > 0">
          <div class="flex items-center gap-3 mb-6">
            <span class="material-symbols-outlined text-secondary drop-shadow-[0_0_8px_rgba(0,243,255,0.8)]">star</span>
            <h3 class="text-2xl font-bold text-white tracking-tight">Parceiros em Destaque</h3>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <BenefitCardFeatured
              v-for="benefit in featuredBenefits.slice(0, 3)"
              :key="benefit.id"
              :benefit="benefit"
              :is-claimed="isBenefitClaimed(benefit.id)"
              :is-locked="!canClaimBenefit(benefit, userPlan)"
              @claim="handleClaimBenefit(benefit.id)"
              @upgrade="showUpgradeModal = true"
            />
          </div>
        </section>

        <!-- Todos os Benefícios (grid 4 colunas, sem imagem) -->
        <section>
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-2xl font-bold text-white tracking-tight">Todos os Benefícios</h3>
            <div class="hidden md:flex items-center gap-2 text-sm text-text-secondary cursor-pointer hover:text-white transition-colors">
              <span>Ordenar por: <span class="text-secondary font-medium">Mais Recentes</span></span>
              <span class="material-symbols-outlined text-secondary">expand_more</span>
            </div>
          </div>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <BenefitCard
              v-for="benefit in otherBenefits"
              :key="benefit.id"
              :benefit="benefit"
              :is-claimed="isBenefitClaimed(benefit.id)"
              :is-locked="!canClaimBenefit(benefit, userPlan)"
              @claim="handleClaimBenefit(benefit.id)"
              @upgrade="showUpgradeModal = true"
            />
            
            <!-- Card "Sugerir Parceiro" -->
            <div class="bg-[#1a0a1f] p-6 rounded-2xl border border-white/10 hover:border-white/20 transition-colors flex flex-col items-center justify-center gap-4 group cursor-pointer text-center h-full">
              <div class="size-16 rounded-full bg-[#6b1d6b]/30 flex items-center justify-center group-hover:bg-[#6b1d6b]/50 text-gray-300 group-hover:text-white transition-all duration-300">
                <span class="material-symbols-outlined text-[32px]">add</span>
              </div>
              <div>
                <h5 class="text-lg font-bold text-white mb-1">Sugerir Parceiro</h5>
                <p class="text-sm text-gray-500">Sentiu falta de algo? Indique uma empresa.</p>
              </div>
            </div>
          </div>
        </section>

        <!-- CTA Parceria -->
        <section class="mt-8 mb-10 w-full rounded-2xl bg-gradient-to-br from-background-card to-background-dark p-8 md:p-12 border border-border-dark relative overflow-hidden shadow-2xl">
          <div class="absolute -top-32 -right-32 w-80 h-80 bg-primary/20 rounded-full blur-[80px] pointer-events-none"></div>
          <div class="absolute -bottom-32 -left-32 w-80 h-80 bg-secondary/20 rounded-full blur-[80px] pointer-events-none"></div>
          
          <div class="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
            <div class="flex flex-col gap-4 max-w-xl">
              <h2 class="text-3xl font-black text-white leading-tight">Você tem um negócio nos EUA?</h2>
              <p class="text-gray-300 text-lg">
                Torne-se um parceiro da <span class="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary font-bold">323 Network</span> e ofereça benefícios para nossa comunidade exclusiva de brasileiros.
              </p>
              <ul class="flex flex-col sm:flex-row justify-center md:justify-start gap-4 mt-2">
                <li class="flex items-center gap-2 text-sm text-gray-300 bg-background-dark/50 px-3 py-1.5 rounded-full border border-border-dark">
                  <span class="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                  Visibilidade de Marca
                </li>
                <li class="flex items-center gap-2 text-sm text-gray-300 bg-background-dark/50 px-3 py-1.5 rounded-full border border-border-dark">
                  <span class="material-symbols-outlined text-secondary text-[20px]">check_circle</span>
                  Networking Qualificado
                </li>
              </ul>
            </div>
            <button class="shrink-0 rounded-lg bg-white text-background-dark hover:bg-gray-100 px-8 py-4 font-bold text-lg shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-transform hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]">
              Quero ser Parceiro
            </button>
          </div>
        </section>
      </template>
    </div>

    <!-- Modal de Upgrade -->
    <Modal v-model="showUpgradeModal" title="Desbloqueie Benefícios Premium">
      <div class="space-y-6">
        <p class="text-gray-300 text-sm">
          Faça upgrade do seu plano para acessar benefícios exclusivos e impulsionar ainda mais sua jornada nos Estados Unidos.
        </p>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Member Plan -->
          <div class="p-6 rounded-xl bg-secondary/10 border border-secondary/20">
            <h3 class="text-white font-bold text-lg mb-2">Plano Member</h3>
            <p class="text-gray-400 text-sm mb-4">Acesso a benefícios curados e networking.</p>
            <RouterLink to="/upgrade" class="block w-full py-2 text-center rounded-lg bg-secondary text-black font-bold text-sm hover:shadow-[0_0_15px_rgba(0,243,255,0.4)] transition-all">
              Fazer Upgrade
            </RouterLink>
          </div>

          <!-- Premium Plan -->
          <div class="p-6 rounded-xl bg-primary/10 border border-primary/20">
            <h3 class="text-white font-bold text-lg mb-2">Plano Premium</h3>
            <p class="text-gray-400 text-sm mb-4">Todos os benefícios + acesso VIP.</p>
            <RouterLink to="/upgrade" class="block w-full py-2 text-center rounded-lg bg-gradient-to-r from-primary to-secondary text-black font-bold text-sm hover:shadow-[0_0_20px_rgba(244,37,244,0.5)] transition-all">
              Fazer Upgrade
            </RouterLink>
          </div>
        </div>
      </div>
    </Modal>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import AppLayout from '@/components/layout/AppLayout.vue'
import BenefitCard from '@/components/features/benefits/BenefitCard.vue'
import BenefitCardFeatured from '@/components/features/benefits/BenefitCardFeatured.vue'
import Modal from '@/components/ui/Modal.vue'
import InteractiveGridPattern from '@/components/ui/InteractiveGridPattern.vue'
import { useBenefits } from '@/composables/useBenefits'
import { useUserStore } from '@/stores/user'
import { toast } from 'vue-sonner'

const { benefits, loading, fetchBenefits, fetchUserBenefits, claimBenefit, isBenefitClaimed, canClaimBenefit } = useBenefits()
const userStore = useUserStore()
const showUpgradeModal = ref(false)
const activeFilter = ref('all')

const userPlan = computed(() => userStore.profile?.plano || 'Free')

const filters = [
  { id: 'all', label: 'Todos', icon: '' },
  { id: 'business', label: 'Negócios', icon: 'business_center' },
  { id: 'lifestyle', label: 'Lifestyle', icon: 'flight_takeoff' },
  { id: 'events', label: 'Eventos', icon: 'event_seat' },
  { id: 'health', label: 'Saúde', icon: 'health_and_safety' }
]

const filteredBenefits = computed(() => {
  if (activeFilter.value === 'all') return benefits.value
  return benefits.value.filter(b => b.tipo === activeFilter.value)
})

const featuredBenefits = computed(() => {
  return filteredBenefits.value.filter(b => b.destaque_mes)
})

const otherBenefits = computed(() => {
  return filteredBenefits.value.filter(b => !b.destaque_mes)
})

async function handleClaimBenefit(benefitId: string) {
  const success = await claimBenefit(benefitId)
  if (success) {
    toast.success('Benefício resgatado com sucesso! Nossa equipe entrará em contato em breve.')
  } else {
    toast.error('Erro ao resgatar benefício. Tente novamente.')
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
