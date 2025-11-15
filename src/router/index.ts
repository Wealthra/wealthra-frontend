// Lazy Loading Views
const LandingView = () => import('../views/LandingView.vue')
const LoginView = () => import('../views/LoginView.vue')
const ForgetPasswordView = () => import('../views/ForgetPasswordView.vue')
const SignUpView = () => import('../views/SignUpView.vue')

// Lazy Loading Authenticated Views
const DashboardView = () => import('../views/DashboardView.vue')
const AdminView = () => import('../views/AdminView.vue')
const AnalyticsView = () => import('../views/AnalyticsView.vue')
const BudgetView = () => import('../views/BudgetView.vue')
const ExpensesView = () => import('../views/ExpensesView.vue')
const IncomeView = () => import('../views/IncomeView.vue')
const GoalsView = () => import('../views/GoalsView.vue')
const SettingsView = () => import('../views/SettingsView.vue')

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
