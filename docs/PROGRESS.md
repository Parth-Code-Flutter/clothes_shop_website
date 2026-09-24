# Progress

## Done

- Next.js 16 app at workspace root with light/dark theme tokens and `next-themes`
- Shared header with Home/Shop links, mobile menu, theme toggle, and preview actions
- Shared footer with verified Junagadh contact details
- Homepage: cinematic hero, featured tees, contact strip, newsletter preview
- Shop listing at `/shop` with category chips and sort
- Product detail at `/product/[slug]` with gallery and real add-to-bag
- Cart at `/cart` with local bag state, quantity controls, and checkout preview
- Multi-category shelf: Graphic Tees live; Hoodies, Accessories, Limited Drops marked soon
- Gen Z tone in shop/bag copy without inventing merchandise
- Shared catalog data using live store slugs and ₹650 prices
- Product and hero images copied from the live site and recorded in `ASSETS.md`

## Checks

- Typecheck: passed
- Lint: passed
- Build: passed
- Routes: `/`, `/shop`, `/product/[slug]`, `/cart`

## Known limitations

- Search, account, wishlist, checkout stay in preview
- Cart is device-local only until backend integration
- Empty categories intentionally have no fake products
- Newsletter validates format locally and does not store or send email
- Size and stock are omitted until verified on the live product pages
- Full visual redesign still deferred after core features
