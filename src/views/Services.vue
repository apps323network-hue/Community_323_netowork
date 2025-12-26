<template>
  <AppLayout>
    <div class="space-y-3 sm:space-y-4 md:space-y-6 lg:space-y-8 w-full overflow-x-hidden max-w-full">
      <!-- Hero Section -->
      <div class="relative overflow-hidden rounded-xl sm:rounded-2xl border border-white/5 bg-[#0a040f]">
        <!-- FlickeringGrid Background -->
        <FlickeringGrid
          :squareSize="4"
          :gridGap="6"
          :flickerChance="0.3"
          color="rgb(244, 37, 244)"
          :maxOpacity="0.2"
          class="absolute inset-0 z-0"
        />
        
        <!-- Gradient Overlay -->
        <div class="absolute inset-0 bg-gradient-to-r from-[#0a040f]/95 via-[#0a040f]/80 to-[#0a040f]/60 z-[1]"></div>
        
        <div class="relative z-10 flex flex-col gap-3 sm:gap-4 md:gap-6 px-3 sm:px-4 md:px-6 lg:px-12 py-6 sm:py-8 md:py-12 lg:py-16 xl:py-20 text-center md:text-left items-center md:items-start">
          <div class="flex flex-col gap-2 sm:gap-3 max-w-2xl w-full">
            <div class="inline-flex items-center gap-1 sm:gap-1.5 sm:gap-2 self-center md:self-start px-2 sm:px-2.5 md:px-3 py-0.5 sm:py-1 rounded-full bg-secondary/10 border border-secondary/20 backdrop-blur-sm shadow-[0_0_15px_rgba(0,243,255,0.1)]">
              <span class="material-symbols-outlined text-secondary text-sm sm:text-base md:text-[18px]">verified</span>
              <span class="text-secondary text-[9px] sm:text-[10px] md:text-xs font-bold uppercase tracking-wider">Exclusivo para Membros</span>
            </div>
            <h1 class="text-white text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-extrabold leading-tight tracking-tight">
              Eleve sua Carreira <br class="hidden sm:block"/>
              <span class="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary drop-shadow-[0_0_15px_rgba(244,37,244,0.3)]">nos Estados Unidos</span>
            </h1>
            <p class="text-gray-300 text-xs sm:text-sm md:text-base lg:text-lg font-medium leading-relaxed max-w-lg mt-1 sm:mt-2">
              Acesse uma rede de serviços premium: burocracia simplificada, estratégias de marketing e conexões de alto nível para acelerar seu sucesso.
            </p>
          </div>
          <div class="flex flex-col sm:flex-row flex-wrap gap-2.5 sm:gap-3 md:gap-4 justify-center md:justify-start mt-2 w-full sm:w-auto">
            <button class="flex items-center justify-center rounded-lg h-9 sm:h-10 md:h-12 px-3 sm:px-4 md:px-6 bg-gradient-to-r from-primary to-secondary text-black text-xs sm:text-sm md:text-base font-bold transition-all shadow-[0_0_20px_rgba(0,243,255,0.3)] hover:shadow-[0_0_40px_rgba(0,243,255,0.5)] hover:scale-105 w-full sm:w-auto" @click="exploreServices">
              Explorar Serviços
            </button>
            <button class="flex items-center justify-center rounded-lg h-9 sm:h-10 md:h-12 px-3 sm:px-4 md:px-6 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs sm:text-sm md:text-base font-medium backdrop-blur-sm transition-colors w-full sm:w-auto" @click="howItWorks">
              Como funciona
            </button>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="flex gap-2 sm:gap-3 overflow-x-auto p-2 sm:p-3 md:p-4 no-scrollbar pb-1">
        <button
          v-for="filter in filters"
          :key="filter.id"
          :class="[
            'flex h-8 sm:h-9 md:h-10 shrink-0 items-center justify-center gap-x-1 sm:gap-x-1.5 md:gap-x-2 rounded-full px-2.5 sm:px-3 md:px-4 lg:px-5 transition-all outline-none',
            activeFilter === filter.id
              ? 'bg-secondary text-black shadow-[0_0_15px_rgba(0,243,255,0.4)] hover:scale-105 font-bold'
              : 'bg-surface-dark border border-white/10 hover:border-primary/50 hover:bg-white/5 text-gray-300 hover:text-white group font-medium'
          ]"
          @click="activeFilter = filter.id"
        >
          <span class="text-[10px] sm:text-xs md:text-sm whitespace-nowrap">{{ filter.label }}</span>
        </button>
      </div>

      <!-- Services Grid -->
      <div>
        <div v-if="loading" class="flex justify-center py-8 sm:py-12 md:py-16 lg:py-20">
          <div class="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 border-b-2 border-primary"></div>
        </div>
        <div v-else-if="filteredServices.length === 0" class="flex flex-col items-center justify-center py-8 sm:py-12 md:py-16 lg:py-20 bg-surface-dark/50 rounded-lg sm:rounded-xl md:rounded-2xl border border-white/10 backdrop-blur-sm px-3 sm:px-4">
          <span class="material-symbols-outlined text-gray-500 text-3xl sm:text-4xl md:text-5xl lg:text-[64px] mb-2 sm:mb-3 md:mb-4">search_off</span>
          <p class="text-gray-400 font-medium text-xs sm:text-sm md:text-base text-center">Nenhum serviço encontrado nesta categoria.</p>
        </div>
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
          <ServiceCard
            v-for="service in filteredServices"
            :key="service.id"
            :service="service"
            @request-service="handleRequestService"
          />
        </div>
      </div>

      <!-- Testimonials -->
      <div class="flex flex-col gap-3 sm:gap-4 md:gap-6 lg:gap-8 pt-3 sm:pt-4 md:pt-6 lg:pt-8">
        <div class="flex items-center justify-between border-b border-white/10 pb-2.5 sm:pb-3 md:pb-4 gap-2">
          <h2 class="text-white text-base sm:text-lg md:text-xl lg:text-2xl font-bold tracking-tight truncate">O que nossos membros dizem</h2>
          <a class="text-secondary text-[10px] sm:text-xs md:text-sm font-bold hover:underline hover:text-white transition-colors cursor-pointer whitespace-nowrap flex-shrink-0">Ver todos</a>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
          <TestimonialCard
            v-for="testimonial in testimonials"
            :key="testimonial.id"
            :testimonial="testimonial"
          />
        </div>
      </div>

      <!-- CTA Section -->
      <div class="bg-[#0a040f] border border-white/10 rounded-lg sm:rounded-xl md:rounded-2xl py-4 sm:py-6 md:py-8 lg:py-12 px-3 sm:px-4 md:px-6 lg:px-12 flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4 md:gap-6 lg:gap-8">
        <div class="flex flex-col gap-1.5 sm:gap-2 text-center md:text-left w-full md:w-auto">
          <h2 class="text-white text-lg sm:text-xl md:text-2xl font-bold">Precisa de algo personalizado?</h2>
          <p class="text-gray-400 text-xs sm:text-sm md:text-base">Nossa equipe de concierge pode ajudar você a encontrar exatamente o que precisa.</p>
        </div>
        <button class="flex items-center gap-1.5 sm:gap-2 rounded-lg bg-transparent border border-secondary text-secondary hover:bg-secondary hover:text-black px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm md:text-base font-bold transition-all duration-300 shadow-[0_0_15px_rgba(0,243,255,0.2)] hover:shadow-[0_0_25px_rgba(0,243,255,0.5)] w-full md:w-auto justify-center" @click="contactSupport">
          <span class="material-symbols-outlined text-base sm:text-lg md:text-[20px]">chat</span>
          Falar com Suporte
        </button>
      </div>
    </div>

    <!-- Modal de Solicitação -->
    <Modal
      v-if="selectedService"
      v-model="showRequestModal"
      :title="'Solicitar ' + selectedService.nome"
    >
      <div class="flex flex-col gap-3 sm:gap-4">
        <p class="text-xs sm:text-sm text-gray-300">
          Você está solicitando atendimento para <strong class="text-white">{{ selectedService.nome }}</strong>.
          O parceiro responsável entrará em contato em breve.
        </p>
        
        <div class="p-3 sm:p-4 rounded-lg bg-secondary/10 border border-secondary/20">
          <p class="text-[10px] sm:text-xs font-bold text-secondary uppercase mb-1">Seu Benefício:</p>
          <p class="text-xs sm:text-sm text-gray-300 font-medium">{{ selectedService.beneficio_membro }}</p>
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-xs sm:text-sm font-bold text-gray-300">Mensagem Adicional (Opcional)</label>
          <textarea
            v-model="requestMessage"
            rows="4"
            class="w-full rounded-lg border border-white/10 bg-surface-dark p-2.5 sm:p-3 text-xs sm:text-sm text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            placeholder="Conte-nos um pouco sobre sua necessidade..."
          ></textarea>
        </div>

        <button
          @click="submitRequest"
          :disabled="submitting"
          class="w-full rounded-lg bg-gradient-to-r from-primary to-secondary py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-black shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all disabled:opacity-50"
        >
          {{ submitting ? 'Enviando...' : 'Confirmar Solicitação' }}
        </button>
      </div>
    </Modal>
    <!-- Modal Como Funciona -->
    <Modal
      v-model="showHowItWorksModal"
      title="Como Funciona o Concierge"
    >
      <div class="space-y-6 sm:space-y-8 py-2 sm:py-4">
        <!-- Step 1 -->
        <div class="relative pl-6 sm:pl-8 border-l-2 border-white/10 group">
          <div class="absolute -left-[7px] sm:-left-[9px] top-0 h-3 w-3 sm:h-4 sm:w-4 rounded-full bg-surface-dark border-2 border-primary shadow-[0_0_10px_rgba(244,37,244,0.5)] group-hover:scale-125 transition-transform"></div>
          <h3 class="text-white text-base sm:text-lg font-bold mb-1.5 sm:mb-2">1. Escolha o Serviço</h3>
          <p class="text-gray-400 text-xs sm:text-sm">Navegue por nossa curadoria de serviços premium. De abertura de empresas a vistos e marketing, selecionamos apenas os melhores parceiros.</p>
        </div>

        <!-- Step 2 -->
        <div class="relative pl-6 sm:pl-8 border-l-2 border-white/10 group">
          <div class="absolute -left-[7px] sm:-left-[9px] top-0 h-3 w-3 sm:h-4 sm:w-4 rounded-full bg-surface-dark border-2 border-secondary shadow-[0_0_10px_rgba(0,243,255,0.5)] group-hover:scale-125 transition-transform"></div>
          <h3 class="text-white text-base sm:text-lg font-bold mb-1.5 sm:mb-2">2. Solicite com um Clique</h3>
          <p class="text-gray-400 text-xs sm:text-sm">Interessou? Clique em solicitar. Não cobramos nada antecipadamente. Nossa equipe conecta você diretamente ao especialista.</p>
        </div>

        <!-- Step 3 -->
        <div class="relative pl-6 sm:pl-8 border-l-2 border-transparent group">
          <div class="absolute -left-[7px] sm:-left-[9px] top-0 h-3 w-3 sm:h-4 sm:w-4 rounded-full bg-gradient-to-r from-primary to-secondary shadow-[0_0_15px_rgba(255,255,255,0.5)] group-hover:scale-125 transition-transform"></div>
          <h3 class="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary text-base sm:text-lg font-bold mb-1.5 sm:mb-2">3. Aproveite os Benefícios</h3>
          <p class="text-gray-400 text-xs sm:text-sm">Como membro da 323 Network, você garante descontos exclusivos e atendimento prioritário VIP em todos os parceiros.</p>
        </div>

        <div class="pt-3 sm:pt-4 flex justify-center">
          <button 
            @click="showHowItWorksModal = false"
            class="px-6 sm:px-8 py-2 rounded-full border border-white/10 hover:bg-white/5 text-white text-xs sm:text-sm transition-colors"
          >
            Entendi, vamos começar!
          </button>
        </div>
      </div>
    </Modal>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useSupabase } from '@/composables/useSupabase'
