<template>
  <AppLayout>
    <div class="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Loading State -->
      <div v-if="loading && !program" class="flex items-center justify-center h-96">
        <div class="animate-spin rounded-full h-12 w-12 border-4 border-secondary border-t-transparent"></div>
      </div>

      <div v-else-if="program">
        <!-- Header -->
        <div class="mb-8">
          <button
            @click="$router.push('/professor')"
            class="flex items-center gap-2 text-slate-600 dark:text-gray-400 hover:text-secondary transition-colors mb-4"
          >
            <span class="material-symbols-outlined">arrow_back</span>
            Voltar para Dashboard
          </button>

          <div class="flex items-start gap-6">
            <img
              :src="program.thumbnail_url || '/program_placeholder.png'"
              :alt="getProgramTitle(program)"
              class="w-48 h-32 object-cover rounded-xl flex-shrink-0"
            />
            <div class="flex-1">
              <h1 class="text-3xl font-black text-slate-900 dark:text-white mb-2">
                {{ getProgramTitle(program) }}
              </h1>
              <p class="text-slate-600 dark:text-gray-400 max-w-2xl line-clamp-2">
                {{ getProgramDescription(program) }}
              </p>
            </div>
          </div>
        </div>

        <!-- Tabs -->
        <div class="border-b border-slate-200 dark:border-white/10 mb-8">
          <nav class="flex gap-8">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              @click="activeTab = tab.id"
              :class="[
                'pb-4 px-2 font-bold text-sm transition-all border-b-2',
                activeTab === tab.id
                  ? 'text-secondary border-secondary'
                  : 'text-slate-600 dark:text-gray-400 border-transparent hover:text-secondary'
              ]"
            >
              <span class="flex items-center gap-2">
                <span class="material-symbols-outlined text-lg">{{ tab.icon }}</span>
                {{ tab.label }}
              </span>
            </button>
          </nav>
        </div>

        <!-- Tab Content -->
        <div>
          <!-- Modules Tab -->
          <ModulesTab v-if="activeTab === 'modules'" :program-id="program.id" />

          <!-- Lessons Tab -->
          <LessonsTab v-else-if="activeTab === 'lessons'" :program-id="program.id" />

          <!-- Materials Tab -->
          <MaterialsTab v-else-if="activeTab === 'materials'" :program-id="program.id" />

          <!-- Students Tab -->
          <StudentsTab v-else-if="activeTab === 'students'" :program-id="program.id" />
        </div>
      </div>

      <div v-else class="flex items-center justify-center h-96">
        <div class="text-center">
          <div class="bg-secondary/10 p-8 rounded-full w-fit mx-auto mb-6">
            <span class="material-symbols-outlined text-6xl text-secondary">error</span>
          </div>
          <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-2">Programa não encontrado</h3>
          <p class="text-slate-600 dark:text-gray-400">
            Você não tem permissão para acessar este programa.
          </p>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useLocale } from '@/composables/useLocale'
import { supabase } from '@/lib/supabaseClient'
import AppLayout from '@/components/layout/AppLayout.vue'
import ModulesTab from '@/components/professor/ModulesTab.vue'
import LessonsTab from '@/components/professor/LessonsTab.vue'
import MaterialsTab from '@/components/professor/MaterialsTab.vue'
import StudentsTab from '@/components/professor/StudentsTab.vue'

const route = useRoute()
const { locale: currentLocale } = useLocale()

const program = ref<any>(null)
const loading = ref(true)
const activeTab = ref('modules')

const tabs = [
  { id: 'modules', label: 'Módulos', icon: 'folder' },
  { id: 'lessons', label: 'Aulas', icon: 'play_circle' },
  { id: 'materials', label: 'Materiais', icon: 'description' },
  { id: 'students', label: 'Alunos', icon: 'group' }
]

const getProgramTitle = (program: any) => {
  return currentLocale.value === 'pt-BR' ? program.title_pt : program.title_en
}

const getProgramDescription = (program: any) => {
  return currentLocale.value === 'pt-BR' ? program.short_description_pt : program.short_description_en
}

async function fetchProgram() {
  loading.value = true

  try {
    const programId = route.params.id as string
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Check if user is assigned as professor
    const { data: assignment } = await supabase
      .from('program_professors')
      .select('*')
      .eq('program_id', programId)
      .eq('professor_id', user.id)
      .single()

    if (!assignment) {
      loading.value = false
      return
    }

    // Fetch program details
    const { data, error } = await supabase
      .from('programs')
      .select('*')
      .eq('id', programId)
      .single()

    if (error) throw error

    program.value = data
  } catch (error) {
    console.error('Error fetching program:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchProgram()
})
</script>
