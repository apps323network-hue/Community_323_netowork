<template>
  <AppLayout>
    <div class="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header Overlay with Stats -->
      <div class="relative overflow-hidden rounded-[2rem] sm:rounded-3xl bg-slate-900 mb-8 sm:mb-10 p-6 sm:p-12 shadow-2xl">
        <!-- Abstract Background Shapes -->
        <div class="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-secondary/20 blur-[80px] sm:blur-[120px] rounded-full"></div>
        <div class="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-48 sm:w-64 h-48 sm:h-64 bg-primary/10 blur-[60px] sm:blur-[80px] rounded-full"></div>
        
        <div class="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8 sm:gap-6">
          <div class="text-center lg:text-left">
            <div class="flex items-center justify-center lg:justify-start gap-3 text-secondary mb-4">
              <div class="bg-secondary/10 p-2 rounded-lg">
                <span class="material-symbols-outlined text-xl sm:text-2xl">school</span>
              </div>
              <span class="text-[10px] sm:text-sm font-black uppercase tracking-[0.2em]">Área do Professor</span>
            </div>
            <h1 class="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4 leading-[1.1]">
              Seja bem-vindo,<br/>
              <span class="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-secondary/60">Professor</span>
            </h1>
            <p class="text-slate-400 max-w-xl text-sm sm:text-lg font-medium leading-relaxed mx-auto lg:mx-0">
              Aqui você gerencia seus programas, acompanha o progresso dos alunos e organiza todo o material didático.
            </p>
          </div>
 
          <!-- Quick Stats Overlay -->
          <div class="grid grid-cols-3 sm:flex gap-3 sm:gap-6">
            <div class="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6 min-w-0 sm:min-w-[120px] text-center">
              <p class="text-xl sm:text-3xl font-black text-white mb-1">{{ myPrograms.length }}</p>
              <p class="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Programas</p>
            </div>
            <div class="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6 min-w-0 sm:min-w-[120px] text-center">
              <p class="text-xl sm:text-3xl font-black text-white mb-1">{{ totalStudents }}</p>
              <p class="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Alunos</p>
            </div>
            <div class="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6 min-w-0 sm:min-w-[120px] text-center">
              <p class="text-xl sm:text-3xl font-black text-white mb-1">{{ totalLessons }}</p>
              <p class="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Aulas</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Programs Grid Section -->
      <div class="mb-10">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <h2 class="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <span class="w-2 h-8 bg-secondary rounded-full"></span>
            Meus Programas
          </h2>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div v-for="i in 3" :key="i" class="h-80 bg-slate-200 dark:bg-white/5 animate-pulse rounded-3xl"></div>
        </div>

        <!-- Empty State -->
        <div v-else-if="myPrograms.length === 0" class="text-center py-24 bg-white dark:bg-surface-dark rounded-[32px] border border-slate-200 dark:border-white/5 shadow-xl">
          <div class="bg-secondary/10 p-10 rounded-full w-fit mx-auto mb-8 border border-secondary/20">
            <span class="material-symbols-outlined text-7xl text-secondary">import_contacts</span>
          </div>
          <h3 class="text-2xl font-black text-slate-900 dark:text-white mb-3">Nenhum programa atribuído</h3>
          <p class="text-slate-600 dark:text-gray-400 text-lg max-w-md mx-auto">
            Você ainda não possui programas sob sua gestão. Entre em contato com a administração para ser habilitado.
          </p>
        </div>

        <!-- Programs Card Grid -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div
            v-for="program in myPrograms"
            :key="program.id"
            class="group relative bg-white dark:bg-surface-dark rounded-[32px] border border-slate-200 dark:border-white/5 overflow-hidden hover:shadow-2xl hover:shadow-secondary/10 transition-all duration-500 hover:-translate-y-2 flex flex-col h-full"
          >
            <!-- Thumbnail & Badge -->
            <div class="relative h-48 overflow-hidden">
              <img
                :src="program.thumbnail_url || '/program_placeholder.png'"
                :alt="getProgramTitle(program)"
                class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
              <div class="absolute top-4 left-4">
                <span 
                  class="px-3 py-1 text-[10px] font-black rounded-full uppercase tracking-tighter"
                  :class="program.status === 'published' ? 'bg-secondary text-black' : 'bg-slate-500 text-white'"
                >
                  {{ program.status === 'published' ? 'Publicado' : 'Rascunho' }}
                </span>
              </div>
              
            </div>

            <!-- Card Content -->
            <div class="p-6 flex-1 flex flex-col">
              <h3 class="text-xl font-black text-slate-900 dark:text-white mb-2 line-clamp-1 group-hover:text-secondary transition-colors">
                {{ getProgramTitle(program) }}
              </h3>
              <p class="text-sm text-slate-600 dark:text-gray-400 line-clamp-2 mb-6 font-medium leading-relaxed">
                {{ getProgramDescription(program) }}
              </p>

              <!-- Stats Row -->
              <div class="grid grid-cols-3 gap-4 py-4 border-t border-slate-100 dark:border-white/5 mb-6">
                <div class="text-center">
                  <p class="text-lg font-black text-slate-900 dark:text-white">{{ program.modulesCount || 0 }}</p>
                  <p class="text-[10px] font-bold text-slate-500 uppercase">Módulos</p>
                </div>
                <div class="text-center">
                  <p class="text-lg font-black text-slate-900 dark:text-white">{{ program.lessonsCount || 0 }}</p>
                  <p class="text-[10px] font-bold text-slate-500 uppercase">Aulas</p>
                </div>
                <div class="text-center">
                  <p class="text-lg font-black text-slate-900 dark:text-white">{{ program.studentsCount || 0 }}</p>
                  <p class="text-[10px] font-bold text-slate-500 uppercase">Alunos</p>
                </div>
              </div>

              <!-- Button Actions -->
              <div class="mt-auto space-y-3">
                <button
                  @click.stop="$router.push(`/professor/programa/${program.id}`)"
                  class="w-full py-4 bg-secondary text-black font-black rounded-2xl hover:bg-secondary/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-secondary/20"
                >
                  <span class="material-symbols-outlined text-xl">edit_document</span>
                  Gerenciar Conteúdo
                </button>
                <button
                  @click.stop="openStatusModal(program)"
                  :class="[
                    'w-full py-4 font-black rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg',
                    program.status === 'published' 
                      ? 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-white/10' 
                      : 'bg-primary text-white hover:opacity-90 shadow-primary/20'
                  ]"
                >
                  <span class="material-symbols-outlined text-xl">
                    {{ program.status === 'published' ? 'visibility_off' : 'rocket_launch' }}
                  </span>
                  {{ program.status === 'published' ? 'Remover Publicação' : 'Publicar Treinamento' }}
                </button>

                <button
                  @click="$router.push(`/programs/${program?.id}`)"
                  class="w-full py-3 text-slate-400 dark:text-gray-500 font-bold rounded-2xl hover:text-slate-600 dark:hover:text-white transition-all text-[10px] uppercase tracking-widest"
                >
                  Visualizar como Aluno
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>


    <!-- Status Change Confirmation Modal -->
    <div
      v-if="statusModal.show"
      class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4"
      @click.self="statusModal.show = false"
    >
      <div class="bg-white dark:bg-surface-dark w-full max-w-md rounded-[32px] shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden animate-fade-in">
        <div class="p-8 text-center space-y-6">
          <div 
            :class="[
              'w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-2',
              statusModal.program?.status === 'published' ? 'bg-amber-500/10 text-amber-500' : 'bg-primary/10 text-primary'
            ]"
          >
            <span class="material-symbols-outlined text-4xl">
              {{ statusModal.program?.status === 'published' ? 'visibility_off' : 'rocket_launch' }}
            </span>
          </div>
          
          <div class="space-y-2">
            <h3 class="text-2xl font-black text-slate-900 dark:text-white">
              {{ statusModal.program?.status === 'published' ? 'Remover Publicação?' : 'Publicar Treinamento?' }}
            </h3>
            <p class="text-slate-600 dark:text-gray-400 font-medium">
              {{ 
                statusModal.program?.status === 'published' 
                  ? 'O conteúdo deixará de ser visível para novos alunos na plataforma.' 
                  : 'O treinamento ficará visível e disponível para todos os alunos da comunidade.' 
              }}
            </p>
          </div>

          <div class="flex flex-col gap-3 pt-2">
            <button
              @click="confirmStatusChange"
              :disabled="statusModal.loading"
              :class="[
                'w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2',
                statusModal.program?.status === 'published' 
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-black' 
                  : 'bg-primary text-white shadow-xl shadow-primary/20'
              ]"
            >
              <span v-if="statusModal.loading" class="animate-spin material-symbols-outlined text-sm">sync</span>
              {{ statusModal.loading ? 'Processando...' : (statusModal.program?.status === 'published' ? 'Confirmar Retirada' : 'Sim, Publicar Agora') }}
            </button>
            <button
              @click="statusModal.show = false"
              class="w-full py-4 text-slate-500 font-bold hover:bg-slate-100 dark:hover:bg-white/5 rounded-2xl transition-all text-xs uppercase tracking-widest"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useLocale } from '@/composables/useLocale'
import { supabase } from '@/lib/supabase'
import AppLayout from '@/components/layout/AppLayout.vue'

const { locale: currentLocale } = useLocale()

const myPrograms = ref<any[]>([])
const loading = ref(true)

// Status modal state
const statusModal = ref({
  show: false,
  loading: false,
  program: null as any
})


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

function openStatusModal(program: any) {
  statusModal.value.program = program
  statusModal.value.show = true
}

async function confirmStatusChange() {
  if (!statusModal.value.program) return
  
  const program = statusModal.value.program
  const newStatus = program.status === 'published' ? 'draft' : 'published'
  
  statusModal.value.loading = true

  try {
    const { error } = await supabase
      .from('programs')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', program.id)

    if (error) throw error
    
    // Update local state
    program.status = newStatus
    statusModal.value.show = false
  } catch (error) {
    console.error('Error toggling program status:', error)
    alert('Erro ao alterar status do programa.')
  } finally {
    statusModal.value.loading = false
  }
}

onMounted(() => {
  fetchProfessorPrograms()
})
</script>
