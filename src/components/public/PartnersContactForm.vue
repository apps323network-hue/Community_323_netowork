<template>
  <section 
    id="contact-form" 
    ref="sectionRef"
    class="py-16 sm:py-20 md:py-24 bg-white dark:bg-surface-dark"
  >
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Title -->
      <div 
        ref="headerRef"
        class="text-center mb-12 section-reveal"
        :class="{ 'revealed': headerVisible }"
      >
        <h2 class="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4">
          {{ t('partners.contact.title') }}
        </h2>
        <p class="text-lg text-slate-600 dark:text-gray-400">
          {{ t('partners.contact.description') }}
        </p>
        <div class="w-24 h-1 bg-neon-gradient mx-auto rounded-full mt-4"></div>
      </div>

      <!-- Form -->
      <form 
        ref="formRef"
        @submit.prevent="handleSubmit" 
        class="space-y-6 form-reveal"
        :class="{ 'revealed': formVisible }"
      >
        <!-- Name -->
        <div>
          <label for="name" class="block text-sm font-bold text-slate-900 dark:text-white mb-2">
            {{ t('partners.contact.name') }} <span class="text-primary dark:text-secondary">*</span>
          </label>
          <input
            id="name"
            v-model="form.name"
            type="text"
            required
            :placeholder="t('partners.contact.namePlaceholder')"
            class="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-surface-lighter text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 focus:shadow-lg focus:shadow-primary/20"
          />
        </div>

        <!-- Company -->
        <div>
          <label for="company" class="block text-sm font-bold text-slate-900 dark:text-white mb-2">
            {{ t('partners.contact.company') }} <span class="text-primary dark:text-secondary">*</span>
          </label>
          <input
            id="company"
            v-model="form.company"
            type="text"
            required
            :placeholder="t('partners.contact.companyPlaceholder')"
            class="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-surface-lighter text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 focus:shadow-lg focus:shadow-primary/20"
          />
        </div>

        <!-- Email -->
        <div>
          <label for="email" class="block text-sm font-bold text-slate-900 dark:text-white mb-2">
            {{ t('partners.contact.email') }} <span class="text-primary dark:text-secondary">*</span>
          </label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            required
            :placeholder="t('partners.contact.emailPlaceholder')"
            class="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-surface-lighter text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 focus:shadow-lg focus:shadow-primary/20"
          />
        </div>

        <!-- Phone (Optional) -->
        <div>
          <label for="phone" class="block text-sm font-bold text-slate-900 dark:text-white mb-2">
            {{ t('partners.contact.phone') }}
          </label>
          <input
            id="phone"
            v-model="form.phone"
            type="tel"
            :placeholder="t('partners.contact.phonePlaceholder')"
            class="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-surface-lighter text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 focus:shadow-lg focus:shadow-primary/20"
          />
        </div>

        <!-- Subject -->
        <div>
          <label for="subject" class="block text-sm font-bold text-slate-900 dark:text-white mb-2">
            {{ t('partners.contact.subject') }} <span class="text-primary dark:text-secondary">*</span>
          </label>
          <select
            id="subject"
            v-model="form.subject"
            required
            class="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-surface-lighter text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 focus:shadow-lg focus:shadow-primary/20"
          >
            <option value="">{{ t('partners.contact.subjectPlaceholder') }}</option>
            <option value="sponsorship">{{ t('partners.contact.subjects.sponsorship') }}</option>
            <option value="partnership">{{ t('partners.contact.subjects.partnership') }}</option>
            <option value="naming">{{ t('partners.contact.subjects.naming') }}</option>
            <option value="other">{{ t('partners.contact.subjects.other') }}</option>
          </select>
        </div>

        <!-- Message -->
        <div>
          <label for="message" class="block text-sm font-bold text-slate-900 dark:text-white mb-2">
            {{ t('partners.contact.message') }} <span class="text-primary dark:text-secondary">*</span>
          </label>
          <textarea
            id="message"
            v-model="form.message"
            required
            rows="6"
            :placeholder="t('partners.contact.messagePlaceholder')"
            class="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-surface-lighter text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 resize-none focus:shadow-lg focus:shadow-primary/20"
          ></textarea>
        </div>

        <!-- Submit Button -->
        <div class="pt-4">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            :full-width="true"
            :loading="submitting"
          >
            <span class="material-icons-outlined mr-2">send</span>
            {{ t('partners.contact.submit') }}
          </Button>
        </div>
      </form>

      <!-- Alternative Contact -->
      <div class="mt-12 pt-12 border-t border-slate-200 dark:border-slate-800 text-center">
        <p class="text-slate-600 dark:text-gray-400 mb-4">
          {{ t('partners.contact.alternative') }}
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            :href="`https://wa.me/13239791990`"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-bold transition-all duration-300 transform hover:-translate-y-0.5"
          >
            <span class="material-icons-outlined">chat</span>
            {{ t('partners.contact.whatsapp') }}
          </a>
          <a
            href="mailto:admin@323network.com"
            class="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-surface-lighter border border-slate-200 dark:border-slate-700 hover:border-primary dark:hover:border-primary text-slate-900 dark:text-white rounded-lg font-bold transition-all duration-300 transform hover:-translate-y-0.5"
          >
            <span class="material-icons-outlined">email</span>
            admin@323network.com
          </a>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { toast } from 'vue-sonner'
