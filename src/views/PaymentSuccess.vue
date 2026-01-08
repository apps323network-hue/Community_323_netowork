<template>
  <AppLayout hideSidebars fluid>
    <div class="min-h-[calc(100vh-80px)] bg-background-dark flex flex-col items-center justify-center px-4 py-12 md:py-20 relative overflow-x-hidden">
      <!-- Decorative Background Elements -->
      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-primary/5 rounded-full blur-[150px] pointer-events-none"></div>
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div class="absolute bottom-0 right-0 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[100px] pointer-events-none"></div>

      <!-- Loading State -->
      <div v-if="loading" class="flex flex-col items-center gap-6 relative z-10">
        <div class="relative w-20 h-20">
          <div class="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
          <div class="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
        <div class="text-center space-y-2">
          <h2 class="text-xl font-black text-white uppercase tracking-widest">Validando Transação</h2>
          <p class="text-slate-400 text-sm animate-pulse">Aguarde um instante enquanto confirmamos tudo...</p>
        </div>
      </div>

      <!-- Success State -->
      <div v-else-if="paymentStatus === 'completed' || paymentStatus === 'paid'" class="flex flex-col items-center text-center max-w-2xl relative z-10">
        <!-- Success Icon with Lottie-like feel -->
        <div class="relative mb-12">
          <div class="absolute inset-0 bg-gradient-to-r from-primary to-secondary blur-2xl opacity-50 animate-pulse"></div>
          <div class="relative w-24 h-24 rounded-[32px] bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-2xl transform rotate-12 hover:rotate-0 transition-transform duration-500">
            <span class="material-icons text-5xl text-black font-black">check</span>
          </div>
        </div>

        <div class="space-y-4 mb-10">
          <h1 class="text-4xl md:text-5xl font-black text-white leading-tight tracking-tighter uppercase">
            Pagamento <span class="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Confirmado!</span>
          </h1>
          <p class="text-slate-400 text-lg max-w-md mx-auto leading-relaxed">
            Sua jornada começa agora. Preparamos tudo para que você tenha a melhor experiência possível.
          </p>
        </div>

        <!-- Course/Service Card -->
        <div v-if="itemName" class="group relative w-full mb-12 p-1 rounded-[32px] bg-gradient-to-r from-white/10 to-transparent hover:from-primary/30 transition-all duration-500">
          <div class="bg-slate-900/80 backdrop-blur-xl rounded-[30px] p-8 border border-white/5 flex flex-col md:flex-row items-center gap-6 text-left">
            <div class="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center shrink-0">
               <span class="material-icons text-primary text-3xl">{{ paymentType === 'program' ? 'school' : 'auto_awesome' }}</span>
            </div>
            <div class="flex-1 text-center md:text-left">
              <p class="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">
                {{ paymentType === 'program' ? 'Programa Matriculado' : 'Serviço Contratado' }}
              </p>
              <h3 class="text-xl md:text-2xl font-black text-white tracking-tight">{{ itemName }}</h3>
            </div>
            <div class="hidden md:block px-4 py-2 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 text-[10px] font-black uppercase tracking-widest">
              Ativo Imediatamente
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <RouterLink
            v-if="paymentType === 'program' && programId"
            :to="'/programs/' + programId + '/assistir'"
            class="group relative px-8 py-5 rounded-2xl font-black text-black overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-primary/20"
          >
            <div class="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_auto] animate-gradient-x"></div>
            <span class="relative flex items-center justify-center gap-3 uppercase tracking-widest text-sm">
              <span class="material-icons">play_circle</span>
              Começar a Assistir agora
            </span>
          </RouterLink>
          
          <RouterLink
            v-else
            :to="paymentType === 'program' ? '/my-programs' : '/meus-pedidos'"
            class="group relative px-8 py-5 rounded-2xl font-black text-black overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-primary/20"
          >
            <div class="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_auto] animate-gradient-x"></div>
            <span class="relative flex items-center justify-center gap-3 uppercase tracking-widest text-sm">
              {{ paymentType === 'program' ? 'Ver Meus Programas' : 'Acompanhar Pedido' }}
              <span class="material-icons">arrow_forward</span>
            </span>
          </RouterLink>

          <RouterLink
            :to="paymentType === 'program' ? '/programs' : '/servicos'"
            class="px-8 py-5 rounded-2xl border-2 border-white/10 text-white font-black uppercase tracking-widest text-xs hover:bg-white/5 transition-all flex items-center justify-center gap-2"
          >
            Voltar para a Exploração
          </RouterLink>
        </div>
      </div>

      <!-- Pending State -->
      <div v-else-if="paymentStatus === 'pending'" class="flex flex-col items-center text-center max-w-md relative z-10">
        <div class="relative mb-8">
           <div class="absolute inset-0 bg-yellow-500/20 blur-xl animate-pulse"></div>
           <div class="relative w-20 h-20 rounded-3xl border-2 border-yellow-500/50 flex items-center justify-center">
             <span class="material-icons text-4xl text-yellow-500 animate-spin-slow">hourglass_empty</span>
           </div>
        </div>
        <h1 class="text-3xl font-black text-white mb-4 uppercase tracking-tight">Processando sua compra</h1>
        <p class="text-slate-400 mb-8 leading-relaxed">
          <span v-if="paymentMethod === 'pix'" class="block font-bold text-yellow-500 mb-2">Aguardando confirmação do PIX...</span>
          <span v-else>Estamos validando sua transação com a operadora.</span>
          Isso geralmente leva menos de um minuto. Não feche esta página.
        </p>
      </div>

      <!-- Error/Failed State -->
      <div v-else class="flex flex-col items-center text-center max-w-lg relative z-10">
        <div class="w-20 h-20 rounded-[24px] bg-red-500/10 border-2 border-red-500/30 flex items-center justify-center mb-8">
          <span class="material-icons text-4xl text-red-500">error_outline</span>
        </div>
        <h1 class="text-3xl font-black text-white mb-4 uppercase tracking-tighter">
          Ops! Algo não saiu como o esperado
        </h1>
        <p class="text-slate-400 mb-10 leading-relaxed text-lg">
          {{ paymentStatus === 'failed' 
            ? 'O pagamento foi recusado. Verifique os dados do cartão ou tente um novo método.'
            : 'Não conseguimos localizar seu pagamento. Se o valor foi debitado, entre em contato com nosso suporte.' }}
        </p>
        <div class="flex flex-col sm:flex-row gap-4 w-full justify-center">
            <RouterLink
              :to="paymentType === 'program' ? `/programs/${route.query.program_id || ''}` : '/servicos'"
              class="px-8 py-4 rounded-2xl bg-white text-black font-black uppercase tracking-widest text-sm hover:scale-105 transition-all shadow-xl"
            >
              Tentar Novamente
            </RouterLink>
            <a href="#" class="px-8 py-4 rounded-2xl border border-white/10 text-white font-black uppercase tracking-widest text-xs hover:bg-white/5 transition-all flex items-center justify-center gap-2">
               <span class="material-icons text-sm">support_agent</span>
               Suporte via WhatsApp
            </a>
        </div>
      </div>
      <!-- Floating Scroll Indicator -->
      <Transition name="fade">
        <div 
          v-if="(paymentStatus === 'completed' || paymentStatus === 'paid') && showScrollArrow"
          class="fixed bottom-20 right-8 z-[100] pointer-events-none opacity-40 hover:opacity-100 transition-opacity"
        >
          <div class="animate-bounce-slow">
            <span class="material-icons text-slate-900 dark:text-white text-2xl">expand_more</span>
          </div>
        </div>
      </Transition>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { useSupabase } from '@/composables/useSupabase'
