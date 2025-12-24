import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { usePlans } from '@/composables/usePlans'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { requiresGuest: true },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/Login.vue'),
    meta: { requiresGuest: true },
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: () => import('@/views/ForgotPassword.vue'),
    meta: { requiresGuest: true },
  },
  {
    path: '/reset-password',
    name: 'ResetPassword',
    component: () => import('@/views/ResetPassword.vue'),
    meta: { requiresGuest: true },
  },
  {
    path: '/membros',
    name: 'Members',
    component: () => import('@/views/Members.vue'),
  },
  {
    path: '/eventos',
    name: 'Events',
    component: () => import('@/views/Events.vue'),
  },
  {
    path: '/servicos',
    name: 'Services',
    component: () => import('@/views/Services.vue'),
  },
  {
    path: '/vagas',
    name: 'Jobs',
    component: () => import('@/views/Jobs.vue'),
  },
  {
    path: '/beneficios',
    name: 'Benefits',
    component: () => import('@/views/Benefits.vue'),
  },
  {
    path: '/perfil',
    name: 'Profile',
    component: () => import('@/views/Profile.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/upgrade',
    name: 'Upgrade',
    component: () => import('@/views/Upgrade.vue'),
    meta: { requiresAuth: true },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Guard de autenticação
router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore()
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiresGuest = to.matched.some(record => record.meta.requiresGuest)
  const requiresPlan = to.matched.some(record => record.meta.requiresPlan) ?
    (to.matched.find(record => record.meta.requiresPlan)?.meta.requiresPlan as string) : undefined

  // Páginas públicas que podem ser acessadas mesmo logado (forgot-password, reset-password)
  const publicPages = ['/forgot-password', '/reset-password']
  const isPublicPage = publicPages.includes(to.path)

  // Verificar se precisa de autenticação
  if (requiresAuth && !authStore.user) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
    return
  }

  // Verificar se precisa ser guest (não logado)
  // Mas permitir acesso a páginas públicas mesmo se logado
  if (requiresGuest && authStore.user && !isPublicPage) {
    next({ name: 'Home' })
    return
  }

  // Verificar se precisa de plano específico
  if (requiresPlan && authStore.user) {
    const { hasPlanAccessTo } = usePlans()
    if (!hasPlanAccessTo(requiresPlan as any)) {
      next({ name: 'Upgrade', query: { redirect: to.fullPath } })
      return
    }
  }

  next()
})

export default router

