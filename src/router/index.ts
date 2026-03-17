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
    // Redirects from old paths to /app/* so existing links keep working
    { path: '/dashboard', redirect: '/app/dashboard' },
    { path: '/budget', redirect: '/app/budget' },
    { path: '/expenses', redirect: '/app/expenses' },
    { path: '/income', redirect: '/app/income' },
    { path: '/goals', redirect: '/app/goals' },
    { path: '/settings', redirect: '/app/settings' },
    // Authenticated app shell: layout is parent, content is child
    {
      path: '/app',
      component: ModuleLayoutWrapper,
      meta: { requiresAuth: true },
      children: [
        { path: '', redirect: { name: 'dashboard' } },
        {
          path: 'dashboard',
          name: 'dashboard',
          component: DashboardView,
        },
        {
          path: 'budget',
          name: 'budget',
          component: BudgetView,
        },
        {
          path: 'expenses',
          name: 'expenses',
          component: ExpensesView,
        },
        {
          path: 'income',
          name: 'income',
          component: IncomeView,
        },
        {
          path: 'goals',
          name: 'goals',
          component: GoalsView,
        },
        {
          path: 'settings',
          name: 'settings',
          component: SettingsView,
        },
      ],
    },
    {
      path: '/admin',
      name: 'admin',
      component: AdminView,
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
