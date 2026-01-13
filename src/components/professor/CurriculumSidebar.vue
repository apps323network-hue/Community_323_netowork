<template>
  <div class="flex flex-col h-full bg-white dark:bg-surface-dark border-r border-slate-200 dark:border-white/5">
    <!-- Sidebar Header -->
    <div class="p-6 border-b border-slate-200 dark:border-white/5">
      <div class="flex items-center justify-between mb-2">
        <h3 class="text-sm font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest">Content Structure</h3>
        <button 
          type="button"
          @click.prevent="$emit('add-module')" 
          class="p-1 hover:bg-secondary/10 rounded-md group transition-all"
          :title="'New Module'"
        >
          <span class="material-symbols-outlined text-secondary group-hover:scale-110 transition-transform">add_box</span>
        </button>
      </div>
      <p class="text-xs text-slate-500 dark:text-gray-400 font-medium">Manage modules and lessons</p>
    </div>

    <!-- Modules & Lessons List -->
    <div class="flex-1 overflow-y-auto p-4 custom-scrollbar">
      <div v-if="modules.length === 0" class="py-12 text-center px-4">
        <span class="material-symbols-outlined text-slate-300 dark:text-gray-700 text-5xl mb-4">account_tree</span>
        <p class="text-sm font-bold text-slate-500 dark:text-gray-400">Empty Curriculum</p>
        <button 
          type="button"
          @click.prevent="$emit('add-module')" 
          class="mt-4 text-xs font-black text-secondary hover:underline"
        >
          Create First Module
        </button>
      </div>

      <draggable 
        v-model="localModules"
        item-key="id"
        handle=".module-handle"
        @change="handleModuleReorder"
        class="space-y-4"
      >
        <template #item="{ element: module, index: mIdx }">
          <div class="space-y-2">
            <!-- Module Item -->
            <div 
              @click="toggleModule(module.id)"
              :class="[
                'group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all',
                selectedId === module.id 
                  ? 'bg-secondary/10 border border-secondary/20' 
                  : 'hover:bg-slate-50 dark:hover:bg-white/5 border border-transparent'
              ]"
            >
              <div class="flex items-center gap-3 min-w-0">
                <div class="module-handle p-1 hover:bg-slate-200 dark:hover:bg-white/10 rounded cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity">
                  <span class="material-symbols-outlined text-slate-400 text-sm">drag_indicator</span>
                </div>
                <span class="text-[10px] font-black text-slate-400 w-4">{{ mIdx + 1 }}</span>
                <span class="material-symbols-outlined text-slate-400 text-lg transition-transform" :class="{ 'rotate-0': isModuleExpanded(module.id), '-rotate-90': !isModuleExpanded(module.id) }">
                  {{ isModuleExpanded(module.id) ? 'folder_open' : 'folder' }}
                </span>
                <span class="text-sm font-black text-slate-900 dark:text-white truncate">
                  {{ getTitle(module) }}
                </span>
              </div>
              <div class="flex items-center gap-1">
                <button 
                  type="button"
                  @click.stop.prevent="$emit('add-lesson', module)" 
                  class="hidden group-hover:flex p-1 hover:bg-secondary/20 rounded text-secondary"
                  :title="'New Lesson'"
                >
                  <span class="material-symbols-outlined text-sm">add</span>
                </button>
                <button 
                  type="button"
                  @click.stop.prevent="$emit('select-module', module)" 
                  class="p-1 hover:bg-slate-200 dark:hover:bg-white/10 rounded text-slate-400"
                  :title="'Edit Module'"
                >
                  <span class="material-symbols-outlined text-sm">settings</span>
                </button>
              </div>
            </div>

            <!-- Lessons List with Slide Animation -->
            <Transition
              enter-active-class="transition-all duration-300 ease-out"
              leave-active-class="transition-all duration-200 ease-in"
              enter-from-class="max-h-0 opacity-0 overflow-hidden"
              enter-to-class="max-h-[1000px] opacity-100 overflow-hidden"
              leave-from-class="max-h-[1000px] opacity-100 overflow-hidden"
              leave-to-class="max-h-0 opacity-0 overflow-hidden"
            >
            <div v-show="isModuleExpanded(module.id)" class="ml-6 space-y-1 pl-2 border-l-2 border-slate-100 dark:border-white/5">
              <draggable
                :list="module.lessons || []"
                item-key="id"
                group="lessons"
                handle=".lesson-handle"
                @change="(ev: any) => handleLessonReorder(ev, module.id)"
                ghost-class="opacity-50"
              >
                <template #item="{ element: lesson }">
                  <div 
                    @click="$emit('select-lesson', lesson)"
                    :class="[
                      'group/lesson flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all text-xs font-bold',
                      selectedId === lesson.id 
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-black' 
                        : 'text-slate-600 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-white/5'
                    ]"
                  >
                    <div class="flex items-center gap-3 min-w-0">
                      <div class="lesson-handle p-0.5 hover:bg-slate-200 dark:hover:bg-gray-700 rounded cursor-grab opacity-0 group-hover/lesson:opacity-100 transition-opacity">
                        <span class="material-symbols-outlined text-[14px]">drag_indicator</span>
                      </div>
                      <span class="material-symbols-outlined text-sm opacity-60">play_circle</span>
                      <span class="truncate">{{ getTitle(lesson) }}</span>
                    </div>
                    <span v-if="lesson.is_preview" class="text-[8px] font-black uppercase text-secondary px-1 border border-secondary/30 rounded">Free Preview</span>
                  </div>
                </template>
              </draggable>
              
              <!-- Empty module spacer -->
              <div v-if="!module.lessons || module.lessons.length === 0" class="py-2 pl-6">
                 <p class="text-[10px] text-slate-400 italic">No lessons in this module</p>
              </div>
            </div>
            </Transition>
          </div>
        </template>
      </draggable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useLocale } from '@/composables/useLocale'
