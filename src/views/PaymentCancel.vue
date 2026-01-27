<template>
  <AppLayout hideSidebars>
    <div class="min-h-[60vh] flex flex-col items-center justify-center px-4">
      <div class="flex flex-col items-center text-center max-w-md">
        <div class="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6">
          <span class="material-symbols-outlined text-4xl text-gray-400">close</span>
        </div>
        <h1 class="text-3xl font-bold text-white mb-3">{{ t('payment.cancel.title') }}</h1>
        <p class="text-gray-400 mb-6">
          {{ t('payment.cancel.description') }}
        </p>
        <div class="flex gap-4">
          <RouterLink
            :to="serviceId ? `/servicos?service=${serviceId}` : '/servicos'"
            class="px-6 py-3 rounded-lg bg-gradient-to-r from-primary to-secondary text-black font-bold transition-all hover:shadow-[0_0_20px_rgba(244,37,244,0.4)]"
          >
            {{ t('payment.cancel.tryAgain') }}
          </RouterLink>
          <RouterLink
            to="/"
            class="px-6 py-3 rounded-lg border border-white/10 text-gray-300 hover:bg-white/5 transition-colors"
          >
            {{ t('payment.cancel.backToHome') }}
          </RouterLink>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import AppLayout from '@/components/layout/AppLayout.vue'
import { useLocale } from '@/composables/useLocale'

const { t } = useLocale()
const route = useRoute()
const serviceId = computed(() => route.query.service_id as string)
</script>
