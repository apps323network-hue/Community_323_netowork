<template>
  <div class="min-h-screen bg-white dark:bg-background-dark selection:bg-primary/30">
    <!-- Premium Navigation Header -->
    <nav class="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-white/10">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16 sm:h-20">
          <div class="flex items-center gap-4">
            <button 
              @click="router.back()"
              class="group flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 hover:bg-primary/10 dark:hover:bg-primary/20 transition-all duration-300"
            >
              <span class="material-symbols-outlined text-slate-600 dark:text-slate-400 group-hover:text-primary transition-colors">arrow_back</span>
            </button>
            <div class="hidden sm:block h-6 w-[1px] bg-slate-200 dark:bg-white/10"></div>
            <h2 class="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 hidden sm:block">Legal Center</h2>
          </div>
          
          <div class="flex items-center gap-3">
            <AnimatedThemeToggler />
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content Area -->
    <main class="pt-24 sm:pt-32 pb-20 px-4 sm:px-6">
      <div class="max-w-3xl mx-auto">
        <!-- Loading State -->
        <div v-if="loading" class="flex flex-col justify-center items-center py-20 min-h-[60vh]">
          <div class="relative w-16 h-16">
            <div class="absolute inset-0 rounded-full border-4 border-primary/20"></div>
            <div class="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
          </div>
          <p class="mt-4 text-slate-500 dark:text-slate-400 font-medium animate-pulse">{{ t('common.loading') }}</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/20 rounded-2xl p-8 text-center">
          <span class="material-symbols-outlined text-4xl text-red-500 mb-4">error</span>
          <h3 class="text-xl font-bold text-red-900 dark:text-red-200 mb-2">{{ t('privacy.errorTitle') }}</h3>
          <p class="text-red-700/70 dark:text-red-300/70 mb-6">{{ error }}</p>
          <Button variant="outline" @click="loadTerm">{{ t('common.retry') }}</Button>
        </div>

        <!-- Policy Content -->
        <div v-else-if="term" class="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <header class="mb-12">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-6">
              <span class="material-symbols-outlined text-sm">shield_lock</span>
              Privacy Policy
            </div>
            <h1 class="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white mb-6 tracking-tight leading-[1.1]">
              {{ term.title }}
            </h1>
            <div class="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm font-medium text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-white/5 pt-6">
              <span class="flex items-center gap-2">
                <span class="material-symbols-outlined text-lg opacity-60">history</span>
                Version {{ term.version }}
              </span>
              <span class="flex items-center gap-2">
                <span class="material-symbols-outlined text-lg opacity-60">event_available</span>
                Last updated {{ formatDate(term.created_at) }}
              </span>
            </div>
          </header>

          <article 
            ref="contentContainer"
            class="prose prose-slate dark:prose-invert max-w-none"
            v-html="sanitizedContent"
          ></article>

          <!-- Accept Button (only if coming from registration) -->
          <div v-if="showAcceptButton" class="mt-20 p-10 rounded-[2.5rem] bg-slate-50 dark:bg-surface-dark border border-slate-200 dark:border-white/10 ring-1 ring-black/5 shadow-2xl shadow-black/5">
            <div class="flex flex-col md:flex-row items-center justify-between gap-8">
              <div class="text-center md:text-left">
                <h4 class="text-xl font-bold text-slate-900 dark:text-white mb-2">Review & Agreement</h4>
                <p class="text-slate-600 dark:text-slate-400 leading-relaxed">{{ t('privacy.scrollToAccept') }}</p>
              </div>
              <Button
                :disabled="!canAccept"
                variant="primary"
                size="lg"
                class="w-full md:w-auto h-16 px-12 rounded-2xl shadow-xl shadow-primary/30 text-lg font-bold transition-all duration-300 active:scale-95"
                @click="handleAccept"
                :loading="accepting"
              >
                {{ t('privacy.accept') }}
              </Button>
            </div>
          </div>
        </div>

        <!-- Not Found State -->
        <div v-else class="text-center py-32 bg-slate-50 dark:bg-white/5 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-white/10">
          <div class="w-20 h-20 bg-white dark:bg-white/5 rounded-3xl shadow-sm flex items-center justify-center mx-auto mb-6 transform rotate-3">
            <span class="material-symbols-outlined text-4xl text-slate-400 dark:text-slate-500">privacy_tip</span>
          </div>
          <h3 class="text-2xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">{{ t('privacy.notFound') }}</h3>
          <p class="text-slate-600 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">{{ t('privacy.notFoundDescription') }}</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useTermsAcceptance, type TermType } from '@/composables/useTermsAcceptance'
