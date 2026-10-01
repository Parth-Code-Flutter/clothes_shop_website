import Image from "next/image";
import type { ReactNode } from "react";
import { AlertTriangle, ChevronRight } from "lucide-react";
import type { DashboardData, OrderStatus } from "@/features/admin/data/dashboard";
import { formatMoney, formatNumber, formatPercent } from "@/features/admin/lib/format";
import { cn } from "@/lib/utils";

export function Panel({
  title,
  description,
  action,
  children,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("flex flex-col rounded-2xl border border-adm-line bg-adm-surface", className)}>
      <header className="flex items-start justify-between gap-4 border-b border-adm-line px-5 py-4 sm:px-6">
        <div>
          <h2 className="font-adm-display text-[15px] leading-tight font-semibold">{title}</h2>
          {description ? <p className="mt-0.5 text-[13px] text-adm-ink-soft">{description}</p> : null}
        </div>
        {action}
      </header>
      <div className="flex-1">{children}</div>
    </section>
  );
}

function SoonLink({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-1 pt-1 text-[12px] font-medium text-adm-ink-faint" title="Available once this screen is built">
      {children}
      <ChevronRight className="size-3.5" strokeWidth={1.8} aria-hidden="true" />
    </span>
  );
}

const TONE_DOT: Record<DashboardData["fulfilment"][number]["tone"], string> = {
  warning: "bg-adm-warning",
  info: "bg-adm-info",
  accent: "bg-adm-accent",
  success: "bg-adm-success",
  danger: "bg-adm-danger",
};

