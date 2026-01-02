<template>
  <div>
    <!-- Header with Add Button -->
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-black text-slate-900 dark:text-white">Módulos do Programa</h2>
      <button
        @click="openCreateModal"
        class="flex items-center gap-2 px-6 py-3 bg-secondary text-black font-bold rounded-xl hover:bg-secondary/90 transition-all shadow-lg hover:shadow-secondary/20"
      >
        <span class="material-symbols-outlined">add</span>
        Novo Módulo
      </button>
    </div>

    <!-- Loading -->
    <div v-if="modulesStore.loading" class="flex items-center justify-center h-64">
      <div class="animate-spin rounded-full h-10 w-10 border-4 border-secondary border-t-transparent"></div>
    </div>

    <!-- Empty State -->
    <div v-else-if="modules.length === 0" class="text-center py-20 bg-white dark:bg-surface-dark rounded-2xl border border-slate-200 dark:border-white/5">
      <div class="bg-secondary/10 p-8 rounded-full w-fit mx-auto mb-6">
        <span class="material-symbols-outlined text-6xl text-secondary">folder_open</span>
      </div>
      <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-2">Nenhum módulo criado</h3>
      <p class="text-slate-600 dark:text-gray-400 mb-6">
        Organize seu programa criando módulos temáticos para agrupar as aulas.
      </p>
      <button
        @click="openCreateModal"
        class="px-8 py-3 bg-secondary text-black font-bold rounded-xl hover:bg-secondary/90 transition-all inline-flex items-center gap-2"
      >
        <span class="material-symbols-outlined">add</span>
        Criar Primeiro Módulo
      </button>
    </div>

    <!-- Modules List -->
    <div v-else class="space-y-4">
      <div
        v-for="(module, index) in modules"
        :key="module.id"
        class="bg-white dark:bg-surface-dark rounded-2xl border border-slate-200 dark:border-white/5 overflow-hidden hover:shadow-lg transition-shadow"
      >
        <div class="p-6">
          <div class="flex items-start justify-between gap-4">
            <div class="flex items-start gap-4 flex-1">
              <div class="bg-secondary/10 p-3 rounded-lg flex-shrink-0">
                <span class="material-symbols-outlined text-2xl text-secondary">folder</span>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-3 mb-2">
                  <span class="text-xs font-black text-slate-400 dark:text-gray-500 uppercase">Módulo {{index + 1}}</span>
                </div>
                <h3 class="text-lg font-black text-slate-900 dark:text-white mb-2">
                  {{ getModuleTitle(module) }}
                </h3>
                <p v-if="getModuleDescription(module)" class="text-sm text-slate-600 dark:text-gray-400 line-clamp-2">
                  {{ getModuleDescription(module) }}
                </p>
                <div class="flex items-center gap-4 mt-4 text-xs font-bold text-slate-500 dark:text-gray-400">
                  <span class="flex items-center gap-1.5">
                    <span class="material-symbols-outlined text-sm text-secondary">play_circle</span>
                   {{ module.lessons?.length || 0 }} aulas
                  </span>
                </div>
              </div>
            </div>

            <div class="flex items-center gap-2 flex-shrink-0">
              <button
                @click="openEditModal(module)"
                class="p-2 text-slate-600 dark:text-gray-400 hover:text-secondary hover:bg-secondary/10 rounded-lg transition-all"
                title="Editar módulo"
              >
                <span class="material-symbols-outlined">edit</span>
              </button>
              <button
                @click="confirmDelete(module)"
                class="p-2 text-slate-600 dark:text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                title="Deletar módulo"
              >
                <span class="material-symbols-outlined">delete</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      @click.self="closeModal"
    >
      <div class="bg-white dark:bg-surface-dark rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-white/10">
        <div class="sticky top-0 bg-white dark:bg-surface-dark border-b border-slate-200 dark:border-white/10 px-6 py-4 flex items-center justify-between z-10">
          <h3 class="text-xl font-black text-slate-900 dark:text-white">
            {{ editingModule ? 'Editar Módulo' : 'Criar Novo Módulo' }}
          </h3>
          <button
            @click="closeModal"
            class="text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <form @submit.prevent="submitModule" class="p-6 space-y-6">
          <!-- Title PT -->
          <div>
            <label class="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2">
              Título (Português) *
            </label>
            <input
              v-model="formData.title_pt"
              type="text"
              required
              class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black/40 text-slate-900 dark:text-white focus:ring-2 focus:ring-secondary outline-none transition-all"
              placeholder="Ex: Fundamentos de Marketing Digital"
            />
          </div>

          <!-- Title EN -->
          <div>
            <label class="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2">
              Título (Inglês) *
            </label>
            <input
              v-model="formData.title_en"
              type="text"
              required
              class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black/40 text-slate-900 dark:text-white focus:ring-2 focus:ring-secondary outline-none transition-all"
              placeholder="Ex: Digital Marketing Fundamentals"
            />
          </div>

          <!-- Description PT -->
          <div>
            <label class="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2">
              Descrição (Português)
            </label>
            <textarea
              v-model="formData.description_pt"
              rows="3"
              class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black/40 text-slate-900 dark:text-white focus:ring-2 focus:ring-secondary outline-none transition-all resize-none"
              placeholder="Descreva o que será abordado neste módulo..."
            ></textarea>
          </div>

          <!-- Description EN -->
          <div>
            <label class="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2">
              Descrição (Inglês)
            </label>
            <textarea
              v-model="formData.description_en"
              rows="3"
              class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black/40 text-slate-900 dark:text-white focus:ring-2 focus:ring-secondary outline-none transition-all resize-none"
              placeholder="Describe what will be covered in this module..."
            ></textarea>
          </div>

          <!-- Actions -->
          <div class="flex items-center justify-end gap-4 pt-4 border-t border-slate-200 dark:border-white/10">
            <button
              type="button"
              @click="closeModal"
              class="px-6 py-3 bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="modulesStore.loading"
              class="px-6 py-3 bg-secondary text-black font-bold rounded-xl hover:bg-secondary/90 transition-all shadow-lg hover:shadow-secondary/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ modulesStore.loading ? 'Salvando...' : editingModule ? 'Salvar Alterações' : 'Criar Módulo' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useLocale } from '@/composables/useLocale'
