<template>
  <AdminLayout>
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between gap-4">
        <div class="flex items-center gap-4">
          <RouterLink
            to="/admin/programs"
            class="flex items-center justify-center p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition"
          >
            <span class="material-icons">arrow_back</span>
          </RouterLink>
          <div>
            <h1 class="text-3xl font-bold text-slate-900 dark:text-white">
              {{ isEditMode ? 'Edit Program' : 'Create Program' }}
            </h1>
            <p class="text-slate-600 dark:text-gray-400 mt-1" v-if="isEditMode && form.title_pt">
              Editing: {{ form.title_pt }}
            </p>
          </div>
        </div>

        <button
          @click="handleSubmit"
          :disabled="saving"
          class="px-8 py-2.5 bg-primary dark:bg-secondary text-white font-bold rounded-lg hover:opacity-90 transition shadow-lg flex items-center gap-2"
        >
          <span v-if="saving" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
          {{ saving ? 'Saving...' : (isEditMode ? 'Update Program' : 'Create Program') }}
        </button>
      </div>

      <!-- Main Form Container -->
      <div class="bg-white dark:bg-surface-dark rounded-xl shadow-lg border border-slate-200 dark:border-white/5 overflow-hidden">
        
        <!-- Tabs Header -->
        <div class="flex border-b border-slate-200 dark:border-white/10 overflow-x-auto">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="currentTab = tab.id"
            class="px-6 py-4 font-medium text-sm whitespace-nowrap transition-colors relative"
            :class="[
              currentTab === tab.id
                ? 'text-primary dark:text-secondary'
                : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5'
            ]"
          >
            {{ tab.label }}
            <div 
              v-if="currentTab === tab.id" 
              class="absolute bottom-0 left-0 w-full h-0.5 bg-primary dark:bg-secondary"
            ></div>
          </button>
        </div>

        <form @submit.prevent="handleSubmit" class="p-6">
          
          <!-- TAB 1: Basic Info -->
          <div v-show="currentTab === 'basic'" class="space-y-8">
            <!-- Top Section: Photo & Quick Info -->
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <!-- Photo Upload (4/12) -->
              <div class="lg:col-span-5 xl:col-span-4 space-y-2">
                <label class="block text-sm font-bold text-slate-700 dark:text-gray-300 uppercase letter-spacing-1">
                  Program Photo
                </label>
                <div 
                  @click="imageInput?.click()"
                  class="relative aspect-video rounded-2xl border-2 border-dashed border-slate-300 dark:border-gray-700 hover:border-primary dark:hover:border-secondary transition-all cursor-pointer overflow-hidden bg-slate-50 dark:bg-white/5 flex flex-col items-center justify-center group shadow-inner"
                >
                  <img v-if="imagePreview || form.thumbnail_url" :src="imagePreview || form.thumbnail_url" class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div v-if="imagePreview || form.thumbnail_url" class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
                    <span class="material-icons text-4xl mb-2">cloud_upload</span>
                    <span class="text-sm font-bold uppercase tracking-widest">Change Photo</span>
                  </div>
                  
                  <template v-if="!imagePreview && !form.thumbnail_url">
                    <div class="text-center p-6">
                      <div class="w-16 h-16 bg-slate-200 dark:bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                        <span class="material-icons text-3xl text-slate-400">image</span>
                      </div>
                      <p class="text-sm text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider">Select Photo</p>
                      <p class="text-[10px] text-slate-400 mt-2">JPG, PNG • Max 5MB</p>
                    </div>
                  </template>
                </div>
                <input ref="imageInput" type="file" accept="image/*" class="hidden" @change="handleFileSelect" />
              </div>

              <!-- Quick Meta (8/12) -->
              <div class="lg:col-span-7 xl:col-span-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                <!-- Left Side: Category and Titles -->
                <div class="space-y-6">
                  <div>
                    <label class="block text-xs font-bold text-slate-500 dark:text-gray-400 uppercase mb-2">Category *</label>
                    <select v-model="form.category" class="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-gray-700 bg-white dark:bg-surface-dark text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all">
                      <option value="curso">Content</option>
                      <option value="mentoria">Mentorship</option>
                      <option value="workshop">Workshop</option>
                      <option value="evento_premium">Premium Event</option>
                      <option value="servico_especializado">Specialized Service</option>
                    </select>
                  </div>
                  
                  <div class="grid grid-cols-1 gap-6">
                    <div>
                      <label class="block text-xs font-bold text-slate-500 dark:text-gray-400 uppercase mb-2">Título (PT) *</label>
                      <input v-model="form.title_pt" required type="text" class="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-gray-700 bg-white dark:bg-surface-dark text-slate-900 dark:text-white font-bold" placeholder="Nome do programa em Português" />
                    </div>
                    <div>
                      <label class="block text-xs font-bold text-slate-500 dark:text-gray-400 uppercase mb-2">Title (EN) *</label>
                      <input v-model="form.title_en" required type="text" class="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-gray-700 bg-white dark:bg-surface-dark text-slate-900 dark:text-white font-bold" placeholder="Program name in English" />
                    </div>
                  </div>
                </div>

                <!-- Right Side: Professors -->
                <div class="flex flex-col h-full">
                  <label class="block text-xs font-bold text-slate-500 dark:text-gray-400 uppercase mb-3">Professors (Instructors) *</label>
                  <div class="flex-1 bg-slate-50 dark:bg-black/20 p-4 rounded-2xl border border-slate-200 dark:border-white/10 overflow-y-auto custom-scrollbar min-h-[220px]">
                    <div class="grid grid-cols-1 gap-2">
                      <div v-for="prof in professors" :key="prof.id" class="flex items-center gap-4 p-3 rounded-xl hover:bg-white dark:hover:bg-white/5 transition-all group">
                        <div class="relative flex items-center justify-center">
                          <input 
                            type="checkbox" 
                            :id="`prof-${prof.id}`"
                            v-model="form.professor_ids"
                            :value="prof.id"
                            class="w-6 h-6 rounded-lg border-slate-300 text-primary focus:ring-primary cursor-pointer transition-all"
                          />
                        </div>
                        <label :for="`prof-${prof.id}`" class="flex items-center gap-3 cursor-pointer flex-1 min-w-0">
                            <div class="flex items-center gap-2">
                              <span class="block text-sm font-bold text-slate-700 dark:text-white truncate">{{ prof.nome }}</span>
                              <span v-if="prof.role === 'admin'" class="text-[8px] px-1.5 py-0.5 rounded-md bg-purple-500/10 text-purple-500 font-bold uppercase border border-purple-500/20">Admin</span>
                            </div>
                            <span class="block text-[10px] text-slate-500 font-medium truncate">{{ prof.email }}</span>
                        </label>
                      </div>
                    </div>
                  </div>
                  <p class="text-[10px] text-slate-500 mt-2 italic px-2">Select one or more professors for this program.</p>
                </div>
              </div>
            </div>

            <div class="h-px bg-slate-200 dark:bg-white/10 w-full"></div>

            <!-- Detailed Content Section -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
              <!-- Português -->
              <div class="space-y-6">
                <div class="flex items-center gap-2 mb-2">
                  <span class="material-icons text-primary/60">translate</span>
                  <h3 class="font-black text-slate-900 dark:text-white uppercase tracking-wider text-sm">Content in Portuguese</h3>
                </div>
                <div class="space-y-4 bg-slate-50/50 dark:bg-white/5 p-6 rounded-2xl border border-slate-200 dark:border-white/5">
                  <div>
                    <label class="block text-xs font-bold text-slate-500 dark:text-gray-400 uppercase mb-2">Curta Descrição (PT) *</label>
                    <textarea v-model="form.short_description_pt" required rows="2" class="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-gray-700 bg-white dark:bg-surface-dark text-slate-900 dark:text-white text-sm" placeholder="Um resumo rápido chamativo..."></textarea>
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-slate-500 dark:text-gray-400 uppercase mb-2">Descrição Completa (PT) *</label>
                    <textarea v-model="form.description_pt" required rows="8" class="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-gray-700 bg-white dark:bg-surface-dark text-slate-900 dark:text-white text-sm leading-relaxed" placeholder="Explique todos os detalhes do programa..."></textarea>
                  </div>
                </div>
              </div>

              <!-- English -->
              <div class="space-y-6">
                <div class="flex items-center gap-2 mb-2">
                  <span class="material-icons text-primary/60">language</span>
                  <h3 class="font-black text-slate-900 dark:text-white uppercase tracking-wider text-sm">English Content</h3>
                </div>
                <div class="space-y-4 bg-slate-50/50 dark:bg-white/5 p-6 rounded-2xl border border-slate-200 dark:border-white/5">
                  <div>
                    <label class="block text-xs font-bold text-slate-500 dark:text-gray-400 uppercase mb-2">Short Description (EN) *</label>
                    <textarea v-model="form.short_description_en" required rows="2" class="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-gray-700 bg-white dark:bg-surface-dark text-slate-900 dark:text-white text-sm" placeholder="A catchy short summary..."></textarea>
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-slate-500 dark:text-gray-400 uppercase mb-2">Full Description (EN) *</label>
                    <textarea v-model="form.description_en" required rows="8" class="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-gray-700 bg-white dark:bg-surface-dark text-slate-900 dark:text-white text-sm leading-relaxed" placeholder="Explain all program details..."></textarea>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- TAB 2: Settings -->
          <div v-show="currentTab === 'settings'" class="space-y-6">
            <!-- Price and Slots -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="p-4 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/5">
                <h3 class="font-bold text-slate-900 dark:text-white mb-4">Pricing and Slots</h3>
                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Price (USD) *</label>
                    <div class="relative">
                      <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                      <input v-model.number="form.price_usd" required type="number" step="0.01" class="w-full pl-8 pr-4 py-2 rounded-lg border border-slate-300 dark:border-gray-700 bg-white dark:bg-surface-dark text-slate-900 dark:text-white" />
                    </div>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Max Slots</label>
                    <input v-model.number="form.max_students" type="number" class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-gray-700 bg-white dark:bg-surface-dark text-slate-900 dark:text-white" placeholder="Empty for unlimited" />
                  </div>
                   <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Duration (hours)</label>
                    <input v-model.number="form.duration_hours" type="number" class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-gray-700 bg-white dark:bg-surface-dark text-slate-900 dark:text-white" />
                  </div>
                </div>
              </div>

               <div class="p-4 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/5">
                <h3 class="font-bold text-slate-900 dark:text-white mb-4">Dates and Publishing</h3>
                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Status</label>
                    <select v-model="form.status" class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-gray-700 bg-white dark:bg-surface-dark text-slate-900 dark:text-white">
                      <option value="draft">Draft (Hidden)</option>
                      <option value="published">Published (Visible)</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                  <div class="flex items-center gap-2 mt-6">
                    <input v-model="form.featured" type="checkbox" id="featured" class="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary" />
                    <label for="featured" class="text-slate-700 dark:text-gray-300 font-medium">Featured Program (⭐)</label>
                  </div>
                  
                  <div class="flex items-center gap-2 mt-4">
                    <input v-model="form.localhost_only" type="checkbox" id="localhost_only" class="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary" />
                    <label for="localhost_only" class="text-slate-700 dark:text-gray-300 font-medium">
                      Localhost Only (🔧 Debug)
                    </label>
                  </div>
                  <p v-if="form.localhost_only" class="text-xs text-amber-600 dark:text-amber-400 mt-1 ml-7">
                    ⚠️ This program will allow free local access for debugging
                  </p>
                   
                  <div class="border-t border-slate-200 dark:border-white/10 my-4 pt-6">
                    <h4 class="text-sm font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-wider">Goals and Prerequisites</h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Enrollment Start</label>
                        <input v-model="form.enrollment_start_date" type="datetime-local" class="w-full text-sm px-4 py-2 rounded-xl border border-slate-300 dark:border-gray-700 bg-white dark:bg-surface-dark" />
                      </div>
                      <div>
                        <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Enrollment End</label>
                        <input v-model="form.enrollment_end_date" type="datetime-local" class="w-full text-sm px-4 py-2 rounded-xl border border-slate-300 dark:border-gray-700 bg-white dark:bg-surface-dark" />
                      </div>
                      <div class="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                        <div>
                          <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Pré-requisitos (PT)</label>
                          <textarea v-model="form.prerequisites_pt" rows="3" class="w-full text-sm px-4 py-3 rounded-xl border border-slate-300 dark:border-gray-700 bg-white dark:bg-surface-dark" placeholder="O que o aluno precisa saber?"></textarea>
                        </div>
                        <div>
                          <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Prerequisites (EN)</label>
                          <textarea v-model="form.prerequisites_en" rows="3" class="w-full text-sm px-4 py-3 rounded-xl border border-slate-300 dark:border-gray-700 bg-white dark:bg-surface-dark" placeholder="What should the student know?"></textarea>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- TAB 3: Content (Curriculum & Materials) -->
          <div v-show="currentTab === 'content'" class="space-y-6 -mx-6 sm:-mx-8">
            <div v-if="!isEditMode" class="p-12 text-center">
              <div class="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span class="material-icons text-4xl text-primary">add_link</span>
              </div>
              <h3 class="text-xl font-black text-slate-900 dark:text-white mb-2">Create the program first</h3>
              <p class="text-slate-500 max-w-sm mx-auto">
                To manage modules, lessons, and materials, you must first save the basic program information.
              </p>
            </div>
            <div v-else class="flex flex-col h-[700px]">
              <!-- Content Sub-tabs -->
              <div class="px-8 border-b border-slate-200 dark:border-white/10 flex items-center bg-slate-50/50 dark:bg-black/20">
                <button 
                  v-for="subTab in contentSubTabs" 
                  :key="subTab.id"
                  type="button"
                  @click.prevent="activeContentSubTab = subTab.id"
                  class="px-6 py-4 text-xs font-black uppercase tracking-widest transition-all relative"
                  :class="activeContentSubTab === subTab.id ? 'text-primary' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'"
                >
                  {{ subTab.label }}
                  <div v-if="activeContentSubTab === subTab.id" class="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-t-full"></div>
                </button>
              </div>

              <!-- Content Views -->
              <div class="flex-1 overflow-hidden">
                <!-- Grade Curricular View -->
                <div v-if="activeContentSubTab === 'grade'" class="flex h-full">
                  <aside class="w-80 h-full border-r border-slate-200 dark:border-white/10 shrink-0">
                    <CurriculumSidebar 
                      :modules="modules" 
                      :selected-id="selectedContentItem?.id"
                      @select-module="handleSelectModule"
                      @select-lesson="handleSelectLesson"
                      @add-module="handleStartCreateModule"
                      @add-lesson="handleStartCreateLesson"
                    />
                  </aside>
                  <main class="flex-1 h-full bg-slate-50/30 dark:bg-black/10">
                    <ContentEditor 
                      :selected-item="selectedContentItem"
                      :mode="contentEditorMode"
                      :is-creating="isCreatingContent"
                      :program-name="form.title_pt"
                      :loading="modulesStore.loading"
                      @save="handleSaveContent"
                      @cancel="handleCancelContent"
                      @delete="handleDeleteContent"
                    />
                  </main>
                </div>

                <!-- Materiais View -->
                <div v-else-if="activeContentSubTab === 'materials'" class="h-full overflow-y-auto p-8 bg-slate-50/30 dark:bg-black/10">
                  <MaterialsTab :program-id="route.params.id as string" />
                </div>
              </div>
            </div>
          </div>

          <!-- TAB 4: Integrations -->
          <div v-show="currentTab === 'integrations'" class="space-y-6">
            <div class="p-6 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/5">
              <div class="flex items-center gap-3 mb-6">
                <div class="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                  G
                </div>
                <div>
                  <h3 class="font-bold text-slate-900 dark:text-white">Google Classroom</h3>
                  <p class="text-sm text-slate-500">Integration for automatic content access</p>
                </div>
              </div>

               <div class="space-y-4 max-w-lg">
                 <div class="flex items-center gap-2">
                    <input v-model="form.classroom_enabled" type="checkbox" id="classroom_enabled" class="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary" />
                    <label for="classroom_enabled" class="text-slate-700 dark:text-gray-300 font-medium">Enable Integration</label>
                  </div>

                  <div v-if="form.classroom_enabled" class="space-y-4 pl-7 border-l-2 border-slate-200 dark:border-white/10 ml-2.5">
                    <div>
                      <label class="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Link de Convite (Invite Link)</label>
                      <input v-model="form.classroom_invite_link" type="text" class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-gray-700 bg-white dark:bg-surface-dark text-slate-900 dark:text-white" placeholder="https://classroom.google.com/..." />
                      <p class="text-xs text-slate-500 mt-1">This link will be shown to students after enrollment.</p>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Content ID (Optional)</label>
                      <input v-model="form.classroom_course_id" type="text" class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-gray-700 bg-white dark:bg-surface-dark text-slate-900 dark:text-white" placeholder="Ex: 123456789" />
                    </div>

                    <!-- Botão de Teste -->
                    <div class="pt-4 mt-4 border-t border-slate-200 dark:border-white/10">
                      <div class="bg-blue-500/10 p-4 rounded-xl border border-blue-500/20">
                        <div class="flex items-center gap-2 mb-2">
                          <span class="material-icons text-blue-400 text-sm">science</span>
                          <h4 class="text-xs font-bold text-blue-400 uppercase tracking-wider">Exclusive Test Mode</h4>
                        </div>
                        <p class="text-[11px] text-blue-300 mb-4">
                          Send an invite to your email right now to validate the integration, without needing to pay or enroll.
                        </p>
                        <button
                          type="button"
                          @click="handleTestInvite"
                          :disabled="testingInvite || !form.classroom_course_id || !form.classroom_enabled"
                          class="flex items-center justify-center gap-2 w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-sm font-bold transition shadow-lg shadow-blue-600/20"
                        >
                          <template v-if="testingInvite">
                            <span class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                            Sending...
                          </template>
                          <template v-else>
                            <span class="material-icons text-sm">send</span>
                            Send Invite to: {{ authStore.user?.email }}
                          </template>
                        </button>
                      </div>
                    </div>
                  </div>
               </div>
            </div>
          </div>

          <!-- TAB 5: Terms & Conditions -->
          <div v-show="currentTab === 'terms'" class="space-y-8">
            <div class="p-6 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/5">
              <div class="flex items-center gap-3 mb-6">
                <div class="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center text-amber-500">
                  <span class="material-icons">gavel</span>
                </div>
                <div>
                  <h3 class="font-bold text-slate-900 dark:text-white">Specific Terms and Conditions</h3>
                  <p class="text-sm text-slate-500">Define terms users must accept before enrolling in this program.</p>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <!-- Termos em Português -->
                <div class="space-y-4">
                  <div class="flex items-center gap-2 mb-2">
                    <span class="material-icons text-primary/60 text-sm">translate</span>
                    <h4 class="font-bold text-slate-700 dark:text-gray-300 uppercase text-xs">Termos em Português</h4>
                  </div>
                  <textarea 
                    v-model="form.terms_content_pt" 
                    rows="15" 
                    class="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-gray-700 bg-white dark:bg-surface-dark text-slate-900 dark:text-white text-sm leading-relaxed" 
                    placeholder="Escreva os termos em português aqui... (Suporta texto simples)"
                  ></textarea>
                  <p class="text-[10px] text-slate-500 italic">These terms will be displayed in a modal before payment/enrollment.</p>
                </div>

                <!-- Termos em Inglês -->
                <div class="space-y-4">
                  <div class="flex items-center gap-2 mb-2">
                    <span class="material-icons text-primary/60 text-sm">language</span>
                    <h4 class="font-bold text-slate-700 dark:text-gray-300 uppercase text-xs">Terms in English</h4>
                  </div>
                  <textarea 
                    v-model="form.terms_content_en" 
                    rows="15" 
                    class="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-gray-700 bg-white dark:bg-surface-dark text-slate-900 dark:text-white text-sm leading-relaxed" 
                    placeholder="Write the terms in English here..."
                  ></textarea>
                  <p class="text-[10px] text-slate-500 italic">These terms will be displayed in a modal before payment/enrollment.</p>
                </div>
              </div>
            </div>
          </div>

        </form>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import AdminLayout from '@/components/layout/admin/AdminLayout.vue'
