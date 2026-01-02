<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-2xl font-black text-slate-900 dark:text-white">Materiais do Programa</h2>
        <p class="text-sm text-slate-600 dark:text-gray-400 mt-1">Upload de PDFs para os alunos</p>
      </div>
      <button
        @click="openUploadModal"
        :disabled="modules.length === 0"
        class="flex items-center gap-2 px-6 py-3 bg-secondary text-black font-bold rounded-xl hover:bg-secondary/90 transition-all shadow-lg hover:shadow-secondary/20 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span class="material-symbols-outlined">upload_file</span>
        Upload Material
      </button>
    </div>

    <!-- No modules state -->
    <div v-if="modules.length === 0" class="text-center py-20 bg-white dark:bg-surface-dark rounded-2xl border border-slate-200 dark:border-white/5">
      <div class="bg-secondary/10 p-8 rounded-full w-fit mx-auto mb-6">
        <span class="material-symbols-outlined text-6xl text-secondary">folder_open</span>
      </div>
      <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-2">Crie módulos primeiro</h3>
      <p class="text-slate-600 dark:text-gray-400">
        Você precisa criar pelo menos um módulo antes de adicionar materiais.
      </p>
    </div>

    <!-- Materials List -->
    <div v-else-if="materials.length === 0" class="text-center py-20 bg-white dark:bg-surface-dark rounded-2xl border border-slate-200 dark:border-white/5">
      <div class="bg-secondary/10 p-8 rounded-full w-fit mx-auto mb-6">
        <span class="material-symbols-outlined text-6xl text-secondary">description</span>
      </div>
      <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-2">Nenhum material enviado</h3>
      <p class="text-slate-600 dark:text-gray-400 mb-6">
        Faça upload de PDFs para que seus alunos possam baixar.
      </p>
      <button
        @click="openUploadModal"
        class="px-8 py-3 bg-secondary text-black font-bold rounded-xl hover:bg-secondary/90 transition-all inline-flex items-center gap-2"
      >
        <span class="material-symbols-outlined">upload_file</span>
        Upload Primeiro Material
      </button>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="material in materials"
        :key="material.id"
        class="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-white/5 p-4 hover:shadow-lg transition-shadow"
      >
        <div class="flex items-start justify-between gap-3 mb-3">
          <div class="bg-red-500/10 p-3 rounded-lg flex-shrink-0">
            <span class="material-symbols-outlined text-2xl text-red-500">picture_as_pdf</span>
          </div>
          <button
            @click="confirmDelete(material)"
            class="p-2 text-slate-600 dark:text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
          >
            <span class="material-symbols-outlined">delete</span>
          </button>
        </div>

        <h4 class="text-base font-black text-slate-900 dark:text-white mb-2 line-clamp-2">
          {{ getMaterialTitle(material) }}
        </h4>

        <div class="text-xs font-bold text-slate-500 dark:text-gray-400 space-y-1">
          <div v-if="material.lesson_id" class="flex items-center gap-2">
            <span class="material-symbols-outlined text-sm">play_circle</span>
            Vinculado a uma aula
          </div>
          <div v-else-if="material.module_id" class="flex items-center gap-2">
            <span class="material-symbols-outlined text-sm">folder</span>
            {{ getModuleName(material.module_id) }}
          </div>
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-sm">insert_drive_file</span>
            {{ formatFileSize(material.file_size_bytes) }}
          </div>
        </div>

        <button
          @click="downloadMaterial(material)"
          class="w-full mt-4 px-4 py-2 bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white font-bold rounded-lg hover:bg-secondary hover:text-black transition-all text-sm"
        >
          Baixar
        </button>
      </div>
    </div>

    <!-- Upload Modal -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      @click.self="closeModal"
    >
      <div class="bg-white dark:bg-surface-dark rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 dark:border-white/10">
        <div class="px-6 py-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
          <h3 class="text-xl font-black text-slate-900 dark:text-white">Upload de Material</h3>
          <button
            @click="closeModal"
            class="text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <form @submit.prevent="uploadMaterial" class="p-6 space-y-6">
          <!-- File Upload -->
          <div>
            <label class="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2">
              Arquivo PDF *
            </label>
            <input
              type="file"
              accept=".pdf"
              @change="handleFileSelect"
              required
              class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black/40 text-slate-900 dark:text-white focus:ring-2 focus:ring-secondary outline-none transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-secondary/10 file:text-secondary hover:file:bg-secondary/20"
            />
            <p class="text-xs text-slate-500 dark:text-gray-400 mt-2">
              Máximo 10MB por arquivo
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
              placeholder="Ex: Slides da Aula 1"
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
              placeholder="Ex: Lesson 1 Slides"
            />
          </div>

          <!-- Module Selection -->
          <div>
            <label class="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2">
              Vincular ao Módulo *
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
              :disabled="modulesStore.loading || !selectedFile"
              class="px-6 py-3 bg-secondary text-black font-bold rounded-xl hover:bg-secondary/90 transition-all shadow-lg hover:shadow-secondary/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ modulesStore.loading ? 'Enviando...' : 'Upload Material' }}
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
import type { ProgramModule, ProgramMaterial } from '@/types/modules'

