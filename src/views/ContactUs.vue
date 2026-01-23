<template>
  <AppLayout>
    <div class="min-h-screen py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8">
      <div class="max-w-2xl mx-auto">
        <!-- Header -->
        <div class="text-center mb-10">
          <h1 class="text-3xl sm:text-4xl font-display font-bold text-slate-900 dark:text-white mb-4">
            {{ t('contact.title') }}
          </h1>
          <p class="text-lg text-slate-600 dark:text-gray-400">
            {{ t('contact.subtitle') }}
          </p>
        </div>

        <!-- Form Card -->
        <div class="bg-white dark:bg-surface-card rounded-2xl shadow-xl dark:shadow-premium border border-slate-200 dark:border-white/5 p-6 sm:p-8 lg:p-10">
          <form @submit.prevent="handleSubmit" class="space-y-6">
            
            <!-- Name -->
            <div>
              <label class="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2">
                {{ t('contact.name') }}
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span class="material-symbols-outlined text-slate-400">person</span>
                </div>
                <input
                  v-model="form.name"
                  type="text"
                  required
                  :disabled="isAuthenticated && !!userStore.profile?.nome"
                  class="block w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0a040f] text-slate-900 dark:text-white placeholder-slate-400 focus:border-secondary focus:ring-1 focus:ring-secondary transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                  :placeholder="t('contact.namePlaceholder')"
                />
              </div>
            </div>

            <!-- Email -->
            <div>
              <label class="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2">
                {{ t('contact.email') }}
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span class="material-symbols-outlined text-slate-400">mail</span>
                </div>
                <input
                  v-model="form.email"
                  type="email"
                  required
                  :disabled="isAuthenticated && !!authStore.user?.email"
                  class="block w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0a040f] text-slate-900 dark:text-white placeholder-slate-400 focus:border-secondary focus:ring-1 focus:ring-secondary transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                  :placeholder="t('contact.emailPlaceholder')"
                />
              </div>
            </div>

            <!-- Phone -->
            <div>
              <label class="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2">
                {{ t('contact.phone') }}
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span class="material-symbols-outlined text-slate-400">phone</span>
                </div>
                <input
                  v-model="form.phone"
                  type="tel"
                  required
                  @input="form.phone = form.phone.replace(/\D/g, '')"
                  class="block w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0a040f] text-slate-900 dark:text-white placeholder-slate-400 focus:border-secondary focus:ring-1 focus:ring-secondary transition-all"
                  :placeholder="t('contact.phonePlaceholder')"
                />
              </div>
            </div>

            <!-- Subject -->
            <div>
              <label class="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2">
                {{ t('contact.subject') }}
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span class="material-symbols-outlined text-slate-400">topic</span>
                </div>
                <select
                  v-model="form.subject"
                  required
                  class="block w-full pl-11 pr-10 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0a040f] text-slate-900 dark:text-white focus:border-secondary focus:ring-1 focus:ring-secondary transition-all appearance-none cursor-pointer"
                >
                  <option value="" disabled>{{ t('contact.selectSubject') }}</option>
                  <option v-for="subject in subjects" :key="subject.value" :value="subject.value">
                    {{ t(`contact.subjects.${subject.key}`) }}
                  </option>
                </select>
                <div class="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <span class="material-symbols-outlined text-slate-400">expand_more</span>
                </div>
              </div>
            </div>

            <!-- Message -->
            <div>
              <label class="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2">
                {{ t('contact.message') }}
              </label>
              <textarea
                v-model="form.message"
                required
                rows="5"
                class="block w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0a040f] text-slate-900 dark:text-white placeholder-slate-400 focus:border-secondary focus:ring-1 focus:ring-secondary transition-all resize-none"
                :placeholder="t('contact.messagePlaceholder')"
              ></textarea>
            </div>

            <!-- Submit Button -->
            <div class="pt-4">
              <button
                type="submit"
                :disabled="sending"
                class="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-gradient-to-r from-secondary to-primary text-white font-bold text-lg shadow-lg hover:shadow-[0_0_20px_rgba(0,243,255,0.4)] transform hover:-translate-y-1 transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
              >
                <div v-if="sending" class="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span v-else class="material-symbols-outlined">send</span>
                {{ sending ? t('common.sending') : t('contact.send') }}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
    
    <!-- Toast Notification -->
    <Transition name="fade">
      <div v-if="notification.show" :class="[
        'fixed top-24 left-1/2 -translate-x-1/2 px-6 py-4 rounded-xl shadow-2xl backdrop-blur-md border font-bold flex items-center gap-3 z-50',
        notification.type === 'success' ? 'bg-secondary/10 dark:bg-secondary/20 border-secondary/30 dark:border-secondary text-slate-900 dark:text-secondary' : 'bg-red-50 dark:bg-red-500/20 border-red-200 dark:border-red-500 text-red-600 dark:text-red-500'
      ]">
        <span class="material-symbols-outlined text-2xl">
          {{ notification.type === 'success' ? 'check_circle' : 'error' }}
        </span>
        <p>{{ notification.message }}</p>
      </div>
    </Transition>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth'
import { useUserStore } from '@/stores/user'
import { usePublicAccess } from '@/composables/usePublicAccess'
import AppLayout from '@/components/layout/AppLayout.vue'

const { t } = useI18n()
const authStore = useAuthStore()
const userStore = useUserStore()
const { isAuthenticated } = usePublicAccess()

const sending = ref(false)
const notification = reactive({
  show: false,
  message: '',
  type: 'success'
})

const subjects = [
  { key: 'support', value: 'Suporte' },
  { key: 'technical', value: 'Técnico' },
  { key: 'questions', value: 'Dúvidas' },
  { key: 'partnerships', value: 'Parcerias' },
  { key: 'complaints', value: 'Reclamações' },
  { key: 'others', value: 'Outros' }
]

const form = reactive({
  name: '',
  email: '',
  phone: '',
  subject: '',
  message: ''
})

onMounted(() => {
  if (isAuthenticated.value) {
    if (userStore.profile?.nome) form.name = userStore.profile.nome
    if (authStore.user?.email) form.email = authStore.user.email
  }
})

function showNotification(message: string, type: 'success' | 'error' = 'success') {
  notification.message = message
  notification.type = type
  notification.show = true
  setTimeout(() => {
    notification.show = false
  }, 5000)
}

async function handleSubmit() {
  if (sending.value) return
  
  sending.value = true
  
  try {
    const { error } = await supabase.functions.invoke('send-email', {
      body: {
        to: 'admin@323network.com',
        subject: `[Contact Form] ${form.subject} - ${form.name}`,
        html: `
          <h1>New Contact Form Submission</h1>
          <p><strong>Name:</strong> ${form.name}</p>
          <p><strong>Email:</strong> ${form.email}</p>
          <p><strong>Phone:</strong> ${form.phone}</p>
          <p><strong>Subject:</strong> ${form.subject}</p>
          <hr />
          <h2>Message:</h2>
          <p>${form.message.replace(/\n/g, '<br>')}</p>
        `,
        fromName: form.name
      }
    })

    if (error) throw error

    showNotification(t('contact.successMessage'), 'success')
    
    // Reset form if not authenticated (keep user data if authenticated)
    if (!isAuthenticated.value) {
      form.name = ''
      form.email = ''
    }
    form.phone = ''
    form.subject = ''
    form.message = ''
    
  } catch (error: any) {
    console.error('Error sending email:', error)
    showNotification(t('contact.errorMessage'), 'error')
  } finally {
    sending.value = false
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translate(-50%, -20px);
}
</style>
