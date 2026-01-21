<template>
  <AdminLayout>
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 class="text-3xl font-bold text-slate-900 dark:text-white">
            Program List
          </h1>
          <p class="text-slate-600 dark:text-gray-400 mt-1">
            Manage all content, mentorships and workshops on the platform
          </p>
        </div>
        <RouterLink
          to="/admin/programs/criar"
          class="flex items-center gap-2 px-6 py-3 bg-primary dark:bg-secondary text-white rounded-xl font-bold shadow-lg hover:shadow-primary/25 dark:hover:shadow-secondary/25 transition-all hover:-translate-y-0.5"
        >
          <span class="material-icons">add</span>
          Create Program
        </RouterLink>
      </div>

      <!-- Filters & Search -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="relative">
          <span class="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
          <input
            v-model="search"
            type="text"
            placeholder="Search programs..."
            class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark text-slate-900 dark:text-white focus:ring-2 focus:ring-primary dark:focus:ring-secondary outline-none"
          />
        </div>
        
        <select
          v-model="filterStatus"
          class="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark text-slate-900 dark:text-white focus:ring-2 focus:ring-primary dark:focus:ring-secondary outline-none"
        >
          <option value="all">All Statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>

        <select
          v-model="filterCategory"
          class="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark text-slate-900 dark:text-white focus:ring-2 focus:ring-primary dark:focus:ring-secondary outline-none"
        >
          <option value="all">All Categories</option>
          <option value="curso">Content</option>
          <option value="mentoria">Mentorships</option>
          <option value="workshop">Workshops</option>
          <option value="evento_premium">Premium Events</option>
          <option value="servico_especializado">Services</option>
        </select>
      </div>

      <!-- Table -->
      <div class="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-slate-200 dark:border-white/5 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/5">
                <th class="p-4 font-semibold text-slate-700 dark:text-gray-300 text-sm">Program</th>
                <th class="p-4 font-semibold text-slate-700 dark:text-gray-300 text-sm">Category</th>
                <th class="p-4 font-semibold text-slate-700 dark:text-gray-300 text-sm">Students</th>
                <th class="p-4 font-semibold text-slate-700 dark:text-gray-300 text-sm">Price</th>
                <th class="p-4 font-semibold text-slate-700 dark:text-gray-300 text-sm">Status</th>
                <th class="p-4 font-semibold text-slate-700 dark:text-gray-300 text-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-white/5">
              <!-- Loading State (Skeleton Rows) -->
              <template v-if="initialLoading">
                <tr v-for="i in 5" :key="i" class="animate-pulse">
                  <td class="p-4">
                    <div class="flex items-center gap-4">
                      <div class="h-12 w-16 rounded-lg bg-slate-200 dark:bg-white/10 shrink-0"></div>
                      <div class="flex-1 space-y-2">
                        <div class="h-4 bg-slate-200 dark:bg-white/10 rounded-full w-24"></div>
                        <div class="h-3 bg-slate-200 dark:bg-white/10 rounded-full w-32"></div>
                      </div>
                    </div>
                  </td>
                  <td class="p-4"><div class="h-6 bg-slate-200 dark:bg-white/10 rounded-lg w-20"></div></td>
                  <td class="p-4">
                    <div class="h-4 bg-slate-200 dark:bg-white/10 rounded-full w-12 mb-2"></div>
                    <div class="w-24 h-1.5 bg-slate-100 dark:bg-white/10 rounded-full"></div>
                  </td>
                  <td class="p-4"><div class="h-4 bg-slate-200 dark:bg-white/10 rounded-full w-12"></div></td>
                  <td class="p-4"><div class="h-6 bg-slate-200 dark:bg-white/10 rounded-full w-20"></div></td>
                  <td class="p-4"><div class="h-8 bg-slate-200 dark:bg-white/10 rounded-lg w-24 ml-auto"></div></td>
                </tr>
              </template>

              <template v-else>
                <tr 
                  v-for="program in filteredPrograms" 
                  :key="program.id"
                  class="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                >
                <td class="p-4">
                  <div class="flex items-center gap-4">
                    <div class="h-12 w-16 rounded-lg bg-slate-200 dark:bg-white/10 overflow-hidden flex-shrink-0">
                      <img 
                        v-if="program.thumbnail_url" 
                        :src="program.thumbnail_url" 
                        class="h-full w-full object-cover"
                      />
                      <div v-else class="h-full w-full flex items-center justify-center text-slate-400">
                        <span class="material-icons text-sm">image</span>
                      </div>
                    </div>
                    <div>
                      <div class="font-bold text-slate-900 dark:text-white line-clamp-1">
                        {{ currentLocale === 'pt-BR' ? program.title_pt : program.title_en }}
                      </div>
                      <div class="text-xs text-slate-500 line-clamp-1 mt-0.5">
                        ID: {{ program.id.slice(0, 8) }}...
                      </div>
                    </div>
                  </div>
                </td>
                <td class="p-4">
                  <span class="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-gray-400 border border-slate-200 dark:border-white/5 capitalize">
                    {{ program.category.replace('_', ' ') }}
                  </span>
                </td>
                <td class="p-4">
                  <div class="text-sm">
                    <span class="font-bold text-slate-900 dark:text-white">{{ program.current_students || 0 }}</span>
                    <span class="text-slate-500 mx-1">/</span>
                    <span class="text-slate-500">{{ program.max_students ? program.max_students : '∞' }}</span>
                  </div>
                  <div class="w-24 h-1.5 bg-slate-100 dark:bg-white/10 rounded-full mt-1.5 overflow-hidden">
                    <div 
                      class="h-full bg-primary dark:bg-secondary rounded-full"
                      :style="{ width: `${Math.min(((program.current_students || 0) / (program.max_students || 1)) * 100, 100)}%` }"
                    ></div>
                  </div>
                </td>
                <td class="p-4 font-medium text-slate-900 dark:text-white">
                  ${{ program.price_usd }}
                </td>
                <td class="p-4">
                    <span 
                    class="px-2.5 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 w-fit"
                    :class="{
                      'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800': program.status === 'published',
                      'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800': program.status === 'draft',
                      'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700': program.status === 'archived'
                    }"
                  >
                    <span class="w-1.5 h-1.5 rounded-full bg-current"></span>
                    {{ program.status === 'published' ? 'Published' : program.status === 'draft' ? 'Draft' : 'Archived' }}
                  </span>
                </td>
                <td class="p-4 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <RouterLink
                      :to="`/admin/programs/${program.id}/matriculas`"
                      class="p-2 text-slate-500 hover:text-primary dark:hover:text-secondary bg-slate-100 dark:bg-white/5 rounded-lg hover:bg-white dark:hover:bg-white/10 transition-all border border-transparent hover:border-slate-200 dark:hover:border-white/10"
                      :title="'Enrollments'"
                    >
                      <span class="material-icons text-sm">people</span>
                    </RouterLink>
                    <RouterLink
                      :to="`/admin/programs/${program.id}/editar`"
                      class="p-2 text-slate-500 hover:text-blue-500 bg-slate-100 dark:bg-white/5 rounded-lg hover:bg-white dark:hover:bg-white/10 transition-all border border-transparent hover:border-slate-200 dark:hover:border-white/10"
                      title="Edit"
                    >
                      <span class="material-icons text-sm">edit</span>
                    </RouterLink>
                  </div>
                </td>
              </tr>
                <tr v-if="filteredPrograms.length === 0">
                  <td colspan="6" class="p-12 text-center text-slate-500 dark:text-gray-400">
                    <span class="material-icons text-4xl mb-2 opacity-50">block</span>
                    <p>No programs found.</p>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useLocale } from '@/composables/useLocale'
