"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useTransition, type ReactNode } from "react";
import { Ban, CreditCard, PackageCheck, ReceiptText, X } from "lucide-react";
import { bulkOrderAction, type BulkOrderAction } from "@/features/admin/orders/actions";
import { useToast } from "@/features/admin/components/admin-toast";
import { OrderStatusBadge, PaymentLabel } from "@/features/admin/components/orders/order-badges";
import { buttonClass } from "@/features/admin/components/ui";
import { formatMoney } from "@/features/admin/lib/format";
import type { OrderStatus, PaymentMethod, PaymentStatus } from "@/features/admin/lib/order-status";
import { cn } from "@/lib/utils";

export type OrderRow = {
  id: string;
  number: string;
  placedLabel: string;
  placedFull: string;
  customer: string;
  city: string;
  status: OrderStatus;
  method: PaymentMethod;
  paymentStatus: PaymentStatus;
  totalPaise: number;
  itemCount: number;
  firstItem: string;
  images: string[];
};

function Thumbs({ images, count }: { images: string[]; count: number }) {
  return (
    <span className="flex shrink-0 -space-x-3">
      {images.slice(0, 2).map((src, index) => (
        <span key={`${src}-${index}`} className="relative size-9 overflow-hidden rounded-lg border-2 border-adm-surface bg-adm-surface-muted">
          <Image src={src} alt="" fill sizes="36px" className="object-cover" />
        </span>
      ))}
      {count > 2 ? (
        <span className="relative inline-flex size-9 items-center justify-center rounded-lg border-2 border-adm-surface bg-adm-surface-muted text-[11px] font-semibold text-adm-ink-soft">
          +{count - 2}
        </span>
      ) : null}
    </span>
  );
}

const BULK: { action: BulkOrderAction; label: string; icon: typeof Ban; danger?: boolean }[] = [
  { action: "mark_paid", label: "Mark paid", icon: CreditCard },
  { action: "mark_packed", label: "Mark packed", icon: PackageCheck },
  { action: "cancel", label: "Cancel", icon: Ban, danger: true },
];

export function OrdersTable({ orders, emptyAction }: { orders: OrderRow[]; emptyAction: ReactNode }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
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

  return (
    <>
      {visibleSelected.length > 0 ? (
        <div className="flex flex-wrap items-center gap-1 border-b border-adm-line bg-adm-accent-soft/60 px-3 py-2 sm:px-5">
          <span className="mr-2 text-[13px] font-medium text-adm-ink tabular-nums">{visibleSelected.length} selected</span>
          {BULK.map(({ action, label, icon: Icon, danger }) => (
            <button key={action} type="button" disabled={pending} onClick={() => run(action)} className={cn(danger ? buttonClass.danger : buttonClass.ghost, "h-8")}>
              <Icon className="size-4" strokeWidth={1.8} aria-hidden="true" /> {label}
            </button>
          ))}
          <button type="button" onClick={() => setSelected(new Set())} aria-label="Clear selection" className={cn(buttonClass.ghost, "ml-auto size-8 px-0")}>
            <X className="size-4" strokeWidth={2} aria-hidden="true" />
          </button>
        </div>
      ) : null}

      <div className="hidden md:block">
        <table className="w-full text-left text-[13.5px]">
          <thead>
            <tr className="border-b border-adm-line text-[12px] text-adm-ink-faint">
              <th scope="col" className="w-10 py-2.5 pr-2 pl-5">
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
              </th>
              <th scope="col" className="py-2.5 pr-3 font-medium">Order</th>
              <th scope="col" className="px-3 py-2.5 font-medium">Customer</th>
              <th scope="col" className="hidden px-3 py-2.5 font-medium lg:table-cell">Items</th>
              <th scope="col" className="px-3 py-2.5 font-medium">Status</th>
              <th scope="col" className="hidden px-3 py-2.5 font-medium xl:table-cell">Payment</th>
              <th scope="col" className="py-2.5 pr-5 pl-3 text-right font-medium">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-adm-line">
            {orders.map((order) => {
              const isSelected = selected.has(order.id);
              return (
                <tr key={order.id} className={cn("group relative transition-colors", isSelected ? "bg-adm-accent-soft/40" : "hover:bg-adm-surface-muted/50")}>
                  <td className="relative z-10 py-3 pr-2 pl-5">
                    <input type="checkbox" aria-label={`Select order ${order.number}`} checked={isSelected} onChange={() => toggle(order.id)} className={checkbox} />
                  </td>
                  <td className="py-3 pr-3">
                    <Link href={`/admin/orders/${order.id}`} className="font-medium text-adm-ink tabular-nums group-hover:text-adm-accent focus-visible:outline-none after:absolute after:inset-0">
                      {order.number}
                    </Link>
                    <span className="block text-[12px] text-adm-ink-faint" title={order.placedFull}>
                      {order.placedLabel}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <span className="block font-medium text-adm-ink">{order.customer}</span>
                    <span className="block text-[12px] text-adm-ink-faint">{order.city}</span>
                  </td>
                  <td className="hidden px-3 py-3 lg:table-cell">
                    <span className="flex items-center gap-3">
                      <Thumbs images={order.images} count={order.itemCount} />
                      <span className="min-w-0">
                        <span className="block max-w-[200px] truncate text-adm-ink-soft">{order.firstItem}</span>
                        <span className="block text-[12px] text-adm-ink-faint">
                          {order.itemCount} item{order.itemCount > 1 ? "s" : ""}
                        </span>
                      </span>
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="hidden px-3 py-3 xl:table-cell">
                    <PaymentLabel method={order.method} status={order.paymentStatus} />
                  </td>
                  <td className="py-3 pr-5 pl-3 text-right font-medium text-adm-ink tabular-nums">{formatMoney(order.totalPaise)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ul className="divide-y divide-adm-line md:hidden">
        {orders.map((order) => (
          <li key={order.id} className="flex gap-3 px-4 py-3.5">
            <input type="checkbox" aria-label={`Select order ${order.number}`} checked={selected.has(order.id)} onChange={() => toggle(order.id)} className={cn(checkbox, "mt-1")} />
            <Link href={`/admin/orders/${order.id}`} className="flex min-w-0 flex-1 flex-col gap-1.5">
              <span className="flex items-start justify-between gap-2">
                <span className="text-[14px] font-medium tabular-nums">{order.number}</span>
                <span className="text-[14px] font-medium tabular-nums">{formatMoney(order.totalPaise)}</span>
              </span>
              <span className="text-[12.5px] text-adm-ink-soft">
                {order.customer} · {order.city} · {order.placedLabel}
              </span>
              <span className="flex flex-wrap items-center gap-2">
                <OrderStatusBadge status={order.status} />
                <span className="text-[12px] text-adm-ink-faint">
                  {order.itemCount} item{order.itemCount > 1 ? "s" : ""} · {order.method}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
      {toast}
    </>
  );
}
