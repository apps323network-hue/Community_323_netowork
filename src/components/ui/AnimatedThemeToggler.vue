<template>
  <button
    ref="buttonRef"
    class="relative inline-flex items-center justify-center p-2 rounded-full text-slate-600 dark:text-gray-400 hover:text-primary dark:hover:text-secondary transition-colors"
    type="button"
    @click="handleToggle"
  >
    <!-- Ícones -->
    <span class="material-icons-outlined transition-all duration-300" :class="isDark ? 'rotate-90 scale-0 absolute' : 'rotate-0 scale-100'">dark_mode</span>
    <span class="material-icons-outlined transition-all duration-300" :class="isDark ? 'rotate-0 scale-100' : '-rotate-90 scale-0 absolute'">light_mode</span>
    <span class="sr-only">Toggle theme</span>
  </button>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { useTheme } from '@/composables/useTheme'

const { theme, toggleTheme } = useTheme()
const buttonRef = ref<HTMLButtonElement | null>(null)
const isDark = ref(theme.value === 'dark')

// Sincronizar estado local com o tema global
const updateLocalState = () => {
  isDark.value = document.documentElement.classList.contains('dark')
}

onMounted(() => {
  updateLocalState()
  
  const observer = new MutationObserver(updateLocalState)
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  })
})

const handleToggle = async () => {
  // Se o browser não suportar View Transitions, faz o toggle normal
  if (!(document as any).startViewTransition) {
    toggleTheme()
    return
  }

  const button = buttonRef.value
  if (!button) {
    toggleTheme();
    return;
  }

  // Pegar coordenadas do clique/botão para iniciar a animação de lá
  const { top, left, width, height } = button.getBoundingClientRect()
  const x = left + width / 2
  const y = top + height / 2
  const right = window.innerWidth - left
  const bottom = window.innerHeight - top
  const maxRadius = Math.hypot(
    Math.max(left, right),
    Math.max(top, bottom)
  )

  // Iniciar transição
  const transition = (document as any).startViewTransition(async () => {
    toggleTheme()
    await nextTick() // Esperar o Vue atualizar o DOM
  })

  // Aguardar o pseudo-elemento estar pronto e animar
  try {
    await transition.ready

    // Animar o clip-path
    document.documentElement.animate(
      {
        clipPath: [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${maxRadius}px at ${x}px ${y}px)`,
        ],
      },
      {
        duration: 500,
        easing: "ease-in-out",
        pseudoElement: "::view-transition-new(root)",
      }
    )
  } catch (e) {
    console.error('Animation failed', e)
  }
}
</script>

<style>
/* 
Necessário para habilitar a animação do View Transition no root.
Desabilitamos a animação padrão de fade do browser para controlar manualmente.
*/
::view-transition-old(root),
::view-transition-new(root) {
  animation: none;
  mix-blend-mode: normal;
  display: block;
}
</style>
