/**
 * Language Detection Utilities
 * Detects and maps browser language to supported locales
 */

export type SupportedLocale = 'pt-BR' | 'en-US'

/**
 * Maps browser language codes to supported locales
 * Handles regional variants and fallbacks
 */
export const mapBrowserLanguage = (browserLang: string): SupportedLocale => {
  const lang = browserLang.toLowerCase()

  // Direct mapping for Portuguese variants
  if (['pt', 'pt-br', 'pt-pt', 'pt-ao', 'pt-mz'].includes(lang)) {
    return 'pt-BR'
  }

  // Direct mapping for English variants
  if (['en', 'en-us', 'en-gb', 'en-ca', 'en-au', 'en-nz'].includes(lang)) {
    return 'en-US'
  }

  // Fallback by prefix
  if (lang.startsWith('pt')) return 'pt-BR'
  if (lang.startsWith('en')) return 'en-US'

  // Universal fallback
  return 'en-US'
}

/**
 * Gets the preferred language based on:
 * 1. Saved preference in localStorage
 * 2. Browser language detection
 * 3. Fallback to default
 */
export const getPreferredLanguage = (): SupportedLocale => {
  // Check if this is the first visit
  const isFirstVisit = !localStorage.getItem('i18n_initialized')

  // Get browser language
  const browserLang = navigator.language || navigator.languages?.[0] || 'en'
  const mappedLang = mapBrowserLanguage(browserLang)

  // If first visit, use browser language
  if (isFirstVisit) {
    console.log('🌍 First visit detected, using browser language:', mappedLang)
    return mappedLang
  }

  // Check saved preference
  const savedLocale = localStorage.getItem('locale')
  if (savedLocale && (savedLocale === 'pt-BR' || savedLocale === 'en-US')) {
    console.log('💾 Using saved locale:', savedLocale)
    return savedLocale as SupportedLocale
  }

  // Fallback to browser language
  console.log('🔄 No saved preference, using browser language:', mappedLang)
  return mappedLang
}

/**
 * Detects all browser languages in order of preference
 */
export const detectBrowserLanguages = (): SupportedLocale[] => {
  const browserLangs = navigator.languages || [navigator.language || 'en']
  
  return browserLangs
    .map(lang => mapBrowserLanguage(lang))
    .filter((value, index, self) => self.indexOf(value) === index) // Remove duplicates
}

/**
 * Saves the language preference to localStorage
 */
export const saveLanguagePreference = (locale: SupportedLocale): void => {
  localStorage.setItem('locale', locale)
  localStorage.setItem('i18n_initialized', 'true')
  console.log('✅ Language preference saved:', locale)
}

/**
 * Checks if the current locale matches the browser's preferred language
 */
export const isBrowserDefaultLanguage = (currentLocale: SupportedLocale): boolean => {
  const browserLang = navigator.language || navigator.languages?.[0] || 'en'
  const mappedBrowserLang = mapBrowserLanguage(browserLang)
  return currentLocale === mappedBrowserLang
}

/**
 * Gets language info for display
 */
export const getLanguageInfo = (locale: SupportedLocale) => {
  const languages = {
    'pt-BR': {
      code: 'pt-BR',
      name: 'Português',
      flag: '🇧🇷',
      nativeName: 'Português (Brasil)'
    },
    'en-US': {
      code: 'en-US',
      name: 'English',
      flag: '🇺🇸',
      nativeName: 'English (US)'
    }
  }

  return languages[locale]
}

/**
 * Resets to browser's default language
 */
export const resetToBrowserLanguage = (): SupportedLocale => {
  const browserLang = navigator.language || navigator.languages?.[0] || 'en'
  const mappedLang = mapBrowserLanguage(browserLang)
  
  saveLanguagePreference(mappedLang)
  console.log('🔄 Reset to browser language:', mappedLang)
  
  return mappedLang
}
