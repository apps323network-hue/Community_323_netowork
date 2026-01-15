<template>
  <div class="relative z-30 rounded-[24px] p-6 bg-slate-900/50 backdrop-blur-sm border border-white/10 mb-8">
    <div class="flex flex-col lg:flex-row gap-4">
      <!-- Search -->
      <div class="flex-1">
        <div class="relative">
          <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-white/40">search</span>
          <input
            :value="modelValue.search"
            @input="handleSearchInput"
            type="text"
            placeholder="Search by name or email..."
            class="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:border-primary focus:ring-1 focus:ring-primary focus:shadow-[0_0_15px_rgba(244,37,244,0.3)] focus:outline-none transition-all"
          />
        </div>
      </div>

      <!-- Role Filter -->
      <div class="relative" ref="roleDropdownRef">
        <button
          @click="toggleDropdown('role')"
          class="flex items-center gap-2 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-all min-w-[140px] justify-between"
        >
          <span class="flex items-center gap-2">
            <span class="material-symbols-outlined text-lg">badge</span>
            <span class="text-sm">{{ roleButtonText }}</span>
          </span>
          <span class="material-symbols-outlined text-sm">
            {{ activeDropdown === 'role' ? 'expand_less' : 'expand_more' }}
          </span>
        </button>
        
        <div 
          v-if="activeDropdown === 'role'"
          class="absolute top-full right-0 mt-2 w-56 bg-slate-800 border border-white/10 rounded-xl shadow-xl z-20 py-2 max-h-64 overflow-y-auto"
        >
          <label
            v-for="role in roleOptions"
            :key="role.value"
            class="flex items-center gap-3 px-4 py-2 hover:bg-white/5 cursor-pointer transition-colors"
          >
            <input
              type="checkbox"
              :checked="isRoleSelected(role.value)"
              @change="toggleRole(role.value)"
              class="w-4 h-4 rounded border-white/20 bg-white/5 text-primary focus:ring-primary focus:ring-offset-0"
            />
            <span class="text-white/80 text-sm">{{ role.label }}</span>
          </label>
        </div>
      </div>

      <!-- Plan Filter -->
      <div class="relative" ref="planDropdownRef">
        <button
          @click="toggleDropdown('plan')"
          class="flex items-center gap-2 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-all min-w-[140px] justify-between"
        >
          <span class="flex items-center gap-2">
            <span class="material-symbols-outlined text-lg">workspace_premium</span>
            <span class="text-sm">{{ planButtonText }}</span>
          </span>
          <span class="material-symbols-outlined text-sm">
            {{ activeDropdown === 'plan' ? 'expand_less' : 'expand_more' }}
          </span>
        </button>
        
        <div 
          v-if="activeDropdown === 'plan'"
          class="absolute top-full right-0 mt-2 w-56 bg-slate-800 border border-white/10 rounded-xl shadow-xl z-20 py-2"
        >
          <label
            v-for="plan in planOptions"
            :key="plan.value"
            class="flex items-center gap-3 px-4 py-2 hover:bg-white/5 cursor-pointer transition-colors"
          >
            <input
              type="checkbox"
              :checked="isPlanSelected(plan.value)"
              @change="togglePlan(plan.value)"
              class="w-4 h-4 rounded border-white/20 bg-white/5 text-primary focus:ring-primary focus:ring-offset-0"
            />
            <span class="text-white/80 text-sm">{{ plan.label }}</span>
          </label>
        </div>
      </div>

      <!-- Status Filter -->
      <div class="relative" ref="statusDropdownRef">
        <button
          @click="toggleDropdown('status')"
          class="flex items-center gap-2 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-all min-w-[140px] justify-between"
        >
          <span class="flex items-center gap-2">
            <span class="material-symbols-outlined text-lg">check_circle</span>
            <span class="text-sm">{{ statusButtonText }}</span>
          </span>
          <span class="material-symbols-outlined text-sm">
            {{ activeDropdown === 'status' ? 'expand_less' : 'expand_more' }}
          </span>
        </button>
        
        <div 
          v-if="activeDropdown === 'status'"
          class="absolute top-full right-0 mt-2 w-56 bg-slate-800 border border-white/10 rounded-xl shadow-xl z-20 py-2"
        >
          <label
            v-for="status in statusOptions"
            :key="status.value"
            class="flex items-center gap-3 px-4 py-2 hover:bg-white/5 cursor-pointer transition-colors"
          >
            <input
              type="checkbox"
              :checked="isStatusSelected(status.value)"
              @change="toggleStatus(status.value)"
              class="w-4 h-4 rounded border-white/20 bg-white/5 text-primary focus:ring-primary focus:ring-offset-0"
            />
            <span class="text-white/80 text-sm">{{ status.label }}</span>
          </label>
        </div>
      </div>

      <!-- Date Range Quick Filters -->
      <div class="relative" ref="dateDropdownRef">
        <button
          @click="toggleDropdown('date')"
          class="flex items-center gap-2 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-all min-w-[140px] justify-between"
          :class="{ 'border-secondary shadow-[0_0_15px_rgba(0,243,255,0.3)]': modelValue.dateRange }"
        >
          <span class="flex items-center gap-2">
            <span class="material-symbols-outlined text-lg">calendar_today</span>
            <span class="text-sm">{{ dateButtonText }}</span>
          </span>
          <span class="material-symbols-outlined text-sm">
            {{ activeDropdown === 'date' ? 'expand_less' : 'expand_more' }}
          </span>
        </button>
        
        <div 
          v-if="activeDropdown === 'date'"
          class="absolute top-full right-0 mt-2 w-64 bg-slate-800 border border-white/10 rounded-xl shadow-xl z-20 py-2"
        >
          <!-- Quick Filters -->
          <div class="px-3 py-2 border-b border-white/5">
            <p class="text-white/40 text-xs font-bold uppercase tracking-wider mb-2">Quick Filters</p>
            <div class="space-y-1">
              <button
                @click="setDateRange('today')"
                class="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/5 transition-colors group"
                :class="{ 'bg-secondary/10 border border-secondary/30': modelValue.dateRange === 'today' }"
              >
                <span class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-sm" :class="modelValue.dateRange === 'today' ? 'text-secondary' : 'text-white/60'">today</span>
                  <span class="text-white/80 text-sm font-medium">Today</span>
                </span>
                <span v-if="modelValue.dateRange === 'today'" class="material-symbols-outlined text-secondary text-sm">check</span>
              </button>
              
              <button
                @click="setDateRange('week')"
                class="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/5 transition-colors group"
                :class="{ 'bg-secondary/10 border border-secondary/30': modelValue.dateRange === 'week' }"
              >
                <span class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-sm" :class="modelValue.dateRange === 'week' ? 'text-secondary' : 'text-white/60'">date_range</span>
                  <span class="text-white/80 text-sm font-medium">This Week</span>
                </span>
                <span v-if="modelValue.dateRange === 'week'" class="material-symbols-outlined text-secondary text-sm">check</span>
              </button>
              
              <button
                @click="setDateRange('month')"
                class="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/5 transition-colors group"
                :class="{ 'bg-secondary/10 border border-secondary/30': modelValue.dateRange === 'month' }"
              >
                <span class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-sm" :class="modelValue.dateRange === 'month' ? 'text-secondary' : 'text-white/60'">calendar_month</span>
                  <span class="text-white/80 text-sm font-medium">This Month</span>
                </span>
                <span v-if="modelValue.dateRange === 'month'" class="material-symbols-outlined text-secondary text-sm">check</span>
              </button>
              
              <button
                @click="setDateRange('all')"
                class="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/5 transition-colors group"
                :class="{ 'bg-white/5': !modelValue.dateRange || modelValue.dateRange === 'all' }"
              >
                <span class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-sm text-white/60">all_inclusive</span>
                  <span class="text-white/80 text-sm font-medium">All Time</span>
                </span>
                <span v-if="!modelValue.dateRange || modelValue.dateRange === 'all'" class="material-symbols-outlined text-white/40 text-sm">check</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Clear Filters -->
      <button
        v-if="hasActiveFilters"
        @click="clearFilters"
        class="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2"
      >
        <span class="material-symbols-outlined text-lg">clear_all</span>
        <span class="text-sm">Clear</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { MemberFilters } from '@/types/admin'