import { useProgramsStore } from '@/stores/programs'
import { useAuthStore } from '@/stores/auth'
import { useSupabase } from '@/composables/useSupabase'
import { useModulesStore } from '@/stores/modules'
import type { CreateProgramData } from '@/types/programs'
import { toast } from 'vue-sonner'

// Content Management Components
import CurriculumSidebar from '@/components/professor/CurriculumSidebar.vue'
import ContentEditor from '@/components/professor/ContentEditor.vue'
import MaterialsTab from '@/components/professor/MaterialsTab.vue'

const route = useRoute()
const router = useRouter()

const { supabase } = useSupabase()
const programsStore = useProgramsStore()
const authStore = useAuthStore()

// Content Management State
const modulesStore = useModulesStore()
const activeContentSubTab = ref('grade')
const selectedContentItem = ref<any>(null)
const contentEditorMode = ref<'module' | 'lesson'>('module')
const isCreatingContent = ref(false)
const targetModuleForLesson = ref<any>(null)

const contentSubTabs = [
  { id: 'grade', label: 'Curriculum' },
  { id: 'materials', label: 'Support Materials' },
]

const modules = computed(() => modulesStore.getModulesByProgram(route.params.id as string || ''))

const isEditMode = computed(() => !!route.params.id)
const saving = ref(false)
const testingInvite = ref(false)
const currentTab = ref('basic')

