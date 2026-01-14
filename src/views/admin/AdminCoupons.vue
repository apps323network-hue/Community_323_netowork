<template>
  <AdminLayout>
    <div class="space-y-8">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
            Coupons Management
          </h1>
          <p class="text-slate-500 dark:text-gray-400 font-medium">
            Create and manage discount coupons for your programs and services.
          </p>
        </div>
        <div class="flex items-center gap-3">
          <RouterLink
            to="/admin/cupons/historico"
            class="flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-white/5 text-slate-700 dark:text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-slate-50 dark:hover:bg-white/10 transition-all border border-slate-200 dark:border-white/10"
          >
            <span class="material-icons text-sm">history</span>
            History
          </RouterLink>
          <button
            @click="handleCreateCoupon"
            class="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-secondary text-black font-black uppercase tracking-widest text-xs rounded-2xl hover:scale-105 transition-all shadow-xl shadow-primary/20"
          >
            <span class="material-icons">add</span>
            New Coupon
          </button>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <template v-if="initialLoading">
          <div v-for="i in 4" :key="i" class="bg-white dark:bg-surface-dark p-6 rounded-3xl animate-pulse h-24 border border-slate-200 dark:border-white/5"></div>
        </template>
        <template v-else>
          <div v-for="stat in stats" :key="stat.label" class="bg-white dark:bg-surface-dark p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-white/5 group hover:border-primary/30 transition-all">
            <div class="flex items-center gap-4">
              <div :class="`w-12 h-12 rounded-2xl flex items-center justify-center ${stat.bgClass} transition-transform group-hover:scale-110` ">
                <span class="material-icons">{{ stat.icon }}</span>
              </div>
              <div>
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{{ stat.label }}</p>
                <p class="text-2xl font-black text-slate-900 dark:text-white leading-none">
                  {{ stat.prefix }}{{ stat.value }}{{ stat.suffix }}
                </p>
              </div>
            </div>
          </div>
        </template>
      </div>

      <!-- Filters & Search -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="relative">
          <span class="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
          <input
            v-model="search"
            type="text"
            placeholder="Search by code or description..."
            class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark text-slate-900 dark:text-white focus:ring-2 focus:ring-primary dark:focus:ring-secondary outline-none"
          />
        </div>
        
        <select
          v-model="statusFilter"
          class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark text-slate-900 dark:text-white focus:ring-2 focus:ring-primary dark:focus:ring-secondary outline-none"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="expired">Expired</option>
        </select>

        <select
          v-model="typeFilter"
          class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark text-slate-900 dark:text-white focus:ring-2 focus:ring-primary dark:focus:ring-secondary outline-none"
        >
          <option value="all">All Types</option>
          <option value="percentage">Percentage (%)</option>
          <option value="fixed">Fixed Amount ($)</option>
        </select>
      </div>

      <!-- Coupons Table -->
      <div class="bg-white dark:bg-surface-dark rounded-3xl shadow-sm border border-slate-200 dark:border-white/5 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50 dark:bg-white/5 border-b border-slate-100 dark:border-white/5">
                <th class="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Coupon</th>
                <th class="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Value / Type</th>
                <th class="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Uses</th>
                <th class="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Validity</th>
                <th class="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th class="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-white/5">
              <tr 
                v-for="coupon in filteredCoupons" 
                :key="coupon.id"
                class="group transition-colors"
                v-if="!loading"
              >
                <!-- Coupon Code & Desc -->
                <td class="p-6">
                  <div class="flex flex-col">
                    <span class="text-sm font-black text-slate-900 dark:text-white font-mono uppercase tracking-tighter">{{ coupon.code }}</span>
                    <span class="text-xs text-slate-500 dark:text-gray-400 truncate max-w-[200px]">{{ coupon.description || 'No description' }}</span>
                  </div>
                </td>

                <!-- Value / Type -->
                <td class="p-6">
                  <div class="flex items-center gap-2">
                    <span class="text-sm font-bold text-slate-900 dark:text-white">
                      {{ coupon.discount_type === 'percentage' ? coupon.discount_value + '%' : '$' + coupon.discount_value }}
                    </span>
                    <span class="text-[10px] font-black uppercase text-slate-400 bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-md">
                      {{ coupon.discount_type === 'percentage' ? 'Perc' : 'Fixed' }}
                    </span>
                  </div>
                </td>

                <!-- Uses -->
                <td class="p-6 text-center">
                  <div class="flex flex-col items-center">
                    <span class="text-sm font-bold text-slate-700 dark:text-white">{{ coupon.current_uses }}</span>
                    <span class="text-[8px] font-bold text-slate-400 uppercase tracking-widest">of {{ coupon.max_uses || '∞' }}</span>
                  </div>
                </td>

                <!-- Validity -->
                <td class="p-6">
                  <div class="flex flex-col gap-1">
                    <div class="flex items-center gap-2 text-xs text-slate-600 dark:text-gray-300">
                      <span class="material-icons text-xs">calendar_today</span>
                      <span>{{ formatDate(coupon.valid_from) }}</span>
                    </div>
                    <div v-if="coupon.valid_until" class="flex items-center gap-2 text-xs text-slate-400">
                      <span class="material-icons text-xs">event_busy</span>
                      <span :class="{'text-red-500': isExpired(coupon.valid_until)}">{{ formatDate(coupon.valid_until) }}</span>
                    </div>
                    <span v-else class="text-[10px] font-bold text-slate-400 uppercase italic">No expiration</span>
                  </div>
                </td>

                <!-- Status -->
                <td class="p-6">
                  <span 
                    :class="getStatusClass(coupon)"
                    class="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full inline-flex items-center gap-1.5"
                  >
                    <span class="w-1.5 h-1.5 rounded-full bg-current"></span>
                    {{ getStatusText(coupon) }}
                  </span>
                </td>

                <!-- Actions -->
                <td class="p-6 text-right">
                  <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      @click="handleToggleStatus(coupon)"
                      class="p-2 rounded-xl text-slate-400 hover:text-primary hover:bg-primary/10 transition-all"
                      :title="coupon.is_active ? 'Deactivate' : 'Activate'"
                    >
                      <span class="material-icons text-sm">{{ coupon.is_active ? 'visibility_off' : 'visibility' }}</span>
                    </button>
                    <button 
                      @click="handleEditCoupon(coupon)"
                      class="p-2 rounded-xl text-slate-400 hover:text-secondary hover:bg-secondary/10 transition-all"
                      title="Edit"
                    >
                      <span class="material-icons text-sm">edit</span>
                    </button>
                    <button 
                      @click="handleDeleteCoupon(coupon)"
                      class="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-all font-bold"
                      title="Delete"
                    >
                      <span class="material-icons text-sm">delete</span>
                    </button>
                  </div>
                </td>
              </tr>

              <!-- Empty State -->
              <tr v-if="filteredCoupons.length === 0 && !loading">
                <td colspan="6" class="p-20 text-center">
                  <div class="flex flex-col items-center justify-center opacity-30 grayscale">
                    <span class="material-icons text-6xl mb-4">local_offer</span>
                    <p class="text-xl font-bold text-slate-500 dark:text-white uppercase tracking-tighter">No coupons found</p>
                    <p class="text-sm text-slate-500 dark:text-gray-400 mt-2">Try adjusting your filters or create a new coupon.</p>
                  </div>
                </td>
              </tr>

              <!-- Loading State -->
              <template v-if="initialLoading">
                <tr v-for="i in 5" :key="i" class="animate-pulse">
                  <td class="p-6">
                    <div class="space-y-2">
                      <div class="h-4 bg-slate-200 dark:bg-white/10 rounded w-24"></div>
                      <div class="h-3 bg-slate-200 dark:bg-white/10 rounded w-32"></div>
                    </div>
                  </td>
                  <td class="p-6"><div class="h-5 bg-slate-200 dark:bg-white/10 rounded w-20"></div></td>
                  <td class="p-6 text-center"><div class="h-5 bg-slate-200 dark:bg-white/10 rounded w-12 mx-auto"></div></td>
                  <td class="p-6"><div class="h-8 bg-slate-200 dark:bg-white/10 rounded w-24"></div></td>
                  <td class="p-6"><div class="h-6 bg-slate-200 dark:bg-white/10 rounded-full w-20"></div></td>
                  <td class="p-6 text-right"><div class="h-8 bg-slate-200 dark:bg-white/10 rounded-xl w-24 ml-auto"></div></td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal Form -->
    <CouponFormModal
      v-if="showModal"
      :coupon="selectedCoupon"
      @close="closeModal"
      @saved="onCouponSaved"
    />
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import AdminLayout from '@/components/layout/admin/AdminLayout.vue'
import CouponFormModal from '@/components/admin/CouponFormModal.vue'
import { supabase } from '@/lib/supabase'
import { toast } from 'vue-sonner'

