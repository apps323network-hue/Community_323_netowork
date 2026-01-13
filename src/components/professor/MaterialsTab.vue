<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
      <div>
        <h2 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
          <span class="w-1.5 h-6 sm:h-8 bg-red-500 rounded-full"></span>
          Support Materials
        </h2>
        <p class="text-xs sm:text-sm text-slate-500 dark:text-gray-400 font-medium mt-1">Manage all support files and resources for this program</p>
      </div>
      <button
        type="button"
        @click.prevent="openUploadModal"
        :disabled="modules.length === 0"
        class="flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white dark:bg-white dark:text-black font-black rounded-xl hover:scale-105 active:scale-95 transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
      >
        <span class="material-symbols-outlined text-lg">upload_file</span>
        Upload Material
      </button>
    </div>

    <!-- No modules state -->
    <div v-if="modules.length === 0" class="text-center py-16 sm:py-24 bg-white dark:bg-surface-dark rounded-[32px] border border-slate-200 dark:border-white/5 shadow-xl">
      <div class="bg-secondary/10 p-8 rounded-full w-fit mx-auto mb-6">
        <span class="material-symbols-outlined text-5xl sm:text-6xl text-secondary">folder_open</span>
      </div>
      <h3 class="text-lg sm:text-xl font-black text-slate-900 dark:text-white mb-2">Create modules first</h3>
      <p class="text-slate-600 dark:text-gray-400 text-sm sm:text-base max-w-sm mx-auto px-4">
        You need to create at least one module before adding support materials.
      </p>
    </div>

    <!-- Hierarchical Materials List -->
    <div v-else-if="materials.length === 0" class="text-center py-16 sm:py-24 bg-white dark:bg-surface-dark rounded-[32px] border border-slate-200 dark:border-white/5 shadow-xl">
      <div class="bg-slate-100 dark:bg-white/5 p-8 rounded-full w-fit mx-auto mb-6">
        <span class="material-symbols-outlined text-5xl sm:text-6xl text-slate-400">description</span>
      </div>
      <h3 class="text-lg sm:text-xl font-black text-slate-900 dark:text-white mb-2">No materials yet</h3>
      <p class="text-slate-600 dark:text-gray-400 text-sm sm:text-base mb-6 max-w-sm mx-auto px-4">
        Upload PDF files, slides, or other resources to help your students.
      </p>
      <button
        type="button"
        @click.prevent="openUploadModal"
        class="px-8 py-3 bg-secondary text-black font-black rounded-xl hover:bg-secondary/90 transition-all shadow-lg shadow-secondary/20 inline-flex items-center gap-2 text-xs sm:text-sm"
      >
        <span class="material-symbols-outlined text-lg">add_circle</span>
        Upload First Material
      </button>
    </div>

    <!-- Hierarchical Accordion View -->
    <div v-else class="space-y-4">
      <!-- Module Groups -->
      <div
        v-for="module in modules"
        :key="module.id"
        class="bg-white dark:bg-surface-dark rounded-2xl border border-slate-200 dark:border-white/5 shadow-lg overflow-hidden"
      >
        <!-- Module Header -->
        <button
          type="button"
          @click.prevent="toggleModule(module.id)"
          class="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
        >
          <div class="flex items-center gap-4">
            <div class="bg-secondary/10 p-2 rounded-lg">
              <span class="material-symbols-outlined text-secondary">folder</span>
            </div>
            <div class="text-left">
              <h3 class="text-base font-black text-slate-900 dark:text-white">{{ getModuleTitle(module) }}</h3>
              <p class="text-xs text-slate-500 font-medium">{{ getModuleMaterialCount(module.id) }} materials</p>
            </div>
          </div>
          <span class="material-symbols-outlined text-slate-400 transition-transform" :class="{ 'rotate-180': expandedModules.includes(module.id) }">
            expand_more
          </span>
        </button>

        <!-- Module Content (Lessons + Materials) -->
        <div v-show="expandedModules.includes(module.id)" class="border-t border-slate-200 dark:border-white/10">
          <!-- Module-level materials -->
          <div class="p-4 bg-slate-50/50 dark:bg-black/10">
            <p class="text-xs font-black text-slate-500 uppercase tracking-wider mb-3 px-2">Module Materials</p>
            <draggable
              :model-value="getModuleLevelMaterials(module.id)"
              @update:model-value="(newList: ProgramMaterial[]) => handleMaterialUpdate(newList, module.id, null)"
              item-key="id"
              group="materials"
              handle=".material-handle"
              ghost-class="opacity-50"
              class="grid grid-cols-1 md:grid-cols-2 gap-3 min-h-[50px]"
            >
              <template #item="{ element: material }">
                <MaterialCard
                  :material="material"
                  @download="downloadMaterial"
                />
              </template>
            </draggable>
          </div>

          <!-- Lessons with materials -->
          <div class="divide-y divide-slate-200 dark:divide-white/5">
            <div
              v-for="lesson in getModuleLessons(module.id)"
              :key="lesson.id"
              class="p-4"
            >
              <div class="flex items-center gap-3 mb-3">
                <span class="material-symbols-outlined text-primary text-sm">play_circle</span>
                <h4 class="text-sm font-bold text-slate-700 dark:text-gray-300">{{ getLessonTitle(lesson) }}</h4>
                <span class="text-xs text-slate-400 font-medium">({{ getLessonMaterialCount(lesson.id) }})</span>
              </div>
              
              <draggable
                :model-value="getLessonMaterials(lesson.id)"
                @update:model-value="(newList: ProgramMaterial[]) => handleMaterialUpdate(newList, module.id, lesson.id)"
                item-key="id"
                group="materials"
                handle=".material-handle"
                ghost-class="opacity-50"
                class="grid grid-cols-1 md:grid-cols-2 gap-3 pl-6 min-h-[50px]"
              >
                <template #item="{ element: material }">
                  <MaterialCard
                    :material="material"
                    @download="downloadMaterial"
                  />
                </template>
                <template #footer>
                  <p v-if="getLessonMaterials(lesson.id).length === 0" class="text-xs text-slate-400 italic col-span-2">Drag and drop materials here or use the upload button</p>
                </template>
              </draggable>
            </div>
          </div>
        </div>
      </div>

      <!-- General materials (not attached to any module) -->
      <div v-if="getGeneralMaterials().length > 0" class="bg-white dark:bg-surface-dark rounded-2xl border border-slate-200 dark:border-white/5 shadow-lg p-6">
        <h3 class="text-base font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <span class="material-symbols-outlined text-slate-400">description</span>
          General Materials
        </h3>
        <draggable
          :model-value="getGeneralMaterials()"
          @update:model-value="(newList: ProgramMaterial[]) => handleMaterialUpdate(newList, null, null)"
          item-key="id"
          group="materials"
          handle=".material-handle"
          ghost-class="opacity-50"
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 min-h-[50px]"
        >
          <template #item="{ element: material }">
            <MaterialCard
              :material="material"
              @download="downloadMaterial"
            />
          </template>
        </draggable>
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
          <h3 class="text-xl font-black text-slate-900 dark:text-white">Add Material</h3>
          <button
            type="button"
            @click="closeModal"
            class="text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <div class="p-6 space-y-6">
          <!-- File Upload -->
          <div>
            <label class="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2">
              PDF File
            </label>
            <input
              type="file"
              accept=".pdf"
              @change="handleFileSelect"
              required
              class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black/40 text-slate-900 dark:text-white focus:ring-2 focus:ring-secondary outline-none transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-secondary/10 file:text-secondary hover:file:bg-secondary/20"
            />
            <p class="text-xs text-slate-500 dark:text-gray-400 mt-2">
              Maximum file size: 10MB
            </p>
          </div>

          <!-- Title PT -->
          <div>
            <label class="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2">
              Título (PT) *
            </label>
            <input
              v-model="formData.title_pt"
              type="text"
              required
              class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black/40 text-slate-900 dark:text-white focus:ring-2 focus:ring-secondary outline-none transition-all"
              :placeholder="'Título em português'"
            />
          </div>

          <!-- Title EN -->
          <div>
            <label class="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2">
              Title (EN) *
            </label>
            <input
              v-model="formData.title_en"
              type="text"
              required
              class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black/40 text-slate-900 dark:text-white focus:ring-2 focus:ring-secondary outline-none transition-all"
              :placeholder="'Title in English'"
            />
          </div>

          <!-- Module Selection -->
          <div>
            <label class="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2">
              Link to Module (Optional)
            </label>
            <select
              v-model="formData.module_id"
              @change="handleModuleChange"
              required
              class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black/40 text-slate-900 dark:text-white focus:ring-2 focus:ring-secondary outline-none transition-all"
            >
              <option value="">General Program Material (No Module)</option>
              <option v-for="module in modules" :key="module.id" :value="module.id">
                {{ getModuleTitle(module) }}
              </option>
            </select>
          </div>

          <!-- Lesson Selection (optional, shown when module is selected) -->
          <div v-if="formData.module_id">
            <label class="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2">
              Link to Lesson (Optional)
            </label>
            <select
              v-model="formData.lesson_id"
              class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black/40 text-slate-900 dark:text-white focus:ring-2 focus:ring-secondary outline-none transition-all"
            >
              <option value="">Module Specific Material (No Lesson)</option>
              <option v-for="lesson in getModuleLessons(formData.module_id)" :key="lesson.id" :value="lesson.id">
                {{ getLessonTitle(lesson) }}
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
              Cancel
            </button>
            <button
              type="button"
              @click="uploadMaterial"
              :disabled="modulesStore.loading || !selectedFile"
              class="px-6 py-3 bg-secondary text-black font-bold rounded-xl hover:bg-secondary/90 transition-all shadow-lg hover:shadow-secondary/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ modulesStore.loading ? 'Saving...' : 'Upload Material' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>


