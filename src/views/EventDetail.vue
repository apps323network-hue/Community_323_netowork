<template>
  <AppLayout hideSidebars fluid>
    <div class="min-h-screen bg-background-dark relative overflow-x-hidden pb-20">
      <!-- Decorative Background Elements -->
      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-primary/10 rounded-full blur-[150px] pointer-events-none"></div>
      <div class="absolute top-[40%] left-0 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div class="absolute bottom-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>

      <!-- Loading State -->
      <div v-if="loading && !event" class="flex flex-col items-center justify-center min-h-[80vh] gap-8 relative z-10">
        <div class="relative w-24 h-24">
          <div class="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
          <div class="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <div class="absolute inset-0 rounded-full shadow-[0_0_30px_rgba(244,37,244,0.3)] animate-pulse"></div>
        </div>
        <p class="text-white/60 font-medium animate-pulse tracking-widest uppercase text-sm">{{ t('common.loading') }}</p>
      </div>

      <!-- Not Found State -->
      <div v-else-if="!event" class="flex flex-col items-center justify-center min-h-[80vh] gap-6 relative z-10 text-center px-4">
        <div class="w-20 h-20 rounded-[24px] bg-white/5 border border-white/10 flex items-center justify-center mb-4">
          <span class="material-symbols-outlined text-4xl text-white/40">event_busy</span>
        </div>
        <h2 class="text-3xl font-black text-white uppercase tracking-tight">{{ t('events.notFound') }}</h2>
        <button
          class="group relative px-8 py-4 rounded-xl font-bold text-black overflow-hidden transition-all hover:scale-105 active:scale-95"
          @click="router.push('/eventos')"
        >
          <div class="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_auto] animate-gradient-x"></div>
          <span class="relative flex items-center justify-center gap-2">
            <span class="material-symbols-outlined">arrow_back</span>
            {{ t('events.backToEvents') }}
          </span>
        </button>
      </div>

      <!-- Content -->
      <div v-else class="relative z-10">
        <!-- Back Navigation -->
        <div class="max-w-7xl mx-auto px-4 lg:px-10 pt-8 mb-8">
          <button
            class="flex items-center gap-2 text-white/50 hover:text-white transition-colors group"
            @click="router.push('/eventos')"
          >
            <div class="p-2 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors">
              <span class="material-symbols-outlined text-sm">arrow_back</span>
            </div>
            <span class="text-sm font-bold uppercase tracking-wider">{{ t('events.backToEvents') }}</span>
          </button>
        </div>

        <div class="max-w-7xl mx-auto px-4 lg:px-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          <!-- Left Column: Main Info -->
          <div class="lg:col-span-8 space-y-8">
            <!-- Hero Card -->
            <div class="relative rounded-[40px] overflow-hidden border border-white/10 bg-slate-900/50 backdrop-blur-sm shadow-2xl">
              <!-- Image -->
              <div class="relative h-[300px] sm:h-[400px] group">
                <div v-if="event.image_url" class="absolute inset-0 bg-cover bg-center transition-transform duration-1000 " :style="{ backgroundImage: `url(${event.image_url})` }"></div>
                <div v-else class="absolute inset-0 bg-gradient-to-br from-slate-800 to-black"></div>
                <div class="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
                
                <!-- Date Badge Floating -->
                <div class="absolute top-6 left-6 flex flex-col items-center bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-3 min-w-[70px] shadow-xl">
                  <span class="text-xs font-bold text-white/80 uppercase tracking-widest">{{ formattedDate.split('de')[0] }}</span>
                  <span class="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50">{{ new Date(event.data_hora).getDate() }}</span>
                </div>

                <!-- Status Badge -->
                 <div class="absolute top-6 right-6 inline-flex items-center gap-2 bg-black/60 backdrop-blur-md border border-white/10 rounded-full px-4 py-2">
                  <span class="relative flex h-2.5 w-2.5">
                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" :class="isPastEvent ? 'bg-slate-500' : 'bg-secondary'"></span>
                    <span class="relative inline-flex rounded-full h-2.5 w-2.5" :class="isPastEvent ? 'bg-slate-500' : 'bg-secondary'"></span>
                  </span>
                  <span class="text-xs font-bold uppercase tracking-widest text-white/90">
                    {{ isPastEvent ? t('events.eventFinished') : t('events.upcomingEvent') }}
                  </span>
                </div>

                <!-- Share Button -->
                <div class="absolute top-20 right-6 z-30">
                  <ShareButton
                    v-if="event"
                    :options="{
                      url: `/eventos/${event.id}`,
                      title: translatedTitle,
                      description: translatedDescription?.substring(0, 160) || '',
                      imageUrl: event.image_url,
                      type: 'event',
                      id: event.id
                    }"
                    variant="icon"
                  />
                </div>
              </div>

              <!-- Title & Desc -->
              <div class="relative -mt-20 p-8 sm:p-10 z-20">
                <div class="flex items-start justify-between gap-4 mb-6">
                  <h1 class="text-4xl sm:text-5xl md:text-6xl font-black text-white leading-[0.9] tracking-tighter drop-shadow-lg flex-1">
                    {{ translatedTitle }}
                  </h1>
                </div>
                
                <div class="flex flex-wrap gap-4 mb-8">
                   <!-- Details Chips -->
                   <div class="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm font-bold text-white/80">
                      <span class="material-symbols-outlined text-primary">schedule</span>
                      {{ formattedTime }}
                   </div>
                    <div class="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm font-bold text-white/80">
                       <span class="material-symbols-outlined text-secondary">{{ event.tipo === 'webinar' ? 'videocam' : 'location_on' }}</span>
                       {{ translatedLocal }}
                    </div>
                </div>

                <div class="prose prose-invert max-w-none text-white/70 text-lg leading-relaxed">
                   <p class="whitespace-pre-line">{{ translatedDescription }}</p>
                </div>
              </div>
            </div>

            <!-- Services CTA (Post-Event) -->
            <div v-if="isPastEvent" class="relative rounded-[32px] overflow-hidden p-[1px] bg-gradient-to-r from-primary/30 to-secondary/30">
               <div class="bg-slate-900/90 backdrop-blur-xl rounded-[31px] p-8 md:p-12 relative overflow-hidden">
                  <div class="absolute -right-20 -top-20 w-64 h-64 bg-primary/20 rounded-full blur-[80px]"></div>
                  
                  <div class="relative z-10 text-center">
                    <div class="inline-flex justify-center items-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary mb-6 shadow-lg shadow-primary/20">
                       <span class="material-symbols-outlined text-black text-3xl font-bold">rocket_launch</span>
                    </div>
                    <h2 class="text-3xl md:text-4xl font-black text-white mb-4 tracking-tight">
                      {{ t('events.continueYour') }} <span class="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">{{ t('events.journey') }}</span>
                    </h2>
                    <p class="text-white/60 text-lg max-w-xl mx-auto mb-8">{{ t('events.postEventMessage') }}</p>
                    
                    <div class="flex flex-wrap gap-4 justify-center">
                      <button
                        @click="router.push('/servicos')"
                        class="px-8 py-4 bg-white text-black rounded-xl font-black uppercase tracking-widest text-sm hover:scale-105 transition-transform shadow-xl"
                      >
                        {{ t('events.exploreServices') }}
                      </button>
                       <button
                          @click="router.push('/eventos')"
                           class="px-8 py-4 border border-white/10 text-white rounded-xl font-black uppercase tracking-widest text-sm hover:bg-white/5 transition-colors"
                        >
                           {{ t('events.viewUpcoming') }}
                        </button>
                    </div>
                  </div>
               </div>
            </div>
          </div>

          <!-- Right Column: Actions & Details -->
          <div class="lg:col-span-4 space-y-6">
            
            <!-- Action Card -->
            <div class="sticky top-6">
              <div v-if="!isPastEvent" class="rounded-[32px] p-6 bg-slate-800/50 backdrop-blur-md border border-white/10 shadow-xl">
                 <div class="text-center mb-6">
                    <p class="text-white/50 text-xs font-bold uppercase tracking-widest mb-1">{{ t('events.registrationStatus') }}</p>
                    <div v-if="isUserConfirmed" class="flex flex-col items-center gap-2">
                       <div class="text-green-400 font-black text-xl flex items-center gap-2">
                          <span class="material-symbols-outlined">check_circle</span>
                          {{ t('events.confirmed') }}
                       </div>
                       <p class="text-white/40 text-xs text-center px-4">{{ t('events.confirmedMessage') }}</p>
                    </div>
                     <div v-else class="flex flex-col items-center gap-2">
                       <div class="text-white font-bold text-xl">{{ t('events.notRegistered') }}</div>
                       <p class="text-white/40 text-xs text-center px-4">{{ t('events.notRegisteredMessage') }}</p>
                    </div>
                 </div>

                 <!-- Main Action Button -->
                  <button
                    v-if="!isUserConfirmed && !showEnrollmentPrompt"
                    class="w-full group relative px-6 py-4 rounded-xl font-black text-black overflow-hidden transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-primary/20 mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
                    :disabled="confirming"
                    @click="handleConfirm"
                  >
                    <div class="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_auto] animate-gradient-x"></div>
                    <span class="relative flex items-center justify-center gap-2 text-sm uppercase tracking-widest">
                      <template v-if="confirming">
                        <div class="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                        {{ t('common.loading') }}
                      </template>
                      <template v-else>
                        <span class="material-symbols-outlined">celebration</span>
                        {{ t('events.confirmPresence') }}
                      </template>
                    </span>
                  </button>

                  <!-- Enrollment Required Prompt (Replaces Confirm Button on Check) -->
                  <div v-else-if="showEnrollmentPrompt && !isUserConfirmed" class="w-full mb-4 space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div class="bg-primary/10 border border-primary/20 rounded-xl p-4 text-center">
                      <p class="text-primary-foreground/80 text-xs mb-3 font-medium flex items-center justify-center gap-2">
                         <span class="material-symbols-outlined text-sm">info</span>
                         {{ t('events.enrollmentRequired') }}
                      </p>
                       <button
                        class="w-full group relative px-6 py-3 rounded-lg font-bold text-white overflow-hidden transition-all hover:scale-[1.02] shadow-lg shadow-primary/10 bg-gradient-to-r from-primary to-secondary"
                        @click="router.push(`/programs/${requiredProgramId || event.program_id}`)"
                      >
                        <span class="relative flex items-center justify-center gap-2 text-sm uppercase tracking-widest">
                          {{ t('events.goToProgram') }}
                           <span class="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
                        </span>
                      </button>
                    </div>
                  </div>

                  <button
                    v-else
                    class="w-full px-6 py-4 rounded-xl font-bold text-white/70 border border-white/10 hover:bg-white/5 hover:text-white transition-all text-sm uppercase tracking-widest flex items-center justify-center gap-2 mb-4"
                    @click="handleCancel"
                  >
                     <span class="material-symbols-outlined text-sm">cancel</span>
                     {{ t('events.cancelConfirmation') }}
                  </button>

                  <!-- Confirmed Users Visualization -->
                  <div v-if="event.confirmed_users && event.confirmed_users.length > 0" class="flex flex-col items-center gap-3 py-4 border-t border-white/5">
                     <div class="flex -space-x-3 overflow-hidden p-1">
                        <template v-for="user in event.confirmed_users.slice(0, 5)" :key="user.user_id">
                          <img 
                            v-if="user.avatar_url" 
                            :src="user.avatar_url" 
                            :alt="user.nome || 'User'"
                            class="w-10 h-10 rounded-full border-2 border-slate-800 object-cover ring-2 ring-transparent hover:ring-primary transition-all hover:z-10 cursor-help"
                            :title="user.nome"
                          />
                          <div 
                            v-else 
                            class="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 border-2 border-slate-800 flex items-center justify-center text-xs font-bold text-white uppercase ring-2 ring-transparent hover:ring-primary transition-all hover:z-10 cursor-help"
                            :title="user.nome"
                          >
                            {{ user.nome ? user.nome.charAt(0) : 'U' }}
                          </div>
                        </template>
                        <div v-if="event.confirmed_users.length > 5" class="w-10 h-10 rounded-full bg-slate-600 border-2 border-slate-800 flex items-center justify-center text-xs font-bold text-white z-10">
                          +{{ event.confirmed_users.length - 5 }}
                        </div>
                     </div>
                     <p class="text-white/60 text-xs font-medium">
                        <strong class="text-white">{{ event.confirmations_count || 0 }}</strong> {{ t('events.confirmed_count') }}
                     </p>
                  </div>
                  <div v-else class="text-center py-4 border-t border-white/5">
                    <p class="text-white/40 text-xs italic">{{ t('events.beTheFirstToConfirm') || 'Seja o primeiro a confirmar!' }}</p>
                  </div>
              </div>

              <!-- Past Event Recording Card -->
              <div v-else-if="event.link_gravacao" class="rounded-[32px] p-6 bg-slate-800/50 backdrop-blur-md border border-white/10 shadow-xl">
                  <h3 class="text-white font-black uppercase tracking-wide text-center mb-4">{{ t('events.missedEvent') }}</h3>
                  <a
                    :href="event.link_gravacao"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="flex items-center justify-center gap-2 w-full px-6 py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition-all border border-white/10"
                  >
                    <span class="material-symbols-outlined text-red-500">play_circle</span>
                    {{ t('events.watchRecording') }}
                  </a>
              </div>

              <!-- Organizer Card Optional -->
              <div class="mt-6 rounded-[32px] p-6 bg-slate-900/30 border border-white/5">
                 <h4 class="text-white/40 text-xs font-bold uppercase tracking-widest mb-4">{{ t('events.organization') }}</h4>
                 <div class="flex items-center gap-3">
                    <div class="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center border border-white/10">
                       <span class="font-black text-white text-lg">3N</span>
                    </div>
                    <div>
                       <p class="text-white font-bold text-sm">323 Network</p>
                       <p class="text-white/40 text-xs">Community Team</p>
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
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useEvents } from '@/composables/useEvents'
import { useAuthStore } from '@/stores/auth'
import AppLayout from '@/components/layout/AppLayout.vue'
import ShareButton from '@/components/ui/ShareButton.vue'
import { toast } from 'vue-sonner'
import { useDynamicMeta } from '@/composables/useDynamicMeta'
import { watch } from 'vue'

