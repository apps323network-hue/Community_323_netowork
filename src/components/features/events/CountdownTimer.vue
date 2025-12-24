<template>
  <div class="flex flex-col items-center gap-2 sm:gap-3 md:gap-4 bg-black/40 backdrop-blur-xl p-3 sm:p-4 md:p-6 rounded-xl sm:rounded-2xl border border-white/10 shadow-[0_0_30px_rgba(244,37,244,0.15)] w-full sm:w-auto">
    <p class="text-secondary text-xs sm:text-sm font-bold uppercase tracking-widest mb-1 sm:mb-2 text-glow-blue">
      Começa em
    </p>
    <div class="flex gap-1.5 sm:gap-2 md:gap-3 text-center w-full sm:w-auto justify-center">
      <div class="flex flex-col gap-1 sm:gap-2">
        <div class="flex size-12 sm:size-14 md:size-16 items-center justify-center rounded-lg bg-surface-dark border border-primary/50 shadow-[0_0_10px_rgba(244,37,244,0.2)]">
          <p class="text-primary text-lg sm:text-xl md:text-2xl font-bold font-display">{{ days }}</p>
        </div>
        <p class="text-white/60 text-[10px] sm:text-xs">Dias</p>
      </div>
      <div class="flex flex-col gap-1 sm:gap-2">
        <div class="flex size-12 sm:size-14 md:size-16 items-center justify-center rounded-lg bg-surface-dark border border-secondary/50 shadow-[0_0_10px_rgba(0,240,255,0.2)]">
          <p class="text-secondary text-lg sm:text-xl md:text-2xl font-bold font-display">{{ hours }}</p>
        </div>
        <p class="text-white/60 text-[10px] sm:text-xs">Horas</p>
      </div>
      <div class="flex flex-col gap-1 sm:gap-2">
        <div class="flex size-12 sm:size-14 md:size-16 items-center justify-center rounded-lg bg-surface-dark border border-primary/50 shadow-[0_0_10px_rgba(244,37,244,0.2)]">
          <p class="text-primary text-lg sm:text-xl md:text-2xl font-bold font-display">{{ minutes }}</p>
        </div>
        <p class="text-white/60 text-[10px] sm:text-xs">Min</p>
      </div>
      <div class="flex flex-col gap-1 sm:gap-2">
        <div class="flex size-12 sm:size-14 md:size-16 items-center justify-center rounded-lg bg-surface-dark border border-secondary/50 shadow-[0_0_10px_rgba(0,240,255,0.2)]">
          <p class="text-secondary text-lg sm:text-xl md:text-2xl font-bold font-display">{{ seconds }}</p>
        </div>
        <p class="text-white/60 text-[10px] sm:text-xs">Seg</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface Props {
  targetDate: string | Date
}

const props = defineProps<Props>()

const days = ref(0)
const hours = ref(0)
const minutes = ref(0)
const seconds = ref(0)

let intervalId: ReturnType<typeof setInterval> | null = null

function updateCountdown() {
  const now = new Date().getTime()
  const target = new Date(props.targetDate).getTime()
  const difference = target - now

  if (difference <= 0) {
    days.value = 0
    hours.value = 0
    minutes.value = 0
    seconds.value = 0
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
    return
  }

  days.value = Math.floor(difference / (1000 * 60 * 60 * 24))
  hours.value = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  minutes.value = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
  seconds.value = Math.floor((difference % (1000 * 60)) / 1000)
}

onMounted(() => {
  updateCountdown()
  intervalId = setInterval(updateCountdown, 1000)
})

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId)
  }
})
</script>

<style scoped>
.text-glow-blue {
  text-shadow: 0 0 10px rgba(0, 240, 255, 0.5);
}
</style>
