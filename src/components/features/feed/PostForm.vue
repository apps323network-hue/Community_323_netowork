<template>
  <!-- Estado Inicial (Colapsado) - Inspirado no LinkedIn -->
  <Card variant="white" class="p-4 dark:bg-surface-dark dark:border-gray-800 shadow-sm w-full">
    <div class="flex gap-3 items-center">
      <Avatar :src="userAvatar" :name="userName" size="md" class="flex-shrink-0" />
      
      <!-- Campo clicável para abrir -->
      <button
        @click="showPostModal = true"
        class="flex-1 px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-full text-left text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all"
      >
        {{ t('posts.startPost') }}
      </button>
    </div>

    <!-- Botões de ação -->
    <div class="flex gap-1 mt-3 px-2">
      <button
        @click="openPhotoUpload"
        class="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors group"
      >
        <span class="material-symbols-outlined text-blue-500 text-xl">image</span>
        <span class="text-sm font-medium text-gray-600 dark:text-gray-300">{{ t('posts.photo') }}</span>
      </button>
      <button
        @click="openVideoUpload"
        class="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors group"
      >
        <span class="material-symbols-outlined text-green-600 text-xl">videocam</span>
        <span class="text-sm font-medium text-gray-600 dark:text-gray-300">{{ t('posts.video') }}</span>
      </button>
      <button
        @click="openEventModal"
        class="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors group"
      >
        <span class="material-symbols-outlined text-orange-500 text-xl">event</span>
        <span class="text-sm font-medium text-gray-600 dark:text-gray-300">{{ t('posts.event') }}</span>
      </button>
    </div>
  </Card>

  <!-- Modal de Criação de Post - Estilo LinkedIn -->
  <Modal v-model="showPostModal" size="lg" :closable="false">
    <template #default>
      <div class="relative">
        <!-- Header -->
        <div class="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
          <div class="flex items-center gap-3">
            <Avatar :src="userAvatar" :name="userName" size="md" />
            <div>
              <p class="font-semibold text-gray-900 dark:text-white">{{ userName }}</p>
            </div>
          </div>
          <button
            @click="closePostModal"
            class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <span class="material-symbols-outlined text-gray-500">close</span>
          </button>
        </div>

        <!-- Editor de Texto -->
        <div class="py-4" style="min-height: 300px;">
          <RichTextEditor
            v-model="content"
            :placeholder="t('posts.aboutWhat')"
            ref="editorRef"
            :minimal="true"
            class="min-h-[280px]"
          />
        </div>

        <!-- Preview da Imagem -->
        <div v-if="selectedImage" class="mb-4 relative">
          <img :src="selectedImage" alt="Preview" class="w-full h-64 object-cover rounded-lg" />
          <button
            class="absolute top-2 right-2 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
            @click="removeImage"
          >
            <span class="material-icons-outlined text-lg">close</span>
          </button>
        </div>

        <!-- Barra de ferramentas inferior -->
        <div class="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <div class="flex gap-2">
            <label class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg cursor-pointer transition-colors group">
              <input
                type="file"
                accept="image/*"
                class="hidden"
                @change="handleImageSelect"
              />
              <span class="material-symbols-outlined text-gray-600 dark:text-gray-400 group-hover:text-blue-500">image</span>
            </label>
          </div>

          <button
            @click="handleSubmit"
            :disabled="!content.trim() || loading"
            class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600"
          >
            <span v-if="loading">{{ t('posts.publishing') }}</span>
            <span v-else>{{ t('posts.publish') }}</span>
          </button>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {{ error }}
        </div>
      </div>
    </template>
  </Modal>

  <!-- Modal de Evento (manter o existente) -->
  <Modal v-model="showEventModal" :title="t('events.createEvent')" size="lg">
    <div class="space-y-4">
      <div>
        <div class="flex justify-between items-center mb-2">
          <label class="block text-sm font-semibold text-gray-300">{{ t('programs.title') }} *</label>
          <router-link to="/programs" class="text-xs text-primary hover:underline flex items-center gap-1">
            {{ t('programs.viewPrograms') }} <span class="material-symbols-outlined text-xs">open_in_new</span>
          </router-link>
        </div>
        <Select
          v-model="eventForm.program_id"
          :options="programOptions"
          :placeholder="t('events.selectProgram')"
          class="w-full"
        />
        <p v-if="programs.length > 0 && !programs.some(p => p.isEnrolled) && !loading" class="text-xs text-yellow-500 mt-1">
          {{ t('events.mustEnrollToCreateEvent') }}
        </p>
      </div>

      <div>
        <label class="block text-sm font-semibold text-gray-300 mb-2">{{ t('events.eventTitle') }} *</label>
        <input
          v-model="eventForm.titulo"
          type="text"
          required
          class="w-full px-3 py-2 border border-slate-700 rounded-xl bg-slate-900/50 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
          :placeholder="t('events.eventTitlePlaceholder')"
        />
      </div>
      <div>
        <label class="block text-sm font-semibold text-gray-300 mb-2">{{ t('common.description') }}</label>
        <textarea
          v-model="eventForm.descricao"
          rows="3"
          class="w-full px-3 py-2 border border-slate-700 rounded-xl bg-slate-900/50 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
          :placeholder="t('events.eventDescriptionPlaceholder')"
        ></textarea>
      </div>
      <div>
        <label class="block text-sm font-semibold text-gray-300 mb-2">{{ t('events.eventBanner') }}</label>
        <div class="space-y-3">
          <label class="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-slate-700 rounded-xl bg-slate-900/30 hover:border-secondary transition-colors cursor-pointer group">
            <input
              type="file"
              accept="image/*"
              class="hidden"
              @change="handleEventImageSelect"
            />
            <div class="flex flex-col items-center gap-2">
              <span class="material-icons-outlined text-secondary group-hover:scale-110 transition-transform">image</span>
              <span class="text-sm text-gray-400 group-hover:text-secondary transition-colors">
                {{ eventImageFile ? t('events.changeImage') : t('events.addBanner') }}
              </span>
            </div>
          </label>
          <!-- Preview da imagem do evento -->
          <div v-if="eventImagePreview" class="relative rounded-xl overflow-hidden">
            <img :src="eventImagePreview" alt="Preview do banner" class="w-full h-48 object-cover" />
            <button
              class="absolute top-2 right-2 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
              @click="removeEventImage"
            >
              <span class="material-icons-outlined text-lg">close</span>
            </button>
          </div>
        </div>
      </div>
      <!-- Data -->
      <div>
        <div class="flex justify-between items-center mb-2">
          <label class="block text-sm font-semibold text-gray-300">Data *</label>
          <div v-if="selectedProgram" class="text-xs">
            <span v-if="isProgramExpired(selectedProgram)" class="text-red-400 font-medium flex items-center gap-1">
              <span class="material-symbols-outlined text-[14px]">warning</span>
              Expirado: {{ formatDate(selectedProgram.program_end_date) }}
            </span>
            <span v-else class="text-emerald-400 font-medium tracking-wide">
              Validade: {{ formatDate(selectedProgram.program_start_date) }} - {{ formatDate(selectedProgram.program_end_date) }}
            </span>
          </div>
        </div>
        <div class="grid grid-cols-3 gap-3">
          <div>
            <label class="block text-xs text-gray-400 mb-1">{{ t('events.day') }}</label>
            <div class="relative">
              <select
                v-model="dateTime.day"
                required
                class="w-full px-3 py-2 border border-slate-700 rounded-xl bg-slate-900/50 text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all appearance-none cursor-pointer pr-10"
              >
                <option value="">{{ t('events.day') }}</option>
                <option v-for="d in 31" :key="d" :value="d.toString().padStart(2, '0')">
                  {{ d.toString().padStart(2, '0') }}
                </option>
              </select>
              <span class="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                expand_more
              </span>
            </div>
          </div>
          <div>
            <label class="block text-xs text-gray-400 mb-1">{{ t('events.month') }}</label>
            <div class="relative">
              <select
                v-model="dateTime.month"
                required
                class="w-full px-3 py-2 border border-slate-700 rounded-xl bg-slate-900/50 text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all appearance-none cursor-pointer pr-10"
              >
                <option value="">{{ t('events.month') }}</option>
                <option v-for="m in 12" :key="m" :value="m.toString().padStart(2, '0')">
                  {{ getMonthName(m) }}
                </option>
              </select>
              <span class="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                expand_more
              </span>
            </div>
          </div>
          <div>
            <label class="block text-xs text-gray-400 mb-1">{{ t('events.year') }}</label>
            <div class="relative">
              <select
                v-model="dateTime.year"
                required
                class="w-full px-3 py-2 border border-slate-700 rounded-xl bg-slate-900/50 text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all appearance-none cursor-pointer pr-10"
              >
                <option value="">{{ t('events.year') }}</option>
                <option v-for="y in getYearOptions()" :key="y" :value="y">
                  {{ y }}
                </option>
              </select>
              <span class="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                expand_more
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Tipo de Evento -->
      <div>
        <label class="block text-sm font-semibold text-gray-300 mb-2">{{ t('events.eventType') }} *</label>
        <select
          v-model="eventForm.tipo"
          required
          class="w-full px-3 py-2 border border-slate-700 rounded-xl bg-slate-900/50 text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
        >
          <option value="presencial">{{ t('events.inPerson') }}</option>
          <option value="webinar">{{ t('events.online') }}</option>
        </select>
      </div>

      <!-- Hora -->
      <div>
        <label class="block text-sm font-semibold text-gray-300 mb-2">Hora *</label>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs text-gray-400 mb-1">{{ t('events.hour') }}</label>
            <div class="relative">
              <select
                v-model="dateTime.hour"
                required
                class="w-full px-3 py-2 border border-slate-700 rounded-xl bg-slate-900/50 text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all appearance-none cursor-pointer pr-10"
              >
                <option value="">{{ t('events.hour') }}</option>
                <option v-for="h in 24" :key="h - 1" :value="(h - 1).toString().padStart(2, '0')">
                  {{ (h - 1).toString().padStart(2, '0') }}
                </option>
              </select>
              <span class="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                expand_more
              </span>
            </div>
          </div>
          <div>
            <label class="block text-xs text-gray-400 mb-1">{{ t('events.minute') }}</label>
            <div class="relative">
              <select
                v-model="dateTime.minute"
                required
                class="w-full px-3 py-2 border border-slate-700 rounded-xl bg-slate-900/50 text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all appearance-none cursor-pointer pr-10"
              >
                <option value="">{{ t('events.minute') }}</option>
                <option value="00">00</option>
                <option value="30">30</option>
              </select>
              <span class="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                expand_more
              </span>
            </div>
          </div>
        </div>
      </div>
      <div v-if="eventForm.tipo === 'presencial'">
        <label class="block text-sm font-semibold text-gray-300 mb-2">{{ t('events.eventLocation') }}</label>
        <input
          v-model="eventForm.local"
          type="text"
          class="w-full px-3 py-2 border border-slate-700 rounded-xl bg-slate-900/50 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
          :placeholder="t('events.eventLocationPlaceholder')"
        />
      </div>
      
      <!-- Mensagem de erro -->
      <div v-if="error" class="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
        {{ error }}
      </div>
    </div>
    <template #footer>
      <div class="flex gap-3">
        <Button variant="outline" @click="closeEventModal">{{ t('common.cancel') }}</Button>
        <Button 
          variant="primary" 
          :disabled="!eventForm.titulo || !eventForm.program_id || !buildDateTimeString() || loading" 
          :loading="loading"
          @click="handleCreateEvent"
        >
          <span class="flex items-center gap-2">
            <span class="material-icons-outlined text-base">event</span>
            {{ loading ? t('common.loading') : t('events.createEvent') }}
          </span>
        </Button>
      </div>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { useUserStore } from '@/stores/user'
