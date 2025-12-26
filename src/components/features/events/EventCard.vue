<template>
  <div class="relative rounded-xl overflow-hidden shadow-2xl group cursor-pointer h-72 border border-gray-800 hover:border-secondary/30 transition-all">
    <!-- Background Image -->
    <img
      v-if="event.image_url"
      :src="event.image_url"
      :alt="event.titulo"
      class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
    />
    <div v-else class="w-full h-full bg-gradient-to-br from-gray-900 to-black"></div>
    
    <!-- Gradient Overlay -->
    <div class="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/80 to-transparent"></div>
    
    <!-- Badge "DESTAQUE DA SEMANA" -->
    <div class="absolute top-4 left-4 flex gap-2">
      <span class="bg-secondary/90 text-white text-xs font-black px-3 py-1.5 rounded shadow-[0_0_15px_rgba(217,70,239,0.5)] backdrop-blur-sm tracking-wider">
        DESTAQUE DA SEMANA
      </span>
      <!-- Delete Button (only for creator) -->
      <button
        v-if="isOwnEvent"
        class="bg-red-500/90 hover:bg-red-600 text-white text-xs font-black px-3 py-1.5 rounded shadow-lg backdrop-blur-sm transition-colors"
        @click.stop="handleDelete"
      >
        <span class="material-icons-outlined text-sm">delete</span>
      </button>
    </div>
    
    <!-- Content -->
    <div class="absolute bottom-0 left-0 p-6 w-full">
      <div class="flex justify-between items-end">
        <div class="flex-1">
          <h3 class="text-2xl font-black text-white mb-2 text-glow-pink group-hover:text-secondary transition-colors">
            {{ event.titulo }}
          </h3>
          <p class="text-gray-300 text-sm line-clamp-2 max-w-md mb-4">
            {{ event.descricao || 'Junte-se a profissionais brasileiros para uma noite de conexões e oportunidades de negócios.' }}
          </p>
          <div class="mt-4 flex items-center gap-2 text-secondary text-sm font-bold tracking-wide uppercase">
            <span class="material-icons-outlined text-lg">arrow_forward</span>
            Ver Detalhes
          </div>
        </div>
        <div class="hidden sm:flex h-12 w-12 rounded-full bg-secondary text-white items-center justify-center shadow-lg shadow-secondary/40 transform group-hover:rotate-45 transition-transform">
          <span class="material-icons-outlined">arrow_forward</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/lib/supabase'
import { toast } from 'vue-sonner'

interface Event {
  id: string
  titulo: string
  descricao?: string
  data_hora: string
  tipo: 'presencial' | 'webinar'
  local?: string
  image_url?: string
  created_by?: string
}

interface Props {
  event: Event
}

const props = defineProps<Props>()

const emit = defineEmits<{
  click: [eventId: string]
  deleted: [eventId: string]
}>()

const authStore = useAuthStore()
const isOwnEvent = computed(() => authStore.user?.id === props.event.created_by)

async function handleDelete() {
  // Sem confirm por solicitação do usuário
  try {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', props.event.id)

    if (error) throw error

    emit('deleted', props.event.id)
    toast.success('Evento deletado com sucesso!')
  } catch (error) {
    console.error('Error deleting event:', error)
    toast.error('Erro ao deletar evento. Tente novamente.')
  }
}
</script>

<style scoped>
.text-glow-pink {
  text-shadow: 0 0 10px rgba(217, 70, 239, 0.6);
}
</style>
