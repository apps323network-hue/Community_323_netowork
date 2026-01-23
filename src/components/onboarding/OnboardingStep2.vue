<template>
  <div class="space-y-4 sm:space-y-6">
    <div class="text-center mb-4 sm:mb-6 md:mb-8">
      <h2 class="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-1 sm:mb-2">{{ t('onboarding.step2.title') }}</h2>
      <p class="text-sm sm:text-base text-slate-600 dark:text-text-muted px-2">{{ t('onboarding.step2.subtitle') }}</p>
    </div>

    <div class="space-y-4 sm:space-y-5">
      <!-- País -->
      <label class="block space-y-1.5 sm:space-y-2">
        <span class="text-xs sm:text-sm font-medium text-slate-700 dark:text-text-muted">
          {{ t('profile.country') }} <span class="text-red-500">*</span>
        </span>
        <select
          :value="country"
          @change="handleCountryChange"
          :class="[
            'w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl bg-slate-50 dark:bg-input-bg border text-sm sm:text-base text-slate-900 dark:text-white transition-all appearance-none cursor-pointer',
            countryError ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'border-slate-200 dark:border-input-border focus:border-secondary focus:ring-1 focus:ring-secondary',
            'focus:shadow-[0_0_10px_rgba(0,240,255,0.2)]'
          ]"
          required
        >
          <option value="">{{ t('profile.selectCountry') }}</option>
          <option v-for="c in countries" :key="c.code" :value="country === 'USA' && c.code === 'US' ? 'USA' : c.code">
            {{ c.name }}
          </option>
        </select>
        <p v-if="countryError" class="text-xs text-red-500">{{ countryError }}</p>
      </label>

      <!-- Estado -->
      <label class="block space-y-1.5 sm:space-y-2">
        <span class="text-xs sm:text-sm font-medium text-slate-700 dark:text-text-muted">
          {{ t('profile.state') }} <span class="text-red-500">*</span>
        </span>
        <select
          v-if="availableStates.length > 0"
          :value="state"
          @change="handleStateChange"
          :disabled="!hasCountrySelected || loadingCities"
          :class="[
            'w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl bg-slate-50 dark:bg-input-bg border text-sm sm:text-base text-slate-900 dark:text-white transition-all appearance-none cursor-pointer',
            stateError ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'border-slate-200 dark:border-input-border focus:border-secondary focus:ring-1 focus:ring-secondary',
            'focus:shadow-[0_0_10px_rgba(0,240,255,0.2)]',
            (!hasCountrySelected || loadingCities) ? 'opacity-60 cursor-not-allowed' : ''
          ]"
          required
        >
          <option value="">{{ hasCountrySelected ? t('profile.selectState') : t('profile.selectCountryFirst') }}</option>
          <option v-for="s in availableStates" :key="s.code" :value="s.code">{{ s.name }}</option>
        </select>
        <input
          v-else
          :value="state"
          @input="$emit('update:state', ($event.target as HTMLInputElement).value)"
          type="text"
          :disabled="!hasCountrySelected || loadingCities"
          :placeholder="hasCountrySelected ? t('profile.typeState') : t('profile.selectCountryFirst')"
          :class="[
            'w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl bg-slate-50 dark:bg-input-bg border text-sm sm:text-base text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-text-muted/50 transition-all',
            stateError ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'border-slate-200 dark:border-input-border focus:border-secondary focus:ring-1 focus:ring-secondary',
            'focus:shadow-[0_0_10px_rgba(0,240,255,0.2)]',
            (!hasCountrySelected || loadingCities) ? 'opacity-60 cursor-not-allowed' : ''
          ]"
          required
        />
        <p v-if="stateError" class="text-xs text-red-500">{{ stateError }}</p>
      </label>

      <!-- Cidade -->
      <label class="block space-y-1.5 sm:space-y-2">
        <span class="text-xs sm:text-sm font-medium text-slate-700 dark:text-text-muted">
          {{ t('profile.city') }} <span class="text-red-500">*</span>
        </span>
        <div class="relative">
          <select
            v-if="cities.length > 0"
            :value="city"
            @change="$emit('update:city', ($event.target as HTMLSelectElement).value)"
            :disabled="!hasStateSelected || loadingCities"
            :class="[
              'w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl bg-slate-50 dark:bg-input-bg border text-sm sm:text-base text-slate-900 dark:text-white transition-all appearance-none cursor-pointer',
              cityError ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'border-slate-200 dark:border-input-border focus:border-secondary focus:ring-1 focus:ring-secondary',
              'focus:shadow-[0_0_10px_rgba(0,240,255,0.2)]',
              (!hasStateSelected || loadingCities) ? 'opacity-60 cursor-not-allowed' : ''
            ]"
            required
          >
            <option value="">{{ hasStateSelected ? t('profile.selectCity') : (hasCountrySelected ? t('profile.selectStateFirst') : t('profile.selectCountryFirst')) }}</option>
            <option v-for="c in cities" :key="c" :value="c">{{ c }}</option>
          </select>
          <input
            v-else
            :value="city"
            @input="$emit('update:city', ($event.target as HTMLInputElement).value)"
            type="text"
            :disabled="!hasStateSelected || loadingCities"
            :placeholder="loadingCities ? t('profile.loadingCities') : (hasStateSelected ? t('profile.typeCity') : (hasCountrySelected ? t('profile.selectStateFirst') : t('profile.selectCountryFirst')))"
            :class="[
              'w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl bg-slate-50 dark:bg-input-bg border text-sm sm:text-base text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-text-muted/50 transition-all',
              cityError ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'border-slate-200 dark:border-input-border focus:border-secondary focus:ring-1 focus:ring-secondary',
              'focus:shadow-[0_0_10px_rgba(0,240,255,0.2)]',
              (!hasStateSelected || loadingCities) ? 'opacity-60 cursor-not-allowed' : ''
            ]"
            required
          />
          <div v-if="loadingCities" class="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2">
            <div class="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-2 border-secondary border-t-transparent"></div>
          </div>
        </div>
        <p v-if="cityError" class="text-xs text-red-500">{{ cityError }}</p>
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { getCountries, getStatesForCountryTranslated, fetchCities } from '@/utils/location'

