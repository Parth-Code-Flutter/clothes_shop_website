# Progress

## Done

- Built a complete frontend account journey: collectible House Pass sign-in and registration views, per-field inline validation, password visibility and matching, terms consent, recovery messaging, local-session creation, sign-out, and a customer account dashboard.
- Authentication is now a distraction-free full-screen portal without the global shopping header or footer; temporary QA access supports `admin` / `admin` and customer access through `house` / `house`.
- Successful sign-in and registration now navigate to the protected `/dashboard`; unauthenticated dashboard visits return to `/account`, sign-out returns to authentication, and account links resolve directly to the dashboard for signed-in customers.
- Redesigned the cart, wishlist, and footer as a connected editorial shopping journey, including checkout progress, free-shipping feedback, size-safe wishlist actions, stronger empty states, and a branded footer ticker.
- Next.js 16 app at workspace root with light/dark theme tokens and `next-themes`
- Shared header with Home/Shop links, mobile menu, theme toggle, and preview actions
- Shared footer with verified Junagadh contact details
- Homepage: cinematic hero, featured tees, contact strip, newsletter preview
- Shop listing at `/shop` with category chips and sort
- Product detail at `/product/[slug]` with gallery and real add-to-bag
- Cart at `/cart` with local bag state, quantity controls, and link to checkout
- Checkout at `/checkout` with billing validation, promo preview, Razorpay preview, and order summary
- Wishlist at `/wishlist` with local saves and header count
- Account at `/account` with device-only profile save/sign-out
- Search at `/search` over the local catalog
- Homepage polish: hero, marquee, character drop stage
- Homepage redesign: brand-first full-bleed hero, Lenis smooth scroll, slide-2 look section, cast rail
- Homepage post-hero redesign: asymmetric editorial category wall, lead-product feature, supporting product grid, and customer journey cues
- Header merchandising redesign: Men mega menu with category links and editorial imagery; New In, Trending, Best Sellers, and Offers navigation; matching mobile accordion
- Product-detail redesign: editorial split gallery, sticky buying panel, offer hierarchy, size guide, wishlist, quantity, add/buy actions, share, PIN-code preview, disclosures, mobile purchase bar, and related-product chapter
- Product gallery upgrade: click-to-zoom fullscreen lightbox with thumbnails, previous/next controls, Escape and arrow-key navigation; four-image denim editorial prototype
- Product gallery UX refinement: persistent numbered vertical thumbnail rail on desktop, horizontal mobile rail, main-stage previous/next controls, and 100–300% fullscreen zoom with reset
- Homepage cleaned up: lighter hero (art-first), no Lenis, cast + look aligned with header/footer
- Motion modernization: Lenis + GSAP + React Bits (BlurText, Magnet, TiltedCard, ScrollReveal, ShinyText)
- Multi-category shelf: Graphic Tees live; Hoodies, Accessories, Limited Drops marked soon
- Gen Z tone in shop/bag/checkout/account copy without inventing merchandise
- Shared catalog data using live store slugs and ₹650 prices
- Product and hero images copied from the live site and recorded in `ASSETS.md`

## Checks

- Typecheck: passed
- Lint: passed
- Build: passed
- 26 Sep homepage redesign: targeted ESLint passed, typecheck passed, production build passed, desktop and 390px mobile visually checked
- 26 Sep header redesign: targeted ESLint and typecheck passed; desktop mega menu and 390px mobile navigation visually checked
- 26 Sep product-detail redesign: targeted ESLint and typecheck passed; desktop and 390px mobile visually checked; size selection and add-to-bag verified
- Routes: `/`, `/shop`, `/product/[slug]`, `/cart`, `/checkout`, `/wishlist`, `/account`, `/search`

## Known limitations

- Cart, wishlist, and account are device-local only until backend integration
- Account is not real authentication (no password, no server)
- Checkout does not charge, create orders, or call Razorpay
- Promo codes do not apply discounts
- Empty categories intentionally have no fake products
- Newsletter validates format locally and does not store or send email
- Size and stock are omitted until verified on the live product pages
- Full-project lint is currently blocked by macOS `._*` metadata files; changed homepage files pass targeted ESLint
- WooCommerce / Razorpay integration still future work
# Premium commerce completion pass — 27 Sep 2026