const coupons = ref<any[]>([])
const loading = ref(true)
const initialLoading = ref(true)
const search = ref('')
const statusFilter = ref('all')
const typeFilter = ref('all')
const showModal = ref(false)
const selectedCoupon = ref<any>(null)

// Stats
const totals = ref({
  total: 0,
  active: 0,
  uses: 0,
  savings: 0
})

const stats = computed(() => [
  { 
    label: 'Total Coupons', 
    value: totals.value.total, 
    icon: 'local_offer', 
    bgClass: 'bg-primary/20 text-primary',
    prefix: '',
    suffix: ''
  },
  { 
    label: 'Active Now', 
    value: totals.value.active, 
    icon: 'bolt', 
    bgClass: 'bg-secondary/20 text-secondary',
    prefix: '',
    suffix: ''
  },
  { 
    label: 'Total Uses', 
    value: totals.value.uses, 
    icon: 'shopping_cart', 
    bgClass: 'bg-blue-500/20 text-blue-500',
    prefix: '',
    suffix: ''
  },
  { 
    label: 'Total Savings', 
    value: totals.value.savings.toFixed(2), 
    icon: 'savings', 
    bgClass: 'bg-green-500/20 text-green-500',
    prefix: '$',
    suffix: ''
  }
])

const filteredCoupons = computed(() => {
  return coupons.value.filter(c => {
    const matchesSearch = 
      c.code.toLowerCase().includes(search.value.toLowerCase()) || 
      (c.description || '').toLowerCase().includes(search.value.toLowerCase())
    
    const matchesType = typeFilter.value === 'all' || c.discount_type === typeFilter.value
    
    let matchesStatus = true
    if (statusFilter.value === 'active') {
      matchesStatus = c.is_active && (!c.valid_until || new Date(c.valid_until) > new Date())
    } else if (statusFilter.value === 'inactive') {
      matchesStatus = !c.is_active
    } else if (statusFilter.value === 'expired') {
      matchesStatus = c.valid_until && new Date(c.valid_until) < new Date()
    }

    return matchesSearch && matchesType && matchesStatus
  })
})

