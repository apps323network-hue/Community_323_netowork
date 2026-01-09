<template>
  <div class="bg-surface-dark/80 backdrop-blur rounded-2xl p-6 border border-input-border">
    <h3 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
      <span class="material-symbols-outlined text-text-muted">settings</span>
      {{ t('profile.settingsTitle') }}
    </h3>
    <div class="space-y-4">
      <!-- Public Profile Toggle -->
      <div class="flex items-center justify-between py-2 p-3 rounded-lg hover:bg-white/5 transition-colors">
        <div>
          <p class="text-white font-medium text-sm">{{ t('profile.publicProfile') }}</p>
          <p class="text-text-muted text-xs">{{ t('profile.publicProfileDesc') }}</p>
        </div>
        <button
          @click="$emit('toggle-public')"
          :class="[
            'w-12 h-6 rounded-full relative transition-all focus:outline-none',
            isPublic
              ? 'bg-secondary/20 border border-secondary shadow-[0_0_8px_rgba(0,240,255,0.3)]'
              : 'bg-input-bg border border-text-muted/30'
          ]"
        >
          <span
            :class="[
              'absolute top-0.5 w-4 h-4 rounded-full transition-transform',
              isPublic
                ? 'right-1 bg-secondary shadow-[0_0_5px_rgba(0,240,255,0.8)]'
                : 'left-1 bg-text-muted'
            ]"
          ></span>
        </button>
      </div>

      <!-- Show WhatsApp Toggle -->
      <div class="flex items-center justify-between py-2 p-3 rounded-lg hover:bg-white/5 transition-colors">
        <div>
          <p class="text-white font-medium text-sm">{{ t('profile.showWhatsApp') }}</p>
          <p class="text-text-muted text-xs">{{ t('profile.showWhatsAppDesc') }}</p>
        </div>
        <button
          @click="$emit('toggle-whatsapp')"
          :class="[
            'w-12 h-6 rounded-full relative transition-all focus:outline-none',
            showWhatsapp
              ? 'bg-secondary/20 border border-secondary shadow-[0_0_8px_rgba(0,240,255,0.3)]'
              : 'bg-input-bg border border-text-muted/30'
          ]"
        >
          <span
            :class="[
              'absolute top-0.5 w-4 h-4 rounded-full transition-transform',
              showWhatsapp
                ? 'right-1 bg-secondary shadow-[0_0_5px_rgba(0,240,255,0.8)]'
                : 'left-1 bg-text-muted'
            ]"
          ></span>
        </button>
      </div>

      <!-- Show Email Toggle -->
      <div class="flex items-center justify-between py-2 p-3 rounded-lg hover:bg-white/5 transition-colors">
        <div>
          <p class="text-white font-medium text-sm">{{ t('profile.showEmail') }}</p>
          <p class="text-text-muted text-xs">{{ t('profile.showEmailDesc') }}</p>
        </div>
        <button
          @click="$emit('toggle-email')"
          :class="[
            'w-12 h-6 rounded-full relative transition-all focus:outline-none',
            showEmail
              ? 'bg-secondary/20 border border-secondary shadow-[0_0_8px_rgba(0,240,255,0.3)]'
              : 'bg-input-bg border border-text-muted/30'
          ]"
        >
          <span
            :class="[
              'absolute top-0.5 w-4 h-4 rounded-full transition-transform',
              showEmail
                ? 'right-1 bg-secondary shadow-[0_0_5px_rgba(0,240,255,0.8)]'
                : 'left-1 bg-text-muted'
            ]"
          ></span>
        </button>
      </div>

      <!-- Subscription Management (Only for Premium) -->
      <div v-if="isPremium" class="mt-8 pt-6 border-t border-input-border">
        <div class="bg-gradient-to-br from-secondary/10 to-primary/10 rounded-xl p-4 border border-secondary/20">
          <div class="flex items-center gap-3 mb-3">
            <span class="material-symbols-outlined text-secondary">workspace_premium</span>
            <p class="text-white font-bold text-sm">Assinatura Premium Ativa</p>
          </div>
          <p class="text-text-muted text-xs mb-4">
            Gerencie sua assinatura, métodos de pagamento e visualize seu histórico de faturas diretamente no portal do Stripe.
          </p>
          <button
            @click="$emit('manage-subscription')"
            class="w-full py-2.5 rounded-lg bg-secondary/20 border border-secondary text-secondary font-bold text-xs hover:bg-secondary hover:text-white transition-all shadow-[0_0_10px_rgba(0,240,255,0.2)] flex items-center justify-center gap-2"
          >
            <span class="material-symbols-outlined text-sm">payments</span>
            Gerenciar Assinatura e Faturamento
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineProps<{
  isPublic?: boolean
  showWhatsapp?: boolean
  showEmail?: boolean
  isPremium?: boolean
}>()

defineEmits<{
  (e: 'toggle-public'): void
  (e: 'toggle-whatsapp'): void
  (e: 'toggle-email'): void
  (e: 'manage-subscription'): void
}>()
</script>
