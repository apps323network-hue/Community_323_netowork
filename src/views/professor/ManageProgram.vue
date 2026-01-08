<template>
  <AppLayout>
    <div class="h-[calc(100vh-64px)] flex flex-col -mx-4 sm:mx-0">
      <!-- Top Navigation Bar -->
      <div class="bg-white dark:bg-surface-dark border-b border-slate-200 dark:border-white/5 px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between z-20 shadow-sm shrink-0">
        <div class="flex items-center gap-3 sm:gap-6 min-w-0">
          <button
            @click="$router.push('/professor')"
            class="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-all group shrink-0"
            title="Voltar"
          >
            <span class="material-symbols-outlined text-slate-600 dark:text-gray-400 group-hover:text-secondary group-hover:-translate-x-1 transition-all">arrow_back</span>
          </button>
          
          <div v-if="program" class="flex items-center gap-3 min-w-0">
            <img
              :src="program.thumbnail_url || '/program_placeholder.png'"
              class="w-10 h-10 object-cover rounded-xl shadow-lg border border-white/10 shrink-0"
            />
            <div class="min-w-0 pr-2">
              <h1 class="text-sm font-black text-slate-900 dark:text-white leading-tight truncate">
                {{ getProgramTitle(program) }}
              </h1>
              <p class="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em]">Painel de Gestão</p>
            </div>
          </div>
        </div>

        <!-- Center Tabs (Visible on Desktop) -->
        <nav class="hidden lg:flex items-center h-full">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id; selectedItem = null; isCreating = false"
            :class="[
              'px-6 flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-all relative h-16 sm:h-20',
              activeTab === tab.id
                ? 'text-secondary'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            ]"
          >
            <span class="material-symbols-outlined text-lg">{{ tab.icon }}</span>
            {{ tab.label }}
            <div v-if="activeTab === tab.id" class="absolute bottom-0 left-0 w-full h-1.5 bg-secondary rounded-t-full shadow-[0_0_10px_rgba(255,214,0,0.5)]"></div>
          </button>
        </nav>

        <!-- Right Side Actions -->
        <div class="flex items-center gap-2 sm:gap-4">
          <button
            @click="$router.push(`/programs/${program?.id}`)"
            class="w-10 h-10 sm:w-auto sm:px-4 sm:py-2 bg-slate-900 text-white dark:bg-white dark:text-black rounded-xl sm:rounded-xl shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
            title="Visualizar como Aluno"
          >
            <span class="material-symbols-outlined text-xl sm:text-sm">visibility</span>
            <span class="hidden sm:inline text-xs font-black uppercase">Ver Aluno</span>
          </button>
        </div>
      </div>

      <!-- Mobile Segmented Control Navigation -->
      <div class="lg:hidden p-2 bg-white dark:bg-surface-dark border-b border-slate-200 dark:border-white/5 shrink-0">
        <nav class="grid grid-cols-3 bg-slate-100 dark:bg-black/40 p-1 rounded-xl">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id; selectedItem = null; isCreating = false"
            :class="[
              'flex flex-col items-center justify-center py-2 rounded-lg transition-all gap-0.5',
              activeTab === tab.id 
                ? 'bg-white dark:bg-surface-lighter text-secondary shadow-sm' 
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-gray-300'
            ]"
          >
            <span class="material-symbols-outlined text-xl">{{ tab.icon }}</span>
            <span class="text-[7px] font-black uppercase tracking-widest">{{ getShortLabel(tab.id) }}</span>
          </button>
        </nav>
      </div>

      <!-- Main Content Area -->
      <div class="flex-1 overflow-hidden relative">
        <!-- Loading State -->
        <div v-if="loading && !program" class="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-black/50 backdrop-blur-sm z-50">
          <div class="animate-spin rounded-full h-12 w-12 border-4 border-secondary border-t-transparent"></div>
        </div>

        <div v-if="program" class="h-full">
          <!-- Curriculum Builder View (Split Layout on Desktop, Switcher on Mobile) -->
          <div v-if="activeTab === 'curriculum'" class="flex h-full relative">
            <!-- Sidebar -->
            <aside 
              :class="[
                'w-full sm:w-80 h-full flex-shrink-0 transition-transform duration-300 absolute sm:relative z-10 bg-white dark:bg-surface-dark sm:translate-x-0',
                selectedItem || isCreating ? '-translate-x-full sm:translate-x-0' : 'translate-x-0'
              ]"
            >
               <CurriculumSidebar 
                :modules="modules" 
                :selected-id="selectedItem?.id"
                @select-module="handleSelectModule"
                @select-lesson="handleSelectLesson"
                @add-module="handleStartCreateModule"
                @add-lesson="handleStartCreateLesson"
               />
            </aside>

            <!-- Editor -->
            <main 
              :class="[
                'flex-1 h-full bg-slate-50 dark:bg-black/20 transition-transform duration-300 w-full sm:w-auto absolute sm:relative right-0',
                selectedItem || isCreating ? 'translate-x-0' : 'translate-x-full sm:translate-x-0'
              ]"
            >
               <ContentEditor 
                :selected-item="selectedItem"
                :mode="editorMode"
                :is-creating="isCreating"
                :program-name="getProgramTitle(program)"
                :loading="modulesStore.loading"
                @save="handleSave"
                @cancel="handleCancel"
                @delete="handleDelete"
               />
            </main>
          </div>

          <!-- Other Tabs (Full Width) -->
          <div v-else class="h-full overflow-y-auto w-full max-w-[1400px] mx-auto p-4 sm:p-8">
            <MaterialsTab v-if="activeTab === 'materials'" :program-id="program.id" />
            <StudentsTab v-else-if="activeTab === 'students'" :program-id="program.id" />
          </div>
        </div>

        <!-- Error State -->
        <div v-else-if="!loading" class="h-full flex items-center justify-center">
            <div class="text-center max-w-sm">
                <div class="bg-red-500/10 p-6 rounded-full w-fit mx-auto mb-6">
                    <span class="material-symbols-outlined text-4xl text-red-500">lock_open</span>
                </div>
                <h3 class="text-xl font-black text-slate-900 dark:text-white mb-2">Acesso Negado</h3>
                <p class="text-slate-500 dark:text-gray-400 text-sm font-medium">
                    Você não tem as permissões necessárias para gerenciar este programa. 
                </p>
            </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useLocale } from '@/composables/useLocale'
