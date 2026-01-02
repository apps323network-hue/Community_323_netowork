<template>
  <Teleport to="body">
    <Transition name="lightbox">
      <div
        v-if="isOpen && imageUrl"
        class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-sm"
        @click.self="close"
      >
        <!-- Close Button -->
        <button
          @click="close"
          class="absolute top-4 right-4 z-10 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all backdrop-blur-md"
          aria-label="Fechar"
        >
          <span class="material-symbols-outlined text-2xl">close</span>
        </button>

        <!-- Image Container -->
        <div class="relative max-w-[95vw] max-h-[95vh] w-full h-full flex items-center justify-center p-4">
          <img
            :src="imageUrl"
            :alt="alt || 'Imagem ampliada'"
            class="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            @click.stop
          />
        </div>

        <!-- Loading Indicator -->
        <div
          v-if="loading"
          class="absolute inset-0 flex items-center justify-center"
        >
          <div class="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'

interface Props {
  modelValue: boolean
  imageUrl?: string | null
  alt?: string
}

const props = withDefaults(defineProps<Props>(), {
  imageUrl: null,
  alt: '',
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const isOpen = ref(false)
const loading = ref(true)

watch(() => props.modelValue, (newValue) => {
  isOpen.value = newValue
  if (newValue && props.imageUrl) {
    loading.value = true
    // Simular carregamento da imagem
    const img = new Image()
    img.onload = () => {
      loading.value = false
    }
    img.onerror = () => {
      loading.value = false
    }
    img.src = props.imageUrl
  }
}, { immediate: true })

watch(() => props.imageUrl, () => {
  if (props.imageUrl && isOpen.value) {
    loading.value = true
    const img = new Image()
    img.onload = () => {
      loading.value = false
    }
    img.onerror = () => {
      loading.value = false
    }
    img.src = props.imageUrl
  }
})

function close() {
  emit('update:modelValue', false)
}

function handleEscape(e: KeyboardEvent) {
  if (e.key === 'Escape' && isOpen.value) {
    close()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleEscape)
  // Prevenir scroll do body quando o lightbox está aberto
  if (isOpen.value) {
    document.body.style.overflow = 'hidden'
  }
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape)
  document.body.style.overflow = ''
})

watch(isOpen, (newValue) => {
  if (newValue) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})
</script>

<style scoped>
.lightbox-enter-active,
.lightbox-leave-active {
  transition: opacity 0.3s ease;
}

.lightbox-enter-from,
.lightbox-leave-to {
  opacity: 0;
}

.lightbox-enter-active img,
.lightbox-leave-active img {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.lightbox-enter-from img,
.lightbox-leave-to img {
  transform: scale(0.9);
  opacity: 0;
}
</style>


