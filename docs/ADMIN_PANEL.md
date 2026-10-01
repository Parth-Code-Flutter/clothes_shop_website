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
| `theme` | Colour preset from `adminThemes`: `iris` (graphite and violet, default), `midnight` (navy), `sage` (muted green), `heritage` (ivory and gold) |

Each preset in `adminThemes` has a light and a dark palette. To make a client-specific look, copy a
preset, rename it, change the hex values and set `theme` to its name.

How colours work: each palette token becomes a CSS variable (`--adm-accent`, `--adm-canvas`, ...)
scoped to `[data-admin]`, and Tailwind maps them to utilities (`bg-adm-accent`, `text-adm-ink`, ...)
in `src/app/globals.css`. Components never use hex values, so changing `accent` re-themes buttons,
charts and focus rings at once. `sidebarAccent` is the highlight used on the sidebar and the login
brand panel, so it must stay readable on `sidebar`. Add `data-admin-dark` to an element to pin it to
the dark palette in both themes (the login brand panel does this). The storefront theme is untouched.

Fonts: Geist for everything, loaded in `src/app/admin/layout.tsx`. Headings use the
`font-adm-display` utility, which points at the same font in `src/app/globals.css`; to give a client a
different heading font, load it in the layout and change `--font-adm-display` there.

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
| 2 | Dashboard | Done | Bento grid. Performance: four KPI tabs (revenue, orders, AOV, conversion) that switch the trend chart, 7/30/90 days. Today so far, compared with the same weekday last week. Monthly goal with pace marker, forecast and amount needed per day. Daily brief: plain-language insights with a suggested action. Needs attention: orders to pack, awaiting payment, returns, low stock, reviews. Best sellers and the 5 latest orders. Collapsible sidebar (button in the sidebar header, Ctrl/⌘ B, remembered in the `adm_sidebar` cookie) |
| 3 | Orders | UI done, saving pending | List at `/admin/orders`: task stats, status tabs with counts (unpaid, to pack, ready to ship, shipped, delivered, returns, cancelled), search by order, customer, phone or AWB, payment and sort filters (all in the URL), bulk mark paid, mark packed and cancel, pagination, CSV export of the current view at `/admin/orders/export`. Detail at `/admin/orders/[id]`: progress stepper, items and totals, ship form (courier and AWB), timeline with notes, customer, address and payment cards, return approve or decline. Status changes follow the transition map in `src/features/admin/lib/order-status.ts` and are checked on the server. Orders are sample data built from the real catalogue in `src/features/admin/data/orders.ts`; replace `getOrders()` and the bodies of `orderStore` with database calls. The dashboard's recent orders and order tasks, and the sidebar's to-pack badge, read from the same module. Shipping labels and invoice PDFs come later |
| 4 | Products | UI done, saving pending | List on the real catalogue: stats, quick tabs (low stock, out of stock, on offer, new), search, category and sort (all in the URL), per-size stock chips, bulk and row actions, pagination. Editor at `/admin/products/new` and `/admin/products/[id]`: basics, media, pricing with discount, stock per size, details, status, category, URL, live storefront preview, unsaved-changes bar. Saves are validated on the server but not stored yet: replace the bodies of `productStore` in `src/features/admin/data/products.ts` with database calls. SKU and stock are sample values from the same file. Image upload needs storage |
| 5 | Collections & categories | | Manual and rule-based collections, ordering, banners |
| 6 | Inventory | | Stock per variant, low-stock thresholds, adjustments with reasons, history |
| 7 | Customers | UI done, saving pending | List at `/admin/customers`: stats (customers, repeat rate, average lifetime value, VIPs), segment tabs (VIP, returning, new, has returns), search by name, email, phone or city, sort, pagination, CSV export at `/admin/customers/export`. Profile at `/admin/customers/[id]`: spend stats, order history linked to each order, contact and address, shopping profile (usual size, favourite category, preferred payment), email and SMS marketing consent, private notes. Customers are derived from the orders in `src/features/admin/data/customers.ts`; replace `getCustomers()` and the bodies of `customerStore` with database calls. VIP means ₹6,000+ spent or 4+ orders (`VIP_SPEND_PAISE`, `VIP_ORDERS`) |
| 8 | Discounts | | Codes and automatic offers, limits, schedule, usage |
| 9 | Content | | Homepage hero, banners, lookbook, announcement bar, static pages |
| 10 | Reviews | | Moderation queue, replies, featured reviews |
| 11 | Analytics | | Sales, products, customers, traffic reports, CSV export. Reuses the ready-made sales-rhythm heatmap (`sales-rhythm.tsx`), category donut and conversion funnel (`panels.tsx`) |
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
