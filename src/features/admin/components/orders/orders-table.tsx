"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useTransition, type ReactNode } from "react";
import { Ban, Check, CreditCard, MessageSquare, PackageCheck, ReceiptText, Truck, X } from "lucide-react";
import { bulkOrderAction, updateOrderAction, type BulkOrderAction } from "@/features/admin/orders/actions";
import { useToast } from "@/features/admin/components/admin-toast";
import { OrderStatusBadge } from "@/features/admin/components/orders/order-badges";
import { buttonClass } from "@/features/admin/components/ui";
import { formatMoney } from "@/features/admin/lib/format";
import { PRIMARY_ACTION, canRun, type OrderAction, type OrderStatus, type PaymentMethod, type PaymentStatus } from "@/features/admin/lib/order-status";
import { cn } from "@/lib/utils";

export type OrderLine = { name: string; image: string; size: string; quantity: number };

export type OrderRow = {
  id: string;
  number: string;
  placedLabel: string;
  placedFull: string;
  /** Hours since the order was placed; the row flags it once an order has waited 6 hours and still needs a person. */
  waitHours: number;
  customer: string;
  city: string;
  status: OrderStatus;
  method: PaymentMethod;
  paymentStatus: PaymentStatus;
  totalPaise: number;
  hasNote: boolean;
  lines: OrderLine[];
};

const URGENT_HOURS = 6;
const CHECKBOX = "size-4 cursor-pointer rounded border-adm-line-strong accent-[var(--adm-accent)]";

/** One-click steps. Shipping needs a tracking number and a return needs a decision, so those open the order. */
const INLINE: Partial<Record<OrderAction, { label: string; icon: typeof Check }>> = {
  mark_paid: { label: "Confirm payment", icon: CreditCard },
  mark_packed: { label: "Mark packed", icon: PackageCheck },
  mark_delivered: { label: "Mark delivered", icon: Check },
};

const NEEDS_YOU = new Set<OrderStatus>(["awaiting_payment", "to_pack", "ready_to_ship", "return_requested"]);

function pieces(lines: OrderLine[]) {
  return lines.reduce((total, line) => total + line.quantity, 0);
}

function NextStep({ order, sent, busy, onRun }: { order: OrderRow; sent: boolean; busy: boolean; onRun: (action: OrderAction) => void }) {
  if (sent) return <span className="text-[12px] font-medium text-adm-success">Sent</span>;
  const action = PRIMARY_ACTION[order.status];
  const inline = action ? INLINE[action] : undefined;
  if (inline && action) {
    const Icon = inline.icon;
    return (
      <button type="button" disabled={busy} onClick={() => onRun(action)} className={cn(buttonClass.primary, "relative z-10 h-8 px-2.5")}>
        <Icon className="size-3.5" strokeWidth={2} aria-hidden="true" />
        {inline.label}
      </button>
    );
  }
  if (order.status === "ready_to_ship") {
    return (
      <Link href={`/admin/orders/${order.id}#ship`} className={cn(buttonClass.primary, "relative z-10 h-8 px-2.5")}>
        <Truck className="size-3.5" strokeWidth={2} aria-hidden="true" />
        Add tracking
      </Link>
    );
  }
  if (order.status === "return_requested") {
    return (
      <Link href={`/admin/orders/${order.id}`} className={cn(buttonClass.secondary, "relative z-10 h-8 px-2.5")}>
        Review return
      </Link>
    );
  }
  return null;
}

const BULK: { action: BulkOrderAction; label: string; icon: typeof Ban; danger?: boolean }[] = [
  { action: "mark_paid", label: "Mark paid", icon: CreditCard },
  { action: "mark_packed", label: "Mark packed", icon: PackageCheck },
  { action: "cancel", label: "Cancel", icon: Ban, danger: true },
];

