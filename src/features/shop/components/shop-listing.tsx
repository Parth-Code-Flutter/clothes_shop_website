"use client";

import { useMemo, useState } from "react";
import { ProductCard } from "@/components/shared/product-card";
import { getAllProducts } from "@/features/catalog/data";
import type { CatalogProduct } from "@/features/catalog/types";

type SortKey = "featured" | "name-asc" | "price-asc" | "price-desc";

function sortProducts(products: CatalogProduct[], sort: SortKey) {
  const next = [...products];
  switch (sort) {
    case "name-asc":
      return next.sort((a, b) => a.name.localeCompare(b.name));
    case "price-asc":
      return next.sort((a, b) => a.pricePaise - b.pricePaise);
    case "price-desc":
      return next.sort((a, b) => b.pricePaise - a.pricePaise);
    default:
      return next;
  }
}

export function ShopListing() {
  const [sort, setSort] = useState<SortKey>("featured");
  const products = useMemo(
    () => sortProducts(getAllProducts(), sort),
    [sort],
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-10">
      <div className="flex flex-col gap-6 border-b border-border pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-[0.28em] text-accent uppercase">
            Shop
          </p>
          <h1 className="mt-3 font-display text-5xl tracking-tight text-foreground sm:text-6xl">
            All tees
          </h1>
          <p className="mt-3 text-sm text-muted">
            {products.length} products · ₹650 each as listed on the live store
          </p>
        </div>
        <label className="flex flex-col gap-2 text-sm text-muted sm:items-end">
          <span className="tracking-[0.18em] uppercase">Sort</span>
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as SortKey)}
            className="h-11 min-w-48 rounded-full border border-border bg-surface px-4 text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <option value="featured">Featured</option>
            <option value="name-asc">Name A–Z</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
          </select>
        </label>
      </div>

      <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
