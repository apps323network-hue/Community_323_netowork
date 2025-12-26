<template>
  <aside class="lg:sticky lg:top-20 h-fit space-y-6">
    <!-- Próximos Eventos Card -->
    <div class="border-gradient-blue-pink rounded-xl p-5 shadow-xl bg-surface-dark relative overflow-hidden">
      <div class="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-full blur-xl"></div>
      <h3 class="font-bold text-white mb-5 flex items-center text-sm uppercase tracking-widest">
        <span class="material-icons-outlined mr-2 text-secondary animate-pulse">event_available</span>
        Próximos Eventos
      </h3>
      <div class="space-y-5">
        <div 
          v-for="event in upcomingEvents" 
          :key="event.id"
          class="flex gap-4 items-center group cursor-pointer hover:bg-surface-lighter/50 p-2 rounded-lg -mx-2 transition-colors"
          @click="handleEventClick(event.id)"
        >
          <div class="flex-shrink-0 w-12 h-14 bg-gradient-to-b from-gray-800 to-black rounded border border-gray-700 flex flex-col items-center justify-center text-xs font-bold shadow-lg">
            <span class="text-secondary uppercase tracking-tighter text-[10px]">{{ event.month }}</span>
            <span class="text-white text-lg">{{ event.day }}</span>
          </div>
          <div>
            <h4 class="text-sm font-bold text-white group-hover:text-secondary transition-colors">{{ event.titulo }}</h4>
            <p class="text-xs text-gray-500 mt-0.5 flex items-center">
              <span v-if="event.tipo === 'webinar'" class="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5"></span>
              {{ event.local }}
            </p>
          </div>
        </div>
      </div>
      <RouterLink
        to="/eventos/calendario"
        class="w-full mt-6 py-2 text-xs font-bold text-center text-secondary border border-gray-700 hover:border-secondary hover:bg-secondary/5 rounded-lg transition-all uppercase tracking-wider block"
      >
        Ver Calendário
      </RouterLink>
    </div>

    <!-- Membros em Destaque Card -->
    <div class="bg-surface-light dark:bg-surface-dark rounded-xl p-5 shadow-xl border-t border-gray-100 dark:border-gray-800">
      <h3 class="font-bold text-white mb-4 text-sm uppercase tracking-widest border-l-4 border-primary pl-3">
        Membros em Destaque
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
                class="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-surface-dark rounded-full"
              ></div>
            </div>
            <div class="text-xs">
              <p class="font-bold text-white group-hover:text-primary transition-colors truncate">{{ member.nome }}</p>
              <p class="text-gray-500 truncate w-24">{{ member.area_atuacao }}</p>
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
          <p>Nenhum membro em destaque.</p>
          <RouterLink to="/comunidade" class="text-primary hover:text-primary-hover mt-1 block">
            Explorar comunidade
          </RouterLink>
        </div>
      </div>
    </div>

    <!-- Seu Negócio Aqui Card -->
    <div class="rounded-xl p-0 overflow-hidden shadow-xl relative h-56 group border border-gray-800 hover:border-primary/30 transition-all">
      <div class="w-full h-full bg-gradient-to-b from-orange-900/20 via-gray-900 to-background-dark"></div>
      <div class="absolute inset-0 bg-gradient-to-t from-background-dark via-transparent to-transparent"></div>
      <div class="absolute inset-0 flex flex-col justify-center items-center text-center p-4">
        <div class="w-12 h-12 rounded-full bg-surface-dark/50 flex items-center justify-center mb-2 border border-primary text-primary group-hover:bg-primary group-hover:text-black transition-all">
          <span class="material-icons-outlined">rocket_launch</span>
        </div>
        <h4 class="text-white font-bold text-xl mb-1 drop-shadow-lg group-hover:text-primary transition-colors">
          Seu Negócio Aqui
        </h4>
        <p class="text-gray-300 text-xs mb-4 drop-shadow-md">
          Alcance milhares de brasileiros nos EUA.
        </p>
        <button 
          class="bg-neon-gradient text-white font-bold text-xs px-5 py-2 rounded-full shadow-lg shadow-secondary/30 hover:shadow-secondary/60 hover:scale-105 transition-all transform"
          @click="handleBusinessClick"
        >
          Saiba Mais
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
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
  // TODO: Navegar para detalhes do evento
  console.log('Event clicked:', eventId)
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
.border-gradient-blue-pink {
  position: relative;
  border: 1px solid transparent;
  background: linear-gradient(#12121A, #12121A) padding-box,
              linear-gradient(to right, #00F0FF, #FF00AA) border-box;
}

.member-link, .member-link:hover, .member-link:focus, .member-link:active {
  text-decoration: none !important;
}
</style>


