<template>
  <section
    v-if="event"
    class="rounded-xl overflow-hidden relative shadow-2xl shadow-secondary/10 border border-slate-200 dark:border-white/5 cursor-pointer group"
    @click="$emit('learn-more')"
  >
    <!-- Background Image -->
    <div
      v-if="event.image_url"
      class="absolute inset-0 bg-cover bg-center"
      :style="{ backgroundImage: `url(${event.image_url})` }"
    ></div>
    <div v-else class="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 dark:from-gray-900 dark:to-black"></div>
    
    <!-- Gradient Overlay -->
    <div class="absolute inset-0 bg-gradient-to-r from-white/80 via-white/70 to-primary/20 dark:from-background-dark dark:via-background-dark/90 dark:to-primary/20"></div>
    
    <!-- Content -->
    <div class="relative z-10 p-4 sm:p-6 md:p-8 lg:p-16 flex flex-col lg:flex-row gap-6 sm:gap-8 lg:gap-10 items-center lg:items-start justify-between">
      <div class="flex flex-col gap-3 sm:gap-4 md:gap-6 max-w-2xl text-center lg:text-left w-full">
        <!-- Badge -->
        <div class="inline-flex items-center gap-1.5 sm:gap-2 self-center lg:self-start bg-white/80 dark:bg-black/40 backdrop-blur-md border border-secondary/50 rounded-full px-3 sm:px-4 py-1 shadow-[0_0_10px_rgba(0,240,255,0.2)]">
          <span class="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-secondary animate-pulse shadow-[0_0_5px_#00f0ff]"></span>
          <span class="text-secondary text-[10px] sm:text-xs font-bold uppercase tracking-wider text-glow-blue">
            {{ t('events.featuredEvent') }}
          </span>
        </div>
        
        <!-- Title -->
        <h1 class="text-slate-900 dark:text-white text-2xl sm:text-3xl md:text-4xl lg:text-7xl font-black leading-tight tracking-[-0.033em]">
          <template v-if="event.titulo.includes(':')">
            {{ event.titulo.split(':')[0] }}:
            <span class="neon-gradient-text">
              {{ event.titulo.split(':')[1]?.trim() || '' }}
            </span>
          </template>
          <template v-else>
            {{ event.titulo }}
          </template>
        </h1>
        
        <!-- Description -->
        <p class="text-slate-700 dark:text-white/80 text-sm sm:text-base md:text-lg font-normal leading-relaxed max-w-xl">
          {{ event.descricao || t('events.heroPlaceholder') }}
        </p>
        
        <!-- Buttons -->
        <div class="flex flex-wrap gap-2 sm:gap-3 md:gap-4 justify-center lg:justify-start mt-3 sm:mt-4">
          <button
            class="flex items-center justify-center rounded-lg h-10 sm:h-11 md:h-12 px-4 sm:px-6 md:px-8 bg-neon-gradient hover:bg-neon-gradient-hover text-black text-sm sm:text-base font-black transition-all shadow-[0_0_20px_rgba(244,37,244,0.4)] hover:shadow-[0_0_30px_rgba(0,240,255,0.6)] transform hover:-translate-y-1 whitespace-nowrap"
            @click="$emit('register')"
          >
            {{ t('events.registerNow') }}
          </button>
          <button
            class="flex items-center justify-center rounded-lg h-10 sm:h-11 md:h-12 px-4 sm:px-6 md:px-8 bg-white/80 dark:bg-black/50 hover:bg-white dark:hover:bg-white/10 text-slate-900 dark:text-white text-sm sm:text-base font-bold transition-all border border-secondary/30 hover:border-secondary shadow-lg hover:shadow-neon-blue whitespace-nowrap"
            @click="$emit('learn-more')"
          >
            {{ t('events.learnMore') }}
          </button>
        </div>
      </div>
      
          <!-- Countdown Timer -->
          <div class="w-full sm:w-auto">
            <CountdownTimer :target-date="event.data_hora" />
          </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { Event } from '@/types/events'
import CountdownTimer from './CountdownTimer.vue'

const { t } = useI18n()

interface Props {
  event: Event | null
}

defineProps<Props>()

defineEmits<{
  register: []
  'learn-more': []
}>()
</script>

<style scoped>
.bg-neon-gradient {
  background: linear-gradient(135deg, #f425f4 0%, #00f0ff 100%);
}

.bg-neon-gradient-hover {
  background: linear-gradient(135deg, #d914d9 0%, #00cce6 100%);
}

.neon-gradient-text {
  background: linear-gradient(135deg, #f425f4 0%, #00f0ff 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: #00f0ff; /* Fallback color caso bg-clip não funcione */
  display: inline-block;
  text-shadow: 0 0 20px rgba(244, 37, 244, 0.5), 0 0 20px rgba(0, 240, 255, 0.5);
}

.text-glow-blue {
  text-shadow: 0 0 10px rgba(0, 240, 255, 0.5);
}

.shadow-neon-blue {
  box-shadow: 0 0 15px rgba(0, 240, 255, 0.3);
}
</style>



