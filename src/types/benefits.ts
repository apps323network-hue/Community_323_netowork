export type BenefitType = 'mensal' | 'fixo' | 'plano'
export type PlanTier = 'Free' | 'Member' | 'Premium'

export interface Benefit {
  id: string;
  nome_pt: string;
  nome_en: string;
  descricao_pt: string;
  descricao_en: string;
  tipo: BenefitType;
  plano_requerido: PlanTier;
  valido_ate: string | null;
  ativo: boolean;
  imagem_url: string | null;
  destaque_mes: boolean;
  categoria: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserBenefit {
  id: string
  user_id: string
  benefit_id: string
  utilizado_em: string
  created_at: string
  benefit?: Benefit // Joined data
}
