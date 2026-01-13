<template>
  <div class="space-y-6">
    <!-- Header com botão Adicionar -->
    <div class="flex justify-between items-center">
      <div>
        <h2 class="text-slate-900 dark:text-white text-2xl font-bold mb-1">Challenges</h2>
        <p class="text-slate-600 dark:text-white/60 text-sm">Manage challenges for gamification and engagement</p>
      </div>
      <button
        @click="showFormModal = true; editingChallenge = null"
        class="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-secondary text-black font-bold rounded-lg hover:shadow-lg hover:shadow-primary/30 transition-all"
      >
        <span class="material-symbols-outlined">add</span>
        <span class="hidden sm:inline">Add Challenge</span>
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
            placeholder="Search challenge..."
            class="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/40 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
          />
        </div>
      </div>
      <div class="flex gap-2">
        <select
          v-model="filterType"
          class="px-4 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark text-slate-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
        >
          <option value="">All types</option>
          <option value="post">Post</option>
          <option value="comment">Comment</option>
          <option value="event">Event</option>
          <option value="connection">Connection</option>
          <option value="engagement">Engagement</option>
          <option value="other">Other</option>
        </select>
        <select
          v-model="filterActive"
          class="px-4 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark text-slate-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
        >
          <option value="">All</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>
    </div>

    <!-- Lista de Desafios -->
    <div v-if="loading && filteredChallenges.length === 0" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>

    <div v-else-if="filteredChallenges.length === 0" class="flex flex-col items-center justify-center py-12 bg-slate-50 dark:bg-surface-dark/50 rounded-xl border border-slate-200 dark:border-white/10">
      <span class="material-symbols-outlined text-slate-400 dark:text-gray-500 text-6xl mb-4">emoji_events</span>
      <p class="text-slate-600 dark:text-gray-400 font-medium">
        {{ searchQuery || filterType || filterActive ? 'No challenges found' : 'No challenges registered' }}
      </p>
    </div>

    <div v-else class="grid grid-cols-1 gap-4">
      <div
        v-for="challenge in filteredChallenges"
        :key="challenge.id"
        class="bg-white dark:bg-surface-dark rounded-xl p-6 border border-slate-200 dark:border-white/10 hover:border-primary/50 transition-all"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-3 flex-wrap">
              <h3 class="text-slate-900 dark:text-white font-bold text-lg">{{ challenge.nome }}</h3>
              <span
                class="px-2 py-1 rounded-full text-xs font-bold"
                :class="getTypeClass(challenge.tipo)"
              >
                {{ getTypeLabel(challenge.tipo) }}
              </span>
              <span
                class="px-2 py-1 rounded-full text-xs font-bold"
                :class="challenge.ativo ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'"
              >
                {{ challenge.ativo ? 'Active' : 'Inactive' }}
              </span>
            </div>
            <p v-if="challenge.descricao" class="text-slate-600 dark:text-white/60 text-sm mb-3">{{ challenge.descricao }}</p>
            <div class="flex items-center gap-4 text-sm text-slate-600 dark:text-white/60">
              <div class="flex items-center gap-1">
                <span class="material-symbols-outlined text-lg">stars</span>
                <span class="font-semibold text-primary">{{ challenge.pontos }} points</span>
              </div>
              <div v-if="challenge.prazo" class="flex items-center gap-1">
                <span class="material-symbols-outlined text-lg">schedule</span>
                <span>Deadline: {{ formatDate(challenge.prazo) }}</span>
              </div>
              <div class="flex items-center gap-1">
                <span class="material-symbols-outlined text-lg">people</span>
                <span>{{ challenge.total_participants || 0 }} participants</span>
              </div>
              <div class="flex items-center gap-1">
                <span class="material-symbols-outlined text-lg">check_circle</span>
                <span>{{ challenge.total_completed || 0 }} completed</span>
              </div>
            </div>
            <p class="text-slate-500 dark:text-white/40 text-xs mt-3">
              Created at {{ formatDate(challenge.created_at) }} by {{ challenge.creator_name || 'Admin' }}
            </p>
          </div>
          <div class="flex gap-2">
            <button
              @click="editChallenge(challenge)"
              class="p-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 rounded-lg text-slate-700 dark:text-white transition-all"
              title="Editar"
            >
              <span class="material-symbols-outlined text-lg">edit</span>
            </button>
            <button
              @click="confirmDelete(challenge)"
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
      :title="editingChallenge ? 'Edit Challenge' : 'Add Challenge'"
      size="md"
    >
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-slate-900 dark:text-white mb-2">Challenge Name *</label>
          <input
            v-model="formData.nome"
            type="text"
            required
            class="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark p-3 text-slate-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            placeholder="Ex: Create 5 posts this week"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-900 dark:text-white mb-2">Description</label>
          <textarea
            v-model="formData.descricao"
            rows="3"
            class="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark p-3 text-slate-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none"
            placeholder="Describe the challenge in detail..."
          />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-900 dark:text-white mb-2">Type *</label>
            <select
              v-model="formData.tipo"
              required
              class="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark p-3 text-slate-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            >
              <option value="">Select...</option>
              <option value="post">Post</option>
              <option value="comment">Comment</option>
              <option value="event">Event</option>
              <option value="connection">Connection</option>
              <option value="engagement">Engagement</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-900 dark:text-white mb-2">Points *</label>
            <input
              v-model.number="formData.pontos"
              type="number"
              min="1"
              required
              class="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark p-3 text-slate-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              placeholder="Ex: 10"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-900 dark:text-white mb-2">Deadline (optional)</label>
            <input
              v-model="formData.prazo"
              type="datetime-local"
              class="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark p-3 text-slate-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            />
            <p class="text-slate-500 dark:text-white/40 text-xs mt-1">Leave blank for no deadline</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-900 dark:text-white mb-2">Status</label>
            <div class="flex items-center gap-3 mt-2">
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  v-model="formData.ativo"
                  type="checkbox"
                  class="w-5 h-5 text-primary focus:ring-primary rounded"
                />
                <span class="text-slate-900 dark:text-white text-sm">Active</span>
              </label>
            </div>
            <p class="text-slate-500 dark:text-white/40 text-xs mt-1">Inactive challenges do not appear to users</p>
          </div>
        </div>

        <div class="flex gap-3 pt-4">
          <button
            type="submit"
            :disabled="submitting"
            class="flex-1 px-4 py-2 bg-gradient-to-r from-primary to-secondary text-black font-bold rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
          >
            {{ submitting ? 'Saving...' : (editingChallenge ? 'Save Changes' : 'Add Challenge') }}
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
          Are you sure you want to remove the challenge <strong class="text-slate-900 dark:text-white">"{{ challengeToDelete?.nome }}"</strong>?
        </p>
        <p class="text-slate-600 dark:text-white/60 text-sm">
          This action cannot be undone. User progress on this challenge will be kept, but the challenge will no longer be available.
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAdminStore } from '@/stores/admin'
import Modal from '@/components/ui/Modal.vue'
import { toast } from 'vue-sonner'
import type { Challenge, ChallengeType } from '@/types/admin'

