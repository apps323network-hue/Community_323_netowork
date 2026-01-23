<template>
  <AppLayout hideSidebars fluid>
    <div class="bg-slate-50 dark:bg-background-dark min-h-screen flex flex-col text-slate-900 dark:text-white">
      <!-- Loading State -->
      <div v-if="programsStore.loading" class="flex items-center justify-center h-[calc(100vh-80px)] gap-4">
        <div class="animate-spin rounded-full h-12 w-12 border-4 border-secondary border-t-transparent"></div>
      </div>

      <template v-else>
        <!-- Ambient Background Effects -->
        <div class="fixed top-20 left-10 w-96 h-96 bg-secondary/10 rounded-full filter blur-[150px] opacity-20 pointer-events-none z-0"></div>
        <div class="fixed bottom-20 right-10 w-96 h-96 bg-primary/10 rounded-full filter blur-[150px] opacity-20 pointer-events-none z-0"></div>

        <!-- Hero Section -->
        <ProgramHero
          v-if="featuredProgram"
          :program="featuredProgram"
          :isEnrolled="enrolledPrograms.some(p => p.id === featuredProgram?.id)"
          @play="handlePlay"
          @details="handleDetails"
        />

        <!-- Content Area -->
        <main class="relative z-20 space-y-8 md:space-y-10 lg:space-y-12 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 pb-16 md:pb-20 lg:pb-24 w-full max-w-[2000px] mx-auto">
          <!-- Filters & Search Header -->
          <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6 py-2 relative z-30">
            <!-- Category Filters -->
            <div class="flex flex-wrap gap-2 md:gap-3 items-center">
              <span class="text-slate-900 dark:text-white font-bold mr-1 md:mr-2 whitespace-nowrap hidden sm:block text-sm lg:text-base">{{ t('programs.categories') }}:</span>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="category in categories"
                  :key="category.value || 'all'"
                  @click="selectedCategory = category.value"
                  :class="[
                    'whitespace-nowrap px-3 md:px-4 lg:px-5 py-1.5 md:py-2 rounded-full text-xs md:text-sm lg:text-base font-medium transition-all backdrop-blur-sm',
                    selectedCategory === category.value
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-black font-bold hover:bg-slate-800 dark:hover:bg-white/90 shadow-lg'
                      : 'bg-white/80 dark:bg-black/40 border border-slate-300 dark:border-white/30 text-slate-700 dark:text-gray-200 hover:border-slate-900 dark:hover:border-white hover:text-slate-900 dark:hover:text-white'
                  ]"
                >
                  {{ category.label }}
                </button>
              </div>
            </div>

            <!-- Search Bar -->
            <div class="relative group w-full lg:w-72 xl:w-80 2xl:w-96">
              <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <span class="material-symbols-outlined text-[20px] text-slate-500 dark:text-gray-400 group-focus-within:text-primary dark:group-focus-within:text-white transition-colors">search</span>
              </div>
              <input
                v-model="searchQuery"
                type="text"
                class="w-full pl-11 pr-4 h-11 bg-white dark:bg-black/40 border border-slate-400 dark:border-white/20 rounded-full text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm md:text-base shadow-sm"
                :placeholder="t('programs.searchPlaceholder')"
              />
            </div>
          </div>

          <!-- Continue Watching (If enrolled in any) -->
          <ProgramCarousel
            v-if="enrolledPrograms.length > 0"
            :title="t('programs.continueWatching')"
            :programs="enrolledPrograms"
          />

          <!-- Filtered or All Content -->
          <template v-if="selectedCategory">
            <ProgramCarousel
              :title="getCategoryLabel(selectedCategory)"
              :programs="filteredPrograms"
            />
          </template>

          <template v-else>
            <!-- Courses -->
            <ProgramCarousel
              v-if="programsByCategory.curso.length"
              :title="t('programs.filterCourse') + ' ' + t('programs.featuredSuffix')"
              :programs="programsByCategory.curso"
            />

            <!-- Mentoria -->
            <ProgramCarousel
              v-if="programsByCategory.mentoria.length"
              :title="t('programs.filterMentoring')"
              :programs="programsByCategory.mentoria"
              aspectRatio="poster"
            />

            <!-- Workshops -->
            <ProgramCarousel
              v-if="programsByCategory.workshop.length"
              :title="t('programs.filterWorkshop')"
              :programs="programsByCategory.workshop"
            />

            <!-- Premium Events -->
            <ProgramCarousel
              v-if="programsByCategory.evento_premium.length"
              :title="t('programs.filterPremiumEvent')"
              :programs="programsByCategory.evento_premium"
            />

            <!-- Specialized Services -->
            <ProgramCarousel
              v-if="programsByCategory.servico_especializado.length"
              :title="t('programs.filterSpecializedService')"
              :programs="programsByCategory.servico_especializado"
            />
          </template>

          <!-- Empty State -->
          <div 
            v-if="!hasAnyPrograms" 
            class="flex flex-col items-center justify-center py-20 md:py-28 lg:py-32 text-center"
          >
            <div class="bg-secondary/10 p-6 md:p-8 rounded-full mb-4 md:mb-6">
              <span class="material-symbols-outlined text-5xl md:text-6xl lg:text-7xl text-secondary">search_off</span>
            </div>
            <h3 class="text-xl md:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white mb-2">
              {{ t('programs.noProgramsFound') }}
            </h3>
            <p class="text-sm md:text-base lg:text-lg text-slate-600 dark:text-gray-400 max-w-md mx-auto font-medium px-4">
              {{ t('programs.noProgramsFoundDesc') }}
            </p>
            <button
              v-if="searchQuery || selectedCategory"
              @click="clearFilters"
              class="mt-6 md:mt-8 px-6 md:px-8 py-2.5 md:py-3 bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white font-black text-sm md:text-base rounded-xl hover:bg-secondary hover:text-white dark:hover:text-black transition-all"
            >
              {{ t('programs.clearFilters') }}
            </button>
          </div>
        </main>
      </template>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useLocale } from '@/composables/useLocale'
