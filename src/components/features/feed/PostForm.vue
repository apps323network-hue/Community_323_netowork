<template>
  <Card variant="white" class="p-8 dark:bg-surface-dark dark:border-gray-800 shadow-xl border-t border-gray-100 dark:border-gray-800 w-full">
    <div class="flex gap-6">
      <Avatar :src="userAvatar" :name="userName" size="md" class="ring-2 ring-offset-2 ring-offset-surface-dark ring-secondary flex-shrink-0" />
      <div class="flex-grow min-w-0">
        <input
          v-model="content"
          class="w-full bg-slate-50 dark:bg-surface-lighter border border-slate-200 dark:border-gray-700/50 rounded-full px-5 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent dark:text-white placeholder-gray-500 dark:placeholder-gray-500 transition-all"
          :placeholder="t('posts.placeholder')"
          type="text"
        />
      </div>
    </div>

    <!-- Preview da Imagem -->
    <div v-if="selectedImage" class="mt-4 relative">
      <img :src="selectedImage" alt="Preview" class="w-full h-64 object-cover rounded-xl" />
      <button
        class="absolute top-2 right-2 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
        @click="removeImage"
      >
        <span class="material-icons-outlined text-lg">close</span>
      </button>
    </div>

    <!-- Actions -->
    <div class="flex justify-between items-center mt-6 px-2">
      <div class="flex gap-4">
        <label
          class="flex items-center gap-2 text-gray-400 dark:text-gray-400 hover:text-secondary dark:hover:text-secondary text-sm font-medium transition-colors group cursor-pointer"
        >
          <input
            type="file"
            accept="image/*"
            class="hidden"
            @change="handleImageSelect"
          />
          <span class="material-icons-outlined text-xl group-hover:scale-110 transition-transform text-secondary">image</span>
          {{ t('posts.media') }}
        </label>
        <button
          class="flex items-center gap-2 text-gray-400 dark:text-gray-400 hover:text-primary dark:hover:text-primary text-sm font-medium transition-colors group"
          @click="showEventModal = true"
        >
          <span class="material-icons-outlined text-xl group-hover:scale-110 transition-transform text-primary">calendar_today</span>
          {{ t('posts.event') }}
        </button>
      </div>
      <button
        class="bg-gradient-to-r from-secondary to-cyan-500 hover:from-cyan-400 hover:to-secondary text-black font-bold text-sm px-6 py-2 rounded-full transition-all shadow-lg shadow-secondary/20 hover:shadow-secondary/40 disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="!content.trim() || loading"
        @click="handleSubmit"
      >
        <span v-if="loading">{{ t('common.loading') }}</span>
        <span v-else>{{ t('posts.post') }}</span>
      </button>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
      {{ error }}
    </div>

    <!-- Modal de Evento -->
    <Modal v-model="showEventModal" :title="t('events.createEvent')" size="lg">
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-semibold text-gray-300 mb-2">Título do Evento</label>
          <input
            v-model="eventForm.titulo"
            type="text"
            class="w-full px-3 py-2 border border-slate-700 rounded-xl bg-slate-900/50 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
            placeholder="Ex: Networking em Miami"
          />
        </div>
        <div>
          <label class="block text-sm font-semibold text-gray-300 mb-2">{{ t('common.description') }}</label>
          <textarea
            v-model="eventForm.descricao"
            rows="3"
            class="w-full px-3 py-2 border border-slate-700 rounded-xl bg-slate-900/50 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
            placeholder="Descreva o evento..."
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
          <label class="block text-sm font-semibold text-gray-300 mb-2">Data *</label>
          <div class="grid grid-cols-3 gap-3">
            <div>
              <label class="block text-xs text-gray-400 mb-1">Dia</label>
              <div class="relative">
                <select
                  v-model="dateTime.day"
                  required
                  class="w-full px-3 py-2 border border-slate-700 rounded-xl bg-slate-900/50 text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all appearance-none cursor-pointer pr-10"
                >
                  <option value="">Dia</option>
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
              <label class="block text-xs text-gray-400 mb-1">Mês</label>
              <div class="relative">
                <select
                  v-model="dateTime.month"
                  required
                  class="w-full px-3 py-2 border border-slate-700 rounded-xl bg-slate-900/50 text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all appearance-none cursor-pointer pr-10"
                >
                  <option value="">Mês</option>
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
              <label class="block text-xs text-gray-400 mb-1">Ano</label>
              <div class="relative">
                <select
                  v-model="dateTime.year"
                  required
                  class="w-full px-3 py-2 border border-slate-700 rounded-xl bg-slate-900/50 text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all appearance-none cursor-pointer pr-10"
                >
                  <option value="">Ano</option>
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
            <option value="webinar">{{ t('events.webinar') }}</option>
          </select>
        </div>

        <!-- Hora -->
        <div>
          <label class="block text-sm font-semibold text-gray-300 mb-2">Hora *</label>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs text-gray-400 mb-1">Hora</label>
              <div class="relative">
                <select
                  v-model="dateTime.hour"
                  required
                  class="w-full px-3 py-2 border border-slate-700 rounded-xl bg-slate-900/50 text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all appearance-none cursor-pointer pr-10"
                >
                  <option value="">Hora</option>
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
              <label class="block text-xs text-gray-400 mb-1">Minuto</label>
              <div class="relative">
                <select
                  v-model="dateTime.minute"
                  required
                  class="w-full px-3 py-2 border border-slate-700 rounded-xl bg-slate-900/50 text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all appearance-none cursor-pointer pr-10"
                >
                  <option value="">Minuto</option>
                  <option v-for="m in 60" :key="m - 1" :value="(m - 1).toString().padStart(2, '0')">
                    {{ (m - 1).toString().padStart(2, '0') }}
                  </option>
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
            placeholder="Ex: Miami, FL"
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
            :disabled="!eventForm.titulo || !buildDateTimeString() || loading" 
            :loading="loading"
            @click="handleCreateEvent"
          >
            <span v-if="loading" class="flex items-center gap-2">
              <span class="material-icons-outlined animate-spin text-base">refresh</span>
              {{ t('common.loading') }}
            </span>
            <span v-else class="flex items-center gap-2">
              <span class="material-icons-outlined text-base">event</span>
              {{ t('events.createEvent') }}
            </span>
          </Button>
        </div>
      </template>
    </Modal>
  </Card>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { useUserStore } from '@/stores/user'
