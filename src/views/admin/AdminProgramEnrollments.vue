<template>
  <AdminLayout>
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div class="space-y-1">
          <RouterLink
            to="/admin/programs"
            class="inline-flex items-center text-sm text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white transition-colors mb-2"
          >
            <span class="material-icons text-sm mr-1">arrow_back</span>
            Voltar para Programas
          </RouterLink>
          <div v-if="program" class="flex items-center gap-3">
             <div class="h-10 w-14 rounded bg-slate-200 dark:bg-white/10 overflow-hidden flex-shrink-0">
                <img v-if="program.thumbnail_url" :src="program.thumbnail_url" class="h-full w-full object-cover" />
                <div v-else class="h-full w-full flex items-center justify-center text-slate-400">
                  <span class="material-icons">image</span>
                </div>
             </div>
             <div>
                <h1 class="text-2xl font-bold text-slate-900 dark:text-white">
                  Matrículas: {{ currentLocale === 'pt-BR' ? program.title_pt : program.title_en }}
                </h1>
                <p class="text-slate-500 text-sm">Gerencie os alunos inscritos e acompanhe o progresso</p>
             </div>
          </div>
          <div v-else-if="loading" class="h-12 w-96 bg-slate-200 dark:bg-white/10 animate-pulse rounded-lg"></div>
        </div>

        <div v-if="enrollments.length > 0 || !loading" class="flex items-center gap-4 bg-white dark:bg-surface-dark p-3 rounded-xl border border-slate-200 dark:border-white/5 shadow-sm">
           <div class="text-center px-4 border-r border-slate-100 dark:border-white/5">
              <div class="text-2xl font-black text-primary dark:text-secondary">{{ enrollments.length }}</div>
              <div class="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Total</div>
           </div>
           <div class="text-center px-4 border-r border-slate-100 dark:border-white/5">
              <div class="text-2xl font-black text-green-500">{{ activeCount }}</div>
              <div class="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Ativos</div>
           </div>
           <div class="text-center px-4">
              <div class="text-2xl font-black text-blue-500">{{ completedCount }}</div>
              <div class="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Concluídos</div>
           </div>
        </div>
      </div>

      <!-- Filters & Search -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="relative">
          <span class="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
          <input
            v-model="search"
            type="text"
            placeholder="Buscar aluno por nome..."
            class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all"
          />
        </div>
        
        <select
          v-model="filterStatus"
          class="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary transition-all"
        >
          <option value="all">Todos os Status</option>
          <option value="active">Ativos</option>
          <option value="pending">Pendentes</option>
          <option value="completed">Concluídos</option>
          <option value="cancelled">Cancelados</option>
        </select>
      </div>

      <!-- Table -->
      <div class="bg-white dark:bg-surface-dark rounded-2xl shadow-sm border border-slate-200 dark:border-white/5 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50/50 dark:bg-white/5 border-b border-slate-200 dark:border-white/5">
                <th class="p-4 font-bold text-slate-500 dark:text-gray-400 text-xs uppercase tracking-wider">Aluno</th>
                <th class="p-4 font-bold text-slate-500 dark:text-gray-400 text-xs uppercase tracking-wider">Data Inscrição</th>
                <th class="p-4 font-bold text-slate-500 dark:text-gray-400 text-xs uppercase tracking-wider">Progresso</th>
                <th class="p-4 font-bold text-slate-500 dark:text-gray-400 text-xs uppercase tracking-wider">Pagamento</th>
                <th class="p-4 font-bold text-slate-500 dark:text-gray-400 text-xs uppercase tracking-wider">Status</th>
                <th class="p-4 font-bold text-slate-500 dark:text-gray-400 text-xs uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-white/5">
              <tr v-for="enrollment in filteredEnrollments" :key="enrollment.id" class="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                <td class="p-4">
                  <div class="flex items-center gap-3">
                    <img v-if="enrollment.user?.avatar_url" :src="enrollment.user.avatar_url" class="w-10 h-10 rounded-full object-cover border-2 border-slate-100 dark:border-white/10" />
                    <div v-else class="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-400 font-bold">
                        {{ enrollment.user?.nome?.substring(0, 2).toUpperCase() || 'U' }}
                    </div>
                    <div>
                      <div class="font-bold text-slate-900 dark:text-white capitalize">{{ enrollment.user?.nome || 'Usuário' }}</div>
                      <div class="text-[10px] text-slate-500 font-mono">{{ enrollment.id.split('-')[0] }}</div>
                    </div>
                  </div>
                </td>
                <td class="p-4">
                  <div class="text-sm text-slate-600 dark:text-gray-400">
                    {{ new Date(enrollment.enrolled_at).toLocaleDateString() }}
                  </div>
                  <div class="text-[10px] text-slate-400">
                    {{ new Date(enrollment.enrolled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
                  </div>
                </td>
                <td class="p-4">
                   <div class="flex items-center gap-2">
                     <div class="flex-1 h-1.5 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden min-w-[60px]">
                        <div 
                          class="h-full bg-primary dark:bg-secondary rounded-full transition-all duration-500"
                          :style="{ width: `${enrollment.progress_percentage || 0}%` }"
                        ></div>
                      </div>
                      <span class="text-xs font-bold text-slate-700 dark:text-white">{{ Math.round(enrollment.progress_percentage || 0) }}%</span>
                   </div>
                </td>
                <td class="p-4">
                   <span 
                    class="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest"
                    :class="{
                      'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400': enrollment.payment_status === 'paid',
                      'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400': enrollment.payment_status === 'pending',
                      'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400': enrollment.payment_status === 'failed'
                    }"
                  >
                    {{ enrollment.payment_status === 'paid' ? 'Pago' : enrollment.payment_status === 'pending' ? 'Pendente' : 'Falhou' }}
                  </span>
                  <div v-if="enrollment.payment_amount" class="text-[10px] text-slate-400 mt-1">
                    {{ enrollment.payment_currency || 'USD' }} {{ enrollment.payment_amount }}
                  </div>
                </td>
                <td class="p-4">
                  <span 
                    class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ring-1 ring-inset"
                    :class="{
                      'bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-400/10 dark:text-green-400 dark:ring-green-400/20': enrollment.status === 'active',
                      'bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-400/10 dark:text-blue-400 dark:ring-blue-400/20': enrollment.status === 'completed',
                      'bg-yellow-50 text-yellow-700 ring-yellow-600/20 dark:bg-yellow-400/10 dark:text-yellow-400 dark:ring-yellow-400/20': enrollment.status === 'pending',
                      'bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-400/10 dark:text-red-400 dark:ring-red-400/20': enrollment.status === 'cancelled'
                    }"
                  >
                    {{ formatStatus(enrollment.status) }}
                  </span>
                </td>
                <td class="p-4 text-right">
                  <div class="flex items-center justify-end gap-1">
                     <button
                      @click="openStatusModal(enrollment)"
                      class="p-2 text-slate-400 hover:text-primary dark:hover:text-secondary rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
                      title="Alterar Status"
                    >
                      <span class="material-icons text-sm">settings</span>
                    </button>
                    <RouterLink
                      :to="`/admin/users/${enrollment.user_id}/history`"
                      class="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
                      title="Ver Histórico"
                    >
                      <span class="material-icons text-sm">history</span>
                    </RouterLink>
                  </div>
                </td>
              </tr>
              <tr v-if="filteredEnrollments.length === 0 && !loading">
                <td colspan="6" class="p-16 text-center text-slate-500 dark:text-gray-400">
                  <div class="flex flex-col items-center gap-2">
                    <span class="material-icons text-4xl opacity-20">group_off</span>
                    <p class="font-bold">Nenhuma matrícula encontrada.</p>
                    <p class="text-xs opacity-60">Tente ajustar seus filtros de busca.</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

       <!-- Status Update Modal -->
       <div v-if="selectedEnrollment" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div class="bg-white dark:bg-surface-dark w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden transform transition-all">
             <div class="p-6">
                <div class="flex items-center justify-between mb-6">
                   <h3 class="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Alterar Status</h3>
                   <button @click="selectedEnrollment = null" class="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                      <span class="material-icons">close</span>
                   </button>
                </div>
                
                <div class="flex items-center gap-4 mb-6 p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5">
                   <img v-if="selectedEnrollment.user?.avatar_url" :src="selectedEnrollment.user.avatar_url" class="w-12 h-12 rounded-full border-2 border-white dark:border-slate-800 shadow-sm" />
                   <div v-else class="w-12 h-12 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-400 font-bold">
                        {{ selectedEnrollment.user?.nome?.substring(0, 2).toUpperCase() || 'U' }}
                   </div>
                   <div>
                      <div class="font-bold text-slate-900 dark:text-white">{{ selectedEnrollment.user?.nome }}</div>
                      <div class="text-xs text-slate-500">Programa: {{ currentLocale === 'pt-BR' ? program?.title_pt : program?.title_en }}</div>
                   </div>
                </div>

                <div class="space-y-4">
                   <div>
                      <label class="block text-xs font-bold text-slate-500 dark:text-gray-400 uppercase mb-2">Novo Status</label>
                      <select v-model="newStatus" class="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-gray-700 bg-white dark:bg-surface-dark text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary transition-all">
                         <option value="pending">Pendente</option>
                         <option value="active">Ativo</option>
                         <option value="completed">Concluído</option>
                         <option value="cancelled">Cancelado</option>
                      </select>
                   </div>
                </div>

                <div class="mt-8 flex gap-3">
                   <button @click="selectedEnrollment = null" class="flex-1 px-4 py-3 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
                      Cancelar
                   </button>
                   <button @click="updateStatus" :disabled="updating" class="flex-1 px-4 py-3 bg-primary dark:bg-secondary text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
                      <span v-if="updating" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      {{ updating ? 'Salvando...' : 'Confirmar' }}
                   </button>
                </div>
             </div>
          </div>
       </div>

    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useLocale } from '@/composables/useLocale'
