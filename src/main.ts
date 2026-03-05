import './assets/main.css'
import '@fortawesome/fontawesome-free/css/all.min.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import {
  faArrowDown,
  faArrowLeft,
  faArrowRight,
  faArrowTrendDown,
  faArrowTrendUp,
  faArrowUp,
  faBullseye,
  faChartLine,
  faChevronLeft,
  faChevronRight,
  faCircleCheck,
  faCircleExclamation,
  faCircleInfo,
  faEnvelope,
  faGauge,
  faGear,
  faGlobe,
  faLanguage,
  faLock,
  faMoon,
  faPen,
  faSun,
  faTrash,
  faTriangleExclamation,
  faUser,
  faWallet,
  faEye,
  faEyeSlash,
} from '@fortawesome/free-solid-svg-icons'

import App from './App.vue'
import router from './router'
import { isAuthenticated, isAdmin } from './utils/auth'

library.add(
  faArrowDown,
  faArrowLeft,
  faArrowRight,
  faArrowTrendDown,
  faArrowTrendUp,
  faArrowUp,
  faBullseye,
  faChartLine,
  faChevronLeft,
  faChevronRight,
  faCircleCheck,
  faCircleExclamation,
  faCircleInfo,
  faEnvelope,
  faGauge,
  faGear,
  faGlobe,
  faLanguage,
  faLock,
  faMoon,
  faPen,
  faSun,
  faTrash,
  faTriangleExclamation,
  faUser,
  faWallet,
  faEye,
  faEyeSlash,
)

// Initialize the app
const app = createApp(App)
app.component('font-awesome-icon', FontAwesomeIcon)
app.use(createPinia())
app.use(router)

// Check for existing authentication before mounting
const isUserAuthenticated = isAuthenticated()
const isUserAdmin = isAdmin()

// If the user is authenticated and if admin direct to admin page if not direct to dashboard if not authenticated direct to landing page
const initialRoute = isUserAuthenticated ? (isUserAdmin ? '/admin' : '/dashboard') : '/'

// Mount the app with initial route if needed
app.mount('#app')

router.push(initialRoute)
