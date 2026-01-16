<template>
  <div class="min-h-screen bg-background-light dark:bg-background-dark flex flex-col">
    <!-- Header - Full Width -->
    <div class="w-full fixed top-0 left-0 right-0 z-50">
      <AdminHeader />
    </div>

    <div class="flex flex-1 pt-16">
      <!-- Sidebar -->
      <div class="hidden lg:block fixed left-0 top-16 bottom-0 z-40">
        <AdminSidebar />
      </div>

      <!-- Main Content -->
      <div class="flex-1 lg:pl-64 flex flex-col min-h-[calc(100vh-4rem)] w-full pb-16 lg:pb-0">

        <!-- Main Content Area -->
        <main class="flex-1 p-6 lg:p-8 w-full">
          <div class="max-w-7xl mx-auto w-full">
            <slot />
          </div>
        </main>
      </div>
    </div>

    <!-- Mobile Menu - Sempre visível na parte inferior -->
    <div
      class="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-surface-dark border-t border-slate-200 dark:border-white/10 shadow-lg dark:shadow-[0_-4px_20px_rgba(244,37,244,0.2)] backdrop-blur-md lg:hidden"
    >
      <nav class="flex justify-around items-center h-20 px-2">
        <RouterLink
          v-for="item in mobileMenuItems"
          :key="item.path"
          :to="item.path"
          class="flex flex-col items-center justify-center transition-all flex-1 rounded-lg py-2 relative group gap-1"
          :class="$route.path === item.path 
            ? 'text-primary' 
            : 'text-slate-700 dark:text-white/60 hover:text-primary'"
        >
          <!-- Container com altura fixa para os ícones -->
          <div class="h-[22px] flex items-center justify-center">
            <span 
              class="material-symbols-outlined text-[22px] transition-all"
              :class="$route.path === item.path 
                ? 'drop-shadow-[0_0_8px_rgba(244,37,244,0.8)]' 
                : 'group-hover:drop-shadow-[0_0_8px_rgba(244,37,244,0.4)]'"
            >
              {{ item.icon }}
            </span>
          </div>
          <span class="text-[10px] font-medium transition-all leading-tight" :class="$route.path === item.path ? 'font-bold' : ''">
            {{ item.label }}
          </span>
          <!-- Badge para itens com notificações -->
          <span
            v-if="item.badge && item.badge > 0"
            class="absolute top-0 right-1/4 px-1.5 py-0.5 rounded-full text-[8px] font-bold"
            :class="item.badgeClass"
          >
            {{ item.badge }}
          </span>
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
import { computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useAdminStore } from '@/stores/admin'
import AdminHeader from './AdminHeader.vue'
import AdminSidebar from './AdminSidebar.vue'

const adminStore = useAdminStore()

// Carregar estatísticas para os badges
onMounted(async () => {
  await adminStore.fetchUserStats()
  await adminStore.fetchPostStats()
  await adminStore.fetchEventStats()
  await adminStore.fetchServiceStats()
})

// Menu items para mobile (parte inferior)
const mobileMenuItems = computed(() => [
  {
    path: '/admin',
    label: 'Overview',
    icon: 'dashboard',
    badge: undefined,
    badgeClass: '',
  },
  {
    path: '/admin/membros',
    label: 'Members',
    icon: 'people',
    badge: adminStore.userStats.pending > 0 ? adminStore.userStats.pending : undefined,
    badgeClass: 'bg-yellow-500/20 text-yellow-400',
  },
  {
    path: '/admin/posts',
    label: 'Posts',
    icon: 'article',
    badge: adminStore.postStats.pending > 0 ? adminStore.postStats.pending : undefined,
    badgeClass: 'bg-yellow-500/20 text-yellow-400',
  },
  {
    path: '/admin/eventos',
    label: 'Events',
    icon: 'event',
    badge: adminStore.stats.pending > 0 ? adminStore.stats.pending : undefined,
    badgeClass: 'bg-yellow-500/20 text-yellow-400',
  },
  {
    path: '/admin/servicos',
    label: 'Services',
    icon: 'business_center',
    badge: undefined,
    badgeClass: '',
  },
  {
    path: '/admin/programs',
    label: 'Programs',
    icon: 'school',
    badge: undefined,
    badgeClass: '',
  },
  {
    path: '/admin/palavras-proibidas',
    label: 'Words',
    icon: 'block',
    badge: undefined,
    badgeClass: '',
  },
])
</script>

