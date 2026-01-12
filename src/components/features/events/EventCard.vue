<template>
  <div class="relative rounded-2xl overflow-hidden shadow-premium hover:shadow-premium-hover group cursor-pointer h-72 border border-slate-200/60 dark:border-white/5 transition-all duration-300">
    <!-- Background Image -->
    <img
      v-if="event.image_url"
      :src="event.image_url"
      :alt="currentLocale === 'pt-BR' ? event.titulo_pt : (event.titulo_en || event.titulo_pt)"
      class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
    />
    <div v-else class="w-full h-full bg-gradient-to-br from-gray-900 to-black"></div>
    
    <!-- Gradient Overlay -->
    <div class="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/80 to-transparent"></div>
    
    <!-- Badge "DESTAQUE DA SEMANA" -->
    <div class="absolute top-4 left-4">
      <span class="bg-secondary/90 text-white text-xs font-black px-3 py-1.5 rounded shadow-[0_0_15px_rgba(217,70,239,0.5)] backdrop-blur-sm tracking-wider">
        {{ t('events.featuredBadge') || 'DESTAQUE DA SEMANA' }}
      </span>
    </div>
    
    <!-- Content -->
    <div class="absolute bottom-0 left-0 p-6 w-full">
      <div class="flex justify-between items-end">
        <div class="flex-1">
          <h3 class="text-2xl font-black text-white mb-2 text-glow-pink group-hover:text-secondary transition-colors">
            {{ currentLocale === 'pt-BR' ? event.titulo_pt : (event.titulo_en || event.titulo_pt) }}
          </h3>
          <p class="text-gray-300 text-sm line-clamp-2 max-w-md mb-4">
            {{ currentLocale === 'pt-BR' ? event.descricao_pt : (event.descricao_en || event.descricao_pt) || 'Junte-se a profissionais brasileiros para uma noite de conexões e oportunidades de negócios.' }}
          </p>
          <div class="mt-4 flex items-center gap-2 text-secondary text-sm font-bold tracking-wide uppercase">
            <span class="material-icons-outlined text-lg">arrow_forward</span>
            {{ t('events.viewDetails') || 'Ver Detalhes' }}
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
import { useLocale } from '@/composables/useLocale'

const { locale: currentLocale, t } = useLocale()

interface Event {
  id: string
  titulo_pt: string
  titulo_en: string
  descricao_pt?: string
  descricao_en?: string
  data_hora: string
  tipo: 'presencial' | 'webinar'
  local_pt?: string
  local_en?: string
  image_url?: string
  created_by?: string
}

interface Props {
  event: Event
}

const { event } = defineProps<Props>()

// emit não é usado neste componente, mas mantido para compatibilidade futura
// eslint-disable-next-line @typescript-eslint/no-unused-vars
defineEmits<{
  click: [eventId: string]
}>()
</script>

<style scoped>
.text-glow-pink {
  text-shadow: 0 0 10px rgba(217, 70, 239, 0.6);
}
</style>
