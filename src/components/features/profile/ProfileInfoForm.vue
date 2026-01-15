<template>
  <div class="bg-surface-dark/80 backdrop-blur rounded-2xl p-6 border border-input-border shadow-lg hover:border-secondary/30 transition-colors duration-300">
    <div class="flex items-center justify-between mb-6 pb-4 border-b border-input-border">
      <h3 class="text-xl font-bold text-white flex items-center gap-3">
        <div class="p-2 rounded-lg bg-secondary/10 border border-secondary/30">
          <span class="material-symbols-outlined text-secondary">person</span>
        </div>
        {{ t('profile.personalInfo') }}
      </h3>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Full Name -->
      <label class="block space-y-2 group">
        <span class="text-sm font-medium text-text-muted group-hover:text-secondary transition-colors">{{ t('profile.fullName') }}</span>
        <input
          :value="name"
          @input="$emit('update:name', ($event.target as HTMLInputElement).value)"
          type="text"
          :disabled="readonly"
          class="form-input w-full px-4 rounded-xl bg-input-bg border-input-border text-white focus:border-secondary focus:ring-1 focus:ring-secondary placeholder-text-muted/50 h-12 transition-all shadow-sm focus:shadow-[0_0_10px_rgba(0,240,255,0.2)] disabled:opacity-60 disabled:cursor-default disabled:border-transparent"
        />
      </label>

      <!-- Profession -->
      <label class="block space-y-2 group">
        <span class="text-sm font-medium text-text-muted group-hover:text-secondary transition-colors">{{ t('profile.areaOfWork') }}</span>
        <input
          :value="profession"
          @input="$emit('update:profession', ($event.target as HTMLInputElement).value)"
          type="text"
          :disabled="readonly"
          class="form-input w-full px-4 rounded-xl bg-input-bg border-input-border text-white focus:border-secondary focus:ring-1 focus:ring-secondary placeholder-text-muted/50 h-12 transition-all shadow-sm focus:shadow-[0_0_10px_rgba(0,240,255,0.2)] disabled:opacity-60 disabled:cursor-default disabled:border-transparent"
        />
      </label>

      <!-- Nationality -->
      <label class="block space-y-2 group">
        <span class="text-sm font-medium text-text-muted group-hover:text-secondary transition-colors">{{ t('profile.nationality') }}</span>
        <select
          :value="nationality"
          @change="$emit('update:nationality', ($event.target as HTMLSelectElement).value)"
          :disabled="readonly"
          class="form-select w-full px-4 rounded-xl bg-input-bg border-input-border text-white focus:border-secondary focus:ring-1 focus:ring-secondary h-12 transition-all shadow-sm focus:shadow-[0_0_10px_rgba(0,240,255,0.2)] disabled:opacity-60 disabled:cursor-default disabled:border-transparent appearance-none cursor-pointer"
        >
          <option value="" disabled selected>{{ t('profile.selectNationality') }}</option>
          <option v-for="nat in nationalities" :key="nat" :value="nat">{{ nat }}</option>
        </select>
      </label>

      <!-- Country -->
      <label class="block space-y-2 group">
        <span class="text-sm font-medium text-text-muted group-hover:text-secondary transition-colors">{{ t('profile.country') }}</span>
        <select
          :value="country"
          @change="handleCountryChange"
          :disabled="readonly"
          class="form-select w-full px-4 rounded-xl bg-input-bg border-input-border text-white focus:border-secondary focus:ring-1 focus:ring-secondary h-12 transition-all shadow-sm focus:shadow-[0_0_10px_rgba(0,240,255,0.2)] disabled:opacity-60 disabled:cursor-default disabled:border-transparent appearance-none cursor-pointer"
        >
          <option value="" disabled selected>{{ t('profile.selectCountry') }}</option>
          <option v-for="c in countries" :key="c.code" :value="country === 'USA' && c.code === 'US' ? 'USA' : c.code">{{ c.name }}</option>
        </select>
      </label>

      <!-- State -->
      <label class="block space-y-2 group">
        <span class="text-sm font-medium text-text-muted group-hover:text-secondary transition-colors">{{ t('profile.state') }}</span>
        <select
          v-if="availableStates.length > 0"
          :value="state"
          @change="handleStateChange"
          :disabled="readonly || !hasCountrySelected"
          class="form-select w-full px-4 rounded-xl bg-input-bg border-input-border text-white focus:border-secondary focus:ring-1 focus:ring-secondary h-12 transition-all shadow-sm focus:shadow-[0_0_10px_rgba(0,240,255,0.2)] disabled:opacity-60 disabled:cursor-not-allowed disabled:border-transparent appearance-none cursor-pointer"
        >
          <option value="" disabled selected>{{ hasCountrySelected ? t('profile.selectState') : t('profile.selectCountryFirst') }}</option>
          <option v-for="s in availableStates" :key="s.code" :value="s.code">{{ s.name }}</option>
        </select>
        <input
          v-else
          :value="state"
          @input="$emit('update:state', ($event.target as HTMLInputElement).value)"
          type="text"
          :disabled="readonly || !hasCountrySelected"
          :placeholder="hasCountrySelected ? t('profile.typeState') : t('profile.selectCountryFirst')"
          class="form-input w-full px-4 rounded-xl bg-input-bg border-input-border text-white focus:border-secondary focus:ring-1 focus:ring-secondary placeholder-text-muted/50 h-12 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        />
      </label>

      <!-- City -->
      <label class="block space-y-2 group">
        <span class="text-sm font-medium text-text-muted group-hover:text-secondary transition-colors">{{ t('profile.city') }}</span>
        <div class="relative">
          <select
            v-if="cities.length > 0"
            :value="city"
            @change="$emit('update:city', ($event.target as HTMLSelectElement).value)"
            :disabled="readonly || loadingCities || !hasStateSelected"
            class="form-select w-full px-4 rounded-xl bg-input-bg border-input-border text-white focus:border-secondary focus:ring-1 focus:ring-secondary h-12 transition-all shadow-sm focus:shadow-[0_0_10px_rgba(0,240,255,0.2)] disabled:opacity-60 disabled:cursor-not-allowed disabled:border-transparent appearance-none cursor-pointer"
          >
            <option value="" disabled selected>{{ hasStateSelected ? t('profile.selectCity') : (hasCountrySelected ? t('profile.selectStateFirst') : t('profile.selectCountryFirst')) }}</option>
            <option v-for="c in cities" :key="c" :value="c">{{ c }}</option>
          </select>
          <input
            v-else
            :value="city"
            @input="$emit('update:city', ($event.target as HTMLInputElement).value)"
            type="text"
            :disabled="readonly || loadingCities || !hasStateSelected"
            :placeholder="loadingCities ? t('profile.loadingCities') : (hasStateSelected ? t('profile.typeCity') : (hasCountrySelected ? t('profile.selectStateFirst') : t('profile.selectCountryFirst')))"
            class="form-input w-full px-4 rounded-xl bg-input-bg border-input-border text-white focus:border-secondary focus:ring-1 focus:ring-secondary placeholder-text-muted/50 h-12 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          />
          <div v-if="loadingCities" class="absolute right-4 top-1/2 -translate-y-1/2">
            <div class="animate-spin rounded-full h-4 w-4 border-2 border-secondary border-t-transparent"></div>
          </div>
        </div>
      </label>

      <!-- Email -->
      <label class="block space-y-2 group">
        <span class="text-sm font-medium text-text-muted group-hover:text-secondary transition-colors">{{ t('profile.contactEmail') }}</span>
        <div class="relative">
          <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-muted text-lg">mail</span>
          <input
            :value="email"
            @input="$emit('update:email', ($event.target as HTMLInputElement).value)"
            type="email"
            :disabled="readonly"
            :placeholder="t('profile.emailPlaceholder')"
            class="form-input w-full pl-11 pr-4 rounded-xl bg-input-bg border-input-border text-white focus:border-secondary focus:ring-1 focus:ring-secondary h-12 transition-all shadow-sm"
          />
        </div>
      </label>

      <!-- Bio -->
      <label class="block space-y-2 md:col-span-2 group">
        <span class="text-sm font-medium text-text-muted group-hover:text-secondary transition-colors">{{ t('profile.bioPlaceholder') }}</span>
        <textarea
          :value="bio"
          @input="$emit('update:bio', ($event.target as HTMLTextAreaElement).value)"
          class="form-textarea w-full rounded-xl bg-input-bg border-input-border text-white focus:border-secondary focus:ring-1 focus:ring-secondary placeholder-text-muted/50 resize-none p-4 leading-relaxed transition-all shadow-sm focus:shadow-[0_0_10px_rgba(0,240,255,0.2)] disabled:opacity-60 disabled:cursor-default disabled:border-transparent"
          rows="4"
          maxlength="500"
          :disabled="readonly"
        ></textarea>
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { getNationalities, getCountries, fetchCities, getStatesForCountryTranslated } from '@/utils/location'

const { t, locale } = useI18n()

const props = defineProps<{
  name: string
  profession: string
  country: string
  city: string
  state: string
  nationality?: string
  email?: string
  bio: string | null
  readonly?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:name', value: string): void
  (e: 'update:profession', value: string): void
  (e: 'update:country', value: string): void
  (e: 'update:city', value: string): void
  (e: 'update:state', value: string): void
  (e: 'update:nationality', value: string): void
  (e: 'update:email', value: string): void
  (e: 'update:bio', value: string): void
}>()

const cities = ref<string[]>([])
const loadingCities = ref(false)

const nationalities = computed(() => getNationalities(locale.value as string))
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
.form-select {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ffffff80' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 0.5rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
  padding-right: 2.5rem;
}

select option {
  background-color: #1a151a;
  color: white;
}
</style>
