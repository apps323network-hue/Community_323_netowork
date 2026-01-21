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
          
          <!-- Advanced Feed Search - Now in Production -->
          <div v-if="isAuthenticated" class="relative z-40 mb-8">
            <FeedSearch v-model="feedSearchQuery" @search="handleFeedSearch" />
          </div>





          <!-- All Members Section -->
          <section>
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
const { fetchBookmarks } = useBookmarks()
const { isAuthenticated, showAuthModal, getContentLimit } = usePublicAccess()



// FeedSearch functionality - integrated with member filtering
const feedSearchQuery = ref('')
function handleFeedSearch(query: string) {
  // Parse the search query for filters
  // Examples: "designer em Miami", "#tech", "empreendedor premium", "Brasil"
  const searchTerm = query.toLowerCase().trim()
  
  // Reset filters
  filters.value = {}
  
  // Check for area keywords
  const areaKeywords = ['designer', 'desenvolvedor', 'empreendedor', 'artista', 'investidor']
  const foundArea = areaKeywords.find(area => searchTerm.includes(area))
  if (foundArea) {
    filters.value.area_atuacao = foundArea.charAt(0).toUpperCase() + foundArea.slice(1)
  }
  
  // Check for city (common US cities)
  const cityKeywords = ['miami', 'orlando', 'new york', 'los angeles', 'boston', 'chicago']
  const foundCity = cityKeywords.find(city => searchTerm.includes(city))
  if (foundCity) {
    filters.value.cidade = foundCity.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
  }
  
  // Check for country keywords
  const countryKeywords = ['brasil', 'brazil', 'usa', 'united states', 'portugal', 'espanha', 'spain', 'argentina', 'méxico', 'mexico', 'canadá', 'canada']
  const foundCountry = countryKeywords.find(country => searchTerm.includes(country))
  if (foundCountry) {
    // Normalize country names
    let normalizedCountry = foundCountry
    if (foundCountry === 'brazil') normalizedCountry = 'brasil'
    if (foundCountry === 'united states') normalizedCountry = 'usa'
    if (foundCountry === 'spain') normalizedCountry = 'espanha'
    if (foundCountry === 'mexico') normalizedCountry = 'méxico'
    if (foundCountry === 'canada') normalizedCountry = 'canadá'
    
    filters.value.search = normalizedCountry.charAt(0).toUpperCase() + normalizedCountry.slice(1)
  }
  
  // Check for plan
  if (searchTerm.includes('premium')) {
    filters.value.plano = 'Premium'
  }
  
  // If no specific filters found, use as general search
  if (!foundArea && !foundCity && !foundCountry && !searchTerm.includes('premium')) {
    filters.value.search = query
  }
  
  // Trigger search
  fetchMembers(filters.value, 1)
}

const filters = ref<MemberFiltersType>({})


const guestLimit = getContentLimit('community')

// All members
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
})



// Watch for filter changes
watch(
  filters,
  (newFilters) => {
    fetchMembers(newFilters, 1)
  },
  { deep: true }
)



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
  // Bookmark changed - no action needed since we removed featured members
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
