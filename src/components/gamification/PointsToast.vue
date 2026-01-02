<template>
  <Teleport to="body">
    <TransitionGroup name="points-toast" tag="div" class="fixed top-20 right-4 z-[100] flex flex-col gap-3 pointer-events-none">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        class="points-notification bg-gradient-to-r from-secondary/90 to-primary/90 backdrop-blur-xl text-white px-6 py-4 rounded-2xl shadow-[0_8px_32px_rgba(0,240,255,0.4)] border border-white/20 flex items-center gap-4 min-w-[280px] pointer-events-auto"
      >
        <!-- Animated Icon -->
        <div class="relative flex-shrink-0">
          <!-- Pulsing glow effect -->
          <div class="absolute inset-0 bg-yellow-300 rounded-full blur-xl opacity-60 animate-ping"></div>
          
          <!-- Icon container -->
          <div class="relative w-12 h-12 bg-white/20 rounded-full flex items-center justify-center animate-bounce-gentle">
            <span class="material-symbols-outlined text-yellow-300 text-3xl drop-shadow-[0_0_8px_rgba(253,224,71,0.8)]">
              {{ notification.icon }}
            </span>
          </div>

          <!-- Sparkles -->
          <div class="absolute -top-1 -right-1 w-3 h-3 bg-yellow-300 rounded-full animate-sparkle-1"></div>
          <div class="absolute -bottom-1 -left-1 w-2 h-2 bg-white rounded-full animate-sparkle-2"></div>
          <div class="absolute top-0 -left-2 w-2 h-2 bg-yellow-200 rounded-full animate-sparkle-3"></div>
        </div>

        <!-- Content -->
        <div class="flex-grow">
          <p class="font-black text-lg tracking-tight leading-none mb-1 animate-slide-up">
            {{ notification.title }}
          </p>
          <p class="text-sm text-white/80 font-medium">
            {{ notification.message }}
          </p>
        </div>

        <!-- Points Badge -->
        <div class="flex-shrink-0 bg-white/30 backdrop-blur-sm px-4 py-2 rounded-xl border-2 border-white/40 animate-scale-in">
          <p class="text-2xl font-black text-yellow-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
            +{{ notification.points }}
          </p>
        </div>
      </div>
    </TransitionGroup>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface PointsNotification {
  id: number
  title: string
  message: string
  points: number
  icon: string
}

const notifications = ref<PointsNotification[]>([])
let notificationId = 0

function show(points: number, message: string, icon: string = 'stars') {
  const id = ++notificationId
  
  const notification: PointsNotification = {
    id,
    title: `+${points} Pontos!`,
    message,
    points,
    icon
  }

  notifications.value.push(notification)

  // Auto-remove after 3.5 seconds
  setTimeout(() => {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }, 3500)
}

defineExpose({
  show
})
</script>

<style scoped>
/* Toast enter/leave transitions */
.points-toast-enter-active {
  animation: slideInRight 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.points-toast-leave-active {
  animation: fadeOutRight 0.4s ease-in-out;
}

@keyframes slideInRight {
  from {
    transform: translateX(400px) scale(0.8);
    opacity: 0;
  }
  to {
    transform: translateX(0) scale(1);
    opacity: 1;
  }
}

@keyframes fadeOutRight {
  from {
    transform: translateX(0) scale(1);
    opacity: 1;
  }
  to {
    transform: translateX(100px) scale(0.9);
    opacity: 0;
  }
}

/* Gentle bounce for icon */
@keyframes bounce-gentle {
  0%, 100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-8px) scale(1.05);
  }
}

.animate-bounce-gentle {
  animation: bounce-gentle 1s ease-in-out infinite;
}

/* Slide up animation for text */
@keyframes slideUp {
  from {
    transform: translateY(10px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.animate-slide-up {
  animation: slideUp 0.4s ease-out 0.2s backwards;
}

/* Scale in for badge */
@keyframes scaleIn {
  from {
    transform: scale(0);
  }
  to {
    transform: scale(1);
  }
}

.animate-scale-in {
  animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s backwards;
}

/* Sparkle animations */
@keyframes sparkle1 {
  0%, 100% {
    transform: scale(0) rotate(0deg);
    opacity: 0;
  }
  50% {
    transform: scale(1.5) rotate(180deg);
    opacity: 1;
  }
}

@keyframes sparkle2 {
  0%, 100% {
    transform: scale(0) rotate(0deg);
    opacity: 0;
  }
  50% {
    transform: scale(1.8) rotate(-180deg);
    opacity: 1;
  }
}

@keyframes sparkle3 {
  0%, 100% {
    transform: scale(0) rotate(0deg);
    opacity: 0;
  }
  50% {
    transform: scale(1.3) rotate(90deg);
    opacity: 1;
  }
}

.animate-sparkle-1 {
  animation: sparkle1 1.5s ease-in-out infinite;
}

.animate-sparkle-2 {
  animation: sparkle2 1.8s ease-in-out infinite 0.3s;
}

.animate-sparkle-3 {
  animation: sparkle3 2s ease-in-out infinite 0.6s;
}
</style>
