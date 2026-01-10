<template>
  <div class="min-h-screen bg-slate-50 dark:bg-background-dark">
    <!-- Header -->
    <div class="bg-white dark:bg-surface-dark border-b border-slate-200 dark:border-white/10 sticky top-0 z-10 shadow-sm">
      <div class="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <RouterLink
              to="/"
              class="text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-secondary transition-colors"
              title="Voltar"
            >
              <span class="material-symbols-outlined">arrow_back</span>
            </RouterLink>
            <h1 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {{ t('privacy.title') }}
            </h1>
          </div>
          <div class="flex items-center gap-3">
            <AnimatedThemeToggler />
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div v-if="loading" class="flex justify-center items-center py-20">
        <div class="text-center">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mb-4"></div>
          <p class="text-slate-600 dark:text-slate-400">{{ t('common.loading') }}</p>
        </div>
      </div>

      <div v-else-if="error" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 mb-6">
        <div class="flex items-start gap-3">
          <span class="material-symbols-outlined text-red-500">error</span>
          <div>
            <h3 class="font-bold text-red-900 dark:text-red-200 mb-1">{{ t('privacy.errorTitle') }}</h3>
            <p class="text-red-700 dark:text-red-300 text-sm">{{ error }}</p>
          </div>
        </div>
      </div>

      <div v-else-if="term" class="bg-white dark:bg-surface-card rounded-xl shadow-lg border border-slate-200 dark:border-white/10 overflow-hidden">
        <!-- Term Header -->
        <div class="bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 dark:from-primary/20 dark:via-secondary/20 dark:to-primary/20 px-8 py-6 border-b border-slate-200 dark:border-white/10">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-2xl font-black text-slate-900 dark:text-white mb-2">{{ term.title }}</h2>
              <p class="text-sm text-slate-600 dark:text-slate-400">
                {{ t('privacy.version') }} {{ term.version }} • {{ t('privacy.effectiveDate') }}: {{ formatDate(term.created_at) }}
              </p>
            </div>
          </div>
        </div>

        <!-- Term Content -->
        <div 
          ref="contentContainer"
          class="prose prose-slate dark:prose-invert max-w-none px-8 sm:px-12 lg:px-16 py-10 overflow-y-auto min-h-[60vh]"
          :style="{ maxHeight: showAcceptButton ? 'calc(100vh - 350px)' : 'calc(100vh - 200px)' }"
          v-html="sanitizedContent"
        ></div>

        <!-- Accept Button (only if coming from registration) -->
        <div v-if="showAcceptButton" class="px-8 py-6 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-surface-lighter sticky bottom-0">
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

      <div v-else class="bg-white dark:bg-surface-card rounded-xl shadow-lg border border-slate-200 dark:border-white/10 p-8 text-center">
        <span class="material-symbols-outlined text-6xl text-slate-400 dark:text-slate-500 mb-4">privacy_tip</span>
        <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-2">{{ t('privacy.notFound') }}</h3>
        <p class="text-slate-600 dark:text-slate-400 mb-4">{{ t('privacy.notFoundDescription') }}</p>
        <p class="text-sm text-slate-500 dark:text-slate-500 italic">{{ t('privacy.contentComingSoon') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
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
  
  const container = contentContainer.value
  const scrollTop = container.scrollTop
  const scrollHeight = container.scrollHeight
  const clientHeight = container.clientHeight
  
  // Considera que chegou ao final se estiver a 50px do final
  canAccept.value = scrollTop + clientHeight >= scrollHeight - 50
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

  // Verificar scroll após carregar conteúdo
  if (contentContainer.value && showAcceptButton.value) {
    setTimeout(() => {
      checkScrollPosition()
    }, 100)
  }
}

onMounted(() => {
  loadTerm()

  // Adicionar listener de scroll se o botão de aceitar estiver visível
  if (contentContainer.value && showAcceptButton.value) {
    contentContainer.value.addEventListener('scroll', checkScrollPosition)
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
</style>
