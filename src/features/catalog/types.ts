export type CatalogProduct = {
  id: string;
  name: string;
  slug: string;
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
