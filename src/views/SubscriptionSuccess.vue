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
          <h2 class="text-xl font-black text-white uppercase tracking-widest">Validando Assinatura</h2>
          <p class="text-slate-400 text-sm animate-pulse">Aguarde um instante...</p>
        </div>
      </div>

      <!-- Success State -->
      <div v-else-if="subscriptionActive" class="flex flex-col items-center text-center max-w-2xl relative z-10">
        <!-- Success Icon -->
        <div class="relative mb-12">
          <div class="absolute inset-0 bg-gradient-to-r from-primary to-secondary blur-2xl opacity-50 animate-pulse"></div>
          <div class="relative w-24 h-24 rounded-[32px] bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-2xl transform rotate-12 hover:rotate-0 transition-transform duration-500">
            <span class="material-icons text-5xl text-black font-black">check</span>
          </div>
        </div>

        <div class="space-y-4 mb-10">
          <h1 class="text-4xl md:text-5xl font-black text-white leading-tight tracking-tighter uppercase">
            Assinatura <span class="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Ativada!</span>
          </h1>
          <p class="text-slate-400 text-lg max-w-md mx-auto leading-relaxed">
            Parabéns! Agora você pode publicar seus serviços e alcançar toda a comunidade 323 Network.
          </p>
        </div>

        <!-- What's Next Card -->
        <div class="group relative w-full mb-12 p-1 rounded-[32px] bg-gradient-to-r from-white/10 to-transparent hover:from-primary/30 transition-all duration-500">
          <div class="bg-slate-900/80 backdrop-blur-xl rounded-[30px] p-8 border border-white/5 flex flex-col md:flex-row items-center gap-6 text-left">
            <div class="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center shrink-0">
              <span class="material-icons text-primary text-3xl">rocket_launch</span>
            </div>
            <div class="flex-1 text-center md:text-left">
              <p class="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">
                Próximo Passo
              </p>
              <h3 class="text-xl md:text-2xl font-black text-white tracking-tight">Publique seu primeiro serviço</h3>
            </div>
            <div class="hidden md:block px-4 py-2 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 text-[10px] font-black uppercase tracking-widest">
              Pronto para começar
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <RouterLink
            to="/servicos"
            class="group relative px-8 py-5 rounded-2xl font-black text-black overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-primary/20"
          >
            <div class="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_auto] animate-gradient-x"></div>
            <span class="relative flex items-center justify-center gap-3 uppercase tracking-widest text-sm">
              <span class="material-icons">add_circle</span>
              Publicar Serviço Agora
            </span>
          </RouterLink>

          <RouterLink
            to="/"
            class="px-8 py-5 rounded-2xl border-2 border-white/10 text-white font-black uppercase tracking-widest text-xs hover:bg-white/5 transition-all flex items-center justify-center gap-2"
          >
            Voltar para o Início
          </RouterLink>
        </div>
      </div>

      <!-- Error/Pending State -->
      <div v-else class="flex flex-col items-center text-center max-w-lg relative z-10">
        <div class="w-20 h-20 rounded-[24px] bg-yellow-500/10 border-2 border-yellow-500/30 flex items-center justify-center mb-8">
          <span class="material-icons text-4xl text-yellow-500">hourglass_empty</span>
        </div>
        <h1 class="text-3xl font-black text-white mb-4 uppercase tracking-tighter">
          Processando sua assinatura
        </h1>
        <p class="text-slate-400 mb-10 leading-relaxed text-lg">
          Sua assinatura está sendo processada. Isso pode levar alguns segundos. Não feche esta página.
        </p>
        <RouterLink
          to="/subscription"
          class="px-8 py-4 rounded-2xl bg-white text-black font-black uppercase tracking-widest text-sm hover:scale-105 transition-all shadow-xl"
        >
          Ver Status da Assinatura
        </RouterLink>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSubscriptionsStore } from '@/stores/subscriptions'
import AppLayout from '@/components/layout/AppLayout.vue'

const route = useRoute()
const router = useRouter()
const subscriptionsStore = useSubscriptionsStore()

const loading = ref(true)
const subscriptionActive = ref(false)

let pollInterval: ReturnType<typeof setInterval> | null = null
let attempts = 0
const MAX_ATTEMPTS = 30

async function checkSubscription() {
  await subscriptionsStore.fetchSubscription()
  
  if (subscriptionsStore.hasActiveSubscription) {
    subscriptionActive.value = true
    loading.value = false
    if (pollInterval) clearInterval(pollInterval)
    return true
  }
  
  return false
}

onMounted(async () => {
  const sessionId = route.query.session_id as string
  
  if (sessionId) {
    // Tenta validar via Edge Function primeiro (mais rápido que esperar webhook)
    const success = await subscriptionsStore.verifySubscriptionStatus(sessionId)
    if (success) {
      subscriptionActive.value = true
      loading.value = false
      return
    }
  }

  // Fallback para polling do banco de dados (webhook)
  const isActive = await checkSubscription()
  
  if (!isActive) {
    loading.value = false
    
    // Poll for subscription activation
    pollInterval = setInterval(async () => {
      attempts++
      
      // Se tivermos session_id, tentamos validar via function a cada X tentativas
      if (sessionId && attempts % 3 === 0) {
        const success = await subscriptionsStore.verifySubscriptionStatus(sessionId)
        if (success) {
           subscriptionActive.value = true
           loading.value = false
           if (pollInterval) clearInterval(pollInterval)
           return
        }
      } else {
        await checkSubscription()
      }
      
      if (attempts >= MAX_ATTEMPTS && pollInterval) {
        clearInterval(pollInterval)
      }
    }, 3000)
  }
})

onUnmounted(() => {
  if (pollInterval) clearInterval(pollInterval)
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
</style>
