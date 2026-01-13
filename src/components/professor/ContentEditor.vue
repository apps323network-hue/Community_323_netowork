<template>
  <div class="h-full bg-slate-50 dark:bg-black/20 overflow-y-auto custom-scrollbar">
    <div v-if="!selectedItem && !isCreating" class="h-full flex flex-col items-center justify-center p-8 text-center">
      <div class="bg-white dark:bg-surface-dark p-8 rounded-[40px] shadow-xl border border-slate-200 dark:border-white/5 max-w-sm">
        <div class="bg-secondary/10 p-6 rounded-full w-fit mx-auto mb-6">
          <span class="material-symbols-outlined text-5xl text-secondary">edit_note</span>
        </div>
        <h3 class="text-xl font-black text-slate-900 dark:text-white mb-2">Select an item to edit</h3>
        <p class="text-slate-500 dark:text-gray-400 text-sm font-medium">
          Choose a module or lesson from the sidebar to manage its content.
        </p>
      </div>
    </div>

    <div v-else class="max-w-4xl mx-auto p-4 sm:p-12">
      <!-- Breadcrumb / Mobile Back -->
      <div class="flex items-center gap-3 mb-6 sm:mb-8">
        <button 
          type="button"
          @click.prevent="$emit('cancel')"
          class="sm:hidden p-2 -ml-2 hover:bg-slate-200 dark:hover:bg-white/5 rounded-full transition-all text-slate-600 dark:text-gray-400"
        >
          <span class="material-symbols-outlined">arrow_back</span>
        </button>
        <div class="flex items-center gap-2 text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest overflow-hidden">
          <span class="truncate">{{ programName }}</span>
          <span class="material-symbols-outlined text-sm flex-shrink-0">chevron_right</span>
          <span class="text-secondary flex-shrink-0">{{ isCreating ? 'New' : 'Editing' }} {{ mode === 'module' ? 'Module' : 'Lesson' }}</span>
        </div>
      </div>

      <!-- Editor Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-8 sm:mb-10 gap-6">
        <h2 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight">
          {{ mode === 'module' ? 'Module Settings' : 'Lesson Details' }}
        </h2>
        <div class="flex gap-3 sm:gap-4">
          <button 
            type="button"
            @click.prevent="$emit('cancel')" 
            class="flex-1 sm:flex-none px-4 sm:px-6 py-3 sm:py-2 rounded-xl font-bold text-slate-600 dark:text-gray-400 bg-white dark:bg-white/5 sm:bg-transparent border border-slate-200 dark:border-white/10 sm:border-0 hover:bg-slate-200 dark:hover:bg-white/10 transition-all text-sm sm:text-base"
          >
            Cancel
          </button>
          <button 
            type="button"
            @click.prevent="handleSubmit" 
            :disabled="loading"
            class="flex-[2] sm:flex-none px-6 sm:px-8 py-3 sm:py-2 bg-secondary text-black font-black rounded-xl hover:bg-secondary/90 shadow-lg shadow-secondary/20 transition-all disabled:opacity-50 text-sm sm:text-base"
          >
            {{ loading ? 'Saving...' : 'Save' }}
          </button>
        </div>
      </div>

      <div class="bg-white dark:bg-surface-dark rounded-[2rem] sm:rounded-3xl border border-slate-200 dark:border-white/5 shadow-xl overflow-hidden mb-12">
        <div class="p-6 sm:p-8 space-y-6 sm:space-y-8">
          
          <!-- Shared Fields for both Module and Lesson -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="block text-sm font-black text-slate-700 dark:text-gray-300 uppercase tracking-wider">Título (PT) *</label>
              <input 
                v-model="formData.title_pt" 
                type="text" 
                class="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-secondary outline-none transition-all font-medium"
                :placeholder="'Título em português'"
              />
            </div>
            <div class="space-y-2">
              <label class="block text-sm font-black text-slate-700 dark:text-gray-300 uppercase tracking-wider">Title (EN) *</label>
              <input 
                v-model="formData.title_en" 
                type="text" 
                class="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-secondary outline-none transition-all font-medium"
                :placeholder="'Title in English'"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="block text-sm font-black text-slate-700 dark:text-gray-300 uppercase tracking-wider">Descrição (PT)</label>
              <textarea 
                v-model="formData.description_pt" 
                rows="3"
                class="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-secondary outline-none transition-all font-medium resize-none shadow-inner"
              ></textarea>
            </div>
            <div class="space-y-2">
              <label class="block text-sm font-black text-slate-700 dark:text-gray-300 uppercase tracking-wider">Description (EN)</label>
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
              Video Content
            </h3>

            <!-- YouTube Video Section -->
            <div class="space-y-6">
              <!-- Source Toggle -->
              <div class="flex p-1 bg-slate-100 dark:bg-black/40 rounded-xl w-fit gap-1">
                <button 
                  type="button"
                  @click.prevent="videoSource = 'link'"
                  :class="[
                    'px-4 py-2 rounded-lg text-xs font-black uppercase transition-all',
                    videoSource === 'link' ? 'bg-white dark:bg-surface-dark text-secondary shadow-md' : 'text-slate-500'
                  ]"
                >
                  Paste Link
                </button>
                <button 
                  type="button"
                  @click.prevent="videoSource = 'upload'"
                  :class="[
                    'px-4 py-2 rounded-lg text-xs font-black uppercase transition-all',
                    videoSource === 'upload' ? 'bg-white dark:bg-surface-dark text-secondary shadow-md' : 'text-slate-500'
                  ]"
                >
                  Upload Video
                </button>
                <button 
                  type="button"
                  @click.prevent="videoSource = 'none'; formData.youtube_video_id = ''"
                  :class="[
                    'px-4 py-2 rounded-lg text-xs font-black uppercase transition-all',
                    videoSource === 'none' ? 'bg-white dark:bg-surface-dark text-secondary shadow-md' : 'text-slate-500'
                  ]"
                >
                  No Video
                </button>
              </div>
              
              <!-- Info quando sem vídeo -->
              <div v-if="videoSource === 'none'" class="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                <p class="text-sm text-amber-400 flex items-center gap-2">
                  <span class="material-symbols-outlined text-sm">info</span>
                  This lesson will be created without a video. Content will only be available in the description and materials.
                </p>
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
                      :placeholder="'Paste YouTube video link (e.g., https://youtu.be/...)'"
                    />
                    <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">smart_display</span>
                  </div>
                  <button 
                    @click="fetchYouTubeMetadata"
                    type="button"
                    :disabled="fetchingMetadata || !formData.youtube_video_id"
                    class="px-6 bg-slate-900 text-white dark:bg-white dark:text-black rounded-xl font-black hover:scale-105 active:scale-95 transition-all text-sm flex items-center gap-2 disabled:opacity-50"
                  >
                    <span class="material-symbols-outlined text-sm" :class="{ 'animate-spin': fetchingMetadata }">{{ fetchingMetadata ? 'sync' : 'auto_fix' }}</span>
                    {{ fetchingMetadata ? 'Fetching...' : 'Auto-Fill Info' }}
                  </button>
                </div>
              </div>

              <!-- Option 2: Direct Upload -->
              <div v-else-if="videoSource === 'upload'" class="space-y-4">
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
                  
                  <!-- Success State -->
                  <div v-if="uploadState.status === 'success'" class="space-y-6 py-6">
                    <div class="flex flex-col items-center justify-center text-center space-y-4">
                      <div class="bg-green-500/10 p-6 rounded-full w-fit mx-auto shadow-inner shadow-green-500/20">
                        <span class="material-symbols-outlined text-6xl text-green-500 animate-in zoom-in duration-500">check_circle</span>
                      </div>
                      <div class="space-y-2">
                        <h3 class="text-xl font-black text-slate-900 dark:text-white">Upload Completed!</h3>
                        <p class="text-sm text-slate-600 dark:text-slate-400 font-medium max-w-xs mx-auto">
                          {{ uploadState.message }}
                        </p>
                      </div>
                      <button 
                        @click="resetUpload"
                        type="button"
                        class="text-secondary text-xs font-black uppercase tracking-widest hover:underline pt-2"
                      >
                        Upload another video
                      </button>
                    </div>
                  </div>

                  <!-- Idle State (Drop Zone) -->
                  <div v-else-if="!uploadState.isUploading" class="space-y-4">
                    <div class="bg-secondary/10 p-4 rounded-full w-fit mx-auto group-hover:scale-110 transition-transform">
                      <span class="material-symbols-outlined text-4xl text-secondary">cloud_upload</span>
                    </div>
                    <div>
                      <p class="text-slate-900 dark:text-white font-black">Drag and Drop Video</p>
                      <p class="text-slate-500 dark:text-gray-400 text-xs mt-1">MP4, MOV, or WEBM up to 2GB</p>
                    </div>
                  </div>

                  <!-- Uploading State -->
                  <div v-else class="space-y-6">
                    <div class="flex items-center justify-between text-sm font-black mb-2">
                       <span class="text-slate-900 dark:text-white uppercase tracking-wider">{{ uploadState.progress === 100 ? 'Finishing...' : 'Uploading...' }}</span>
                       <span class="text-secondary">{{ uploadState.progress }}%</span>
                    </div>
                    <div class="w-full h-3 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                      <div 
                        class="h-full bg-secondary transition-all duration-300 shadow-[0_0_15px_rgba(255,214,0,0.5)]"
                        :style="{ width: `${uploadState.progress}%` }"
                      ></div>
                    </div>
                    <p class="text-[10px] text-slate-500 font-bold uppercase">{{ uploadState.fileName }}</p>
                    
                    <!-- Error Message (Only show here if error) -->
                    <div v-if="uploadState.status === 'error'" class="mt-4 p-4 rounded-xl flex items-start gap-3 bg-red-500/10 border border-red-500/20">
                      <span class="material-symbols-outlined text-xl text-red-500">error</span>
                      <p class="text-sm font-bold flex-1 text-red-700 dark:text-red-400">
                        {{ uploadState.message }}
                      </p>
                    </div>
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
                  <p class="text-[10px] font-black uppercase text-secondary tracking-widest">Video Preview</p>
                  <p class="font-black text-lg line-clamp-1">{{ formData.title_pt || 'Video Title' }}</p>
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
                    <h4 class="text-sm font-black text-slate-900 dark:text-white">Allow Free Preview</h4>
                    <p class="text-[10px] text-slate-500 font-bold uppercase">Make this lesson available for free (without login/payment)</p>
                  </div>
               </div>
               <input 
                v-model="formData.is_preview" 
                type="checkbox" 
                class="w-6 h-6 rounded-lg text-secondary focus:ring-secondary bg-white dark:bg-black/40 border-slate-300 dark:border-white/10"
              />
            </div>

            <!-- Lesson Materials Section -->
            <div class="pt-8 border-t border-slate-100 dark:border-white/5 space-y-6">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span class="material-symbols-outlined text-primary">description</span>
                    Support Materials
                  </h3>
                  <p class="text-xs text-slate-500 mt-1">PDFs and downloadable files for students</p>
                </div>
                <button
                  type="button"
                  @click.prevent="showMaterialUpload = true"
                  class="px-4 py-2 bg-primary text-white dark:bg-secondary dark:text-black font-bold rounded-xl hover:opacity-90 transition-all text-sm flex items-center gap-2"
                >
                  <span class="material-symbols-outlined text-sm">add</span>
                  Add Material
                </button>
              </div>

              <!-- Materials List -->
              <div v-if="lessonMaterials.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  v-for="material in lessonMaterials"
                  :key="material.id"
                  class="bg-slate-50 dark:bg-black/20 p-4 rounded-xl border border-slate-200 dark:border-white/10 flex items-center justify-between group hover:border-primary/30 transition-all"
                >
                  <div class="flex items-center gap-3 min-w-0">
                    <div class="bg-red-500/10 p-2 rounded-lg shrink-0">
                      <span class="material-symbols-outlined text-red-500 text-xl">picture_as_pdf</span>
                    </div>
                    <div class="min-w-0">
                      <p class="text-sm font-bold text-slate-900 dark:text-white truncate">{{ getMaterialTitle(material) }}</p>
                      <p class="text-[10px] text-slate-500 font-medium">{{ formatFileSize(material.file_size_bytes) }}</p>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <button
                      @click="downloadMaterial(material)"
                      type="button"
                      class="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                      :title="'Download'"
                    >
                      <span class="material-symbols-outlined text-sm">download</span>
                    </button>
                  </div>
                </div>
              </div>
              <div v-else class="text-center py-8 bg-slate-50 dark:bg-black/20 rounded-xl border border-dashed border-slate-200 dark:border-white/10">
                <span class="material-symbols-outlined text-slate-300 dark:text-gray-700 text-4xl mb-2">folder_open</span>
                <p class="text-sm text-slate-500 font-medium">No materials added yet.</p>
              </div>
            </div>
          </div>



        </div>
      </div>
    </div>
  </div>

  <!-- Material Upload Modal -->
  <div
    v-if="showMaterialUpload"
    class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    @click.self="showMaterialUpload = false"
  >
    <div class="bg-white dark:bg-surface-dark rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 dark:border-white/10">
      <div class="px-6 py-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
        <h3 class="text-xl font-black text-slate-900 dark:text-white">Add Material</h3>
        <button
          @click="showMaterialUpload = false"
          class="text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>

      <form @submit.prevent="handleMaterialUpload" class="p-6 space-y-4">
        <div>
          <label class="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2">PDF File</label>
          <input
            type="file"
            accept=".pdf"
            @change="handleMaterialFileSelect"
            required
            class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black/40 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
          />
          <p class="text-xs text-slate-500 dark:text-gray-400 mt-2">Maximum file size: 10MB</p>
        </div>

        <div>
          <label class="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2">Título (PT) *</label>
          <input
            v-model="materialFormData.title_pt"
            type="text"
            required
            class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black/40 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all"
            :placeholder="t('professor.manage.contentEditor.titlePlaceholder')"
          />
        </div>

        <div>
          <label class="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2">Title (EN) *</label>
          <input
            v-model="materialFormData.title_en"
            type="text"
            required
            class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black/40 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all"
            :placeholder="t('professor.manage.contentEditor.titleEnPlaceholder')"
          />
        </div>

        <div class="flex items-center justify-end gap-4 pt-4 border-t border-slate-200 dark:border-white/10">
          <button
            type="button"
            @click="showMaterialUpload = false"
            class="px-6 py-3 bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="uploadingMaterial || !materialFile"
            class="px-6 py-3 bg-primary text-white dark:bg-secondary dark:text-black font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ uploadingMaterial ? 'Saving...' : 'Upload Material' }}
          </button>
        </div>
      </form>
    </div>
  </div>


