# House of Bollywood — Cursor development brief

## 1. Controlling scope

Design and build a completely original, modern UI and UX for House of Bollywood. Preserve only features already present on the existing site. The existing website is a source of brand assets, product information, content, and feature inventory; it is not a visual reference to copy.

Do not reproduce its layout, section styling, theme, typography, spacing, or interaction design. Create a fresh visual system and homepage composition from scratch.

**Current implementation scope: project setup and homepage only (`/`).** Do not build a product-detail page, shop page, cart page, checkout, account page, or backend in this first phase. Stop after presenting the homepage for review. Further pages require a subsequent instruction.

**Explicit additional requirement: implement both light and dark themes now**, including a working homepage theme toggle. This user-requested requirement is included alongside the existing-site feature scope.

**Explicit additional requirement: responsive UI from the first layout**, for phone, tablet, and computer. Do not design a desktop page and then shrink it. Each width gets its own spacing, type size, navigation, and image crop. Check about 360–390px, a tablet width, and 1440px. No horizontal scrolling. Tap targets stay large enough for a thumb. The mobile menu, theme toggle, and preview notices must work on all three.

### Starting constraints

These apply to the first UI code, not as a later pass:

- Light and dark themes share one set of named color variables. Components do not hardcode white or black.
- Layouts are responsive at phone, tablet, and computer widths from the first section.
- Keyboard use, visible focus, readable contrast, and image alt text are part of each component. Honor reduced motion.
- Use semantic page regions (`header`, `main`, `nav`, `footer`) and reserve image space so the page does not jump while pictures load.
- Product photos keep their real colors in both themes.
- Prices stay in integer paise and display as INR.
- Shop, cart, account, and newsletter actions stay in preview until a later instruction. Do not invent products, reviews, or shipping promises.

This revision replaces the earlier broader demo plan. Suggestions previously made for new features are removed from the development scope. A missing capability is not permission to add it.

Build inside a new `house-of-bollywood/` directory without altering unrelated files or the live website. This document is a specification; the application has not been scaffolded.

Existing site: https://houseofbollywood.in/

## 2. Existing feature inventory and evidence

Public review conducted on 24 September 2026. This records visible features, not a complete backend or functionality audit. Recheck details when implementing the relevant module later.

| Existing area | Observed features | Scope treatment |
|---|---|---|
| Header | Logo, mobile menu, search, account link, wishlist link, cart indicator | Redesign homepage presentation; other destinations are deferred |
| Homepage service information | Shipping, returns, support, secure-payment messaging | Present only consistent, verified copy; omit unresolved promises |
| Homepage products | Hand-picked products and top-rated products | Redesign product presentation using actual catalog information |
| Homepage promotions | Product/collection promotions and shop CTA | Create original visual composition using existing merchandise |
| Testimonials | Customer testimonial section | Retain section capability; display only verified content |
| Blog | Article previews and blog links | Retain capability; omit irrelevant demo articles from presentation |
| Brand strip | Brand/logo carousel | Use only identified, approved brand assets; omit placeholders |
| Newsletter | Email entry form | Homepage visual/form preview only; no live subscription |
| Footer | Contact details, About, blog, policy links, FAQ/Careers placeholders | Redesign; do not create new pages from placeholder links |
| Shop | Product listing, filter control, sorting | Later only; verify actual filter options before reproducing behavior |
| Product page | Gallery, price, quantity, description, additional information, reviews, cart, Buy Now, wishlist, compare, Ask Us, share | Later only; behavior of all controls was not verified |
| Cart | Adding a product worked; cart subtotal and checkout link displayed | Later only |
| Checkout | Billing fields, order summary, promo-code entry, Razorpay payment option | Later only; payment and fulfilment were not tested |
| Account / wishlist | Links and controls | Later only; authentication and persistence were not verified |
| Appearance control | Site color-palette control visible | Implement the explicitly requested light/dark themes and working toggle in the homepage phase |

Observed products: Hulk T-shirt, Spiderman T-shirt, Deadpool T-Shirt, Batman T-shirt Red, Batman T-shirt Yellow. Each displayed ₹650 at review time. Reconfirm before production use.

