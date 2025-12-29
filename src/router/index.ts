import { watch } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { usePlans } from '@/composables/usePlans'
import { useUserStore } from '@/stores/user'

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
    path: '/comunidade',
    name: 'Members',
    component: () => import('@/views/Members.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/comunidade/:id',
    name: 'MemberProfile',
    component: () => import('@/views/MemberProfile.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/eventos',
    name: 'Events',
    component: () => import('@/views/Events.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/eventos/:id',
    name: 'EventDetail',
    component: () => import('@/views/EventDetail.vue'),
  },
  {
    path: '/eventos/calendario',
    name: 'EventCalendar',
    component: () => import('@/views/EventCalendar.vue'),
  },
  {
    path: '/servicos',
    name: 'Services',
    component: () => import('@/views/Services.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/meus-pedidos',
    name: 'MyRequests',
    component: () => import('@/views/MyRequests.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/vagas',
    name: 'Jobs',
    component: () => import('@/views/Jobs.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/beneficios',
    name: 'Benefits',
    component: () => import('@/views/Benefits.vue'),
    meta: { requiresAuth: true },
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
  {
    path: '/conexoes',
    name: 'Connections',
    component: () => import('@/views/Connections.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/pagamento/sucesso',
    name: 'PaymentSuccess',
    component: () => import('@/views/PaymentSuccess.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/pagamento/cancelado',
    name: 'PaymentCancel',
    component: () => import('@/views/PaymentCancel.vue'),
    meta: { requiresAuth: true },
  },
    {
      path: '/admin',
      name: 'AdminOverview',
      component: () => import('@/views/admin/AdminOverview.vue'),
      meta: { requiresAuth: true, requiresRole: 'admin' },
    },
    {
      path: '/admin/eventos',
      name: 'AdminEvents',
      component: () => import('@/views/admin/AdminEvents.vue'),
      meta: { requiresAuth: true, requiresRole: 'admin' },
    },
    {
      path: '/admin/membros',
      name: 'AdminMembers',
      component: () => import('@/views/admin/AdminMembers.vue'),
      meta: { requiresAuth: true, requiresRole: 'admin' },
    },
    {
      path: '/admin/posts',
      name: 'AdminPosts',
      component: () => import('@/views/admin/AdminPosts.vue'),
      meta: { requiresAuth: true, requiresRole: 'admin' },
    },
  {
    path: '/parceiro/eventos',
    name: 'PartnerEvents',
    component: () => import('@/views/partner/PartnerEvents.vue'),
    meta: { requiresAuth: true, requiresRole: 'partner' },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Guard de autenticação
router.beforeEach(async (to, from, next) => {
  // #region agent log
  fetch('http://127.0.0.1:7246/ingest/0e16ca07-47b3-4e57-90f8-e4c32947f7f6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'router/index.ts:140',message:'Router guard triggered',data:{to:to.path,from:from.path,hasUser:!!useAuthStore().user},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})}).catch(()=>{});
  // #endregion

  const authStore = useAuthStore()

  // Aguardar inicialização do Firebase/Supabase se necessário
  if (!authStore.initialized) {
    // Criar uma promessa que resolve quando o store estiver inicializado
    await new Promise<void>((resolve) => {
      const stop = watch(
        () => authStore.initialized,
        (val: boolean) => {
          if (val) {
            stop()
            resolve()
          }
        },
        { immediate: true }
      )
    })
  }

  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiresGuest = to.matched.some(record => record.meta.requiresGuest)
  const requiresPlan = to.matched.some(record => record.meta.requiresPlan) ?
    (to.matched.find(record => record.meta.requiresPlan)?.meta.requiresPlan as string) : undefined

  // Páginas públicas que podem ser acessadas mesmo logado (forgot-password, reset-password)
  const publicPages = ['/forgot-password', '/reset-password']
  const isPublicPage = publicPages.includes(to.path)

  // Verificar se precisa de autenticação
  if (requiresAuth && !authStore.user) {
    // #region agent log
    fetch('http://127.0.0.1:7246/ingest/0e16ca07-47b3-4e57-90f8-e4c32947f7f6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'router/index.ts:171',message:'Redirecting to login (requiresAuth)',data:{to:to.path},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H'})}).catch(()=>{});
    // #endregion
    next({ name: 'Login', query: { redirect: to.fullPath } })
    return
  }

  // Verificar se precisa ser guest (não logado)
  // Mas permitir acesso a páginas públicas mesmo se logado
  if (requiresGuest && authStore.user && !isPublicPage) {
    // #region agent log
    fetch('http://127.0.0.1:7246/ingest/0e16ca07-47b3-4e57-90f8-e4c32947f7f6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'router/index.ts:178',message:'Redirecting to home (requiresGuest)',data:{to:to.path},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'I'})}).catch(()=>{});
    // #endregion
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

  // Verificar se precisa de role específico
  const requiresRole = to.matched.some(record => record.meta.requiresRole) ?
    (to.matched.find(record => record.meta.requiresRole)?.meta.requiresRole as string) : undefined

  if (requiresRole && authStore.user) {
    const userStore = useUserStore()

    // Se profile não estiver carregado, buscar
    if (!userStore.profile) {
      await userStore.fetchProfile(authStore.user.id)
    }

    const userRole: string = userStore.profile?.role || 'user'

    // Admin pode acessar tudo
    if (userRole !== 'admin') {
      // Verificar se tem a role necessária
      if (requiresRole === 'admin') {
        next({ name: 'Home' })
        return
      }
      if (requiresRole === 'partner' && userRole !== 'partner') {
        next({ name: 'Home' })
        return
      }
    }
  }

  // #region agent log
  fetch('http://127.0.0.1:7246/ingest/0e16ca07-47b3-4e57-90f8-e4c32947f7f6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'router/index.ts:219',message:'Router guard allowing navigation',data:{to:to.path},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'J'})}).catch(()=>{});
  // #endregion

  next()
})

export default router

