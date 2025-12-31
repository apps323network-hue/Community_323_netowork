<template>
  <div class="space-y-4">
    <div>
      <label class="block text-sm font-medium text-slate-700 dark:text-white mb-2">Título *</label>
      <input
        v-model="formData.titulo"
        type="text"
        required
        class="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0a040f] p-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-secondary focus:ring-1 focus:ring-secondary focus:shadow-[0_0_15px_rgba(0,243,255,0.3)] outline-none transition-all"
        placeholder="Nome do evento..."
        @input="$emit('update:formData', { ...formData })"
      />
    </div>

    <div>
      <label class="block text-sm font-medium text-slate-700 dark:text-white mb-2">Descrição</label>
      <textarea
        v-model="formData.descricao"
        rows="4"
        class="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0a040f] p-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-secondary focus:ring-1 focus:ring-secondary focus:shadow-[0_0_15px_rgba(0,243,255,0.3)] outline-none transition-all"
        placeholder="Descrição do evento..."
        @input="$emit('update:formData', { ...formData })"
      ></textarea>
    </div>

    <div>
      <label class="block text-sm font-medium text-slate-700 dark:text-white mb-2">Tipo *</label>
      <select
        v-model="formData.tipo"
        required
        class="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0a040f] p-3 text-slate-900 dark:text-white focus:border-secondary focus:ring-1 focus:ring-secondary focus:shadow-[0_0_15px_rgba(0,243,255,0.3)] outline-none transition-all"
        @change="$emit('update:formData', { ...formData })"
      >
        <option value="">Selecione...</option>
        <option value="presencial">Presencial</option>
        <option value="webinar">Webinar</option>
      </select>
    </div>
  </div>
</template>

<script setup lang="ts">
interface EventFormData {
  titulo: string
  descricao: string
  tipo: string
  local: string
  image_url: string
  status: string
}

interface Props {
  formData: EventFormData
}

interface Emits {
  (e: 'update:formData', data: EventFormData): void
}

defineProps<Props>()
defineEmits<Emits>()
</script>

