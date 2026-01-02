<template>
  <div 
    class="flex items-center gap-3 w-full min-w-[350px] bg-slate-900 border border-slate-700/50 rounded-xl p-4 shadow-xl backdrop-blur-md cursor-pointer hover:border-primary/50 transition-colors"
    @click="handleClick"
  >
    <!-- Icon Container -->
    <div class="flex-shrink-0 w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
      <span class="material-symbols-outlined text-primary text-xl">{{ icon }}</span>
    </div>

    <!-- Content -->
    <div class="flex-grow min-w-0 pr-2">
       <div class="flex flex-col gap-0.5">
          <div class="flex items-center gap-2">
            <span class="font-bold text-base text-white text-shadow-sm">+{{ points }} PTS</span>
            <span class="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/20">Novo!</span>
          </div>
          <p class="text-sm text-slate-300 leading-snug truncate" :title="message">{{ message }}</p>
       </div>
    </div>

    <!-- Arrow -->
    <span class="material-symbols-outlined text-slate-500 text-sm">arrow_forward</span>
  </div>
</template>

<script setup lang="ts">
// Props recebidas do toast
defineProps<{ 
  points: number
  message: string
  icon: string 
}>()

function handleClick() {
  window.location.href = '/desafios'
}
</script>
