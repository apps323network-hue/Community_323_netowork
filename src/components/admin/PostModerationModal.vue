<template>
  <Modal v-model="isOpen" title="Moderar Post" size="lg">
    <div class="space-y-6">
      <!-- Post Preview -->
      <div class="bg-surface-card rounded-lg p-4 border border-white/5">
        <div class="flex items-start gap-3 mb-3">
          <div v-if="post?.author?.avatar_url" class="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
            <img :src="post.author.avatar_url" :alt="post.author.nome" class="w-full h-full object-cover" />
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="text-white font-bold text-sm">{{ post?.author?.nome || 'Usuário' }}</h3>
            <p class="text-white/60 text-xs">{{ post?.author?.area_atuacao || '' }}</p>
          </div>
        </div>
        <p class="text-white/80 text-sm line-clamp-3">{{ post?.conteudo || '' }}</p>
        <div
          v-if="post?.image_url"
          class="mt-3 rounded-lg overflow-hidden cursor-pointer group relative"
          @click="showImageLightbox = true"
        >
          <img
            :src="post.image_url"
            alt="Post image"
            class="w-full h-auto max-h-40 object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <!-- Zoom Icon Overlay -->
          <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
            <div class="bg-black/50 backdrop-blur-sm rounded-full p-2">
              <span class="material-symbols-outlined text-white text-lg">zoom_in</span>
            </div>
          </div>
        </div>

        <!-- Image Lightbox -->
        <ImageLightbox
          v-model="showImageLightbox"
          :image-url="post?.image_url"
          :alt="`Imagem do post de ${post?.author?.nome || 'Usuário'}`"
        />
      </div>

      <!-- Action Selection -->
      <div>
        <label class="block text-white/80 text-sm font-semibold mb-3">Ação</label>
        <div class="grid grid-cols-2 gap-3">
          <button
            :class="[
              'flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all text-sm',
              action === 'approve'
                ? 'bg-green-500/20 text-green-400 border-2 border-green-500'
                : 'bg-surface-card text-white/60 border border-white/10 hover:border-green-500/30',
            ]"
            @click="action = 'approve'"
          >
            <span class="material-symbols-outlined text-lg">check_circle</span>
            Aprovar
          </button>
          <button
            :class="[
              'flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all text-sm',
              action === 'remove'
                ? 'bg-red-500/20 text-red-400 border-2 border-red-500'
                : 'bg-surface-card text-white/60 border border-white/10 hover:border-red-500/30',
            ]"
            @click="action = 'remove'"
          >
            <span class="material-symbols-outlined text-lg">delete</span>
            Remover
          </button>
        </div>
      </div>

      <!-- Reason (required for remove) -->
      <div v-if="action === 'remove'">
        <label class="block text-white/80 text-sm font-semibold mb-2">
          Motivo <span class="text-red-400">*</span>
        </label>
        <textarea
          v-model="reason"
          rows="3"
          class="w-full px-3 py-2 border border-white/10 rounded-lg bg-surface-card text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-sm"
          placeholder="Por que este post deve ser removido?"
        ></textarea>
      </div>

      <!-- Warning for destructive actions -->
      <div v-if="action === 'remove'" class="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
        <div class="flex items-start gap-2">
          <span class="material-symbols-outlined text-red-400 text-lg">warning</span>
          <div class="flex-1">
            <p class="text-red-400 text-sm font-semibold">Ação Destrutiva</p>
            <p class="text-red-400/80 text-xs mt-1">
              Remover o post é uma ação permanente e não pode ser desfeita.
            </p>
          </div>
        </div>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
        <p class="text-red-400 text-sm">{{ error }}</p>
      </div>
    </div>

    <template #footer>
      <div class="flex gap-3">
        <Button variant="outline" @click="handleCancel">Cancelar</Button>
        <Button
          variant="primary"
          :disabled="!canSubmit || processing"
          @click="handleSubmit"
        >
          <span v-if="processing" class="animate-spin">⏳</span>
          <span v-else>{{ actionLabel }}</span>
        </Button>
      </div>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { AdminPost } from '@/types/admin'
import Modal from '@/components/ui/Modal.vue'
import Button from '@/components/ui/Button.vue'
import ImageLightbox from '@/components/ui/ImageLightbox.vue'

interface Props {
  modelValue: boolean
  post: AdminPost | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  approve: [postId: string]
  remove: [postId: string, reason: string]
}>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const action = ref<'approve' | 'remove'>('approve')
const reason = ref('')
const error = ref<string | null>(null)
const processing = ref(false)
const showImageLightbox = ref(false)

const canSubmit = computed(() => {
  if (action.value === 'remove') {
    return reason.value.trim().length > 0
  }
  return true
})

const actionLabel = computed(() => {
  switch (action.value) {
    case 'approve':
      return 'Aprovar'
    case 'remove':
      return 'Remover'
    default:
      return 'Confirmar'
  }
})

watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    // Reset form when modal opens
    action.value = 'approve'
    reason.value = ''
    error.value = null
    processing.value = false
  }
})

function handleCancel() {
  isOpen.value = false
}

async function handleSubmit() {
  if (!props.post) return

  if (action.value === 'remove' && !reason.value.trim()) {
    error.value = 'Por favor, informe o motivo'
    return
  }

  processing.value = true
  error.value = null

  try {
    switch (action.value) {
      case 'approve':
        emit('approve', props.post.id)
        break
      case 'remove':
        emit('remove', props.post.id, reason.value.trim())
        break
    }
    isOpen.value = false
  } catch (err: any) {
    error.value = err.message || 'Erro ao processar ação. Tente novamente.'
  } finally {
    processing.value = false
  }
}
</script>

