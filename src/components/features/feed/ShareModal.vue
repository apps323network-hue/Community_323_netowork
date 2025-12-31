<template>
  <Modal
    v-model="isOpen"
    :title="t('posts.sharePost')"
    size="md"
    :closable="true"
  >
    <div class="space-y-4">
      <!-- Post Preview -->
      <div class="p-4 rounded-lg bg-slate-50 dark:bg-surface-lighter border border-slate-200 dark:border-white/10">
        <div class="flex gap-3 mb-2">
          <div class="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex-shrink-0"></div>
          <div class="flex-1 min-w-0">
            <p class="font-semibold text-sm text-slate-900 dark:text-white truncate">
              {{ postAuthorName }}
            </p>
            <p class="text-xs text-slate-500 dark:text-slate-400 truncate">
              {{ postPreview }}
            </p>
          </div>
        </div>
      </div>

      <!-- Share Options -->
      <div class="grid grid-cols-2 gap-3">
        <!-- Copy Link -->
        <button
          @click="handleCopyLink"
          class="flex flex-col items-center gap-2 p-4 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark hover:bg-slate-50 dark:hover:bg-surface-lighter transition-all group"
        >
          <div class="w-12 h-12 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-slate-200 dark:group-hover:bg-white/10 transition-colors">
            <span class="material-icons-outlined text-slate-600 dark:text-slate-300">link</span>
          </div>
          <span class="text-sm font-medium text-slate-700 dark:text-white">{{ t('posts.copyLink') }}</span>
        </button>

        <!-- WhatsApp -->
        <button
          @click="handleShareWhatsApp"
          class="flex flex-col items-center gap-2 p-4 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark hover:bg-slate-50 dark:hover:bg-surface-lighter transition-all group"
        >
          <div class="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center group-hover:bg-green-200 dark:group-hover:bg-green-900/30 transition-colors">
            <span class="material-icons-outlined text-green-600 dark:text-green-400">chat</span>
          </div>
          <span class="text-sm font-medium text-slate-700 dark:text-white">WhatsApp</span>
        </button>

        <!-- LinkedIn -->
        <button
          @click="handleShareLinkedIn"
          class="flex flex-col items-center gap-2 p-4 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark hover:bg-slate-50 dark:hover:bg-surface-lighter transition-all group"
        >
          <div class="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-900/30 transition-colors">
            <span class="material-icons-outlined text-blue-600 dark:text-blue-400">work</span>
          </div>
          <span class="text-sm font-medium text-slate-700 dark:text-white">LinkedIn</span>
        </button>

        <!-- Email -->
        <button
          @click="handleShareEmail"
          class="flex flex-col items-center gap-2 p-4 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark hover:bg-slate-50 dark:hover:bg-surface-lighter transition-all group"
        >
          <div class="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center group-hover:bg-red-200 dark:group-hover:bg-red-900/30 transition-colors">
            <span class="material-icons-outlined text-red-600 dark:text-red-400">email</span>
          </div>
          <span class="text-sm font-medium text-slate-700 dark:text-white">{{ t('common.email') }}</span>
        </button>
      </div>

      <!-- Success Message -->
      <div
        v-if="copied"
        class="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 flex items-center gap-2"
      >
        <span class="material-icons-outlined text-green-600 dark:text-green-400">check_circle</span>
        <span class="text-sm text-green-800 dark:text-green-200">{{ t('posts.linkCopied') }}</span>
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import Modal from '@/components/ui/Modal.vue'
import { toast } from 'vue-sonner'
import {
  getPostShareUrl,
  copyToClipboard,
  getWhatsAppShareUrl,
  getLinkedInShareUrl,
  getEmailShareUrl,
} from '@/lib/shareUtils'
import type { Post } from '@/types/posts'

interface Props {
  modelValue: boolean
  post: Post | null
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const { t } = useI18n()

const copied = ref(false)

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const postUrl = computed(() => {
  if (!props.post) return ''
  return getPostShareUrl(props.post.id)
})

const postAuthorName = computed(() => {
  return props.post?.author?.nome || 'Usuário'
})

const postPreview = computed(() => {
  if (!props.post) return ''
  const content = props.post.conteudo
  return content.length > 100 ? content.substring(0, 100) + '...' : content
})

async function handleCopyLink() {
  if (!props.post) return

  const success = await copyToClipboard(postUrl.value)
  if (success) {
    copied.value = true
    toast.success(t('posts.linkCopied') || 'Link copiado!')
    setTimeout(() => {
      copied.value = false
    }, 3000)
  } else {
    toast.error(t('posts.copyError') || 'Erro ao copiar link')
  }
}

function handleShareWhatsApp() {
  if (!props.post) return

  const shareText = t('posts.shareText') || 'Confira este post na 323 Network'
  const url = getWhatsAppShareUrl(shareText, postUrl.value)
  window.open(url, '_blank')
  isOpen.value = false
}

function handleShareLinkedIn() {
  if (!props.post) return

  const url = getLinkedInShareUrl(postUrl.value)
  window.open(url, '_blank')
  isOpen.value = false
}

function handleShareEmail() {
  if (!props.post) return

  const subject = t('posts.shareEmailSubject') || 'Confira este post na 323 Network'
  const body = `${t('posts.shareEmailBody') || 'Confira este post:'}\n\n${postUrl.value}`
  const url = getEmailShareUrl(subject, body)
  window.location.href = url
  isOpen.value = false
}
</script>

