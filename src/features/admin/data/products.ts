import "server-only";
import { getAllCategories, getAllProducts } from "@/features/catalog/data";
import type { CatalogProduct } from "@/features/catalog/types";

/**
 * Admin view of the catalogue. Product details are the real storefront data;
 * SKU, stock and status are generated deterministically from each product id
 * until an inventory backend exists. Writes go through `productStore`.
 */

export type ProductStatus = "active" | "draft" | "archived";
export type StockState = "in" | "low" | "out";

export type AdminProduct = {
  id: string;
  slug: string;
  sku: string;
  name: string;
  categoryId: string;
  categoryName: string;
  status: ProductStatus;
  image: string;
  gallery: string[];
  alt: string;
  summary: string;
  details: string[];
  pricePaise: number;
  mrpPaise?: number;
  sizes: string[];
  stock: Record<string, number>;
  totalStock: number;
  stockState: StockState;
  color: string;
  fit: string;
  fabric: string;
  pattern: string;
  occasion: string;
  care: string;
  isNew: boolean;
  rating: number;
  reviewCount: number;
  popularity: number;
  updatedDaysAgo: number;
};

export const LOW_STOCK_THRESHOLD = 5;

const SKU_PREFIX: Record<string, string> = { "t-shirts": "TS", shirts: "SH", jeans: "JN", trousers: "TR" };

