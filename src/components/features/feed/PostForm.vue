<template>
  <Card variant="white" class="p-8 dark:bg-surface-dark dark:border-gray-800 shadow-xl border-t border-gray-100 dark:border-gray-800 w-full">
    <div class="flex gap-6">
      <Avatar :src="userAvatar" :name="userName" size="md" class="ring-2 ring-offset-2 ring-offset-surface-dark ring-secondary flex-shrink-0" />
      <div class="flex-grow min-w-0">
        <input
          v-model="content"
          class="w-full bg-slate-50 dark:bg-surface-lighter border border-slate-200 dark:border-gray-700/50 rounded-full px-5 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent dark:text-white placeholder-gray-500 dark:placeholder-gray-500 transition-all"
          placeholder="Compartilhe uma novidade, evento ou projeto..."
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
          Mídia
        </label>
        <button
          class="flex items-center gap-2 text-gray-400 dark:text-gray-400 hover:text-primary dark:hover:text-primary text-sm font-medium transition-colors group"
          @click="showEventModal = true"
        >
          <span class="material-icons-outlined text-xl group-hover:scale-110 transition-transform text-primary">calendar_today</span>
          Evento
        </button>
      </div>
      <button
        class="bg-gradient-to-r from-secondary to-cyan-500 hover:from-cyan-400 hover:to-secondary text-black font-bold text-sm px-6 py-2 rounded-full transition-all shadow-lg shadow-secondary/20 hover:shadow-secondary/40 disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="!content.trim() || loading"
        @click="handleSubmit"
      >
        <span v-if="loading">Publicando...</span>
        <span v-else>Publicar</span>
      </button>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
      {{ error }}
    </div>

    <!-- Modal de Evento -->
    <Modal v-model="showEventModal" title="Criar Evento" size="lg">
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
          <label class="block text-sm font-semibold text-gray-300 mb-2">Descrição</label>
          <textarea
            v-model="eventForm.descricao"
            rows="3"
            class="w-full px-3 py-2 border border-slate-700 rounded-xl bg-slate-900/50 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
            placeholder="Descreva o evento..."
          ></textarea>
        </div>
        <div>
          <label class="block text-sm font-semibold text-gray-300 mb-2">Banner do Evento</label>
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
                  {{ eventImageFile ? 'Trocar imagem' : 'Adicionar banner' }}
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
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-semibold text-gray-300 mb-2">Data e Hora</label>
            <input
              v-model="eventForm.data_hora"
              type="datetime-local"
              class="w-full px-3 py-2 border border-slate-700 rounded-xl bg-slate-900/50 text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
            />
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-300 mb-2">Tipo</label>
            <select
              v-model="eventForm.tipo"
              class="w-full px-3 py-2 border border-slate-700 rounded-xl bg-slate-900/50 text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
            >
              <option value="presencial">Presencial</option>
              <option value="webinar">Webinar</option>
            </select>
          </div>
        </div>
        <div v-if="eventForm.tipo === 'presencial'">
          <label class="block text-sm font-semibold text-gray-300 mb-2">Local</label>
          <input
            v-model="eventForm.local"
            type="text"
            class="w-full px-3 py-2 border border-slate-700 rounded-xl bg-slate-900/50 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
            placeholder="Ex: Miami, FL"
          />
        </div>
      </div>
      <template #footer>
        <div class="flex gap-3">
          <Button variant="outline" @click="showEventModal = false">Cancelar</Button>
          <Button variant="primary" :disabled="!eventForm.titulo || !eventForm.data_hora" @click="handleCreateEvent">
            Criar Evento
          </Button>
        </div>
      </template>
    </Modal>
  </Card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useUserStore } from '@/stores/user'
import { usePosts } from '@/composables/usePosts'
import { supabase } from '@/lib/supabase'
import Card from '@/components/ui/Card.vue'
import Avatar from '@/components/ui/Avatar.vue'
import Modal from '@/components/ui/Modal.vue'
import Button from '@/components/ui/Button.vue'
import type { PostType } from '@/types/posts'

const authStore = useAuthStore()
const userStore = useUserStore()
const { createPost } = usePosts()

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

const userName = computed(() => userStore.profile?.nome || authStore.user?.email?.split('@')[0] || 'Usuário')
const userAvatar = computed(() => userStore.profile?.avatar_url || authStore.user?.user_metadata?.avatar_url || '')

const emit = defineEmits<{
  'post-created': [postId: string]
  'event-created': [eventId: string]
}>()

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
      .from('post-images')
      .upload(filePath, eventImageFile.value, {
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

    // Emit event
    emit('post-created', newPost.id)
  } catch (err: any) {
    error.value = err.message || 'Erro ao criar post. Tente novamente.'
    console.error('Error creating post:', err)
  } finally {
    loading.value = false
  }
}

async function handleCreateEvent() {
  if (!eventForm.value.titulo || !eventForm.value.data_hora) return

  loading.value = true
  error.value = null

  try {
    // Upload da imagem do evento se houver
    let eventImageUrl: string | null = null
    if (eventImageFile.value) {
      eventImageUrl = await uploadEventImage()
      if (!eventImageUrl) {
        loading.value = false
        return
      }
    }

    const { data, error: eventError } = await supabase
      .from('events')
      .insert({
        titulo: eventForm.value.titulo,
        descricao: eventForm.value.descricao || null,
        data_hora: eventForm.value.data_hora,
        tipo: eventForm.value.tipo,
        local: eventForm.value.tipo === 'presencial' ? eventForm.value.local : null,
        image_url: eventImageUrl || null,
        status: 'pending', // Sempre criar como pending
        created_by: authStore.user?.id,
      })
      .select()
      .single()

    if (eventError) throw eventError

    // Criar post sobre o evento
    const newPost = await createPost({
      conteudo: `📅 Novo evento: ${eventForm.value.titulo}\n\n${eventForm.value.descricao || ''}`,
      tipo: 'oportunidade',
    })

    // Reset form
    showEventModal.value = false
    eventForm.value = {
      titulo: '',
      descricao: '',
      data_hora: '',
      tipo: 'presencial',
      local: '',
    }
    eventImageFile.value = null
    eventImagePreview.value = null
    content.value = ''

    emit('post-created', newPost.id)
    emit('event-created', data.id)
  } catch (err: any) {
    error.value = err.message || 'Erro ao criar evento. Tente novamente.'
    console.error('Error creating event:', err)
  } finally {
    loading.value = false
  }
}
</script>

