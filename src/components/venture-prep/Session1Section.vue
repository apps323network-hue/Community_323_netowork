<template>
  <section class="py-24 relative" id="session1">
    <!-- Session Header -->
    <div class="container mx-auto px-6">
      <div class="flex items-center gap-4 mb-8">
        <div class="number-badge-session1 text-2xl">1</div>
        <div>
          <span class="section-badge mb-2 inline-block">Session 1</span>
          <h2 class="font-display text-4xl md:text-5xl font-bold">
            <span class="gradient-text-session1">Day 1:</span> Ideas + Test
          </h2>
        </div>
      </div>

      <p class="text-muted-foreground text-lg max-w-3xl mb-4">
        Generate many ideas fast, then narrow to one strong direction and design a simple test to validate demand.
      </p>

      <!-- Funnel Visual -->
      <div class="flex items-center justify-center gap-2 md:gap-4 my-8 md:my-12">
        <div class="glass-card rounded-xl md:rounded-2xl px-3 md:px-8 py-3 md:py-6 text-center glow-primary">
          <span class="font-display text-2xl md:text-4xl font-bold text-session1">30</span>
          <p class="text-muted-foreground text-xs md:text-sm mt-1">Raw Ideas</p>
        </div>
        <div class="text-xl md:text-3xl text-muted-foreground">→</div>
        <div class="glass-card rounded-xl md:rounded-2xl px-3 md:px-8 py-3 md:py-6 text-center">
          <span class="font-display text-2xl md:text-4xl font-bold text-session1">3</span>
          <p class="text-muted-foreground text-xs md:text-sm mt-1">Finalists</p>
        </div>
        <div class="text-xl md:text-3xl text-muted-foreground">→</div>
        <div class="glass-card rounded-xl md:rounded-2xl px-3 md:px-8 py-3 md:py-6 text-center">
          <span class="font-display text-2xl md:text-4xl font-bold text-session1">1</span>
          <p class="text-muted-foreground text-xs md:text-sm mt-1">Validated</p>
        </div>
      </div>

      <!-- Deliverables -->
      <div class="grid md:grid-cols-2 gap-8 mb-16">
        <div class="glass-card rounded-2xl p-8">
          <div class="flex items-center gap-3 mb-6">
            <span class="material-symbols-outlined text-session1">target</span>
            <h3 class="font-display text-xl font-bold">Deliverables</h3>
          </div>
          <ul class="space-y-3">
            <li v-for="(item, i) in deliverables" :key="i" class="flex items-start gap-3">
              <span class="material-symbols-outlined text-session1 mt-0.5 shrink-0">task_alt</span>
              <span class="text-muted-foreground">{{ item }}</span>
            </li>
          </ul>
        </div>

        <div class="glass-card rounded-2xl p-8">
          <div class="flex items-center gap-3 mb-6">
            <span class="material-symbols-outlined text-session1">psychology</span>
            <h3 class="font-display text-xl font-bold">Pre-work (24–48h before)</h3>
          </div>
          <p class="text-muted-foreground mb-4">Students bring:</p>
          <ul class="space-y-3">
            <li v-for="(item, i) in prework" :key="i" class="flex items-start gap-3">
              <span class="material-symbols-outlined text-session1 mt-0.5 shrink-0">lightbulb</span>
              <span class="text-muted-foreground">{{ item }}</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- Agenda -->
      <div class="glass-card rounded-2xl p-8 mb-12">
        <div class="flex items-center gap-3 mb-8">
          <span class="material-symbols-outlined text-session1">schedule</span>
          <h3 class="font-display text-xl font-bold">Agenda (90 minutes)</h3>
        </div>
        <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div v-for="(item, i) in agendaItems" :key="i" class="bg-muted/30 rounded-xl p-4">
            <span class="text-session1 font-bold text-sm">{{ item.time }}</span>
            <h4 class="font-display font-semibold text-foreground mt-2">{{ item.title }}</h4>
            <p class="text-muted-foreground text-sm mt-1">{{ item.desc }}</p>
          </div>
        </div>
        <p class="text-center text-muted-foreground mt-6">
          <span class="text-session1 font-bold">Total time:</span> ~90 min
        </p>
      </div>

      <!-- Rubric -->
      <div class="glass-card rounded-2xl p-8 mb-12">
        <h3 class="font-display text-xl font-bold mb-6 flex items-center gap-3">
          <span class="material-symbols-outlined text-session1">groups</span>
          Top 3 Selection Rubric (1–5 scoring)
        </h3>
        <div class="grid md:grid-cols-5 gap-4">
          <div v-for="(item, i) in rubricItems" :key="i" class="bg-muted/30 rounded-xl p-4 text-center">
            <div class="number-badge-session1 text-lg mx-auto mb-3">{{ i + 1 }}</div>
            <p class="text-muted-foreground text-sm">{{ item }}</p>
          </div>
        </div>
      </div>

      <!-- Homework -->
      <div class="bg-gradient-to-r from-session1/10 to-transparent border-l-4 border-session1 rounded-r-2xl p-6">
        <h4 class="font-display font-bold text-foreground mb-3">📝 Homework (before Session 2)</h4>
        <ul class="space-y-2 text-muted-foreground">
          <li>• Complete 10 discovery conversations (or surveys if necessary)</li>
          <li>• Collect patterns: top pains, objections, willingness to pay/try</li>
          <li>• Bring 3 insights + 1 updated idea statement</li>
        </ul>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const agendaItems = [
  { time: "5 min", title: "Welcome + Rules", desc: "Pilot mindset: progress > perfection" },
  { time: "10 min", title: "What Makes a Strong Idea", desc: "Problem clarity, customer access, urgency" },
  { time: "25 min", title: "Idea Sprint", desc: "Pain points, jobs-to-be-done, unfair advantage" },
  { time: "20 min", title: "Filter & Score", desc: "Quick rubric to pick Top 3" },
  { time: "10 min", title: "Choose the One", desc: "Decide based on testability + access" },
  { time: "15 min", title: "Design the Test", desc: "Target user, hypothesis, success metric" },
  { time: "5 min", title: "Share-outs", desc: "Each student: idea + test in one minute" },
]

const rubricItems = [
  "Customer access (can you reach them this week?)",
  "Pain intensity (real, frequent, expensive)",
  "Differentiation (why you?)",
  "Speed to test (can you validate in 7 days?)",
  "Clarity (easy to explain in 30 seconds)",
]

const deliverables = [
  "List of 30 ideas",
  "Top 3 shortlist (with quick scoring)",
  "Top 1 final idea",
  "Test plan (what to test, with who, by when)"
]

const prework = [
  "10 problems they notice (life/work/community/campus)",
  "10 skills or advantages (language, experience, network)",
  "3 audiences they have access to",
]
</script>

<style scoped>
/* Styles inherited from venture-prep.css */
</style>

