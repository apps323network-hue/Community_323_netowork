<template>
  <div v-if="loading && posts.length === 0" class="space-y-4">
    <div v-for="i in 3" :key="i" class="bg-surface-card rounded-xl p-4 sm:p-6 animate-pulse border border-white/5">
      <div class="flex items-start gap-4">
        <div class="w-12 h-12 bg-gray-700 rounded-full"></div>
        <div class="flex-1">
          <div class="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
          <div class="h-3 bg-gray-700 rounded w-full mb-2"></div>
          <div class="h-3 bg-gray-700 rounded w-2/3"></div>
        </div>
      </div>
    </div>
  </div>

  <div v-else-if="!loading && posts.length === 0" class="text-center py-12">
    <span class="material-symbols-outlined text-white/40 text-6xl mb-4">article</span>
    <p class="text-white/60 text-lg">Nenhum post pendente</p>
    <p class="text-white/40 text-sm mt-2">Todos os posts foram processados</p>
  </div>

  <div v-else class="space-y-3 sm:space-y-4">
    <div
      v-for="post in posts"
      :key="post.id"
      class="bg-surface-card rounded-xl p-4 sm:p-6 border border-white/5 hover:border-white/10 transition-all"
    >
      <div class="flex flex-col gap-4">
        <!-- Author and Post Info -->
        <div class="flex items-start gap-4">
          <Avatar
            :src="post.author?.avatar_url"
            :name="post.author?.nome || 'Usuário'"
            size="md"
          />
          <div class="flex-1 min-w-0">
            <h3 class="text-white text-base sm:text-lg font-bold mb-1">
              {{ post.author?.nome || 'Usuário' }}
            </h3>
            <p v-if="post.author?.area_atuacao" class="text-white/60 text-xs sm:text-sm mb-2">
              {{ post.author.area_atuacao }}
            </p>
            <p class="text-white/80 text-sm sm:text-base line-clamp-3 mb-2">
              {{ post.conteudo }}
            </p>
            <div v-if="post.image_url" class="mt-2 rounded-lg overflow-hidden max-w-xs">
              <img :src="post.image_url" alt="Post image" class="w-full h-auto max-h-32 object-cover" />
            </div>
            <div class="flex items-center gap-4 mt-2 text-white/50 text-xs">
              <span class="flex items-center gap-1">
                <span class="material-symbols-outlined text-sm">schedule</span>
                {{ formattedDate(post.created_at) }}
              </span>
              <span class="flex items-center gap-1">
                <span class="material-symbols-outlined text-sm">label</span>
                {{ postTypeLabel(post.tipo) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex flex-wrap gap-2 sm:gap-3 pt-3 border-t border-white/5">
          <button
            class="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 rounded-lg font-semibold transition-all text-xs sm:text-sm"
            @click="$emit('approve', post.id)"
          >
            <span class="material-symbols-outlined text-base">check_circle</span>
            <span>Aprovar</span>
          </button>
          <button
            class="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border border-orange-500/30 rounded-lg font-semibold transition-all text-xs sm:text-sm"
            @click="$emit('hide', post.id)"
          >
            <span class="material-symbols-outlined text-base">visibility_off</span>
            <span>Ocultar</span>
          </button>
          <button
            class="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-lg font-semibold transition-all text-xs sm:text-sm"
            @click="$emit('remove', post.id)"
          >
            <span class="material-symbols-outlined text-base">delete</span>
            <span>Remover</span>
          </button>
          <button
            class="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border border-purple-500/30 rounded-lg font-semibold transition-all text-xs sm:text-sm"
            @click="$emit('spam', post.id)"
          >
            <span class="material-symbols-outlined text-base">report</span>
            <span>Spam</span>
          </button>
          <button
            class="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-surface-lighter hover:bg-surface-highlight text-white border border-white/10 rounded-lg font-semibold transition-all text-xs sm:text-sm"
            @click="$emit('view-full', post.id)"
          >
            <span class="material-symbols-outlined text-base">visibility</span>
            <span>Ver Completo</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AdminPost } from '@/types/admin'
import Avatar from '@/components/ui/Avatar.vue'

interface Props {
  posts: AdminPost[]
  loading: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  approve: [postId: string]
  hide: [postId: string]
  remove: [postId: string]
  spam: [postId: string]
  'view-full': [postId: string]
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

