<template>
  <div class="w-full lg:w-96">
    <div class="flex w-full items-center rounded-lg bg-white dark:bg-surface-card border border-slate-200 dark:border-white/10 focus-within:border-secondary focus-within:shadow-neon-blue transition-all h-10 sm:h-11">
      <div class="text-slate-400 dark:text-white/40 flex items-center justify-center pl-3 sm:pl-4">
        <span class="material-symbols-outlined text-base sm:text-lg">search</span>
      </div>
      <input
        v-model="searchQuery"
        class="w-full bg-transparent border-none text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/30 focus:ring-0 text-xs sm:text-sm px-2 sm:px-3"
        :placeholder="t('events.searchPlaceholder')"
        type="text"
        @input="handleSearch"
      />
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

watch(() => searchQuery.value, () => {
  if (!searchQuery.value) {
    emit('search-change', '')
  }
})
</script>

<style scoped>
.shadow-neon-blue {
  box-shadow: 0 0 15px rgba(0, 240, 255, 0.3);
}
</style>

