<template>
  <AdminLayout>
    <div class="relative min-h-screen">
      <!-- Decorative Background Elements -->
      <div class="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div class="absolute top-1/2 -left-24 w-72 h-72 bg-secondary/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div class="relative z-10 w-full flex flex-col gap-10">
        <!-- Header Section -->
        <header class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div class="space-y-2">
            <h1 class="text-4xl md:text-6xl font-black tracking-tighter uppercase">
              <span class="text-slate-900 dark:text-white">Gerenciar</span>
              <span class="block text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-primary animate-gradient-x">Termos de Uso</span>
            </h1>
            <p class="text-slate-500 dark:text-slate-400 text-lg font-medium max-w-2xl">
              Central de controle para documentos legais e políticas de privacidade da plataforma.
            </p>
          </div>
          
          <Button
            variant="primary"
            @click="showCreateModal = true"
            class="group relative h-16 px-8 rounded-2xl font-black text-black overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-primary/20"
          >
            <div class="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_auto] animate-gradient-x"></div>
            <span class="relative flex items-center gap-2 uppercase tracking-widest text-sm">
              <span class="material-symbols-outlined font-bold">add_circle</span>
              Novo Documento
            </span>
          </Button>
        </header>

        <!-- Terms List (Scalable List Layout) -->
        <div v-if="loading" class="flex flex-col gap-4">
          <div v-for="i in 5" :key="i" class="h-24 rounded-3xl bg-slate-100 dark:bg-white/5 animate-pulse border border-slate-200 dark:border-white/10"></div>
        </div>

        <div v-else class="flex flex-col gap-4">
          <div
            v-for="term in terms"
            :key="term.id"
            class="group relative p-0.5 rounded-[2rem] bg-gradient-to-r from-slate-200 to-transparent dark:from-white/10 dark:to-transparent hover:from-primary/40 transition-all duration-500"
          >
            <div class="bg-white dark:bg-slate-900/80 backdrop-blur-xl rounded-[1.9rem] p-5 md:p-6 border border-slate-200 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
              <!-- Info Section -->
              <div class="flex flex-1 items-center gap-6 w-full">
                <div class="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                  <span class="material-symbols-outlined text-primary text-3xl">
                    {{ term.term_type === 'terms_of_service' ? 'gavel' : 'privacy_tip' }}
                  </span>
                </div>
                
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-3 mb-1">
                    <h3 class="text-xl font-black text-slate-900 dark:text-white truncate group-hover:text-primary transition-colors">
                      {{ term.title }}
                    </h3>
                    <div 
                      v-if="term.is_active"
                      class="px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-500 text-[9px] font-black uppercase tracking-tighter flex items-center gap-1.5 shrink-0"
                    >
                      <span class="w-1 h-1 rounded-full bg-green-500 animate-pulse"></span>
                      Ativo
                    </div>
                  </div>
                  
                  <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-widest">
                    <span class="flex items-center gap-1.5">
                      <span class="material-symbols-outlined text-sm">category</span>
                      {{ term.term_type === 'terms_of_service' ? 'Terms of Service' : 'Privacy Policy' }}
                    </span>
                    <span class="flex items-center gap-1.5">
                      <span class="material-symbols-outlined text-sm">tag</span>
                      VERSÃO {{ term.version }}
                    </span>
                    <span class="flex items-center gap-1.5">
                      <span class="material-symbols-outlined text-sm">history</span>
                      {{ formatDate(term.created_at) }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Actions Section -->
              <div class="flex items-center gap-3 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-white/5">
                <button
                  @click="editTerm(term)"
                  class="h-12 px-5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white text-xs font-bold uppercase tracking-wider hover:bg-primary/10 hover:border-primary/30 transition-all flex items-center gap-2"
                >
                  <span class="material-symbols-outlined text-sm">edit</span>
                  Editar
                </button>
                
                <button
                  v-if="!term.is_active"
                  @click="activateTerm(term.id)"
                  :disabled="activating === term.id"
                  class="h-12 px-5 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 text-xs font-bold uppercase tracking-wider hover:bg-green-500 hover:text-white transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  <span class="material-symbols-outlined text-sm">{{ activating === term.id ? 'sync' : 'check_circle' }}</span>
                  <span class="hidden sm:inline">Ativar</span>
                </button>

                <button
                  @click="viewAcceptanceHistory(term.id)"
                  class="h-12 w-12 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-400 hover:text-secondary transition-all flex items-center justify-center group/btn shrink-0"
                  title="Histórico de Aceites"
                >
                  <span class="material-symbols-outlined group-hover/btn:scale-110 transition-transform">history_edu</span>
                </button>

                <button
                  @click="previewTerm(term)"
                  class="h-12 w-12 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-400 hover:text-primary transition-all flex items-center justify-center group/btn shrink-0"
                  title="Visualizar"
                >
                  <span class="material-symbols-outlined group-hover/btn:scale-110 transition-transform">visibility</span>
                </button>

                <router-link
                  :to="{ path: '/admin/termos-aceitos', query: { term_id: term.id } }"
                  class="h-12 w-12 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-400 hover:text-secondary transition-all flex items-center justify-center group/btn shrink-0"
                  title="Histórico de Aceites"
                >
                  <span class="material-symbols-outlined group-hover/btn:scale-110 transition-transform">history</span>
                </router-link>
              </div>
            </div>
          </div>
        </div>

        <!-- Create/Edit Modal Restyled -->
        <Modal
          v-model="showCreateModal"
          size="4xl"
        >
          <template #header>
            <div class="flex flex-col gap-1">
              <h2 class="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                {{ editingTerm ? 'Editar' : 'Criar Novo' }} <span class="text-primary font-black">Documento</span>
              </h2>
              <p class="text-sm text-slate-500 dark:text-slate-400">Configure os detalhes e o conteúdo legal.</p>
            </div>
          </template>

          <div class="space-y-8 py-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Title Field -->
              <div class="space-y-2">
                <label class="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest pl-1">Título do Documento</label>
                <div class="relative group">
                  <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span class="material-symbols-outlined text-slate-400 group-focus-within:text-primary transition-colors">title</span>
                  </div>
                  <input
                    v-model="termForm.title"
                    type="text"
                    class="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                    placeholder="Ex: Termos de Uso - Gold"
                  />
                </div>
              </div>

              <!-- Term Type Field -->
              <div class="space-y-2">
                <label class="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest pl-1">Tipo de Documento</label>
                <div class="relative group">
                  <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span class="material-symbols-outlined text-slate-400 group-focus-within:text-primary transition-colors">category</span>
                  </div>
                  <select
                    v-model="termForm.term_type"
                    class="w-full pl-12 pr-10 py-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all appearance-none uppercase text-xs font-bold tracking-widest"
                  >
                    <option value="terms_of_service">Terms of Service</option>
                    <option value="privacy_policy">Privacy Policy</option>
                  </select>
                  <div class="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <span class="material-symbols-outlined text-slate-400">expand_more</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Version Info Warning -->
            <div v-if="editingTerm" class="flex items-center gap-4 p-5 rounded-2xl bg-primary/5 border border-primary/20">
              <span class="material-symbols-outlined text-primary text-3xl">info</span>
              <div>
                <p class="text-sm font-bold text-slate-900 dark:text-white">Atenção: Editando a Versão {{ termForm.version }}</p>
                <p class="text-xs text-slate-500 dark:text-slate-400">Alterações no conteúdo serão salvas diretamente neste documento ativo. Para uma nova versão, crie um novo documento.</p>
              </div>
            </div>

            <!-- Advanced Legal Editor Area -->
            <div class="space-y-4">
              <label class="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest pl-1">Conteúdo Legal Avançado</label>
              <AdvancedLegalEditor
                v-model="termForm.content"
                placeholder="Redija aqui o documento legal completo (suporta tabelas, alinhamento e código fonte)..."
              />
            </div>
          </div>

          <template #footer>
            <div class="flex items-center justify-end gap-4 w-full">
              <button
                @click="cancelEdit"
                class="px-8 py-4 rounded-2xl border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-xs hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
              >
                Cancelar
              </button>
              <button
                @click="saveTerm"
                :disabled="saving"
                class="group relative h-14 px-10 rounded-2xl font-black text-black overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-xl shadow-primary/20 disabled:opacity-50"
              >
                <div class="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_auto] animate-gradient-x"></div>
                <span class="relative flex items-center gap-2 uppercase tracking-widest text-xs">
                  <span class="material-symbols-outlined text-sm font-bold">{{ saving ? 'sync' : 'save_as' }}</span>
                  {{ editingTerm ? 'Salvar Alterações' : 'Publicar Documento' }}
                </span>
              </button>
            </div>
          </template>
        </Modal>

        <!-- Preview Modal Restyled -->
        <Modal
          v-model="showPreviewModal"
          :title="previewTermData?.title || ''"
          size="xl"
        >
          <div class="p-4">
            <div
              v-if="previewTermData"
              class="prose prose-slate dark:prose-invert max-w-none custom-preview"
              v-html="sanitizedPreviewContent"
            ></div>
          </div>
        </Modal>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import { supabase } from '@/lib/supabase'
import AdminLayout from '@/components/layout/admin/AdminLayout.vue'
import Button from '@/components/ui/Button.vue'
import Modal from '@/components/ui/Modal.vue'
import AdvancedLegalEditor from '@/components/ui/AdvancedLegalEditor.vue'
import DOMPurify from 'dompurify'
import { toast } from 'vue-sonner'
import { useI18n } from 'vue-i18n'
import type { ApplicationTerm } from '@/composables/useTermsAcceptance'

const { t } = useI18n()
const router = useRouter()



const terms = ref<ApplicationTerm[]>([])
const loading = ref(false)
const saving = ref(false)
const activating = ref<string | null>(null)
const showCreateModal = ref(false)
const showPreviewModal = ref(false)
const editingTerm = ref<ApplicationTerm | null>(null)
const previewTermData = ref<ApplicationTerm | null>(null)

const termForm = ref({
  title: '',
  content: '',
  term_type: 'terms_of_service' as 'terms_of_service' | 'privacy_policy',
  version: 1,
  is_active: false,
})

const sanitizedPreviewContent = computed(() => {
  if (!previewTermData.value?.content) return ''
  return DOMPurify.sanitize(previewTermData.value.content, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'blockquote', 'hr'],
    ALLOWED_ATTR: ['href', 'target', 'rel']
  })
})

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function viewAcceptanceHistory(termId: string) {
  router.push({
    path: '/admin/termos-aceitos',
    query: { term_id: termId }
  })
}

