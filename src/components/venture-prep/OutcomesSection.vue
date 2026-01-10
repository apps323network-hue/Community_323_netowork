<template>
  <section class="py-24 relative">
    <div class="container mx-auto px-6">
      <div class="text-center mb-16">
        <span class="section-badge mb-4 inline-block">Program Outcomes</span>
        <h2 class="font-display text-4xl md:text-5xl font-bold mb-4">
          What You'll <span class="gradient-text">Finish With</span>
        </h2>
        <p class="text-muted-foreground text-lg max-w-xl mx-auto">
          By the end, each student will have tangible assets ready for launch.
        </p>
      </div>

      <div class="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        <div
          v-for="(outcome, index) in outcomes"
          :key="index"
          class="glass-card-hover rounded-2xl p-8 text-center"
          :style="{ animationDelay: `${index * 0.1}s` }"
        >
          <div
            :class="`number-badge-${outcome.color}`"
            class="mx-auto mb-6"
          >
            {{ outcome.number }}
          </div>
          <h3 class="font-display text-xl font-bold text-foreground mb-3">
            {{ outcome.title }}
          </h3>
          <p class="text-muted-foreground text-sm leading-relaxed">
            {{ outcome.description }}
          </p>
          <span 
            class="material-symbols-outlined mx-auto mt-4 block" 
            :class="`text-${outcome.color}`"
          >
            check_circle
          </span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const outcomes = [
  {
    number: "1",
    title: "Validated Venture Idea",
    description: "Chosen from 30 → 3 → 1 process with real customer feedback",
    color: "session1",
  },
  {
    number: "2",
    title: "One-Page Business Plan",
    description: "A clear, executable model aligned with the U.S. market",
    color: "session2",
  },
  {
    number: "3",
    title: "Shark Tank Pitch",
    description: "Confidence, feedback, and concrete next steps",
    color: "session3",
  },
]
</script>

<style scoped>
.glass-card-hover:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.number-badge-session1,
.number-badge-session2,
.number-badge-session3 {
  width: 4rem;
  height: 4rem;
  font-size: 1.5rem;
}
</style>

