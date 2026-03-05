// Lazy Loading Public Views
const LandingView = () => import('../landing/LandingView.vue')
const LoginView = () => import('../auth/login/page/LoginView.vue')
const ForgetPasswordView = () => import('../auth/forget-password/page/ForgetPasswordView.vue')
const SignUpView = () => import('../auth/sign-up/page/SignUpView.vue')

// Lazy Loading Authenticated Views
const DashboardView = () => import('../modules/dashboard/page/DashboardView.vue')
const AdminView = () => import('../auth/admin/page/AdminView.vue')
const AnalyticsView = () => import('../modules/analytics/page/AnalyticsView.vue')
const BudgetView = () => import('../modules/budget/page/BudgetView.vue')
const ExpensesView = () => import('../modules/expenses/page/ExpensesView.vue')
const IncomeView = () => import('../modules/income/page/IncomeView.vue')
const GoalsView = () => import('../modules/goals/page/GoalsView.vue')
const SettingsView = () => import('../modules/settings/page/SettingsView.vue')

import { isAuthenticated } from '../utils/auth'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
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
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
      meta: { requiresAuth: true },
    },
    {
      path: '/admin',
      name: 'admin',
      component: AdminView,
      meta: { requiresAuth: true },
    },
    {
      path: '/analytics',
      name: 'analytics',
      component: AnalyticsView,
      meta: { requiresAuth: true },
    },
    {
      path: '/budget',
      name: 'budget',
      component: BudgetView,
      meta: { requiresAuth: true },
    },
    {
      path: '/expenses',
      name: 'expenses',
      component: ExpensesView,
      meta: { requiresAuth: true },
    },
    {
      path: '/income',
      name: 'income',
      component: IncomeView,
      meta: { requiresAuth: true },
    },
    {
      path: '/goals',
      name: 'goals',
      component: GoalsView,
      meta: { requiresAuth: true },
    },
    {
      path: '/settings',
      name: 'settings',
      component: SettingsView,
      meta: { requiresAuth: true },
    },
  ],
})

router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)

  if (requiresAuth) {
    if (!isAuthenticated()) {
      next({ name: 'landingpage' })
    } else {
      next()
    }
  } else if (to.name === 'login' && isAuthenticated()) {
    next({ name: 'dashboard' })
  } else {
    next()
  }
})

export default router
