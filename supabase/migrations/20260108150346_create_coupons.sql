-- Create coupons management system
-- Migration created: 2026-01-08

-- Coupons table
create table public.coupons (
  id uuid primary key default gen_random_uuid(),
  
  -- Basic info
  code text unique not null,
  description text,
  
  -- Discount configuration
  discount_type text not null check (discount_type in ('percentage', 'fixed')),
  discount_value decimal(10,2) not null check (discount_value > 0),
  
  -- Usage restrictions (1 per user confirmed)
  max_uses integer, -- total usage limit (null = unlimited)
  current_uses integer default 0,
  
  -- Scope configuration (can be all programs, specific programs, or category)
  scope_type text not null check (scope_type in ('all', 'specific_programs', 'category')),
  applicable_programs uuid[], -- used when scope_type = 'specific_programs'
  applicable_category text, -- used when scope_type = 'category'
  
  -- Validity (OPTIONAL - admin decides)
  valid_from timestamptz default now(),
  valid_until timestamptz, -- null = no expiration
  
  -- Status
  is_active boolean default true,
  
  -- Metadata
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Coupon usage tracking (1 per user per program)
create table public.coupon_uses (
  id uuid primary key default gen_random_uuid(),
  coupon_id uuid references public.coupons(id) on delete cascade,
  user_id uuid references auth.users(id),
  program_id uuid references public.programs(id),
  discount_applied decimal(10,2),
  used_at timestamptz default now()
);

-- Enable RLS
alter table public.coupons enable row level security;
alter table public.coupon_uses enable row level security;

-- RLS Policies for coupons
create policy "Admins full access coupons"
  on public.coupons for all
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

create policy "Users read active coupons"
  on public.coupons for select
  to authenticated
  using (is_active = true);

-- RLS Policies for coupon_uses
create policy "Admins full access coupon uses"
  on public.coupon_uses for all
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

create policy "Users read own coupon uses"
  on public.coupon_uses for select
  to authenticated
  using (user_id = auth.uid());

create policy "Users insert own coupon uses"
  on public.coupon_uses for insert
  to authenticated
  with check (user_id = auth.uid());

-- Indexes for performance
create index idx_coupons_code on public.coupons(code);
create index idx_coupons_is_active on public.coupons(is_active);
create index idx_coupons_valid_until on public.coupons(valid_until);
create index idx_coupon_uses_user_id on public.coupon_uses(user_id);
create index idx_coupon_uses_coupon_id on public.coupon_uses(coupon_id);

-- Trigger to update updated_at
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_coupons_updated_at
  before update on public.coupons
  for each row
  execute function public.set_updated_at();
