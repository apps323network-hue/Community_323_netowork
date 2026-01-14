<template>
  <AdminLayout>
    <div class="w-full flex flex-col gap-8">
      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-slate-900 dark:text-white text-4xl lg:text-5xl font-black mb-3">
          Events Admin
        </h1>
        <p class="text-slate-600 dark:text-white/60 text-lg">
          Manage and approve community events
        </p>
      </div>

      <!-- Stats -->
      <EventStats :stats="stats" :loading="initialLoading" />

      <!-- Actions -->
      <div class="flex justify-end mb-4">
        <button
          @click="showCreateModal = true"
          class="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-secondary text-black font-bold rounded-lg hover:shadow-lg hover:shadow-primary/30 transition-all"
        >
          <span class="material-symbols-outlined">add</span>
          <span class="hidden sm:inline">New Event</span>
        </button>
      </div>

      <!-- Filters -->
      <EventFilters
        :active-filter="activeFilter"
        @filter-change="handleFilterChange"
      />

      <!-- Events List -->
      <AdminEventList
        :events="displayedEvents"
        :loading="initialLoading || loading"
        @approve="handleApprove"
        @reject="handleReject"
        @view-details="handleViewDetails"
        @toggle-destaque="handleToggleDestaque"
        @delete="handleDelete"
      />

      <!-- Approval Modal -->
      <EventApprovalModal
        v-model="showApprovalModal"
        :event="selectedEvent"
        @approve="handleModalApprove"
        @reject="handleModalReject"
      />

      <!-- Delete Confirmation Modal -->
      <DeleteEventModal
        v-model="showDeleteModal"
        :event="eventToDelete"
        @confirm="confirmDelete"
        @cancel="handleDeleteCancel"
      />

      <!-- Create Event Modal -->
      <CreateEventModal
        v-model="showCreateModal"
        @submit="handleCreateEventSubmit"
        @cancel="handleCreateCancel"
        @validation-error="(message) => toast.error(message)"
      />
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAdmin } from '@/composables/useAdmin'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/lib/supabase'
import AdminLayout from '@/components/layout/admin/AdminLayout.vue'
import EventStats from '@/components/admin/EventStats.vue'
import AdminEventList from '@/components/admin/AdminEventList.vue'
import EventApprovalModal from '@/components/admin/EventApprovalModal.vue'
import EventFilters from '@/components/admin/EventFilters.vue'
import DeleteEventModal from '@/components/admin/DeleteEventModal.vue'
import CreateEventModal from '@/components/admin/CreateEventModal.vue'
import type { AdminEvent } from '@/types/admin'
import type { EventStatus } from '@/types/events'
import { toast } from 'vue-sonner'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const authStore = useAuthStore()
const { t } = useI18n()
const {
  allEvents,
  stats,
  loading,
  isAdmin,
  loadAllEvents,
  loadEventStats,
  handleApproval,
  createEvent,
  toggleEventDestaque,
  deleteEvent,
  checkIsAdmin,
} = useAdmin()

const activeFilter = ref<EventStatus | 'all'>('all')
const initialLoading = ref(true)
const showApprovalModal = ref(false)
const showCreateModal = ref(false)
const showDeleteModal = ref(false)
const submitting = ref(false)
const selectedEvent = ref<AdminEvent | null>(null)
const eventToDelete = ref<AdminEvent | null>(null)

const displayedEvents = computed(() => {
  if (activeFilter.value === 'all') {
    return allEvents.value
  }
  return allEvents.value.filter(e => e.status === activeFilter.value)
})

async function handleFilterChange(filterId: EventStatus | 'all') {
  activeFilter.value = filterId
  if (filterId === 'all') {
    await loadAllEvents()
  } else {
    await loadAllEvents(filterId)
  }
}

function handleApprove(eventId: string) {
  const event = allEvents.value.find(e => e.id === eventId)
  if (event) {
    selectedEvent.value = event
    showApprovalModal.value = true
  }
}

function handleReject(eventId: string) {
  const event = allEvents.value.find(e => e.id === eventId)
  if (event) {
    selectedEvent.value = event
    showApprovalModal.value = true
  }
}

async function handleModalApprove(eventId: string) {
  try {
    await handleApproval({
      eventId,
      action: 'approve',
    })
    await loadAllEvents(activeFilter.value === 'all' ? undefined : activeFilter.value)
    await loadEventStats()
    showApprovalModal.value = false
    selectedEvent.value = null
  } catch (error) {
    console.error('Error approving event:', error)
  }
}

async function handleModalReject(eventId: string, reason: string) {
  try {
    await handleApproval({
      eventId,
      action: 'reject',
      reason,
    })
    await loadAllEvents(activeFilter.value === 'all' ? undefined : activeFilter.value)
    await loadEventStats()
    showApprovalModal.value = false
    selectedEvent.value = null
  } catch (error) {
    console.error('Error rejecting event:', error)
  }
}

function handleViewDetails(eventId: string) {
  router.push(`/eventos/${eventId}`)
}

