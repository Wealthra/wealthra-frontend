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
  faChartSimple,
  faChevronDown,
  faChevronLeft,
  faChevronRight,
  faChevronUp,
  faCircleCheck,
  faCircleExclamation,
  faCircleInfo,
  faCreditCard,
  faEnvelope,
  faFolderOpen,
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
  faUtensils,
  faCar,
  faBook,
  faBagShopping,
  faHeartPulse,
  faGlassMartini,
  faBriefcase,
  faWrench,
  faMoneyBillWave,
  faBaby,
  faShirt,
  faCoffee,
  faGraduationCap,
  faLaptop,
  faFilm,
  faGift,
  faBasketShopping,
  faFutbol,
  faHouse,
  faShield,
  faEllipsis,
  faSpa,
  faPaw,
  faCloud,
  faFileInvoiceDollar,
  faPlane,
  faLightbulb,
  faRobot,
  faSignal,
  faAward,
  faRotateRight,
  faXmark,
  faPenToSquare,
  faTrashCan,
  faDownload,
  faRightFromBracket,
  faSpinner,
  faPlus,
  faCheck,
  faCrown,
  faBoxOpen,
  faUsers,
  faChartPie,
  faHeadset,
  faShieldHalved,
} from '@fortawesome/free-solid-svg-icons'

export const leftSidebarIconMap: Record<string, IconDefinition> = {
  Dashboard: faGauge,
  Recommendations: faRobot,
  Income: faHandHoldingDollar,
  Expenses: faReceipt,
  Budget: faPiggyBank,
  Goals: faBullseye,
  Admin: faCrown,
  Settings: faGear,
  Overview: faChartPie,
  Analytics: faChartLine,
  'Dashboard & Analytics': faChartPie,
  'Users & Plans': faUsers,
  'Support & Ops': faHeadset,
  'System & Security': faShieldHalved,
  'Admin Settings': faGear,
  Tickets: faHeadset,
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
  up: faChevronUp,
  down: faChevronDown,
}

export const trendIcons = {
  positive: faArrowTrendUp,
  negative: faArrowTrendDown,
}

export const actionIcons = {
  delete: faTrash,
  edit: faPen,
  view: faEye,
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
  'triangle-exclamation': faTriangleExclamation,
  'fa-triangle-exclamation': faTriangleExclamation,
}

export const transactionCategoryIconMap: Record<string, IconDefinition> = {
  income: faArrowDown,
  'alcohol & bars': faGlassMartini,
  'books & learning': faBook,
  'business expenses': faBriefcase,
  'car maintenance': faWrench,
  'cash & atm withdrawals': faMoneyBillWave,
  'childcare & family': faBaby,
  'clothing & accessories': faShirt,
  'coffee & snacks': faCoffee,
  'debt payments': faCreditCard,
  education: faGraduationCap,
  'electronics & gadgets': faLaptop,
  entertainment: faFilm,
  'food & dining': faUtensils,
  'gifts & donations': faGift,
  groceries: faBasketShopping,
  'health & fitness': faHeartPulse,
  'hobbies & sports': faFutbol,
  'home maintenance': faHouse,
  housing: faHouse,
  insurance: faShield,
  'investments & savings': faChartLine,
  miscellaneous: faEllipsis,
  'personal care': faSpa,
  pets: faPaw,
  shopping: faBagShopping,
  'subscriptions & software': faCloud,
  'taxes & fees': faFileInvoiceDollar,
  transport: faCar,
  'travel & vacation': faPlane,
  utilities: faLightbulb,
  default: faReceipt,
}
