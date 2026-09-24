"use client";

import Image from "next/image";
import Link from "next/link";
import { Check, ChevronDown } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/shared/product-card";
import { RevealOnScroll } from "@/components/motion/reveal-on-scroll";
import { SplitWords } from "@/components/motion/split-words";
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
    categoryFromUrl && categories.some((c) => c.id === categoryFromUrl)
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
      activeCategory === "all"
        ? getAllProducts()
        : getProductsByCategory(activeCategory);
    return sortProducts(base, sort);
  }, [activeCategory, sort]);

  const heroProduct = products[0] ?? getAllProducts()[0];
  const sortLabel =
    SORT_OPTIONS.find((option) => option.value === sort)?.label ?? "Featured";

  useEffect(() => {
    if (!sortOpen) return;
    function onPointerDown(event: MouseEvent) {
      if (!sortRef.current?.contains(event.target as Node)) {
        setSortOpen(false);
      }
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

  const heading = selectedCategory ? selectedCategory.name : "The drop";
  const isComingSoon = Boolean(selectedCategory && !selectedCategory.available);

  return (
    <div className="bg-background">
      {/* Campaign strip — bridges white chrome + dark product photos */}
      <section className="relative isolate min-h-[42vh] overflow-hidden bg-[#0a0705] text-white sm:min-h-[48vh]">
        {heroProduct ? (
          <Image
            src={heroProduct.image}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-center opacity-55"
          />
        ) : null}
        <div
          className="absolute inset-0 bg-gradient-to-r from-black via-black/75 to-black/35"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40"
          aria-hidden="true"
        />

        <div className="relative mx-auto flex h-full min-h-[42vh] max-w-[1440px] flex-col justify-end px-4 py-10 sm:min-h-[48vh] sm:px-8 sm:py-14 lg:px-10">
          <div className="flex flex-wrap items-center gap-3 text-[10px] font-semibold tracking-[0.28em] uppercase">
            <span className="inline-flex items-center gap-2 text-white/70">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent/60 motion-reduce:animate-none" />
                <span className="relative size-2 rounded-full bg-accent" />
              </span>
              Live shelf
            </span>
            <span className="text-white/35" aria-hidden="true">
              ·
            </span>
            <span className="text-white/70">
              {isComingSoon
                ? "Coming soon"
                : `${products.length} ${products.length === 1 ? "piece" : "pieces"}`}
            </span>
          </div>

          <SplitWords
            as="h1"
            text={heading}
            immediate
            className="mt-4 max-w-4xl font-display text-[clamp(3.5rem,12vw,8.5rem)] leading-[0.86] tracking-tight text-white"
          />

          <p className="mt-4 max-w-lg text-sm leading-6 text-white/65 sm:text-base">
            {isComingSoon
              ? selectedCategory?.description
              : selectedCategory?.description ??
                "Oversized character boards from the house — shop the live graphic tee drop."}
          </p>
        </div>
      </section>

      <div className="mx-auto grid max-w-[1440px] gap-10 px-4 py-10 sm:px-8 sm:py-12 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-12 lg:px-10 lg:py-14">
        {/* Category rail */}
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <p className="text-[10px] font-semibold tracking-[0.24em] text-muted uppercase">
            Categories
          </p>
          <nav
            aria-label="Shop categories"
            className="mt-4 flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:gap-0 lg:overflow-visible lg:pb-0"
          >
            <CategoryButton
              active={activeCategory === "all"}
              onClick={() => selectCategory("all")}
              label="All"
              index="01"
            />
            {categories.map((category, i) => (
              <CategoryButton
                key={category.id}
                active={activeCategory === category.id}
                onClick={() => selectCategory(category.id)}
                label={category.name}
                index={String(i + 2).padStart(2, "0")}
                soon={!category.available}
              />
            ))}
          </nav>

          <Link
            href="/"
            className="mt-8 hidden text-[11px] font-semibold tracking-[0.16em] text-muted uppercase transition-colors hover:text-foreground lg:inline-flex"
          >
            ← Back home
          </Link>
        </aside>

        <div>
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5">
            <p className="text-[11px] font-semibold tracking-[0.18em] text-muted uppercase">
              {isComingSoon
                ? "Shelf locked"
                : `${products.length} look${products.length === 1 ? "" : "s"}`}
            </p>

            {!isComingSoon ? (
              <div className="relative" ref={sortRef}>
                <button
                  type="button"
                  aria-haspopup="listbox"
                  aria-expanded={sortOpen}
                  onClick={() => setSortOpen((open) => !open)}
                  className="inline-flex h-10 items-center gap-2 text-[11px] font-semibold tracking-[0.16em] text-foreground uppercase transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground"
                >
                  Sort · {sortLabel}
                  <ChevronDown
                    size={14}
                    className={cn(
                      "transition-transform",
                      sortOpen && "rotate-180",
                    )}
                    aria-hidden="true"
                  />
                </button>

                {sortOpen ? (
                  <ul
                    role="listbox"
                    aria-label="Sort products"
                    className="absolute top-full right-0 z-30 mt-2 min-w-56 overflow-hidden border border-border bg-background py-1 shadow-[0_18px_40px_rgba(19,6,3,0.12)]"
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
                              "flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm transition-colors hover:bg-foreground/[0.04] focus-visible:bg-foreground/[0.04] focus-visible:outline-none",
                              selected
                                ? "font-semibold text-foreground"
                                : "text-muted",
                            )}
                          >
                            {option.label}
                            {selected ? (
                              <Check size={14} className="text-accent" aria-hidden="true" />
                            ) : null}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                ) : null}
              </div>
            ) : null}
          </div>

          {isComingSoon ? (
            <RevealOnScroll className="mt-10 overflow-hidden">
              <div className="relative min-h-[360px] bg-[#0a0705] px-6 py-16 text-white sm:px-10 sm:py-20">
                <Image
                  src="/images/homepage/slide-1.png"
                  alt=""
                  fill
                  sizes="100vw"
                  className="object-cover opacity-40"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/30" />
                <div className="relative max-w-lg">
                  <p className="text-[10px] font-semibold tracking-[0.28em] text-accent uppercase">
                    Next drop
                  </p>
                  <p className="mt-4 font-display text-5xl tracking-wide sm:text-6xl">
                    {selectedCategory?.name} incoming
                  </p>
                  <p className="mt-4 text-sm leading-6 text-white/70">
                    This shelf stays empty until real stock is ready — no fake
                    products, no filler.
                  </p>
                  <button
                    type="button"
                    onClick={() => selectCategory("graphic-tees")}
                    className="mt-8 inline-flex h-12 items-center rounded-full bg-white px-6 text-[11px] font-semibold tracking-[0.16em] text-[#130603] uppercase transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    Shop graphic tees
                  </button>
                </div>
              </div>
            </RevealOnScroll>
          ) : (
            <div
              key={`${activeCategory}-${sort}`}
              className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3"
            >
              {products.map((product, index) => {
                const featured = index === 0 && sort === "featured";
                return (
                  <RevealOnScroll
                    key={product.id}
                    delay={Math.min(index * 0.06, 0.28)}
                    y={40}
                    className={cn(featured && "sm:col-span-2 sm:row-span-2")}
                  >
                    <ProductCard
                      product={product}
                      index={index}
                      featured={featured}
                    />
                  </RevealOnScroll>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CategoryButton({
  active,
  onClick,
  label,
  index,
  soon = false,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  index: string;
  soon?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "true" : undefined}
      className={cn(
        "group flex shrink-0 items-center gap-3 border px-4 py-3 text-left transition-colors lg:w-full lg:border-x-0 lg:border-t-0 lg:border-b lg:border-border lg:px-0 lg:py-4",
        active
          ? "border-foreground bg-foreground text-background lg:border-foreground lg:bg-transparent lg:text-foreground"
          : "border-border text-muted hover:border-foreground/40 hover:text-foreground lg:hover:border-border",
      )}
    >
      <span
        className={cn(
          "font-mono text-[10px] tracking-[0.14em]",
          active ? "text-background/60 lg:text-accent" : "text-muted/70",
        )}
      >
        {index}
      </span>
      <span className="text-[11px] font-semibold tracking-[0.16em] uppercase">
        {label}
      </span>
      {soon ? (
        <span
          className={cn(
            "ml-auto text-[9px] tracking-[0.14em] uppercase",
            active ? "text-background/50 lg:text-muted" : "text-muted/60",
          )}
        >
          Soon
        </span>
      ) : active ? (
        <span className="ml-auto hidden size-1.5 rounded-full bg-accent lg:block" />
      ) : null}
    </button>
  );
}
