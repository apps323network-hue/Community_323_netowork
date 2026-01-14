<template>
  <div class="group relative flex flex-col justify-between gap-2.5 sm:gap-3 md:gap-4 rounded-xl border border-slate-200/60 dark:border-white/5 bg-white dark:bg-surface-card backdrop-blur-sm p-3 sm:p-4 md:p-6 transition-all duration-300 hover:-translate-y-1 hover:border-secondary/50 shadow-premium dark:shadow-none hover:shadow-premium-hover">
    <!-- Featured Badge -->
    <div
      v-if="service.destaque || service.status"
      class="absolute top-2 sm:top-3 md:top-4 right-2 sm:right-3 md:right-4 z-10 flex flex-col items-end gap-2"
    >
      <span v-if="service.destaque" class="bg-primary/20 text-primary dark:text-pink-400 text-[8px] sm:text-[9px] md:text-[10px] font-bold px-1 sm:px-1.5 md:px-2 py-0.5 rounded uppercase tracking-wide border border-primary/20 shadow-sm">
        {{ t('services.featured') }}
      </span>
      
      <!-- Status Badges (Visible only for owners/admins or when filtering 'mine') -->
      <template v-if="service.status && service.status !== 'approved'">
        <span v-if="service.status === 'pending'" class="bg-blue-500/20 text-blue-400 text-[8px] sm:text-[9px] md:text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide border border-blue-500/20">
          Pendente
        </span>
        <span v-if="service.status === 'rejected'" class="bg-red-500/20 text-red-400 text-[8px] sm:text-[9px] md:text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide border border-red-500/20">
          Recusado
        </span>
      </template>
    </div>

    <!-- Service Image -->
    <div v-if="service.image_url" class="-mx-3 -mt-3 sm:-mx-4 sm:-mt-4 md:-mx-6 md:-mt-6 mb-3 sm:mb-4 md:mb-5 rounded-t-xl overflow-hidden h-32 sm:h-40 relative group-hover:h-36 sm:group-hover:h-44 transition-all duration-300">
      <img :src="service.image_url" :alt="service.nome_en || service.nome_pt" class="w-full h-full object-cover">
      <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
      
      <!-- Category Icon Overlay -->
      <div class="absolute bottom-3 left-3 z-20 inline-flex items-center justify-center rounded-lg border border-white/10 bg-black/40 backdrop-blur-md p-2 text-secondary shadow-[0_0_10px_rgba(0,243,255,0.2)] group-hover:bg-secondary group-hover:text-black transition-all duration-300">
        <span class="material-symbols-outlined text-xl sm:text-2xl">{{ getIcon(service.categoria) }}</span>
      </div>
    </div>



    <div>
      <!-- Icon based on category or default -->
      <!-- Icon based on category or default (Only if no image) -->
      <div v-if="!service.image_url" class="mb-2.5 sm:mb-3 md:mb-4 inline-flex items-center justify-center rounded-lg border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 p-1.5 sm:p-2 md:p-3 text-secondary shadow-[0_0_10px_rgba(0,243,255,0.1)] group-hover:bg-secondary group-hover:text-black group-hover:shadow-[0_0_20px_rgba(0,243,255,0.6)] transition-all duration-300">
        <span class="material-symbols-outlined text-xl sm:text-2xl md:text-[28px] lg:text-[32px]">{{ getIcon(service.categoria) }}</span>
      </div>

      <!-- Title -->
      <h3 class="text-slate-900 dark:text-white text-base sm:text-lg md:text-xl font-bold leading-tight mb-1 sm:mb-1.5 md:mb-2">
        {{ currentLocale === 'pt-BR' ? service.nome_pt : (service.nome_en || service.nome_pt) }}
      </h3>

      <!-- Description -->
      <p class="text-slate-600 dark:text-gray-400 text-[11px] sm:text-xs md:text-sm font-normal leading-relaxed mb-2.5 sm:mb-3 md:mb-4 line-clamp-4">
        {{ currentLocale === 'pt-BR' ? service.descricao_pt : (service.descricao_en || service.descricao_pt) }}
      </p>

      <!-- Rejection Reason -->
      <div v-if="service.status === 'rejected' && service.rejection_reason" class="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
        <p class="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-1">Motivo da Recusa:</p>
        <p class="text-xs text-red-200/80 italic leading-relaxed">{{ service.rejection_reason }}</p>
      </div>

      <!-- Price Section -->
      <div v-if="service.preco" class="mb-4">
        <div v-if="isAuthenticated" class="flex items-baseline gap-2">
          <span class="text-2xl font-bold text-slate-900 dark:text-white">{{ formatPrice(service.preco, service.moeda) }}</span>
          <span class="text-xs text-slate-500 dark:text-gray-500 uppercase">{{ service.moeda || 'USD' }}</span>
        </div>
        <div v-else class="flex items-center gap-2">
          <div class="px-3 py-1 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-md backdrop-blur-sm grayscale opacity-50 select-none cursor-pointer" @click="showAuthModal('signup')">
            <span class="text-sm font-bold text-slate-400 dark:text-white/50 blur-[2px]">$99.99</span>
          </div>
          <span class="text-[10px] font-bold text-secondary dark:text-secondary uppercase tracking-tight">Login para ver preço</span>
        </div>
      </div>

      <!-- Benefit Section -->
      <div v-if="currentLocale === 'pt-BR' ? service.beneficio_membro_pt : (service.beneficio_membro_en || service.beneficio_membro_pt)" class="flex flex-col gap-1 sm:gap-1.5 p-2 sm:p-2.5 md:p-3 rounded-lg bg-secondary/5 border border-secondary/20 group-hover:bg-secondary/10 transition-colors">
        <div class="flex items-center gap-1 sm:gap-1.5 text-secondary">
          <span class="material-symbols-outlined text-sm sm:text-base md:text-[18px]">workspace_premium</span>
          <span class="text-[9px] sm:text-[10px] md:text-xs font-bold uppercase tracking-wider">{{ t('services.memberBenefit') }}</span>
        </div>
        <p class="text-slate-600 dark:text-gray-300 text-[10px] sm:text-[11px] md:text-xs font-medium leading-relaxed">
          {{ currentLocale === 'pt-BR' ? service.beneficio_membro_pt : (service.beneficio_membro_en || service.beneficio_membro_pt) }}
        </p>
      </div>
    </div>

    <!-- Button -->
    <!-- Buttons -->
    <div class="flex gap-2 mt-2">
      <button
        v-if="isOwner"
        @click="$emit('edit-service', service)"
        class="flex-1 rounded-lg py-2.5 text-center text-sm font-bold border border-white/10 bg-white/5 text-white hover:bg-white/10 transition-all active:scale-95"
      >
        Editar
      </button>
      
      <button
        v-if="service.status === 'approved'"
        class="flex-[2] rounded-lg py-2.5 text-center text-sm font-bold transition-all duration-300"
        :class="service.preco 
          ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-md hover:shadow-[0_0_20px_rgba(244,37,244,0.4)] hover:scale-[1.02] active:scale-95' 
          : 'border border-secondary/50 bg-transparent text-secondary-dark dark:text-secondary hover:bg-secondary hover:text-white dark:hover:text-black hover:shadow-[0_0_15px_rgba(0,243,255,0.4)]'"
        @click="handleAction"
      >
        {{ getButtonText() }}
      </button>
      
      <div v-else-if="isOwner" class="flex-1 flex items-center justify-center text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-500/5 rounded-lg border border-slate-500/10">
        Em Análise
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useLocale } from '@/composables/useLocale'
import { usePublicAccess } from '@/composables/usePublicAccess'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const { locale: currentLocale, t } = useLocale()
const { isAuthenticated, showAuthModal } = usePublicAccess()
const authStore = useAuthStore()

