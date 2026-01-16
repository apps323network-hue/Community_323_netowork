<template>
  <div class="space-y-2 md:space-y-3 group/row">
    <!-- Row Title -->
    <h3 
      class="text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold text-slate-900 dark:text-gray-100 hover:text-primary dark:hover:text-secondary transition-colors flex items-center gap-2 cursor-pointer group-hover/row:text-primary dark:group-hover/row:text-secondary"
      @click="$emit('viewAll')"
    >
      {{ title }}
    </h3>

    <!-- Carousel Container -->
    <div class="flex overflow-x-auto gap-4 md:gap-6 lg:gap-8 py-8 md:py-10 lg:py-12 scrollbar-hide snap-x px-1">
      <ProgramCard
        v-for="program in programs"
        :key="program.id"
        :program="program"
        :aspectRatio="aspectRatio"
        :progress="getProgress(program.id)"
        :badge="getBadge(program)"
        :isEnrolled="isEnrolled(program.id)"
        @click="handleCardClick(program)"
        @play="handlePlay(program)"
        @add="handleAdd(program)"
        @info="handleInfo(program)"
      />

      <!-- Empty State -->
      <div 
        v-if="programs.length === 0"
        class="flex-none w-64 md:w-72 lg:w-80 xl:w-96 aspect-video rounded-md bg-slate-100 dark:bg-gray-800/50 border border-slate-200 dark:border-white/5 flex items-center justify-center"
      >
        <span class="text-slate-500 dark:text-gray-500 text-xs md:text-sm">{{ t('programs.noPrograms') }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useProgramsStore } from '@/stores/programs'
import { useRouter } from 'vue-router'
import { useLocale } from '@/composables/useLocale'
import ProgramCard from './ProgramCard.vue'

const { t } = useLocale()

interface Props {
  title: string
  programs: any[]
  aspectRatio?: 'landscape' | 'poster'
}

defineProps<Props>()


defineEmits<{
  viewAll: []
}>()

const router = useRouter()
const programsStore = useProgramsStore()

function getProgress(programId: string): number {
  const enrollment = programsStore.myEnrollments.find(e => e.program_id === programId)
  return enrollment?.progress_percentage || 0
}

function isEnrolled(programId: string): boolean {
  return programsStore.myEnrollments.some(
    e => e.program_id === programId && (e.status === 'active' || e.status === 'completed')
  )
}

function getBadge(program: any): string {
  // Check if new (created in last 30 days)
  if (program.created_at) {
    const created = new Date(program.created_at)
    const now = new Date()
    const diffDays = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
    if (diffDays < 30) return t('programs.badges.newUpper')
  }
  
  // Check if featured
  if (program.featured) return t('programs.badges.featured')
  
  return ''
}

function handleCardClick(program: any) {
  const isEnrolled = programsStore.myEnrollments.some(
    e => e.program_id === program.id && (e.status === 'active' || e.status === 'completed')
  )
  
  if (isEnrolled) {
    router.push(`/programs/${program.id}/assistir`)
  } else {
    router.push(`/programs/${program.id}`)
  }
}

function handlePlay(program: any) {
  const isEnrolled = programsStore.myEnrollments.some(
    e => e.program_id === program.id && (e.status === 'active' || e.status === 'completed')
  )
  
  if (isEnrolled) {
    router.push(`/programs/${program.id}/assistir`)
  } else {
    router.push(`/programs/${program.id}`)
  }
}

function handleAdd(program: any) {
  // TODO: Add to watchlist functionality
  console.log('Add to list:', program.id)
}

function handleInfo(program: any) {
  router.push(`/programs/${program.id}`)
}
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
