import type { CatalogProduct } from "./types";

export type SortKey = "recommended" | "new" | "popular" | "discount" | "price-desc" | "price-asc" | "rating";
export type PriceKey = "under-1500" | "1500-2499" | "2500-plus";

export type CatalogFilters = {
  sizes: string[];
  colors: string[];
  price: PriceKey[];
  minDiscount: number;
  minRating: number;
};

export const emptyFilters: CatalogFilters = { sizes: [], colors: [], price: [], minDiscount: 0, minRating: 0 };

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "recommended", label: "Recommended" },
  { value: "new", label: "What’s new" },
  { value: "popular", label: "Popularity" },
  { value: "discount", label: "Better discount" },
  { value: "price-desc", label: "Price · High to low" },
  { value: "price-asc", label: "Price · Low to high" },
  { value: "rating", label: "Customer rating" },
];

export function discountFor(product: CatalogProduct) {
  return product.mrpPaise && product.mrpPaise > product.pricePaise
    ? Math.round(((product.mrpPaise - product.pricePaise) / product.mrpPaise) * 100)
    : 0;
}

export function filterAndSortProducts(products: CatalogProduct[], filters: CatalogFilters, sort: SortKey) {
  const filtered = products.filter((product) => {
    if (filters.sizes.length && !filters.sizes.some((size) => product.sizes.includes(size))) return false;
    if (filters.colors.length && !filters.colors.includes(product.color)) return false;
    if (filters.minDiscount && discountFor(product) < filters.minDiscount) return false;
    if (filters.minRating && product.rating < filters.minRating) return false;
    if (filters.price.length) {
      const rupees = product.pricePaise / 100;
      const matches = filters.price.some((band) => band === "under-1500" ? rupees < 1500 : band === "1500-2499" ? rupees >= 1500 && rupees < 2500 : rupees >= 2500);
      if (!matches) return false;
    }
    return true;
  });
  return [...filtered].sort((a, b) => {
    if (sort === "new") return Number(b.isNew) - Number(a.isNew) || b.popularity - a.popularity;
    if (sort === "popular") return b.popularity - a.popularity;
    if (sort === "discount") return discountFor(b) - discountFor(a);
    if (sort === "price-desc") return b.pricePaise - a.pricePaise;
    if (sort === "price-asc") return a.pricePaise - b.pricePaise;
    if (sort === "rating") return b.rating - a.rating || b.reviewCount - a.reviewCount;
    return b.popularity + b.rating * 10 - (a.popularity + a.rating * 10);
  });
}

export function activeFilterCount(filters: CatalogFilters) {
  return filters.sizes.length + filters.colors.length + filters.price.length + Number(Boolean(filters.minDiscount)) + Number(Boolean(filters.minRating));
}
