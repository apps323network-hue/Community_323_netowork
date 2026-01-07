<template>
  <aside class="lg:sticky lg:top-24 h-fit space-y-8">
    <!-- Próximos Eventos Card -->
    <div class="rounded-2xl p-5 shadow-premium dark:shadow-2xl relative overflow-hidden bg-white dark:bg-surface-dark border border-slate-200/60 dark:border-none neon-border-card">
      <div class="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-full blur-xl"></div>
      <h3 class="font-bold text-slate-900 dark:text-white mb-5 flex items-center text-sm uppercase tracking-widest">
        <span class="material-icons-outlined mr-2 text-secondary-dark dark:text-secondary animate-pulse">event_available</span>
        {{ t('sidebar.upcomingEvents') }}
      </h3>
      <div class="space-y-5">
        <div 
          v-for="event in upcomingEvents" 
          :key="event.id"
          class="flex gap-4 items-center group cursor-pointer hover:bg-slate-100 dark:hover:bg-surface-lighter/50 p-2 rounded-lg -mx-2 transition-colors"
          @click="handleEventClick(event.id)"
        >
          <div class="flex-shrink-0 w-12 h-14 bg-gradient-to-b from-slate-100 to-slate-200 dark:from-gray-800 dark:to-black rounded border border-slate-200 dark:border-gray-700 flex flex-col items-center justify-center text-xs font-bold shadow-lg">
            <span class="text-secondary-dark dark:text-secondary uppercase tracking-tighter text-[10px]">{{ event.month }}</span>
            <span class="text-slate-900 dark:text-white text-lg">{{ event.day }}</span>
          </div>
          <div>
            <h4 class="text-sm font-bold text-slate-900 dark:text-white group-hover:text-secondary-dark dark:group-hover:text-secondary transition-colors">{{ event.titulo }}</h4>
            <p class="text-xs text-slate-500 dark:text-gray-500 mt-0.5 flex items-center">
              <span v-if="event.tipo === 'webinar'" class="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5"></span>
              {{ event.local }}
            </p>
          </div>
        </div>
      </div>
      <RouterLink
        to="/eventos/calendario"
        class="w-full mt-6 py-2 text-xs font-bold text-center text-secondary-dark dark:text-secondary border border-slate-200 dark:border-gray-700 hover:border-secondary-dark dark:hover:border-secondary hover:bg-secondary/5 rounded-lg transition-all uppercase tracking-wider block"
      >
        {{ t('events.viewFullCalendar') }}
      </RouterLink>
    </div>

    <!-- Membros em Destaque Card -->
    <div class="bg-white dark:bg-surface-dark rounded-2xl p-5 shadow-premium dark:shadow-2xl border border-slate-200/60 dark:border-white/5">
      <h3 class="font-bold text-slate-900 dark:text-white mb-4 text-sm uppercase tracking-widest border-l-4 border-primary pl-3">
        {{ t('members.featuredMembers') }}
      </h3>
      <div class="space-y-4">
        <div 
          v-for="member in featuredMembers" 
          :key="member.id"
          class="flex items-center justify-between group"
        >
          <RouterLink 
            :to="`/comunidade/${member.id}`"
            class="flex items-center gap-3 flex-grow member-link"
            style="text-decoration: none !important;"
          >
            <div class="relative">
              <Avatar 
                :src="member.avatar_url" 
                :name="member.nome" 
                size="sm" 
                class="ring-2 ring-transparent group-hover:ring-primary transition-all"
              />
              <div 
                v-if="member.isOnline" 
                class="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-surface-dark rounded-full"
              ></div>
            </div>
            <div class="text-xs">
              <p class="font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors truncate">{{ member.nome }}</p>
              <p class="text-slate-500 dark:text-gray-500 truncate w-24">{{ member.area_atuacao }}</p>
            </div>
          </RouterLink>
          <button 
            class="rounded-full transition-all flex items-center justify-center w-8 h-8 flex-shrink-0"
            :class="[
                connectionStatuses[member.id] 
                ? 'text-green-500 bg-green-500/10 cursor-default' 
                : 'text-gray-400 hover:text-primary hover:bg-gray-800'
            ]"
            @click.stop="handleFollowMember(member.id)"
            :disabled="requesting.has(member.id) || !!connectionStatuses[member.id]"
          >
            <div v-if="requesting.has(member.id)" class="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span v-else-if="connectionStatuses[member.id]" class="material-icons-outlined text-xl">check</span>
            <span v-else class="material-icons-outlined text-xl">person_add</span>
          </button>
        </div>
        <div 
          v-if="featuredMembers.length === 0" 
          class="text-center py-4 text-xs text-gray-500"
        >
          <p>{{ t('sidebar.noFeaturedMembers') }}</p>
          <RouterLink to="/comunidade" class="text-primary hover:text-primary-hover mt-1 block">
            {{ t('sidebar.exploreCommunity') }}
          </RouterLink>
        </div>
      </div>
    </div>

    <!-- Seu Negócio Aqui Card -->
    <div class="rounded-2xl p-0 overflow-hidden shadow-premium dark:shadow-2xl relative h-56 group border border-slate-200/60 dark:border-white/5 hover:border-primary/30 transition-all bg-white dark:bg-transparent">
      <div class="w-full h-full bg-gradient-to-b from-white to-slate-50 dark:from-orange-900/20 dark:via-gray-900 dark:to-background-dark"></div>
      <div class="absolute inset-0 bg-gradient-to-t from-slate-50 via-transparent to-transparent dark:from-background-dark dark:via-transparent dark:to-transparent"></div>
      <div class="absolute inset-0 flex flex-col justify-center items-center text-center p-4">
        <div class="w-12 h-12 rounded-full bg-white dark:bg-surface-dark/50 flex items-center justify-center mb-2 border border-primary text-primary group-hover:bg-primary group-hover:text-black transition-all shadow-sm">
          <span class="material-icons-outlined">rocket_launch</span>
        </div>
        <h4 class="text-slate-900 dark:text-white font-bold text-xl mb-1 drop-shadow-md dark:drop-shadow-lg group-hover:text-primary transition-colors">
          {{ t('sidebar.yourBusinessHere') }}
        </h4>
        <p class="text-slate-500 dark:text-gray-300 text-xs mb-4 drop-shadow-sm dark:drop-shadow-md">
          {{ t('sidebar.reachThousands') }}
        </p>
        <button 
          class="bg-neon-gradient text-white font-bold text-xs px-5 py-2 rounded-full shadow-lg shadow-secondary/30 hover:shadow-secondary/60 hover:scale-105 transition-all transform"
          @click="handleBusinessClick"
        >
          {{ t('events.learnMore') }}
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink, useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase'
import Avatar from '@/components/ui/Avatar.vue'
import { useBookmarks } from '@/composables/useBookmarks'
import { useConnections } from '@/composables/useConnections'
import { useAuthStore } from '@/stores/auth'
import { toast } from 'vue-sonner'
import { sendConnectionRequestEmail } from '@/lib/emails'

