<template>
  <header class="sticky top-0 z-50 bg-surface-dark/95 backdrop-blur-md border-b border-white/10 shadow-lg w-full">
    <div class="w-full px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16 max-w-full">
        <!-- Logo e Nome do Dashboard -->
        <div class="flex items-center gap-4">
          <RouterLink to="/admin" class="flex items-center gap-2 group">
            <div class="text-2xl font-black tracking-tighter flex items-center transform group-hover:scale-105 transition-transform">
              <span class="text-primary">(323</span>
              <span class="material-icons-outlined text-primary mx-1 animate-pulse" style="font-size: 1.2em">play_arrow</span>
              <span class="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary font-black">ADMIN</span>
            </div>
          </RouterLink>
          <div class="hidden md:block h-6 w-px bg-white/10"></div>
          <div class="hidden md:block">
            <p class="text-sm text-white/60">Dashboard de Administração</p>
          </div>
        </div>

        <!-- Right Side: Theme Toggle, Notifications, User Menu -->
        <div class="flex items-center gap-4">
          <AnimatedThemeToggler />
          <NotificationsDropdown />
          
          <!-- User Menu -->
          <div class="relative group cursor-pointer" ref="userMenuContainer">
            <div class="flex items-center gap-2" @click.stop="toggleUserMenu">
              <div class="relative">
                <div class="absolute -inset-0.5 bg-gradient-to-r from-primary to-secondary rounded-full blur opacity-75 group-hover:opacity-100 transition duration-200"></div>
                <Avatar
                  :src="userAvatar"
                  :name="userName"
                  size="sm"
                  class="relative border-2 border-white"
                />
              </div>
              <div class="hidden lg:block text-left">
                <p class="text-sm font-bold text-white">{{ userDisplayName }}</p>
                <p class="text-xs text-white/60">Admin</p>
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
                class="absolute right-0 mt-2 w-56 rounded-xl bg-surface-dark border border-white/10 shadow-2xl z-50 overflow-hidden"
                @click.stop
              >
                <div class="p-2">
                  <RouterLink
                    to="/"
                    class="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-white/80 hover:bg-white/5 transition-colors"
                    @click="showUserMenu = false"
                  >
                    <span class="material-symbols-outlined text-[20px]">home</span>
                    Voltar ao Site
                  </RouterLink>
                  <RouterLink
                    to="/perfil"
                    class="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-white/80 hover:bg-white/5 transition-colors"
                    @click="showUserMenu = false"
                  >
                    <span class="material-symbols-outlined text-[20px]">person</span>
                    Meu Perfil
                  </RouterLink>
                  <div class="border-t border-white/10 my-1"></div>
                  <button
                    @click="handleLogout"
                    class="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors text-left"
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
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useUserStore } from '@/stores/user'
import Avatar from '@/components/ui/Avatar.vue'
import AnimatedThemeToggler from '@/components/ui/AnimatedThemeToggler.vue'
import NotificationsDropdown from '@/components/layout/NotificationsDropdown.vue'

const router = useRouter()
const authStore = useAuthStore()
const userStore = useUserStore()

const showUserMenu = ref(false)
const userMenuContainer = ref<HTMLElement | null>(null)

const userName = computed(() => authStore.user?.email?.split('@')[0] || 'Admin')
const userAvatar = computed(
  () => userStore.profile?.avatar_url || authStore.user?.user_metadata?.avatar_url || ''
)
const userDisplayName = computed(() => userStore.profile?.nome || userName.value)

function toggleUserMenu() {
  showUserMenu.value = !showUserMenu.value
}

async function handleLogout() {
  showUserMenu.value = false
  await authStore.signOut()
  router.push({ name: 'Login' })
}

function handleClickOutside(event: MouseEvent) {
  if (userMenuContainer.value && !userMenuContainer.value.contains(event.target as Node)) {
    showUserMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

