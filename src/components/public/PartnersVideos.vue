<template>
  <section 
    id="videos"
    ref="sectionRef"
    class="py-16 sm:py-20 md:py-24 bg-slate-900 dark:bg-background-dark overflow-hidden"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Title -->
      <div 
        ref="headerRef"
        class="text-center mb-12 md:mb-16 section-header"
        :class="{ 'revealed': headerVisible }"
      >
        <h2 class="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4">
          {{ t('partners.videos.title') }}
        </h2>
        <p class="text-lg text-gray-300 max-w-2xl mx-auto">
          {{ t('partners.videos.description') }}
        </p>
        <div class="w-24 h-1 bg-neon-gradient mx-auto rounded-full mt-4"></div>
      </div>

      <!-- Videos Grid -->
      <div 
        ref="gridRef"
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto"
      >
        <div
          v-for="(video, index) in videos"
          :key="video.name"
          class="video-card bg-slate-800 dark:bg-surface-lighter rounded-xl overflow-hidden border border-slate-700 dark:border-slate-800 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10"
          :class="{ 'revealed': cardsVisible }"
          :style="{ transitionDelay: `${index * 120}ms` }"
        >
          <!-- Video Player HTML5 Nativo do Supabase -->
          <div v-if="video.url" class="video-container-wrapper">
            <!-- Player de vídeo HTML5 nativo -->
            <div class="video-container">
              <video
                :src="shouldLoadVideo(index) ? video.url : undefined"
                :data-src="video.url"
                class="video-player"
                controls
                preload="metadata"
                playsinline
                @loadstart="() => console.log('[Video] Carregando:', video.name)"
                @loadedmetadata="() => console.log('[Video] Metadados carregados:', video.name)"
                @error="(e) => console.error('[Video] Erro ao carregar:', video.name, e)"
              >
                Seu navegador não suporta a tag de vídeo.
              </video>
              
              <!-- Overlay de loading -->
              <div v-if="!shouldLoadVideo(index)" class="video-loading-overlay">
                <div class="text-center">
                  <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p class="text-white/60 text-sm">Carregando vídeo...</p>
                </div>
              </div>
              
              <!-- Play button overlay (opcional) -->
              <div class="video-play-overlay">
                <div class="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <span class="material-icons-outlined text-white text-3xl">play_arrow</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Placeholder quando vídeo não está disponível -->
          <div v-else class="relative aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 overflow-hidden rounded-t-xl">
            <div class="absolute inset-0 flex items-center justify-center">
              <span class="material-icons-outlined text-6xl text-primary/30">videocam_off</span>
            </div>
          </div>

          <!-- Video Info -->
          <div class="p-6">
            <h3 class="text-lg font-bold text-white mb-2 line-clamp-2">
              {{ video.title }}
            </h3>
            <p class="text-sm text-gray-300 line-clamp-2">
              {{ video.description }}
            </p>
            <div class="mt-4 flex items-center gap-2 text-xs text-gray-400">
              <span class="material-icons-outlined text-sm">calendar_month</span>
              <span>{{ video.date }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div
        v-if="loadingVideos"
        class="text-center py-12"
      >
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p class="text-gray-400">
          Carregando vídeos...
        </p>
      </div>

      <!-- Empty State -->
      <div
        v-else-if="videos.length === 0"
        class="text-center py-12"
      >
        <span class="material-icons-outlined text-6xl text-gray-600 mb-4 block">videocam_off</span>
        <p class="text-gray-400">
          {{ t('partners.videos.noVideos') }}
        </p>
      </div>
    </div>

  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { supabase } from '@/lib/supabase'

const { t } = useI18n()

const sectionRef = ref<HTMLElement | null>(null)
const headerRef = ref<HTMLElement | null>(null)
const gridRef = ref<HTMLElement | null>(null)

const headerVisible = ref(false)
const cardsVisible = ref(false)

let observer: IntersectionObserver | null = null

// Estado para vídeos do Supabase
const videos = ref<Array<{
  name: string
  url: string
  size: number
  mimetype: string
  title: string
  description: string
  date: string
}>>([])
const loadingVideos = ref(true)

// Função para buscar vídeos do Supabase Storage
async function fetchVideosFromSupabase() {
  loadingVideos.value = true
  try {
    console.log('🔍 [PartnersVideos] Buscando vídeos do bucket "videos"...')
    
    // Lista conhecida de vídeos (baseado nos arquivos que você adicionou)
    const knownVideos = [
      { name: 'video 1.mp4', title: 'Workshop: Como Construir o American Dream', description: 'Palestra completa sobre oportunidades para brasileiros nos EUA', date: 'Nov 2025' },
      { name: 'video 2.mp4', title: 'Networking Event Highlights', description: 'Veja os melhores momentos do nosso evento de networking', date: 'Nov 2025' },
      { name: 'video 3.mp4', title: 'Live: Realizando o Sonho Americano', description: 'Live especial com especialistas que já estão nos EUA há mais de 10 anos. A 323 Network já ajudou mais de 7 mil brasileiros a realizarem o Sonho Americano.', date: 'Nov 2025' },
    ]

    // Tentar listar arquivos primeiro
    const { data: files, error } = await supabase.storage
      .from('videos')
      .list('', {
        limit: 100,
        offset: 0,
        sortBy: { column: 'name', order: 'asc' }
      })

    let videoFiles: Array<{ name: string; created_at?: string; metadata?: any }> = []

    if (error) {
      console.warn('⚠️ [PartnersVideos] Erro ao listar arquivos (usando lista conhecida):', error)
      // Se houver erro, usar lista conhecida
      videoFiles = knownVideos.map(v => ({ name: v.name }))
    } else {
      console.log('📁 [PartnersVideos] Arquivos encontrados:', files?.length || 0)
      
      // Filtrar apenas arquivos de vídeo
      const filteredFiles = files?.filter(file => {
        const isVideo = file.name.endsWith('.mp4') || 
                       file.name.endsWith('.webm') || 
                       file.name.endsWith('.mov')
        const isNotSystemFile = !file.name.startsWith('.')
        return isVideo && isNotSystemFile
      }) || []

      // Se não encontrou arquivos, usar lista conhecida
      if (filteredFiles.length === 0) {
        console.warn('⚠️ [PartnersVideos] Nenhum vídeo encontrado, usando lista conhecida')
        videoFiles = knownVideos.map(v => ({ name: v.name }))
      } else {
        videoFiles = filteredFiles
      }
    }

    console.log('🎬 [PartnersVideos] Total de vídeos a processar:', videoFiles.length)

    // Buscar URLs públicas para cada vídeo
    const videosWithUrls = await Promise.all(
      videoFiles.map(async (file) => {
        const { data: urlData } = supabase.storage
          .from('videos')
          .getPublicUrl(file.name)

        console.log(`🔗 [PartnersVideos] URL gerada para ${file.name}:`, urlData.publicUrl)

        // Buscar metadados da lista conhecida ou gerar do nome
        const knownVideo = knownVideos.find(v => v.name === file.name)
        const title = knownVideo?.title || file.name
          .replace(/\.(mp4|webm|mov)$/i, '')
          .replace(/\b(video|vid)\b/gi, '')
          .trim()
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')

        return {
          name: file.name,
          url: urlData.publicUrl,
          size: file.metadata?.size || 0,
          mimetype: file.metadata?.mimetype || 'video/mp4',
          title: title || 'Vídeo',
          description: knownVideo?.description || `Vídeo da 323 Network - ${title}`,
          date: knownVideo?.date || (file.created_at 
            ? new Date(file.created_at).toLocaleDateString('pt-BR', { 
                month: 'short', 
                year: 'numeric' 
              })
            : 'Recente')
        }
      })
    )

    videos.value = videosWithUrls
    console.log('✅ [PartnersVideos] Vídeos carregados do Supabase:', videos.value.length)
    console.log('✅ [PartnersVideos] Lista completa de vídeos:', videos.value)
  } catch (error) {
    console.error('❌ [PartnersVideos] Erro ao buscar vídeos:', error)
    videos.value = []
  } finally {
    loadingVideos.value = false
  }
}


// Lazy loading: carrega apenas os primeiros 3 vídeos inicialmente
function shouldLoadVideo(index: number): boolean {
  const shouldLoad = index < 3 || cardsVisible.value
  console.log(`[Instagram Embed] shouldLoadVideo(${index}):`, shouldLoad, 'cardsVisible:', cardsVisible.value)
  return shouldLoad
}

// Carregar vídeos restantes quando necessário (lazy loading)
function loadRemainingVideos() {
  const videoElements = document.querySelectorAll('video[data-src]:not([src])')
  videoElements.forEach((videoEl) => {
    const dataSrc = videoEl.getAttribute('data-src')
    if (dataSrc) {
      ;(videoEl as HTMLVideoElement).src = dataSrc
      ;(videoEl as HTMLVideoElement).load()
    }
  })
}


onMounted(async () => {
  console.log('🚀 [PartnersVideos] Componente montado')
  
  // Buscar vídeos do Supabase
  await fetchVideosFromSupabase()
  
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (entry.target === headerRef.value) {
            console.log('👁️ [PartnersVideos] Header visível')
            headerVisible.value = true
          }
          if (entry.target === gridRef.value) {
            console.log('👁️ [PartnersVideos] Grid visível - carregando vídeos')
            cardsVisible.value = true
            // Carregar vídeos restantes quando a grid ficar visível
            loadRemainingVideos()
          }
          observer?.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.15 }
  )

  if (headerRef.value) observer.observe(headerRef.value)
  if (gridRef.value) observer.observe(gridRef.value)
  
  console.log('👀 [PartnersVideos] Observers configurados')
})

