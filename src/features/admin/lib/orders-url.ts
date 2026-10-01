import type { OrderQuery } from "@/features/admin/data/orders";

const DEFAULTS: OrderQuery = { q: "", view: "all", payment: "", sort: "newest", page: 1 };

/** Builds an orders list URL, leaving defaults out so links stay short. Filter changes reset the page. */
export function ordersHref(query: OrderQuery, patch: Partial<OrderQuery> = {}, base = "/admin/orders") {
  const next = { ...query, ...patch };
  if (!("page" in patch)) next.page = 1;
  const params = new URLSearchParams();
  for (const key of ["q", "view", "payment", "sort", "page"] as const) {
    if (next[key] !== DEFAULTS[key]) params.set(key, String(next[key]));
  }
  const search = params.toString();
  return search ? `${base}?${search}` : base;
}
