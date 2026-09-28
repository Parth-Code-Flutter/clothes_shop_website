"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Search } from "lucide-react";
import { type FormEvent, useMemo, useState } from "react";
import { ProductCard } from "@/components/shared/product-card";
import { productGridClass } from "@/components/shared/product-grid";
import { catalogHasOffers, getAllCategories, getAllProducts, getProductsByCategory } from "@/features/catalog/data";
import { searchCatalog } from "@/features/search/utils";
import { emptyFilters, filterAndSortProducts, type SortKey } from "@/features/catalog/filtering";
import { SortSelect } from "@/features/shop/components/shop-listing";
import shopStyles from "@/features/shop/components/shop-listing.module.css";
import { cn } from "@/lib/utils";
import styles from "./search-view.module.css";

type QuickFilter = "all" | "under" | "rating" | "discount";

const quickFilters = ([
  ["all", "All results"],
  ["under", "Under ₹1,500"],
  ["rating", "Rated 4+"],
  ["discount", "20% off+"],
] as const).filter(([value]) => catalogHasOffers || value !== "discount");

export function SearchView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get("q") ?? "";
  const [draft, setDraft] = useState(urlQuery);
  const [sort, setSort] = useState<SortKey>("recommended");
  const [quickFilter, setQuickFilter] = useState<QuickFilter>("all");
  const query = urlQuery.trim();

  const results = useMemo(() => {
    const filters = { ...emptyFilters };
    if (quickFilter === "under") filters.price = { min: 0, max: 149_999 };
    if (quickFilter === "rating") filters.minRating = 4;
    if (quickFilter === "discount") filters.minDiscount = 20;
    return filterAndSortProducts(searchCatalog(urlQuery), filters, sort);
  }, [urlQuery, quickFilter, sort]);
  const popular = useMemo(() => [...getAllProducts()].sort((a, b) => b.popularity - a.popularity).slice(0, 5), []);
  const categories = getAllCategories().filter((category) => category.available);

  function commitQuery(next: string) {
    const value = next.trim();
    setDraft(value);
    router.replace(value ? `/search?q=${encodeURIComponent(value)}` : "/search");
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    commitQuery(draft);
  }

  const categoryTickets = (
    <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {categories.map((category) => (
        <button
          key={category.id}
          type="button"
          onClick={() => commitQuery(category.name)}
          aria-pressed={query.toLowerCase() === category.name.toLowerCase()}
          className={cn(styles.chip, "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent")}
        >
          {category.name}
          <small>{getProductsByCategory(category.id).length}</small>
        </button>
      ))}
    </div>
  );

  return (
    <div className="mx-auto w-full max-w-[1380px] px-4 pt-6 pb-16 sm:px-6 lg:px-8">
      <form onSubmit={onSubmit} role="search" className={styles.counter}>
        <label htmlFor="catalog-search" className={styles.counterLabel}>
          Box office · Search
        </label>
        <div className="mt-1 flex items-center gap-3">
          <Search className="size-5 shrink-0 text-muted" aria-hidden="true" />
          <input
            id="catalog-search"
            type="search"
            key={urlQuery}
            defaultValue={urlQuery}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Search tonight's programme — tees, shirts, denim…"
            autoComplete="off"
            className={cn(styles.counterInput, "h-12 min-w-0 flex-1 bg-transparent text-foreground outline-none placeholder:text-muted")}
          />
          <button type="submit" className={cn(styles.admit, "shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent")}>
            Search
          </button>
        </div>
      </form>

      <div className="mt-4">{categoryTickets}</div>

      <div className="mt-8 flex flex-wrap items-end justify-between gap-4 border-b border-border pb-4">
        <div>
          <p className={styles.eyebrow}>{query ? "Now showing" : "Discover"}</p>
          <h1 className="mt-2 font-display text-4xl leading-none tracking-wide uppercase sm:text-5xl">
            {query ? <>Results for &ldquo;{query}&rdquo;</> : "Search the wardrobe"}
          </h1>
          <p className="mt-2 text-xs text-muted">
            {query ? (
              <><span className="font-semibold text-foreground">{results.length}</span> {results.length === 1 ? "piece" : "pieces"}</>
            ) : (
              "Type a piece, colour or fabric, or pick a category above."
            )}
          </p>
        </div>
        {query && results.length > 0 ? <SortSelect value={sort} onChange={setSort} /> : null}
      </div>

      {query ? (
        <>
          {results.length > 0 || quickFilter !== "all" ? (
            <div className="mt-4 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" aria-label="Quick filters">
              {quickFilters.map(([value, label]) => (
                <button key={value} type="button" aria-pressed={quickFilter === value} onClick={() => setQuickFilter(value)} className={cn(styles.quick, "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent")}>
                  {label}
                </button>
              ))}
              <Link href="/shop" className="inline-flex h-8 shrink-0 items-center gap-1.5 px-3 text-[11px] font-semibold text-accent hover:underline">
                Advanced filters <ArrowRight size={13} aria-hidden="true" />
              </Link>
            </div>
          ) : null}

          {results.length === 0 ? (
            <div className={cn(styles.houseFullWrap, "mt-10 max-w-3xl")}>
              <div className={styles.houseFull}>
                <p className={styles.houseFullStub}>
                  <span>House<br />full</span>
                  <small>No seats left</small>
                </p>
                <div className={styles.houseFullBody}>
                  <p className="font-display text-3xl leading-none tracking-wide uppercase">Nothing showing for &ldquo;{query}&rdquo;</p>
                  <p className="mt-3 max-w-md text-sm leading-6 text-muted">
                    {quickFilter === "all"
                      ? "Try a shorter word, or pick one of tonight's categories."
                      : "The quick filter may be too narrow. Show all results, or pick a category."}
                  </p>
                  {quickFilter !== "all" ? (
                    <button type="button" onClick={() => setQuickFilter("all")} className="mt-4 text-xs font-bold tracking-[.12em] text-accent uppercase underline underline-offset-4">
                      Show all results
                    </button>
                  ) : null}
                  <div className="mt-5">{categoryTickets}</div>
                  <Link href="/shop" className="mt-5 inline-flex min-h-10 items-center gap-2 text-xs font-bold tracking-[.12em] uppercase hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent">
                    Browse all clothing <ArrowRight size={14} aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className={cn(productGridClass, shopStyles.cast, "mt-8 gap-y-14 sm:gap-y-16")}>
              {results.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} variant="cinema" />
              ))}
            </div>
          )}
        </>
      ) : (
        <section className="mt-8" aria-labelledby="popular-tonight">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="popular-tonight" className={styles.sectionTitle}>Popular tonight</h2>
            <Link href="/shop" className="inline-flex min-h-10 items-center gap-2 text-xs font-bold tracking-[.12em] uppercase hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent">
              See the full programme <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>
          <div className={cn(productGridClass, shopStyles.cast, "mt-6 gap-y-14 sm:gap-y-16")}>
            {popular.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} variant="cinema" />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
