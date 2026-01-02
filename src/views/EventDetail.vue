<template>
  <AppLayout>
    <!-- Loading State -->
    <div v-if="loading || !isCorrectEvent" class="flex flex-col justify-center items-center min-h-[60vh] gap-6">
      <div class="relative">
        <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-secondary"></div>
        <div class="absolute inset-0 rounded-full shadow-[0_0_15px_rgba(0,240,255,0.5)] animate-pulse"></div>
      </div>
      <p class="text-slate-600 dark:text-white/60 font-medium animate-pulse">{{ t('common.loading') }}</p>
    </div>

    <div v-else-if="!event" class="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <h2 class="text-slate-900 dark:text-white text-2xl font-bold">{{ t('events.notFound') }}</h2>
      <button
        class="px-6 py-3 bg-neon-gradient text-black rounded-lg hover:bg-neon-gradient-hover transition-all shadow-lg hover:shadow-neon-pink"
        @click="router.push('/eventos')"
      >
        {{ t('events.backToEvents') }}
      </button>
    </div>

    <div v-else class="mx-auto max-w-7xl px-4 lg:px-10 py-6 space-y-8">
      <!-- Back Button -->
      <button
        class="flex items-center gap-2 text-slate-600 dark:text-white/70 hover:text-slate-900 dark:hover:text-white transition-colors"
        @click="router.push('/eventos')"
      >
        <span class="material-symbols-outlined">arrow_back</span>
        {{ t('events.backToEvents') }}
      </button>

      <!-- Event Header -->
      <div class="relative rounded-xl overflow-hidden shadow-2xl border border-slate-200 dark:border-white/5">
        <!-- Background Image -->
        <div
          v-if="event.image_url"
          class="absolute inset-0 bg-cover bg-center"
          :style="{ backgroundImage: `url(${event.image_url})` }"
        ></div>
        <div v-else class="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 dark:from-gray-900 dark:to-black"></div>
        
        <!-- Gradient Overlay -->
        <div class="absolute inset-0 bg-gradient-to-t from-white/90 dark:from-background-dark via-white/70 dark:via-background-dark/80 to-transparent"></div>
        
        <!-- Content -->
        <div class="relative z-10 p-8 lg:p-16">
          <div class="inline-flex items-center gap-2 bg-white/80 dark:bg-black/40 backdrop-blur-md border border-secondary/50 rounded-full px-4 py-1 shadow-[0_0_10px_rgba(0,240,255,0.2)] mb-6">
            <span class="w-2 h-2 rounded-full bg-secondary animate-pulse shadow-[0_0_5px_#00f0ff]"></span>
            <span class="text-secondary text-xs font-bold uppercase tracking-wider">
              {{ isPastEvent ? t('events.eventFinished') : t('events.upcomingEvent') }}
            </span>
          </div>
          
          <h1 class="text-slate-900 dark:text-white text-4xl lg:text-6xl font-black leading-tight mb-4">
            {{ event.titulo }}
          </h1>
          
          <p class="text-slate-700 dark:text-white/80 text-lg leading-relaxed max-w-2xl mb-6">
            {{ event.descricao || 'Junte-se a profissionais brasileiros para uma noite de conexões e oportunidades de negócios.' }}
          </p>

          <!-- Event Details -->
          <div class="flex flex-wrap gap-6 mb-6">
            <div class="flex items-center gap-2 text-slate-700 dark:text-white/80">
              <span class="material-symbols-outlined text-secondary">calendar_today</span>
              <span>{{ formattedDate }}</span>
            </div>
            <div class="flex items-center gap-2 text-slate-700 dark:text-white/80">
              <span class="material-symbols-outlined text-secondary">schedule</span>
              <span>{{ formattedTime }}</span>
            </div>
            <div v-if="event.local" class="flex items-center gap-2 text-slate-700 dark:text-white/80">
              <span class="material-symbols-outlined text-secondary">location_on</span>
              <span>{{ event.local }}</span>
            </div>
            <div v-else-if="event.tipo === 'webinar'" class="flex items-center gap-2 text-slate-700 dark:text-white/80">
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
              {{ t('events.confirmPresence') }}
            </button>
            <button
              v-else
              class="flex items-center justify-center rounded-lg h-12 px-8 bg-secondary/10 dark:bg-secondary/20 hover:bg-secondary/20 dark:hover:bg-secondary/30 text-secondary border border-secondary/50 dark:border-secondary text-base font-bold transition-all shadow-lg hover:shadow-neon-blue"
              @click="handleCancel"
            >
              <span class="material-symbols-outlined mr-2">cancel</span>
              {{ t('events.cancelConfirmation') }}
            </button>
            <div class="flex items-center gap-2 text-slate-600 dark:text-white/60 text-sm">
              <span class="material-symbols-outlined">people</span>
              <span>{{ event.confirmations_count || 0 }} {{ t('events.confirmed_count') }}</span>
            </div>
          </div>

          <!-- Recording Link (if past event) -->
          <div v-if="isPastEvent && event.link_gravacao" class="mt-6">
            <a
              :href="event.link_gravacao"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-2 px-6 py-3 bg-secondary/10 dark:bg-secondary/20 hover:bg-secondary/20 dark:hover:bg-secondary/30 text-secondary border border-secondary/50 dark:border-secondary rounded-lg font-bold transition-all shadow-lg hover:shadow-neon-blue"
            >
              <span class="material-symbols-outlined">play_circle</span>
              {{ t('events.watchRecording') }}
            </a>
          </div>
        </div>
      </div>

      <!-- Event Information -->
      <div class="bg-white dark:bg-surface-card rounded-xl p-8 border border-slate-200 dark:border-white/5 shadow-lg dark:shadow-xl">
        <h2 class="text-slate-900 dark:text-white text-2xl font-bold mb-6">{{ t('events.eventInfo') }}</h2>
        
        <div class="space-y-4">
          <div>
            <h3 class="text-slate-600 dark:text-white/80 text-sm font-semibold mb-2">{{ t('events.dateTimeLabel') }}</h3>
            <p class="text-slate-900 dark:text-white">{{ formattedFullDate }}</p>
          </div>
          
          <div v-if="event.local">
            <h3 class="text-slate-600 dark:text-white/80 text-sm font-semibold mb-2">{{ t('events.locationLabel') }}</h3>
            <p class="text-slate-900 dark:text-white">{{ event.local }}</p>
          </div>
          
          <div v-if="event.tipo === 'webinar'">
            <h3 class="text-slate-600 dark:text-white/80 text-sm font-semibold mb-2">{{ t('events.formatLabel') }}</h3>
            <p class="text-slate-900 dark:text-white">Webinar Online (Zoom)</p>
          </div>
          
          <div v-if="event.descricao">
            <h3 class="text-slate-600 dark:text-white/80 text-sm font-semibold mb-2">{{ t('events.descriptionLabel') }}</h3>
            <p class="text-slate-900 dark:text-white leading-relaxed whitespace-pre-line">{{ event.descricao }}</p>
          </div>
        </div>
      </div>

      <!-- Confirmed Attendees -->
      <div v-if="event.confirmations_count && event.confirmations_count > 0" class="bg-white dark:bg-surface-card rounded-xl p-8 border border-slate-200 dark:border-white/5 shadow-lg dark:shadow-xl">
        <h2 class="text-slate-900 dark:text-white text-2xl font-bold mb-4">
          {{ t('events.confirmedLabel') }} ({{ event.confirmations_count }})
        </h2>
        <p class="text-slate-600 dark:text-white/60">
          {{ event.confirmations_count }} {{ event.confirmations_count === 1 ? t('events.personConfirmed') : t('events.peopleConfirmed') }}
        </p>
      </div>

      <!-- Services CTA (Post-Event) -->
      <div v-if="isPastEvent" class="relative rounded-xl overflow-hidden border border-slate-200 dark:border-white/5 shadow-2xl bg-white dark:bg-surface-card">
        <!-- Background Gradient -->
        <div class="absolute inset-0 bg-gradient-to-br from-primary/10 dark:from-primary/20 via-secondary/5 dark:via-secondary/10 to-primary/10 dark:to-primary/20"></div>
        <div class="absolute top-0 right-0 w-64 h-64 bg-primary/5 dark:bg-primary/10 blur-[100px] rounded-full -mr-32 -mt-32"></div>
        <div class="absolute bottom-0 left-0 w-64 h-64 bg-secondary/5 dark:bg-secondary/10 blur-[100px] rounded-full -ml-32 -mb-32"></div>
        
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
              <h2 class="text-slate-900 dark:text-white text-3xl lg:text-4xl font-black mb-4">
                {{ t('events.continueYour') }} <span class="neon-text-gradient">{{ t('events.journey') }}</span>
              </h2>
              <p class="text-slate-700 dark:text-white/80 text-lg leading-relaxed max-w-2xl mb-6">
                {{ t('events.postEventMessage') }}
              </p>
              <div class="flex flex-wrap gap-4 justify-center lg:justify-start">
                <button
                  @click="router.push('/servicos')"
                  class="flex items-center justify-center gap-2 px-8 py-4 bg-neon-gradient hover:bg-neon-gradient-hover text-black text-base font-black rounded-lg transition-all shadow-[0_0_20px_rgba(244,37,244,0.4)] hover:shadow-[0_0_30px_rgba(0,240,255,0.6)] transform hover:-translate-y-1"
                >
                  <span class="material-symbols-outlined">explore</span>
                  {{ t('events.exploreServices') }}
                </button>
                <button
                  @click="router.push('/eventos')"
                  class="flex items-center justify-center gap-2 px-8 py-4 bg-white dark:bg-surface-card hover:bg-slate-50 dark:hover:bg-surface-highlight text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 hover:border-secondary rounded-lg font-bold transition-all shadow-lg hover:shadow-neon-blue"
                >
                  <span class="material-symbols-outlined">event</span>
                  {{ t('events.viewUpcoming') }}
                </button>
              </div>
            </div>
            
            <!-- Services Preview -->
            <div class="flex-1 w-full lg:w-auto">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div
                  v-for="service in featuredServices"
                  :key="service.id"
                  class="bg-white/80 dark:bg-surface-card/80 backdrop-blur-sm border border-slate-200 dark:border-white/10 rounded-lg p-4 hover:border-primary/50 transition-all cursor-pointer group shadow-md hover:shadow-lg"
                  @click="router.push('/servicos')"
                >
                  <div class="flex items-start gap-3">
                    <div class="size-10 rounded-lg bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                      <span class="material-symbols-outlined text-primary">{{ service.icon }}</span>
                    </div>
                    <div class="flex-1">
                      <h3 class="text-slate-900 dark:text-white font-bold text-sm mb-1 group-hover:text-primary transition-colors">
                        {{ t(service.titleKey || '') }}
                      </h3>
                      <p class="text-slate-600 dark:text-white/60 text-xs line-clamp-2">
                        {{ t(service.descriptionKey || '') }}
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
import { useI18n } from 'vue-i18n'
import { useEvents } from '@/composables/useEvents'
import AppLayout from '@/components/layout/AppLayout.vue'