const props = defineProps<{
  programId: string
}>()

const { locale: currentLocale } = useLocale()
const modulesStore = useModulesStore()

const showModal = ref(false)
const selectedFile = ref<File | null>(null)
const formData = ref({
  title_pt: '',
  title_en: '',
  module_id: ''
})

const modules = computed(() => modulesStore.getModulesByProgram(props.programId))
const materials = computed(() => modulesStore.materials)

const getModuleTitle = (module: ProgramModule) => {
  return currentLocale.value === 'pt-BR' ? module.title_pt : module.title_en
}

const getMaterialTitle = (material: ProgramMaterial) => {
  return currentLocale.value === 'pt-BR' ? material.title_pt : material.title_en
}

const getModuleName = (moduleId: string) => {
  const module = modules.value.find(m => m.id === moduleId)
  return module ? getModuleTitle(module) : 'N/A'
}

function formatFileSize(bytes: number | null) {
  if (!bytes) return 'N/A'
  const mb = bytes / (1024 * 1024)
  return `${mb.toFixed(2)} MB`
}

function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    selectedFile.value = target.files[0]
  }
}

function openUploadModal() {
  formData.value = {
    title_pt: '',
    title_en: '',
    module_id: ''
  }
  selectedFile.value = null
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  selectedFile.value = null
}

async function uploadMaterial() {
  if (!selectedFile.value) return

  try {
    const nextOrder = materials.value.length
    await modulesStore.uploadMaterial(
      selectedFile.value,
      props.programId,
      null, // lesson_id
      formData.value.module_id,
      {
        ...formData.value,
        order_index: nextOrder
      }
    )
    closeModal()
    await modulesStore.fetchMaterials(props.programId)
  } catch (error) {
    console.error('Error uploading material:', error)
    alert('Erro ao fazer upload do material. Tente novamente.')
  }
}

async function downloadMaterial(material: ProgramMaterial) {
  try {
    const url = await modulesStore.getMaterialDownloadUrl(material.file_path)
    if (url) {
      window.open(url, '_blank')
    }
  } catch (error) {
    console.error('Error downloading material:', error)
    alert('Erro ao baixar material.')
  }
}

async function confirmDelete(material: ProgramMaterial) {
  if (confirm(`Tem certeza que deseja deletar o material "${getMaterialTitle(material)}"?`)) {
    try {
      await modulesStore.deleteMaterial(material.id, material.file_path)
    } catch (error) {
      console.error('Error deleting material:', error)
      alert('Erro ao deletar material. Tente novamente.')
    }
  }
}

onMounted(async () => {
  await modulesStore.fetchModulesWithLessons(props.programId)
  await modulesStore.fetchMaterials(props.programId)
})
</script>
