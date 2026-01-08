<template>
  <div class="bg-background-dark min-h-screen flex flex-col text-white">
    <!-- Header -->
    <header class="sticky top-0 z-50 w-full bg-gradient-to-b from-background-dark to-background-dark/90 backdrop-blur-md border-b border-[#361a36]/50">
      <div class="px-4 md:px-10 py-3 mx-auto max-w-[1800px]">
        <div class="flex items-center justify-between">
          <button
            @click="$router.push('/programs')"
            class="flex items-center gap-2 text-text-muted hover:text-white transition-colors"
          >
            <span class="material-symbols-outlined">arrow_back</span>
            <span class="hidden sm:inline">Voltar aos Programas</span>
          </button>

          <div v-if="program" class="flex items-center gap-3">
            <div class="text-center">
              <h2 class="text-white text-sm font-bold">{{ getProgramTitle(program) }}</h2>
              <p class="text-text-muted text-xs">{{ program.category }}</p>
            </div>
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
      <div class="fixed top-20 left-10 w-96 h-96 bg-secondary/10 rounded-full filter blur-[150px] opacity-10 pointer-events-none"></div>
      <div class="fixed bottom-20 right-10 w-96 h-96 bg-primary/10 rounded-full filter blur-[150px] opacity-10 pointer-events-none"></div>

      <!-- Video Player Area -->
      <div class="flex-1 flex flex-col min-w-0">
        <!-- Player -->
        <div class="relative bg-black aspect-video w-full shadow-2xl overflow-hidden group/player">
          <YouTubePlayer
            v-if="currentLesson && isAuthenticated"
            :videoId="currentLesson.youtube_video_id"
            :title="getLessonTitle(currentLesson)"
            @ended="handleVideoEnded"
          />
          
          <!-- Guest Blocker Over Video -->
          <div v-if="!isAuthenticated" class="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-md z-20">
            <div class="max-w-md w-full mx-4">
              <GuestBlocker
                :show="true"
                variant="inline"
                title="Assista a esta Aula"
                message="Cadastre-se para acessar todas as aulas e materiais complementares deste programa."
                cta="Começar Agora"
              />
            </div>
          </div>
        </div>

        <!-- Lesson Header & Quick Navigation (Visible on all tabs) -->
        <div class="p-4 md:p-8 bg-surface-dark/50 backdrop-blur-sm border-b border-white/5">
          <div class="max-w-[1200px] mx-auto">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-2">
                  <span class="px-2 py-0.5 rounded bg-secondary/20 text-[10px] font-black text-secondary uppercase tracking-widest">
                    Aula {{ currentLessonIndex + 1 }} / {{ totalLessons }}
                  </span>
                  <span class="text-xs font-bold text-text-muted">
                    {{ program.category }}
                  </span>
                </div>
                <h1 class="text-2xl md:text-3xl font-black text-white leading-tight">
                  {{ getLessonTitle(currentLesson) }}
                </h1>
              </div>

              <!-- Navigation Controls -->
              <div class="flex gap-2">
                <button
                  v-if="previousLesson"
                  @click="goToLesson(previousLesson)"
                  class="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-3 bg-white/5 border border-white/10 text-white font-bold rounded-xl hover:bg-white/10 transition-all text-sm"
                  title="Aula Anterior"
                >
                  <span class="material-symbols-outlined text-sm">arrow_back</span>
                  <span class="hidden sm:inline">Anterior</span>
                </button>
                <button
                  v-if="nextLesson"
                  @click="goToLesson(nextLesson)"
                  class="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-secondary text-black font-black rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-secondary/20 text-sm"
                >
                  Próxima
                  <span class="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Responsive Tabs -->
        <div class="sticky top-[56px] lg:top-0 z-40 bg-background-dark/80 backdrop-blur-xl border-b border-white/5">
          <div class="max-w-[1200px] mx-auto flex">
            <!-- Mobile Lessons Tab -->
            <button 
              @click="activeTab = 'lessons'"
              class="lg:hidden flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all relative"
              :class="activeTab === 'lessons' ? 'text-secondary' : 'text-text-muted'"
            >
              {{ t('programs.lessonList') }}
              <div v-if="activeTab === 'lessons'" class="absolute bottom-0 left-0 right-0 h-0.5 bg-secondary shadow-[0_0_10px_rgba(0,240,255,1)]"></div>
            </button>

            <!-- Description Tab -->
            <button 
              @click="activeTab = 'about'"
              class="flex-1 lg:flex-none lg:px-12 py-4 text-xs font-black uppercase tracking-widest transition-all relative"
              :class="activeTab === 'about' ? 'text-secondary' : 'text-text-muted'"
            >
              {{ t('programs.lessonDescription') }}
              <div v-if="activeTab === 'about'" class="absolute bottom-0 left-0 right-0 h-0.5 bg-secondary shadow-[0_0_10px_rgba(0,240,255,1)]"></div>
            </button>

            <!-- Materials Tab -->
            <button 
              @click="activeTab = 'materials'"
              class="flex-1 lg:flex-none lg:px-12 py-4 text-xs font-black uppercase tracking-widest transition-all relative"
              :class="activeTab === 'materials' ? 'text-secondary' : 'text-text-muted'"
            >
              <span class="flex items-center justify-center gap-2">
                {{ t('programs.lessonMaterials') }}
                <span v-if="lessonMaterials.length" class="bg-secondary/20 text-secondary size-5 rounded-full flex items-center justify-center text-[10px]">
                  {{ lessonMaterials.length }}
                </span>
              </span>
              <div v-if="activeTab === 'materials'" class="absolute bottom-0 left-0 right-0 h-0.5 bg-secondary shadow-[0_0_10px_rgba(0,240,255,1)]"></div>
            </button>
          </div>
        </div>

        <!-- Tab Content Area -->
        <div class="p-6 md:p-8 flex-1">
          <div class="max-w-[1200px] mx-auto">
            
            <!-- Tab: Lessons (Mobile Only) -->
            <div v-if="activeTab === 'lessons'" class="lg:hidden animate-fade-in">
              <ModulesList
                :modules="modules"
                :currentLessonId="currentLesson?.id"
                @select-lesson="goToLessonById"
              />
            </div>

            <!-- Tab: Description -->
            <div v-if="activeTab === 'about'" class="animate-fade-in">
              <div class="prose prose-invert max-w-none">
                <p v-if="getLessonDescription(currentLesson)" class="text-white/80 text-lg leading-relaxed whitespace-pre-line font-medium italic">
                  {{ getLessonDescription(currentLesson) }}
                </p>
                <div v-else class="flex flex-col items-center justify-center py-20 opacity-30">
                  <span class="material-symbols-outlined text-6xl mb-4">description</span>
                  <p class="uppercase tracking-widest text-xs font-black">Nenhuma descrição disponível</p>
                </div>
              </div>
            </div>

            <!-- Tab: Materials -->
            <div v-if="activeTab === 'materials'" class="animate-fade-in">
              <div v-if="lessonMaterials.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  v-for="material in lessonMaterials"
                  :key="material.id"
                  class="group relative bg-surface-dark/50 hover:bg-surface-dark border border-white/5 hover:border-secondary/30 rounded-2xl p-5 transition-all duration-300 cursor-pointer overflow-hidden"
                  @click="isAuthenticated ? downloadMaterial(material) : showAuthModal('signup')"
                >
                  <div class="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  <div class="relative flex items-center gap-5">
                    <div class="size-14 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary border border-secondary/10 group-hover:scale-110 transition-transform duration-500">
                      <span class="material-symbols-outlined text-[32px]">
                        {{ material.file_path?.endsWith('.pdf') ? 'picture_as_pdf' : 'description' }}
                      </span>
                    </div>
                    
                    <div class="flex-1 min-w-0">
                      <h3 class="text-white font-black text-lg truncate group-hover:text-secondary transition-colors mb-1">
                        {{ getMaterialTitle(material) }}
                      </h3>
                      <div class="flex items-center gap-3">
                        <span class="text-[10px] font-bold text-text-muted uppercase tracking-widest border border-white/10 px-2 py-0.5 rounded">
                          {{ material.file_path?.split('.').pop()?.toUpperCase() || 'FILE' }}
                        </span>
                        <span class="text-xs text-text-muted font-medium">
                          {{ formatFileSize(material.file_size_bytes) }}
                        </span>
                      </div>
                    </div>

                    <button class="size-10 rounded-full bg-white/5 flex items-center justify-center text-text-muted group-hover:bg-secondary group-hover:text-black transition-all">
                      <span class="material-symbols-outlined text-lg">download</span>
                    </button>
                  </div>
                </div>
              </div>
              
              <div v-else class="flex flex-col items-center justify-center py-20 opacity-30">
                <div class="size-24 rounded-full bg-white/5 flex items-center justify-center mb-6">
                  <span class="material-symbols-outlined text-5xl">folder_off</span>
                </div>
                <h3 class="text-xl font-black text-white uppercase tracking-tighter mb-2">Nenhum Material</h3>
                <p class="text-sm font-medium">Esta aula não possui arquivos complementares.</p>
              </div>
            </div>

          </div>
        </div>
      </div>

      <!-- Sidebar - Modules & Lessons (Desktop Only) -->
      <aside class="hidden lg:block lg:w-96 xl:w-[28rem] bg-surface-dark border-l border-white/5 overflow-y-auto lg:sticky lg:top-[56px] lg:h-[calc(100vh-56px)] scrollbar-custom">
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
          @click="$router.push('/programs')"
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
import { supabase } from '@/lib/supabase'
import type { ProgramLesson, ProgramMaterial } from '@/types/modules'
import YouTubePlayer from '@/components/features/programs/YouTubePlayer.vue'
import ModulesList from '@/components/features/programs/ModulesList.vue'
import GuestBlocker from '@/components/common/GuestBlocker.vue'
import { usePublicAccess } from '@/composables/usePublicAccess'

