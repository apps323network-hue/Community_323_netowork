<template>
  <div
    class="group flex flex-col bg-white dark:bg-surface-card rounded-xl overflow-hidden border border-slate-200 dark:border-white/5 transition-all duration-300 hover:-translate-y-2 cursor-pointer"
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
      <div class="absolute inset-0 bg-gradient-to-t from-white dark:from-surface-card via-white/20 dark:via-surface-card/20 to-transparent"></div>
      
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
        <span class="text-slate-600 dark:text-white/60 text-xs font-semibold flex items-center gap-1">
          <span class="material-symbols-outlined text-sm">schedule</span>
          {{ formattedTime }}
        </span>
      </div>
      
      <!-- Title -->
      <h4
        class="text-slate-900 dark:text-white text-lg sm:text-xl font-bold leading-tight transition-colors"
        :class="titleHoverClass"
      >
        {{ currentLocale === 'pt-BR' ? event.titulo_pt : (event.titulo_en || event.titulo_pt) }}
      </h4>
      
      <!-- Description -->
      <p class="text-slate-600 dark:text-white/60 text-xs sm:text-sm line-clamp-2">
        {{ currentLocale === 'pt-BR' ? event.descricao_pt : (event.descricao_en || event.descricao_pt) || t('events.heroPlaceholder') }}
      </p>
      
      <!-- Location -->
      <div class="flex items-center gap-2 text-slate-700 dark:text-white/80 text-sm mt-auto">
        <span
          class="material-symbols-outlined text-lg"
          :class="locationIconClass"
        >
          {{ event.tipo === 'webinar' ? 'videocam' : 'location_on' }}
        </span>
        <span>{{ locationText }}</span>
      </div>
      
      <!-- Action Button -->
      <div class="pt-3 sm:pt-4 md:pt-5 mt-2 border-t border-slate-200 dark:border-white/5">
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
import { useLocale } from '@/composables/useLocale'
import { usePublicAccess } from '@/composables/usePublicAccess'
import type { Event } from '@/types/events'

const { locale: currentLocale, t } = useLocale()
const { isAuthenticated, showAuthModal } = usePublicAccess()

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
const day = computed(() => eventDate.value.getDate())
const month = computed(() => {
  const months = [
    t('months.jan'), t('months.feb'), t('months.mar'), t('months.apr'),
    t('months.may'), t('months.jun'), t('months.jul'), t('months.aug'),
    t('months.sep'), t('months.oct'), t('months.nov'), t('months.dec')
  ]
  return months[eventDate.value.getMonth()]
})

const formattedTime = computed(() => {
  const hours = eventDate.value.getHours().toString().padStart(2, '0')
  const minutes = eventDate.value.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}h`
})

// Category logic (untranslated for styling/logic consistency)
const category = computed(() => {
  const title = props.event.titulo_pt.toLowerCase()
  if (title.includes('workshop') || title.includes('branding') || title.includes('aprenda')) {
    return 'workshop'
  }
  if (title.includes('showcase') || title.includes('exposição') || title.includes('art')) {
    return 'showcase'
  }
  if (title.includes('networking') || title.includes('negócios') || title.includes('pitch')) {
    return 'networking'
  }
  if (title.includes('happy hour') || title.includes('social') || title.includes('encontro')) {
    return 'social'
  }
  // Default based on tipo
  return props.event.tipo === 'webinar' ? 'workshop' : 'networking'
})

const eventTypeLabel = computed(() => {
  const cat = category.value
  if (cat === 'workshop') return t('events.filterWorkshop')
  if (cat === 'showcase') return t('events.filterShowcase')
  if (cat === 'networking') return t('events.filterNetworking')
  if (cat === 'social') return t('events.filterSocial')
  return t('events.filterNetworking')
})

// Card styling based on type
const cardHoverClass = computed(() => {
  const cat = category.value
  if (cat === 'showcase' || cat === 'networking') {
    return 'hover:border-primary hover:shadow-neon-pink'
  }
  if (cat === 'workshop') {
    return 'hover:border-secondary hover:shadow-neon-blue'
  }
  return 'hover:border-white/30 hover:shadow-neon-mixed'
})

const dateBadgeClass = computed(() => {
  const cat = category.value
  if (cat === 'showcase' || cat === 'networking') {
    return 'border border-primary/30'
  }
  if (cat === 'workshop') {
    return 'border border-secondary/30'
  }
  return 'border border-white/20'
})

const dateNumberClass = computed(() => {
  const cat = category.value
  if (cat === 'showcase' || cat === 'networking') {
    return 'text-primary drop-shadow-[0_0_5px_rgba(244,37,244,0.8)]'
  }
  if (cat === 'workshop') {
    return 'text-secondary drop-shadow-[0_0_5px_rgba(0,240,255,0.8)]'
  }
  return 'bg-clip-text text-transparent bg-neon-gradient'
})

const accentLineClass = computed(() => {
  const cat = category.value
  if (cat === 'showcase' || cat === 'networking') {
    return 'bg-gradient-to-r from-primary to-transparent'
  }
  if (cat === 'workshop') {
    return 'bg-gradient-to-r from-secondary to-transparent'
  }
  return 'bg-neon-gradient'
})

const typeBadgeClass = computed(() => {
  const cat = category.value
  if (cat === 'showcase' || cat === 'networking') {
    return 'bg-primary/20 text-primary border-primary/40 shadow-[0_0_10px_rgba(244,37,244,0.1)]'
  }
  if (cat === 'workshop') {
    return 'bg-secondary/20 text-secondary border-secondary/40 shadow-[0_0_10px_rgba(0,240,255,0.1)]'
  }
  return 'bg-white/10 text-white border-white/20'
})

const titleHoverClass = computed(() => {
  const cat = category.value
  if (cat === 'showcase' || cat === 'networking') {
    return 'group-hover:text-primary text-glow-pink-hover'
  }
  if (cat === 'workshop') {
    return 'group-hover:text-secondary'
  }
  return 'group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-neon-gradient'
})

const locationIconClass = computed(() => {
  const cat = category.value
  if (cat === 'showcase' || cat === 'networking') {
    return 'text-primary'
  }
  return 'text-secondary'
})

const locationText = computed(() => {
  if (props.event.tipo === 'webinar') {
    return 'Online (Zoom)'
  }
  const loc = currentLocale.value === 'pt-BR' ? props.event.local_pt : (props.event.local_en || props.event.local_pt)
  return loc || t('events.locationToBeDefined')
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
    return t('events.presenceConfirmed')
  }
  const title = props.event.titulo_pt.toLowerCase()
  if (title.includes('showcase')) {
    return t('events.rsvp')
  }
  if (props.event.tipo === 'webinar') {
    return t('events.confirmPresence')
  }
  return t('events.confirmPresence')
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
  // Guests must sign up to confirm attendance
  if (!isAuthenticated.value) {
    showAuthModal('signup')
    return
  }
  
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

