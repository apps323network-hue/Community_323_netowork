<template>
  <aside class="sticky top-20 h-fit space-y-6">
    <!-- Profile Card -->
    <div class="bg-surface-dark dark:bg-surface-dark rounded-xl p-6 relative overflow-hidden shadow-xl border-t border-gray-100 dark:border-gray-800 group">
      <!-- Neon glow effects -->
      <div class="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl rounded-full -mr-10 -mt-10 group-hover:bg-primary/20 transition-all duration-500"></div>
      <div class="absolute bottom-0 left-0 w-24 h-24 bg-secondary/10 blur-3xl rounded-full -ml-10 -mb-10 group-hover:bg-secondary/20 transition-all duration-500"></div>
      
      <div class="relative z-10">
        <h2 class="text-xl font-bold mb-1 text-white">Olá, {{ userName }}! 👋</h2>
        <p class="text-sm text-gray-400 mb-6">Membro desde 2023</p>
        
        <div class="flex justify-between items-center bg-surface-lighter p-4 rounded-lg mb-6 border border-gray-800">
          <span class="text-xs font-semibold text-gray-400 uppercase tracking-wide">Profile Views</span>
          <span class="text-secondary font-black text-lg text-glow-blue">1.2k</span>
        </div>
        
        <button
          class="w-full bg-transparent border border-secondary text-secondary hover:bg-secondary hover:text-black font-bold py-2.5 px-4 rounded-lg transition-all shadow-lg shadow-secondary/10 hover:shadow-secondary/40"
          @click="$emit('edit-profile')"
        >
          Editar Perfil
        </button>
      </div>
    </div>

    <!-- Navigation Menu Card -->
    <div class="bg-surface-light dark:bg-surface-dark rounded-xl p-4 shadow-xl border-t border-gray-100 dark:border-gray-800">
      <nav class="space-y-2">
        <RouterLink
          to="/"
          class="flex items-center px-4 py-3 text-sm rounded-lg transition-all"
          :class="$route.path === '/' 
            ? 'font-semibold bg-surface-lighter text-white border-l-4 border-secondary shadow-neon-blue/10' 
            : 'font-medium text-gray-400 hover:bg-surface-lighter hover:text-white group'"
        >
          <span 
            class="material-icons-outlined mr-3 transition-colors"
            :class="$route.path === '/' ? 'text-secondary' : 'text-gray-500 group-hover:text-secondary'"
          >
            feed
          </span>
          Feed Principal
        </RouterLink>
        <RouterLink
          to="/membros"
          class="flex items-center px-4 py-3 text-sm font-medium rounded-lg text-gray-400 hover:bg-surface-lighter hover:text-white group transition-all"
        >
          <span class="material-icons-outlined mr-3 text-gray-500 group-hover:text-secondary transition-colors">groups</span>
          Minha Rede
        </RouterLink>
        <RouterLink
          to="/eventos"
          class="flex items-center px-4 py-3 text-sm font-medium rounded-lg text-gray-400 hover:bg-surface-lighter hover:text-white group transition-all"
        >
          <span class="material-icons-outlined mr-3 text-gray-500 group-hover:text-primary transition-colors">event</span>
          Eventos Salvos
        </RouterLink>
        <RouterLink
          to="/vagas"
          class="flex items-center px-4 py-3 text-sm font-medium rounded-lg text-gray-400 hover:bg-surface-lighter hover:text-white group transition-all"
        >
          <span class="material-icons-outlined mr-3 text-gray-500 group-hover:text-secondary transition-colors">business_center</span>
          Oportunidades
        </RouterLink>
        <RouterLink
          to="/meus-pedidos"
          class="flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all"
          :class="$route.path === '/meus-pedidos' 
            ? 'font-semibold bg-surface-lighter text-white border-l-4 border-primary shadow-neon-pink/10' 
            : 'text-gray-400 hover:bg-surface-lighter hover:text-white group'"
        >
          <span class="material-icons-outlined mr-3 text-gray-500 group-hover:text-primary transition-colors">assignment</span>
          Meus Pedidos
        </RouterLink>
        <RouterLink
          to="/beneficios"
          class="flex items-center px-4 py-3 text-sm font-medium rounded-lg text-gray-400 hover:bg-surface-lighter hover:text-white group transition-all"
        >
          <span class="material-icons-outlined mr-3 text-gray-500 group-hover:text-secondary transition-colors">card_giftcard</span>
          Benefícios
        </RouterLink>
      </nav>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

defineEmits<{
  'edit-profile': []
}>()

const authStore = useAuthStore()

const userName = computed(() => authStore.user?.email?.split('@')[0] || 'Usuário')
</script>
