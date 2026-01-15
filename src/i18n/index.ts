import { createI18n } from 'vue-i18n'
import { watch } from 'vue'
import ptBR from './locales/pt-BR.json'
import enUS from './locales/en-US.json'
import { getPreferredLanguage, saveLanguagePreference, type SupportedLocale } from './languageDetector'

// Detect preferred language
const preferredLanguage = getPreferredLanguage()

console.log('🌐 Initializing i18n with locale:', preferredLanguage)

const i18n = createI18n({
  legacy: false,
  locale: preferredLanguage,
  fallbackLocale: 'en-US',
  messages: {
    'pt-BR': ptBR,
    'en-US': enUS,
  },
  globalInjection: true,
})

// Save the initial language preference
if (typeof window !== 'undefined') {
  saveLanguagePreference(preferredLanguage)
  
  // Watch for language changes and persist them
  watch(
    () => i18n.global.locale.value,
    (newLocale) => {
      if (newLocale && (newLocale === 'pt-BR' || newLocale === 'en-US')) {
        saveLanguagePreference(newLocale as SupportedLocale)
        console.log('🔄 Language changed to:', newLocale)
      }
    }
  )
}

export default i18n
