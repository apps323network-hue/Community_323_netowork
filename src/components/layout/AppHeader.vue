<template>
  <header
    class="sticky top-0 z-50 bg-white/95 dark:bg-surface-dark/95 backdrop-blur-md border-b border-slate-200/60 dark:border-white/10 shadow-premium dark:shadow-none w-full"
  >
    <nav class="w-full mx-auto px-4 sm:px-6 lg:px-8 max-w-[1440px]">
      <div class="flex items-center justify-between h-20">
        <!-- Logo -->
        <RouterLink v-if="props.showLogo" to="/" class="flex-shrink-0 flex items-center gap-2 cursor-pointer group">
          <div
            :class="[
              'font-display font-extrabold tracking-tighter flex items-center transform group-hover:scale-105 transition-transform',
              props.showNavigation ? 'text-2xl md:text-3xl' : 'text-2xl'
            ]"
          >
            <span class="text-primary dark:text-secondary">(323</span>
            <span
              class="material-icons-outlined text-primary dark:text-secondary mx-1 animate-pulse"
              :style="{ fontSize: props.showNavigation ? '1.2em' : '1em' }"
              >play_arrow</span
            >
            <span
              class="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary font-extrabold"
              >NETWORK</span
            >
          </div>
        </RouterLink>
        <div v-else class="flex-shrink-0"></div>

        <!-- Navigation Links - Desktop -->
        <div v-if="props.showNavigation" class="hidden md:block">
          <div class="ml-10 flex items-baseline space-x-6">
            <RouterLink
              to="/"
              class="relative px-3 py-2 text-sm font-bold transition-all"
              :class="
                route.path === '/'
                  ? 'text-slate-900 dark:text-white'
                  : 'text-slate-500 dark:text-gray-400 hover:text-primary dark:hover:text-secondary'
              "
            >
              {{ t('navigation.home') }}
              <span
                v-if="route.path === '/'"
                class="absolute bottom-0 left-0 w-full h-0.5 bg-primary dark:bg-secondary transform scale-x-100 transition-transform"
              ></span>
              <span
                v-else
                class="absolute bottom-0 left-0 w-full h-0.5 bg-primary dark:bg-secondary transform scale-x-0 group-hover:scale-x-100 transition-transform"
              ></span>
            </RouterLink>
            <RouterLink
              to="/comunidade"
              class="relative px-3 py-2 text-sm font-medium transition-colors group"
              :class="
                route.path === '/comunidade'
                  ? 'text-slate-900 dark:text-white'
                  : 'text-slate-500 dark:text-gray-400 hover:text-primary dark:hover:text-secondary'
              "
            >
              {{ t('navigation.community') }}
              <span
                v-if="route.path === '/comunidade'"
                class="absolute bottom-0 left-0 w-full h-0.5 bg-primary dark:bg-secondary transform scale-x-100 transition-transform"
              ></span>
              <span
                v-else
                class="absolute bottom-0 left-0 w-full h-0.5 bg-primary dark:bg-secondary transform scale-x-0 group-hover:scale-x-100 transition-transform"
              ></span>
            </RouterLink>
            <RouterLink
              to="/eventos"
              class="relative px-3 py-2 text-sm font-medium transition-colors group"
              :class="
                route.path === '/eventos' || route.path.startsWith('/eventos/')
                  ? 'text-slate-900 dark:text-white'
                  : 'text-slate-500 dark:text-gray-400 hover:text-primary dark:hover:text-secondary'
              "
            >
              {{ t('navigation.events') }}
              <span
                v-if="route.path === '/eventos' || route.path.startsWith('/eventos/')"
                class="absolute bottom-0 left-0 w-full h-0.5 bg-primary dark:bg-secondary transform scale-x-100 transition-transform"
              ></span>
              <span
                v-else
                class="absolute bottom-0 left-0 w-full h-0.5 bg-primary dark:bg-secondary transform scale-x-0 group-hover:scale-x-100 transition-transform"
              ></span>
            </RouterLink>
            <RouterLink
              to="/programs"
              class="relative px-3 py-2 text-sm font-medium transition-colors group"
              :class="
                route.path === '/programs' || route.path.startsWith('/programs/')
                  ? 'text-slate-900 dark:text-white'
                  : 'text-slate-500 dark:text-gray-400 hover:text-primary dark:hover:text-secondary'
              "
            >
              {{ t('navigation.programs') }}
              <span
                v-if="route.path === '/programs' || route.path.startsWith('/programs/')"
                class="absolute bottom-0 left-0 w-full h-0.5 bg-primary dark:bg-secondary transform scale-x-100 transition-transform"
              ></span>
              <span
                v-else
                class="absolute bottom-0 left-0 w-full h-0.5 bg-primary dark:bg-secondary transform scale-x-0 group-hover:scale-x-100 transition-transform"
              ></span>
            </RouterLink>
            <RouterLink
              to="/servicos"
              class="relative px-3 py-2 text-sm font-medium transition-colors group"
              :class="
                route.path === '/servicos'
                  ? 'text-slate-900 dark:text-white'
                  : 'text-slate-500 dark:text-gray-400 hover:text-primary dark:hover:text-secondary'
              "
            >
              {{ t('navigation.services') }}
              <span
                v-if="route.path === '/servicos'"
                class="absolute bottom-0 left-0 w-full h-0.5 bg-primary dark:bg-secondary transform scale-x-100 transition-transform"
              ></span>
              <span
                v-else
                class="absolute bottom-0 left-0 w-full h-0.5 bg-primary dark:bg-secondary transform scale-x-0 group-hover:scale-x-100 transition-transform"
              ></span>
            </RouterLink>
            <RouterLink
              to="/beneficios"
              class="relative px-3 py-2 text-sm font-medium transition-colors group"
              :class="
                route.path === '/beneficios'
                  ? 'text-slate-900 dark:text-white'
                  : 'text-slate-500 dark:text-gray-400 hover:text-primary dark:hover:text-secondary'
              "
            >
              {{ t('navigation.benefits') }}
              <span
                v-if="route.path === '/beneficios'"
                class="absolute bottom-0 left-0 w-full h-0.5 bg-primary dark:bg-secondary transform scale-x-100 transition-transform"
              ></span>
              <span
                v-else
                class="absolute bottom-0 left-0 w-full h-0.5 bg-primary dark:bg-secondary transform scale-x-0 group-hover:scale-x-100 transition-transform"
              ></span>
            </RouterLink>
          </div>
        </div>

        <!-- Auth Actions - Desktop -->
        <div v-if="!isAuthenticated && props.showNavigation" class="hidden md:flex items-center gap-3">
          <button
            @click="showAuthModal('login')"
            class="px-4 py-2 text-sm font-bold text-slate-600 dark:text-gray-300 hover:text-primary dark:hover:text-secondary transition-colors"
          >
            {{ t('auth.login') || 'Entrar' }}
          </button>
          <button
            @click="showAuthModal('signup')"
            class="px-5 py-2 text-sm font-bold bg-gradient-to-r from-secondary to-primary text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all"
          >
            {{ t('auth.register') || 'Cadastrar' }}
          </button>
        </div>

        <!-- Mobile Menu - Not Authenticated with Navigation -->
        <div v-if="!isAuthenticated && props.showNavigation" class="md:hidden flex items-center gap-3">
          <AnimatedThemeToggler />
          
          <!-- Language Switcher Mobile -->
          <div class="relative" ref="languageMenuContainerMobile">
            <button
              @click.stop="toggleLanguageMenu"
              class="flex items-center gap-1 px-2 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-surface-lighter transition-colors"
            >
              <span class="text-lg">{{ currentLocaleData.flag }}</span>
              <span class="material-icons text-sm">expand_more</span>
            </button>
            
            <!-- Language Dropdown Mobile -->
            <Transition
              enter-active-class="transition-all duration-200"
              enter-from-class="opacity-0 scale-95 translate-y-2"
              enter-to-class="opacity-100 scale-100 translate-y-0"
              leave-active-class="transition-all duration-200"
              leave-from-class="opacity-100 scale-100 translate-y-0"
              leave-to-class="opacity-0 scale-95 translate-y-2"
            >
              <div
                v-if="showLanguageMenu"
                class="absolute right-0 mt-2 w-48 rounded-xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 shadow-2xl z-50 overflow-hidden"
                @click.stop
              >
                <div class="p-2">
                  <button
                    v-for="locale in availableLocales"
                    :key="locale.code"
                    @click="handleLocaleChange(locale.code)"
                    class="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors"
                    :class="[
                      currentLocale === locale.code
                        ? 'bg-primary/10 text-primary dark:bg-secondary/10 dark:text-secondary'
                        : 'text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-surface-lighter'
                    ]"
                  >
                    <span class="text-lg">{{ locale.flag }}</span>
                    <span>{{ locale.name }}</span>
                    <span v-if="currentLocale === locale.code" class="material-icons text-sm ml-auto">check</span>
                  </button>
                </div>
              </div>
            </Transition>
          </div>
        </div>

        <!-- Mobile Menu - User -->
        <div v-if="isAuthenticated && props.showNavigation" class="md:hidden flex items-center gap-3">
          <NotificationsDropdown />
          
          <!-- User Menu Mobile -->
          <div class="relative" ref="userMenuContainerMobile">
            <button
              @click.stop="toggleUserMenu"
              class="relative flex items-center"
            >
              <div class="relative">
                <div
                  class="absolute -inset-0.5 bg-gradient-to-r from-primary to-secondary rounded-full blur opacity-75 transition duration-200"
                  :class="showUserMenu ? 'opacity-100' : ''"
                ></div>
                <Avatar
                  :src="userAvatar"
                  :name="userName"
                  size="md"
                  class="relative border-2 border-white dark:border-surface-dark"
                />
              </div>
            </button>

            <!-- Dropdown Menu Mobile -->
            <Transition
              enter-active-class="transition-all duration-200"
              enter-from-class="opacity-0 scale-95 translate-y-2"
              enter-to-class="opacity-100 scale-100 translate-y-0"
              leave-active-class="transition-all duration-200"
              leave-from-class="opacity-100 scale-100 translate-y-0"
              leave-to-class="opacity-0 scale-95 translate-y-2"
            >
              <div
                v-if="showUserMenu"
                class="absolute right-0 mt-2 w-56 rounded-xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 shadow-2xl z-50 overflow-hidden"
                @click.stop
              >
                <!-- User Info Header -->
                <div class="p-4 border-b border-slate-200 dark:border-white/10">
                  <div class="flex items-center gap-3">
                    <Avatar
                      :src="userAvatar"
                      :name="userName"
                      size="md"
                      class="border-2 border-primary dark:border-secondary"
                    />
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {{ userDisplayName }}
                      </p>
                      <p class="text-xs text-slate-500 dark:text-gray-400 truncate">{{ userTitle }}</p>
                    </div>
                  </div>
                </div>
                
                <div class="p-2">
                  <RouterLink
                    to="/conexoes"
                    class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-surface-lighter transition-colors"
                    @click="showUserMenu = false"
                  >
                    <span class="material-symbols-outlined text-[20px]">groups</span>
                    {{ t('navigation.myNetwork') }}
                  </RouterLink>
                  <RouterLink
                    to="/meus-servicos"
                    class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-surface-lighter transition-colors"
                    @click="showUserMenu = false"
                  >
                    <span class="material-symbols-outlined text-[20px]">shopping_bag</span>
                    {{ t('navigation.myServices') }}
                  </RouterLink>
                  <RouterLink
                    to="/my-programs"
                    class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-surface-lighter transition-colors"
                    @click="showUserMenu = false"
                  >
                    <span class="material-symbols-outlined text-[20px]">school</span>
                    {{ t('programs.myPrograms') }}
                  </RouterLink>
                  <RouterLink
                    to="/beneficios"
                    class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-surface-lighter transition-colors"
                    @click="showUserMenu = false"
                  >
                    <span class="material-symbols-outlined text-[20px]">workspace_premium</span>
                    {{ t('navigation.benefits') }}
                  </RouterLink>
                  <RouterLink
                    to="/perfil"
                    class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-surface-lighter transition-colors"
                    @click="showUserMenu = false"
                  >
                    <span class="material-symbols-outlined text-[20px]">person</span>
                    {{ t('navigation.myProfile') }}
                  </RouterLink>
                  <RouterLink
                    to="/contact-us"
                    class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-surface-lighter transition-colors"
                    @click="showUserMenu = false"
                  >
                    <span class="material-symbols-outlined text-[20px]">mail</span>
                    {{ t('navigation.contactUs') }}
                  </RouterLink>
                  
                  <!-- Divider -->
                  <div class="border-t border-slate-200 dark:border-white/10 my-2"></div>

                  <!-- Settings Section -->
                  <div class="px-2 py-1">
                    <!-- Theme Toggle -->
                    <button 
                      @click="handleThemeClick"
                      class="w-full px-3 py-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-surface-lighter transition-colors cursor-pointer"
                    >
                      <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2.5">
                          <span class="material-symbols-outlined text-[20px] text-slate-600 dark:text-gray-400">dark_mode</span>
                          <span class="text-sm font-medium text-slate-700 dark:text-gray-300">{{ t('settings.theme') }}</span>
                        </div>
                        <AnimatedThemeToggler ref="themeTogglerRef" />
                      </div>
                    </button>

                    <!-- Language Toggle -->
                    <button 
                      @click="toggleLanguage"
                      class="w-full px-3 py-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-surface-lighter transition-colors cursor-pointer"
                    >
                      <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2.5">
                          <span class="material-symbols-outlined text-[20px] text-slate-600 dark:text-gray-400">language</span>
                          <span class="text-sm font-medium text-slate-700 dark:text-gray-300">
                            {{ currentLocale === 'pt-BR' ? 'Português' : 'English' }}
                          </span>
                        </div>
                        <div class="flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-100 dark:bg-white/10">
                          <span class="text-base">{{ currentLocaleData.flag }}</span>
                          <span class="text-xs font-bold text-slate-700 dark:text-gray-300">
                            {{ currentLocale === 'pt-BR' ? 'PT' : 'EN' }}
                          </span>
                        </div>
                      </div>
                    </button>
                  </div>

                  
                  <!-- Dashboard Professor (para profs e admins) -->
                  <div v-if="isProfessor" class="border-t border-slate-200 dark:border-white/10 mt-1 pt-1">
                    <RouterLink
                      to="/professor"
                      class="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-primary dark:text-secondary hover:bg-primary/10 dark:hover:bg-secondary/10 transition-colors"
                      @click="showUserMenu = false"
                    >
                      <span class="material-symbols-outlined text-[20px]">school</span>
                      {{ t('navigation.dashboardProfessor') }}
                    </RouterLink>
                  </div>

                  <!-- Dashboard Admin (apenas para admins) -->
                  <div v-if="isAdmin" class="border-t border-slate-200 dark:border-white/10 mt-1 pt-1">
                    <RouterLink
                      to="/admin/membros"
                      class="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-primary dark:text-secondary hover:bg-primary/10 dark:hover:bg-secondary/10 transition-colors"
                      @click="showUserMenu = false"
                    >
                      <span class="material-symbols-outlined text-[20px]">dashboard</span>
                      {{ t('navigation.dashboardAdmin') }}
                    </RouterLink>
                  </div>
                  <button
                    @click="handleLogout"
                    class="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors text-left"
                  >
                    <span class="material-symbols-outlined text-[20px]">logout</span>
                    {{ t('navigation.logout') }}
                  </button>
                </div>
              </div>
            </Transition>
          </div>
        </div>

        <!-- Mobile Menu - Theme and Language (when not logged in) -->
        <div v-if="!props.showNavigation" class="md:hidden flex items-center gap-3">
          <AnimatedThemeToggler />
          
          <!-- Language Switcher Mobile -->
          <div class="relative" ref="languageMenuContainerMobile">
            <button
              @click.stop="toggleLanguageMenu"
              class="flex items-center gap-1 px-2 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-surface-lighter transition-colors"
            >
              <span class="text-lg">{{ currentLocaleData.flag }}</span>
              <span class="material-icons text-sm">expand_more</span>
            </button>
            
            <!-- Language Dropdown Mobile -->
            <Transition
              enter-active-class="transition-all duration-200"
              enter-from-class="opacity-0 scale-95 translate-y-2"
              enter-to-class="opacity-100 scale-100 translate-y-0"
              leave-active-class="transition-all duration-200"
              leave-from-class="opacity-100 scale-100 translate-y-0"
              leave-to-class="opacity-0 scale-95 translate-y-2"
            >
              <div
                v-if="showLanguageMenu"
                class="absolute right-0 mt-2 w-48 rounded-xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 shadow-2xl z-50 overflow-hidden"
                @click.stop
              >
                <div class="p-2">
                  <button
                    v-for="locale in availableLocales"
                    :key="locale.code"
                    @click="handleLocaleChange(locale.code)"
                    class="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors"
                    :class="[
                      currentLocale === locale.code
                        ? 'bg-primary/10 text-primary dark:bg-secondary/10 dark:text-secondary'
                        : 'text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-surface-lighter'
                    ]"
                  >
                    <span class="text-lg">{{ locale.flag }}</span>
                    <span>{{ locale.name }}</span>
                    <span v-if="currentLocale === locale.code" class="material-icons text-sm ml-auto">check</span>
                  </button>
                </div>
              </div>
            </Transition>
          </div>
        </div>

        <!-- User Menu -->
        <div class="hidden md:flex items-center gap-5">
          <AnimatedThemeToggler />
          <NotificationsDropdown />
          
          <!-- Language Switcher -->
          <div class="relative" ref="languageMenuContainer">
            <button
              @click.stop="toggleLanguageMenu"
              class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-surface-lighter transition-colors"
            >
              <span class="text-lg">{{ currentLocaleData.flag }}</span>
              <span class="hidden lg:block">{{ currentLocaleData.code.split('-')[0].toUpperCase() }}</span>
              <span class="material-icons text-sm">expand_more</span>
            </button>
            
            <!-- Language Dropdown -->
            <Transition
              enter-active-class="transition-all duration-200"
              enter-from-class="opacity-0 scale-95 translate-y-2"
              enter-to-class="opacity-100 scale-100 translate-y-0"
              leave-active-class="transition-all duration-200"
              leave-from-class="opacity-100 scale-100 translate-y-0"
              leave-to-class="opacity-0 scale-95 translate-y-2"
            >
              <div
                v-if="showLanguageMenu"
                class="absolute right-0 mt-2 w-48 rounded-xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 shadow-2xl z-50 overflow-hidden"
                @click.stop
              >
                <div class="p-2">
                  <button
                    v-for="locale in availableLocales"
                    :key="locale.code"
                    @click="handleLocaleChange(locale.code)"
                    class="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors"
                    :class="[
                      currentLocale === locale.code
                        ? 'bg-primary/10 text-primary dark:bg-secondary/10 dark:text-secondary'
                        : 'text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-surface-lighter'
                    ]"
                  >
                    <span class="text-lg">{{ locale.flag }}</span>
                    <span>{{ locale.name }}</span>
                    <span v-if="currentLocale === locale.code" class="material-icons text-sm ml-auto">check</span>
                  </button>
                </div>
              </div>
            </Transition>
          </div>
          
          <!-- User Menu (only when logged in) -->
          <template v-if="isAuthenticated && props.showNavigation">
            <div class="relative group cursor-pointer" ref="userMenuContainer">
            <div class="flex items-center gap-2 lg:gap-3" @click.stop="toggleUserMenu">
              <div class="relative">
                <div
                  class="absolute -inset-0.5 bg-gradient-to-r from-primary to-secondary rounded-full blur opacity-75 group-hover:opacity-100 transition duration-200"
                ></div>
                <Avatar
                  :src="userAvatar"
                  :name="userName"
                  size="md"
                  class="relative border-2 border-white dark:border-surface-dark"
                />
              </div>
              <div class="text-left hidden lg:block">
                <p
                  class="text-sm font-bold text-slate-900 dark:text-white group-hover:text-primary dark:group-hover:text-secondary transition-colors"
                >
                  {{ userDisplayName }}
                </p>
                <p class="text-xs text-slate-500 dark:text-gray-400 truncate">{{ userTitle }}</p>
              </div>
            </div>

            <!-- Dropdown Menu -->
            <Transition
              enter-active-class="transition-all duration-200"
              enter-from-class="opacity-0 scale-95 translate-y-2"
              enter-to-class="opacity-100 scale-100 translate-y-0"
              leave-active-class="transition-all duration-200"
              leave-from-class="opacity-100 scale-100 translate-y-0"
              leave-to-class="opacity-0 scale-95 translate-y-2"
            >
              <div
                v-if="showUserMenu"
                class="absolute right-0 mt-2 w-56 rounded-xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 shadow-2xl z-50 overflow-hidden"
                @click.stop
              >
                <div class="p-2">
                  <RouterLink
                    to="/conexoes"
                    class="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-surface-lighter transition-colors"
                    @click="showUserMenu = false"
                  >
                    <span class="material-symbols-outlined text-[20px]">groups</span>
                    {{ t('navigation.myNetwork') }}
                  </RouterLink>
                  <RouterLink
                    to="/meus-servicos"
                    class="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-surface-lighter transition-colors"
                    @click="showUserMenu = false"
                  >
                    <span class="material-symbols-outlined text-[20px]">shopping_bag</span>
                    {{ t('navigation.myServices') }}
                  </RouterLink>
                  <RouterLink
                    to="/my-programs"
                    class="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-surface-lighter transition-colors"
                    @click="showUserMenu = false"
                  >
                    <span class="material-symbols-outlined text-[20px]">school</span>
                    {{ t('programs.myPrograms') }}
                  </RouterLink>
                  <RouterLink
                    to="/perfil"
                    class="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-surface-lighter transition-colors"
                    @click="showUserMenu = false"
                  >
                    <span class="material-symbols-outlined text-[20px]">person</span>
                    {{ t('navigation.myProfile') }}
                  </RouterLink>
                  <RouterLink
                    to="/contact-us"
                    class="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-surface-lighter transition-colors"
                    @click="showUserMenu = false"
                  >
                    <span class="material-symbols-outlined text-[20px]">mail</span>
                    {{ t('navigation.contactUs') }}
                  </RouterLink>
                  <!-- Dashboard Professor (para profs e admins) -->
                  <div v-if="isProfessor" class="border-t border-slate-200 dark:border-white/10 mt-1 pt-1">
                    <RouterLink
                      to="/professor"
                      class="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-primary dark:text-secondary hover:bg-primary/10 dark:hover:bg-secondary/10 transition-colors"
                      @click="showUserMenu = false"
                    >
                      <span class="material-symbols-outlined text-[20px]">school</span>
                      {{ t('navigation.dashboardProfessor') }}
                    </RouterLink>
                  </div>

                  <!-- Dashboard Admin (apenas para admins) -->
                  <div v-if="isAdmin" class="border-t border-slate-200 dark:border-white/10 mt-1 pt-1">
                    <RouterLink
                      to="/admin/membros"
                      class="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-primary dark:text-secondary hover:bg-primary/10 dark:hover:bg-secondary/10 transition-colors"
                      @click="showUserMenu = false"
                    >
                      <span class="material-symbols-outlined text-[20px]">dashboard</span>
                      {{ t('navigation.dashboardAdmin') }}
                    </RouterLink>
                  </div>
                  <button
                    @click="handleLogout"
                    class="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors text-left"
                  >
                    <span class="material-symbols-outlined text-[20px]">logout</span>
                    {{ t('navigation.logout') }}
                  </button>
                </div>
              </div>
            </Transition>
          </div>
          </template>
        </div>

      </div>
    </nav>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useUserStore } from '@/stores/user'
