<template>
  <div
    class="relative flex-none group cursor-pointer snap-start transition-all duration-300 hover:z-30"
    :class="[
      aspectRatio === 'poster' ? 'w-56 md:w-64 aspect-[2/3]' : 'w-72 md:w-80 aspect-video'
    ]"
    @click="$emit('click')"
  >
    <div 
      class="w-full h-full rounded-md overflow-hidden bg-slate-100 dark:bg-gray-900 shadow-lg transition-all duration-300"
      :class="hoverShadow"
    >
      <!-- Thumbnail -->
      <img
        :src="program.thumbnail_url || '/program_placeholder.png'"
        :alt="title"
        class="w-full h-full object-cover transition-opacity"
        :class="aspectRatio === 'poster' ? '' : 'opacity-80 group-hover:opacity-40'"
      />

      <!-- Lock Icon (if not enrolled) -->
      <div v-if="!isEnrolled" 
           class="absolute top-2 left-2 z-20 flex items-center gap-1.5 px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg border border-white/10 transition-all duration-300"
           :title="t('programs.enrollmentRequired')"
      >
        <span class="material-symbols-outlined text-white text-[16px]">lock</span>
        <span class="text-[10px] text-white font-bold max-w-0 group-hover:max-w-[100px] overflow-hidden whitespace-nowrap transition-all duration-500 opacity-0 group-hover:opacity-100">
          {{ t('programs.enrollmentRequired') }}
        </span>
      </div>

    <!-- Progress Bar (for enrolled programs) -->
    <div v-if="progress > 0" class="absolute bottom-0 left-0 w-full h-1 bg-gray-700 z-10">
      <div class="h-full bg-primary" :style="{ width: `${progress}%` }"></div>
    </div>

    <!-- Badge (NEW, TOP 10, etc.) -->
    <div v-if="badge" class="absolute top-2 right-2 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-lg z-10">
      {{ badge }}
    </div>

    <!-- Hover Overlay (Landscape) -->
    <div
      v-if="aspectRatio !== 'poster'"
      class="absolute inset-0 flex flex-col justify-end p-4 bg-gradient-to-t from-black via-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
    >
      <div class="flex gap-2 mb-2">
        <button 
          class="size-8 rounded-full bg-white text-black flex items-center justify-center hover:bg-secondary transition-colors"
          @click.stop="$emit('play')"
        >
          <span class="material-symbols-outlined text-xl">play_arrow</span>
        </button>
        <!-- <button 
          class="size-8 rounded-full border-2 border-gray-400 text-gray-200 flex items-center justify-center hover:border-white hover:text-white transition-colors"
          @click.stop="$emit('add')"
        >
          <span class="material-symbols-outlined text-lg">add</span>
        </button> -->
        <!-- <button 
          class="size-8 rounded-full border-2 border-gray-400 text-gray-200 flex items-center justify-center hover:border-white hover:text-white transition-colors ml-auto"
          @click.stop="$emit('info')"
        >
          <span class="material-symbols-outlined text-lg">expand_more</span>
        </button> -->
      </div>
      <h4 class="font-bold text-white text-sm">{{ title }}</h4>
      <div class="flex items-center gap-2 text-[10px] font-medium text-green-400 mt-1">
        <span v-if="isNew" class="text-green-500">{{ t('programs.badges.new') }}</span>
        <span class="text-slate-600 dark:text-gray-300">{{ duration }}</span>
      </div>
      <div class="flex items-center gap-2 mt-1 text-[10px] text-gray-400">
        <span class="text-slate-500 dark:text-gray-400">{{ categoryLabel }}</span>
      </div>
    </div>

    <!-- Static Title (Landscape - visible when not hovering) -->
    <div 
      v-if="aspectRatio !== 'poster'" 
      class="absolute bottom-2 left-3 group-hover:opacity-0 transition-opacity duration-200"
    >
      <h4 class="font-bold text-white drop-shadow-md text-sm">{{ title }}</h4>
    </div>

    <!-- Poster Style Overlay -->
    <template v-if="aspectRatio === 'poster'">
      <div class="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90"></div>
      <div class="absolute bottom-0 w-full p-4 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
        <h4 class="font-bold text-white text-lg leading-tight mb-1">{{ title }}</h4>
        <div class="flex items-center gap-2 text-xs text-gray-300 mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <span class="text-green-400">{{ duration }}</span>
          <span class="border border-gray-600 px-1 rounded text-[10px]">{{ categoryLabel }}</span>
        </div>
        <div class="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity delay-75">
          <button 
            class="bg-white text-black rounded-full p-1.5 hover:bg-primary hover:text-white transition-colors"
            @click.stop="$emit('play')"
          >
            <span class="material-symbols-outlined text-lg">play_arrow</span>
          </button>
          <button 
            class="border border-gray-400 text-white rounded-full p-1.5 hover:border-white transition-colors"
            @click.stop="$emit('add')"
          >
            <span class="material-symbols-outlined text-lg">add</span>
          </button>
        </div>
      </div>
    </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useLocale } from '@/composables/useLocale'

interface Props {
  program: any
  aspectRatio?: 'landscape' | 'poster'
  progress?: number
  badge?: string
  isEnrolled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  aspectRatio: 'landscape',
  progress: 0,
  badge: '',
  isEnrolled: true
})

defineEmits<{
  click: []
  play: []
  add: []
  info: []
}>()

const { locale: currentLocale, t } = useLocale()

const title = computed(() => {
  return currentLocale.value === 'pt-BR' ? props.program.title_pt : props.program.title_en
})

const categoryLabel = computed(() => {
  const categories: Record<string, string> = {
    'curso': t('programs.filterCourse'),
    'mentoria': t('programs.filterMentoring'),
    'workshop': t('programs.filterWorkshop'),
    'evento_premium': t('programs.filterPremiumEvent'),
    'servico_especializado': t('programs.filterSpecializedService')
  }
  return categories[props.program.category] || props.program.category
})

const duration = computed(() => {
  return props.program.duration_hours ? `${props.program.duration_hours}h` : ''
})

const isNew = computed(() => {
  if (!props.program.created_at) return false
  const created = new Date(props.program.created_at)
  const now = new Date()
  const diffDays = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
  return diffDays < 30
})

const hoverShadow = computed(() => {
  return props.aspectRatio === 'poster' 
    ? 'hover:shadow-[0_0_20px_rgba(255,0,153,0.3)]'
    : 'hover:shadow-[0_0_20px_rgba(0,240,255,0.3)]'
})
</script>
