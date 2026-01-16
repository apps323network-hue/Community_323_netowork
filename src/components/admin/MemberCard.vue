<template>
  <div v-if="loading" class="relative rounded-[24px] p-6 bg-white dark:bg-slate-900/50 backdrop-blur-sm border border-slate-200 dark:border-white/10 animate-pulse group shadow-sm">
    <div class="flex flex-col sm:flex-row items-start justify-between gap-6">
      <div class="flex items-start gap-4 flex-1">
        <div class="w-16 h-16 rounded-full bg-slate-800 shrink-0"></div>
        <div class="flex flex-col gap-2 flex-1">
          <div class="h-6 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/3"></div>
          <div class="h-4 bg-slate-100 dark:bg-slate-800/50 rounded-lg w-1/2"></div>
          <div class="flex gap-2 mt-2">
            <div class="h-8 bg-slate-100 dark:bg-slate-800/50 rounded-lg w-24"></div>
            <div class="h-4 bg-slate-50 dark:bg-slate-800/30 rounded-lg w-32 mt-2"></div>
          </div>
        </div>
      </div>
      <div class="flex flex-col items-end gap-4 shrink-0 w-full sm:w-auto">
        <div class="flex gap-4">
          <div class="w-12 h-10 bg-slate-100 dark:bg-slate-800 rounded-lg"></div>
          <div class="w-12 h-10 bg-slate-100 dark:bg-slate-800 rounded-lg"></div>
          <div class="w-12 h-10 bg-slate-100 dark:bg-slate-800 rounded-lg"></div>
        </div>
        <div class="flex gap-2 pt-2 border-t border-slate-100 dark:border-white/5 w-full justify-end">
          <div class="w-10 h-10 bg-slate-50 dark:bg-slate-800/50 rounded-lg"></div>
          <div class="w-10 h-10 bg-slate-50 dark:bg-slate-800/50 rounded-lg"></div>
          <div class="w-10 h-10 bg-slate-50 dark:bg-slate-800/50 rounded-lg"></div>
        </div>
      </div>
    </div>
    <div class="mt-8 flex items-center justify-between border-t border-white/5 pt-2">
      <div class="w-24 h-3 bg-slate-800/30 rounded"></div>
      <div class="w-32 h-3 bg-slate-800/30 rounded"></div>
    </div>
  </div>

  <div v-else class="relative rounded-[24px] p-6 bg-white dark:bg-slate-900/50 backdrop-blur-sm border border-slate-200 dark:border-white/10 hover:border-primary/50 transition-all duration-300 hover:shadow-premium-hover group shadow-sm">
    <div class="flex flex-col sm:flex-row items-start justify-between gap-6">
      <!-- Left Side: Avatar + Info -->
      <div class="flex items-start gap-4 flex-1 min-w-0">
        <!-- Avatar -->
        <div class="relative shrink-0">
          <img 
            v-if="user?.avatar_url" 
            :src="user.avatar_url" 
            :alt="user.nome || 'User'"
            class="w-16 h-16 rounded-full object-cover ring-2 ring-slate-100 dark:ring-white/10 group-hover:ring-primary transition-all"
          />
          <div 
            v-else 
            class="w-16 h-16 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 dark:from-primary/20 dark:to-secondary/20 flex items-center justify-center ring-2 ring-slate-100 dark:ring-white/10 group-hover:ring-primary transition-all"
          >
            <span class="text-slate-900 dark:text-white font-black text-2xl">{{ initials }}</span>
          </div>
          
          <!-- Online indicator -->
          <div 
            v-if="isOnline" 
            class="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-slate-900 shadow-[0_0_10px_rgba(34,197,94,0.5)]"
          ></div>
        </div>

        <!-- Info -->
        <div class="flex flex-col gap-1 min-w-0 flex-1">
          <!-- Name + Badges -->
          <div class="flex flex-wrap items-center gap-2">
            <h3 class="text-slate-900 dark:text-white font-bold text-lg truncate leading-tight">{{ user?.nome || 'User' }}</h3>

            <span v-if="user?.plano" class="px-2 py-0.5 rounded-lg text-[10px] font-medium" :class="planClass">
              {{ user.plano }}
            </span>
            
            <UserStatusBadge v-if="user" :status="user.status" size="sm" />
          </div>

          <!-- Email -->
          <p class="text-slate-500 dark:text-white/60 text-sm font-semibold truncate">{{ user?.email }}</p>

          <!-- Role Selector -->
          <div class="flex flex-wrap items-center gap-3 mt-2">
            <div class="relative group/role">
              <select
                v-if="user"
                :value="user.role || 'user'"
                @change="handleRoleChange"
                class="appearance-none bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-1.5 pr-8 text-xs text-slate-700 dark:text-white/80 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all cursor-pointer hover:bg-white/10 font-bold"
              >
                <option value="user" class="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Member</option>
                <option value="professor" class="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Professor</option>
                <option value="partner" class="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Partner</option>
                <option value="admin" class="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Admin</option>
              </select>
              <span class="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/40 text-sm pointer-events-none group-hover/role:text-white/60 transition-colors">
                expand_more
              </span>
            </div>

            <div v-if="locationText" class="flex items-center gap-1 text-slate-400 dark:text-white/40 text-[10px] font-bold uppercase tracking-wider truncate">
              <span class="material-symbols-outlined text-sm shrink-0">location_on</span>
              <span class="truncate">{{ locationText }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Side: Stats & Actions -->
      <div class="flex flex-col items-end gap-4 shrink-0 w-full sm:w-auto">
        <!-- Stats -->
        <div class="flex gap-4 w-full sm:w-auto justify-around sm:justify-end">
          <div class="flex flex-col items-center" title="Total de Posts">
            <span class="text-slate-900 dark:text-white font-black text-lg leading-none">{{ user?.post_count || 0 }}</span>
            <span class="text-slate-400 dark:text-white/40 text-[9px] uppercase font-black tracking-widest mt-1">Posts</span>
          </div>
          <div class="flex flex-col items-center" title="Conexões">
            <span class="text-slate-900 dark:text-white font-black text-lg leading-none">{{ user?.connections_count || 0 }}</span>
            <span class="text-slate-400 dark:text-white/40 text-[9px] uppercase font-black tracking-widest mt-1">Net</span>
          </div>
          <div class="flex flex-col items-center" title="Pontos">
            <span class="text-primary font-black text-lg leading-none">{{ user?.pontos || 0 }}</span>
            <span class="text-slate-400 dark:text-white/40 text-[9px] uppercase font-black tracking-widest mt-1">XP</span>
          </div>
        </div>

        <!-- Admin Actions -->
        <div class="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-white/5 w-full justify-end">
          <button
            v-if="user"
            @click="$emit('view-profile', user.id)"
            class="p-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-white/60 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 hover:border-slate-300 dark:hover:border-white/20 transition-all font-bold"
            title="View Profile"
          >
            <span class="material-symbols-outlined text-lg">visibility</span>
          </button>
          
          <button
            v-if="user?.status === 'active'"
            @click="$emit('suspend', user.id)"
            class="p-2 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-500/60 hover:text-yellow-500 hover:bg-yellow-500/20 transition-all"
            title="Suspend"
          >
            <span class="material-symbols-outlined text-lg">timer</span>
          </button>
          
          <button
            v-if="user?.status === 'suspended'"
            @click="$emit('unsuspend', user.id)"
            class="p-2 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500/60 hover:text-green-500 hover:bg-green-500/20 transition-all"
            title="Activate"
          >
            <span class="material-symbols-outlined text-lg">play_circle</span>
          </button>
          
          <!-- Approve Button (for pending members) -->
          <button
            v-if="user?.status === 'pending'"
            @click="$emit('approve', user.id)"
            class="p-2 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500/60 hover:text-green-500 hover:bg-green-500/20 transition-all"
            title="Approve Member"
          >
            <span class="material-symbols-outlined text-lg">check_circle</span>
          </button>
          
          <button
            v-if="user?.status !== 'banned' && user"
            @click="$emit('ban', user.id)"
            class="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500/60 hover:text-red-500 hover:bg-red-500/20 transition-all"
            title="Ban"
          >
            <span class="material-symbols-outlined text-lg">block</span>
          </button>
          
          <button
            v-if="user?.status === 'banned' && user"
            @click="$emit('unban', user.id)"
            class="p-2 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500/60 hover:text-green-500 hover:bg-green-500/20 transition-all"
            title="Unban"
          >
            <span class="material-symbols-outlined text-lg">check_circle</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Strikes Warning (if any) -->
    <div v-if="user?.strikes && user.strikes > 0" class="mt-4 flex items-center gap-2 p-2 bg-red-500/10 border border-red-500/20 rounded-lg">
      <span class="material-symbols-outlined text-red-500 text-lg">warning</span>
      <span class="text-red-400 text-xs font-medium">{{ user.strikes }} active strike(s)</span>
    </div>

    <!-- Footer Info -->
    <div v-if="user" class="mt-4 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-white/30 border-t border-slate-100 dark:border-white/5 pt-2">
      <div class="flex items-center gap-1">
        <span class="material-symbols-outlined text-[12px]">schedule</span>
        <span>{{ lastSeenText }}</span>
      </div>
      <div class="flex items-center gap-1">
        <span class="material-symbols-outlined text-[12px]">calendar_today</span>
        <span>Registered {{ cadastradoText }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { AdminUser, UserRole } from '@/types/admin'
import { formatDistanceToNow } from 'date-fns'

import UserStatusBadge from '@/components/ui/UserStatusBadge.vue'
import { enUS } from 'date-fns/locale'

interface Props {
  user?: AdminUser
  loading?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'view-profile': [userId: string]
  'suspend': [userId: string]
  'unsuspend': [userId: string]
  'ban': [userId: string]
  'unban': [userId: string]
  'update-role': [userId: string, role: UserRole]
  'approve': [userId: string]
}>()

const initials = computed(() => {
  if (!props.user?.nome) return 'U'
  const names = props.user.nome.split(' ')
  if (names.length === 1) return names[0].charAt(0).toUpperCase()
  return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase()
})

const isOnline = computed(() => {
  if (!props.user?.last_seen_at) return false
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
  return new Date(props.user.last_seen_at) > fiveMinutesAgo
})

const planClass = computed(() => {
  const classes: Record<string, string> = {
    Free: 'bg-slate-500/20 text-slate-300 border border-slate-500/30',
    Member: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
    Premium: 'bg-gradient-to-r from-primary/20 to-secondary/20 text-white border border-primary/30'
  }
  return classes[props.user?.plano || 'Free'] || classes.Free
})

const locationText = computed(() => {
  if (!props.user) return ''
  const parts = []
  if (props.user.cidade) parts.push(props.user.cidade)
  if (props.user.estado) parts.push(props.user.estado)
  if (props.user.pais) parts.push(props.user.pais)
  return parts.join(', ')
})

const lastSeenText = computed(() => {
  if (!props.user?.last_seen_at) return 'Never seen'
  return 'Seen ' + formatDistanceToNow(new Date(props.user.last_seen_at), { 
    addSuffix: true, 
    locale: enUS 
  })
})

const cadastradoText = computed(() => {
  if (!props.user?.created_at) return ''
  return formatDistanceToNow(new Date(props.user.created_at), { 
    addSuffix: true, 
    locale: enUS 
  })
})

function handleRoleChange(event: Event) {
  if (!props.user) return
  const role = (event.target as HTMLSelectElement).value as UserRole
  emit('update-role', props.user.id, role)
}
</script>
