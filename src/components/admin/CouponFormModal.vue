<template>
  <Modal
    v-model="isOpen"
    :title="coupon ? 'Edit Coupon' : 'Create New Coupon'"
    size="lg"
  >
    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Code -->
      <div>
        <label class="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
          Coupon Code *
        </label>
        <input
          v-model="formData.code"
          type="text"
          maxlength="20"
          placeholder="EX: NATAL2024"
          class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark text-slate-900 dark:text-white focus:ring-2 focus:ring-primary dark:focus:ring-secondary outline-none uppercase"
          required
        />
        <p class="text-xs text-slate-500 mt-1">Uppercase letters and numbers only</p>
      </div>

      <!-- Description -->
      <div>
        <label class="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
          Description
        </label>
        <textarea
          v-model="formData.description"
          rows="2"
          placeholder="Ex: Christmas discount for all content"
          class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark text-slate-900 dark:text-white focus:ring-2 focus:ring-primary dark:focus:ring-secondary outline-none resize-none"
        ></textarea>
      </div>

      <!--Discount Type & Value -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
            Discount Type *
          </label>
          <select
            v-model="formData.discount_type"
            class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark text-slate-900 dark:text-white focus:ring-2 focus:ring-primary dark:focus:ring-secondary outline-none"
            required
          >
            <option value="percentage">Percentage (%)</option>
            <option value="fixed">Fixed Amount ($)</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
            Value *
          </label>
          <input
            v-model.number="formData.discount_value"
            type="number"
            step="0.01"
            min="0.01"
            :max="formData.discount_type === 'percentage' ? 100 : undefined"
            placeholder="Ex: 20 or 50.00"
            class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark text-slate-900 dark:text-white focus:ring-2 focus:ring-primary dark:focus:ring-secondary outline-none"
            required
          />
        </div>
      </div>

      <!-- Scope Type -->
      <div>
        <label class="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
          Applicable to *
        </label>
        <select
          v-model="formData.scope_type"
          class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark text-slate-900 dark:text-white focus:ring-2 focus:ring-primary dark:focus:ring-secondary outline-none"
          required
        >
          <option value="all">All Programs</option>
          <option value="specific_programs">Specific Programs</option>
          <option value="category">Program Category</option>
        </select>
      </div>

      <!-- Specific Programs -->
      <div v-if="formData.scope_type === 'specific_programs'" class="space-y-3">
        <label class="block text-sm font-medium text-slate-700 dark:text-gray-300">
          Select Programs
        </label>
        
        <!-- Search bar -->
        <div class="relative">
          <span class="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
          <input
            v-model="searchProgram"
            type="text"
            placeholder="Search programs..."
            class="w-full pl-11 pr-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary dark:focus:ring-secondary outline-none transition-all"
          />
        </div>

        <!-- Programs List -->
        <div class="border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden bg-white dark:bg-white/5 shadow-inner">
          <div class="max-h-[220px] overflow-y-auto custom-scrollbar">
            <div 
              v-for="program in filteredPrograms" 
              :key="program.id"
              @click="toggleProgram(program.id)"
              class="flex items-center gap-3 px-4 py-3 cursor-pointer transition-all border-b border-slate-100 dark:border-white/5 last:border-0"
              :class="formData.applicable_programs.includes(program.id) 
                ? 'bg-primary/5 dark:bg-primary/10' 
                : 'hover:bg-slate-50 dark:hover:bg-white/10'"
            >
              <div 
                class="w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all shrink-0"
                :class="formData.applicable_programs.includes(program.id) 
                  ? 'bg-primary border-primary shadow-glow-primary/50 scale-110' 
                  : 'border-slate-300 dark:border-white/20'"
              >
                <span v-if="formData.applicable_programs.includes(program.id)" class="material-icons text-black text-[14px] font-bold">check</span>
              </div>
              <div class="flex-1 min-w-0">
                <span 
                  class="text-sm font-medium transition-colors truncate block"
                  :class="formData.applicable_programs.includes(program.id) ? 'text-primary dark:text-primary' : 'text-slate-700 dark:text-gray-200'"
                >
                  {{ currentLocale === 'pt-BR' ? program.title_pt : program.title_en }}
                </span>
              </div>
              
              <span v-if="formData.applicable_programs.includes(program.id)" class="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded">
                Selected
              </span>
            </div>
            
            <div v-if="filteredPrograms.length === 0" class="p-12 text-center text-slate-400 space-y-3">
              <div class="w-16 h-16 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center mx-auto">
                <span class="material-icons text-3xl">search_off</span>
              </div>
              <p class="text-xs font-bold uppercase tracking-widest">No programs found</p>
            </div>
          </div>
        </div>

        <!-- Selected Summary & Action -->
        <div class="flex items-center justify-between px-2">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {{ formData.applicable_programs.length }} {{ formData.applicable_programs.length === 1 ? 'program selected' : 'programs selected' }}
            </p>
          </div>
          <button 
            v-if="formData.applicable_programs.length > 0"
            type="button"
            @click="formData.applicable_programs = []"
            class="group flex items-center gap-1.5 text-[10px] font-black text-red-500 uppercase tracking-widest hover:text-red-600 transition-colors"
          >
            <span class="material-icons text-xs group-hover:rotate-90 transition-transform">close</span>
            Clear all
          </button>
        </div>
      </div>

      <!-- Category -->
      <div v-if="formData.scope_type === 'category'">
        <label class="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
          Category
        </label>
        <select
          v-model="formData.applicable_category"
          class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark text-slate-900 dark:text-white focus:ring-2 focus:ring-primary dark:focus:ring-secondary outline-none"
        >
          <option value="curso">Content</option>
          <option value="mentoria">Mentorships</option>
          <option value="workshop">Workshops</option>
          <option value="evento_premium">Premium Events</option>
          <option value="servico_especializado">Services</option>
        </select>
      </div>

      <!-- Max Uses -->
      <div>
        <label class="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
          Total Usage Limit
        </label>
        <input
          v-model.number="formData.max_uses"
          type="number"
          min="1"
          placeholder="Leave empty for unlimited"
          class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark text-slate-900 dark:text-white focus:ring-2 focus:ring-primary dark:focus:ring-secondary outline-none"
        />
      </div>

      <!-- Validity Dates -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
            Valid from
          </label>
          <input
            v-model="formData.valid_from"
            type="datetime-local"
            class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark text-slate-900 dark:text-white focus:ring-2 focus:ring-primary dark:focus:ring-secondary outline-none"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
            Valid until
          </label>
          <input
            v-model="formData.valid_until"
            type="datetime-local"
            class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark text-slate-900 dark:text-white focus:ring-2 focus:ring-primary dark:focus:ring-secondary outline-none"
          />
          <p class="text-xs text-slate-500 mt-1">Leave empty for no expiration</p>
        </div>
      </div>

      <!-- Active Status -->
      <div class="flex items-center gap-3">
        <label class="relative inline-flex items-center cursor-pointer">
          <input
            v-model="formData.is_active"
            type="checkbox"
            class="sr-only peer"
          />
          <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer dark:bg-white/10 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary dark:peer-checked:bg-secondary"></div>
        </label>
        <span class="text-sm text-slate-700 dark:text-gray-300 font-medium">
          Coupon Active
        </span>
      </div>

      <!-- Buttons -->
      <div class="flex gap-3 pt-4">
        <button
          type="button"
          @click="handleCancel"
          class="flex-1 px-4 py-2.5 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 rounded-xl text-slate-700 dark:text-white font-bold transition-all"
        >
          Cancel
        </button>
        <button
          type="submit"
          :disabled="submitting"
          class="flex-1 px-4 py-2.5 bg-gradient-to-r from-primary to-secondary text-black font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
        >
          {{ submitting ? 'Saving...' : coupon ? 'Update Coupon' : 'Create Coupon' }}
        </button>
      </div>
    </form>
  </Modal>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useLocale } from '@/composables/useLocale'
