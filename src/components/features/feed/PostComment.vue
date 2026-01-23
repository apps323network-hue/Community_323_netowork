<template>
  <div class="flex gap-3 py-3 border-b border-slate-200 dark:border-gray-800 last:border-0">
    <Avatar :src="authorAvatar" :name="authorName" size="sm" :border="false" />
    <div class="flex-1">
      <div class="flex items-start justify-between gap-2">
        <div>
          <div class="flex items-center gap-2">
            <span class="font-semibold text-sm text-gray-900 dark:text-white hover:text-primary dark:hover:text-secondary transition-colors cursor-pointer">
              {{ authorName }}
            </span>
            <Badge 
              v-if="comment.edited_at" 
              variant="secondary" 
              size="sm"
            >
              <span class="material-icons-outlined text-[8px] mr-1">edit</span>
              {{ t('posts.edited') }}
            </Badge>
          </div>
          <span class="text-xs text-gray-400">{{ formatTime(comment.created_at) }}</span>
        </div>
        <div class="flex gap-2">
          <button
            v-if="isOwnComment && canEditComment"
            class="text-gray-400 hover:text-primary dark:hover:text-secondary transition-colors p-1 rounded-full hover:bg-slate-100 dark:hover:bg-white/5"
            @click="handleEdit"
            :title="t('posts.editComment')"
          >
            <span class="material-icons-outlined text-[18px]">edit</span>
          </button>
          <button
            v-if="isOwnComment"
            class="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-500/10"
            @click="handleDelete"
            :title="t('common.delete')"
          >
            <span class="material-icons-outlined text-[18px]">delete</span>
          </button>
          <button
            v-if="!isOwnComment"
            class="text-gray-400 hover:text-orange-500 transition-colors p-1 rounded-full hover:bg-orange-50 dark:hover:bg-orange-500/10"
            @click="handleReport"
            :title="t('posts.report')"
          >
            <span class="material-icons-outlined text-[18px]">flag</span>
          </button>
        </div>
      </div>
      <p 
        class="text-sm text-gray-900 dark:text-gray-300 mt-1 leading-relaxed"
        v-html="formattedCommentContent"
      ></p>
    </div>
  </div>

  <!-- Report Modal -->
  <ReportModal
    v-model="showReportModal"
    :item-type="'comment'"
    :item-id="comment.id"
    @reported="handleReportSubmitted"
  />

  <!-- Edit Comment Modal -->
  <EditCommentModal
    v-model="showEditModal"
    :comment="comment"
    @saved="handleEditSaved"
  />

  <!-- Delete Confirmation Modal -->
  <Modal v-model="showDeleteConfirm" :title="t('posts.deleteCommentTitle')" size="sm">
    <div class="space-y-4">
      <p class="text-sm text-slate-600 dark:text-slate-300">
        {{ t('posts.deleteCommentConfirm') }}
      </p>
      <div class="flex justify-end gap-3 pt-2">
        <Button
          variant="ghost"
          size="sm"
          @click="showDeleteConfirm = false"
        >
          {{ t('common.cancel') }}
        </Button>
        <Button
          variant="primary"
          size="sm"
          class="!bg-red-500 hover:!bg-red-600 !text-white !border-red-500"
          @click="confirmDelete"
        >
          {{ t('common.delete') }}
        </Button>
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import Avatar from '@/components/ui/Avatar.vue'
import Badge from '@/components/ui/Badge.vue'
import Modal from '@/components/ui/Modal.vue'
import Button from '@/components/ui/Button.vue'
import ReportModal from './ReportModal.vue'
import EditCommentModal from './EditCommentModal.vue'
import { formatMentions } from '@/lib/mentionParser'
import { formatHashtags } from '@/lib/hashtagParser'
import type { Comment } from '@/types/posts'

const { t, locale } = useI18n()

interface Props {
  comment: Comment
}

const props = defineProps<Props>()

const emit = defineEmits<{
  delete: [commentId: string]
}>()

const authStore = useAuthStore()
const showReportModal = ref(false)
const showEditModal = ref(false)
const showDeleteConfirm = ref(false)

const isOwnComment = computed(() => {
  return authStore.user?.id === props.comment.user_id
})

// Verificar se o comentário ainda pode ser editado (dentro de 5 minutos)
const canEditComment = computed(() => {
  if (!isOwnComment.value) return false
  
  const createdAt = new Date(props.comment.created_at).getTime()
  const now = Date.now()
  const timeDiff = now - createdAt
  const fiveMinutes = 5 * 60 * 1000
  
  return timeDiff <= fiveMinutes
})

const authorName = computed(() => {
  const nome = props.comment.author?.nome
  return nome && nome.trim() ? nome : 'Usuário'
})
const authorAvatar = computed(() => {
  const avatar = props.comment.author?.avatar_url
  return avatar && avatar.trim() ? avatar : ''
})

const formattedCommentContent = computed(() => {
  let content = formatMentions(props.comment.conteudo, '/comunidade')
  content = formatHashtags(content, '/hashtag')
  return content
})

function formatTime(date: string) {
  const now = new Date()
  const commentDate = new Date(date)
  const diffInSeconds = Math.floor((now.getTime() - commentDate.getTime()) / 1000)

  if (diffInSeconds < 60) return t('common.now')
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}${t('common.minutesAgo')}`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}${t('common.hoursAgo')}`
  return commentDate.toLocaleDateString(locale.value)
}

function handleReport() {
  showReportModal.value = true
}

function handleReportSubmitted() {
  showReportModal.value = false
}

function handleEdit() {
  showEditModal.value = true
}

function handleEditSaved() {
  showEditModal.value = false
  // Comment will be updated in store automatically
}

function handleDelete() {
  showDeleteConfirm.value = true
}

function confirmDelete() {
  emit('delete', props.comment.id)
  showDeleteConfirm.value = false
}
</script>

