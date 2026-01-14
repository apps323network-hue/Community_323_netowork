<template>
  <div class="relative w-full" v-click-outside="closeResults">
    <!-- Unified Container with dynamic border radius -->
    <div 
      class="search-container relative bg-white dark:bg-surface-dark"
      :class="[
        isFocused && (query || memberResults.length > 0 || tagResults.length > 0) 
          ? 'rounded-t-2xl border-t border-x border-gray-200 dark:border-gray-800' 
          : 'rounded-2xl border border-gray-200 dark:border-gray-800'
      ]"
    >
      <!-- Search Input style X (Twitter) -->
      <div class="relative group w-full">
        <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <span class="material-icons text-slate-400 group-focus-within:text-secondary transition-colors text-xl">search</span>
        </div>
        <input
          v-model="query"
          type="text"
          :placeholder="t('home.searchPlaceholder')"
          @input="handleInput"
          @focus="handleFocus"
          class="block w-full pl-12 pr-10 py-2.5 bg-transparent border-none focus:ring-0 transition-all outline-none text-slate-900 dark:text-gray-100 sm:text-base h-11 cursor-pointer"
        />
        <button 
          v-if="query" 
          @click="clearSearch"
          class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-secondary transition-colors"
        >
          <span class="material-icons text-xl">cancel</span>
        </button>
      </div>
    </div>

    <!-- Results Overlay -->
    <Transition name="fade-scale">
      <div 
        v-if="isFocused && (query || memberResults.length > 0 || tagResults.length > 0)"
        class="bg-white dark:bg-[#12121a] border-x border-b border-gray-200 dark:border-gray-800 rounded-b-2xl shadow-2xl overflow-hidden max-h-[80vh] flex flex-col"
      >
        <div class="overflow-y-auto">
          <!-- Loading State -->
          <div v-if="loading" class="p-8 flex justify-center">
            <div class="w-8 h-8 border-2 border-secondary/20 border-t-secondary rounded-full animate-spin"></div>
          </div>

          <!-- Empty State -->
          <div v-else-if="query && memberResults.length === 0 && tagResults.length === 0" class="p-8 text-center text-slate-500">
            <span class="material-icons text-4xl mb-2 opacity-20">search_off</span>
            <p>{{ t('common.noResults') }}</p>
          </div>

          <div v-else>
            <!-- Tags Section -->
            <div v-if="tagResults.length > 0" class="p-2">
              <h3 class="px-3 py-2 text-xs font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wider">
                {{ query ? 'Tags' : 'Tags Sugeridas' }}
              </h3>
              <div class="flex flex-wrap gap-2 p-2">
                <button
                  v-for="tag in tagResults"
                  :key="tag"
                  @click="selectTag(tag)"
                  class="px-3 py-1.5 rounded-full bg-secondary/10 text-secondary hover:bg-secondary/20 transition-colors text-xs font-bold flex items-center gap-1 border border-secondary/20"
                >
                  <span class="text-secondary opacity-70">#</span>
                  {{ tag }}
                </button>
              </div>
            </div>

            <!-- People Section -->
            <div v-if="memberResults.length > 0" class="p-2">
              <h3 class="px-3 py-2 text-xs font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wider">
                {{ query ? t('members.title') : 'Membros Recomendados' }}
              </h3>
              <div class="space-y-1">
                <button
                  v-for="member in memberResults"
                  :key="member.id"
                  @click="goToProfile(member.id)"
                  class="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-all text-left group"
                >
                  <Avatar 
                    :src="member.avatar_url" 
                    :name="member.nome" 
                    size="md"
                    class="border border-slate-200 dark:border-white/10"
                  />
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-1">
                      <span class="font-bold text-slate-900 dark:text-white truncate group-hover:text-secondary transition-colors">
                        {{ member.nome }}
                      </span>
                      <span v-if="member.plano === 'Premium'" class="material-icons text-secondary text-[14px]">verified</span>
                    </div>
                    <p class="text-xs text-slate-500 dark:text-gray-400 truncate">
                      {{ member.area_atuacao }} {{ member.cidade ? `• ${member.cidade}` : '' }}
                    </p>
                  </div>
                  <span class="material-icons text-slate-300 dark:text-gray-600 group-hover:translate-x-1 transition-transform">chevron_right</span>
                </button>
              </div>
            </div>

            <!-- Recent Searches / Suggestions (If empty query) -->
            <div v-if="!query && memberResults.length === 0" class="p-4 text-center">
              <p class="text-sm text-slate-500 dark:text-gray-400">
                Explore a comunidade por nome ou área de atuação
              </p>
            </div>
          </div>
        </div>

        <!-- Footer Action -->
        <div v-if="query" class="p-3 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5">
          <button 
            @click="emitSearch"
            class="w-full py-2 text-sm font-bold text-secondary hover:underline flex items-center justify-center gap-2"
          >
            <span class="material-icons text-sm">search</span>
            Pesquisar por "{{ query }}" no feed
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { supabase } from '@/lib/supabase'
import { INTEREST_TAGS } from '@/types/members'
import type { Member } from '@/types/members'
import Avatar from '@/components/ui/Avatar.vue'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits(['update:modelValue', 'search'])

