# Decisions

- App lives at the workspace root instead of a nested `house-of-bollywood/` folder.
- Theme colors come from the owner logo; light page background stays white by request.
- Display type uses Bebas Neue; body type uses Manrope for a fashion-store feel without a default Inter look.
- Motion uses the `motion` package for hero and product entrance only, with reduced-motion support.
- Product cards are the only card-like interactive containers on the homepage.
- Testimonials, blog, and brand logos are omitted until verified assets exist.
- Catalog supports multiple categories. Only Graphic Tees have live products; Hoodies, Accessories, and Limited Drops stay “soon” until real stock exists.
- Audience tone is Gen Z: bag language, drop board, bold display type, category chips — without inventing products or hype claims.
- Wishlist and account are device-local (`localStorage`) like the bag. Account stores name/email only — no password and no server auth.
- Footer uses dedicated `--footer` / `--footer-foreground` tokens so it stays dark and readable in both themes. Never use `bg-foreground` for large surfaces.
- Preview overlays use `--overlay`, not `bg-foreground/…`, for the same reason.