onUnmounted(() => {
  observer?.disconnect()
})
</script>

<style scoped>
/* Section header reveal - horizontal slide with blur */
.section-header {
  opacity: 0;
  transform: translateX(60px);
  filter: blur(12px);
  transition: opacity 0.9s cubic-bezier(0.16, 1, 0.3, 1),
              transform 0.9s cubic-bezier(0.16, 1, 0.3, 1),
              filter 0.9s cubic-bezier(0.16, 1, 0.3, 1);
}

.section-header.revealed {
  opacity: 1;
  transform: translateX(0);
  filter: blur(0);
}

/* Video card - 3D rotate entrance with blur */
.video-card {
  opacity: 0;
  transform: perspective(1000px) rotateY(15deg) translateZ(-50px);
  filter: blur(8px);
  transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1),
              transform 0.8s cubic-bezier(0.16, 1, 0.3, 1),
              filter 0.8s cubic-bezier(0.16, 1, 0.3, 1),
              border-color 0.3s ease,
              box-shadow 0.3s ease;
  transform-style: preserve-3d;
}

.video-card.revealed {
  opacity: 1;
  transform: perspective(1000px) rotateY(0) translateZ(0);
  filter: blur(0);
}

/* Card hover effects */
.video-card:hover {
  transform: translateY(-10px) scale(1.02);
  box-shadow: 0 20px 40px -10px rgba(var(--color-primary-rgb, 234, 98, 29), 0.3);
}

