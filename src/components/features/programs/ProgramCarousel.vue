<template>
  <div class="space-y-3 group/row">
    <!-- Row Title -->
    <h3 
      class="text-xl md:text-2xl font-bold text-gray-100 hover:text-secondary transition-colors flex items-center gap-2 cursor-pointer group-hover/row:text-secondary"
      @click="$emit('viewAll')"
    >
      {{ title }}
    </h3>

    <!-- Carousel Container -->
    <div class="flex overflow-x-auto gap-6 md:gap-8 py-12 scrollbar-hide snap-x pr-10 pl-4">
      <ProgramCard
        v-for="program in programs"
        :key="program.id"
        :program="program"
        :aspectRatio="aspectRatio"
        :progress="getProgress(program.id)"
        :badge="getBadge(program)"
        @click="handleCardClick(program)"
        @play="handlePlay(program)"
        @add="handleAdd(program)"
        @info="handleInfo(program)"
      />

      <!-- Empty State -->
      <div 
        v-if="programs.length === 0"
        class="flex-none w-72 md:w-80 aspect-video rounded-md bg-gray-800/50 border border-white/5 flex items-center justify-center"
      >
        <span class="text-gray-500 text-sm">Nenhum programa</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useProgramsStore } from '@/stores/programs'
import { useRouter } from 'vue-router'
import ProgramCard from './ProgramCard.vue'

interface Props {
  title: string
  programs: any[]
  aspectRatio?: 'landscape' | 'poster'
}

const props = withDefaults(defineProps<Props>(), {
  aspectRatio: 'landscape'
})

defineEmits<{
  viewAll: []
}>()

const router = useRouter()
const programsStore = useProgramsStore()

function getProgress(programId: string): number {
  const enrollment = programsStore.myEnrollments.find(e => e.program_id === programId)
  return enrollment?.progress_percentage || 0
}

function getBadge(program: any): string {
  // Check if new (created in last 30 days)
  if (program.created_at) {
    const created = new Date(program.created_at)
    const now = new Date()
    const diffDays = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
    if (diffDays < 30) return 'NOVO'
  }
  
  // Check if featured
  if (program.featured) return 'DESTAQUE'
  
  return ''
}

function handleCardClick(program: any) {
  const isEnrolled = programsStore.myEnrollments.some(
    e => e.program_id === program.id && (e.status === 'active' || e.status === 'completed')
  )
  
  if (isEnrolled) {
    router.push(`/programas/${program.id}/assistir`)
  } else {
    router.push(`/programas/${program.id}`)
  }
}

function handlePlay(program: any) {
  const isEnrolled = programsStore.myEnrollments.some(
    e => e.program_id === program.id && (e.status === 'active' || e.status === 'completed')
  )
  
  if (isEnrolled) {
    router.push(`/programas/${program.id}/assistir`)
  } else {
    router.push(`/programas/${program.id}`)
  }
}

function handleAdd(program: any) {
  // TODO: Add to watchlist functionality
  console.log('Add to list:', program.id)
}

function handleInfo(program: any) {
  router.push(`/programas/${program.id}`)
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
