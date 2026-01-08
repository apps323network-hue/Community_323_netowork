export type EventType = 'presencial' | 'webinar'
export type EventStatus = 'pending' | 'approved' | 'rejected'

export interface Event {
  id: string
  titulo: string
  descricao?: string
  data_hora: string
  tipo: EventType
  local?: string
  link_gravacao?: string
  image_url?: string
  program_id?: string
  created_by?: string
  created_at: string
  updated_at: string
  // Approval fields
  status?: EventStatus
  partner_id?: string
  reviewed_by?: string
  reviewed_at?: string
  rejection_reason?: string
  // Featured event
  destaque?: boolean
  // Joined data
  confirmations_count?: number
  is_confirmed?: boolean
  confirmed_users?: EventConfirmedUser[]
}

export interface EventConfirmedUser {
  user_id: string
  avatar_url?: string
  nome?: string
}

export interface EventConfirmation {
  id: string
  event_id: string
  user_id: string
  created_at: string
}

export interface EventFilters {
  tipo?: EventType | 'all' | 'networking' | 'showcase' | 'workshop' | 'social'
  search?: string
  sortBy?: 'recent' | 'upcoming'
}

export type EventFilterType = 'all' | 'networking' | 'showcase' | 'workshop' | 'social'

export interface EventCreateInput {
  titulo: string
  descricao?: string
  data_hora: string
  tipo: EventType
  local?: string
  image_url?: string
  partner_id?: string
  program_id: string
}

export interface EventApprovalInput {
  eventId: string
  action: 'approve' | 'reject'
  reason?: string
}

