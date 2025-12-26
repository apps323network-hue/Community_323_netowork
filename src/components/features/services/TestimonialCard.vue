<template>
  <div class="bg-[#0a040f] p-6 rounded-lg border border-white/5 flex flex-col gap-4 shadow-sm hover:border-secondary/20 transition-colors">
    <!-- Stars -->
    <div class="flex gap-1 text-[rgb(0,243,255)] text-sm drop-shadow-[0_0_8px_rgba(0,243,255,0.3)]">
      <span
        v-for="i in 5"
        :key="i"
        class="material-symbols-outlined text-[16px] fill"
        style="font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;"
      >
        star
      </span>
    </div>

    <!-- Text -->
    <p class="text-gray-400 text-sm italic font-medium leading-relaxed">
      {{ testimonial.text.startsWith('"') ? testimonial.text : `"${testimonial.text}"` }}
    </p>

    <!-- Author -->
    <div class="flex items-center gap-3 mt-auto pt-2">
      <div
        class="size-10 rounded-full bg-slate-800 bg-cover bg-center ring-2 ring-[rgb(244,37,244)]/20"
        :style="{ backgroundImage: `url('${testimonial.avatar}')` }"
      ></div>
      <div>
        <p class="text-white text-sm font-bold">{{ testimonial.name }}</p>
        <p class="text-gray-500 text-xs">{{ testimonial.role }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Testimonial {
  id: number
  name: string
  role: string
  text: string
  rating: number
  avatar: string
}

defineProps<{
  testimonial: Testimonial
}>()
</script>

<style scoped>
/* Ensure material symbols filled looks solid */
.material-symbols-outlined {
  font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
</style>
