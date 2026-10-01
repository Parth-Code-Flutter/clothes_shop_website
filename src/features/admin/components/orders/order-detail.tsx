"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, useTransition, type CSSProperties, type FormEvent } from "react";
import { Ban, Check, Copy, ExternalLink, Mail, MapPin, MessageSquareText, Phone, Truck } from "lucide-react";
import type { Order, OrderEvent } from "@/features/admin/data/orders";
import { addOrderNoteAction, updateOrderAction } from "@/features/admin/orders/actions";
import { useToast } from "@/features/admin/components/admin-toast";
import { OrderStatusBadge } from "@/features/admin/components/orders/order-badges";
import { Card, PageHeader, TILE_CLASS, buttonClass, inputClass } from "@/features/admin/components/ui";
import { formatMoney } from "@/features/admin/lib/format";
import {
  COURIERS,
  ORDER_ACTIONS,
  ORDER_STEPS,
  PAYMENT_STATUS_META,
  PRIMARY_ACTION,
  canRun,
  stepIndex,
  type OrderAction,
  type OrderStatus,
  type PaymentStatus,
} from "@/features/admin/lib/order-status";
import { cn } from "@/lib/utils";

type TimelineEvent = OrderEvent & { atLabel: string };

function Stepper({ status, method }: { status: OrderStatus; method: Order["payment"]["method"] }) {
  const halted = status === "cancelled";
  const current = stepIndex(status, method);
  return (
    <ol className="grid grid-cols-5">
      {ORDER_STEPS.map((step, index) => {
        const done = !halted && index <= current;
        return (
          <li key={step} className="relative flex flex-col items-center gap-2 text-center">
            {index > 0 ? (
              <span aria-hidden="true" className={cn("absolute top-3.5 right-1/2 h-0.5 w-full -translate-y-1/2", done ? "bg-adm-accent" : "bg-adm-line")} />
            ) : null}
            <span
              className={cn(
                "relative inline-flex size-7 items-center justify-center rounded-full border-2 text-[11px] font-semibold transition-colors",
                done ? "border-adm-accent bg-adm-accent text-adm-accent-ink" : "border-adm-line bg-adm-surface text-adm-ink-faint",
                !halted && index === current + 1 && "border-adm-accent/60 text-adm-accent",
              )}
            >
              {done ? <Check className="size-3.5" strokeWidth={3} aria-hidden="true" /> : index + 1}
            </span>
            <span className={cn("text-[12px] font-medium", done ? "text-adm-ink" : "text-adm-ink-faint")}>{step}</span>
          </li>
        );
      })}
    </ol>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={cn("flex justify-between gap-4", strong ? "text-[14px] font-semibold text-adm-ink" : "text-[13px] text-adm-ink-soft")}>
      <dt>{label}</dt>
      <dd className="tabular-nums">{value}</dd>
    </div>
  );
}

