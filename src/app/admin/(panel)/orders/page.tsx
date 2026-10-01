import type { Metadata } from "next";
import Link from "next/link";
import type { CSSProperties } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { requireAdmin } from "@/features/admin/auth/dal";
import { ORDERS_PAGE_SIZE, getOrderStats, parseOrderQuery, queryOrders, type OrderView } from "@/features/admin/data/orders";
import { OrdersFilters } from "@/features/admin/components/orders/orders-filters";
import { OrdersTable, type OrderRow } from "@/features/admin/components/orders/orders-table";
import { PageHeader, PageLink, TILE_CLASS, buttonClass } from "@/features/admin/components/ui";
import { formatDateTime, formatMoney, formatNumber, formatRelative } from "@/features/admin/lib/format";
import { ordersHref } from "@/features/admin/lib/orders-url";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Orders" };

const VIEW_LABELS: Record<OrderView, string> = {
  all: "All",
  unpaid: "Unpaid",
  to_pack: "To pack",
  to_ship: "Ready to ship",
  shipped: "Shipped",
  delivered: "Delivered",
  returns: "Returns",
  cancelled: "Cancelled",
};

/** Tabs that need action get an attention-coloured count. */
const ACTION_VIEWS = new Set<OrderView>(["unpaid", "to_pack", "to_ship", "returns"]);

export default async function OrdersPage({ searchParams }: PageProps<"/admin/orders">) {
  await requireAdmin();
  const now = new Date();
  const query = parseOrderQuery(await searchParams);
  const result = queryOrders(query, now);
  const stats = getOrderStats(now);

  const tiles = [
    { label: "To pack", value: formatNumber(stats.toPack), hint: stats.toPack ? `Oldest waiting ${stats.oldestToPackHours} h` : "All caught up", href: ordersHref(query, { view: "to_pack" }), alert: stats.toPack > 0 },
    { label: "Awaiting payment", value: formatNumber(stats.awaitingPayment), hint: "Auto-cancel after 12 h", href: ordersHref(query, { view: "unpaid" }) },
    { label: "Open returns", value: formatNumber(stats.returnsOpen), hint: "Waiting for your decision", href: ordersHref(query, { view: "returns" }), alert: stats.returnsOpen > 0 },
    { label: "Revenue, last 7 days", value: formatMoney(stats.weekRevenuePaise, { compact: true }), hint: `${formatNumber(stats.weekOrders)} orders` },
  ];

  const rows: OrderRow[] = result.items.map((order) => ({
    id: order.id,
    number: order.number,
    placedLabel: formatRelative(order.placedAt, now),
    placedFull: formatDateTime(order.placedAt),
    waitHours: Math.max(0, Math.round((now.getTime() - new Date(order.placedAt).getTime()) / 3_600_000)),
    customer: order.customer.name,
    city: order.shipping.city,
    status: order.status,
    method: order.payment.method,
    paymentStatus: order.payment.status,
    totalPaise: order.totalPaise,
    hasNote: Boolean(order.customerNote),
    lines: order.items.map((item) => ({ name: item.name, image: item.image, size: item.size, quantity: item.quantity })),
  }));

  const filtered = Boolean(query.q || query.payment || query.view !== "all");
  const from = result.total === 0 ? 0 : (result.page - 1) * ORDERS_PAGE_SIZE + 1;
  const to = Math.min(result.page * ORDERS_PAGE_SIZE, result.total);

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6">
      <PageHeader title="Orders" description="Every order from the storefront, from payment to doorstep." />

      <dl className={cn("adm-rise grid grid-cols-2 lg:grid-cols-4", TILE_CLASS)} style={{ "--adm-delay": "60ms" } as CSSProperties}>
        {tiles.map((tile, index) => {
          const body = (
            <>
              <dt className="text-[12.5px] text-adm-ink-soft">{tile.label}</dt>
              <dd className={cn("mt-1 text-[22px] leading-tight font-semibold tracking-[-0.02em] tabular-nums", tile.alert && "text-adm-warning")}>{tile.value}</dd>
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
        <nav aria-label="Order status" className="flex gap-1 overflow-x-auto border-b border-adm-line px-3 pt-2 sm:px-4">
          {(Object.keys(VIEW_LABELS) as OrderView[]).map((view) => {
            const active = query.view === view;
            const count = result.counts[view];
            return (
              <Link
                key={view}
                href={ordersHref(query, { view })}
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
                      : ACTION_VIEWS.has(view) && count > 0
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
          <OrdersFilters query={query} />
        </div>

        {ACTION_VIEWS.has(query.view) && result.total > 0 ? (
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-adm-line bg-adm-surface-muted/40 px-4 py-2.5 text-[12.5px] text-adm-ink-soft sm:px-5">
            <span>
              {query.view === "to_pack"
                ? "The big letters are the size to pick. Pack it from the slip."
                : query.view === "unpaid"
                  ? "These cancel themselves after 12 hours if the payment never arrives."
                  : query.view === "to_ship"
                    ? "Add a tracking number and the customer gets it by email."
                    : "Open the slip to approve the return or decline it."}
            </span>
            {query.sort === "oldest" ? (
              <span className="font-medium text-adm-ink">Longest wait is at the top.</span>
            ) : (
              <Link href={ordersHref(query, { sort: "oldest" })} scroll={false} className="font-medium text-adm-accent hover:underline">
                Show the longest wait first
              </Link>
            )}
          </p>
        ) : null}

        <OrdersTable
          orders={rows}
          emptyAction={
            filtered ? (
              <Link href="/admin/orders" className={buttonClass.secondary}>
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
              <PageLink href={result.page > 1 ? ordersHref(query, { page: result.page - 1 }) : null} label="Previous page">
                <ChevronLeft className="size-4" strokeWidth={2} aria-hidden="true" />
              </PageLink>
              <span className="px-2 text-adm-ink-soft tabular-nums">
                {result.page} / {result.pageCount}
              </span>
              <PageLink href={result.page < result.pageCount ? ordersHref(query, { page: result.page + 1 }) : null} label="Next page">
                <ChevronRight className="size-4" strokeWidth={2} aria-hidden="true" />
              </PageLink>
            </div>
          </footer>
        ) : null}
      </section>
    </div>
  );
}
