<template>
  <div class="min-h-screen bg-background-light dark:bg-background-dark flex flex-col">
    <AppHeader />
    
    <main class="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 pb-20 lg:pb-8 min-h-[calc(100vh-200px)] w-full">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <!-- Sidebar Esquerda -->
        <div class="hidden lg:block lg:col-span-3 xl:col-span-2">
          <AppSidebar @edit-profile="handleEditProfile" />
        </div>
        
        <!-- Conteúdo Principal -->
        <div class="lg:col-span-6 xl:col-span-8">
          <slot />
        </div>
        
        <!-- Sidebar Direita -->
        <div class="hidden lg:block lg:col-span-3 xl:col-span-2">
          <AppRightSidebar />
        </div>
      </div>
    </main>
    
    <AppFooter />
    
    <!-- Mobile Menu - Sempre visível -->
    <div class="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-surface-dark border-t border-slate-200 dark:border-white/10 shadow-[0_-4px_20px_rgba(244,37,244,0.2)] backdrop-blur-md lg:hidden">
      <nav class="flex justify-around items-center h-16 px-2">
        <RouterLink
          v-for="item in mobileMenuItems"
          :key="item.path"
          :to="item.path"
          class="flex flex-col items-center justify-center transition-all flex-1 rounded-lg py-2 relative group"
          :class="$route.path === item.path 
            ? 'text-primary' 
            : 'text-slate-500 dark:text-white/60 hover:text-primary'"
        >
          <span 
            class="material-symbols-outlined text-[24px] transition-all"
            :class="$route.path === item.path 
              ? 'drop-shadow-[0_0_8px_rgba(244,37,244,0.8)]' 
              : 'group-hover:drop-shadow-[0_0_8px_rgba(244,37,244,0.4)]'"
          >
            {{ item.icon }}
          </span>
          <span class="text-[10px] mt-0.5 font-medium">{{ item.label }}</span>
          <!-- Indicador ativo -->
          <span
            v-if="$route.path === item.path"
            class="absolute top-0 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full bg-primary shadow-[0_0_8px_rgba(244,37,244,0.8)]"
          ></span>
        </RouterLink>
      </nav>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { RouterLink } from 'vue-router'
import AppHeader from './AppHeader.vue'
import AppSidebar from './AppSidebar.vue'
import AppRightSidebar from './AppRightSidebar.vue'
import AppFooter from './AppFooter.vue'

const router = useRouter()

function handleEditProfile() {
  router.push('/perfil')
}

const mobileMenuItems = [
  { path: '/', label: 'Home', icon: 'home' },
  { path: '/comunidade', label: 'Comunidade', icon: 'people' },
  { path: '/eventos', label: 'Eventos', icon: 'event' },
  { path: '/servicos', label: 'Serviços', icon: 'business_center' },
  { path: '/beneficios', label: 'Benefícios', icon: 'card_giftcard' },
]
</script>



