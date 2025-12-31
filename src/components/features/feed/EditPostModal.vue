<template>
  <Modal
    v-model="isOpen"
    :title="t('posts.editPost')"
    size="md"
    :closable="true"
  >
    <div class="space-y-4">
      <!-- Info Message -->
      <div class="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
        <p class="text-sm text-blue-800 dark:text-blue-200">
          <span class="material-icons-outlined text-base align-middle mr-1">info</span>
          {{ t('posts.editTimeLimit') }}
        </p>
      </div>

      <!-- Content Textarea -->
      <div>
        <label class="block text-sm font-medium text-slate-700 dark:text-white mb-2">
          {{ t('posts.content') }}
        </label>
        <textarea
          v-model="content"
          rows="6"
          class="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0a040f] p-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-secondary focus:ring-1 focus:ring-secondary focus:shadow-[0_0_15px_rgba(0,243,255,0.3)] outline-none transition-all resize-none"
          :placeholder="t('posts.editPlaceholder')"
        ></textarea>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
        <p class="text-sm text-red-800 dark:text-red-200">{{ error }}</p>
      </div>
    </div>

    <template #footer>
      <div class="flex gap-3 justify-end">
        <button
          type="button"
          @click="handleCancel"
          class="px-4 py-2 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 rounded-lg text-slate-700 dark:text-white font-medium transition-all"
        >
          {{ t('common.cancel') }}
        </button>
        <button
          type="button"
          @click="handleSave"
          :disabled="!content.trim() || loading"
          class="px-4 py-2 bg-gradient-to-r from-primary to-secondary text-black font-bold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ loading ? t('common.saving') : t('common.save') }}
        </button>
      </div>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import Modal from '@/components/ui/Modal.vue'
import { usePosts } from '@/composables/usePosts'
import { toast } from 'vue-sonner'
import type { Post } from '@/types/posts'

interface Props {
  modelValue: boolean
  post: Post | null
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'saved'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const { t } = useI18n()
const { editPost } = usePosts()

const content = ref('')
const loading = ref(false)
const error = ref<string | null>(null)

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

function canEdit() {
  if (!props.post) return false

  const createdAt = new Date(props.post.created_at).getTime()
  const now = Date.now()
  const timeDiff = now - createdAt
  const fiveMinutes = 5 * 60 * 1000

  return timeDiff <= fiveMinutes
}

watch(() => props.modelValue, (newVal) => {
  if (newVal && props.post) {
    // Verificar se ainda pode editar antes de abrir o modal
    if (!canEdit()) {
      // Se o tempo já expirou, fechar o modal imediatamente
      isOpen.value = false
      toast.error(t('posts.editTimeExpired') || 'O tempo para editar expirou')
      return
    }
    
    content.value = props.post.conteudo
    error.value = null
  } else {
    content.value = ''
    error.value = null
  }
})

async function handleSave() {
  if (!props.post || !content.value.trim() || loading.value) return

  if (!canEdit()) {
    error.value = t('posts.editTimeExpired')
    return
  }

  loading.value = true
  error.value = null

  try {
    await editPost(props.post.id, content.value.trim())
    toast.success(t('posts.postEdited') || 'Post editado com sucesso!')
    emit('saved')
    isOpen.value = false
  } catch (err: any) {
    error.value = err.message || t('posts.editError') || 'Erro ao editar post'
    console.error('Error editing post:', err)
  } finally {
    loading.value = false
  }
}

function handleCancel() {
  isOpen.value = false
}
</script>