interface Service {
  id: string
  nome_pt: string
  nome_en: string
  descricao_pt?: string
  descricao_en?: string
  categoria?: string
  beneficio_membro_pt?: string
  beneficio_membro_en?: string
  destaque: boolean
  parceiro_id?: string
  preco?: number
  moeda?: string
  status?: 'pending' | 'approved' | 'rejected'
  rejection_reason?: string
  created_by?: string
  is_user_service?: boolean
  image_url?: string
}

const props = defineProps<{
  service: Service
}>()

const emit = defineEmits<{
  'request-service': [service: Service]
  'edit-service': [service: Service]
}>()

const isOwner = computed(() => {
  return authStore.user?.id === props.service.created_by
})

function getButtonText(): string {
  return props.service.preco 
    ? t('services.contractService') 
    : t('services.requestSupport')
}

function getIcon(category: string | undefined): string {
  if (!category) return 'hub'
  const cat = category.toLowerCase()
  switch (cat) {
    case 'legal':
    case 'jurídico': return 'gavel'
    case 'finance':
    case 'finanças': return 'account_balance'
    case 'mentoring':
    case 'mentoria': return 'school'
    case 'marketing': return 'campaign'
    case 'tech':
    case 'tecnologia': return 'terminal'
    case 'serviços':
    case 'services': return 'category'
    case 'tradução':
    case 'translation': return 'translate'
    case 'imigração':
    case 'immigration': return 'public'
    case 'visto':
    case 'visa': return 'assignment_ind'
    default: return 'hub'
  }
}

function formatPrice(cents: number, currency: string = 'USD'): string {
  const amount = cents / 100
  if (currency === 'BRL') {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount)
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

function handleAction() {
  if (!isAuthenticated.value) {
    showAuthModal('signup')
    return
  }
  
  // If service has a price, redirect to detail page
  if (props.service.preco) {
    router.push(`/servicos/${props.service.id}`)
  } else {
    // Otherwise, emit request-service event for free services
    emit('request-service', props.service)
  }
}
</script>
