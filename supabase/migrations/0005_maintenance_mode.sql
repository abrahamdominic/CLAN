-- Maintenance mode toggle stored on the site settings row so an admin can take
-- the public site offline (and bring it back) without redeploying.
alter table public.settings
  add column if not exists maintenance_mode boolean not null default false;