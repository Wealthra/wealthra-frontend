/**
 * Theme-based palette for category colors (pie charts, top spendings, etc.).
 * Uses CSS variables so colors follow light/dark theme. Cycles by index for dynamic categories from API.
 */
const CATEGORY_PALETTE_VARS = [
  '--primary-green-color',
  '--primary-blue-color',
  '--primary-red-color',
  '--primary-yellow-color',
  '--primary-pink-color',
  '--category-food-color',
  '--category-education-color',
  '--category-shopping-color',
  '--category-housing-color',
  '--category-transport-color',
  '--category-entertainment-color',
  '--category-healthcare-color',
  '--category-other-color',
]

function getRootStyles(): CSSStyleDeclaration {
  if (typeof document === 'undefined') return {} as CSSStyleDeclaration
  return getComputedStyle(document.documentElement)
}

/**
 * Returns a theme-dependent color for the given category index (e.g. pie slice or top spending row).
 * Use for dynamic categories from API; no hardcoded category names.
 */
export function getCategoryColorByIndex(index: number): string {
  const styles = getRootStyles()
  const varName = CATEGORY_PALETTE_VARS[Math.abs(index) % CATEGORY_PALETTE_VARS.length]
  const value = styles.getPropertyValue(varName).trim()
  if (value) return value
  // Fallback: simple hue rotation so unknown vars still get a color
  const hue = (index * 37) % 360
  return `hsl(${hue}, 55%, 50%)`
}
