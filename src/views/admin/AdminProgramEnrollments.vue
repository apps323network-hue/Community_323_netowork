<template>
  <AdminLayout>
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div class="space-y-1">
          <RouterLink
            to="/admin/programs"
            class="inline-flex items-center text-sm text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white transition-colors mb-2"
          >
            <span class="material-icons text-sm mr-1">arrow_back</span>
            Back to Programs
          </RouterLink>
          <div v-if="program" class="flex items-center gap-3">
             <div class="h-10 w-14 rounded bg-slate-200 dark:bg-white/10 overflow-hidden flex-shrink-0">
                <img v-if="program.thumbnail_url" :src="program.thumbnail_url" class="h-full w-full object-cover" />
                <div v-else class="h-full w-full flex items-center justify-center text-slate-400">
                  <span class="material-icons">image</span>
                </div>
             </div>
             <div>
                <h1 class="text-2xl font-bold text-slate-900 dark:text-white">
                  Enrollments: {{ currentLocale === 'pt-BR' ? program.title_pt : program.title_en }}
                </h1>
                <p class="text-slate-500 text-sm">Manage enrolled students and track progress</p>
             </div>
          </div>
          <div v-else-if="initialLoading" class="h-12 w-96 bg-slate-200 dark:bg-white/10 animate-pulse rounded-lg"></div>
        </div>

        <div v-if="initialLoading" class="w-48 h-12 bg-slate-200 dark:bg-white/10 animate-pulse rounded-xl"></div>
        <div v-else-if="enrollments.length > 0 || !loading" class="flex items-center gap-4 bg-white dark:bg-surface-dark p-3 rounded-xl border border-slate-200 dark:border-white/5 shadow-sm">
           <div class="text-center px-4 border-r border-slate-100 dark:border-white/5">
              <div class="text-2xl font-black text-primary dark:text-secondary">{{ enrollments.length }}</div>
              <div class="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{{ t('programs.admin.total') }}</div>
           </div>
           <div class="text-center px-4 border-r border-slate-100 dark:border-white/5">
              <div class="text-2xl font-black text-green-500">{{ activeCount }}</div>
              <div class="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{{ t('programs.admin.active') }}</div>
           </div>
           <div class="text-center px-4">
              <div class="text-2xl font-black text-blue-500">{{ completedCount }}</div>
              <div class="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{{ t('programs.admin.completed') }}</div>
           </div>
        </div>
      </div>

      <!-- Filters & Search -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="relative">
          <span class="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
          <input
            v-model="search"
            type="text"
            placeholder="Search student by name..."
            class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all"
          />
        </div>
        
        <select
          v-model="filterStatus"
          class="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary transition-all"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <!-- Bulk Actions -->
      <div v-if="selectedEnrollments.length > 0" class="mb-4 p-4 bg-primary/5 dark:bg-primary/10 rounded-2xl border border-primary/20 flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
        <div class="flex items-center gap-4">
          <div class="flex items-center justify-center w-10 h-10 rounded-full bg-primary/20 text-primary">
            <span class="material-icons">fact_check</span>
          </div>
          <div>
            <div class="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
              {{ selectedEnrollments.length }} {{ selectedEnrollments.length === 1 ? 'student selected' : 'students selected' }}
            </div>
            <button
              @click="clearSelection"
              class="text-xs font-bold text-slate-500 hover:text-primary transition-colors flex items-center gap-1"
            >
              <span class="material-icons text-xs">close</span>
              Clear selection
            </button>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button
            @click="storeSelectedDocuments"
            :disabled="storingBulk"
            class="flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-blue-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span class="material-icons text-sm" :class="{ 'animate-pulse': storingBulk }">cloud_upload</span>
            {{ storingBulk ? 'Storing...' : 'Store Documents' }}
          </button>
          <button
            @click="exportSelected"
            :disabled="exportingBulk"
            class="flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-green-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span class="material-icons text-sm" :class="{ 'animate-pulse': exportingBulk }">download</span>
            {{ exportingBulk ? 'Exporting...' : 'Export Selected' }}
          </button>
        </div>
      </div>

      <!-- Table -->
      <div class="bg-white dark:bg-surface-dark rounded-2xl shadow-sm border border-slate-200 dark:border-white/5 overflow-hidden">
        <div class="overflow-x-auto">

          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50/50 dark:bg-white/5 border-b border-slate-200 dark:border-white/5">
                <th class="p-4 w-12">
                  <input
                    type="checkbox"
                    :checked="isAllSelected"
                    @change="toggleSelectAll"
                    class="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
                  />
                </th>
                <th class="p-4 font-bold text-slate-500 dark:text-gray-400 text-xs uppercase tracking-wider">{{ t('programs.admin.tableStudent') }}</th>
                <th class="p-4 font-bold text-slate-500 dark:text-gray-400 text-xs uppercase tracking-wider">{{ t('programs.admin.tableEnrollmentDate') }}</th>
                <th class="p-4 font-bold text-slate-500 dark:text-gray-400 text-xs uppercase tracking-wider">{{ t('programs.admin.tableProgress') }}</th>
                <th class="p-4 font-bold text-slate-500 dark:text-gray-400 text-xs uppercase tracking-wider">{{ t('programs.admin.tablePayment') }}</th>
                <th class="p-4 font-bold text-slate-500 dark:text-gray-400 text-xs uppercase tracking-wider">{{ t('programs.admin.tableStatus') }}</th>
                <th class="p-4 font-bold text-slate-500 dark:text-gray-400 text-xs uppercase tracking-wider text-right">{{ t('programs.admin.tableActions') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-white/5">
              <!-- Loading State -->
              <template v-if="initialLoading">
                <tr v-for="i in 5" :key="i" class="animate-pulse">
                  <td class="p-4">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 rounded-full bg-slate-200 dark:bg-white/10"></div>
                      <div class="space-y-2">
                        <div class="h-3 bg-slate-200 dark:bg-white/10 rounded w-24"></div>
                        <div class="h-2 bg-slate-200 dark:bg-white/10 rounded w-16"></div>
                      </div>
                    </div>
                  </td>
                  <td class="p-4"><div class="h-3 bg-slate-200 dark:bg-white/10 rounded w-20"></div></td>
                  <td class="p-4"><div class="h-3 bg-slate-200 dark:bg-white/10 rounded w-24"></div></td>
                  <td class="p-4"><div class="h-3 bg-slate-200 dark:bg-white/10 rounded w-16"></div></td>
                  <td class="p-4"><div class="h-4 bg-slate-200 dark:bg-white/10 rounded-full w-20"></div></td>
                  <td class="p-4 text-right"><div class="h-8 bg-slate-200 dark:bg-white/10 rounded w-16 ml-auto"></div></td>
                </tr>
              </template>

              <template v-else>
                <tr v-for="enrollment in paginatedEnrollments" :key="enrollment.id" class="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                  <td class="p-4">
                    <input
                      type="checkbox"
                      :checked="isEnrollmentSelected(enrollment.id)"
                      @change="toggleEnrollmentSelection(enrollment.id)"
                      class="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
                    />
                  </td>
                  <td class="p-4">
                    <div class="flex items-center gap-3">
                      <img v-if="enrollment.user?.avatar_url" :src="enrollment.user.avatar_url" class="w-10 h-10 rounded-full object-cover border-2 border-slate-100 dark:border-white/10" />
                      <div v-else class="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-400 font-bold">
                          {{ enrollment.user?.nome?.substring(0, 2).toUpperCase() || 'U' }}
                      </div>
                      <div>
                        <div class="font-bold text-slate-900 dark:text-white capitalize">{{ enrollment.user?.nome || 'User' }}</div>
                        <div class="text-[10px] text-slate-500 font-mono">{{ enrollment.id.split('-')[0] }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="p-4">
                    <div class="text-sm text-slate-600 dark:text-gray-400">
                      {{ new Date(enrollment.enrolled_at).toLocaleDateString() }}
                    </div>
                    <div class="text-[10px] text-slate-400">
                      {{ new Date(enrollment.enrolled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
                    </div>
                  </td>
                  <td class="p-4">
                     <div class="flex items-center gap-2">
                       <div class="flex-1 h-1.5 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden min-w-[60px]">
                          <div 
                            class="h-full bg-primary dark:bg-secondary rounded-full transition-all duration-500"
                            :style="{ width: `${enrollment.progress_percentage || 0}%` }"
                          ></div>
                        </div>
                        <span class="text-xs font-bold text-slate-700 dark:text-white">{{ Math.round(enrollment.progress_percentage || 0) }}%</span>
                     </div>
                  </td>
                  <td class="p-4">
                     <span 
                      class="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest"
                      :class="{
                        'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400': enrollment.payment_status === 'paid',
                        'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400': enrollment.payment_status === 'pending',
                        'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400': enrollment.payment_status === 'failed'
                      }"
                    >
                      {{ enrollment.payment_status === 'paid' ? 'Paid' : enrollment.payment_status === 'pending' ? 'Pending' : 'Failed' }}
                    </span>
                    <div v-if="enrollment.payment_amount" class="text-[10px] text-slate-400 mt-1">
                      {{ enrollment.payment_currency || 'USD' }} {{ enrollment.payment_amount }}
                    </div>
                  </td>
                  <td class="p-4">
                    <span 
                      class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ring-1 ring-inset"
                      :class="{
                        'bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-400/10 dark:text-green-400 dark:ring-green-400/20': enrollment.status === 'active',
                        'bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-400/10 dark:text-blue-400 dark:ring-blue-400/20': enrollment.status === 'completed',
                        'bg-yellow-50 text-yellow-700 ring-yellow-600/20 dark:bg-yellow-400/10 dark:text-yellow-400 dark:ring-yellow-400/20': enrollment.status === 'pending',
                        'bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-400/10 dark:text-red-400 dark:ring-red-400/20': enrollment.status === 'cancelled'
                      }"
                    >
                      {{ formatStatus(enrollment.status) }}
                    </span>
                  </td>
                  <td class="p-4 text-right">
                    <div class="flex items-center justify-end gap-1">
                       <!-- Store enrollment document button -->
                       <button
                        @click="storeEnrollmentDocument(enrollment)"
                        :disabled="storing === enrollment.id"
                        class="p-2 text-blue-500 hover:text-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all disabled:opacity-50"
                        title="Store enrollment document in bucket"
                      >
                        <span class="material-icons text-sm" :class="{ 'animate-pulse': storing === enrollment.id }">{{ storing === enrollment.id ? 'cloud_upload' : 'save' }}</span>
                      </button>
                       <!-- Export enrollment data button -->
                       <button
                        @click="exportEnrollmentData(enrollment)"
                        :disabled="exporting === enrollment.id"
                        class="p-2 text-green-500 hover:text-green-600 rounded-lg hover:bg-green-50 dark:hover:bg-green-500/10 transition-all disabled:opacity-50"
                        title="Export complete enrollment data"
                      >
                        <span class="material-icons text-sm" :class="{ 'animate-pulse': exporting === enrollment.id }">{{ exporting === enrollment.id ? 'download' : 'description' }}</span>
                      </button>
                       <!-- Sync with Stripe button -->
                       <button
                        v-if="enrollment.payment_id && enrollment.payment_status !== 'paid'"
                        @click="syncPaymentFromStripe(enrollment)"
                        :disabled="syncing === enrollment.id"
                        class="p-2 text-blue-500 hover:text-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all disabled:opacity-50"
                        title="Sync payment status from Stripe"
                      >
                        <span class="material-icons text-sm" :class="{ 'animate-spin': syncing === enrollment.id }">{{ syncing === enrollment.id ? 'refresh' : 'sync' }}</span>
                      </button>
                       <button
                        @click="openStatusModal(enrollment)"
                        class="p-2 text-slate-400 hover:text-primary dark:hover:text-secondary rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
                        title="Change Status"
                      >
                        <span class="material-icons text-sm">settings</span>
                      </button>
                      <RouterLink
                        :to="`/admin/users/${enrollment.user_id}/history`"
                        class="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
                        :title="t('programs.admin.viewHistory')"
                      >
                        <span class="material-icons text-sm">history</span>
                      </RouterLink>
                    </div>
                  </td>
                </tr>
                <tr v-if="filteredEnrollments.length === 0">
                  <td colspan="6" class="p-16 text-center text-slate-500 dark:text-gray-400">
                    <div class="flex flex-col items-center gap-2">
                      <span class="material-icons text-4xl opacity-20">group_off</span>
                      <p class="font-bold">No enrollments found.</p>
                      <p class="text-xs opacity-60">Try adjusting your search filters.</p>
                    </div>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
        
        <!-- Pagination -->
        <div v-if="filteredEnrollments.length > 0" class="p-6 border-t border-slate-200 dark:border-white/5 bg-slate-50/30 dark:bg-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
          <div class="flex items-center gap-4">
            <span class="text-sm font-bold text-slate-600 dark:text-slate-400">
              Showing {{ ((currentPage - 1) * itemsPerPage) + 1 }} - {{ Math.min(currentPage * itemsPerPage, filteredEnrollments.length) }} of {{ filteredEnrollments.length }} enrollments
            </span>
            <select v-model="itemsPerPage" @change="currentPage = 1" class="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-800 text-sm font-bold">
              <option :value="10">10 per page</option>
              <option :value="25">25 per page</option>
              <option :value="50">50 per page</option>
              <option :value="100">100 per page</option>
            </select>
          </div>

          <div v-if="totalPages > 1" class="flex items-center gap-2">
            <button 
              @click="currentPage--" 
              :disabled="currentPage === 1"
              class="h-10 w-10 flex items-center justify-center rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-500 disabled:opacity-30 enabled:hover:bg-primary/10 enabled:hover:text-primary transition-all"
            >
              <span class="material-icons">chevron_left</span>
            </button>
            
            <div class="flex items-center gap-1">
              <button 
                v-for="page in Math.min(totalPages, 5)" 
                :key="page"
                @click="currentPage = page"
                :class="currentPage === page ? 'bg-primary text-white scale-110' : 'bg-white dark:bg-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5'"
                class="h-10 w-10 flex items-center justify-center rounded-lg border border-slate-200 dark:border-white/10 text-sm font-bold transition-all"
              >
                {{ page }}
              </button>
            </div>
            
            <button 
              @click="currentPage++" 
              :disabled="currentPage === totalPages"
              class="h-10 w-10 flex items-center justify-center rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-500 disabled:opacity-30 enabled:hover:bg-primary/10 enabled:hover:text-primary transition-all"
            >
              <span class="material-icons">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

       <!-- Status Update Modal -->
       <div v-if="selectedEnrollment" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div class="bg-white dark:bg-surface-dark w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden transform transition-all">
             <div class="p-6">
                <div class="flex items-center justify-between mb-6">
                   <h3 class="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{{ t('programs.admin.changeStatusTitle') }}</h3>
                   <button @click="selectedEnrollment = null" class="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                      <span class="material-icons">close</span>
                   </button>
                </div>
                
                <div class="flex items-center gap-4 mb-6 p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5">
                   <img v-if="selectedEnrollment.user?.avatar_url" :src="selectedEnrollment.user.avatar_url" class="w-12 h-12 rounded-full border-2 border-white dark:border-slate-800 shadow-sm" />
                   <div v-else class="w-12 h-12 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-400 font-bold">
                        {{ selectedEnrollment.user?.nome?.substring(0, 2).toUpperCase() || 'U' }}
                   </div>
                   <div>
                      <div class="font-bold text-slate-900 dark:text-white">{{ selectedEnrollment.user?.nome }}</div>
                      <div class="text-xs text-slate-500">Program: {{ currentLocale === 'pt-BR' ? program?.title_pt : program?.title_en }}</div>
                   </div>
                </div>

                <div class="space-y-4">
                   <div>
                      <label class="block text-xs font-bold text-slate-500 dark:text-gray-400 uppercase mb-2">Enrollment Status</label>
                      <select v-model="newStatus" class="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-gray-700 bg-white dark:bg-surface-dark text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary transition-all">
                         <option value="pending">Pending</option>
                         <option value="active">Active</option>
                         <option value="completed">Completed</option>
                         <option value="cancelled">Cancelled</option>
                      </select>
                   </div>

                   <div>
                      <label class="block text-xs font-bold text-slate-500 dark:text-gray-400 uppercase mb-2">Payment Status</label>
                      <select v-model="newPaymentStatus" class="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-gray-700 bg-white dark:bg-surface-dark text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary transition-all">
                         <option value="pending">Pending</option>
                         <option value="paid">Paid</option>
                         <option value="failed">Failed</option>
                         <option value="refunded">Refunded</option>
                      </select>
                   </div>

                   <!-- Quick action button -->
                   <button
                      @click="markAsPaidAndActive"
                      class="w-full px-4 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                   >
                      <span class="material-icons text-sm">check_circle</span>
                      Mark as Paid & Active
                   </button>
                </div>

                <div class="mt-6 flex gap-3">
                   <button @click="selectedEnrollment = null" class="flex-1 px-4 py-3 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
                      {{ t('programs.admin.cancel') }}
                   </button>
                   <button @click="updateBothStatuses" :disabled="updating" class="flex-1 px-4 py-3 bg-primary dark:bg-secondary text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
                      <span v-if="updating" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      {{ updating ? t('programs.admin.saving') : t('programs.admin.confirm') }}
                   </button>
                </div>
             </div>
          </div>
       </div>

    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useLocale } from '@/composables/useLocale'
import AdminLayout from '@/components/layout/admin/AdminLayout.vue'
import { useProgramsStore } from '@/stores/programs'
import { toast } from 'vue-sonner'
import { supabase } from '@/lib/supabase'
import type { Program, ProgramEnrollment, EnrollmentStatus, PaymentStatus } from '@/types/programs'

const route = useRoute()
const { locale: currentLocale, t } = useLocale()
const programsStore = useProgramsStore()

const program = ref<Program | null>(null)
const enrollments = ref<ProgramEnrollment[]>([])
const loading = ref(true)
const initialLoading = ref(true)
const updating = ref(false)
const syncing = ref<string | null>(null) // ID of enrollment being synced
const exporting = ref<string | null>(null) // ID of enrollment being exported
const exportingBulk = ref(false) // Bulk export in progress
const storing = ref<string | null>(null) // ID of enrollment being stored
const storingBulk = ref(false) // Bulk store in progress

const search = ref('')
const filterStatus = ref('all')

// Pagination
const currentPage = ref(1)
const itemsPerPage = ref(10)

// Multi-selection
const selectedEnrollments = ref<string[]>([])

const selectedEnrollment = ref<ProgramEnrollment | null>(null)
const newStatus = ref<EnrollmentStatus>('active')
const newPaymentStatus = ref<PaymentStatus>('pending')

const filteredEnrollments = computed(() => {
  return enrollments.value.filter(e => {
    const searchLower = search.value.toLowerCase()
    const matchesSearch = e.user?.nome?.toLowerCase().includes(searchLower) || false
    const matchesStatus = filterStatus.value === 'all' || e.status === filterStatus.value
    return matchesSearch && matchesStatus
  })
})

// Paginação
const totalPages = computed(() => Math.ceil(filteredEnrollments.value.length / itemsPerPage.value))

const paginatedEnrollments = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredEnrollments.value.slice(start, end)
})

// Selection helpers
const isAllSelected = computed(() => {
  if (paginatedEnrollments.value.length === 0) return false
  return paginatedEnrollments.value.every(e => selectedEnrollments.value.includes(e.id))
})

const isEnrollmentSelected = (id: string) => {
  return selectedEnrollments.value.includes(id)
}

const toggleEnrollmentSelection = (id: string) => {
  const index = selectedEnrollments.value.indexOf(id)
  if (index > -1) {
    selectedEnrollments.value.splice(index, 1)
  } else {
    selectedEnrollments.value.push(id)
  }
}

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    // Deselect all from current page
    const pageIds = paginatedEnrollments.value.map(e => e.id)
    selectedEnrollments.value = selectedEnrollments.value.filter(id => !pageIds.includes(id))
  } else {
    // Select all from current page
    const pageIds = paginatedEnrollments.value.map(e => e.id)
    pageIds.forEach(id => {
      if (!selectedEnrollments.value.includes(id)) {
        selectedEnrollments.value.push(id)
      }
    })
  }
}