import { usePosts } from '@/composables/usePosts'
import { supabase } from '@/lib/supabase'
import { checkBannedWords } from '@/lib/bannedWords'
import Card from '@/components/ui/Card.vue'
import Avatar from '@/components/ui/Avatar.vue'
import Modal from '@/components/ui/Modal.vue'
import Button from '@/components/ui/Button.vue'
import type { PostType } from '@/types/posts'

const authStore = useAuthStore()
const userStore = useUserStore()
const { createPost } = usePosts()
const { t } = useI18n()

const content = ref('')
const selectedType = ref<PostType>('networking')
const loading = ref(false)
const error = ref<string | null>(null)
const selectedImage = ref<string | null>(null)
const selectedImageFile = ref<File | null>(null)
const uploadingImage = ref(false)
const showEventModal = ref(false)
const eventImageFile = ref<File | null>(null)
const eventImagePreview = ref<string | null>(null)

const eventForm = ref({
  titulo: '',
  descricao: '',
  data_hora: '',
  tipo: 'presencial' as 'presencial' | 'webinar',
  local: '',
})

const dateTime = ref({
  day: '',
  month: '',
  year: '',
  hour: '',
  minute: '',
})

const userName = computed(() => userStore.profile?.nome || authStore.user?.email?.split('@')[0] || 'Usuário')
const userAvatar = computed(() => userStore.profile?.avatar_url || authStore.user?.user_metadata?.avatar_url || '')

const emit = defineEmits<{
  'post-created': [postId: string]
  'event-created': [eventId: string]
}>()

