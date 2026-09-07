-- Production schema hygiene: idempotent ALTERs that make the database match the
-- schema the application expects. Safe to run any number of times against an
-- existing CLAN database (postgres/supabase SQL editor or `supabase db push`).

-- 1. Newsletter subscribers: confirmation-flow columns (from 0002).
alter table public.newsletter_subscribers
  add column if not exists name text,
  add column if not exists phone_number text,
  add column if not exists confirmation_token text,
  add column if not exists confirmation_token_expires_at timestamptz,
  add column if not exists confirmed_at timestamptz,
  add column if not exists updated_at timestamptz not null default now();

create unique index if not exists newsletter_subscribers_email_lower_idx
  on public.newsletter_subscribers (lower(email));

-- Keep existing rows that predate confirmation as Active; new inserts wait for
-- confirmation.
alter table public.newsletter_subscribers
  alter column active set default false;

create index if not exists newsletter_subscribers_confirm_token_idx
  on public.newsletter_subscribers (confirmation_token);

-- Drop the old all-read public policy (if any) and keep only insert for the public.
drop policy if exists "Public read all subscribers" on public.newsletter_subscribers;
drop policy if exists "Anyone can subscribe to newsletter" on public.newsletter_subscribers;
create policy "Anyone can subscribe to newsletter" on public.newsletter_subscribers
  for insert with check (true);

drop policy if exists "Admin can update subscribers" on public.newsletter_subscribers;
create policy "Admin can update subscribers" on public.newsletter_subscribers
  for update using (public.is_admin()) with check (public.is_admin());
drop policy if exists "Admin can delete subscribers" on public.newsletter_subscribers;
create policy "Admin can delete subscribers" on public.newsletter_subscribers
  for delete using (public.is_admin());

-- 2. Donations: multi-currency support (from 0003).
alter table public.donations
  add column if not exists currency text not null default 'USD';