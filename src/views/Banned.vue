<template>
  <div class="min-h-screen bg-slate-100 dark:bg-background-dark flex items-center justify-center p-4">
    <div class="max-w-md w-full">
      <Card class="text-center p-8 bg-white dark:bg-surface-card border border-slate-200 dark:border-white/10">
        <div class="mb-6">
          <div class="w-20 h-20 mx-auto bg-red-500/20 rounded-full flex items-center justify-center mb-4">
            <span class="material-symbols-outlined text-red-500 text-5xl">block</span>
          </div>
          <h1 class="text-3xl font-black text-slate-900 dark:text-white mb-2">Conta Suspensa</h1>
          <p class="text-slate-600 dark:text-white/60">Sua conta foi banida permanentemente</p>
        </div>

        <div v-if="reason" class="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
          <p class="text-sm text-slate-700 dark:text-white/80"><strong>Motivo:</strong> {{ reason }}</p>
        </div>

        <p class="text-slate-600 dark:text-white/60 mb-6">
          Você violou nossos termos de uso e não pode mais acessar a plataforma. 
          Se acredita que isso é um erro, entre em contato com nossa equipe.
        </p>

        <button
          @click="handleLogout"
          class="w-full px-6 py-3 bg-slate-800 hover:bg-slate-900 dark:bg-white/10 dark:hover:bg-white/20 text-white rounded-lg transition-colors"
        >
          Sair
        </button>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useUserStore } from '@/stores/user'
import Card from '@/components/ui/Card.vue'

const router = useRouter()
const authStore = useAuthStore()
const userStore = useUserStore()

const reason = computed(() => (userStore.profile as any)?.rejection_reason || 'Violação dos termos de uso')

async function handleLogout() {
  await authStore.signOut()
  router.push('/login')
}
</script>
