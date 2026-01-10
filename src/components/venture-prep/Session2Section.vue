<template>
  <section class="py-24 relative bg-muted/20" id="session2">
    <div class="container mx-auto px-6">
      <!-- Session Header -->
      <div class="flex items-center gap-4 mb-8">
        <div class="number-badge-session2 text-2xl">2</div>
        <div>
          <span class="section-badge mb-2 inline-block">Session 2</span>
          <h2 class="font-display text-4xl md:text-5xl font-bold">
            <span class="gradient-text-session2">Class 2:</span> Business Plan
          </h2>
        </div>
      </div>

      <p class="text-muted-foreground text-lg max-w-3xl mb-12">
        Turn the chosen idea into a clear, executable one-page model aligned with the U.S. market and student reality.
      </p>

      <!-- Deliverables Grid -->
      <div class="grid md:grid-cols-2 gap-8 mb-16">
        <div class="glass-card rounded-2xl p-8">
          <div class="flex items-center gap-3 mb-6">
            <span class="material-symbols-outlined text-session2">target</span>
            <h3 class="font-display text-xl font-bold">Deliverables</h3>
          </div>
          <ul class="space-y-3">
            <li v-for="(item, i) in deliverables" :key="i" class="flex items-start gap-3">
              <span class="material-symbols-outlined text-session2 mt-0.5 shrink-0">task_alt</span>
              <span class="text-muted-foreground">{{ item }}</span>
            </li>
          </ul>
        </div>

        <div class="glass-card rounded-2xl p-8">
          <div class="flex items-center gap-3 mb-6">
            <span class="material-symbols-outlined text-session2">description</span>
            <h3 class="font-display text-xl font-bold">Pre-work (from Session 1)</h3>
          </div>
          <ul class="space-y-3">
            <li v-for="(item, i) in prework" :key="i" class="flex items-start gap-3">
              <span class="material-symbols-outlined text-session2 mt-0.5 shrink-0">task_alt</span>
              <span class="text-muted-foreground">{{ item }}</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- Agenda -->
      <div class="glass-card rounded-2xl p-8 mb-12">
        <div class="flex items-center gap-3 mb-8">
          <span class="material-symbols-outlined text-session2">schedule</span>
          <h3 class="font-display text-xl font-bold">Agenda (90 minutes)</h3>
        </div>
        <div class="grid md:grid-cols-3 gap-4">
          <div v-for="(item, i) in agendaItems" :key="i" class="bg-muted/30 rounded-xl p-4">
            <span class="text-session2 font-bold text-sm">{{ item.time }}</span>
            <h4 class="font-display font-semibold text-foreground mt-2">{{ item.title }}</h4>
            <p class="text-muted-foreground text-sm mt-1">{{ item.desc }}</p>
          </div>
        </div>
        <p class="text-center text-muted-foreground mt-6">
          <span class="text-session2 font-bold">Total time:</span> ~90 min
        </p>
      </div>

      <!-- One-Page Model Template -->
      <div class="glass-card rounded-2xl p-8 mb-12">
        <h3 class="font-display text-xl font-bold mb-6 flex items-center gap-3">
          <span class="material-symbols-outlined text-session2">description</span>
          One-Page Model Sections
        </h3>
        <div class="grid md:grid-cols-3 gap-3">
          <div v-for="(section, i) in modelSections" :key="i" class="flex items-center gap-3 bg-muted/30 rounded-xl p-4">
            <div class="number-badge-session2 text-sm w-8 h-8">{{ i + 1 }}</div>
            <span class="text-muted-foreground text-sm">{{ section }}</span>
          </div>
        </div>
      </div>

      <!-- 90-Day Roadmap Visual -->
      <div class="glass-card rounded-2xl p-8 mb-12">
        <div class="flex items-center gap-3 mb-8">
          <span class="material-symbols-outlined text-session2">calendar_month</span>
          <h3 class="font-display text-xl font-bold">90-Day Roadmap Structure</h3>
        </div>
        <div class="grid md:grid-cols-3 gap-6">
          <div v-for="(phase, i) in roadmapPhases" :key="i" class="text-center">
            <div class="bg-gradient-to-br from-session2/20 to-transparent rounded-2xl p-6 border border-session2/30">
              <span class="text-session2 text-sm font-medium">{{ phase.phase }}</span>
              <h4 class="font-display text-2xl font-bold text-foreground mt-2">{{ phase.title }}</h4>
              <p class="text-muted-foreground text-sm mt-1">{{ phase.weeks }}</p>
              <p class="text-muted-foreground text-sm mt-3">{{ phase.desc }}</p>
            </div>
            <div v-if="i < 2" class="hidden md:block text-3xl text-session2 mt-4">→</div>
          </div>
        </div>
      </div>

      <!-- Homework -->
      <div class="bg-gradient-to-r from-session2/10 to-transparent border-l-4 border-session2 rounded-r-2xl p-6">
        <h4 class="font-display font-bold text-foreground mb-3">📝 Homework (before Final)</h4>
        <ul class="space-y-2 text-muted-foreground">
          <li>• Build a simple pitch deck (5–7 slides)</li>
          <li>• Create one proof element: waitlist/landing page, demo/mockup, pre-orders, partner conversation, or interview summary</li>
        </ul>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const agendaItems = [
  { time: "15 min", title: "Discovery Debrief", desc: "What did you learn? What changed?" },
  { time: "10 min", title: "One-Page Model Walkthrough", desc: "Keep it simple, not academic fluff" },
  { time: "35 min", title: "Build the One-Page Plan", desc: "Students fill the template live" },
  { time: "15 min", title: "90-Day Roadmap", desc: "Build → Test → Improve phases" },
  { time: "10 min", title: "Peer Review", desc: "Feedback using a checklist" },
  { time: "5 min", title: "Pitch Prep Briefing", desc: "What Final Pitch Day requires" },
]

const modelSections = [
  "Customer / target persona",
  "Problem (1–2 sentences)",
  "Solution (what you offer)",
  "Value proposition (why it matters)",
  "How you reach customers (channels)",
  "Revenue / pricing hypothesis",
  "Costs / resources needed",
  "Key risks + assumptions",
  "Next experiments (what you'll test next)",
]

const deliverables = [
  "One-page business plan/model",
  "A clear 90-day action roadmap (simple weekly milestones)"
]

const prework = [
  "Summary of discovery conversations",
  "Updated idea statement (problem → customer → solution)",
]

const roadmapPhases = [
  { phase: "Phase 1", title: "Build", weeks: "Weeks 1-4", desc: "Create MVP, set up basics" },
  { phase: "Phase 2", title: "Test", weeks: "Weeks 5-8", desc: "Validate with real users" },
  { phase: "Phase 3", title: "Improve", weeks: "Weeks 9-12", desc: "Iterate based on feedback" },
]
</script>

<style scoped>
/* Styles inherited from venture-prep.css */
</style>

