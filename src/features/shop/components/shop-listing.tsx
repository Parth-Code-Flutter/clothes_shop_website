"use client";

import { Check, ChevronDown, SlidersHorizontal, X } from "lucide-react";
import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { productGridClass, ProductCard } from "@/components/shared/product-card";
import { catalogHasOffers, getAllCategories, getAllProducts, getProductsByCategory } from "@/features/catalog/data";
import { activeFilterCount, emptyFilters, filterAndSortProducts, SORT_OPTIONS, type CatalogFilters, type PriceKey, type SortKey } from "@/features/catalog/filtering";
import { cn } from "@/lib/utils";

export function ShopListing() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categories = getAllCategories();
  const requested = searchParams.get("category");
  const category = requested && categories.some((item) => item.id === requested) ? requested : "all";
  const selectedCategory = categories.find((item) => item.id === category);
  const [sort, setSort] = useState<SortKey>("recommended");
  const [filters, setFilters] = useState<CatalogFilters>(emptyFilters);
  const [mobileFilters, setMobileFilters] = useState(false);
  const base = useMemo(() => category === "all" ? getAllProducts() : getProductsByCategory(category), [category]);
  const products = useMemo(() => filterAndSortProducts(base, filters, sort), [base, filters, sort]);
  const filterCount = activeFilterCount(filters);

  function selectCategory(id: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (id === "all") params.delete("category"); else params.set("category", id);
    router.replace(params.size ? `/shop?${params}` : "/shop", { scroll: false });
  }

  return <div className="bg-background"><div className="mx-auto max-w-[1380px] px-4 pt-5 pb-14 sm:px-6 lg:px-8">
    <nav className="text-[11px] text-muted" aria-label="Breadcrumb"><Link href="/">Home</Link> <span className="px-1">/</span> <Link href="/shop">Clothing</Link>{selectedCategory ? <><span className="px-1">/</span><span className="font-semibold text-foreground">{selectedCategory.name}</span></> : null}</nav>
    <div className="mt-4 flex flex-wrap items-end justify-between gap-4 border-b border-border pb-5"><div><p className="text-[10px] font-bold tracking-[.24em] text-accent uppercase">The wardrobe</p><h1 className="mt-1 font-display text-4xl tracking-wide sm:text-5xl">{selectedCategory?.name ?? "All clothing"}</h1><p className="mt-1 text-xs text-muted">{products.length} of {base.length} pieces</p></div><div className="flex gap-2"><button type="button" onClick={() => setMobileFilters(true)} className="inline-flex h-11 items-center gap-2 border border-border px-4 text-xs font-bold uppercase lg:hidden"><SlidersHorizontal size={15}/>Filters{filterCount ? <span className="rounded-full bg-foreground px-1.5 py-0.5 text-[9px] text-background">{filterCount}</span> : null}</button><SortSelect value={sort} onChange={setSort}/></div></div>
    <div className="mt-5 grid gap-8 lg:grid-cols-[230px_minmax(0,1fr)]"><aside className="hidden lg:block"><FilterPanel categories={categories} category={category} onCategory={selectCategory} filters={filters} onFilters={setFilters}/></aside><main>{filterCount ? <div className="mb-4 flex flex-wrap items-center gap-2"><span className="text-[10px] font-bold tracking-[.16em] uppercase">Active filters</span><button onClick={() => setFilters(emptyFilters)} className="text-[11px] font-semibold text-accent underline underline-offset-4">Clear all ({filterCount})</button></div> : null}{products.length ? <div className={productGridClass}>{products.map((product) => <ProductCard key={product.id} product={product}/>)}</div> : <EmptyResults clear={() => setFilters(emptyFilters)}/>}</main></div>
  </div>{mobileFilters ? <div className="fixed inset-0 z-[80] bg-black/45 lg:hidden" onClick={() => setMobileFilters(false)}><div className="absolute inset-y-0 right-0 w-[min(90vw,380px)] overflow-y-auto bg-background p-5" onClick={(event) => event.stopPropagation()}><div className="flex items-center justify-between border-b border-border pb-4"><p className="font-display text-3xl">Filters</p><button onClick={() => setMobileFilters(false)} aria-label="Close filters"><X/></button></div><div className="mt-4"><FilterPanel categories={categories} category={category} onCategory={selectCategory} filters={filters} onFilters={setFilters}/></div><button onClick={() => setMobileFilters(false)} className="sticky bottom-3 mt-6 h-12 w-full bg-accent text-xs font-bold tracking-wider text-white uppercase">Show {products.length} pieces</button></div></div> : null}</div>;
}

const sortOptions = SORT_OPTIONS.filter((item) => catalogHasOffers || item.value !== "discount");

export function SortSelect({ value, onChange }: { value: SortKey; onChange: (value: SortKey) => void }) {
  const [open, setOpen] = useState(false);
  const label = sortOptions.find((item) => item.value === value)?.label;
  return <div className="relative"><button onClick={() => setOpen(!open)} className="inline-flex h-11 min-w-44 items-center justify-between gap-3 border border-border px-3 text-left text-xs"><span><span className="text-muted">Sort: </span>{label}</span><ChevronDown size={14}/></button>{open ? <div className="absolute top-full right-0 z-40 mt-1 w-56 border border-border bg-background py-1 shadow-xl">{sortOptions.map((item) => <button key={item.value} onClick={() => { onChange(item.value); setOpen(false); }} className={cn("flex w-full items-center justify-between px-4 py-2.5 text-left text-xs hover:bg-surface", item.value === value && "font-bold")}><span>{item.label}</span>{item.value === value ? <Check size={14}/> : null}</button>)}</div> : null}</div>;
}