</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import draggable from 'vuedraggable'
import { useLocale } from '@/composables/useLocale'
import { useModulesStore } from '@/stores/modules'
import type { ProgramModule, ProgramMaterial } from '@/types/modules'
import MaterialCard from './MaterialCard.vue'

const props = defineProps<{
  programId: string
}>()

const { t, locale: currentLocale } = useLocale()
const modulesStore = useModulesStore()

const showModal = ref(false)
const selectedFile = ref<File | null>(null)
const expandedModules = ref<string[]>([])
const formData = ref({
  title_pt: '',
  title_en: '',
  module_id: '',
  lesson_id: ''
})

const modules = computed(() => modulesStore.getModulesByProgram(props.programId))
const materials = computed(() => modulesStore.materials)

const getModuleTitle = (module: ProgramModule) => {
  return currentLocale.value === 'pt-BR' ? module.title_pt : module.title_en
}

const getLessonTitle = (lesson: any) => {
  return currentLocale.value === 'pt-BR' ? lesson.title_pt : lesson.title_en
}

const getModuleLessons = (moduleId: string) => {
  const module = modules.value.find(m => m.id === moduleId)
  return module?.lessons || []
}

const getModuleLevelMaterials = (moduleId: string) => {
  return materials.value.filter(m => m.module_id === moduleId && !m.lesson_id)
}

