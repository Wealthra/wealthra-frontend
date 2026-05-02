// Lazy Loading Public Views
const LoginView = () => import('../auth/login/page/LoginView.vue')
const ForgetPasswordView = () => import('../auth/forget-password/page/ForgetPasswordView.vue')
const SignUpView = () => import('../auth/sign-up/page/SignUpView.vue')
const ConfirmEmailView = () => import('../auth/confirm-email/page/ConfirmEmailView.vue')
const PasswordResetSuccessView = () =>
  import('../auth/password-reset-success/page/PasswordResetSuccessView.vue')

// Layout wrapper (layout mounted once; only child content swaps)
const ModuleLayoutWrapper = () => import('../layouts/ModuleLayoutWrapper.vue')

// Lazy Loading Authenticated Module Views (content only, under layout)
const DashboardView = () => import('../modules/dashboard/page/DashboardView.vue')
const AdminView = () => import('../auth/admin/page/AdminView.vue')
const AdminAnalyticsView = () => import('../auth/admin/page/AdminAnalyticsView.vue')
const AdminSystemHubView = () => import('../auth/admin/page/AdminSystemHubView.vue')
const BudgetView = () => import('../modules/budget/page/BudgetView.vue')
const ExpensesView = () => import('../modules/expenses/page/ExpensesView.vue')
const IncomeView = () => import('../modules/income/page/IncomeView.vue')
const GoalsView = () => import('../modules/goals/page/GoalsView.vue')
const TicketsView = () => import('../modules/tickets/page/TicketsView.vue')
const SettingsView = () => import('../modules/settings/page/SettingsView.vue')
const RecommendationsView = () => import('../modules/recommendations/page/RecommendationsView.vue')
const NotificationsView = () => import('../modules/notifications/page/NotificationsView.vue')

import { isAuthenticated, isAdmin } from '../utils/auth'
import { createRouter, createWebHistory, type RouteLocation } from 'vue-router'

/** Legacy `/admin` + optional `?tab=` → path-based admin URLs */
function redirectAdminLegacy(to: RouteLocation) {
  const raw = to.query.tab
  const tab: string =
    typeof raw === 'string'
      ? raw
      : Array.isArray(raw) && raw.length > 0 && raw[0] != null
        ? String(raw[0])
        : 'overview'
  const paths: Record<string, string> = {
    overview: '/admin/analytics',
    users: '/admin/users',
    plans: '/admin/plans',
    support: '/admin/support',
    operations: '/admin/operations',
    system: '/admin/system',
    settings: '/admin/settings',
    analytics: '/admin/analytics',
  }
  return paths[tab] ?? '/admin/analytics'
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/dashboard',
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/forget-password',
      name: 'forget-password',
      component: ForgetPasswordView,
    },
    { path: '/forgetpassword', redirect: '/forget-password' },
    {
      path: '/sign-up',
      name: 'sign-up',
      component: SignUpView,
    },
    { path: '/signup', redirect: '/sign-up' },
    {
      path: '/confirm-email',
      name: 'confirmemail',
      component: ConfirmEmailView,
    },
    {
      path: '/password-reset/success',
      name: 'passwordResetSuccess',
      component: PasswordResetSuccessView,
    },
    // Redirects from old paths to top-level paths
    { path: '/app/dashboard', redirect: '/dashboard' },
    { path: '/app/budget', redirect: '/budget' },
    { path: '/app/expenses', redirect: '/expenses' },
    { path: '/app/income', redirect: '/income' },
    { path: '/app/goals', redirect: '/goals' },
    { path: '/app/settings', redirect: '/settings' },
    { path: '/app/recommendations', redirect: '/recommendations' },
    { path: '/app', redirect: '/dashboard' },

    // Authenticated app shell
    {
      path: '/',
      component: ModuleLayoutWrapper,
      meta: { requiresAuth: true },
      children: [
        { path: 'dashboard', name: 'dashboard', component: DashboardView },
        { path: 'budget', name: 'budget', component: BudgetView },
        { path: 'expenses', name: 'expenses', component: ExpensesView },
        { path: 'income', name: 'income', component: IncomeView },
        { path: 'goals', name: 'goals', component: GoalsView },
        { path: 'tickets', name: 'tickets', component: TicketsView },
        { path: 'settings', name: 'settings', component: SettingsView },
        { path: 'recommendations', name: 'recommendations', component: RecommendationsView },
        { path: 'notifications', name: 'notifications', component: NotificationsView },
        {
          path: 'admin',
          redirect: (to) => redirectAdminLegacy(to),
        },
        {
          path: 'admin/overview',
          redirect: '/admin/analytics',
        },
        {
          path: 'admin/analytics',
          name: 'admin-analytics',
          component: AdminAnalyticsView,
          meta: { requiresAdmin: true },
        },
        {
          path: 'admin/users',
          name: 'admin-users',
          component: AdminView,
          meta: { requiresAdmin: true },
        },
        {
          path: 'admin/support',
          name: 'admin-support',
          component: AdminView,
          meta: { requiresAdmin: true },
        },
        {
          path: 'admin/system',
          name: 'admin-system',
          component: AdminSystemHubView,
          meta: { requiresAdmin: true },
        },
        {
          path: 'admin/plans',
          name: 'admin-plans',
          component: AdminView,
          meta: { requiresAdmin: true },
        },
        {
          path: 'admin/operations',
          name: 'admin-operations',
          component: AdminView,
          meta: { requiresAdmin: true },
        },
        {
          path: 'admin/security',
          name: 'admin-security',
          component: AdminView,
          meta: { requiresAdmin: true },
        },
        {
          path: 'admin/settings',
          name: 'admin-settings',
          component: AdminView,
          meta: { requiresAdmin: true },
        },
      ],
    },
  ],
})

router.beforeEach((to, from, next) => {
  const isAuth = isAuthenticated()
  const isAdm = isAdmin()
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin)
  const isPublicRoute = [
    'login',
    'sign-up',
    'forget-password',
    'confirmemail',
    'passwordResetSuccess',
  ].includes(to.name as string)

  if (!isAuth) {
    // Not logged in: only allow public routes
    if (requiresAuth) {
      next({ name: 'login' })
    } else {
      next()
    }
  } else {
    // Logged in
    if (isAdm) {
      const isAdminAppRoute = to.matched.some(r => r.meta.requiresAdmin === true)
      if (isAdminAppRoute) {
        next()
      } else {
        next({ name: 'admin-analytics' })
      }
    } else {
      // Regular User
      if (requiresAdmin) {
        // Cannot go to admin pages
        next({ name: 'dashboard' })
      } else if (isPublicRoute) {
        // Cannot go to login/landing pages while logged in
        next({ name: 'dashboard' })
      } else {
        // Regular app pages (dashboard, settings etc) are fine
        next()
      }
    }
  }
})

export default router
