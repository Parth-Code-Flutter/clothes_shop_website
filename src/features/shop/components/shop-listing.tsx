"use client";

import { ArrowUp, Check, ChevronDown, SlidersHorizontal, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSmoothScroll } from "@/components/motion/smooth-scroll";
import { productGridClass, ProductCard } from "@/components/shared/product-card";
import { catalogHasOffers, getAllCategories, getAllProducts, getProductsByCategory } from "@/features/catalog/data";
import { activeFilterCount, colorOptions, emptyFilters, filterAndSortProducts, priceBounds, SORT_OPTIONS, sizeOptions, snapPrice, type CatalogFilters, type PriceRange, type SortKey } from "@/features/catalog/filtering";
import type { CatalogProduct } from "@/features/catalog/types";
import { formatInrFromPaise } from "@/lib/money";
import { cn } from "@/lib/utils";
import styles from "./shop-listing.module.css";

export function ShopListing() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categories = getAllCategories();
  const requested = searchParams.get("category");
  const category = requested && categories.some((item) => item.id === requested) ? requested : "all";
  const selectedCategory = categories.find((item) => item.id === category);
  const feature = selectedCategory ? categories.indexOf(selectedCategory) + 1 : 0;
  const [sort, setSort] = useState<SortKey>("recommended");
  const [filters, setFilters] = useState<CatalogFilters>(emptyFilters);
  const [mobileFilters, setMobileFilters] = useState(false);
  const base = useMemo(() => category === "all" ? getAllProducts() : getProductsByCategory(category), [category]);
  const products = useMemo(() => filterAndSortProducts(base, filters, sort), [base, filters, sort]);
  const filterCount = activeFilterCount(filters);
  const { stop, start } = useSmoothScroll();
  const reels = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const row = reels.current;
    const active = row?.querySelector<HTMLElement>('[aria-pressed="true"]');
    if (row && active) row.scrollTo({ left: active.offsetLeft - row.offsetLeft - 16 });
  }, [category]);

  useEffect(() => {
    if (!mobileFilters) return;
    stop();
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") setMobileFilters(false); };
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("keydown", onKey); start(); };
  }, [mobileFilters, stop, start]);

  function selectCategory(id: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (id === "all") params.delete("category"); else params.set("category", id);
    const next = id === "all" ? getAllProducts() : getProductsByCategory(id);
    const sizes = new Set(sizeOptions(next));
    const colors = new Set(next.map((item) => item.color));
    // The price window is category-specific, so it resets; sizes and colours carry over only if the new category has them.
    setFilters((current) => ({ ...current, price: null, sizes: current.sizes.filter((size) => sizes.has(size)), colors: current.colors.filter((color) => colors.has(color)) }));
    router.replace(params.size ? `/shop?${params}` : "/shop", { scroll: false });
  }

  function backToTop() {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  }

  const panel = <FilterPanel categories={categories} category={category} onCategory={selectCategory} products={base} filters={filters} onFilters={setFilters}/>;

  return <div className="bg-background"><div className="mx-auto max-w-[1380px] px-4 pt-5 pb-14 sm:px-6 lg:px-8">
    <nav className="text-[11px] text-muted" aria-label="Breadcrumb"><Link href="/">Home</Link> <span className="px-1">/</span> <Link href="/shop">Clothing</Link>{selectedCategory ? <><span className="px-1">/</span><span className="font-semibold text-foreground">{selectedCategory.name}</span></> : null}</nav>
    <section aria-labelledby="shop-title" className={cn(styles.marquee, "mt-4")}>
      <span className={cn(styles.bulbs, styles.bulbsTop)} aria-hidden="true"/>
      <span className={cn(styles.bulbs, styles.bulbsBottom)} aria-hidden="true"/>
      <div className="flex items-center justify-between gap-6">
        <div className="min-w-0">
          <p className={styles.eyebrow}><b>●</b> Now showing · {feature ? `Feature ${String(feature).padStart(2, "0")}` : "Tonight’s full line-up"}</p>
          <h1 id="shop-title" className={styles.title}>{selectedCategory?.name ?? "All clothing"}</h1>
          <p className={styles.summary}>{selectedCategory?.description ?? "Graphic tees, shirts, denim, and trousers. The full cast, on screen now."}</p>
        </div>
        <p className={cn(styles.stub, "hidden sm:flex")}><small>Admit all</small><strong>{products.length}</strong><span>{products.length === 1 ? "title" : "titles"} on screen</span></p>
      </div>
      <div ref={reels} className={styles.reels} role="group" aria-label="Categories">
        {[{ id: "all", name: "All clothing" }, ...categories].map((item, index) => <button key={item.id} type="button" aria-pressed={category === item.id} onClick={() => selectCategory(item.id)} className={styles.reel}>{index ? <span>{String(index).padStart(2, "0")}</span> : null}{item.name}</button>)}
      </div>
    </section>
    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4"><p className="text-xs text-muted"><span className="font-semibold text-foreground">{products.length}</span> of {base.length} pieces</p><div className="flex gap-2"><button type="button" onClick={() => setMobileFilters(true)} className="inline-flex h-11 items-center gap-2 border border-border px-4 text-xs font-bold uppercase lg:hidden"><SlidersHorizontal size={15}/>Filters{filterCount ? <span className="rounded-full bg-foreground px-1.5 py-0.5 text-[9px] text-background">{filterCount}</span> : null}</button><SortSelect value={sort} onChange={setSort}/></div></div>
    <div className="mt-5 grid gap-8 lg:grid-cols-[230px_minmax(0,1fr)]"><aside className="hidden lg:block">{panel}</aside><main>{filterCount ? <div className="mb-4 flex flex-wrap items-center gap-2"><span className="text-[10px] font-bold tracking-[.16em] uppercase">Active filters</span><button type="button" onClick={() => setFilters(emptyFilters)} className="text-[11px] font-semibold text-accent underline underline-offset-4">Clear all ({filterCount})</button></div> : null}{products.length ? <><div className={cn(productGridClass, styles.cast)}>{products.map((product) => <ProductCard key={product.id} product={product}/>)}</div><div className={styles.wrap}><div><p>That&apos;s a <span>wrap.</span></p><small>You&apos;ve seen all {products.length} {products.length === 1 ? "title" : "titles"} in this showing</small></div><button type="button" onClick={backToTop}>Back to the opening <ArrowUp size={14} aria-hidden="true"/></button></div></> : <EmptyResults clear={() => setFilters(emptyFilters)}/>}</main></div>
  </div>{mobileFilters ? <div className="fixed inset-0 z-[80] bg-black/45 lg:hidden" onClick={() => setMobileFilters(false)}><div role="dialog" aria-modal="true" aria-label="Filters" className="absolute inset-y-0 right-0 flex w-[min(90vw,380px)] flex-col bg-background" onClick={(event) => event.stopPropagation()}><div className="flex items-center justify-between border-b border-border px-5 py-4"><p className="font-display text-3xl">Filters</p><div className="flex items-center gap-4">{filterCount ? <button type="button" onClick={() => setFilters(emptyFilters)} className="text-[11px] font-semibold text-accent underline underline-offset-4">Clear all</button> : null}<button type="button" onClick={() => setMobileFilters(false)} aria-label="Close filters"><X/></button></div></div><div className="flex-1 overflow-y-auto overscroll-contain px-5 pb-4" data-lenis-prevent>{panel}</div><div className="border-t border-border p-4"><button type="button" onClick={() => setMobileFilters(false)} className="h-12 w-full bg-accent text-xs font-bold tracking-wider text-white uppercase">Show {products.length} pieces</button></div></div></div> : null}</div>;
}

