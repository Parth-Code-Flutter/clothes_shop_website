# Admin Panel (Atelier Console)

A white-label back office for clothing stores. It lives at `/admin`, is separate from the
customer storefront (its own layout, fonts and palette), and is meant to be reused for other
fashion clients by changing one config file and a few env vars.

Branch: all admin work goes to `feature/admin-panel`, never `parth_dev`.

## Rebranding for a new client

Everything brand-specific is in `src/features/admin/config/admin-brand.ts`:

| Field | What it controls |
| --- | --- |
| `name` | Store name in the sidebar, login page and page titles (reads `siteConfig.name`) |
| `monogram` | Two-letter mark in the gold ring and the login watermark |
| `consoleLabel` | Product name shown under the store name ("Atelier Console") |
| `locale`, `currency`, `timeZone` | Money/number formatting and the dashboard's "today" |
| `theme` | Colour preset from `adminThemes`: `midnight` (navy, default), `sage` (muted green), `heritage` (ivory and gold) |

Each preset in `adminThemes` has a light and a dark palette. To make a client-specific look, copy a
preset, rename it, change the hex values and set `theme` to its name.

How colours work: each palette token becomes a CSS variable (`--adm-accent`, `--adm-canvas`, ...)
scoped to `[data-admin]`, and Tailwind maps them to utilities (`bg-adm-accent`, `text-adm-ink`, ...)
in `src/app/globals.css`. Components never use hex values, so changing `accent` re-themes buttons,
charts and focus rings at once. `sidebarAccent` is the separate highlight used on the dark sidebar
and login brand panel, so it must stay light enough to read on `sidebar`. The storefront theme is
untouched.

Fonts: Cormorant Garamond (display) and Inter (UI), loaded in `src/app/admin/layout.tsx`.
Swap them there; the CSS variable names stay the same.

Navigation: `src/features/admin/config/admin-nav.ts`. Set `ready: true` when a module ships;
unfinished modules show "Soon" and aren't clickable.

## Environment

Copy `.env.example` to `.env.local`.

| Variable | Notes |
| --- | --- |
| `ADMIN_EMAIL` | Owner login |
| `ADMIN_PASSWORD` | Owner password (use a long passphrase) |
| `ADMIN_NAME` | Shown in the greeting and profile menu |
| `ADMIN_SESSION_SECRET` | 32+ random characters; signs the session cookie. Changing it signs everyone out |

In development, if these are empty, the demo login `owner@demo.store` / `atelier-demo` works and is
shown on the login page. In production the console refuses to sign anyone in until they're set.

## Security model (current)

- Session: HMAC-SHA256 signed, httpOnly cookie `adm_session`, scoped to `/admin`, `SameSite=Lax`,
  `Secure` in production. 12 hours by default, 30 days with "Keep me signed in".
- `src/proxy.ts` does a fast redirect for signed-out visitors; every admin page and action also
  calls `requireAdmin()` on the server, which is the real check.
- Credentials are compared in constant time. 5 failed attempts per IP + email lock that pair for
  10 minutes (in memory, so per server instance).
- Admin pages are `noindex`.

Before a real client launch: move users to a database with hashed passwords (argon2/bcrypt),
use a shared store (Redis) for rate limiting, and add password reset by email.

## Screens and build order

| # | Module | Status | Scope |
| --- | --- | --- | --- |
| 1 | Login | Done | Split brand layout, show/hide password, remember me, lockout, dev hint |
| 2 | Dashboard | Done | KPIs with trends, sales chart (7/30/90 days), recent orders, fulfilment, top products, category mix, funnel, low stock |
| 3 | Orders | Next | List with status tabs, search, filters, bulk actions; order detail with timeline, payment, shipping label, refunds, notes, invoice PDF |
| 4 | Products | | List/grid, filters, bulk publish; editor with images, variants (size × colour), pricing, compare-at price, SEO, status |
| 5 | Collections & categories | | Manual and rule-based collections, ordering, banners |
| 6 | Inventory | | Stock per variant, low-stock thresholds, adjustments with reasons, history |
| 7 | Customers | | List, segments, profile with orders, lifetime value, addresses, notes |
| 8 | Discounts | | Codes and automatic offers, limits, schedule, usage |
| 9 | Content | | Homepage hero, banners, lookbook, announcement bar, static pages |
| 10 | Reviews | | Moderation queue, replies, featured reviews |
| 11 | Analytics | | Sales, products, customers, traffic reports, CSV export |
| 12 | Settings | | Store details, branding, payments, shipping zones and rates, taxes (GST), notifications, staff and roles |
| 13 | Audit log | | Who changed what and when |

Dashboard figures are deterministic sample data (`src/features/admin/data/dashboard.ts`) built on
the real catalogue and labelled "Sample sales data" in the UI. Each function there has the same
shape a real query will return, so the backend can replace it without touching the components.

## File map

```
src/proxy.ts                         signed-out redirect for /admin
src/app/admin/layout.tsx             admin fonts, theme variables, metadata
src/app/admin/login/page.tsx         login screen
src/app/admin/(panel)/layout.tsx     requireAdmin() + shell
src/app/admin/(panel)/page.tsx       dashboard
src/features/admin/config/           brand + navigation
src/features/admin/auth/             session, credentials, rate limit, actions, DAL
src/features/admin/components/       shell, sidebar, login form, dashboard pieces
src/features/admin/data/             data sources (sample for now)
src/features/admin/lib/format.ts     money / number / percent formatting
```

The storefront moved into the `src/app/(store)/` route group so it keeps its header, footer and
providers while `/admin` gets a clean layout. URLs did not change.
