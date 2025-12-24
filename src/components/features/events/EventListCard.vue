<template>
  <div
    class="group flex flex-col bg-surface-card rounded-xl overflow-hidden border border-white/5 transition-all duration-300 hover:-translate-y-2"
    :class="cardHoverClass"
    @click="$emit('click', event.id)"
  >
    <!-- Image Section -->
    <div class="relative h-40 sm:h-48 md:h-52 overflow-hidden">
      <!-- Date Badge -->
      <div
        class="absolute top-2 sm:top-3 left-2 sm:left-3 bg-black/80 backdrop-blur-md px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg z-10 flex flex-col items-center text-center min-w-[50px] sm:min-w-[60px] shadow-lg"
        :class="dateBadgeClass"
      >
        <span class="text-[10px] sm:text-xs text-white/90 uppercase font-bold tracking-wider">{{ month }}</span>
        <span class="text-xl sm:text-2xl font-black" :class="dateNumberClass">{{ day }}</span>
      </div>
      
      <!-- Background Image -->
      <div
        v-if="event.image_url"
        class="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
        :style="{ backgroundImage: `url(${event.image_url})` }"
      ></div>
      <div v-else class="w-full h-full bg-gradient-to-br from-gray-900 to-black"></div>
      
      <!-- Gradient Overlay -->
      <div class="absolute inset-0 bg-gradient-to-t from-surface-card via-surface-card/20 to-transparent"></div>
      
      <!-- Hover Accent Line -->
      <div
        class="absolute bottom-0 left-0 w-full h-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        :class="accentLineClass"
      ></div>
    </div>
    
    <!-- Content Section -->
    <div class="p-4 sm:p-5 md:p-6 flex flex-col flex-1 gap-3 sm:gap-4">
      <!-- Badge and Time -->
      <div class="flex items-center justify-between">
        <span
          class="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border"
          :class="typeBadgeClass"
        >
          {{ eventTypeLabel }}
        </span>
        <span class="text-white/60 text-xs font-semibold flex items-center gap-1">
          <span class="material-symbols-outlined text-sm">schedule</span>
          {{ formattedTime }}
        </span>
      </div>
      
      <!-- Title -->
      <h4
        class="text-white text-lg sm:text-xl font-bold leading-tight transition-colors"
        :class="titleHoverClass"
      >
        {{ event.titulo }}
      </h4>
      
      <!-- Description -->
      <p class="text-white/60 text-xs sm:text-sm line-clamp-2">
        {{ event.descricao || 'Junte-se a profissionais brasileiros para uma noite de conexões e oportunidades de negócios.' }}
      </p>
      
      <!-- Location -->
      <div class="flex items-center gap-2 text-white/80 text-sm mt-auto">
        <span
          class="material-symbols-outlined text-lg"
          :class="locationIconClass"
        >
          {{ event.tipo === 'webinar' ? 'videocam' : 'location_on' }}
        </span>
        <span>{{ locationText }}</span>
      </div>
      
      <!-- Action Button -->
      <div class="pt-3 sm:pt-4 md:pt-5 mt-2 border-t border-white/5">
        <button
          class="w-full h-10 sm:h-11 rounded-lg font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2"
          :class="buttonClass"
          @click.stop="handleAction"
        >
          <span class="truncate">{{ buttonText }}</span>
          <span class="material-symbols-outlined text-sm flex-shrink-0">{{ buttonIcon }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Event } from '@/types/events'

interface Props {
  event: Event
}

const props = defineProps<Props>()

const emit = defineEmits<{
  click: [eventId: string]
  confirm: [eventId: string]
  cancel: [eventId: string]
}>()

// Date formatting
const eventDate = computed(() => new Date(props.event.data_hora))
const month = computed(() => {
  const months = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ']
  return months[eventDate.value.getMonth()]
})
const day = computed(() => eventDate.value.getDate())