</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { extractYouTubeVideoId, getYouTubeThumbnail } from '@/lib/youtube'
import { useModulesStore } from '@/stores/modules'
import { useLocale } from '@/composables/useLocale'
import { toast } from 'vue-sonner'

const props = defineProps<{
  selectedItem: any | null
  mode: 'module' | 'lesson'
  isCreating: boolean
  programName: string
  loading: boolean
}>()

const emit = defineEmits(['save', 'cancel', 'delete'])

const modulesStore = useModulesStore()
const { t } = useLocale()
const { locale: currentLocale } = useLocale()
const fetchingMetadata = ref(false)
const videoSource = ref<'link' | 'upload' | 'none'>('link')
const isDragging = ref(false)
const uploadState = ref<{
  isUploading: boolean
  progress: number
  fileName: string
  status?: 'success' | 'error'
  message?: string
}>({
  isUploading: false,
  progress: 0,
  fileName: '',
  status: undefined,
  message: undefined
})

// Material management
const showMaterialUpload = ref(false)
const uploadingMaterial = ref(false)
const materialFile = ref<File | null>(null)
const materialFormData = ref({
  title_pt: '',
  title_en: ''
})

const lessonMaterials = computed(() => {
  if (props.mode === 'lesson' && props.selectedItem?.id) {
    return modulesStore.getMaterialsByLesson(props.selectedItem.id)
  }
  return []
})

