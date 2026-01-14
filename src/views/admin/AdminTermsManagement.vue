<template>
  <AdminLayout>
    <div class="w-full flex flex-col gap-8">
      <!-- Header -->
      <div class="mb-6">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 class="text-slate-900 dark:text-white text-4xl lg:text-5xl font-black mb-3">
              <span class="bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-primary animate-gradient">
                Manage Terms of Use
              </span>
            </h1>
            <p class="text-slate-600 dark:text-white/60 text-lg">
              Create and manage the Platform's Terms of Use and Privacy Policies.
            </p>
          </div>
          <Button
            variant="primary"
            @click="showCreateModal = true"
            size="lg"
          >
            <span class="material-symbols-outlined mr-2">add</span>
            Create Term
          </Button>
        </div>
      </div>

      <!-- Terms List -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div
          v-for="term in terms"
          :key="term.id"
          class="bg-white dark:bg-surface-card rounded-xl border border-slate-200 dark:border-white/5 shadow-lg p-6 hover:border-primary/50 transition-all"
        >
          <div class="flex items-start justify-between mb-4">
            <div class="flex-1">
              <h3 class="text-xl font-black text-slate-900 dark:text-white mb-2">
                {{ term.title }}
              </h3>
              <div class="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                <span class="flex items-center gap-1">
                  <span class="material-symbols-outlined text-sm">category</span>
                  {{
                    term.term_type === 'terms_of_service'
                      ? 'Terms of Service'
                      : 'Privacy Policy'
                  }}
                </span>
                <span class="flex items-center gap-1">
                  <span class="material-symbols-outlined text-sm">tag</span>
                  Version {{ term.version }}
                </span>
                <span
                  v-if="term.is_active"
                  class="px-2 py-1 bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 rounded-full text-xs font-medium"
                >
                  Active
                </span>
              </div>
            </div>
          </div>

          <div class="mb-4">
            <p class="text-sm text-slate-600 dark:text-slate-400 mb-1">
              Created at:
            </p>
            <p class="text-xs text-slate-500 dark:text-slate-500">
              {{ formatDate(term.created_at) }}
            </p>
          </div>

          <div class="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              @click="editTerm(term)"
            >
              <span class="material-symbols-outlined text-sm mr-1">edit</span>
              Edit
            </Button>
            <Button
              v-if="!term.is_active"
              variant="primary"
              size="sm"
              @click="activateTerm(term.id)"
              :loading="activating === term.id"
            >
              <span class="material-symbols-outlined text-sm mr-1">check_circle</span>
              Activate
            </Button>
            <Button
              variant="outline"
              size="sm"
              @click="previewTerm(term)"
            >
              <span class="material-symbols-outlined text-sm mr-1">visibility</span>
              View
            </Button>
          </div>
        </div>
      </div>

      <!-- Create/Edit Modal -->
      <Modal
        v-model="showCreateModal"
        :title="editingTerm ? 'Edit Term' : 'Create Term'"
        :closable="true"
        size="4xl"
      >
        <div class="space-y-6 flex flex-col h-full min-h-0">
          <!-- First Row: Title, Term Type, Version -->
          <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
            <!-- Title Field - 7 columns -->
            <div class="md:col-span-7">
              <label class="block text-sm font-medium text-slate-700 dark:text-white mb-2">
                Title
              </label>
              <input
                v-model="termForm.title"
                type="text"
                class="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Enter term title"
              />
            </div>

            <!-- Term Type Field - 3 columns -->
            <div class="md:col-span-3">
              <label class="block text-sm font-medium text-slate-700 dark:text-white mb-2">
                Term Type
              </label>
              <select
                v-model="termForm.term_type"
                class="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="terms_of_service">Terms of Service</option>
                <option value="privacy_policy">Privacy Policy</option>
              </select>
            </div>

            <!-- Version Field - 2 columns -->
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-slate-700 dark:text-white mb-2">
                Version
              </label>
              <input
                v-model.number="termForm.version"
                type="number"
                min="1"
                class="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="1"
              />
            </div>
          </div>

          <!-- Content Field - Full Width -->
          <div class="flex-1 min-h-0 flex flex-col">
            <label class="block text-sm font-medium text-slate-700 dark:text-white mb-2 flex-shrink-0">
              Content
            </label>
            <div class="flex-1 min-h-0">
              <RichTextEditor
                v-model="termForm.content"
                placeholder="Enter term content..."
                max-height="100%"
              />
            </div>
          </div>
        </div>

        <template #footer>
          <div class="flex gap-3">
            <Button
              variant="outline"
              @click="cancelEdit"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              @click="saveTerm"
              :loading="saving"
            >
              Save
            </Button>
          </div>
        </template>
      </Modal>

      <!-- Preview Modal -->
      <Modal
        v-model="showPreviewModal"
        :title="previewTermData?.title || ''"
        :closable="true"
        size="xl"
      >
        <div
          v-if="previewTermData"
          class="prose prose-slate dark:prose-invert max-w-none"
          v-html="sanitizedPreviewContent"
        ></div>
      </Modal>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

import { supabase } from '@/lib/supabase'
import AdminLayout from '@/components/layout/admin/AdminLayout.vue'
import Button from '@/components/ui/Button.vue'
import Modal from '@/components/ui/Modal.vue'
import RichTextEditor from '@/components/ui/RichTextEditor.vue'
import DOMPurify from 'dompurify'
import { toast } from 'vue-sonner'
import { useI18n } from 'vue-i18n'
import type { ApplicationTerm } from '@/composables/useTermsAcceptance'

const { t } = useI18n()



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
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
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
/* Standard CSS replacement for @apply rules to fix linter errors */
.prose {
  color: #334155; /* text-slate-700 */
}
:deep(.dark) .prose {
  color: #cbd5e1; /* dark:text-slate-300 */
}

.prose h1,
.prose h2,
.prose h3,
.prose h4,
.prose h5,
.prose h6 {
  color: #0f172a; /* text-slate-900 */
  font-weight: 700; /* font-bold */
  margin-top: 1.5rem; /* mt-6 */
  margin-bottom: 1rem; /* mb-4 */
}

:deep(.dark) .prose h1,
:deep(.dark) .prose h2,
:deep(.dark) .prose h3,
:deep(.dark) .prose h4,
:deep(.dark) .prose h5,
:deep(.dark) .prose h6 {
  color: #ffffff; /* dark:text-white */
}

.prose p {
  margin-bottom: 1rem; /* mb-4 */
  line-height: 1.625; /* leading-relaxed */
}

.prose ul,
.prose ol {
  margin-bottom: 1rem; /* mb-4 */
  padding-left: 1.5rem; /* pl-6 */
}

.prose li {
  margin-bottom: 0.5rem; /* mb-2 */
}

.prose a {
  color: #f425f4; /* text-primary */
  text-decoration: underline;
}

.prose a:hover {
  color: #67e8f9; /* hover:text-cyan-300 */
}

@keyframes gradient {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

.animate-gradient {
  background-size: 200% 200%;
  animation: gradient 3s ease infinite;
}
</style>
