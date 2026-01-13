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
    meta: { publicAccess: true, limitedForGuests: true },
  },
  {
    path: '/posts-salvos',
    name: 'SavedPosts',
    component: () => import('@/views/SavedPosts.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/hashtag/:hashtag',
    name: 'HashtagPage',
    component: () => import('@/views/HashtagPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/feed/:postId',
    name: 'PostDetail',
    component: () => import('@/views/PostDetail.vue'),
    meta: { requiresAuth: true },
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
    path: '/brasileiro-nos-eua',
    name: 'LandingPage',
    component: () => import('@/views/landing/LandingPage.vue'),
    meta: { isLanding: true },
  },
  {
    path: '/reset-password',
    name: 'ResetPassword',
    component: () => import('@/views/ResetPassword.vue'),
    // Não usar requiresGuest pois o Supabase cria uma sessão temporária durante recovery
  },
  {
    path: '/termos',
    name: 'Terms',
    component: () => import('@/views/Terms.vue'),
    meta: { publicAccess: true },
  },
  {
    path: '/politica-privacidade',
    name: 'PrivacyPolicy',
    component: () => import('@/views/PrivacyPolicy.vue'),
    meta: { publicAccess: true },
  },
  {
    path: '/auth/callback',
    name: 'AuthCallback',
    component: () => import('@/views/AuthCallback.vue'),
    // Página pública - não requer autenticação
  },
  {
    path: '/onboarding',
    name: 'Onboarding',
    component: () => import('@/views/Onboarding.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/parceiros',
    name: 'PartnersLanding',
    component: () => import('@/views/public/PartnersLanding.vue'),
    // Rota pública - não requer autenticação
  },
  {
    path: '/venture-prep',
    name: 'VenturePrep',
    component: () => import('@/views/VenturePrep.vue'),
    // Rota pública - não requer autenticação
  },
  {
    path: '/banned',
    name: 'Banned',
    component: () => import('@/views/Banned.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/comunidade',
    name: 'Members',
    component: () => import('@/views/Members.vue'),
    meta: { publicAccess: true, limitedForGuests: true },
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
    meta: { publicAccess: true },
  },
  {
    path: '/eventos/:id',
    name: 'EventDetail',
    component: () => import('@/views/EventDetail.vue'),
    meta: { publicAccess: true },
  },
  {
    path: '/eventos/calendario',
    name: 'EventCalendar',
    component: () => import('@/views/EventCalendar.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/eventos/anteriores',
    name: 'PastEvents',
    component: () => import('@/views/PastEvents.vue'),
    meta: { publicAccess: true },
  },
  {
    path: '/servicos',
    name: 'Services',
    component: () => import('@/views/Services.vue'),
    meta: { publicAccess: true },
  },
  {
    path: '/servicos/:id',
    name: 'ServiceDetail',
    component: () => import('@/views/ServiceDetail.vue'),
    meta: { publicAccess: true },
  },
  {
    path: '/meus-servicos',
    name: 'MeusServicos',
    component: () => import('@/views/MeusServicos.vue'),
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
    meta: { publicAccess: true, limitedForGuests: true },
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
    path: '/desafios',
    name: 'Challenges',
    component: () => import('@/views/Challenges.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/ranking',
    name: 'Leaderboard',
    component: () => import('@/views/Leaderboard.vue'),
    meta: { requiresAuth: true },
  },
  // Programs routes
  {
    path: '/programs',
    name: 'Programs',
    component: () => import('@/views/Programs.vue'),
    meta: { publicAccess: true },
  },
  {
    path: '/programs/:id',
    name: 'ProgramDetail',
    component: () => import('@/views/ProgramDetail.vue'),
    meta: { publicAccess: true },
  },
  {
    path: '/my-programs',
    name: 'MyPrograms',
    component: () => import('@/views/MyPrograms.vue'),
    meta: { requiresAuth: true },
  },
  // Professor routes
  {
    path: '/professor',
    name: 'ProfessorDashboard',
    component: () => import('@/views/professor/ProfessorDashboard.vue'),
    meta: { requiresAuth: true, requiresRole: 'professor' },
  },
  {
    path: '/professor/programa/:id',
    name: 'ManageProgram',
    component: () => import('@/views/professor/ManageProgram.vue'),
    meta: { requiresAuth: true, requiresRole: 'professor' },
  },
  {
    path: '/programs/:id/assistir',
    name: 'ProgramPlayer',
    component: () => import('@/views/ProgramPlayer.vue'),
    meta: { requiresAuth: false, publicAccess: true },
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
    path: '/admin/servicos',
    name: 'AdminServices',
    component: () => import('@/views/admin/AdminServices.vue'),
    meta: { requiresAuth: true, requiresRole: 'admin' },
  },
  {
    path: '/admin/palavras-proibidas',
    name: 'AdminBannedWords',
    component: () => import('@/views/admin/AdminBannedWords.vue'),
    meta: { requiresAuth: true, requiresRole: 'admin' },
  },
  {
    path: '/admin/reports',
    name: 'AdminReports',
    component: () => import('@/views/admin/AdminReports.vue'),
    meta: { requiresAuth: true, requiresRole: 'admin' },
  },
  {
    path: '/admin/desafios',
    name: 'AdminChallenges',
    component: () => import('@/views/admin/AdminChallenges.vue'),
    meta: { requiresAuth: true, requiresRole: 'admin' },
  },
  {
    path: '/admin/cupons',
    name: 'AdminCoupons',
    component: () => import('@/views/admin/AdminCoupons.vue'),
    meta: { requiresAuth: true, requiresRole: 'admin' },
  },
  {
    path: '/admin/cupons/historico',
    name: 'AdminCouponUsage',
    component: () => import('@/views/admin/CouponUsageHistory.vue'),
    meta: { requiresAuth: true, requiresRole: 'admin' },
  },
  // Admin Programs routes
  {
    path: '/admin/programs',
    name: 'AdminPrograms',
    component: () => import('@/views/admin/AdminPrograms.vue'),
    meta: { requiresAuth: true, requiresRole: 'admin' },
  },
  {
    path: '/admin/programs/criar',
    name: 'AdminCreateProgram',
    component: () => import('@/views/admin/AdminProgramForm.vue'),
    meta: { requiresAuth: true, requiresRole: 'admin' },
  },
  {
    path: '/admin/programs/:id/editar',
    name: 'AdminEditProgram',
    component: () => import('@/views/admin/AdminProgramForm.vue'),
    meta: { requiresAuth: true, requiresRole: 'admin' },
  },
  {
    path: '/admin/programs/:id/matriculas',
    name: 'AdminProgramEnrollments',
    component: () => import('@/views/admin/AdminProgramEnrollments.vue'),
    meta: { requiresAuth: true, requiresRole: 'admin' },
  },
  {
    path: '/admin/users/:userId/history',
    name: 'UserHistory',
    component: () => import('@/views/admin/UserHistoryView.vue'),
    meta: { requiresAuth: true, requiresRole: 'admin' },
  },
  {
    path: '/admin/termos-aceitos',
    name: 'AdminTermsAcceptance',
    component: () => import('@/views/admin/AdminTermsAcceptance.vue'),
    meta: { requiresAuth: true, requiresRole: 'admin' },
  },
  {
    path: '/admin/termos-gerenciar',
    name: 'AdminTermsManagement',
    component: () => import('@/views/admin/AdminTermsManagement.vue'),
    meta: { requiresAuth: true, requiresRole: 'admin' },
  },
  {
    path: '/parceiro/eventos',
    name: 'PartnerEvents',
    component: () => import('@/views/partner/PartnerEvents.vue'),
    meta: { requiresAuth: true, requiresRole: 'partner' },
  },
  // Subscription routes
  {
    path: '/subscription',
    name: 'Subscription',
    component: () => import('@/views/SubscriptionPlans.vue'),
    meta: { publicAccess: true },
  },
  {
    path: '/subscription/success',
    name: 'SubscriptionSuccess',
    component: () => import('@/views/SubscriptionSuccess.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/admin/subscriptions',
    name: 'AdminSubscriptions',
    component: () => import('@/views/admin/AdminSubscriptions.vue'),
    meta: { requiresAuth: true, requiresRole: 'admin' },
  },
  // Catch-all 404 route - must be last
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  },
})

// Guard de autenticação
router.beforeEach(async (to, _from, next) => {    // O Supabase adiciona type=recovery no hash quando é reset password
  if (to.path === '/' || to.path === '') {
    const hash = window.location.hash
    const hashParams = new URLSearchParams(hash.substring(1))
    const type = hashParams.get('type')
    const accessToken = hashParams.get('access_token')

    if (type === 'recovery' && accessToken) {
      // Redirecionar para página de reset password PRESERVANDO o hash
      next({
        path: '/reset-password',
        hash: hash, // Crucial: mantém o token para a próxima página
        replace: true
      })
      return
    }
  }
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
  const publicAccess = to.matched.some(record => record.meta.publicAccess)
  const requiresPlan = to.matched.some(record => record.meta.requiresPlan) ?
    (to.matched.find(record => record.meta.requiresPlan)?.meta.requiresPlan as string) : undefined

  // Páginas públicas que podem ser acessadas mesmo logado (forgot-password, reset-password)
  const publicPages = ['/forgot-password', '/reset-password']
  const isPublicPage = publicPages.includes(to.path)

  // Allow public access routes even without authentication
  // Components will handle showing limited content
  if (publicAccess && !authStore.user) {
    next()
    return
  }

  // Verificar se precisa de autenticação
  if (requiresAuth && !authStore.user) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
    return
  }

  // Verificar se usuário está banido e onboarding
  if (requiresAuth && authStore.user) {
    const userStore = useUserStore()

    // Se profile não estiver carregado, buscar
    if (!userStore.profile) {
      await userStore.fetchProfile(authStore.user.id)
    }

    // Verificar onboarding
    if (to.path === '/onboarding') {
      // Se já completou onboarding, redirecionar para home
      const { hasCompletedOnboarding } = await import('@/composables/useOnboarding')
      if (hasCompletedOnboarding(userStore.profile)) {
        next({ name: 'Home' })
        return
      }
    } else {
      // Se não completou onboarding e não está na página de onboarding, redirecionar
      const { needsOnboarding } = await import('@/composables/useOnboarding')
      if (needsOnboarding(userStore.profile)) {
        next({ name: 'Onboarding' })
        return
      }
    }

    // Redirecionar usuário banido para página de aviso
    if (userStore.profile?.status === 'banned') {
      if (to.path !== '/banned') {
        next({ name: 'Banned' })
        return
      }
    }
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

    // Admin pode acessar tudo, caso contrário verifica a role específica
    if (userRole !== 'admin' && userRole !== requiresRole) {
      next({ name: 'Home' })
      return
    }
  }

  next()
})

export default router

