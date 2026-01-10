<template>
  <AdminLayout>
    <div class="w-full flex flex-col gap-8">
      <!-- Header -->
      <div class="mb-6">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 class="text-slate-900 dark:text-white text-4xl lg:text-5xl font-black mb-3">
              <span class="bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-primary animate-gradient">
                {{ t('adminTermsManagement.title') }}
              </span>
            </h1>
            <p class="text-slate-600 dark:text-white/60 text-lg">
              {{ t('adminTermsManagement.description') }}
            </p>
          </div>
          <Button
            variant="primary"
            @click="showCreateModal = true"
            size="lg"
          >
            <span class="material-symbols-outlined mr-2">add</span>
            {{ t('adminTermsManagement.createTerm') }}
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
                      ? t('adminTermsManagement.termsOfService')
                      : t('adminTermsManagement.privacyPolicy')
                  }}
                </span>
                <span class="flex items-center gap-1">
                  <span class="material-symbols-outlined text-sm">tag</span>
                  {{ t('adminTermsManagement.version') }} {{ term.version }}
                </span>
                <span
                  v-if="term.is_active"
                  class="px-2 py-1 bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 rounded-full text-xs font-medium"
                >
                  {{ t('adminTermsManagement.active') }}
                </span>
              </div>
            </div>
          </div>

          <div class="mb-4">
            <p class="text-sm text-slate-600 dark:text-slate-400 mb-1">
              {{ t('adminTermsManagement.createdAt') }}:
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
              {{ t('common.edit') }}
            </Button>
            <Button
              v-if="!term.is_active"
              variant="primary"
              size="sm"
              @click="activateTerm(term.id)"
              :loading="activating === term.id"
            >
              <span class="material-symbols-outlined text-sm mr-1">check_circle</span>
              {{ t('adminTermsManagement.activate') }}
            </Button>
            <Button
              variant="outline"
              size="sm"
              @click="previewTerm(term)"
            >
              <span class="material-symbols-outlined text-sm mr-1">visibility</span>
              {{ t('common.view') }}
            </Button>
          </div>
        </div>
      </div>

      <!-- Create/Edit Modal -->
      <Modal
        v-model="showCreateModal"
        :title="editingTerm ? t('adminTermsManagement.editTerm') : t('adminTermsManagement.createTerm')"
        :closable="true"
        size="xl"
      >
        <div class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-white mb-2">
              {{ t('adminTermsManagement.termType') }}
            </label>
            <select
              v-model="termForm.term_type"
              class="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary"
              :disabled="editingTerm !== null"
            >
              <option value="terms_of_service">{{ t('adminTermsManagement.termsOfService') }}</option>
              <option value="privacy_policy">{{ t('adminTermsManagement.privacyPolicy') }}</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-white mb-2">
              {{ t('adminTermsManagement.title') }}
            </label>
            <input
              v-model="termForm.title"
              type="text"
              class="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary"
              :placeholder="t('adminTermsManagement.titlePlaceholder')"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-white mb-2">
              {{ t('adminTermsManagement.content') }}
            </label>
            <RichTextEditor
              v-model="termForm.content"
              :placeholder="t('adminTermsManagement.contentPlaceholder')"
            />
          </div>

          <div v-if="editingTerm">
            <label class="block text-sm font-medium text-slate-700 dark:text-white mb-2">
              {{ t('adminTermsManagement.version') }}
            </label>
            <input
              v-model.number="termForm.version"
              type="number"
              min="1"
              class="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        <template #footer>
          <div class="flex gap-3">
            <Button
              variant="outline"
              @click="cancelEdit"
            >
              {{ t('common.cancel') }}
            </Button>
            <Button
              variant="primary"
              @click="saveTerm"
              :loading="saving"
            >
              {{ t('common.save') }}
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
import { useI18n } from 'vue-i18n'
import { supabase } from '@/lib/supabase'
import AdminLayout from '@/components/layout/admin/AdminLayout.vue'
import Button from '@/components/ui/Button.vue'
import Modal from '@/components/ui/Modal.vue'
import RichTextEditor from '@/components/ui/RichTextEditor.vue'
import DOMPurify from 'dompurify'
import { toast } from 'vue-sonner'
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
  return date.toLocaleString('pt-BR', {
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
    console.error('Erro ao buscar termos:', err)
    toast.error(err.message || 'Erro ao buscar termos')
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
    toast.error(t('adminTermsManagement.fillAllFields'))
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
      toast.success(t('adminTermsManagement.termUpdated'))
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
      toast.success(t('adminTermsManagement.termCreated'))
    }

    cancelEdit()
    await fetchTerms()
  } catch (err: any) {
    console.error('Erro ao salvar termo:', err)
    toast.error(err.message || 'Erro ao salvar termo')
  } finally {
    saving.value = false
  }
}

async function activateTerm(termId: string) {
  activating.value = termId
  try {
    const term = terms.value.find((t) => t.id === termId)
    if (!term) throw new Error('Termo não encontrado')

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

    toast.success(t('adminTermsManagement.termActivated'))
    await fetchTerms()
  } catch (err: any) {
    console.error('Erro ao ativar termo:', err)
    toast.error(err.message || 'Erro ao ativar termo')
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
.prose {
  @apply text-slate-700 dark:text-slate-300;
}

.prose h1,
.prose h2,
.prose h3,
.prose h4,
.prose h5,
.prose h6 {
  @apply text-slate-900 dark:text-white font-bold mt-6 mb-4;
}

.prose p {
  @apply mb-4 leading-relaxed;
}

.prose ul,
.prose ol {
  @apply mb-4 pl-6;
}

.prose li {
  @apply mb-2;
}

.prose a {
  @apply text-primary hover:text-cyan-300 underline;
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
