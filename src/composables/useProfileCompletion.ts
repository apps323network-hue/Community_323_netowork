import { computed } from 'vue'
import { useUserStore } from '@/stores/user'

export function useProfileCompletion() {
    const userStore = useUserStore()

    // Campos obrigatórios para perfil completo
    const requiredFields = ['nome', 'area_atuacao', 'cidade', 'pais', 'nacionalidade'] as const

    // Verifica quais campos estão faltando
    const getMissingFields = computed(() => {
        if (!userStore.profile) return requiredFields

        return requiredFields.filter(field => {
            const value = userStore.profile?.[field]
            return !value || (typeof value === 'string' && value.trim() === '')
        })
    })

    // Verifica se o perfil está completo
    const isProfileComplete = computed(() => {
        return getMissingFields.value.length === 0
    })

    // Porcentagem de completude
    const completionPercentage = computed(() => {
        const total = requiredFields.length
        const completed = total - getMissingFields.value.length
        return Math.round((completed / total) * 100)
    })

    return {
        isProfileComplete,
        getMissingFields,
        completionPercentage,
        requiredFields
    }
}
