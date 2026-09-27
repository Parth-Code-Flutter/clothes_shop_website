export type CatalogCategory = {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  available: boolean;
};

/**
 * Transparent front-facing garment cut-out used by both try-on modes.
 * Anchor coordinates are fractions of the image size, measured on the image as
 * seen by the viewer (so `leftShoulder` is the wearer's right shoulder seam).
 */
export type TryOnGarment = {
  image: string;
  category: "tops" | "bottoms" | "one-pieces";
  leftShoulder: [number, number];
  rightShoulder: [number, number];
  /** Vertical position of the body hem, which lines up with the hips. */
  hemY: number;
};

export type CatalogProduct = {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  image: string;
  gallery: string[];
  alt: string;
  pricePaise: number;
  /** Optional compare-at price, shown struck through. */
  mrpPaise?: number;
  sizes: string[];
  sourceUrl: string;
  summary: string;
  rating: number;
  reviewCount: number;
  color: string;
  fit: string;
  fabric: string;
  pattern: string;
  occasion: string;
  care: string;
  details: string[];
  popularity: number;
  isNew: boolean;
  tryOn?: TryOnGarment;
};

export type ServiceItem = {
  id: string;
  title: string;
  body: string;
};

/** @deprecated Use CatalogProduct */
export type HomepageProduct = CatalogProduct;
