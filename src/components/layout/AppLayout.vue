<template>
  <div class="min-h-screen bg-background-light dark:bg-background-dark flex flex-col">
    <AppHeader />

    <main
      class="max-w-7xl mx-auto px-4 sm:px-6 lg:pl-0 lg:pr-8 py-8 flex-1 pb-20 lg:pb-8 min-h-[calc(100vh-200px)]"
    >
      <div :class="hideSidebars ? 'w-full' : 'grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12'">
        <!-- Sidebar Esquerda - Desktop -->
        <div v-if="!hideSidebars" class="hidden lg:block lg:col-span-2 -ml-32">
          <div class="w-[280px]">
            <AppSidebar @edit-profile="handleEditProfile" />
          </div>
        </div>

        <!-- Conteúdo Principal -->
        <div :class="hideSidebars ? 'w-full max-w-[1400px] mx-auto' : 'lg:col-span-8'">
          <slot />
        </div>

        <!-- Sidebar Direita -->
        <div v-if="!hideSidebars" class="hidden lg:block lg:col-span-2 -mr-32">
          <div class="w-[280px] ml-auto">
            <AppRightSidebar />
          </div>
        </div>
      </div>
    </main>

    <AppFooter />

    <!-- Mobile Menu - Sempre visível -->
    <div
      class="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 shadow-lg lg:hidden"
    >
      <nav class="flex justify-around items-center h-16 px-2">
        <RouterLink
          v-for="item in mobileMenuItems"
          :key="item.path"
          :to="item.path"
          class="flex flex-col items-center justify-center text-slate-600 hover:text-primary transition-colors flex-1"
          :class="$route.path === item.path ? 'text-primary' : ''"
        >
          <span class="material-symbols-outlined text-[24px]">{{ item.icon }}</span>
          <span class="text-[10px] mt-0.5 font-medium">{{ item.label }}</span>
        </RouterLink>
      </nav>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute, RouterLink } from 'vue-router'
import AppHeader from './AppHeader.vue'
import AppSidebar from './AppSidebar.vue'
import AppRightSidebar from './AppRightSidebar.vue'
import AppFooter from './AppFooter.vue'

const router = useRouter()
const route = useRoute()

// Hide sidebars on Members, MemberProfile, Services, and Benefits pages
const hideSidebars = computed(() => {
  return route.path === '/membros' || route.path.startsWith('/membros/') || route.path === '/servicos' || route.path === '/beneficios'
})

function handleEditProfile() {
  router.push('/perfil')
}

const mobileMenuItems = [
  { path: '/', label: 'Home', icon: 'home' },
  { path: '/membros', label: 'Membros', icon: 'people' },
  { path: '/eventos', label: 'Eventos', icon: 'event' },
  { path: '/servicos', label: 'Serviços', icon: 'business_center' },
  { path: '/beneficios', label: 'Benefícios', icon: 'card_giftcard' },
  { path: '/perfil', label: 'Perfil', icon: 'person' },
]
</script>