const formattedTime = computed(() => {
  const hours = eventDate.value.getHours().toString().padStart(2, '0')
  const minutes = eventDate.value.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}h`
})

// Determine event type label based on title/content
const eventTypeLabel = computed(() => {
  const title = props.event.titulo.toLowerCase()
  if (title.includes('workshop') || title.includes('branding') || title.includes('aprenda')) {
    return 'Workshop'
  }
  if (title.includes('showcase') || title.includes('exposição') || title.includes('art')) {
    return 'Showcase'
  }
  if (title.includes('networking') || title.includes('negócios') || title.includes('pitch')) {
    return 'Networking'
  }
  if (title.includes('happy hour') || title.includes('social') || title.includes('encontro')) {
    return 'Social'
  }
  // Default based on tipo
  return props.event.tipo === 'webinar' ? 'Workshop' : 'Networking'
})

// Card styling based on type
const cardHoverClass = computed(() => {
  const label = eventTypeLabel.value
  if (label === 'Showcase' || label === 'Networking') {
    return 'hover:border-primary hover:shadow-neon-pink'
  }
  if (label === 'Workshop') {
    return 'hover:border-secondary hover:shadow-neon-blue'
  }
  return 'hover:border-white/30 hover:shadow-neon-mixed'
})

const dateBadgeClass = computed(() => {
  const label = eventTypeLabel.value
  if (label === 'Showcase' || label === 'Networking') {
    return 'border border-primary/30'
  }
  if (label === 'Workshop') {
    return 'border border-secondary/30'
  }
  return 'border border-white/20'
})

const dateNumberClass = computed(() => {
  const label = eventTypeLabel.value
  if (label === 'Showcase' || label === 'Networking') {
    return 'text-primary drop-shadow-[0_0_5px_rgba(244,37,244,0.8)]'
  }
  if (label === 'Workshop') {
    return 'text-secondary drop-shadow-[0_0_5px_rgba(0,240,255,0.8)]'
  }
  return 'bg-clip-text text-transparent bg-neon-gradient'
})

const accentLineClass = computed(() => {
  const label = eventTypeLabel.value
  if (label === 'Showcase' || label === 'Networking') {
    return 'bg-gradient-to-r from-primary to-transparent'
  }
  if (label === 'Workshop') {
    return 'bg-gradient-to-r from-secondary to-transparent'
  }
  return 'bg-neon-gradient'
})

const typeBadgeClass = computed(() => {
  const label = eventTypeLabel.value
  if (label === 'Showcase' || label === 'Networking') {
    return 'bg-primary/20 text-primary border-primary/40 shadow-[0_0_10px_rgba(244,37,244,0.1)]'
  }
  if (label === 'Workshop') {
    return 'bg-secondary/20 text-secondary border-secondary/40 shadow-[0_0_10px_rgba(0,240,255,0.1)]'
  }
  return 'bg-white/10 text-white border-white/20'
})

const titleHoverClass = computed(() => {
  const label = eventTypeLabel.value
  if (label === 'Showcase' || label === 'Networking') {
    return 'group-hover:text-primary text-glow-pink-hover'
  }
  if (label === 'Workshop') {
    return 'group-hover:text-secondary'
  }
  return 'group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-neon-gradient'
})

const locationIconClass = computed(() => {
  const label = eventTypeLabel.value
  if (label === 'Showcase' || label === 'Networking') {
    return 'text-primary'
  }
  return 'text-secondary'
})

const locationText = computed(() => {
  if (props.event.tipo === 'webinar') {
    return 'Online (Zoom)'
  }
  return props.event.local || 'Local a definir'
})

// Button styling and text
const buttonClass = computed(() => {
  const label = eventTypeLabel.value
  if (label === 'Showcase' || label === 'Networking') {
    if (props.event.is_confirmed) {
      return 'bg-primary text-white border border-transparent shadow-[0_0_20px_rgba(244,37,244,0.4)]'
    }
    return 'bg-transparent hover:bg-primary text-primary hover:text-white border border-primary hover:border-transparent shadow-[0_0_10px_rgba(244,37,244,0.1)] hover:shadow-[0_0_20px_rgba(244,37,244,0.4)]'
  }
  if (label === 'Workshop') {
    if (props.event.is_confirmed) {
      return 'bg-secondary text-black border border-transparent shadow-[0_0_20px_rgba(0,240,255,0.4)]'
    }
    return 'bg-transparent hover:bg-secondary text-secondary hover:text-black border border-secondary hover:border-transparent shadow-[0_0_10px_rgba(0,240,255,0.1)] hover:shadow-[0_0_20px_rgba(0,240,255,0.4)]'
  }
  // Social
  if (props.event.is_confirmed) {
    return 'bg-neon-gradient text-black border border-transparent shadow-[0_0_15px_rgba(255,255,255,0.2)]'
  }
  return 'bg-white/5 hover:bg-neon-gradient text-white hover:text-black border border-white/10 hover:border-transparent group-hover:shadow-[0_0_15px_rgba(255,255,255,0.2)]'
})

const buttonText = computed(() => {
  if (props.event.is_confirmed) {
    return 'Confirmado'
  }
  const label = eventTypeLabel.value
  if (label === 'Showcase') {
    return 'RSVP'
  }
  if (label === 'Workshop') {
    return 'Inscrever-se'
  }
  if (label === 'Networking') {
    return 'Aplicar Agora'
  }
  return 'Confirmar Presença'
})

const buttonIcon = computed(() => {
  if (props.event.is_confirmed) {
    return 'check_circle'
  }
  const label = eventTypeLabel.value
  if (label === 'Showcase') {
    return 'arrow_forward'
  }
  if (label === 'Workshop') {
    return 'confirmation_number'
  }
  if (label === 'Networking') {
    return 'rocket_launch'
  }
  return 'check'
})

function handleAction() {
  if (props.event.is_confirmed) {
    emit('cancel', props.event.id)
  } else {
    emit('confirm', props.event.id)
  }
}
</script>

<style scoped>
.bg-neon-gradient {
  background: linear-gradient(135deg, #f425f4 0%, #00f0ff 100%);
}

.text-glow-pink-hover {
  text-shadow: 0 0 10px rgba(244, 37, 244, 0.5);
}

.shadow-neon-pink {
  box-shadow: 0 0 15px rgba(244, 37, 244, 0.3);
}

.shadow-neon-blue {
  box-shadow: 0 0 15px rgba(0, 240, 255, 0.3);
}

.shadow-neon-mixed {
  box-shadow: -5px 0 15px rgba(244, 37, 244, 0.2), 5px 0 15px rgba(0, 240, 255, 0.2);
}
</style>

