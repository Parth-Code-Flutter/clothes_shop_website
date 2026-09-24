# Paste this into Cursor

Read the attached `HOUSE_OF_BOLLYWOOD_CURSOR_BRIEF.md` and build **only a new homepage** for House of Bollywood. This revised scope supersedes earlier instructions to build a product-detail page or complete shopping demo first.

Design the UI and UX from scratch with a distinctive, modern, mobile-first fashion aesthetic. Use the current website only to identify the brand, actual products, content, and existing features. Do not copy its theme, layout, section styling, typography, or arrangement. Keep only business features already present on the site, plus the explicitly requested light/dark theme support described below; do not introduce other functionality.

Inspect the directory, then create the application inside a new `house-of-bollywood/` folder without changing unrelated files. Copy the brief to `docs/PROJECT_BRIEF.md`. Use Next.js App Router, React, TypeScript, Tailwind CSS, selected shadcn/ui primitives where useful, and Lucide icons. Choose compatible stable packages and save the lockfile.

Build the root homepage (`/`) with a fresh header/footer, working mobile menu, strong opening composition, redesigned existing product highlights and promotions, and suitable existing supporting sections. Existing testimonial/blog/brand content should appear only when verified and appropriate; document missing content instead of inventing it. Use warm white, near-black, and brand red as a starting direction, with expressive typography, clear hierarchy, strong imagery, and restrained motion.

Implement **both light and dark themes now**, with a working, accessible toggle in the desktop and mobile header. Use `next-themes` and semantic CSS variables. Default to the system preference until the visitor makes a choice, persist that choice across reloads, and prevent initial theme flashes and hydration mismatches. Style every homepage section, menu, form, button, and preview notice in both themes. Preserve actual product-image colors and ensure logo readability, contrast, and visible keyboard focus in each theme. This theme preference is the only persisted user state needed now.

Use local typed homepage data. The observed products are Hulk T-shirt, Spiderman T-shirt, Deadpool T-Shirt, Batman T-shirt Red, and Batman T-shirt Yellow, previously displayed at ₹650 each. Do not invent sizes, variants, stock, discounts, ratings, testimonials, or shipping promises. Record asset sources and missing materials.

Implement homepage interactions, including fully working theme switching, only. For actions leading to shop, product details, search, account, wishlist, cart, or checkout, show an accessible notice that the homepage is a preview and the action will be connected later. Do not create destination pages or send purchase actions to the live store. Newsletter preview must not transmit/store email addresses or pretend a subscription succeeded.

Do not implement product pages, size guides, new filters, cart state, checkout, tracking, authentication, backend integration, payment integration, or an admin dashboard. Do not scaffold these for later. Do not change the live site.

Verify mobile, tablet, and desktop layouts in both themes if browser tools are available. Check system default, manual switching, reload persistence, and initial rendering without theme flashes or hydration warnings. Run type, lint, and build checks, and report any checks you cannot perform. Maintain `docs/PROGRESS.md`, `docs/DECISIONS.md`, and `docs/ASSETS.md`.

Deliver the completed homepage with local run instructions, screenshots where available, changed-file summary, check results, and known limitations. **Then stop for homepage review. Do not continue to other pages until I explicitly request the next module.**
