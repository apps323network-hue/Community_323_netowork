<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
      <div>
        <h2 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
          <span class="w-1.5 h-6 sm:h-8 bg-red-500 rounded-full"></span>
          Materiais de Apoio
        </h2>
        <p class="text-xs sm:text-sm text-slate-500 dark:text-gray-400 font-medium mt-1">Gerencie arquivos PDF e documentos complementares</p>
      </div>
      <button
        @click="openUploadModal"
        :disabled="modules.length === 0"
        class="flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white dark:bg-white dark:text-black font-black rounded-xl hover:scale-105 active:scale-95 transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
      >
        <span class="material-symbols-outlined text-lg">upload_file</span>
        Novo Material
      </button>
    </div>

    <!-- No modules state -->
    <div v-if="modules.length === 0" class="text-center py-16 sm:py-24 bg-white dark:bg-surface-dark rounded-[32px] border border-slate-200 dark:border-white/5 shadow-xl">
      <div class="bg-secondary/10 p-8 rounded-full w-fit mx-auto mb-6">
        <span class="material-symbols-outlined text-5xl sm:text-6xl text-secondary">folder_open</span>
      </div>
      <h3 class="text-lg sm:text-xl font-black text-slate-900 dark:text-white mb-2">Crie módulos primeiro</h3>
      <p class="text-slate-600 dark:text-gray-400 text-sm sm:text-base max-w-sm mx-auto px-4">
        Você precisa organizar sua grade curricular antes de fazer o upload de materiais.
      </p>
    </div>

    <!-- Materials List -->
    <div v-else-if="materials.length === 0" class="text-center py-16 sm:py-24 bg-white dark:bg-surface-dark rounded-[32px] border border-slate-200 dark:border-white/5 shadow-xl">
      <div class="bg-slate-100 dark:bg-white/5 p-8 rounded-full w-fit mx-auto mb-6">
        <span class="material-symbols-outlined text-5xl sm:text-6xl text-slate-400">description</span>
      </div>
      <h3 class="text-lg sm:text-xl font-black text-slate-900 dark:text-white mb-2">Nenhum material ainda</h3>
      <p class="text-slate-600 dark:text-gray-400 text-sm sm:text-base mb-6 max-w-sm mx-auto px-4">
        Comece enviando PDFs, slides ou apostilas para enriquecer suas aulas.
      </p>
      <button
        @click="openUploadModal"
        class="px-8 py-3 bg-secondary text-black font-black rounded-xl hover:bg-secondary/90 transition-all shadow-lg shadow-secondary/20 inline-flex items-center gap-2 text-xs sm:text-sm"
      >
        <span class="material-symbols-outlined text-lg">add_circle</span>
        Upload do Primeiro Material
      </button>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      <div
        v-for="material in materials"
        :key="material.id"
        class="group bg-white dark:bg-surface-dark rounded-2xl sm:rounded-[32px] border border-slate-200 dark:border-white/5 p-5 sm:p-6 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 hover:-translate-y-1 relative"
      >
        <div class="flex items-start justify-between mb-4 sm:mb-6">
          <div class="bg-red-500/10 p-3 sm:p-4 rounded-xl sm:rounded-2xl group-hover:scale-110 transition-transform duration-500">
            <span class="material-symbols-outlined text-2xl sm:text-3xl text-red-500">picture_as_pdf</span>
          </div>
          <button
            @click="confirmDelete(material)"
            class="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all scale-90 sm:scale-100"
            title="Excluir Material"
          >
            <span class="material-symbols-outlined text-xl">delete</span>
          </button>
        </div>

        <h4 class="text-sm sm:text-base font-black text-slate-900 dark:text-white mb-3 line-clamp-2 leading-tight">
          {{ getMaterialTitle(material) }}
        </h4>

        <div class="space-y-2 mb-6">
          <div class="flex items-center gap-2 text-[10px] sm:text-xs font-bold text-slate-500 dark:text-gray-400 bg-slate-50 dark:bg-black/20 p-2 rounded-lg">
             <span class="material-symbols-outlined text-sm text-secondary">folder_open</span>
             <span class="truncate">{{ getModuleName(material.module_id) }}</span>
          </div>
          <div class="flex items-center gap-2 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">
             <span class="material-symbols-outlined text-xs sm:text-sm">attachment</span>
             {{ formatFileSize(material.file_size_bytes) }}
          </div>
        </div>

        <button
          @click="downloadMaterial(material)"
          class="w-full py-2.5 sm:py-3.5 bg-slate-900 text-white dark:bg-white dark:text-black font-black rounded-xl sm:rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg text-xs sm:text-sm"
        >
          <span class="material-symbols-outlined text-lg sm:text-xl">download</span>
          Baixar Arquivo
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

const getModuleName = (moduleId: string | null) => {
  if (!moduleId) return 'Geral'
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
