<template>
  <section class="py-24 relative" id="journey">
    <div class="container mx-auto px-6">
      <div class="text-center mb-16">
        <span class="section-badge mb-4 inline-block">The Journey</span>
        <h2 class="font-display text-4xl md:text-5xl font-bold mb-4">
          Your Path to <span class="gradient-text">Launch</span>
        </h2>
        <p class="text-muted-foreground text-lg max-w-xl mx-auto">
          Three sessions, one clear outcome: a validated, pitch-ready venture.
        </p>
      </div>

      <!-- Visual Timeline -->
      <div class="relative max-w-4xl mx-auto">
        <!-- Connection Line - Vertical Timeline -->
        <div class="absolute left-1/2 top-0 bottom-0 w-1 -translate-x-1/2 hidden lg:block z-0">
          <div class="w-full h-full timeline-gradient rounded-full opacity-80" />
        </div>

        <!-- Session Cards -->
        <div class="space-y-12 relative z-10">
          <!-- Session 1 -->
          <div class="lg:flex items-center gap-8">
            <div class="lg:w-1/2 lg:text-right mb-6 lg:mb-0">
              <div class="glass-card rounded-2xl p-6 inline-block text-left lg:text-right">
                <span class="text-session1 font-bold text-sm tracking-wide">SESSION 1</span>
                <h3 class="font-display text-2xl font-bold text-foreground mt-2">Ideas + Test</h3>
                <p class="text-muted-foreground mt-2">Generate 30 ideas, narrow to 1, design validation test</p>
                <div class="flex gap-2 mt-4 lg:justify-end">
                  <span class="bg-session1/20 text-session1 text-xs px-3 py-1 rounded-full">90 min</span>
                  <span class="bg-session1/20 text-session1 text-xs px-3 py-1 rounded-full">30→3→1</span>
                </div>
              </div>
            </div>
            <div class="hidden lg:flex items-center justify-center relative z-10">
              <div class="number-badge-session1 text-xl shadow-lg shadow-session1/30">1</div>
            </div>
            <div class="lg:w-1/2" />
          </div>

          <!-- Session 2 -->
          <div class="lg:flex items-center gap-8">
            <div class="lg:w-1/2" />
            <div class="hidden lg:flex items-center justify-center relative z-10">
              <div class="number-badge-session2 text-xl shadow-lg shadow-session2/30">2</div>
            </div>
            <div class="lg:w-1/2 mb-6 lg:mb-0">
              <div class="glass-card rounded-2xl p-6 inline-block">
                <span class="text-session2 font-bold text-sm tracking-wide">SESSION 2</span>
                <h3 class="font-display text-2xl font-bold text-foreground mt-2">Business Plan</h3>
                <p class="text-muted-foreground mt-2">Build one-page model, create 90-day roadmap</p>
                <div class="flex gap-2 mt-4">
                  <span class="bg-session2/20 text-session2 text-xs px-3 py-1 rounded-full">90 min</span>
                  <span class="bg-session2/20 text-session2 text-xs px-3 py-1 rounded-full">One-Pager</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Session 3 -->
          <div class="lg:flex items-center gap-8">
            <div class="lg:w-1/2 lg:text-right mb-6 lg:mb-0">
              <div class="glass-card rounded-2xl p-6 inline-block text-left lg:text-right">
                <span class="text-session3 font-bold text-sm tracking-wide">SESSION 3</span>
                <h3 class="font-display text-2xl font-bold text-foreground mt-2">Pitch Day</h3>
                <p class="text-muted-foreground mt-2">Deliver Shark Tank pitch, get feedback, plan next steps</p>
                <div class="flex gap-2 mt-4 lg:justify-end">
                  <span class="bg-session3/20 text-session3 text-xs px-3 py-1 rounded-full">Live Pitch</span>
                  <span class="bg-session3/20 text-session3 text-xs px-3 py-1 rounded-full">Feedback</span>
                </div>
              </div>
            </div>
            <div class="hidden lg:flex items-center justify-center relative z-10">
              <div class="number-badge-session3 text-xl shadow-lg shadow-session3/30">3</div>
            </div>
            <div class="lg:w-1/2" />
          </div>
        </div>
      </div>

      <!-- Quote -->
      <div class="mt-20 text-center">
        <blockquote class="text-2xl md:text-3xl font-display font-bold text-foreground max-w-2xl mx-auto">
          "Ideas are cheap. <span class="gradient-text">Execution wins.</span>"
        </blockquote>
        <p class="text-muted-foreground mt-4">Your venture starts here ✨</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
</script>

<style scoped>
/* Timeline gradient line */
.timeline-gradient {
  background: linear-gradient(
    180deg,
    hsl(var(--session-1)) 0%,
    hsl(var(--session-1)) 20%,
    hsl(var(--session-2)) 50%,
    hsl(var(--session-3)) 80%,
    hsl(var(--session-3)) 100%
  );
}

.bg-session1\/20 {
  background: hsl(var(--session-1) / 0.2);
}

.bg-session2\/20 {
  background: hsl(var(--session-2) / 0.2);
}

.bg-session3\/20 {
  background: hsl(var(--session-3) / 0.2);
}

.number-badge-session1,
.number-badge-session2,
.number-badge-session3 {
  width: 5rem;
  height: 5rem;
  font-size: 1.5rem;
  position: relative;
}

.number-badge-session1 {
  box-shadow: 0 10px 30px hsl(var(--session-1) / 0.3);
}

.number-badge-session2 {
  box-shadow: 0 10px 30px hsl(var(--session-2) / 0.3);
}

.number-badge-session3 {
  box-shadow: 0 10px 30px hsl(var(--session-3) / 0.3);
}
</style>

