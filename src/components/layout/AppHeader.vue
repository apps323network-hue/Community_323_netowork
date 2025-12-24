<template>
  <header
    class="sticky top-0 z-50 bg-white/90 dark:bg-surface-dark/90 backdrop-blur-md border-b border-slate-200 dark:border-gray-800/50 shadow-sm"
  >
    <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-20">
        <!-- Logo -->
        <RouterLink to="/" class="flex-shrink-0 flex items-center gap-2 cursor-pointer group">
          <div
            class="text-3xl font-black tracking-tighter flex items-center transform group-hover:scale-105 transition-transform"
          >
            <span class="text-primary dark:text-secondary">(323</span>
            <span
              class="material-icons-outlined text-primary dark:text-secondary mx-1 animate-pulse"
              style="font-size: 1.2em"
              >play_arrow</span
            >
            <span
              class="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary font-black"
              >NETWORK</span
            >
          </div>
        </RouterLink>

        <!-- Navigation Links - Desktop -->
        <div class="hidden md:block">
          <div class="ml-10 flex items-baseline space-x-6">
            <RouterLink
              to="/"
              class="relative px-3 py-2 text-sm font-bold transition-all"
              :class="
                route.path === '/'
                  ? 'text-white dark:text-white'
                  : 'text-gray-400 dark:text-gray-400 hover:text-primary dark:hover:text-secondary'
              "
            >
              Home
              <span
                v-if="route.path === '/'"
                class="absolute bottom-0 left-0 w-full h-0.5 bg-primary dark:bg-secondary transform scale-x-100 transition-transform"
              ></span>
              <span
                v-else
                class="absolute bottom-0 left-0 w-full h-0.5 bg-primary dark:bg-secondary transform scale-x-0 group-hover:scale-x-100 transition-transform"
              ></span>
            </RouterLink>
            <RouterLink
              to="/membros"
              class="relative px-3 py-2 text-sm font-medium transition-colors group"
              :class="
                route.path === '/membros'
                  ? 'text-white dark:text-white'
                  : 'text-gray-400 dark:text-gray-400 hover:text-primary dark:hover:text-secondary'
              "
            >
              Comunidade
              <span
                v-if="route.path === '/membros'"
                class="absolute bottom-0 left-0 w-full h-0.5 bg-primary dark:bg-secondary transform scale-x-100 transition-transform"
              ></span>
              <span
                v-else
                class="absolute bottom-0 left-0 w-full h-0.5 bg-primary dark:bg-secondary transform scale-x-0 group-hover:scale-x-100 transition-transform"
              ></span>
            </RouterLink>
            <RouterLink
              to="/eventos"
              class="relative px-3 py-2 text-sm font-medium transition-colors group"
              :class="
                route.path === '/eventos'
                  ? 'text-white dark:text-white'
                  : 'text-gray-400 dark:text-gray-400 hover:text-primary dark:hover:text-secondary'
              "
            >
              Eventos
              <span
                v-if="route.path === '/eventos'"
                class="absolute bottom-0 left-0 w-full h-0.5 bg-primary dark:bg-secondary transform scale-x-100 transition-transform"
              ></span>
              <span
                v-else
                class="absolute bottom-0 left-0 w-full h-0.5 bg-primary dark:bg-secondary transform scale-x-0 group-hover:scale-x-100 transition-transform"
              ></span>
            </RouterLink>
            <RouterLink
              to="/servicos"
              class="relative px-3 py-2 text-sm font-medium transition-colors group"
              :class="
                route.path === '/servicos'
                  ? 'text-white dark:text-white'
                  : 'text-gray-400 dark:text-gray-400 hover:text-primary dark:hover:text-secondary'
              "
            >
              Serviços
              <span
                v-if="route.path === '/servicos'"
                class="absolute bottom-0 left-0 w-full h-0.5 bg-primary dark:bg-secondary transform scale-x-100 transition-transform"
              ></span>
              <span
                v-else
                class="absolute bottom-0 left-0 w-full h-0.5 bg-primary dark:bg-secondary transform scale-x-0 group-hover:scale-x-100 transition-transform"
              ></span>
            </RouterLink>
            <RouterLink
              to="/beneficios"
              class="relative px-3 py-2 text-sm font-medium transition-colors group"
              :class="
                route.path === '/beneficios'
                  ? 'text-white dark:text-white'
                  : 'text-gray-400 dark:text-gray-400 hover:text-primary dark:hover:text-secondary'
              "
            >
              Benefícios
              <span
                v-if="route.path === '/beneficios'"
                class="absolute bottom-0 left-0 w-full h-0.5 bg-primary dark:bg-secondary transform scale-x-100 transition-transform"
              ></span>
              <span
                v-else
                class="absolute bottom-0 left-0 w-full h-0.5 bg-primary dark:bg-secondary transform scale-x-0 group-hover:scale-x-100 transition-transform"
              ></span>
            </RouterLink>
            <RouterLink
              to="/vagas"
              class="relative px-3 py-2 text-sm font-medium transition-colors group"
              :class="
                route.path === '/vagas'
                  ? 'text-white dark:text-white'
                  : 'text-gray-400 dark:text-gray-400 hover:text-primary dark:hover:text-secondary'
              "
            >
              Jobs
              <span
                v-if="route.path === '/vagas'"
                class="absolute bottom-0 left-0 w-full h-0.5 bg-primary dark:bg-secondary transform scale-x-100 transition-transform"
              ></span>
              <span
                v-else
                class="absolute bottom-0 left-0 w-full h-0.5 bg-primary dark:bg-secondary transform scale-x-0 group-hover:scale-x-100 transition-transform"
              ></span>
            </RouterLink>
          </div>
        </div>

        <!-- User Menu -->
        <div class="hidden md:flex items-center gap-5">
          <AnimatedThemeToggler />
          <button
            class="relative p-2 rounded-full text-slate-600 dark:text-gray-400 hover:text-primary dark:hover:text-secondary transition-colors group"
          >
            <span class="material-icons-outlined">notifications</span>
            <span
              v-if="hasNotifications"
              class="absolute top-2 right-2 block h-2 w-2 rounded-full bg-primary ring-2 ring-white dark:ring-surface-dark animate-pulse"
            ></span>
          </button>
          <div class="relative group cursor-pointer" ref="userMenuContainer">
            <div class="flex items-center gap-3" @click.stop="toggleUserMenu">
              <div class="relative">
                <div
                  class="absolute -inset-0.5 bg-gradient-to-r from-primary to-secondary rounded-full blur opacity-75 group-hover:opacity-100 transition duration-200"
                ></div>
                <Avatar
                  :src="userAvatar"
                  :name="userName"
                  size="md"
                  class="relative border-2 border-white dark:border-surface-dark"
                />
              </div>
              <div class="text-left hidden lg:block">
                <p
                  class="text-sm font-bold text-white dark:text-white group-hover:text-primary dark:group-hover:text-secondary transition-colors"
                >
                  {{ userDisplayName }}
                </p>
                <p class="text-xs text-gray-400 dark:text-gray-400">{{ userTitle }}</p>
              </div>
            </div>

            <!-- Dropdown Menu -->
            <Transition
              enter-active-class="transition-all duration-200"
              enter-from-class="opacity-0 scale-95 translate-y-2"
              enter-to-class="opacity-100 scale-100 translate-y-0"
              leave-active-class="transition-all duration-200"
              leave-from-class="opacity-100 scale-100 translate-y-0"
              leave-to-class="opacity-0 scale-95 translate-y-2"
            >
              <div
                v-if="showUserMenu"
                class="absolute right-0 mt-2 w-56 rounded-xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 shadow-2xl z-50 overflow-hidden"
                @click.stop
              >
                <div class="p-2">
                  <RouterLink
                    to="/perfil"
                    class="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-surface-lighter transition-colors"
                    @click="showUserMenu = false"
                  >
                    <span class="material-symbols-outlined text-[20px]">person</span>
                    Meu Perfil
                  </RouterLink>
                  <button
                    @click="handleLogout"
                    class="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors text-left"
                  >
                    <span class="material-symbols-outlined text-[20px]">logout</span>
                    Sair
                  </button>
                </div>
              </div>
            </Transition>
          </div>
        </div>

        <!-- Mobile menu button -->
        <div class="md:hidden -mr-2 flex">
          <button
            class="inline-flex items-center justify-center p-2 rounded-md text-primary dark:text-secondary hover:text-white hover:bg-gray-800 focus:outline-none"
            type="button"
          >
            <span class="material-icons-outlined">menu</span>
          </button>
        </div>
      </div>
    </nav>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useUserStore } from '@/stores/user'
