<template>
  <div class="bg-background-dark min-h-screen flex flex-col text-white">
    <!-- Header -->
    <header class="sticky top-0 z-50 w-full bg-gradient-to-b from-background-dark to-background-dark/90 backdrop-blur-md border-b border-[#361a36]/50">
      <div class="px-4 md:px-10 py-3 mx-auto max-w-[1800px]">
        <div class="flex items-center justify-between">
          <button
            @click="$router.push('/programas')"
            class="flex items-center gap-2 text-text-muted hover:text-white transition-colors"
          >
            <span class="material-symbols-outlined">arrow_back</span>
            <span class="hidden sm:inline">Voltar aos Programas</span>
          </button>

          <div v-if="program" class="flex items-center gap-3">
            <div class="hidden md:block text-right">
              <h2 class="text-white text-sm font-bold">{{ getProgramTitle(program) }}</h2>
              <p class="text-text-muted text-xs">{{ program.category }}</p>
            </div>
          </div>

          <div class="flex items-center gap-4">
            <button class="text-white hover:text-text-muted transition-colors">
              <span class="material-symbols-outlined text-[24px]">notifications</span>
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center flex-1">
      <div class="animate-spin rounded-full h-12 w-12 border-4 border-secondary border-t-transparent"></div>
    </div>

    <!-- Main Content -->
    <main v-else-if="program && currentLesson" class="flex-1 flex flex-col lg:flex-row relative">
      <!-- Ambient Background Effects -->
      <div class="fixed top-20 left-10 w-96 h-96 bg-secondary/10 rounded-full filter blur-[150px] opacity-20 pointer-events-none"></div>
      <div class="fixed bottom-20 right-10 w-96 h-96 bg-primary/10 rounded-full filter blur-[150px] opacity-20 pointer-events-none"></div>

      <!-- Video Player Area -->
      <div class="flex-1 flex flex-col">
        <!-- Player -->
        <div class="relative bg-black aspect-video w-full">
          <YouTubePlayer
            v-if="currentLesson"
            :videoId="currentLesson.youtube_video_id"
            :title="getLessonTitle(currentLesson)"
            @ended="handleVideoEnded"
          />
        </div>

        <!-- Lesson Info & Controls -->
        <div class="p-6 md:p-8 bg-surface-dark border-b border-white/5">
          <div class="max-w-[1400px] mx-auto">
            <!-- Lesson Title -->
            <div class="flex items-start justify-between gap-4 mb-6">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-2">
                  <span class="text-xs font-black text-secondary uppercase tracking-widest">
                    Aula {{ currentLessonIndex + 1 }} de {{ totalLessons }}
                  </span>
                </div>
                <h1 class="text-2xl md:text-3xl font-black text-white leading-tight mb-2">
                  {{ getLessonTitle(currentLesson) }}
                </h1>
                <p v-if="getLessonDescription(currentLesson)" class="text-white/70 text-base md:text-lg">
                  {{ getLessonDescription(currentLesson) }}
                </p>
              </div>
            </div>

            <!-- Navigation Buttons -->
            <div class="flex items-center gap-4">
              <button
                v-if="previousLesson"
                @click="goToLesson(previousLesson)"
                class="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 text-white font-bold rounded-xl hover:bg-white/10 transition-all"
              >
                <span class="material-symbols-outlined">navigate_before</span>
                Aula Anterior
              </button>
              <button
                v-if="nextLesson"
                @click="goToLesson(nextLesson)"
                class="flex items-center gap-2 px-8 py-3 bg-secondary text-black font-bold rounded-xl hover:bg-secondary/90 transition-all shadow-[0_0_30px_rgba(0,240,255,0.3)]"
              >
                Próxima Aula
                <span class="material-symbols-outlined">navigate_next</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Materials Section -->
        <div v-if="lessonMaterials.length > 0" class="p-6 md:p-8 bg-background-dark">
          <div class="max-w-[1400px] mx-auto">
            <h2 class="text-xl font-black text-white mb-4 flex items-center gap-2">
              <span class="material-symbols-outlined text-secondary">description</span>
              Materiais desta Aula
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div
                v-for="material in lessonMaterials"
                :key="material.id"
                class="bg-surface-dark rounded-xl border border-white/5 p-4 hover:border-secondary/50 transition-all cursor-pointer group"
                @click="downloadMaterial(material)"
              >
                <div class="flex items-start gap-3">
                  <div class="bg-red-500/10 p-3 rounded-lg">
                    <span class="material-symbols-outlined text-2xl text-red-500">picture_as_pdf</span>
                  </div>
                  <div class="flex-1 min-w-0">
                    <h3 class="text-white font-bold mb-1 line-clamp-2 group-hover:text-secondary transition-colors">
                      {{ getMaterialTitle(material) }}
                    </h3>
                    <p class="text-text-muted text-xs">
                      {{ formatFileSize(material.file_size_bytes) }}
                    </p>
                  </div>
                  <span class="material-symbols-outlined text-secondary opacity-0 group-hover:opacity-100 transition-opacity">
                    download
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar - Modules & Lessons -->
      <aside class="lg:w-96 xl:w-[28rem] bg-surface-dark border-l border-white/5 overflow-y-auto lg:sticky lg:top-[73px] lg:h-[calc(100vh-73px)]">
        <ModulesList
          :modules="modules"
          :currentLessonId="currentLesson?.id"
          @select-lesson="goToLessonById"
        />
      </aside>
    </main>

    <!-- Error State -->
    <div v-else class="flex items-center justify-center flex-1">
      <div class="text-center max-w-md">
        <div class="bg-secondary/10 p-8 rounded-full w-fit mx-auto mb-6">
          <span class="material-symbols-outlined text-6xl text-secondary">error</span>
        </div>
        <h2 class="text-2xl font-black text-white mb-4">Programa não encontrado</h2>
        <p class="text-text-muted mb-6">
          Você não tem acesso a este programa ou ele não existe.
        </p>
        <button
          @click="$router.push('/programas')"
          class="px-8 py-3 bg-secondary text-black font-bold rounded-xl hover:bg-secondary/90 transition-all"
        >
          Voltar aos Programas
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLocale } from '@/composables/useLocale'
import { useModulesStore } from '@/stores/modules'
import { supabase } from '@/lib/supabaseClient'
import type { ProgramModule, ProgramLesson, ProgramMaterial } from '@/types/modules'
import YouTubePlayer from '@/components/features/programs/YouTubePlayer.vue'
import ModulesList from '@/components/features/programs/ModulesList.vue'

