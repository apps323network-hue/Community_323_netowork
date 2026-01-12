<template>
  <section class="py-24 relative" id="session3">
    <div class="container mx-auto px-6">
      <!-- Session Header -->
      <div class="flex items-center gap-4 mb-8">
        <div class="number-badge-session3 text-2xl">3</div>
        <div>
          <span class="section-badge mb-2 inline-block">Session 3</span>
          <h2 class="font-display text-4xl md:text-5xl font-bold">
            <span class="gradient-text-session3">Final:</span> Pitch Day
          </h2>
        </div>
      </div>

      <p class="text-muted-foreground text-lg max-w-3xl mb-12">
        Deliver a confident pitch with a clear story, evidence, and next steps — Shark Tank style.
      </p>

      <!-- Pitch Format -->
      <div class="grid md:grid-cols-3 gap-6 mb-16">
        <div class="glass-card rounded-2xl p-8 text-center glow-secondary">
          <span class="material-symbols-outlined text-session3 mx-auto mb-4 text-5xl">mic</span>
          <span class="font-display text-3xl font-bold text-foreground">3–4 min</span>
          <p class="text-muted-foreground mt-2">Your Pitch</p>
        </div>
        <div class="glass-card rounded-2xl p-8 text-center">
          <span class="material-symbols-outlined text-session3 mx-auto mb-4 text-5xl">star</span>
          <span class="font-display text-3xl font-bold text-foreground">2–3 min</span>
          <p class="text-muted-foreground mt-2">Q&A Session</p>
        </div>
        <div class="glass-card rounded-2xl p-8 text-center">
          <span class="material-symbols-outlined text-session3 mx-auto mb-4 text-5xl">emoji_events</span>
          <span class="font-display text-3xl font-bold text-foreground">Expert</span>
          <p class="text-muted-foreground mt-2">Mentor Feedback</p>
        </div>
      </div>

      <!-- Deliverables -->
      <div class="grid md:grid-cols-2 gap-8 mb-16">
        <div class="glass-card rounded-2xl p-8">
          <div class="flex items-center gap-3 mb-6">
            <span class="material-symbols-outlined text-session3">target</span>
            <h3 class="font-display text-xl font-bold">Deliverables</h3>
          </div>
          <ul class="space-y-3">
            <li class="flex items-start gap-3">
              <span class="material-symbols-outlined text-session3 mt-0.5 shrink-0">tv</span>
              <span class="text-muted-foreground">Live pitch + Q&A performance</span>
            </li>
            <li class="flex items-start gap-3">
              <span class="material-symbols-outlined text-session3 mt-0.5 shrink-0">tv</span>
              <span class="text-muted-foreground">Final feedback notes + next-step plan</span>
            </li>
          </ul>
        </div>

        <div class="glass-card rounded-2xl p-8">
          <div class="flex items-center gap-3 mb-6">
            <span class="material-symbols-outlined text-session3">schedule</span>
            <h3 class="font-display text-xl font-bold">Session Format</h3>
          </div>
          <div class="space-y-3">
            <div class="bg-muted/30 rounded-xl p-4 flex items-center justify-between">
              <span class="text-muted-foreground">Each Student Pitches</span>
              <span class="text-session3 font-bold">~7 min total</span>
            </div>
            <div class="bg-muted/30 rounded-xl p-4 flex items-center justify-between">
              <span class="text-muted-foreground">Feedback Round</span>
              <span class="text-session3 font-bold">Per pitch</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Required Pitch Content -->
      <div class="glass-card rounded-2xl p-8 mb-12">
        <h3 class="font-display text-xl font-bold mb-8 flex items-center gap-3">
          <span class="material-symbols-outlined text-session3">mic</span>
          Required Pitch Structure
        </h3>
        <div class="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div v-for="(item, i) in pitchContent" :key="i" class="text-center">
            <div class="number-badge-session3 text-lg mx-auto mb-3">{{ item.num }}</div>
            <h4 class="font-display font-semibold text-foreground text-sm">{{ item.title }}</h4>
            <p class="text-muted-foreground text-xs mt-1">{{ item.desc }}</p>
          </div>
        </div>
      </div>

      <!-- Deck Outline -->
      <div class="glass-card rounded-2xl p-8 mb-12">
        <h3 class="font-display text-xl font-bold mb-6 flex items-center gap-3">
          <span class="material-symbols-outlined text-session3">tv</span>
          Suggested Deck (5–7 slides)
        </h3>
        <div class="flex flex-wrap gap-3 justify-center">
          <div v-for="(slide, i) in deckSlides" :key="i" class="bg-muted/30 rounded-full px-5 py-3 flex items-center gap-2">
            <span class="text-session3 font-bold text-sm">{{ i + 1 }}.</span>
            <span class="text-muted-foreground text-sm">{{ slide }}</span>
          </div>
        </div>
      </div>

      <!-- Evaluation Rubric -->
      <div class="glass-card rounded-2xl p-8">
        <h3 class="font-display text-xl font-bold mb-8 flex items-center gap-3">
          <span class="material-symbols-outlined text-session3">emoji_events</span>
          Evaluation Rubric (1–5 scoring)
        </h3>
        <div class="grid md:grid-cols-5 gap-4">
          <div v-for="(item, i) in rubricItems" :key="i" class="bg-gradient-to-br from-session3/10 to-transparent rounded-xl p-5 text-center border border-session3/20">
            <div class="number-badge-session3 text-lg mx-auto mb-3">{{ i + 1 }}</div>
            <h4 class="font-display font-semibold text-foreground text-sm">{{ item.title }}</h4>
            <p class="text-muted-foreground text-xs mt-1">{{ item.desc }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const pitchContent = [
  { num: "1", title: "The customer + problem", desc: "Clear and specific" },
  { num: "2", title: "Your solution", desc: "Simple and direct" },
  { num: "3", title: "Why now / why you", desc: "Your credibility" },
  { num: "4", title: "Proof", desc: "What you tested & learned" },
  { num: "5", title: "Business model", desc: "How it works" },
  { num: "6", title: "Ask / next steps", desc: "What you need" },
]

const deckSlides = [
  "Title + one-liner",
  "Problem + who has it",
  "Solution",
  "Proof / validation",
  "Business model",
  "Go-to-market (first users)",
  "Ask + next 90 days",
]

const rubricItems = [
  { title: "Problem Clarity", desc: "Clear customer + pain" },
  { title: "Solution Strength", desc: "Compelling value" },
  { title: "Validation Quality", desc: "Real evidence" },
  { title: "Feasibility", desc: "Realistic next steps" },
  { title: "Presence", desc: "Confident delivery" },
]
</script>

<style scoped>
/* Styles inherited from venture-prep.css */
</style>