interface Event {
  id: string
  titulo: string
  data_hora: string
  tipo: 'presencial' | 'webinar'
  local: string
  month: string
  day: string
}

interface Member {
  id: string
  nome: string
  area_atuacao: string
  avatar_url?: string
  isOnline?: boolean
}

const router = useRouter()
const { t } = useI18n()
const upcomingEvents = ref<Event[]>([])
const featuredMembers = ref<Member[]>([])

function formatEventDate(dateString: string) {
  const date = new Date(dateString)
  const months = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ']
  return {
    month: months[date.getMonth()],
    day: date.getDate().toString().padStart(2, '0')
  }
}

async function loadUpcomingEvents() {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .gte('data_hora', new Date().toISOString())
      .order('data_hora', { ascending: true })
      .limit(2)

    if (error) throw error

    upcomingEvents.value = (data || []).map(event => ({
      ...event,
      ...formatEventDate(event.data_hora),
      local: event.tipo === 'webinar' ? `Online • ${new Date(event.data_hora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/New_York' })} EST` : event.local || 'Local a definir'
    }))
  } catch (error) {
    console.error('Error loading upcoming events:', error)
    // Fallback data
    upcomingEvents.value = [
      {
        id: '1',
        titulo: 'Workshop de Vendas',
        data_hora: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        tipo: 'webinar',
        local: 'Online • 19:00 EST',
        month: 'OUT',
        day: '24'
      },
      {
        id: '2',
        titulo: 'Feira de Arte BR',
        data_hora: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        tipo: 'presencial',
        local: 'Nova York, NY',
        month: 'NOV',
        day: '02'
      }
    ]
  }
}

