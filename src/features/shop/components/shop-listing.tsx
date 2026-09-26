"use client";

import { Check, ChevronDown } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/shared/product-card";
import {
  getAllCategories,
  getAllProducts,
  getProductsByCategory,
} from "@/features/catalog/data";
import type { CatalogProduct } from "@/features/catalog/types";
import { cn } from "@/lib/utils";

type SortKey = "featured" | "name-asc" | "price-asc" | "price-desc";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "name-asc", label: "Name A–Z" },
  { value: "price-asc", label: "Price · Low to high" },
  { value: "price-desc", label: "Price · High to low" },
];

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
  const router = useRouter();
  const searchParams = useSearchParams();
  const categories = getAllCategories();
  const categoryFromUrl = searchParams.get("category");
  const activeCategory =
    categoryFromUrl && categories.some((category) => category.id === categoryFromUrl)
      ? categoryFromUrl
      : "all";

  const [sort, setSort] = useState<SortKey>("featured");
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  const selectedCategory =
    activeCategory === "all"
      ? null
      : (categories.find((category) => category.id === activeCategory) ?? null);

  const products = useMemo(() => {
    const base =
      activeCategory === "all" ? getAllProducts() : getProductsByCategory(activeCategory);
    return sortProducts(base, sort);
  }, [activeCategory, sort]);

  const sortLabel = SORT_OPTIONS.find((option) => option.value === sort)?.label ?? "Featured";

  useEffect(() => {
    if (!sortOpen) return;
    function onPointerDown(event: MouseEvent) {
      if (!sortRef.current?.contains(event.target as Node)) setSortOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setSortOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [sortOpen]);

  function selectCategory(id: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (id === "all") params.delete("category");
    else params.set("category", id);
    const query = params.toString();
    router.replace(query ? `/shop?${query}` : "/shop", { scroll: false });
  }

  return (
    <div className="bg-background">
      <div className="mx-auto max-w-[1440px] px-4 pt-10 sm:px-8 lg:px-10 lg:pt-14">
        <p className="text-[10px] font-semibold tracking-[0.28em] text-gold uppercase">
          The wardrobe
        </p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <h1 className="font-display text-5xl tracking-tight sm:text-6xl">
            {selectedCategory?.name ?? "All clothing"}
          </h1>
          <p className="max-w-sm text-sm leading-6 text-muted">
            {selectedCategory?.description ??
              "Shirts, tees, denim, trousers, and jackets. Sample prices for this edit."}
          </p>
        </div>

        <div className="mt-8 flex gap-2 overflow-x-auto pb-1">
          <FilterChip active={activeCategory === "all"} onClick={() => selectCategory("all")}>
            All
          </FilterChip>
          {categories.map((category) => (
            <FilterChip
              key={category.id}
              active={activeCategory === category.id}
              onClick={() => selectCategory(category.id)}
            >
              {category.name}
            </FilterChip>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between border-y border-border py-3">
          <p className="text-xs tracking-[0.12em] text-muted uppercase">
            {products.length} {products.length === 1 ? "piece" : "pieces"}
          </p>
          <div className="relative" ref={sortRef}>
            <button
              type="button"
              aria-haspopup="listbox"
              aria-expanded={sortOpen}
              onClick={() => setSortOpen((open) => !open)}
              className="inline-flex h-10 items-center gap-2 text-xs font-semibold tracking-[0.12em] uppercase focus-visible:outline-2 focus-visible:outline-offset-4"
            >
              {sortLabel}
              <ChevronDown size={14} className={cn(sortOpen && "rotate-180")} aria-hidden="true" />
            </button>
            {sortOpen ? (
              <ul
                role="listbox"
                aria-label="Sort products"
                className="absolute top-full right-0 z-30 mt-2 min-w-56 border border-border bg-background py-1 shadow-lg"
              >
                {SORT_OPTIONS.map((option) => {
                  const selected = option.value === sort;
                  return (
                    <li key={option.value} role="option" aria-selected={selected}>
                      <button
                        type="button"
                        onClick={() => {
                          setSort(option.value);
                          setSortOpen(false);
                        }}
                        className={cn(
                          "flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm hover:bg-foreground/[0.04]",
                          selected ? "font-semibold" : "text-muted",
                        )}
                      >
                        {option.label}
                        {selected ? <Check size={14} aria-hidden="true" /> : null}
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-10 py-10 sm:gap-x-6 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "true" : undefined}
      className={cn(
        "inline-flex h-10 shrink-0 items-center border px-4 text-[11px] font-semibold tracking-[0.14em] uppercase",
        active
          ? "border-foreground bg-foreground text-background"
          : "border-border text-foreground hover:border-foreground",
      )}
    >
      {children}
    </button>
  );
}
