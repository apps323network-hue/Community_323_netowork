<template>
  <div class="space-y-6">
    <!-- Header com botão Adicionar -->
    <div class="flex justify-between items-center">
      <div>
        <h2 class="text-slate-900 dark:text-white text-2xl font-bold mb-1">Palavras Proibidas</h2>
        <p class="text-slate-600 dark:text-white/60 text-sm">Gerencie palavras e frases proibidas para moderação automática</p>
      </div>
      <button
        @click="showFormModal = true; editingWord = null"
        class="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-secondary text-black font-bold rounded-lg hover:shadow-lg hover:shadow-primary/30 transition-all"
      >
        <span class="material-symbols-outlined">add</span>
        <span class="hidden sm:inline">Adicionar Palavra</span>
      </button>
    </div>

    <!-- Filtros e Busca -->
    <div class="flex flex-col sm:flex-row gap-4">
      <div class="flex-1">
        <div class="relative">
          <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/40 text-xl">search</span>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar palavra..."
            class="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/40 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
          />
        </div>
      </div>
      <div class="flex gap-2">
        <select
          v-model="filterCategory"
          class="px-4 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark text-slate-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
        >
          <option value="">Todas as categorias</option>
          <option value="spam">Spam</option>
          <option value="ofensivo">Ofensivo</option>
          <option value="outro">Outro</option>
        </select>
        <select
          v-model="filterAction"
          class="px-4 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark text-slate-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
        >
          <option value="">Todas as ações</option>
          <option value="block">Bloquear</option>
          <option value="warn">Avisar</option>
          <option value="replace">Substituir</option>
        </select>
      </div>
    </div>

    <!-- Lista de Palavras -->
    <div v-if="loading && filteredWords.length === 0" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>

    <div v-else-if="filteredWords.length === 0" class="flex flex-col items-center justify-center py-12 bg-slate-50 dark:bg-surface-dark/50 rounded-xl border border-slate-200 dark:border-white/10">
      <span class="material-symbols-outlined text-slate-400 dark:text-gray-500 text-6xl mb-4">block</span>
      <p class="text-slate-600 dark:text-gray-400 font-medium">
        {{ searchQuery || filterCategory || filterAction ? 'Nenhuma palavra encontrada' : 'Nenhuma palavra proibida cadastrada' }}
      </p>
    </div>

    <div v-else class="grid grid-cols-1 gap-4">
      <div
        v-for="word in filteredWords"
        :key="word.id"
        class="bg-white dark:bg-surface-dark rounded-xl p-6 border border-slate-200 dark:border-white/10 hover:border-primary/50 transition-all"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-3">
              <h3 class="text-slate-900 dark:text-white font-bold text-lg">{{ word.word }}</h3>
              <span
                class="px-2 py-1 rounded-full text-xs font-bold"
                :class="getCategoryClass(word.category)"
              >
                {{ getCategoryLabel(word.category) }}
              </span>
              <span
                class="px-2 py-1 rounded-full text-xs font-bold"
                :class="getActionClass(word.action)"
              >
                {{ getActionLabel(word.action) }}
              </span>
            </div>
            <p class="text-slate-500 dark:text-white/40 text-xs">
              Criado em {{ formatDate(word.created_at) }}
            </p>
          </div>
          <div class="flex gap-2">
            <button
              @click="editWord(word)"
              class="p-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 rounded-lg text-slate-700 dark:text-white transition-all"
              title="Editar"
            >
              <span class="material-symbols-outlined text-lg">edit</span>
            </button>
            <button
              @click="confirmDelete(word)"
              class="p-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg text-red-600 dark:text-red-400 transition-all"
              title="Deletar"
            >
              <span class="material-symbols-outlined text-lg">delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Formulário -->
    <Modal
      v-model="showFormModal"
      :title="editingWord ? 'Editar Palavra Proibida' : 'Adicionar Palavra Proibida'"
      size="md"
    >
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-slate-900 dark:text-white mb-2">Palavra ou Frase *</label>
          <input
            v-model="formData.word"
            type="text"
            required
            class="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark p-3 text-slate-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            placeholder="Ex: palavra proibida ou frase completa"
          />
          <p class="text-slate-500 dark:text-white/40 text-xs mt-1">A verificação é case-insensitive</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-900 dark:text-white mb-2">Categoria *</label>
          <select
            v-model="formData.category"
            required
            class="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark p-3 text-slate-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
          >
            <option value="">Selecione...</option>
            <option value="spam">Spam</option>
            <option value="ofensivo">Ofensivo</option>
            <option value="outro">Outro</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-900 dark:text-white mb-2">Ação *</label>
          <select
            v-model="formData.action"
            required
            class="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark p-3 text-slate-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
          >
            <option value="">Selecione...</option>
            <option value="block">Bloquear - Não permite criar o conteúdo</option>
            <option value="warn">Avisar - Cria como pending para revisão</option>
            <option value="replace">Substituir - Substitui por asteriscos automaticamente</option>
          </select>
        </div>

        <div class="flex gap-3 pt-4">
          <button
            type="submit"
            :disabled="submitting"
            class="flex-1 px-4 py-2 bg-gradient-to-r from-primary to-secondary text-black font-bold rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
          >
            {{ submitting ? 'Salvando...' : (editingWord ? 'Salvar Alterações' : 'Adicionar Palavra') }}
          </button>
          <button
            type="button"
            @click="showFormModal = false"
            class="px-4 py-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 rounded-lg text-slate-700 dark:text-white font-medium transition-all"
          >
            Cancelar
          </button>
        </div>
      </form>
    </Modal>

    <!-- Modal de Confirmação de Delete -->
    <Modal
      v-model="showDeleteModal"
      title="Confirmar Exclusão"
      size="sm"
    >
      <div class="space-y-4">
        <p class="text-slate-700 dark:text-white/80">
          Tem certeza que deseja remover a palavra <strong class="text-slate-900 dark:text-white">"{{ wordToDelete?.word }}"</strong>?
        </p>
        <p class="text-slate-600 dark:text-white/60 text-sm">
          Esta ação não pode ser desfeita.
        </p>
        <div class="flex gap-3 pt-4">
          <button
            @click="handleDelete"
            :disabled="submitting"
            class="flex-1 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-600 dark:text-red-400 font-medium transition-all disabled:opacity-50"
          >
            {{ submitting ? 'Deletando...' : 'Deletar' }}
          </button>
          <button
            @click="showDeleteModal = false"
            class="px-4 py-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 rounded-lg text-slate-700 dark:text-white font-medium transition-all"
          >
            Cancelar
          </button>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAdminStore } from '@/stores/admin'
