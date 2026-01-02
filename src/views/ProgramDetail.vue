<template>
  <AppLayout>
    <div class="container mx-auto px-4 py-8 max-w-6xl">
      <!-- Loading State -->
      <div v-if="programsStore.loading" class="flex justify-center items-center h-64">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary dark:border-secondary"></div>
      </div>

      <!-- Program Content -->
      <div v-else-if="program" class="space-y-8">
        <!-- Hero Banner -->
        <div class="relative h-64 md:h-96 rounded-2xl overflow-hidden">
          <img
            v-if="program.banner_url"
            :src="program.banner_url"
            :alt="title"
            class="w-full h-full object-cover"
          />
          <div v-else class="w-full h-full bg-gradient-to-br from-primary to-secondary"></div>
          <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
            <div class="p-8">
              <h1 class="text-4xl md:text-5xl font-bold text-white mb-2">{{ title }}</h1>
              <p v-if="program.instructor_name" class="text-lg text-white/90">
                {{ t('programs.instructor') }}: {{ program.instructor_name }}
              </p>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Main Content -->
          <div class="lg:col-span-2 space-y-6">
            <!-- About -->
            <div class="bg-white dark:bg-surface-dark rounded-xl p-6 shadow-md border border-slate-200 dark:border-white/5">
              <h2 class="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                {{ t('programs.aboutProgram') }}
              </h2>
              <p class="text-slate-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                {{ description }}
              </p>
            </div>

            <!-- Curriculum -->
            <div v-if="curriculum && curriculum.length > 0" class="bg-white dark:bg-surface-dark rounded-xl p-6 shadow-md border border-slate-200 dark:border-white/5">
              <h2 class="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                {{ t('programs.curriculum') }}
              </h2>
              <div class="space-y-4">
                <div v-for="(module, index) in curriculum" :key="index" class="p-4 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5">
                  <h3 class="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                    <span class="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center">{{ index + 1 }}</span>
                    {{ module.title }}
                  </h3>
                  <p v-if="module.description" class="text-slate-600 dark:text-gray-400 text-sm mt-2 ml-8">{{ module.description }}</p>
                </div>
              </div>
            </div>

            <!-- Reviews -->
            <div class="bg-white dark:bg-surface-dark rounded-xl p-6 shadow-md border border-slate-200 dark:border-white/5">
              <h2 class="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                {{ t('programs.reviews') }}
              </h2>
              <p class="text-slate-600 dark:text-gray-400 italic">
                {{ t('programs.noReviews') }}
              </p>
            </div>
          </div>

          <!-- Sidebar -->
          <div class="lg:col-span-1">
            <div class="bg-white dark:bg-surface-dark rounded-xl p-6 shadow-xl sticky top-24 space-y-6 border border-slate-200 dark:border-white/5">
              <!-- Price -->
              <div class="text-center pb-6 border-b border-slate-200 dark:border-white/10">
                <div class="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary mb-1">
                  ${{ program.price_usd }}
                </div>
                <div class="text-xs text-slate-500 dark:text-gray-400 font-medium uppercase tracking-widest">
                  Investimento Único
                </div>
              </div>

              <!-- Program Info -->
              <div class="space-y-4 text-sm">
                <div v-if="program.duration_hours" class="flex justify-between items-center">
                  <span class="text-slate-500 dark:text-gray-400 flex items-center gap-2">
                    <span class="material-icons text-sm">schedule</span>
                    Duração
                  </span>
                  <span class="font-bold text-slate-900 dark:text-white">{{ program.duration_hours }}h</span>
                </div>
                <div v-if="program.difficulty_level" class="flex justify-between items-center">
                  <span class="text-slate-500 dark:text-gray-400 flex items-center gap-2">
                    <span class="material-icons text-sm">bar_chart</span>
                    Nível
                  </span>
                  <span class="font-bold text-slate-900 dark:text-white capitalize">{{ program.difficulty_level }}</span>
                </div>
                <div v-if="program.max_students" class="flex justify-between items-center">
                  <span class="text-slate-500 dark:text-gray-400 flex items-center gap-2">
                    <span class="material-icons text-sm">group</span>
                    Vagas Restantes
                  </span>
                  <span class="font-bold text-primary dark:text-secondary">{{ program.max_students - program.current_students }}</span>
                </div>
              </div>

              <!-- CTA Button -->
              <div class="pt-2">
                <button
                  v-if="!isEnrolled"
                  @click="handleRequestEnroll"
                  :disabled="isSoldOut || submitting"
                  class="w-full py-4 rounded-xl font-black text-black bg-gradient-to-r from-primary to-secondary shadow-[0_0_20px_rgba(244,37,244,0.3)] hover:shadow-[0_0_30px_rgba(244,37,244,0.5)] hover:scale-[1.02] transition-all disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
                >
                  <template v-if="submitting">
                    <span class="flex items-center justify-center gap-2">
                      <span class="w-5 h-5 border-3 border-black border-t-transparent rounded-full animate-spin"></span>
                      PROCESSANDO...
                    </span>
                  </template>
                  <template v-else>
                    {{ isSoldOut ? 'VAGAS ESGOTADAS' : 'MATRICULAR AGORA' }}
                  </template>
                </button>
                <div v-if="userStore.profile?.role === 'admin' && !isEnrolled" class="pt-4">
                  <button
                    @click="handleForceEnroll"
                    :disabled="submitting"
                    class="w-full py-2 rounded-lg border border-primary/30 text-primary hover:bg-primary/5 text-xs font-bold transition-all flex items-center justify-center gap-2"
                  >
                    <span class="material-icons text-sm">construction</span>
                    Admin: Forçar Inscrição (Teste)
                  </button>
                </div>
                <div v-else-if="isEnrolled" class="space-y-4">
                  <div class="py-4 bg-green-500/10 border border-green-500/20 text-green-500 rounded-xl font-bold text-center flex items-center justify-center gap-2">
                    <span class="material-icons">check_circle</span>
                    MATRICULADO
                  </div>
                  <div v-if="userStore.profile?.role === 'admin'" class="pt-2">
                    <button
                      @click="handleResetEnroll"
                      :disabled="submitting"
                      class="w-full py-2 rounded-lg border border-red-500/30 text-red-500 hover:bg-red-500/5 text-xs font-bold transition-all flex items-center justify-center gap-2"
                    >
                      <span class="material-icons text-sm">restart_alt</span>
                      Admin: Resetar Minha Inscrição
                    </button>
                  </div>
                  <RouterLink
                    to="/meus-programas"
                    class="block text-center text-primary dark:text-secondary font-bold hover:underline py-2"
                  >
                    Ver Meus Programas →
                  </RouterLink>
                </div>
              </div>

              <!-- Classroom Link (if enrolled and enabled) -->
              <div v-if="isEnrolled && program.classroom_enabled" class="pt-6 border-t border-slate-200 dark:border-white/10">
                <div class="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-center space-y-3">
                  <div class="text-[10px] text-blue-400 font-bold uppercase tracking-wider">
                    Integração Google Classroom
                  </div>
                  <a
                    href="https://classroom.google.com"
                    target="_blank"
                    class="flex items-center justify-center gap-2 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition shadow-lg shadow-blue-600/20"
                  >
                    <span class="material-icons text-lg">school</span>
                    ABRIR CLASSROOM
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Not Found -->
      <div v-else class="text-center py-20 bg-white dark:bg-surface-dark rounded-3xl border border-slate-200 dark:border-white/5 shadow-xl">
        <div class="text-8xl mb-6 opacity-20">🔍</div>
        <h3 class="text-2xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">
          Programa não encontrado
        </h3>
        <p class="text-slate-500 dark:text-gray-400 mb-8">O programa que você procura não existe ou foi removido.</p>
        <RouterLink to="/programas" class="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold hover:scale-105 transition-transform">
          <span class="material-icons text-sm rotate-180">arrow_forward</span>
          Explorar Programas
        </RouterLink>
      </div>
    </div>

    <!-- Modal de Matrícula / Checkout -->
    <Modal
      v-if="program"
      v-model="showCheckoutModal"
      :title="'Matrícula: ' + title"
    >
      <div class="flex flex-col gap-6 p-1">
        <!-- Descrição -->
        <p class="text-sm text-slate-600 dark:text-gray-300 leading-relaxed">
          Você está a um passo de transformar sua carreira. Inscreva-se em <strong class="text-slate-900 dark:text-white">{{ title }}</strong> e tenha acesso imediato aos conteúdos.
        </p>

        <!-- Preço e Taxas -->
        <div class="space-y-4">
          <div class="p-5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-4">
            <div class="flex justify-between items-center text-sm">
              <span class="text-slate-500 dark:text-gray-400 font-medium">Investimento Base</span>
              <span class="text-slate-900 dark:text-white font-bold">${{ program.price_usd }}</span>
            </div>
            
            <div v-if="paymentMethod" class="flex justify-between items-center text-sm">
              <span class="text-slate-500 dark:text-gray-400 font-medium">Taxas ({{ paymentMethod === 'card' ? '3.9% + $0.30' : '~1.8%' }})</span>
              <span class="text-slate-900 dark:text-white font-bold">{{ formatPrice(calculateFee(program.price_usd * 100, paymentMethod), paymentMethod === 'pix' ? 'BRL' : 'USD') }}</span>
            </div>
            
            <div class="border-t border-dashed border-slate-300 dark:border-white/10 pt-4">
              <div class="flex justify-between items-center">
                <span class="text-slate-900 dark:text-white font-black uppercase text-xs tracking-widest">Total Final</span>
                <span class="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                  {{ paymentMethod ? formatPrice(calculateTotal(program.price_usd * 100, paymentMethod), paymentMethod === 'pix' ? 'BRL' : 'USD') : '$' + program.price_usd }}
                </span>
              </div>
            </div>
          </div>

          <!-- Nota sobre conversão PIX -->
          <div v-if="paymentMethod === 'pix'" class="flex items-start gap-3 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <span class="material-icons text-blue-400">info</span>
            <p class="text-[11px] text-blue-300 leading-relaxed font-medium">
              Pagamentos via PIX são processados em Reais. Valor calculado com câmbio de R$ {{ exchangeRate.toFixed(2) }}.
            </p>
          </div>
        </div>

        <!-- Método de Pagamento -->
        <div class="space-y-4">
          <label class="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-gray-400">Método de Pagamento</label>
          <div class="grid grid-cols-2 gap-4">
            <button
              @click="paymentMethod = 'card'"
              class="flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all group relative overflow-hidden"
              :class="paymentMethod === 'card' 
                ? 'border-primary bg-primary/10 text-slate-900 dark:text-white shadow-xl shadow-primary/20' 
                : 'border-slate-200 dark:border-white/10 hover:border-primary/30 text-slate-600 dark:text-gray-400'"
            >
              <span class="material-icons text-3xl group-hover:scale-110 transition-transform">credit_card</span>
              <span class="text-sm font-black uppercase tracking-tight">Cartão</span>
            </button>
            <button
              @click="paymentMethod = 'pix'"
              class="flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all group relative overflow-hidden"
              :class="paymentMethod === 'pix' 
                ? 'border-secondary bg-secondary/10 text-slate-900 dark:text-white shadow-xl shadow-secondary/20' 
                : 'border-slate-200 dark:border-white/10 hover:border-secondary/30 text-slate-600 dark:text-gray-400'"
            >
              <span class="material-icons text-3xl group-hover:scale-110 transition-transform">qr_code</span>
              <span class="text-sm font-black uppercase tracking-tight">PIX</span>
            </button>
          </div>
        </div>

        <!-- Botão de Ação -->
        <div class="space-y-4 pt-4">
          <button
            @click="handleCheckout"
            :disabled="submitting || !paymentMethod"
            class="w-full rounded-2xl bg-gradient-to-r from-primary to-secondary py-5 text-sm font-black text-black shadow-2xl shadow-primary/30 hover:shadow-primary/50 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed uppercase tracking-widest"
          >
            <template v-if="submitting">
              <span class="flex items-center justify-center gap-3">
                <span class="w-5 h-5 border-4 border-black border-t-transparent rounded-full animate-spin"></span>
                Iniciando...
              </span>
            </template>
            <template v-else>
              Finalizar Inscrição
            </template>
          </button>
          <div class="flex flex-col items-center gap-2">
             <p class="text-[10px] text-slate-500 dark:text-gray-500 font-bold uppercase tracking-tighter flex items-center gap-1">
              <span class="material-icons text-[14px]">lock</span>
              Pagamento Seguro via Stripe Infrastructure
            </p>
            <div class="flex gap-2">
               <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" class="h-4 dark:invert opacity-50" alt="Stripe" />
            </div>
          </div>
        </div>
      </div>
    </Modal>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useLocale } from '@/composables/useLocale'