const route = useRoute()
const router = useRouter()
const { locale: currentLocale, t } = useLocale()
const modulesStore = useModulesStore()
const { isAuthenticated, showAuthModal } = usePublicAccess()

const program = ref<any>(null)
const loading = ref(true)
const currentLessonId = ref<string>('')
const activeTab = ref<'lessons' | 'about' | 'materials'>('about')

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
  // Update URL and allow browser back button
  router.push({ query: { ...route.query, aula: lesson.id } })
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
    
    // Fetch program info (public)
    const { data: programData, error: programError } = await supabase
      .from('programs')
      .select('*')
      .eq('id', programId)
      .single()

    if (programError) throw programError
    program.value = programData

    // Se estiver logado, verificar matrícula
    if (user) {
      const { data: _enrollment } = await supabase
        .from('program_enrollments')
        .select('*')
        .eq('program_id', programId)
        .eq('user_id', user.id)
        .single()
      
      // Se não for aluno e nem professor/admin, ele pode ver o preview se for publicAccess
      // (Já lidamos com as limitações no template)
    }

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
  } else if (allLessons.value.length > 0) {
    // Fallback to first lesson if query is cleared
    currentLessonId.value = allLessons.value[0].id
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

.animate-fade-in {
  animation: fadeIn 0.4s ease-out forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