- Added a shared merchandising model for rating, reviews, colour, fit, fabric, pattern, occasion, care, popularity, and detailed garment construction.
- Rebuilt the shop browse experience with price, size, colour, customer-rating, and discount filters; seven sort modes; active-filter count; mobile filter drawer; and no-results recovery.
- Added sorting and quick filters to search, and expanded search matching to product attributes.
- Added rating and decision-making metadata to product cards.
- Replaced placeholder PDP copy with garment-specific specifications, fabric/care, construction details, review summary, and a clear delivery/returns promise.
- Upgraded the customer dashboard with a House Pass membership card, profile completion, personal/delivery/style panels, and clearer privacy messaging.
- Verified targeted ESLint, TypeScript, and a full production build (31 static pages).
# AI virtual fitting room — 27 Sep 2026

- Added `AI try-on` entry points to eligible product cards and product-detail pages.
- Replaced the visual overlay prototype with a real person-photo + selected-garment generation pipeline.
- Added camera capture, photo selection, consent gate, progress states, provider errors, garment switching, generated result preview, and download.
- Added server-only FASHN start/status proxy routes and `.env.example` configuration.
- Jeans and trousers remain deliberately gated until their production try-on pipeline is ready.
- Selected open-source FASHN VTON 1.5 as the preferred replacement for the paid hosted provider and documented the service architecture, customer flow, deployment options, limitations, and privacy requirements in [`VIRTUAL_TRY_ON.md`](./VIRTUAL_TRY_ON.md).
- The open-source inference service is documented but not yet deployed or connected; the existing hosted-provider route remains the current implementation until migration is completed and tested.
# Hybrid fitting room — 27 Sep 2026

- Added a real-time live preview: MediaPipe Pose tracks shoulders and hips on the camera feed or an uploaded photo and draws the garment on them, with in-place garment switching and guidance when the body is out of frame.
- Added **Make realistic photo**, which sends the current frame or upload to FASHN VTON 1.5 after consent.
- Added `/api/try-on/generate` with `gradio`, `http` and `fashn` backends, validation, and a per-IP rate limit.
- Added `services/vton`: Gradio Space app, FastAPI GPU server with shared secret, Colab notebook with a Cloudflare tunnel, and setup README.
- Added `scripts/try-on/cutout.mjs` for new garment cut-outs.
- Connected to the official free Space: a realistic photo generated end to end in about 32 seconds.
- Checks: TypeScript and ESLint passed; desktop and 390px mobile checked in the browser (upload, live tracking, garment switch, consent gate, generation, result, save).
- Known limits: the live preview is a flat cut-out (no arm wrapping or folds); free GPU quota allows a handful of photos per day; the human parser needs a commercial licence decision before launch.
# Real product catalog — 27 Sep 2026

- Imported the owner's 76 photos into `public/images/products/<category>/<product-id>/`: 43 products and 73 images (4 exact duplicates skipped), with multi-angle shots grouped per garment.
- Rewrote `src/features/catalog/data.ts` for four categories: 24 T-Shirts, 7 Shirts, 8 Jeans, 4 Trousers. Removed Jackets from navigation, mega menu, footer, search and shop copy; the homepage category wall is now four portrait tiles.
- Replaced the generated try-on cut-outs with six real graphic-tee cut-outs; `scripts/try-on/cutout.mjs` now handles dark backdrops, display wires, and logos.
- Removed the old placeholder images (`public/images/catalog/`, the scraped tee photos, the Unsplash denim set, and the generated try-on PNGs).
- Bags and wishlists saved before the change drop retired products and pick up current prices.
- Open with the owner: shirt, jeans and trouser prices; fabric details; sizes; six less certain photo groupings (listed in `ASSETS.md`).
- Checks: TypeScript and ESLint passed; shop, category filters, product galleries, homepage, fitting room garment switcher and bag checked in the browser on desktop and 390px mobile.