// Image Upload
const imageFile = ref<File | null>(null)
const imagePreview = ref<string | null>(null)
const imageInput = ref<HTMLInputElement | null>(null)

// Professors list
const professors = ref<any[]>([])

const tabs = [
  { id: 'basic', label: 'Basic Information' },
  { id: 'settings', label: 'Enrollment & Details' },
  { id: 'content', label: 'Content & Curriculum' },
]

// Initialize with default values for Create mode
const form = ref<CreateProgramData>({
  title_pt: '',
  title_en: '',
  description_pt: '',
  description_en: '',
  short_description_pt: '',
  short_description_en: '',
  category: 'curso',
  price_usd: 0,
  price_brl: undefined,
  max_students: undefined,
  status: 'draft',
  featured: false,
  localhost_only: false,
  classroom_enabled: false,
  duration_hours: undefined,
  classroom_course_id: '',
  classroom_invite_link: '',
  thumbnail_url: '',
  banner_url: '',
  instructor_name: '',
  created_by: '',
  professor_ids: [],
  prerequisites_en: '',
  enrollment_start_date: '',
  enrollment_end_date: '',
  terms_content_pt: '',
  terms_content_en: ''
})

onMounted(async () => {
  // Fetch professors list
  try {
    const { data: profs, error } = await supabase
      .from('profiles')
      .select('id, nome, email, bio, role')
      .in('role', ['professor', 'admin'])
      .order('nome')

    if (error) throw error
    professors.value = profs || []
  } catch (error) {
    console.error('Error fetching professors:', error)
  }

  if (isEditMode.value) {
    // If edit mode, load program data
    const programId = route.params.id as string
    const program = await programsStore.fetchProgramById(programId)
    if (program) {
      // Map program data to form
      form.value = { 
        ...program,
        professor_ids: program.professors?.map((p: any) => p.id) || []
      }
      
      // Load content
      await modulesStore.fetchModulesWithLessons(programId)
      await modulesStore.fetchMaterials(programId)
    } else {
      // Handle not found
      router.push('/admin/programs')
    }
  }
})