export function OrdersTable({ orders, emptyAction }: { orders: OrderRow[]; emptyAction: ReactNode }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sent, setSent] = useState<Set<string>>(new Set());
  const [pending, startTransition] = useTransition();
  const [toast, showToast] = useToast();

  const ids = orders.map((order) => order.id);
  const visibleSelected = ids.filter((id) => selected.has(id));
  const allSelected = ids.length > 0 && visibleSelected.length === ids.length;
  const someSelected = visibleSelected.length > 0 && !allSelected;

  const toggle = (id: string) =>
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(ids));

  const runOne = (order: OrderRow, action: OrderAction) => {
    startTransition(async () => {
      const result = await updateOrderAction(order.id, order.status, action);
      showToast(result.message, !result.ok ? "error" : result.persisted ? "success" : "info");
      if (result.ok) setSent((current) => new Set(current).add(order.id));
    });
  };

  const chosen = orders.filter((order) => selected.has(order.id));
  const bulk = BULK.filter(({ action }) => chosen.some((order) => canRun(action, order.status)));

  const run = (action: BulkOrderAction) => {
    if (action === "cancel" && !window.confirm(`Cancel ${visibleSelected.length === 1 ? "this order" : `${visibleSelected.length} orders`}? Customers will be notified.`)) return;
    startTransition(async () => {
      const result = await bulkOrderAction(visibleSelected, action);
      showToast(result.message, !result.ok ? "error" : result.persisted ? "success" : "info");
      if (result.persisted) setSelected(new Set());
    });
  };

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center px-6 py-16 text-center">
        <span className="inline-flex size-11 items-center justify-center rounded-xl bg-adm-surface-muted text-adm-ink-faint">
          <ReceiptText className="size-5" strokeWidth={1.7} aria-hidden="true" />
        </span>
        <p className="mt-4 text-[14px] font-medium">No orders here</p>
        <p className="mt-1 text-[13px] text-adm-ink-faint">Try another tab or search, or clear the filters to see everything.</p>
        <div className="mt-4">{emptyAction}</div>
      </div>
    );
  }

  const checkbox = "size-4 cursor-pointer rounded border-adm-line-strong accent-[var(--adm-accent)]";
  const bench = orders.filter((order) => NEEDS_YOU.has(order.status));
  const moving = orders.filter((order) => !NEEDS_YOU.has(order.status));
  const slip = (order: OrderRow) => (
    <OrderSlip
      key={order.id}
      order={order}
      selected={selected.has(order.id)}
      sent={sent.has(order.id)}
      busy={pending}
      onToggle={() => toggle(order.id)}
      onRun={(action) => runOne(order, action)}
    />
  );

  return (
    <>
      {visibleSelected.length > 0 ? (
        <div className="flex flex-wrap items-center gap-1 border-b border-adm-line bg-adm-accent-soft/60 px-3 py-2 sm:px-5">
          <span className="mr-2 text-[13px] font-medium text-adm-ink tabular-nums">{visibleSelected.length} selected</span>
          {bulk.map(({ action, label, icon: Icon, danger }) => (
            <button key={action} type="button" disabled={pending} onClick={() => run(action)} className={cn(danger ? buttonClass.danger : buttonClass.ghost, "h-8")}>
              <Icon className="size-4" strokeWidth={1.8} aria-hidden="true" /> {label}
            </button>
          ))}
          <button type="button" onClick={() => setSelected(new Set())} aria-label="Clear selection" className={cn(buttonClass.ghost, "ml-auto size-8 px-0")}>
            <X className="size-4" strokeWidth={2} aria-hidden="true" />
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-3 border-b border-adm-line px-4 py-2 sm:px-5">
          <p className="text-[12px] text-adm-ink-faint">{bench.length ? "Tick a slip to act on several at once." : "Nothing on this page is waiting on you."}</p>
          <label className="inline-flex cursor-pointer items-center gap-2 text-[12px] text-adm-ink-soft">
            <input
              type="checkbox"
              aria-label="Select all orders on this page"
              checked={allSelected}
              ref={(node) => {
                if (node) node.indeterminate = someSelected;
              }}
              onChange={toggleAll}
              className={checkbox}
            />
            Select page
          </label>
        </div>
      )}

      {bench.length ? (
        <section aria-label="Orders that need you" className="p-3 sm:p-4">
          {moving.length ? <h2 className="mb-3 text-[12px] font-semibold tracking-[0.06em] text-adm-ink-faint uppercase">Needs you</h2> : null}
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{bench.map(slip)}</div>
        </section>
      ) : null}

      {moving.length ? (
        <section aria-label="Orders already moving" className={cn(bench.length && "border-t border-adm-line")}>
          {bench.length ? <h2 className="px-4 pt-4 text-[12px] font-semibold tracking-[0.06em] text-adm-ink-faint uppercase sm:px-5">Already on the way</h2> : null}
          <ul className="divide-y divide-adm-line">
            {moving.map((order) => (
              <QuietOrder key={order.id} order={order} selected={selected.has(order.id)} onToggle={() => toggle(order.id)} />
            ))}
          </ul>
        </section>
      ) : null}
      {toast}
    </>
  );
}

