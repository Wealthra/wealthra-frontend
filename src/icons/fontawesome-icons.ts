import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import {
  faArrowDown,
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

export const leftSidebarIconMap: Record<string, IconDefinition> = {
  Dashboard: faGauge,
  Income: faArrowUp,
  Expenses: faArrowDown,
  Budget: faWallet,
  Goals: faBullseye,
  Analytics: faChartLine,
  Settings: faGear,
}

export const alertTypeIconMap: Record<'error' | 'success' | 'warning' | 'info', IconDefinition> = {
  error: faCircleExclamation,
  success: faCircleCheck,
  warning: faTriangleExclamation,
  info: faCircleInfo,
}

export const inputIconMap: Record<string, IconDefinition> = {
  password: faLock,
  email: faEnvelope,
  user: faUser,
}

export const passwordEyeIcons = {
  visible: faEye,
  hidden: faEyeSlash,
}

export const profileIcon: IconDefinition = faUser

export const themeIcons = {
  light: faSun,
  dark: faMoon,
}

export const languageIcons = {
  english: faLanguage,
  turkish: faGlobe,
}

export const arrowIcons = {
  right: faChevronRight,
  left: faChevronLeft,
  up: faArrowUp,
  down: faArrowDown,
}

export const trendIcons = {
  positive: faArrowUp,
  negative: faArrowDown,
}

export const actionIcons = {
  delete: faTrash,
  edit: faPen,
}

