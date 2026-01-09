-- Rollback for coupons system
-- Migration rollback: 20260108150346_create_coupons.sql

-- Drop triggers
drop trigger if exists set_coupons_updated_at on public.coupons;
drop function if exists public.set_updated_at();

-- Drop indexes
drop index if exists public.idx_coupon_uses_coupon_id;
drop index if exists public.idx_coupon_uses_user_id;
drop index if exists public.idx_coupons_valid_until;
drop index if exists public.idx_coupons_is_active;
drop index if exists public.idx_coupons_code;

-- Drop policies
drop policy if exists "Users insert own coupon uses" on public.coupon_uses;
drop policy if exists "Users read own coupon uses" on public.coupon_uses;
drop policy if exists "Admins full access coupon uses" on public.coupon_uses;
drop policy if exists "Users read active coupons" on public.coupons;
drop policy if exists "Admins full access coupons" on public.coupons;

-- Drop tables
drop table if exists public.coupon_uses;
drop table if exists public.coupons;