function OrderSlip({
  order,
  selected,
  sent,
  busy,
  onToggle,
  onRun,
}: {
  order: OrderRow;
  selected: boolean;
  sent: boolean;
  busy: boolean;
  onToggle: () => void;
  onRun: (action: OrderAction) => void;
}) {
  const lead = order.lines[0];
  const count = pieces(order.lines);
  const urgent = order.waitHours >= URGENT_HOURS;
  const collect = order.method === "COD" && order.paymentStatus === "pending";
  return (
    <article className={cn("group relative flex flex-col overflow-hidden rounded-xl border bg-adm-surface transition-colors", selected ? "border-adm-accent bg-adm-accent-soft/30" : "border-adm-line hover:border-adm-line-strong", urgent && "border-l-2 border-l-adm-warning")}>
      <div className="flex gap-3.5 p-3.5">
        <span className="relative size-[88px] shrink-0 overflow-hidden rounded-lg bg-adm-surface-muted">
          {lead ? <Image src={lead.image} alt="" fill sizes="88px" className="object-cover" /> : null}
          {order.lines.length > 1 ? <span className="absolute right-1 bottom-1 rounded-md bg-adm-ink/80 px-1.5 py-px text-[10px] font-semibold text-adm-canvas">+{order.lines.length - 1}</span> : null}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="font-adm-display text-[30px] leading-none font-semibold tracking-[-0.03em]">{lead?.size ?? "—"}</p>
            <p className="pt-1 text-[14px] font-semibold tabular-nums">{formatMoney(order.totalPaise)}</p>
          </div>
          <p className="mt-1.5 truncate text-[13px] font-medium">{lead?.name}</p>
          <p className="truncate text-[12px] text-adm-ink-faint">
            {count} {count === 1 ? "piece" : "pieces"}
            {order.lines.length > 1 ? ` · ${order.lines.length} styles` : ""}
          </p>
        </div>
      </div>
      <div className="mt-auto flex items-center justify-between gap-2 border-t border-adm-line px-3.5 py-2.5">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 truncate text-[12.5px] font-medium">
            <Link href={`/admin/orders/${order.id}`} className="truncate group-hover:text-adm-accent focus-visible:outline-none after:absolute after:inset-0">
              {order.customer}
            </Link>
            {order.hasNote ? <MessageSquare className="relative z-10 size-3.5 shrink-0 text-adm-info" strokeWidth={2} role="img" aria-label="Customer left a note" /> : null}
          </p>
          <p className={cn("truncate text-[11.5px]", urgent ? "font-medium text-adm-warning" : "text-adm-ink-faint")} title={order.placedFull}>
            {order.city} · {order.number} · {urgent ? `waiting ${order.waitHours} h` : order.placedLabel}
            {collect ? " · collect cash" : ""}
          </p>
        </div>
        <span className="relative z-10 shrink-0">
          <NextStep order={order} sent={sent} busy={busy} onRun={onRun} />
        </span>
      </div>
      <label className="absolute top-2 left-2 z-10 inline-flex size-7 cursor-pointer items-center justify-center rounded-md bg-adm-surface/90 shadow-sm">
        <input type="checkbox" aria-label={`Select order ${order.number}`} checked={selected} onChange={onToggle} className={CHECKBOX} />
      </label>
    </article>
  );
}

function QuietOrder({ order, selected, onToggle }: { order: OrderRow; selected: boolean; onToggle: () => void }) {
  const lead = order.lines[0];
  const count = pieces(order.lines);
  return (
    <li className={cn("group relative flex items-center gap-3 px-4 py-2.5 sm:px-5", selected && "bg-adm-accent-soft/30")}>
      <input type="checkbox" aria-label={`Select order ${order.number}`} checked={selected} onChange={onToggle} className={cn(CHECKBOX, "relative z-10")} />
      <span className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-adm-surface-muted">
        {lead ? <Image src={lead.image} alt="" fill sizes="40px" className="object-cover" /> : null}
      </span>
      <span className="min-w-0 flex-1">
        <Link href={`/admin/orders/${order.id}`} className="block truncate text-[13px] font-medium group-hover:text-adm-accent focus-visible:outline-none after:absolute after:inset-0">
          {order.number}
          <span className="font-normal text-adm-ink-soft"> · {order.customer}</span>
        </Link>
        <span className="block truncate text-[12px] text-adm-ink-faint">
          {lead?.name} · {lead?.size}
          {count > 1 ? ` · ${count} pieces` : ""} · {order.city}
        </span>
      </span>
      <OrderStatusBadge status={order.status} className="hidden sm:inline-flex" />
      <span className="text-[13px] font-medium tabular-nums">{formatMoney(order.totalPaise)}</span>
    </li>
  );
}
