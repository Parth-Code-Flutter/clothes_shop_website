import type { InventoryQuery } from "@/features/admin/data/inventory";

const DEFAULTS: InventoryQuery = { q: "", category: "", view: "all", sort: "attention", page: 1 };

/** Builds an inventory URL, leaving defaults out so links stay short. Filter changes reset the page. */
export function inventoryHref(query: InventoryQuery, patch: Partial<InventoryQuery> = {}, base = "/admin/inventory") {
  const next = { ...query, ...patch };
  if (!("page" in patch)) next.page = 1;
  const params = new URLSearchParams();
  for (const key of ["q", "category", "view", "sort", "page"] as const) {
    if (next[key] !== DEFAULTS[key]) params.set(key, String(next[key]));
  }
  const search = params.toString();
  return search ? `${base}?${search}` : base;
}