/* Instagram Embed Styling - Esconder bordas e UI completamente */
.instagram-container {
  /* Container para controlar o overflow e esconder bordas */
  overflow: hidden;
  position: relative;
}

.instagram-embed {
  /* Zoom agressivo no vídeo para esconder completamente as bordas da UI */
  transform: scale(1.3);
  transform-origin: center center;
  width: 100%;
  height: 100%;
  /* Esconder qualquer scrollbar */
  overflow: hidden;
}

/* Overlays para esconder todas as bordas e elementos da UI */
.instagram-overlay-top {
  /* Esconder header do Instagram */
  background: linear-gradient(
    to bottom,
    rgba(30, 41, 59, 1) 0%,
    rgba(30, 41, 59, 0.98) 70%,
    rgba(30, 41, 59, 0.9) 90%,
    transparent 100%
  );
}

.instagram-overlay-bottom {
  /* Esconder footer, botões e comentários do Instagram */
  background: linear-gradient(
    to top,
    rgba(30, 41, 59, 1) 0%,
    rgba(30, 41, 59, 0.99) 20%,
    rgba(30, 41, 59, 0.95) 50%,
    rgba(30, 41, 59, 0.85) 70%,
    rgba(30, 41, 59, 0.6) 85%,
    transparent 100%
  );
}

