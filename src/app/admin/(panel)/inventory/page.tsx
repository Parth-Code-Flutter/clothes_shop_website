import type { Metadata } from "next";
import Link from "next/link";
import type { CSSProperties } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { requireAdmin } from "@/features/admin/auth/dal";
import { INVENTORY_PAGE_SIZE, getInventoryStats, parseInventoryQuery, queryInventory, type InventoryView } from "@/features/admin/data/inventory";
import { LOW_STOCK_THRESHOLD, getProductCategories } from "@/features/admin/data/products";
import { InventoryFilters } from "@/features/admin/components/inventory/inventory-filters";
import { InventoryTable, type InventoryRow } from "@/features/admin/components/inventory/inventory-table";
import { PageHeader, PageLink, TILE_CLASS, buttonClass } from "@/features/admin/components/ui";
import { formatMoney, formatNumber } from "@/features/admin/lib/format";
import { inventoryHref } from "@/features/admin/lib/inventory-url";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Inventory" };

const VIEW_LABELS: Record<InventoryView, string> = {
  all: "All products",
  restock: "Needs restock",
  out: "Has sold-out sizes",
  healthy: "Healthy",
};

export default async function InventoryPage({ searchParams }: PageProps<"/admin/inventory">) {
  await requireAdmin();
  const now = new Date();
  const query = parseInventoryQuery(await searchParams);
  const result = queryInventory(query, now);
  const stats = getInventoryStats(now);
  const categories = getProductCategories();

  const tiles = [
    { label: "Units in stock", value: formatNumber(stats.units), hint: `${formatNumber(stats.sold7d)} sold in the last 7 days` },
    { label: "Stock value", value: formatMoney(stats.valuePaise, { compact: true }), hint: "At selling price" },
    { label: "Sizes running low", value: formatNumber(stats.lowSizes), hint: `${LOW_STOCK_THRESHOLD} or fewer left`, tone: stats.lowSizes ? "text-adm-warning" : "", href: inventoryHref(query, { view: "restock" }) },
    { label: "Sizes sold out", value: formatNumber(stats.outSizes), hint: "Customers can't order these", tone: stats.outSizes ? "text-adm-danger" : "", href: inventoryHref(query, { view: "out" }) },
  ];

  const rows: InventoryRow[] = result.items.map((item) => ({
    id: item.id,
    name: item.name,
    sku: item.sku,
    image: item.image,
    categoryName: item.categoryName,
    sizes: item.sizes,
    stock: item.stock,
    sold7d: item.sold7d,
    sold7dTotal: item.sold7dTotal,
    coverDays: item.coverDays,
  }));

  const filtered = Boolean(query.q || query.category || query.view !== "all");
  const from = result.total === 0 ? 0 : (result.page - 1) * INVENTORY_PAGE_SIZE + 1;
  const to = Math.min(result.page * INVENTORY_PAGE_SIZE, result.total);

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6">
      <PageHeader title="Inventory" description="Stock for every size. Type a new count and save; red sizes are sold out, amber ones are running low." />

      <dl className={cn("adm-rise grid grid-cols-2 lg:grid-cols-4", TILE_CLASS)} style={{ "--adm-delay": "60ms" } as CSSProperties}>
        {tiles.map((tile, index) => {
          const body = (
            <>
              <dt className="text-[12.5px] text-adm-ink-soft">{tile.label}</dt>
              <dd className={cn("mt-1 text-[22px] leading-tight font-semibold tracking-[-0.02em] tabular-nums", tile.tone)}>{tile.value}</dd>
              <dd className="mt-0.5 text-[12px] text-adm-ink-faint">{tile.hint}</dd>
            </>
          );
          const className = cn(
            "block px-5 py-4",
            index % 2 === 1 ? "border-l border-adm-line" : "",
            index >= 2 ? "border-t border-adm-line lg:border-t-0" : "",
            index === 2 ? "lg:border-l" : "",
          );
          return tile.href ? (
            <Link key={tile.label} href={tile.href} scroll={false} className={cn(className, "transition-colors hover:bg-adm-surface-muted/60")}>
              {body}
            </Link>
          ) : (
            <div key={tile.label} className={className}>
              {body}
            </div>
          );
        })}
      </dl>

      <section className={cn("adm-rise overflow-hidden", TILE_CLASS)} style={{ "--adm-delay": "120ms" } as CSSProperties}>
        <nav aria-label="Stock views" className="flex gap-1 overflow-x-auto border-b border-adm-line px-3 pt-2 sm:px-4">
          {(Object.keys(VIEW_LABELS) as InventoryView[]).map((view) => {
            const active = query.view === view;
            const count = result.counts[view];
            return (
              <Link
                key={view}
                href={inventoryHref(query, { view })}
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
                    active
                      ? "bg-adm-accent-soft text-adm-accent"
                      : (view === "restock" || view === "out") && count > 0
                        ? "bg-adm-warning-soft text-adm-warning"
                        : "bg-adm-surface-muted text-adm-ink-faint",
                  )}
                >
                  {count}
                </span>
                <span aria-hidden="true" className={cn("absolute inset-x-1 -bottom-px h-0.5 rounded-full bg-adm-accent transition-opacity", active ? "opacity-100" : "opacity-0")} />
              </Link>
            );
          })}
        </nav>

        <div className="border-b border-adm-line px-3 py-3 sm:px-5">
          <InventoryFilters query={query} categories={categories} />
        </div>

        <InventoryTable
          rows={rows}
          threshold={LOW_STOCK_THRESHOLD}
          emptyAction={
            filtered ? (
              <Link href="/admin/inventory" className={buttonClass.secondary}>
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
              <PageLink href={result.page > 1 ? inventoryHref(query, { page: result.page - 1 }) : null} label="Previous page">
                <ChevronLeft className="size-4" strokeWidth={2} aria-hidden="true" />
              </PageLink>
              <span className="px-2 text-adm-ink-soft tabular-nums">
                {result.page} / {result.pageCount}
              </span>
              <PageLink href={result.page < result.pageCount ? inventoryHref(query, { page: result.page + 1 }) : null} label="Next page">
                <ChevronRight className="size-4" strokeWidth={2} aria-hidden="true" />
              </PageLink>
            </div>
          </footer>
        ) : null}
      </section>
    </div>
  );
}