import { supabase } from '@/lib/supabase'
import { useModulesStore } from '@/stores/modules'
import AppLayout from '@/components/layout/AppLayout.vue'
import CurriculumSidebar from '@/components/professor/CurriculumSidebar.vue'
import ContentEditor from '@/components/professor/ContentEditor.vue'
import MaterialsTab from '@/components/professor/MaterialsTab.vue'
import StudentsTab from '@/components/professor/StudentsTab.vue'

const route = useRoute()
const { locale: currentLocale } = useLocale()
const modulesStore = useModulesStore()

const program = ref<any>(null)
const loading = ref(true)
const activeTab = ref('curriculum')

// Editor State
const selectedItem = ref<any>(null)
const editorMode = ref<'module' | 'lesson'>('module')
const isCreating = ref(false)
const targetModuleForLesson = ref<any>(null)

const tabs = [
  { id: 'curriculum', label: 'Grade Curricular', icon: 'account_tree' },
  { id: 'materials', label: 'Meus Materiais', icon: 'description' },
  { id: 'students', label: 'Gestão de Alunos', icon: 'group' }
]

const modules = computed(() => modulesStore.getModulesByProgram(program.value?.id || ''))

const getProgramTitle = (p: any) => {
  return currentLocale.value === 'pt-BR' ? p.title_pt : p.title_en
}

const getShortLabel = (id: string) => {
  const labels: Record<string, string> = {
    curriculum: 'Grade',
    materials: 'Materiais',
    students: 'Alunos'
  }
  return labels[id] || id
}

// Sidebar handlers
function handleSelectModule(module: any) {
  selectedItem.value = module
  editorMode.value = 'module'
  isCreating.value = false
}

function handleSelectLesson(lesson: any) {
  selectedItem.value = lesson
  editorMode.value = 'lesson'
  isCreating.value = false
}

function handleStartCreateModule() {
  selectedItem.value = null
  editorMode.value = 'module'
  isCreating.value = true
}

function handleStartCreateLesson(module: any) {
  selectedItem.value = null
  editorMode.value = 'lesson'
  isCreating.value = true
  targetModuleForLesson.value = module
}

function handleCancel() {
  selectedItem.value = null
  isCreating.value = false
}

// CRUD Operations
async function handleSave(formData: any) {
  try {
    if (editorMode.value === 'module') {
      if (isCreating.value) {
        await modulesStore.createModule({
          ...formData,
          program_id: program.value.id,
          order_index: modules.value.length
        })
      } else {
        await modulesStore.updateModule(selectedItem.value.id, formData)
      }
    } else {
      if (isCreating.value) {
        await modulesStore.createLesson({
          ...formData,
          program_id: program.value.id,
          module_id: targetModuleForLesson.value.id,
          order_index: targetModuleForLesson.value.lessons?.length || 0
        }, true) // true = fetch youtube data
      } else {
        await modulesStore.updateLesson(selectedItem.value.id, formData, true)
      }
    }
    
    // Refresh data
    await modulesStore.fetchModulesWithLessons(program.value.id)
    selectedItem.value = null
    isCreating.value = false
  } catch (error) {
    console.error('Error saving item:', error)
    alert('Erro ao salvar. Verifique os dados e tente novamente.')
  }
}

async function handleDelete(item: any) {
  const label = editorMode.value === 'module' ? 'módulo' : 'aula'
  if (!confirm(`Deseja realmente excluir este ${label}? Esta ação não pode ser desfeita.`)) return

  try {
    if (editorMode.value === 'module') {
      await modulesStore.deleteModule(item.id)
    } else {
      await modulesStore.deleteLesson(item.id)
    }
    
    await modulesStore.fetchModulesWithLessons(program.value.id)
    selectedItem.value = null
  } catch (error) {
    console.error('Error deleting item:', error)
  }
}

async function fetchProgram() {
  loading.value = true
  try {
    const programId = route.params.id as string
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Verify assignment
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

    const { data, error } = await supabase
      .from('programs')
      .select('*')
      .eq('id', programId)
      .single()

    if (error) throw error
    program.value = data
    
    // Load modules
    await modulesStore.fetchModulesWithLessons(programId)
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
