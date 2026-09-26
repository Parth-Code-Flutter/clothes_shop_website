"use client";

import { Check, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { productGridClass, ProductCard } from "@/components/shared/product-card";
import {
  getAllCategories,
  getAllProducts,
  getProductsByCategory,
} from "@/features/catalog/data";
import type { CatalogProduct } from "@/features/catalog/types";
import { cn } from "@/lib/utils";

type SortKey = "featured" | "name-asc" | "price-asc" | "price-desc";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "featured", label: "Recommended" },
  { value: "name-asc", label: "Name · A–Z" },
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

/** Shop PLP — filters on the left, dense product grid on the right (Myntra-style browse). */
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

  const sortLabel = SORT_OPTIONS.find((option) => option.value === sort)?.label ?? "Recommended";

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
      <div className="mx-auto max-w-[1280px] px-4 pt-5 pb-12 sm:px-6 lg:px-8">
        <nav aria-label="Breadcrumb" className="text-[12px] text-muted">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link href="/" className="hover:text-foreground">
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href="/shop" className="hover:text-foreground">
                Clothing
              </Link>
            </li>
            {selectedCategory ? (
              <>
                <li aria-hidden="true">/</li>
                <li className="font-medium text-foreground">{selectedCategory.name}</li>
              </>
            ) : null}
          </ol>
        </nav>

        <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h1 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
            {selectedCategory?.name ?? "All clothing"}
          </h1>
          <p className="text-[13px] text-muted">
            - {products.length} {products.length === 1 ? "item" : "items"}
          </p>
        </div>

        {/* Mobile category chips */}
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1 lg:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <MobileChip active={activeCategory === "all"} onClick={() => selectCategory("all")}>
            All
          </MobileChip>
          {categories.map((category) => (
            <MobileChip
              key={category.id}
              active={activeCategory === category.id}
              onClick={() => selectCategory(category.id)}
            >
              {category.name}
            </MobileChip>
          ))}
        </div>

        <div className="mt-5 grid gap-6 lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-8">
          <aside className="hidden lg:block" aria-label="Filters">
            <p className="border-b border-border pb-3 text-[13px] font-bold tracking-wide text-foreground uppercase">
              Filters
            </p>
            <div className="border-b border-border py-4">
              <p className="text-[13px] font-bold text-foreground">Categories</p>
              <ul className="mt-3 space-y-1">
                <li>
                  <FilterOption
                    active={activeCategory === "all"}
                    onClick={() => selectCategory("all")}
                    count={getAllProducts().length}
                  >
                    All
                  </FilterOption>
                </li>
                {categories.map((category) => (
                  <li key={category.id}>
                    <FilterOption
                      active={activeCategory === category.id}
                      onClick={() => selectCategory(category.id)}
                      count={getProductsByCategory(category.id).length}
                    >
                      {category.name}
                    </FilterOption>
                  </li>
                ))}
              </ul>
            </div>
            {selectedCategory?.description ? (
              <p className="pt-4 text-[12px] leading-5 text-muted">{selectedCategory.description}</p>
            ) : (
              <p className="pt-4 text-[12px] leading-5 text-muted">
                Browse shirts, tees, denim, trousers, and jackets. Tap a piece to open it.
              </p>
            )}
          </aside>

          <div>
            <div className="flex items-center justify-between gap-3 border-b border-border pb-3">
              <p className="text-[12px] text-muted sm:text-[13px]">
                Showing {products.length}{" "}
                {selectedCategory ? selectedCategory.name.toLowerCase() : "pieces"}
              </p>
              <div className="relative" ref={sortRef}>
                <button
                  type="button"
                  aria-haspopup="listbox"
                  aria-expanded={sortOpen}
                  onClick={() => setSortOpen((open) => !open)}
                  className="inline-flex h-9 items-center gap-2 border border-border bg-background px-3 text-[12px] font-medium focus-visible:outline-2 focus-visible:outline-offset-4"
                >
                  <span className="text-muted">Sort by:</span>
                  <span>{sortLabel}</span>
                  <ChevronDown
                    size={14}
                    className={cn(sortOpen && "rotate-180")}
                    aria-hidden="true"
                  />
                </button>
                {sortOpen ? (
                  <ul
                    role="listbox"
                    aria-label="Sort products"
                    className="absolute top-full right-0 z-30 mt-1 min-w-52 border border-border bg-background py-1 shadow-sm"
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
                              "flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left text-[13px] hover:bg-foreground/[0.04]",
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

            <div className={cn(productGridClass, "mt-4")}>
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterOption({
  active,
  onClick,
  count,
  children,
}: {
  active: boolean;
  onClick: () => void;
  count: number;
  children: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "true" : undefined}
      className={cn(
        "flex w-full items-center justify-between gap-2 rounded-sm px-1 py-1.5 text-left text-[13px] focus-visible:outline-2 focus-visible:outline-offset-2",
        active ? "font-semibold text-foreground" : "text-muted hover:text-foreground",
      )}
    >
      <span className="flex items-center gap-2">
        <span
          className={cn(
            "inline-flex size-3.5 items-center justify-center rounded-full border",
            active ? "border-foreground bg-foreground" : "border-border",
          )}
          aria-hidden="true"
        >
          {active ? <span className="size-1.5 rounded-full bg-background" /> : null}
        </span>
        {children}
      </span>
      <span className="text-[11px] tabular-nums text-muted">{count}</span>
    </button>
  );
}

function MobileChip({
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
        "inline-flex h-9 shrink-0 items-center rounded-full border px-3.5 text-[12px] font-medium",
        active
          ? "border-foreground bg-foreground text-background"
          : "border-border text-foreground hover:border-foreground/40",
      )}
    >
      {children}
    </button>
  );
}
