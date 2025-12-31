<template>
  <footer class="bg-slate-900 dark:bg-background-dark border-t border-slate-800">
    <div class="container mx-auto px-6 py-16">
      <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
        <!-- Brand -->
        <div class="lg:col-span-1">
          <img
            alt="323 Network Logo"
            class="w-32 h-auto object-contain mb-4"
            src="/logo-removebg-preview.png"
          />
          <p class="text-gray-400 text-sm leading-relaxed mb-6">
            {{ t('landing.footer.description') }}
          </p>
          <!-- Social Links -->
          <!-- Social Links -->
          <div class="flex gap-4">
            <a 
              href="https://www.instagram.com/323network/" 
              target="_blank"
              class="w-10 h-10 rounded-full bg-slate-800 hover:bg-primary flex items-center justify-center text-gray-400 hover:text-white transition-all"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.645.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
          </div>
        </div>

        <!-- Quick Links -->
        <div>
          <h4 class="text-white font-bold mb-4">{{ t('landing.footer.quickLinks') }}</h4>
          <ul class="space-y-3">
            <li><a href="#about" class="text-gray-400 hover:text-primary transition-colors">{{ t('landing.footer.about') }}</a></li>
            <li><a href="#events" class="text-gray-400 hover:text-primary transition-colors">{{ t('landing.footer.events') }}</a></li>
            <li><a href="#portfolio" class="text-gray-400 hover:text-primary transition-colors">{{ t('landing.footer.portfolio') }}</a></li>
            <li><a href="#benefits" class="text-gray-400 hover:text-primary transition-colors">{{ t('landing.footer.benefits') }}</a></li>
          </ul>
        </div>

        <!-- Community -->
        <div>
          <h4 class="text-white font-bold mb-4">{{ t('landing.footer.community') }}</h4>
          <ul class="space-y-3">
            <li><router-link to="/login" class="text-gray-400 hover:text-primary transition-colors">{{ t('landing.footer.login') }}</router-link></li>
            <li><router-link to="/register" class="text-gray-400 hover:text-primary transition-colors">{{ t('landing.footer.register') }}</router-link></li>
            <li><a href="#" class="text-gray-400 hover:text-primary transition-colors">{{ t('landing.footer.faq') }}</a></li>
            <li><a href="#" class="text-gray-400 hover:text-primary transition-colors">{{ t('landing.footer.support') }}</a></li>
          </ul>
        </div>

        <!-- Contact -->
        <div>
          <h4 class="text-white font-bold mb-4">{{ t('landing.footer.contact') }}</h4>
          <ul class="space-y-3">
            <li class="flex items-center gap-2 text-gray-400">
              <span class="material-symbols-outlined text-lg text-primary">mail</span>
              admin@323network.com
            </li>
            <li class="flex items-center gap-2 text-gray-400">
              <span class="material-symbols-outlined text-lg text-primary">location_on</span>
              Los Angeles
            </li>
          </ul>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
        <p class="text-gray-500 text-sm">
          {{ t('landing.footer.copyright') }}
        </p>
        <div class="flex gap-6 text-sm">
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>