async function fetchTerms() {
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('application_terms')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    terms.value = data || []
  } catch (err: any) {
    console.error('Error fetching terms:', err)
    toast.error(err.message || 'Error fetching terms')
  } finally {
    loading.value = false
  }
}

function editTerm(term: ApplicationTerm) {
  editingTerm.value = term
  termForm.value = {
    title: term.title,
    content: term.content,
    term_type: term.term_type,
    version: term.version,
    is_active: term.is_active,
  }
  showCreateModal.value = true
}

function cancelEdit() {
  editingTerm.value = null
  showCreateModal.value = false
  termForm.value = {
    title: '',
    content: '',
    term_type: 'terms_of_service',
    version: 1,
    is_active: false,
  }
}

async function saveTerm() {
  if (!termForm.value.title || !termForm.value.content) {
    toast.error('Please fill in all required fields')
    return
  }

  saving.value = true
  try {
    if (editingTerm.value) {
      // Atualizar termo existente
      const { error } = await supabase
        .from('application_terms')
        .update({
          title: termForm.value.title,
          content: termForm.value.content,
          version: termForm.value.version,
        })
        .eq('id', editingTerm.value.id)

      if (error) throw error
      toast.success('Term updated successfully')
    } else {
      // Criar novo termo
      // Buscar última versão do mesmo tipo
      const { data: lastTerm } = await supabase
        .from('application_terms')
        .select('version')
        .eq('term_type', termForm.value.term_type)
        .order('version', { ascending: false })
        .limit(1)
        .single()

      const newVersion = lastTerm ? lastTerm.version + 1 : 1

      const { error } = await supabase
        .from('application_terms')
        .insert({
          title: termForm.value.title,
          content: termForm.value.content,
          term_type: termForm.value.term_type,
          version: newVersion,
          is_active: false, // Novos termos começam inativos
        })

      if (error) throw error
      toast.success('Term created successfully')
    }

    cancelEdit()
    await fetchTerms()
  } catch (err: any) {
    console.error('Error saving term:', err)
    toast.error(err.message || 'Error saving term')
  } finally {
    saving.value = false
  }
}

