<template>
  <AdminLayout>
    <div class="w-full flex flex-col gap-8">
      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-white text-4xl lg:text-5xl font-black mb-3">
          Admin de <span class="bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-primary animate-gradient">Eventos</span>
        </h1>
        <p class="text-white/60 text-lg">
          Gerencie e aprove eventos da comunidade
        </p>
      </div>

      <!-- Stats -->
      <EventStats :stats="stats" />

      <!-- Actions -->
      <div class="flex justify-end mb-4">
        <button
          @click="showCreateModal = true"
          class="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-secondary text-black font-bold rounded-lg hover:shadow-lg hover:shadow-primary/30 transition-all"
        >
          <span class="material-symbols-outlined">add</span>
          <span class="hidden sm:inline">Novo Evento</span>
        </button>
      </div>

      <!-- Filters -->
      <div class="flex gap-3 overflow-x-auto no-scrollbar pb-1">
        <button
          v-for="filter in filters"
          :key="filter.id"
          class="flex h-9 shrink-0 items-center justify-center rounded-full px-6 text-sm font-medium transition-all"
          :class="activeFilter === filter.id
            ? 'bg-neon-gradient text-black font-black shadow-neon-pink'
            : 'bg-surface-card hover:bg-surface-highlight text-white/80 hover:text-secondary border border-white/10 hover:border-secondary'"
          @click="handleFilterChange(filter.id)"
        >
          {{ filter.label }}
        </button>
      </div>

      <!-- Events List -->
      <AdminEventList
        :events="displayedEvents"
        :loading="loading"
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
      <Modal
        v-model="showDeleteModal"
        title="Confirmar Exclusão"
        size="md"
      >
        <div class="space-y-4">
          <div class="flex items-start gap-4">
            <div class="flex-shrink-0 w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
              <span class="material-symbols-outlined text-red-400 text-2xl">warning</span>
            </div>
            <div class="flex-1">
              <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Tem certeza que deseja apagar este evento?
              </h3>
              <p class="text-slate-600 dark:text-gray-300 text-sm leading-relaxed">
                Esta ação não pode ser desfeita. O evento será permanentemente removido do sistema.
              </p>
              <div v-if="eventToDelete" class="mt-4 p-3 bg-slate-100 dark:bg-surface-lighter rounded-lg border border-slate-200 dark:border-white/10">
                <p class="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-1">Evento a ser deletado:</p>
                <p class="text-sm font-medium text-slate-900 dark:text-white">{{ eventToDelete.titulo }}</p>
              </div>
            </div>
          </div>
        </div>

        <template #footer>
          <div class="flex gap-3">
            <button
              @click="showDeleteModal = false"
              class="px-6 py-2.5 bg-white dark:bg-surface-lighter hover:bg-slate-50 dark:hover:bg-surface-highlight border border-slate-200 dark:border-white/10 rounded-lg text-slate-700 dark:text-white font-medium transition-all"
            >
              Cancelar
            </button>
            <button
              @click="confirmDelete"
              class="px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg font-bold transition-all shadow-lg hover:shadow-red-500/30"
            >
              Apagar Evento
            </button>
          </div>
        </template>
      </Modal>

      <!-- Create Event Modal -->
      <Modal
        v-model="showCreateModal"
        :title="`Criar Novo Evento - Etapa ${currentStep} de 2`"
        size="lg"
      >
        <!-- Progress Indicator -->
        <div class="mb-6">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs text-white/60">Etapa {{ currentStep }} de 2</span>
            <span class="text-xs text-white/60">{{ currentStep === 1 ? 'Informações Básicas' : 'Data e Localização' }}</span>
          </div>
          <div class="w-full bg-white/10 rounded-full h-2">
            <div 
              class="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all duration-300"
              :style="{ width: `${(currentStep / 2) * 100}%` }"
            ></div>
          </div>
        </div>

        <form @submit.prevent="handleStepSubmit" class="space-y-4">
          <!-- Step 1: Basic Information -->
          <div v-show="currentStep === 1" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-white mb-2">Título *</label>
              <input
                v-model="newEventData.titulo"
                type="text"
                required
                class="w-full rounded-lg border border-white/10 bg-surface-dark p-3 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                placeholder="Nome do evento..."
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-white mb-2">Descrição</label>
              <textarea
                v-model="newEventData.descricao"
                rows="4"
                class="w-full rounded-lg border border-white/10 bg-surface-dark p-3 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                placeholder="Descrição do evento..."
              ></textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-white mb-2">Tipo *</label>
              <select
                v-model="newEventData.tipo"
                required
                class="w-full rounded-lg border border-white/10 bg-surface-dark p-3 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              >
                <option value="">Selecione...</option>
                <option value="presencial">Presencial</option>
                <option value="webinar">Webinar</option>
              </select>
            </div>
          </div>

          <!-- Step 2: Date, Time and Location -->
          <div v-show="currentStep === 2" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-white mb-2">Data *</label>
              <div class="grid grid-cols-3 gap-3">
                <div>
                  <label class="block text-xs text-white/60 mb-1">Dia</label>
                  <div class="relative">
                    <select
                      v-model="dateTime.day"
                      required
                      class="custom-select w-full rounded-lg border border-white/10 bg-surface-dark p-3 pr-10 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none appearance-none cursor-pointer transition-all hover:border-white/20"
                    >
                      <option value="">Dia</option>
                      <option v-for="d in 31" :key="d" :value="d.toString().padStart(2, '0')">
                        {{ d.toString().padStart(2, '0') }}
                      </option>
                    </select>
                    <span class="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-white/60 pointer-events-none text-lg">
                      expand_more
                    </span>
                  </div>
                </div>
                <div>
                  <label class="block text-xs text-white/60 mb-1">Mês</label>
                  <div class="relative">
                    <select
                      v-model="dateTime.month"
                      required
                      class="custom-select w-full rounded-lg border border-white/10 bg-surface-dark p-3 pr-10 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none appearance-none cursor-pointer transition-all hover:border-white/20"
                    >
                      <option value="">Mês</option>
                      <option v-for="m in 12" :key="m" :value="m.toString().padStart(2, '0')">
                        {{ getMonthName(m) }}
                      </option>
                    </select>
                    <span class="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-white/60 pointer-events-none text-lg">
                      expand_more
                    </span>
                  </div>
                </div>
                <div>
                  <label class="block text-xs text-white/60 mb-1">Ano</label>
                  <div class="relative">
                    <select
                      v-model="dateTime.year"
                      required
                      class="custom-select w-full rounded-lg border border-white/10 bg-surface-dark p-3 pr-10 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none appearance-none cursor-pointer transition-all hover:border-white/20"
                    >
                      <option value="">Ano</option>
                      <option v-for="y in getYearOptions()" :key="y" :value="y">
                        {{ y }}
                      </option>
                    </select>
                    <span class="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-white/60 pointer-events-none text-lg">
                      expand_more
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-white mb-2">Hora *</label>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs text-white/60 mb-1">Hora</label>
                  <div class="relative">
                    <select
                      v-model="dateTime.hour"
                      required
                      class="custom-select w-full rounded-lg border border-white/10 bg-surface-dark p-3 pr-10 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none appearance-none cursor-pointer transition-all hover:border-white/20"
                    >
                      <option value="">Hora</option>
                      <option v-for="h in 24" :key="h - 1" :value="(h - 1).toString().padStart(2, '0')">
                        {{ (h - 1).toString().padStart(2, '0') }}
                      </option>
                    </select>
                    <span class="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-white/60 pointer-events-none text-lg">
                      expand_more
                    </span>
                  </div>
                </div>
                <div>
                  <label class="block text-xs text-white/60 mb-1">Minuto</label>
                  <div class="relative">
                    <select
                      v-model="dateTime.minute"
                      required
                      class="custom-select w-full rounded-lg border border-white/10 bg-surface-dark p-3 pr-10 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none appearance-none cursor-pointer transition-all hover:border-white/20"
                    >
                      <option value="">Minuto</option>
                      <option v-for="m in 60" :key="m - 1" :value="(m - 1).toString().padStart(2, '0')">
                        {{ (m - 1).toString().padStart(2, '0') }}
                      </option>
                    </select>
                    <span class="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-white/60 pointer-events-none text-lg">
                      expand_more
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-white mb-2">Local / Link</label>
              <input
                v-model="newEventData.local"
                type="text"
                class="w-full rounded-lg border border-white/10 bg-surface-dark p-3 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                :placeholder="newEventData.tipo === 'webinar' ? 'Link do webinar...' : 'Endereço do evento...'"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-white mb-2">Imagem (Opcional)</label>
              
              <!-- Preview da imagem -->
              <div v-if="imagePreview" class="mb-3 relative">
                <img
                  :src="imagePreview"
                  alt="Preview"
                  class="w-full h-48 object-cover rounded-lg border border-white/10"
                />
                <button
                  type="button"
                  @click="removeImage"
                  class="absolute top-2 right-2 p-2 bg-red-500/80 hover:bg-red-500 rounded-full text-white transition-all"
                >
                  <span class="material-symbols-outlined text-sm">close</span>
                </button>
              </div>

              <!-- Input de arquivo -->
              <label
                v-if="!imagePreview"
                class="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/20 rounded-lg cursor-pointer bg-surface-dark hover:bg-surface-highlight hover:border-primary transition-all"
              >
                <div class="flex flex-col items-center justify-center pt-5 pb-6">
                  <span class="material-symbols-outlined text-4xl text-white/60 mb-2">cloud_upload</span>
                  <p class="mb-2 text-sm text-white/60">
                    <span class="font-semibold">Clique para fazer upload</span> ou arraste e solte
                  </p>
                  <p class="text-xs text-white/40">PNG, JPG ou WEBP (máx. 20MB)</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  class="hidden"
                  @change="handleImageSelect"
                />
              </label>
            </div>

            <div>
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  v-model="newEventData.status"
                  type="checkbox"
                  :true-value="'approved'"
                  :false-value="'pending'"
                  class="w-4 h-4 rounded border-white/10 bg-surface-dark text-primary focus:ring-primary"
                />
                <span class="text-sm text-white">Criar já aprovado</span>
              </label>
            </div>
          </div>

          <!-- Navigation Buttons -->
          <div class="flex gap-3 pt-4">
            <button
              v-if="currentStep === 1"
              type="button"
              @click="nextStep"
              class="flex-1 px-4 py-2 bg-gradient-to-r from-primary to-secondary text-black font-bold rounded-lg hover:shadow-lg transition-all"
            >
              Próximo
            </button>
            <button
              v-if="currentStep === 2"
              type="button"
              @click="prevStep"
              class="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white font-medium transition-all"
            >
              Voltar
            </button>
            <button
              v-if="currentStep === 2"
              type="submit"
              :disabled="submitting"
              class="flex-1 px-4 py-2 bg-gradient-to-r from-primary to-secondary text-black font-bold rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
            >
              {{ submitting ? 'Criando...' : 'Criar Evento' }}
            </button>
            <button
              v-if="currentStep === 1"
              type="button"
              @click="showCreateModal = false"
              class="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white font-medium transition-all"
            >
              Cancelar
            </button>
          </div>
        </form>
      </Modal>
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
import Modal from '@/components/ui/Modal.vue'
import type { AdminEvent } from '@/types/admin'
import type { EventStatus } from '@/types/events'
import { toast } from 'vue-sonner'

