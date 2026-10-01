"use server";

import { requireAdmin } from "@/features/admin/auth/dal";
import {
  getAdminProducts,
  getProductCategories,
  productStore,
  type ProductInput,
  type ProductStatus,
} from "@/features/admin/data/products";

export type ProductFormState = {
  status: "idle" | "saved" | "preview" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
  /** Changes on every submit so the form can re-show the notice. */
  at?: number;
};

const STATUSES: ProductStatus[] = ["active", "draft", "archived"];
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const PREVIEW_NOTE = "Saving switches on once the product database is connected.";

function toPaise(value: string) {
  const amount = Number(value.replace(/[₹,\s]/g, ""));
  return Number.isFinite(amount) ? Math.round(amount * 100) : Number.NaN;
}

export async function saveProductAction(_previous: ProductFormState, formData: FormData): Promise<ProductFormState> {
  await requireAdmin();

  const text = (key: string, max = 200) => String(formData.get(key) ?? "").trim().slice(0, max);
  const id = text("id") || null;
  const errors: Record<string, string> = {};

  const name = text("name", 120);
  if (!name) errors.name = "Give the product a name.";

  const slug = text("slug", 120).toLowerCase();
  if (!SLUG_PATTERN.test(slug)) errors.slug = "Use lowercase letters, numbers and single hyphens.";
  else if (getAdminProducts().some((product) => product.slug === slug && product.id !== id)) errors.slug = "Another product already uses this URL.";

  const category = getProductCategories().find((entry) => entry.id === text("categoryId"));
  if (!category) errors.categoryId = "Choose a category.";

  const status = text("status") as ProductStatus;
  if (!STATUSES.includes(status)) errors.status = "Choose a status.";

  const pricePaise = toPaise(text("price"));
  if (!Number.isFinite(pricePaise) || pricePaise <= 0) errors.price = "Enter a price above ₹0.";

  const mrpText = text("mrp");
  const mrpPaise = mrpText ? toPaise(mrpText) : undefined;
  if (mrpPaise !== undefined && (!Number.isFinite(mrpPaise) || mrpPaise <= pricePaise)) {
    errors.mrp = "Compare-at price must be higher than the selling price.";
  }

  const sku = text("sku", 40).toUpperCase();
  if (!sku) errors.sku = "Add a SKU so this item can be tracked.";
  else if (getAdminProducts().some((product) => product.sku === sku && product.id !== id)) errors.sku = "Another product already uses this SKU.";

  const stock: Record<string, number> = {};
  for (const size of category?.sizes ?? []) {
    const left = Number(text(`stock.${size}`) || "0");
    if (!Number.isInteger(left) || left < 0 || left > 99_999) errors.stock = "Stock must be a whole number, 0 or more.";
    else stock[size] = left;
  }

  const summary = text("summary", 600);
  if (!summary) errors.summary = "Add a short description for the product page.";

  if (Object.keys(errors).length > 0) {
    return { status: "error", message: "Fix the highlighted fields and save again.", fieldErrors: errors, at: Date.now() };
  }

  const input: ProductInput = {
    slug,
    sku,
    name,
    categoryId: category!.id,
    status,
    alt: text("alt") || name,
    summary,
    details: String(formData.get("details") ?? "")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .slice(0, 12),
    pricePaise,
    mrpPaise,
    sizes: category!.sizes,
    stock,
    color: text("color", 60),
    fit: text("fit", 60),
    fabric: text("fabric", 60),
    pattern: text("pattern", 60),
    occasion: text("occasion", 80),
    care: text("care", 300),
    isNew: formData.get("isNew") === "on",
  };

  const result = await productStore.save(id, input);
  return result.persisted
    ? { status: "saved", message: id ? "Product updated." : "Product created.", at: Date.now() }
    : { status: "preview", message: `Everything checks out. ${PREVIEW_NOTE}`, at: Date.now() };
}

export type BulkAction = "active" | "draft" | "archived" | "delete";

export async function bulkProductAction(ids: string[], action: BulkAction): Promise<{ persisted: boolean; message: string }> {
  await requireAdmin();
  const known = new Set(getAdminProducts().map((product) => product.id));
  const targets = ids.filter((id) => known.has(id)).slice(0, 200);
  if (targets.length === 0) return { persisted: false, message: "No products selected." };

  const result = action === "delete" ? await productStore.remove(targets) : await productStore.setStatus(targets, action);
  const label = targets.length === 1 ? "1 product" : `${targets.length} products`;
  const verb = action === "delete" ? "deleted" : action === "archived" ? "archived" : `set to ${action}`;
  return result.persisted
    ? { persisted: true, message: `${label} ${verb}.` }
    : { persisted: false, message: `${label} would be ${verb}. ${PREVIEW_NOTE}` };
}
