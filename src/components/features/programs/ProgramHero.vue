<template>
  <section
    v-if="program"
    class="relative w-full h-[70vh] lg:h-[85vh] flex items-center overflow-hidden"
  >
    <!-- Background Image -->
    <div class="absolute inset-0 z-0">
      <div 
        class="absolute inset-0 bg-cover bg-center scale-105"
        :style="{ backgroundImage: `url(${program.banner_url || program.thumbnail_url || '/program_placeholder.png'})` }"
      ></div>
      <!-- Gradient Overlays -->
      <div class="absolute inset-0 bg-gradient-to-r from-background-dark via-background-dark/60 to-transparent"></div>
      <div class="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/10 to-transparent"></div>
    </div>

    <!-- Content -->
    <div class="relative z-10 w-full max-w-[1800px] mx-auto px-4 md:px-10 flex flex-col justify-center h-full pt-10 pb-20">
      <div class="max-w-2xl animate-fade-in-up space-y-6">
        <!-- Category Badge -->
        <div class="flex items-center gap-2 mb-2">
          <div class="bg-gradient-to-r from-secondary to-primary w-1 h-10 rounded-full"></div>
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-white font-black tracking-[0.2em] uppercase text-xl md:text-2xl drop-shadow-[0_0_10px_rgba(0,240,255,0.5)]">
            {{ getCategoryBadge(program.category) }}
          </span>
        </div>

        <!-- Title -->
        <h1 class="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-[0.9] drop-shadow-2xl">
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
        <div class="flex items-center flex-wrap gap-4 text-sm md:text-base font-medium text-gray-200">
          <span v-if="program.duration_hours">{{ program.duration_hours }}h de conteúdo</span>
          <span v-if="program.duration_hours && program.category" class="text-gray-400">•</span>
          <span>{{ getCategoryLabel(program.category) }}</span>
        </div>

        <!-- Description -->
        <p class="text-lg md:text-xl text-gray-300 leading-relaxed drop-shadow-md max-w-xl line-clamp-3">
          {{ getProgramDescription(program) }}
        </p>

        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row gap-4 pt-4">
          <button
            class="px-10 py-4 rounded bg-white text-black font-black text-xl hover:bg-secondary transition-all flex items-center justify-center gap-3 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
            @click="handleAction"
          >
            <span class="material-symbols-outlined text-3xl fill-current">
              {{ isEnrolled ? 'play_arrow' : 'shopping_cart' }}
            </span>
            {{ isEnrolled ? 'Acessar Agora' : (isAuthenticated ? 'Quero Garantir Minha Vaga' : t('auth.login')) }}
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
  const badges: Record<string, string> = {
    'curso': 'Curso Premium',
    'mentoria': 'Mentoria Exclusiva',
    'workshop': 'Workshop Intensivo',
    'evento_premium': 'Evento Premium',
    'servico_especializado': 'Serviço Especializado'
  }
  return badges[catValue] || 'Programa'
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