import Modal from '@/components/ui/Modal.vue'
import { toast } from 'vue-sonner'
import type { BannedWord } from '@/types/admin'

const adminStore = useAdminStore()

const loading = computed(() => adminStore.loading)
const bannedWords = computed(() => adminStore.bannedWords)

const searchQuery = ref('')
const filterCategory = ref('')
const filterAction = ref('')
const showFormModal = ref(false)
const showDeleteModal = ref(false)
const editingWord = ref<BannedWord | null>(null)
const wordToDelete = ref<BannedWord | null>(null)
const submitting = ref(false)

const formData = ref({
  word: '',
  category: '' as 'spam' | 'ofensivo' | 'outro' | '',
  action: '' as 'block' | 'warn' | 'replace' | '',
})

const filteredWords = computed(() => {
  let words = bannedWords.value

  // Filtrar por busca
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    words = words.filter(w => w.word.toLowerCase().includes(query))
  }

  // Filtrar por categoria
  if (filterCategory.value) {
    words = words.filter(w => w.category === filterCategory.value)
  }

  // Filtrar por ação
  if (filterAction.value) {
    words = words.filter(w => w.action === filterAction.value)
  }

  return words
})

function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    spam: 'Spam',
    ofensivo: 'Ofensivo',
    outro: 'Outro',
  }
  return labels[category] || category
}

function getCategoryClass(category: string): string {
  const classes: Record<string, string> = {
    spam: 'bg-purple-500/20 text-purple-400',
    ofensivo: 'bg-red-500/20 text-red-400',
    outro: 'bg-gray-500/20 text-gray-400',
  }
  return classes[category] || 'bg-gray-500/20 text-gray-400'
}

function getActionLabel(action: string): string {
  const labels: Record<string, string> = {
    block: 'Bloquear',
    warn: 'Avisar',
    replace: 'Substituir',
  }
  return labels[action] || action
}

function getActionClass(action: string): string {
  const classes: Record<string, string> = {
    block: 'bg-red-500/20 text-red-400',
    warn: 'bg-yellow-500/20 text-yellow-400',
    replace: 'bg-blue-500/20 text-blue-400',
  }
  return classes[action] || 'bg-gray-500/20 text-gray-400'
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function editWord(word: BannedWord) {
  editingWord.value = word
  formData.value = {
    word: word.word,
    category: word.category,
    action: word.action,
  }
  showFormModal.value = true
}

function confirmDelete(word: BannedWord) {
  wordToDelete.value = word
  showDeleteModal.value = true
}

async function handleSubmit() {
  if (!formData.value.word.trim() || !formData.value.category || !formData.value.action) {
    toast.error('Por favor, preencha todos os campos')
    return
  }

  try {
    submitting.value = true

    if (editingWord.value) {
      await adminStore.updateBannedWord(editingWord.value.id, {
        word: formData.value.word.trim(),
        category: formData.value.category as 'spam' | 'ofensivo' | 'outro',
        action: formData.value.action as 'block' | 'warn' | 'replace',
      })
      toast.success('Palavra atualizada com sucesso!')
    } else {
      await adminStore.createBannedWord({
        word: formData.value.word.trim(),
        category: formData.value.category as 'spam' | 'ofensivo' | 'outro',
        action: formData.value.action as 'block' | 'warn' | 'replace',
      })
      toast.success('Palavra adicionada com sucesso!')
    }

    showFormModal.value = false
    resetForm()
  } catch (error: any) {
    toast.error(error.message || 'Erro ao salvar palavra')
    console.error('Error saving banned word:', error)
  } finally {
    submitting.value = false
  }
}

async function handleDelete() {
  if (!wordToDelete.value) return

  try {
    submitting.value = true
    await adminStore.deleteBannedWord(wordToDelete.value.id)
    toast.success('Palavra removida com sucesso!')
    showDeleteModal.value = false
    wordToDelete.value = null
  } catch (error: any) {
    toast.error(error.message || 'Erro ao deletar palavra')
    console.error('Error deleting banned word:', error)
  } finally {
    submitting.value = false
  }
}

function resetForm() {
  formData.value = {
    word: '',
    category: '',
    action: '',
  }
  editingWord.value = null
}

onMounted(async () => {
  await adminStore.fetchBannedWords()
})
</script>