const adminStore = useAdminStore()

const loading = computed(() => adminStore.loading)
const challenges = computed(() => adminStore.challenges)

const searchQuery = ref('')
const filterType = ref('')
const filterActive = ref('')
const showFormModal = ref(false)
const showDeleteModal = ref(false)
const editingChallenge = ref<Challenge | null>(null)
const challengeToDelete = ref<Challenge | null>(null)
const submitting = ref(false)

const formData = ref({
  nome: '',
  descricao: '',
  tipo: '' as ChallengeType | '',
  pontos: 10,
  prazo: '',
  ativo: true,
})

const filteredChallenges = computed(() => {
  let items = challenges.value

  // Filtrar por busca
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    items = items.filter(c => 
      c.nome.toLowerCase().includes(query) ||
      (c.descricao && c.descricao.toLowerCase().includes(query))
    )
  }

  // Filtrar por tipo
  if (filterType.value) {
    items = items.filter(c => c.tipo === filterType.value)
  }

  // Filtrar por status ativo
  if (filterActive.value) {
    const isActive = filterActive.value === 'true'
    items = items.filter(c => c.ativo === isActive)
  }

  return items
})

function getTypeLabel(tipo: string): string {
  const labels: Record<string, string> = {
    post: 'Post',
    comment: 'Comment',
    event: 'Event',
    connection: 'Connection',
    engagement: 'Engagement',
    other: 'Other',
  }
  return labels[tipo] || tipo
}

function getTypeClass(tipo: string): string {
  const classes: Record<string, string> = {
    post: 'bg-blue-500/20 text-blue-400',
    comment: 'bg-purple-500/20 text-purple-400',
    event: 'bg-green-500/20 text-green-400',
    connection: 'bg-yellow-500/20 text-yellow-400',
    engagement: 'bg-pink-500/20 text-pink-400',
    other: 'bg-gray-500/20 text-gray-400',
  }
  return classes[tipo] || 'bg-gray-500/20 text-gray-400'
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function editChallenge(challenge: Challenge) {
  editingChallenge.value = challenge
  formData.value = {
    nome: challenge.nome,
    descricao: challenge.descricao || '',
    tipo: challenge.tipo,
    pontos: challenge.pontos,
    prazo: challenge.prazo ? new Date(challenge.prazo).toISOString().slice(0, 16) : '',
    ativo: challenge.ativo,
  }
  showFormModal.value = true
}

function confirmDelete(challenge: Challenge) {
  challengeToDelete.value = challenge
  showDeleteModal.value = true
}

async function handleSubmit() {
  if (!formData.value.nome.trim() || !formData.value.tipo || !formData.value.pontos) {
    toast.error('Please fill all required fields')
    return
  }

  try {
    submitting.value = true

    const challengeData = {
      nome: formData.value.nome.trim(),
      descricao: formData.value.descricao.trim() || undefined,
      tipo: formData.value.tipo as ChallengeType,
      pontos: formData.value.pontos,
      prazo: formData.value.prazo ? new Date(formData.value.prazo).toISOString() : undefined,
      ativo: formData.value.ativo,
    }

    if (editingChallenge.value) {
      await adminStore.updateChallenge(editingChallenge.value.id, challengeData)
      toast.success('Challenge updated successfully!')
    } else {
      await adminStore.createChallenge(challengeData)
      toast.success('Challenge created successfully!')
    }

    showFormModal.value = false
    resetForm()
  } catch (error: any) {
    toast.error(error.message || 'Error saving challenge')
    console.error('Error saving challenge:', error)
  } finally {
    submitting.value = false
  }
}

async function handleDelete() {
  if (!challengeToDelete.value) return

  try {
    submitting.value = true
    await adminStore.deleteChallenge(challengeToDelete.value.id)
    toast.success('Challenge removed successfully!')
    showDeleteModal.value = false
    challengeToDelete.value = null
  } catch (error: any) {
    toast.error(error.message || 'Error deleting challenge')
    console.error('Error deleting challenge:', error)
  } finally {
    submitting.value = false
  }
}

function resetForm() {
  formData.value = {
    nome: '',
    descricao: '',
    tipo: '' as ChallengeType | '',
    pontos: 10,
    prazo: '',
    ativo: true,
  }
  editingChallenge.value = null
}

onMounted(async () => {
  await adminStore.fetchChallenges()
})
</script>

