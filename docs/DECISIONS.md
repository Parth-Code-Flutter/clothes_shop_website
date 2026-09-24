# Decisions

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
- Motion stack: **Lenis** (smooth scroll) + **GSAP / ScrollTrigger / @gsap/react** + selected **React Bits** (BlurText, Magnet, TiltedCard, ScrollReveal, ShinyText). Club GSAP SplitText is not used — free `SplitWords` instead. Reduced-motion disables Lenis and magnets/tilts.
- Header: floating glass island (Pinterest/Dribbble); transparent over home hero, solid after scroll. Hero: GSAP pin + scrub (scale, dual-slide crossfade, giant type, progress bar) for a premium premiere feel.
