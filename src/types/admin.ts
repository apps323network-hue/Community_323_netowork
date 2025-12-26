import type { Event, EventStatus } from './events'

export type UserRole = 'user' | 'partner' | 'admin'
export type UserStatus = 'pending' | 'active' | 'suspended' | 'banned'

export interface AdminEvent extends Event {
  status: EventStatus
  partner_id?: string
  approved_by?: string
  approved_at?: string
  rejection_reason?: string
  // Joined data from profiles
  creator_name?: string
  creator_email?: string
  partner_name?: string
}

export interface EventApprovalAction {
  eventId: string
  action: 'approve' | 'reject'
  reason?: string
}

export interface EventStats {
  total: number
  pending: number
  approved: number
  rejected: number
}

export interface AdminUser {
  id: string
  nome?: string
  email?: string
  area_atuacao?: string
  cidade?: string
  pais?: string
  status: UserStatus
  strikes: number
  approved_by?: string
  approved_at?: string
  rejection_reason?: string
  suspended_until?: string
  created_at: string
  updated_at?: string
}

export interface UserStats {
  total: number
  pending: number
  active: number
  suspended: number
  banned: number
  newToday: number
}

import type { Post, PostStatus } from './posts'

export interface AdminPost extends Post {
  status: PostStatus
  author_name?: string
  author_email?: string
}

export interface PostStats {
  total: number
  pending: number
  approved: number
  hidden: number
  removed: number
  spam: number
  removedToday: number
}