import { useProgramsStore } from '@/stores/programs'
import { useAuthStore } from '@/stores/auth'
import { useUserStore } from '@/stores/user'
import { useSupabase } from '@/composables/useSupabase'
import AppLayout from '@/components/layout/AppLayout.vue'
import Modal from '@/components/ui/Modal.vue'
import { toast } from 'vue-sonner'
import { fetchExchangeRate, calculatePixAmount } from '@/lib/exchange'

const route = useRoute()
const { t, locale: currentLocale } = useLocale()
const { supabase } = useSupabase()
const programsStore = useProgramsStore()
const authStore = useAuthStore()
const userStore = useUserStore()

const programId = computed(() => route.params.id as string)
const program = computed(() => programsStore.currentProgram)
const showCheckoutModal = ref(false)
const submitting = ref(false)
const paymentMethod = ref<'card' | 'pix' | null>(null)
const exchangeRate = ref(5.95) // Taxa USD -> BRL

const title = computed(() =>
  program.value
    ? currentLocale.value === 'pt-BR'
      ? program.value.title_pt
      : program.value.title_en
    : ''
)

const description = computed(() =>
  program.value
    ? currentLocale.value === 'pt-BR'
      ? program.value.description_pt
      : program.value.description_en
    : ''
)

const curriculum = computed(() =>
  program.value
    ? currentLocale.value === 'pt-BR'
      ? program.value.curriculum_pt
      : program.value.curriculum_en
    : null
)

