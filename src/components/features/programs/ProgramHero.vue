<template>
  <section
    v-if="program"
    class="relative w-full min-h-[500px] h-[70vh] max-h-[800px] lg:h-[85vh] lg:max-h-[1000px] flex items-center py-20 lg:py-32"
  >
    <!-- Background Image -->
    <div class="absolute inset-0 z-0 overflow-hidden">
      <div 
        class="absolute inset-0 bg-cover bg-center scale-105"
        :style="{ backgroundImage: `url(${program.banner_url || program.thumbnail_url || '/program_placeholder.png'})` }"
      ></div>
      <!-- Gradient Overlays -->
      <div class="absolute inset-0 bg-gradient-to-r from-slate-50 via-slate-50/40 to-transparent dark:from-background-dark dark:via-background-dark/40 dark:to-transparent"></div>
      <div class="absolute inset-0 bg-gradient-to-t from-slate-50/80 via-transparent to-transparent dark:from-background-dark/80 dark:via-transparent dark:to-transparent"></div>
    </div>

    <!-- Content -->
    <div class="relative z-10 w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 flex flex-col justify-center h-full max-w-[2000px] mx-auto">
      <div class="max-w-2xl lg:max-w-3xl xl:max-w-4xl animate-fade-in-up space-y-4 md:space-y-5 lg:space-y-6">
        <!-- Category Badge -->
        <div class="flex items-center gap-2 mb-2">
          <div class="bg-gradient-to-r from-secondary to-primary w-1 h-8 md:h-10 lg:h-12 rounded-full"></div>
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-primary dark:to-white font-black tracking-[0.15em] md:tracking-[0.2em] uppercase text-lg md:text-xl lg:text-2xl xl:text-3xl drop-shadow-[0_0_10px_rgba(0,240,255,0.5)]">
            {{ getCategoryBadge(program.category) }}
          </span>
        </div>

        <!-- Title -->
        <h1 class="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl font-black text-slate-900 dark:text-white leading-[0.9] drop-shadow-2xl">
          <template v-if="getProgramTitle(program).includes(':')">
            {{ getProgramTitle(program).split(':')[0] }}<br/>
            <span class="text-neon-gradient">
              {{ getProgramTitle(program).split(':')[1]?.trim() || '' }}
            </span>
          </template>
          <template v-else>
            {{ getProgramTitle(program) }}
          </template>
        </h1>

        <!-- Meta Info -->
        <div class="flex items-center flex-wrap gap-3 md:gap-4 text-xs sm:text-sm md:text-base lg:text-lg font-medium text-slate-600 dark:text-gray-200">
          <span v-if="program.duration_hours">{{ program.duration_hours }}{{ t('programs.hoursOfContent') }}</span>
          <span v-if="program.duration_hours && program.category" class="text-gray-400">•</span>
          <span>{{ getCategoryLabel(program.category) }}</span>
        </div>

        <!-- Description -->
        <p class="text-base md:text-lg lg:text-xl xl:text-2xl text-slate-700 dark:text-gray-300 leading-relaxed drop-shadow-md max-w-xl lg:max-w-2xl xl:max-w-3xl line-clamp-3">
          {{ getProgramDescription(program) }}
        </p>

        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row gap-3 md:gap-4 pt-3 md:pt-4">
          <button
            class="px-8 md:px-10 lg:px-12 py-3 md:py-4 lg:py-5 rounded bg-slate-900 text-white dark:bg-white dark:text-black font-black text-base md:text-lg lg:text-xl xl:text-2xl hover:bg-secondary hover:text-black transition-all flex items-center justify-center gap-2 md:gap-3 active:scale-95 shadow-lg"
            @click="handleAction"
          >
            <span class="material-symbols-outlined text-2xl md:text-3xl lg:text-4xl fill-current">
              play_arrow
            </span>
            {{ isEnrolled ? t('programs.actions.accessNow') : (isAuthenticated ? t('programs.actions.secureMySpot') : t('programs.actions.watch')) }}
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useLocale } from '@/composables/useLocale'
import { usePublicAccess } from '@/composables/usePublicAccess'

const { t, locale: currentLocale } = useLocale()
const { isAuthenticated, showAuthModal } = usePublicAccess()

interface Props {
  program: any | null
  isEnrolled?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  details: [id: string]
  play: [id: string]
}>()

const handleAction = () => {
  if (props.isEnrolled) {
    emit('play', props.program.id)
  } else {
    // Se nao estiver matriculado
    if (!isAuthenticated.value) {
      // Se for guest, pede login
      showAuthModal('login')
    } else {
      // Se estiver logado, prossegue para compra (emit play que no pai redireciona/abre checkout)
      emit('play', props.program.id)
    }
  }
}

const getProgramTitle = (program: any) => {
  return currentLocale.value === 'pt-BR' ? program.title_pt : program.title_en
}

const getProgramDescription = (program: any) => {
  return currentLocale.value === 'pt-BR' ? program.short_description_pt : program.short_description_en
}

const getCategoryLabel = (catValue: string) => {
  const categories: Record<string, string> = {
    'curso': t('programs.filterCourse'),
    'mentoria': t('programs.filterMentoring'),
    'workshop': t('programs.filterWorkshop'),
    'evento_premium': t('programs.filterPremiumEvent'),
    'servico_especializado': t('programs.filterSpecializedService')
  }
  return categories[catValue] || catValue
}

const getCategoryBadge = (catValue: string) => {
  const badgeKey = `programs.categoryBadges.${catValue}` as any
  return t(badgeKey)
}
</script>

<style scoped>
.text-neon-gradient {
  background: linear-gradient(90deg, #00f0ff, #ff0099);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.animate-fade-in-up {
  animation: fadeInUp 0.8s ease-out forwards;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
