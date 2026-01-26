<template>
  <header class="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border">
    <nav class="w-full mx-auto px-4 sm:px-6 xl:px-8 max-w-[1440px]">
      <div class="flex items-center justify-between h-20">
        <!-- Logo 323 Network -->
        <a href="/" class="flex-shrink-0 flex items-center gap-2 cursor-pointer group">
          <div class="font-display font-extrabold tracking-tighter flex items-center transform group-hover:scale-105 transition-transform text-2xl xl:text-3xl">
            <span class="text-primary">(323</span>
            <span class="material-icons-outlined text-primary mx-1 animate-pulse" style="font-size: 1.2em">
              play_arrow
            </span>
            <span class="bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-secondary font-extrabold">
              NETWORK
            </span>
          </div>
        </a>

        <!-- Navigation Links - Desktop -->
        <div class="hidden xl:flex items-center gap-8">
          <a href="#journey" class="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
            The Journey
          </a>
          <a href="#sessions" class="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
            Sessions
          </a>
          <a href="#assets" class="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
            Assets
          </a>
        </div>

        <!-- Auth Buttons -->
        <div class="flex items-center gap-3">
          <a
            href="/login"
            class="px-4 py-2 text-sm font-bold text-foreground hover:text-primary transition-colors"
          >
            Entrar
          </a>
          <a
            href="/login?mode=signup"
            class="px-5 py-2 text-sm font-bold bg-gradient-to-r from-secondary via-accent to-primary text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all"
          >
            Cadastrar
          </a>
        </div>
      </div>
    </nav>
  </header>
</template>

<script setup lang="ts">
</script>

<style scoped>
/* Styles inherited from venture-prep.css */
</style>