const { t } = useI18n()
const router = useRouter()

const query = ref(props.modelValue)
const isFocused = ref(false)
const loading = ref(false)
const memberResults = ref<Member[]>([])
const tagResults = ref<string[]>([])

let searchTimeout: ReturnType<typeof setTimeout> | null = null

// Custom directive for clicking outside
const vClickOutside = {
  mounted(el: any, binding: any) {
    el.clickOutsideEvent = (event: Event) => {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value()
      }
    }
    document.addEventListener('click', el.clickOutsideEvent)
  },
  unmounted(el: any) {
    document.removeEventListener('click', el.clickOutsideEvent)
  }
}

function handleInput() {
  emit('update:modelValue', query.value)
  
  if (searchTimeout) clearTimeout(searchTimeout)
  
  if (!query.value.trim()) {
    memberResults.value = []
    tagResults.value = []
    return
  }

  searchTimeout = setTimeout(() => {
    performSearch()
  }, 300)
}

async function performSearch() {
  if (!query.value.trim()) {
    fetchRecommendations()
    return
  }
  
  loading.value = true
  
  try {
    const searchTerm = query.value.trim().toLowerCase()
    
    // 1. Search Members
    const { data: members, error } = await supabase
      .from('profiles')
      .select('id, nome, area_atuacao, cidade, avatar_url, plano')
      .or(`nome.ilike.%${searchTerm}%,area_atuacao.ilike.%${searchTerm}%,cidade.ilike.%${searchTerm}%`)
      .limit(5)
    
    if (error) throw error
    memberResults.value = members || []

    // 2. Search Tags
    tagResults.value = INTEREST_TAGS.filter(tag => 
      tag.toLowerCase().includes(searchTerm)
    ).slice(0, 6)

  } catch (err) {
    console.error('Search error:', err)
  } finally {
    loading.value = false
  }
}

async function fetchRecommendations() {
  try {
    // Fetch some premium members or just random members as people to follow
    const { data: members, error } = await supabase
      .from('profiles')
      .select('id, nome, area_atuacao, cidade, avatar_url, plano')
      .order('plano', { ascending: false })
      .limit(5)

    if (error) throw error
    memberResults.value = members || []
    
    // Suggested tags (random from INTEREST_TAGS)
    tagResults.value = [...INTEREST_TAGS].sort(() => 0.5 - Math.random()).slice(0, 6)
  } catch (err) {
    console.error('Fetch recommendations error:', err)
  }
}

function handleFocus() {
  isFocused.value = true
  if (!query.value.trim() && memberResults.value.length === 0) {
    fetchRecommendations()
  }
}

function selectTag(tag: string) {
  query.value = tag
  emit('update:modelValue', tag)
  emitSearch()
  isFocused.value = false
}

function goToProfile(userId: string) {
  router.push(`/comunidade/${userId}`)
  closeResults()
}

function emitSearch() {
  emit('search', query.value)
  isFocused.value = false
}

function clearSearch() {
  query.value = ''
  emit('update:modelValue', '')
  emit('search', '')
  memberResults.value = []
  tagResults.value = []
}

function closeResults() {
  isFocused.value = false
}

function handleSearchKeyPress(e: KeyboardEvent) {
  if (e.key === 'Enter') {
    emitSearch()
  }
}

onMounted(() => {
  window.addEventListener('keydown', (e) => {
    if (isFocused.value && e.key === 'Enter') {
      emitSearch()
    }
  })
})
</script>

<style scoped>
.search-container {
  transition: border-radius 0.32s cubic-bezier(0.16, 1, 0.3, 1);
}

.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: translateY(-5px) scale(0.99);
}
</style>