const clearSelection = () => {
  selectedEnrollments.value = []
}

const activeCount = computed(() => enrollments.value.filter(e => e.status === 'active').length)
const completedCount = computed(() => enrollments.value.filter(e => e.status === 'completed').length)

const formatStatus = (status: string) => {
  const map: Record<string, string> = {
    active: t('programs.admin.active'),
    completed: t('programs.admin.completed'),
    pending: t('programs.admin.pending'),
    cancelled: t('programs.admin.cancelled')
  }
  return map[status] || status
}

const openStatusModal = (enrollment: ProgramEnrollment) => {
  selectedEnrollment.value = enrollment
  newStatus.value = enrollment.status
  newPaymentStatus.value = enrollment.payment_status || 'pending'
}

const markAsPaidAndActive = () => {
  newStatus.value = 'active'
  newPaymentStatus.value = 'paid'
}

const updateBothStatuses = async () => {
  if (!selectedEnrollment.value) return
  
  updating.value = true
  try {
    // Update both status and payment_status
    const { error } = await supabase
      .from('program_enrollments')
      .update({
        status: newStatus.value,
        payment_status: newPaymentStatus.value,
        paid_at: newPaymentStatus.value === 'paid' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', selectedEnrollment.value.id)

    if (error) throw error

    toast.success('Enrollment updated successfully!')
    
    // Refresh the list
    const programId = route.params.id as string
    const e = await programsStore.fetchProgramEnrollments(programId)
    enrollments.value = e
    
    selectedEnrollment.value = null
  } catch (error: any) {
    console.error('Error updating enrollment:', error)
    toast.error('An error occurred: ' + (error.message || 'Unknown error'))
  } finally {
    updating.value = false
  }
}

const syncPaymentFromStripe = async (enrollment: ProgramEnrollment) => {
  if (!enrollment.payment_id) return

  syncing.value = enrollment.id
  
  try {
    // Detect if payment_id is from live mode (starts with cs_live_)
    const isLivePayment = enrollment.payment_id.startsWith('cs_live_')
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    
    // Force live mode if we're on localhost but checking a live payment
    const forceLiveMode = isLocalhost && isLivePayment
    
    if (forceLiveMode) {
      console.log('[Admin] Forcing LIVE mode for live payment from localhost')
    }
    
    const { data, error } = await supabase.functions.invoke('check-payment-status', {
      body: { 
        session_id: enrollment.payment_id,
        force_live_mode: forceLiveMode
      }
    })

    if (error) throw error

    if (data?.status === 'completed') {
      toast.success('Payment confirmed! Enrollment activated.')
      // Refresh the list
      const programId = route.params.id as string
      const e = await programsStore.fetchProgramEnrollments(programId)
      enrollments.value = e
    } else {
      toast.warning(`Payment is still ${data?.stripe_status || 'pending'} on Stripe.`)
    }
  } catch (error: any) {
    console.error('Error syncing payment:', error)
    toast.error('Error syncing with Stripe: ' + (error.message || 'Unknown error'))
  } finally {
    syncing.value = null
  }
}

const exportEnrollmentData = async (enrollment: ProgramEnrollment) => {
  exporting.value = enrollment.id
  
  try {
    const { useEnrollmentExport } = await import('@/composables/useEnrollmentExport')
    const { exportEnrollmentPDF } = useEnrollmentExport()
    
    await exportEnrollmentPDF(enrollment.id)
  } catch (error: any) {
    console.error('Error exporting enrollment data:', error)
    toast.error('Error exporting data: ' + (error.message || 'Unknown error'))
  } finally {
    exporting.value = null
  }
}

const exportSelected = async () => {
  if (selectedEnrollments.value.length === 0) {
    toast.error('Please select at least one student to export')
    return
  }

  exportingBulk.value = true
  
  try {
    // Get full enrollment data for selected IDs
    const selectedEnrollmentData = enrollments.value.filter(e => 
      selectedEnrollments.value.includes(e.id)
    )

    // Fetch term acceptances for all selected users
    const exportData: Record<string, any>[] = []
    
    for (const enrollment of selectedEnrollmentData) {
      try {
        // Buscar dados completos do perfil do usuário (incluindo email)
        const { data: userProfile, error: profileError } = await supabase
          .from('profiles')
          .select('nome, email')
          .eq('id', enrollment.user_id)
          .single()

        if (profileError) {
          console.error('Error fetching user profile:', profileError)
        }

        // Buscar aceites de termos do usuário
        const { data: termAcceptances, error: termsError } = await supabase
          .from('comprehensive_term_acceptance')
          .select(`
            *,
            term:term_id (
              title,
              term_type,
              version
            )
          `)
          .eq('user_id', enrollment.user_id)
          .order('accepted_at', { ascending: false })

        if (termsError) {
          console.error('Error fetching term acceptances:', termsError)
        }

        // Organizar aceites de termos
        const privacyAcceptance = termAcceptances?.find((a: any) => a.term.term_type === 'privacy_policy')
        const tosAcceptance = termAcceptances?.find((a: any) => a.term.term_type === 'terms_of_service')
        
        // Buscar termos específicos do programa (se houver)
        const programTerms = termAcceptances?.filter((a: any) => 
          a.term.term_type !== 'privacy_policy' && a.term.term_type !== 'terms_of_service'
        ) || []

        const row: Record<string, string> = {
          'Name': userProfile?.nome || enrollment.user?.nome || 'N/A',
          'Email': userProfile?.email || 'N/A',
          'Enrollment Date': enrollment.enrolled_at 
            ? new Date(enrollment.enrolled_at).toLocaleString('en-US') 
            : 'N/A',
          'Payment Amount': enrollment.payment_amount 
            ? `${enrollment.payment_currency || 'USD'} ${(enrollment.payment_amount / 100).toFixed(2)}`
            : 'N/A',
          'Payment ID': enrollment.payment_id || 'N/A',
          'Payment Method': enrollment.payment_method === 'card' ? 'Credit Card' 
            : enrollment.payment_method === 'pix' ? 'PIX' 
            : enrollment.payment_method || 'N/A',
          'Payment Status': enrollment.payment_status === 'paid' ? 'Paid'
            : enrollment.payment_status === 'pending' ? 'Pending'
            : enrollment.payment_status === 'failed' ? 'Failed'
            : enrollment.payment_status || 'N/A',
          'Payment Date': enrollment.paid_at
            ? new Date(enrollment.paid_at).toLocaleString('en-US')
            : enrollment.payment_status === 'paid' && enrollment.updated_at
              ? new Date(enrollment.updated_at).toLocaleString('en-US')
              : 'N/A',
          'Privacy Policy': privacyAcceptance 
            ? `Accepted (v${privacyAcceptance.term.version}) on ${new Date(privacyAcceptance.accepted_at).toLocaleString('en-US')}`
            : 'Not accepted',
          'Terms of Service': tosAcceptance
            ? `Accepted (v${tosAcceptance.term.version}) on ${new Date(tosAcceptance.accepted_at).toLocaleString('en-US')}`
            : 'Not accepted'
        }

        // Adicionar termos específicos do programa (se houver)
        if (programTerms.length > 0) {
          programTerms.forEach((programTerm: any, index: number) => {
            row[`Program Term ${index + 1}`] = `${programTerm.term.title} (v${programTerm.term.version}) - Accepted on ${new Date(programTerm.accepted_at).toLocaleString('en-US')}`
          })
        }

        exportData.push(row)
      } catch (err) {
        console.error('Error processing enrollment:', enrollment.id, err)
      }
    }

    if (exportData.length === 0) {
      toast.error('No data to export')
      return
    }

    // Convert to CSV
    const headers = Object.keys(exportData[0])
    const csvContent = [
      headers.join(','), // Header row
      ...exportData.map(row => 
        headers.map(header => {
          const value = row[header] || ''
          // Escape commas and quotes in values
          const escaped = String(value).replace(/"/g, '""')
          return `"${escaped}"`
        }).join(',')
      )
    ].join('\n')

    // Create and download CSV file
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', `matriculas_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast.success(`${exportData.length} enrollment(s) exported successfully!`)
    clearSelection()
  } catch (error: any) {
    console.error('Error exporting enrollments:', error)
    toast.error('Error exporting: ' + (error.message || 'Unknown error'))
  } finally {
    exportingBulk.value = false
  }
}

const storeEnrollmentDocument = async (enrollment: ProgramEnrollment) => {
  storing.value = enrollment.id
  
  try {
    // Verificar se o documento já existe e foi enviado
    const { data: existingDoc, error: checkError } = await supabase
      .from('legal_documents')
      .select('id, email_sent, email_sent_at, storage_path, filename')
      .eq('document_type', 'enrollment_contract')
      .eq('related_id', enrollment.id)
      .eq('email_sent', true)
      .maybeSingle()

    if (checkError) {
      console.error('Error checking existing document:', checkError)
    }

    if (existingDoc) {
      const sentDate = existingDoc.email_sent_at 
        ? new Date(existingDoc.email_sent_at).toLocaleString('en-US')
        : 'unknown date'
      
      toast.info(`Document already generated and sent on ${sentDate}. File: ${existingDoc.filename}`)
      storing.value = null
      return
    }

    // Se não existe ou não foi enviado, gerar novo documento
    const { data, error } = await supabase.functions.invoke('generate-legal-pdf', {
      body: {
        type: 'enrollment_contract',
        enrollment_id: enrollment.id,
        user_id: enrollment.user_id
      }
    })

    if (error) throw error

    if (data?.success) {
      toast.success('Enrollment document stored and sent successfully!')
    } else {
      throw new Error('Failed to store document')
    }
  } catch (error: any) {
    console.error('Error storing enrollment document:', error)
    toast.error('Error storing document: ' + (error.message || 'Unknown error'))
  } finally {
    storing.value = null
  }
}

const storeSelectedDocuments = async () => {
  if (selectedEnrollments.value.length === 0) {
    toast.error('Please select at least one student to store documents')
    return
  }

  storingBulk.value = true
  let successCount = 0
  let errorCount = 0
  let skippedCount = 0
  
  try {
    // Get full enrollment data for selected IDs
    const selectedEnrollmentData = enrollments.value.filter(e => 
      selectedEnrollments.value.includes(e.id)
    )
    
    // Store document for each selected enrollment
    for (const enrollment of selectedEnrollmentData) {
      try {
        // Verificar se o documento já existe e foi enviado
        const { data: existingDoc, error: checkError } = await supabase
          .from('legal_documents')
          .select('id, email_sent')
          .eq('document_type', 'enrollment_contract')
          .eq('related_id', enrollment.id)
          .eq('email_sent', true)
          .maybeSingle()

        if (checkError) {
          console.error('Error checking existing document for enrollment:', enrollment.id, checkError)
        }

        if (existingDoc) {
          console.log(`Skipping enrollment ${enrollment.id} - document already exists and was sent`)
          skippedCount++
          continue
        }

        // Se não existe ou não foi enviado, gerar novo documento
        const { data, error } = await supabase.functions.invoke('generate-legal-pdf', {
          body: {
            type: 'enrollment_contract',
            enrollment_id: enrollment.id,
            user_id: enrollment.user_id
          }
        })

        if (error) throw error

        if (data?.success) {
          successCount++
        }
        
        // Small delay between operations to avoid overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 500))
      } catch (err) {
        console.error('Error storing document for enrollment:', enrollment.id, err)
        errorCount++
      }
    }
    
    // Mensagens de feedback
    const messages = []
    if (successCount > 0) {
      messages.push(`${successCount} document(s) stored and sent`)
    }
    if (skippedCount > 0) {
      messages.push(`${skippedCount} already existed`)
    }
    if (errorCount > 0) {
      messages.push(`${errorCount} failed`)
    }
    
    if (messages.length > 0) {
      if (errorCount > 0) {
        toast.warning(messages.join(' | '))
      } else {
        toast.success(messages.join(' | '))
      }
    }
    
    clearSelection()
  } catch (error: any) {
    console.error('Error storing selected documents:', error)
    toast.error('Error storing documents: ' + (error.message || 'Unknown error'))
  } finally {
    storingBulk.value = false
  }
}

onMounted(async () => {
  initialLoading.value = true
  const programId = route.params.id as string
  
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

    // Fetch program details
    const p = await programsStore.fetchProgramById(programId)
    if (p) program.value = p
    
    // Fetch enrollments
    const e = await programsStore.fetchProgramEnrollments(programId)
    enrollments.value = e
  } catch (error) {
    console.error('Error loading data:', error)
    toast.error(t('programs.admin.errorLoadingEnrollments'))
  } finally {
    initialLoading.value = false
    loading.value = false
  }
})
</script>
