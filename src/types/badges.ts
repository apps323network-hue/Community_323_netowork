export type BadgeType = 'Free' | 'Member' | 'Premium' | 'Founder' | 'Ambassador' | 'Verified'

export interface Badge {
  id: BadgeType
  name: string
  description: string
  color: string
  icon?: string
}

export const BADGES: Record<BadgeType, Badge> = {
  Free: {
    id: 'Free',
    name: 'Free',
    description: 'Membro gratuito',
    color: 'gray',
    icon: 'person',
  },
  Member: {
    id: 'Member',
    name: 'Member',
    description: 'Membro ativo',
    color: 'primary',
    icon: 'star',
  },
  Premium: {
    id: 'Premium',
    name: 'Premium',
    description: 'Membro premium',
    color: 'secondary',
    icon: 'diamond',
  },
  Founder: {
    id: 'Founder',
    name: 'Founder',
    description: 'Membro fundador',
    color: 'yellow',
    icon: 'celebration',
  },
  Ambassador: {
    id: 'Ambassador',
    name: 'Ambassador',
    description: 'Embaixador da comunidade',
    color: 'purple',
    icon: 'groups',
  },
  Verified: {
    id: 'Verified',
    name: 'Verified',
    description: 'Perfil verificado',
    color: 'blue',
    icon: 'verified',
  },
}

export function getBadgeById(id: string): Badge | null {
  return BADGES[id as BadgeType] || BADGES.Free
}

export function getBadgeColor(badgeId: string): string {
  const badge = getBadgeById(badgeId)
  return badge?.color || 'gray'
}

