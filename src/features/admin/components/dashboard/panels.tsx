import Image from "next/image";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import type { DashboardData } from "@/features/admin/data/dashboard";
import { OrderStatusBadge } from "@/features/admin/components/orders/order-badges";
import { adminNav } from "@/features/admin/config/admin-nav";
import { formatMoney, formatNumber, formatPercent } from "@/features/admin/lib/format";
import { cn } from "@/lib/utils";
import { TILE_CLASS } from "@/features/admin/components/ui";

export function Panel({
  title,
  description,
  action,
  children,
  className,
  delay = 0,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  /** Entrance stagger in ms. */
  delay?: number;
}) {
  return (
    <section className={cn("adm-rise flex h-full flex-col", TILE_CLASS, className)} style={{ "--adm-delay": `${delay}ms` } as CSSProperties}>
      <header className="flex items-start justify-between gap-4 px-5 pt-5 pb-3">
        <div className="min-w-0">
          <h3 className="font-adm-display text-[14px] leading-tight font-semibold">{title}</h3>
          {description ? <p className="mt-1 text-[12.5px] text-adm-ink-faint">{description}</p> : null}
        </div>
        {action}
      </header>
      <div className="flex-1">{children}</div>
    </section>
  );
}

export const READY_ROUTES = new Set(adminNav.flatMap((group) => group.items.filter((item) => item.ready).map((item) => item.href)));

