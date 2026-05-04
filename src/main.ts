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
  faArrowsRotate,
  faBan,
  faBell,
  faBullhorn,
  faBullseye,
  faCalendar,
  faCalendarDay,
  faCalendarDays,
  faChartLine,
  faChartSimple,
  faChevronDown,
  faChevronLeft,
  faChevronRight,
  faChevronUp,
  faCircleCheck,
  faCircleExclamation,
  faCircleInfo,
  faCircleQuestion,
  faCircleXmark,
  faCommentSlash,
  faComments,
  faEnvelope,
  faFolderOpen,
  faFloppyDisk,
  faSave,
  faGauge,
  faGear,
  faGlobe,
  faImage,
  faKey,
  faLanguage,
  faLightbulb,
  faLock,
  faLockOpen,
  faMagnifyingGlass,
  faMicrochip,
  faMicrophone,
  faMoneyBillTransfer,
  faMoon,
  faNetworkWired,
  faPaperPlane,
  faPen,
  faPenToSquare,
  faPlus,
  faReceipt,
  faRightFromBracket,
  faRobot,
  faRotateRight,
  faServer,
  faShield,
  faShieldHalved,
  faSignal,
  faSpinner,
  faSun,
  faTrash,
  faTrashCan,
  faTriangleExclamation,
  faUnlock,
  faUser,
  faUserGroup,
  faUserGear,
  faUserPlus,
  faUsers,
  faWallet,
  faEye,
  faEyeSlash,
  faCommentDots,
  faXmark,
  faDownload,
  faBoxOpen,
  faAward,
  faBellSlash,
  faEnvelopeOpen,
  faChartPie,
  faHeadset,
  faCheck,
  faGaugeHigh,
  faMoneyBillTrendUp,
  faMoneyBillWave,
  faBolt,
  faUserSlash,
  faUserMinus,
  faPuzzlePiece,
  faFileInvoice,
  faLayerGroup,
  faHandHoldingDollar,
  faCoins,
  faWaveSquare,
  faListCheck,
} from '@fortawesome/free-solid-svg-icons'

import App from './App.vue'
import router from './router'
import { isAuthenticated, isAdmin, bootstrapAuth } from './utils/auth'

library.add(
  faArrowDown,
  faArrowLeft,
  faArrowRight,
  faArrowTrendDown,
  faArrowTrendUp,
  faArrowUp,
  faArrowsRotate,
  faBan,
  faBell,
  faBellSlash,
  faBullhorn,
  faBullseye,
  faBoxOpen,
  faCalendar,
  faCalendarDay,
  faCalendarDays,
  faChartLine,
  faChartPie,
  faChartSimple,
  faCheck,
  faChevronDown,
  faChevronLeft,
  faChevronRight,
  faChevronUp,
  faCircleCheck,
  faCircleExclamation,
  faCircleInfo,
  faCircleQuestion,
  faCircleXmark,
  faCommentDots,
  faCommentSlash,
  faComments,
  faDownload,
  faEnvelope,
  faEnvelopeOpen,
  faEye,
  faEyeSlash,
  faFloppyDisk,
  faSave,
  faFolderOpen,
  faGauge,
  faGear,
  faGlobe,
  faHeadset,
  faImage,
  faKey,
  faLanguage,
  faLightbulb,
  faLock,
  faLockOpen,
  faMagnifyingGlass,
  faMicrochip,
  faMicrophone,
  faMoon,
  faMoneyBillTransfer,
  faNetworkWired,
  faPaperPlane,
  faPen,
  faPenToSquare,
  faPlus,
  faReceipt,
  faRightFromBracket,
  faRobot,
  faRotateRight,
  faServer,
  faShield,
  faShieldHalved,
  faSignal,
  faSpinner,
  faSun,
  faTrash,
  faTrashCan,
  faTriangleExclamation,
  faUnlock,
  faUser,
  faUserGroup,
  faUserGear,
  faUserPlus,
  faUsers,
  faWallet,
  faAward,
  faXmark,
  faGaugeHigh,
  faMoneyBillTrendUp,
  faMoneyBillWave,
  faBolt,
  faUserSlash,
  faUserMinus,
  faPuzzlePiece,
  faFileInvoice,
  faLayerGroup,
  faHandHoldingDollar,
  faCoins,
  faWaveSquare,
  faListCheck,
)

async function initApp() {
  // Try to restore session using refresh token cookie before mounting
  await bootstrapAuth()

  const app = createApp(App)
  app.component('font-awesome-icon', FontAwesomeIcon)
  app.use(createPinia())
  app.use(router)

  // Determine initial route based on current in-memory auth state
  const isUserAuthenticated = isAuthenticated()
  const isUserAdmin = isAdmin()

  // If the user is authenticated and admin, go to admin; otherwise go to dashboard.
  // If not authenticated, stay on landing page.
  const initialRoute = isUserAuthenticated ? (isUserAdmin ? '/admin' : '/dashboard') : '/login'

  app.mount('#app')

  // If a specific path was requested (e.g. via deep link), let the router handle it
  // otherwise navigate to the determined initial route.
  if (window.location.pathname === '/' || window.location.pathname === '/login') {
    await router.push(initialRoute)
  }

  // If we are on the login page (not authenticated), remove the initial loader
  if (!isUserAuthenticated && typeof (window as any).removeInitialLoader === 'function') {
    ;(window as any).removeInitialLoader()
  }
}

initApp()
