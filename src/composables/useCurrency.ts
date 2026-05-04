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

  /** Format a number as currency using the user's preferred currency, or a specified one */
  function formatCurrency(amount: number, maximumFractionDigits?: number, overrideCurrency?: CurrencyCode): string {
    const targetCurrency = overrideCurrency || currency.value
    const targetLocale = overrideCurrency ? (LOCALES[overrideCurrency] || 'en-US') : currencyLocale.value
    const targetSymbol = overrideCurrency ? (SYMBOLS[overrideCurrency] || '$') : currencySymbol.value

    if (isPrivacyMode.value) {
      return `${targetSymbol}••••`
    }

    // Smart Precision: 
    // - Default to 2 for normal amounts.
    // - If amount is very small (0 < |x| < 1), increase precision to avoid showing $0.00
    let maxPrecision = maximumFractionDigits !== undefined ? maximumFractionDigits : 2;
    
    if (amount !== 0 && Math.abs(amount) < 1 && maximumFractionDigits === undefined) {
      // Find the first non-zero decimal place and show 3 digits after it
      const absoluteAmount = Math.abs(amount);
      maxPrecision = Math.min(Math.max(2, Math.ceil(-Math.log10(absoluteAmount)) + 3), 8);
    }

    return new Intl.NumberFormat(targetLocale, {
      style: 'currency',
      currency: targetCurrency,
      maximumFractionDigits: maxPrecision,
      minimumFractionDigits: Math.min(maxPrecision, 2),
    }).format(amount)
  }

  /** Format a plain number, obfuscating if privacy mode is on */
  function formatAmount(val: number): string {
    if (isPrivacyMode.value) return '••••'
    return val.toLocaleString()
  }

  /** Mask sensitive info like percentages and amounts within a string */
  function maskSensitiveText(text: string): string {
    if (!isPrivacyMode.value || !text) return text
    return text
      .replace(/\d+(?:[.,]\d+)?\s*%/g, '••%') // 12% or 12.5%
      .replace(/%\s*\d+(?:[.,]\d+)?/g, '%••') // %12 or %12.5
      // Mask amounts with symbols or codes: $123, 123 USD, etc.
      .replace(/([$€₺]|USD|EUR|TRY|TL)\s*\d+(?:[.,]\d+)*/gi, '$1••••')
      .replace(/\d+(?:[.,]\d+)*\s*([$€₺]|USD|EUR|TRY|TL)/gi, '••••$1')
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
    /** Format a plain number, obfuscating if privacy mode is on */
    formatAmount,
    /** Change the global currency and persist */
    setCurrency,
    /** Whether privacy mode is obfuscating financial numbers */
    isPrivacyMode,
    /** Toggles privacy mode */
    togglePrivacyMode,
    /** Mask sensitive info like percentages and amounts within a string */
    maskSensitiveText,
  }
}
