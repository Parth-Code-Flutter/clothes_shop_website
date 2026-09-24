"use client";

import { useMemo, useState } from "react";
import { ProductCard } from "@/components/shared/product-card";
import {
  getAllCategories,
  getAllProducts,
  getProductsByCategory,
} from "@/features/catalog/data";
import type { CatalogProduct } from "@/features/catalog/types";
import { cn } from "@/lib/utils";

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
  const categories = getAllCategories();
  const [categoryId, setCategoryId] = useState<string>("all");
  const [sort, setSort] = useState<SortKey>("featured");

  const selectedCategory =
    categoryId === "all"
      ? null
      : categories.find((category) => category.id === categoryId) ?? null;

  const products = useMemo(() => {
    const base =
      categoryId === "all"
        ? getAllProducts()
        : getProductsByCategory(categoryId);
    return sortProducts(base, sort);
  }, [categoryId, sort]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-10">
      <div className="flex flex-col gap-6 border-b border-border pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-[0.28em] text-accent uppercase">
            Shop
          </p>
          <h1 className="mt-3 font-display text-5xl tracking-tight text-foreground sm:text-6xl">
            The drop board
          </h1>
          <p className="mt-3 max-w-xl text-sm text-muted">
            Built for Gen Z closet rotation — graphic tees live now, more
            categories ready for the next drop.
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

      <div className="mt-8 flex gap-2 overflow-x-auto pb-2">
        <button
          type="button"
          onClick={() => setCategoryId("all")}
          className={cn(
            "shrink-0 rounded-full px-4 py-2 text-sm font-semibold tracking-wide focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
            categoryId === "all"
              ? "bg-accent text-accent-foreground"
              : "border border-border text-foreground",
          )}
        >
          All
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => setCategoryId(category.id)}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-sm font-semibold tracking-wide focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
              categoryId === category.id
                ? "bg-accent text-accent-foreground"
                : "border border-border text-foreground",
            )}
          >
            {category.name}
            {!category.available ? (
              <span className="ml-2 text-[10px] tracking-[0.14em] uppercase opacity-70">
                Soon
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {selectedCategory && !selectedCategory.available ? (
        <div className="mt-10 rounded-3xl border border-dashed border-border px-6 py-16 text-center">
          <p className="font-display text-4xl tracking-wide text-foreground">
            {selectedCategory.name} incoming
          </p>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted">
            {selectedCategory.description} We are not inventing products here —
            this shelf lights up when real stock is ready.
          </p>
        </div>
      ) : (
        <>
          <p className="mt-8 text-sm text-muted">
            {products.length} {products.length === 1 ? "piece" : "pieces"}
            {selectedCategory ? ` in ${selectedCategory.name}` : ""}
          </p>
          <div className="mt-6 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