import { usePosts } from '@/composables/usePosts'
import { supabase } from '@/lib/supabase'
import { checkBannedWords } from '@/lib/bannedWords'
import { logAdminAction } from '@/lib/auditLog'
import RichTextEditor from '@/components/ui/RichTextEditor.vue'
import Card from '@/components/ui/Card.vue'
import Avatar from '@/components/ui/Avatar.vue'
import Modal from '@/components/ui/Modal.vue'
import Button from '@/components/ui/Button.vue'
import { useMentions } from '@/composables/useMentions'
import { useHashtags } from '@/composables/useHashtags'
import Select from '@/components/ui/Select.vue'
import { parseMentions } from '@/lib/mentionParser'
import type { PostType } from '@/types/posts'

const authStore = useAuthStore()
const userStore = useUserStore()
const { createPost } = usePosts()
const { saveMentions } = useMentions()
const { saveHashtags } = useHashtags()
const { t } = useI18n()

const content = ref('')
const editorRef = ref<any>(null)
const selectedType = ref<PostType>('networking')
const loading = ref(false)
const error = ref<string | null>(null)
const selectedImage = ref<string | null>(null)
const selectedImageFile = ref<File | null>(null)
const uploadingImage = ref(false)
const showPostModal = ref(false)
const showEventModal = ref(false)
const eventImageFile = ref<File | null>(null)
const eventImagePreview = ref<string | null>(null)
const programs = ref<any[]>([])

