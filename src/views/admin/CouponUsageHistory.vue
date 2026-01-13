<template>
  <AdminLayout>
    <div class="space-y-8">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="flex items-center gap-4">
          <RouterLink
            to="/admin/cupons"
            class="flex items-center justify-center p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition"
          >
            <span class="material-icons">arrow_back</span>
          </RouterLink>
          <div>
            <h1 class="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
              Usage History
            </h1>
            <p class="text-slate-500 dark:text-gray-400 font-medium">
              See who and where coupons were applied.
            </p>
          </div>
        </div>
      </div>

      <!-- Filters & Search -->
      <div class="bg-white dark:bg-surface-dark p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-white/5">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="relative">
            <span class="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            <input
              v-model="search"
              type="text"
              placeholder="Search by code, user or program..."
              class="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary dark:focus:ring-secondary outline-none transition-all"
            />
          </div>
        </div>
      </div>

      <!-- Usage Table -->
      <div class="bg-white dark:bg-surface-dark rounded-3xl shadow-sm border border-slate-200 dark:border-white/5 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50 dark:bg-white/5 border-b border-slate-100 dark:border-white/5">
                <th class="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Coupon</th>
                <th class="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">User</th>
                <th class="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Program</th>
                <th class="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Discount</th>
                <th class="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Date</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-white/5">
              <tr 
                v-for="use in filteredUsages" 
                :key="use.id"
                class="group hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors"
                v-if="!loading"
              >
                <!-- Coupon Code -->
                <td class="p-6">
                  <span class="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-black font-mono tracking-tighter uppercase">
                    {{ use.coupons?.code || '---' }}
                  </span>
                </td>

                <!-- User -->
                <td class="p-6">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center overflow-hidden shrink-0">
                      <img v-if="use.profiles?.avatar_url" :src="use.profiles.avatar_url" class="w-full h-full object-cover" />
                      <span v-else class="text-xs font-bold text-slate-400 uppercase">{{ (use.profiles?.nome || 'U').substring(0, 1) }}</span>
                    </div>
                    <div class="flex flex-col min-w-0">
                      <span class="text-sm font-bold text-slate-900 dark:text-white truncate">{{ use.profiles?.nome || 'Unknown User' }}</span>
                      <span class="text-[10px] text-slate-400 truncate">{{ use.profiles?.email }}</span>
                    </div>
                  </div>
                </td>

                <!-- Program -->
                <td class="p-6">
                  <span class="text-sm text-slate-700 dark:text-gray-300 font-medium truncate max-w-[200px] block">
                    {{ currentLocale === 'pt-BR' ? use.programs?.title_pt : use.programs?.title_en }}
                  </span>
                </td>

                <!-- Discount -->
                <td class="p-6 text-center">
                  <span class="text-sm font-black text-green-500">
                    -${{ Number(use.discount_applied).toFixed(2) }}
                  </span>
                </td>

                <!-- Date -->
                <td class="p-6 text-right">
                  <span class="text-xs text-slate-500 dark:text-gray-400 whitespace-nowrap">
                    {{ new Date(use.used_at).toLocaleDateString() }} {{ new Date(use.used_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
                  </span>
                </td>
              </tr>

              <!-- Empty State -->
              <tr v-if="filteredUsages.length === 0 && !loading">
                <td colspan="5" class="p-20 text-center">
                  <div class="flex flex-col items-center justify-center opacity-30 grayscale">
                    <span class="material-icons text-6xl mb-4">history_toggle_off</span>
                    <p class="text-xl font-bold text-slate-500 dark:text-white uppercase tracking-tighter">No usage records found</p>
                  </div>
                </td>
              </tr>

              <!-- Loading State -->
              <tr v-if="loading">
                <td colspan="5" class="p-20 text-center">
                   <div class="flex flex-col items-center justify-center gap-4 animate-pulse">
                    <div class="w-12 h-12 border-4 border-slate-200 dark:border-white/10 border-t-primary rounded-full animate-spin"></div>
                    <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading history...</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'
import { useLocale } from '@/composables/useLocale'
import AdminLayout from '@/components/layout/admin/AdminLayout.vue'

const { locale: currentLocale } = useLocale()
const loading = ref(true)
const usages = ref<any[]>([])
const search = ref('')

const filteredUsages = computed(() => {
  if (!search.value) return usages.value
  
  const query = search.value.toLowerCase()
  return usages.value.filter(u => 
    (u.coupons?.code || '').toLowerCase().includes(query) ||
    (u.profiles?.nome || '').toLowerCase().includes(query) ||
    (u.profiles?.email || '').toLowerCase().includes(query) ||
    (u.programs?.title_pt || '').toLowerCase().includes(query) ||
    (u.programs?.title_en || '').toLowerCase().includes(query)
  )
})

async function fetchUsages() {
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('coupon_uses')
      .select(`
        *,
        coupons (code),
        profiles (nome, email, avatar_url),
        programs (title_pt, title_en)
      `)
      .order('used_at', { ascending: false })

    if (error) throw error
    usages.value = data || []
  } catch (err) {
    console.error('Error fetching coupon usages:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchUsages()
})
</script>
