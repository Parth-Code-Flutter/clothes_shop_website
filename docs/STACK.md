# Stack

Checked 25 September 2026.

## Core

| Package | Version | Note |
|---|---|---|
| Node.js | 26.8.1 | Current line. Active LTS is 24.x. |
| Next.js | 16.3.6 | Latest stable. |
| React | 19.2.8 | Latest stable. |
| React DOM | 19.2.8 | Latest stable. |
| Tailwind CSS | 4.x | Latest stable. |
| TypeScript | 5.9.x | Matches Next.js 16 starter. |
| next-themes | 0.4.6 | Light / dark toggle. |
| motion | 13.x | Used by React Bits components (Framer Motion successor). |
| lucide-react | 1.x | Icons. |

App lives at the workspace root.

---

## Motion libraries (reuse elsewhere)

These three power homepage / shop / PDP motion in this project. Copy the install lines into any other Next.js + React app.

### 1. Lenis — smooth scroll

| | |
|---|---|
| **npm** | `lenis` **^1.3.26** |
| **Install** | `npm install lenis` |
| **Docs** | https://github.com/darkroomengineering/lenis |
| **React entry** | `import { ReactLenis } from "lenis/react"` |
| **CSS** | `import "lenis/dist/lenis.css"` |

**In this repo:** `src/components/motion/smooth-scroll.tsx` — wraps the app, syncs with GSAP ticker / ScrollTrigger. Use `data-lenis-prevent` on overflow panels (mobile menu). Disable when `prefers-reduced-motion`.

**Reuse tip:** Pair Lenis `raf` with `gsap.ticker` and call `ScrollTrigger.update` on Lenis `scroll` so scrubbed timelines stay smooth.

---

### 2. GSAP — timelines, ScrollTrigger, React hook

| | |
|---|---|
| **npm** | `gsap` **^3.15.0** + `@gsap/react` **^2.1.2** |
| **Install** | `npm install gsap @gsap/react` |
| **Docs** | https://gsap.com/docs/v3/ |
| **ScrollTrigger** | https://gsap.com/docs/v3/Plugins/ScrollTrigger/ |
| **React** | https://gsap.com/resources/React/ |

```ts
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);
```

**In this repo:**
- Hero pin/scrub — `src/features/home/components/home-hero.tsx`
- Mega menu open/close — `src/components/layout/header-mega-menu.tsx`
- Word split (free, no Club SplitText) — `src/components/motion/split-words.tsx`
- Listing reveals — `src/components/motion/reveal-on-scroll.tsx`

**Reuse tip:** Prefer `useGSAP` + `{ scope: ref }` so tweens clean up on unmount. Honor reduced motion with `matchMedia("(prefers-reduced-motion: reduce)")` and skip animation.

**License:** Standard “no charge” GSAP license for most sites — see https://gsap.com/standard-license. Club plugins (e.g. SplitText) are paid; this repo uses free `SplitWords` instead.

---

### 3. React Bits — ready-made motion UI pieces

| | |
|---|---|
| **Site** | https://www.reactbits.dev/ |
| **Install** | Not an npm package in this project — components are **copied** into `src/components/react-bits/` |
| **Depends on** | `motion` (`npm install motion`) and often `gsap` for scroll pieces |

**Vendored here:**

| Component | File | Role |
|---|---|---|
| BlurText | `BlurText.tsx` | Title blur-in by word/letter |
| Magnet | `Magnet.tsx` | Pointer magnetic pull on buttons/icons |
| TiltedCard | `TiltedCard.tsx` | 3D tilt media card |
| ScrollReveal | `ScrollReveal.tsx` | GSAP scroll text/line reveal |
| ShinyText | `ShinyText.tsx` | Shimmer label |

**Reuse tip:** From [reactbits.dev](https://www.reactbits.dev/), pick a component → copy TSX into your app → install peer deps (`motion`, sometimes `gsap`). Disable Magnet / Tilt when `useReducedMotion()` is true.

---

## Quick install (new project)

```bash
npm install lenis gsap @gsap/react motion
# Then copy React Bits components from reactbits.dev or from:
#   src/components/react-bits/
```

## Where they plug in here

| Concern | File |
|---|---|
| Lenis + GSAP bridge | `src/components/motion/smooth-scroll.tsx` |
| Free word reveal | `src/components/motion/split-words.tsx` |
| Grid/card reveals | `src/components/motion/reveal-on-scroll.tsx` |
| React Bits copies | `src/components/react-bits/*` |