function hash(value: string) {
  let h = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    h ^= value.charCodeAt(index);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function sampleStock(product: CatalogProduct) {
  const soldOut = hash(`${product.id}:all`) % 15 === 0;
  return Object.fromEntries(
    product.sizes.map((size) => {
      if (soldOut) return [size, 0];
      const seed = hash(`${product.id}:${size}`);
      if (seed % 23 === 0) return [size, 0];
      if (seed % 13 === 0) return [size, 1 + (seed % LOW_STOCK_THRESHOLD)];
      return [size, 8 + (seed % 37)];
    }),
  ) as Record<string, number>;
}

export function stockStateOf(stock: Record<string, number>): StockState {
  const levels = Object.values(stock);
  if (levels.every((left) => left === 0)) return "out";
  return levels.some((left) => left <= LOW_STOCK_THRESHOLD) ? "low" : "in";
}

let cached: AdminProduct[] | null = null;

export function getAdminProducts(): AdminProduct[] {
  if (cached) return cached;
  const categories = new Map(getAllCategories().map((category) => [category.id, category.name]));
  const counters = new Map<string, number>();

  cached = getAllProducts().map((product) => {
    const next = (counters.get(product.categoryId) ?? 0) + 1;
    counters.set(product.categoryId, next);
    const stock = sampleStock(product);
    const totalStock = Object.values(stock).reduce((total, left) => total + left, 0);
    return {
      id: product.id,
      slug: product.slug,
      sku: `HB-${SKU_PREFIX[product.categoryId] ?? "XX"}-${String(next).padStart(3, "0")}`,
      name: product.name,
      categoryId: product.categoryId,
      categoryName: categories.get(product.categoryId) ?? product.categoryId,
      status: "active",
      image: product.image,
      gallery: product.gallery,
      alt: product.alt,
      summary: product.summary,
      details: product.details,
      pricePaise: product.pricePaise,
      mrpPaise: product.mrpPaise,
      sizes: product.sizes,
      stock,
      totalStock,
      stockState: stockStateOf(stock),
      color: product.color,
      fit: product.fit,
      fabric: product.fabric,
      pattern: product.pattern,
      occasion: product.occasion,
      care: product.care,
      isNew: product.isNew,
      rating: product.rating,
      reviewCount: product.reviewCount,
      popularity: product.popularity,
      updatedDaysAgo: hash(`${product.id}:updated`) % 21,
    };
  });
  return cached;
}

export function getAdminProduct(id: string) {
  return getAdminProducts().find((product) => product.id === id);
}

export function getProductCategories() {
  const products = getAdminProducts();
  return getAllCategories().map((category) => ({
    id: category.id,
    name: category.name,
    sizes: products.find((product) => product.categoryId === category.id)?.sizes ?? [],
  }));
}

/** Every size that is running low or sold out, for alerts and the dashboard. */
export function getLowStockSizes() {
  return getAdminProducts()
    .flatMap((product) =>
      Object.entries(product.stock)
        .filter(([, left]) => left <= LOW_STOCK_THRESHOLD)
        .map(([size, left]) => ({ id: product.id, name: product.name, image: product.image, size, left, popularity: product.popularity })),
    )
    .sort((a, b) => a.left - b.left || b.popularity - a.popularity);
}

/** Shape the edit form works with: money as rupee strings, stock as strings, highlights as lines. */
export function toProductFormValues(product?: AdminProduct) {
  const rupees = (paise?: number) => (paise ? String(paise / 100) : "");
  return {
    id: product?.id ?? null,
    name: product?.name ?? "",
    slug: product?.slug ?? "",
    sku: product?.sku ?? "",
    categoryId: product?.categoryId ?? "",
    status: product?.status ?? ("draft" as ProductStatus),
    summary: product?.summary ?? "",
    details: product?.details.join("\n") ?? "",
    alt: product?.alt ?? "",
    price: rupees(product?.pricePaise),
    mrp: rupees(product?.mrpPaise),
    stock: Object.fromEntries(Object.entries(product?.stock ?? {}).map(([size, left]) => [size, String(left)])),
    color: product?.color ?? "",
    fit: product?.fit ?? "",
    fabric: product?.fabric ?? "",
    pattern: product?.pattern ?? "",
    occasion: product?.occasion ?? "",
    care: product?.care ?? "",
    isNew: product?.isNew ?? true,
    gallery: product?.gallery ?? [],
  };
}

// Listing query --------------------------------------------------------------

export const PRODUCT_VIEWS = ["all", "low", "out", "offer", "new"] as const;
export type ProductView = (typeof PRODUCT_VIEWS)[number];

export const PRODUCT_SORTS = ["featured", "name", "price-asc", "price-desc", "stock-asc", "updated"] as const;
export type ProductSort = (typeof PRODUCT_SORTS)[number];

export type ProductQuery = { q: string; category: string; view: ProductView; sort: ProductSort; page: number };

export const PRODUCTS_PAGE_SIZE = 10;

type RawParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined) {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

export function parseProductQuery(params: RawParams): ProductQuery {
  const view = first(params.view) as ProductView;
  const sort = first(params.sort) as ProductSort;
  const page = Number.parseInt(first(params.page), 10);
  return {
    q: first(params.q).trim().slice(0, 80),
    category: first(params.category),
    view: PRODUCT_VIEWS.includes(view) ? view : "all",
    sort: PRODUCT_SORTS.includes(sort) ? sort : "featured",
    page: Number.isFinite(page) && page > 0 ? page : 1,
  };
}

const VIEW_FILTER: Record<ProductView, (product: AdminProduct) => boolean> = {
  all: () => true,
  low: (product) => product.stockState === "low",
  out: (product) => product.stockState === "out",
  offer: (product) => Boolean(product.mrpPaise && product.mrpPaise > product.pricePaise),
  new: (product) => product.isNew,
};

const SORTERS: Record<ProductSort, ((a: AdminProduct, b: AdminProduct) => number) | null> = {
  featured: null,
  name: (a, b) => a.name.localeCompare(b.name),
  "price-asc": (a, b) => a.pricePaise - b.pricePaise,
  "price-desc": (a, b) => b.pricePaise - a.pricePaise,
  "stock-asc": (a, b) => a.totalStock - b.totalStock,
  updated: (a, b) => a.updatedDaysAgo - b.updatedDaysAgo,
};

export function queryProducts(query: ProductQuery) {
  const needle = query.q.toLowerCase();
  const scoped = getAdminProducts().filter(
    (product) =>
      (!query.category || product.categoryId === query.category) &&
      (!needle || [product.name, product.sku, product.color, product.categoryName].some((field) => field.toLowerCase().includes(needle))),
  );

  const counts = Object.fromEntries(PRODUCT_VIEWS.map((view) => [view, scoped.filter(VIEW_FILTER[view]).length])) as Record<ProductView, number>;
  const filtered = scoped.filter(VIEW_FILTER[query.view]);
  const sorter = SORTERS[query.sort];
  const sorted = sorter ? [...filtered].sort(sorter) : filtered;

  const pageCount = Math.max(1, Math.ceil(sorted.length / PRODUCTS_PAGE_SIZE));
  const page = Math.min(query.page, pageCount);
  return {
    items: sorted.slice((page - 1) * PRODUCTS_PAGE_SIZE, page * PRODUCTS_PAGE_SIZE),
    total: sorted.length,
    page,
    pageCount,
    counts,
  };
}

// Writes ---------------------------------------------------------------------

export type ProductInput = Omit<
  AdminProduct,
  "id" | "categoryName" | "image" | "gallery" | "totalStock" | "stockState" | "rating" | "reviewCount" | "popularity" | "updatedDaysAgo"
>;

export type WriteResult = { persisted: boolean };

/**
 * The single place admin writes go through. The catalogue is a static module,
 * so these validate the call and report `persisted: false`; replace the bodies
 * with database calls and every screen starts saving.
 */
export const productStore = {
  async save(id: string | null, input: ProductInput): Promise<WriteResult> {
    void id;
    void input;
    return { persisted: false };
  },
  async setStatus(ids: string[], status: ProductStatus): Promise<WriteResult> {
    void ids;
    void status;
    return { persisted: false };
  },
  async remove(ids: string[]): Promise<WriteResult> {
    void ids;
    return { persisted: false };
  },
};
