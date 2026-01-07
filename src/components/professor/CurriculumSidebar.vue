<template>
  <div class="flex flex-col h-full bg-white dark:bg-surface-dark border-r border-slate-200 dark:border-white/5">
    <!-- Sidebar Header -->
    <div class="p-6 border-b border-slate-200 dark:border-white/5">
      <div class="flex items-center justify-between mb-2">
        <h3 class="text-sm font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest">Currículo</h3>
        <button 
          type="button"
          @click.prevent="$emit('add-module')" 
          class="p-1 hover:bg-secondary/10 rounded-md group transition-all"
          title="Novo Módulo"
        >
          <span class="material-symbols-outlined text-secondary group-hover:scale-110 transition-transform">add_box</span>
        </button>
      </div>
      <p class="text-xs text-slate-500 dark:text-gray-400 font-medium">Organize o conteúdo do curso</p>
    </div>

    <!-- Modules & Lessons List -->
    <div class="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
      <div v-if="modules.length === 0" class="py-12 text-center px-4">
        <span class="material-symbols-outlined text-slate-300 dark:text-gray-700 text-5xl mb-4">account_tree</span>
        <p class="text-sm font-bold text-slate-500 dark:text-gray-400">Nenhum módulo criado ainda.</p>
        <button 
          type="button"
          @click.prevent="$emit('add-module')" 
          class="mt-4 text-xs font-black text-secondary hover:underline"
        >
          + Criar Primeiro Módulo
        </button>
      </div>

      <div 
        v-for="(module, mIdx) in modules" 
        :key="module.id"
        class="space-y-2"
      >
        <!-- Module Item -->
        <div 
          @click="$emit('select-module', module)"
          :class="[
            'group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all',
            selectedId === module.id 
              ? 'bg-secondary/10 border border-secondary/20' 
              : 'hover:bg-slate-50 dark:hover:bg-white/5 border border-transparent'
          ]"
        >
          <div class="flex items-center gap-3 min-w-0">
            <span class="text-[10px] font-black text-slate-400 w-4">{{ mIdx + 1 }}</span>
            <span class="material-symbols-outlined text-slate-400 text-lg">folder</span>
            <span class="text-sm font-black text-slate-900 dark:text-white truncate">
              {{ getTitle(module) }}
            </span>
          </div>
          <button 
            type="button"
            @click.stop.prevent="$emit('add-lesson', module)" 
            class="hidden group-hover:flex p-1 hover:bg-secondary/20 rounded text-secondary"
            title="Nova Aula"
          >
            <span class="material-symbols-outlined text-sm">add</span>
          </button>
        </div>

        <!-- Lessons List -->
        <div class="ml-6 space-y-1 pl-2 border-l-2 border-slate-100 dark:border-white/5">
          <div 
            v-for="lesson in module.lessons" 
            :key="lesson.id"
            @click="$emit('select-lesson', lesson)"
            :class="[
              'flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all text-xs font-bold',
              selectedId === lesson.id 
                ? 'bg-slate-900 text-white dark:bg-white dark:text-black' 
                : 'text-slate-600 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-white/5'
            ]"
          >
            <div class="flex items-center gap-3 min-w-0">
              <span class="material-symbols-outlined text-sm opacity-60">play_circle</span>
              <span class="truncate">{{ getTitle(lesson) }}</span>
            </div>
            <span v-if="lesson.is_preview" class="text-[8px] font-black uppercase text-secondary px-1 border border-secondary/30 rounded">Preview</span>
          </div>
          
          <!-- Empty module spacer -->
          <div v-if="!module.lessons || module.lessons.length === 0" class="py-2 pl-6">
             <p class="text-[10px] text-slate-400 italic">Nenhuma aula</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useLocale } from '@/composables/useLocale'

const props = defineProps<{
  modules: any[]
  selectedId: string | null
}>()

defineEmits(['select-module', 'select-lesson', 'add-module', 'add-lesson'])

const { locale: currentLocale } = useLocale()

const getTitle = (item: any) => {
  return currentLocale.value === 'pt-BR' ? item.title_pt : item.title_en
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
