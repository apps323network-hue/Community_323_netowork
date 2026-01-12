import type { Event, EventStatus } from './events'

export type UserRole = 'user' | 'partner' | 'admin' | 'professor'
export type UserStatus = 'pending' | 'active' | 'suspended' | 'banned'

export interface AdminEvent extends Event {
  status: EventStatus
  partner_id?: string
  approved_by?: string
  approved_at?: string
  rejection_reason?: string
  destaque?: boolean
  // Joined data from profiles
  creator_name?: string
  creator_email?: string
  partner_name?: string
  program_name?: string
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
  estado?: string
  pais?: string
  avatar_url?: string
  role?: UserRole
  status: UserStatus
  approved_by?: string
  approved_at?: string
  rejection_reason?: string
  suspended_until?: string
  created_at: string
  updated_at?: string
  last_seen_at?: string
  // Gamification
  pontos?: number
  strikes?: number
  badge?: string
  plano?: string
  // Engagement metrics
  post_count?: number
  comment_count?: number
  connections_count?: number
}

export interface UserStats {
  total: number
  pending: number
  active: number
  suspended: number
  banned: number
  newToday: number
  activeThisMonth?: number
  engagementRate?: number
}

export interface MemberFilters {
  search?: string
  roles?: UserRole[]
  plans?: string[]
  statuses?: UserStatus[]
  countries?: string[]
}

export interface PaginationMeta {
  currentPage: number
  pageSize: number
  totalItems: number
  totalPages: number
}

export type SortColumn = 'created_at' | 'pontos' | 'last_seen_at' | 'nome'
export type SortDirection = 'asc' | 'desc'

import type { Post, PostStatus } from './posts'
export type { PostStatus }

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

export type ServiceStatus = 'pending' | 'approved' | 'rejected'

export interface AdminService {
  id: string;
  nome_pt: string;
  nome_en: string;
  descricao_pt?: string;
  descricao_en?: string;
  parceiro_id?: string;
  categoria?: string;
  beneficio_membro_pt?: string;
  beneficio_membro_en?: string;
  destaque: boolean;
  ativo: boolean;
  status: ServiceStatus;
  rejection_reason?: string;
  created_by?: string;
  is_user_service?: boolean;
  approved_by?: string;
  approved_at?: string;
  preco?: number;
  moeda?: 'USD' | 'BRL';
  created_at: string;
  updated_at?: string;
  partner_name?: string;
  // SSO fields for external services
  is_external?: boolean;
  external_url?: string;
  sso_enabled?: boolean;
  sso_callback_path?: string;
}

export interface ServiceStats {
  total: number
  active: number
  inactive: number
  featured: number
  pending: number
}

export interface BannedWord {
  id: string
  word: string
  category: 'spam' | 'ofensivo' | 'outro'
  action: 'block' | 'warn' | 'replace'
  created_by: string
  created_at: string
  updated_at?: string
}

export interface BannedWordStats {
  total: number
  byCategory: Record<string, number>
  byAction: Record<string, number>
}

export interface BannedWordCheck {
  found: boolean
  words: Array<{ word: string; category: string; action: string }>
  action: 'block' | 'warn' | 'replace' | null
  sanitizedContent?: string
}

export type ReportReason = 'spam' | 'inappropriate' | 'harassment' | 'fake_news' | 'other'
export type ReportStatus = 'pending' | 'reviewed' | 'resolved' | 'dismissed'
export type ReportItemType = 'post' | 'comment' | 'user'

export interface Report {
  id: string
  reported_by: string
  reported_item_type: ReportItemType
  reported_item_id: string
  reason: ReportReason
  description?: string
  status: ReportStatus
  resolved_by?: string
  resolved_at?: string
  created_at: string
  updated_at?: string
  // Joined data
  reporter_name?: string
  reporter_email?: string
  resolver_name?: string
  reported_item?: any // Post, Comment ou User dependendo do tipo
}

export interface ReportStats {
  total: number
  pending: number
  reviewed: number
  resolved: number
  dismissed: number
  byType: Record<ReportItemType, number>
  byReason: Record<ReportReason, number>
  resolvedToday: number
}

export interface ReportCreateInput {
  reported_item_type: ReportItemType
  reported_item_id: string
  reason: ReportReason
  description?: string
}

export interface ReportResolveInput {
  action: 'remove_content' | 'ban_user' | 'suspend_user' | 'add_strike' | 'dismiss'
  details?: string
  add_strike?: boolean
}

export type ChallengeType = 'post' | 'comment' | 'event' | 'connection' | 'engagement' | 'other'
export type PointsOrigin = 'challenge' | 'post' | 'comment' | 'event' | 'connection' | 'manual' | 'other'

export interface Challenge {
  id: string
  nome: string
  descricao?: string
  tipo: ChallengeType
  pontos: number
  prazo?: string
  ativo: boolean
  created_by: string
  created_at: string
  updated_at?: string
  // Joined data
  creator_name?: string
  total_participants?: number
  total_completed?: number
}

export interface UserChallenge {
  id: string
  user_id: string
  challenge_id: string
  progresso: number
  completado: boolean
  completado_em?: string
  created_at: string
  updated_at?: string
  // Joined data
  user_name?: string
  challenge?: Challenge
}

export interface UserPoint {
  id: string
  user_id: string
  pontos: number
  origem: PointsOrigin
  origem_id?: string
  descricao?: string
  created_by?: string
  created_at: string
  // Joined data
  user_name?: string
  creator_name?: string
}

export interface ChallengeStats {
  total: number
  active: number
  inactive: number
  byType: Record<ChallengeType, number>
  totalParticipants: number
  totalCompleted: number
  averagePoints: number
}

export interface ChallengeCreateInput {
  nome: string
  descricao?: string
  tipo: ChallengeType
  pontos: number
  prazo?: string
  ativo?: boolean
}

export interface ChallengeUpdateInput {
  nome?: string
  descricao?: string
  tipo?: ChallengeType
  pontos?: number
  prazo?: string
  ativo?: boolean
}



