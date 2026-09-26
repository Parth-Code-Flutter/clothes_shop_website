# Progress

## Done

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
