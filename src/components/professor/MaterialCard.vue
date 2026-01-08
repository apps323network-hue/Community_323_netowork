<template>
  <div
    class="group bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-white/10 p-4 hover:border-primary/30 transition-all flex items-center justify-between"
  >
    <div class="flex items-center gap-3 min-w-0 flex-1">
      <div class="material-handle p-1 hover:bg-slate-100 dark:hover:bg-white/5 rounded cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity">
        <span class="material-symbols-outlined text-slate-400 text-sm">drag_indicator</span>
      </div>
      <div class="bg-red-500/10 p-2 rounded-lg shrink-0">
        <span class="material-symbols-outlined text-red-500 text-xl">picture_as_pdf</span>
      </div>
      <div class="min-w-0 flex-1">
        <p class="text-sm font-bold text-slate-900 dark:text-white truncate">{{ title }}</p>
        <p class="text-[10px] text-slate-500 font-medium">{{ fileSize }}</p>
      </div>
    </div>
    <div class="flex items-center gap-2 shrink-0">
      <button
        @click="$emit('download', material)"
        type="button"
        class="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
        title="Baixar"
      >
        <span class="material-symbols-outlined text-sm">download</span>
      </button>
      <button
        @click="$emit('delete', material)"
        type="button"
        class="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
        title="Excluir"
      >
        <span class="material-symbols-outlined text-sm">delete</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useLocale } from '@/composables/useLocale'
import type { ProgramMaterial } from '@/types/modules'

const props = defineProps<{
  material: ProgramMaterial
}>()

defineEmits(['download', 'delete'])

const { locale: currentLocale } = useLocale()

const title = computed(() => {
  return currentLocale.value === 'pt-BR' ? props.material.title_pt : props.material.title_en
})

const fileSize = computed(() => {
  if (!props.material.file_size_bytes) return 'N/A'
  const mb = props.material.file_size_bytes / (1024 * 1024)
  return `${mb.toFixed(2)} MB`
})
</script>