import type { UserRole, UserStatus } from '@/types/admin'

interface Props {
  modelValue: MemberFilters
}

interface Emits {
  (e: 'update:modelValue', value: MemberFilters): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const activeDropdown = ref<'role' | 'plan' | 'status' | 'date' | null>(null)
const roleDropdownRef = ref<HTMLElement | null>(null)
const planDropdownRef = ref<HTMLElement | null>(null)
const statusDropdownRef = ref<HTMLElement | null>(null)
const dateDropdownRef = ref<HTMLElement | null>(null)
const searchTimeout = ref<ReturnType<typeof setTimeout> | null>(null)

const roleOptions = [
  { value: 'user' as UserRole, label: 'Member' },
  { value: 'partner' as UserRole, label: 'Partner' },
  { value: 'admin' as UserRole, label: 'Admin' },
  { value: 'professor' as UserRole, label: 'Professor' }
]

const planOptions = [
  { value: 'Free', label: 'Free' },
  { value: 'Member', label: 'Member' },
  { value: 'Premium', label: 'Premium' }
]

const statusOptions = [
  { value: 'active' as UserStatus, label: 'Active' },
  { value: 'suspended' as UserStatus, label: 'Suspended' },
  { value: 'banned' as UserStatus, label: 'Banned' }
]

const roleButtonText = computed(() => {
  if (!props.modelValue.roles || props.modelValue.roles.length === 0) return 'User'
  if (props.modelValue.roles.length === 1) {
    const role = roleOptions.find(r => r.value === props.modelValue.roles![0])
    return role?.label || 'User'
  }
  return `${props.modelValue.roles.length} roles`
})

const planButtonText = computed(() => {
  if (!props.modelValue.plans || props.modelValue.plans.length === 0) return 'Plan'
  if (props.modelValue.plans.length === 1) {
    return props.modelValue.plans[0]
  }
  return `${props.modelValue.plans.length} plans`
})

const statusButtonText = computed(() => {
  if (!props.modelValue.statuses || props.modelValue.statuses.length === 0) return 'Status'
  if (props.modelValue.statuses.length === 1) {
    const status = statusOptions.find(s => s.value === props.modelValue.statuses![0])
    return status?.label || 'Status'
  }
  return `${props.modelValue.statuses.length} status`
})

const dateButtonText = computed(() => {
  if (!props.modelValue.dateRange || props.modelValue.dateRange === 'all') return 'Date'
  if (props.modelValue.dateRange === 'today') return 'Today'
  if (props.modelValue.dateRange === 'week') return 'This Week'
  if (props.modelValue.dateRange === 'month') return 'This Month'
  return 'Date'
})

const hasActiveFilters = computed(() => {
  return !!(
    props.modelValue.search ||
    (props.modelValue.roles && props.modelValue.roles.length > 0) ||
    (props.modelValue.plans && props.modelValue.plans.length > 0) ||
    (props.modelValue.statuses && props.modelValue.statuses.length > 0) ||
    (props.modelValue.dateRange && props.modelValue.dateRange !== 'all')
  )
})

function handleSearchInput(event: Event) {
  const value = (event.target as HTMLInputElement).value
  
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }
  
