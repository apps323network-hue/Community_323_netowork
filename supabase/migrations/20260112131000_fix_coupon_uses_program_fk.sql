-- Fix foreign key constraint for coupon_uses to allow deleting programs
-- Migration created: 2026-01-12

ALTER TABLE public.coupon_uses
DROP CONSTRAINT IF EXISTS coupon_uses_program_id_fkey,
ADD CONSTRAINT coupon_uses_program_id_fkey
  FOREIGN KEY (program_id)
  REFERENCES public.programs(id)
  ON DELETE CASCADE;