import AppLayout from '@/components/layout/AppLayout.vue'
import ServiceCard from '@/components/features/services/ServiceCard.vue'
import TestimonialCard from '@/components/features/services/TestimonialCard.vue'
import Modal from '@/components/ui/Modal.vue'
import FlickeringGrid from '@/components/ui/FlickeringGrid.vue'
import { toast } from 'vue-sonner'

const { supabase } = useSupabase()
const loading = ref(true)
const services = ref<any[]>([])
const activeFilter = ref('all')

const showRequestModal = ref(false)
const showHowItWorksModal = ref(false)
const selectedService = ref<any>(null)
const requestMessage = ref('')
const submitting = ref(false)

const filters = [
  { id: 'all', label: 'Todos' },
  { id: 'legal', label: 'Legal & Burocracia' },
  { id: 'marketing', label: 'Marketing & Brand' },
  { id: 'finance', label: 'Finanças' },
  { id: 'mentoring', label: 'Mentoria' },
]

const testimonials = [
  {
    id: 1,
    name: 'Lucas Mendes',
    role: 'Designer em Miami',
    text: '"A assessoria para abrir minha LLC foi impecável. Em 2 semanas eu já estava operando legalmente na Flórida."',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop',
  },
  {
    id: 2,
    name: 'Amanda Silva',
    role: 'Empresária em NY',
    text: '"O networking VIP abriu portas que eu levaria anos para conseguir sozinho. Vale cada centavo."',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&auto=format&fit=crop',
  },
  {
    id: 3,
    name: 'Beatriz Costa',
    role: 'Arquiteta em Austin',
    text: '"Consegui organizar minha estratégia de visto com a mentoria. Me senti muito mais segura para aplicar."',
    rating: 4.5,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop',
  },
]

