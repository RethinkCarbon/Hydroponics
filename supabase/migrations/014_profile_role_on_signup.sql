-- Allow sign-up with role: profile role is set from raw_user_meta_data.role when user signs up (admin or operator)
-- Run after 001. Safe to run even if handle_new_user already exists.

create or replace function public.handle_new_user()
returns trigger as $$
declare
  requested_role text := nullif(trim(new.raw_user_meta_data->>'role'), '');
begin
  insert into public.profiles (id, role, display_name)
  values (
    new.id,
    case when requested_role in ('admin', 'operator') then requested_role else 'operator' end,
    coalesce(new.raw_user_meta_data->>'full_name', new.email)
  );
  return new;
end;
$$ language plpgsql security definer;
