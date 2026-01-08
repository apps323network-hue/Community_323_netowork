<template>
  <AppLayout>
    <div class="container mx-auto px-4 py-8 max-w-6xl">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-4xl font-bold text-slate-900 dark:text-white mb-2">
          {{ t('programs.myPrograms') }}
        </h1>
        <p class="text-lg text-slate-600 dark:text-gray-400">
          {{ t('programs.myEnrollments') }}
        </p>
      </div>

      <!-- Tabs -->
      <div class="mb-6 border-b border-slate-200 dark:border-white/10">
        <div class="flex gap-4">
          <button
            @click="activeTab = 'active'"
            :class="[
              'pb-3 px-1 font-medium border-b-2 transition',
              activeTab === 'active'
                ? 'border-primary dark:border-secondary text-primary dark:text-secondary'
                : 'border-transparent text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
            ]"
          >
            {{ t('programs.activePrograms') }}
          </button>
          <button
            @click="activeTab = 'completed'"
            :class="[
              'pb-3 px-1 font-medium border-b-2 transition',
              activeTab === 'completed'
                ? 'border-primary dark:border-secondary text-primary dark:text-secondary'
                : 'border-transparent text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
            ]"
          >
            {{ t('programs.completedPrograms') }}
          </button>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="programsStore.loading" class="flex justify-center items-center h-64">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary dark:border-secondary"></div>
      </div>

      <!-- Enrollments List -->
      <div v-else-if="displayedEnrollments.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          v-for="enrollment in displayedEnrollments"
          :key="enrollment.id"
          class="bg-white dark:bg-surface-dark rounded-xl shadow-md overflow-hidden hover:shadow-xl transition"
        >
          <!-- Program Image -->
          <div class="relative h-40 bg-gradient-to-br from-primary to-secondary">
            <img
              v-if="enrollment.program?.thumbnail_url"
              :src="enrollment.program.thumbnail_url"
              :alt="getProgramTitle(enrollment.program)"
              class="w-full h-full object-cover"
            />
          </div>

          <!-- Content -->
          <div class="p-5">
            <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-2">
              {{ getProgramTitle(enrollment.program) }}
            </h3>

            <!-- Progress Bar -->
            <div class="mb-4">
              <div class="flex justify-between text-sm mb-1">
                <span class="text-slate-600 dark:text-gray-400">{{ t('programs.progress') }}</span>
                <span class="font-medium text-slate-900 dark:text-white">{{ enrollment.progress_percentage }}%</span>
              </div>
              <div class="w-full bg-slate-200 dark:bg-surface-lighter rounded-full h-2">
                <div
                  class="bg-primary dark:bg-secondary h-2 rounded-full transition-all"
                  :style="{ width: `${enrollment.progress_percentage}%` }"
                ></div>
              </div>
            </div>

            <!-- Meta Info -->
            <div class="space-y-2 text-sm mb-4">
              <div class="flex items-center gap-2 text-slate-600 dark:text-gray-400">
                <span class="material-icons text-sm">calendar_today</span>
                {{ t('myServices.hiredOn', { date: formatDate(enrollment.enrolled_at) }) }}
              </div>
              <div v-if="enrollment.status === 'completed'" class="flex items-center gap-2 text-green-600 dark:text-green-400">
                <span class="material-icons text-sm">check_circle</span>
                {{ t('services.completed') }}
              </div>
            </div>

            <!-- Actions -->
            <div class="flex flex-col sm:flex-row gap-3">
              <RouterLink
                :to="`/programs/${enrollment.program_id}/assistir`"
                class="flex-1 py-3 px-4 bg-secondary text-black rounded-xl text-center font-black hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-secondary/20"
              >
                <span class="material-icons text-lg">play_circle</span>
                {{ t('programs.watchNow') }}
              </RouterLink>
              
              <a
                v-if="enrollment.program?.classroom_enabled && enrollment.program?.classroom_invite_link"
                :href="enrollment.program.classroom_invite_link"
                target="_blank"
                class="py-3 px-4 bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-gray-300 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-white/10 transition flex items-center justify-center gap-2"
              >
                <span class="material-icons text-lg text-[#1e8e3e]">school</span>
                Classroom
              </a>
              
              <RouterLink
                :to="`/programs/${enrollment.program_id}`"
                class="py-3 px-4 bg-slate-100 dark:bg-white/5 text-slate-500 rounded-xl hover:text-slate-900 dark:hover:text-white transition flex items-center justify-center"
                title="Detalhes"
              >
                <span class="material-icons text-lg">info</span>
              </RouterLink>
            </div>

            <!-- Certificate -->
            <div v-if="enrollment.certificate_issued && enrollment.certificate_url" class="mt-4 pt-4 border-t border-slate-200 dark:border-white/10">
              <a
                :href="enrollment.certificate_url"
                target="_blank"
                class="flex items-center justify-center gap-2 text-primary dark:text-secondary hover:underline font-medium"
              >
                <span class="material-icons text-sm">workspace_premium</span>
                {{ t('programs.downloadCertificate') }}
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-16">
        <div class="text-6xl mb-4">📚</div>
        <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-2">
          {{ t('programs.noEnrollmentsFound') }}
        </h3>
        <RouterLink
          to="/programs"
          class="inline-block mt-4 px-6 py-3 bg-primary dark:bg-secondary text-white rounded-lg font-medium hover:opacity-90 transition"
        >
          {{ t('programs.explorePrograms') }}
        </RouterLink>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useLocale } from '@/composables/useLocale'
import { useProgramsStore } from '@/stores/programs'
import type { Program } from '@/types/programs'
import AppLayout from '@/components/layout/AppLayout.vue'

const { t, locale: currentLocale } = useLocale()
const programsStore = useProgramsStore()

const activeTab = ref<'active' | 'completed'>('active')

const displayedEnrollments = computed(() => {
  if (activeTab.value === 'active') {
    return programsStore.activeEnrollments
  } else {
    return programsStore.completedEnrollments
  }
})

const getProgramTitle = (program: Program | undefined) => {
  if (!program) return ''
  return currentLocale.value === 'pt-BR' ? program.title_pt : program.title_en
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString(currentLocale.value, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

onMounted(() => {
  programsStore.fetchMyEnrollments()
})
</script>