export function FulfilmentPanel({ items }: { items: DashboardData["fulfilment"] }) {
  const open = items.filter((item) => item.tone !== "success").reduce((total, item) => total + item.count, 0);
  return (
    <Panel title="Today's queue" description={`${open} orders need attention`} action={<SoonLink>Orders</SoonLink>}>
      <ul className="divide-y divide-adm-line">
        {items.map((item) => (
          <li key={item.label} className="flex items-center gap-3 px-5 py-3.5 sm:px-6">
            <span className={cn("size-2 shrink-0 rounded-full", TONE_DOT[item.tone])} aria-hidden="true" />
            <span className="flex-1 text-[14px] text-adm-ink-soft">{item.label}</span>
            <span className="font-adm-display text-lg font-semibold tabular-nums">{item.count}</span>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

const STATUS_STYLE: Record<OrderStatus, string> = {
  "Awaiting payment": "bg-adm-warning-soft text-adm-warning",
  Paid: "bg-adm-accent-soft text-adm-accent",
  Processing: "bg-adm-info-soft text-adm-info",
  Shipped: "bg-adm-info-soft text-adm-info",
  Delivered: "bg-adm-success-soft text-adm-success",
  Refunded: "bg-adm-danger-soft text-adm-danger",
};

function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-medium whitespace-nowrap", STATUS_STYLE[status])}>
      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      {status}
    </span>
  );
}

export function RecentOrdersPanel({ orders }: { orders: DashboardData["recentOrders"] }) {
  return (
    <Panel title="Recent orders" description="Latest activity across all channels" action={<SoonLink>View all</SoonLink>}>
      <div className="hidden md:block">
        <table className="w-full text-left text-[14px]">
          <thead>
            <tr className="text-[11px] font-semibold tracking-[0.06em] text-adm-ink-faint uppercase">
              <th scope="col" className="px-6 py-3 font-semibold">Order</th>
              <th scope="col" className="px-3 py-3 font-semibold">Customer</th>
              <th scope="col" className="px-3 py-3 font-semibold">Payment</th>
              <th scope="col" className="px-3 py-3 font-semibold">Status</th>
              <th scope="col" className="px-6 py-3 text-right font-semibold">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-adm-line border-t border-adm-line">
            {orders.map((order) => (
              <tr key={order.id} className="transition-colors hover:bg-adm-surface-muted/60">
                <td className="px-6 py-3.5">
                  <p className="font-medium text-adm-ink tabular-nums">{order.id}</p>
                  <p className="text-[12px] text-adm-ink-faint">{order.placed}</p>
                </td>
                <td className="px-3 py-3.5">
                  <p className="text-adm-ink">{order.customer}</p>
                  <p className="text-[12px] text-adm-ink-faint">
                    {order.city} · {order.items} {order.items === 1 ? "item" : "items"}
                  </p>
                </td>
                <td className="px-3 py-3.5 text-adm-ink-soft">{order.payment}</td>
                <td className="px-3 py-3.5">
                  <StatusBadge status={order.status} />
                </td>
                <td className="px-6 py-3.5 text-right font-medium text-adm-ink tabular-nums">{formatMoney(order.totalPaise)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="divide-y divide-adm-line md:hidden">
        {orders.map((order) => (
          <li key={order.id} className="flex flex-col gap-2 px-5 py-4">
            <div className="flex items-center justify-between gap-3">
              <p className="font-medium tabular-nums">{order.id}</p>
              <p className="font-medium tabular-nums">{formatMoney(order.totalPaise)}</p>
            </div>
            <div className="flex items-center justify-between gap-3">
              <p className="min-w-0 truncate text-[13px] text-adm-ink-soft">
                {order.customer} · {order.payment} · {order.placed}
              </p>
              <StatusBadge status={order.status} />
            </div>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

export function TopProductsPanel({ products }: { products: DashboardData["topProducts"] }) {
  const top = products[0]?.units || 1;
  return (
    <Panel title="Best sellers" description="Units sold · last 30 days" action={<SoonLink>Products</SoonLink>}>
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
                  <span className="block h-full rounded-full bg-adm-accent" style={{ width: `${(product.units / top) * 100}%` }} />
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

const MIX_COLORS = ["var(--adm-accent)", "var(--adm-ink)", "var(--adm-info)", "var(--adm-ink-faint)", "var(--adm-success)"];

export function CategoryMixPanel({ mix }: { mix: DashboardData["categoryMix"] }) {
  return (
    <Panel title="Sales by category" description="Share of revenue · last 30 days">
      <div className="p-5 sm:p-6">
        <div className="flex h-3 overflow-hidden rounded-full" role="img" aria-label={mix.map((entry) => `${entry.name} ${Math.round(entry.share * 100)}%`).join(", ")}>
          {mix.map((entry, index) => (
            <span key={entry.id} style={{ width: `${entry.share * 100}%`, background: MIX_COLORS[index % MIX_COLORS.length] }} className="h-full border-r-2 border-adm-surface last:border-r-0" />
          ))}
        </div>
        <ul className="mt-6 flex flex-col gap-3.5">
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

export function FunnelPanel({ steps }: { steps: DashboardData["funnel"] }) {
  const first = steps[0]?.value || 1;
  return (
    <Panel title="Conversion funnel" description="Visitor journey · last 30 days">
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
                    className="block h-full rounded-full bg-adm-accent"
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

export function LowStockPanel({ items }: { items: DashboardData["lowStock"] }) {
  return (
    <Panel
      title="Low stock"
      description="Sizes about to sell out"
      action={
        <span className="inline-flex items-center gap-1.5 rounded-full bg-adm-warning-soft px-2.5 py-1 text-[12px] font-medium text-adm-warning">
          <AlertTriangle className="size-3.5" strokeWidth={1.8} aria-hidden="true" />
          {items.length}
        </span>
      }
    >
      <ul className="divide-y divide-adm-line">
        {items.map((item) => (
          <li key={`${item.id}-${item.size}`} className="flex items-center gap-3 px-5 py-3 sm:px-6">
            <span className="relative size-11 shrink-0 overflow-hidden rounded-lg bg-adm-surface-muted">
              <Image src={item.image} alt="" fill sizes="44px" className="object-cover" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-medium text-adm-ink">{item.name}</p>
              <p className="text-[12px] text-adm-ink-faint">Size {item.size}</p>
            </div>
            <span
              className={cn(
                "rounded-full px-2.5 py-1 text-[12px] font-semibold tabular-nums whitespace-nowrap",
                item.left <= 2 ? "bg-adm-danger-soft text-adm-danger" : "bg-adm-warning-soft text-adm-warning",
              )}
            >
              {item.left} left
            </span>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
