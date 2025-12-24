<template>
  <div>
    <!-- Grid View -->
    <div
      v-if="viewMode === 'grid'"
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
    >
      <MemberCard
        v-for="member in members"
        :key="member.id"
        :member="member"
        variant="featured"
        @view-profile="$emit('view-profile', $event)"
      />
    </div>

    <!-- List View -->
    <div
      v-else
      class="space-y-0"
    >
      <div
        v-for="member in members"
        :key="member.id"
        class="group p-6 border-b border-white/5 hover:bg-white/5 transition-all duration-300 flex items-center gap-6 cursor-pointer"
        @click="$emit('view-profile', member.id)"
      >
        <!-- Avatar -->
        <div class="relative flex-shrink-0">
          <Avatar
            :src="member.avatar_url"
            :name="member.nome"
            size="lg"
            class="border-2 border-secondary rounded-full group-hover:shadow-[0_0_15px_rgba(255,0,230,0.5)] transition-shadow duration-300"
          />
          <div
            v-if="memberOnline(member)"
            class="absolute bottom-0 right-0 h-4 w-4 bg-green-500 border-2 border-card-dark rounded-full shadow-[0_0_10px_rgba(34,197,94,0.6)]"
          ></div>
        </div>

        <!-- Member Info -->
        <div class="flex-1 min-w-0">
          <h3 class="text-lg font-bold text-white group-hover:text-secondary transition-colors truncate">
            {{ member.nome }}
          </h3>
          <p class="text-sm text-gray-400 truncate">
            {{ member.area_atuacao || 'Membro' }} • {{ [member.cidade, member.pais].filter(Boolean).join(', ') }}
          </p>
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-3 flex-shrink-0" @click.stop>
          <button
            class="px-6 py-2.5 rounded-lg border border-primary/40 text-primary bg-primary/5 hover:bg-primary hover:text-black hover:border-primary transition-all shadow-[0_0_10px_rgba(0,195,255,0.1)] hover:shadow-neon-blue text-sm font-bold tracking-wide"
          >
            Conectar
          </button>
          <button
            class="px-3 py-2.5 rounded-lg border border-gray-800 bg-card-dark text-gray-400 hover:text-secondary hover:border-secondary hover:bg-secondary/10 hover:shadow-neon-pink transition-all duration-300"
          >
            <span class="material-icons text-sm">chat</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <EmptyState
      v-if="members.length === 0 && !loading"
      icon="people"
      title="Nenhum membro encontrado"
      description="Tente ajustar os filtros de busca para encontrar mais membros."
    />

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>

    <!-- Pagination -->
    <div v-if="showPagination && totalPages > 1" class="mt-8 flex justify-center items-center gap-2">
      <button
        class="px-3 py-2 rounded-lg border border-white/10 text-gray-400 hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        :disabled="currentPage <= 1"
        @click="$emit('page-change', currentPage - 1)"
      >
        <span class="material-icons text-[18px]">chevron_left</span>
      </button>
      
      <button
        v-for="page in visiblePages"
        :key="page"
        :class="[
          'px-4 py-2 rounded-lg transition-all',
          currentPage === page
            ? 'bg-primary text-black shadow-[0_0_15px_rgba(0,195,255,0.4)]'
            : 'bg-card-dark border border-white/10 text-gray-400 hover:border-primary'
        ]"
        @click="$emit('page-change', page)"
      >
        {{ page }}
      </button>

      <button
        class="px-3 py-2 rounded-lg border border-white/10 text-gray-400 hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        :disabled="currentPage >= totalPages"
        @click="$emit('page-change', currentPage + 1)"
      >
        <span class="material-icons text-[18px]">chevron_right</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import MemberCard from './MemberCard.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import Avatar from '@/components/ui/Avatar.vue'
import type { Member } from '@/types/members'

interface Props {
  members: Member[]
  viewMode?: 'grid' | 'list'
  showPagination?: boolean
  currentPage?: number
  totalPages?: number
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  viewMode: 'grid',
  showPagination: false,
  currentPage: 1,
  totalPages: 1,
  loading: false,
})

defineEmits<{
  'view-profile': [memberId: string]
  'page-change': [page: number]
}>()

// Limitar páginas visíveis para não mostrar muitos botões
const visiblePages = computed(() => {
  const pages: number[] = []
  const maxVisible = 5
  
  let start = Math.max(1, props.currentPage - Math.floor(maxVisible / 2))
  let end = Math.min(props.totalPages, start + maxVisible - 1)
  
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1)
  }
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
})

function memberOnline(_member: Member): boolean {
  // For now, return false but can be extended later
  return false
}
</script>
