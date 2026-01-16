<template>
  <div class="bg-background-light dark:bg-background-dark min-h-screen flex flex-col text-slate-900 dark:text-white transition-colors duration-300">
    <!-- Header -->
    <header class="sticky top-0 z-50 w-full bg-white/95 dark:bg-background-dark/95 backdrop-blur-md border-b border-slate-200 dark:border-[#361a36]/50">
      <div class="px-4 md:px-10 py-3 mx-auto max-w-[1800px]">
        <div class="flex items-center justify-between gap-4">
          <div class="flex items-center gap-4 flex-1">
            <button
              @click="$router.push('/programs')"
              class="flex items-center gap-2 text-slate-500 dark:text-text-muted hover:text-primary dark:hover:text-white transition-colors"
            >
              <span class="material-symbols-outlined">arrow_back</span>
              <span class="hidden sm:inline">{{ t('programs.backAction') }}</span>
            </button>

            <div v-if="program" class="hidden sm:flex items-center gap-3 border-l border-slate-200 dark:border-white/10 pl-4">
              <div class="text-left">
                <h1 class="font-black text-slate-900 dark:text-white text-sm md:text-base line-clamp-1">
                  {{ getProgramTitle(program) }}
                </h1>
                <p class="text-text-muted text-[10px] font-bold uppercase tracking-widest">{{ program.category }}</p>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-2 md:gap-4 shrink-0">
            <!-- Theme Toggler -->
            <AnimatedThemeToggler />

            <!-- Language Switcher -->
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </header>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center flex-1">
      <div class="animate-spin rounded-full h-12 w-12 border-4 border-secondary border-t-transparent"></div>
    </div>

    <!-- Main Content Area -->
    <main v-else-if="program && currentLesson" class="flex-1 flex flex-col lg:flex-row relative overflow-hidden">
      <!-- Ambient Background Effects -->
      <div class="fixed top-20 left-10 w-96 h-96 bg-secondary/10 rounded-full filter blur-[150px] opacity-10 pointer-events-none"></div>
      <div class="fixed bottom-20 right-10 w-96 h-96 bg-primary/10 rounded-full filter blur-[150px] opacity-10 pointer-events-none"></div>

      <!-- Left Side: Player, Header and Tabs -->
      <div class="flex-1 flex flex-col min-w-0 overflow-y-auto scrollbar-custom relative z-10">
        <!-- Player Container (Only visible if there is a video ID) -->
        <div v-if="currentLesson?.youtube_video_id" class="relative bg-black aspect-video w-full shadow-2xl overflow-hidden group/player">
          <YouTubePlayer
            v-if="isAuthenticated || (program?.localhost_only && isLocalhost())"
            :videoId="currentLesson.youtube_video_id"
            :title="getLessonTitle(currentLesson)"
            @ended="handleVideoEnded"
          />
          <div v-if="!isAuthenticated && !(program?.localhost_only && isLocalhost())" class="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-md z-20">
            <GuestBlocker :show="true" variant="inline" :title="t('programs.exclusiveContent')" :message="t('programs.exclusiveContentDesc')" :cta="t('programs.unlockLesson')" />
          </div>
        </div>
        
        <!-- No Video State -->
        <div v-else class="relative bg-gradient-to-br from-slate-900 via-black to-slate-900 aspect-video w-full shadow-2xl overflow-hidden flex items-center justify-center">
          <div class="text-center max-w-md px-6">
            <div class="bg-secondary/10 p-8 rounded-full w-fit mx-auto mb-6">
              <span class="material-symbols-outlined text-6xl text-secondary">description</span>
            </div>
            <h3 class="text-2xl font-black text-white mb-2">{{ getLessonTitle(currentLesson) }}</h3>
            <p class="text-gray-400 text-sm">
              Esta aula não possui vídeo. Conteúdo disponível na descrição e materiais abaixo.
            </p>
          </div>
        </div>

        <!-- Lesson Header & Quick Navigation -->
        <div class="p-6 md:p-8 bg-slate-50/50 dark:bg-surface-dark/50 border-b border-slate-200 dark:border-white/5 relative overflow-hidden">
          <!-- Progress Bar background -->
          <div class="absolute top-0 left-0 w-full h-1 bg-slate-200 dark:bg-white/5">
            <div 
              class="h-full bg-primary dark:bg-secondary transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(var(--color-primary),0.5)]"
              :style="{ width: `${enrollmentProgress}%` }"
            ></div>
          </div>

          <div class="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-3">
                <span class="text-xs font-black text-primary dark:text-secondary uppercase tracking-widest px-2.5 py-1 bg-primary/10 dark:bg-secondary/10 rounded-full">
                  {{ t('programs.lessonLabel') }} {{ currentLessonIndex + 1 }} / {{ totalLessons }}
                </span>
                <span class="text-xs font-bold text-slate-500 dark:text-text-muted">
                  {{ enrollmentProgress }}% {{ t('programs.completed') }}
                </span>
                <span v-if="currentLesson?.duration_seconds" class="flex items-center gap-1 text-xs text-slate-500 dark:text-text-muted">
                  <span class="material-symbols-outlined text-xs">schedule</span>
                  {{ formatDuration(currentLesson.duration_seconds) }}
                </span>
              </div>
              <h1 class="text-2xl md:text-3xl font-black text-slate-900 dark:text-white leading-tight">
                {{ getLessonTitle(currentLesson) }}
              </h1>
            </div>

            <!-- Navigation Controls -->
            <div class="flex gap-2">
              <button
                v-if="previousLesson"
                @click="goToLesson(previousLesson)"
                class="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-white/10 transition-all text-sm"
                :title="t('programs.previousLesson')"
              >
                <span class="material-symbols-outlined text-sm">arrow_back</span>
                <span class="hidden sm:inline">{{ t('common.previous') }}</span>
              </button>
              <button
                v-if="nextLesson"
                @click="goToLesson(nextLesson)"
                class="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-primary dark:bg-secondary text-white dark:text-black font-black rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary/20 dark:shadow-secondary/20 text-sm"
              >
                {{ t('common.next') }}
                <span class="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Responsive Tabs -->
        <div class="sticky top-0 z-40 bg-white/95 dark:bg-background-dark/95 backdrop-blur-xl border-b border-slate-200 dark:border-white/5">
          <div class="max-w-5xl mx-auto flex px-6">
            <button 
              @click="activeTab = 'lessons'"
              class="lg:hidden flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all relative"
              :class="activeTab === 'lessons' ? 'text-primary dark:text-secondary' : 'text-slate-500 dark:text-text-muted'"
            >
              {{ t('programs.lessonList') }}
              <div v-if="activeTab === 'lessons'" class="absolute bottom-0 left-0 right-0 h-0.5 bg-primary dark:bg-secondary"></div>
            </button>
            <button 
              @click="activeTab = 'about'"
              class="flex-1 lg:flex-none lg:px-12 py-4 text-xs font-black uppercase tracking-widest transition-all relative"
              :class="activeTab === 'about' ? 'text-primary dark:text-secondary' : 'text-slate-500 dark:text-text-muted'"
            >
              {{ t('programs.lessonDescription') }}
              <div v-if="activeTab === 'about'" class="absolute bottom-0 left-0 right-0 h-0.5 bg-primary dark:bg-secondary"></div>
            </button>
            <button 
              @click="activeTab = 'materials'"
              class="flex-1 lg:flex-none lg:px-12 py-4 text-xs font-black uppercase tracking-widest transition-all relative"
              :class="activeTab === 'materials' ? 'text-primary dark:text-secondary' : 'text-slate-500 dark:text-text-muted'"
            >
              <span class="flex items-center justify-center gap-2">
                {{ t('programs.lessonMaterials') }}
                <span v-if="lessonMaterials.length" class="bg-primary/10 dark:bg-secondary/20 text-primary dark:text-secondary size-5 rounded-full flex items-center justify-center text-[10px] font-bold">
                  {{ lessonMaterials.length }}
                </span>
              </span>
              <div v-if="activeTab === 'materials'" class="absolute bottom-0 left-0 right-0 h-0.5 bg-primary dark:bg-secondary"></div>
            </button>
          </div>
        </div>

        <!-- Tab Content Area -->
        <div class="p-6 md:p-8 flex-1">
          <div class="max-w-5xl mx-auto">
            <!-- Tab: Lessons (Mobile Only) -->
            <div v-if="activeTab === 'lessons'" class="lg:hidden animate-fade-in">
              <ModulesList
                :modules="modules"
                :currentLessonId="currentLessonId"
                @select-lesson="goToLessonById"
              />
            </div>

            <!-- Tab: Description -->
            <div v-if="activeTab === 'about'" class="animate-fade-in relative">
              <div v-if="isAuthenticated || (program?.localhost_only && isLocalhost()) || currentLesson?.youtube_video_id" class="prose prose-slate dark:prose-invert max-w-none">
                <p v-if="getLessonDescription(currentLesson)" class="text-slate-600 dark:text-text-muted text-lg leading-relaxed whitespace-pre-wrap font-medium">
                  {{ getLessonDescription(currentLesson) }}
                </p>
                <div v-else class="flex flex-col items-center justify-center py-20 opacity-30 text-slate-400 dark:text-text-muted">
                  <span class="material-symbols-outlined text-6xl mb-4">description</span>
                  <p class="uppercase tracking-widest text-xs font-black">{{ t('programs.noDescription') }}</p>
                </div>
              </div>
              
              <div v-else class="relative py-10">
                <div class="prose prose-slate dark:prose-invert max-w-none blur-sm select-none opacity-50 mb-8 pointer-events-none">
                   <p class="text-slate-600 dark:text-text-muted text-lg leading-relaxed font-medium">
                      {{ t('programs.exclusiveContentDesc') }} Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                   </p>
                </div>
                <div class="absolute inset-0 flex items-center justify-center z-10">
                  <GuestBlocker :show="true" variant="inline" :title="t('programs.exclusiveContent')" :message="t('programs.exclusiveContentDesc')" :cta="t('programs.unlockLesson')" />
                </div>
              </div>
            </div>

            <!-- Tab: Materials -->
            <div v-if="activeTab === 'materials'" class="animate-fade-in">
              <div v-if="lessonMaterials.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <a
                  v-for="material in lessonMaterials"
                  :key="material.id"
                  href="#"
                  target="_blank"
                  class="flex items-center gap-4 p-4 bg-slate-50 dark:bg-surface-dark/50 border border-slate-200 dark:border-white/5 rounded-2xl hover:border-primary dark:hover:border-secondary transition-all group"
                  @click.prevent="isAuthenticated ? downloadMaterial(material) : showAuthModal('signup')"
                >
                  <div class="size-14 rounded-2xl bg-primary/10 dark:bg-secondary/10 flex items-center justify-center text-primary dark:text-secondary group-hover:scale-110 transition-transform duration-500">
                    <span class="material-symbols-outlined text-[32px]">
                      {{ material.file_path?.endsWith('.pdf') ? 'picture_as_pdf' : 'description' }}
                    </span>
                  </div>
                  <div class="flex-1 min-w-0">
                    <h4 class="font-black text-slate-900 dark:text-white text-lg truncate group-hover:text-primary dark:group-hover:text-secondary transition-colors mb-1">
                      {{ getMaterialTitle(material) }}
                    </h4>
                    <p class="text-xs text-slate-500 dark:text-text-muted uppercase font-bold tracking-tight">
                      {{ material.file_path?.split('.').pop()?.toUpperCase() || 'FILE' }} • {{ formatFileSize(material.file_size_bytes) }}
                    </p>
                  </div>
                  <button class="size-10 rounded-full bg-slate-200 dark:bg-white/5 flex items-center justify-center text-slate-500 dark:text-text-muted group-hover:bg-primary dark:group-hover:bg-secondary group-hover:text-white dark:group-hover:text-black transition-all">
                    <span class="material-symbols-outlined text-lg">download</span>
                  </button>
                </a>
              </div>
              
              <div v-else class="flex flex-col items-center justify-center py-20 opacity-30 text-slate-400 dark:text-text-muted">
                <div class="size-24 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-6">
                  <span class="material-symbols-outlined text-5xl">folder_off</span>
                </div>
                <h3 class="text-xl font-black uppercase tracking-tighter mb-2">{{ t('programs.noMaterials') }}</h3>
                <p class="text-sm font-medium">{{ t('programs.noMaterialsDesc') }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar: Modules & Lessons (Desktop Only) -->
      <aside class="hidden lg:block lg:w-96 xl:w-[28rem] bg-white dark:bg-surface-dark border-l border-slate-200 dark:border-white/5 overflow-y-auto scrollbar-custom relative z-20">
        <ModulesList
          :modules="modules"
          :currentLessonId="currentLessonId"
          :completedLessons="completedLessons"
          @select-lesson="goToLessonById"
        />
      </aside>
    </main>

    <!-- Error State -->
    <div v-else class="flex items-center justify-center flex-1">
      <div class="text-center max-w-md p-8">
        <div class="bg-primary/10 dark:bg-secondary/10 p-8 rounded-full w-fit mx-auto mb-6">
          <span class="material-symbols-outlined text-6xl text-primary dark:text-secondary">error</span>
        </div>
        <h2 class="text-2xl font-black text-slate-900 dark:text-white mb-4">{{ t('programs.programNotFound') }}</h2>
        <p class="text-slate-500 dark:text-text-muted mb-6">
          {{ t('programs.programNotFoundDesc') }}
        </p>
        <button
          @click="$router.push('/programs')"
          class="px-8 py-3 bg-primary dark:bg-secondary text-white dark:text-black font-black rounded-xl hover:scale-[1.02] transition-all"
        >
          {{ t('programs.backAction') }}
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
import { useProgramsStore } from '@/stores/programs'
import { supabase } from '@/lib/supabase'
import type { ProgramLesson, ProgramMaterial } from '@/types/modules'
import YouTubePlayer from '@/components/features/programs/YouTubePlayer.vue'
import ModulesList from '@/components/features/programs/ModulesList.vue'
import GuestBlocker from '@/components/common/GuestBlocker.vue'
import AnimatedThemeToggler from '@/components/ui/AnimatedThemeToggler.vue'
import LanguageSwitcher from '@/components/ui/LanguageSwitcher.vue'
import { usePublicAccess } from '@/composables/usePublicAccess'
import { isLocalhost, canAccessLocalhost } from '@/utils/localhost'

const route = useRoute()
const router = useRouter()
const { locale: currentLocale, t } = useLocale()
const modulesStore = useModulesStore()
const programsStore = useProgramsStore()
const { isAuthenticated, showAuthModal } = usePublicAccess()

const program = ref<any>(null)
const loading = ref(true)
const currentLessonId = ref<string>('')
const activeTab = ref<'lessons' | 'about' | 'materials'>('about')

const completedLessons = computed(() => programsStore.completedLessons)

const enrollmentProgress = computed(() => {
  const enrollment = programsStore.myEnrollments.find(e => e.program_id === route.params.id)
  return enrollment?.progress_percentage || 0
})

const modules = computed(() => modulesStore.getModulesByProgram(route.params.id as string))

const allLessons = computed(() => {
  return modules.value.flatMap(m => m.lessons || []).sort((a, b) => {
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

function goToLesson(lesson: ProgramLesson) {
  // Mark current lesson as complete before moving to next
  if (currentLesson.value && isAuthenticated.value) {
    programsStore.markLessonComplete(route.params.id as string, currentLesson.value.id)
  }

  currentLessonId.value = lesson.id
  router.push({ query: { ...route.query, aula: lesson.id } })
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function goToLessonById(lessonId: string) {
  const lesson = allLessons.value.find(l => l.id === lessonId)
  if (lesson) goToLesson(lesson)
}

function handleVideoEnded() {
  // Mark current lesson as complete when video ends
  if (currentLesson.value && isAuthenticated.value) {
    programsStore.markLessonComplete(route.params.id as string, currentLesson.value.id)
  }

  if (nextLesson.value) {
    setTimeout(() => {
      goToLesson(nextLesson.value!)
    }, 2000)
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
    const { data: programData, error: programError } = await supabase.from('programs').select('*').eq('id', programId).single()
    if (programError) throw programError
    program.value = programData
    const canAccessAsLocalhost = program.value.localhost_only && canAccessLocalhost(program.value)
    if (user) {
      const { data: enrollment } = await supabase.from('program_enrollments').select('*').eq('program_id', programId).eq('user_id', user.id).single()
      if (!enrollment && canAccessAsLocalhost) {
        try {
          await supabase.from('program_enrollments').insert({
            program_id: programId,
            user_id: user.id,
            payment_method: 'localhost',
            payment_id: 'localhost-debug',
            payment_status: 'paid',
            status: 'active',
            paid_at: new Date().toISOString()
          })
        } catch (err) {
          console.error('Error auto-enrolling for localhost:', err)
        }
      }
    }
    await modulesStore.fetchModulesWithLessons(programId)
    await modulesStore.fetchMaterials(programId)
    await programsStore.fetchUserProgress(programId)
    await programsStore.fetchMyEnrollments()

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
  setTimeout(() => {
    document.addEventListener('click', handleClickOutside)
  }, 0)
})

watch(() => route.query.aula, (newLessonId) => {
  if (newLessonId && typeof newLessonId === 'string') {
    currentLessonId.value = newLessonId
  } else if (allLessons.value.length > 0) {
    currentLessonId.value = allLessons.value[0].id
  }
})
</script>

<style scoped>
.scrollbar-custom::-webkit-scrollbar {
  width: 6px;
}
.scrollbar-custom::-webkit-scrollbar-track {
  background: transparent;
}
.scrollbar-custom::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.3);
  border-radius: 3px;
}
.dark .scrollbar-custom::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
}
.scrollbar-custom::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.5);
}
.animate-fade-in {
  animation: fadeIn 0.4s ease-out forwards;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
:deep(.prose) {
  max-width: none;
}
:deep(.prose p) {
  margin-bottom: 1.5em;
}
</style>
