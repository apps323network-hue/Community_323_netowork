<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @click.self="close"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="close"></div>

        <!-- Modal -->
        <div class="relative w-full max-w-2xl bg-white dark:bg-surface-card rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden">
          <!-- Header -->
          <div class="flex items-center justify-between p-6 border-b border-slate-200 dark:border-white/10">
            <div>
              <h2 class="text-xl font-bold text-slate-900 dark:text-white">
                Confirmed Attendees
              </h2>
              <p class="text-sm text-slate-500 dark:text-white/60 mt-1">
                {{ eventTitle }}
              </p>
            </div>
            <button
              @click="close"
              class="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors"
            >
              <span class="material-symbols-outlined text-slate-500 dark:text-white/60">close</span>
            </button>
          </div>

          <!-- Search -->
          <div class="p-4 border-b border-slate-200 dark:border-white/10">
            <div class="relative">
              <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/40 text-xl">search</span>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search by name or email..."
                class="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>
          </div>

          <!-- Content -->
          <div class="max-h-[60vh] overflow-y-auto">
            <!-- Loading -->
            <div v-if="loading" class="flex items-center justify-center py-12">
              <div class="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
            </div>

            <!-- Empty State -->
            <div v-else-if="filteredAttendees.length === 0" class="flex flex-col items-center justify-center py-12 text-center">
              <span class="material-symbols-outlined text-5xl text-slate-300 dark:text-white/20 mb-3">group_off</span>
              <p class="text-slate-500 dark:text-white/60 font-medium">
                {{ searchQuery ? 'No results found' : 'No confirmed attendees' }}
              </p>
            </div>

            <!-- Attendees List -->
            <div v-else class="divide-y divide-slate-100 dark:divide-white/5">
              <div
                v-for="attendee in filteredAttendees"
                :key="attendee.user_id"
                class="flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
              >
                <!-- Avatar -->
                <div class="relative flex-shrink-0">
                  <img
                    v-if="attendee.avatar_url"
                    :src="attendee.avatar_url"
                    :alt="attendee.nome"
                    class="w-12 h-12 rounded-full object-cover border-2 border-slate-200 dark:border-white/10"
                  />
                  <div
                    v-else
                    class="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-lg"
                  >
                    {{ attendee.nome?.charAt(0)?.toUpperCase() || '?' }}
                  </div>
                  <!-- Plan badge -->
                  <span
                    v-if="attendee.plano === 'Premium'"
                    class="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center"
                  >
                    <span class="material-symbols-outlined text-white text-xs">verified</span>
                  </span>
                </div>

                <!-- Info -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <p class="font-semibold text-slate-900 dark:text-white truncate">{{ attendee.nome }}</p>
                    <span
                      :class="[
                        'px-2 py-0.5 text-xs font-medium rounded-full',
                        attendee.plano === 'Premium' ? 'bg-gradient-to-r from-primary/20 to-secondary/20 text-primary dark:text-secondary' :
                        attendee.plano === 'Member' ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400' :
                        'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-white/60'
                      ]"
                    >
                      {{ attendee.plano || 'Free' }}
                    </span>
                  </div>
                  <p v-if="attendee.email" class="text-sm text-slate-500 dark:text-white/50 truncate">
                    {{ attendee.email }}
                  </p>
                </div>

                <!-- Confirmed date -->
                <div class="text-right flex-shrink-0">
                  <p class="text-xs text-slate-400 dark:text-white/40">
                    Confirmed at
                  </p>
                  <p class="text-sm text-slate-600 dark:text-white/70 font-medium">
                    {{ formatDate(attendee.confirmed_at) }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="p-4 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5">
            <div class="flex items-center justify-between">
              <p class="text-sm text-slate-500 dark:text-white/60">
                <span class="font-bold text-slate-900 dark:text-white">{{ attendees.length }}</span>
                {{ attendees.length === 1 ? 'confirmed attendee' : 'confirmed attendees' }}
              </p>
              <button
                @click="close"
                class="px-4 py-2 bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-white font-semibold rounded-lg hover:bg-slate-300 dark:hover:bg-white/20 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useAdminEventsStore } from '@/stores/admin/events'
import type { EventAttendee } from '@/types/admin'

interface Props {
  modelValue: boolean
  eventId: string
  eventTitle: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const eventsStore = useAdminEventsStore()

const loading = ref(false)
const attendees = ref<EventAttendee[]>([])
const searchQuery = ref('')

const filteredAttendees = computed(() => {
  if (!searchQuery.value.trim()) {
    return attendees.value
  }
  const query = searchQuery.value.toLowerCase()
  return attendees.value.filter(a =>
    a.nome?.toLowerCase().includes(query) ||
    a.email?.toLowerCase().includes(query)
  )
})

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function close() {
  emit('update:modelValue', false)
}

async function loadAttendees() {
  if (!props.eventId) return
  
  loading.value = true
  try {
    attendees.value = await eventsStore.fetchEventAttendees(props.eventId)
  } catch (err) {
    console.error('Error loading attendees:', err)
    attendees.value = []
  } finally {
    loading.value = false
  }
}

// Watch for modal opening
watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    searchQuery.value = ''
    loadAttendees()
  }
})
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from > div:last-child,
.modal-leave-to > div:last-child {
  transform: scale(0.95) translateY(10px);
}
</style>