async function fetchCoupons() {
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    coupons.value = data || []
    
    // Calculate stats
    calculateStats()
  } catch (error: any) {
    console.error('Error fetching coupons:', error)
    toast.error('Error loading coupons')
  } finally {
    loading.value = false
  }
}

async function calculateStats() {
  const { data: countData } = await supabase.from('coupons').select('id, is_active, current_uses, valid_until')
  const { data: usageData } = await supabase.from('coupon_uses').select('discount_applied')

  if (countData) {
    totals.value.total = countData.length
    totals.value.active = countData.filter(c => c.is_active && (!c.valid_until || new Date(c.valid_until) > new Date())).length
    totals.value.uses = countData.reduce((acc, curr) => acc + (curr.current_uses || 0), 0)
  }

  if (usageData) {
    totals.value.savings = usageData.reduce((acc, curr) => acc + Number(curr.discount_applied || 0), 0)
  }
}

function formatDate(date: string) {
  if (!date) return '-'
  return new Date(date).toLocaleDateString()
}

function isExpired(date: string) {
  return new Date(date) < new Date()
}

function getStatusClass(coupon: any) {
  if (!coupon.is_active) return 'bg-slate-100 dark:bg-white/5 text-slate-500'
  if (coupon.valid_until && isExpired(coupon.valid_until)) return 'bg-red-500/10 text-red-500'
  return 'bg-secondary/10 text-secondary'
}

function getStatusText(coupon: any) {
  if (!coupon.is_active) return 'Inactive'
  if (coupon.valid_until && isExpired(coupon.valid_until)) return 'Expired'
  return 'Active'
}

function handleCreateCoupon() {
  selectedCoupon.value = null
  showModal.value = true
}

function handleEditCoupon(coupon: any) {
  selectedCoupon.value = coupon
  showModal.value = true
}

async function handleToggleStatus(coupon: any) {
  try {
    const { error } = await supabase
      .from('coupons')
      .update({ is_active: !coupon.is_active })
      .eq('id', coupon.id)

    if (error) throw error
    toast.success(`Coupon ${coupon.is_active ? 'deactivated' : 'activated'} successfully`)
    fetchCoupons()
  } catch (error) {
    toast.error('Error updating status')
  }
}

async function handleDeleteCoupon(coupon: any) {
  if (!confirm('Are you sure you want to permanently delete this coupon?')) return

  try {
    const { error } = await supabase
      .from('coupons')
      .delete()
      .eq('id', coupon.id)

    if (error) throw error
    toast.success('Coupon deleted successfully')
    fetchCoupons()
  } catch (error) {
    toast.error('Error deleting coupon')
  }
}

function closeModal() {
  showModal.value = false
  selectedCoupon.value = null
}

function onCouponSaved() {
  fetchCoupons()
}

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

    await fetchCoupons()
  } catch (error) {
    console.error('Error initializing coupons view:', error)
  } finally {
    initialLoading.value = false
  }
})
</script>

<style scoped>
.material-icons {
  font-family: 'Material Icons';
}
</style>