const router = useRouter()
const authStore = useAuthStore()
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
} = useAdmin()

const activeFilter = ref<EventStatus | 'all'>('all')
const showApprovalModal = ref(false)
const showCreateModal = ref(false)
const showDeleteModal = ref(false)
const submitting = ref(false)
const currentStep = ref(1)
const selectedEvent = ref<AdminEvent | null>(null)
const eventToDelete = ref<AdminEvent | null>(null)

const newEventData = ref({
  titulo: '',
  descricao: '',
  data_hora: '',
  tipo: '',
  local: '',
  image_url: '',
  status: 'approved' as EventStatus,
})

const selectedImageFile = ref<File | null>(null)
const imagePreview = ref<string | null>(null)
const uploadingImage = ref(false)

const dateTime = ref({
  day: '',
  month: '',
  year: '',
  hour: '',
  minute: '',
})

function getMonthName(month: number): string {
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]
  return months[month - 1]
}

function getYearOptions(): number[] {
  const currentYear = new Date().getFullYear()
  const years = []
  for (let i = currentYear; i <= currentYear + 5; i++) {
    years.push(i)
  }
  return years
}

function buildDateTimeString(): string {
  if (!dateTime.value.day || !dateTime.value.month || !dateTime.value.year || 
      !dateTime.value.hour || !dateTime.value.minute) {
    return ''
  }
  
  // Formato: YYYY-MM-DDTHH:mm (ISO 8601)
  const dateStr = `${dateTime.value.year}-${dateTime.value.month}-${dateTime.value.day}`
  const timeStr = `${dateTime.value.hour}:${dateTime.value.minute}`
  return `${dateStr}T${timeStr}:00`
}

