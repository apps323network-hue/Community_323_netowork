import type { Event, EventStatus } from './events'

export type UserRole = 'user' | 'partner' | 'admin'

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


