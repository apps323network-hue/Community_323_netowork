<template>
  <div class="p-6">
    <!-- Header -->
    <div class="mb-6">
      <h2 class="text-xl font-black text-white mb-2">Conteúdo do Curso</h2>
      <p class="text-text-muted text-sm">
        {{ modules.length }} módulos • {{ totalLessons }} aulas
      </p>
    </div>

    <!-- Modules List -->
    <div class="space-y-3">
      <div
        v-for="(module, moduleIndex) in modules"
        :key="module.id"
        class="bg-black/40 rounded-xl border border-white/10 overflow-hidden transition-all hover:border-secondary/50"
      >
        <!-- Module Header -->
        <button
          @click="toggleModule(module.id)"
          class="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
        >
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <span class="text-xs font-black text-secondary uppercase tracking-widest">
                Módulo {{ moduleIndex + 1 }}
              </span>
              <span class="text-xs text-text-muted">
                {{ module.lessons?.length || 0 }} aulas
              </span>
            </div>
            <h3 class="text-white font-bold text-sm line-clamp-2">
              {{ getModuleTitle(module) }}
            </h3>
          </div>
          <span
            class="material-symbols-outlined text-white transition-transform ml-2 flex-shrink-0"
            :class="{ 'rotate-180': expandedModules.includes(module.id) }"
          >
            expand_more
          </span>
        </button>

        <!-- Lessons List -->
        <div
          v-if="expandedModules.includes(module.id)"
          class="border-t border-white/10"
        >
          <div
            v-for="(lesson, lessonIndex) in module.lessons"
            :key="lesson.id"
            @click="selectLesson(lesson.id)"
            :class="[
              'px-4 py-3 flex items-center gap-3 cursor-pointer transition-all border-l-2',
              currentLessonId === lesson.id
                ? 'bg-secondary/10 border-secondary'
                : 'border-transparent hover:bg-white/5 hover:border-white/20'
            ]"
          >
            <!-- Play Icon or Check -->
            <div
              :class="[
                'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
                currentLessonId === lesson.id
                  ? 'bg-secondary text-black'
                  : 'bg-white/10 text-white'
              ]"
            >
              <span class="material-symbols-outlined text-lg">
                {{ currentLessonId === lesson.id ? 'play_arrow' : 'play_circle' }}
              </span>
            </div>

            <!-- Lesson Info -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-xs font-bold text-text-muted">
                  Aula {{ lessonIndex + 1 }}
                </span>
                <span v-if="lesson.is_preview" class="text-[10px] font-bold bg-secondary/20 text-secondary px-1.5 py-0.5 rounded uppercase">
                  Preview
                </span>
              </div>
              <h4
                :class="[
                  'text-sm font-bold line-clamp-2',
                  currentLessonId === lesson.id ? 'text-secondary' : 'text-white'
                ]"
              >
                {{ getLessonTitle(lesson) }}
              </h4>
              <div v-if="lesson.duration_seconds" class="flex items-center gap-1 mt-1 text-xs text-text-muted">
                <span class="material-symbols-outlined text-xs">schedule</span>
                {{ formatDuration(lesson.duration_seconds) }}
              </div>
            </div>

            <!-- Thumbnail -->
            <img
              :src="lesson.youtube_thumbnail_url || `https://img.youtube.com/vi/${lesson.youtube_video_id}/default.jpg`"
              :alt="getLessonTitle(lesson)"
              class="w-16 h-12 object-cover rounded flex-shrink-0 opacity-80"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useLocale } from '@/composables/useLocale'
import type { ProgramModule, ProgramLesson } from '@/types/modules'

const props = defineProps<{
  modules: ProgramModule[]
  currentLessonId?: string
}>()

const emit = defineEmits<{
  selectLesson: [lessonId: string]
}>()

const { locale: currentLocale } = useLocale()
const expandedModules = ref<string[]>([])

const totalLessons = computed(() => {
  return props.modules.reduce((sum, module) => sum + (module.lessons?.length || 0), 0)
})

const getModuleTitle = (module: ProgramModule) => {
  return currentLocale.value === 'pt-BR' ? module.title_pt : module.title_en
}

const getLessonTitle = (lesson: ProgramLesson) => {
  return currentLocale.value === 'pt-BR' ? lesson.title_pt : lesson.title_en
}

function formatDuration(seconds: number) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  if (mins >= 60) {
    const hours = Math.floor(mins / 60)
    const remainingMins = mins % 60
    return `${hours}h ${remainingMins}min`
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function toggleModule(moduleId: string) {
  const index = expandedModules.value.indexOf(moduleId)
  if (index > -1) {
    expandedModules.value.splice(index, 1)
  } else {
    expandedModules.value.push(moduleId)
  }
}

function selectLesson(lessonId: string) {
  emit('selectLesson', lessonId)
}

onMounted(() => {
  // Auto-expand module containing current lesson
  if (props.currentLessonId) {
    const moduleWithCurrentLesson = props.modules.find(m =>
      m.lessons?.some(l => l.id === props.currentLessonId)
    )
    if (moduleWithCurrentLesson && !expandedModules.value.includes(moduleWithCurrentLesson.id)) {
      expandedModules.value.push(moduleWithCurrentLesson.id)
    }
  }

  // Expand first module if none expanded
  if (expandedModules.value.length === 0 && props.modules.length > 0) {
    expandedModules.value.push(props.modules[0].id)
  }
})
</script>

<style scoped>
/* Smooth expand/collapse animation */
.space-y-3 > div {
  transition: all 0.3s ease;
}
</style>
