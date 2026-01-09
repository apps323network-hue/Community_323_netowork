<template>
  <aside class="w-64 bg-white dark:bg-surface-dark border-r border-slate-200 dark:border-white/10 h-full flex flex-col">
    <!-- Navigation Menu -->
    <nav class="flex-1 px-4 py-6 space-y-1">
      <RouterLink
        v-for="item in menuItems"
        :key="item.path"
        :to="item.path"
        class="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all group"
        :class="isActive(item.path)
          ? 'bg-primary/10 dark:bg-primary/20 text-primary border-l-4 border-primary shadow-lg shadow-primary/20'
          : 'text-slate-700 dark:text-white/60 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5'"
        @click="handleClick"
      >
        <span class="material-symbols-outlined text-xl">{{ item.icon }}</span>
        <span>{{ item.label }}</span>
        <span
          v-if="item.badge && item.badge > 0"
          class="ml-auto px-2 py-0.5 rounded-full text-xs font-bold"
          :class="item.badgeClass"
        >
          {{ item.badge }}
        </span>
      </RouterLink>
    </nav>

    <!-- Footer Info -->
    <div class="px-4 py-4 border-t border-slate-200 dark:border-white/10">
      <div class="text-xs text-slate-500 dark:text-white/40 text-center">
        <p>Admin Dashboard</p>
        <p class="mt-1">v1.0.0</p>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useAdminStore } from '@/stores/admin'

const route = useRoute()
const adminStore = useAdminStore()

// Carregar estatísticas para os badges
onMounted(async () => {
  await adminStore.fetchUserStats()
  await adminStore.fetchPostStats()
  await adminStore.fetchEventStats()
  await adminStore.fetchReportStats()
  await adminStore.fetchChallengeStats()
})

const menuItems = computed(() => [
  {
    path: '/admin',
    label: 'Overview',
    icon: 'dashboard',
    badge: undefined,
    badgeClass: '',
  },
  {
    path: '/admin/membros',
    label: 'Membros',
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
    label: 'Eventos',
    icon: 'event',
    badge: adminStore.stats.pending > 0 ? adminStore.stats.pending : undefined,
    badgeClass: 'bg-yellow-500/20 text-yellow-400',
  },
  {
    path: '/admin/servicos',
    label: 'Serviços',
    icon: 'business_center',
    badge: undefined,
    badgeClass: '',
  },
  {
    path: '/admin/programs',
    label: 'Programas',
    icon: 'school',
    badge: undefined, // Poderíamos adicionar badge de pendentes se houvesse revisão
    badgeClass: '',
  },
  {
    path: '/admin/cupons',
    label: 'Cupons',
    icon: 'local_offer',
    badge: undefined,
    badgeClass: '',
  },
  {
    path: '/admin/subscriptions',
    label: 'Assinaturas',
    icon: 'card_membership',
    badge: undefined,
    badgeClass: '',
  },
  {
    path: '/admin/palavras-proibidas',
    label: 'Palavras Proibidas',
    icon: 'block',
    badge: undefined,
    badgeClass: '',
  },
  {
    path: '/admin/reports',
    label: 'Reports',
    icon: 'report',
    badge: adminStore.reportStats.pending > 0 ? adminStore.reportStats.pending : undefined,
    badgeClass: 'bg-yellow-500/20 text-yellow-400',
  },
  {
    path: '/admin/desafios',
    label: 'Desafios',
    icon: 'emoji_events',
    badge: undefined,
    badgeClass: '',
  },
])

function isActive(path: string) {
  if (path === '/admin') {
    return route.path === '/admin'
  }
  return route.path === path || route.path.startsWith(path + '/')
}

function handleClick() {
  // Fechar sidebar no mobile se necessário
  emit('navigate')
}

const emit = defineEmits<{
  navigate: []
}>()
</script>