import Button from '@/components/ui/Button.vue'
import { sendPartnerContactEmail } from '@/lib/emails'

const { t } = useI18n()

const sectionRef = ref<HTMLElement | null>(null)
const headerRef = ref<HTMLElement | null>(null)
const formRef = ref<HTMLElement | null>(null)

const headerVisible = ref(false)
const formVisible = ref(false)

let observer: IntersectionObserver | null = null

const submitting = ref(false)

const form = ref({
  name: '',
  company: '',
  email: '',
  phone: '',
  subject: '',
  message: '',
})

async function handleSubmit() {
  if (!form.value.name || !form.value.company || !form.value.email || !form.value.subject || !form.value.message) {
    toast.error('Por favor, preencha todos os campos obrigatórios')
    return
  }

  submitting.value = true

  try {
    const result = await sendPartnerContactEmail({
      name: form.value.name,
      company: form.value.company,
      email: form.value.email,
      phone: form.value.phone || undefined,
      subject: form.value.subject,
      message: form.value.message,
    })

    if (result.success) {
      toast.success('Mensagem enviada com sucesso!', {
        description: 'Entraremos em contato em breve.',
        duration: 5000,
      })
      
      // Reset form
      form.value = {
        name: '',
        company: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
      }
    } else {
      throw new Error(result.error?.message || 'Erro ao enviar mensagem')
    }
  } catch (error: any) {
    console.error('Error submitting contact form:', error)
    toast.error('Erro ao enviar mensagem', {
      description: error.message || 'Por favor, tente novamente mais tarde.',
      duration: 5000,
    })
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (entry.target === headerRef.value) {
            headerVisible.value = true
          }
          if (entry.target === formRef.value) {
            formVisible.value = true
          }
          observer?.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.15 }
  )

  if (headerRef.value) observer.observe(headerRef.value)
  if (formRef.value) observer.observe(formRef.value)
})

onUnmounted(() => {
  observer?.disconnect()
})
</script>

<style scoped>
/* Section reveal animation */
.section-reveal {
  opacity: 0;
  transform: translateY(40px);
  filter: blur(8px);
  transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1),
              transform 0.8s cubic-bezier(0.16, 1, 0.3, 1),
              filter 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

.section-reveal.revealed {
  opacity: 1;
  transform: translateY(0);
  filter: blur(0);
}

/* Form reveal animation */
.form-reveal {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1),
              transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
  transition-delay: 0.2s;
}

.form-reveal.revealed {
  opacity: 1;
  transform: translateY(0);
}

/* Reduce motion for accessibility */
@media (prefers-reduced-motion: reduce) {
  .section-reveal,
  .form-reveal {
    opacity: 1;
    transform: none;
    filter: none;
    transition: none;
  }
}
</style>

