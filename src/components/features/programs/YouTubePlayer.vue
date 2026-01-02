<template>
  <div class="relative w-full h-full bg-black">
    <!-- YouTube IFrame -->
    <div ref="playerContainer" class="w-full h-full"></div>

    <!-- Loading Overlay -->
    <div v-if="loading" class="absolute inset-0 flex items-center justify-center bg-black/80">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-4 border-secondary border-t-transparent mx-auto mb-4"></div>
        <p class="text-white text-sm">Carregando vídeo...</p>
      </div>
    </div>

    <!-- Error Overlay -->
    <div v-if="error" class="absolute inset-0 flex items-center justify-center bg-black">
      <div class="text-center max-w-md px-6">
        <div class="bg-red-500/10 p-8 rounded-full w-fit mx-auto mb-6">
          <span class="material-symbols-outlined text-6xl text-red-500">error</span>
        </div>
        <h3 class="text-xl font-bold text-white mb-2">Erro ao carregar vídeo</h3>
        <p class="text-white/70 text-sm mb-6">{{ error }}</p>
        <button
          @click="retryLoad"
          class="px-6 py-3 bg-secondary text-black font-bold rounded-xl hover:bg-secondary/90 transition-all"
        >
          Tentar Novamente
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'

const props = defineProps<{
  videoId: string
  title?: string
  autoplay?: boolean
}>()

const emit = defineEmits<{
  ready: []
  playing: []
  paused: []
  ended: []
  error: [error: string]
}>()

const playerContainer = ref<HTMLDivElement | null>(null)
const player = ref<any>(null)
const loading = ref(true)
const error = ref('')

let playerReady = false

function loadYouTubeAPI() {
  return new Promise((resolve) => {
    // Check if API is already loaded
    if (window.YT && window.YT.Player) {
      resolve(window.YT)
      return
    }

    // Create script tag
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    const firstScriptTag = document.getElementsByTagName('script')[0]
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)

    // YouTube API calls this when ready
    window.onYouTubeIframeAPIReady = () => {
      resolve(window.YT)
    }
  })
}

async function initPlayer() {
  loading.value = true
  error.value = ''

  try {
    await loadYouTubeAPI()

    if (!playerContainer.value) {
      throw new Error('Player container not found')
    }

    // Create player
    player.value = new window.YT.Player(playerContainer.value, {
      videoId: props.videoId,
      width: '100%',
      height: '100%',
      playerVars: {
        autoplay: props.autoplay ? 1 : 0,
        controls: 1,
        modestbranding: 1,
        rel: 0,
        fs: 1,
        playsinline: 1
      },
      events: {
        onReady: onPlayerReady,
        onStateChange: onPlayerStateChange,
        onError: onPlayerError
      }
    })
  } catch (err: any) {
    error.value = err.message || 'Erro desconhecido ao carregar player'
    loading.value = false
    emit('error', error.value)
  }
}

function onPlayerReady() {
  playerReady = true
  loading.value = false
  emit('ready')
}

function onPlayerStateChange(event: any) {
  const state = event.data
  
  // YT.PlayerState.PLAYING = 1
  if (state === 1) {
    emit('playing')
  }
  // YT.PlayerState.PAUSED = 2
  else if (state === 2) {
    emit('paused')
  }
  // YT.PlayerState.ENDED = 0
  else if (state === 0) {
    emit('ended')
  }
}

function onPlayerError(event: any) {
  const errorCode = event.data
  let errorMessage = 'Erro ao carregar vídeo'

  switch (errorCode) {
    case 2:
      errorMessage = 'ID de vídeo inválido'
      break
    case 5:
      errorMessage = 'Erro ao reproduzir vídeo HTML5'
      break
    case 100:
      errorMessage = 'Vídeo não encontrado ou privado'
      break
    case 101:
    case 150:
      errorMessage = 'Vídeo não pode ser incorporado'
      break
  }

  error.value = errorMessage
  loading.value = false
  emit('error', errorMessage)
}

function retryLoad() {
  error.value = ''
  loading.value = true
  initPlayer()
}

// Public methods (exposed via ref)
function play() {
  if (playerReady && player.value) {
    player.value.playVideo()
  }
}

function pause() {
  if (playerReady && player.value) {
    player.value.pauseVideo()
  }
}

function stop() {
  if (playerReady && player.value) {
    player.value.stopVideo()
  }
}

defineExpose({
  play,
  pause,
  stop
})

// Watch for videoId changes
watch(() => props.videoId, (newVideoId, oldVideoId) => {
  if (newVideoId !== oldVideoId && player.value) {
    loading.value = true
    player.value.loadVideoById(newVideoId)
  }
})

onMounted(() => {
  initPlayer()
})

onBeforeUnmount(() => {
  if (player.value) {
    player.value.destroy()
  }
})

// TypeScript declarations for YouTube API
declare global {
  interface Window {
    YT: any
    onYouTubeIframeAPIReady: () => void
  }
}
</script>
