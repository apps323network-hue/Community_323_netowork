import { computed } from 'vue'
import { useUserStore } from '@/stores/user'
import type { BadgeType, Badge } from '@/types/badges'
import { BADGES, getBadgeById } from '@/types/badges'

export function useBadges() {
  const userStore = useUserStore()

  const userBadge = computed<Badge>(() => {
    if (!userStore.profile?.badge) return BADGES.Free
    return getBadgeById(userStore.profile.badge) || BADGES.Free
  })

  const badgeType = computed<BadgeType>(() => {
    if (!userStore.profile?.badge) return 'Free'
    return userStore.profile.badge as BadgeType
  })

  function hasBadge(badgeId: BadgeType): boolean {
    return badgeType.value === badgeId
  }

  function getBadgeDisplayName(badgeId?: string): string {
    if (!badgeId) return BADGES.Free.name
    const badge = getBadgeById(badgeId)
    return badge?.name || BADGES.Free.name
  }

  return {
    userBadge,
    badgeType,
    hasBadge,
    getBadgeDisplayName,
    BADGES,
  }
}

