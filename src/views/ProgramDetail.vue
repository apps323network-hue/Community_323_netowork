<template>
  <AppLayout>
    <div>
      <!-- Loading State -->
      <div v-if="programsStore.loading" class="flex flex-col justify-center items-center h-[60vh] gap-4">
        <div class="relative w-16 h-16">
          <div class="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
          <div class="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p class="text-slate-400 font-bold uppercase tracking-widest text-xs animate-pulse">{{ t('programs.loadingProgram') }}</p>
      </div>

      <!-- Program Content -->
      <div v-else-if="program" class="max-w-7xl mx-auto px-4 py-8">
        <!-- Hero Section (Contained Banner) -->
        <div class="relative w-full h-[350px] md:h-[450px] rounded-[32px] overflow-hidden shadow-2xl mb-12">
          <!-- Background Image -->
          <div class="absolute inset-0">
            <img
              v-if="program.banner_url"
              :src="program.banner_url"
              :alt="title"
              class="w-full h-full object-cover"
            />
            <div v-else class="w-full h-full bg-gradient-to-br from-slate-900 via-primary/20 to-secondary/20"></div>
            
            <!-- Shaded Overlays for Text Readability -->
            <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
            <div class="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent hidden md:block"></div>
          </div>

          <!-- Hero Content -->
          <div class="absolute inset-0 flex flex-col justify-end p-6 md:p-12">
            <div class="max-w-3xl space-y-4 md:space-y-6">
              <!-- Category Badge -->
               <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-black uppercase tracking-widest w-fit">
                <span class="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
                {{ t(`programs.categoryBadges.${program.category}`) }}
              </div>

              <h1 class="text-2xl md:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight">
                {{ title }}
              </h1>

              <div class="flex flex-wrap items-center gap-4 md:gap-6 text-white/90">
                <div v-if="program.instructor_name" class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-secondary p-0.5 shadow-lg">
                    <div class="w-full h-full rounded-full bg-slate-900 flex items-center justify-center font-bold text-[10px] text-white uppercase">
                      {{ program.instructor_name.substring(0, 2) }}
                    </div>
                  </div>
                  <div>
                    <p class="text-[8px] font-bold uppercase tracking-wider text-white/50 leading-none mb-1">{{ t('programs.instructorLabel') }}</p>
                    <p class="font-bold text-xs md:text-base text-white">{{ program.instructor_name }}</p>
                  </div>
                </div>

                <div v-if="program.duration_hours" class="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl backdrop-blur-sm border border-white/5">
                  <span class="material-icons text-primary text-xs md:text-sm">schedule</span>
                  <span class="font-bold text-[10px] md:text-sm">{{ program.duration_hours }} {{ t('programs.hoursLabel') }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="relative z-10 pb-20">
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            <!-- Sidebar (Desktop Left/Bottom Mobile) - Moved Right -->
            <div class="lg:col-span-8 space-y-8">
              <!-- About -->
              <section class="bg-white dark:bg-surface-dark rounded-3xl p-6 md:p-8 shadow-xl border border-slate-200 dark:border-white/5 transition-all hover:shadow-primary/5">
                <div class="flex items-center gap-3 mb-6">
                  <div class="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                    <span class="material-icons text-lg md:text-2xl">description</span>
                  </div>
                  <h2 class="text-xl md:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    {{ t('programs.aboutProgram') }}
                  </h2>
                </div>
                <div class="text-slate-700 dark:text-gray-300 whitespace-pre-line leading-relaxed text-base md:text-lg">
                  {{ description }}
                </div>
              </section>

              <!-- Mobile Price Card (Visible only on mobile) -->
              <div class="block lg:hidden px-2">
                <div class="bg-white dark:bg-surface-dark rounded-[32px] p-6 md:p-8 shadow-2xl border border-slate-200 dark:border-white/5 overflow-hidden relative group">
                  <div class="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-colors"></div>
                  
                  <div class="relative space-y-6">
                    <div class="text-center space-y-2">
                      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                        {{ t('programs.bestOffer') }}
                      </div>
                      <div class="flex justify-center items-baseline gap-1">
                        <span class="text-2xl font-black text-slate-900 dark:text-white leading-none">$</span>
                        <span class="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-slate-900 via-primary to-secondary dark:from-white leading-none tracking-tighter">
                          {{ program.price_usd }}
                        </span>
                      </div>
                      <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{{ t('programs.paymentModal.total') }} {{ t('programs.oneTimePayment') }}</p>
                    </div>

                    <!-- CTA Button -->
                    <div class="space-y-4">
                      <!-- Aviso Localhost -->
                      <div v-if="program.localhost_only && isLocalhost()" class="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-center">
                        <p class="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center justify-center gap-2">
                          <span class="material-icons text-sm">bug_report</span>
                          {{ t('programs.debugMode') }}
                        </p>
                      </div>
                      
                      <button
                        v-if="!isEnrolled"
                        @click="handleRequestEnroll"
                        :disabled="isSoldOut || submitting"
                        class="w-full group relative py-4 px-6 rounded-2xl font-black text-black overflow-hidden transition-all duration-300 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed shadow-2xl shadow-primary/30"
                        :class="program.localhost_only && isLocalhost() ? 'bg-amber-500 hover:bg-amber-600' : ''"
                      >
                        <div v-if="!(program.localhost_only && isLocalhost())" class="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_auto] animate-gradient-x transition-all"></div>
                        <span class="relative flex items-center justify-center gap-3 uppercase tracking-widest text-xs text-black">
                          <template v-if="submitting">
                            <span class="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                            {{ t('programs.paymentModal.processing') }}
                          </template>
                          <template v-else>
                            <template v-if="program.localhost_only && isLocalhost()">
                              {{ t('programs.debugAccess') }}
                            </template>
                            <template v-else>
                              {{ isSoldOut ? t('programs.programFull') : (isAuthenticated ? t('programs.paymentModal.enroll') : t('programs.actions.secureMySpot')) }}
                              <span class="material-icons text-sm font-bold group-hover:translate-x-1 transition-transform">play_arrow</span>
                            </template>
                          </template>
                        </span>
                      </button>

                      <div v-else class="space-y-4">
                        <div class="py-4 bg-green-500/10 border border-green-500/20 text-green-500 rounded-2xl font-black text-center flex items-center justify-center gap-2 uppercase tracking-widest text-xs shadow-inner">
                          <span class="material-icons text-lg">check_circle</span>
                           {{ t('programs.enrolledUpper') }}
                        </div>
                        <RouterLink
                          :to="`/programs/${program.id}/assistir`"
                          class="flex items-center justify-center gap-3 w-full py-4 rounded-2xl bg-secondary text-black font-black uppercase tracking-widest text-xs hover:scale-[1.02] transition-all shadow-xl shadow-secondary/20"
                        >
                          <span class="material-icons">play_circle</span>
                          {{ t('programs.watchNow') }}
                        </RouterLink>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Prerequisites -->
              <section v-if="prerequisites" class="bg-white dark:bg-surface-dark rounded-3xl p-8 shadow-xl border border-slate-200 dark:border-white/5">
                <div class="flex items-center gap-3 mb-6">
                  <div class="w-12 h-12 rounded-2xl bg-yellow-500/10 flex items-center justify-center text-yellow-500">
                    <span class="material-icons">assignment_late</span>
                  </div>
                  <h2 class="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    {{ t('programs.prerequisites') }}
                  </h2>
                </div>
                <div class="text-slate-700 dark:text-gray-300 whitespace-pre-line leading-relaxed bg-slate-50 dark:bg-white/5 p-6 rounded-2xl border border-dashed border-slate-200 dark:border-white/10">
                  {{ prerequisites }}
                </div>
              </section>

              <!-- Curriculum -->
              <section class="space-y-6">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2">
                  <div class="flex items-center gap-3">
                    <div class="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary shrink-0">
                      <span class="material-icons">list_alt</span>
                    </div>
                    <h2 class="text-xl md:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                      {{ t('programs.curriculum') }}
                    </h2>
                  </div>
                  <div class="flex gap-4 sm:text-right px-1 md:px-0">
                    <div>
                       <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">{{ modules.length }} {{ t('programs.modules') }}</span>
                    </div>
                    <div>
                       <span class="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">{{ totalLessons }} {{ t('programs.lessons') }}</span>
                    </div>
                  </div>
                </div>
                
                <div class="space-y-4">
                  <div 
                    v-for="(module, index) in modules" 
                    :key="module.id" 
                    class="group bg-white dark:bg-surface-dark rounded-2xl p-5 md:p-6 shadow-sm border border-slate-200 dark:border-white/5 hover:border-secondary/30 transition-all duration-300"
                  >
                    <div class="flex flex-col sm:flex-row items-start gap-4 md:gap-5">
                      <div class="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center font-black text-slate-400 dark:text-gray-500 transition-colors group-hover:bg-secondary group-hover:text-black shrink-0">
                        {{ String(index + 1).padStart(2, '0') }}
                      </div>
                      <div class="flex-1 w-full">
                        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                          <h3 class="font-bold text-base md:text-lg text-slate-900 dark:text-white group-hover:text-secondary transition-colors leading-tight">
                            {{ getTranslatedTitle(module) }}
                          </h3>
                           <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest shrink-0">{{ module.lessons?.length || 0 }} {{ t('programs.lessons') }}</span>
                        </div>
                        <p v-if="getTranslatedDescription(module)" class="text-slate-600 dark:text-gray-400 text-sm leading-relaxed mb-4">{{ getTranslatedDescription(module) }}</p>
                        
                        <!-- List of lessons (compact) -->
                        <div v-if="module.lessons && module.lessons.length > 0" class="space-y-3 mt-4 pl-4 border-l-2 border-slate-100 dark:border-white/5">
                          <div 
                            v-for="lesson in module.lessons" 
                            :key="lesson.id"
                            class="flex items-start gap-3 text-sm text-slate-500 dark:text-gray-400"
                          >
                             <span class="material-icons text-xs mt-0.5 opacity-50 shrink-0">play_circle</span>
                             <div class="flex flex-wrap items-center gap-2 flex-1 min-w-0">
                               <span class="font-bold text-slate-700 dark:text-gray-300 leading-tight">
                                 {{ getTranslatedTitle(lesson) }}
                               </span>
                               <span v-if="lesson.is_preview" class="text-[8px] font-black uppercase text-secondary border border-secondary/30 px-1.5 py-0.5 rounded shrink-0">Preview</span>
                             </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <!-- Instructor Info -->
              <section v-if="program.instructor_name" class="bg-gradient-to-br from-slate-900 to-black rounded-3xl p-8 shadow-2xl border border-white/5 relative overflow-hidden group">
                 <div class="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                    <span class="material-icons text-9xl">school</span>
                 </div>
                 
                 <div class="relative flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
                    <div class="w-32 h-32 rounded-3xl bg-gradient-to-tr from-primary to-secondary p-1 rotate-3 group-hover:rotate-6 transition-transform shadow-2xl overflow-hidden shrink-0">
                       <div class="w-full h-full rounded-[20px] bg-slate-900 flex items-center justify-center">
                          <span class="text-3xl font-black text-white">{{ program.instructor_name.substring(0, 2).toUpperCase() }}</span>
                       </div>
                    </div>
                    
                    <div class="space-y-4 max-w-xl">
                       <div>
                          <p class="text-xs font-bold text-primary uppercase tracking-widest mb-1">{{ t('programs.programInstructor') }}</p>
                          <h3 class="text-3xl font-black text-white tracking-tight">{{ program.instructor_name }}</h3>
                       </div>
                       <p v-if="program.instructor_bio" class="text-slate-400 leading-relaxed italic">
                          "{{ program.instructor_bio }}"
                       </p>
                       <div class="flex gap-4 justify-center md:justify-start">
                          <div class="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-bold flex items-center gap-2">
                             <span class="material-icons text-sm">verified</span>
                              {{ t('programs.verifiedExpert') }}
                          </div>
                       </div>
                    </div>
                 </div>
              </section>

              <!-- Reviews -->
              <section class="bg-white dark:bg-surface-dark rounded-3xl p-8 shadow-xl border border-slate-200 dark:border-white/5">
                <div class="flex items-center justify-between mb-8">
                  <div class="flex items-center gap-3">
                    <div class="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                      <span class="material-icons">star</span>
                    </div>
                    <h2 class="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                      {{ t('programs.reviews') }}
                    </h2>
                  </div>
                </div>
                
                <div class="flex flex-col items-center justify-center py-10 opacity-40">
                  <span class="material-icons text-6xl mb-4">rate_review</span>
                  <p class="font-bold text-slate-500 dark:text-gray-400 uppercase tracking-widest text-xs">
                    {{ t('programs.noReviews') }}
                  </p>
                </div>
              </section>
            </div>

            <!-- Sticky Sidebar Checkout (Visible only on desktop) -->
            <div class="hidden lg:block lg:col-span-4 lg:sticky lg:top-24 h-fit space-y-6">
              <div class="bg-white dark:bg-surface-dark rounded-[32px] p-8 shadow-2xl border border-slate-200 dark:border-white/5 overflow-hidden relative group">
                <!-- Decorative Elements -->
                <div class="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-colors"></div>
                
                <div class="relative space-y-8">
                  <!-- Price Header -->
                  <div class="text-center space-y-2">
                    <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                       {{ t('programs.bestOffer') }}
                    </div>
                    <div class="flex justify-center items-baseline gap-1">
                      <span class="text-3xl font-black text-slate-900 dark:text-white leading-none">$</span>
                      <span class="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-slate-900 via-primary to-secondary dark:from-white leading-none tracking-tighter">
                        {{ program.price_usd }}
                      </span>
                    </div>
                     <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">{{ t('programs.paymentModal.total') }} {{ t('programs.oneTimePayment') }}</p>
                  </div>

                  <!-- Quick Stats -->
                  <div class="grid grid-cols-2 gap-4">
                    <div class="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 text-center">
                       <span class="material-icons text-primary mb-1">people_alt</span>
                        <p class="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{{ t('programs.students') }}</p>
                       <p class="text-lg font-black text-slate-900 dark:text-white">{{ program.current_students || 0 }}</p>
                    </div>
                    <div class="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 text-center">
                       <span class="material-icons text-secondary mb-1">verified</span>
                        <p class="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{{ t('programs.spots') }}</p>
                       <p class="text-lg font-black text-slate-900 dark:text-white">{{ program.max_students || '∞' }}</p>
                    </div>
                  </div>

                  <!-- CTA Button -->
                  <div class="space-y-4">
                    <!-- Localhost testing enabled - no restrictions -->
                    
                    <button
                      v-if="!isEnrolled"
                      @click="handleRequestEnroll"
                      :disabled="isSoldOut || submitting"
                      class="w-full group relative py-5 px-6 rounded-2xl font-black text-black overflow-hidden transition-all duration-300 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed shadow-2xl shadow-primary/30"
                    >
                      <!-- Gradient Background -->
                      <div class="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_auto] animate-gradient-x transition-all"></div>
                      
                      <!-- Text content -->
                      <span class="relative flex items-center justify-center gap-3 uppercase tracking-widest text-sm">
                        <template v-if="submitting">
                          <span class="w-5 h-5 border-3 border-black border-t-transparent rounded-full animate-spin"></span>
                          {{ t('programs.paymentModal.processing') }}
                        </template>
                        <template v-else>
                          {{ isSoldOut ? t('programs.programFull') : (isAuthenticated ? t('programs.paymentModal.enroll') : t('programs.actions.secureMySpot')) }}
                          <span class="material-icons font-bold group-hover:translate-x-1 transition-transform">play_arrow</span>
                        </template>
                      </span>
                    </button>

                    <div v-else class="space-y-4">
                      <div class="py-5 bg-green-500/10 border border-green-500/20 text-green-500 rounded-2xl font-black text-center flex items-center justify-center gap-2 uppercase tracking-widest text-sm shadow-inner">
                        <span class="material-icons text-xl">check_circle</span>
                        {{ t('programs.enrollmentSuccess').split(' ')[0] }}
                      </div>
                      
                      <RouterLink
                        :to="`/programs/${program.id}/assistir`"
                        class="flex items-center justify-center gap-3 w-full py-5 rounded-2xl bg-secondary text-black font-black uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-secondary/20"
                      >
                        <span class="material-icons text-xl">play_circle</span>
                        {{ t('programs.watchNow') }}
                      </RouterLink>
                    </div>
                  </div>

                  <!-- Program Metadata -->
                  <div class="space-y-4 pt-4 border-t border-slate-100 dark:border-white/10">
                    <div class="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                       <div class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                          <span class="material-icons text-sm">history</span>
                       </div>
                       <div>
                           <p class="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{{ t('programs.lastUpdate') }}</p>
                          <p class="text-xs font-bold text-slate-700 dark:text-white">{{ new Date(program.updated_at).toLocaleDateString() }}</p>
                       </div>
                    </div>
                    <div class="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                       <div class="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary">
                          <span class="material-icons text-sm">language</span>
                       </div>
                       <div>
                           <p class="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{{ t('programs.language') }}</p>
                           <p class="text-xs font-bold text-slate-700 dark:text-white">{{ t('programs.languagePortuguese') }}</p>
                       </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Support Card -->
              <RouterLink to="/contact-us" class="block">
                <div class="p-6 rounded-3xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center gap-4 border border-white/10 shadow-xl group cursor-pointer overflow-hidden relative hover:scale-[1.02] transition-all duration-300">
                   <div class="absolute -right-4 -bottom-4 opacity-5 group-hover:rotate-12 transition-transform">
                      <span class="material-icons text-7xl">support_agent</span>
                   </div>
                   <div class="w-12 h-12 rounded-2xl bg-white/10 dark:bg-black/10 flex items-center justify-center shrink-0">
                      <span class="material-icons">help_outline</span>
                   </div>
                    <div>
                      <h4 class="font-bold text-sm leading-tight">{{ t('programs.supportQuestion') }}</h4>
                      <p class="text-xs opacity-60">{{ t('programs.supportContact') }}</p>
                    </div>
                </div>
              </RouterLink>
            </div>

          </div>
        </div>
      </div>

      <!-- Not Found -->
      <div v-else class="container mx-auto px-4 py-32 text-center">
        <div class="inline-flex w-24 h-24 items-center justify-center bg-slate-200 dark:bg-white/10 rounded-[32px] mb-8 animate-bounce">
           <span class="text-5xl">🔭</span>
        </div>
        <h3 class="text-4xl font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tighter">
          {{ t('programs.notFoundGalaxy') }}
        </h3>
         <p class="text-slate-500 dark:text-gray-400 mb-10 max-w-md mx-auto text-lg">{{ t('programs.notFoundDescription') }}</p>
        <RouterLink to="/programs" class="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-primary text-black font-black uppercase tracking-widest text-sm shadow-2xl shadow-primary/30 hover:scale-105 transition-all">
          <span class="material-icons">explore</span>
           {{ t('programs.exploreNewContent') }}
        </RouterLink>
      </div>
    </div>

    <!-- Modal de Matrícula / Checkout (Keep Original Logic for now, style can be polished if needed) -->
    <Modal
      v-if="program"
      v-model="showCheckoutModal"
      :title="'Matrícula: ' + title"
    >
      <div class="flex flex-col gap-6 p-1">
        <!-- Descrição -->
        <p class="text-sm text-slate-600 dark:text-gray-300 leading-relaxed">
          Você está a um passo de transformar sua carreira. Inscreva-se em <strong class="text-slate-900 dark:text-white">{{ title }}</strong> e tenha acesso imediato aos conteúdos.
        </p>

        <!-- Preço e Taxas -->
        <div class="space-y-4">
          <div class="p-5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-4">
            <div class="flex justify-between items-center text-sm">
              <span class="text-slate-500 dark:text-gray-400">Investimento Base</span>
              <span class="text-slate-900 dark:text-white font-bold">{{ formatPrice(program.price_usd * 100, paymentMethod === 'pix' ? 'BRL' : 'USD') }}</span>
            </div>
            
            <!-- Show discount if coupon applied -->
            <div v-if="appliedCoupon" class="flex justify-between items-center text-sm">
              <span class="text-green-600 dark:text-green-400 font-bold flex items-center gap-1">
                <span class="material-icons text-xs">local_offer</span>
                Desconto ({{ appliedCoupon.code }})
              </span>
              <span class="text-green-600 dark:text-green-400 font-bold">-{{ formatPrice(discountAmount, paymentMethod === 'pix' ? 'BRL' : 'USD') }}</span>
            </div>

            <div class="flex justify-between items-center text-sm">
              <span class="text-slate-500 dark:text-gray-400">Taxas {{ paymentMethod === 'card' ? '(3.9% + $0.30)' : '(~1.8%)' }}</span>
              <span class="text-slate-900 dark:text-white font-bold">
                {{ formatPrice(calculateCurrentFee(), paymentMethod === 'pix' ? 'BRL' : 'USD') }}
              </span>
            </div>
            
            <div class="border-t border-dashed border-slate-300 dark:border-white/10 pt-4">
              <div class="flex justify-between items-center">
                <span class="text-slate-900 dark:text-white font-black uppercase text-xs tracking-widest">Total Final</span>
                <span class="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                  {{ formatFinalPrice() }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Coupon Section -->
        <div class="space-y-3">
          <label class="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-gray-400">{{ t('coupons.code') || 'Cupom de Desconto' }}</label>
          <div class="flex gap-2">
            <input
              v-model="couponCode"
              type="text"
              placeholder="Digite o código do cupom"
              :disabled="couponLoading || !!appliedCoupon"
              class="flex-1 px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark text-slate-900 dark:text-white focus:ring-2 focus:ring-primary dark:focus:ring-secondary outline-none uppercase font-mono transition-all disabled:opacity-50"
            />
            <button
              v-if="!appliedCoupon"
              @click="handleApplyCoupon()"
              :disabled="!couponCode.trim() || couponLoading"
              class="px-6 py-3 rounded-xl bg-secondary text-black font-bold hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100 shadow-lg"
            >
              {{ couponLoading ? 'Verificando...' : 'Aplicar' }}
            </button>
            <button
              v-else
              @click="handleRemoveCoupon"
              class="px-6 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 font-bold hover:bg-red-500/20 transition-all"
            >
              Remover
            </button>
          </div>
          
          <!-- Coupon feedback messages -->
          <div v-if="couponError" class="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs">
            <span class="material-icons text-sm">error</span>
            <span>{{ t(`coupons.errors.${couponError}`) || 'Cupom inválido' }}</span>
          </div>
          <div v-if="appliedCoupon" class="flex items-center gap-2 p-3 rounded-xl bg-green-500/10 border border-green-500/20  text-green-500 text-xs">
            <span class="material-icons text-sm">check_circle</span>
            <span>{{ t('coupons.applied') || 'Cupom aplicado com sucesso!' }}</span>
          </div>
        </div>

        <!-- Termos e Condições (Se houver) -->
        <div v-if="program.terms_content_pt || program.terms_content_en" class="space-y-3">
          <div class="flex items-start gap-3 p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 group cursor-pointer" @click="acceptedTerms = !acceptedTerms">
            <div class="flex items-center justify-center pt-0.5">
              <input
                v-model="acceptedTerms"
                type="checkbox"
                class="w-5 h-5 rounded border-2 border-slate-300 dark:border-white/20 text-primary focus:ring-primary bg-white dark:bg-surface-dark transition-all cursor-pointer"
                @click.stop
              />
            </div>
            <div class="flex-1">
              <p class="text-xs font-bold text-slate-700 dark:text-gray-300 leading-normal">
                Eu li e concordo com os <button type="button" @click.stop="showTermsModal = true" class="text-primary hover:underline decoration-2 underline-offset-2">Termos e Condições</button> específicos deste programa.
              </p>
            </div>
          </div>
        </div>

        <!-- Método de Pagamento -->
        <div class="space-y-4">
          <label class="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-gray-400">Método de Pagamento</label>
          <div class="grid grid-cols-2 gap-4">
            <button
              @click="paymentMethod = 'card'"
              class="flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all group relative overflow-hidden"
              :class="paymentMethod === 'card' 
                ? 'border-primary bg-primary/10 text-slate-900 dark:text-white shadow-xl shadow-primary/20' 
                : 'border-slate-200 dark:border-white/10 hover:border-primary/30 text-slate-600 dark:text-gray-400'"
            >
              <span class="material-icons text-3xl group-hover:scale-110 transition-transform">credit_card</span>
              <span class="text-sm font-black uppercase tracking-tight">Cartão</span>
            </button>
            <button
              @click="paymentMethod = 'pix'"
              class="flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all group relative overflow-hidden"
              :class="paymentMethod === 'pix' 
                ? 'border-secondary bg-secondary/10 text-slate-900 dark:text-white shadow-xl shadow-secondary/20' 
                : 'border-slate-200 dark:border-white/10 hover:border-secondary/30 text-slate-600 dark:text-gray-400'"
            >
              <span class="material-icons text-3xl group-hover:scale-110 transition-transform">qr_code</span>
              <span class="text-sm font-black uppercase tracking-tight">PIX</span>
            </button>
          </div>
        </div>

        <!-- Botão de Ação -->
        <div class="space-y-4 pt-4">
          <button
            @click="handleCheckout"
            :disabled="!!(submitting || !paymentMethod || (!!(program?.terms_content_pt || program?.terms_content_en) && !acceptedTerms))"
            class="w-full rounded-2xl bg-gradient-to-r from-primary to-secondary py-5 text-sm font-black text-black shadow-2xl shadow-primary/30 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed uppercase tracking-widest"
          >
            <template v-if="submitting">
              <span class="flex items-center justify-center gap-3">
                <span class="w-5 h-5 border-4 border-black border-t-transparent rounded-full animate-spin"></span>
                Iniciando...
              </span>
            </template>
            <template v-else>
              Finalizar Inscrição
            </template>
          </button>
        </div>
      </div>
    </Modal>

    <!-- Modal de Termos -->
    <Modal
      v-if="program"
      v-model="showTermsModal"
      title="Termos e Condições"
      size="lg"
    >
      <div class="p-2 space-y-4">
        <div class="prose dark:prose-invert max-w-none">
          <div class="text-sm text-slate-700 dark:text-gray-300 whitespace-pre-line leading-relaxed h-[60vh] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
            {{ currentLocale === 'pt-BR' ? (program.terms_content_pt || program.terms_content_en) : (program.terms_content_en || program.terms_content_pt) }}
          </div>
        </div>
        <div class="flex justify-end pt-4 border-t border-slate-100 dark:border-white/5">
          <button
            @click="showTermsModal = false"
            class="px-6 py-2 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-white font-bold hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
          >
            Fechar
          </button>
        </div>
      </div>
    </Modal>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLocale } from '@/composables/useLocale'
