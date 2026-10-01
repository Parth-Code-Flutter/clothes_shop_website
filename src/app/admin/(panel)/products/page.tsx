import type { Metadata } from "next";
import Link from "next/link";
import type { CSSProperties } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { requireAdmin } from "@/features/admin/auth/dal";
import {
  LOW_STOCK_THRESHOLD,
  PRODUCTS_PAGE_SIZE,
  getAdminProducts,
  getLowStockSizes,
  getProductCategories,
  parseProductQuery,
  queryProducts,
  type ProductView,
} from "@/features/admin/data/products";
import { ProductsFilters } from "@/features/admin/components/products/products-filters";
import { ProductsTable, type ProductRow } from "@/features/admin/components/products/products-table";
import { PageHeader, PageLink, TILE_CLASS, buttonClass } from "@/features/admin/components/ui";
import { formatMoney, formatNumber } from "@/features/admin/lib/format";
import { productsHref } from "@/features/admin/lib/products-url";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Products" };

const VIEW_LABELS: Record<ProductView, string> = {
  all: "All",
  low: "Low stock",
  out: "Out of stock",
  offer: "On offer",
  new: "New",
};

export default async function ProductsPage({ searchParams }: PageProps<"/admin/products">) {
  await requireAdmin();
  const query = parseProductQuery(await searchParams);
  const result = queryProducts(query);
  const categories = getProductCategories();
  const all = getAdminProducts();

  const units = all.reduce((total, product) => total + product.totalStock, 0);
  const stockValue = all.reduce((total, product) => total + product.totalStock * product.pricePaise, 0);
  const restock = getLowStockSizes().length;
  const stats = [
    { label: "Products", value: formatNumber(all.length), hint: `${categories.length} categories` },
    { label: "Units in stock", value: formatNumber(units), hint: "Across every size" },
    { label: "Stock value", value: formatMoney(stockValue, { compact: true }), hint: "At selling price" },
    { label: "Sizes to restock", value: formatNumber(restock), hint: `${LOW_STOCK_THRESHOLD} or fewer left`, alert: restock > 0 },
  ];

  const rows: ProductRow[] = result.items.map((product) => ({
    id: product.id,
    slug: product.slug,
    sku: product.sku,
    name: product.name,
    categoryName: product.categoryName,
    status: product.status,
    image: product.image,
    color: product.color,
    pricePaise: product.pricePaise,
    mrpPaise: product.mrpPaise,
    stock: product.stock,
    totalStock: product.totalStock,
    stockState: product.stockState,
    updatedDaysAgo: product.updatedDaysAgo,
  }));

  const filtered = Boolean(query.q || query.category || query.view !== "all");
  const from = result.total === 0 ? 0 : (result.page - 1) * PRODUCTS_PAGE_SIZE + 1;
  const to = Math.min(result.page * PRODUCTS_PAGE_SIZE, result.total);

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6">
      <PageHeader
        title="Products"
        description="Everything in your catalogue, with live stock for each size."
        actions={
          <Link href="/admin/products/new" className={buttonClass.primary}>
            <Plus className="size-4" strokeWidth={2} aria-hidden="true" />
            Add product
          </Link>
        }
      />

      <dl className={cn("adm-rise grid grid-cols-2 lg:grid-cols-4", TILE_CLASS)} style={{ "--adm-delay": "60ms" } as CSSProperties}>
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            className={cn(
              "px-5 py-4",
              index % 2 === 1 ? "border-l border-adm-line" : "",
              index >= 2 ? "border-t border-adm-line lg:border-t-0" : "",
              index === 2 ? "lg:border-l" : "",
            )}
          >
            <dt className="text-[12.5px] text-adm-ink-soft">{stat.label}</dt>
            <dd className={cn("mt-1 text-[22px] leading-tight font-semibold tracking-[-0.02em] tabular-nums", stat.alert && "text-adm-warning")}>{stat.value}</dd>
            <dd className="mt-0.5 text-[12px] text-adm-ink-faint">{stat.hint}</dd>
          </div>
        ))}
      </dl>

      <section className={cn("adm-rise overflow-hidden", TILE_CLASS)} style={{ "--adm-delay": "120ms" } as CSSProperties}>
        <nav aria-label="Quick filters" className="flex gap-1 overflow-x-auto border-b border-adm-line px-3 pt-2 sm:px-4">
          {(Object.keys(VIEW_LABELS) as ProductView[]).map((view) => {
            const active = query.view === view;
            return (
              <Link
                key={view}
                href={productsHref(query, { view })}
                scroll={false}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative inline-flex h-10 shrink-0 items-center gap-2 px-2.5 text-[13px] font-medium whitespace-nowrap transition-colors",
                  active ? "text-adm-ink" : "text-adm-ink-faint hover:text-adm-ink",
                )}
              >
                {VIEW_LABELS[view]}
                <span
                  className={cn(
                    "rounded-md px-1.5 py-px text-[11px] font-semibold tabular-nums",
                    active ? "bg-adm-accent-soft text-adm-accent" : "bg-adm-surface-muted text-adm-ink-faint",
                  )}
                >
                  {result.counts[view]}
                </span>
                <span aria-hidden="true" className={cn("absolute inset-x-1 -bottom-px h-0.5 rounded-full bg-adm-accent transition-opacity", active ? "opacity-100" : "opacity-0")} />
              </Link>
            );
          })}
        </nav>

        <div className="border-b border-adm-line px-3 py-3 sm:px-5">
          <ProductsFilters query={query} categories={categories} />
        </div>

        <ProductsTable
          products={rows}
          threshold={LOW_STOCK_THRESHOLD}
          emptyAction={
            filtered ? (
              <Link href="/admin/products" className={buttonClass.secondary}>
                Clear filters
              </Link>
            ) : null
          }
        />

        {result.total > 0 ? (
          <footer className="flex items-center justify-between gap-3 border-t border-adm-line px-4 py-3 text-[12.5px] text-adm-ink-faint sm:px-5">
            <p className="tabular-nums">
              Showing {from}–{to} of {result.total}
            </p>
            <div className="flex items-center gap-1">
              <PageLink href={result.page > 1 ? productsHref(query, { page: result.page - 1 }) : null} label="Previous page">
                <ChevronLeft className="size-4" strokeWidth={2} aria-hidden="true" />
              </PageLink>
              <span className="px-2 text-adm-ink-soft tabular-nums">
                {result.page} / {result.pageCount}
              </span>
              <PageLink href={result.page < result.pageCount ? productsHref(query, { page: result.page + 1 }) : null} label="Next page">
                <ChevronRight className="size-4" strokeWidth={2} aria-hidden="true" />
              </PageLink>
            </div>
          </footer>
        ) : null}
      </section>
    </div>
  );
}