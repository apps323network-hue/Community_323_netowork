<template>
  <section class="relative min-h-screen flex items-center justify-center overflow-hidden">
    <!-- Background Image -->
    <div class="absolute inset-0">
      <img
        src="/hero-skyline.jpg"
        alt="City skyline at night"
        class="w-full h-full object-cover brightness-60"
      />
      <div class="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-background" />
    </div>

    <!-- Content -->
    <div class="relative z-10 container mx-auto px-6 text-center">
      <p class="text-muted-foreground text-lg mb-4 tracking-widest uppercase animate-fade-in">
        American Dream — Venture
      </p>

      <h1 class="font-display text-5xl md:text-7xl lg:text-8xl font-bold mb-6">
        <span class="text-foreground">US Venture </span>
        <span class="gradient-text">Prep</span>
      </h1>

      <p class="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-12 animate-fade-in" style="animation-delay: 0.2s">
        From zero to pitch-ready in 3 sessions. Your blueprint for U.S. market success.
      </p>

      <!-- Quick Stats -->
      <div class="flex flex-wrap justify-center gap-4 mb-16 animate-fade-in" style="animation-delay: 0.4s">
        <div class="glass-card rounded-full px-6 py-3 flex items-center gap-3">
          <span class="material-symbols-outlined text-session1">lightbulb</span>
          <span class="text-foreground font-medium">30 → 3 → 1 Ideas</span>
        </div>
        <div class="glass-card rounded-full px-6 py-3 flex items-center gap-3">
          <span class="material-symbols-outlined text-session2">description</span>
          <span class="text-foreground font-medium">Business Plan</span>
        </div>
        <div class="glass-card rounded-full px-6 py-3 flex items-center gap-3">
          <span class="material-symbols-outlined text-session3">tv</span>
          <span class="text-foreground font-medium">Shark Tank Pitch</span>
        </div>
      </div>

      <!-- Scroll indicator -->
      <div class="animate-float">
        <div class="w-6 h-10 rounded-full border-2 border-muted-foreground/50 mx-auto flex justify-center pt-2">
          <div class="w-1.5 h-3 rounded-full bg-primary animate-pulse" />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
</script>

<style scoped>
.animate-float {
  animation: float 2s ease-in-out infinite;
}
</style>