async function fetchServices() {
  try {
    loading.value = true
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('ativo', true)
      .order('destaque', { ascending: false })
    
    if (error) throw error
    services.value = data || []
  } catch (error) {
    console.error('Erro ao buscar serviços:', error)
  } finally {
    loading.value = false
  }
}

const filteredServices = computed(() => {
  if (activeFilter.value === 'all') return services.value
  return services.value.filter(s => s.categoria === activeFilter.value)
})

function handleRequestService(service: any) {
  selectedService.value = service
  showRequestModal.value = true
}

async function submitRequest() {
  if (!selectedService.value) return

  try {
    submitting.value = true
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      toast.error('Você precisa estar logado para solicitar um serviço.')
      return
    }

    const { error } = await supabase
      .from('service_requests')
      .insert({
        service_id: selectedService.value.id,
        user_id: user.id,
        mensagem: requestMessage.value,
        status: 'pendente'
      })

    if (error) throw error

    toast.success('Solicitação enviada com sucesso! O parceiro entrará em contato em breve.')
    showRequestModal.value = false
    requestMessage.value = ''
  } catch (error) {
    console.error('Erro ao enviar solicitação:', error)
    toast.error('Erro ao enviar solicitação. Tente novamente mais tarde.')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchServices()
})

function exploreServices() {
  const el = document.querySelector('.grid')
  el?.scrollIntoView({ behavior: 'smooth' })
}

function howItWorks() {
  showHowItWorksModal.value = true
}

function contactSupport() {
  const message = encodeURIComponent('Olá! Sou membro da 323 Network e preciso de ajuda com um serviço personalizado.')
  window.open(`https://wa.me/5511999999999?text=${message}`, '_blank')
}
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