// Content Management Handlers
function handleSelectModule(module: any) {
  selectedContentItem.value = module
  contentEditorMode.value = 'module'
  isCreatingContent.value = false
}

function handleSelectLesson(lesson: any) {
  selectedContentItem.value = lesson
  contentEditorMode.value = 'lesson'
  isCreatingContent.value = false
}

function handleStartCreateModule() {
  selectedContentItem.value = null
  contentEditorMode.value = 'module'
  isCreatingContent.value = true
}

function handleStartCreateLesson(module: any) {
  selectedContentItem.value = null
  contentEditorMode.value = 'lesson'
  isCreatingContent.value = true
  targetModuleForLesson.value = module
}

function handleCancelContent() {
  selectedContentItem.value = null
  isCreatingContent.value = false
}

async function handleSaveContent(formData: any) {
  try {
    const programId = route.params.id as string
    let savedItem = null

    if (contentEditorMode.value === 'module') {
      if (isCreatingContent.value) {
        savedItem = await modulesStore.createModule({
          ...formData,
          program_id: programId,
          order_index: modules.value.length
        })
      } else {
        savedItem = await modulesStore.updateModule(selectedContentItem.value.id, formData)
      }
    } else {
      if (isCreatingContent.value) {
        savedItem = await modulesStore.createLesson({
          ...formData,
          program_id: programId,
          module_id: targetModuleForLesson.value.id,
          order_index: targetModuleForLesson.value.lessons?.length || 0
        }, true)
      } else {
        savedItem = await modulesStore.updateLesson(selectedContentItem.value.id, formData, true)
      }
    }
    
    await modulesStore.fetchModulesWithLessons(programId)
    
    // Crucial: Manter o item salvo selecionado para não fechar o editor
    if (savedItem) {
      selectedContentItem.value = savedItem
    }
    
    isCreatingContent.value = false
    toast.success('Saved successfully!')
  } catch (error: any) {
    console.error('Error saving content:', error)
    toast.error('Error saving: ' + (error.message || 'Unknown error'))
  }
}