const selectedProgram = computed(() => {
  return programs.value.find(p => p.id === eventForm.value.program_id)
})

function formatDate(dateString: string | null) {
  if (!dateString) return 'Data indefinida'
  return new Date(dateString).toLocaleDateString()
}

function isProgramExpired(program: any) {
  if (!program?.program_end_date) return false
  return new Date(program.program_end_date) < new Date()
}

const programOptions = computed(() => {
  return programs.value.map(p => ({
    value: p.id,
    label: p.title_pt,
    disabled: !p.isEnrolled,
    disabledMessage: 'Você precisa estar matriculado neste programa para criar um evento.'
  }))
})

const eventForm = ref({
  titulo: '',
  descricao: '',
  data_hora: '',
  tipo: 'presencial' as 'presencial' | 'webinar',
  local: '',
  program_id: '',
})

const dateTime = ref({
  day: '',
  month: '',
  year: '',
  hour: '',
  minute: '',
})

const userName = computed(() => userStore.profile?.nome || authStore.user?.email?.split('@')[0] || t('common.user'))
const userAvatar = computed(() => userStore.profile?.avatar_url || authStore.user?.user_metadata?.avatar_url || '')

const emit = defineEmits<{
  'post-created': [postId: string]
  'event-created': [eventId: string]
}>()