const route = useRoute()
const router = useRouter()
const { t, locale } = useI18n()
const { currentEvent, loading, getEventById, confirmEvent, cancelConfirmation } = useEvents()
const confirming = ref(false)
const showEnrollmentPrompt = ref(false)
const requiredProgramId = ref<string | null>(null)

const translatedTitle = computed(() => {
  if (!event.value) return ''
  return locale.value === 'en-US' && event.value.titulo_en ? event.value.titulo_en : event.value.titulo_pt
})

const translatedDescription = computed(() => {
  if (!event.value) return ''
  return locale.value === 'en-US' && event.value.descricao_en ? event.value.descricao_en : event.value.descricao_pt
})

const translatedLocal = computed(() => {
  if (!event.value) return ''
  if (event.value.tipo === 'webinar') return t('events.online')
  const local = locale.value === 'en-US' && event.value.local_en ? event.value.local_en : event.value.local_pt
  return local || t('events.locationToBeDefined')
})

const event = computed(() => currentEvent.value)
const eventId = computed(() => route.params.id as string)


const isPastEvent = computed(() => {
  if (!event.value) return false
  return new Date(event.value.data_hora) < new Date()
})

const authStore = useAuthStore()
const currentUser = computed(() => authStore.user)

const isUserConfirmed = computed(() => {
  if (!event.value?.confirmed_users || !currentUser.value) return false
  return event.value.confirmed_users.some(u => u.user_id === currentUser.value?.id)
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

async function handleConfirm() {
  const currentEvt = event.value
  if (!currentEvt || confirming.value) return
  confirming.value = true
  try {
    await confirmEvent(currentEvt.id)
    await getEventById(eventId.value)
    toast.success(t('events.presenceConfirmed'))
  } catch (error: any) {
    if (error.message?.startsWith('ENROLLMENT_REQUIRED')) {
       showEnrollmentPrompt.value = true
       const parts = error.message.split(':')
       if (parts.length > 1) {
         requiredProgramId.value = parts[1]
       }
    } else if (error.message?.includes('enrolled')) {
       showEnrollmentPrompt.value = true
    } else {
      toast.error(t('errors.genericError'))
    }
  } finally {
    confirming.value = false
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

// Set dynamic meta tags for social sharing
watch(() => event.value, (newEvent) => {
  if (newEvent) {
    useDynamicMeta({
      title: `${translatedTitle.value} - 323 Network`,
      description: translatedDescription.value?.substring(0, 160) || '',
      image: newEvent.image_url,
      url: `/eventos/${newEvent.id}`,
      type: 'event'
    })
  }
}, { immediate: true })

onMounted(async () => {
  if (eventId.value) {
    await getEventById(eventId.value)
  }
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