import AnimatedThemeToggler from '@/components/ui/AnimatedThemeToggler.vue'
import LanguageSwitcher from '@/components/ui/LanguageSwitcher.vue'
import Button from '@/components/ui/Button.vue'
import DOMPurify from 'dompurify'
import { useAuthStore } from '@/stores/auth'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const { getLatestActiveTerm, recordTermAcceptance, loading, error } = useTermsAcceptance()
const term = ref<any>(null)
const contentContainer = ref<HTMLElement | null>(null)
const canAccept = ref(false)
const accepting = ref(false)
const showAcceptButton = computed(() => route.query.from === 'register' && authStore.user)
let scrollHandler: (() => void) | null = null

const sanitizedContent = computed(() => {
  if (!term.value?.content) return ''
  return DOMPurify.sanitize(term.value.content, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'blockquote', 'hr'],
    ALLOWED_ATTR: ['href', 'target', 'rel']
  })
})

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

function checkScrollPosition() {
  if (!contentContainer.value) return
  const scrollTop = window.scrollY || document.documentElement.scrollTop
  const scrollHeight = document.documentElement.scrollHeight
  const clientHeight = window.innerHeight
  canAccept.value = scrollTop + clientHeight >= scrollHeight - 100
}

async function handleAccept() {
  if (!term.value || !authStore.user) return
  accepting.value = true
  try {
    const success = await recordTermAcceptance(
      term.value.id,
      'privacy_policy' as TermType,
      authStore.user.id
    )
    if (success) {
      router.push({ name: 'Login', query: { tab: 'register' } })
    } else {
      throw new Error(t('privacy.acceptError'))
    }
  } catch (err: any) {
    console.error('Error accepting policy:', err)
  } finally {
    accepting.value = false
  }
}

async function loadTerm() {
  term.value = await getLatestActiveTerm('privacy_policy' as TermType)
  await nextTick()
  if (showAcceptButton.value) {
    setTimeout(checkScrollPosition, 100)
  }
}

onMounted(() => {
  loadTerm()
  scrollHandler = () => {
    if (showAcceptButton.value) checkScrollPosition()
  }
  window.addEventListener('scroll', scrollHandler)
})

onBeforeUnmount(() => {
  if (scrollHandler) window.removeEventListener('scroll', scrollHandler)
})
</script>

<style scoped>
.prose {
  @apply text-slate-700/90 dark:text-slate-300/90;
  font-size: 1.125rem;
  line-height: 1.85;
}

.prose :deep(h1), .prose :deep(h2), .prose :deep(h3), .prose :deep(h4) {
  @apply text-slate-900 dark:text-white font-black mt-8 mb-4 tracking-tight leading-tight;
}

.prose :deep(h1) { @apply text-4xl lg:text-5xl; }
.prose :deep(h2) { @apply text-3xl lg:text-4xl pb-4 border-b-2 border-slate-100 dark:border-white/5; }
.prose :deep(h3) { @apply text-2xl lg:text-3xl; }
.prose :deep(h4) { @apply text-xl lg:text-2xl font-bold; }

.prose :deep(p) { @apply mb-5 leading-[1.75]; }

.prose :deep(ul), .prose :deep(ol) { @apply mb-6 ml-6 space-y-2; }
.prose :deep(ul) { @apply list-disc; }
.prose :deep(ol) { @apply list-decimal; }
.prose :deep(li) { @apply pl-2; }
.prose :deep(li::marker) { @apply text-primary font-bold; }

.prose :deep(strong) { @apply font-black text-slate-900 dark:text-white; }

.prose :deep(blockquote) {
  @apply border-l-4 border-primary bg-primary/5 dark:bg-primary/10 pl-6 py-6 pr-6 italic my-8 rounded-2xl text-lg text-slate-800 dark:text-slate-100 font-medium;
}

.prose :deep(hr) { 
  @apply my-10 border-0 h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-white/10 to-transparent;
}

.prose :deep(a) {
  @apply text-primary hover:text-secondary underline underline-offset-8 decoration-2 transition-all font-bold;
}
</style>
