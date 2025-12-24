<template>
  <AppLayout>
    <div v-if="loading && !event" class="flex justify-center items-center min-h-[60vh]">
      <div class="text-white">Carregando evento...</div>
    </div>

    <div v-else-if="!event" class="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <h2 class="text-white text-2xl font-bold">Evento não encontrado</h2>
      <button
        class="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        @click="router.push('/eventos')"
      >
        Voltar para Eventos
      </button>
    </div>

    <div v-else class="mx-auto max-w-4xl px-4 lg:px-10 py-6 space-y-8">
      <!-- Back Button -->
      <button
        class="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
        @click="router.push('/eventos')"
      >
        <span class="material-symbols-outlined">arrow_back</span>
        Voltar para Eventos
      </button>

      <!-- Event Header -->
      <div class="relative rounded-xl overflow-hidden shadow-2xl">
        <!-- Background Image -->
        <div
          v-if="event.image_url"
          class="absolute inset-0 bg-cover bg-center"
          :style="{ backgroundImage: `url(${event.image_url})` }"
        ></div>
        <div v-else class="absolute inset-0 bg-gradient-to-br from-gray-900 to-black"></div>
        
        <!-- Gradient Overlay -->
        <div class="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/80 to-transparent"></div>
        
        <!-- Content -->
        <div class="relative z-10 p-8 lg:p-16">
          <div class="inline-flex items-center gap-2 bg-black/40 backdrop-blur-md border border-secondary/50 rounded-full px-4 py-1 shadow-[0_0_10px_rgba(0,240,255,0.2)] mb-6">
            <span class="w-2 h-2 rounded-full bg-secondary animate-pulse shadow-[0_0_5px_#00f0ff]"></span>
            <span class="text-secondary text-xs font-bold uppercase tracking-wider">
              {{ isPastEvent ? 'Evento Realizado' : 'Próximo Evento' }}
            </span>
          </div>
          
          <h1 class="text-white text-4xl lg:text-6xl font-black leading-tight mb-4">
            {{ event.titulo }}
          </h1>
          
          <p class="text-white/80 text-lg leading-relaxed max-w-2xl mb-6">
            {{ event.descricao || 'Junte-se a profissionais brasileiros para uma noite de conexões e oportunidades de negócios.' }}
          </p>

          <!-- Event Details -->
          <div class="flex flex-wrap gap-6 mb-6">
            <div class="flex items-center gap-2 text-white/80">
              <span class="material-symbols-outlined text-secondary">calendar_today</span>
              <span>{{ formattedDate }}</span>
            </div>
            <div class="flex items-center gap-2 text-white/80">
              <span class="material-symbols-outlined text-secondary">schedule</span>
              <span>{{ formattedTime }}</span>
            </div>
            <div v-if="event.local" class="flex items-center gap-2 text-white/80">
              <span class="material-symbols-outlined text-secondary">location_on</span>
              <span>{{ event.local }}</span>
            </div>
            <div v-else-if="event.tipo === 'webinar'" class="flex items-center gap-2 text-white/80">
              <span class="material-symbols-outlined text-secondary">videocam</span>
              <span>Online (Zoom)</span>
            </div>
          </div>

          <!-- Confirmation Button -->
          <div v-if="!isPastEvent" class="flex gap-4">
            <button
              v-if="!event.is_confirmed"
              class="flex items-center justify-center rounded-lg h-12 px-8 bg-neon-gradient hover:bg-neon-gradient-hover text-black text-base font-black transition-all shadow-[0_0_20px_rgba(244,37,244,0.4)] hover:shadow-[0_0_30px_rgba(0,240,255,0.6)] transform hover:-translate-y-1"
              @click="handleConfirm"
            >
              <span class="material-symbols-outlined mr-2">check_circle</span>
              Confirmar Presença
            </button>
            <button
              v-else
              class="flex items-center justify-center rounded-lg h-12 px-8 bg-secondary/20 hover:bg-secondary/30 text-secondary border border-secondary text-base font-bold transition-all"
              @click="handleCancel"
            >
              <span class="material-symbols-outlined mr-2">cancel</span>
              Cancelar Confirmação
            </button>
            <div class="flex items-center gap-2 text-white/60 text-sm">
              <span class="material-symbols-outlined">people</span>
              <span>{{ event.confirmations_count || 0 }} confirmados</span>
            </div>
          </div>

          <!-- Recording Link (if past event) -->
          <div v-if="isPastEvent && event.link_gravacao" class="mt-6">
            <a
              :href="event.link_gravacao"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-2 px-6 py-3 bg-secondary/20 hover:bg-secondary/30 text-secondary border border-secondary rounded-lg font-bold transition-all"
            >
              <span class="material-symbols-outlined">play_circle</span>
              Assistir Gravação
            </a>
          </div>
        </div>
      </div>

      <!-- Event Information -->
      <div class="bg-surface-card rounded-xl p-8 border border-white/5">
        <h2 class="text-white text-2xl font-bold mb-6">Informações do Evento</h2>
        
        <div class="space-y-4">
          <div>
            <h3 class="text-white/80 text-sm font-semibold mb-2">Data e Hora</h3>
            <p class="text-white">{{ formattedFullDate }}</p>
          </div>
          
          <div v-if="event.local">
            <h3 class="text-white/80 text-sm font-semibold mb-2">Local</h3>
            <p class="text-white">{{ event.local }}</p>
          </div>
          
          <div v-if="event.tipo === 'webinar'">
            <h3 class="text-white/80 text-sm font-semibold mb-2">Formato</h3>
            <p class="text-white">Webinar Online (Zoom)</p>
          </div>
          
          <div v-if="event.descricao">
            <h3 class="text-white/80 text-sm font-semibold mb-2">Descrição</h3>
            <p class="text-white leading-relaxed whitespace-pre-line">{{ event.descricao }}</p>
          </div>
        </div>
      </div>

      <!-- Confirmed Attendees (Optional - can be expanded later) -->
      <div v-if="event.confirmations_count && event.confirmations_count > 0" class="bg-surface-card rounded-xl p-8 border border-white/5">
        <h2 class="text-white text-2xl font-bold mb-4">
          Confirmados ({{ event.confirmations_count }})
        </h2>
        <p class="text-white/60">
          {{ event.confirmations_count }} pessoa{{ event.confirmations_count !== 1 ? 's' : '' }} confirmou{{ event.confirmations_count !== 1 ? 'ram' : '' }} presença neste evento.
        </p>
      </div>

      <!-- Services CTA (Post-Event) -->
      <div v-if="isPastEvent" class="relative rounded-xl overflow-hidden border border-white/5 shadow-2xl">
        <!-- Background Gradient -->
        <div class="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/10 to-primary/20"></div>
        <div class="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] rounded-full -mr-32 -mt-32"></div>
        <div class="absolute bottom-0 left-0 w-64 h-64 bg-secondary/10 blur-[100px] rounded-full -ml-32 -mb-32"></div>
        
        <!-- Content -->
        <div class="relative z-10 p-8 lg:p-12">
          <div class="flex flex-col lg:flex-row items-center gap-8">
            <!-- Icon and Text -->
            <div class="flex-1 text-center lg:text-left">
              <div class="inline-flex items-center justify-center lg:justify-start mb-4">
                <div class="size-16 rounded-full bg-neon-gradient flex items-center justify-center shadow-[0_0_30px_rgba(244,37,244,0.4)]">
                  <span class="material-symbols-outlined text-black text-3xl">business_center</span>
                </div>
              </div>
              <h2 class="text-white text-3xl lg:text-4xl font-black mb-4">
                Continue sua <span class="bg-clip-text text-transparent bg-neon-gradient">Jornada</span>
              </h2>
              <p class="text-white/80 text-lg leading-relaxed max-w-2xl mb-6">
                O evento terminou, mas sua jornada continua! Explore nossos serviços exclusivos para membros e acelere seu crescimento nos EUA.
              </p>
              <div class="flex flex-wrap gap-4 justify-center lg:justify-start">
                <button
                  @click="router.push('/servicos')"
                  class="flex items-center justify-center gap-2 px-8 py-4 bg-neon-gradient hover:bg-neon-gradient-hover text-black text-base font-black rounded-lg transition-all shadow-[0_0_20px_rgba(244,37,244,0.4)] hover:shadow-[0_0_30px_rgba(0,240,255,0.6)] transform hover:-translate-y-1"
                >
                  <span class="material-symbols-outlined">explore</span>
                  Explorar Serviços
                </button>
                <button
                  @click="router.push('/eventos')"
                  class="flex items-center justify-center gap-2 px-8 py-4 bg-surface-card hover:bg-surface-highlight text-white border border-white/10 hover:border-secondary rounded-lg font-bold transition-all"
                >
                  <span class="material-symbols-outlined">event</span>
                  Ver Próximos Eventos
                </button>
              </div>
            </div>
            
            <!-- Services Preview -->
            <div class="flex-1 w-full lg:w-auto">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div
                  v-for="service in featuredServices"
                  :key="service.id"
                  class="bg-surface-card/80 backdrop-blur-sm border border-white/10 rounded-lg p-4 hover:border-primary/50 transition-all cursor-pointer group"
                  @click="router.push('/servicos')"
                >
                  <div class="flex items-start gap-3">
                    <div class="size-10 rounded-lg bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                      <span class="material-symbols-outlined text-primary">{{ service.icon }}</span>
                    </div>
                    <div class="flex-1">
                      <h3 class="text-white font-bold text-sm mb-1 group-hover:text-primary transition-colors">
                        {{ service.title }}
                      </h3>
                      <p class="text-white/60 text-xs line-clamp-2">
                        {{ service.description }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useEvents } from '@/composables/useEvents'