const route = useRoute()
const router = useRouter()
const { locale: currentLocale } = useLocale()
const modulesStore = useModulesStore()

const program = ref<any>(null)
const loading = ref(true)
const currentLessonId = ref<string>('')

const modules = computed(() => modulesStore.getModulesByProgram(route.params.id as string))

const allLessons = computed(() => {
  return modules.value.flatMap(m => m.lessons || []).sort((a, b) => {
    // Sort by module order then lesson order
    const moduleA = modules.value.find(m => m.id === a.module_id)
    const moduleB = modules.value.find(m => m.id === b.module_id)
    if (moduleA?.order_index !== moduleB?.order_index) {
      return (moduleA?.order_index || 0) - (moduleB?.order_index || 0)
    }
    return a.order_index - b.order_index
  })
})

const totalLessons = computed(() => allLessons.value.length)

const currentLesson = computed(() => {
  return allLessons.value.find(l => l.id === currentLessonId.value) || allLessons.value[0]
})

const currentLessonIndex = computed(() => {
  return allLessons.value.findIndex(l => l.id === currentLesson.value?.id)
})

const previousLesson = computed(() => {
  const idx = currentLessonIndex.value
  return idx > 0 ? allLessons.value[idx - 1] : null
})

const nextLesson = computed(() => {
  const idx = currentLessonIndex.value
  return idx < allLessons.value.length - 1 ? allLessons.value[idx + 1] : null
})

const lessonMaterials = computed(() => {
  if (!currentLesson.value) return []
  return modulesStore.materials.filter(m => m.lesson_id === currentLesson.value?.id)
})

const getProgramTitle = (program: any) => {
  return currentLocale.value === 'pt-BR' ? program.title_pt : program.title_en
}

const getLessonTitle = (lesson: ProgramLesson) => {
  return currentLocale.value === 'pt-BR' ? lesson.title_pt : lesson.title_en
}

const getLessonDescription = (lesson: ProgramLesson) => {
  return currentLocale.value === 'pt-BR' ? lesson.description_pt : lesson.description_en
}

const getMaterialTitle = (material: ProgramMaterial) => {
  return currentLocale.value === 'pt-BR' ? material.title_pt : material.title_en
}

function formatFileSize(bytes: number | null) {
  if (!bytes) return 'N/A'
  const mb = bytes / (1024 * 1024)
  return `${mb.toFixed(2)} MB`
}

function goToLesson(lesson: ProgramLesson) {
  currentLessonId.value = lesson.id
  // Update URL without reload
  router.replace({ query: { aula: lesson.id } })
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function goToLessonById(lessonId: string) {
  const lesson = allLessons.value.find(l => l.id === lessonId)
  if (lesson) goToLesson(lesson)
}

function handleVideoEnded() {
  // Auto-advance to next lesson
  if (nextLesson.value) {
    setTimeout(() => {
      goToLesson(nextLesson.value!)
    }, 2000) // 2 second delay
  }
}

async function downloadMaterial(material: ProgramMaterial) {
  try {
    const url = await modulesStore.getMaterialDownloadUrl(material.file_path)
    if (url) {
      window.open(url, '_blank')
    }
  } catch (error) {
    console.error('Error downloading material:', error)
  }
}

async function fetchProgramAndLessons() {
  loading.value = true

  try {
    const programId = route.params.id as string
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    // Check enrollment
    const { data: enrollment } = await supabase
      .from('program_enrollments')
      .select('*')
      .eq('program_id', programId)
      .eq('user_id', user.id)
      .single()

    if (!enrollment) {
      loading.value = false
      return
    }

    // Fetch program
    const { data: programData, error: programError } = await supabase
      .from('programs')
      .select('*')
      .eq('id', programId)
      .single()

    if (programError) throw programError

    program.value = programData

    // Fetch modules and lessons
    await modulesStore.fetchModulesWithLessons(programId)
    await modulesStore.fetchMaterials(programId)

    // Set current lesson from query or first lesson
    const lessonFromQuery = route.query.aula as string
    if (lessonFromQuery && allLessons.value.find(l => l.id === lessonFromQuery)) {
      currentLessonId.value = lessonFromQuery
    } else if (allLessons.value.length > 0) {
      currentLessonId.value = allLessons.value[0].id
      router.replace({ query: { aula: allLessons.value[0].id } })
    }
  } catch (error) {
    console.error('Error fetching program:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchProgramAndLessons()
})

// Watch for query changes (browser back/forward)
watch(() => route.query.aula, (newLessonId) => {
  if (newLessonId && typeof newLessonId === 'string') {
    currentLessonId.value = newLessonId
  }
})
</script>

<style scoped>
/* Custom scrollbar for sidebar */
aside::-webkit-scrollbar {
  width: 8px;
}

aside::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
}

aside::-webkit-scrollbar-thumb {
  background: rgba(0, 240, 255, 0.3);
  border-radius: 4px;
}

aside::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 240, 255, 0.5);
}
</style>