async function handleDeleteContent(item: any) {
  const label = contentEditorMode.value === 'module' ? 'módulo' : 'aula'
  if (!confirm(`Are you sure you want to delete this ${label}? This action cannot be undone.`)) return

  try {
    if (contentEditorMode.value === 'module') {
      await modulesStore.deleteModule(item.id)
    } else {
      await modulesStore.deleteLesson(item.id)
    }
    
    await modulesStore.fetchModulesWithLessons(route.params.id as string)
    selectedContentItem.value = null
    toast.success('Deleted successfully!')
  } catch (error: any) {
    console.error('Error deleting content:', error)
    toast.error('Error deleting: ' + (error.message || 'Unknown error'))
  }
}


const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  if (!file.type.startsWith('image/')) {
    toast.error('Please select only image files')
    return
  }

  // Max 5MB
  if (file.size > 5 * 1024 * 1024) {
    toast.error('Image must be at most 5MB')
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    imageFile.value = file
    imagePreview.value = e.target?.result as string
  }
  reader.readAsDataURL(file)
}

const uploadImage = async (file: File, path: string) => {
  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`
    const filePath = `${path}/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('program-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) throw uploadError

    const { data: { publicUrl } } = supabase.storage
      .from('program-images')
      .getPublicUrl(filePath)

    return publicUrl
  } catch (err: any) {
    console.error(`Error uploading ${path}:`, err)
    throw new Error(`Error uploading: ${err.message}`)
  }
}