import draggable from 'vuedraggable'
import { useModulesStore } from '@/stores/modules'

const props = defineProps<{
  modules: any[]
  selectedId: string | null
}>()

const emit = defineEmits(['select-module', 'select-lesson', 'add-module', 'add-lesson'])

const { locale: currentLocale } = useLocale()
const modulesStore = useModulesStore()

// Local copy for draggable
const localModules = ref([...props.modules])
const expandedModules = ref<string[]>([])

// Sync local copy when props change
watch(() => props.modules, (newVal) => {
  localModules.value = [...newVal]
  // Auto-expand new modules
  newVal.forEach(m => {
    if (!expandedModules.value.includes(m.id)) {
      expandedModules.value.push(m.id)
    }
  })
}, { deep: true, immediate: true })

const getTitle = (item: any) => {
  return currentLocale.value === 'pt-BR' ? item.title_pt : item.title_en
}

const isModuleExpanded = (moduleId: string) => expandedModules.value.includes(moduleId)

const toggleModule = (moduleId: string) => {
  const index = expandedModules.value.indexOf(moduleId)
  if (index > -1) {
    expandedModules.value.splice(index, 1)
  } else {
    expandedModules.value.push(moduleId)
  }
}

const handleModuleReorder = async () => {
  if (localModules.value.length === 0) return
  const programId = localModules.value[0]?.program_id
  if (programId) {
    try {
      await modulesStore.updateModulesOrder(programId, localModules.value)
      console.log('Modules reordered successfully')
    } catch (error) {
      console.error('Error reordering modules:', error)
    }
  }
}

const handleLessonReorder = async (event: any, moduleId: string) => {
  if (event.added || event.moved) {
    const updatedModule = localModules.value.find(m => m.id === moduleId)
    if (updatedModule && updatedModule.lessons) {
      try {
        await modulesStore.updateLessonsOrder(moduleId, updatedModule.lessons)
        console.log('Lessons reordered successfully')
      } catch (error) {
        console.error('Error reordering lessons:', error)
      }
    }
  }
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(0,0,0,0.1);
  border-radius: 10px;
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.05);
}
</style>
