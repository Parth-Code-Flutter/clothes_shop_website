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

## How a module gets improved

Before changing a module, write the answers here, then build only what those answers ask for.

1. **The job.** Who opens this screen, and what did they come to finish?
2. **The friction.** What makes them open another page, guess, or repeat themselves?
3. **The change.** The smallest thing that removes that friction. Decoration that doesn't help the job stays out.
4. **What stays.** URLs, server checks and the data shape, unless the job needs them to change.

### Orders list

The person packing orders opens this screen to clear a queue. The next step used to live only on the order page, the row named the product but not the size, and the bulk bar offered the same three actions no matter what was selected. A spreadsheet made every order look the same, and a column called "To pack" was wrong once shipped orders sat in it. Orders that still need someone are packing slips: the size is the largest text, the photo is big enough to recognise the piece, and the one next step sits on the slip. Orders already shipped, delivered, refunded or cancelled stay in a short list underneath. Confirming payment, marking packed and marking delivered happen on the slip. Adding a tracking number and reviewing a return open the order. A slip turns amber down the left edge after 6 hours, and cash-on-delivery slips say "collect cash". The bulk bar only shows actions the selection can actually take.

## Screens and build order

| # | Module | Status | Scope |
| --- | --- | --- | --- |
| 1 | Login | Done | Split brand layout, show/hide password, remember me, lockout, dev hint |
| 2 | Dashboard | Done | Bento grid. Performance: four KPI tabs (revenue, orders, AOV, conversion) that switch the trend chart, 7/30/90 days. Today so far, compared with the same weekday last week. Monthly goal with pace marker, forecast and amount needed per day. Daily brief: plain-language insights with a suggested action. Needs attention: orders to pack, awaiting payment, returns, low stock, reviews. Best sellers and the 5 latest orders. Collapsible sidebar (button in the sidebar header, Ctrl/⌘ B, remembered in the `adm_sidebar` cookie) |
| 3 | Orders | UI done, saving pending | List at `/admin/orders` is a work queue: task stats, status tabs with counts, Orders that still need someone are packing slips (size in large type, photo, one next step, amber edge after 6 hours, "collect cash" on unpaid cash-on-delivery). Shipped, delivered, refunded and cancelled orders sit in a short list under the slips. Confirm payment, mark packed and mark delivered run from the slip; add tracking and review return open the order. Action tabs can sort the longest wait first. Search by order, customer, phone or AWB, payment and sort filters (all in the URL), bulk actions limited to what the selection allows, pagination, CSV export of the current view at `/admin/orders/export`. Detail at `/admin/orders/[id]`: progress stepper, items and totals, ship form (courier and AWB, linked from the list), timeline with notes, customer, address and payment cards, return approve or decline. Status changes follow the transition map in `src/features/admin/lib/order-status.ts` and are checked on the server. Orders are sample data built from the real catalogue in `src/features/admin/data/orders.ts`; replace `getOrders()` and the bodies of `orderStore` with database calls. The dashboard's recent orders and order tasks, and the sidebar's to-pack badge, read from the same module. Shipping labels and invoice PDFs come later |
| 4 | Products | UI done, saving pending | List on the real catalogue: stats, quick tabs (low stock, out of stock, on offer, new), search, category and sort (all in the URL), per-size stock chips, bulk and row actions, pagination. Editor at `/admin/products/new` and `/admin/products/[id]`: basics, media, pricing with discount, stock per size, details, status, category, URL, live storefront preview, unsaved-changes bar. Saves are validated on the server but not stored yet: replace the bodies of `productStore` in `src/features/admin/data/products.ts` with database calls. SKU and stock are sample values from the same file. Image upload needs storage |
| 5 | Collections & categories | UI done, saving pending | List at `/admin/collections`: stats (collections, visible, products featured, products not in any collection), tabs (visible, hidden, smart, manual), cover mosaic, rule summary, product count, show/hide switch per collection. Categories below, with product, unit and sold-out counts, linking to the filtered product list. Editor at `/admin/collections/new` and `/admin/collections/[id]`: title, URL, description, manual (search to add, reorder with arrows, remove) or smart (conditions on category, price, colour or tag, match all or any, live list of matching products), sort order, cover picker, storefront preview, delete. Rule matching and sorting live in `src/features/admin/lib/collection-rules.ts` so the editor preview and the server agree. Collections are sample data in `src/features/admin/data/collections.ts`; replace the seeds and the bodies of `collectionStore` with database calls. Collection pages on the storefront, banner uploads and category editing come later |
| 6 | Inventory | UI done, saving pending | `/admin/inventory`: stats (units, stock value, sizes low, sizes sold out), tabs (needs restock, has sold-out sizes, healthy), search, category and sort (needs attention, runs out soonest, best selling), stock editable per size in the table with a save bar and unsaved-changes warning, units sold in the last 7 days and how many days stock lasts at that pace, restock list CSV at `/admin/inventory/export`. Stock comes from `src/features/admin/data/products.ts` and sales from the orders; replace the body of `inventoryStore` in `src/features/admin/data/inventory.ts` with a database call. The sidebar badge counts sold-out sizes. Adjustment reasons and history come later |
| 7 | Customers | UI done, saving pending | List at `/admin/customers`: stats (customers, repeat rate, average lifetime value, VIPs), segment tabs (VIP, returning, new, has returns), search by name, email, phone or city, sort, pagination, CSV export at `/admin/customers/export`. Profile at `/admin/customers/[id]`: spend stats, order history linked to each order, contact and address, shopping profile (usual size, favourite category, preferred payment), email and SMS marketing consent, private notes. Customers are derived from the orders in `src/features/admin/data/customers.ts`; replace `getCustomers()` and the bodies of `customerStore` with database calls. VIP means ₹6,000+ spent or 4+ orders (`VIP_SPEND_PAISE`, `VIP_ORDERS`) |
| 8 | Discounts | UI done, saving pending | List at `/admin/discounts`: stats (active codes, times used, sales with codes, discount given), status tabs (active, scheduled, ended, turned off), copy code, usage against the limit, days until start or end, on/off switch per code. Editor at `/admin/discounts/new` and `/admin/discounts/[id]`: code with generator, percentage, fixed amount or free shipping, all products or chosen categories, minimum order, first order only, total uses, once per customer, start and end dates in the store's time zone, live summary, performance and delete. Rules are checked on the server. Codes are sample data in `src/features/admin/data/discounts.ts` (FESTIVE10's usage comes from the sample orders); replace `getDiscounts()` and the bodies of `discountStore` with database calls. Automatic offers (no code, e.g. buy 2 get 1) come later |
| 9 | Content | UI done, saving pending | `/admin/content`: a homepage summary (opener headline, film reel source, section order with hidden sections struck through), the announcement bar messages and a list of info pages with word count, last update and status. `/admin/content/homepage` edits the announcement bar (turn on or off, up to 6 messages with optional links, reorder, live preview), the homepage opener (kicker, two-line title, "starring" line, button label and link, closing word, and which collection fills the film reel), the order and visibility of homepage sections, and the footer headline, blurb and newsletter note, with live previews. `/admin/content/pages/new` and `/admin/content/pages/[id]` edit a page's title, URL (made from the title until edited), body (simple formatting: `##` headings, `-` lists, blank lines between paragraphs) with a Preview tab, draft or published status and search listing with a Google-style preview. Content is sample data in `src/features/admin/data/content.ts`; replace `getSiteContent()`, `getPages()` and the bodies of `contentStore` with database calls, then have the storefront read from the same place (it still uses its built-in copy). Banner image uploads and a lookbook editor come later. |
| 10 | Reviews | UI done, saving pending | `/admin/reviews`: average rating with a star breakdown (click a bar to filter), tiles for reviews awaiting approval, low ratings without a reply and featured reviews, tabs (awaiting approval, published, needs a reply, featured, hidden), search, rating and sort filters, pagination. Each review shows the product, size, fit feedback, verified-buyer badge, linked customer and order, helpful votes and flags (contact details, low rating, item returned, not a verified buyer). Approve, hide or publish one or many at once, feature on the product page, and post, edit or remove a public reply. New reviews wait for approval. Reviews are sample data in `src/features/admin/data/reviews.ts`: recent ones come from delivered sample orders, older ones fill in history; replace `getReviews()` and the bodies of `reviewStore` with database calls. The dashboard's "Reviews to approve" and the sidebar badge read the pending count. Showing reviews on the storefront, photo reviews and review request emails come later |
| 11 | Analytics | Done (sample data) | `/admin/analytics?range=7\|30\|90` (30 by default): the dashboard's performance chart locked to the range (revenue, orders, average order value, conversion, with the previous period dashed), store visits and new customers with change, repeat-customer and return rates, a five-step conversion funnel, sales by category, visitors by source with conversion, best sellers linking to each product, average revenue per weekday with the best day called out, top cities, payment methods with a cash-on-delivery note, discount code use, and the 12-week sales heatmap. Export downloads one CSV row per day. Figures come from `src/features/admin/data/analytics.ts`, built on the dashboard's daily series and the sample orders (city, payment, code and return breakdowns say which orders they cover). Traffic sources are illustrative. Replace `getAnalytics()` with real order and analytics queries; the returned shape is what the UI expects. |
| 12 | Settings | UI done, saving pending | `/admin/settings` lists seven sections with a one-line summary of each (a missing GSTIN shows as a warning); each opens at `/admin/settings/[section]`. **Store details:** name, legal name, support email and phone, business address with state and PIN code, GSTIN, order number prefix, with an invoice-header preview. **Branding:** pick one of the `adminThemes` presets from live mini previews, monogram and console name. **Payments:** UPI, cards, net banking and cash on delivery switches, a cash-on-delivery fee and order limit, a checkout preview and payment-provider status. **Shipping & delivery:** free-delivery amount, days to pack, delivery zones (states, rate, delivery days; a state can only be in one zone) and a rest-of-India rate, with a preview of what customers see. **Taxes:** GST rate below and above a price limit (5% up to ₹2,500 and 18% above by default), default HSN code, prices include GST, GST on invoices, and a calculator showing the CGST/SGST split. **Notifications:** alert email, low-stock level, owner alerts, customer emails (order confirmation always on) and WhatsApp updates. **Staff & roles:** team list with roles, invites and removal (you can't remove yourself or change your own role, and there must be an active owner), plus a permissions table. Values are sample data in `src/features/admin/data/settings.ts`; replace `getSettings()` and `settingsStore.save()` with database calls, then read them in checkout, invoices and the admin theme. Staff sign-in needs a user database. |
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
