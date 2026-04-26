// Lazy Loading Public Views
const LandingView = () => import('../landing/LandingView.vue')
const LoginView = () => import('../auth/login/page/LoginView.vue')
const ForgetPasswordView = () => import('../auth/forget-password/page/ForgetPasswordView.vue')
const SignUpView = () => import('../auth/sign-up/page/SignUpView.vue')

// Layout wrapper (layout mounted once; only child content swaps)
const ModuleLayoutWrapper = () => import('../layouts/ModuleLayoutWrapper.vue')

// Lazy Loading Authenticated Module Views (content only, under layout)
const DashboardView = () => import('../modules/dashboard/page/DashboardView.vue')
const AdminView = () => import('../auth/admin/page/AdminView.vue')
const BudgetView = () => import('../modules/budget/page/BudgetView.vue')
const ExpensesView = () => import('../modules/expenses/page/ExpensesView.vue')
const IncomeView = () => import('../modules/income/page/IncomeView.vue')
const GoalsView = () => import('../modules/goals/page/GoalsView.vue')
const SettingsView = () => import('../modules/settings/page/SettingsView.vue')
const RecommendationsView = () => import('../modules/recommendations/page/RecommendationsView.vue')

import { isAuthenticated, isAdmin } from '../utils/auth'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/landing',
      name: 'landingpage',
      component: LandingView,
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/forgetpassword',
      name: 'forgetpassword',
      component: ForgetPasswordView,
    },
    {
      path: '/signup',
      name: 'signup',
      component: SignUpView,
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
        { path: 'settings', name: 'settings', component: SettingsView },
        { path: 'recommendations', name: 'recommendations', component: RecommendationsView },
        { path: 'admin', name: 'admin', component: AdminView, meta: { requiresAdmin: true } },
      ],
    },
  ],
})

router.beforeEach((to, from, next) => {
  const isAuth = isAuthenticated()
  const isAdm = isAdmin()
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin)
  const isPublicRoute = ['landingpage', 'login', 'signup', 'forgetpassword'].includes(to.name as string)

  if (!isAuth) {
    // Not logged in: only allow public routes
    if (requiresAuth) {
      next({ name: 'landingpage' })
    } else {
      next()
    }
  } else {
    // Logged in
    if (isAdm) {
      // Admin: ONLY allow /admin route
      if (to.name === 'admin') {
        next()
      } else {
        // If they try to go anywhere else, force them back to /admin
        next({ name: 'admin' })
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