function FilterPanel({ categories, category, onCategory, filters, onFilters }: { categories: ReturnType<typeof getAllCategories>; category: string; onCategory: (id: string) => void; filters: CatalogFilters; onFilters: (value: CatalogFilters) => void }) {
  const colors = Array.from(new Set(getAllProducts().map((item) => item.color))).sort();
  const sizes = ["S", "M", "L", "XL", "30", "32", "34", "36"];
  const toggle = (key: "sizes" | "colors" | "price", value: string) => onFilters({ ...filters, [key]: filters[key].includes(value as never) ? filters[key].filter((item) => item !== value) : [...filters[key], value] });
  return <div className="divide-y divide-border border-y border-border"><FilterGroup title="Categories">{[{ id: "all", name: "All clothing", count: getAllProducts().length }, ...categories.map((item) => ({ id: item.id, name: item.name, count: getProductsByCategory(item.id).length }))].map((item) => <RadioRow key={item.id} label={item.name} count={item.count} active={category === item.id} onClick={() => onCategory(item.id)}/>)}</FilterGroup><FilterGroup title="Price"><CheckRow label="Under ₹1,500" active={filters.price.includes("under-1500")} onClick={() => toggle("price", "under-1500" satisfies PriceKey)}/><CheckRow label="₹1,500 – ₹2,499" active={filters.price.includes("1500-2499")} onClick={() => toggle("price", "1500-2499" satisfies PriceKey)}/><CheckRow label="₹2,500 and above" active={filters.price.includes("2500-plus")} onClick={() => toggle("price", "2500-plus" satisfies PriceKey)}/></FilterGroup><FilterGroup title="Size"><div className="grid grid-cols-4 gap-2">{sizes.map((size) => <button key={size} onClick={() => toggle("sizes", size)} className={cn("h-9 border text-[11px]", filters.sizes.includes(size) ? "border-foreground bg-foreground text-background" : "border-border")}>{size}</button>)}</div></FilterGroup><FilterGroup title="Colour"><div className="max-h-44 space-y-1 overflow-auto">{colors.map((color) => <CheckRow key={color} label={color} active={filters.colors.includes(color)} onClick={() => toggle("colors", color)}/>)}</div></FilterGroup><FilterGroup title="Customer rating"><RadioRow label="4.5 and above" active={filters.minRating === 4.5} onClick={() => onFilters({ ...filters, minRating: filters.minRating === 4.5 ? 0 : 4.5 })}/><RadioRow label="4.0 and above" active={filters.minRating === 4} onClick={() => onFilters({ ...filters, minRating: filters.minRating === 4 ? 0 : 4 })}/></FilterGroup>{catalogHasOffers ? <FilterGroup title="Discount"><RadioRow label="20% and above" active={filters.minDiscount === 20} onClick={() => onFilters({ ...filters, minDiscount: filters.minDiscount === 20 ? 0 : 20 })}/><RadioRow label="10% and above" active={filters.minDiscount === 10} onClick={() => onFilters({ ...filters, minDiscount: filters.minDiscount === 10 ? 0 : 10 })}/></FilterGroup> : null}</div>;
}

function FilterGroup({ title, children }: { title: string; children: ReactNode }) { return <section className="py-4"><h2 className="mb-3 text-[11px] font-bold tracking-[.14em] uppercase">{title}</h2><div className="space-y-1">{children}</div></section>; }
function RadioRow({ label, count, active, onClick }: { label: string; count?: number; active: boolean; onClick: () => void }) { return <button onClick={onClick} className="flex w-full items-center gap-2 py-1.5 text-left text-xs"><span className={cn("flex size-3.5 items-center justify-center rounded-full border", active ? "border-foreground" : "border-border")}>{active ? <span className="size-1.5 rounded-full bg-foreground"/> : null}</span><span className={cn("flex-1", active ? "font-semibold" : "text-muted")}>{label}</span>{count !== undefined ? <span className="text-[10px] text-muted">{count}</span> : null}</button>; }
function CheckRow({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) { return <button onClick={onClick} className="flex w-full items-center gap-2 py-1.5 text-left text-xs"><span className={cn("flex size-3.5 items-center justify-center border", active ? "border-foreground bg-foreground text-background" : "border-border")}>{active ? <Check size={10}/> : null}</span><span className={active ? "font-semibold" : "text-muted"}>{label}</span></button>; }
function EmptyResults({ clear }: { clear: () => void }) { return <div className="flex min-h-96 flex-col items-center justify-center border border-dashed border-border px-6 text-center"><p className="font-display text-4xl">No exact match.</p><p className="mt-2 max-w-sm text-sm text-muted">Try removing a filter. Your next favourite piece may be just outside this edit.</p><button onClick={clear} className="mt-5 text-xs font-bold text-accent underline underline-offset-4 uppercase">Clear filters</button></div>; }