const route = useRoute()
const router = useRouter()
const { t, locale } = useI18n()
const { currentEvent, loading, getEventById, confirmEvent, cancelConfirmation } = useEvents()

const event = computed(() => currentEvent.value)
const eventId = computed(() => route.params.id as string)
const isCorrectEvent = computed(() => event.value?.id === eventId.value)

// Featured services for CTA (post-event)
const featuredServices = [
  {
    id: 1,
    titleKey: 'services.businessOpening',
    descriptionKey: 'services.businessOpeningDesc',
    icon: 'domain',
  },
  {
    id: 2,
    titleKey: 'services.bankAccount',
    descriptionKey: 'services.bankAccountDesc',
    icon: 'account_balance',
  },
  {
    id: 3,
    titleKey: 'services.visaMentorship',
    descriptionKey: 'services.visaMentorshipDesc',
    icon: 'badge',
  },
  {
    id: 4,
    titleKey: 'services.personalBranding',
    descriptionKey: 'services.personalBrandingDesc',
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
  return date.toLocaleDateString(locale.value, {
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
  return date.toLocaleString(locale.value, {
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
    alert(t('errors.genericError'))
  }
}

async function handleCancel() {
  if (!event.value) return
  try {
    await cancelConfirmation(event.value.id)
    await getEventById(eventId.value)
  } catch (error) {
    console.error('Error canceling confirmation:', error)
    alert(t('errors.genericError'))
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

.neon-text-gradient {
  background: linear-gradient(135deg, #f425f4 0%, #00f0ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
</style>