const isEnrolled = computed(() => !!program.value?.user_enrollment && program.value.user_enrollment.status === 'active')

const isSoldOut = computed(() => {
  if (!program.value || !program.value.max_students) return false
  return program.value.current_students >= program.value.max_students
})

// Taxas Stripe
const CARD_FEE_PERCENTAGE = 0.039
const CARD_FEE_FIXED = 30 // cents
const PIX_FEE_PERCENTAGE = 0.0179

function formatPrice(cents: number, currency: string = 'USD'): string {
  const amount = cents / 100
  if (currency === 'BRL') {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount)
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

function calculateFee(basePriceCents: number, method: 'card' | 'pix'): number {
  if (method === 'card') {
    return Math.round((basePriceCents * CARD_FEE_PERCENTAGE) + CARD_FEE_FIXED)
  } else {
    const usdAmount = basePriceCents / 100
    const grossAmountBRL = calculatePixAmount(usdAmount, exchangeRate.value)
    const baseAmountBRL = usdAmount * exchangeRate.value // Valor base real sem margem
    const feeAmountBRL = grossAmountBRL - baseAmountBRL
    return Math.round(feeAmountBRL * 100)
  }
}

function calculateTotal(basePriceCents: number, method: 'card' | 'pix'): number {
  if (method === 'card') {
    return basePriceCents + calculateFee(basePriceCents, method)
  } else {
    const usdAmount = basePriceCents / 100
    const grossAmountBRL = calculatePixAmount(usdAmount, exchangeRate.value)
    return Math.round(grossAmountBRL * 100)
  }
}

const handleRequestEnroll = () => {
  showCheckoutModal.value = true
}

const handleCheckout = async () => {
  if (!program.value || !paymentMethod.value) return

  try {
    submitting.value = true
    
    // Validar sessão
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      toast.error('Você precisa estar logado para se matricular')
      return
    }

    // Chamar Edge Function de Checkout
    const { data, error } = await supabase.functions.invoke('create-program-checkout', {
      body: {
        program_id: program.value.id,
        payment_method: paymentMethod.value,
        exchange_rate: exchangeRate.value
      }
    })

    if (error) throw error

    if (data?.checkout_url) {
      window.location.href = data.checkout_url
    } else {
      throw new Error('Erro ao gerar link de pagamento')
    }
  } catch (err: any) {
    console.error('Checkout error:', err)
    toast.error(err.message || 'Erro ao iniciar pagamento')
  } finally {
    submitting.value = false
  }
}

