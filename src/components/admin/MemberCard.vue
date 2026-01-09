<template>
  <div class="relative rounded-[24px] p-6 bg-slate-900/50 backdrop-blur-sm border border-white/10 hover:border-primary/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(244,37,244,0.2)] group">
    <div class="flex items-start justify-between gap-4">
      <!-- Left Side: Avatar + Info -->
      <div class="flex items-start gap-4">
        <!-- Avatar -->
        <div class="relative shrink-0">
          <img 
            v-if="user.avatar_url" 
            :src="user.avatar_url" 
            :alt="user.nome || 'User'"
            class="w-14 h-14 rounded-full object-cover ring-2 ring-white/10 group-hover:ring-primary/50 transition-all"
          />
          <div 
            v-else 
            class="w-14 h-14 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center ring-2 ring-white/10 group-hover:ring-primary/50 transition-all"
          >
            <span class="text-white font-black text-xl">{{ initials }}</span>
          </div>
          
          <!-- Online indicator -->
          <div 
            v-if="isOnline" 
            class="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-900"
          ></div>
        </div>

        <!-- Info -->
        <div class="flex flex-col gap-1">
          <!-- Name + Badges -->
          <div class="flex items-center gap-2">
            <h3 class="text-white font-bold text-lg truncate leading-tight">{{ user.nome || 'Usuário' }}</h3>

            <span v-if="user.plano" class="px-2 py-0.5 rounded-lg text-[10px] font-medium" :class="planClass">
              {{ user.plano }}
            </span>
          </div>

          <!-- Email -->
          <p class="text-white/60 text-sm font-medium">{{ user.email }}</p>

          <!-- Location & Chips -->
          <div class="flex items-center gap-2 mt-1">
            <span class="px-2 py-0.5 rounded-md text-[10px] font-medium bg-white/5 text-white/70 border border-white/10">
              {{ roleLabel }}
            </span>
            <div v-if="locationText" class="flex items-center gap-1 text-white/40 text-xs">
              <span class="material-symbols-outlined text-sm">location_on</span>
              <span>{{ locationText }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Side: Stats -->
      <div class="flex flex-col items-end gap-2">
        <div class="flex items-center gap-2 text-white/60 text-sm" title="Total de Posts">
          <span><strong class="text-white">{{ user.post_count || 0 }}</strong> Posts</span>
          <span class="material-symbols-outlined text-lg">article</span>
        </div>
        <div class="flex items-center gap-2 text-white/60 text-sm" title="Conexões">
          <span><strong class="text-white">{{ user.connections_count || 0 }}</strong> Conexões</span>
          <span class="material-symbols-outlined text-lg">group</span>
        </div>
      </div>
    </div>

    <!-- Strikes Warning (if any) -->
    <div v-if="user.strikes && user.strikes > 0" class="mt-4 flex items-center gap-2 p-2 bg-red-500/10 border border-red-500/20 rounded-lg">
      <span class="material-symbols-outlined text-red-500 text-lg">warning</span>
      <span class="text-red-400 text-xs font-medium">{{ user.strikes }} strike(s)</span>
    </div>

    <!-- Footer Info -->
    <div class="mt-4 flex items-center justify-between text-[10px] text-white/30 border-t border-white/5 pt-2">
      <span>{{ lastSeenText }}</span>
      <span>Cadastrado {{ cadastradoText }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { AdminUser } from '@/types/admin'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Props {
  user: AdminUser
}


const props = defineProps<Props>()



const initials = computed(() => {
  if (!props.user.nome) return 'U'
  const names = props.user.nome.split(' ')
  if (names.length === 1) return names[0].charAt(0).toUpperCase()
  return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase()
})

const isOnline = computed(() => {
  if (!props.user.last_seen_at) return false
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
  return new Date(props.user.last_seen_at) > fiveMinutesAgo
})

const roleLabel = computed(() => {
  const labels: Record<string, string> = {
    user: 'Membro',
    partner: 'Parceiro',
    admin: 'Admin',
    professor: 'Professor'
  }
  return labels[props.user.role || 'user'] || 'Membro'
})

const planClass = computed(() => {
  const classes: Record<string, string> = {
    Free: 'bg-slate-500/20 text-slate-300 border border-slate-500/30',
    Member: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
    Premium: 'bg-gradient-to-r from-primary/20 to-secondary/20 text-white border border-primary/30'
  }
  return classes[props.user.plano || 'Free'] || classes.Free
})

const locationText = computed(() => {
  const parts = []
  if (props.user.cidade) parts.push(props.user.cidade)
  if (props.user.estado) parts.push(props.user.estado)
  if (props.user.pais) parts.push(props.user.pais)
  return parts.join(', ')
})

const lastSeenText = computed(() => {
  if (!props.user.last_seen_at) return 'Nunca visto'
  return 'Visto ' + formatDistanceToNow(new Date(props.user.last_seen_at), { 
    addSuffix: true, 
    locale: ptBR 
  })
})

const cadastradoText = computed(() => {
  return formatDistanceToNow(new Date(props.user.created_at), { 
    addSuffix: true, 
    locale: ptBR 
  })
})


</script>