const formData = ref<any>({
  title_pt: '',
  title_en: '',
  description_pt: '',
  description_en: '',
  youtube_video_id: '',
  duration_seconds: null,
  youtube_thumbnail_url: null,
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
      youtube_thumbnail_url: newItem.youtube_thumbnail_url || null,
      is_preview: newItem.is_preview || false
    }
  } else if (props.isCreating) {
    resetForm()
  }
}, { immediate: true })

// Debug: watch uploadState changes
watch(() => uploadState.value, (newVal, oldVal) => {
  console.log('uploadState changed:', { old: oldVal, new: newVal })
}, { deep: true })

function resetForm() {
  videoSource.value = 'link'
  formData.value = {
    title_pt: '',
    title_en: '',
    description_pt: '',
    description_en: '',
    youtube_video_id: '',
    duration_seconds: null,
    youtube_thumbnail_url: null,
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
      // Prioritize manually entered titles, only fill if empty or if we want to sync
      if (!formData.value.title_pt) formData.value.title_pt = details.title
      if (!formData.value.title_en) formData.value.title_en = details.title
      
      // Also sync descriptions if they are empty
      if (!formData.value.description_pt && details.description) formData.value.description_pt = details.description
      if (!formData.value.description_en && details.description) formData.value.description_en = details.description
      
      formData.value.duration_seconds = details.duration_seconds
      formData.value.youtube_thumbnail_url = details.thumbnail_url
      
      console.log('Metadata synced from n8n:', details)
      
      toast.success('Metadata synced!')
    }
  } catch (err) {
    console.error('Error fetching youtube metadata:', err)
    toast.error('Error fetching video metadata')
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

function resetUpload() {
  uploadState.value = {
    isUploading: false,
    progress: 0,
    fileName: '',
    status: undefined,
    message: undefined
  }
}

async function startYouTubeUpload(file: File) {
  uploadState.value = {
    isUploading: true,
    progress: 0,
    fileName: file.name
  }

  try {
    const { uploadVideoToYouTubeWithProgress } = await import('@/lib/n8n')
    const { useAuthStore } = await import('@/stores/auth')
    const authStore = useAuthStore()

    if (!authStore.user?.id) {
      throw new Error('User not authenticated')
    }

    if (!props.selectedItem?.id) {
      throw new Error('Lesson ID not available')
    }

    const programId = props.selectedItem.program_id
    if (!programId) {
      throw new Error('Program ID not available')
    }

    // Reset duration while uploading
    formData.value.duration_seconds = null

    // Upload to n8n webhook (asynchronous - n8n will send notification when complete)
    const response = await uploadVideoToYouTubeWithProgress(
      {
        videoFile: file,
        title_pt: formData.value.title_pt || file.name.split('.')[0],
        title_en: formData.value.title_en || file.name.split('.')[0],
        description_pt: formData.value.description_pt || '',
        description_en: formData.value.description_en || '',
        professor_id: authStore.user.id,
        lesson_id: props.selectedItem.id,
        program_id: programId,
        privacy_status: 'unlisted'
      },
      (progress) => {
        uploadState.value.progress = progress
        if (progress === 100) {
          toast.info('Finishing...')
        }
      }
    )

    if (response.success) {
      uploadState.value.status = 'success'
      uploadState.value.message = 'Upload successful!'
      uploadState.value.progress = 100
      
      console.log('Upload success state:', uploadState.value)
    } else {
      throw new Error(response.message || 'Upload failed')
    }

  } catch (err: any) {
    console.error('Upload error:', err)
    uploadState.value.status = 'error'
    uploadState.value.message = 'Upload error'
    uploadState.value.isUploading = false
    toast.error('Upload failed: ' + (err.message || 'Unknown error'))
  }
}


function formatDuration(seconds: number | null) {
  if (seconds === null || seconds === undefined) {
    return 'Processing...'
  }
  const hours = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  if (hours > 0) return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function handleSubmit() {
  const dataToSave = { ...formData.value }
  
  // Limpar campos que pertencem apenas a aulas antes de salvar um módulo
  if (props.mode === 'module') {
    delete dataToSave.youtube_video_id
    delete dataToSave.duration_seconds
    delete dataToSave.youtube_thumbnail_url
    delete dataToSave.is_preview
  }
  
  // Se não houver vídeo, garantir que youtube_video_id seja null
  if (props.mode === 'lesson' && (!dataToSave.youtube_video_id || dataToSave.youtube_video_id.trim() === '')) {
    dataToSave.youtube_video_id = null
    dataToSave.youtube_thumbnail_url = null
    dataToSave.duration_seconds = null
  }
  
  emit('save', dataToSave)
}

// Material management functions
const getMaterialTitle = (material: any) => {
  return currentLocale.value === 'pt-BR' ? material.title_pt : material.title_en
}

function formatFileSize(bytes: number | null) {
  if (!bytes) return 'N/A'
  const mb = bytes / (1024 * 1024)
  return `${mb.toFixed(2)} MB`
}

async function downloadMaterial(material: any) {
  try {
    const url = await modulesStore.getMaterialDownloadUrl(material.file_path)
    if (url) {
      window.open(url, '_blank')
    }
  } catch (error) {
    console.error('Error downloading material:', error)
  }
}



function handleMaterialFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    materialFile.value = target.files[0]
  }
}

async function handleMaterialUpload() {
  if (!materialFile.value || !props.selectedItem?.id) return

  uploadingMaterial.value = true
  try {
    const programId = props.selectedItem.program_id
    const lessonId = props.selectedItem.id
    const moduleId = props.selectedItem.module_id

    await modulesStore.uploadMaterial(
      materialFile.value,
      programId,
      lessonId,
      moduleId,
      {
        ...materialFormData.value,
        order_index: lessonMaterials.value.length
      }
    )

    // Reset form
    showMaterialUpload.value = false
    materialFile.value = null
    materialFormData.value = { title_pt: '', title_en: '' }
  } catch (error: any) {
    console.error('Error uploading material:', error)
  } finally {
    uploadingMaterial.value = false
  }
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
