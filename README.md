# Christian Life Altar Network (CLAN) Website

A modern, responsive, Christ-centered website for **Christian Life Altar Network (CLAN)**, a non-denominational Christian organization focused on the **rebirth of true Christianity** through discipleship, prayer, the Word, evangelism, fellowship, spiritual growth, and helping people discover their purpose in Christ.

Built with **Next.js 15** (App Router), **Tailwind CSS**, and **Supabase**.

## Tech Stack

- **Framework:** Next.js 15 (App Router), React 19, TypeScript
- **Styling:** Tailwind CSS 3, custom design tokens (navy / gold / warm palette)
- **Fonts:** Cormorant Garamond (display) + Inter (body)
- **Database & Auth:** Supabase (Postgres, storage, auth, row-level security)
- **Forms:** React Hook Form, server actions
- **Payments:** Stripe (recommended) or Paystack (optional)

## Features

### Public Pages
- **Home**: hero, pillars, featured sermons/events, CTAs
- **About**: vision, mission, beliefs, history
- **What We Do**: pillars overview
- **Discipleship**: programs list & registration
- **Prayer**: prayer request submission & prayer resources
- **Sermons**: searchable/filterable library with pagination
- **Resources**: articles/devotionals/Bible studies with search, filters & pagination
- **Events**: upcoming events
- **Outreach**: outreach projects
- **Testimonies**: testimony submission + approved testimonies
- **Give**: donation form (Stripe, Paystack, or dev mode)
- **Purpose, Join, Contact**: purpose discovery, membership, contact

### Admin CMS (`/admin`)
Password-protected dashboard (Supabase auth, guarded by middleware) for managing:
- Sermons, Events, Blog/Articles, Programs, Outreach Projects
- Prayer Requests, Testimonials, Members/Applications, Contact Messages
- Donations (read), FAQs, Media (file uploads), Speakers, Categories
- Newsletter subscribers, Site-wide Settings
- Role-based access: `super_admin` / `admin` / `editor`
  - Deleting newsletter subscribers and updating site settings require `super_admin`
  - Generic admin CRUD helpers are restricted to an explicit table allowlist

## Security Features

- **Row-level security** enabled on all tables; anonymous access limited to publishing/approved content and form inserts
- **Stored XSS defended** — blog/HTML content is sanitized server-side (`sanitize-html`) before rendering
- **Webhook signature verification** for both Stripe (`stripe.webhooks.constructEvent`) and Paystack (HMAC SHA512, timing-safe comparison)
- **Rate limiting** on admin login (10/15 min), public form submissions (20/min), and newsletter confirm/resend endpoints
- **In-memory rate limiters are pruned** to bound memory usage (swap for Redis/Upstash in multi-instance production)
- **Admin authorization enforced server-side** in middleware and admin API routes (never client-only) — staff/profile role checks
- **Table allowlists** prevent the RLS-bypassing service-role client from touching non-CMS database objects
- **Security headers** (HSTS, CSP, X-Frame-Options, Referrer-Policy, Permissions-Policy) set via `next.config.ts`
- **No `error.jsx` leaks** — global error boundary + friendly 404 page
- **Newsletter double opt-in** with 24-hour expiring, single-use confirmation tokens

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
# Stripe (recommended): sk_test_... / sk_live_...
STRIPE_SECRET_KEY=
# Stripe webhook signing secret (whsec_...) for /api/webhooks/stripe
STRIPE_WEBHOOK_SECRET=
# Paystack (alternative): secret key
PAYMENT_PROVIDER_SECRET=

# Newsletter email (required for double opt-in confirmation emails)
EMAIL_PROVIDER=resend            # resend | sendgrid | smtp
EMAIL_API_KEY=
EMAIL_FROM=
EMAIL_FROM_NAME=
# SMTP settings (only when EMAIL_PROVIDER=smtp)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_SECURE=false
```

### 3. Set up the database

Apply the SQL migrations in `supabase/migrations/` (in order) to your Supabase project (SQL editor or Supabase CLI). These create all tables, storage, RLS policies, newsletter confirmation columns, currency support, and the security-hardened profile roles.

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
│   ├── api/newsletter/   # Newsletter confirm + resend endpoints
│   ├── api/webhooks/     # Stripe + Paystack payment webhooks
│   ├── (public pages)    # sermons, resources, events, give, etc.
│   └── actions.ts        # Public server actions (forms, donations)
├── components/
│   ├── admin/            # Reusable admin UI + CRUD server actions
│   ├── ui/               # Public UI primitives (cards, buttons, etc.)
│   └── (feature)/        # Feature-specific components
├── lib/
│   ├── db.ts             # Public data queries
│   ├── admin-db.ts       # Admin data queries + role helpers
│   ├── admin-auth.ts     # Server-side admin/staff authorization
│   ├── stripe.ts         # Stripe client, currency + amount validation
│   ├── sanitize.ts       # Server-side HTML sanitization (XSS defense)
│   ├── supabase/         # Supabase client factories
│   ├── validation.ts     # Input sanitization/validation helpers
│   ├── content.ts        # Fallback sample data (dev/no-DB mode)
│   ├── email.ts          # Newsletter/transactional email delivery
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
- `PAYMENT_PROVIDER="stripe"` → **Stripe Checkout**: the form creates a Stripe Checkout Session (`src/app/actions.ts` → `createDonationIntent`), redirects the donor to Stripe's hosted payment page, and the webhook (`/api/webhooks/stripe`) verifies the signature with `stripe.webhooks.constructEvent`, requires `payment_status === "paid"`, and records the completed donation using the session id as the reference. A unique index on `donations(reference)` with upsert-on-conflict guards against duplicate processing.
  - Supported currencies: USD, GBP, NGN, EUR, CAD, GHS
  - Amounts are validated server-side (`validateDonationInput`, $1 – $10M) and converted to minor units using Stripe's zero-decimal-currency rules.
  - Configure the webhook in the Stripe dashboard → Webhooks → endpoint `https://<your-domain>/api/webhooks/stripe`, events: `checkout.session.completed`.
- `PAYMENT_PROVIDER="paystack"` → **Paystack**: the form calls `transaction/initialize`, redirects to Paystack checkout, and the webhook (`/api/webhooks/paystack`) verifies the HMAC SHA512 signature (timing-safe comparison) and records the completed donation. A unique index on `donations(reference)` guards against duplicate processing.
  - Supported currencies: USD, NGN, GHS, ZAR, KES, XOF.

## Deployment

Deploy on [Vercel](https://vercel.com) (or any Node host). Set the environment variables above in your hosting dashboard, apply all `supabase/migrations/*.sql` files against your Supabase project (in order), and deploy. For Stripe live payments, point a Stripe webhook at `https://<your-domain>/api/webhooks/stripe` with the `checkout.session.completed` event and set `STRIPE_WEBHOOK_SECRET`.

## License

Private: for CLAN ministry use.
