<template>
  <div>
    <div class="flex items-center justify-between mb-4 sm:mb-6">
      <h2 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">{{ t('professor.manage.studentsTab.title') }}</h2>
      <div class="text-xs sm:text-sm font-bold text-slate-600 dark:text-gray-400">
        {{ t('professor.manage.studentsTab.total', { count: students.length }) }}
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center h-64">
      <div class="animate-spin rounded-full h-10 w-10 border-4 border-secondary border-t-transparent"></div>
    </div>

    <!-- Empty State -->
    <div v-else-if="students.length === 0" class="text-center py-20 bg-white dark:bg-surface-dark rounded-2xl border border-slate-200 dark:border-white/5">
      <div class="bg-secondary/10 p-8 rounded-full w-fit mx-auto mb-6">
        <span class="material-symbols-outlined text-6xl text-secondary">group</span>
      </div>
      <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-2">{{ t('professor.manage.studentsTab.emptyTitle') }}</h3>
      <p class="text-slate-600 dark:text-gray-400">
        {{ t('professor.manage.studentsTab.emptyDesc') }}
      </p>
    </div>

    <!-- Students List -->
    <div v-else class="bg-white dark:bg-surface-dark rounded-2xl border border-slate-200 dark:border-white/5 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10">
            <tr>
              <th class="px-6 py-4 text-left text-xs font-black text-slate-600 dark:text-gray-400 uppercase tracking-wider">
                {{ t('professor.manage.studentsTab.table.student') }}
              </th>
              <th class="px-6 py-4 text-left text-xs font-black text-slate-600 dark:text-gray-400 uppercase tracking-wider">
                {{ t('professor.manage.studentsTab.table.email') }}
              </th>
              <th class="px-6 py-4 text-left text-xs font-black text-slate-600 dark:text-gray-400 uppercase tracking-wider">
                {{ t('professor.manage.studentsTab.table.enrollmentDate') }}
              </th>
              <th class="px-6 py-4 text-left text-xs font-black text-slate-600 dark:text-gray-400 uppercase tracking-wider">
                {{ t('professor.manage.studentsTab.table.status') }}
              </th>
              <th class="px-6 py-4 text-left text-xs font-black text-slate-600 dark:text-gray-400 uppercase tracking-wider">
                {{ t('professor.manage.studentsTab.table.progress') }}
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 dark:divide-white/5">
            <tr v-for="student in students" :key="student.user_id" class="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <img
                    :src="student.profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.profile?.nome || 'User')}&background=00f0ff&color=000`"
                    :alt="student.profile?.nome"
                    class="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <div class="text-sm font-bold text-slate-900 dark:text-white">
                      {{ student.profile?.nome || t('professor.manage.studentsTab.table.noName') }}
                    </div>

                  </div>
                </div>
              </td>
              <td class="px-6 py-4 text-sm text-slate-600 dark:text-gray-400">
                {{ student.profile?.email || 'N/A' }}
              </td>
              <td class="px-6 py-4 text-sm text-slate-600 dark:text-gray-400">
                {{ formatDate(student.enrolled_at) }}
              </td>
              <td class="px-6 py-4">
                <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400">
                  {{ t('professor.manage.studentsTab.table.active') }}
                </span>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="flex-1 h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden min-w-[100px]">
                    <div 
                      class="h-full bg-secondary transition-all duration-500"
                      :style="{ width: `${student.progress_percentage || 0}%` }"
                    ></div>
                  </div>
                  <span class="text-xs font-black text-slate-900 dark:text-white">{{ student.progress_percentage || 0 }}%</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useLocale } from '@/composables/useLocale'
import { supabase } from '@/lib/supabase'

const props = defineProps<{
  programId: string
}>()

const { t, locale: currentLocale } = useLocale()

const students = ref<any[]>([])
const loading = ref(true)

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString(currentLocale.value, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

async function fetchStudents() {
  loading.value = true

  try {
    const { data, error } = await supabase
      .from('program_enrollments')
      .select(`
        user_id,
        enrolled_at,
        progress_percentage,
        profile:profiles!program_enrollments_user_id_fkey(
          id,
          nome,
          nome,
          email,
          avatar_url
        )
      `)
      .eq('program_id', props.programId)
      .order('enrolled_at', { ascending: false })

    if (error) throw error

    // Fetch user emails from auth.users (requires admin privileges or service role)
    // For now, we'll just use the profile data
    students.value = data || []
  } catch (error) {
    console.error('Error fetching students:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchStudents()
})
</script>
