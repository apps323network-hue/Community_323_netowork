<template>
  <AppLayout :hideSidebars="true">
    <!-- Loading State -->
    <div v-if="userStore.loading && !userStore.profile" class="flex items-center justify-center min-h-[60vh]">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary"></div>
    </div>

    <template v-else>
      <!-- Background Neon Effects -->
      <div class="fixed top-20 left-10 w-64 h-64 bg-secondary rounded-full filter blur-[120px] opacity-10 pointer-events-none z-0"></div>
      <div class="fixed bottom-20 right-10 w-64 h-64 bg-primary rounded-full filter blur-[120px] opacity-10 pointer-events-none z-0"></div>

      <!-- Status Message Toast (Simple implementation) -->
      <Transition name="fade">
        <div v-if="statusMessage" 
             :class="[
               'fixed top-5 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-xl shadow-2xl backdrop-blur-md border font-bold flex items-center gap-2',
               statusType === 'success' ? 'bg-secondary/20 border-secondary text-secondary' : 'bg-red-500/20 border-red-500 text-red-400'
             ]">
          <span class="material-symbols-outlined">{{ statusType === 'success' ? 'check_circle' : 'error' }}</span>
          {{ statusMessage }}
        </div>
      </Transition>

      <!-- Page Header -->
      <div class="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
        <div>
          <h1 class="text-3xl font-bold text-white tracking-tight">{{ t('profile.previewTitle') }}</h1>
          <p class="text-text-muted mt-1">{{ t('profile.previewSubtitle') }}</p>
        </div>
        <div class="flex gap-3">
          <button 
            @click="isPreviewMode = !isPreviewMode"
            class="px-5 py-2.5 rounded-full border border-input-border text-white font-semibold text-sm hover:border-secondary hover:text-secondary hover:shadow-[0_0_10px_rgba(0,240,255,0.2)] transition-all"
          >
            {{ isPreviewMode ? t('profile.backToEdit') : t('profile.viewAsPublic') }}
          </button>
          <button
            v-if="!isPreviewMode"
            @click="handleSave"
            :disabled="saving || !hasChanges"
            :class="[
              'px-6 py-2.5 rounded-full font-bold text-sm transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none',
              hasChanges 
                ? 'bg-gradient-to-r from-secondary to-primary text-white shadow-[0_0_15px_rgba(0,240,255,0.4)] hover:shadow-[0_0_20px_rgba(255,0,153,0.5)]'
                : 'bg-input-bg border border-input-border text-text-muted hover:text-white'
            ]"
          >
            {{ saving ? t('profile.saving') : t('profile.saveChanges') }}
          </button>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        <!-- Left Sidebar - Profile Card & Social Links -->
        <div class="lg:col-span-4 xl:col-span-3 space-y-6">
          <ProfileCard
            :name="editableProfile.nome || ''"
            :profession="editableProfile.area_atuacao || ''"
            :avatarUrl="editableProfile.avatar_url"
            :verified="editableProfile.badge === 'Verified' || editableProfile.plano === 'Premium'"
            :memberSince="formatMemberSince(editableProfile.created_at)"
            :city="editableProfile.cidade"
            :state="editableProfile.pais === 'USA' ? 'FL' : editableProfile.pais" 
            :country="editableProfile.pais || 'USA'"
            :views="1200"
            :connections="connectionsCount"
            :points="editableProfile.total_points || 0"
            :readonly="isPreviewMode"
            @edit-avatar="handleEditAvatar"
          />

          <ProfileSocialLinks
            v-model:linkedin="editableProfile.linkedin"
            v-model:instagram="editableProfile.instagram"
            :readonly="isPreviewMode"
          />
        </div>

        <!-- Right Content - Forms -->
        <div class="lg:col-span-8 xl:col-span-9 space-y-6">
          <ProfileInfoForm
            v-model:name="editableProfile.nome"
            v-model:profession="editableProfile.area_atuacao"
            v-model:country="editableProfile.pais"
            v-model:city="editableProfile.cidade"
            v-model:state="editableProfile.estado"
            v-model:nationality="editableProfile.nacionalidade"
            v-model:email="editableProfile.email"
            v-model:whatsapp="editableProfile.whatsapp"
            v-model:bio="editableProfile.bio"
            :readonly="isPreviewMode"
          />

          <!-- Achievements Section -->
          <div class="bg-surface-dark border border-input-border rounded-2xl p-6">
            <h3 class="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <span class="material-symbols-outlined text-secondary">stars</span>
              Conquistas e Desafios
            </h3>
            
            <div v-if="gamificationStore.userChallenges.length === 0" class="text-center py-6 border border-dashed border-input-border rounded-xl">
              <p class="text-text-muted text-sm">Nenhum desafio completado ainda. Comece a interagir para ganhar pontos!</p>
            </div>
            
            <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              <div 
                v-for="uc in gamificationStore.userChallenges.filter(u => u.completado)" 
                :key="uc.id"
                class="flex flex-col items-center text-center p-3 rounded-xl bg-white/5 border border-white/5 hover:border-secondary/30 transition-all group"
              >
                <div class="p-3 bg-secondary/10 rounded-full mb-2 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(0,240,255,0.1)]">
                  <span class="material-symbols-outlined text-secondary">{{ getIconForType(uc.challenge?.tipo || 'other') }}</span>
                </div>
                <p class="text-[10px] font-black text-white uppercase tracking-tighter line-clamp-1">{{ uc.challenge?.nome }}</p>
                <p class="text-[10px] text-secondary font-bold">{{ uc.challenge?.pontos }} PTS</p>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ProfileInterests
              :tags="editableProfile.tags || []"
              @add-tag="handleAddTag"
              @remove-tag="handleRemoveTag"
              :readonly="isPreviewMode"
            />

            <ProfileGoals
              :goals="editableProfile.goals || []"
              @add-goal="handleAddGoal"
              @remove-goal="handleRemoveGoal"
              :readonly="isPreviewMode"
            />
          </div>

          <ProfileSettings
            v-if="!isPreviewMode"
            :isPublic="editableProfile.is_public"
            :showWhatsapp="editableProfile.show_whatsapp"
            :showEmail="editableProfile.show_email"
            @toggle-public="editableProfile.is_public = !editableProfile.is_public"
            @toggle-whatsapp="editableProfile.show_whatsapp = !editableProfile.show_whatsapp"
            @toggle-email="editableProfile.show_email = !editableProfile.show_email"
          />

          <!-- Mobile Sticky Footer -->
          <div v-if="!isPreviewMode" class="md:hidden sticky bottom-4 z-40 bg-surface-dark/90 backdrop-blur border border-[#492249] p-4 rounded-xl shadow-2xl flex gap-3">
            <button class="flex-1 py-3 rounded-full border border-input-border text-white font-bold text-sm">
              {{ t('common.cancel') }}
            </button>
            <button
              @click="handleSave"
              :disabled="saving || !hasChanges"
              :class="[
                'flex-1 py-3 rounded-full font-bold text-sm transition-all shadow-[0_0_15px_rgba(255,0,153,0.4)] disabled:opacity-50',
                 hasChanges 
                  ? 'bg-gradient-to-r from-secondary to-primary text-white animate-pulse'
                  : 'bg-input-bg border border-input-border text-text-muted hover:text-white'
              ]"
            >
              {{ saving ? t('profile.saving') : t('common.save') }}
            </button>
          </div>
        </div>
      </div>
    </template>
  </AppLayout>

  <!-- Modal/Overlay for Avatar URL (Replacing prompt) -->
  <Transition name="fade">
    <div v-if="showAvatarModal" class="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div class="bg-surface-dark border border-input-border p-8 rounded-2xl w-full max-w-md shadow-2xl">
        <h3 class="text-xl font-bold text-white mb-4">{{ t('profile.editAvatar') }}</h3>
        
        <div class="mb-6">
          <!-- Upload Area -->
          <div 
            v-if="!tempAvatarUrl"
            @click="triggerFileInput"
            class="flex flex-col items-center justify-center p-6 border-2 border-dashed border-input-border rounded-xl hover:border-secondary/50 hover:bg-white/5 transition-all cursor-pointer group"
          >
            <input 
              type="file" 
              ref="fileInput" 
              class="hidden" 
              accept="image/png, image/jpeg, image/gif"
              @change="handleFileUpload"
            />
            <div v-if="isUploading" class="flex flex-col items-center">
              <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-secondary mb-2"></div>
              <p class="text-sm text-text-muted">{{ t('profile.uploading') }}</p>
            </div>
            <template v-else>
              <span class="material-symbols-outlined text-4xl text-text-muted group-hover:text-secondary mb-2 transition-colors">cloud_upload</span>
              <p class="text-sm text-text-muted group-hover:text-white transition-colors">{{ t('profile.clickToUpload') }}</p>
              <p class="text-xs text-text-muted/50 mt-1">{{ t('profile.formatHint') }}</p>
            </template>
          </div>

          <!-- Preview & Action Area -->
          <div v-else class="flex flex-col items-center">
            <div class="relative group">
              <img 
                :src="tempAvatarUrl" 
                alt="Avatar Preview" 
                class="size-32 rounded-full object-cover border-4 border-surface-dark shadow-[0_0_20px_rgba(0,240,255,0.3)] mb-4"
              />
              <button 
                @click="removeTempAvatar"
                class="absolute top-0 right-0 bg-red-500/80 hover:bg-red-500 text-white w-8 h-8 flex items-center justify-center rounded-full backdrop-blur-sm transition-colors shadow-lg"
                title="Remover imagem"
              >
                <span class="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>
            <p class="text-sm text-center text-text-muted mb-4 max-w-[250px] truncate">
              {{ t('profile.newImagePreview') }}
            </p>
          </div>
        </div>

        <div v-if="!tempAvatarUrl" class="relative flex items-center gap-2 mb-6">
          <div class="h-px bg-input-border flex-1"></div>
          <span class="text-xs text-text-muted uppercase font-medium">{{ t('profile.orViaUrl') }}</span>
          <div class="h-px bg-input-border flex-1"></div>
        </div>

        <input 
          v-if="!tempAvatarUrl"
          v-model="tempAvatarUrl" 
          :placeholder="t('profile.urlPlaceholder')"
          class="w-full bg-input-bg border-input-border focus:border-secondary focus:ring-0 text-white px-4 py-3 rounded-xl mb-6 transition-all"
        />

        <div class="flex gap-4">
          <button @click="showAvatarModal = false" class="flex-1 py-3 rounded-xl border border-input-border text-white font-bold hover:bg-white/5 transition-colors">{{ t('common.cancel') }}</button>
          <button 
            @click="confirmAvatar" 
            :disabled="!tempAvatarUrl"
            class="flex-1 py-3 rounded-xl bg-gradient-to-r from-secondary to-primary text-white font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ t('common.confirm') }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/stores/user'
