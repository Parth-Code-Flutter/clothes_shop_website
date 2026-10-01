import "server-only";
import { getOrders } from "@/features/admin/data/orders";
import { LOW_STOCK_THRESHOLD, getAdminProducts, type AdminProduct } from "@/features/admin/data/products";

/**
 * Stock per product and size, with 7-day sales from the orders so the owner
 * can see what will run out first. Stock edits go through `inventoryStore`.
 */

export type InventoryItem = Pick<AdminProduct, "id" | "name" | "sku" | "image" | "categoryId" | "categoryName" | "sizes" | "stock" | "totalStock" | "pricePaise"> & {
  sold7d: Record<string, number>;
  sold7dTotal: number;
  /** Days until the busiest size sells out at the current pace; null when nothing sold. */
  coverDays: number | null;
  lowSizes: number;
  outSizes: number;
};

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export function getInventory(now = new Date()): InventoryItem[] {
  const since = now.getTime() - WEEK_MS;
  const sold = new Map<string, number>();
  for (const order of getOrders(now)) {
    if (order.status === "cancelled" || new Date(order.placedAt).getTime() < since) continue;
    for (const item of order.items) sold.set(`${item.productId}:${item.size}`, (sold.get(`${item.productId}:${item.size}`) ?? 0) + item.quantity);
  }

  return getAdminProducts().map((product) => {
    const sold7d = Object.fromEntries(product.sizes.map((size) => [size, sold.get(`${product.id}:${size}`) ?? 0]));
    const covers = product.sizes
      .filter((size) => sold7d[size] > 0)
      .map((size) => (product.stock[size] ?? 0) / (sold7d[size] / 7));
    const levels = product.sizes.map((size) => product.stock[size] ?? 0);
    return {
      id: product.id,
      name: product.name,
      sku: product.sku,
      image: product.image,
      categoryId: product.categoryId,
      categoryName: product.categoryName,
      sizes: product.sizes,
      stock: product.stock,
      totalStock: product.totalStock,
      pricePaise: product.pricePaise,
      sold7d,
      sold7dTotal: Object.values(sold7d).reduce((total, units) => total + units, 0),
      coverDays: covers.length ? Math.floor(Math.min(...covers)) : null,
      lowSizes: levels.filter((left) => left > 0 && left <= LOW_STOCK_THRESHOLD).length,
      outSizes: levels.filter((left) => left === 0).length,
    };
  });
}

export function getInventoryStats(now = new Date()) {
  const items = getInventory(now);
  return {
    units: items.reduce((total, item) => total + item.totalStock, 0),
    valuePaise: items.reduce((total, item) => total + item.totalStock * item.pricePaise, 0),
    lowSizes: items.reduce((total, item) => total + item.lowSizes, 0),
    outSizes: items.reduce((total, item) => total + item.outSizes, 0),
    sold7d: items.reduce((total, item) => total + item.sold7dTotal, 0),
  };
}

// Listing query --------------------------------------------------------------

export const INVENTORY_VIEWS = ["all", "restock", "out", "healthy"] as const;
export type InventoryView = (typeof INVENTORY_VIEWS)[number];

export const INVENTORY_SORTS = ["attention", "cover", "sold", "stock-asc", "name"] as const;
export type InventorySort = (typeof INVENTORY_SORTS)[number];

export type InventoryQuery = { q: string; category: string; view: InventoryView; sort: InventorySort; page: number };

export const INVENTORY_PAGE_SIZE = 20;

const VIEW_FILTER: Record<InventoryView, (item: InventoryItem) => boolean> = {
  all: () => true,
  restock: (item) => item.lowSizes + item.outSizes > 0,
  out: (item) => item.outSizes > 0,
  healthy: (item) => item.lowSizes + item.outSizes === 0,
};

const cover = (item: InventoryItem) => item.coverDays ?? Number.POSITIVE_INFINITY;

const SORTERS: Record<InventorySort, (a: InventoryItem, b: InventoryItem) => number> = {
  attention: (a, b) => b.outSizes - a.outSizes || b.lowSizes - a.lowSizes || cover(a) - cover(b) || a.name.localeCompare(b.name),
  cover: (a, b) => cover(a) - cover(b) || a.totalStock - b.totalStock,
  sold: (a, b) => b.sold7dTotal - a.sold7dTotal || a.name.localeCompare(b.name),
  "stock-asc": (a, b) => a.totalStock - b.totalStock,
  name: (a, b) => a.name.localeCompare(b.name),
};

function first(value: string | string[] | undefined) {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

export function parseInventoryQuery(params: Record<string, string | string[] | undefined>): InventoryQuery {
  const view = first(params.view) as InventoryView;
  const sort = first(params.sort) as InventorySort;
  const page = Number.parseInt(first(params.page), 10);
  return {
    q: first(params.q).trim().slice(0, 80),
    category: first(params.category).slice(0, 40),
    view: INVENTORY_VIEWS.includes(view) ? view : "all",
    sort: INVENTORY_SORTS.includes(sort) ? sort : "attention",
    page: Number.isFinite(page) && page > 0 ? page : 1,
  };
}

export function filterInventory(query: Omit<InventoryQuery, "page">, now = new Date()) {
  const needle = query.q.toLowerCase();
  const scoped = getInventory(now).filter(
    (item) => (!query.category || item.categoryId === query.category) && (!needle || [item.name, item.sku].some((field) => field.toLowerCase().includes(needle))),
  );
  const counts = Object.fromEntries(INVENTORY_VIEWS.map((view) => [view, scoped.filter(VIEW_FILTER[view]).length])) as Record<InventoryView, number>;
  return { items: scoped.filter(VIEW_FILTER[query.view]).sort(SORTERS[query.sort]), counts };
}

export function queryInventory(query: InventoryQuery, now = new Date()) {
  const { items, counts } = filterInventory(query, now);
  const pageCount = Math.max(1, Math.ceil(items.length / INVENTORY_PAGE_SIZE));
  const page = Math.min(query.page, pageCount);
  return { items: items.slice((page - 1) * INVENTORY_PAGE_SIZE, page * INVENTORY_PAGE_SIZE), total: items.length, page, pageCount, counts };
}

// Writes ---------------------------------------------------------------------

export type StockChange = { productId: string; size: string; stock: number };

/**
 * The single place stock writes go through. Stock is sample data for now, so
 * this reports `persisted: false`; replace the body with a database call.
 */
export const inventoryStore = {
  async setStock(changes: StockChange[]): Promise<{ persisted: boolean }> {
    void changes;
    return { persisted: false };
  },
};