const handleForceEnroll = async () => {
  if (!program.value || !authStore.user) return
  
  const confirm = window.confirm('Deseja forçar sua inscrição neste programa para teste? Isso vai ignorar o pagamento e ativar seu acesso imediatamente.')
  if (!confirm) return

  try {
    submitting.value = true
    
    // 1. Criar/Atualizar Matrícula como Ativa
    const { error: enrollError } = await supabase
      .from('program_enrollments')
      .upsert({
        program_id: program.value.id,
        user_id: authStore.user.id,
        status: 'active',
        payment_status: 'paid',
        payment_method: 'admin_bypass',
        payment_amount: 0,
        paid_at: new Date().toISOString()
      }, { onConflict: 'program_id,user_id' })

    if (enrollError) throw enrollError

    // 2. Tentar disparar convite do Classroom se estiver ativado
    if (program.value.classroom_enabled && program.value.classroom_course_id) {
       toast.info('Disparando convite do Classroom...')
       await supabase.functions.invoke('classroom_invite', {
         body: {
           courseId: program.value.classroom_course_id,
           studentEmail: authStore.user.email
         }
       })
    }

    toast.success('Inscrição forçada com sucesso! Atualizando página...')
    
    // Recarregar dados do programa
    await programsStore.fetchProgramById(programId.value)
    
  } catch (err: any) {
    console.error('Force enroll error:', err)
    toast.error('Erro ao forçar inscrição: ' + (err.message || 'Erro desconhecido'))
  } finally {
    submitting.value = false
  }
}

const handleResetEnroll = async () => {
  if (!program.value || !authStore.user) return
  
  const confirm = window.confirm('Deseja REMOVER sua inscrição deste programa? Isso permitirá que você teste o fluxo de pagamento/matrícula do zero.')
  if (!confirm) return

  try {
    submitting.value = true
    
    const { error } = await supabase
      .from('program_enrollments')
      .delete()
      .eq('program_id', program.value.id)
      .eq('user_id', authStore.user.id)

    if (error) throw error

    toast.success('Inscrição removida! Você já pode testar o fluxo novamente.')
    
    // Atualizar estado local
    await programsStore.fetchProgramById(programId.value)
    
  } catch (err: any) {
    console.error('Reset enroll error:', err)
    toast.error('Erro ao resetar inscrição: ' + (err.message || 'Erro desconhecido'))
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  programsStore.fetchProgramById(programId.value)
  // Buscar taxa de câmbio real
  const rate = await fetchExchangeRate()
  exchangeRate.value = rate
})
</script>

<style scoped>
.material-icons {
  font-family: 'Material Icons';
}
</style>
