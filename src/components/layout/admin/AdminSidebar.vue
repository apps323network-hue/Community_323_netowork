<template>
  <aside class="w-64 bg-white dark:bg-surface-dark border-r border-slate-200 dark:border-white/10 h-full flex flex-col">
    <!-- Navigation Menu -->
    <nav class="flex-1 px-4 py-8 space-y-2 overflow-y-auto custom-scrollbar">
      <div v-for="item in menuItems" :key="item.id" class="space-y-1">
        <!-- Traditional Link -->
        <RouterLink
          v-if="!item.dropdown"
          :to="item.path!"
          class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 group relative overflow-hidden"
          :class="isActive(item.path!)
            ? 'bg-primary/10 text-primary shadow-sm'
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-primary dark:hover:text-white'"
          @click="handleClick"
        >
          <span 
            v-if="isActive(item.path!)"
            class="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-full"
          ></span>
          <span class="material-symbols-outlined text-[22px] transition-transform group-hover:scale-110">{{ item.icon }}</span>
          <span class="flex-1">{{ item.label }}</span>
          
          <span
            v-if="item.badge && item.badge > 0"
            class="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter"
            :class="item.badgeClass"
          >
            {{ item.badge }}
          </span>
        </RouterLink>

        <!-- Dropdown Group -->
        <div v-else class="space-y-1">
          <button
            @click="toggleDropdown(item.id)"
            class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 group relative"
            :class="isParentActive(item)
              ? 'bg-slate-100/50 dark:bg-white/5 text-slate-900 dark:text-white'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-primary dark:hover:text-white'"
          >
            <span 
              v-if="isParentActive(item)"
              class="absolute left-0 top-3 bottom-3 w-1 bg-primary/40 rounded-full"
            ></span>
            <span class="material-symbols-outlined text-[22px] transition-transform group-hover:scale-110">{{ item.icon }}</span>
            <span class="flex-1 text-left">{{ item.label }}</span>
            
            <span
              v-if="calculateTotalBadge(item) > 0"
              class="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter bg-primary/10 text-primary"
            >
              {{ calculateTotalBadge(item) }}
            </span>

            <span 
              class="material-symbols-outlined text-xl transition-transform duration-300"
              :class="{ 'rotate-180': dropdownOpen[item.id] }"
            >
              expand_more
            </span>
          </button>

          <!-- Sub Items Container -->
          <div 
            class="overflow-hidden transition-all duration-300 ease-in-out"
            :style="{ 
              maxHeight: dropdownOpen[item.id] ? (item.dropdown.length * 52) + 'px' : '0px',
              opacity: dropdownOpen[item.id] ? '1' : '0'
            }"
          >
            <div class="pl-4 py-1 space-y-1 border-l ml-6 border-slate-100 dark:border-white/5">
              <RouterLink
                v-for="sub in item.dropdown"
                :key="sub.path"
                :to="sub.path"
                class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all duration-200"
                :class="isActive(sub.path)
                  ? 'text-primary'
                  : 'text-slate-500 dark:text-slate-500 hover:text-primary dark:hover:text-white'"
              >
                <span class="w-1.5 h-1.5 rounded-full" :class="isActive(sub.path) ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-700'"></span>
                {{ sub.label }}
                <span
                  v-if="sub.badge && sub.badge > 0"
                  class="ml-auto px-1.5 py-0.5 rounded-md text-[9px] font-black"
                  :class="sub.badgeClass"
                >
                  {{ sub.badge }}
                </span>
              </RouterLink>
            </div>
          </div>
        </div>
      </div>
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
import { ref, computed, onMounted, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useAdminStore } from '@/stores/admin'

interface SidebarSubItem {
  path: string
  label: string
  badge?: number
  badgeClass?: string
}

interface SidebarItem {
  id: string
  label: string
  icon: string
  path?: string
  dropdown?: SidebarSubItem[]
  badge?: number
  badgeClass?: string
}

const route = useRoute()
const adminStore = useAdminStore()
const dropdownOpen = ref<Record<string, boolean>>({})