const getLessonMaterials = (lessonId: string) => {
  return materials.value.filter(m => m.lesson_id === lessonId)
}

const getGeneralMaterials = () => {
  return materials.value.filter(m => !m.module_id && !m.lesson_id)
}

const getModuleMaterialCount = (moduleId: string) => {
  const moduleMaterials = getModuleLevelMaterials(moduleId).length
  const lessons = getModuleLessons(moduleId)
  const lessonMaterials = lessons.reduce((sum, lesson) => sum + getLessonMaterials(lesson.id).length, 0)
  return moduleMaterials + lessonMaterials
}

const getLessonMaterialCount = (lessonId: string) => {
  return getLessonMaterials(lessonId).length
}

function toggleModule(moduleId: string) {
  const index = expandedModules.value.indexOf(moduleId)
  if (index > -1) {
    expandedModules.value.splice(index, 1)
  } else {
    expandedModules.value.push(moduleId)
  }
}

function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    selectedFile.value = target.files[0]
  }
}

function handleModuleChange() {
  formData.value.lesson_id = ''
}

function openUploadModal() {
  formData.value = {
    title_pt: '',
    title_en: '',
    module_id: '',
    lesson_id: ''
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
      formData.value.lesson_id || null,
      formData.value.module_id || null,
      {
        ...formData.value,
        order_index: nextOrder
      }
    )
    closeModal()
    await modulesStore.fetchMaterials(props.programId)
  } catch (error) {
    console.error('Error uploading material:', error)
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
  }
}

async function handleMaterialUpdate(newList: ProgramMaterial[], moduleId: string | null, lessonId: string | null) {
  try {
    // Persist the new order immediately
    await modulesStore.updateMaterialsOrder(lessonId, moduleId, newList)
    console.log('Materials reordered successfully', { lessonId, moduleId, count: newList.length })
  } catch (error) {
    console.error('Error reordering materials:', error)
  }
}

onMounted(async () => {
  await modulesStore.fetchModulesWithLessons(props.programId)
  await modulesStore.fetchMaterials(props.programId)
  // Expand all modules by default
  expandedModules.value = modules.value.map(m => m.id)
})
</script>
