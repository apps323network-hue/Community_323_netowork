<template>
  <div ref="containerRef" :class="className" class="h-full w-full">
    <canvas
      ref="canvasRef"
      class="pointer-events-none"
      :style="{
        width: `${canvasSize.width}px`,
        height: `${canvasSize.height}px`
      }"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'

interface Props {
  squareSize?: number
  gridGap?: number
  flickerChance?: number
  color?: string
  width?: number
  height?: number
  className?: string
  maxOpacity?: number
}

const props = withDefaults(defineProps<Props>(), {
  squareSize: 4,
  gridGap: 6,
  flickerChance: 0.3,
  color: 'rgb(0, 0, 0)',
  maxOpacity: 0.3
})

const canvasRef = ref<HTMLCanvasElement | null>(null)
const containerRef = ref<HTMLDivElement | null>(null)
const isInView = ref(false)
const canvasSize = ref({ width: 0, height: 0 })

let animationFrameId: number | null = null
let resizeObserver: ResizeObserver | null = null
let intersectionObserver: IntersectionObserver | null = null

// Convert color to RGBA prefix
const toRGBA = (color: string): string => {
  if (typeof window === 'undefined') {
    return 'rgba(0, 0, 0,'
  }
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 1
  const ctx = canvas.getContext('2d')
  if (!ctx) return 'rgba(255, 0, 0,'
  ctx.fillStyle = color
  ctx.fillRect(0, 0, 1, 1)
  const [r, g, b] = Array.from(ctx.getImageData(0, 0, 1, 1).data)
  return `rgba(${r}, ${g}, ${b},`
}

const memoizedColor = toRGBA(props.color)

const setupCanvas = (canvas: HTMLCanvasElement, width: number, height: number) => {
  const dpr = window.devicePixelRatio || 1
  canvas.width = width * dpr
  canvas.height = height * dpr
  canvas.style.width = `${width}px`
  canvas.style.height = `${height}px`
  
  const cols = Math.floor(width / (props.squareSize + props.gridGap))
  const rows = Math.floor(height / (props.squareSize + props.gridGap))

  const squares = new Float32Array(cols * rows)
  for (let i = 0; i < squares.length; i++) {
    squares[i] = Math.random() * props.maxOpacity
  }

  return { cols, rows, squares, dpr }
}

const updateSquares = (squares: Float32Array, deltaTime: number) => {
  for (let i = 0; i < squares.length; i++) {
    if (Math.random() < props.flickerChance * deltaTime) {
      squares[i] = Math.random() * props.maxOpacity
    }
  }
}

const drawGrid = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  cols: number,
  rows: number,
  squares: Float32Array,
  dpr: number
) => {
  ctx.clearRect(0, 0, width, height)
  ctx.fillStyle = 'transparent'
  ctx.fillRect(0, 0, width, height)

  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      const opacity = squares[i * rows + j]
      ctx.fillStyle = `${memoizedColor}${opacity})`
      ctx.fillRect(
        i * (props.squareSize + props.gridGap) * dpr,
        j * (props.squareSize + props.gridGap) * dpr,
        props.squareSize * dpr,
        props.squareSize * dpr
      )
    }
  }
}

onMounted(() => {
  const canvas = canvasRef.value
  const container = containerRef.value
  if (!canvas || !container) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  let gridParams: ReturnType<typeof setupCanvas>

  const updateCanvasSize = () => {
    const newWidth = props.width || container.clientWidth
    const newHeight = props.height || container.clientHeight
    canvasSize.value = { width: newWidth, height: newHeight }
    gridParams = setupCanvas(canvas, newWidth, newHeight)
  }

  updateCanvasSize()

  let lastTime = 0
  const animate = (time: number) => {
    if (!isInView.value) return

    const deltaTime = (time - lastTime) / 1000
    lastTime = time

    updateSquares(gridParams.squares, deltaTime)
    drawGrid(
      ctx,
      canvas.width,
      canvas.height,
      gridParams.cols,
      gridParams.rows,
      gridParams.squares,
      gridParams.dpr
    )
    animationFrameId = requestAnimationFrame(animate)
  }

  resizeObserver = new ResizeObserver(() => {
    updateCanvasSize()
  })

  resizeObserver.observe(container)

  intersectionObserver = new IntersectionObserver(
    ([entry]) => {
      isInView.value = entry.isIntersecting
    },
    { threshold: 0 }
  )

  intersectionObserver.observe(canvas)

  watch(isInView, (newValue) => {
    if (newValue && animationFrameId === null) {
      animationFrameId = requestAnimationFrame(animate)
    }
  })

  if (isInView.value) {
    animationFrameId = requestAnimationFrame(animate)
  }
})

onUnmounted(() => {
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId)
  }
  if (resizeObserver) {
    resizeObserver.disconnect()
  }
  if (intersectionObserver) {
    intersectionObserver.disconnect()
  }
})
</script>