Observed content issues: conflicting shipping messages in dollars and rupees; FAQ/Careers links pointing to `#`; a testimonial link leading to a theme-demo website; generic blog content; “Trands” typo; inconsistent product-card rating versus product review count. No size selector was visible on the inspected Hulk product.

These findings justify content cleanup and verification, not automatic feature expansion. Do not add size/color selectors, a size guide, shipment tracking, loyalty, referrals, bundles, back-in-stock alerts, advanced filters, or new customer workflows unless subsequently requested. Keep Batman Red and Batman Yellow as separate observed products; do not invent a variant system.

## 3. Homepage deliverable

Build a complete, responsive homepage suitable for showing the owner:

- Original header and navigation design, with a working mobile-menu open/close interaction.
- A strong opening composition featuring the existing brand and merchandise. This is a design treatment, not a new business module.
- A redesigned presentation of existing product highlights and promotional content.
- Existing service information where confirmed, with clear hierarchy and readable copy.
- Existing testimonial, blog, and brand sections only where suitable verified content/assets exist. Document omissions rather than inventing endorsements or filler.
- A redesigned newsletter area and footer using existing content categories.
- Responsive image sizing, keyboard support, hover/focus states, and restrained motion.
- Fully styled light and dark themes with a working, accessible header toggle on desktop and mobile.

The composition, section order, typography, spacing, color treatment, and component styling should be new. Preserve business capabilities, not the old arrangement of sections. Improve clarity and navigation without introducing new business functionality.

### Homepage interaction boundary

Implement theme switching, menu toggling, in-page navigation, and carousel controls if the new layout uses a carousel. Do not build commerce flows just because their controls appear on the homepage.

For shop/product/account/wishlist/cart/search and purchase actions, use a consistent, accessible preview notice such as “Homepage preview — this action will be connected in a later phase.” Record these boundaries in the README. Do not create empty destination pages, silently use `#`, or send visitors to live checkout. Do not pretend an item was added to a cart.

A newsletter preview may validate email format locally, but must clearly say subscriptions are not connected. Do not save or transmit the address or show a subscription-success message. Existing verified telephone/email links may use their normal destinations.

Do not display artificial cart counts, ratings, sales counts, stock urgency, or customer totals. Use empty/default indicators where needed and distinguish preview behavior from working commerce.

## 4. Modern visual direction

Create an original fashion storefront with a clear House of Bollywood identity. A cinema/pop-culture influence can inform the art direction, but the actual merchandise remains the source of product truth.

Suggested starting palette, taken from the owner logo at `public/brand/house-of-bollywood-logo.png`: brand red, gold edge, near-black outline, and warm white / cream for “House of”. Treat this as a design starting point, not a fixed template. The site file has a transparent background. Pair expressive headings with readable body text, consistent product photography, generous spacing, and strong contrast.

Product images should remain recognizable and accurately represent the goods. Use owner-supplied or existing approved assets, record their sources, and document missing assets. Do not invent product designs or celebrity endorsements.

Prioritize a distinctive opening viewport and well-composed product sections. Avoid overloaded badges, generic template sections, intrusive popups, heavy animation, or scroll hijacking. Respect reduced-motion preferences.

The result must work at mobile, tablet, and desktop widths. Design each layout intentionally instead of merely shrinking the desktop page.

### Light and dark theme requirements

- Design both themes deliberately across the entire homepage: page backgrounds, surfaces, header, mobile menu, footer, product cards, buttons, forms, borders, icons, focus indicators, and preview notices.
- Use semantic CSS variables such as background, surface, text, muted text, border, accent, and focus. Define separate light/dark values; do not scatter hardcoded colors or simply invert the page.
- Default to the operating system preference when no explicit choice has been saved. Follow system changes until the visitor chooses a theme; persist that explicit light/dark choice in local storage across reloads.
- Provide a keyboard-operable toggle with an accessible name describing the action, such as “Switch to dark theme.” Keep its state and icon consistent across desktop and mobile.
- Apply the initial theme before paint to avoid a bright/dark flash and hydration mismatches. Use `next-themes` with a class-based theme and system default; follow its documented App Router setup and wait for mounting only where theme-dependent controls require it.
- Keep red accents and the logo readable in both themes. Preserve product-image colors; do not apply image inversion filters. Use an appropriate logo surface or approved logo variant when needed.
- Check readable contrast, hover/disabled/focus states, and reduced-motion behavior in both themes.
- Theme preference persistence is authorized for this phase; this does not introduce cart, account, or checkout persistence.

