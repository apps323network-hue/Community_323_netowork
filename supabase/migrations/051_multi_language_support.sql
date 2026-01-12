-- Migration: Multi-language Support (PT/EN)
-- Description: Renames existing columns to _pt and adds _en counterparts for events, services, and benefits.

-- ============================================
-- 1. SERVICES
-- ============================================
ALTER TABLE public.services RENAME COLUMN nome TO nome_pt;
ALTER TABLE public.services RENAME COLUMN descricao TO descricao_pt;
ALTER TABLE public.services RENAME COLUMN beneficio_membro TO beneficio_membro_pt;

ALTER TABLE public.services ADD COLUMN nome_en TEXT;
ALTER TABLE public.services ADD COLUMN descricao_en TEXT;
ALTER TABLE public.services ADD COLUMN beneficio_membro_en TEXT;

-- Update English content for existing services
UPDATE public.services 
SET 
  nome_en = 'MatriculaUSA',
  descricao_en = 'Complete platform for searching and applying for scholarships in US universities. Access thousands of scholarship opportunities and simplify your enrollment process.',
  beneficio_membro_en = 'Exclusive access to the Matricula US platform with integrated SSO'
WHERE id = '81e690e5-b51d-4b9a-85f6-aa29833237bb';

UPDATE public.services 
SET 
  nome_en = 'American Dream',
  descricao_en = 'American Dream Program - Consulting and planning to achieve the American dream',
  beneficio_membro_en = NULL
WHERE id = '00000000-0000-0000-0000-000000000001';

-- Fallback for any other services
UPDATE public.services 
SET 
  nome_en = nome_pt,
  descricao_en = descricao_pt,
  beneficio_membro_en = beneficio_membro_pt
WHERE nome_en IS NULL;

-- ============================================
-- 2. EVENTS
-- ============================================
ALTER TABLE public.events RENAME COLUMN titulo TO titulo_pt;
ALTER TABLE public.events RENAME COLUMN descricao TO descricao_pt;
ALTER TABLE public.events RENAME COLUMN local TO local_pt;

ALTER TABLE public.events ADD COLUMN titulo_en TEXT;
ALTER TABLE public.events ADD COLUMN descricao_en TEXT;
ALTER TABLE public.events ADD COLUMN local_en TEXT;

-- Fallback for existing events
UPDATE public.events 
SET 
  titulo_en = titulo_pt,
  descricao_en = descricao_pt,
  local_en = local_pt;

-- ============================================
-- 3. BENEFITS
-- ============================================
ALTER TABLE public.benefits RENAME COLUMN nome TO nome_pt;
ALTER TABLE public.benefits RENAME COLUMN descricao TO descricao_pt;

ALTER TABLE public.benefits ADD COLUMN nome_en TEXT;
ALTER TABLE public.benefits ADD COLUMN descricao_en TEXT;

-- Update English content for existing featured benefits
UPDATE public.benefits 
SET 
  nome_en = 'WeWork Global',
  descricao_en = 'Access to premium workspaces across the US with special discounts for members.'
WHERE id = '1805fa46-8041-4367-981b-4b5dee60f4b6';

UPDATE public.benefits 
SET 
  nome_en = 'Delta Airlines',
  descricao_en = 'Automatic category upgrade and double miles for Brazil-US trips.'
WHERE id = 'd3cb6bf8-379d-45e4-8acc-ea94617610ee';

UPDATE public.benefits 
SET 
  nome_en = 'Legal Zoom',
  descricao_en = 'First free consultation for LLC opening and visa regularization.'
WHERE id = 'c274acb9-cd36-4c0f-835a-cd0c672726da';

-- Fallback for other benefits
UPDATE public.benefits 
SET 
  nome_en = CASE 
    WHEN nome_pt = 'Equinox Gym' THEN 'Equinox Gym'
    WHEN nome_pt = 'Fogo de Chão' THEN 'Fogo de Chão'
    WHEN nome_pt = 'Duolingo Plus' THEN 'Duolingo Plus'
    WHEN nome_pt = 'Adobe CC' THEN 'Adobe CC'
    WHEN nome_pt = 'USPS Business' THEN 'USPS Business'
    WHEN nome_pt = 'Remessa Online' THEN 'Remessa Online'
    ELSE nome_pt
  END,
  descricao_en = CASE 
    WHEN nome_pt = 'Equinox Gym' THEN 'Enrollment fee waiver at any US location.'
    WHEN nome_pt = 'Fogo de Chão' THEN '15% discount on business dinners (Mon-Thu).'
    WHEN nome_pt = 'Duolingo Plus' THEN '2 months free of the family plan to practice English.'
    WHEN nome_pt = 'Adobe CC' THEN 'Corporate discount for creatives and freelancers.'
    WHEN nome_pt = 'USPS Business' THEN 'Reduced rates for international shipping to Brazil.'
    WHEN nome_pt = 'Remessa Online' THEN 'Zero fee on the first international transfer.'
    ELSE descricao_pt
  END;

-- ============================================
-- 4. RECREATE RPC AND TRIGGERS (IF NECESSARY)
-- ============================================
-- Note: Check if any RPCs use the renamed columns.
-- Based on previous research, get_admin_student_secondary_data and handle_new_user don't seem to touch these.
