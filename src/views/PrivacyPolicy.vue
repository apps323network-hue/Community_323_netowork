<template>
  <div class="min-h-screen bg-slate-50 dark:bg-background-dark">
    <!-- Fixed Header Banner -->
    <header 
      v-if="term"
      ref="headerBanner"
      class="bg-slate-50 dark:bg-background-dark border-b border-slate-200 dark:border-white/10 fixed top-0 left-0 right-0 z-50 shadow-sm"
    >
      <div class="bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 dark:from-primary/20 dark:via-secondary/20 dark:to-primary/20 w-full h-full">
        <div class="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div class="flex items-start justify-between gap-6">
            <div>
              <h1 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-2">
                {{ term.title }}
              </h1>
              <p class="text-sm text-slate-600 dark:text-slate-400">
                {{ t('privacy.version') }} {{ term.version }} • {{ t('privacy.effectiveDate') }}: {{ formatDate(term.created_at) }}
              </p>
            </div>
            <div class="flex items-center gap-3">
              <AnimatedThemeToggler />
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content Area -->
    <main ref="mainContent" class="relative z-10">
      <!-- Spacer para o header fixo -->
      <div v-if="term" ref="headerSpacer" :style="{ height: `${headerHeight}px` }" class="w-full flex-shrink-0 pointer-events-none"></div>
      
      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center min-h-screen py-20">
        <div class="text-center">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mb-4"></div>
          <p class="text-slate-600 dark:text-slate-400">{{ t('common.loading') }}</p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
          <div class="flex items-start gap-3">
            <span class="material-symbols-outlined text-red-500">error</span>
            <div>
              <h3 class="font-bold text-red-900 dark:text-red-200 mb-1">{{ t('privacy.errorTitle') }}</h3>
              <p class="text-red-700 dark:text-red-300 text-sm">{{ error }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Policy Content -->
      <div v-else-if="term" class="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10" :style="{ marginTop: 0 }">
        <div 
          ref="contentContainer"
          class="prose prose-slate dark:prose-invert max-w-none px-4 sm:px-8 lg:px-12 py-6 relative"
          :style="{ minHeight: 'calc(100vh - ' + headerHeight + 'px)' }"
          v-html="sanitizedContent"
        ></div>

        <!-- Accept Button (only if coming from registration) -->
        <div v-if="showAcceptButton" class="mt-8 px-4 sm:px-8 lg:px-12 py-6 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-surface-lighter">
          <div class="flex items-center justify-between">
            <p class="text-sm text-slate-600 dark:text-slate-400">
              {{ t('privacy.scrollToAccept') }}
            </p>
            <Button
              :disabled="!canAccept"
              variant="primary"
              size="lg"
              @click="handleAccept"
              :loading="accepting"
            >
              {{ t('privacy.accept') }}
            </Button>
          </div>
        </div>
      </div>

      <!-- Not Found State -->
      <div v-else class="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="bg-white dark:bg-surface-card rounded-xl shadow-lg border border-slate-200 dark:border-white/10 p-8 text-center">
          <span class="material-symbols-outlined text-6xl text-slate-400 dark:text-slate-500 mb-4">privacy_tip</span>
          <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-2">{{ t('privacy.notFound') }}</h3>
          <p class="text-slate-600 dark:text-slate-400 mb-4">{{ t('privacy.notFoundDescription') }}</p>
          <p class="text-sm text-slate-500 dark:text-slate-500 italic">{{ t('privacy.contentComingSoon') }}</p>
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
const headerBanner = ref<HTMLElement | null>(null)
const mainContent = ref<HTMLElement | null>(null)
const headerSpacer = ref<HTMLElement | null>(null)
const canAccept = ref(false)
const accepting = ref(false)
const showAcceptButton = computed(() => route.query.from === 'register' && authStore.user)
let scrollHandler: (() => void) | null = null
const headerHeight = ref(140)

const sanitizedContent = computed(() => {
  if (!term.value?.content) return ''
  return DOMPurify.sanitize(term.value.content, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'blockquote', 'hr'],
    ALLOWED_ATTR: ['href', 'target', 'rel']
  })
})

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString(route.query.lang === 'en' ? 'en-US' : 'pt-BR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

function checkScrollPosition() {
  if (!contentContainer.value) return
  
  // #region agent log
  const headerEl = headerBanner.value
  const mainEl = mainContent.value
  const scrollTop = window.scrollY || document.documentElement.scrollTop
  const scrollHeight = document.documentElement.scrollHeight
  const clientHeight = window.innerHeight
  const headerHeight = headerEl ? headerEl.offsetHeight : 0
  const mainPaddingTop = mainEl ? window.getComputedStyle(mainEl).paddingTop : '0'
  const headerZIndex = headerEl ? window.getComputedStyle(headerEl).zIndex : '0'
  
  fetch('http://127.0.0.1:7243/ingest/90aaf856-d3a0-403e-b154-71a179af14ae',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PrivacyPolicy.vue:checkScrollPosition',message:'Scroll position check',data:{scrollTop,scrollHeight,clientHeight,headerHeight,mainPaddingTop,headerZIndex,headerExists:!!headerEl,mainExists:!!mainEl},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H1'})}).catch(()=>{});
  // #endregion
  
  // Considera que chegou ao final se estiver a 100px do final
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
      // Redirecionar de volta para o registro
      router.push({ name: 'Login', query: { tab: 'register' } })
    } else {
      throw new Error(t('privacy.acceptError'))
    }
  } catch (err: any) {
    console.error('Erro ao aceitar política:', err)
  } finally {
    accepting.value = false
  }
}