const { t, locale } = useI18n()

const props = defineProps<{
  country: string
  state: string
  city: string
  countryError?: string
  stateError?: string
  cityError?: string
}>()

const emit = defineEmits<{
  (e: 'update:country', value: string): void
  (e: 'update:state', value: string): void
  (e: 'update:city', value: string): void
}>()

const cities = ref<string[]>([])
const loadingCities = ref(false)

const countries = computed(() => getCountries(locale.value as string))

const availableStates = computed(() => {
  if (!props.country || props.country === '') {
    return []
  }
  return getStatesForCountryTranslated(props.country, locale.value as string)
})

const hasCountrySelected = computed(() => {
  return props.country && props.country !== ''
})

const hasStateSelected = computed(() => {
  return hasCountrySelected.value && props.state && props.state !== ''
})

async function loadCities() {
  if (!props.country || !props.state) {
    cities.value = []
    return
  }

  loadingCities.value = true
  try {
    const fetchedCities = await fetchCities(props.country === 'USA' ? 'US' : props.country, props.state)
    cities.value = fetchedCities
  } catch (error) {
    console.error('Error loading cities:', error)
    cities.value = []
  } finally {
    loadingCities.value = false
  }
}

function handleCountryChange(event: Event) {
  const value = (event.target as HTMLSelectElement).value
  emit('update:country', value)
  emit('update:state', '')
  emit('update:city', '')
}

function handleStateChange(event: Event) {
  const value = (event.target as HTMLSelectElement).value
  emit('update:state', value)
  emit('update:city', '')
}

// Watch for state changes to trigger city loading
watch(() => props.state, (newState) => {
  if (newState && props.country) {
    loadCities()
  } else {
    cities.value = []
  }
})

// Watch for country changes
watch(() => props.country, (newCountry) => {
  if (newCountry && props.state) {
    loadCities()
  } else {
    cities.value = []
  }
})

// Initial load
onMounted(() => {
  if (props.state && props.country) {
    loadCities()
  }
})
</script>

<style scoped>
select {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2364748b' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 0.5rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
  padding-right: 2.5rem;
}

.dark select {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ffffff80' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
}

select option {
  background-color: white;
  color: #1e293b;
}

.dark select option {
  background-color: #1a151a;
  color: white;
}
</style>