import { useAuthStore } from '@/stores/auth'
import AppLayout from '@/components/layout/AppLayout.vue'
import ProfileCard from '@/components/features/profile/ProfileCard.vue'
import ProfileSocialLinks from '@/components/features/profile/ProfileSocialLinks.vue'
import ProfileInfoForm from '@/components/features/profile/ProfileInfoForm.vue'
import ProfileInterests from '@/components/features/profile/ProfileInterests.vue'
import ProfileGoals from '@/components/features/profile/ProfileGoals.vue'
import ProfileSettings from '@/components/features/profile/ProfileSettings.vue'
import { useGamificationStore } from '@/stores/gamification'
import { useConnections } from '@/composables/useConnections'
import { supabase } from '@/lib/supabase'

const userStore = useUserStore()
const authStore = useAuthStore()
const gamificationStore = useGamificationStore()
const { t } = useI18n()

const saving = ref(false)
const statusMessage = ref('')
const statusType = ref<'success' | 'error'>('success')
const isPreviewMode = ref(false)
const hasChanges = ref(false)

// Avatar Modal
const showAvatarModal = ref(false)
const tempAvatarUrl = ref('')
const fileInput = ref<HTMLInputElement | null>(null)
const isUploading = ref(false)

// Connections
const connectionsCount = ref(0)
const { fetchConnectionsCount } = useConnections()

