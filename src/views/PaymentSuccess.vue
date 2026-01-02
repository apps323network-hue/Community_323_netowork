<template>
  <AppLayout hideSidebars>
    <div class="min-h-[60vh] flex flex-col items-center justify-center px-4">
      <!-- Loading State -->
      <div v-if="loading" class="flex flex-col items-center gap-4">
        <div class="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
        <p class="text-gray-400">Verificando pagamento...</p>
      </div>

      <!-- Success State -->
      <div v-else-if="paymentStatus === 'completed' || paymentStatus === 'paid'" class="flex flex-col items-center text-center max-w-md">
        <div class="w-20 h-20 rounded-full bg-gradient-to-r from-secondary to-primary flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(0,243,255,0.4)]">
          <span class="material-symbols-outlined text-4xl text-black">check</span>
        </div>
        <h1 class="text-3xl font-bold text-white mb-3">Pagamento Confirmado!</h1>
        <p class="text-gray-400 mb-6">
          Seu pagamento foi processado com sucesso. O parceiro responsável entrará em contato em breve para iniciar o atendimento.
        </p>
        <div v-if="itemName" class="p-4 rounded-lg bg-white/5 border border-white/10 w-full mb-6">
          <p class="text-xs text-gray-500 mb-1">
            {{ paymentType === 'program' ? 'Programa matriculado' : 'Serviço contratado' }}
          </p>
          <p class="text-white font-bold">{{ itemName }}</p>
        </div>
        <div class="flex gap-4">
          <RouterLink
            :to="paymentType === 'program' ? '/dashboard' : '/meus-pedidos'"
            class="px-6 py-3 rounded-lg bg-gradient-to-r from-primary to-secondary text-black font-bold transition-all hover:shadow-[0_0_20px_rgba(244,37,244,0.4)]"
          >
            {{ paymentType === 'program' ? 'Ir para Dashboard' : 'Ver Meus Pedidos' }}
          </RouterLink>
          <RouterLink
            :to="paymentType === 'program' ? '/programas' : '/servicos'"
            class="px-6 py-3 rounded-lg border border-white/10 text-gray-300 hover:bg-white/5 transition-colors"
          >
            Voltar
          </RouterLink>
        </div>
      </div>

      <!-- Pending State -->
      <div v-else-if="paymentStatus === 'pending'" class="flex flex-col items-center text-center max-w-md">
        <div class="w-20 h-20 rounded-full bg-yellow-500/20 border border-yellow-500/50 flex items-center justify-center mb-6 animate-pulse">
          <span class="material-symbols-outlined text-4xl text-yellow-500">schedule</span>
        </div>
        <h1 class="text-3xl font-bold text-white mb-3">Processando Pagamento</h1>
        <p class="text-gray-400 mb-6">
          <span v-if="paymentMethod === 'pix'">Seu pagamento via PIX está sendo processado.</span>
          <span v-else>Estamos confirmando seu pagamento com a operadora do cartão.</span>
          Isso geralmente leva alguns segundos.
        </p>
        <div class="flex flex-col items-center gap-2">
           <div class="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
           <span class="text-xs text-gray-500">Atualizando status automaticamente...</span>
        </div>
      </div>

      <!-- Error/Failed State -->
      <div v-else class="flex flex-col items-center text-center max-w-md">
        <div class="w-20 h-20 rounded-full bg-red-500/20 border border-red-500/50 flex items-center justify-center mb-6">
          <span class="material-symbols-outlined text-4xl text-red-500">error</span>
        </div>
        <h1 class="text-3xl font-bold text-white mb-3">
          {{ paymentStatus === 'failed' ? 'Pagamento Falhou' : 'Pagamento não confirmado' }}
        </h1>
        <p class="text-gray-400 mb-6">
          {{ paymentStatus === 'failed' 
            ? 'O Stripe informou que o pagamento não foi concluído. Verifique seu cartão ou tente outro método.'
            : 'Ainda não recebemos a confirmação do seu pagamento. Verifique seu extrato ou tente novamente.' }}
        </p>
        <RouterLink
          :to="paymentType === 'program' ? `/programas/${route.query.program_id || ''}` : '/servicos'"
          class="px-6 py-3 rounded-lg bg-gradient-to-r from-primary to-secondary text-black font-bold"
        >
          Tentar novamente
        </RouterLink>
      </div>
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
const paymentType = ref<'service' | 'program'>((route.query.type as any) || 'service')
const paymentMethod = ref<'card' | 'pix' | null>(null)
let pollInterval: any = null
let attempts = 0
const MAX_ATTEMPTS = 30 // 30 tentativas x 2s = 60 segundos de espera máxima

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
      loading.value = false // Já mostramos a tela de "pending" em vez de loading infinito
    }

  } catch (error) {
    console.error('Erro ao verificar pagamento:', error)
  }
}

onMounted(() => {
  // Verificação inicial
  checkPaymentStatus()

  // Polling a cada 2 segundos
  pollInterval = setInterval(async () => {
    attempts++
    await checkPaymentStatus()
    
    // Se após 3 tentativas (6s) ainda estiver pendente, forçamos verificação no Stripe
    if (attempts === 3 && paymentStatus.value === 'pending') {
      console.log('Forçando verificação no Stripe...')
      const sessionId = route.query.session_id
      // Não aguardamos o resultado explícito aqui, pois a função atualizará o banco
      // e o próximo polling vai pegar o status 'completed'
      supabase.functions.invoke('check-payment-status', { 
        body: { session_id: sessionId } 
      }).then(({ data, error }) => {
        if (error) console.error('Erro na verificação forçada:', error)
        else console.log('Verificação forçada:', data)
      })
    }

    if (attempts >= MAX_ATTEMPTS) {
      if (pollInterval) clearInterval(pollInterval)
      if (paymentStatus.value === 'pending') {
         // Mantemos pending ou mostramos mensagem de demora
         console.log('Timeout de verificação')
      }
    }
  }, 2000)
})

onUnmounted(() => {
  if (pollInterval) clearInterval(pollInterval)
})
</script>
