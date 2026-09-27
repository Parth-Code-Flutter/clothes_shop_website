"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, useMemo, useState } from "react";
import { productGridClass, ProductCard } from "@/components/shared/product-card";
import { catalogHasOffers, getAllCategories } from "@/features/catalog/data";
import { searchCatalog } from "@/features/search/utils";
import { emptyFilters, filterAndSortProducts, type SortKey } from "@/features/catalog/filtering";
import { SortSelect } from "@/features/shop/components/shop-listing";
import { cn } from "@/lib/utils";

export function SearchView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get("q") ?? "";
  const [draft, setDraft] = useState(urlQuery);
  const [sort, setSort] = useState<SortKey>("recommended");
  const [quickFilter, setQuickFilter] = useState<"all" | "under" | "rating" | "discount">("all");

  const results = useMemo(() => {
    const filters = { ...emptyFilters };
    if (quickFilter === "under") filters.price = ["under-1500"];
    if (quickFilter === "rating") filters.minRating = 4;
    if (quickFilter === "discount") filters.minDiscount = 20;
    return filterAndSortProducts(searchCatalog(urlQuery), filters, sort);
  }, [urlQuery, quickFilter, sort]);
  const categories = getAllCategories().filter((category) => category.available);
  const query = urlQuery.trim();

  function commitQuery(next: string) {
    const value = next.trim();
    setDraft(value);
    router.replace(value ? `/search?q=${encodeURIComponent(value)}` : "/search");
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    commitQuery(draft);
  }

  return (
    <div className="mx-auto max-w-[1280px] px-4 pt-5 pb-12 sm:px-6 lg:px-8">
      <form
        onSubmit={onSubmit}
        className="flex items-center gap-3 border border-border bg-background px-3 focus-within:border-foreground"
        role="search"
      >
        <label htmlFor="catalog-search" className="sr-only">
          Search products
        </label>
        <input
          id="catalog-search"
          key={urlQuery}
          defaultValue={urlQuery}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Search for graphic tees, shirts, denim…"
          autoComplete="off"
          className="h-11 min-w-0 flex-1 bg-transparent text-[14px] text-foreground outline-none placeholder:text-muted"
        />
        <button
          type="submit"
          className="inline-flex h-9 shrink-0 items-center px-2 text-[12px] font-semibold tracking-wide text-foreground uppercase focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          Search
        </button>
      </form>

      <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => commitQuery(category.name)}
            className={cn(
              "inline-flex h-8 shrink-0 items-center rounded-full border px-3 text-[12px] font-medium focus-visible:outline-2 focus-visible:outline-offset-4",
              query.toLowerCase() === category.name.toLowerCase()
                ? "border-foreground bg-foreground text-background"
                : "border-border text-muted hover:text-foreground",
            )}
          >
            {category.name}
          </button>
        ))}
        <Link
          href="/shop"
          className="inline-flex h-8 shrink-0 items-center px-2 text-[12px] font-medium text-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          Full shop
        </Link>
      </div>

      <div className="mt-6 flex flex-wrap items-end justify-between gap-4 border-b border-border pb-5">
        <div><p className="text-[10px] font-bold tracking-[.22em] text-accent uppercase">Discover</p><h1 className="mt-1 font-display text-4xl tracking-wide">
          {query ? `Results for “${query}”` : "Search the wardrobe"}
        </h1><p className="mt-1 text-[12px] text-muted">
          - {results.length} {results.length === 1 ? "item" : "items"}
        </p></div><SortSelect value={sort} onChange={setSort}/>
      </div>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" aria-label="Quick filters">
        {([['all', 'All results'], ['under', 'Under ₹1,500'], ['rating', 'Rated 4+'], ['discount', '20% off+']] as const).filter(([value]) => catalogHasOffers || value !== "discount").map(([value, label]) => <button key={value} onClick={() => setQuickFilter(value)} className={cn("h-9 shrink-0 rounded-full border px-4 text-[11px] font-semibold", quickFilter === value ? "border-foreground bg-foreground text-background" : "border-border text-muted hover:text-foreground")}>{label}</button>)}
        <Link href="/shop" className="inline-flex h-9 shrink-0 items-center px-3 text-[11px] font-semibold text-accent">Advanced filters →</Link>
      </div>

      {results.length === 0 ? (
        <div className="mt-8 border-t border-border pt-8">
          <p className="text-base font-semibold text-foreground">No products found</p>
          <p className="mt-1 max-w-md text-[13px] leading-6 text-muted">
            Try tees, shirts, denim, or trousers — or open the full shop.
          </p>
          <Link
            href="/shop"
            className="mt-4 inline-flex min-h-10 items-center text-[13px] font-semibold text-accent hover:underline focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            Browse all clothing
          </Link>
        </div>
      ) : (
        <div className={cn(productGridClass, "mt-4")}>
          {results.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
