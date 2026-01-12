<template>
  <div class="min-h-screen bg-background text-foreground venture-prep-page">
    <NavigationBar />
    <HeroSection />
    <OutcomesSection />
    <JourneySection />
    <Session1Section />
    <Session2Section />
    <Session3Section />
    <AssetsSection />
    
    <!-- Sponsors Section -->
    <section class="py-16 md:py-20 border-t border-gray-200 dark:border-gray-800">
      <div class="max-w-5xl mx-auto px-6">
        <h2 class="text-2xl md:text-3xl font-display font-bold text-center mb-12">
          Sponsors
        </h2>
        
        <div class="flex flex-wrap items-center justify-center gap-8 md:gap-12">
          <!-- Sponsor 1 - 323 Network -->
          <div class="w-32 h-20 md:w-40 md:h-24 rounded-lg flex items-center justify-center">
            <img src="/logo.png" alt="323 Network" class="max-w-full max-h-full object-contain" />
          </div>
          
          <!-- Sponsor 2 - The Future of English -->
          <div class="w-32 h-20 md:w-40 md:h-24 rounded-lg flex items-center justify-center">
            <img src="/sponsor-future-english.jpeg" alt="The Future of English" class="max-w-full max-h-full object-contain rounded" />
          </div>
          
          <!-- Sponsor 3 - Teacher Hollywood -->
          <div class="w-32 h-20 md:w-40 md:h-24 rounded-lg flex items-center justify-center">
            <img src="/sponsor-teacher-hollywood.jpeg" alt="Teacher Hollywood" class="max-w-full max-h-full object-contain rounded" />
          </div>
          
          <!-- Sponsor 4 - Brant -->
          <div class="w-32 h-20 md:w-40 md:h-24 rounded-lg flex items-center justify-center">
            <img src="/sponsor-brant.png" alt="Brant" class="max-w-full max-h-full object-contain" />
          </div>
          
          <!-- Sponsor 5 - G Crown -->
          <div class="w-32 h-20 md:w-40 md:h-24 rounded-lg flex items-center justify-center">
            <img src="/sponsor-g-crown.jpeg" alt="G Crown" class="max-w-full max-h-full object-contain rounded" />
          </div>
        </div>
      </div>
    </section>
    
    <!-- Footer -->
    <footer class="border-t border-gray-200 dark:border-gray-800">
      <!-- Author Section -->
      <div class="max-w-4xl mx-auto px-6 py-12 md:py-16">
        <h3 class="text-lg font-display font-semibold text-foreground mb-6 text-center md:text-left">
          Program Author
        </h3>
        
        <div class="flex flex-col md:flex-row items-center md:items-start gap-6">
          <!-- Author Photo -->
          <img 
            src="/author-ceme.jpeg" 
            alt="Ceme Suaiden Neto" 
            class="w-24 h-24 md:w-28 md:h-28 rounded-full object-cover border-2 border-border shrink-0"
          />
          
          <!-- Author Bio -->
          <p class="text-muted-foreground text-sm md:text-base leading-relaxed text-center md:text-left">
            <strong class="text-foreground">Ceme Suaiden Neto</strong> is an educator and entrepreneur with 27 years of experience in the education sector, combining hands-on teaching with a market-driven vision. He is the founder and CEO of <em>The Future of English Inc.</em>, a company focused on education and language development. He also leads the <em>American Dream</em> project, dedicated to guiding Brazilians to live, study, and work legally in the USA with full support. As the author of American Dream, he created <strong>US Venture Prep</strong>, a course designed to help students navigate the American university system and transform ideas into projects and businesses.
          </p>
        </div>
      </div>
      
      <!-- Copyright -->
      <div class="border-t border-gray-200 dark:border-gray-800/50 py-6 text-center">
        <p class="text-muted-foreground/70 text-xs">
          © US Venture Prep — An American Dream Program.
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import NavigationBar from '@/components/venture-prep/NavigationBar.vue'
import HeroSection from '@/components/venture-prep/HeroSection.vue'
import OutcomesSection from '@/components/venture-prep/OutcomesSection.vue'
import JourneySection from '@/components/venture-prep/JourneySection.vue'
import Session1Section from '@/components/venture-prep/Session1Section.vue'
import Session2Section from '@/components/venture-prep/Session2Section.vue'
import Session3Section from '@/components/venture-prep/Session3Section.vue'
import AssetsSection from '@/components/venture-prep/AssetsSection.vue'
</script>

<style scoped>
.venture-prep-page {
  scroll-behavior: smooth;
  background: hsl(var(--background));
  color: hsl(var(--foreground));
}
</style>

