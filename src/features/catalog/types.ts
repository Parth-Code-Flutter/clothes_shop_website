export type CatalogCategory = {
  id: string;
  name: string;
  slug: string;
  description: string;
  /** When false, show the category in nav but mark it as coming soon. */
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
  sourceUrl: string;
  summary: string;
};

export type ServiceItem = {
  id: string;
  title: string;
  body: string;
};

/** @deprecated Use CatalogProduct */
export type HomepageProduct = CatalogProduct;