const handleSubmit = async () => {
  try {
    saving.value = true

    // Update instructor_name based on selected professors
    const selectedProfs = professors.value.filter(p => form.value.professor_ids?.includes(p.id))
    if (selectedProfs.length > 0) {
      form.value.instructor_name = selectedProfs.map(p => p.nome).join(', ')
      // Use the first professor's bio if multiple (best effort)
      if (!form.value.instructor_bio) {
        form.value.instructor_bio = selectedProfs[0].bio
      }
    }

    // 1. Upload image if selected
    if (imageFile.value) {
      const publicUrl = await uploadImage(imageFile.value, 'programs')
      form.value.thumbnail_url = publicUrl
      form.value.banner_url = publicUrl // Use the same image for both to ensure consistency
    }

    // 2. Save program data
    if (isEditMode.value) {
      await programsStore.updateProgram({
        id: route.params.id as string,
        ...form.value
      })
      toast.success('Program updated successfully!')
    } else {
      await programsStore.createProgram(form.value)
      toast.success('Program created successfully!')
    }

    router.push('/admin/programs')
  } catch (error: any) {
    console.error('Error saving program:', error)
    toast.error(error.message || 'Error saving program. Check console.')
  } finally {
    saving.value = false
  }
}

const handleTestInvite = async () => {
  if (!form.value.classroom_course_id || !authStore.user?.email) return

  try {
    testingInvite.value = true
    const { error } = await supabase.functions.invoke('classroom_invite', {
      body: {
        courseId: form.value.classroom_course_id,
        studentEmail: authStore.user.email
      }
    })

    if (error) throw error
    toast.success(`Invite sent successfully to ${authStore.user.email}! Check your email.`)
  } catch (err: any) {
    console.error('Test invite error:', err)
    toast.error('Error sending invite: ' + (err.message || 'Unknown error'))
  } finally {
    testingInvite.value = false
  }
}
</script>
