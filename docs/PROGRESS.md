# Progress

## Done

- Next.js 16 app at workspace root with light/dark theme tokens and `next-themes`
- Shared header with Home/Shop links, mobile menu, theme toggle, and preview actions
- Shared footer with verified Junagadh contact details
- Homepage: cinematic hero, featured tees, contact strip, newsletter preview
- Shop listing at `/shop` with featured/name/price sort
- Product detail at `/product/[slug]` with gallery, quantity UI, and preview commerce actions
- Shared catalog data using live store slugs and ₹650 prices
- Product and hero images copied from the live site and recorded in `ASSETS.md`

## Checks

- Typecheck: passed
- Lint: passed
- Build: passed
- Routes: `/`, `/shop`, `/product/[slug]`

## Known limitations

- Search, account, wishlist, cart, checkout stay in preview
- Newsletter validates format locally and does not store or send email
- Testimonials, blog, and brand strip omitted because content was unverified or theme-demo
- Size and stock are omitted until verified on the live product pages
- Visual redesign (Character Drop Stage) deferred until features are in
