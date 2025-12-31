<template>
  <div 
    class="grain-overlay"
    :class="{ 'grain-overlay--subtle': subtle }"
    aria-hidden="true"
  />
</template>

<script setup lang="ts">
defineProps<{
  subtle?: boolean
}>()
</script>

<style scoped>
.grain-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  pointer-events: none;
  opacity: 0.08;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
  background-repeat: repeat;
  animation: grain 0.5s steps(10) infinite;
}

.grain-overlay--subtle {
  opacity: 0.04;
}

@keyframes grain {
  0%, 100% { transform: translate(0, 0); }
  10% { transform: translate(-1%, -1%); }
  20% { transform: translate(1%, 1%); }
  30% { transform: translate(-1%, 1%); }
  40% { transform: translate(1%, -1%); }
  50% { transform: translate(-1%, 0%); }
  60% { transform: translate(1%, 0%); }
  70% { transform: translate(0%, -1%); }
  80% { transform: translate(0%, 1%); }
  90% { transform: translate(-1%, -1%); }
}

/* Reduce motion for accessibility */
@media (prefers-reduced-motion: reduce) {
  .grain-overlay {
    animation: none;
  }
}
</style>