import { useLocale } from '@/composables/useLocale'
import Avatar from '@/components/ui/Avatar.vue'
import AnimatedThemeToggler from '@/components/ui/AnimatedThemeToggler.vue'
import NotificationsDropdown from '@/components/layout/NotificationsDropdown.vue'
import { usePublicAccess } from '@/composables/usePublicAccess'
import { useTheme } from '@/composables/useTheme'

interface Props {
  showNavigation?: boolean
  showLogo?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showNavigation: true,
  showLogo: true
})

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { isAuthenticated, showAuthModal } = usePublicAccess()
const { locale: currentLocale, setLocale, availableLocales, t } = useLocale()
const { toggleTheme } = useTheme()

const showUserMenu = ref(false)
const showLanguageMenu = ref(false)
const userMenuContainer = ref<HTMLElement | null>(null)
const userMenuContainerMobile = ref<HTMLElement | null>(null)
const languageMenuContainer = ref<HTMLElement | null>(null)
const themeTogglerRef = ref<any>(null)

// Handler to trigger the animated theme toggle
function handleThemeClick() {
  if (themeTogglerRef.value && themeTogglerRef.value.handleToggle) {
    themeTogglerRef.value.handleToggle()
  } else {
    // Fallback if ref is not available
    toggleTheme()
  }
}

