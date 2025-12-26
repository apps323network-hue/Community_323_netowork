<template>
  <!-- List View -->
  <div
    v-if="variant === 'list'"
    class="group p-3 sm:p-4 md:p-6 border-b border-white/5 hover:bg-white/5 transition-all duration-300 flex items-center gap-2 sm:gap-3 md:gap-4 lg:gap-6 cursor-pointer overflow-hidden"
    @click="$emit('view-profile', member.id)"
  >
    <!-- Avatar -->
    <div class="relative flex-shrink-0">
      <!-- Mobile: sm (32px + 4px border = 36px) -->
      <div class="sm:hidden">
        <Avatar
          :src="member.avatar_url"
          :name="member.nome"
          size="sm"
        />
      </div>
      <!-- Tablet: md (40px + 4px border = 44px) -->
      <div class="hidden sm:block md:hidden">
        <Avatar
          :src="member.avatar_url"
          :name="member.nome"
          size="md"
        />
      </div>
      <!-- Desktop: lg (64px + 4px border = 68px) mas reduzido -->
      <div class="hidden md:block">
        <div class="w-14 h-14 flex items-center justify-center">
          <div class="scale-[0.875]">
            <Avatar
              :src="member.avatar_url"
              :name="member.nome"
              size="lg"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Member Info -->
    <div class="flex-1 min-w-0 overflow-hidden">
      <h3 class="text-sm sm:text-base md:text-lg font-bold text-white group-hover:text-secondary transition-colors truncate">
        {{ member.nome }}
      </h3>
      <p class="text-xs sm:text-sm text-gray-400 truncate">
        {{ member.area_atuacao || 'Membro' }} • {{ [member.cidade, member.pais].filter(Boolean).join(', ') }}
      </p>
    </div>

    <!-- Action Buttons -->
    <div class="flex gap-1.5 sm:gap-2 md:gap-3 flex-shrink-0" @click.stop>
      <button
        class="px-2.5 sm:px-4 md:px-6 py-1.5 sm:py-2 md:py-2.5 rounded-md sm:rounded-lg border border-secondary/40 text-secondary bg-secondary/5 hover:bg-secondary/10 hover:border-secondary font-bold text-[10px] sm:text-xs md:text-sm tracking-wide transition-all shadow-[0_0_10px_rgba(0,240,255,0.1)] hover:shadow-neon-blue whitespace-nowrap"
      >
        Conectar
      </button>
      <button
        class="px-2 sm:px-2.5 md:px-3 py-1.5 sm:py-2 md:py-2.5 rounded-md sm:rounded-lg border border-gray-800 bg-card-dark text-gray-400 hover:text-secondary hover:border-secondary hover:bg-secondary/10 hover:shadow-neon-pink transition-all duration-300"
      >
        <span class="material-icons text-xs sm:text-sm md:text-base">chat</span>
      </button>
      <!-- Bookmark Button - sempre visível na lista -->
      <button
        :class="[
          'px-2 sm:px-2.5 md:px-3 py-1.5 sm:py-2 md:py-2.5 rounded-md sm:rounded-lg border transition-all duration-300',
          isBookmarkedComputed
            ? 'border-secondary/40 text-secondary bg-secondary/10 hover:bg-secondary/20 hover:shadow-neon-pink'
            : 'border-gray-800 bg-card-dark text-gray-400 hover:text-secondary hover:border-secondary hover:bg-secondary/10'
        ]"
        @click.stop="handleToggleBookmark"
        :disabled="bookmarkLoading"
      >
        <span class="material-icons text-xs sm:text-sm md:text-base">
          {{ isBookmarkedComputed ? 'bookmark' : 'bookmark_border' }}
        </span>
      </button>
    </div>
  </div>

  <!-- Featured/Grid View -->
  <div
    v-else
    class="relative group rounded-xl sm:rounded-2xl overflow-hidden bg-card-dark border border-white/5 shadow-xl hover:border-secondary/50 hover:shadow-neon-blue transition-all duration-500 hover:-translate-y-2 cursor-pointer"
    @click="$emit('view-profile', member.id)"
  >
    <!-- Gradient Cover -->
    <div
      class="h-24 sm:h-28 bg-gradient-to-r from-blue-700 via-blue-500 to-blue-400 opacity-90 group-hover:opacity-100 transition-opacity"
    ></div>

    <!-- Card Content -->
    <div class="px-4 sm:px-6 pb-4 sm:pb-6 relative">
      <!-- Avatar -->
      <div class="absolute -top-12 sm:-top-14 left-4 sm:left-6">
        <Avatar
          :src="member.avatar_url"
          :name="member.nome"
          size="xl"
          :border="false"
          class="ring-2 ring-transparent transition-all shadow-2xl"
        />
      </div>

      <!-- Bookmark Button -->
      <div class="flex justify-end pt-3 sm:pt-4">
        <button
          :class="[
            'transition-all duration-300',
            isBookmarkedComputed
              ? 'text-secondary hover:text-secondary/80 hover:scale-110'
              : 'text-gray-400 hover:text-white hover:scale-110'
          ]"
          @click.stop="handleToggleBookmark"
          :disabled="bookmarkLoading"
        >
          <span class="material-icons text-lg sm:text-xl">
            {{ isBookmarkedComputed ? 'bookmark' : 'bookmark_border' }}
          </span>
        </button>
      </div>

      <!-- Member Info -->
      <div class="pt-12 sm:pt-16">
        <!-- Name -->
        <h3 class="text-lg sm:text-xl font-bold text-white group-hover:text-secondary transition-colors mb-2 sm:mb-3">
          {{ member.nome }}
        </h3>

        <!-- Area/Role -->
        <p class="text-xs sm:text-sm text-secondary font-bold tracking-wide uppercase mb-2 sm:mb-3">
          {{ member.area_atuacao || 'Membro' }}
        </p>

        <!-- Description/Bio -->
        <p v-if="member.objetivo" class="text-xs sm:text-sm text-gray-300 mb-3 sm:mb-5 line-clamp-2 leading-relaxed">
          {{ member.objetivo }}
        </p>

        <!-- Tags/Skills -->
        <div v-if="member.badge" class="flex flex-wrap gap-2 mb-4 sm:mb-8">
          <BadgeDisplay :badge-id="member.badge" size="sm" />
        </div>

        <!-- Location -->
        <div
          v-if="member.cidade || member.pais"
          class="flex items-center gap-1 text-xs sm:text-sm text-gray-400 mb-3 sm:mb-5"
        >
          <span class="material-icons text-sm sm:text-base">place</span>
          {{ [member.cidade, member.pais].filter(Boolean).join(', ') }}
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-2 sm:gap-3">
          <button
            class="flex-1 bg-gradient-to-r from-blue-400 to-blue-600 hover:from-blue-300 hover:to-blue-500 text-black font-bold py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg sm:rounded-xl text-xs sm:text-sm transition-all shadow-glow-secondary hover:shadow-neon-blue hover:scale-[1.02]"
            @click.stop="$emit('view-profile', member.id)"
          >
            Conectar
          </button>
          <button
            class="p-2 sm:p-2.5 rounded-lg sm:rounded-xl border border-gray-700 hover:border-secondary hover:bg-secondary/10 hover:text-secondary hover:shadow-neon-pink text-gray-400 transition-all duration-300"
            @click.stop
          >
            <span class="material-icons text-lg sm:text-xl">chat_bubble_outline</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import Avatar from '@/components/ui/Avatar.vue'
import BadgeDisplay from '@/components/ui/BadgeDisplay.vue'
import { useBookmarks } from '@/composables/useBookmarks'
import type { Member } from '@/types/members'

interface Props {
  member: Member
  variant?: 'featured' | 'list'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'featured',
})

const emit = defineEmits<{
  'view-profile': [memberId: string]
  'bookmark-changed': [memberId: string, isBookmarked: boolean]
}>()

const { isBookmarked, toggleBookmark, fetchBookmarks, loading: bookmarkLoading } = useBookmarks()

const isBookmarkedComputed = computed(() => isBookmarked.value(props.member.id))

// Buscar bookmarks quando o componente for montado
onMounted(async () => {
  await fetchBookmarks()
})

async function handleToggleBookmark() {
  const wasBookmarked = isBookmarkedComputed.value
  const success = await toggleBookmark(props.member.id)
  if (success) {
    // Emitir o novo estado (invertido do anterior)
    emit('bookmark-changed', props.member.id, !wasBookmarked)
  }
}
</script>