import AppLayout from '@/components/layout/AppLayout.vue'

const route = useRoute()
const router = useRouter()
const { currentEvent, loading, getEventById, confirmEvent, cancelConfirmation } = useEvents()

const event = computed(() => currentEvent.value)
const eventId = computed(() => route.params.id as string)

// Featured services for CTA (post-event)
const featuredServices = [
  {
    id: 1,
    title: 'Abertura de Empresa',
    description: 'Registre seu negócio nos EUA de forma legal e rápida.',
    icon: 'domain',
  },
  {
    id: 2,
    title: 'Conta Bancária',
    description: 'Abra sua conta Business 100% digital.',
    icon: 'account_balance',
  },
  {
    id: 3,
    title: 'Mentoria de Vistos',
    description: 'Consultoria especializada com advogados.',
    icon: 'badge',
  },
  {
    id: 4,
    title: 'Personal Branding',
    description: 'Construa sua autoridade no mercado americano.',
    icon: 'fingerprint',
  },
]

const isPastEvent = computed(() => {
  if (!event.value) return false
  return new Date(event.value.data_hora) < new Date()
})

const formattedDate = computed(() => {
  if (!event.value) return ''
  const date = new Date(event.value.data_hora)
  return date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
})

const formattedTime = computed(() => {
  if (!event.value) return ''
  const date = new Date(event.value.data_hora)
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}h`
})

const formattedFullDate = computed(() => {
  if (!event.value) return ''
  const date = new Date(event.value.data_hora)
  return date.toLocaleString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
})

async function handleConfirm() {
  if (!event.value) return
  try {
    await confirmEvent(event.value.id)
    await getEventById(eventId.value)
  } catch (error) {
    console.error('Error confirming event:', error)
    alert('Erro ao confirmar presença. Tente novamente.')
  }
}

async function handleCancel() {
  if (!event.value) return
  try {
    await cancelConfirmation(event.value.id)
    await getEventById(eventId.value)
  } catch (error) {
    console.error('Error canceling confirmation:', error)
    alert('Erro ao cancelar confirmação. Tente novamente.')
  }
}

onMounted(async () => {
  if (eventId.value) {
    await getEventById(eventId.value)
  }
})
</script>

<style scoped>
.bg-neon-gradient {
  background: linear-gradient(135deg, #f425f4 0%, #00f0ff 100%);
}

.bg-neon-gradient-hover {
  background: linear-gradient(135deg, #d914d9 0%, #00cce6 100%);
}
</style>

