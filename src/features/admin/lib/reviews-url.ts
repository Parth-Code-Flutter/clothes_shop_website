import type { ReviewQuery } from "@/features/admin/data/reviews";

const DEFAULTS: ReviewQuery = { q: "", view: "all", rating: "", sort: "newest", page: 1 };

/** Builds a reviews list URL, leaving defaults out so links stay short. Filter changes reset the page. */
export function reviewsHref(query: ReviewQuery, patch: Partial<ReviewQuery> = {}) {
  const next = { ...query, ...patch };
  if (!("page" in patch)) next.page = 1;
  const params = new URLSearchParams();
  for (const key of ["q", "view", "rating", "sort", "page"] as const) {
    if (next[key] !== DEFAULTS[key]) params.set(key, String(next[key]));
  }
  const search = params.toString();
  return search ? `/admin/reviews?${search}` : "/admin/reviews";
}