const sortOptions = SORT_OPTIONS.filter((item) => catalogHasOffers || item.value !== "discount");

export function SortSelect({ value, onChange }: { value: SortKey; onChange: (value: SortKey) => void }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const label = sortOptions.find((item) => item.value === value)?.label;

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false); };
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("pointerdown", onPointer); document.removeEventListener("keydown", onKey); };
  }, [open]);

  return <div ref={root} className="relative"><button type="button" aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen(!open)} className="inline-flex h-11 min-w-44 items-center justify-between gap-3 border border-border px-3 text-left text-xs"><span><span className="text-muted">Sort: </span>{label}</span><ChevronDown size={14} className={cn("transition-transform", open && "rotate-180")}/></button>{open ? <div role="listbox" className="absolute top-full right-0 z-40 mt-1 w-56 border border-border bg-background py-1 shadow-xl">{sortOptions.map((item) => <button key={item.value} type="button" role="option" aria-selected={item.value === value} onClick={() => { onChange(item.value); setOpen(false); }} className={cn("flex w-full items-center justify-between px-4 py-2.5 text-left text-xs hover:bg-surface", item.value === value && "font-bold")}><span>{item.label}</span>{item.value === value ? <Check size={14}/> : null}</button>)}</div> : null}</div>;
}

function FilterPanel({ categories, category, onCategory, products, filters, onFilters }: { categories: ReturnType<typeof getAllCategories>; category: string; onCategory: (id: string) => void; products: CatalogProduct[]; filters: CatalogFilters; onFilters: (value: CatalogFilters) => void }) {
  const colors = useMemo(() => colorOptions(products), [products]);
  const sizes = useMemo(() => sizeOptions(products), [products]);
  const toggle = (key: "sizes" | "colors", value: string) => onFilters({ ...filters, [key]: filters[key].includes(value) ? filters[key].filter((item) => item !== value) : [...filters[key], value] });
  return <div className="divide-y divide-border border-y border-border">
    <FilterGroup title="Categories">{[{ id: "all", name: "All clothing", count: getAllProducts().length }, ...categories.map((item) => ({ id: item.id, name: item.name, count: getProductsByCategory(item.id).length }))].map((item) => <RadioRow key={item.id} label={item.name} count={item.count} active={category === item.id} onClick={() => onCategory(item.id)}/>)}</FilterGroup>
    <FilterGroup title="Price"><PriceFilter products={products} value={filters.price} onChange={(price) => onFilters({ ...filters, price })}/></FilterGroup>
    <FilterGroup title="Size"><div className="grid grid-cols-4 gap-2">{sizes.map((size) => <button key={size} type="button" aria-pressed={filters.sizes.includes(size)} onClick={() => toggle("sizes", size)} className={cn("h-9 border text-[11px] transition-colors", filters.sizes.includes(size) ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground")}>{size}</button>)}</div></FilterGroup>
    <FilterGroup title="Colour"><div className="max-h-52 space-y-1 overflow-y-auto overscroll-contain pr-1 [scrollbar-width:thin]" data-lenis-prevent>{colors.map((color) => <CheckRow key={color.name} label={color.name} count={color.count} active={filters.colors.includes(color.name)} onClick={() => toggle("colors", color.name)}/>)}</div></FilterGroup>
    <FilterGroup title="Customer rating"><RadioRow label="4.5 and above" active={filters.minRating === 4.5} onClick={() => onFilters({ ...filters, minRating: filters.minRating === 4.5 ? 0 : 4.5 })}/><RadioRow label="4.0 and above" active={filters.minRating === 4} onClick={() => onFilters({ ...filters, minRating: filters.minRating === 4 ? 0 : 4 })}/></FilterGroup>
    {catalogHasOffers ? <FilterGroup title="Discount"><RadioRow label="20% and above" active={filters.minDiscount === 20} onClick={() => onFilters({ ...filters, minDiscount: filters.minDiscount === 20 ? 0 : 20 })}/><RadioRow label="10% and above" active={filters.minDiscount === 10} onClick={() => onFilters({ ...filters, minDiscount: filters.minDiscount === 10 ? 0 : 10 })}/></FilterGroup> : null}
  </div>;
}

const HISTOGRAM_BARS = 14;

function PriceFilter({ products, value, onChange }: { products: CatalogProduct[]; value: PriceRange | null; onChange: (value: PriceRange | null) => void }) {
  const bounds = useMemo(() => priceBounds(products), [products]);
  const span = bounds.max - bounds.min;
  const low = Math.min(Math.max(value?.min ?? bounds.min, bounds.min), bounds.max);
  const high = Math.max(Math.min(value?.max ?? bounds.max, bounds.max), low);
  const percent = (paise: number) => ((paise - bounds.min) / span) * 100;
  const bars = useMemo(() => {
    if (span <= 0) return [];
    const counts = Array<number>(HISTOGRAM_BARS).fill(0);
    for (const product of products) counts[Math.min(HISTOGRAM_BARS - 1, Math.floor(((product.pricePaise - bounds.min) / span) * HISTOGRAM_BARS))] += 1;
    const peak = Math.max(1, ...counts);
    return counts.map((count, index) => ({ count, height: count ? 18 + (count / peak) * 82 : 0, from: bounds.min + (span * index) / HISTOGRAM_BARS, to: bounds.min + (span * (index + 1)) / HISTOGRAM_BARS }));
  }, [products, bounds.min, span]);
  const matching = products.filter((product) => product.pricePaise >= low && product.pricePaise <= high).length;

  function commit(min: number, max: number) {
    onChange(min <= bounds.min && max >= bounds.max ? null : { min, max });
  }

  if (span <= 0) return <p className="text-xs text-muted">{products.length ? <>Every piece here is <span className="font-semibold text-foreground">{formatInrFromPaise(bounds.min)}</span>.</> : "No pieces to price."}</p>;

  return <div>
    <div className="mb-1 flex h-8 items-end gap-[3px] px-[9px]" aria-hidden>{bars.map((bar, index) => <span key={index} className={cn("flex-1 rounded-t-[1px] transition-colors duration-200", bar.to > low && bar.from <= high ? "bg-foreground/60" : "bg-border")} style={{ height: `${bar.height}%` }}/>)}</div>
    <div className="relative h-5">
      <span className="absolute inset-x-0 top-1/2 h-[2px] -translate-y-1/2 bg-border"/>
      <span className="absolute top-1/2 h-[2px] -translate-y-1/2 bg-accent" style={{ left: `calc(9px + (100% - 18px) * ${percent(low) / 100})`, right: `calc(9px + (100% - 18px) * ${1 - percent(high) / 100})` }}/>
      <input type="range" className="price-range" aria-label="Minimum price" aria-valuetext={formatInrFromPaise(low)} min={bounds.min} max={bounds.max} step={100} value={low} style={{ zIndex: low > bounds.min + span / 2 ? 3 : 2 }} onChange={(event) => commit(Math.min(snapPrice(Number(event.target.value), bounds), high), high)}/>
      <input type="range" className="price-range" aria-label="Maximum price" aria-valuetext={formatInrFromPaise(high)} min={bounds.min} max={bounds.max} step={100} value={high} style={{ zIndex: 2 }} onChange={(event) => commit(low, Math.max(snapPrice(Number(event.target.value), bounds), low))}/>
    </div>
    <div className="mt-2 flex items-center justify-between gap-2 text-xs"><span className="border border-border px-2 py-1 font-semibold tabular-nums">{formatInrFromPaise(low)}</span><span className="h-px flex-1 bg-border"/><span className="border border-border px-2 py-1 font-semibold tabular-nums">{formatInrFromPaise(high)}</span></div>
    <div className="mt-2 flex items-center justify-between text-[10px] text-muted"><span>{matching} {matching === 1 ? "piece" : "pieces"} in range</span>{value ? <button type="button" onClick={() => onChange(null)} className="font-semibold text-accent underline underline-offset-4">Reset</button> : null}</div>
  </div>;
}

function FilterGroup({ title, children }: { title: string; children: ReactNode }) { return <section className="py-4"><h2 className={cn(styles.groupTitle, "mb-3 text-[11px] font-bold tracking-[.14em] uppercase")}>{title}</h2><div className="space-y-1">{children}</div></section>; }
function RadioRow({ label, count, active, onClick }: { label: string; count?: number; active: boolean; onClick: () => void }) { return <button type="button" onClick={onClick} className="flex w-full items-center gap-2 py-1.5 text-left text-xs"><span className={cn("flex size-3.5 items-center justify-center rounded-full border", active ? "border-foreground" : "border-border")}>{active ? <span className="size-1.5 rounded-full bg-foreground"/> : null}</span><span className={cn("flex-1", active ? "font-semibold" : "text-muted")}>{label}</span>{count !== undefined ? <span className="text-[10px] text-muted">{count}</span> : null}</button>; }
function CheckRow({ label, count, active, onClick }: { label: string; count?: number; active: boolean; onClick: () => void }) { return <button type="button" role="checkbox" aria-checked={active} onClick={onClick} className="flex w-full items-center gap-2 py-1.5 text-left text-xs"><span className={cn("flex size-3.5 shrink-0 items-center justify-center border", active ? "border-foreground bg-foreground text-background" : "border-border")}>{active ? <Check size={10}/> : null}</span><span className={cn("flex-1", active ? "font-semibold" : "text-muted")}>{label}</span>{count !== undefined ? <span className="text-[10px] text-muted">{count}</span> : null}</button>; }
function EmptyResults({ clear }: { clear: () => void }) { return <div className="flex min-h-96 flex-col items-center justify-center border border-dashed border-border px-6 text-center"><p className="text-[10px] font-bold tracking-[.3em] text-accent uppercase">Scene still in the edit</p><p className="mt-2 font-display text-4xl">This showing is waiting for you.</p><p className="mt-2 max-w-sm text-sm text-muted">Loosen a filter to bring more of the cast on screen. Your next favourite piece is close by.</p><button type="button" onClick={clear} className="mt-5 text-xs font-bold text-accent underline underline-offset-4 uppercase">Clear filters</button></div>; }
