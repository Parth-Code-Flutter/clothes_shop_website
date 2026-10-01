import type { CustomerQuery } from "@/features/admin/data/customers";

const DEFAULTS: CustomerQuery = { q: "", view: "all", sort: "recent", page: 1 };

/** Builds a customers list URL, leaving defaults out so links stay short. Filter changes reset the page. */
export function customersHref(query: CustomerQuery, patch: Partial<CustomerQuery> = {}, base = "/admin/customers") {
  const next = { ...query, ...patch };
  if (!("page" in patch)) next.page = 1;
  const params = new URLSearchParams();
  for (const key of ["q", "view", "sort", "page"] as const) {
    if (next[key] !== DEFAULTS[key]) params.set(key, String(next[key]));
  }
  const search = params.toString();
  return search ? `${base}?${search}` : base;
}
