import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  mapBrowserLanguage,
  detectBrowserLanguages,
  isBrowserDefaultLanguage,
  getLanguageInfo,
  resetToBrowserLanguage,
  saveLanguagePreference,
  type SupportedLocale
} from '@/i18n/languageDetector'

/**
 * Composable for language detection and management
 * Provides utilities to detect browser language and manage user preferences
 */
export function useLanguageDetection() {
  const { locale } = useI18n()
  
  const browserLanguage = ref<SupportedLocale>('en-US')
  const detectedLanguages = ref<SupportedLocale[]>([])
  const isApplied = ref(false)

  /**
   * Detect browser languages on mount
   */
  const detectLanguages = () => {
    const browserLang = navigator.language || navigator.languages?.[0] || 'en'
    const mapped = mapBrowserLanguage(browserLang)
    
    browserLanguage.value = mapped
    detectedLanguages.value = detectBrowserLanguages()
    
    // Check if detected language is currently applied
    isApplied.value = locale.value === mapped
    
    console.log('🔍 Browser language detected:', mapped)
    console.log('📋 All detected languages:', detectedLanguages.value)
    
    return mapped
  }

  /**
   * Force apply the detected browser language
   */
  const forceApplyDetectedLanguage = () => {
    if (!browserLanguage.value) return false

    try {
      console.log('🔄 Forcing application of detected language:', browserLanguage.value)
      
      locale.value = browserLanguage.value
      saveLanguagePreference(browserLanguage.value)
      isApplied.value = true
      
      console.log('✅ Detected language applied successfully')
      
      return true
    } catch (error) {
      console.error('❌ Error applying detected language:', error)
      return false
    }
  }

  /**
   * Reset to browser's default language
   */
  const resetToDefault = () => {
    const defaultLang = resetToBrowserLanguage()
    locale.value = defaultLang
    isApplied.value = true
  }

  /**
   * Change language with persistence
   */
  const changeLanguage = (newLocale: SupportedLocale) => {
    locale.value = newLocale
    saveLanguagePreference(newLocale)
    isApplied.value = newLocale === browserLanguage.value
  }

  /**
   * Check if current language is browser's default
   */
  const isCurrentBrowserDefault = computed(() => {
    return isBrowserDefaultLanguage(locale.value as SupportedLocale)
  })

  /**
   * Check if detected language is applied
   */
  const isDetectedLanguageApplied = computed(() => {
    return locale.value === browserLanguage.value
  })

  /**
   * Get info for a specific language
   */
  const getLanguageDetails = (localeCode: SupportedLocale) => {
    return getLanguageInfo(localeCode)
  }

  /**
   * Get all available languages with metadata
   */
  const availableLanguages = computed(() => {
    return [
      {
        ...getLanguageInfo('pt-BR'),
        isBrowserDefault: browserLanguage.value === 'pt-BR',
        isActive: locale.value === 'pt-BR'
      },
      {
        ...getLanguageInfo('en-US'),
        isBrowserDefault: browserLanguage.value === 'en-US',
        isActive: locale.value === 'en-US'
      }
    ]
  })

  // Detect languages on mount
  onMounted(() => {
    detectLanguages()
  })

  return {
    // State
    browserLanguage,
    detectedLanguages,
    isApplied,
    
    // Computed
    isCurrentBrowserDefault,
    isDetectedLanguageApplied,
    availableLanguages,
    
    // Methods
    detectLanguages,
    forceApplyDetectedLanguage,
    resetToDefault,
    changeLanguage,
    getLanguageDetails,
  }
}
