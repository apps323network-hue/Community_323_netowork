export interface Member {
  id: string
  nome: string
  area_atuacao?: string
  cidade?: string
  estado?: string
  pais?: string
  objetivo?: string
  whatsapp?: string
  linkedin?: string
  avatar_url?: string
  plano?: 'Free' | 'Member' | 'Premium'
  badge?: string
  created_at?: string
  updated_at?: string
  email?: string
  nacionalidade?: string
  show_whatsapp?: boolean
  show_email?: boolean
  tags?: string[]
  goals?: string[]
  bio?: string
  instagram?: string
  username?: string
  total_points?: number
}

export interface MemberFilters {
  search?: string
  area_atuacao?: string
  cidade?: string
  objetivo?: string
  plano?: string
}

export interface MemberPagination {
  page: number
  perPage: number
  total: number
}

export const AREAS_ATUACAO = [
  'Empreendedor',
  'Artista',
  'Profissional Liberal',
  'Investidor',
  'Desenvolvedor',
  'Designer',
  'Marketing',
  'Vendas',
  'Consultoria',
  'Outro',
] as const

export const OBJETIVOS = [
  'Networking',
  'Negócios',
  'Parcerias',
  'Investimento',
  'Mentorias',
  'Oportunidades',
  'Comunidade',
] as const

export const INTEREST_TAGS = [
  'Tecnologia',
  'Marketing',
  'Vendas',
  'Design',
  'Empreendedorismo',
  'Investimentos',
  'Networking',
  'Educação',
  'Saúde',
  'Arte',
  'Música',
  'Esportes',
  'Viagens',
  'Gastronomia',
  'Sustentabilidade',
  'Inovação',
  'Liderança',
  'Carreira'
] as const

export const TAG_KEYS: Record<string, string> = {
  'Tecnologia': 'technology',
  'Marketing': 'marketing',
  'Vendas': 'sales',
  'Design': 'design',
  'Empreendedorismo': 'entrepreneurship',
  'Investimentos': 'investments',
  'Networking': 'networking',
  'Educação': 'education',
  'Saúde': 'health',
  'Arte': 'art',
  'Música': 'music',
  'Esportes': 'sports',
  'Viagens': 'travel',
  'Gastronomia': 'gastronomy',
  'Sustentabilidade': 'sustainability',
  'Inovação': 'innovation',
  'Liderança': 'leadership',
  'Carreira': 'career'
}
