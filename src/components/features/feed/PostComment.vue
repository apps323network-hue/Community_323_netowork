<template>
  <div class="flex gap-3 py-3 border-b border-slate-200 dark:border-gray-800 last:border-0">
    <Avatar :src="authorAvatar" :name="authorName" size="sm" :border="false" />
    <div class="flex-1">
      <div class="flex items-start justify-between gap-2">
        <div>
          <span class="font-semibold text-sm text-gray-900 dark:text-white hover:text-primary dark:hover:text-secondary transition-colors cursor-pointer">
            {{ authorName }}
          </span>
          <span class="text-xs text-gray-400 ml-2">{{ formatTime(comment.created_at) }}</span>
        </div>
        <div class="flex gap-2">
          <button
            v-if="isOwnComment"
            class="text-gray-400 hover:text-secondary text-sm transition-colors"
            @click="emit('edit', comment.id)"
          >
            {{ t('common.edit') }}
          </button>
          <button
            v-if="isOwnComment"
            class="text-gray-400 hover:text-primary text-sm transition-colors"
            @click="emit('delete', comment.id)"
          >
            {{ t('common.delete') }}
          </button>
          <button
            v-if="!isOwnComment"
            class="text-gray-400 hover:text-orange-500 text-sm transition-colors"
            @click="handleReport"
          >
            {{ t('posts.report') }}
          </button>
        </div>
      </div>
      <p class="text-sm text-gray-900 dark:text-gray-300 mt-1 leading-relaxed">{{ comment.conteudo }}</p>
    </div>
  </div>

  <!-- Report Modal -->
  <ReportModal
    v-model="showReportModal"
    :item-type="'comment'"
    :item-id="comment.id"
    @reported="handleReportSubmitted"
  />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import Avatar from '@/components/ui/Avatar.vue'
import ReportModal from './ReportModal.vue'
import type { Comment } from '@/types/posts'

const { t, locale } = useI18n()

interface Props {
  comment: Comment
}

const props = defineProps<Props>()

const emit = defineEmits<{
  edit: [commentId: string]
  delete: [commentId: string]
}>()

const authStore = useAuthStore()
const showReportModal = ref(false)

const isOwnComment = computed(() => {
  return authStore.user?.id === props.comment.user_id
})

const authorName = computed(() => {
  const nome = props.comment.author?.nome
  return nome && nome.trim() ? nome : 'Usuário'
})
const authorAvatar = computed(() => {
  const avatar = props.comment.author?.avatar_url
  return avatar && avatar.trim() ? avatar : ''
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
</script>

