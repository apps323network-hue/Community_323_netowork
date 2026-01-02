<template>
  <AdminLayout>
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center gap-4">
        <RouterLink
          to="/admin/programas"
          class="flex items-center justify-center p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition"
        >
          <span class="material-icons">arrow_back</span>
        </RouterLink>
        <div>
          <h1 class="text-3xl font-bold text-slate-900 dark:text-white">
            {{ isEditMode ? t('programs.admin.editProgram') : t('programs.admin.createProgram') }}
          </h1>
          <p class="text-slate-600 dark:text-gray-400 mt-1" v-if="isEditMode && form.title_pt">
            Editando: {{ form.title_pt }}
          </p>
        </div>
      </div>

      <!-- Main Form Container -->
      <div class="bg-white dark:bg-surface-dark rounded-xl shadow-lg border border-slate-200 dark:border-white/5 overflow-hidden">
        
        <!-- Tabs Header -->
        <div class="flex border-b border-slate-200 dark:border-white/10 overflow-x-auto">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="currentTab = tab.id"
            class="px-6 py-4 font-medium text-sm whitespace-nowrap transition-colors relative"
            :class="[
              currentTab === tab.id
                ? 'text-primary dark:text-secondary'
                : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5'
            ]"
          >
            {{ tab.label }}
            <div 
              v-if="currentTab === tab.id" 
              class="absolute bottom-0 left-0 w-full h-0.5 bg-primary dark:bg-secondary"
            ></div>
          </button>
        </div>

        <form @submit.prevent="handleSubmit" class="p-6">
          
          <!-- TAB 1: Basic Info -->
          <div v-show="currentTab === 'basic'" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Titles -->
              <div class="space-y-4">
                <div class="bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-lg border border-blue-100 dark:border-blue-800/30">
                  <h3 class="font-bold text-blue-900 dark:text-blue-300 mb-4 flex items-center gap-2">
                    <span class="material-icons text-sm">language</span> Português (Principal)
                  </h3>
                  <div class="space-y-4">
                    <div>
                      <label class="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Título (PT) *</label>
                      <input v-model="form.title_pt" required type="text" class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-gray-700 bg-white dark:bg-surface-dark text-slate-900 dark:text-white" />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Curta Descrição (PT) *</label>
                      <textarea v-model="form.short_description_pt" required rows="2" class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-gray-700 bg-white dark:bg-surface-dark text-slate-900 dark:text-white"></textarea>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Descrição Completa (PT) *</label>
                      <textarea v-model="form.description_pt" required rows="6" class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-gray-700 bg-white dark:bg-surface-dark text-slate-900 dark:text-white"></textarea>
                    </div>
                  </div>
                </div>
              </div>

              <!-- English -->
              <div class="space-y-4">
                <div class="bg-indigo-50/50 dark:bg-indigo-900/10 p-4 rounded-lg border border-indigo-100 dark:border-indigo-800/30">
                  <h3 class="font-bold text-indigo-900 dark:text-indigo-300 mb-4 flex items-center gap-2">
                    <span class="material-icons text-sm">language</span> English (Translations)
                  </h3>
                  <div class="space-y-4">
                    <div>
                      <label class="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Title (EN) *</label>
                      <input v-model="form.title_en" required type="text" class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-gray-700 bg-white dark:bg-surface-dark text-slate-900 dark:text-white" />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Short Description (EN) *</label>
                      <textarea v-model="form.short_description_en" required rows="2" class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-gray-700 bg-white dark:bg-surface-dark text-slate-900 dark:text-white"></textarea>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Full Description (EN) *</label>
                      <textarea v-model="form.description_en" required rows="6" class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-gray-700 bg-white dark:bg-surface-dark text-slate-900 dark:text-white"></textarea>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Categorization -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Categoria *</label>
                <select v-model="form.category" class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-gray-700 bg-white dark:bg-surface-dark text-slate-900 dark:text-white">
                  <option value="curso">Curso</option>
                  <option value="mentoria">Mentoria</option>
                  <option value="workshop">Workshop</option>
                  <option value="evento_premium">Evento Premium</option>
                  <option value="servico_especializado">Serviço Especializado</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Dificuldade</label>
                <select v-model="form.difficulty_level" class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-gray-700 bg-white dark:bg-surface-dark text-slate-900 dark:text-white">
                  <option value="iniciante">Iniciante</option>
                  <option value="intermediario">Intermediário</option>
                  <option value="avancado">Avançado</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Instrutor</label>
                <input v-model="form.instructor_name" type="text" class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-gray-700 bg-white dark:bg-surface-dark text-slate-900 dark:text-white" placeholder="Nome do instrutor" />
              </div>
            </div>

            <!-- Media -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">URL da Thumbnail (Capa)</label>
                <input v-model="form.thumbnail_url" type="text" class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-gray-700 bg-white dark:bg-surface-dark text-slate-900 dark:text-white" placeholder="https://..." />
                <p class="text-xs text-slate-500 mt-1">Recomendado: 800x600px</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">URL do Banner</label>
                <input v-model="form.banner_url" type="text" class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-gray-700 bg-white dark:bg-surface-dark text-slate-900 dark:text-white" placeholder="https://..." />
                <p class="text-xs text-slate-500 mt-1">Recomendado: 1920x600px</p>
              </div>
            </div>
          </div>

          <!-- TAB 2: Settings -->
          <div v-show="currentTab === 'settings'" class="space-y-6">
            <!-- Price and Slots -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="p-4 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/5">
                <h3 class="font-bold text-slate-900 dark:text-white mb-4">Precificação e Vagas</h3>
                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Preço (USD) *</label>
                    <div class="relative">
                      <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                      <input v-model.number="form.price_usd" required type="number" step="0.01" class="w-full pl-8 pr-4 py-2 rounded-lg border border-slate-300 dark:border-gray-700 bg-white dark:bg-surface-dark text-slate-900 dark:text-white" />
                    </div>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Preço (BRL) - Opcional</label>
                    <div class="relative">
                      <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">R$</span>
                      <input v-model.number="form.price_brl" type="number" step="0.01" class="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 dark:border-gray-700 bg-white dark:bg-surface-dark text-slate-900 dark:text-white" />
                    </div>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Vagas Máximas</label>
                    <input v-model.number="form.max_students" type="number" class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-gray-700 bg-white dark:bg-surface-dark text-slate-900 dark:text-white" placeholder="Vazio para ilimitado" />
                  </div>
                   <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Carga Horária (horas)</label>
                    <input v-model.number="form.duration_hours" type="number" class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-gray-700 bg-white dark:bg-surface-dark text-slate-900 dark:text-white" />
                  </div>
                </div>
              </div>

               <div class="p-4 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/5">
                <h3 class="font-bold text-slate-900 dark:text-white mb-4">Datas e Publicação</h3>
                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Status</label>
                    <select v-model="form.status" class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-gray-700 bg-white dark:bg-surface-dark text-slate-900 dark:text-white">
                      <option value="draft">Rascunho (Oculto)</option>
                      <option value="published">Publicado (Visível)</option>
                      <option value="archived">Arquivado</option>
                    </select>
                  </div>
                  <div class="flex items-center gap-2 mt-6">
                    <input v-model="form.featured" type="checkbox" id="featured" class="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary" />
                    <label for="featured" class="text-slate-700 dark:text-gray-300 font-medium">Programa em Destaque (⭐)</label>
                  </div>
                   
                   <div class="border-t border-slate-200 dark:border-white/10 my-4 pt-4">
                     <p class="text-sm font-bold text-slate-900 dark:text-white mb-2">Período de Inscrição</p>
                     <div class="grid grid-cols-2 gap-2">
                        <div>
                          <label class="text-xs text-slate-500">Início</label>
                          <input v-model="form.enrollment_start_date" type="datetime-local" class="w-full text-sm px-2 py-1.5 rounded border border-slate-300 dark:border-gray-700 bg-white dark:bg-surface-dark" />
                        </div>
                         <div>
                          <label class="text-xs text-slate-500">Fim</label>
                          <input v-model="form.enrollment_end_date" type="datetime-local" class="w-full text-sm px-2 py-1.5 rounded border border-slate-300 dark:border-gray-700 bg-white dark:bg-surface-dark" />
                        </div>
                     </div>
                   </div>
                </div>
              </div>
            </div>
          </div>

          <!-- TAB 3: Content (Curriculum) -->
          <div v-show="currentTab === 'content'" class="space-y-6">
            <div class="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 p-4 rounded-lg flex items-center gap-3">
              <span class="material-icons text-yellow-600 dark:text-yellow-500">info</span>
              <span class="text-sm text-yellow-800 dark:text-yellow-200">A edição avançada de módulos e aulas estará disponível em breve. Por enquanto, a estrutura de currículo é gerenciada via JSON ou edição simplificada.</span>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                 <label class="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Pré-requisitos (PT)</label>
                 <textarea v-model="form.prerequisites_pt" rows="4" class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-gray-700 bg-white dark:bg-surface-dark text-slate-900 dark:text-white" placeholder="- Item 1&#10;- Item 2"></textarea>
               </div>
               <div>
                 <label class="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Prerequisites (EN)</label>
                 <textarea v-model="form.prerequisites_en" rows="4" class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-gray-700 bg-white dark:bg-surface-dark text-slate-900 dark:text-white" placeholder="- Item 1&#10;- Item 2"></textarea>
               </div>
            </div>
          </div>

          <!-- TAB 4: Integrations -->
          <div v-show="currentTab === 'integrations'" class="space-y-6">
            <div class="p-6 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/5">
              <div class="flex items-center gap-3 mb-6">
                <div class="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                  G
                </div>
                <div>
                  <h3 class="font-bold text-slate-900 dark:text-white">Google Classroom</h3>
                  <p class="text-sm text-slate-500">Integração para acesso automático ao conteúdo</p>
                </div>
              </div>

               <div class="space-y-4 max-w-lg">
                 <div class="flex items-center gap-2">
                    <input v-model="form.classroom_enabled" type="checkbox" id="classroom_enabled" class="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary" />
                    <label for="classroom_enabled" class="text-slate-700 dark:text-gray-300 font-medium">Habilitar Integração</label>
                  </div>

                  <div v-if="form.classroom_enabled" class="space-y-4 pl-7 border-l-2 border-slate-200 dark:border-white/10 ml-2.5">
                    <div>
                      <label class="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Link de Convite (Invite Link)</label>
                      <input v-model="form.classroom_invite_link" type="text" class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-gray-700 bg-white dark:bg-surface-dark text-slate-900 dark:text-white" placeholder="https://classroom.google.com/..." />
                      <p class="text-xs text-slate-500 mt-1">Este link será mostrado ao aluno após a matrícula.</p>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">ID do Curso (Opcional)</label>
                      <input v-model="form.classroom_course_id" type="text" class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-gray-700 bg-white dark:bg-surface-dark text-slate-900 dark:text-white" placeholder="Ex: 123456789" />
                    </div>

                    <!-- Botão de Teste -->
                    <div class="pt-4 mt-4 border-t border-slate-200 dark:border-white/10">
                      <div class="bg-blue-500/10 p-4 rounded-xl border border-blue-500/20">
                        <div class="flex items-center gap-2 mb-2">
                          <span class="material-icons text-blue-400 text-sm">science</span>
                          <h4 class="text-xs font-bold text-blue-400 uppercase tracking-wider">Modo de Teste Exclusivo</h4>
                        </div>
                        <p class="text-[11px] text-blue-300 mb-4">
                          Envie um convite agora mesmo para o seu e-mail para validar a integração, sem precisar pagar ou criar matrículas.
                        </p>
                        <button
                          type="button"
                          @click="handleTestInvite"
                          :disabled="testingInvite || !form.classroom_course_id || !form.classroom_enabled"
                          class="flex items-center justify-center gap-2 w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-sm font-bold transition shadow-lg shadow-blue-600/20"
                        >
                          <template v-if="testingInvite">
                            <span class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                            Enviando...
                          </template>
                          <template v-else>
                            <span class="material-icons text-sm">send</span>
                            Enviar Convite para: {{ authStore.user?.email }}
                          </template>
                        </button>
                      </div>
                    </div>
                  </div>
               </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="mt-8 flex justify-end gap-4 pt-6 border-t border-slate-200 dark:border-white/10">
            <button
              type="button"
              @click="$router.push('/admin/programas')"
              class="px-6 py-2.5 rounded-lg border border-slate-300 dark:border-white/10 text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-white/5 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="saving"
              class="px-8 py-2.5 bg-primary dark:bg-secondary text-white font-bold rounded-lg hover:opacity-90 transition shadow-lg flex items-center gap-2"
            >
              <span v-if="saving" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              {{ saving ? 'Salvando...' : (isEditMode ? 'Atualizar Programa' : 'Criar Programa') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLocale } from '@/composables/useLocale'
import AdminLayout from '@/components/layout/admin/AdminLayout.vue'
import { useProgramsStore } from '@/stores/programs'
import { useAuthStore } from '@/stores/auth'
import { useSupabase } from '@/composables/useSupabase'
import type { CreateProgramData } from '@/types/programs'
import { toast } from 'vue-sonner'

const route = useRoute()
const router = useRouter()
const { t } = useLocale()
const { supabase } = useSupabase()
const programsStore = useProgramsStore()
const authStore = useAuthStore()

const isEditMode = computed(() => !!route.params.id)
const saving = ref(false)
const testingInvite = ref(false)
const currentTab = ref('basic')

const tabs = [
  { id: 'basic', label: 'Informações Básicas' },
  { id: 'settings', label: 'Configurações e Preço' },
  { id: 'content', label: 'Currículo e Conteúdo' },
  { id: 'integrations', label: 'Integrações' },
]

// Initialize with default values for Create mode
const form = ref<CreateProgramData>({
  title_pt: '',
  title_en: '',
  description_pt: '',
  description_en: '',
  short_description_pt: '',
  short_description_en: '',
  category: 'curso',
  price_usd: 0,
  price_brl: undefined,
  max_students: undefined,
  status: 'draft',
  featured: false,
  classroom_enabled: false,
  difficulty_level: 'iniciante',
  duration_hours: undefined,
  classroom_course_id: '',
  classroom_invite_link: '',
  thumbnail_url: '',
  banner_url: '',
  instructor_name: '',
  prerequisites_pt: '',
  prerequisites_en: '',
  enrollment_start_date: '',
  enrollment_end_date: ''
})

onMounted(async () => {
  if (isEditMode.value) {
    // If edit mode, load program data
    const programId = route.params.id as string
    const program = await programsStore.fetchProgramById(programId)
    if (program) {
      // Map program data to form
      form.value = { ...program }
    } else {
      // Handle not found
      router.push('/admin/programas')
    }
  }
})

const handleSubmit = async () => {
  try {
    saving.value = true
    
    if (isEditMode.value) {
      await programsStore.updateProgram({
        id: route.params.id as string,
        ...form.value
      })
    } else {
      await programsStore.createProgram(form.value)
    }

    router.push('/admin/programas')
  } catch (error) {
    console.error('Error saving program:', error)
    alert('Erro ao salvar o programa. Verifique o console para mais detalhes.')
  } finally {
    saving.value = false
  }
}

const handleTestInvite = async () => {
  if (!form.value.classroom_course_id || !authStore.user?.email) return

  try {
    testingInvite.value = true
    const { data, error } = await supabase.functions.invoke('classroom_invite', {
      body: {
        courseId: form.value.classroom_course_id,
        studentEmail: authStore.user.email
      }
    })

    if (error) throw error
    toast.success(`Convite enviado com sucesso para ${authStore.user.email}! Verifique seu e-mail.`)
  } catch (err: any) {
    console.error('Test invite error:', err)
    toast.error('Erro ao enviar convite: ' + (err.message || 'Erro desconhecido'))
  } finally {
    testingInvite.value = false
  }
}
</script>
