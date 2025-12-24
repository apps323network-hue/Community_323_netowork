<template>
  <svg
    :width="width * horizontal"
    :height="height * vertical"
    class="absolute inset-0 h-full w-full"
    :class="className"
  >
    <defs>
      <pattern
        :id="patternId"
        :width="width"
        :height="height"
        patternUnits="userSpaceOnUse"
      >
        <rect
          :width="width"
          :height="height"
          class="fill-transparent stroke-gray-400/30"
          stroke-width="1"
        />
      </pattern>
    </defs>
    <rect width="100%" height="100%" :fill="`url(#${patternId})`" />
    <rect
      v-for="(_, index) in totalSquares"
      :key="index"
      :x="getX(index)"
      :y="getY(index)"
      :width="width"
      :height="height"
      class="transition-all duration-300 ease-in-out cursor-pointer"
      :class="[
        hoveredSquare === index ? 'fill-gray-300/30' : 'fill-transparent',
        squaresClassName
      ]"
      @mouseenter="hoveredSquare = index"
      @mouseleave="hoveredSquare = null"
    />
  </svg>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  width?: number
  height?: number
  squares?: [number, number] // [horizontal, vertical]
  className?: string
  squaresClassName?: string
}

const props = withDefaults(defineProps<Props>(), {
  width: 40,
  height: 40,
  squares: () => [24, 24],
  className: '',
  squaresClassName: ''
})

const [horizontal, vertical] = props.squares
const hoveredSquare = ref<number | null>(null)
const patternId = `grid-pattern-${Math.random().toString(36).substr(2, 9)}`

const totalSquares = computed(() => horizontal * vertical)

const getX = (index: number) => (index % horizontal) * props.width
const getY = (index: number) => Math.floor(index / horizontal) * props.height
</script>
