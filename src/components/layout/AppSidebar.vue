<template>
  <aside class="lg:sticky lg:top-20 h-fit space-y-6">
    <!-- Profile Card -->
    <div class="bg-white dark:bg-surface-dark rounded-xl p-6 relative overflow-hidden shadow-xl border-t border-slate-200 dark:border-gray-800 group">
      <!-- Neon glow effects -->
      <div class="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl rounded-full -mr-10 -mt-10 group-hover:bg-primary/20 transition-all duration-500"></div>
      <div class="absolute bottom-0 left-0 w-24 h-24 bg-secondary/10 blur-3xl rounded-full -ml-10 -mb-10 group-hover:bg-secondary/20 transition-all duration-500"></div>
      
      <div class="relative z-10">
        <h2 class="text-xl font-bold mb-1 text-slate-900 dark:text-white">{{ t('common.hello') }}, {{ userName }}!</h2>
        <p class="text-sm text-slate-500 dark:text-gray-400 mb-6">{{ t('profile.memberSince') }} {{ memberSinceYear }}</p>
        
        <button
          class="w-full bg-transparent border border-secondary text-secondary hover:bg-secondary hover:text-black font-bold py-2.5 px-4 rounded-lg transition-all shadow-lg shadow-secondary/10 hover:shadow-secondary/40"
          @click="$emit('edit-profile')"
        >
          {{ t('profile.editProfile') }}
        </button>
      </div>
    </div>

    <!-- Navigation Menu Card -->
    <div class="bg-white dark:bg-surface-dark rounded-xl p-4 shadow-xl border-t border-slate-200 dark:border-gray-800">
      <nav class="space-y-2">
        <RouterLink
          to="/"
          class="flex items-center px-4 py-3 text-sm rounded-lg transition-all"
          :class="$route.path === '/' 
            ? 'font-semibold bg-slate-100 dark:bg-surface-lighter text-primary dark:text-white border-l-4 border-secondary shadow-neon-blue/10' 
            : 'font-medium text-slate-500 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-surface-lighter hover:text-slate-900 dark:hover:text-white group'"
        >
          <span 
            class="material-icons-outlined mr-3 transition-colors"
            :class="$route.path === '/' ? 'text-secondary' : 'text-gray-500 group-hover:text-secondary'"
          >
            feed
          </span>
          {{ t('navigation.home') }}
        </RouterLink>
        <RouterLink
          to="/comunidade"
          class="flex items-center px-4 py-3 text-sm font-medium rounded-lg text-gray-400 hover:bg-surface-lighter hover:text-white group transition-all"
          :class="$route.path === '/membros' ? 'bg-slate-100 dark:bg-surface-lighter text-primary dark:text-white' : ''"
        >
          <span class="material-icons-outlined mr-3 text-gray-500 group-hover:text-secondary transition-colors">people_outline</span>
          {{ t('navigation.community') }}
        </RouterLink>
        <RouterLink
          to="/conexoes"
          class="flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all"
          :class="$route.path === '/conexoes' 
            ? 'font-semibold bg-slate-100 dark:bg-surface-lighter text-primary dark:text-white border-l-4 border-secondary shadow-neon-blue/10' 
            : 'text-slate-500 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-surface-lighter hover:text-slate-900 dark:hover:text-white group'"
        >
          <span 
            class="material-icons-outlined mr-3 transition-colors"
            :class="$route.path === '/conexoes' ? 'text-secondary' : 'text-gray-500 group-hover:text-secondary'"
          >
            groups
          </span>
          {{ t('navigation.myNetwork') }}
        </RouterLink>
        <RouterLink
          to="/desafios"
          class="flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all"
          :class="$route.path === '/desafios' 
            ? 'font-semibold bg-slate-100 dark:bg-surface-lighter text-primary dark:text-white border-l-4 border-secondary shadow-neon-blue/10' 
            : 'text-slate-500 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-surface-lighter hover:text-slate-900 dark:hover:text-white group'"
        >
          <span 
            class="material-icons-outlined mr-3 transition-colors"
            :class="$route.path === '/desafios' ? 'text-secondary' : 'text-gray-500 group-hover:text-secondary'"
          >
            emoji_events
          </span>
          {{ t('navigation.challenges') }}
        </RouterLink>
        <RouterLink
          to="/ranking"
          class="flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all"
          :class="$route.path === '/ranking' 
            ? 'font-semibold bg-slate-100 dark:bg-surface-lighter text-primary dark:text-white border-l-4 border-secondary shadow-neon-blue/10' 
            : 'text-slate-500 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-surface-lighter hover:text-slate-900 dark:hover:text-white group'"
        >
          <span 
            class="material-icons-outlined mr-3 transition-colors"
            :class="$route.path === '/ranking' ? 'text-secondary' : 'text-gray-500 group-hover:text-secondary'"
          >
            leaderboard
          </span>
          {{ t('navigation.ranking') }}
        </RouterLink>
        <RouterLink
          to="/eventos"
          class="flex items-center px-4 py-3 text-sm font-medium rounded-lg text-slate-500 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-surface-lighter hover:text-slate-900 dark:hover:text-white group transition-all"
        >
          <span class="material-icons-outlined mr-3 text-gray-500 group-hover:text-primary transition-colors">event</span>
          {{ t('navigation.savedEvents') }}
        </RouterLink>
        <RouterLink
          to="/meus-pedidos"
          class="flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all"
          :class="$route.path === '/meus-pedidos' 
            ? 'font-semibold bg-slate-100 dark:bg-surface-lighter text-primary dark:text-white border-l-4 border-primary shadow-neon-pink/10' 
            : 'text-slate-500 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-surface-lighter hover:text-slate-900 dark:hover:text-white group'"
        >
          <span class="material-icons-outlined mr-3 text-gray-500 group-hover:text-primary transition-colors">assignment</span>
          {{ t('navigation.myOrders') }}
        </RouterLink>
        <RouterLink
          to="/beneficios"
          class="flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all"
          :class="$route.path === '/beneficios' 
            ? 'font-semibold bg-slate-100 dark:bg-surface-lighter text-primary dark:text-white border-l-4 border-primary shadow-neon-pink/10' 
            : 'text-slate-500 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-surface-lighter hover:text-slate-900 dark:hover:text-white group'"
        >
          <span 
            class="material-icons-outlined mr-3 transition-colors"
            :class="$route.path === '/beneficios' ? 'text-primary' : 'text-gray-500 group-hover:text-primary'"
          >
            card_giftcard
          </span>
          {{ t('navigation.benefits') }}
        </RouterLink>
      </nav>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { useUserStore } from '@/stores/user'

defineEmits<{
  'edit-profile': []
}>()

const authStore = useAuthStore()
const userStore = useUserStore()
const { t } = useI18n()

// Pegar o primeiro nome do perfil, ou fallback para email
const userName = computed(() => {
  if (userStore.profile?.nome) {
    // Pegar apenas o primeiro nome
    const firstName = userStore.profile.nome.split(' ')[0]
    return firstName
  }
  // Fallback para email se não tiver nome
  return authStore.user?.email?.split('@')[0] || 'Usuário'
})

// Pegar o ano real de criação do perfil
const memberSinceYear = computed(() => {
  if (userStore.profile?.created_at) {
    const year = new Date(userStore.profile.created_at).getFullYear()
    return year
  }
  // Fallback para ano atual se não tiver created_at
  return new Date().getFullYear()
})

// Carregar perfil quando componente for montado
onMounted(async () => {
  if (authStore.user?.id && !userStore.profile) {
    await userStore.fetchProfile(authStore.user.id)
  }
})
</script>
