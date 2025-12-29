<template>
  <div class="min-h-screen bg-background-dark flex flex-col">
    <!-- Header - Full Width -->
    <div class="w-full fixed top-0 left-0 right-0 z-50">
      <AdminHeader />
    </div>

    <div class="flex flex-1 pt-16">
      <!-- Sidebar -->
      <div class="hidden lg:block fixed left-0 top-16 bottom-0 z-40">
        <AdminSidebar />
      </div>

      <!-- Main Content -->
      <div class="flex-1 lg:pl-64 flex flex-col min-h-[calc(100vh-4rem)] w-full">

        <!-- Main Content Area -->
        <main class="flex-1 p-6 lg:p-8 w-full">
          <div class="max-w-7xl mx-auto w-full">
            <slot />
          </div>
        </main>
      </div>
    </div>

    <!-- Mobile Sidebar Overlay -->
    <Transition
      enter-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-300"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="showMobileSidebar"
        class="fixed inset-0 bg-black/50 z-40 lg:hidden"
        @click="showMobileSidebar = false"
      ></div>
    </Transition>

    <!-- Mobile Sidebar -->
    <Transition
      enter-active-class="transition-transform duration-300"
      enter-from-class="-translate-x-full"
      enter-to-class="translate-x-0"
      leave-active-class="transition-transform duration-300"
      leave-from-class="translate-x-0"
      leave-to-class="-translate-x-full"
    >
      <div
        v-if="showMobileSidebar"
        class="fixed left-0 top-0 bottom-0 z-50 lg:hidden"
      >
        <AdminSidebar @navigate="showMobileSidebar = false" />
      </div>
    </Transition>

    <!-- Mobile Menu Button -->
    <button
      @click="showMobileSidebar = !showMobileSidebar"
      class="fixed bottom-4 right-4 lg:hidden z-50 p-4 bg-primary rounded-full shadow-lg hover:bg-primary/80 transition-colors"
    >
      <span class="material-symbols-outlined text-white text-2xl">
        {{ showMobileSidebar ? 'close' : 'menu' }}
      </span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AdminHeader from './AdminHeader.vue'
import AdminSidebar from './AdminSidebar.vue'

const showMobileSidebar = ref(false)
</script>

