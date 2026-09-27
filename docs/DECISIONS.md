# Decisions

- Authentication remains explicitly frontend-only until a real identity service is chosen. The preview validates passwords but never stores or transmits them; only the display name and email are kept locally for demonstrating the signed-in journey.
- The account route omits the global footer so sign-in and registration remain focused, compact, and free from competing navigation.
- The account route also omits the global commerce header. A floating logo and “Back to store” link provide escape routes without exposing the full shopping navigation during authentication.
- Temporary preview credentials are `admin` / `admin` for the admin persona and `house` / `house` for the customer persona. They are client-side QA scaffolding only and must be removed when real authentication is connected.
- Authentication and account continuation use separate routes: `/account` owns sign-in/signup, while `/dashboard` owns the protected signed-in experience. Shared account links adapt to session state instead of relying on a visible redirect.
- Authentication errors belong directly beneath their field with `aria-invalid` and `aria-describedby`; avoid a single detached form-level message that makes customers search for the problem.
- Cart and wishlist actions should reduce purchase mistakes: wishlist items route through product size selection, while the cart exposes quantity, sizing, shipping progress, and checkout reassurance in one scan.
- App lives at the workspace root instead of a nested `house-of-bollywood/` folder.
- Theme colors come from the owner logo; light page background stays white by request.
- Display type uses Bebas Neue; body type uses Manrope for a fashion-store feel without a default Inter look.
- Motion uses the `motion` package for hero and product entrance only, with reduced-motion support.
- Product cards are the only card-like interactive containers on the homepage.
- Testimonials, blog, and brand logos are omitted until verified assets exist.
- Catalog supports multiple categories. Only Graphic Tees have live products; Hoodies, Accessories, and Limited Drops stay “soon” until real stock exists.
- Audience tone is Gen Z: bag language, drop board, bold display type, category chips — without inventing products or hype claims.
- Homepage visual pass: lighter full-bleed hero that keeps product art visible, cast rail on the site background, and a second look using slide-2 — matched to the header/footer tone, verified product data only.
- Search queries the local catalog by name, slug, summary, and category.
- Footer uses dedicated `--footer` / `--footer-foreground` tokens so it stays dark and readable in both themes. Never use `bg-foreground` for large surfaces.
- Preview overlays use `--overlay`, not `bg-foreground/…`, for the same reason.
- Visual inspiration sources: always check **Dribbble** + **Pinterest** before chrome/homepage redesigns. Header/footer direction (Sep 2026): centered logo, red accent only on Bag/CTA, “Now showing” strip, numbered footer columns, oversized wordmark bookend.
- Homepage creative pass: cinema “feature presentation” hero (soft dual-slide crossfade), inverted credits marquee, asymmetric “Tonight’s cast” billboard grid, intermission look with slide-2 — still verified catalog only.
- Motion stack: **Lenis** (smooth scroll) + **GSAP / ScrollTrigger / @gsap/react** + selected **React Bits** (BlurText, Magnet, TiltedCard, ScrollReveal, ShinyText). Club GSAP SplitText is not used — free `SplitWords` instead. Reduced-motion disables Lenis and magnets/tilts. Full install + links: [`docs/STACK.md`](./STACK.md) → “Motion libraries”.
- Header: floating glass island (Pinterest/Dribbble); transparent over home hero, solid after scroll. Hero: GSAP pin + scrub (scale, dual-slide crossfade, giant type, progress bar) for a premium premiere feel.
- Homepage (only): Rockstar VI–inspired scroll story — chapter rail, pinned opener, extended look boards, full-bleed cast chapters, media masonry, finale CTA. Uses existing campaign + product images only (no scraped brand art). Section chrome uses theme tokens (`bg-background` / `text-foreground`); type on photos stays light for contrast.
- Homepage product direction (26 Sep): keep the pinned jacket opener unchanged; replace the conventional post-hero shelves with an editorial “Choose your scene” category mosaic and a premiere-style product chapter. The first product receives a large image/copy treatment while the supporting grid preserves fast comparison, wishlist access, prices, and direct PDP links. Mobile becomes a single-column image-led journey rather than a squeezed desktop grid.
- Header direction (26 Sep): replace the flat category row with a customer-intent hierarchy. “Men” opens a full-width, image-led mega menu containing the five real catalog categories; New In, Trending, Best Sellers, and Offers remain visible primary merchandising routes. Desktop supports hover, click, focus, outside click, and Escape; mobile uses an expanded Men accordion followed by the merchandising routes.
- Product-detail direction (26 Sep): use an editorial split-screen scene with immersive media and a sticky, task-focused buying panel. Include expected clothing-store basics—price/offer clarity, size selection and guide, quantity, wishlist, add to bag, buy now, delivery PIN entry, share, expandable details, mobile purchase bar, and related products—but explicitly mark fulfilment, fabric/care, measurements, and returns as pending when verified data is unavailable.
- Product galleries (26 Sep): every `CatalogProduct.gallery` may contain any number of images. The main media opens a fullscreen, keyboard-navigable lightbox. A four-image Unsplash denim set demonstrates the experience, but is explicitly documented as temporary editorial imagery rather than four verified views of one SKU; owner-supplied front/back/side/detail photography must replace it before launch.
- Gallery interaction refinement: prioritize low-effort comparison over decorative media blocks. Desktop keeps every view in a persistent numbered vertical rail; mobile changes that rail to horizontal. Previous/next controls remain on the main stage, and the fullscreen viewer exposes zoom out, percentage, zoom in, reset, thumbnails, arrows, click-to-toggle zoom, and keyboard controls.
# Commerce UX decisions — 27 Sep 2026

