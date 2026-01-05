<template>
  <div class="h-full bg-slate-50 dark:bg-black/20 overflow-y-auto custom-scrollbar">
    <div v-if="!selectedItem && !isCreating" class="h-full flex flex-col items-center justify-center p-8 text-center">
      <div class="bg-white dark:bg-surface-dark p-8 rounded-[40px] shadow-xl border border-slate-200 dark:border-white/5 max-w-sm">
        <div class="bg-secondary/10 p-6 rounded-full w-fit mx-auto mb-6">
          <span class="material-symbols-outlined text-5xl text-secondary">edit_note</span>
        </div>
        <h3 class="text-xl font-black text-slate-900 dark:text-white mb-2">Selecione um item</h3>
        <p class="text-slate-500 dark:text-gray-400 text-sm font-medium">
          Escolha um módulo ou aula na barra lateral para editar seu conteúdo, ou crie um novo.
        </p>
      </div>
    </div>

    <div v-else class="max-w-4xl mx-auto p-4 sm:p-12">
      <!-- Breadcrumb / Mobile Back -->
      <div class="flex items-center gap-3 mb-6 sm:mb-8">
        <button 
          @click="$emit('cancel')"
          class="sm:hidden p-2 -ml-2 hover:bg-slate-200 dark:hover:bg-white/5 rounded-full transition-all text-slate-600 dark:text-gray-400"
        >
          <span class="material-symbols-outlined">arrow_back</span>
        </button>
        <div class="flex items-center gap-2 text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest overflow-hidden">
          <span class="truncate">{{ programName }}</span>
          <span class="material-symbols-outlined text-sm flex-shrink-0">chevron_right</span>
          <span class="text-secondary flex-shrink-0">{{ isCreating ? 'Novo' : 'Editando' }} {{ mode === 'module' ? 'Módulo' : 'Aula' }}</span>
        </div>
      </div>

      <!-- Editor Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-8 sm:mb-10 gap-6">
        <h2 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight">
          {{ mode === 'module' ? 'Configurações do Módulo' : 'Detalhes da Aula' }}
        </h2>
        <div class="flex gap-3 sm:gap-4">
          <button 
            @click="$emit('cancel')" 
            class="flex-1 sm:flex-none px-4 sm:px-6 py-3 sm:py-2 rounded-xl font-bold text-slate-600 dark:text-gray-400 bg-white dark:bg-white/5 sm:bg-transparent border border-slate-200 dark:border-white/10 sm:border-0 hover:bg-slate-200 dark:hover:bg-white/10 transition-all text-sm sm:text-base"
          >
            Cancelar
          </button>
          <button 
            @click="handleSubmit" 
            :disabled="loading"
            class="flex-[2] sm:flex-none px-6 sm:px-8 py-3 sm:py-2 bg-secondary text-black font-black rounded-xl hover:bg-secondary/90 shadow-lg shadow-secondary/20 transition-all disabled:opacity-50 text-sm sm:text-base"
          >
            {{ loading ? 'Salvando...' : 'Salvar' }}
          </button>
        </div>
      </div>

      <div class="bg-white dark:bg-surface-dark rounded-[2rem] sm:rounded-3xl border border-slate-200 dark:border-white/5 shadow-xl overflow-hidden mb-12">
        <div class="p-6 sm:p-8 space-y-6 sm:space-y-8">
          
          <!-- Shared Fields for both Module and Lesson -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="block text-sm font-black text-slate-700 dark:text-gray-300 uppercase tracking-wider">Título (Português) *</label>
              <input 
                v-model="formData.title_pt" 
                type="text" 
                class="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-secondary outline-none transition-all font-medium"
                placeholder="Ex: Introdução ao curso"
              />
            </div>
            <div class="space-y-2">
              <label class="block text-sm font-black text-slate-700 dark:text-gray-300 uppercase tracking-wider">Título (Inglês) *</label>
              <input 
                v-model="formData.title_en" 
                type="text" 
                class="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-secondary outline-none transition-all font-medium"
                placeholder="Ex: Introduction to the course"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="block text-sm font-black text-slate-700 dark:text-gray-300 uppercase tracking-wider">Descrição (Português)</label>
              <textarea 
                v-model="formData.description_pt" 
                rows="3"
                class="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-secondary outline-none transition-all font-medium resize-none shadow-inner"
              ></textarea>
            </div>
            <div class="space-y-2">
              <label class="block text-sm font-black text-slate-700 dark:text-gray-300 uppercase tracking-wider">Descrição (Inglês)</label>
              <textarea 
                v-model="formData.description_en" 
                rows="3"
                class="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-secondary outline-none transition-all font-medium resize-none shadow-inner"
              ></textarea>
            </div>
          </div>

          <!-- Lesson Specific Fields -->
          <div v-if="mode === 'lesson'" class="pt-8 border-t border-slate-100 dark:border-white/5 space-y-8">
            <h3 class="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span class="material-symbols-outlined text-secondary">video_library</span>
              Conteúdo de Vídeo
            </h3>

            <!-- YouTube Video Section -->
            <div class="space-y-6">
              <!-- Source Toggle -->
              <div class="flex p-1 bg-slate-100 dark:bg-black/40 rounded-xl w-fit">
                <button 
                  @click="videoSource = 'link'"
                  :class="[
                    'px-4 py-2 rounded-lg text-xs font-black uppercase transition-all',
                    videoSource === 'link' ? 'bg-white dark:bg-surface-dark text-secondary shadow-md' : 'text-slate-500'
                  ]"
                >
                  Colar Link
                </button>
                <button 
                  @click="videoSource = 'upload'"
                  :class="[
                    'px-4 py-2 rounded-lg text-xs font-black uppercase transition-all',
                    videoSource === 'upload' ? 'bg-white dark:bg-surface-dark text-secondary shadow-md' : 'text-slate-500'
                  ]"
                >
                  Fazer Upload
                </button>
              </div>

              <!-- Option 1: Paste Link -->
              <div v-if="videoSource === 'link'" class="space-y-4">
                <div class="flex gap-4">
                  <div class="flex-1 relative">
                    <input 
                      v-model="formData.youtube_video_id" 
                      type="text" 
                      @input="handleVideoIdInput"
                      class="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl pl-12 pr-4 py-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-secondary outline-none transition-all font-bold"
                      placeholder="Cole a URL ou ID do YouTube"
                    />
                    <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">smart_display</span>
                  </div>
                  <button 
                    @click="fetchYouTubeMetadata"
                    type="button"
                    :disabled="fetchingMetadata || !formData.youtube_video_id"
                    class="px-6 bg-slate-900 text-white dark:bg-white dark:text-black rounded-xl font-black hover:scale-105 active:scale-95 transition-all text-sm flex items-center gap-2 disabled:opacity-50"
                  >
                    <span class="material-symbols-outlined text-sm">{{ fetchingMetadata ? 'sync' : 'auto_fix' }}</span>
                    {{ fetchingMetadata ? 'Buscando...' : 'Auto-Preencher' }}
                  </button>
                </div>
              </div>

              <!-- Option 2: Direct Upload -->
              <div v-else class="space-y-4">
                <div 
                  @dragover.prevent="isDragging = true"
                  @dragleave.prevent="isDragging = false"
                  @drop.prevent="handleVideoDrop"
                  :class="[
                    'relative border-2 border-dashed rounded-3xl p-10 text-center transition-all group',
                    isDragging ? 'border-secondary bg-secondary/5' : 'border-slate-200 dark:border-white/10 hover:border-secondary'
                  ]"
                >
                  <input 
                    type="file" 
                    accept="video/*" 
                    class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    @change="handleVideoFileSelect"
                  />
                  
                  <div v-if="!uploadState.isUploading" class="space-y-4">
                    <div class="bg-secondary/10 p-4 rounded-full w-fit mx-auto group-hover:scale-110 transition-transform">
                      <span class="material-symbols-outlined text-4xl text-secondary">cloud_upload</span>
                    </div>
                    <div>
                      <p class="text-slate-900 dark:text-white font-black">Arraste seu vídeo ou clique aqui</p>
                      <p class="text-slate-500 dark:text-gray-400 text-xs mt-1">MP4, MOV ou AVI (Recomendado: 1080p)</p>
                    </div>
                  </div>

                  <!-- Uploading State -->
                  <div v-else class="space-y-6">
                    <div class="flex items-center justify-between text-sm font-black mb-2">
                       <span class="text-slate-900 dark:text-white uppercase tracking-wider">{{ uploadState.progress === 100 ? 'Finalizando...' : 'Fazendo Upload...' }}</span>
                       <span class="text-secondary">{{ uploadState.progress }}%</span>
                    </div>
                    <div class="w-full h-3 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                      <div 
                        class="h-full bg-secondary transition-all duration-300 shadow-[0_0_15px_rgba(255,214,0,0.5)]"
                        :style="{ width: `${uploadState.progress}%` }"
                      ></div>
                    </div>
                    <p class="text-[10px] text-slate-500 font-bold uppercase">{{ uploadState.fileName }}</p>
                  </div>
                </div>
              </div>

              <!-- Video Preview Card (Simplified for Link/Complete Upload) -->
              <div v-if="formData.youtube_video_id && formData.youtube_video_id.length === 11" class="flex flex-col sm:flex-row gap-6 p-6 bg-slate-900 rounded-3xl text-white">
                <div class="relative w-full sm:w-64 h-36 rounded-2xl overflow-hidden shadow-2xl flex-shrink-0">
                  <img :src="getYouTubeThumbnail(formData.youtube_video_id, 'hq')" class="w-full h-full object-cover" />
                  <div class="absolute inset-0 flex items-center justify-center bg-black/40">
                    <span class="material-symbols-outlined text-5xl text-white/80">play_circle</span>
                  </div>
                </div>
                <div class="flex-1 space-y-2">
                  <p class="text-[10px] font-black uppercase text-secondary tracking-widest">Preview do Vídeo</p>
                  <p class="font-black text-lg line-clamp-1">{{ formData.title_pt || 'Título do vídeo' }}</p>
                  <div class="flex items-center gap-4 text-xs font-bold text-slate-400">
                    <span class="flex items-center gap-1">
                      <span class="material-symbols-outlined text-sm">schedule</span>
                      {{ formatDuration(formData.duration_seconds) }}
                    </span>
                    <span class="flex items-center gap-1">
                      <span class="material-symbols-outlined text-sm">vpn_key</span>
                      ID: {{ formData.youtube_video_id }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div class="flex items-center justify-between p-4 bg-secondary/10 rounded-2xl border border-secondary/20">
               <div class="flex items-center gap-4">
                  <div class="bg-secondary/20 p-2 rounded-lg">
                    <span class="material-symbols-outlined text-secondary">visibility</span>
                  </div>
                  <div>
                    <h4 class="text-sm font-black text-slate-900 dark:text-white">Permitir Preview Grátis</h4>
                    <p class="text-[10px] text-slate-500 font-bold uppercase">Qualquer usuário poderá assistir esta aula</p>
                  </div>
               </div>
               <input 
                v-model="formData.is_preview" 
                type="checkbox" 
                class="w-6 h-6 rounded-lg text-secondary focus:ring-secondary bg-white dark:bg-black/40 border-slate-300 dark:border-white/10"
              />
            </div>
          </div>

          <!-- Danger Zone (Delete) -->
          <div v-if="!isCreating" class="pt-8 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
            <div class="max-w-xs">
              <h4 class="text-sm font-black text-red-500 uppercase">Zona de Perigo</h4>
              <p class="text-[10px] text-slate-500 font-bold uppercase mt-1">
                A remoção deste item é permanente e apagará todos os conteúdos vinculados.
              </p>
            </div>
            <button 
              @click="$emit('delete', selectedItem)" 
              class="px-6 py-2 border-2 border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white rounded-xl font-black transition-all text-sm flex items-center gap-2"
            >
              <span class="material-symbols-outlined text-sm">delete_sweep</span>
              Excluir {{ mode === 'module' ? 'Módulo' : 'Aula' }}
            </button>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { extractYouTubeVideoId, getYouTubeThumbnail } from '@/lib/youtube'
import { useModulesStore } from '@/stores/modules'
import { supabase } from '@/lib/supabase'

const props = defineProps<{
  selectedItem: any | null
  mode: 'module' | 'lesson'
  isCreating: boolean
  programName: string
  loading: boolean
}>()

const emit = defineEmits(['save', 'cancel', 'delete'])

const modulesStore = useModulesStore()
const fetchingMetadata = ref(false)
const videoSource = ref<'link' | 'upload'>('link')
const isDragging = ref(false)
const uploadState = ref({
  isUploading: false,
  progress: 0,
  fileName: ''
})

const formData = ref<any>({
  title_pt: '',
  title_en: '',
  description_pt: '',
  description_en: '',
  youtube_video_id: '',
  duration_seconds: null,
  is_preview: false,
})

// Sync form with selected item
watch(() => props.selectedItem, (newItem) => {
  if (newItem) {
    formData.value = { 
      ...newItem,
      description_pt: newItem.description_pt || '',
      description_en: newItem.description_en || '',
      youtube_video_id: newItem.youtube_video_id || '',
      duration_seconds: newItem.duration_seconds || null,
      is_preview: newItem.is_preview || false
    }
  } else if (props.isCreating) {
    resetForm()
  }
}, { immediate: true })

function resetForm() {
  formData.value = {
    title_pt: '',
    title_en: '',
    description_pt: '',
    description_en: '',
    youtube_video_id: '',
    duration_seconds: null,
    is_preview: false,
  }
}

function handleVideoIdInput() {
  const extracted = extractYouTubeVideoId(formData.value.youtube_video_id)
  if (extracted) {
    formData.value.youtube_video_id = extracted
  }
}

async function fetchYouTubeMetadata() {
  if (!formData.value.youtube_video_id) return
  
  fetchingMetadata.value = true
  try {
    const details = await modulesStore.getYouTubeVideoDetails(formData.value.youtube_video_id)
    if (details) {
      if (!formData.value.title_pt) formData.value.title_pt = details.title
      if (!formData.value.title_en) formData.value.title_en = details.title
      formData.value.duration_seconds = details.duration_seconds
    }
  } catch (err) {
    console.error('Error fetching youtube metadata:', err)
  } finally {
    fetchingMetadata.value = false
  }
}

function handleVideoDrop(e: DragEvent) {
  isDragging.value = false
  const file = e.dataTransfer?.files[0]
  if (file && file.type.startsWith('video/')) {
    startYouTubeUpload(file)
  }
}

function handleVideoFileSelect(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    startYouTubeUpload(file)
  }
}

