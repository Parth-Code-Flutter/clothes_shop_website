import type { CatalogProduct } from "./types";

export type SortKey = "recommended" | "new" | "popular" | "discount" | "price-desc" | "price-asc" | "rating";
/** Inclusive bounds in paise. */
export type PriceRange = { min: number; max: number };

export type CatalogFilters = {
  sizes: string[];
  colors: string[];
  price: PriceRange | null;
  minDiscount: number;
  minRating: number;
};

export const emptyFilters: CatalogFilters = { sizes: [], colors: [], price: null, minDiscount: 0, minRating: 0 };

export const PRICE_STEP_PAISE = 5_000;

export function priceBounds(products: CatalogProduct[]): PriceRange {
  if (!products.length) return { min: 0, max: 0 };
  const prices = products.map((product) => product.pricePaise);
  return { min: Math.min(...prices), max: Math.max(...prices) };
}

/** Rounds a slider value to the nearest step, but lets the real lowest and highest prices stay reachable. */
export function snapPrice(paise: number, bounds: PriceRange) {
  if (paise - bounds.min < PRICE_STEP_PAISE / 2) return bounds.min;
  if (bounds.max - paise < PRICE_STEP_PAISE / 2) return bounds.max;
  return Math.round(paise / PRICE_STEP_PAISE) * PRICE_STEP_PAISE;
}

const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];

export function sizeOptions(products: CatalogProduct[]) {
  const rank = (size: string) => {
    const index = SIZE_ORDER.indexOf(size);
    if (index !== -1) return index;
    const waist = Number(size);
    return Number.isFinite(waist) ? 100 + waist : 1000;
  };
  return Array.from(new Set(products.flatMap((product) => product.sizes))).sort((a, b) => rank(a) - rank(b) || a.localeCompare(b));
}

export function colorOptions(products: CatalogProduct[]) {
  const counts = new Map<string, number>();
  for (const product of products) counts.set(product.color, (counts.get(product.color) ?? 0) + 1);
  return Array.from(counts, ([name, count]) => ({ name, count })).sort((a, b) => a.name.localeCompare(b.name));
}

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
    if (filters.price && (product.pricePaise < filters.price.min || product.pricePaise > filters.price.max)) return false;
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
  return filters.sizes.length + filters.colors.length + Number(Boolean(filters.price)) + Number(Boolean(filters.minDiscount)) + Number(Boolean(filters.minRating));
}
