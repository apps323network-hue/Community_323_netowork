<template>
  <header
    class="sticky top-0 z-50 bg-white/90 dark:bg-surface-dark/90 backdrop-blur-md border-b border-slate-200 dark:border-gray-800/50 shadow-sm w-full"
  >
    <nav :class="[
      'w-full mx-auto px-4 sm:px-6 lg:px-8',
      (route.path === '/' || route.path === '/comunidade' || route.path.startsWith('/comunidade/') || route.path === '/servicos' || route.path === '/beneficios' || route.path === '/eventos' || route.path.startsWith('/eventos/') || route.path === '/perfil')
        ? 'max-w-[1400px]'
        : 'max-w-7xl'
    ]">
      <div class="flex items-center justify-between h-20">
        <!-- Logo -->
        <RouterLink to="/" class="flex-shrink-0 flex items-center gap-2 cursor-pointer group">
          <div
            class="text-3xl font-display font-extrabold tracking-tighter flex items-center transform group-hover:scale-105 transition-transform"
          >
            <span class="text-primary dark:text-secondary">(323</span>
            <span
              class="material-icons-outlined text-primary dark:text-secondary mx-1 animate-pulse"
              style="font-size: 1.2em"
              >play_arrow</span
            >
            <span
              class="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary font-extrabold"
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
                  ? 'text-slate-900 dark:text-white'
                  : 'text-slate-500 dark:text-gray-400 hover:text-primary dark:hover:text-secondary'
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
              to="/comunidade"
              class="relative px-3 py-2 text-sm font-medium transition-colors group"
              :class="
                route.path === '/comunidade'
                  ? 'text-slate-900 dark:text-white'
                  : 'text-slate-500 dark:text-gray-400 hover:text-primary dark:hover:text-secondary'
              "
            >
              Comunidade
              <span
                v-if="route.path === '/comunidade'"
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
                  ? 'text-slate-900 dark:text-white'
                  : 'text-slate-500 dark:text-gray-400 hover:text-primary dark:hover:text-secondary'
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
                  ? 'text-slate-900 dark:text-white'
                  : 'text-slate-500 dark:text-gray-400 hover:text-primary dark:hover:text-secondary'
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
                  ? 'text-slate-900 dark:text-white'
                  : 'text-slate-500 dark:text-gray-400 hover:text-primary dark:hover:text-secondary'
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
          </div>
        </div>

        <!-- Mobile Theme Toggle -->
        <div class="md:hidden flex items-center">
          <AnimatedThemeToggler />
        </div>

        <!-- User Menu -->
        <div class="hidden md:flex items-center gap-5">
          <AnimatedThemeToggler />
          <NotificationsDropdown />
          <div class="relative group cursor-pointer" ref="userMenuContainer">
            <div class="flex items-center gap-2 lg:gap-3" @click.stop="toggleUserMenu">
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
                  class="text-sm font-bold text-slate-900 dark:text-white group-hover:text-primary dark:group-hover:text-secondary transition-colors"
                >
                  {{ userDisplayName }}
                </p>
                <p class="text-xs text-slate-500 dark:text-gray-400 truncate">{{ userTitle }}</p>
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
                    to="/conexoes"
                    class="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-surface-lighter transition-colors"
                    @click="showUserMenu = false"
                  >
                    <span class="material-symbols-outlined text-[20px]">groups</span>
                    Minha Rede
                  </RouterLink>
                  <RouterLink
                    to="/meus-servicos"
                    class="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-surface-lighter transition-colors"
                    @click="showUserMenu = false"
                  >
                    <span class="material-symbols-outlined text-[20px]">shopping_bag</span>
                    Meus Serviços
                  </RouterLink>
                  <RouterLink
                    to="/perfil"
                    class="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-surface-lighter transition-colors"
                    @click="showUserMenu = false"
                  >
                    <span class="material-symbols-outlined text-[20px]">person</span>
                    Meu Perfil
                  </RouterLink>
                  <!-- Dashboard Admin (apenas para admins) -->
                  <div v-if="isAdmin" class="border-t border-slate-200 dark:border-white/10 mt-1 pt-1">
                    <RouterLink
                      to="/admin/membros"
                      class="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-primary dark:text-secondary hover:bg-primary/10 dark:hover:bg-secondary/10 transition-colors"
                      @click="showUserMenu = false"
                    >
                      <span class="material-symbols-outlined text-[20px]">dashboard</span>
                      Dashboard Admin
                    </RouterLink>
                  </div>
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

      </div>
    </nav>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useUserStore } from '@/stores/user'
import Avatar from '@/components/ui/Avatar.vue'
import AnimatedThemeToggler from '@/components/ui/AnimatedThemeToggler.vue'
import NotificationsDropdown from '@/components/layout/NotificationsDropdown.vue'

const route = useRoute()
const router = useRouter()
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
const isAdmin = computed(() => userStore.profile?.role === 'admin')

function toggleUserMenu() {
  showUserMenu.value = !showUserMenu.value
}

const isLoggingOut = ref(false)

async function handleLogout() {
  // #region agent log
  fetch('http://127.0.0.1:7246/ingest/0e16ca07-47b3-4e57-90f8-e4c32947f7f6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AppHeader.vue:262',message:'handleLogout called',data:{isLoggingOut:isLoggingOut.value},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion

  // Prevenir múltiplos cliques
  if (isLoggingOut.value) {
    // #region agent log
    fetch('http://127.0.0.1:7246/ingest/0e16ca07-47b3-4e57-90f8-e4c32947f7f6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AppHeader.vue:266',message:'Logout already in progress, returning',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    return
  }

  isLoggingOut.value = true
  showUserMenu.value = false

  // #region agent log
  fetch('http://127.0.0.1:7246/ingest/0e16ca07-47b3-4e57-90f8-e4c32947f7f6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AppHeader.vue:272',message:'Clearing auth state',data:{hasUser:!!authStore.user},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
  // #endregion

  // Limpar estado local imediatamente para feedback visual rápido
  authStore.user = null
  const userStore = useUserStore()
  userStore.clearProfile()

  // #region agent log
  fetch('http://127.0.0.1:7246/ingest/0e16ca07-47b3-4e57-90f8-e4c32947f7f6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AppHeader.vue:277',message:'Calling signOut',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
  // #endregion

  // Fazer signOut primeiro
  try {
    await authStore.signOut()
    // #region agent log
    fetch('http://127.0.0.1:7246/ingest/0e16ca07-47b3-4e57-90f8-e4c32947f7f6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AppHeader.vue:282',message:'signOut completed, redirecting to login',data:{currentPath:route.path},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
  } catch (err: any) {
    // #region agent log
    fetch('http://127.0.0.1:7246/ingest/0e16ca07-47b3-4e57-90f8-e4c32947f7f6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AppHeader.vue:285',message:'signOut error, but redirecting anyway',data:{error:err?.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    // Ignorar erros - vamos redirecionar mesmo assim
  }

  // #region agent log
  fetch('http://127.0.0.1:7246/ingest/0e16ca07-47b3-4e57-90f8-e4c32947f7f6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AppHeader.vue:290',message:'Redirecting to login page',data:{targetPath:'/login'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
  // #endregion

  // Redirecionar para página de login usando router
  router.push({ name: 'Login' })
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
