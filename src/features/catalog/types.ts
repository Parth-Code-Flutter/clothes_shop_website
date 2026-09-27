export type CatalogCategory = {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  available: boolean;
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
};

export type ServiceItem = {
  id: string;
  title: string;
  body: string;
};

/** @deprecated Use CatalogProduct */
export type HomepageProduct = CatalogProduct;
