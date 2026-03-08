import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import {
  faArrowDown,
  faArrowTrendDown,
  faArrowTrendUp,
  faArrowUp,
  faBell,
  faBullseye,
  faCalendar,
  faCalendarDay,
  faCalendarWeek,
  faChartLine,
  faChevronLeft,
  faChevronRight,
  faCircleCheck,
  faCircleExclamation,
  faCircleInfo,
  faCreditCard,
  faEnvelope,
  faGauge,
  faGear,
  faGlobe,
  faHandHoldingDollar,
  faLanguage,
  faList,
  faLock,
  faMoon,
  faPen,
  faPiggyBank,
  faReceipt,
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
  Income: faHandHoldingDollar,
  Expenses: faReceipt,
  Budget: faPiggyBank,
  Goals: faBullseye,
  Analytics: faChartLine,
  Settings: faGear,
}

/** Icons for empty-state placeholders (no data) */
export const emptyStateIcons = {
  incomeSources: faHandHoldingDollar,
  transactions: faReceipt,
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
  positive: faArrowTrendUp,
  negative: faArrowTrendDown,
}

export const actionIcons = {
  delete: faTrash,
  edit: faPen,
}

export const paginationIcons = {
  results: faList,
}

/** Map icon string (e.g. 'fas fa-wallet' or 'fa-wallet') to IconDefinition for KPI cards */
export const kpiIconMap: Record<string, IconDefinition> = {
  wallet: faWallet,
  'fa-wallet': faWallet,
  'credit-card': faCreditCard,
  'fa-credit-card': faCreditCard,
  'arrow-trend-up': faArrowTrendUp,
  'fa-arrow-trend-up': faArrowTrendUp,
  'calendar-week': faCalendarWeek,
  'fa-calendar-week': faCalendarWeek,
  'calendar-day': faCalendarDay,
  'fa-calendar-day': faCalendarDay,
  calendar: faCalendar,
  'fa-calendar': faCalendar,
  bell: faBell,
  'fa-bell': faBell,
  'chart-line': faChartLine,
  'fa-chart-line': faChartLine,
}

