<template>
  <AppLayout>
    <div class="w-full flex flex-col gap-8">
      <!-- Header -->
      <div class="flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center">
        <div>
          <h1 class="text-white text-3xl lg:text-4xl font-black mb-2">
            Meus <span class="bg-clip-text text-transparent bg-neon-gradient">Eventos</span>
          </h1>
          <p class="text-white/60">
            Gerencie os eventos que você criou
          </p>
        </div>
        <button
          v-if="!showForm"
          class="flex items-center justify-center gap-2 px-6 py-3 bg-neon-gradient hover:bg-neon-gradient-hover text-black font-black rounded-lg transition-all shadow-neon-pink"
          @click="showForm = true"
        >
          <span class="material-symbols-outlined">add</span>
          Criar Novo Evento
        </button>
      </div>

      <!-- Form (when creating/editing) -->
      <PartnerEventForm
        v-if="showForm"
        :event="editingEvent"
        @event-created="handleEventCreated"
        @event-updated="handleEventUpdated"
        @cancel="handleCancelForm"
      />

      <!-- Events List -->
      <div v-else>
        <PartnerEventList
          :events="myEvents"
          :loading="loading"
          @edit="handleEdit"
          @view-details="handleViewDetails"
        />
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePartner } from '@/composables/usePartner'
import AppLayout from '@/components/layout/AppLayout.vue'
import PartnerEventForm from '@/components/partner/PartnerEventForm.vue'
import PartnerEventList from '@/components/partner/PartnerEventList.vue'
import type { Event } from '@/types/events'

const router = useRouter()
const { myEvents, isPartner, fetchMyEvents, loading } = usePartner()

const showForm = ref(false)
const editingEvent = ref<Event | null>(null)

async function handleEventCreated(_event: Event) {
  await fetchMyEvents()
  showForm.value = false
}

async function handleEventUpdated(_event: Event) {
  await fetchMyEvents()
  showForm.value = false
  editingEvent.value = null
}

function handleCancelForm() {
  showForm.value = false
  editingEvent.value = null
}

function handleEdit(eventId: string) {
  const event = myEvents.value.find(e => e.id === eventId)
  if (event) {
    editingEvent.value = event
    showForm.value = true
  }
}

function handleViewDetails(eventId: string) {
  router.push(`/eventos/${eventId}`)
}

onMounted(async () => {
  // Verificar se é parceiro
  if (!isPartner.value) {
    router.push('/')
    return
  }

  await fetchMyEvents()
})
</script>

<style scoped>
.bg-neon-gradient {
  background: linear-gradient(135deg, #f425f4 0%, #00f0ff 100%);
}

.bg-neon-gradient-hover {
  background: linear-gradient(135deg, #d914d9 0%, #00cce6 100%);
}

.shadow-neon-pink {
  box-shadow: 0 0 15px rgba(244, 37, 244, 0.3);
}
</style>










