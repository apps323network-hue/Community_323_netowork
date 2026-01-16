<template>
  <div class="min-h-screen bg-slate-50 dark:bg-background-dark flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
    <!-- Background Decor -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none">
      <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse"></div>
      <div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[120px] animate-pulse" style="animation-delay: 2s"></div>
    </div>

    <div class="w-full max-w-4xl bg-white dark:bg-surface-dark rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden flex flex-col relative z-10 animate-in fade-in zoom-in duration-700">
      <!-- Header -->
      <header class="p-8 sm:p-10 border-b border-slate-100 dark:border-white/5 bg-white/50 dark:bg-transparent backdrop-blur-sm">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-4">
              <span class="material-symbols-outlined text-sm">security</span>
              {{ t('terms.legalUpdate') || 'Atualização Legal' }}
            </div>
            <h1 class="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              {{ t('terms.acceptanceTitle') || 'Termos e Condições' }}
            </h1>
            <p class="mt-2 text-slate-500 dark:text-slate-400 font-medium max-w-lg">
              {{ t('terms.acceptanceSub') || 'Para continuar utilizando a plataforma, por favor revise e aceite nossos termos atualizados.' }}
            </p>
          </div>
          <div class="flex items-center gap-3 self-start md:self-center">
            <AnimatedThemeToggler />
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <!-- Content Area -->
      <main class="flex-1 overflow-y-auto max-h-[60vh] p-8 sm:p-10 custom-scrollbar space-y-12">
        <!-- Terms of Service Section -->
        <section v-if="tos" class="space-y-6">
          <div class="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-white/5">
            <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <span class="material-symbols-outlined">gavel</span>
            </div>
            <h2 class="text-xl font-bold text-slate-900 dark:text-white">{{ tos.title }}</h2>
          </div>
          <article class="prose prose-slate dark:prose-invert max-w-none prose-sm sm:prose-base" v-html="tosContent"></article>
        </section>

        <!-- Privacy Policy Section -->
        <section v-if="privacy" class="space-y-6">
          <div class="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-white/5">
            <div class="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
              <span class="material-symbols-outlined">description</span>
            </div>
            <h2 class="text-xl font-bold text-slate-900 dark:text-white">{{ privacy.title }}</h2>
          </div>
          <article class="prose prose-slate dark:prose-invert max-w-none prose-sm sm:prose-base" v-html="privacyContent"></article>
        </section>

        <!-- Loading Skeletons -->
        <div v-if="loading" class="space-y-8">
          <div v-for="i in 2" :key="i" class="space-y-4 animate-pulse">
            <div class="h-8 bg-slate-200 dark:bg-white/5 rounded-lg w-1/3"></div>
            <div class="space-y-2">
              <div class="h-4 bg-slate-200 dark:bg-white/5 rounded w-full"></div>
              <div class="h-4 bg-slate-200 dark:bg-white/5 rounded w-5/6"></div>
              <div class="h-4 bg-slate-200 dark:bg-white/5 rounded w-4/6"></div>
            </div>
          </div>
        </div>
      </main>

      <!-- Footer / Actions -->
      <footer class="p-8 sm:p-10 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 backdrop-blur-md">
        <div class="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div class="flex flex-col gap-2 w-full sm:w-auto">
            <label class="flex items-center gap-3 cursor-pointer group">
              <div class="relative flex items-center justify-center">
                <input 
                  type="checkbox" 
                  v-model="hasRead" 
                  class="peer sr-only"
                >
                <div class="w-6 h-6 rounded-lg border-2 border-slate-300 dark:border-white/20 peer-checked:bg-primary peer-checked:border-primary transition-all duration-300"></div>
                <span class="material-symbols-outlined absolute text-white scale-0 peer-checked:scale-100 transition-transform duration-300 text-lg font-bold">check</span>
              </div>
              <span class="text-sm font-semibold text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                {{ t('terms.confirmRead') || 'Li e concordo com os termos acima.' }}
              </span>
            </label>
          </div>

          <div class="flex items-center gap-4 w-full sm:w-auto">
            <Button
              variant="outline"
              size="lg"
              class="flex-1 sm:flex-none h-14 rounded-2xl font-bold"
              @click="handleSignOut"
            >
              {{ t('navigation.logout') || 'Sair' }}
            </Button>
            <Button
              :disabled="!hasRead || accepting"
              variant="primary"
              size="lg"
              class="flex-1 sm:flex-none h-14 px-8 rounded-2xl font-bold shadow-xl shadow-primary/20 transition-all hover:shadow-primary/40 active:scale-95"
              @click="handleAccept"
              :loading="accepting"
            >
              {{ t('common.confirm') || 'Confirmar e Continuar' }}
            </Button>
          </div>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { toast } from 'vue-sonner'
import { useTermsAcceptance } from '@/composables/useTermsAcceptance'
import { useAuthStore } from '@/stores/auth'
import AnimatedThemeToggler from '@/components/ui/AnimatedThemeToggler.vue'
import LanguageSwitcher from '@/components/ui/LanguageSwitcher.vue'
import Button from '@/components/ui/Button.vue'
import DOMPurify from 'dompurify'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const { getLatestActiveTerm, recordTermAcceptance, loading } = useTermsAcceptance()

const tos = ref<any>(null)
const privacy = ref<any>(null)
const hasRead = ref(false)
const accepting = ref(false)

const tosContent = computed(() => tos.value ? DOMPurify.sanitize(tos.value.content) : '')
const privacyContent = computed(() => privacy.value ? DOMPurify.sanitize(privacy.value.content) : '')

onMounted(async () => {
  try {
    const [tosData, privacyData] = await Promise.all([
      getLatestActiveTerm('terms_of_service'),
      getLatestActiveTerm('privacy_policy')
    ])
    tos.value = tosData
    privacy.value = privacyData
    
    // Se por algum erro bizarro não houver termos e o store disser que já aceitou, manda pra home
    if (!tos.value && !privacy.value && authStore.termsAccepted) {
      router.push('/')
    }
  } catch (err) {
    console.error('Erro ao carregar termos:', err)
    toast.error('Erro ao carregar termos. Por favor, tente novamente.')
  }
})

async function handleAccept() {
  if (!tos.value || !privacy.value || !authStore.user) return
  
  accepting.value = true
  try {
    const results = await Promise.all([
      recordTermAcceptance(tos.value.id, 'terms_of_service', authStore.user.id),
      recordTermAcceptance(privacy.value.id, 'privacy_policy', authStore.user.id)
    ])
    
    if (results.every(r => r === true)) {
      toast.success(t('terms.success') || 'Termos aceitos com sucesso!')
      
      // Forçar atualização do store
      authStore.termsAccepted = true
      
      // Redirecionar para onde o usuário queria ir ou para a home
      const redirect = (route.query.redirect as string) || '/'
      router.push(redirect)
    } else {
      throw new Error('Falha ao registrar um ou mais aceites')
    }
  } catch (err) {
    console.error('Erro ao aceitar termos:', err)
    toast.error('Erro ao processar seu aceite. Por favor, tente novamente.')
  } finally {
    accepting.value = false
  }
}

async function handleSignOut() {
  await authStore.signOut()
  router.push('/login')
}
</script>

<script lang="ts">
export default {
  name: 'TermsAcceptance'
}
</script>

<style scoped>
.prose {
  font-size: 1rem;
  line-height: 1.7;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  @apply bg-slate-200 dark:bg-white/10 rounded-full;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  @apply bg-slate-300 dark:bg-white/20;
}
</style>