import Avatar from '@/components/ui/Avatar.vue'
import AnimatedThemeToggler from '@/components/ui/AnimatedThemeToggler.vue'

const route = useRoute()
const authStore = useAuthStore()
// Theme toggle is now handled by AnimatedThemeToggler component

const showUserMenu = ref(false)
const userMenuContainer = ref<HTMLElement | null>(null)

const userStore = useUserStore()

const userName = computed(() => authStore.user?.email?.split('@')[0] || 'Usuário')
const userAvatar = computed(
  () => userStore.profile?.avatar_url || authStore.user?.user_metadata?.avatar_url || ''
)
const userDisplayName = computed(() => userStore.profile?.nome || userName.value)
const userTitle = computed(() => userStore.profile?.area_atuacao || 'Membro')
const hasNotifications = computed(() => false) // TODO: implementar notificações

function toggleUserMenu() {
  showUserMenu.value = !showUserMenu.value
}

const isLoggingOut = ref(false)

async function handleLogout() {
  // Prevenir múltiplos cliques
  if (isLoggingOut.value) {
    return
  }

  isLoggingOut.value = true
  showUserMenu.value = false

  // Limpar estado local imediatamente para feedback visual rápido
  authStore.user = null
  const userStore = useUserStore()
  userStore.clearProfile()

  // Redirecionar imediatamente - o signOut pode acontecer em background
  window.location.href = '/login'

  // Tentar fazer signOut em background (não esperar)
  authStore.signOut().catch(() => {
    // Ignorar erros - já redirecionamos
  })
}

function handleClickOutside(event: MouseEvent) {
  if (userMenuContainer.value && !userMenuContainer.value.contains(event.target as Node)) {
    showUserMenu.value = false
  }
}

onMounted(() => {
  // Usar setTimeout para evitar que o evento de click que abriu o menu também o feche
  setTimeout(() => {
    document.addEventListener('click', handleClickOutside)
  }, 0)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
