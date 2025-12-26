<template>
  <AppLayout>
    <div class="space-y-8">
      <div class="text-center">
        <h1 class="text-4xl font-bold neon-text-gradient mb-4">Upgrade de Plano</h1>
        <p class="text-gray-400 text-lg">
          Escolha o plano ideal para você e desbloqueie todos os benefícios da 323 Network
        </p>
      </div>

      <!-- Current Plan -->
      <div v-if="planDetails" class="bg-surface-dark rounded-xl p-6 border border-primary/20">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-400 mb-1">Seu plano atual</p>
            <h2 class="text-2xl font-bold text-white">{{ planDetails.name }}</h2>
          </div>
          <BadgeDisplay :badge-id="currentPlan" size="lg" />
        </div>
      </div>

      <!-- Plans Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card
          v-for="plan in availablePlans"
          :key="plan.id"
          variant="dark"
          :class="[
            'p-6 relative overflow-hidden',
            plan.id === currentPlan ? 'border-primary ring-2 ring-primary/50' : '',
            plan.id === 'Premium' ? 'border-secondary/50' : ''
          ]"
        >
          <div v-if="plan.id === 'Premium'" class="absolute top-4 right-4">
            <Badge variant="secondary" size="sm">Popular</Badge>
          </div>

          <div class="mb-6">
            <h3 class="text-2xl font-bold text-white mb-2">{{ plan.name }}</h3>
            <p class="text-gray-400 text-sm">{{ plan.description }}</p>
            <div v-if="plan.price" class="mt-4">
              <span class="text-3xl font-black text-primary">${{ plan.price }}</span>
              <span class="text-gray-400 text-sm ml-2">/mês</span>
            </div>
          </div>

          <ul class="space-y-3 mb-6">
            <li
              v-for="feature in plan.features"
              :key="feature"
              class="flex items-start gap-2 text-sm text-gray-300"
            >
              <span class="material-symbols-outlined text-primary text-[18px] mt-0.5">check_circle</span>
              <span>{{ feature }}</span>
            </li>
          </ul>

          <Button
            v-if="plan.id !== currentPlan"
            :variant="plan.id === 'Premium' ? 'primary' : 'outline'"
            full-width
            @click="handleUpgrade(plan.id)"
          >
            {{ plan.id === currentPlan ? 'Plano Atual' : 'Fazer Upgrade' }}
          </Button>
          <div v-else class="w-full py-2 text-center text-gray-400 text-sm font-semibold">
            Plano Atual
          </div>
        </Card>
      </div>

      <!-- Note -->
      <div class="bg-surface-dark/50 rounded-xl p-4 border border-secondary/20">
        <p class="text-sm text-gray-400 text-center">
          💡 <strong class="text-secondary">Nota:</strong> A integração com sistema de pagamento será implementada em breve. Por enquanto, entre em contato com o suporte para fazer upgrade.
        </p>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import Badge from '@/components/ui/Badge.vue'
import BadgeDisplay from '@/components/ui/BadgeDisplay.vue'
import { usePlans } from '@/composables/usePlans'
import { toast } from 'vue-sonner'
import type { PlanType } from '@/types/plans'

const { currentPlan, planDetails, upgradeTo, PLANS } = usePlans()

const availablePlans = computed(() => {
  return Object.values(PLANS)
})

function handleUpgrade(planId: PlanType) {
  upgradeTo(planId)
  // TODO: Integrar com sistema de pagamento
  toast.info(`Upgrade para ${planId} - Integração de pagamento em desenvolvimento`)
}
</script>