async function loadTerm() {
  const loadedTerm = await getLatestActiveTerm('privacy_policy' as TermType)
  term.value = loadedTerm

  // Calcular altura do header após o DOM ser atualizado
  await nextTick()
  await new Promise(resolve => setTimeout(resolve, 100))
  
  if (headerBanner.value) {
    headerHeight.value = headerBanner.value.offsetHeight
  }

  // #region agent log
  const headerEl = headerBanner.value
  const mainEl = mainContent.value
  const mainPaddingTop = mainEl ? window.getComputedStyle(mainEl).paddingTop : '0'
  const headerZIndex = headerEl ? window.getComputedStyle(headerEl).zIndex : '0'
  const headerPosition = headerEl ? window.getComputedStyle(headerEl).position : 'none'
  
  fetch('http://127.0.0.1:7243/ingest/90aaf856-d3a0-403e-b154-71a179af14ae',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PrivacyPolicy.vue:loadTerm',message:'After term loaded',data:{headerHeight:headerHeight.value,mainPaddingTop,headerZIndex,headerPosition,headerExists:!!headerEl,mainExists:!!mainEl,termLoaded:!!loadedTerm},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H2'})}).catch(()=>{});
  // #endregion

  // Verificar scroll após carregar conteúdo
  if (showAcceptButton.value) {
    setTimeout(() => {
      checkScrollPosition()
    }, 100)
  }
}

onMounted(() => {
  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/90aaf856-d3a0-403e-b154-71a179af14ae',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PrivacyPolicy.vue:onMounted',message:'Component mounted',data:{headerExists:!!headerBanner.value,mainExists:!!mainContent.value},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H3'})}).catch(()=>{});
  // #endregion
  
  loadTerm()

  // Adicionar listener de scroll na window se o botão de aceitar estiver visível
  if (showAcceptButton.value) {
    window.addEventListener('scroll', checkScrollPosition)
  } else {
    // #region agent log
    const scrollHandler = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      const headerEl = headerBanner.value
      const mainEl = mainContent.value
      const spacerEl = headerSpacer.value
      const headerHeight = headerEl ? headerEl.offsetHeight : 0
      const spacerHeight = spacerEl ? spacerEl.offsetHeight : 0
      const mainTop = mainEl ? mainEl.getBoundingClientRect().top : 0
      const headerTop = headerEl ? headerEl.getBoundingClientRect().top : 0
      const contentFirstChild = mainEl?.querySelector('.prose') as HTMLElement
      const contentTop = contentFirstChild ? contentFirstChild.getBoundingClientRect().top : 0
      
      fetch('http://127.0.0.1:7243/ingest/90aaf856-d3a0-403e-b154-71a179af14ae',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PrivacyPolicy.vue:scrollListener',message:'Scroll event post-fix',data:{scrollTop,headerHeight,spacerHeight,mainTop,headerTop,contentTop,headerExists:!!headerEl,mainExists:!!mainEl,spacerExists:!!spacerEl},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'H4'})}).catch(()=>{});
    }
    window.addEventListener('scroll', scrollHandler)
    // #endregion
  }
})

onBeforeUnmount(() => {
  if (showAcceptButton.value) {
    window.removeEventListener('scroll', checkScrollPosition)
  } else if (scrollHandler) {
    window.removeEventListener('scroll', scrollHandler)
  }
})
</script>

<style scoped>
.prose {
  @apply text-slate-700 dark:text-slate-300;
  font-size: 1rem;
  line-height: 1.75;
}

.prose h1,
.prose h2,
.prose h3,
.prose h4,
.prose h5,
.prose h6 {
  @apply text-slate-900 dark:text-white font-bold mt-8 mb-5;
}

.prose h1 {
  @apply text-4xl;
  margin-top: 0;
}

.prose h2 {
  @apply text-3xl;
  margin-top: 2.5rem;
}

.prose h3 {
  @apply text-2xl;
  margin-top: 2rem;
}

.prose h4 {
  @apply text-xl;
}

.prose p {
  @apply mb-5 leading-relaxed;
  font-size: 1.05rem;
}

.prose ul,
.prose ol {
  @apply mb-6 pl-8;
  font-size: 1.05rem;
}

.prose li {
  @apply mb-3;
  line-height: 1.8;
}

.prose a {
  @apply text-primary hover:text-cyan-300 underline font-medium;
}

.prose strong {
  @apply font-bold text-slate-900 dark:text-white;
}

.prose blockquote {
  @apply border-l-4 border-primary pl-6 italic my-6 py-2;
  font-size: 1.05rem;
}

.prose hr {
  @apply my-8 border-slate-300 dark:border-slate-700;
}

/* Garantir que o conteúdo nunca passe por cima do header */
.prose::before {
  content: '';
  display: block;
  height: 0;
  margin-top: 0;
  pointer-events: none;
}
</style>