function nextStep() {
  // Validar campos da etapa 1
  if (!newEventData.value.titulo || !newEventData.value.tipo) {
    toast.error('Por favor, preencha todos os campos obrigatórios')
    return
  }
  currentStep.value = 2
}

function prevStep() {
  currentStep.value = 1
}

function handleStepSubmit() {
  if (currentStep.value === 1) {
    nextStep()
  } else {
    handleCreateEvent()
  }
}

const filters = [
  { id: 'all' as const, label: 'Todos' },
  { id: 'pending' as const, label: 'Pendentes' },
  { id: 'approved' as const, label: 'Aprovados' },
  { id: 'rejected' as const, label: 'Rejeitados' },
]

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
    toast.success(newDestaqueValue ? 'Evento definido como destaque!' : 'Evento removido do destaque')
    await loadAllEvents(activeFilter.value === 'all' ? undefined : activeFilter.value)
    await loadEventStats()
  } catch (error: any) {
    console.error('Error toggling event destaque:', error)
    toast.error(error.message || 'Erro ao atualizar destaque do evento')
  }
}

function handleDelete(eventId: string) {
  const event = allEvents.value.find(e => e.id === eventId)
  if (event) {
    eventToDelete.value = event
    showDeleteModal.value = true
  }
}

async function confirmDelete() {
  if (!eventToDelete.value) return

  try {
    await deleteEvent(eventToDelete.value.id)
    toast.success('Evento apagado com sucesso!')
    showDeleteModal.value = false
    eventToDelete.value = null
    await loadAllEvents(activeFilter.value === 'all' ? undefined : activeFilter.value)
    await loadEventStats()
  } catch (error: any) {
    console.error('Error deleting event:', error)
    toast.error(error.message || 'Erro ao apagar evento')
  }
}