## 5. Technology and rationale

| Area | Choice | Why / when |
|---|---|---|
| Application | Next.js App Router + React + TypeScript | React-based UI, clear routing, typed data, and room for future server integration |
| Styling | Tailwind CSS + CSS variables | Consistent design tokens and responsive layouts |
| UI primitives | Selected shadcn/ui components where useful | Accessible interaction foundations customized to the original design |
| Icons | Lucide React | Consistent icons with accessible labels |
| Images | Next.js image handling | Responsive delivery and stable image dimensions |
| Motion | CSS transitions first | Lightweight visual polish and reduced-motion support |
| Homepage data | Small typed local fixture files | Work independently of the live backend; keep content out of UI markup |
| State | Local React state | Sufficient for homepage menus, previews, and optional carousel controls |
| Theme | next-themes + semantic CSS variables | System-aware initial theme, explicit light/dark switching, saved preference, and consistent styling |
| Quality | TypeScript, ESLint, formatter, lockfile | Consistent code and reproducible setup |
| Future backend | WooCommerce provisionally, after audit | Existing platform can retain administration while the storefront is redesigned |
| Future payments | Existing Razorpay integration, after validation | Preserve existing payment capability rather than introduce another provider |

Install only dependencies needed for the homepage. No cart state library, local-storage commerce, checkout forms package, database, authentication service, or backend integration is needed now. Add testing tools only where they support meaningful checks.

Choose compatible current stable versions, record the Node version, and commit the lockfile. The future commerce decision does not block the homepage design.

## 6. Current project structure

Create only the files actually needed for the homepage. Component names below describe responsibilities; adapt the composition to the final design.

```text
house-of-bollywood/
├── README.md
├── package.json
├── package-lock.json
├── .gitignore
├── next.config.ts
├── tsconfig.json
├── eslint.config.mjs
├── public/
│   ├── brand/
│   └── images/
│       ├── products/
│       └── homepage/
├── docs/
│   ├── PROJECT_BRIEF.md
│   ├── PROGRESS.md
│   ├── DECISIONS.md
│   └── ASSETS.md
└── src/
    ├── app/
    │   ├── layout.tsx
    │   ├── page.tsx
    │   ├── globals.css
    │   ├── not-found.tsx
    │   └── robots.ts
    ├── components/
    │   ├── ui/
    │   ├── theme/
    │   │   ├── theme-provider.tsx
    │   │   └── theme-toggle.tsx
    │   ├── layout/
    │   │   ├── site-header.tsx
    │   │   ├── mobile-menu.tsx
    │   │   └── site-footer.tsx
    │   └── shared/
    │       ├── product-card.tsx
    │       └── preview-notice.tsx
    ├── features/
    │   └── home/
    │       ├── components/
    │       ├── data.ts
    │       └── types.ts
    ├── config/
    │   └── site.ts
    └── lib/
        └── money.ts
```

Use server components for static content where appropriate and client components for actual interaction. Do not scaffold future pages or backend folders. Add environment configuration only when needed; no credentials are required for this phase.

## 7. Homepage data rules

Use a small `HomepageProduct` type with id, name, existing product URL or slug, image, alt text, and INR price in integer paise. ₹650 is 65000 paise. Product links are data references, not permission to create their destination pages now.

Keep separate typed data for existing promotions, verified service messages, navigation, contact information, and any approved testimonials/blog previews. Track uncertain information in documentation. Do not add invented sizes, variants, inventory, discounts, collections, reviews, or shipping thresholds.

Keep presentation reusable without constructing a full commerce abstraction prematurely. No order, customer, payment, or cart models are required for the homepage.

## 8. Development order

### Step 1 — setup and content preparation