function openPhotoUpload() {
  showPostModal.value = true
  // Optionally trigger file input
}

function openVideoUpload() {
  showPostModal.value = true
}

function openEventModal() {
  showEventModal.value = true
}

function closePostModal() {
  showPostModal.value = false
  content.value = ''
  selectedImage.value = null
  selectedImageFile.value = null
  error.value = null
}

// Resetar formulário quando modal fechar
watch(showEventModal, (newValue) => {
  if (!newValue) {
    eventForm.value = {
      titulo: '',
      descricao: '',
      data_hora: '',
      tipo: 'presencial',
      local: '',
      program_id: '',
    }
    error.value = null
    dateTime.value = {
      day: '',
      month: '',
      year: '',
      hour: '',
      minute: '',
    }
    eventImageFile.value = null
    eventImagePreview.value = null
    error.value = null
  } else {
    // Buscar programas quando o modal abrir
    fetchProgramsForSelection()
  }
})

async function fetchProgramsForSelection() {
  if (!authStore.user) return
  
  try {
    // Buscar todos os programas
    const { data: allPrograms, error: programsError } = await supabase
      .from('programs')
      .select('id, title_pt, program_start_date, program_end_date')
      .order('title_pt')

    if (programsError) throw programsError

    // Buscar matrículas do usuário
    const { data: enrollments, error: enrollmentsError } = await supabase
      .from('program_enrollments')
      .select('program_id')
      .eq('user_id', authStore.user.id)
      .eq('status', 'active')

    if (enrollmentsError) throw enrollmentsError

    const enrolledIds = new Set(enrollments?.map(e => e.program_id) || [])
    
    programs.value = (allPrograms || []).map(p => ({
      ...p,
      isEnrolled: enrolledIds.has(p.id)
    }))
  } catch (err: any) {
    console.error('Error fetching programs:', err)
  }
}

async function handleImageSelect(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return

  if (!file.type.startsWith('image/')) {
    error.value = t('events.validation.imageOnly')
    return
  }

  if (file.size > 20 * 1024 * 1024) {
    error.value = t('events.validation.imageTooLarge')
    return
  }

  selectedImageFile.value = file
  
  const reader = new FileReader()
  reader.onload = (e) => {
    selectedImage.value = e.target?.result as string
  }
  reader.readAsDataURL(file)
}

function removeImage() {
  selectedImage.value = null
  selectedImageFile.value = null
  error.value = null
}

async function handleEventImageSelect(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return

  if (!file.type.startsWith('image/')) {
    error.value = 'Por favor, selecione apenas arquivos de imagem'
    return
  }

  if (file.size > 20 * 1024 * 1024) {
    error.value = 'A imagem deve ter no máximo 20MB'
    return
  }

  eventImageFile.value = file
  
  const reader = new FileReader()
  reader.onload = (e) => {
    eventImagePreview.value = e.target?.result as string
  }
  reader.readAsDataURL(file)
}

function removeEventImage() {
  eventImageFile.value = null
  eventImagePreview.value = null
  error.value = null
}