function handleImageSelect(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return

  if (!file.type.startsWith('image/')) {
    toast.error('Por favor, selecione apenas arquivos de imagem')
    return
  }

  if (file.size > 20 * 1024 * 1024) {
    toast.error('A imagem deve ter no máximo 20MB')
    return
  }

  selectedImageFile.value = file
  
  const reader = new FileReader()
  reader.onload = (e) => {
    imagePreview.value = e.target?.result as string
  }
  reader.readAsDataURL(file)
}

function removeImage() {
  selectedImageFile.value = null
  imagePreview.value = null
  newEventData.value.image_url = ''
}

async function uploadImage(): Promise<string | null> {
  if (!selectedImageFile.value || !authStore.user) return null

  uploadingImage.value = true
  try {
    const fileExt = selectedImageFile.value.name.split('.').pop()
    const fileName = `admin-event-${authStore.user.id}-${Date.now()}.${fileExt}`
    const filePath = `events/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('event-images')
      .upload(filePath, selectedImageFile.value, {
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
    toast.error('Erro ao fazer upload da imagem. Tente novamente.')
    return null
  } finally {
    uploadingImage.value = false
  }
}

async function handleCreateEvent() {
  try {
    submitting.value = true
    
    // Construir data_hora a partir dos campos separados
    const dataHora = buildDateTimeString()
    if (!dataHora) {
      toast.error('Por favor, preencha todos os campos de data e hora')
      return
    }

    // Upload da imagem se houver
    let imageUrl: string | null = null
    if (selectedImageFile.value) {
      imageUrl = await uploadImage()
      if (!imageUrl) {
        submitting.value = false
        return
      }
    } else if (newEventData.value.image_url) {
      imageUrl = newEventData.value.image_url
    }

    const eventData = {
      ...newEventData.value,
      data_hora: dataHora,
      image_url: imageUrl || undefined,
    }

    await createEvent(eventData)
    toast.success('Evento criado com sucesso!')
    showCreateModal.value = false
    
    // Reset form
    newEventData.value = {
      titulo: '',
      descricao: '',
      data_hora: '',
      tipo: '',
      local: '',
      image_url: '',
      status: 'approved',
    }
    dateTime.value = {
      day: '',
      month: '',
      year: '',
      hour: '',
      minute: '',
    }
    currentStep.value = 1
    selectedImageFile.value = null
    imagePreview.value = null
    
    await loadAllEvents(activeFilter.value === 'all' ? undefined : activeFilter.value)
    await loadEventStats()
  } catch (error: any) {
    toast.error(error.message || 'Erro ao criar evento')
    console.error('Error creating event:', error)
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  // Verificar se é admin
  if (!isAdmin.value) {
    router.push('/')
    return
  }

  await loadAllEvents()
  await loadEventStats()
})
</script>

<style scoped>
.bg-neon-gradient {
  background: linear-gradient(135deg, #f425f4 0%, #00f0ff 100%);
}

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

.shadow-neon-pink {
  box-shadow: 0 0 15px rgba(244, 37, 244, 0.3);
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}

.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* Custom Select Styles */
.custom-select {
  background-image: none;
  -webkit-appearance: none;
  -moz-appearance: none;
}

.custom-select option {
  background-color: #1a1a1a;
  color: white;
  padding: 12px;
}

.custom-select:focus {
  box-shadow: 0 0 0 1px rgba(244, 37, 244, 0.5);
}

/* Limit select height on mobile - show max 10 options initially */
@media (max-width: 640px) {
  .custom-select {
    max-height: calc(3rem * 10); /* ~10 options visible */
    overflow-y: auto;
  }
  
  .custom-select option {
    padding: 10px 12px;
    font-size: 14px;
  }
}

/* Better scrollbar for selects on mobile */
.custom-select::-webkit-scrollbar {
  width: 6px;
}

.custom-select::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 3px;
}

.custom-select::-webkit-scrollbar-thumb {
  background: rgba(244, 37, 244, 0.5);
  border-radius: 3px;
}

.custom-select::-webkit-scrollbar-thumb:hover {
  background: rgba(244, 37, 244, 0.7);
}

/* Smooth transitions */
.custom-select {
  transition: all 0.2s ease;
}

.custom-select:hover {
  background-color: rgba(255, 255, 255, 0.03);
}

.custom-select:active {
  transform: scale(0.98);
}
</style>



