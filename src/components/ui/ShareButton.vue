<template>
  <div class="relative inline-block" ref="containerRef">
    <button
      ref="buttonRef"
      @click="toggleDropdown"
      class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white transition-all duration-300 group backdrop-blur-sm shadow-lg"
      :class="variant === 'icon' ? 'p-3' : ''"
    >
      <span class="material-symbols-outlined text-xl">{{ icon }}</span>
      <span v-if="variant !== 'icon'" class="font-bold text-sm">{{ t('share.shareButton') }}</span>
    </button>

    <!-- Dropdown with Teleport to escape overflow hidden -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition ease-out duration-200"
        enter-from-class="transform opacity-0 scale-95"
        enter-to-class="transform opacity-100 scale-100"
        leave-active-class="transition ease-in duration-150"
        leave-from-class="transform opacity-100 scale-100"
        leave-to-class="transform opacity-0 scale-95"
      >
        <div
          v-if="isOpen"
          :style="dropdownStyle"
          class="fixed w-64 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-white/15 shadow-2xl shadow-black/50 overflow-hidden z-[9999]"
          @click.stop
        >
          <div class="py-2">
            <!-- Header -->
            <div class="px-4 py-3 border-b border-white/10 bg-white/5">
              <span class="text-xs font-black uppercase tracking-widest text-white/50">{{ t('share.shareButton') }}</span>
            </div>

            <!-- WhatsApp -->
            <button
              @click="handleWhatsApp"
              class="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-white/10 transition-colors group"
            >
              <div class="w-10 h-10 rounded-xl bg-[#25D366]/20 flex items-center justify-center group-hover:bg-[#25D366]/30 transition-colors border border-[#25D366]/20">
                <svg class="w-5 h-5 text-[#25D366]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
              </div>
              <span class="font-bold text-white">WhatsApp</span>
            </button>

            <!-- Instagram -->
            <button
              @click="handleInstagram"
              class="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-white/10 transition-colors group"
            >
              <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center group-hover:from-purple-500/30 group-hover:to-pink-500/30 transition-all border border-pink-500/20">
                <svg class="w-5 h-5 text-pink-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
              </div>
              <span class="font-bold text-white">Instagram</span>
            </button>

            <!-- Divider -->
            <div class="h-px bg-white/10 mx-4 my-1"></div>

            <!-- Copy Link -->
            <button
              @click="handleCopyLink"
              class="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-white/10 transition-colors group"
            >
              <div class="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors border border-white/10">
                <span class="material-symbols-outlined text-white text-xl">link</span>
              </div>
              <span class="font-bold text-white">{{ t('share.copyLink') }}</span>
            </button>

            <!-- Native Share (Mobile) -->
            <button
              v-if="canUseNativeShare()"
              @click="handleNativeShare"
              class="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-white/10 transition-colors group"
            >
              <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors border border-primary/20">
                <span class="material-symbols-outlined text-primary text-xl">ios_share</span>
              </div>
              <span class="font-bold text-white">{{ t('share.moreOptions') }}</span>
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Click outside to close -->
    <div
      v-if="isOpen"
      @click="closeDropdown"
      class="fixed inset-0 z-[9998]"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, computed } from 'vue'
import { useShare, type ShareOptions } from '@/composables/useShare'
import { useI18n } from 'vue-i18n'

interface Props {
  options: ShareOptions
  icon?: string
  variant?: 'default' | 'icon'
}

const props = withDefaults(defineProps<Props>(), {
  icon: 'share',
  variant: 'default'
})

const { t } = useI18n()
const { shareToWhatsApp, shareToInstagram, copyToClipboard, shareNative, canUseNativeShare } = useShare()

const isOpen = ref(false)
const buttonRef = ref<HTMLButtonElement | null>(null)
const dropdownPosition = ref({ top: 0, left: 0 })

// Calculate dropdown style based on position
const dropdownStyle = computed(() => ({
  top: `${dropdownPosition.value.top}px`,
  left: `${dropdownPosition.value.left}px`
}))

const updatePosition = () => {
  if (!buttonRef.value) return

  const rect = buttonRef.value.getBoundingClientRect()
  const dropdownWidth = 256 // w-64 = 16rem = 256px
  const spacing = 8

  // Position below the button, aligned to right edge
  dropdownPosition.value = {
    top: rect.bottom + window.scrollY + spacing,
    left: rect.right + window.scrollX - dropdownWidth
  }
}

const toggleDropdown = async () => {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    await nextTick()
    updatePosition()
  }
}

const closeDropdown = () => {
  isOpen.value = false
}

// Update position on scroll/resize if open
const handleScrollOrResize = () => {
  if (isOpen.value) {
    updatePosition()
  }
}

const handleWhatsApp = () => {
  shareToWhatsApp(props.options)
  closeDropdown()
}

const handleInstagram = () => {
  shareToInstagram(props.options)
  closeDropdown()
}

const handleCopyLink = () => {
  copyToClipboard(props.options)
  closeDropdown()
}

const handleNativeShare = () => {
  shareNative(props.options)
  closeDropdown()
}

// Close on Escape key
const handleEscape = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    closeDropdown()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleEscape)
  window.addEventListener('resize', handleScrollOrResize)
  window.addEventListener('scroll', handleScrollOrResize, true)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape)
  window.removeEventListener('resize', handleScrollOrResize)
  window.removeEventListener('scroll', handleScrollOrResize, true)
})
</script>