import { useProgramsStore } from '@/stores/programs'
import { useModulesStore } from '@/stores/modules'
import { useSupabase } from '@/composables/useSupabase'
import { usePublicAccess } from '@/composables/usePublicAccess'
import { useCoupons } from '@/composables/useCoupons'
import AppLayout from '@/components/layout/AppLayout.vue'
import Modal from '@/components/ui/Modal.vue'
import { toast } from 'vue-sonner'
import { fetchExchangeRate, calculatePixAmount } from '@/lib/exchange'
import { isLocalhost } from '@/utils/localhost'
import type { Coupon } from '@/composables/useCoupons'

const route = useRoute()
const router = useRouter()
const { t, locale: currentLocale } = useLocale()
const { supabase } = useSupabase()
const programsStore = useProgramsStore()
const modulesStore = useModulesStore()
const { isAuthenticated, showAuthModal } = usePublicAccess()

const programId = computed(() => route.params.id as string)
const program = computed(() => programsStore.currentProgram)
const showCheckoutModal = ref(false)
const submitting = ref(false)
const paymentMethod = ref<'card' | 'pix' | null>(null)
const exchangeRate = ref(5.95) // Taxa USD -> BRL
const acceptedTerms = ref(false)
const showTermsModal = ref(false)

// Coupon state
const { validateCoupon, calculateDiscount, recordCouponUse } = useCoupons()
const couponCode = ref('')
const couponLoading = ref(false)
const couponError = ref<string | null>(null)
const appliedCoupon = ref<Coupon | null>(null)
const discountAmount = ref(0)

