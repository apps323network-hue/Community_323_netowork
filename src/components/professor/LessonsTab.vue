<template>
  <div>
    <!-- Header with Add Button -->
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-black text-slate-900 dark:text-white">Aulas do Programa</h2>
      <button
        @click="openCreateModal"
        class="flex items-center gap-2 px-6 py-3 bg-secondary text-black font-bold rounded-xl hover:bg-secondary/90 transition-all shadow-lg hover:shadow-secondary/20"
      >
        <span class="material-symbols-outlined">add</span>
        Nova Aula
      </button>
    </div>

    <!-- No modules state -->
    <div v-if="modules.length === 0" class="text-center py-20 bg-white dark:bg-surface-dark rounded-2xl border border-slate-200 dark:border-white/5">
      <div class="bg-secondary/10 p-8 rounded-full w-fit mx-auto mb-6">
        <span class="material-symbols-outlined text-6xl text-secondary">folder_open</span>
      </div>
      <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-2">Crie módulos primeiro</h3>
      <p class="text-slate-600 dark:text-gray-400">
        Você precisa criar pelo menos um módulo antes de adicionar aulas.
      </p>
    </div>

    <!-- Lessons by Module -->
    <div v-else class="space-y-6">
      <div v-for="module in modules" :key="module.id">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-bold text-slate-900 dark:text-white">
            {{ getModuleTitle(module) }}
          </h3>
          <button
            @click="openCreateModal(module)"
            class="text-sm flex items-center gap-1 text-secondary hover:text-secondary/80 font-bold transition-colors"
          >
            <span class="material-symbols-outlined text-sm">add</span>
            Adicionar aula
          </button>
        </div>

        <div v-if="!module.lessons || module.lessons.length === 0" class="bg-white dark:bg-surface-dark rounded-xl border border-dashed border-slate-300 dark:border-white/10 p-8 text-center">
          <p class="text-slate-600 dark:text-gray-400 text-sm">Nenhuma aula neste módulo</p>
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="(lesson, idx) in module.lessons"
            :key="lesson.id"
            class="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-white/5 p-4 hover:shadow-lg transition-shadow"
          >
            <div class="flex items-center gap-4">
              <!-- YouTube Thumbnail -->
              <img
                :src="lesson.youtube_thumbnail_url || `https://img.youtube.com/vi/${lesson.youtube_video_id}/mqdefault.jpg`"
                :alt="getLessonTitle(lesson)"
                class="w-32 h-20 object-cover rounded-lg flex-shrink-0"
              />

              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <span class="text-xs font-black text-slate-400 dark:text-gray-500 uppercase">Aula {{ idx + 1 }}</span>
                  <span v-if="lesson.is_preview" class="text-xs font-bold bg-secondary/20 text-secondary px-2 py-0.5 rounded">Preview</span>
                </div>
                <h4 class="text-base font-black text-slate-900 dark:text-white mb-1 line-clamp-1">
                  {{ getLessonTitle(lesson) }}
                </h4>
                <div class="flex items-center gap-4 text-xs font-bold text-slate-500 dark:text-gray-400">
                  <span class="flex items-center gap-1">
                    <span class="material-symbols-outlined text-sm text-secondary">schedule</span>
                    {{ formatDuration(lesson.duration_seconds) }}
                  </span>
                  <span class="flex items-center gap-1">
                    <span class="material-symbols-outlined text-sm text-secondary">smart_display</span>
                    {{ lesson.youtube_video_id }}
                  </span>
                </div>
              </div>

              <div class="flex items-center gap-2 flex-shrink-0">
                <button
                  @click="openEditModal(lesson)"
                  class="p-2 text-slate-600 dark:text-gray-400 hover:text-secondary hover:bg-secondary/10 rounded-lg transition-all"
                  title="Editar aula"
                >
                  <span class="material-symbols-outlined">edit</span>
                </button>
                <button
                  @click="confirmDelete(lesson)"
                  class="p-2 text-slate-600 dark:text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                  title="Deletar aula"
                >
                  <span class="material-symbols-outlined">delete</span>
                </button>
              </div>
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
      <div class="bg-white dark:bg-surface-dark rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-white/10">
        <div class="sticky top-0 bg-white dark:bg-surface-dark border-b border-slate-200 dark:border-white/10 px-6 py-4 flex items-center justify-between z-10">
          <h3 class="text-xl font-black text-slate-900 dark:text-white">
            {{ editingLesson ? 'Editar Aula' : 'Criar Nova Aula' }}
          </h3>
          <button
            @click="closeModal"
            class="text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <form @submit.prevent="submitLesson" class="p-6 space-y-6">
          <!-- Module Selection -->
          <div v-if="!selectedModuleForCreate">
            <label class="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2">
              Módulo *
            </label>
            <select
              v-model="formData.module_id"
              required
              class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black/40 text-slate-900 dark:text-white focus:ring-2 focus:ring-secondary outline-none transition-all"
            >
              <option value="">Selecione um módulo</option>
              <option v-for="module in modules" :key="module.id" :value="module.id">
                {{ getModuleTitle(module) }}
              </option>
            </select>
          </div>

          <!-- YouTube Video ID -->
          <div>
            <label class="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2">
              YouTube Video ID *
              <span class="text-xs font-normal text-slate-500">(Ex: dQw4w9WgXcQ)</span>
            </label>
            <input
              v-model="formData.youtube_video_id"
              type="text"
              required
              class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black/40 text-slate-900 dark:text-white focus:ring-2 focus:ring-secondary outline-none transition-all"
              placeholder="dQw4w9WgXcQ"
            />
            <p class="text-xs text-slate-500 dark:text-gray-400 mt-2">
              Cole apenas o ID do vídeo, não a URL completa. Ex: youtube.com/watch?v=<strong>dQw4w9WgXcQ</strong>
            </p>
          </div>

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
              placeholder="Ex: Introdução ao Marketing Digital"
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
              placeholder="Ex: Introduction to Digital Marketing"
            />
          </div>

          <!-- Is Preview -->
          <div class="flex items-center gap-3">
            <input
              v-model="formData.is_preview"
              type="checkbox"
              id="is_preview"
              class="w-5 h-5 rounded border-slate-300 dark:border-white/20 text-secondary focus:ring-secondary focus:ring-offset-0"
            />
            <label for="is_preview" class="text-sm font-bold text-slate-700 dark:text-gray-300">
              Permitir preview (usuários não matriculados podem assistir)
            </label>
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
              {{ modulesStore.loading ? 'Salvando...' : editingLesson ? 'Salvar Alterações' : 'Criar Aula' }}
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
import type { ProgramModule, ProgramLesson } from '@/types/modules'