const userStore = useUserStore()

const userName = computed(() => authStore.user?.email?.split('@')[0] || 'Usuário')
const userAvatar = computed(
  () => userStore.profile?.avatar_url || authStore.user?.user_metadata?.avatar_url || ''
)
const userDisplayName = computed(() => userStore.profile?.nome || userName.value)
const userTitle = computed(() => {
  if (userStore.profile?.role === 'professor') return 'Professor'
  if (userStore.profile?.role === 'admin') return 'Administrador'
  return userStore.profile?.area_atuacao || 'Membro'
})
const isAdmin = computed(() => userStore.profile?.role === 'admin')
const isProfessor = computed(() => ['admin', 'professor'].includes(userStore.profile?.role || ''))

function toggleUserMenu() {
  showUserMenu.value = !showUserMenu.value
  showLanguageMenu.value = false
}

function toggleLanguageMenu() {
  showLanguageMenu.value = !showLanguageMenu.value
  showUserMenu.value = false
}

// Toggle between available languages
function toggleLanguage() {
  const newLocale = currentLocale.value === 'pt-BR' ? 'en-US' : 'pt-BR'
  setLocale(newLocale)
}


function handleLocaleChange(newLocale: string) {
  setLocale(newLocale)
  showLanguageMenu.value = false
  // Não fechamos o menu de usuário se estiver no mobile, 
  // permitindo que o usuário veja a mudança de idioma
}