// Carregar estatísticas para os badges
onMounted(async () => {
  await Promise.all([
    adminStore.fetchUserStats(),
    adminStore.fetchPostStats(),
    adminStore.fetchEventStats(),
    adminStore.fetchReportStats(),
    adminStore.fetchChallengeStats()
  ])
  
  // Abrir dropdown se item ativo estiver dentro dele
  checkAndOpenActiveDropdown()
})

watch(() => route.path, () => {
  checkAndOpenActiveDropdown()
})

const menuItems = computed<SidebarItem[]>(() => [
  {
    id: 'dashboard',
    path: '/admin',
    label: 'Overview',
    icon: 'dashboard',
  },
  {
    id: 'community',
    label: 'Community',
    icon: 'forum',
    dropdown: [
      {
        path: '/admin/membros',
        label: 'Members',
        badge: adminStore.userStats.pending > 0 ? adminStore.userStats.pending : undefined,
        badgeClass: 'bg-yellow-500/20 text-yellow-500',
      },
      {
        path: '/admin/posts',
        label: 'Posts',
        badge: adminStore.postStats.pending > 0 ? adminStore.postStats.pending : undefined,
        badgeClass: 'bg-yellow-500/20 text-yellow-500',
      },
      {
        path: '/admin/eventos',
        label: 'Events',
        badge: adminStore.stats.pending > 0 ? adminStore.stats.pending : undefined,
        badgeClass: 'bg-yellow-500/20 text-yellow-500',
      }
    ]
  },
  {
    id: 'education',
    label: 'Education',
    icon: 'school',
    dropdown: [
      { path: '/admin/programs', label: 'Programs' },
      { path: '/admin/desafios', label: 'Challenges' },
      { path: '/admin/servicos', label: 'Services' }
    ]
  },
  {
    id: 'finance',
    label: 'Finance',
    icon: 'payments',
    dropdown: [
      { path: '/admin/subscriptions', label: 'Subscriptions' },
      { path: '/admin/cupons', label: 'Coupons' }
    ]
  },
  {
    id: 'legal',
    label: 'Legal',
    icon: 'gavel',
    dropdown: [
      { path: '/admin/termos-gerenciar', label: 'Terms Management' },
      { path: '/admin/termos-aceitos', label: 'Acceptance Logs' }
    ]
  },
  {
    id: 'safety',
    label: 'Moderation',
    icon: 'security',
    dropdown: [
      {
        path: '/admin/reports',
        label: 'Reports',
        badge: adminStore.reportStats.pending > 0 ? adminStore.reportStats.pending : undefined,
        badgeClass: 'bg-red-500/20 text-red-500',
      },
      { path: '/admin/palavras-proibidas', label: 'Banned Words' }
    ]
  }
])

function toggleDropdown(id: string) {
  const item = menuItems.value.find(i => i.id === id)
  const isCurrentlyActive = item ? isParentActive(item) : false
  
  // Se for o dropdown ativo, não permitimos fechar via clique no header 
  // para manter a consistência de "não fechar o item ativo"
  if (isCurrentlyActive && dropdownOpen.value[id]) {
    return
  }
  
  dropdownOpen.value[id] = !dropdownOpen.value[id]
}

function isActive(path: string) {
  if (path === '/admin') return route.path === '/admin'
  return route.path === path || route.path.startsWith(path + '/')
}

function isParentActive(item: SidebarItem) {
  if (item.path) return isActive(item.path)
  if (item.dropdown) {
    return item.dropdown.some(sub => isActive(sub.path))
  }
  return false
}

function checkAndOpenActiveDropdown() {
  menuItems.value.forEach(item => {
    if (item.dropdown && item.dropdown.some(sub => isActive(sub.path))) {
      dropdownOpen.value[item.id] = true
    }
  })
}

function calculateTotalBadge(item: SidebarItem) {
  if (!item.dropdown) return 0
  return item.dropdown.reduce((total, sub) => total + (sub.badge || 0), 0)
}

function handleClick() {
  emit('navigate')
}

const emit = defineEmits<{
  navigate: []
}>()
</script>