const props = defineProps<{
  programId: string
}>()

const { locale: currentLocale } = useLocale()
const modulesStore = useModulesStore()

const showModal = ref(false)
const editingLesson = ref<ProgramLesson | null>(null)
const selectedModuleForCreate = ref<ProgramModule | null>(null)
const formData = ref({
  module_id: '',
  youtube_video_id: '',
  title_pt: '',
  title_en: '',
  is_preview: false
})

const modules = computed(() => modulesStore.getModulesByProgram(props.programId))

const getModuleTitle = (module: ProgramModule) => {
  return currentLocale.value === 'pt-BR' ? module.title_pt : module.title_en
}

const getLessonTitle = (lesson: ProgramLesson) => {
  return currentLocale.value === 'pt-BR' ? lesson.title_pt : lesson.title_en
}

function formatDuration(seconds: number | null) {
  if (!seconds) return 'N/A'
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function openCreateModal(module?: ProgramModule) {
  editingLesson.value = null
  selectedModuleForCreate.value = module || null
  formData.value = {
    module_id: module?.id || '',
    youtube_video_id: '',
    title_pt: '',
    title_en: '',
    is_preview: false
  }
  showModal.value = true
}

function openEditModal(lesson: ProgramLesson) {
  editingLesson.value = lesson
  selectedModuleForCreate.value = null
  formData.value = {
    module_id: lesson.module_id,
    youtube_video_id: lesson.youtube_video_id,
    title_pt: lesson.title_pt,
    title_en: lesson.title_en,
    is_preview: lesson.is_preview
  }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editingLesson.value = null
  selectedModuleForCreate.value = null
}

async function submitLesson() {
  try {
    if (editingLesson.value) {
      await modulesStore.updateLesson(editingLesson.value.id, formData.value, true)
    } else {
      const module = modules.value.find(m => m.id === formData.value.module_id)
      const nextOrder = module?.lessons?.length || 0
      
      await modulesStore.createLesson({
        ...formData.value,
        program_id: props.programId,
        order_index: nextOrder
      }, true) // true = fetch YouTube data
    }
    closeModal()
    await modulesStore.fetchModulesWithLessons(props.programId)
  } catch (error) {
    console.error('Error saving lesson:', error)
    alert('Erro ao salvar aula. Verifique o ID do YouTube e tente novamente.')
  }
}

async function confirmDelete(lesson: ProgramLesson) {
  if (confirm(`Tem certeza que deseja deletar a aula "${getLessonTitle(lesson)}"?`)) {
    try {
      await modulesStore.deleteLesson(lesson.id)
      await modulesStore.fetchModulesWithLessons(props.programId)
    } catch (error) {
      console.error('Error deleting lesson:', error)
      alert('Erro ao deletar aula. Tente novamente.')
    }
  }
}

onMounted(() => {
  modulesStore.fetchModulesWithLessons(props.programId)
})
</script>
