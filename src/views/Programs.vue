<template>
  <AppLayout hideSidebars>
    <div class="w-full flex flex-col gap-6 sm:gap-10 pb-12">
      <!-- Featured Program (Shows) Hero -->
      <section v-if="featuredProgram" class="pt-4">
        <ProgramHero 
          :program="featuredProgram" 
          @details="(id) => $router.push(`/programas/${id}`)"
        />
      </section>

      <!-- Main Content Area -->
      <div class="flex flex-col gap-8">
        <!-- Search and Filters Bar - Refined for Hero Layout -->
        <div class="flex flex-col xl:flex-row gap-6 items-center justify-between sticky top-0 z-40 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md py-4 border-b border-slate-200 dark:border-white/5 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
          <div class="flex flex-col gap-1">
            <h2 class="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
              <span class="material-symbols-outlined text-secondary drop-shadow-[0_0_8px_rgba(0,240,255,0.6)]">layers</span>
              {{ t('programs.title') }}
            </h2>
            <p class="text-sm text-slate-500 dark:text-gray-400 font-medium">
              {{ t('programs.description') }}
            </p>
          </div>

          <div class="flex flex-col md:flex-row gap-4 w-full xl:w-auto items-center">
            <!-- Search -->
            <div class="w-full md:w-80 relative">
              <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
              <input
                v-model="searchQuery"
                type="text"
                :placeholder="t('programs.searchPlaceholder')"
                class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black/40 text-slate-900 dark:text-white focus:ring-2 focus:ring-secondary outline-none transition-all shadow-sm"
              />
            </div>

            <!-- Categories -->
            <div class="flex gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-hide max-w-full">
              <button
                v-for="category in categories"
                :key="category.value || 'all'"
                @click="selectedCategory = category.value"
                :class="[
                  'px-5 py-2 rounded-xl font-bold whitespace-nowrap transition-all border text-sm',
                  selectedCategory === category.value
                    ? 'bg-secondary text-black border-secondary shadow-lg shadow-secondary/20'
                    : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-400 hover:border-secondary/50'
                ]"
              >
                {{ category.label }}
              </button>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="programsStore.loading" class="flex flex-col items-center justify-center h-96 gap-4">
          <div class="animate-spin rounded-full h-12 w-12 border-4 border-secondary border-t-transparent shadow-neon-blue"></div>
          <p class="text-slate-500 animate-pulse font-medium">Carregando programas...</p>
        </div>

        <!-- Programs Grid -->
        <div v-else-if="filteredPrograms.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
          <div
            v-for="program in filteredPrograms"
            :key="program.id"
            class="group bg-white dark:bg-surface-dark rounded-xl shadow-sm hover:shadow-2xl transition-all duration-300 border border-slate-200 dark:border-white/5 overflow-hidden flex flex-col h-full cursor-pointer transform hover:scale-105 hover:z-10"
            @click="navigateToProgram(program.id)"
          >
            <!-- Program Image -->
            <div class="relative h-48 sm:h-56 overflow-hidden bg-slate-100 dark:bg-slate-800">
              <img
                :src="program.thumbnail_url || '/program_placeholder.png'"
                :alt="getProgramTitle(program)"
                class="w-full h-full object-cover opacity-90 group-hover:opacity-50 transition-opacity duration-300"
              />
              
              <!-- Gradient Overlay on Hover -->
              <div class="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                <div class="flex gap-2 mb-2">
                  <button class="size-10 rounded-full bg-white text-black flex items-center justify-center hover:bg-secondary transition-colors" @click.stop="navigateToProgram(program.id)">
                    <span class="material-symbols-outlined text-2xl">play_arrow</span>
                  </button>
                  <button class="size-10 rounded-full border-2 border-gray-400 text-gray-200 flex items-center justify-center hover:border-white hover:text-white transition-colors" @click.stop="navigateToProgram(program.id)">
                    <span class="material-symbols-outlined text-xl">info</span>
                  </button>
                </div>
              </div>

              <!-- Category Badge -->
              <div class="absolute top-4 left-4">
                <span class="px-3 py-1 bg-black/70 backdrop-blur-md text-white text-[10px] font-black rounded-lg border border-white/20 uppercase tracking-widest">
                  {{ getCategoryLabel(program.category) }}
                </span>
              </div>

              <!-- Price Tag -->
              <div class="absolute bottom-4 right-4">
                 <div class="bg-secondary px-3 py-1.5 rounded-lg text-black font-black shadow-lg shadow-secondary/40">
                   ${{ program.price_usd }}
                 </div>
              </div>
            </div>

            <!-- Program Info -->
            <div class="p-6 flex flex-col flex-1">
              <h3 class="text-lg font-black text-slate-900 dark:text-white mb-2 line-clamp-2 leading-tight group-hover:text-secondary transition-colors uppercase tracking-tight">
                {{ getProgramTitle(program) }}
              </h3>
              
              <p class="text-slate-600 dark:text-gray-400 mb-6 text-sm line-clamp-2 flex-1 font-medium italic">
                {{ getProgramDescription(program) }}
              </p>

              <!-- Footer: Meta -->
              <div class="pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between mt-auto">
                <div class="flex items-center gap-4 text-xs font-bold text-slate-400 dark:text-white/40 uppercase tracking-widest">
                  <div class="flex items-center gap-1.5">
                    <span class="material-symbols-outlined text-sm text-secondary">schedule</span>
                    {{ program.duration_hours }}h
                  </div>
                  <div class="flex items-center gap-1.5">
                    <span class="material-symbols-outlined text-sm text-secondary">bar_chart</span>
                    {{ t(`programs.${program.difficulty_level?.toLowerCase()}`) || program.difficulty_level }}
                  </div>
                </div>
                
                <span class="material-symbols-outlined text-secondary group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="flex flex-col items-center justify-center py-32 text-center bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-3xl border-dashed">
          <div class="bg-secondary/10 p-8 rounded-full mb-6">
            <span class="material-symbols-outlined text-7xl text-secondary">search_off</span>
          </div>
          <h3 class="text-2xl font-black text-slate-900 dark:text-white mb-2">
            {{ t('programs.noProgramsFound') }}
          </h3>
          <p class="text-slate-600 dark:text-gray-400 max-w-md mx-auto font-medium">
            {{ t('programs.noProgramsFoundDesc') }}
          </p>
          <button 
            v-if="searchQuery || selectedCategory" 
            @click="clearFilters"
            class="mt-8 px-8 py-3 bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white font-black rounded-xl hover:bg-secondary hover:text-black transition-all shadow-lg hover:shadow-secondary/20"
          >
            Limpar Filtros
          </button>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useLocale } from '@/composables/useLocale'
