# Jacket hero

## Current status

Front, side, and back portraits are RGBA cutouts (transparent backgrounds) so the scroll turn composites cleanly on the hero paper.


The homepage has a responsive campaign hero with an original generated front portrait. The scroll-controlled two-pose turn and lettering zoom are implemented but intentionally **disabled** until the matching rear portrait is available. This is not a completed animation deliverable yet.

No video was generated: ChatCut returned FEATURE_NOT_INCLUDED. The user then selected AI stills with a stylized front-to-back transition. The built-in image tool generated the front portrait, but the rear-view edit returned usage_limit_reached. No paid fallback was started and no unrelated retail photograph was substituted.

## Files

- src/features/home/components/home-hero.tsx: scoped GSAP scroll timeline and hero markup.
- src/features/home/components/home-hero.module.css: responsive composition, cinematic colors, reduced-motion layout, and static fallback.
- src/features/home/jacket-hero-media.ts: explicit asset configuration; back: null keeps the static fallback active.
- public/images/homepage/jacket-front.png: original generated portrait produced with the built-in image-generation tool. Campaign imagery, not a catalog product.

## Complete the visual sequence

1. Produce a matching rear portrait using the front portrait as the edit reference. Keep the same model, pose scale, camera framing, jacket and lighting. Use matching background treatment for both images.
2. Add it as public/images/homepage/jacket-back.png, and set back to /images/homepage/jacket-back.png in the configuration.
3. Align .jacketPrint to the actual shoulder-blade panel. Its DOM lettering reads HOUSE / OF / BOLLYWOOD. Adjust the figure transform origin to match the lettering center.
4. Visually test the entire timeline forward and backward at desktop and mobile widths, resized mid-scroll, in light/dark themes and reduced motion. The static fallback has been checked; the full animation cannot yet be visually verified without the rear asset.
5. Adjust turn timing or alignment from that evidence before claiming the animation finished.

## Animation intent

The hero sticks below the 72px/88px header. Scrolling fades the introduction, centers the subject, transitions between front and rear poses with perspective, holds the lettering, then zooms into it and fades into the page theme before the next section. This is a stylized still-image transition, not a filmed or 3D turn. Shopping and skip links stay outside animated copy. Reduced motion omits the extended scroll sequence.

No runtime dependencies were added. Existing GSAP, ScrollTrigger and Lenis are reused.

## Generation prompts

### Front portrait — generated

Use case: photorealistic-natural.
Asset type: transparent cutout portrait for a premium Indian men's streetwear website animated hero.
Create one full-height editorial studio fashion photograph of one adult Indian male model, age 24, lean athletic build, medium brown skin, short textured black hair, clean shaven, understated serious confident expression. He wears an oversized boxy black washed-cotton varsity bomber jacket with finely detailed seams, matte black zipper, slightly dropped shoulders, narrow oxblood piping along sleeves, ribbed cuffs and hem, plain black t-shirt underneath, loose charcoal wide-leg trousers. No logos or text on front. Both hands resting naturally inside front jacket pockets. Entire subject seen from crown to just below knees, straight front-facing stance, symmetrical straight-on camera at chest height, no perspective distortion, no tilt. Centered and occupying 92 percent of portrait height, generous margin around shoulders and sides. Premium fashion editorial, lifelike skin and richly tactile black fabric, soft warm studio key light from upper left, gentle red rim light at right edge; jacket must remain readable and not disappear into black. Completely transparent background with real alpha, no floor, no shadows outside subject, no props, no borders, no typography, no watermark. Sharp edges and no glow. This will be matched to an exact rear view later. Portrait 2:3 composition, high resolution.

### Matching back portrait — pending, generation blocked

Edit this exact fashion portrait into the matching straight-on REAR VIEW of the SAME adult man wearing the SAME black washed cotton bomber jacket with narrow oxblood-red sleeve piping and SAME charcoal trousers. Rotate the man 180 degrees so his back faces the camera fully and neither his face nor nose is visible. Both hands remain in the front jacket pockets, so from behind the elbows are relaxed slightly outward. Preserve his body proportions, exact head size, hair silhouette, crown height, clothing fit, jacket hem height, knees crop, camera scale, framing, lights and photo-realistic quality. The jacket back must have a broad completely plain uninterrupted black fabric panel, NO lettering or logos because real website text will be overlaid onto it. Output on a genuinely TRANSPARENT background with alpha, remove ALL studio backdrop and background glow and any floor; no black or checkerboard backdrop. Subject only, crisp cutout edges. Portrait 1024x1536.

