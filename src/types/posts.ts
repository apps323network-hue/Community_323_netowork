export type PostType = 'networking' | 'ofereco_servico' | 'procuro_ajuda' | 'oportunidade'

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
  // Joined data
  author?: PostAuthor
  likes_count?: number
  comments_count?: number
  isLiked?: boolean
  comments?: Comment[]
}

export interface Comment {
  id: string
  post_id: string
  user_id: string
  conteudo: string
  created_at: string
  updated_at?: string
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

