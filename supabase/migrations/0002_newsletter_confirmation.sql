-- Newsletter content enhancements: collect name & phone, require email confirmation.
-- Adds confirmation-token columns so a new subscriber is inactive until they confirm.

alter table public.newsletter_subscribers
  add column if not exists name text,
  add column if not exists phone_number text,
  add column if not exists confirmation_token text,
  add column if not exists confirmation_token_expires_at timestamptz,
  add column if not exists confirmed_at timestamptz,
  add column if not exists updated_at timestamptz not null default now();

-- Unique index ensures a single row per normalized email (lowercased).
create unique index if not exists newsletter_subscribers_email_lower_idx
  on public.newsletter_subscribers (lower(email));

-- Existing rows that were created before confirmation was introduced are
-- already implicitly trusted — keep them Active.
-- New inserts default active = false until they confirm.
alter table public.newsletter_subscribers
  alter column active set default false;

-- Keep a fast lookup on confirmation tokens.
create index if not exists newsletter_subscribers_confirm_token_idx
  on public.newsletter_subscribers (confirmation_token);

-- RLS: allow public to insert (submit). Public cannot select, update, or delete.
drop policy if exists "Anyone can subscribe to newsletter" on public.newsletter_subscribers;
create policy "Anyone can subscribe to newsletter" on public.newsletter_subscribers
  for insert with check (true);

-- Admin/staff already have select via the existing "Staff can read subscribers" policy.
-- Add delete/update for admins (used by resend confirmation + admin management).
create policy "Admin can update subscribers" on public.newsletter_subscribers
  for update using (public.is_admin()) with check (public.is_admin());
create policy "Admin can delete subscribers" on public.newsletter_subscribers
  for delete using (public.is_admin());