const title = computed(() =>
  program.value
    ? currentLocale.value === 'pt-BR'
      ? program.value.title_pt
      : program.value.title_en
    : ''
)

const description = computed(() =>
  program.value
    ? currentLocale.value === 'pt-BR'
      ? program.value.description_pt
      : program.value.description_en
    : ''
)

const prerequisites = computed(() =>
  program.value
    ? currentLocale.value === 'pt-BR'
      ? program.value.prerequisites_pt
      : program.value.prerequisites_en
    : null
)

const modules = computed(() => modulesStore.getModulesByProgram(programId.value))

const totalLessons = computed(() => {
  return modules.value.reduce((sum, m) => sum + (m.lessons?.length || 0), 0)
})

const getTranslatedTitle = (item: any) => {
  return currentLocale.value === 'pt-BR' ? item.title_pt : item.title_en
}

const getTranslatedDescription = (item: any) => {
  return currentLocale.value === 'pt-BR' ? item.description_pt : item.description_en
}

const isEnrolled = computed(() => !!program.value?.user_enrollment && program.value.user_enrollment.status === 'active')

const isSoldOut = computed(() => {
  if (!program.value || !program.value.max_students) return false
  return program.value.current_students >= program.value.max_students
})

// Taxas Stripe
const CARD_FEE_PERCENTAGE = 0.039
const CARD_FEE_FIXED = 30 // cents

