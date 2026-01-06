<template>
  <section
    v-if="program"
    class="rounded-2xl overflow-hidden relative shadow-2xl shadow-secondary/10 border border-slate-200 dark:border-white/5 min-h-[400px] flex items-center"
  >
    <!-- Background Image -->
    <div
      class="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
      :style="{ backgroundImage: `url(${program.banner_url || program.thumbnail_url || '/program_placeholder.png'})` }"
    ></div>
    
    <!-- Gradient Overlay - Optimized for readability -->
    <div class="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent"></div>
    
    <!-- Content -->
    <div class="relative z-10 p-8 lg:p-16 flex flex-col gap-6 max-w-3xl w-full">
      <!-- Category -->
      <div class="text-secondary font-black text-sm tracking-widest uppercase flex items-center gap-2 drop-shadow-[0_0_10px_rgba(0,240,255,0.5)]">
        <span class="material-symbols-outlined text-sm">school</span>
        {{ getCategoryLabel(program.category) }}
      </div>

      <!-- Title -->
      <h1 class="text-white text-4xl sm:text-5xl lg:text-7xl font-black leading-tight tracking-tight uppercase">
        <template v-if="getProgramTitle(program).includes(':')">
          {{ getProgramTitle(program).split(':')[0] }}:
          <span class="neon-gradient-text">
            {{ getProgramTitle(program).split(':')[1]?.trim() || '' }}
          </span>
        </template>
        <template v-else>
          {{ getProgramTitle(program) }}
        </template>
      </h1>
      
      <!-- Description -->
      <p class="text-white/70 text-lg md:text-xl font-medium leading-relaxed max-w-xl line-clamp-3 italic">
        {{ getProgramDescription(program) }}
      </p>
      
      <!-- Meta Info -->
      <div class="flex flex-wrap gap-6 text-white/50 font-bold uppercase tracking-widest text-xs">
         <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-secondary text-sm">schedule</span>
            {{ program.duration_hours }}h
         </div>

      </div>

      <!-- Buttons -->
      <div class="flex flex-wrap gap-4 mt-6">
        <button
          class="flex items-center justify-center rounded-xl h-14 px-10 bg-secondary hover:bg-secondary/90 text-black text-lg font-black transition-all shadow-[0_0_30px_rgba(0,240,255,0.3)] hover:shadow-[0_0_40px_rgba(0,240,255,0.5)] transform hover:-translate-y-1 active:scale-95 uppercase tracking-tighter"
          @click="$emit('details', program.id)"
        >
          {{ t('programs.getStarted') || 'Começar Agora' }}
        </button>
        <div class="flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl px-6 h-14 backdrop-blur-md">
           <span class="text-white/40 text-[10px] uppercase font-bold tracking-widest">{{ t('programs.price') }}</span>
           <span class="text-white text-2xl font-black">${{ program.price_usd }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useLocale } from '@/composables/useLocale'

const { t, locale: currentLocale } = useLocale()

interface Props {
  program: any | null
}

defineProps<Props>()

defineEmits<{
  details: [id: string]
}>()

const getProgramTitle = (program: any) => {
  return currentLocale.value === 'pt-BR' ? program.title_pt : program.title_en
}

const getProgramDescription = (program: any) => {
  return currentLocale.value === 'pt-BR' ? program.short_description_pt : program.short_description_en
}

const getCategoryLabel = (catValue: string) => {
  // Mapping for display
  const categories: Record<string, string> = {
    'curso': t('programs.filterCourse'),
    'mentoria': t('programs.filterMentoring'),
    'workshop': t('programs.filterWorkshop'),
    'evento_premium': t('programs.filterPremiumEvent'),
    'servico_especializado': t('programs.filterSpecializedService')
  }
  return categories[catValue] || catValue
}
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
  color: #00f0ff;
  display: inline-block;
  text-shadow: 0 0 20px rgba(244, 37, 244, 0.5), 0 0 20px rgba(0, 240, 255, 0.5);
}

.shadow-neon-blue {
  box-shadow: 0 0 15px rgba(0, 240, 255, 0.3);
}
</style>
