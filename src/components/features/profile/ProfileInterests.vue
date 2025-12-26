<template>
  <div class="bg-surface-dark/80 backdrop-blur rounded-2xl p-6 border border-input-border flex flex-col hover:border-primary/30 transition-colors duration-300">
    <h3 class="text-lg font-bold text-white mb-6 flex items-center gap-3">
      <div class="p-2 rounded-lg bg-primary/10 border border-primary/30">
        <span class="material-symbols-outlined text-primary">interests</span>
      </div>
      Interesses & Tags
    </h3>
    <p class="text-sm text-text-muted mb-4">Selecione tópicos para conectar com pessoas semelhantes.</p>
    <div class="flex flex-wrap gap-2 mb-4">
      <div
        v-for="(tag, index) in tags"
        :key="index"
        class="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/40 text-primary text-sm font-medium shadow-[0_0_8px_rgba(255,0,153,0.15)] hover:bg-primary/20 transition-colors cursor-pointer"
      >
        #{{ tag }}
        <button v-if="!readonly" @click="$emit('remove-tag', index)" class="hover:text-white ml-1">
          <span class="material-symbols-outlined text-[16px]">close</span>
        </button>
      </div>
    </div>
    
    <div v-if="tags.length === 0" class="text-sm text-text-muted italic py-2 mb-2">
      Nenhum interesse adicionado.
    </div>
    <div v-if="!readonly" class="mt-auto pt-2 group relative">
      <span class="absolute left-0 top-1/2 -translate-y-1/2 text-primary material-symbols-outlined text-[20px]">add</span>
      <input
        v-model="newTag"
        @keyup.enter="handleAddTag"
        type="text"
        placeholder="Adicionar nova tag"
        class="w-full bg-transparent border-0 border-b border-input-border focus:border-primary focus:ring-0 text-white placeholder-text-muted text-sm pl-7 py-2 transition-colors"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  tags: string[]
  readonly?: boolean
}>()

const emit = defineEmits<{
  (e: 'add-tag', value: string): void
  (e: 'remove-tag', index: number): void
}>()

const newTag = ref('')

function handleAddTag() {
  if (newTag.value.trim()) {
    emit('add-tag', newTag.value.trim().replace('#', ''))
    newTag.value = ''
  }
}
</script>
