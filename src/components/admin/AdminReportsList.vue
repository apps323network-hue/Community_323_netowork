<template>
  <div class="space-y-6">
    <!-- Filtros e Busca -->
    <div class="flex flex-col sm:flex-row gap-4">
      <div class="flex-1">
        <div class="relative">
          <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/40 text-xl">search</span>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search reports..."
            class="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/40 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
          />
        </div>
      </div>
      <div class="flex gap-2">
        <select
          v-model="filterStatus"
          class="px-4 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark text-slate-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="reviewed">Reviewed</option>
          <option value="resolved">Resolved</option>
          <option value="dismissed">Dismissed</option>
        </select>
        <select
          v-model="filterItemType"
          class="px-4 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark text-slate-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
        >
          <option value="">All types</option>
          <option value="post">Posts</option>
          <option value="comment">Comments</option>
          <option value="user">Users</option>
        </select>
        <select
          v-model="filterReason"
          class="px-4 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark text-slate-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
        >
          <option value="">All reasons</option>
          <option value="spam">Spam</option>
          <option value="inappropriate">Inappropriate</option>
          <option value="harassment">Harassment</option>
          <option value="fake_news">Fake News</option>
          <option value="other">Other</option>
        </select>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="space-y-4">
      <div v-for="i in 3" :key="i" class="bg-white dark:bg-surface-dark rounded-xl p-6 border border-slate-200 dark:border-white/10 animate-pulse">
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1 space-y-4">
            <div class="flex gap-2">
              <div class="h-6 bg-slate-200 dark:bg-white/10 rounded-full w-20"></div>
              <div class="h-6 bg-slate-200 dark:bg-white/10 rounded-full w-20"></div>
            </div>
            <div class="h-20 bg-slate-200 dark:bg-white/10 rounded-lg w-full"></div>
            <div class="space-y-2">
              <div class="h-3 bg-slate-200 dark:bg-white/10 rounded w-48"></div>
              <div class="h-3 bg-slate-200 dark:bg-white/10 rounded w-32"></div>
            </div>
          </div>
          <div class="flex flex-col gap-2">
            <div class="h-9 bg-slate-200 dark:bg-white/10 rounded-lg w-28"></div>
            <div class="h-9 bg-slate-200 dark:bg-white/10 rounded-lg w-28"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!loading && filteredReports.length === 0" class="flex flex-col items-center justify-center py-12 bg-slate-50 dark:bg-surface-dark/50 rounded-xl border border-slate-200 dark:border-white/10">
      <span class="material-symbols-outlined text-slate-400 dark:text-gray-500 text-6xl mb-4">report</span>
      <p class="text-slate-600 dark:text-gray-400 font-medium">
        {{ searchQuery || filterStatus || filterItemType || filterReason ? 'No reports found' : 'No reports registered' }}
      </p>
    </div>

    <!-- Lista de Reports -->
    <div v-else class="space-y-4">
      <div
        v-for="report in filteredReports"
        :key="report.id"
        class="bg-white dark:bg-surface-dark rounded-xl p-6 border border-slate-200 dark:border-white/10 hover:border-primary/50 transition-all"
      >
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1 min-w-0">
            <!-- Header com tipo e status -->
            <div class="flex items-center gap-3 mb-3 flex-wrap">
              <span
                class="px-2 py-1 rounded-full text-xs font-bold"
                :class="getItemTypeClass(report.reported_item_type)"
              >
                {{ getItemTypeLabel(report.reported_item_type) }}
              </span>
              <span
                class="px-2 py-1 rounded-full text-xs font-bold"
                :class="getStatusClass(report.status)"
              >
                {{ getStatusLabel(report.status) }}
              </span>
              <span
                class="px-2 py-1 rounded-full text-xs font-bold"
                :class="getReasonClass(report.reason)"
              >
                {{ getReasonLabel(report.reason) }}
              </span>
            </div>

            <!-- Preview do conteúdo reportado -->
            <div class="bg-slate-50 dark:bg-surface-card rounded-lg p-4 border border-slate-200 dark:border-white/5 mb-3">
              <p class="text-slate-600 dark:text-white/60 text-xs mb-2">Reported content:</p>
              <p class="text-slate-700 dark:text-white/80 text-sm line-clamp-2">
                {{ getReportedItemPreview(report) }}
              </p>
            </div>

            <!-- Informações do report -->
            <div class="space-y-2 text-sm">
              <div class="flex items-center gap-2 text-slate-600 dark:text-white/60">
                <span class="material-symbols-outlined text-base">person</span>
                <span>Reported by: <span class="text-slate-900 dark:text-white font-medium">{{ report.reporter_name || 'User' }}</span></span>
              </div>
              <div class="flex items-center gap-2 text-slate-600 dark:text-white/60">
                <span class="material-symbols-outlined text-base">schedule</span>
                <span>{{ formatDate(report.created_at) }}</span>
              </div>
              <div v-if="report.description" class="mt-2 p-3 bg-slate-50 dark:bg-surface-card rounded-lg border border-slate-200 dark:border-white/5">
                <p class="text-slate-600 dark:text-white/60 text-xs mb-1">Description:</p>
                <p class="text-slate-700 dark:text-white/80 text-sm">{{ report.description }}</p>
              </div>
              <div v-if="report.resolved_by" class="flex items-center gap-2 text-slate-600 dark:text-white/60 mt-2">
                <span class="material-symbols-outlined text-base">check_circle</span>
                <span>Resolved by: <span class="text-slate-900 dark:text-white font-medium">{{ report.resolver_name || 'Admin' }}</span></span>
                <span v-if="report.resolved_at" class="text-slate-500 dark:text-white/40">at {{ formatDate(report.resolved_at) }}</span>
              </div>
            </div>
          </div>

          <!-- Ações -->
          <div class="flex flex-col gap-2 flex-shrink-0">
            <button
              v-if="report.status === 'pending'"
              @click="$emit('resolve', report)"
              class="flex items-center gap-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-600 dark:text-green-400 border border-green-500/30 rounded-lg font-semibold transition-all text-sm"
            >
              <span class="material-symbols-outlined text-base">check_circle</span>
              <span>Resolve</span>
            </button>
            <button
              v-if="report.status === 'pending'"
              @click="$emit('dismiss', report.id)"
              class="flex items-center gap-2 px-4 py-2 bg-gray-500/20 hover:bg-gray-500/30 text-gray-600 dark:text-gray-400 border border-gray-500/30 rounded-lg font-semibold transition-all text-sm"
            >
              <span class="material-symbols-outlined text-base">close</span>
              <span>Dismiss</span>
            </button>
            <button
              @click="$emit('view-details', report.id)"
              class="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-surface-lighter hover:bg-slate-200 dark:hover:bg-surface-highlight text-slate-700 dark:text-white border border-slate-200 dark:border-white/10 rounded-lg font-semibold transition-all text-sm"
            >
              <span class="material-symbols-outlined text-base">visibility</span>
              <span>View Details</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Report } from '@/types/admin'