import AdminLayout from '@/components/layout/admin/AdminLayout.vue'
import { useProgramsStore } from '@/stores/programs'

const { locale: currentLocale } = useLocale()
const programsStore = useProgramsStore()

const search = ref('')
const filterStatus = ref('all')
const filterCategory = ref('all')
const initialLoading = ref(true)

const filteredPrograms = computed(() => {
  return programsStore.programs.filter(program => {
    // Search
    const searchLower = search.value.toLowerCase()
    const matchesSearch = 
      program.title_pt.toLowerCase().includes(searchLower) ||
      program.title_en.toLowerCase().includes(searchLower)

    // Status
    const matchesStatus = filterStatus.value === 'all' || program.status === filterStatus.value

    // Category
    const matchesCategory = filterCategory.value === 'all' || program.category === filterCategory.value

    return matchesSearch && matchesStatus && matchesCategory
  })
})

onMounted(async () => {
  initialLoading.value = true
  try {
    const { useAdminBaseStore } = await import('@/stores/admin/base')
    const baseStore = useAdminBaseStore()
    
    // Check admin permissions
    const isAdmin = await baseStore.checkIsAdmin()
    if (!isAdmin) {
      const router = (await import('@/router')).default
      router.push('/')
      return
    }

    await programsStore.fetchPrograms(true)
  } finally {
    initialLoading.value = false
  }
})
</script>
