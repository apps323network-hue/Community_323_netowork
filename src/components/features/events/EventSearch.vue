<template>
  <div class="w-full lg:w-96 relative group">
    <div class="flex w-full items-center rounded-xl bg-white dark:bg-[#0a040f] border border-slate-200 dark:border-white/10 focus-within:border-secondary focus-within:shadow-neon-blue transition-all duration-300 h-11 sm:h-12 shadow-sm hover:shadow-md dark:hover:shadow-lg">
      <div class="text-slate-400 dark:text-white/40 group-focus-within:text-secondary flex items-center justify-center pl-4 sm:pl-5 transition-colors">
        <span class="material-symbols-outlined text-lg sm:text-xl">search</span>
      </div>
      <input
        v-model="searchQuery"
        class="flex-1 w-full bg-transparent border-none text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/40 focus:outline-none focus:ring-0 text-sm sm:text-base px-3 sm:px-4 py-2.5"
        :placeholder="t('events.searchPlaceholder')"
        type="text"
        @input="handleSearch"
      />
      <button
        v-if="searchQuery"
        class="pr-3 sm:pr-4 text-slate-400 dark:text-white/40 hover:text-primary dark:hover:text-secondary transition-colors duration-200 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-white/5 p-1"
        @click="clearSearch"
        type="button"
        aria-label="Limpar pesquisa"
      >
        <span class="material-symbols-outlined text-lg sm:text-xl">close</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const searchQuery = ref('')
let searchTimeout: ReturnType<typeof setTimeout> | null = null

const emit = defineEmits<{
  'search-change': [query: string]
}>()

function handleSearch() {
  // Debounce search
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }

  searchTimeout = setTimeout(() => {
    emit('search-change', searchQuery.value.trim())
  }, 300)
}

function clearSearch() {
  searchQuery.value = ''
  emit('search-change', '')
}

watch(() => searchQuery.value, () => {
  if (!searchQuery.value) {
    emit('search-change', '')
  }
})
</script>

<style scoped>
.shadow-neon-blue {
  box-shadow: 0 0 20px rgba(0, 240, 255, 0.4), 0 0 40px rgba(0, 240, 255, 0.2);
}
</style>

