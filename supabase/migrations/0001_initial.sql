-- Christian Life Altar Network (CLAN) — Database Schema
-- PostgreSQL via Supabase

-- Extensions
create extension if not exists "uuid-ossp";

-- ============ AUTH & ROLES ============

create table if not exists public.roles (
  id serial primary key,
  name text unique not null,
  created_at timestamptz not null default now()
);

insert into public.roles (name)
values ('super_admin'), ('admin'), ('editor')
on conflict (name) do nothing;

create table if not exists public.profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  full_name text,
  email text,
  role text not null default 'editor'
    check (role in ('super_admin', 'admin', 'editor')),
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_user_id_idx on public.profiles(user_id);

-- ============ CONTENT ============

create table if not exists public.categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  type text not null default 'resource'
    check (type in ('sermon', 'blog', 'event', 'resource')),
  created_at timestamptz not null default now()
);

create table if not exists public.speakers (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  photo_url text,
  bio text,
  created_at timestamptz not null default now()
);

create table if not exists public.sermons (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  slug text unique not null,
  speaker_id uuid references public.speakers(id) on delete set null,
  date timestamptz,
  category text,
  scripture text,
  description text,
  thumbnail_url text,
  audio_url text,
  video_url text,
  notes_url text,
  tags text[],
  featured boolean not null default false,
  published boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists sermons_published_idx on public.sermons(published);
create index if not exists sermons_speaker_idx on public.sermons(speaker_id);

create table if not exists public.events (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  slug text unique not null,
  description text,
  date date not null,
  time text,
  location text,
  is_online boolean not null default false,
  online_link text,
  speaker text,
  image_url text,
  registration_link text,
  category text,
  published boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists events_date_idx on public.events(date);

create table if not exists public.discipleship_programs (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  slug text unique not null,
  description text,
  duration text,
  schedule text,
  image_url text,
  featured boolean not null default false,
  published boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.outreach_projects (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  slug text unique not null,
  description text,
  location text,
  date timestamptz,
  image_url text,
  status text not null default 'upcoming'
    check (status in ('upcoming', 'current', 'past')),
  published boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.blog_posts (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  slug text unique not null,
  author text,
  featured_image text,
  content text not null default '',
  category text,
  tags text[],
  seo_title text,
  seo_description text,
  published_date timestamptz,
  published boolean not null default false,
  featured boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists blog_posts_published_idx on public.blog_posts(published);
create index if not exists blog_posts_slug_idx on public.blog_posts(slug);

create table if not exists public.testimonials (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text,
  testimony text not null,
  photo_url text,
  approved boolean not null default false,
  created_at timestamptz not null default now()
);

-- ============ SUBMISSIONS ============

create table if not exists public.prayer_requests (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text,
  phone text,
  request text not null,
  category text,
  visibility text not null default 'private'
    check (visibility in ('private', 'anonymous', 'public')),
  prayed_for boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists prayer_requests_visibility_idx on public.prayer_requests(visibility);

create table if not exists public.membership_applications (
  id uuid primary key default uuid_generate_v4(),
  full_name text not null,
  email text not null,
  phone text,
  location text,
  church text,
  areas_of_interest text[],
  discovered_via text,
  message text,
  status text not null default 'new'
    check (status in ('new', 'contacted', 'joined', 'archived')),
  created_at timestamptz not null default now()
);

create table if not exists public.contact_messages (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text not null,
  phone text,
  subject text,
  message text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.donations (
  id uuid primary key default uuid_generate_v4(),
  amount numeric(12,2) not null,
  category text,
  donor_name text,
  donor_email text,
  status text,
  reference text,
  created_at timestamptz not null default now()
);

create unique index if not exists donations_reference_key on public.donations (reference);

create table if not exists public.newsletter_subscribers (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.media (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  url text not null,
  type text,
  size bigint,
  alt text,
  created_at timestamptz not null default now()
);

create table if not exists public.faqs (
  id uuid primary key default uuid_generate_v4(),
  question text not null,
  answer text not null,
  category text,
  sort_order integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.settings (
  id integer primary key default 1,
  site_name text,
  tagline text,
  description text,
  email text,
  phone text,
  address text,
  updated_at timestamptz not null default now()
);

insert into public.settings (id, site_name, tagline, description)
values (1, 'Christian Life Altar Network', 'The Rebirth of True Christianity',
  'A community committed to discipleship, prayer, the Word, outreach, and helping people discover and fulfill their purpose in Christ Jesus.')
on conflict (id) do nothing;

-- ============ ROW LEVEL SECURITY ============

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.speakers enable row level security;
alter table public.sermons enable row level security;
alter table public.events enable row level security;
alter table public.discipleship_programs enable row level security;
alter table public.outreach_projects enable row level security;
alter table public.blog_posts enable row level security;
alter table public.testimonials enable row level security;
alter table public.prayer_requests enable row level security;
alter table public.membership_applications enable row level security;
alter table public.contact_messages enable row level security;
alter table public.donations enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.media enable row level security;
alter table public.faqs enable row level security;
alter table public.settings enable row level security;

-- Public read policies for published/anonymous content
create policy "Public read published sermons" on public.sermons
  for select using (published = true);
create policy "Public read published events" on public.events
  for select using (published = true);
create policy "Public read published programs" on public.discipleship_programs
  for select using (published = true);
create policy "Public read published outreach" on public.outreach_projects
  for select using (published = true);
create policy "Public read published blog" on public.blog_posts
  for select using (published = true);
create policy "Public read approved testimonials" on public.testimonials
  for select using (approved = true);
create policy "Public read categories" on public.categories
  for select using (true);
create policy "Public read speakers" on public.speakers
  for select using (true);
create policy "Public read faqs" on public.faqs
  for select using (published = true);
create policy "Anyone can submit prayer request" on public.prayer_requests
  for insert with check (true);
create policy "Anyone can apply to join" on public.membership_applications
  for insert with check (true);
create policy "Anyone can send message" on public.contact_messages
  for insert with check (true);
create policy "Anyone can subscribe to newsletter" on public.newsletter_subscribers
  for insert with check (true);
create policy "Anyone can submit testimony" on public.testimonials
  for insert with check (true);
create policy "Anyone can register for programs" on public.discipleship_programs
  for select using (published = true);
create policy "Anyone can insert donation" on public.donations
  for insert with check (true);

-- Helper function to check admin role
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

-- Admin/staff write policies
create policy "Staff can manage sermons" on public.sermons
  for all using (public.is_staff()) with check (public.is_staff());
create policy "Staff can manage events" on public.events
  for all using (public.is_staff()) with check (public.is_staff());
create policy "Staff can manage programs" on public.discipleship_programs
  for all using (public.is_staff()) with check (public.is_staff());
create policy "Staff can manage outreach" on public.outreach_projects
  for all using (public.is_staff()) with check (public.is_staff());
create policy "Staff can manage blog" on public.blog_posts
  for all using (public.is_staff()) with check (public.is_staff());
create policy "Staff can manage testimonials" on public.testimonials
  for all using (public.is_staff()) with check (public.is_staff());
create policy "Staff can manage speakers" on public.speakers
  for all using (public.is_staff()) with check (public.is_staff());
create policy "Staff can manage categories" on public.categories
  for all using (public.is_staff()) with check (public.is_staff());
create policy "Staff can manage media" on public.media
  for all using (public.is_staff()) with check (public.is_staff());
create policy "Staff can manage faqs" on public.faqs
  for all using (public.is_staff()) with check (public.is_staff());
create policy "Staff can view donations" on public.donations
  for select using (public.is_staff());
create policy "Staff can manage settings" on public.settings
  for all using (public.is_staff()) with check (public.is_staff());
create policy "Staff can read prayer requests" on public.prayer_requests
  for select using (public.is_staff());
create policy "Staff can manage prayer requests" on public.prayer_requests
  for update using (public.is_staff()) with check (public.is_staff());
create policy "Staff can delete prayer requests" on public.prayer_requests
  for delete using (public.is_admin());
create policy "Staff can read members" on public.membership_applications
  for select using (public.is_staff());
create policy "Staff can update members" on public.membership_applications
  for update using (public.is_staff()) with check (public.is_staff());
create policy "Staff can delete members" on public.membership_applications
  for delete using (public.is_admin());
create policy "Staff can read contact messages" on public.contact_messages
  for select using (public.is_staff());
create policy "Staff can update contact messages" on public.contact_messages
  for update using (public.is_staff()) with check (public.is_staff());
create policy "Staff can delete contact messages" on public.contact_messages
  for delete using (public.is_admin());
create policy "Staff can read subscribers" on public.newsletter_subscribers
  for select using (public.is_staff());

-- Trigger to create profile on new user
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (user_id, full_name, email, role)
  values (new.id, new.raw_user_meta_data ->> 'full_name', new.email, 'editor');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
