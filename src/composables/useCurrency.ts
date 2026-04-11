import { ref, computed } from 'vue'

const STORAGE_KEY = 'preferredCurrency'
const PRIVACY_KEY = 'privacyMode'

/** Supported currency codes */
export type CurrencyCode = 'USD' | 'EUR' | 'TRY'

/** Reactive global currency state (singleton across the app) */
const currency = ref<CurrencyCode>(
  (localStorage.getItem(STORAGE_KEY) as CurrencyCode) || 'USD'
)

/** Reactive global privacy mode state */
const isPrivacyMode = ref<boolean>(
  localStorage.getItem(PRIVACY_KEY) === 'true'
)

/** Map currency code → symbol */
const SYMBOLS: Record<CurrencyCode, string> = {
  USD: '$',
  EUR: '€',
  TRY: '₺',
}

/** Map currency code → Intl locale for proper formatting */
const LOCALES: Record<CurrencyCode, string> = {
  USD: 'en-US',
  EUR: 'de-DE',
  TRY: 'tr-TR',
}

export function useCurrency() {
  const currencySymbol = computed(() => SYMBOLS[currency.value] || '$')
  const currencyLocale = computed(() => LOCALES[currency.value] || 'en-US')

  /** Format a number as currency using the user's preferred currency */
  function formatCurrency(amount: number, maximumFractionDigits = 0): string {
    if (isPrivacyMode.value) {
      return `${currencySymbol.value}••••`
    }
    return new Intl.NumberFormat(currencyLocale.value, {
      style: 'currency',
      currency: currency.value,
      maximumFractionDigits,
    }).format(amount)
  }

  /** Update the global preferred currency and persist to localStorage */
  function setCurrency(code: CurrencyCode) {
    currency.value = code
    localStorage.setItem(STORAGE_KEY, code)
  }

  /** Toggle the privacy mode and persist to localStorage */
  function togglePrivacyMode() {
    isPrivacyMode.value = !isPrivacyMode.value
    localStorage.setItem(PRIVACY_KEY, String(isPrivacyMode.value))
  }

  return {
    /** The reactive currency code (e.g. 'USD', 'TRY') */
    currency,
    /** The symbol for the current currency (e.g. '$', '₺') */
    currencySymbol,
    /** The Intl locale string (e.g. 'en-US', 'tr-TR') */
    currencyLocale,
    /** Format a number as a localized currency string */
    formatCurrency,
    /** Change the global currency and persist */
    setCurrency,
    /** Whether privacy mode is obfuscating financial numbers */
    isPrivacyMode,
    /** Toggles privacy mode */
    togglePrivacyMode,
  }
}
