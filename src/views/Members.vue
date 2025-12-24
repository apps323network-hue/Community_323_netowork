<template>
  <AppLayout>
    <div class="space-y-10">
      <!-- Header -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
        <div>
          <h1 class="text-5xl font-extrabold mb-3 tracking-tight">
            <span
              class="bg-clip-text text-transparent bg-gradient-to-r from-primary via-blue-400 to-secondary neon-text-blue"
            >
              Comunidade
            </span>
          </h1>
          <p class="text-gray-500 dark:text-gray-400 max-w-xl text-lg">
            Conecte-se com artistas, empreendedores e visionários brasileiros nos EUA.
          </p>
        </div>
        <div class="w-full md:w-auto flex flex-col sm:flex-row gap-4">
          <div class="relative group">
            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span
                class="material-icons text-secondary/70 group-focus-within:text-secondary transition-colors"
                >search</span
              >
            </div>
            <input
              v-model="searchQuery"
              class="block w-full sm:w-80 pl-11 pr-4 py-3.5 border border-secondary/30 rounded-xl leading-5 bg-card-dark/80 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary focus:shadow-neon-blue sm:text-sm transition-all duration-300"
              placeholder="Buscar por nome, área ou cidade..."
              type="text"
              @input="handleSearch"
            />
          </div>
          <button
            class="group flex items-center justify-center gap-2 px-6 py-3.5 border border-secondary/30 rounded-xl text-sm font-semibold text-gray-200 bg-card-dark/80 hover:bg-secondary/10 hover:border-secondary hover:shadow-neon-pink transition-all duration-300"
            @click="showFilters = !showFilters"
          >
            <span class="material-icons text-lg text-secondary group-hover:animate-pulse"
              >tune</span
            >
            Filtros
          </button>
        </div>
      </div>

      <!-- Filters Panel (collapsible) -->
      <div
        v-if="showFilters"
        class="bg-card-dark rounded-2xl p-6 border border-white/5 shadow-lg animate-fade-in-up"
      >
        <MemberFilters
          v-model="filters"
          :view-mode="viewMode"
          @update:view-mode="viewMode = $event"
        />
      </div>

      <!-- Featured Section -->
      <section>
        <div class="flex items-center justify-between mb-8">
          <h2 class="text-2xl font-bold flex items-center gap-3 text-white">
            <span
              class="p-2 rounded-lg bg-secondary/10 border border-secondary/20 shadow-[0_0_15px_rgba(255,0,230,0.3)]"
            >
              <span class="material-icons text-secondary text-xl">local_fire_department</span>
            </span>
            Em destaque
          </h2>
          <a
            class="text-primary text-sm font-semibold hover:text-white hover:shadow-neon-blue transition-all px-3 py-1 rounded-lg hover:bg-primary/20 cursor-pointer"
          >
            Ver todos
          </a>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="flex justify-center py-12">
          <div
            class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"
          ></div>
        </div>

        <!-- Featured Members Grid -->
        <div v-else-if="featuredMembers.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <MemberCard
            v-for="member in featuredMembers"
            :key="member.id"
            :member="member"
            variant="featured"
            @view-profile="handleViewProfile"
            @bookmark-changed="handleBookmarkChanged"
          />
        </div>
        <!-- Empty State for Featured -->
        <div v-else class="text-center py-12">
          <p class="text-gray-400 text-sm">
            Nenhum membro em destaque ainda. Marque membros como favoritos para vê-los aqui!
          </p>
        </div>
      </section>

      <!-- All Members Section -->
      <section>
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold text-white tracking-tight">
            Todos os membros
          </h2>
          <div class="flex gap-2">
            <button
              :class="[
                'p-2 rounded-lg transition-colors',
                viewMode === 'grid'
                  ? 'bg-white/5 text-white'
                  : 'text-gray-400 hover:bg-primary/20 hover:text-primary',
              ]"
              @click="viewMode = 'grid'"
            >
              <span class="material-icons text-sm">grid_view</span>
            </button>
            <button
              :class="[
                'p-2 rounded-lg transition-colors',
                viewMode === 'list'
                  ? 'bg-white/5 text-white'
                  : 'text-gray-400 hover:bg-primary/20 hover:text-primary',
              ]"
              @click="viewMode = 'list'"
            >
              <span class="material-icons text-sm">view_list</span>
            </button>
          </div>
        </div>

        <!-- Members List/Grid -->
        <div
          v-if="viewMode === 'list'"
          class="bg-card-dark rounded-2xl shadow-sm border border-white/5 overflow-hidden"
        >
          <MemberCard
            v-for="member in allMembers"
            :key="member.id"
            :member="member"
            variant="list"
            @view-profile="handleViewProfile"
            @bookmark-changed="handleBookmarkChanged"
          />
        </div>
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <MemberCard
            v-for="member in allMembers"
            :key="member.id"
            :member="member"
            variant="featured"
            @view-profile="handleViewProfile"
            @bookmark-changed="handleBookmarkChanged"
          />
        </div>

        <!-- Empty State -->
        <EmptyState
          v-if="!loading && allMembers.length === 0"
          icon="people"
          title="Nenhum membro encontrado"
          description="Tente ajustar os filtros de busca para encontrar mais membros."
        />

        <!-- Load More Button -->
        <div v-if="!loading && hasMore" class="mt-8 flex justify-center">
          <button
            class="px-8 py-4 rounded-xl border border-white/10 text-gray-400 hover:border-primary hover:text-primary hover:bg-primary/5 hover:shadow-neon-blue transition-all duration-300 text-sm font-bold tracking-wide uppercase"
            @click="loadMore"
          >
            Carregar mais membros
          </button>
        </div>
      </section>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '@/components/layout/AppLayout.vue'