function formatPrice(cents: number, currency: string = 'USD'): string {
  const amount = cents / 100
  if (currency === 'BRL') {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount)
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

function calculateFee(basePriceCents: number, method: 'card' | 'pix'): number {
  if (method === 'card') {
    return Math.round((basePriceCents * CARD_FEE_PERCENTAGE) + CARD_FEE_FIXED)
  } else {
    const usdAmount = basePriceCents / 100
    const grossAmountBRL = calculatePixAmount(usdAmount, exchangeRate.value)
    const baseAmountBRL = usdAmount * exchangeRate.value
    const feeAmountBRL = grossAmountBRL - baseAmountBRL
    return Math.round(feeAmountBRL * 100)
  }
}

function calculateTotal(basePriceCents: number, method: 'card' | 'pix'): number {
  if (method === 'card') {
    return basePriceCents + calculateFee(basePriceCents, method)
  } else {
    const usdAmount = basePriceCents / 100
    const grossAmountBRL = calculatePixAmount(usdAmount, exchangeRate.value)
    return Math.round(grossAmountBRL * 100)
  }
}

const handleRequestEnroll = () => {
    if (!isAuthenticated.value) {
        showAuthModal('login')
        return
    }
  showCheckoutModal.value = true
}

// Coupon handlers
async function handleApplyCoupon(isSilent = false) {
  if (!program.value || !couponCode.value.trim()) return

  couponLoading.value = true
  couponError.value = null

  try {
    const result = await validateCoupon(couponCode.value, program.value.id)
    
    if (result.valid && result.coupon) {
      appliedCoupon.value = result.coupon
      
      // Calculate discount based on base price
      const basePrice = program.value.price_usd * 100
      discountAmount.value = calculateDiscount(result.coupon, basePrice)
      
      // Persist applied coupon
      const upperCode = couponCode.value.toUpperCase()
      localStorage.setItem(`applied_coupon_${programId.value}`, upperCode)
      
      // Record coupon use immediately ONLY IF not applied silently (restored)
      if (!isSilent) {
        await recordCouponUse(
          result.coupon.id,
          program.value.id,
          discountAmount.value // Pass cents directly, let recordCouponUse handle conversion
        )
        toast.success(t('coupons.applied') || 'Cupom aplicado!')
      }
    } else {
      couponError.value = result.error || 'invalid'
      if (!isSilent) {
        toast.error(t(`coupons.errors.${result.error}`) || 'Cupom inválido')
      }
    }
  } catch (error) {
    console.error('Error applying coupon:', error)
    couponError.value = 'invalid'
    toast.error('Erro ao validar cupom')
  } finally {
    couponLoading.value = false
  }
}

function handleRemoveCoupon() {
  appliedCoupon.value = null
  discountAmount.value = 0
  couponCode.value = ''
  couponError.value = null
  localStorage.removeItem(`applied_coupon_${programId.value}`)
  toast.info('Cupom removido')
}

function calculateCurrentFee(): number {
  if (!program.value || !paymentMethod.value) return 0
  const basePriceCents = program.value.price_usd * 100
  const baseAfterDiscount = Math.max(0, basePriceCents - discountAmount.value)
  return calculateFee(baseAfterDiscount, paymentMethod.value)
}

function formatFinalPrice(): string {
  if (!program.value) return '$0'
  
  const basePriceCents = program.value.price_usd * 100
  const baseAfterDiscount = Math.max(0, basePriceCents - discountAmount.value)
  
  if (!paymentMethod.value) {
    return '$' + (baseAfterDiscount / 100).toFixed(2)
  }
  
  // Calculate total with fees based on the discounted base
  let totalWithFees = calculateTotal(baseAfterDiscount, paymentMethod.value)
  
  // For PIX, the calculation inside calculateTotal already handles the logic, 
  // but let's ensure it returns the right currency formatting
  return formatPrice(totalWithFees, paymentMethod.value === 'pix' ? 'BRL' : 'USD')
}

const handleCheckout = async () => {
  if (!program.value) return

  try {
    submitting.value = true
    
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      toast.error('Você precisa estar logado para se matricular')
      return
    }

    // Fluxo normal de pagamento sempre (permite testar Stripe em localhost)
    if (!paymentMethod.value) {
      toast.error('Selecione um método de pagamento')
      return
    }

    const { data, error } = await supabase.functions.invoke('create-program-checkout', {
      body: {
        program_id: program.value.id,
        payment_method: paymentMethod.value,
        exchange_rate: exchangeRate.value,
        coupon_id: appliedCoupon.value?.id || null,
        discount_amount: discountAmount.value || 0,
        accepted_terms: acceptedTerms.value
      }
    })

    if (error) throw error

    if (data?.checkout_url) {
      window.location.href = data.checkout_url
    } else {
      throw new Error('Erro ao gerar link de pagamento')
    }
  } catch (err: any) {
    console.error('Checkout error:', err)
    toast.error(err.message || 'Erro ao iniciar pagamento')
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  // Wait for program data to be loaded before trying to apply coupons
  await programsStore.fetchProgramById(programId.value)
  modulesStore.fetchModulesWithLessons(programId.value)
  
  const rate = await fetchExchangeRate()
  exchangeRate.value = rate

  // Check for persisted coupon
  const savedCoupon = localStorage.getItem(`applied_coupon_${programId.value}`)
  if (savedCoupon && program.value) {
    couponCode.value = savedCoupon
    // We apply it without showing a toast if it was already saved
    await handleApplyCoupon(true)
  }
})
</script>

<style scoped>
.material-icons {
  font-family: 'Material Icons';
}

@keyframes gradient-x {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.animate-gradient-x {
  animation: gradient-x 3s ease infinite;
}
</style>