import { useModulesStore } from '@/stores/modules'
import type { ProgramModule } from '@/types/modules'

const props = defineProps<{
  programId: string
}>()

const { locale: currentLocale } = useLocale()
const modulesStore = useModulesStore()

const showModal = ref(false)
const editingModule = ref<ProgramModule | null>(null)
const formData = ref({
  title_pt: '',
  title_en: '',
  description_pt: '',
  description_en: ''
})

const modules = computed(() => modulesStore.getModulesByProgram(props.programId))

const getModuleTitle = (module: ProgramModule) => {
  return currentLocale.value === 'pt-BR' ? module.title_pt : module.title_en
}

const getModuleDescription = (module: ProgramModule) => {
  return currentLocale.value === 'pt-BR' ? module.description_pt : module.description_en
}

function openCreateModal() {
  editingModule.value = null
  formData.value = {
    title_pt: '',
    title_en: '',
    description_pt: '',
    description_en: ''
  }
  showModal.value = true
}

function openEditModal(module: ProgramModule) {
  editingModule.value = module
  formData.value = {
    title_pt: module.title_pt,
    title_en: module.title_en,
    description_pt: module.description_pt || '',
    description_en: module.description_en || ''
  }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editingModule.value = null
}

async function submitModule() {
  try {
    if (editingModule.value) {
      await modulesStore.updateModule(editingModule.value.id, formData.value)
    } else {
      const nextOrder = modules.value.length
      await modulesStore.createModule({
        ...formData.value,
        program_id: props.programId,
        order_index: nextOrder
      })
    }
    closeModal()
  } catch (error) {
    console.error('Error saving module:', error)
    alert('Erro ao salvar módulo. Tente novamente.')
  }
}

async function confirmDelete(module: ProgramModule) {
  if (confirm(`Tem certeza que deseja deletar o módulo "${getModuleTitle(module)}"? Todas as aulas deste módulo também serão deletadas.`)) {
    try {
      await modulesStore.deleteModule(module.id)
    } catch (error) {
      console.error('Error deleting module:', error)
      alert('Erro ao deletar módulo. Tente novamente.')
    }
  }
}

onMounted(() => {
  modulesStore.fetchModulesWithLessons(props.programId)
})
</script>
