-- Security hardening: never auto-grant CMS (editor) privileges to arbitrary
-- auth sign-ups. New profiles now default to the non-privileged 'member' role;
-- staff/super_admin access is granted explicitly by a site administrator.

alter table public.profiles
  drop constraint if exists profiles_role_check;

alter table public.profiles
  add constraint profiles_role_check
  check (role in ('super_admin', 'admin', 'editor', 'member'));

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (user_id, full_name, email, role)
  values (new.id, new.raw_user_meta_data ->> 'full_name', new.email, 'member');
  return new;
end;
$$;

-- The staff helpers deliberately ignore 'member' so regular sign-ups have no
-- read/write access to CMS tables through RLS.
create or replace function public.is_admin()
returns boolean language sql stable as $$
  select exists (
    select 1 from public.profiles
    where user_id = auth.uid()
      and role in ('super_admin', 'admin')
  );
$$;

create or replace function public.is_staff()
returns boolean language sql stable as $$
  select exists (
    select 1 from public.profiles
    where user_id = auth.uid()
      and role in ('super_admin', 'admin', 'editor')
  );
$$;