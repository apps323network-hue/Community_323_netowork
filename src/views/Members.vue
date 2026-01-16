<template>
  <AppLayout>
    <div class="space-y-4 sm:space-y-6 md:space-y-8 lg:space-y-10 overflow-x-hidden w-full max-w-full">
      <!-- Header -->
      <div class="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 sm:gap-6 lg:gap-8 w-full overflow-hidden">
        <div class="w-full lg:flex-1 lg:max-w-2xl min-w-0">
          <h1 class="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-extrabold mb-2 sm:mb-3 tracking-tight">
            <span
              class="bg-clip-text text-transparent bg-gradient-to-r pl-1 from-blue-700 to-indigo-800 dark:from-secondary dark:to-blue-500"
            >
              {{ t('members.title') }}
            </span>
          </h1>
          <p class="text-slate-600 pl-1 dark:text-gray-400 max-w-xl text-xs sm:text-sm md:text-base lg:text-lg">
            {{ t('members.description') }}
          </p>
        </div>
        <div 
          v-if="isAuthenticated"
          class="w-full lg:w-auto flex flex-row gap-3 sm:gap-4"
        >
          <div class="relative group flex-1 lg:flex-initial lg:w-[300px]">
            <div class="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
              <span
                class="material-icons text-secondary/70 text-lg sm:text-xl group-focus-within:text-secondary transition-colors"
                >search</span
              >
            </div>
            <input
              v-model="searchQuery"
              class="block w-full h-[46px] pl-10 sm:pl-11 pr-3 sm:pr-4 border border-slate-200 dark:border-secondary/50 rounded-lg sm:rounded-xl leading-5 bg-white dark:bg-[#0a040f] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-secondary focus:border-secondary focus:shadow-[0_0_15px_rgba(0,243,255,0.3)] transition-all duration-300"
              :placeholder="t('members.searchPlaceholder')"
              type="text"
              @input="handleSearch"
            />
          </div>
          <button
            class="group flex items-center justify-center gap-2 px-4 sm:px-6 h-[46px] mt-0 border border-slate-200 dark:border-secondary/50 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold text-slate-700 dark:text-gray-200 bg-white dark:bg-[#0a040f] hover:bg-slate-50 dark:hover:bg-secondary/10 hover:border-secondary hover:shadow-[0_0_15px_rgba(244,37,244,0.3)] transition-all duration-300 whitespace-nowrap shrink-0"
            @click="showFilters = !showFilters"
          >
            <span class="material-icons text-base sm:text-lg text-secondary group-hover:animate-pulse"
              >tune</span
            >
            {{ t('common.filters') }}
          </button>
        </div>
      </div>

      <!-- Main Content Area -->
      <div class="relative">
        <!-- Guest Overlays (Visible only when not authenticated) -->
        <div 
          v-if="!isAuthenticated" 
          class="absolute inset-0 z-20 flex flex-col items-center justify-start pt-12 sm:pt-20 lg:pt-32 px-4"
        >
          <!-- Gradient Fade to hide blurred content at the bottom -->
          <!-- Gradient Fade to hide blurred content at the bottom -->
          <div class="absolute inset-0 bg-gradient-to-b from-transparent via-background-light/80 dark:via-background-dark/80 to-background-light dark:to-background-dark pointer-events-none"></div>
          
          <!-- Floating Blocker Card -->
          <div class="relative z-30 w-full max-w-2xl">
            <GuestBlocker
              :show="true"
              variant="inline"
              :title="t('common.guestBlocker.title')"
              :message="t('members.description')"
            />
          </div>
        </div>

        <!-- Content Structure (Blurred for guests) -->
        <div :class="{ 'blur-sm opacity-40 pointer-events-none select-none': !isAuthenticated }">
          
          <!-- Advanced Feed Search (localhost only) -->
          <div v-if="isAuthenticated && isLocalhost" class="relative z-40 mb-8">
            <FeedSearch v-model="feedSearchQuery" @search="handleFeedSearch" />
          </div>

          <!-- Filters Panel (collapsible) -->
          <div
            v-if="isAuthenticated && showFilters"
            class="bg-white dark:bg-surface-card rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-slate-200 dark:border-white/5 shadow-lg animate-fade-in-up mb-8"
          >
            <MemberFilters
              v-model="filters"
            />
          </div>

          <!-- Featured Section -->
          <section v-if="featuredMembers.length > 0">
            <div class="flex items-center justify-between mb-4 sm:mb-6 lg:mb-8">
              <h2 class="text-lg sm:text-xl md:text-2xl font-bold flex items-center gap-2 sm:gap-3 text-slate-900 dark:text-white">
                <span class="material-icons text-secondary text-base sm:text-lg md:text-xl">local_fire_department</span>
                <span class="truncate">{{ t('members.featuredMembers') }}</span>
              </h2>
            </div>

            <!-- Featured Members Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              <MemberCard
                v-for="member in (isAuthenticated ? featuredMembers : featuredMembers.slice(0, 3))"
                :key="member.id"
                :member="member"
                variant="featured"
                @view-profile="handleViewProfile"
                @bookmark-changed="handleBookmarkChanged"
              />
            </div>
          </section>

          <!-- All Members Section -->
          <section :class="{ 'mt-8 sm:mt-12 lg:mt-16': featuredMembers.length > 0 }">
            <div class="flex items-center justify-between mb-4 sm:mb-6 gap-2">
              <h2 class="text-base sm:text-lg md:text-xl font-bold text-slate-900 dark:text-white tracking-tight truncate">
                {{ t('members.allMembers') }}
              </h2>
            </div>

            <div
              class="bg-white dark:bg-surface-card rounded-xl sm:rounded-2xl shadow-sm border border-slate-200 dark:border-white/5 overflow-hidden relative divide-y divide-slate-200 dark:divide-white/5"
            >
              <MemberCard
                v-for="member in displayMembers"
                :key="member.id"
                :member="member"
                variant="list"
                @view-profile="handleViewProfile"
                @bookmark-changed="handleBookmarkChanged"
              />
            </div>

            <!-- Empty State -->
            <EmptyState
              v-if="!loading && allMembers.length === 0"
              icon="people"
              :title="t('members.noMembersFound')"
              :description="t('members.noMembersFoundDesc')"
            />

            <!-- Load More Button -->
            <div v-if="isAuthenticated && !loading && hasMore" class="mt-6 sm:mt-8 flex justify-center">
              <button
                class="px-6 sm:px-8 py-3 sm:py-4 rounded-xl border border-white/10 text-gray-400 hover:border-primary hover:text-primary hover:bg-primary/5 hover:shadow-neon-blue transition-all duration-300 text-xs sm:text-sm font-bold tracking-wide uppercase"
                @click="loadMore"
              >
                {{ t('common.loadMore') }}
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import AppLayout from '@/components/layout/AppLayout.vue'
import MemberFilters from '@/components/features/members/MemberFilters.vue'
import MemberCard from '@/components/features/members/MemberCard.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import GuestBlocker from '@/components/common/GuestBlocker.vue'
import FeedSearch from '@/components/features/feed/FeedSearch.vue'
import { useMembers } from '@/composables/useMembers'
import { useBookmarks } from '@/composables/useBookmarks'
import { usePublicAccess } from '@/composables/usePublicAccess'
import type { MemberFilters as MemberFiltersType, Member } from '@/types/members'

