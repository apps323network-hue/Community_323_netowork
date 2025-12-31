export type PostType = 'networking' | 'ofereco_servico' | 'procuro_ajuda' | 'oportunidade'
export type PostStatus = 'pending' | 'approved' | 'hidden' | 'removed' | 'spam'

export interface PostAuthor {
  id: string
  nome: string
  area_atuacao?: string
  avatar_url?: string
}

export interface Post {
  id: string
  user_id: string
  tipo: PostType
  conteudo: string
  fixado: boolean
  image_url?: string
  created_at: string
  updated_at: string
  edited_at?: string
  status?: PostStatus
  approved_by?: string
  approved_at?: string
  rejection_reason?: string
  strikes_added?: boolean
  moderated_by?: string
  moderated_at?: string
  // Joined data
  author?: PostAuthor
  likes_count?: number
  comments_count?: number
  isLiked?: boolean
  isBookmarked?: boolean
  comments?: Comment[]
}

export interface Comment {
  id: string
  post_id: string
  user_id: string
  conteudo: string
  created_at: string
  updated_at?: string
  edited_at?: string
  status?: PostStatus
  moderated_by?: string
  moderated_at?: string
  rejection_reason?: string
  // Joined data
  author?: PostAuthor
}

export interface PostFilters {
  tipo?: PostType | 'all'
  search?: string
  sortBy?: 'recent' | 'popular'
  user_id?: string
}

export interface PostCreateInput {
  conteudo: string
  tipo: PostType
  image_url?: string
}

export interface CommentCreateInput {
  post_id: string
  conteudo: string
}

