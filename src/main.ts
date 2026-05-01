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
  faBell,
  faBullseye,
  faChartLine,
  faChevronDown,
  faChevronLeft,
  faChevronRight,
  faChevronUp,
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
  faComments,
  faRobot,
  faCommentDots,
  faXmark,
  faRotateRight,
  faImage,
  faMicrophone,
  faPaperPlane,
  faRightFromBracket,
  faPlus,
  faCheck,
  faPenToSquare,
  faTrashCan,
  faSpinner,
  faUserGroup,
  faMagnifyingGlass,
  faUserGear,
  faDownload,
  faReceipt,
  faBoxOpen,
  faSignal,
  faLightbulb,
  faAward,
  faUsers,
  faShield,
  faCalendar,
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
  faBell,
  faBullseye,
  faChartLine,
  faChevronDown,
  faChevronLeft,
  faChevronRight,
  faChevronUp,
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
  faComments,
  faRobot,
  faCommentDots,
  faXmark,
  faRotateRight,
  faImage,
  faMicrophone,
  faPaperPlane,
  faRightFromBracket,
  faPlus,
  faCheck,
  faPenToSquare,
  faTrashCan,
  faSpinner,
  faUserGroup,
  faMagnifyingGlass,
  faUserGear,
  faDownload,
  faReceipt,
  faBoxOpen,
  faSignal,
  faLightbulb,
  faAward,
  faUsers,
  faShield,
  faCalendar
)

async function initApp() {
  const app = createApp(App)
  app.component('font-awesome-icon', FontAwesomeIcon)
  app.use(createPinia())
  app.use(router)

  // Determine initial route based on current in-memory auth state
  const isUserAuthenticated = isAuthenticated()
  const isUserAdmin = isAdmin()

  // If the user is authenticated and admin, go to admin; otherwise go to dashboard.
  // If not authenticated, stay on landing page.
  const initialRoute = isUserAuthenticated ? (isUserAdmin ? '/admin' : '/dashboard') : '/landing'

  app.mount('#app')

  // If a specific path was requested (e.g. via deep link), let the router handle it
  // otherwise navigate to the determined initial route.
  if (window.location.pathname === '/' || window.location.pathname === '/login') {
    await router.push(initialRoute)
  }
}

initApp()
