<template>
  <div class="space-y-6">
    <!-- Header com botão Adicionar -->
    <div class="flex flex-wrap justify-between items-center gap-4">
      <div>
        <h2 class="text-slate-900 dark:text-white text-2xl font-bold mb-1">Banned Words</h2>
        <p class="text-slate-600 dark:text-white/60 text-sm">Manage prohibited words and phrases for automatic moderation</p>
      </div>
      <div class="flex gap-2">
        <button
          @click="showBulkModal = true; bulkData.words = ''"
          class="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white font-bold rounded-lg hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
        >
          <span class="material-symbols-outlined">library_add</span>
          <span class="hidden sm:inline">Bulk Add</span>
        </button>
        <button
          @click="showFormModal = true; editingWord = null"
          class="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-secondary text-black font-bold rounded-lg hover:shadow-lg hover:shadow-primary/30 transition-all"
        >
          <span class="material-symbols-outlined">add</span>
          <span class="hidden sm:inline">Add Word</span>
        </button>
      </div>
    </div>

    <!-- Filtros e Busca -->
    <div class="flex flex-col sm:flex-row gap-4">
      <div class="flex-1">
        <div class="relative">
          <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/40 text-xl">search</span>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search word..."
            class="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/40 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
          />
        </div>
      </div>
      <div class="flex gap-2">
        <select
          v-model="filterCategory"
          class="px-4 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark text-slate-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
        >
          <option value="">All categories</option>
          <option value="spam">Spam</option>
          <option value="ofensivo">Offensive</option>
          <option value="outro">Other</option>
        </select>
        <select
          v-model="filterAction"
          class="px-4 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark text-slate-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
        >
          <option value="">All actions</option>
          <option value="block">Block</option>
          <option value="warn">Warn</option>
          <option value="replace">Replace</option>
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
        {{ searchQuery || filterCategory || filterAction ? 'No words found' : 'No banned words registered' }}
      </p>
    </div>

    <!-- Categorias e Chips -->
    <div v-else class="space-y-8">
      <div v-for="cat in categories" :key="cat.id" class="space-y-4">
        <div v-if="getWordsByCategory(cat.id).length > 0" class="space-y-4">
          <div class="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-white/10">
            <span class="w-2 h-2 rounded-full" :class="getCategoryDotClass(cat.id)"></span>
            <h3 class="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs">{{ cat.label }}</h3>
            <span class="text-xs text-slate-500 dark:text-white/40">({{ getWordsByCategory(cat.id).length }})</span>
          </div>

          <div class="flex flex-wrap gap-2">
            <div
              v-for="word in getWordsByCategory(cat.id)"
              :key="word.id"
              class="group relative flex items-center gap-2 pl-3 pr-2 py-1.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-full hover:border-primary/50 transition-all cursor-pointer"
              @click="editWord(word)"
            >
              <div class="flex flex-col">
                <span class="text-sm font-medium text-slate-900 dark:text-white">{{ word.word }}</span>
              </div>
              
              <!-- Action Indicator -->
              <span 
                class="w-1.5 h-1.5 rounded-full" 
                :class="getActionDotClass(word.action)"
                :title="getActionLabel(word.action)"
              ></span>

              <button
                @click.stop="confirmDelete(word)"
                class="flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-white/40 hover:bg-red-500/20 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                title="Remove"
              >
                <span class="material-symbols-outlined text-[14px]">close</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Formulário -->
    <Modal
      v-model="showFormModal"
      :title="editingWord ? 'Edit Banned Word' : 'Add Banned Word'"
      size="md"
    >
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-slate-900 dark:text-white mb-2">Word or Phrase *</label>
          <input
            v-model="formData.word"
            type="text"
            required
            class="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark p-3 text-slate-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            placeholder="Ex: forbidden word or full phrase"
          />
          <p class="text-slate-500 dark:text-white/40 text-xs mt-1">Verification is case-insensitive</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-900 dark:text-white mb-2">Category *</label>
          <select
            v-model="formData.category"
            required
            class="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark p-3 text-slate-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
          >
            <option value="">Select...</option>
            <option value="spam">Spam</option>
            <option value="ofensivo">Offensive</option>
            <option value="outro">Other</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-900 dark:text-white mb-2">Action *</label>
          <select
            v-model="formData.action"
            required
            class="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark p-3 text-slate-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
          >
            <option value="">Select...</option>
            <option value="block">Block - Don't allow content creation</option>
            <option value="warn">Warn - Create as pending for review</option>
            <option value="replace">Replace - Automatically replace with asterisks</option>
          </select>
        </div>

        <div class="flex gap-3 pt-4">
          <button
            type="submit"
            :disabled="submitting"
            class="flex-1 px-4 py-2 bg-gradient-to-r from-primary to-secondary text-black font-bold rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
          >
            {{ submitting ? 'Saving...' : (editingWord ? 'Save Changes' : 'Add Word') }}
          </button>
          <button
            type="button"
            @click="showFormModal = false"
            class="px-4 py-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 rounded-lg text-slate-700 dark:text-white font-medium transition-all"
          >
            Cancel
          </button>
        </div>
      </form>
    </Modal>

    <!-- Modal de Confirmação de Delete -->
    <Modal
      v-model="showDeleteModal"
      title="Confirm Delete"
      size="sm"
    >
      <div class="space-y-4">
        <p class="text-slate-700 dark:text-white/80">
          Are you sure you want to remove the word <strong class="text-slate-900 dark:text-white">"{{ wordToDelete?.word }}"</strong>?
        </p>
        <p class="text-slate-600 dark:text-white/60 text-sm">
          This action cannot be undone.
        </p>
        <div class="flex gap-3 pt-4">
          <button
            @click="handleDelete"
            :disabled="submitting"
            class="flex-1 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-600 dark:text-red-400 font-medium transition-all disabled:opacity-50"
          >
            {{ submitting ? 'Deleting...' : 'Delete' }}
          </button>
          <button
            @click="showDeleteModal = false"
            class="px-4 py-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 rounded-lg text-slate-700 dark:text-white font-medium transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>

    <!-- Modal de Adição em Massa -->
    <Modal
      v-model="showBulkModal"
      title="Bulk Add Banned Words"
      size="md"
    >
      <div class="space-y-4">
        <p class="text-slate-600 dark:text-white/60 text-sm">
          Add multiple words or phrases at once. Separate them with commas or new lines.
        </p>
        
        <div>
          <label class="block text-sm font-medium text-slate-900 dark:text-white mb-2">Words/Phrases</label>
          <textarea
            v-model="bulkData.words"
            rows="6"
            class="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark p-3 text-slate-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            placeholder="word1, word2, phrase one, phrase two"
          ></textarea>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-900 dark:text-white mb-2">Category *</label>
            <select
              v-model="bulkData.category"
              class="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark p-3 text-slate-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            >
              <option value="spam">Spam</option>
              <option value="ofensivo">Offensive</option>
              <option value="outro">Other</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-900 dark:text-white mb-2">Action *</label>
            <select
              v-model="bulkData.action"
              class="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark p-3 text-slate-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            >
              <option value="block">Block</option>
              <option value="warn">Warn</option>
              <option value="replace">Replace</option>
            </select>
          </div>
        </div>

        <div class="flex gap-3 pt-4">
          <button
            @click="handleBulkSubmit"
            :disabled="submitting || !bulkData.words.trim()"
            class="flex-1 px-4 py-2 bg-gradient-to-r from-primary to-secondary text-black font-bold rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
          >
            {{ submitting ? 'Adding...' : 'Add Words' }}
          </button>
          <button
            @click="showBulkModal = false"
            class="px-4 py-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 rounded-lg text-slate-700 dark:text-white font-medium transition-all"
          >
            Cancel
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
const showBulkModal = ref(false)
const showDeleteModal = ref(false)
const editingWord = ref<BannedWord | null>(null)
const wordToDelete = ref<BannedWord | null>(null)
const submitting = ref(false)

