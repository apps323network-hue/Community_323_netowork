<template>
  <div class="bg-surface-card rounded-xl border border-white/5 overflow-hidden hover:border-white/10 transition-all">
    <!-- Banner Image -->
    <div
      v-if="event.image_url"
      class="h-48 bg-cover bg-center"
      :style="{ backgroundImage: `url(${event.image_url})` }"
    ></div>
    <div v-else class="h-48 bg-gradient-to-br from-primary/20 to-secondary/20"></div>

    <!-- Content -->
    <div class="p-6">
      <!-- Header -->
      <div class="flex items-start justify-between mb-4">
        <div class="flex-1">
          <h3 class="text-white text-xl font-bold mb-2 line-clamp-2">{{ event.titulo }}</h3>
          <StatusBadge :status="event.status" />
        </div>
      </div>

      <!-- Description -->
      <p v-if="event.descricao" class="text-white/60 text-sm mb-4 line-clamp-2">
        {{ event.descricao }}
      </p>

      <!-- Event Details -->
      <div class="space-y-2 mb-4">
        <div class="flex items-center gap-2 text-white/70 text-sm">
          <span class="material-symbols-outlined text-secondary text-base">calendar_today</span>
          <span>{{ formattedDate }}</span>
        </div>
        <div class="flex items-center gap-2 text-white/70 text-sm">
          <span class="material-symbols-outlined text-secondary text-base">schedule</span>
          <span>{{ formattedTime }}</span>
        </div>
        <div v-if="event.local" class="flex items-center gap-2 text-white/70 text-sm">
          <span class="material-symbols-outlined text-secondary text-base">location_on</span>
          <span>{{ event.local }}</span>
        </div>
        <div class="flex items-center gap-2 text-white/70 text-sm">
          <span class="material-symbols-outlined text-secondary text-base">person</span>
          <span>{{ event.creator_name || 'Usuário' }}</span>
        </div>
        <div v-if="event.program_name" class="flex items-center gap-2 text-white/70 text-sm">
          <span class="material-symbols-outlined text-secondary text-base">school</span>
          <span class="font-medium text-primary">{{ event.program_name }}</span>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex flex-col gap-3">
        <div class="flex gap-3">
          <button
            v-if="event.status === 'pending'"
            class="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 rounded-lg font-semibold transition-all"
            @click="$emit('approve')"
          >
            <span class="material-symbols-outlined text-base">check_circle</span>
            Aprovar
          </button>
          <button
            v-if="event.status === 'pending'"
            class="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-lg font-semibold transition-all"
            @click="$emit('reject')"
          >
            <span class="material-symbols-outlined text-base">cancel</span>
            Rejeitar
          </button>
        </div>
        <div class="flex gap-3">
          <button
            v-if="event.status === 'approved'"
            class="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all"
            :class="event.destaque 
              ? 'bg-gradient-to-r from-primary to-secondary text-black border border-transparent shadow-[0_0_15px_rgba(244,37,244,0.3)]' 
              : 'bg-surface-lighter hover:bg-surface-highlight text-white border border-white/10'"
            @click="$emit('toggle-destaque')"
          >
            <span class="material-symbols-outlined text-base">{{ event.destaque ? 'star' : 'star_border' }}</span>
            {{ event.destaque ? 'Em Destaque' : 'Definir Destaque' }}
          </button>
          <button
            class="flex items-center justify-center gap-2 px-4 py-2 bg-surface-lighter hover:bg-surface-highlight text-white border border-white/10 rounded-lg font-semibold transition-all"
            @click="$emit('view-details')"
          >
            <span class="material-symbols-outlined text-base">visibility</span>
            Ver Detalhes
          </button>
        </div>
        <button
          class="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-lg font-semibold transition-all"
          @click="$emit('delete')"
        >
          <span class="material-symbols-outlined text-base">delete</span>
          Apagar Evento
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { AdminEvent } from '@/types/admin'
import StatusBadge from '@/components/ui/StatusBadge.vue'

interface Props {
  event: AdminEvent
}

const props = defineProps<Props>()

defineEmits<{
  approve: []
  reject: []
  'view-details': []
  'toggle-destaque': []
  delete: []
}>()

const formattedDate = computed(() => {
  if (!props.event.data_hora) return ''
  const date = new Date(props.event.data_hora)
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
})

const formattedTime = computed(() => {
  if (!props.event.data_hora) return ''
  const date = new Date(props.event.data_hora)
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}h`
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>