Read this brief, inspect the directory, create the Next.js project, record the stack, collect approved brand/product assets, and document missing content. Define fresh typography, semantic light/dark color tokens, spacing, and responsive rules. Configure the theme provider and initial system preference.

Completion: local app starts, root route renders, and asset sources are documented.

### Step 2 — homepage design and implementation

Build the entire homepage with original composition, responsive header/footer, existing product highlights and promotions, and suitable existing supporting content. Implement homepage interactions, the light/dark toggle with saved preference, and explicit preview handling for deferred actions.

Completion: a coherent homepage can be reviewed at mobile and desktop sizes, with no extra pages or commerce implementation.

### Step 3 — polish and verify

Check spacing, image crops, typography, focus states, mobile menu, preview notices, motion preferences, and all visible links/actions in both themes. Verify first-visit system preference, manual toggling, persistence after reload, synchronized mobile/desktop controls, and absence of theme flashes or hydration warnings. Run type checking, lint, and production build. Inspect 360/390px mobile, tablet, and 1440px desktop when browser tools are available. Record any checks that could not be performed.

Completion: no horizontal overflow, broken images, misleading success messages, or accidental live submissions. Setup and known limitations are documented.

### Step 4 — present the homepage and stop

Provide local run instructions, screenshots where available, changed-file summary, verification results, and missing assets/content. A separately hosted preview is optional once a destination is chosen. Mark any public preview noindex; noindex is not access protection.

**Stop here. Do not proceed automatically to product pages, the full shopping journey, or backend work.** Wait for homepage feedback and a subsequent instruction identifying the next existing module to rebuild.

## 9. Later work — context only, not current authorization

After homepage approval, select existing modules one at a time: shop/search, product details, cart, wishlist, checkout, account, or existing content pages. Before implementation, verify the module's actual existing behavior. Preserve confirmed capabilities and improve their UI/UX without adding unrequested business features.

Audit WooCommerce and Razorpay on staging before integration. Confirm supported cart sessions, server-authoritative totals, payment verification, order handling, and stock behavior. A payment plugin's presence does not prove headless compatibility. Retain a supported checkout architecture instead of inventing a payment bridge.

Before eventual launch, preserve useful existing URLs, map necessary redirects, back up the site, test the authorized shopping flow, and prepare rollback and owner handover. Live deployment and DNS changes are separate actions, not part of homepage delivery.

## 10. Cursor working rules and acceptance

- Follow this revision if earlier prompts mention building a product page or complete demo first.
- Build a fresh visual design; do not clone the existing site's theme or layout.
- Implement the explicitly requested light and dark themes during the homepage phase.
- Preserve only observed/confirmed business features. Unverified controls and placeholder links are not permission to invent functionality.
- Implement only the homepage now. Keep all other actions explicitly in preview state.
- Keep data separate from components and use reusable components where needed.
- Do not fabricate testimonials, ratings, claims, or product facts to fill a design.
- Use accessible controls, visible keyboard focus, descriptive image alt text, and readable contrast.
- Keep previews isolated from live data, subscriptions, orders, and payments.
- Preserve unrelated files and document exact run commands.
- Update `docs/PROGRESS.md` with completed work, checks, limitations, and the homepage review checkpoint; record design choices in `docs/DECISIONS.md`.
- Do not claim tests or visual checks passed without performing them.

Homepage acceptance: original modern design; complete light and dark themes with accessible switching, system default, and saved preference; existing feature boundaries respected; only `/` implemented as a business page; mobile/tablet/desktop layouts reviewed; homepage interactions work; deferred actions are honestly explained; type/lint/build results reported; ready for the owner's design review.

## 11. Reference documentation

- Existing brand, products, and feature inventory: https://houseofbollywood.in/
- Next.js structure: https://nextjs.org/docs/app/getting-started/project-structure
- Next.js metadata: https://nextjs.org/docs/app/getting-started/metadata-and-og-images
- Future WooCommerce integration reference: https://developer.woocommerce.com/docs/apis/store-api/
- Future Razorpay integration reference: https://razorpay.com/docs/payments/server-integration/nodejs/integration-steps/

The existing website is not a layout template. Backend references are for later work, not instructions to implement integration now.
