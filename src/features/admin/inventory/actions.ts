"use server";

import { requireAdmin } from "@/features/admin/auth/dal";
import { inventoryStore, type StockChange } from "@/features/admin/data/inventory";
import { getAdminProducts } from "@/features/admin/data/products";

export type StockSaveResult = { ok: boolean; persisted: boolean; message: string };

const MAX_STOCK = 99_999;

export async function saveStockAction(changes: StockChange[]): Promise<StockSaveResult> {
  await requireAdmin();
  if (!Array.isArray(changes) || changes.length === 0) return { ok: false, persisted: false, message: "Nothing to save." };
  if (changes.length > 500) return { ok: false, persisted: false, message: "Save at most 500 sizes at a time." };

  const products = new Map(getAdminProducts().map((product) => [product.id, product]));
  const valid: StockChange[] = [];
  for (const change of changes) {
    const product = products.get(String(change?.productId));
    const stock = Number(change?.stock);
    if (!product || !product.sizes.includes(String(change.size))) return { ok: false, persisted: false, message: "One of the products or sizes no longer exists. Reload and try again." };
    if (!Number.isInteger(stock) || stock < 0 || stock > MAX_STOCK) return { ok: false, persisted: false, message: `Stock must be a whole number from 0 to ${MAX_STOCK.toLocaleString("en-IN")}.` };
    valid.push({ productId: product.id, size: String(change.size), stock });
  }

  const result = await inventoryStore.setStock(valid);
  const label = valid.length === 1 ? "1 size" : `${valid.length} sizes`;
  return result.persisted
    ? { ok: true, persisted: true, message: `Stock updated for ${label}.` }
    : { ok: true, persisted: false, message: `Stock for ${label} checks out (preview). Changes are saved once the inventory database is connected.` };
}