/** Links to another admin screen once it is built; until then shows a muted "Soon" label. */
export function ModuleLink({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  if (READY_ROUTES.has(href)) {
    return (
      <Link
        href={href}
        className={cn(
          "inline-flex shrink-0 items-center gap-1 text-[12px] font-medium text-adm-accent hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-adm-accent",
          className,
        )}
      >
        {children}
        <ChevronRight className="size-3.5" strokeWidth={1.8} aria-hidden="true" />
      </Link>
    );
  }
  return (
    <span
      className={cn("inline-flex shrink-0 items-center gap-1.5 text-[12px] font-medium text-adm-ink-faint", className)}
      title="Available once this screen is built"
    >
      {children}
      <span className="rounded-full border border-adm-line px-1.5 py-px text-[10px] font-semibold tracking-[0.06em] uppercase">Soon</span>
    </span>
  );
}

export function RecentOrdersPanel({ orders, delay }: { orders: DashboardData["recentOrders"]; delay?: number }) {
  return (
    <Panel title="Recent orders" description={`Latest ${orders.length} orders`} action={<ModuleLink href="/admin/orders" className="pt-1">View all</ModuleLink>} delay={delay}>
      <div className="hidden md:block">
        <table className="w-full text-left text-[14px]">
          <thead>
            <tr className="text-[11px] font-semibold tracking-[0.06em] text-adm-ink-faint uppercase">
              <th scope="col" className="px-6 py-3 font-semibold">Order</th>
              <th scope="col" className="px-3 py-3 font-semibold">Customer</th>
              <th scope="col" className="px-3 py-3 font-semibold">Status</th>
              <th scope="col" className="px-6 py-3 text-right font-semibold">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-adm-line border-t border-adm-line">
            {orders.map((order) => (
              <tr key={order.id} className="group relative transition-colors hover:bg-adm-surface-muted/60">
                <td className="px-6 py-3.5">
                  <Link href={`/admin/orders/${order.id}`} className="font-medium text-adm-ink tabular-nums group-hover:text-adm-accent focus-visible:outline-none after:absolute after:inset-0">
                    {order.number}
                  </Link>
                  <p className="text-[12px] text-adm-ink-faint">{order.placed}</p>
                </td>
                <td className="px-3 py-3.5">
                  <p className="text-adm-ink">{order.customer}</p>
                  <p className="text-[12px] text-adm-ink-faint">
                    {order.city} · {order.payment}
                  </p>
                </td>
                <td className="px-3 py-3.5">
                  <OrderStatusBadge status={order.status} className="px-2.5 py-1" />
                </td>
                <td className="px-6 py-3.5 text-right font-medium text-adm-ink tabular-nums">{formatMoney(order.totalPaise)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="divide-y divide-adm-line md:hidden">
        {orders.map((order) => (
          <li key={order.id}>
            <Link href={`/admin/orders/${order.id}`} className="flex flex-col gap-2 px-5 py-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium tabular-nums">{order.number}</p>
                <p className="font-medium tabular-nums">{formatMoney(order.totalPaise)}</p>
              </div>
              <div className="flex items-center justify-between gap-3">
                <p className="min-w-0 truncate text-[13px] text-adm-ink-soft">
                  {order.customer} · {order.placed}
                </p>
                <OrderStatusBadge status={order.status} />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

export function TopProductsPanel({ products, delay }: { products: DashboardData["topProducts"]; delay?: number }) {
  const top = products[0]?.units || 1;
  return (
    <Panel title="Best sellers" description="Units sold · last 30 days" action={<ModuleLink href="/admin/products" className="pt-1">Products</ModuleLink>} delay={delay}>
      <ol className="flex flex-col gap-1 p-3 sm:p-4">
        {products.map((product, index) => (
          <li key={product.id} className="flex items-center gap-3 rounded-xl px-2 py-2">
            <span className="w-4 shrink-0 text-[13px] font-semibold text-adm-ink-faint tabular-nums">{index + 1}</span>
            <span className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-adm-surface-muted">
              <Image src={product.image} alt="" fill sizes="48px" className="object-cover" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-medium text-adm-ink">{product.name}</p>
              <div className="mt-1.5 flex items-center gap-2">
                <span className="h-1 flex-1 overflow-hidden rounded-full bg-adm-surface-muted">
                  <span className="adm-grow-x block h-full rounded-full bg-adm-accent" style={{ width: `${(product.units / top) * 100}%` }} />
                </span>
                <span className="text-[12px] text-adm-ink-faint tabular-nums">{product.units}</span>
              </div>
            </div>
            <span className="hidden text-right text-[13px] font-medium text-adm-ink tabular-nums sm:block">{formatMoney(product.revenuePaise, { compact: true })}</span>
          </li>
        ))}
      </ol>
    </Panel>
  );
}

/* Kept for the Analytics screen. */

const MIX_COLORS = [
  "var(--adm-accent)",
  "var(--adm-info)",
  "color-mix(in oklab, var(--adm-accent) 50%, var(--adm-surface))",
  "var(--adm-success)",
  "var(--adm-ink-faint)",
];
const DONUT_RADIUS = 15.9155;

export function CategoryMixPanel({ mix, delay }: { mix: DashboardData["categoryMix"]; delay?: number }) {
  const total = mix.reduce((sum, entry) => sum + entry.revenuePaise, 0);
  const starts = mix.map((_, index) => mix.slice(0, index).reduce((sum, entry) => sum + entry.share * 100, 0));
  return (
    <Panel title="Sales by category" description="Share of revenue · last 30 days" delay={delay}>
      <div className="flex flex-col items-center gap-7 p-5 sm:flex-row sm:p-6 xl:flex-col 2xl:flex-row">
        <div className="relative size-44 shrink-0">
          <svg
            viewBox="0 0 42 42"
            className="size-full -rotate-90"
            role="img"
            aria-label={mix.map((entry) => `${entry.name} ${Math.round(entry.share * 100)}%`).join(", ")}
          >
            <circle cx="21" cy="21" r={DONUT_RADIUS} fill="none" stroke="var(--adm-surface-muted)" strokeWidth="4.5" />
            {mix.map((entry, index) => {
              const visible = Math.max(0.01, entry.share * 100 - (mix.length > 1 ? 1.2 : 0));
              return (
                <circle
                  key={entry.id}
                  cx="21"
                  cy="21"
                  r={DONUT_RADIUS}
                  fill="none"
                  stroke={MIX_COLORS[index % MIX_COLORS.length]}
                  strokeWidth="4.5"
                  strokeDasharray={`${visible} ${100 - visible}`}
                  strokeDashoffset={-starts[index]}
                  className="adm-rise"
                  style={{ "--adm-delay": `${(delay ?? 0) + 150 + index * 90}ms` } as CSSProperties}
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-[1.25rem] leading-none font-semibold tracking-[-0.02em] tabular-nums">{formatMoney(total, { compact: true })}</span>
            <span className="mt-1 text-[11px] text-adm-ink-faint">30-day revenue</span>
          </div>
        </div>
        <ul className="flex w-full min-w-0 flex-col gap-3.5">
          {mix.map((entry, index) => (
            <li key={entry.id} className="flex items-center gap-3 text-[14px]">
              <span className="size-2.5 shrink-0 rounded-[3px]" style={{ background: MIX_COLORS[index % MIX_COLORS.length] }} aria-hidden="true" />
              <span className="flex-1 text-adm-ink-soft">{entry.name}</span>
              <span className="text-adm-ink-faint tabular-nums">{formatPercent(entry.share * 100, 0)}</span>
              <span className="w-20 text-right font-medium text-adm-ink tabular-nums">{formatMoney(entry.revenuePaise, { compact: true })}</span>
            </li>
          ))}
        </ul>
      </div>
    </Panel>
  );
}

export function FunnelPanel({ steps, delay }: { steps: DashboardData["funnel"]; delay?: number }) {
  const first = steps[0]?.value || 1;
  return (
    <Panel title="Conversion funnel" description="Visitor journey · last 30 days" delay={delay}>
      <ol className="flex flex-col gap-4 p-5 sm:p-6">
        {steps.map((step, index) => {
          const previous = steps[index - 1]?.value;
          return (
            <li key={step.label}>
              <div className="flex items-baseline justify-between gap-3 text-[14px]">
                <span className="text-adm-ink-soft">{step.label}</span>
                <span className="font-medium text-adm-ink tabular-nums">{formatNumber(step.value)}</span>
              </div>
              <div className="mt-2 flex items-center gap-3">
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-adm-surface-muted">
                  <span
                    className="adm-grow-x block h-full rounded-full bg-adm-accent"
                    style={{ width: `${Math.max(2, (step.value / first) * 100)}%`, opacity: 1 - index * 0.18 }}
                  />
                </span>
                <span className="w-12 text-right text-[12px] text-adm-ink-faint tabular-nums">
                  {previous ? formatPercent((step.value / previous) * 100, 1) : "—"}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </Panel>
  );
}