const currentLocaleData = computed(() => {
  return availableLocales.find(l => l.code === currentLocale.value) || availableLocales[0]
})

const isLoggingOut = ref(false)

async function handleLogout() {
  // Prevenir múltiplos cliques
  if (isLoggingOut.value) {
    return
  }

  isLoggingOut.value = true
  showUserMenu.value = false

  // Limpar estado local imediatamente para feedback visual rápido
  authStore.user = null
  const userStore = useUserStore()
  userStore.clearProfile()

  // Fazer signOut primeiro
  try {
    await authStore.signOut()
  } catch (err: any) {
    // Ignorar erros - vamos redirecionar mesmo assim
  }

  // Redirecionar para página de login usando router
  router.push({ name: 'Login' })
}

function handleClickOutside(event: MouseEvent) {
  if (userMenuContainer.value && !userMenuContainer.value.contains(event.target as Node)) {
    showUserMenu.value = false
  }
  if (userMenuContainerMobile.value && !userMenuContainerMobile.value.contains(event.target as Node)) {
    showUserMenu.value = false
  }
  if (languageMenuContainer.value && !languageMenuContainer.value.contains(event.target as Node)) {
    showLanguageMenu.value = false
  }
}

onMounted(() => {
  // Usar setTimeout para evitar que o evento de click que abriu o menu também o feche
  setTimeout(() => {
    document.addEventListener('click', handleClickOutside)
  }, 0)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