import { useProgramsStore } from '@/stores/programs'
import AppLayout from '@/components/layout/AppLayout.vue'
import ProgramHero from '@/components/features/programs/ProgramHero.vue'

const router = useRouter()

const { t, locale: currentLocale } = useLocale()
const programsStore = useProgramsStore()

const searchQuery = ref('')
const selectedCategory = ref<string | null>(null)

const featuredProgram = computed(() => {
  return programsStore.publishedPrograms.find(p => p.featured) || programsStore.publishedPrograms[0]
})

const categories = computed(() => [
  { value: null, label: t('programs.filterAll') },
  { value: 'curso', label: t('programs.filterCourse') },
  { value: 'mentoria', label: t('programs.filterMentoring') },
  { value: 'workshop', label: t('programs.filterWorkshop') },
  { value: 'evento_premium', label: t('programs.filterPremiumEvent') },
  { value: 'servico_especializado', label: t('programs.filterSpecializedService') },
])

const filteredPrograms = computed(() => {
  let programs = programsStore.publishedPrograms

  // Filter by category
  if (selectedCategory.value) {
    programs = programs.filter((p) => p.category === selectedCategory.value)
  }

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    programs = programs.filter((p) => {
      const title = currentLocale.value === 'pt-BR' ? p.title_pt : p.title_en
      const desc = currentLocale.value === 'pt-BR' ? p.description_pt : p.description_en
      return title.toLowerCase().includes(query) || desc.toLowerCase().includes(query)
    })
  }

  return programs
})

const getProgramTitle = (program: any) => {
  return currentLocale.value === 'pt-BR' ? program.title_pt : program.title_en
}

const getProgramDescription = (program: any) => {
  return currentLocale.value === 'pt-BR' ? program.short_description_pt : program.short_description_en
}

const getCategoryLabel = (catValue: string) => {
  const cat = categories.value.find(c => c.value === catValue)
  return cat ? cat.label : catValue
}

const navigateToProgram = (programId: string) => {
  router.push(`/programas/${programId}`)
}

const clearFilters = () => {
  searchQuery.value = ''
  selectedCategory.value = null
}

onMounted(() => {
  programsStore.fetchPrograms()
})
</script>