- Myntra is used only as a reference for familiar filter/sort vocabulary. Visual styling, writing, hierarchy, and brand interaction remain original to House of Bollywood.
- Ratings, review counts, popularity, and garment specifications are deterministic prototype catalog data. They are suitable for UX demonstration and must be replaced by backend merchandising/review data before production launch.
- Filters are client-side for the current local catalog. The same filter model is intentionally reusable when product APIs and URL-backed faceting are introduced.
- The dashboard stays useful without inventing fake orders or addresses: empty states explain the next action and only show data the preview genuinely has.
# Virtual try-on decisions — 27 Sep 2026

- Replaced the initial movable-overlay prototype with identity-preserving generative virtual try-on.
- Prefer the open-source, Apache-2.0 licensed [FASHN VTON 1.5](https://github.com/fashn-AI/fashn-vton-1.5) model over the paid hosted API. Run it as a separate private Python inference service and call it through a Next.js server route.
- The server sends the consented person image and the selected product's real catalog image to the private inference service; model infrastructure and credentials never reach the browser.
- The UI requires explicit photo-use consent before transmission. Temporary input and output retention must be minimized and documented before production launch.
- Camera is used to capture a still person image. This is near-real-time generation (typically seconds), not live-video garment rendering.
- Try-on is limited to shirts, tees, hoodies, and jackets until the catalog has production-ready bottom garment imagery.
- A GPU is recommended for usable latency. Hugging Face ZeroGPU is acceptable for a constrained demo, while production requires a reliable GPU deployment, access control, rate limiting, and monitoring.
- Full architecture, customer flow, deployment guidance, and privacy requirements are recorded in [`VIRTUAL_TRY_ON.md`](./VIRTUAL_TRY_ON.md).
# Hybrid fitting room — 27 Sep 2026

- The fitting room is now hybrid: a real-time live preview on the camera or an uploaded photo (MediaPipe Pose, in the browser) plus an on-demand realistic photo (FASHN VTON 1.5). Realistic live-video try-on has no free option, so the live part is a style preview and the photo is the realistic result.
- The backend is chosen with `VTON_MODE` (`gradio`, `http`, `fashn`). The free default is the official `fashn-ai/fashn-vton-1.5` Hugging Face Space; `services/vton` lets us run the same model on our own ZeroGPU Space, Colab/Kaggle or a rented GPU.
- The AI route sends the product's transparent try-on cut-out (flattened on white) as a flat-lay garment, not the lifestyle catalog photo, because the catalog photos show models and scenes.
- Try-on is offered only on products with `tryOn` data. Since the real catalog (27 Sep) that is six graphic tees cut out from the owner's photos: Venom Mustard, Messi 10 Ivory, Deadpool Ivory, Black Panther Ivory, Spider Emblem Beige and Bat Flight Mustard.
- Garment cut-outs are made with a local sharp script (`scripts/try-on/cutout.mjs`) instead of a Python background-removal model, so no extra runtime is needed.
- FASHN hosted API moderation is set to `conservative`.
- The separate `/api/try-on/start` route was folded into `/api/try-on/generate`; `/api/try-on/status/[id]` stays for the paid FASHN polling.
- `fashn-human-parser` is research/evaluation-only; it must be replaced or cleared with FASHN AI before commercial launch.
# Real product catalog — 27 Sep 2026

- The placeholder catalog was replaced with the owner's own photos: 43 products in four categories (T-Shirts, Shirts, Jeans, Trousers). Jackets was removed because there are no jacket products yet; the rust overshirt sits in Shirts.
- Every product keeps all its angles in one folder, `public/images/products/<category>/<product-id>/`, and `data.ts` lists the views in display order.
- Graphic tees use the live store's ₹650 price and copy. Shirt (₹1,499), jeans (₹1,799) and trouser (₹1,599) prices are placeholders in `PRICE_PAISE` until the owner confirms them. No compare-at prices are set, so the site shows no discounts; discount filters and sorting reappear automatically once any product has an `mrpPaise`.
- Fabric wording is limited to what the photos show (for example "Brushed flannel", "Washed denim") and should be confirmed by the owner.
- Product names avoid third-party brand names that appear on some prints (e.g. "Court 23", "GT3 RS", "Teddy Bear").
- The homepage leads with a fixed `FEATURED` mix across all four categories.
- Saved bags and wishlists are checked against the live catalog on load, so retired pieces drop out and prices stay current.