async function uploadEventImage(): Promise<string | null> {
  if (!eventImageFile.value || !authStore.user) return null

  uploadingImage.value = true
  try {
    const fileExt = eventImageFile.value.name.split('.').pop()
    const fileName = `event-${authStore.user.id}-${Date.now()}.${fileExt}`
    const filePath = `events/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('event-images')
      .upload(filePath, eventImageFile.value, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) throw uploadError

    const { data: { publicUrl } } = supabase.storage
      .from('event-images')
      .getPublicUrl(filePath)

    return publicUrl
  } catch (err: any) {
    console.error('Error uploading event image:', err)
    error.value = t('posts.form.uploadError')
    return null
  } finally {
    uploadingImage.value = false
  }
}

async function uploadImage(): Promise<string | null> {
  if (!selectedImageFile.value || !authStore.user) return null

  uploadingImage.value = true
  try {
    const fileExt = selectedImageFile.value.name.split('.').pop()
    const fileName = `${authStore.user.id}-${Date.now()}.${fileExt}`
    const filePath = `posts/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('post-images')
      .upload(filePath, selectedImageFile.value, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) throw uploadError

    const { data: { publicUrl } } = supabase.storage
      .from('post-images')
      .getPublicUrl(filePath)

    return publicUrl
  } catch (err: any) {
    console.error('Error uploading image:', err)
    error.value = t('posts.form.uploadError')
    return null
  } finally {
    uploadingImage.value = false
  }
}

async function handleSubmit() {
  if (!content.value.trim() || loading.value) return

  loading.value = true
  error.value = null

  try {
    let imageUrl: string | null = null
    if (selectedImageFile.value) {
      imageUrl = await uploadImage()
      if (!imageUrl) {
        loading.value = false
        return
      }
    }

    const newPost = await createPost({
      conteudo: content.value.trim(),
      tipo: selectedType.value,
      image_url: imageUrl || undefined,
    })

    // Process and save mentions
    const mentions = parseMentions(content.value.trim())
    if (mentions.length > 0) {
      try {
        await saveMentions(newPost.id, null, mentions)
      } catch (err) {
        console.error('Error saving mentions:', err)
        // Don't block post creation if mentions fail
      }
    }

    // Process and save hashtags
    try {
      await saveHashtags(newPost.id, null, content.value.trim())
    } catch (err) {
      console.error('Error saving hashtags:', err)
      // Don't block post creation if hashtags fail
    }

    // Reset form
    content.value = ''
    if (editorRef.value) {
      editorRef.value.clearContent()
    }
    selectedType.value = 'networking'
    selectedImage.value = null
    selectedImageFile.value = null
    showPostModal.value = false

    if (newPost.status === 'pending') {
      const { toast } = await import('vue-sonner')
      toast.success(t('posts.form.pendingApproval'), {
        description: t('posts.form.pendingApprovalDesc'),
        duration: 5000,
      })
    }

    emit('post-created', newPost.id)
  } catch (err: any) {
    error.value = err.message || t('posts.form.createError')
    console.error('Error creating post:', err)
  } finally {
    loading.value = false
  }
}

function getMonthName(month: number): string {
  const monthKeys = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
  return t(`months.${monthKeys[month - 1]}`)
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
  
  const dateStr = `${dateTime.value.year}-${dateTime.value.month}-${dateTime.value.day}`
  const timeStr = `${dateTime.value.hour}:${dateTime.value.minute}`
  return `${dateStr}T${timeStr}:00`
}

function closeEventModal() {
  showEventModal.value = false
  eventForm.value = {
    titulo: '',
    descricao: '',
    data_hora: '',
    tipo: 'presencial',
    local: '',
    program_id: '',
  }
  dateTime.value = {
    day: '',
    month: '',
    year: '',
    hour: '',
    minute: '',
  }
  eventImageFile.value = null
  eventImagePreview.value = null
  error.value = null
}