// Editable profile state
const editableProfile = reactive<any>({
  nome: '',
  area_atuacao: '',
  bio: '',
  cidade: '',
  pais: 'USA',
  linkedin: '',
  instagram: '',
  tags: [],
  goals: [],
  is_public: true,
  job_notifications: false,
  show_whatsapp: false,
  show_email: false,
  nacionalidade: '',
  estado: '',
  avatar_url: ''
})

// Store a copy of original data for comparison
const originalData = ref<string>('')

function showStatus(msg: string, type: 'success' | 'error' = 'success') {
  statusMessage.value = msg
  statusType.value = type
  setTimeout(() => {
    statusMessage.value = ''
  }, 3000)
}

// Initialize editable state from store
function initEditableState() {
  if (userStore.profile) {
    const data = {
      ...userStore.profile,
      tags: userStore.profile.tags || [],
      goals: userStore.profile.goals || [],
      // Ensure booleans are initialized
      is_public: userStore.profile.is_public ?? true,
      job_notifications: userStore.profile.job_notifications ?? false,
      show_whatsapp: userStore.profile.show_whatsapp ?? false,
      show_email: userStore.profile.show_email ?? false,
      nacionalidade: userStore.profile.nacionalidade || '',
      estado: userStore.profile.estado || '',
      email: userStore.profile.email || '',
      whatsapp: userStore.profile.whatsapp || ''
    }
    
    // Update editable profile
    Object.assign(editableProfile, data)
    
    // Save stringified version for easy comparison
    originalData.value = JSON.stringify(editableProfile)
    hasChanges.value = false
  }
}