interface Props {
  reports: Report[]
  loading: boolean
}

const props = defineProps<Props>()

defineEmits<{
  resolve: [report: Report]
  dismiss: [reportId: string]
  'view-details': [reportId: string]
}>()

const searchQuery = ref('')
const filterStatus = ref('')
const filterItemType = ref('')
const filterReason = ref('')

const filteredReports = computed(() => {
  let filtered = props.reports

  // Filtrar por busca
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(r => {
      const reporterName = (r.reporter_name || '').toLowerCase()
      const description = (r.description || '').toLowerCase()
      const preview = getReportedItemPreview(r).toLowerCase()
      return reporterName.includes(query) || description.includes(query) || preview.includes(query)
    })
  }

  // Filtrar por status
  if (filterStatus.value) {
    filtered = filtered.filter(r => r.status === filterStatus.value)
  }

  // Filtrar por tipo
  if (filterItemType.value) {
    filtered = filtered.filter(r => r.reported_item_type === filterItemType.value)
  }

  // Filtrar por motivo
  if (filterReason.value) {
    filtered = filtered.filter(r => r.reason === filterReason.value)
  }

  // Ordenar: pendentes primeiro, depois por data (mais recente)
  return filtered.sort((a, b) => {
    if (a.status === 'pending' && b.status !== 'pending') return -1
    if (a.status !== 'pending' && b.status === 'pending') return 1
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })
})

function getItemTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    post: 'Post',
    comment: 'Comment',
    user: 'User',
  }
  return labels[type] || type
}

function getItemTypeClass(type: string): string {
  const classes: Record<string, string> = {
    post: 'bg-blue-500/20 text-blue-400',
    comment: 'bg-purple-500/20 text-purple-400',
    user: 'bg-orange-500/20 text-orange-400',
  }
  return classes[type] || 'bg-gray-500/20 text-gray-400'
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: 'Pending',
    reviewed: 'Reviewed',
    resolved: 'Resolved',
    dismissed: 'Dismissed',
  }
  return labels[status] || status
}

function getStatusClass(status: string): string {
  const classes: Record<string, string> = {
    pending: 'bg-yellow-500/20 text-yellow-400',
    reviewed: 'bg-blue-500/20 text-blue-400',
    resolved: 'bg-green-500/20 text-green-400',
    dismissed: 'bg-gray-500/20 text-gray-400',
  }
  return classes[status] || 'bg-gray-500/20 text-gray-400'
}

function getReasonLabel(reason: string): string {
  const labels: Record<string, string> = {
    spam: 'Spam',
    inappropriate: 'Inappropriate',
    harassment: 'Harassment',
    fake_news: 'Fake News',
    other: 'Other',
  }
  return labels[reason] || reason
}

function getReasonClass(reason: string): string {
  const classes: Record<string, string> = {
    spam: 'bg-purple-500/20 text-purple-400',
    inappropriate: 'bg-red-500/20 text-red-400',
    harassment: 'bg-red-600/20 text-red-500',
    fake_news: 'bg-orange-500/20 text-orange-400',
    other: 'bg-gray-500/20 text-gray-400',
  }
  return classes[reason] || 'bg-gray-500/20 text-gray-400'
}

function getReportedItemPreview(report: Report): string {
  if (report.reported_item) {
    if (report.reported_item_type === 'post' || report.reported_item_type === 'comment') {
      return (report.reported_item as any).conteudo || 'No content'
    } else if (report.reported_item_type === 'user') {
      return (report.reported_item as any).nome || 'User'
    }
  }
  return `ID: ${report.reported_item_id}`
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