async function startYouTubeUpload(file: File) {
  uploadState.value = {
    isUploading: true,
    progress: 0,
    fileName: file.name
  }

  try {
    // 1. Get resumable upload URL from Edge Function
    const { data, error } = await supabase.functions.invoke('youtube-init-upload', {
      body: { 
        title: formData.value.title_pt || file.name.split('.')[0],
        description: formData.value.description_pt || ''
      }
    })

    if (error) throw error
    if (!data.uploadUrl) throw new Error('Failed to get upload URL')

    // 2. Upload file directly to YouTube via XHR (to track progress)
    const xhr = new XMLHttpRequest()
    xhr.open('PUT', data.uploadUrl, true)
    
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        uploadState.value.progress = Math.round((e.loaded / e.total) * 100)
      }
    }

    xhr.onload = async () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const response = JSON.parse(xhr.responseText)
        formData.value.youtube_video_id = response.id
        uploadState.value.isUploading = false
        // Fetch metadata to get duration/thumbnail
        await fetchYouTubeMetadata()
      } else {
        throw new Error('Upload failed with status ' + xhr.status)
      }
    }

    xhr.onerror = () => {
      throw new Error('Network error during upload')
    }

    xhr.send(file)

  } catch (err) {
    console.error('Upload error:', err)
    alert('Erro no upload: ' + (err as Error).message)
    uploadState.value.isUploading = false
  }
}

function formatDuration(seconds: number | null) {
  if (!seconds) return '--:--'
  const hours = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  if (hours > 0) return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function handleSubmit() {
  emit('save', { ...formData.value })
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
  background: rgba(0,0,0,0.05);
  border-radius: 10px;
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.05);
}
</style>