import AppLayout from '@/components/layout/AppLayout.vue'

const route = useRoute()
const { supabase } = useSupabase()

const loading = ref(true)
const paymentStatus = ref<'completed' | 'paid' | 'pending' | 'error' | 'failed'>('pending')
const itemName = ref('')
const programId = ref('')
const paymentType = ref<'service' | 'program'>((route.query.type as any) || 'service')
const paymentMethod = ref<'card' | 'pix' | null>(null)
const showScrollArrow = ref(true)

let pollInterval: any = null
let attempts = 0
const MAX_ATTEMPTS = 30 // 30 tentativas x 2s = 60 segundos de espera máxima

function handleScroll() {
  if (window.scrollY > 50) {
    showScrollArrow.value = false
  } else {
    showScrollArrow.value = true
  }
}

async function checkPaymentStatus() {
  const sessionId = route.query.session_id as string
  
  if (!sessionId) {
    loading.value = false
    paymentStatus.value = 'error'
    return
  }

  try {
    let query;
    if (paymentType.value === 'program') {
      query = supabase
        .from('program_enrollments')
        .select(`
          *,
          programs:program_id (title_pt)
        `)
        .eq('payment_id', sessionId)
        .single()
    } else {
      query = supabase
        .from('service_payments')
        .select(`
          *,
          services:service_id (nome)
        `)
        .eq('stripe_session_id', sessionId)
        .single()
    }

    const { data: payment, error } = await query

    if (error || !payment) {
      console.log('Pagamento ainda não encontrado ou erro:', error)
      return
    }

    if (paymentType.value === 'program') {
      itemName.value = (payment as any).programs?.title_pt || ''
      programId.value = (payment as any).program_id
      paymentMethod.value = (payment as any).payment_method
      paymentStatus.value = (payment as any).payment_status
    } else {
      itemName.value = (payment as any).services?.nome || ''
      paymentMethod.value = (payment as any).payment_method
      paymentStatus.value = (payment as any).status
    }

    if (paymentStatus.value === 'completed' || paymentStatus.value === 'paid' || paymentStatus.value === 'failed') {
      loading.value = false
      if (pollInterval) clearInterval(pollInterval)
    } else {
      loading.value = false 
    }

  } catch (error) {
    console.error('Erro ao verificar pagamento:', error)
  }
}

onMounted(() => {
  checkPaymentStatus()
  window.addEventListener('scroll', handleScroll)

  pollInterval = setInterval(async () => {
    attempts++
    await checkPaymentStatus()
    
    if (attempts === 3 && paymentStatus.value === 'pending') {
      const sessionId = route.query.session_id
      supabase.functions.invoke('check-payment-status', { 
        body: { session_id: sessionId } 
      })
    }

    if (attempts >= MAX_ATTEMPTS) {
      if (pollInterval) clearInterval(pollInterval)
    }
  }, 2000)
})

onUnmounted(() => {
  if (pollInterval) clearInterval(pollInterval)
  window.removeEventListener('scroll', handleScroll)
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

.animate-spin-slow {
  animation: spin 3s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.animate-bounce-slow {
  animation: bounce-custom 2s infinite;
}

@keyframes bounce-custom {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