const { fetchBookmarkedMembers } = useBookmarks()
const authStore = useAuthStore()
const { sendConnectionRequest, getConnectionStatus } = useConnections()
const requesting = ref<Set<string>>(new Set())
const connectionStatuses = ref<Record<string, string | null>>({})

async function handleFollowMember(memberId: string) {
  if (!authStore.user) {
    toast.error('Você precisa estar logado para conectar.')
    return
  }
  
  if (requesting.value.has(memberId) || connectionStatuses.value[memberId]) return
  requesting.value.add(memberId)

  try {
    const { success, error } = await sendConnectionRequest(authStore.user.id, memberId)
    
    if (success) {
      connectionStatuses.value[memberId] = 'pending'
      
      // 1. Criar notificação in-app
      await supabase.from('notifications').insert({
        user_id: memberId,
        type: 'connection_request',
        title: 'Nova solicitação de conexão',
        content: `${authStore.user.user_metadata?.nome || 'Um membro'} quer se conectar com você.`,
        metadata: { requester_id: authStore.user.id }
      })

      // 2. Enviar Email
      // Precisamos do email do destinatário
      const { data: profile } = await supabase
        .from('profiles')
        .select('email, nome')
        .eq('id', memberId)
        .single()

      if (profile?.email) {
        await sendConnectionRequestEmail(
          profile.email,
          profile.nome || 'Membro',
          authStore.user.user_metadata?.nome || 'Um membro'
        )
      }

      toast.success('Solicitação de conexão enviada!')
    } else {
      if (error === 'Request already exists') {
        connectionStatuses.value[memberId] = 'pending'
        toast.info('Solicitação já enviada anteriormente.')
      } else {
        console.error(error)
        toast.error('Erro ao conectar. Tente novamente.')
      }
    }
  } catch (err) {
    console.error(err)
    toast.error('Ocorreu um erro inesperado.')
  } finally {
    requesting.value.delete(memberId)
  }
}

function handleEventClick(eventId: string) {
  router.push({ name: 'EventDetail', params: { id: eventId } })
}

async function loadFeaturedMembers() {
  try {
    const members = await fetchBookmarkedMembers()
    
    featuredMembers.value = members.map(member => ({
      id: member.id,
      nome: member.nome,
      area_atuacao: member.area_atuacao || 'Membro da Comunidade',
      avatar_url: member.avatar_url,
      isOnline: false
    }))

    // Batch check connection status
    if (authStore.user) {
        for (const member of featuredMembers.value) {
            const status = await getConnectionStatus(authStore.user.id, member.id)
            connectionStatuses.value[member.id] = status
        }
    }
  } catch (error) {
    console.error('Error loading featured members:', error)
    featuredMembers.value = []
  }
}

function handleBusinessClick() {
  // TODO: Abrir modal ou navegar para página de anúncios
  console.log('Business ad clicked')
}

onMounted(() => {
  loadUpcomingEvents()
  loadFeaturedMembers()
})
</script>



<style scoped>
/* Default is handled by utility classes */

:global(.dark) .neon-border-card {
  position: relative;
  border: 1px solid transparent;
  background: linear-gradient(#12121A, #12121A) padding-box,
              linear-gradient(to right, #00F0FF, #FF00AA) border-box;
}

.member-link, .member-link:hover, .member-link:focus, .member-link:active {
  text-decoration: none !important;
}
</style>


