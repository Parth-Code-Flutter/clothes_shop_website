import type { ProductQuery } from "@/features/admin/data/products";

const DEFAULTS: ProductQuery = { q: "", category: "", view: "all", sort: "featured", page: 1 };

/** Builds a products list URL, leaving defaults out so links stay short. Filter changes reset the page. */
export function productsHref(query: ProductQuery, patch: Partial<ProductQuery> = {}) {
  const next = { ...query, ...patch };
  if (!("page" in patch)) next.page = 1;
  const params = new URLSearchParams();
  for (const key of ["q", "category", "view", "sort", "page"] as const) {
    if (next[key] !== DEFAULTS[key]) params.set(key, String(next[key]));
  }
  const search = params.toString();
  return search ? `/admin/products?${search}` : "/admin/products";
}
