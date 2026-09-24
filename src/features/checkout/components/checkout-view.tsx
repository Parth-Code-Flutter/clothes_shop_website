"use client";

import Image from "next/image";
import Link from "next/link";
import { type FormEvent, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { PreviewNotice } from "@/components/shared/preview-notice";
import { useCart } from "@/features/cart/cart-provider";
import { formatInrFromPaise } from "@/lib/money";
import { cn } from "@/lib/utils";

type BillingField =
  | "firstName"
  | "lastName"
  | "email"
  | "phone"
  | "address"
  | "city"
  | "state"
  | "pincode";

type BillingForm = Record<BillingField, string>;

const INITIAL: BillingForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
};

const FIELD_META: {
  key: BillingField;
  label: string;
  autoComplete: string;
  type?: string;
}[] = [
  { key: "firstName", label: "First name", autoComplete: "given-name" },
  { key: "lastName", label: "Last name", autoComplete: "family-name" },
  {
    key: "email",
    label: "Email",
    autoComplete: "email",
    type: "email",
  },
  { key: "phone", label: "Phone", autoComplete: "tel", type: "tel" },
  {
    key: "address",
    label: "Address",
    autoComplete: "street-address",
  },
  { key: "city", label: "City", autoComplete: "address-level2" },
  { key: "state", label: "State", autoComplete: "address-level1" },
  { key: "pincode", label: "PIN code", autoComplete: "postal-code" },
];

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function CheckoutView() {
  const { lines, itemCount, subtotalPaise } = useCart();
  const [form, setForm] = useState<BillingForm>(INITIAL);
  const [promo, setPromo] = useState("");
  const [promoNote, setPromoNote] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<BillingForm>>({});
  const [preview, setPreview] = useState<string | null>(null);

  const incomplete = useMemo(
    () => FIELD_META.some(({ key }) => !form[key].trim()),
    [form],
  );

  function updateField(key: BillingField, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  function validate(): boolean {
    const next: Partial<BillingForm> = {};
    for (const { key } of FIELD_META) {
      if (!form[key].trim()) next[key] = "Required";
    }
    if (form.email.trim() && !isEmail(form.email.trim())) {
      next.email = "Enter a valid email";
    }
    if (form.phone.trim() && form.phone.replace(/\D/g, "").length < 10) {
      next.phone = "Enter a valid phone";
    }
    if (form.pincode.trim() && !/^\d{6}$/.test(form.pincode.trim())) {
      next.pincode = "Enter a 6-digit PIN";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function onApplyPromo() {
    if (!promo.trim()) {
      setPromoNote("Enter a code to preview.");
      return;
    }
    setPromoNote(
      "Promo codes are not connected yet. Nothing was applied or charged.",
    );
  }

  function onPay(event: FormEvent) {
    event.preventDefault();
    if (!validate()) return;
    setPreview("Razorpay payment");
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center px-4 py-20 text-center sm:px-6">
        <p className="text-xs font-semibold tracking-[0.28em] text-accent uppercase">
          Checkout
        </p>
        <h1 className="mt-3 font-display text-5xl tracking-tight text-foreground sm:text-6xl">
          Bag is empty
        </h1>
        <p className="mt-4 max-w-md text-sm leading-6 text-muted">
          Add a drop to your bag before checkout.
        </p>
        <Link
          href="/shop"
          className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-accent px-6 text-sm font-semibold text-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Shop the drop
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[1.2fr_0.8fr] lg:px-10">
        <form id="checkout-form" onSubmit={onPay} className="space-y-8" noValidate>
          <div>
            <p className="text-xs font-semibold tracking-[0.28em] text-accent uppercase">
              Checkout
            </p>
            <h1 className="mt-3 font-display text-5xl tracking-tight text-foreground">
              Lock the fit
            </h1>
            <p className="mt-3 text-sm text-muted">
              Billing details stay on this device for now. Razorpay is preview
              only — no charge, no order placed.
            </p>
          </div>

          <fieldset className="grid gap-4 sm:grid-cols-2">
            <legend className="sr-only">Billing details</legend>
            {FIELD_META.map(({ key, label, autoComplete, type }) => (
              <label
                key={key}
                className={cn(
                  "flex flex-col gap-2 text-sm",
                  key === "address" && "sm:col-span-2",
                )}
              >
                <span className="font-medium text-foreground">{label}</span>
                <input
                  name={key}
                  type={type ?? "text"}
                  autoComplete={autoComplete}
                  value={form[key]}
                  onChange={(event) => updateField(key, event.target.value)}
                  aria-invalid={Boolean(errors[key])}
                  className={cn(
                    "h-12 rounded-full border bg-surface px-4 text-foreground outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                    errors[key] ? "border-accent" : "border-border",
                  )}
                />
                {errors[key] ? (
                  <span className="text-xs text-accent">{errors[key]}</span>
                ) : null}
              </label>
            ))}
          </fieldset>

          <div className="rounded-3xl border border-border bg-surface p-5">
            <p className="font-display text-2xl tracking-wide text-foreground">
              Promo code
            </p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <input
                value={promo}
                onChange={(event) => {
                  setPromo(event.target.value);
                  setPromoNote(null);
                }}
                placeholder="Enter code"
                className="h-12 flex-1 rounded-full border border-border bg-background px-4 text-sm text-foreground outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              />
              <Button type="button" variant="secondary" onClick={onApplyPromo}>
                Apply
              </Button>
            </div>
            {promoNote ? (
              <p className="mt-3 text-xs leading-5 text-muted" role="status">
                {promoNote}
              </p>
            ) : null}
          </div>

          <div className="rounded-3xl border border-border bg-surface p-5">
            <p className="font-display text-2xl tracking-wide text-foreground">
              Payment
            </p>
            <p className="mt-2 text-sm leading-6 text-muted">
              Razorpay is listed on the live store. This preview does not open a
              payment session or create an order.
            </p>
            <label className="mt-4 flex items-center gap-3 rounded-2xl border border-accent/40 bg-accent/5 px-4 py-3 text-sm text-foreground">
              <input
                type="radio"
                name="payment"
                defaultChecked
                className="accent-[var(--accent)]"
              />
              Razorpay
            </label>
          </div>
        </form>

        <aside className="h-fit rounded-3xl border border-border bg-surface p-6 lg:sticky lg:top-28">
          <p className="font-display text-3xl tracking-wide text-foreground">
            Order summary
          </p>
          <p className="mt-1 text-sm text-muted">
            {itemCount} {itemCount === 1 ? "piece" : "pieces"}
          </p>

          <ul className="mt-6 space-y-4">
            {lines.map((line) => (
              <li key={line.productId} className="flex gap-3">
                <div className="relative h-16 w-12 shrink-0 overflow-hidden bg-[#0a0705]">
                  <Image
                    src={line.image}
                    alt={line.alt}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {line.name}
                  </p>
                  <p className="text-xs text-muted">Qty {line.quantity}</p>
                </div>
                <p className="text-sm font-semibold text-foreground">
                  {formatInrFromPaise(line.pricePaise * line.quantity)}
                </p>
              </li>
            ))}
          </ul>

          <dl className="mt-6 space-y-3 border-t border-border pt-4 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Subtotal</dt>
              <dd className="font-semibold text-foreground">
                {formatInrFromPaise(subtotalPaise)}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Shipping</dt>
              <dd className="text-muted">Confirmed later</dd>
            </div>
            <div className="flex justify-between gap-4 text-base">
              <dt className="font-medium text-foreground">Total due</dt>
              <dd className="font-semibold text-foreground">
                {formatInrFromPaise(subtotalPaise)}
              </dd>
            </div>
          </dl>

          <Button
            type="submit"
            form="checkout-form"
            className="mt-8 w-full"
            disabled={incomplete}
          >
            Pay with Razorpay
          </Button>
          <Link
            href="/cart"
            className="mt-3 inline-flex h-12 w-full items-center justify-center rounded-full border border-border text-sm font-semibold text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Back to bag
          </Link>
        </aside>
      </div>

      <PreviewNotice
        open={preview !== null}
        action={preview ?? ""}
        onClose={() => setPreview(null)}
      />
    </>
  );
}
