<template>
  <div class="min-h-screen bg-background-light dark:bg-background-dark flex flex-col">
    <AppHeader />

    <main
      :class="[
        'mx-auto flex-1 min-h-[calc(100vh-200px)] w-full',
        fluid ? 'pb-20 xl:pb-0' : 'pb-20 xl:pb-8',
        hideSidebars 
          ? `${isHeroHeroPage ? 'pt-0' : 'pt-8'} ${fluid ? 'px-0' : 'px-4 sm:px-6 xl:px-8 max-w-[1440px]'}` 
          : 'max-w-[1440px] py-8 px-4 sm:px-6 xl:px-8'
      ]"
    >
      <div :class="hideSidebars ? 'w-full' : 'grid grid-cols-1 xl:grid-cols-12 gap-8'">
        <!-- Sidebar Esquerda - Desktop -->
        <div v-if="!hideSidebars" class="hidden xl:block xl:col-span-3 xl:col-span-2">
          <AppSidebar v-if="!hideSidebars" @edit-profile="handleEditProfile" />
        </div>

        <!-- Conteúdo Principal -->
        <div :class="hideSidebars ? `w-full ${isHeroHeroPage ? 'pt-0' : ''}` : 'xl:col-span-6 xl:col-span-8'">
          <slot />
        </div>

        <!-- Sidebar Direita -->
        <div v-if="!hideSidebars" class="hidden xl:block xl:col-span-3 xl:col-span-2">
          <AppRightSidebar v-if="!hideSidebars" />
        </div>
      </div>
    </main>

    <AppFooter v-if="$route.path === '/'" />



    <!-- Mobile Menu - Sempre visível -->
    <div
      class="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-surface-dark border-t border-slate-200 dark:border-white/10 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] dark:shadow-[0_-4px_20px_rgba(244,37,244,0.2)] backdrop-blur-md xl:hidden"
    >
      <nav class="flex justify-around items-center h-20 px-2">
        <RouterLink
          v-for="item in mobileMenuItems"
          :key="item.path"
          :to="item.path"
          class="flex flex-col items-center justify-center transition-all flex-1 rounded-lg py-2 relative group gap-1"
          :class="isActive(item.path) 
            ? 'text-primary' 
            : 'text-slate-500 dark:text-white/60 hover:text-primary'"
        >
          <!-- Container com altura fixa para os ícones -->
          <div class="h-[22px] flex items-center justify-center">
            <span 
              class="material-symbols-outlined transition-all text-[22px]"
              :class="isActive(item.path) ? 'drop-shadow-[0_0_8px_rgba(244,37,244,0.8)]' : 'group-hover:drop-shadow-[0_0_8px_rgba(244,37,244,0.4)]'"
            >
              {{ item.icon }}
            </span>
          </div>

          <!-- Label do item -->
          <span 
            class="text-[10px] font-medium transition-all leading-tight"
            :class="isActive(item.path) ? 'font-bold' : ''"
          >
            {{ item.label }}
          </span>

          <!-- Indicador ativo -->
          <span
            v-if="isActive(item.path)"
            class="absolute top-0 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full bg-primary shadow-[0_0_8px_rgba(244,37,244,0.8)]"
          ></span>
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
import { useLocale } from '@/composables/useLocale'


const props = defineProps<{
  hideSidebars?: boolean
  fluid?: boolean
}>()

const router = useRouter()
const route = useRoute()
const { t } = useLocale()

// Hide sidebars on Members, MemberProfile, Services, Benefits, Events, and Profile pages
// Also check if prop is passed
const hideSidebars = computed(() => {
  return props.hideSidebars || 
    route.path === '/comunidade' || 
    route.path.startsWith('/comunidade/') || 
    route.path === '/servicos' || 
    route.path === '/beneficios' || 
    route.path === '/eventos' || 
    route.path.startsWith('/eventos/') ||
    route.path === '/programs' ||
    route.path.startsWith('/programs/') ||
    route.path.startsWith('/professor') ||
    route.path === '/perfil'
})

// Remove top padding only for Events and Programs pages (Hero style)
const isHeroHeroPage = computed(() => {
  return route.path === '/eventos' || 
         route.path.startsWith('/eventos/') ||
         route.path === '/programs' ||
         route.path.startsWith('/programs/') ||
         route.path === '/pagamento/sucesso' ||
         route.path === '/subscription'
})

function handleEditProfile() {
  router.push('/perfil')
}

// Helper to check if a route is active (including sub-routes)
function isActive(path: string) {
  if (path === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(path)
}

const mobileMenuItems = computed(() => [
  { path: '/', label: t('navigation.home'), icon: 'home' },
  { path: '/comunidade', label: t('navigation.community'), icon: 'people' },
  { path: '/programs', label: t('navigation.programs'), icon: 'play_arrow' },
  { path: '/eventos', label: t('navigation.events'), icon: 'event' },
  { path: '/servicos', label: t('navigation.services'), icon: 'business_center' },
])
</script>
