-- Add currency support to donations so givers can choose Naira, Pounds, Dollars, etc.
alter table public.donations
  add column if not exists currency text not null default 'USD';