  searchTimeout.value = setTimeout(() => {
    emit('update:modelValue', {
      ...props.modelValue,
      search: value || undefined
    })
  }, 300)
}

function toggleDropdown(dropdown: 'role' | 'plan' | 'status' | 'date') {
  activeDropdown.value = activeDropdown.value === dropdown ? null : dropdown
}

function isRoleSelected(role: UserRole): boolean {
  return props.modelValue.roles?.includes(role) || false
}

function isPlanSelected(plan: string): boolean {
  return props.modelValue.plans?.includes(plan) || false
}

function isStatusSelected(status: UserStatus): boolean {
  return props.modelValue.statuses?.includes(status) || false
}

function toggleRole(role: UserRole) {
  const currentRoles = props.modelValue.roles || []
  const newRoles = currentRoles.includes(role)
    ? currentRoles.filter(r => r !== role)
    : [...currentRoles, role]
  
  emit('update:modelValue', {
    ...props.modelValue,
    roles: newRoles.length > 0 ? newRoles : undefined
  })
}

function togglePlan(plan: string) {
  const currentPlans = props.modelValue.plans || []
  const newPlans = currentPlans.includes(plan)
    ? currentPlans.filter(p => p !== plan)
    : [...currentPlans, plan]
  
  emit('update:modelValue', {
    ...props.modelValue,
    plans: newPlans.length > 0 ? newPlans : undefined
  })
}

function toggleStatus(status: UserStatus) {
  const currentStatuses = props.modelValue.statuses || []
  const newStatuses = currentStatuses.includes(status)
    ? currentStatuses.filter(s => s !== status)
    : [...currentStatuses, status]
  
  emit('update:modelValue', {
    ...props.modelValue,
    statuses: newStatuses.length > 0 ? newStatuses : undefined
  })
}

function setDateRange(range: 'today' | 'week' | 'month' | 'all') {
  emit('update:modelValue', {
    ...props.modelValue,
    dateRange: range === 'all' ? undefined : range
  })
  activeDropdown.value = null
}

function clearFilters() {
  emit('update:modelValue', {})
  activeDropdown.value = null
}

function handleClickOutside(event: MouseEvent) {
  const target = event.target as Node
  
  if (
    roleDropdownRef.value && !roleDropdownRef.value.contains(target) &&
    planDropdownRef.value && !planDropdownRef.value.contains(target) &&
    statusDropdownRef.value && !statusDropdownRef.value.contains(target) &&
    dateDropdownRef.value && !dateDropdownRef.value.contains(target)
  ) {
    activeDropdown.value = null
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }
})
</script>
