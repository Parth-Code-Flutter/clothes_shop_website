"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, useMemo, useState } from "react";
import { ProductCard } from "@/components/shared/product-card";
import { getAllCategories } from "@/features/catalog/data";
import { searchCatalog } from "@/features/search/utils";

export function SearchView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get("q") ?? "";
  const [draft, setDraft] = useState(urlQuery);

  const results = useMemo(() => searchCatalog(urlQuery), [urlQuery]);
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

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-10">
      <p className="text-xs font-semibold tracking-[0.28em] text-accent uppercase">
        Search
      </p>
      <h1 className="mt-3 font-display text-5xl tracking-tight text-foreground sm:text-6xl">
        Find the fit
      </h1>
      <p className="mt-3 max-w-xl text-sm text-muted">
        Search the live local catalog — names, categories, and product notes.
      </p>

      <form
        onSubmit={onSubmit}
        className="mt-8 flex flex-col gap-3 sm:flex-row"
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
          placeholder="Try hulk, batman, tees…"
          autoComplete="off"
          className="h-14 flex-1 rounded-full border border-border bg-surface px-5 text-base text-foreground outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        />
        <button
          type="submit"
          className="inline-flex h-14 items-center justify-center rounded-full bg-accent px-8 text-sm font-semibold text-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Search
        </button>
      </form>

      <div className="mt-6 flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => commitQuery(category.name)}
            className="rounded-full border border-border px-4 py-2 text-xs font-semibold tracking-[0.14em] text-foreground uppercase focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            {category.name}
          </button>
        ))}
        <Link
          href="/shop"
          className="rounded-full border border-border px-4 py-2 text-xs font-semibold tracking-[0.14em] text-foreground uppercase focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Full shop
        </Link>
      </div>

      <p className="mt-8 text-sm text-muted">
        {results.length} {results.length === 1 ? "result" : "results"}
        {urlQuery.trim() ? ` for “${urlQuery.trim()}”` : ""}
      </p>

      {results.length === 0 ? (
        <div className="mt-10 rounded-3xl border border-dashed border-border px-6 py-16 text-center">
          <p className="font-display text-4xl tracking-wide text-foreground">
            No match
          </p>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted">
            Try another keyword, or open the shop for the full drop board.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {results.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