async function activateTerm(termId: string) {
  activating.value = termId
  try {
    const term = terms.value.find((t) => t.id === termId)
    if (!term) throw new Error('Term not found')

    // Desativar todos os termos do mesmo tipo
    const { error: deactivateError } = await supabase
      .from('application_terms')
      .update({ is_active: false })
      .eq('term_type', term.term_type)
      .eq('is_active', true)

    if (deactivateError) throw deactivateError

    // Ativar o termo selecionado
    const { error: activateError } = await supabase
      .from('application_terms')
      .update({ is_active: true })
      .eq('id', termId)

    if (activateError) throw activateError

    toast.success('Term activated successfully')
    await fetchTerms()
  } catch (err: any) {
    console.error('Error activating term:', err)
    toast.error(err.message || 'Error activating term')
  } finally {
    activating.value = null
  }
}

function previewTerm(term: ApplicationTerm) {
  previewTermData.value = term
  showPreviewModal.value = true
}

onMounted(() => {
  fetchTerms()
})
</script>

<style scoped>
@keyframes gradient-x {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.animate-gradient-x {
  background-size: 200% auto;
  animation: gradient-x 3s linear infinite;
}

/* Standard CSS replacement for @apply rules to fix linter errors */
.prose {
  color: #334155; /* text-slate-700 */
  font-size: 1.1rem;
  line-height: 1.8;
}

.dark :deep(.prose) {
  color: #cbd5e1; /* text-slate-300 */
}

.custom-preview :deep(h1), 
.custom-preview :deep(h2), 
.custom-preview :deep(h3), 
.custom-preview :deep(h4) {
  font-weight: 900; /* font-black */
  color: #0f172a; /* text-slate-900 */
  margin-top: 2.5rem; /* mt-10 */
  margin-bottom: 1.5rem; /* mb-6 */
  letter-spacing: -0.025em; /* tracking-tight */
  text-transform: uppercase;
}

.dark :deep(.custom-preview h1),
.dark :deep(.custom-preview h2),
.dark :deep(.custom-preview h3),
.dark :deep(.custom-preview h4) {
  color: #ffffff;
}

.custom-preview :deep(h1) { font-size: 2.25rem; } /* text-4xl */
.custom-preview :deep(h2) { 
  font-size: 1.5rem; /* text-2xl */
  border-bottom: 2px solid rgba(var(--primary-rgb), 0.2); 
  padding-bottom: 1rem; 
}
.custom-preview :deep(h3) { font-size: 1.25rem; } /* text-xl */

.custom-preview :deep(p) {
  margin-bottom: 1.5rem;
  line-height: 1.625;
}

.custom-preview :deep(blockquote) {
  border-left: 4px solid rgb(var(--primary-rgb));
  background-color: rgba(var(--primary-rgb), 0.05);
  padding: 1.5rem;
  font-style: italic;
  margin: 2rem 0;
  border-radius: 1rem;
  color: #475569; /* text-slate-600 */
}

.dark :deep(.custom-preview blockquote) {
  color: #94a3b8; /* text-slate-400 */
}

.custom-preview :deep(hr) {
  margin-top: 3rem;
  margin-bottom: 3rem;
  border: 0;
  border-top: 1px solid #e2e8f0;
}

.dark :deep(.custom-preview hr) {
  border-top-color: rgba(255, 255, 255, 0.1);
}

.custom-preview :deep(strong) {
  font-weight: 900;
  color: #0f172a;
  text-transform: uppercase;
  letter-spacing: -0.025em;
}

.dark :deep(.custom-preview strong) {
  color: #ffffff;
}

@keyframes gradient {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.animate-gradient {
  background-size: 200% 200%;
  animation: gradient 3s ease infinite;
}
</style>