.instagram-overlay-left {
  /* Esconder borda lateral esquerda do Instagram */
  background: linear-gradient(
    to right,
    rgba(30, 41, 59, 1) 0%,
    rgba(30, 41, 59, 0.95) 50%,
    transparent 100%
  );
}

.instagram-overlay-right {
  /* Esconder borda lateral direita do Instagram */
  background: linear-gradient(
    to left,
    rgba(30, 41, 59, 1) 0%,
    rgba(30, 41, 59, 0.95) 50%,
    transparent 100%
  );
}

/* Dark mode overlays */
.dark .instagram-overlay-top {
  background: linear-gradient(
    to bottom,
    rgba(15, 23, 42, 1) 0%,
    rgba(15, 23, 42, 0.98) 70%,
    rgba(15, 23, 42, 0.9) 90%,
    transparent 100%
  );
}

.dark .instagram-overlay-bottom {
  background: linear-gradient(
    to top,
    rgba(15, 23, 42, 1) 0%,
    rgba(15, 23, 42, 0.99) 20%,
    rgba(15, 23, 42, 0.95) 50%,
    rgba(15, 23, 42, 0.85) 70%,
    rgba(15, 23, 42, 0.6) 85%,
    transparent 100%
  );
}

.dark .instagram-overlay-left {
  background: linear-gradient(
    to right,
    rgba(15, 23, 42, 1) 0%,
    rgba(15, 23, 42, 0.95) 50%,
    transparent 100%
  );
}

.dark .instagram-overlay-right {
  background: linear-gradient(
    to left,
    rgba(15, 23, 42, 1) 0%,
    rgba(15, 23, 42, 0.95) 50%,
    transparent 100%
  );
}

.instagram-overlay {
  /* Gradiente para esconder elementos da UI na parte inferior */
  background: linear-gradient(
    to top,
    rgba(30, 41, 59, 1) 0%,
    rgba(30, 41, 59, 0.9) 20%,
    rgba(30, 41, 59, 0.5) 50%,
    transparent 100%
  );
  z-index: 10;
}

/* Dark mode overlay */
.dark .instagram-overlay {
  background: linear-gradient(
    to top,
    rgba(15, 23, 42, 1) 0%,
    rgba(15, 23, 42, 0.9) 20%,
    rgba(15, 23, 42, 0.5) 50%,
    transparent 100%
  );
}

/* Video Container Wrapper - Formato vertical (9:16) para reels */
.video-container-wrapper {
  position: relative;
  width: 100%;
  padding-bottom: 177.78%; /* 9:16 aspect ratio (vertical/reels) */
  background: #000;
  border-radius: 0.75rem 0.75rem 0 0;
  overflow: hidden;
}

/* Video Container - Garantir renderização única */
.video-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #000;
  overflow: hidden;
}

/* Video Player Styling - Formato vertical (9:16) para reels */
.video-player {
  width: 100% !important;
  height: 100% !important;
  display: block !important;
  object-fit: contain; /* contain para mostrar vídeo vertical completo */
  background: #000;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
}

/* Garantir que apenas um elemento video seja renderizado */
.video-container video {
  width: 100% !important;
  height: 100% !important;
  display: block !important;
  object-fit: contain; /* contain para mostrar vídeo vertical completo */
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
}

/* Overlays */
.video-loading-overlay {
  position: absolute;
  inset: 0;
  background: rgba(15, 23, 42, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  border-radius: 0.75rem 0.75rem 0 0;
}

.video-play-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 20;
}

.video-container:hover .video-play-overlay {
  opacity: 1;
}

/* Remover qualquer pseudo-elemento que possa causar duplicação */
.video-container-wrapper::before,
.video-container-wrapper::after,
.video-container::before,
.video-container::after,
.video-player::before,
.video-player::after {
  display: none !important;
  content: none !important;
}

/* Reduce motion for accessibility */
@media (prefers-reduced-motion: reduce) {
  .section-header,
  .video-card {
    opacity: 1;
    transform: none;
    filter: none;
    transition: border-color 0.3s ease, box-shadow 0.3s ease;
  }
  
  .video-player {
    transform: none;
  }
}
</style>