const categories = [
  { id: 'spam', label: 'Spam' },
  { id: 'ofensivo', label: 'Offensive' },
  { id: 'outro', label: 'Other' },
]

const formData = ref({
  word: '',
  category: '' as 'spam' | 'ofensivo' | 'outro' | '',
  action: '' as 'block' | 'warn' | 'replace' | '',
})

const bulkData = ref({
  words: '',
  category: 'outro' as 'spam' | 'ofensivo' | 'outro',
  action: 'block' as 'block' | 'warn' | 'replace',
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

function getWordsByCategory(category: string) {
  return filteredWords.value.filter(w => w.category === category)
}

function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    spam: 'Spam',
    ofensivo: 'Offensive',
    outro: 'Other',
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
    block: 'Block',
    warn: 'Warn',
    replace: 'Replace',
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

function getActionDotClass(action: string): string {
  const classes: Record<string, string> = {
    block: 'bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.5)]',
    warn: 'bg-yellow-500 shadow-[0_0_5px_rgba(234,179,8,0.5)]',
    replace: 'bg-blue-500 shadow-[0_0_5px_rgba(59,130,246,0.5)]',
  }
  return classes[action] || 'bg-gray-500'
}

function getCategoryDotClass(category: string): string {
  const classes: Record<string, string> = {
    spam: 'bg-purple-500',
    ofensivo: 'bg-red-500',
    outro: 'bg-gray-500',
  }
  return classes[category] || 'bg-gray-500'
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
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
    toast.error('Please fill all fields')
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
      toast.success('Word updated successfully!')
    } else {
      await adminStore.createBannedWord({
        word: formData.value.word.trim(),
        category: formData.value.category as 'spam' | 'ofensivo' | 'outro',
        action: formData.value.action as 'block' | 'warn' | 'replace',
      })
      toast.success('Word added successfully!')
    }

    showFormModal.value = false
    resetForm()
  } catch (error: any) {
    toast.error(error.message || 'Error saving word')
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
    toast.success('Word removed successfully!')
    showDeleteModal.value = false
    wordToDelete.value = null
  } catch (error: any) {
    toast.error(error.message || 'Error deleting word')
    console.error('Error deleting banned word:', error)
  } finally {
    submitting.value = false
  }
}

async function handleBulkSubmit() {
  if (!bulkData.value.words.trim()) return

  const words = bulkData.value.words
    .split(/[,\n]/)
    .map(w => w.trim())
    .filter(w => w.length > 0)

  if (words.length === 0) return

  try {
    submitting.value = true
    let successCount = 0
    let failCount = 0

    // Por enquanto inserindo um por um (a store/supabase poderia fazer batch mas vamos usar o que existe)
    for (const word of words) {
      try {
        await adminStore.createBannedWord({
          word,
          category: bulkData.value.category,
          action: bulkData.value.action
        })
        successCount++
      } catch (e) {
        failCount++
      }
    }

    if (failCount === 0) {
      toast.success(`${successCount} words added successfully!`)
    } else {
      toast.success(`${successCount} words added, ${failCount} failed (possibly duplicates).`)
    }

    showBulkModal.value = false
    bulkData.value.words = ''
  } catch (error: any) {
    toast.error('Error in bulk operation')
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


