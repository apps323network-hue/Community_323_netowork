<template>
  <AdminLayout>
    <div class="w-full flex flex-col gap-6 sm:gap-8">
      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-slate-900 dark:text-white text-4xl lg:text-5xl font-black mb-3">
          Content <span class="bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-primary animate-gradient">Reports</span>
        </h1>
        <p class="text-slate-600 dark:text-white/60 text-lg">
          Manage community content reports and inappropriate content
        </p>
      </div>

      <!-- Stats -->
      <ReportStats :stats="reportStats" />

      <!-- Tabs -->
      <div class="flex gap-2 sm:gap-3 overflow-x-auto no-scrollbar pb-1 border-b border-slate-200 dark:border-white/10">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          class="flex h-9 sm:h-10 shrink-0 items-center justify-center rounded-t-lg px-4 sm:px-6 text-xs sm:text-sm font-medium transition-all relative"
          :class="activeTab === tab.id
            ? 'bg-white dark:bg-surface-card text-slate-900 dark:text-white border-t-2 border-primary'
            : 'text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white border-t-2 border-transparent'"
          @click="handleTabChange(tab.id)"
        >
          {{ tab.label }}
          <span
            v-if="tab.badge"
            class="ml-2 px-1.5 py-0.5 rounded-full text-[10px] font-bold"
            :class="tab.badgeClass"
          >
            {{ tab.badge }}
          </span>
        </button>
      </div>

      <!-- Content based on active tab -->
      <AdminReportsList
        :reports="displayedReports"
        :loading="loading"
        @resolve="handleResolve"
        @dismiss="handleDismiss"
        @view-details="handleViewDetails"
      />

      <!-- Resolve Modal -->
      <ResolveReportModal
        v-model="showResolveModal"
        :report="selectedReport"
        @resolved="handleResolved"
      />
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAdminStore } from '@/stores/admin'
import AdminLayout from '@/components/layout/admin/AdminLayout.vue'
import AdminReportsList from '@/components/admin/AdminReportsList.vue'
import ResolveReportModal from '@/components/admin/ResolveReportModal.vue'
import ReportStats from '@/components/admin/ReportStats.vue'
import type { Report } from '@/types/admin'

const router = useRouter()
const adminStore = useAdminStore()

const activeTab = ref('all')
const showResolveModal = ref(false)
const selectedReport = ref<Report | null>(null)

const reports = computed(() => adminStore.reports)
const reportStats = computed(() => adminStore.reportStats)
const loading = computed(() => adminStore.loading)

const tabs = computed(() => [
  {
    id: 'all',
    label: 'All',
    badge: undefined,
    badgeClass: '',
  },
  {
    id: 'pending',
    label: 'Pending',
    badge: reportStats.value.pending > 0 ? reportStats.value.pending : undefined,
    badgeClass: 'bg-yellow-500/20 text-yellow-400',
  },
  {
    id: 'resolved',
    label: 'Resolved',
    badge: undefined,
    badgeClass: '',
  },
  {
    id: 'dismissed',
    label: 'Dismissed',
    badge: undefined,
    badgeClass: '',
  },
])

const displayedReports = computed(() => {
  if (activeTab.value === 'pending') {
    return reports.value.filter(r => r.status === 'pending')
  } else if (activeTab.value === 'resolved') {
    return reports.value.filter(r => r.status === 'resolved')
  } else if (activeTab.value === 'dismissed') {
    return reports.value.filter(r => r.status === 'dismissed')
  }
  return reports.value
})

function handleTabChange(tabId: string) {
  activeTab.value = tabId
}

function handleResolve(report: Report) {
  selectedReport.value = report
  showResolveModal.value = true
}

async function handleDismiss(reportId: string) {
  try {
    await adminStore.dismissReport(reportId)
    await adminStore.fetchReports()
    await adminStore.fetchReportStats()
  } catch (error) {
    console.error('Error dismissing report:', error)
  }
}

function handleViewDetails(reportId: string) {
  const report = reports.value.find(r => r.id === reportId)
  if (report) {
    selectedReport.value = report
    showResolveModal.value = true
  }
}

async function handleResolved() {
  showResolveModal.value = false
  selectedReport.value = null
  await adminStore.fetchReports()
  await adminStore.fetchReportStats()
}

onMounted(async () => {
  // Verificar se é admin
  const isAdmin = await adminStore.checkIsAdmin()
  if (!isAdmin) {
    router.push('/')
    return
  }

  await adminStore.fetchReports()
  await adminStore.fetchReportStats()
})
</script>

<style scoped>
@keyframes gradient {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

.animate-gradient {
  background-size: 200% 200%;
  animation: gradient 3s ease infinite;
}
</style>