// Check for changes deeply
function checkForChanges() {
  const currentData = JSON.stringify(editableProfile)
  hasChanges.value = currentData !== originalData.value
}

onMounted(async () => {
  if (authStore.user) {
    if (!userStore.profile) {
      await userStore.fetchProfile(authStore.user.id)
    }
    initEditableState()
    
    // Fetch connections
    connectionsCount.value = await fetchConnectionsCount(authStore.user.id)
    
    // Fetch gamification data
    await gamificationStore.fetchUserChallenges()
  }
})

// Watch for store changes to re-init
watch(() => userStore.profile, () => {
  // Only re-init if we haven't started editing (or if it's the first load)
  if (!hasChanges.value) {
    initEditableState()
  }
}, { deep: true })

// Watch for editable changes to toggle save button state
watch(editableProfile, () => {
  checkForChanges()
}, { deep: true })

// Helper functions
function formatMemberSince(dateString?: string): string {
  if (!dateString) return new Date().getFullYear().toString()
  return new Date(dateString).getFullYear().toString()
}

// Event handlers
async function handleSave() {
  saving.value = true
  try {
    const updates = {
      ...editableProfile,
      updated_at: new Date().toISOString()
    }
    await userStore.updateProfile(updates)
    
    // Update original data reference after successful save
    originalData.value = JSON.stringify(editableProfile)
    hasChanges.value = false
    
    showStatus(t('profile.profileUpdated'))
  } catch (error) {
    console.error('Error saving profile:', error)
    showStatus(t('profile.saveError'), 'error')
  } finally {
    saving.value = false
  }
}

function handleEditAvatar() {
  tempAvatarUrl.value = editableProfile.avatar_url || ''
  showAvatarModal.value = true
}

function triggerFileInput() {
  fileInput.value?.click()
}

async function handleFileUpload(event: Event) {
  const input = event.target as HTMLInputElement
  if (!input.files || input.files.length === 0) return

  const file = input.files[0]
  const fileExt = file.name.split('.').pop()
  const fileName = `${authStore.user?.id}/${Date.now()}.${fileExt}`
  const filePath = `${fileName}`

  // Validate size (max 2MB)
  if (file.size > 2 * 1024 * 1024) {
    showStatus(t('profile.maxSizeError'), 'error')
    return
  }

  isUploading.value = true

  try {
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file)

    if (uploadError) throw uploadError

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath)

    tempAvatarUrl.value = publicUrl
    showStatus(t('profile.imageUploaded'), 'success')
  } catch (error: any) {
    console.error('Error uploading avatar:', error.message)
    showStatus(t('profile.uploadError'), 'error')
  } finally {
    isUploading.value = false
  }
}



function removeTempAvatar() {
  tempAvatarUrl.value = ''
}

function confirmAvatar() {
  editableProfile.avatar_url = tempAvatarUrl.value
  showAvatarModal.value = false
}

function handleAddTag(tag: string) {
  if (!editableProfile.tags) editableProfile.tags = []
  if (!editableProfile.tags.includes(tag)) {
    editableProfile.tags.push(tag)
  }
}

function handleRemoveTag(index: number) {
  editableProfile.tags.splice(index, 1)
}

function handleAddGoal(goal: string) {
  if (!editableProfile.goals) editableProfile.goals = []
  editableProfile.goals.push(goal)
}

function handleRemoveGoal(index: number) {
  editableProfile.goals.splice(index, 1)
}

function getIconForType(type: string) {
  const icons: Record<string, string> = {
    post: 'article',
    comment: 'chat_bubble',
    event: 'event_available',
    connection: 'person_add',
    engagement: 'thumb_up',
    other: 'extension'
  }
  return icons[type] || 'emoji_events'
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