import AdminLayout from '@/components/layout/admin/AdminLayout.vue'
import { useProgramsStore } from '@/stores/programs'
import { toast } from 'vue-sonner'
import type { Program, ProgramEnrollment, EnrollmentStatus } from '@/types/programs'

const route = useRoute()
const { locale: currentLocale } = useLocale()
const programsStore = useProgramsStore()

const program = ref<Program | null>(null)
const enrollments = ref<ProgramEnrollment[]>([])
const loading = ref(true)
const updating = ref(false)

const search = ref('')
const filterStatus = ref('all')

const selectedEnrollment = ref<ProgramEnrollment | null>(null)
const newStatus = ref<EnrollmentStatus>('active')

const filteredEnrollments = computed(() => {
  return enrollments.value.filter(e => {
    const searchLower = search.value.toLowerCase()
    const matchesSearch = e.user?.nome?.toLowerCase().includes(searchLower) || false
    const matchesStatus = filterStatus.value === 'all' || e.status === filterStatus.value
    return matchesSearch && matchesStatus
  })
})

const activeCount = computed(() => enrollments.value.filter(e => e.status === 'active').length)
const completedCount = computed(() => enrollments.value.filter(e => e.status === 'completed').length)

const formatStatus = (status: string) => {
  const map: Record<string, string> = {
    active: 'Ativo',
    completed: 'Concluído',
    pending: 'Pendente',
    cancelled: 'Cancelado'
  }
  return map[status] || status
}

