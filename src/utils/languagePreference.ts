export function applyLanguage() {
  const savedLanguage = localStorage.getItem('selectedLanguage') || 'English'
  document.documentElement.setAttribute('lang', savedLanguage)

  document.addEventListener('DOMContentLoaded', () => {
    document.body.setAttribute('data-language', savedLanguage)
  })
}