// Resetar formulário quando modal fechar
watch(showEventModal, (newValue) => {
  if (!newValue) {
    // Modal foi fechado, resetar formulário
    eventForm.value = {
      titulo: '',
      descricao: '',
      data_hora: '',
      tipo: 'presencial',
      local: '',
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
})

async function handleImageSelect(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return

  // Validar tipo de arquivo
  if (!file.type.startsWith('image/')) {
    error.value = 'Por favor, selecione apenas arquivos de imagem'
    return
  }

  // Validar tamanho (máximo 20MB)
  if (file.size > 20 * 1024 * 1024) {
    error.value = 'A imagem deve ter no máximo 20MB'
    return
  }

  selectedImageFile.value = file
  
  // Criar preview
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

  // Validar tipo de arquivo
  if (!file.type.startsWith('image/')) {
    error.value = 'Por favor, selecione apenas arquivos de imagem'
    return
  }

  // Validar tamanho (máximo 20MB)
  if (file.size > 20 * 1024 * 1024) {
    error.value = 'A imagem deve ter no máximo 20MB'
    return
  }

  eventImageFile.value = file
  
  // Criar preview
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

    // Obter URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('event-images')
      .getPublicUrl(filePath)

    return publicUrl
  } catch (err: any) {
    console.error('Error uploading event image:', err)
    error.value = 'Erro ao fazer upload da imagem. Tente novamente.'
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

    // Obter URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('post-images')
      .getPublicUrl(filePath)

    return publicUrl
  } catch (err: any) {
    console.error('Error uploading image:', err)
    error.value = 'Erro ao fazer upload da imagem. Tente novamente.'
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
    // Upload da imagem se houver
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

    // Reset form
    content.value = ''
    selectedType.value = 'networking'
    selectedImage.value = null
    selectedImageFile.value = null

    // Mostrar mensagem de sucesso
    if (newPost.status === 'pending') {
      // Importar toast dinamicamente
      const { toast } = await import('vue-sonner')
      toast.success('Post criado! Aguardando aprovação do admin.', {
        description: 'Seu post será revisado e publicado em breve.',
        duration: 5000,
      })
    }

    // Emit event
    emit('post-created', newPost.id)
  } catch (err: any) {
    error.value = err.message || 'Erro ao criar post. Tente novamente.'
    console.error('Error creating post:', err)
  } finally {
    loading.value = false
  }
}

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

function closeEventModal() {
  showEventModal.value = false
  // Reset form
  eventForm.value = {
    titulo: '',
    descricao: '',
    data_hora: '',
    tipo: 'presencial',
    local: '',
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
  // Proteção contra duplo clique
  if (loading.value) {
    console.log('⚠️ handleCreateEvent já está em execução, ignorando clique duplo')
    return
  }
  
  console.log('=== INÍCIO handleCreateEvent ===')
  console.log('1. Dados do formulário:', { 
    titulo: eventForm.value.titulo, 
    descricao: eventForm.value.descricao,
    tipo: eventForm.value.tipo,
    local: eventForm.value.local,
    dateTime: dateTime.value,
    eventForm: { ...eventForm.value }
  })
  
  // Limpar erro anterior
  error.value = null
  
  // Validar título
  if (!eventForm.value.titulo || eventForm.value.titulo.trim() === '') {
    error.value = 'Por favor, preencha o título do evento'
    console.log('❌ Erro: título vazio')
    return
  }
  
  // Validar data e hora
  const dataHora = buildDateTimeString()
  console.log('2. Data/Hora construída:', dataHora)
  
  if (!dataHora) {
    const missingFields = []
    if (!dateTime.value.day) missingFields.push('Dia')
    if (!dateTime.value.month) missingFields.push('Mês')
    if (!dateTime.value.year) missingFields.push('Ano')
    if (!dateTime.value.hour) missingFields.push('Hora')
    if (!dateTime.value.minute) missingFields.push('Minuto')
    
    error.value = `Por favor, preencha todos os campos de data e hora. Faltando: ${missingFields.join(', ')}`
    console.log('❌ Erro: campos de data/hora incompletos', missingFields)
    return
  }

  loading.value = true
  error.value = null
  
  console.log('3. Usuário autenticado:', {
    userId: authStore.user?.id,
    email: authStore.user?.email,
    hasUser: !!authStore.user
  })
  
  console.log('4. Iniciando criação do evento...')

  try {
    console.log('5. Verificando palavras proibidas...')
    // Verificar palavras proibidas em título e descrição
    const titleCheck = await checkBannedWords(eventForm.value.titulo)
    const descCheck = eventForm.value.descricao ? await checkBannedWords(eventForm.value.descricao) : { found: false, action: null, words: [] }
    
    console.log('6. Resultado verificação palavras:', {
      titleCheck: titleCheck.found ? 'BLOQUEADO' : 'OK',
      descCheck: descCheck.found ? 'BLOQUEADO' : 'OK',
      titleWords: titleCheck.words,
      descWords: descCheck.words
    })
    
    // Bloquear qualquer palavra ofensiva encontrada
    if (titleCheck.found) {
      error.value = 'O título do evento contém palavras ofensivas. Por favor, revise o conteúdo.'
      loading.value = false
      console.log('❌ Bloqueado por palavras ofensivas no título')
      return
    }
    
    if (descCheck.found) {
      error.value = 'A descrição do evento contém palavras ofensivas. Por favor, revise o conteúdo.'
      loading.value = false
      console.log('❌ Bloqueado por palavras ofensivas na descrição')
      return
    }
    
    let finalTitulo = eventForm.value.titulo
    let finalDescricao = eventForm.value.descricao

    // Upload da imagem do evento se houver
    let eventImageUrl: string | null = null
    if (eventImageFile.value) {
      console.log('7. Fazendo upload da imagem...')
      eventImageUrl = await uploadEventImage()
      if (!eventImageUrl) {
        loading.value = false
        console.log('❌ Upload da imagem falhou')
        return
      }
      console.log('✅ Upload da imagem concluído:', eventImageUrl)
    } else {
      console.log('7. Nenhuma imagem para upload')
    }

    const eventData = {
      titulo: finalTitulo,
      descricao: finalDescricao || null,
      data_hora: dataHora,
      tipo: eventForm.value.tipo,
      local: eventForm.value.tipo === 'presencial' ? eventForm.value.local : null,
      image_url: eventImageUrl || null,
      status: 'pending', // Sempre criar como pending
      created_by: authStore.user?.id,
    }
    
    console.log('8. Dados que serão inseridos:', JSON.stringify(eventData, null, 2))
    console.log('9. Tentando inserir no banco de dados...')

    const { data, error: eventError } = await supabase
      .from('events')
      .insert(eventData)
      .select()
      .single()

    console.log('10. Resposta do Supabase:', {
      hasData: !!data,
      hasError: !!eventError,
      error: eventError ? {
        code: eventError.code,
        message: eventError.message,
        details: eventError.details,
        hint: eventError.hint
      } : null,
      data: data ? { id: data.id, titulo: data.titulo, status: data.status } : null
    })

    if (eventError) {
      console.error('❌ ERRO ao criar evento:', eventError)
      throw eventError
    }
    
    console.log('✅ Evento criado com sucesso! ID:', data.id)

    console.log('11. Criando post sobre o evento...')
    // Criar post sobre o evento com a imagem do banner
    const newPost = await createPost({
      conteudo: `📅 Novo evento: ${eventForm.value.titulo}\n\n${eventForm.value.descricao || ''}`,
      tipo: 'oportunidade',
      image_url: eventImageUrl || null, // Usar a imagem do banner do evento no post
    })
    console.log('✅ Post criado com sucesso! ID:', newPost.id, 'com imagem:', !!eventImageUrl)

    // Reset form
    closeEventModal()
    content.value = ''

    emit('post-created', newPost.id)
    emit('event-created', data.id)
    
    console.log('=== FIM handleCreateEvent - SUCESSO ===')
  } catch (err: any) {
    console.error('=== ERRO em handleCreateEvent ===')
    console.error('Tipo do erro:', err?.constructor?.name)
    console.error('Código do erro:', err?.code)
    console.error('Mensagem do erro:', err?.message)
    console.error('Detalhes do erro:', err?.details)
    console.error('Hint do erro:', err?.hint)
    console.error('Erro completo:', err)
    console.error('Stack trace:', err?.stack)
    
    error.value = err.message || 'Erro ao criar evento. Tente novamente.'
    console.error('=== FIM handleCreateEvent - ERRO ===')
  } finally {
    loading.value = false
  }
}
</script>