async function handleCreateEvent() {
  if (loading.value) return
  
  error.value = null
  
  if (!eventForm.value.titulo || eventForm.value.titulo.trim() === '') {
    error.value = t('events.validation.fillTitle')
    return
  }
  
  if (!eventForm.value.program_id) {
    error.value = t('events.validation.selectProgram')
    return
  }
  
  const dataHora = buildDateTimeString()
  
  if (!dataHora) {
    const missingFields = []
    if (!dateTime.value.day) missingFields.push('Dia')
    if (!dateTime.value.month) missingFields.push('Mês')
    if (!dateTime.value.year) missingFields.push('Ano')
    if (!dateTime.value.hour) missingFields.push('Hora')
    if (!dateTime.value.minute) missingFields.push('Minuto')
    
    error.value = `Por favor, preencha todos os campos de data e hora. Faltando: ${missingFields.join(', ')}`
    return
  }

  // Validações de data do programa
  const program = programs.value.find(p => p.id === eventForm.value.program_id)
  if (program) {
    const eventDate = new Date(dataHora)
    const now = new Date()
    now.setHours(0, 0, 0, 0) // Reset time for date-only comparison

    const programEndDate = program.program_end_date ? new Date(program.program_end_date) : null
    const programStartDate = program.program_start_date ? new Date(program.program_start_date) : null

    if (programEndDate) {
      programEndDate.setHours(23, 59, 59, 999) // End of day
      if (programEndDate < now) {
        error.value = t('admin.events.errors.programExpired', { 
          programTitle: program.title_pt, 
          endDate: programEndDate.toLocaleDateString() 
        })
        loading.value = false
        return
      }
    }

    if (programStartDate) {
      programStartDate.setHours(0, 0, 0, 0) // Start of day
      if (eventDate < programStartDate) {
        error.value = t('admin.events.errors.eventBeforeStart', {
          startDate: programStartDate.toLocaleDateString()
        })
        loading.value = false
        return
      }
    }

    if (programEndDate && eventDate > programEndDate) {
      error.value = t('admin.events.errors.eventAfterEnd', {
        endDate: programEndDate.toLocaleDateString()
      })
      loading.value = false
      return
    }
  }

  loading.value = true
  error.value = null

  try {
    const titleCheck = await checkBannedWords(eventForm.value.titulo)
    const descCheck = eventForm.value.descricao ? await checkBannedWords(eventForm.value.descricao) : { found: false, action: null, words: [] }
    
    if (titleCheck.found) {
      error.value = 'O título do evento contém palavras ofensivas. Por favor, revise o conteúdo.'
      loading.value = false
      return
    }
    
    if (descCheck.found) {
      error.value = 'A descrição do evento contém palavras ofensivas. Por favor, revise o conteúdo.'
      loading.value = false
      return
    }
    
    let finalTitulo = eventForm.value.titulo
    let finalDescricao = eventForm.value.descricao
    let eventImageUrl: string | null = null
    if (eventImageFile.value) {
      eventImageUrl = await uploadEventImage()
      if (!eventImageUrl) {
        loading.value = false
        return
      }
    }

    const eventData = {
      titulo: finalTitulo,
      descricao: finalDescricao || null,
      data_hora: dataHora,
      tipo: eventForm.value.tipo,
      local: eventForm.value.tipo === 'presencial' ? eventForm.value.local : null,
      image_url: eventImageUrl || null,
      status: 'pending',
      created_by: authStore.user?.id,
      program_id: eventForm.value.program_id,
    }

    const { data, error: eventError } = await supabase
      .from('events')
      .insert(eventData)
      .select()
      .single()

    if (eventError) throw eventError
    
    if (authStore.user) {
      logAdminAction(authStore.user.id, {
        action: 'create_event',
        targetId: data.id,
        targetType: 'event',
        details: { titulo: data.titulo, tipo: data.tipo }
      })
    }

    console.log('✅ Evento criado com sucesso! ID:', data.id)

    // Notificar admins sobre o evento (se estiver pendente)
    // O post também será notificado quando for criado abaixo
    if (data.status === 'pending') {
      const creatorName = userStore.profile?.nome || 'Usuário'
      
      // Chamar notificação de forma assíncrona sem bloquear
      import('@/lib/emails').then(({ notifyAdminsNewEvent }) => {
        notifyAdminsNewEvent(
          data.id,
          data.titulo,
          data.data_hora,
          data.tipo,
          creatorName
        ).catch(err => {
          console.error('Failed to notify admins about new event:', err)
        })
      })
    }

    console.log('11. Criando post sobre o evento...')
    // Criar post sobre o evento com a imagem do banner
    // O createPost() já notifica os admins sobre o post pendente
    const newPost = await createPost({
      conteudo: `📅 Novo evento: ${eventForm.value.titulo}\n\n${eventForm.value.descricao || ''}`,
      tipo: 'oportunidade',
      image_url: eventImageUrl || undefined,
    })

    closeEventModal()
    content.value = ''

    emit('post-created', newPost.id)
    emit('event-created', data.id)
  } catch (err: any) {
    error.value = err.message || 'Erro ao criar evento. Tente novamente.'
  } finally {
    loading.value = false
  }
}
</script>
