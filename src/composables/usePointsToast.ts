import { toast } from 'vue-sonner'
import { markRaw } from 'vue'
import MinimalToast from '@/components/gamification/MinimalToast.vue'

export function usePointsToast() {
    function showPointsGained(points: number, message: string, icon: string = 'stars') {
        console.log('[Gamification] Showing custom points toast:', points, message, icon)

        // Delay para evitar sobreposição com warnings ou notificações de criação (ex: Post Criado)
        // e garantir que o usuário note a animação
        setTimeout(() => {
            // Usar componente customizado com markRaw para tentar recuperar o estilo premium
            toast(markRaw(MinimalToast), {
                componentProps: {
                    points,
                    message,
                    icon
                },
                duration: 4000,
                // Remove default styling of the toast container
                style: {
                    background: 'transparent',
                    border: 'none',
                    boxShadow: 'none',
                    padding: '0',
                    margin: '0',
                    width: '100%' // Ensure full width usage
                }
            })
        }, 500)
    }

    return {
        showPointsGained
    }
}
