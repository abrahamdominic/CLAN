# Christian Life Altar Network (CLAN) — Website

A modern, responsive, Christ-centered website for **Christian Life Altar Network (CLAN)**, a non-denominational Christian organization focused on the **rebirth of true Christianity** through discipleship, prayer, the Word, evangelism, fellowship, spiritual growth, and helping people discover their purpose in Christ.

Built with **Next.js 15** (App Router), **Tailwind CSS**, and **Supabase**.

## Tech Stack

- **Framework:** Next.js 15 (App Router), React 19, TypeScript
- **Styling:** Tailwind CSS 3, custom design tokens (navy / gold / warm palette)
- **Fonts:** Cormorant Garamond (display) + Inter (body)
- **Database & Auth:** Supabase (Postgres, storage, auth)
- **Forms:** React Hook Form, server actions
- **Payments:** Paystack (optional)

## Features

### Public Pages
- **Home** — hero, pillars, featured sermons/events, CTAs
- **About** — vision, mission, beliefs, history
- **What We Do** — pillars overview
- **Discipleship** — programs list & registration
- **Prayer** — prayer request submission & prayer resources
- **Sermons** — searchable/filterable library with pagination
- **Resources** — articles/devotionals/Bible studies with search, filters & pagination
- **Events** — upcoming events
- **Outreach** — outreach projects
- **Testimonies** — testimony submission + approved testimonies
- **Give** — donation form (Paystack or dev mode)
- **Purpose, Join, Contact** — purpose discovery, membership, contact

### Admin CMS (`/admin`)
Password-protected dashboard (Supabase auth, guarded by middleware) for managing:
- Sermons, Events, Blog/Articles, Programs, Outreach Projects
- Prayer Requests, Testimonials, Members/Applications, Contact Messages
- Donations (read), FAQs, Media (file uploads), Speakers, Categories
- Newsletter subscribers, Site-wide Settings
- Role-based access: `super_admin` / `admin` / `editor`
  - Deleting newsletter subscribers and updating site settings require `super_admin`

## Getting Started

### Prerequisites
- Node.js 18+
- A Supabase project (URL, anon key, service-role key)

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Site
NEXT_PUBLIC_SITE_URL=https://clanministry.org

# Payments (optional)
PAYMENT_PROVIDER=
PAYMENT_PROVIDER_SECRET=
```

### 3. Set up the database

Apply the SQL schema in `supabase/migrations/0001_initial.sql` to your Supabase project (SQL editor or Supabase CLI). This creates all tables, storage, and RLS policies.

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

```bash
npm run dev        # Start dev server
npm run build      # Production build
npm run start      # Start production server
npm run lint       # Lint with ESLint
```

## Project Structure

```
src/
├── app/                  # App Router pages & API routes
│   ├── admin/            # Admin dashboard pages
│   ├── api/admin/        # Admin client-data endpoints
│   ├── api/webhooks/paystack/  # Paystack payment webhook
│   ├── (public pages)    # sermons, resources, events, give, etc.
│   └── actions.ts        # Public server actions (forms, donations)
├── components/
│   ├── admin/            # Reusable admin UI + CRUD actions
│   ├── ui/               # Public UI primitives (cards, buttons, etc.)
│   └── (feature)/        # Feature-specific components
├── lib/
│   ├── db.ts             # Public data queries
│   ├── admin-db.ts       # Admin data queries + role helpers
│   ├── supabase/         # Supabase client factories
│   ├── validation.ts     # Input sanitization/validation helpers
│   ├── content.ts        # Fallback sample data (dev/no-DB mode)
│   ├── utils.ts          # Shared utilities
│   └── types.ts
├── middleware.ts         # Admin auth guard + login rate limiting
└── types/                # Shared TypeScript types
```

## Environment Behavior

- **Without Supabase configured:** all pages render with sample/fallback data from `src/lib/content.ts`; forms and admin mutations no-op gracefully. Useful for previewing the UI without a database.
- **With Supabase configured:** public pages fetch live data; admin fully functional after login.

## Payments (Donations)

- `PAYMENT_PROVIDER` blank or `"test"` → **dev mode**: the donation is recorded directly; no real charge.
- `PAYMENT_PROVIDER="paystack"` → **live mode**: the form creates a Paystack payment, redirects to the Paystack checkout, and the webhook (`/api/webhooks/paystack`) verifies the HMAC SHA512 signature and records the completed donation. A unique index on `donations(reference)` guards against duplicate processing.

## Deployment

Deploy on [Vercel](https://vercel.com) (or any Node host). Set the environment variables above in your hosting dashboard, run `supabase/migrations/0001_initial.sql` against your Supabase project, and deploy.

## License

Private — for CLAN ministry use.