import MemberFilters from '@/components/features/members/MemberFilters.vue'
import MemberCard from '@/components/features/members/MemberCard.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import { useMembers } from '@/composables/useMembers'
import { useBookmarks } from '@/composables/useBookmarks'
import type { MemberFilters as MemberFiltersType, Member } from '@/types/members'

const router = useRouter()
const { members, loading, pagination, totalPages, fetchMembers } = useMembers()
const { fetchBookmarkedMembers, fetchBookmarks } = useBookmarks()

const viewMode = ref<'grid' | 'list'>('list')
const filters = ref<MemberFiltersType>({})
const searchQuery = ref('')
const showFilters = ref(false)
const featuredMembersList = ref<Member[]>([])

// Featured members (membros com bookmark)
const featuredMembers = computed(() => featuredMembersList.value)

// Todos os membros (mostrar todos, incluindo os 3 primeiros)
const allMembers = computed(() => members.value)

// Check if there are more pages
const hasMore = computed(() => pagination.value.page < totalPages.value)

onMounted(async () => {
  await fetchMembers()
  await fetchBookmarks()
  await loadFeaturedMembers()
})

async function loadFeaturedMembers() {
  const bookmarked = await fetchBookmarkedMembers()
  featuredMembersList.value = bookmarked as Member[]
}

// Watch for filter changes
watch(
  filters,
  (newFilters) => {
    fetchMembers(newFilters, 1)
  },
  { deep: true }
)

// Search with debounce
let searchTimeout: ReturnType<typeof setTimeout> | null = null
function handleSearch() {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    filters.value.search = searchQuery.value
  }, 300)
}

function handleViewProfile(memberId: string) {
  router.push(`/membros/${memberId}`)
}

function loadMore() {
  const nextPage = pagination.value.page + 1
  fetchMembers(filters.value, nextPage)
}

async function handleBookmarkChanged(memberId: string, isBookmarked: boolean) {
  // Recarregar membros em destaque quando um bookmark mudar
  await loadFeaturedMembers()
}
</script>

<style scoped>
.neon-text-blue {
  text-shadow:
    0 0 5px rgba(0, 195, 255, 0.7),
    0 0 15px rgba(0, 195, 255, 0.5);
}

.animate-fade-in-up {
  animation: fadeInUp 0.3s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
