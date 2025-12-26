<template>
  <div v-if="post" class="bg-surface-card rounded-xl p-4 sm:p-6 border border-white/5">
    <!-- Header with Author -->
    <div class="flex items-start gap-4 mb-4 pb-4 border-b border-white/5">
      <Avatar
        :src="post.author?.avatar_url"
        :name="post.author?.nome || 'Usuário'"
        size="lg"
      />
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-3 mb-1">
          <h3 class="text-white text-lg sm:text-xl font-bold">
            {{ post.author?.nome || 'Usuário' }}
          </h3>
          <PostStatusBadge :status="post.status || 'pending'" />
        </div>
        <p v-if="post.author?.area_atuacao" class="text-white/60 text-sm mb-2">
          {{ post.author.area_atuacao }}
        </p>
        <div class="flex items-center gap-4 text-white/50 text-xs">
          <span class="flex items-center gap-1">
            <span class="material-symbols-outlined text-sm">schedule</span>
            {{ formattedDate(post.created_at) }}
          </span>
          <span class="flex items-center gap-1">
            <span class="material-symbols-outlined text-sm">label</span>
            {{ postTypeLabel(post.tipo) }}
          </span>
        </div>
        <RouterLink
          :to="`/comunidade/${post.user_id}`"
          class="text-primary hover:text-primary/80 text-sm font-semibold mt-2 inline-flex items-center gap-1"
        >
          Ver perfil do autor
          <span class="material-symbols-outlined text-base">arrow_forward</span>
        </RouterLink>
      </div>
    </div>

    <!-- Post Content -->
    <div class="mb-4">
      <p class="text-white/90 text-base sm:text-lg whitespace-pre-wrap mb-3">
        {{ post.conteudo }}
      </p>
      <div v-if="post.image_url" class="rounded-lg overflow-hidden mt-3">
        <img :src="post.image_url" alt="Post image" class="w-full h-auto max-h-96 object-contain" />
      </div>
    </div>

    <!-- Post Stats -->
    <div class="flex items-center gap-6 mb-4 pb-4 border-b border-white/5 text-white/60 text-sm">
      <div class="flex items-center gap-2">
        <span class="material-symbols-outlined text-base">favorite</span>
        <span>{{ post.likes_count || 0 }} curtidas</span>
      </div>
      <div class="flex items-center gap-2">
        <span class="material-symbols-outlined text-base">comment</span>
        <span>{{ post.comments_count || 0 }} comentários</span>
      </div>
      <div v-if="post.fixado" class="flex items-center gap-2 text-primary">
        <span class="material-symbols-outlined text-base">push_pin</span>
        <span>Fixado</span>
      </div>
    </div>

    <!-- Moderation Info -->
    <div v-if="post.approved_by || post.moderated_by" class="mb-4 pb-4 border-b border-white/5">
      <h4 class="text-white/80 text-sm font-semibold mb-2">Informações de Moderação</h4>
      <div class="space-y-2 text-white/60 text-xs sm:text-sm">
        <div v-if="post.approved_by && post.approved_at" class="flex items-center gap-2">
          <span class="material-symbols-outlined text-base text-green-400">check_circle</span>
          <span>Aprovado em {{ formattedDate(post.approved_at) }}</span>
        </div>
        <div v-if="post.moderated_by && post.moderated_at" class="flex items-center gap-2">
          <span class="material-symbols-outlined text-base text-orange-400">gavel</span>
          <span>Moderado em {{ formattedDate(post.moderated_at) }}</span>
        </div>
        <div v-if="post.rejection_reason" class="flex items-start gap-2">
          <span class="material-symbols-outlined text-base text-red-400">info</span>
          <span class="flex-1">Motivo: {{ post.rejection_reason }}</span>
        </div>
        <div v-if="post.strikes_added" class="flex items-center gap-2 text-orange-400">
          <span class="material-symbols-outlined text-base">warning</span>
          <span>Strike adicionado ao autor</span>
        </div>
      </div>
    </div>

    <!-- Comments Preview -->
    <div v-if="post.comments && post.comments.length > 0" class="mb-4">
      <h4 class="text-white/80 text-sm font-semibold mb-3">
        Comentários ({{ post.comments.length }})
      </h4>
      <div class="space-y-3 max-h-64 overflow-y-auto">
        <div
          v-for="comment in post.comments.slice(0, 5)"
          :key="comment.id"
          class="bg-surface-lighter rounded-lg p-3 border border-white/5"
        >
          <div class="flex items-start gap-3">
            <Avatar
              :src="comment.author?.avatar_url"
              :name="comment.author?.nome || 'Usuário'"
              size="sm"
            />
            <div class="flex-1 min-w-0">
              <p class="text-white font-semibold text-sm mb-1">
                {{ comment.author?.nome || 'Usuário' }}
              </p>
              <p class="text-white/80 text-sm">{{ comment.conteudo }}</p>
              <p class="text-white/50 text-xs mt-1">
                {{ formattedDate(comment.created_at) }}
              </p>
            </div>
          </div>
        </div>
        <p v-if="post.comments.length > 5" class="text-white/60 text-xs text-center">
          +{{ post.comments.length - 5 }} comentários adicionais
        </p>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex flex-wrap gap-3 pt-4 border-t border-white/5">
      <button
        v-if="post.status === 'pending'"
        class="flex items-center justify-center gap-2 px-4 py-2.5 bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 rounded-lg font-semibold transition-all text-sm"
        @click="$emit('approve', post.id)"
      >
        <span class="material-symbols-outlined text-base">check_circle</span>
        Aprovar
      </button>
      <button
        class="flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border border-orange-500/30 rounded-lg font-semibold transition-all text-sm"
        @click="$emit('hide', post.id)"
      >
        <span class="material-symbols-outlined text-base">visibility_off</span>
        Ocultar
      </button>
      <button
        class="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-lg font-semibold transition-all text-sm"
        @click="$emit('remove', post.id)"
      >
        <span class="material-symbols-outlined text-base">delete</span>
        Remover
      </button>
      <button
        class="flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border border-purple-500/30 rounded-lg font-semibold transition-all text-sm"
        @click="$emit('spam', post.id)"
      >
        <span class="material-symbols-outlined text-base">report</span>
        Marcar Spam
      </button>
    </div>
  </div>

  <div v-else class="text-center py-12">
    <span class="material-symbols-outlined text-white/40 text-6xl mb-4">article</span>
    <p class="text-white/60 text-lg">Post não encontrado</p>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import type { AdminPost } from '@/types/admin'
import Avatar from '@/components/ui/Avatar.vue'
import PostStatusBadge from '@/components/ui/PostStatusBadge.vue'

interface Props {
  post: AdminPost
}

defineProps<Props>()

defineEmits<{
  approve: [postId: string]
  hide: [postId: string]
  remove: [postId: string]
  spam: [postId: string]
}>()

function formattedDate(dateString?: string) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function postTypeLabel(tipo: string) {
  const labels: Record<string, string> = {
    networking: 'Networking',
    ofereco_servico: 'Ofereço Serviço',
    procuro_ajuda: 'Procuro Ajuda',
    oportunidade: 'Oportunidade',
  }
  return labels[tipo] || tipo
}
</script>

