<template>
  <section class="py-24 relative" id="assets">
    <div class="container mx-auto px-6">
      <div class="text-center mb-16">
        <span class="section-badge mb-4 inline-block">Program Assets</span>
        <h2 class="font-display text-4xl md:text-5xl font-bold mb-4">
          What You'll <span class="gradient-text">Take Home</span>
        </h2>
        <p class="text-muted-foreground text-lg max-w-xl mx-auto">
          Tangible deliverables you can use immediately to launch your venture.
        </p>
      </div>

      <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
        <div
          v-for="(asset, index) in assets"
          :key="index"
          class="glass-card rounded-2xl p-6 text-center hover:transform hover:-translate-y-2 transition-all duration-300"
        >
          <span class="material-symbols-outlined text-4xl mb-4 block gradient-text">
            {{ asset.icon }}
          </span>
          <h3 class="font-display text-lg font-bold text-foreground mb-2">
            {{ asset.title }}
          </h3>
          <p class="text-muted-foreground text-sm">
            {{ asset.description }}
          </p>
        </div>
      </div>

      <!-- CTA -->
      <div class="mt-16 text-center">
        <div class="glass-card rounded-3xl p-8 md:p-12 max-w-3xl mx-auto">
          <h3 class="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Ready to Build Your <span class="gradient-text">Venture?</span>
          </h3>
          <p class="text-muted-foreground text-lg mb-8">
            Join the next cohort and transform your idea into reality.
          </p>
          <button class="bg-primary text-primary-foreground px-8 py-4 rounded-full font-bold text-lg hover:opacity-90 transition-opacity">
            Apply Now
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const assets = [
  {
    icon: 'lightbulb',
    title: 'Validated Idea',
    description: 'Market-tested concept with customer feedback'
  },
  {
    icon: 'description',
    title: 'Business Plan',
    description: 'One-page model ready for execution'
  },
  {
    icon: 'map',
    title: '90-Day Roadmap',
    description: 'Clear milestones and action steps'
  },
  {
    icon: 'tv',
    title: 'Pitch Deck',
    description: 'Professional presentation materials'
  },
  {
    icon: 'groups',
    title: 'Network',
    description: 'Connections with peers and mentors'
  },
  {
    icon: 'school',
    title: 'Frameworks',
    description: 'Proven tools for venture building'
  },
  {
    icon: 'feedback',
    title: 'Expert Feedback',
    description: 'Actionable insights from pros'
  },
  {
    icon: 'rocket_launch',
    title: 'Launch Confidence',
    description: 'Skills to execute your vision'
  }
]
</script>

<style scoped>
.section-badge {
  background: rgba(139, 92, 246, 0.1);
  color: #8b5cf6;
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.glass-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
</style>

