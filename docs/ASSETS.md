# Assets

## Logo

- File: `public/brand/house-of-bollywood-logo.png`
- Source: given by the owner on 24 September 2026 as a JPEG. The light gray background was removed so the mark can sit on light and dark pages.
- Original file kept: `public/brand/house-of-bollywood-logo.jpg`
- Use: site logo, and the source of the color combination
- Size: 1024×341

Colors sampled from the mark on 24 September 2026:

| Role | Hex | Where it comes from |
|---|---|---|
| Brand red | `#ea1916` | Average of the red lettering |
| Gold | `#a78650` | Bright gold edge |
| Near-black | `#130603` | Outline |
| Cream | `#fbf7f2` | Warm white used with the light lettering |

These values are the light-theme accents in `src/app/globals.css`. Dark theme uses the same red family, gold, and near-black, adjusted so text stays readable.

## Product images

The owner's product photos (76 files, sent 27 September 2026 as WhatsApp exports) live in one place:

```
public/images/products/<category>/<product-id>/<view>.jpg
```

- `category` is `t-shirts`, `shirts`, `jeans`, or `trousers`.
- `product-id` matches the product `id` and URL slug in `src/features/catalog/data.ts`.
- `view` is `front`, `back`, `alt` (a second front angle), or `detail`. The first view listed in `data.ts` is the listing photo.

43 products, 73 images. Four files were exact duplicates and were left out. Photos of the same garment from different angles were grouped by matching the print, colour, and construction, since the file names carried only timestamps.

Preparation:

- Square 1024×1024 renders were extended to 3:4 (1024×1365) by repeating the top and bottom edge rows, so they fill the site's portrait frames without cropping the garment.
- One photo showing the acid-wash jeans front and back side by side was split into `acid-wash-panel-jeans/front.jpg` and `back.jpg`.
- 682×1024 portrait photos are used as sent.

To add a product: create its folder, drop the views in, and add a `piece({ id, categoryId, views: [...] })` entry to `data.ts`.

Groupings worth a second look from the owner: Monsters Blue Splatter (front and back prints differ), Dark Knight Brown, Bat Flight Mustard (kept separate from Batman Splatter Yellow), Bandana Paisley, Avengers Graffiti, and Teddy Bear Navy.

## Homepage imagery

| Local file | Remote source | Use |
|---|---|---|
| `public/images/homepage/slide-1.png` | `sli1.png` | Hero background |
| `public/images/homepage/slide-2.png` | `sli2.png` | Mid-page “Second act” look section |
| `public/images/homepage/artboard-1.png` | `Artboard-1.png` | Reserved |

## Intentionally omitted

- Theme-demo testimonials (`Felicity Q.`, `Stevin Josh.`, and similar)
- Generic blog article images from 2023
- Brand carousel placeholders until ownership is confirmed
- Shipping promises that conflict between dollars and rupees

## Virtual try-on garments

Transparent cut-outs of real products, made from their `front.jpg` with `scripts/try-on/cutout.mjs` (tolerance 45, wire radius 3):

- `public/images/try-on/venom-mustard-tee.png`
- `public/images/try-on/messi-10-ivory-tee.png`
- `public/images/try-on/deadpool-ivory-tee.png`
- `public/images/try-on/black-panther-ivory-tee.png`
- `public/images/try-on/spider-emblem-beige-tee.png`
- `public/images/try-on/bat-flight-mustard-tee.png`

They feed both the live overlay and the realistic-photo route (flattened on white). Shoulder and hem anchors are in `data.ts`. Other fronts were tried and left out: the purple Bring 'Em On tee cut out with ragged edges, and angled or hanger shots (shirts, jeans, trousers) do not give a clean front silhouette. A flat, straight-on photo on a plain backdrop is enough to add more.
