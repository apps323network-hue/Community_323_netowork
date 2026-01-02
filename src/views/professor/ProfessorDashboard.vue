<template>
  <AppLayout>
    <div class="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="flex items-center justify-between mb-10">
        <div>
          <h1 class="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <span class="material-symbols-outlined text-secondary text-4xl">school</span>
            Dashboard do Professor
          </h1>
          <p class="text-slate-600 dark:text-gray-400 mt-2">
            Gerencie seus programas, módulos e alunos
          </p>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center h-96">
        <div class="animate-spin rounded-full h-12 w-12 border-4 border-secondary border-t-transparent"></div>
      </div>

      <!-- Professor's Programs -->
      <div v-else>
        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div class="bg-white dark:bg-surface-dark rounded-2xl p-6 border border-slate-200 dark:border-white/5">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Programas</p>
                <p class="text-3xl font-black text-slate-900 dark:text-white mt-2">{{ myPrograms.length }}</p>
              </div>
              <div class="bg-secondary/10 p-4 rounded-xl">
                <span class="material-symbols-outlined text-3xl text-secondary">layers</span>
              </div>
            </div>
          </div>

          <div class="bg-white dark:bg-surface-dark rounded-2xl p-6 border border-slate-200 dark:border-white/5">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Total Alunos</p>
                <p class="text-3xl font-black text-slate-900 dark:text-white mt-2">{{ totalStudents }}</p>
              </div>
              <div class="bg-secondary/10 p-4 rounded-xl">
                <span class="material-symbols-outlined text-3xl text-secondary">group</span>
              </div>
            </div>
          </div>

          <div class="bg-white dark:bg-surface-dark rounded-2xl p-6 border border-slate-200 dark:border-white/5">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Aulas</p>
                <p class="text-3xl font-black text-slate-900 dark:text-white mt-2">{{ totalLessons }}</p>
              </div>
              <div class="bg-secondary/10 p-4 rounded-xl">
                <span class="material-symbols-outlined text-3xl text-secondary">play_circle</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Programs List -->
        <div class="bg-white dark:bg-surface-dark rounded-2xl border border-slate-200 dark:border-white/5 overflow-hidden">
          <div class="px-6 py-5 border-b border-slate-200 dark:border-white/5">
            <h2 class="text-xl font-black text-slate-900 dark:text-white">Meus Programas</h2>
          </div>

          <div v-if="myPrograms.length === 0" class="p-12 text-center">
            <div class="bg-secondary/10 p-8 rounded-full w-fit mx-auto mb-6">
              <span class="material-symbols-outlined text-6xl text-secondary">school</span>
            </div>
            <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-2">Nenhum programa atribuído</h3>
            <p class="text-slate-600 dark:text-gray-400">
              Entre em contato com o administrador para ser atribuído a um programa.
            </p>
          </div>

          <div v-else class="divide-y divide-slate-200 dark:divide-white/5">
            <div
              v-for="program in myPrograms"
              :key="program.id"
              class="p-6 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer"
              @click="$router.push(`/professor/programa/${program.id}`)"
            >
              <div class="flex items-start gap-4">
                <img
                  :src="program.thumbnail_url || '/program_placeholder.png'"
                  :alt="getProgramTitle(program)"
                  class="w-32 h-20 object-cover rounded-lg flex-shrink-0"
                />
                <div class="flex-1 min-w-0">
                  <h3 class="text-lg font-black text-slate-900 dark:text-white mb-2">
                    {{ getProgramTitle(program) }}
                  </h3>
                  <p class="text-sm text-slate-600 dark:text-gray-400 line-clamp-2 mb-3">
                    {{ getProgramDescription(program) }}
                  </p>
                  <div class="flex items-center gap-6 text-xs font-bold text-slate-500 dark:text-gray-400">
                    <span class="flex items-center gap-1.5">
                      <span class="material-symbols-outlined text-sm text-secondary">folder</span>
                      {{ program.modulesCount || 0 }} módulos
                    </span>
                    <span class="flex items-center gap-1.5">
                      <span class="material-symbols-outlined text-sm text-secondary">play_circle</span>
                      {{ program.lessonsCount || 0 }} aulas
                    </span>
                    <span class="flex items-center gap-1.5">
                      <span class="material-symbols-outlined text-sm text-secondary">group</span>
                      {{ program.studentsCount || 0 }} alunos
                    </span>
                  </div>
                </div>
                <span class="material-symbols-outlined text-secondary">chevron_right</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useLocale } from '@/composables/useLocale'
import { supabase } from '@/lib/supabaseClient'
import AppLayout from '@/components/layout/AppLayout.vue'

const { locale: currentLocale } = useLocale()

const myPrograms = ref<any[]>([])
const loading = ref(true)

const totalStudents = computed(() => {
  return myPrograms.value.reduce((sum, p) => sum + (p.studentsCount || 0), 0)
})

const totalLessons = computed(() => {
  return myPrograms.value.reduce((sum, p) => sum + (p.lessonsCount || 0), 0)
})

const getProgramTitle = (program: any) => {
  return currentLocale.value === 'pt-BR' ? program.title_pt : program.title_en
}

const getProgramDescription = (program: any) => {
  return currentLocale.value === 'pt-BR' ? program.short_description_pt : program.short_description_en
}

async function fetchProfessorPrograms() {
  loading.value = true

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Get programs assigned to this professor
    const { data: assignments } = await supabase
      .from('program_professors')
      .select('program_id')
      .eq('professor_id', user.id)

    if (!assignments || assignments.length === 0) {
      loading.value = false
      return
    }

    const programIds = assignments.map(a => a.program_id)

    // Fetch program details
    const { data: programs } = await supabase
      .from('programs')
      .select('*')
      .in('id', programIds)

    if (!programs) {
      loading.value = false
      return
    }

    // Fetch counts for each program
    for (const program of programs) {
      // Modules count
      const { count: modulesCount } = await supabase
        .from('program_modules')
        .select('*', { count: 'exact', head: true })
        .eq('program_id', program.id)

      // Lessons count
      const { count: lessonsCount } = await supabase
        .from('program_lessons')
        .select('*', { count: 'exact', head: true })
        .eq('program_id', program.id)

      // Students count
      const { count: studentsCount } = await supabase
        .from('program_enrollments')
        .select('*', { count: 'exact', head: true })
        .eq('program_id', program.id)

      program.modulesCount = modulesCount || 0
      program.lessonsCount = lessonsCount || 0
      program.studentsCount = studentsCount || 0
    }

    myPrograms.value = programs
  } catch (error) {
    console.error('Error fetching professor programs:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchProfessorPrograms()
})
</script>