async function handleToggleDestaque(eventId: string) {
  try {
    const event = allEvents.value.find(e => e.id === eventId)
    if (!event) return
    
    const newDestaqueValue = !event.destaque
    await toggleEventDestaque(eventId, newDestaqueValue)
    toast.success(newDestaqueValue ? t('admin.events.messages.destaqueSuccess') : t('admin.events.messages.destaqueRemoved'))
    await loadAllEvents(activeFilter.value === 'all' ? undefined : activeFilter.value)
    await loadEventStats()
  } catch (error: any) {
    console.error('Error toggling event destaque:', error)
    toast.error(error.message || t('admin.events.messages.destaqueError'))
  }
}

function handleDelete(eventId: string) {
  const event = allEvents.value.find(e => e.id === eventId)
  if (event) {
    eventToDelete.value = event
    showDeleteModal.value = true
  }
}

function handleDeleteCancel() {
  eventToDelete.value = null
}

async function confirmDelete() {
  if (!eventToDelete.value) return

  try {
    await deleteEvent(eventToDelete.value.id)
    toast.success(t('admin.events.messages.deleteSuccess'))
    showDeleteModal.value = false
    eventToDelete.value = null
    await loadAllEvents(activeFilter.value === 'all' ? undefined : activeFilter.value)
    await loadEventStats()
  } catch (error: any) {
    console.error('Error deleting event:', error)
    toast.error(error.message || t('admin.events.messages.deleteError'))
  }
}

function handleCreateCancel() {
  showCreateModal.value = false
}

async function uploadImage(file: File): Promise<string | null> {
  if (!authStore.user) return null

  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `admin-event-${authStore.user.id}-${Date.now()}.${fileExt}`
    const filePath = `events/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('event-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) throw uploadError

    const { data: { publicUrl } } = supabase.storage
      .from('event-images')
      .getPublicUrl(filePath)

    return publicUrl
  } catch (err: any) {
    console.error('Error uploading image:', err)
    toast.error(t('posts.form.uploadError'))
    return null
  }
}

function buildDateTimeString(dateTime: { day: string; month: string; year: string; hour: string; minute: string }): string {
  if (!dateTime.day || !dateTime.month || !dateTime.year || 
      !dateTime.hour || !dateTime.minute) {
    return ''
  }
  
  // Formato: YYYY-MM-DDTHH:mm (ISO 8601)
  const dateStr = `${dateTime.year}-${dateTime.month}-${dateTime.day}`
  const timeStr = `${dateTime.hour}:${dateTime.minute}`
  return `${dateStr}T${timeStr}:00`
}

async function handleCreateEventSubmit(data: { formData: any; dateTime: any; imageFile: File | null }) {
  try {
    submitting.value = true
    
    // Construir data_hora a partir dos campos separados
    const dataHora = buildDateTimeString(data.dateTime)
    if (!dataHora) {
      toast.error(t('admin.events.errors.fillAllDateFields'))
      submitting.value = false
      return
    }

    // Validação de Janela do Programa
    const { data: program, error: progError } = await supabase
      .from('programs')
      .select('program_start_date, program_end_date, title_pt')
      .eq('id', data.formData.program_id)
      .single()

    if (progError || !program) {
      throw new Error(t('admin.events.errors.programNotFound'))
    }

    const eventDate = new Date(dataHora)
    const now = new Date()

    // 1. Não criar eventos para programa “expirado” (fim do programa já passou)
    if (program.program_end_date && new Date(program.program_end_date) < now) {
      throw new Error(t('admin.events.errors.programExpired', { 
        programTitle: program.title_pt, 
        endDate: new Date(program.program_end_date).toLocaleDateString() 
      }))
    }

    // 2. Evento deve estar dentro da janela do programa
    if (program.program_start_date && eventDate < new Date(program.program_start_date)) {
      throw new Error(t('admin.events.errors.eventBeforeStart', {
        startDate: new Date(program.program_start_date).toLocaleDateString()
      }))
    }
    if (program.program_end_date && eventDate > new Date(program.program_end_date)) {
      throw new Error(t('admin.events.errors.eventAfterEnd', {
        endDate: new Date(program.program_end_date).toLocaleDateString()
      }))
    }

    // Upload da imagem se houver
    let imageUrl: string | null = null
    if (data.imageFile) {
      imageUrl = await uploadImage(data.imageFile)
      if (!imageUrl) {
        submitting.value = false
        return
      }
    }

    const eventData = {
      ...data.formData,
      data_hora: dataHora,
      image_url: imageUrl || undefined,
    }

    await createEvent(eventData)
    toast.success(t('admin.events.messages.createSuccess'))
    showCreateModal.value = false
    
    await loadAllEvents(activeFilter.value === 'all' ? undefined : activeFilter.value)
    await loadEventStats()
  } catch (error: any) {
    toast.error(error.message || t('admin.events.messages.createError'))
    console.error('Error creating event:', error)
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  initialLoading.value = true
  try {
    // Wait for auth to be ready if needed, or check admin
    const isAdminUser = await checkIsAdmin()
    if (!isAdminUser) {
      router.push('/')
      return
    }

    await Promise.all([
      loadAllEvents(),
      loadEventStats()
    ])
  } finally {
    initialLoading.value = false
  }
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