export function OrderDetail({
  order,
  customerHref,
  placedLabel,
  customerSince,
  events: initialEvents,
}: {
  order: Order;
  customerHref: string;
  placedLabel: string;
  customerSince: string;
  events: TimelineEvent[];
}) {
  const [status, setStatus] = useState(order.status);
  const [payment, setPayment] = useState<PaymentStatus>(order.payment.status);
  const [tracking, setTracking] = useState(order.tracking);
  const [events, setEvents] = useState(initialEvents);
  const [courier, setCourier] = useState<string>(COURIERS[0]);
  const [awb, setAwb] = useState("");
  const [note, setNote] = useState("");
  const [pending, startTransition] = useTransition();
  const [toast, showToast] = useToast();
  const awbRef = useRef<HTMLInputElement>(null);

  const addEvent = (label: string, eventNote?: string) =>
    setEvents((current) => [...current, { at: new Date().toISOString(), atLabel: "Just now", label, note: eventNote, by: "You" }]);

  const run = (action: OrderAction) => {
    if (action === "ship" && !awb.trim()) {
      awbRef.current?.focus();
      return;
    }
    if (action === "cancel" && !window.confirm(`Cancel ${order.number}? The customer will be notified${payment === "paid" ? " and refunded" : ""}.`)) return;
    startTransition(async () => {
      const details = action === "ship" ? { courier, awb } : undefined;
      const result = await updateOrderAction(order.id, status, action, details);
      if (!result.ok || !result.status) {
        showToast(result.message, "error");
        return;
      }
      setStatus(result.status);
      if (action === "mark_paid") setPayment("paid");
      if (action === "refund" || (action === "cancel" && payment === "paid")) setPayment("refunded");
      if (action === "mark_delivered" && order.payment.method === "COD") setPayment("paid");
      if (action === "ship") {
        setTracking({ courier, awb: awb.trim().toUpperCase() });
        setAwb("");
      }
      addEvent(ORDER_ACTIONS[action].event, action === "ship" ? `${courier} · ${awb.trim().toUpperCase()}` : undefined);
      showToast(result.message, result.persisted ? "success" : "info");
    });
  };

  const submitNote = (event: FormEvent) => {
    event.preventDefault();
    startTransition(async () => {
      const result = await addOrderNoteAction(order.id, note);
      if (!result.ok) {
        showToast(result.message, "error");
        return;
      }
      addEvent("Note added", note.trim());
      setNote("");
      showToast(result.message, result.persisted ? "success" : "info");
    });
  };

  const primary = PRIMARY_ACTION[status];
  const units = order.items.reduce((total, item) => total + item.quantity, 0);
  const paymentMeta = PAYMENT_STATUS_META[payment];
  const reason = [...events].reverse().find((event) => event.label === "Return requested")?.note;

  const copy = (text: string) => {
    void navigator.clipboard?.writeText(text);
    showToast("Copied to clipboard.", "success");
  };

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6">
      <PageHeader
        back={{ href: "/admin/orders", label: "Orders" }}
        title={<span className="tabular-nums">{order.number}</span>}
        meta={<OrderStatusBadge status={status} />}
        description={`Placed ${placedLabel} · ${units} item${units > 1 ? "s" : ""} · ${formatMoney(order.totalPaise)}`}
        actions={
          <>
            {canRun("cancel", status) ? (
              <button type="button" disabled={pending} onClick={() => run("cancel")} className={buttonClass.danger}>
                <Ban className="size-4" strokeWidth={1.8} aria-hidden="true" />
                Cancel order
              </button>
            ) : null}
            {status === "return_requested" ? (
              <button type="button" disabled={pending} onClick={() => run("decline_return")} className={buttonClass.secondary}>
                Decline return
              </button>
            ) : null}
            {primary ? (
              <button type="button" disabled={pending} onClick={() => run(primary)} className={buttonClass.primary}>
                {ORDER_ACTIONS[primary].label}
              </button>
            ) : null}
          </>
        }
      />

      {status === "return_requested" ? (
        <p className="adm-rise rounded-xl border border-adm-danger/25 bg-adm-danger-soft px-4 py-3 text-[13px] text-adm-ink">
          <span className="font-semibold text-adm-danger">Return requested.</span> {reason ? `Reason: ${reason}. ` : ""}Approving refunds {formatMoney(order.totalPaise)} to the
          customer&apos;s {order.payment.method === "COD" ? "bank account" : order.payment.method}.
        </p>
      ) : null}

      <section className={cn("adm-rise px-5 py-5 sm:px-8", TILE_CLASS)} style={{ "--adm-delay": "60ms" } as CSSProperties} aria-label="Order progress">
        {status === "cancelled" ? (
          <p className="text-center text-[13px] text-adm-ink-soft">This order was cancelled, so it won&apos;t be fulfilled.</p>
        ) : (
          <Stepper status={status} method={order.payment.method} />
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="flex flex-col gap-6 lg:col-span-8">
          <Card title="Items" description={`${units} unit${units > 1 ? "s" : ""} to pack`}>
            <ul className="-mt-2 divide-y divide-adm-line">
              {order.items.map((item, index) => (
                <li key={`${item.productId}-${item.size}-${index}`} className="flex items-center gap-3 py-3">
                  <span className="relative size-14 shrink-0 overflow-hidden rounded-lg border border-adm-line bg-adm-surface-muted">
                    <Image src={item.image} alt="" fill sizes="56px" className="object-cover" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <Link href={`/admin/products/${item.productId}`} className="block truncate text-[13.5px] font-medium text-adm-ink hover:text-adm-accent">
                      {item.name}
                    </Link>
                    <span className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[12px] text-adm-ink-faint">
                      <span className="rounded bg-adm-surface-muted px-1.5 py-px font-semibold text-adm-ink-soft">Size {item.size}</span>
                      {item.sku}
                    </span>
                  </span>
                  <span className="text-right text-[13px] tabular-nums">
                    <span className="block text-adm-ink-faint">
                      {item.quantity} × {formatMoney(item.pricePaise)}
                    </span>
                    <span className="block font-medium text-adm-ink">{formatMoney(item.pricePaise * item.quantity)}</span>
                  </span>
                </li>
              ))}
            </ul>
            <dl className="mt-2 flex flex-col gap-2 border-t border-adm-line pt-4">
              <Row label="Subtotal" value={formatMoney(order.subtotalPaise)} />
              {order.discountPaise ? <Row label={`Discount (${order.discountCode})`} value={`−${formatMoney(order.discountPaise)}`} /> : null}
              <Row label="Shipping" value={order.shippingPaise ? formatMoney(order.shippingPaise) : "Free"} />
              <div className="my-1 h-px bg-adm-line" />
              <Row label="Total" value={formatMoney(order.totalPaise)} strong />
            </dl>
          </Card>

          {status === "ready_to_ship" ? (
            <Card title="Ship this order" description="Add the courier's tracking number. The customer gets it by SMS and email.">
              <form
                className="flex flex-col gap-2 sm:flex-row"
                onSubmit={(event) => {
                  event.preventDefault();
                  run("ship");
                }}
              >
                <label className="sm:w-44">
                  <span className="sr-only">Courier</span>
                  <select value={courier} onChange={(event) => setCourier(event.target.value)} className={cn(inputClass, "cursor-pointer")}>
                    {COURIERS.map((name) => (
                      <option key={name}>{name}</option>
                    ))}
                  </select>
                </label>
                <label className="flex-1">
                  <span className="sr-only">Tracking number</span>
                  <input ref={awbRef} value={awb} onChange={(event) => setAwb(event.target.value)} placeholder="Tracking number (AWB)" className={cn(inputClass, "uppercase placeholder:normal-case")} />
                </label>
                <button type="submit" disabled={pending || !awb.trim()} className={buttonClass.primary}>
                  <Truck className="size-4" strokeWidth={1.8} aria-hidden="true" />
                  Mark as shipped
                </button>
              </form>
            </Card>
          ) : tracking ? (
            <Card title="Shipment">
              <div className="-mt-1 flex flex-wrap items-center justify-between gap-3">
                <span className="flex items-center gap-3">
                  <span className="inline-flex size-10 items-center justify-center rounded-xl bg-adm-info-soft text-adm-info">
                    <Truck className="size-5" strokeWidth={1.7} aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block text-[13.5px] font-medium">{tracking.courier}</span>
                    <span className="block text-[12.5px] text-adm-ink-faint tabular-nums">AWB {tracking.awb}</span>
                  </span>
                </span>
                <button type="button" onClick={() => copy(tracking.awb)} className={buttonClass.secondary}>
                  <Copy className="size-4" strokeWidth={1.8} aria-hidden="true" />
                  Copy AWB
                </button>
              </div>
            </Card>
          ) : null}

          <Card title="Timeline">
            <form onSubmit={submitNote} className="-mt-1 mb-5 flex gap-2">
              <label className="flex-1">
                <span className="sr-only">Add a note</span>
                <input value={note} onChange={(event) => setNote(event.target.value)} maxLength={500} placeholder="Add a private note for your team" className={inputClass} />
              </label>
              <button type="submit" disabled={pending || !note.trim()} className={buttonClass.secondary}>
                Add note
              </button>
            </form>
            <ol className="relative flex flex-col gap-5 before:absolute before:top-1 before:bottom-1 before:left-[5px] before:w-px before:bg-adm-line">
              {[...events].reverse().map((event, index) => (
                <li key={`${event.at}-${index}`} className="relative flex gap-4 pl-6">
                  <span
                    aria-hidden="true"
                    className={cn("absolute top-1 left-0 size-[11px] rounded-full border-2 border-adm-surface", index === 0 ? "bg-adm-accent ring-3 ring-adm-accent/20" : "bg-adm-line-strong")}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium text-adm-ink">
                      {event.label}
                      {event.by ? <span className="font-normal text-adm-ink-faint"> · {event.by}</span> : null}
                    </p>
                    {event.note ? <p className="mt-0.5 text-[12.5px] text-adm-ink-soft">{event.note}</p> : null}
                  </div>
                  <time dateTime={event.at} className="shrink-0 text-[12px] text-adm-ink-faint tabular-nums">
                    {event.atLabel}
                  </time>
                </li>
              ))}
            </ol>
          </Card>
        </div>

        <div className="flex flex-col gap-6 lg:col-span-4">
          <Card
            title="Customer"
            action={
              <Link href={customerHref} className="inline-flex items-center gap-1 pt-0.5 text-[12px] font-medium text-adm-accent hover:underline">
                View profile
              </Link>
            }
          >
            <div className="-mt-1 flex items-center gap-3">
              <span className="inline-flex size-10 items-center justify-center rounded-full bg-adm-accent-soft text-[13px] font-semibold text-adm-accent">
                {order.customer.name
                  .split(" ")
                  .map((part) => part[0])
                  .join("")}
              </span>
              <span className="min-w-0">
                <span className="block text-[13.5px] font-medium">{order.customer.name}</span>
                <span className="block text-[12px] text-adm-ink-faint">
                  {order.customer.ordersCount === 1 ? "First order" : `${order.customer.ordersCount} orders`} · since {customerSince}
                </span>
              </span>
            </div>
            <ul className="mt-4 flex flex-col gap-2.5 text-[13px]">
              <li>
                <a href={`mailto:${order.customer.email}`} className="flex items-center gap-2.5 text-adm-ink-soft hover:text-adm-accent">
                  <Mail className="size-4 text-adm-ink-faint" strokeWidth={1.8} aria-hidden="true" />
                  <span className="truncate">{order.customer.email}</span>
                </a>
              </li>
              <li>
                <a href={`tel:${order.customer.phone.replace(/\s/g, "")}`} className="flex items-center gap-2.5 text-adm-ink-soft tabular-nums hover:text-adm-accent">
                  <Phone className="size-4 text-adm-ink-faint" strokeWidth={1.8} aria-hidden="true" />
                  {order.customer.phone}
                </a>
              </li>
            </ul>
          </Card>

          <Card
            title="Ship to"
            action={
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${order.shipping.line1}, ${order.shipping.city} ${order.shipping.pincode}`)}`}
                target="_blank"
                rel="noreferrer"
                aria-label="Open address in Google Maps"
                className="inline-flex size-7 items-center justify-center rounded-md text-adm-ink-faint hover:bg-adm-surface-muted hover:text-adm-ink"
              >
                <ExternalLink className="size-3.5" strokeWidth={2} aria-hidden="true" />
              </a>
            }
          >
            <address className="-mt-1 flex gap-2.5 text-[13px] leading-relaxed text-adm-ink-soft not-italic">
              <MapPin className="mt-0.5 size-4 shrink-0 text-adm-ink-faint" strokeWidth={1.8} aria-hidden="true" />
              <span>
                {order.customer.name}
                <br />
                {order.shipping.line1}
                <br />
                {order.shipping.city}, {order.shipping.state} {order.shipping.pincode}
              </span>
            </address>
          </Card>

          <Card title="Payment">
            <dl className="-mt-1 flex flex-col gap-2 text-[13px]">
              <div className="flex justify-between gap-4">
                <dt className="text-adm-ink-soft">Method</dt>
                <dd className="font-medium">{order.payment.method === "COD" ? "Cash on delivery" : order.payment.method}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-adm-ink-soft">Status</dt>
                <dd className={cn("font-medium", paymentMeta.className)}>{paymentMeta.label}</dd>
              </div>
              {order.payment.reference ? (
                <div className="flex justify-between gap-4">
                  <dt className="text-adm-ink-soft">Reference</dt>
                  <dd>
                    <button type="button" onClick={() => copy(order.payment.reference!)} className="inline-flex items-center gap-1.5 font-mono text-[12px] text-adm-ink-soft hover:text-adm-accent">
                      {order.payment.reference}
                      <Copy className="size-3" strokeWidth={2} aria-hidden="true" />
                    </button>
                  </dd>
                </div>
              ) : null}
              <div className="flex justify-between gap-4 border-t border-adm-line pt-2">
                <dt className="text-adm-ink-soft">{order.payment.method === "COD" && payment === "pending" ? "To collect" : "Amount"}</dt>
                <dd className="font-semibold tabular-nums">{formatMoney(order.totalPaise)}</dd>
              </div>
            </dl>
          </Card>

          {order.customerNote ? (
            <Card title="Note from customer">
              <p className="-mt-1 flex gap-2.5 text-[13px] text-adm-ink-soft">
                <MessageSquareText className="mt-0.5 size-4 shrink-0 text-adm-ink-faint" strokeWidth={1.8} aria-hidden="true" />
                {order.customerNote}
              </p>
            </Card>
          ) : null}
        </div>
      </div>
      {toast}
    </div>
  );
}