const router = useRouter()
const { t } = useI18n()
const { members, loading, pagination, totalPages, fetchMembers } = useMembers()
const { fetchBookmarkedMembers, fetchBookmarks } = useBookmarks()
const { isAuthenticated, showAuthModal, getContentLimit } = usePublicAccess()

// Localhost detection for FeedSearch
const isLocalhost = computed(() => {
  if (typeof window === 'undefined') return false
  return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
})

// FeedSearch functionality
const feedSearchQuery = ref('')
function handleFeedSearch(query: string) {
  console.log('Feed search query:', query)
  // For now, we can integrate this with member search or keep it separate
  // Future: could redirect to a unified search results page
}


const filters = ref<MemberFiltersType>({})
const searchQuery = ref('')
const showFilters = ref(false)
const featuredMembersList = ref<Member[]>([])
const guestLimit = getContentLimit('community')

// Featured members (membros com bookmark) com filtro aplicado
const featuredMembers = computed(() => {
  let list = featuredMembersList.value

  // Filtrar por busca textual
  if (filters.value.search) {
    const term = filters.value.search.toLowerCase()
    list = list.filter(m => 
      m.nome.toLowerCase().includes(term) ||
      (m.area_atuacao && m.area_atuacao.toLowerCase().includes(term)) ||
      (m.cidade && m.cidade.toLowerCase().includes(term))
    )
  }

  // Filtrar por Área
  if (filters.value.area_atuacao) {
     list = list.filter(m => m.area_atuacao === filters.value.area_atuacao)
  }

  // Filtrar por Cidade
  if (filters.value.cidade) {
     list = list.filter(m => m.cidade === filters.value.cidade)
  }

  // Filtrar por Objetivo
  if (filters.value.objetivo) {
     list = list.filter(m => m.objetivo === filters.value.objetivo)
  }

  return list
})

// Todos os membros (mostrar todos, incluindo os 3 primeiros)
const allMembers = computed(() => members.value)

const displayMembers = computed(() => {
  if (isAuthenticated.value) {
    return allMembers.value
  }
  return allMembers.value.slice(0, guestLimit)
})

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
  if (!isAuthenticated.value) {
    showAuthModal('signup')
    return
  }
  router.push(`/comunidade/${memberId}`)
}

function loadMore() {
  const nextPage = pagination.value.page + 1
  fetchMembers(filters.value, nextPage, true)
}

async function handleBookmarkChanged(_memberId: string, _isBookmarked: boolean) {
  // Recarregar membros em destaque quando um bookmark mudar
  await loadFeaturedMembers()
}
</script>

<style scoped>
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