import Modal from '@/components/ui/Modal.vue'
import { supabase } from '@/lib/supabase'
import { toast } from 'vue-sonner'
import { useAuthStore } from '@/stores/auth'
import type { Coupon } from '@/composables/useCoupons'

interface Props {
  coupon?: Coupon | null
}

interface Emits {
  (e: 'close'): void
  (e: 'saved'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { locale: currentLocale } = useLocale()
const authStore = useAuthStore()

const isOpen = ref(true)
const submitting = ref(false)
const programs = ref<any[]>([])
const searchProgram = ref('')

const filteredPrograms = computed(() => {
  if (!searchProgram.value.trim()) return programs.value
  const search = searchProgram.value.toLowerCase()
  return programs.value.filter(p => 
    (p.title_pt?.toLowerCase().includes(search)) || 
    (p.title_en?.toLowerCase().includes(search))
  )
})

function toggleProgram(id: string) {
  const index = formData.value.applicable_programs.indexOf(id)
  if (index === -1) {
    formData.value.applicable_programs.push(id)
  } else {
    formData.value.applicable_programs.splice(index, 1)
  }
}

const formData = ref({
  code: '',
  description: '',
  discount_type: 'percentage' as 'percentage' | 'fixed',
  discount_value: 0,
  scope_type: 'all' as 'all' | 'specific_programs' | 'category',
  applicable_programs: [] as string[],
  applicable_category: '',
  max_uses: null as number | null,
  valid_from: '',
  valid_until: '',
  is_active: true
})

// Load programs for selection
onMounted(async () => {
  const { data } = await supabase
    .from('programs')
    .select('id, title_pt, title_en')
    .eq('status', 'published')
    .order('title_pt')

  programs.value = data || []

  // If editing, populate form
  if (props.coupon) {
    formData.value = {
      code: props.coupon.code,
      description: props.coupon.description || '',
      discount_type: props.coupon.discount_type,
      discount_value: props.coupon.discount_value,
      scope_type: props.coupon.scope_type,
      applicable_programs: props.coupon.applicable_programs || [],
      applicable_category: props.coupon.applicable_category || '',
      max_uses: props.coupon.max_uses || null,
      valid_from: props.coupon.valid_from ? new Date(props.coupon.valid_from).toISOString().slice(0, 16) : '',
      valid_until: props.coupon.valid_until ? new Date(props.coupon.valid_until).toISOString().slice(0, 16) : '',
      is_active: props.coupon.is_active
    }
  }
})

watch(isOpen, (newVal) => {
  if (!newVal) {
    emit('close')
  }
})

async function handleSubmit() {
  // Validation
  if (!formData.value.code.trim()) {
    toast.error('Coupon code is required')
    return
  }

  if (formData.value.discount_value <= 0) {
    toast.error('Discount value must be greater than zero')
    return
  }

  if (formData.value.discount_type === 'percentage' && formData.value.discount_value > 100) {
    toast.error('Percentage discount cannot be greater than 100%')
    return
  }

  if (formData.value.scope_type === 'specific_programs' && formData.value.applicable_programs.length === 0) {
    toast.error('Select at least one program')
    return
  }

  if (formData.value.scope_type === 'category' && !formData.value.applicable_category) {
    toast.error('Select a category')
    return
  }

  submitting.value = true

  try {
    const payload: any = {
      code: formData.value.code.toUpperCase().trim(),
      description: formData.value.description?.trim() || null,
      discount_type: formData.value.discount_type,
      discount_value: formData.value.discount_value,
      scope_type: formData.value.scope_type,
      applicable_programs: formData.value.scope_type === 'specific_programs' ? formData.value.applicable_programs : null,
      applicable_category: formData.value.scope_type === 'category' ? formData.value.applicable_category : null,
      max_uses: formData.value.max_uses || null,
      valid_from: formData.value.valid_from || null,
      valid_until: formData.value.valid_until || null,
      is_active: formData.value.is_active
    }

    if (props.coupon) {
      // Update
      const { error } = await supabase
        .from('coupons')
        .update(payload)
        .eq('id', props.coupon.id)

      if (error) throw error
      toast.success('Coupon updated successfully!')
    } else {
      // Create
      payload.created_by = authStore.user?.id

      const { error } = await supabase
        .from('coupons')
        .insert(payload)

      if (error) throw error
      toast.success('Coupon created successfully!')
    }

    emit('saved')
    isOpen.value = false
  } catch (error: any) {
    console.error('Error saving coupon:', error)
    
    if (error.code === '23505') {
      toast.error('This coupon code already exists')
    } else {
      toast.error('Error saving coupon')
    }
  } finally {
    submitting.value = false
  }
}

function handleCancel() {
  isOpen.value = false
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 10px;
}

.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.2);
}

.dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}
</style>