const openStatusModal = (enrollment: ProgramEnrollment) => {
  selectedEnrollment.value = enrollment
  newStatus.value = enrollment.status
}

const updateStatus = async () => {
  if (!selectedEnrollment.value) return
  
  updating.value = true
  try {
    await programsStore.updateEnrollmentStatus(selectedEnrollment.value.id, newStatus.value)
    toast.success('Status da matrícula atualizado com sucesso!')
    
    // Refresh list locally
    const idx = enrollments.value.findIndex(e => e.id === selectedEnrollment.value?.id)
    if (idx !== -1) {
      enrollments.value[idx].status = newStatus.value
    }
    
    selectedEnrollment.value = null
  } catch (error: any) {
    console.error('Error updating status:', error)
    toast.error('Ocorreu um erro ao atualizar o status: ' + (error.message || 'Erro desconhecido'))
  } finally {
    updating.value = false
  }
}

onMounted(async () => {
  loading.value = true
  const programId = route.params.id as string
  
  try {
    // Fetch program details
    const p = await programsStore.fetchProgramById(programId)
    if (p) program.value = p
    
    // Fetch enrollments
    const e = await programsStore.fetchProgramEnrollments(programId)
    enrollments.value = e
  } catch (error) {
    console.error('Error loading data:', error)
    toast.error('Erro ao carregar os dados das matrículas.')
  } finally {
    loading.value = false
  }
})
</script>
