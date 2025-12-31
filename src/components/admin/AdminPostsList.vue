<template>
  <div class="space-y-4">
    <!-- Filters and Search -->
    <div class="flex flex-col sm:flex-row gap-3 sm:gap-4">
      <!-- Search -->
      <div class="flex-1 relative">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span class="material-symbols-outlined text-slate-400 dark:text-white/40 text-lg">search</span>
        </div>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar por conteúdo ou autor..."
          class="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-white/10 rounded-lg bg-white dark:bg-[#0a040f] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-secondary focus:border-secondary focus:shadow-[0_0_15px_rgba(0,243,255,0.3)] transition-all text-sm sm:text-base"
        />
      </div>

      <!-- Status Filter -->
      <select
        v-model="statusFilter"
        class="px-4 py-2.5 border border-slate-200 dark:border-white/10 rounded-lg bg-white dark:bg-[#0a040f] text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-secondary focus:border-secondary focus:shadow-[0_0_15px_rgba(0,243,255,0.3)] transition-all text-sm sm:text-base"
      >
        <option value="">Todos os Status</option>
        <option value="approved">Aprovados</option>
        <option value="pending">Pendentes</option>
        <option value="removed">Removidos</option>
      </select>
    </div>

    <!-- Loading State -->
    <div v-if="loading && filteredPosts.length === 0" class="space-y-3">
      <div v-for="i in 5" :key="i" class="bg-white dark:bg-surface-card rounded-xl p-4 animate-pulse border border-slate-200 dark:border-white/5">
        <div class="flex items-start gap-4">
          <div class="w-12 h-12 bg-slate-200 dark:bg-gray-700 rounded-full"></div>
          <div class="flex-1">
            <div class="h-4 bg-slate-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
            <div class="h-3 bg-slate-200 dark:bg-gray-700 rounded w-full mb-2"></div>
            <div class="h-3 bg-slate-200 dark:bg-gray-700 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!loading && filteredPosts.length === 0" class="text-center py-12">
      <span class="material-symbols-outlined text-slate-400 dark:text-white/40 text-6xl mb-4">article</span>
      <p class="text-slate-600 dark:text-white/60 text-lg">Nenhum post encontrado</p>
      <p v-if="searchQuery || statusFilter" class="text-slate-500 dark:text-white/40 text-sm mt-2">
        Tente ajustar os filtros de busca
      </p>
    </div>

    <!-- Posts List -->
    <div v-else class="space-y-3">
      <div
        v-for="post in filteredPosts"
        :key="post.id"
        class="bg-white dark:bg-surface-card rounded-xl p-4 sm:p-6 border border-slate-200 dark:border-white/5 hover:border-secondary/50 dark:hover:border-white/10 transition-all shadow-lg dark:shadow-xl"
      >
        <div class="flex flex-col sm:flex-row gap-4">
          <!-- Post Info -->
          <div class="flex-1 min-w-0">
            <div class="flex items-start gap-3 mb-2">
              <Avatar
                :src="post.author?.avatar_url"
                :name="post.author?.nome || 'Usuário'"
                size="sm"
              />
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <h4 class="text-slate-900 dark:text-white font-semibold text-sm sm:text-base truncate">
                    {{ post.author?.nome || 'Usuário' }}
                  </h4>
                  <PostStatusBadge :status="post.status || 'pending'" />
                </div>
                <p class="text-slate-600 dark:text-white/60 text-xs sm:text-sm line-clamp-2 mb-2">
                  {{ stripHtml(post.conteudo) }}
                </p>
                <div class="flex items-center gap-4 text-slate-500 dark:text-white/50 text-xs">
                  <span class="flex items-center gap-1">
                    <span class="material-symbols-outlined text-sm">schedule</span>
                    {{ formattedDate(post.created_at) }}
                  </span>
                  <span class="flex items-center gap-1">
                    <span class="material-symbols-outlined text-sm">label</span>
                    {{ postTypeLabel(post.tipo) }}
                  </span>
                  <span v-if="post.likes_count" class="flex items-center gap-1">
                    <span class="material-symbols-outlined text-sm">favorite</span>
                    {{ post.likes_count }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <button
              v-if="post.status === 'pending'"
              class="p-2 text-green-400 hover:bg-green-500/20 rounded-lg transition-all"
              title="Aprovar"
              @click="$emit('approve', post.id)"
            >
              <span class="material-symbols-outlined text-base sm:text-lg">check_circle</span>
            </button>
            <button
              v-if="post.status !== 'removed'"
              class="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-all"
              title="Remover"
              @click="$emit('remove', post.id)"
            >
              <span class="material-symbols-outlined text-base sm:text-lg">delete</span>
            </button>
            <button
              class="p-2 text-slate-600 dark:text-white/60 hover:bg-slate-50 dark:hover:bg-white/10 rounded-lg transition-all"
              title="Ver Detalhes"
              @click="$emit('view-details', post.id)"
            >
              <span class="material-symbols-outlined text-base sm:text-lg">visibility</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { AdminPost, PostStatus } from '@/types/admin'
import Avatar from '@/components/ui/Avatar.vue'
import PostStatusBadge from '@/components/ui/PostStatusBadge.vue'

interface Props {
  posts: AdminPost[]
  loading: boolean
}

const props = defineProps<Props>()

defineEmits<{
  approve: [postId: string]
  remove: [postId: string]
  'view-details': [postId: string]
}>()

const searchQuery = ref('')
const statusFilter = ref<PostStatus | ''>('')

const filteredPosts = computed(() => {
  let filtered = [...props.posts]

  // Filter by status
  if (statusFilter.value) {
    filtered = filtered.filter(p => p.status === statusFilter.value)
  }

  // Filter by search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    filtered = filtered.filter(p => {
      const conteudo = (p.conteudo || '').toLowerCase()
      const authorName = (p.author?.nome || '').toLowerCase()
      return conteudo.includes(query) || authorName.includes(query)
    })
  }

  return filtered
})

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

function stripHtml(html: string) {
  if (!html) return ''
  return html.replace(/<[^>]*>/g, ' ')
}
</script>

