-- Function to safely increment coupon uses
create or replace function public.increment_coupon_uses(coupon_id uuid)
returns void as $$
begin
  update public.coupons
  set current_uses = current_uses + 1
  where id = coupon_id;
end;
$$ language plpgsql security definer;
