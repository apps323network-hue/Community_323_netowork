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
          <h3 class="text-white text-xl font-bold mb-1 line-clamp-2">{{ event.titulo_pt }}</h3>
          <p v-if="event.titulo_en" class="text-white/40 text-sm mb-2 italic line-clamp-1">{{ event.titulo_en }}</p>
          <StatusBadge :status="event.status" />
        </div>
      </div>

      <!-- Description -->
      <div v-if="event.descricao_pt || event.descricao_en" class="space-y-2 mb-4">
        <p v-if="event.descricao_pt" class="text-white/60 text-sm line-clamp-2">
          {{ event.descricao_pt }}
        </p>
        <p v-if="event.descricao_en" class="text-white/40 text-xs italic line-clamp-1">
          EN: {{ event.descricao_en }}
        </p>
      </div>

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
        <div v-if="event.local_pt || event.local_en" class="flex items-start gap-2 text-white/70 text-sm">
          <span class="material-symbols-outlined text-secondary text-base mt-0.5">location_on</span>
          <div class="flex flex-col">
            <span v-if="event.local_pt">{{ event.local_pt }}</span>
            <span v-if="event.local_en" class="text-white/40 text-xs italic">{{ event.local_en }}</span>
          </div>
        </div>
        <div class="flex items-center gap-2 text-white/70 text-sm">
          <span class="material-symbols-outlined text-secondary text-base">person</span>
          <span>{{ event.creator_name || 'User' }}</span>
        </div>
        <div v-if="event.program_name" class="flex items-center gap-2 text-white/70 text-sm">
          <span class="material-symbols-outlined text-secondary text-base">school</span>
          <span class="font-medium text-primary">{{ event.program_name }}</span>
        </div>
        <!-- Attendees Count -->
        <div class="flex items-center justify-between gap-2 pt-2 mt-2 border-t border-white/10">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-secondary text-base">groups</span>
            <span class="text-white/70 text-sm">
              <span class="font-bold text-white">{{ event.confirmations_count || 0 }}</span>
              {{ (event.confirmations_count || 0) === 1 ? 'attendee' : 'attendees' }}
            </span>
          </div>
          <button
            v-if="(event.confirmations_count || 0) > 0"
            @click="$emit('view-attendees')"
            class="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-secondary hover:text-white hover:bg-secondary/20 rounded-lg transition-all"
          >
            <span class="material-symbols-outlined text-sm">visibility</span>
            View List
          </button>
        </div>
      </div>

      <!-- Actions -->
      <div class="grid grid-cols-2 gap-3">
        <!-- Pending State Buttons -->
        <template v-if="event.status === 'pending'">
          <button
            class="flex items-center justify-center gap-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 rounded-lg font-semibold transition-all"
            @click="$emit('approve')"
          >
            <span class="material-symbols-outlined text-base">check_circle</span>
            Approve
          </button>
          <button
            class="flex items-center justify-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-lg font-semibold transition-all"
            @click="$emit('reject')"
          >
            <span class="material-symbols-outlined text-base">cancel</span>
            Reject
          </button>
        </template>

        <!-- Approved State Destaque Button -->
        <button
          v-if="event.status === 'approved'"
          class="flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all"
          :class="event.destaque 
            ? 'bg-gradient-to-r from-primary to-secondary text-black border border-transparent shadow-[0_0_15px_rgba(244,37,244,0.3)]' 
            : 'bg-surface-lighter hover:bg-surface-highlight text-white border border-white/10'"
          @click="$emit('toggle-destaque')"
        >
          <span class="material-symbols-outlined text-base">{{ event.destaque ? 'star' : 'star_border' }}</span>
          {{ event.destaque ? 'Featured' : 'Feature' }}
        </button>

        <!-- Common Buttons -->
        <button
          class="flex items-center justify-center gap-2 px-4 py-2 bg-surface-lighter hover:bg-surface-highlight text-white border border-white/10 rounded-lg font-semibold transition-all"
          @click="$emit('view-details')"
        >
          <span class="material-symbols-outlined text-base">visibility</span>
          View Details
        </button>

        <button
          class="flex items-center justify-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-lg font-semibold transition-all"
          :class="event.status === 'approved' ? 'col-span-2' : ''"
          @click="$emit('delete')"
        >
          <span class="material-symbols-outlined text-base">delete</span>
          Delete Event
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
  'view-attendees': []
  'toggle-destaque': []
  delete: []
}>()

const formattedDate = computed(() => {
  if (!props.event.data_hora) return ''
  const date = new Date(props.event.data_hora)
  return date.toLocaleDateString('en-US', {
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
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>