import { useProgramsStore } from '@/stores/programs'
import { useAuthStore } from '@/stores/auth'
import AppLayout from '@/components/layout/AppLayout.vue'
import ProgramHero from '@/components/features/programs/ProgramHero.vue'
import ProgramCarousel from '@/components/features/programs/ProgramCarousel.vue'
import { useDynamicMeta } from '@/composables/useDynamicMeta'

const router = useRouter()
const authStore = useAuthStore()
const { t, locale: currentLocale } = useLocale()
const programsStore = useProgramsStore()

// SEO
useDynamicMeta(() => ({
  title: t('programs.title'),
  description: t('programs.noProgramsFoundDesc'),
  url: '/programs'
}))

const searchQuery = ref('')
const selectedCategory = ref<string | null>(null)

const featuredProgram = computed(() => {
  return programsStore.publishedPrograms.find(p => p.featured) || programsStore.publishedPrograms[0]
})

const categories = computed(() => [
  { value: null, label: t('programs.all') },
  { value: 'curso', label: t('programs.filterCourse') },
  { value: 'mentoria', label: t('programs.filterMentoring') },
  { value: 'workshop', label: t('programs.filterWorkshop') },
  { value: 'evento_premium', label: t('programs.filterPremiumEvent') },
  { value: 'servico_especializado', label: t('programs.filterSpecializedService') },
])

const enrolledPrograms = computed(() => {
  return programsStore.publishedPrograms.filter(p => 
    programsStore.myEnrollments.some(e => 
      e.program_id === p.id && (e.status === 'active' || e.status === 'completed')
    )
  )
})

const programsByCategory = computed(() => {
  const cats = {
    curso: [] as any[],
    mentoria: [] as any[],
    workshop: [] as any[],
    evento_premium: [] as any[],
    servico_especializado: [] as any[]
  }

  for (const program of programsStore.publishedPrograms) {
    if (cats[program.category as keyof typeof cats]) {
      cats[program.category as keyof typeof cats].push(program)
    }
  }

  return cats
})

const filteredPrograms = computed(() => {
  let programs = programsStore.publishedPrograms

  if (selectedCategory.value) {
    programs = programs.filter(p => p.category === selectedCategory.value)
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    programs = programs.filter(p => {
      const title = currentLocale.value === 'pt-BR' ? p.title_pt : p.title_en
      const desc = currentLocale.value === 'pt-BR' ? p.description_pt : p.description_en
      return title.toLowerCase().includes(query) || desc?.toLowerCase().includes(query)
    })
  }

  return programs
})

const hasAnyPrograms = computed(() => {
  if (selectedCategory.value || searchQuery.value) {
    return filteredPrograms.value.length > 0
  }
  return programsStore.publishedPrograms.length > 0
})

const getCategoryLabel = (catValue: string) => {
  const cat = categories.value.find(c => c.value === catValue)
  return cat ? cat.label : catValue
}

function handlePlay(programId: string) {
  const isEnrolled = programsStore.myEnrollments.some(
    e => e.program_id === programId && (e.status === 'active' || e.status === 'completed')
  )
  
  if (isEnrolled) {
    router.push(`/programs/${programId}/assistir`)
  } else {
    router.push(`/programs/${programId}`)
  }
}

function handleDetails(programId: string) {
  router.push(`/programs/${programId}`)
}

function clearFilters() {
  searchQuery.value = ''
  selectedCategory.value = null
}

onMounted(() => {
  programsStore.fetchPrograms()
  if (authStore.user) {
    programsStore.fetchMyEnrollments()
  }
})
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
