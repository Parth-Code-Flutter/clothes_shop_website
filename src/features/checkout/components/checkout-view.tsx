"use client";

import Image from "next/image";
import Link from "next/link";
import { AlertCircle, ArrowLeft, ArrowRight, Check, Lock, PackageCheck, ShieldCheck, ShoppingBag, Truck } from "lucide-react";
import { type FormEvent, useRef, useState } from "react";
import { PreviewNotice } from "@/components/shared/preview-notice";
import { useCart } from "@/features/cart/cart-provider";
import cartStyles from "@/features/cart/components/cart-view.module.css";
import { CheckoutSteps } from "@/features/cart/components/checkout-steps";
import { cartSavingsPaise, FREE_SHIPPING_PAISE } from "@/features/cart/utils";
import { formatInrFromPaise } from "@/lib/money";
import { cn } from "@/lib/utils";
import styles from "./checkout-view.module.css";

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

type FieldMeta = {
  key: BillingField;
  label: string;
  autoComplete: string;
  type?: string;
  inputMode?: "numeric" | "tel" | "email";
  maxLength?: number;
  wide?: boolean;
};

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

const CONTACT_FIELDS: FieldMeta[] = [
  { key: "firstName", label: "First name", autoComplete: "given-name" },
  { key: "lastName", label: "Last name", autoComplete: "family-name" },
  { key: "email", label: "Email", autoComplete: "email", type: "email", inputMode: "email" },
  { key: "phone", label: "Phone", autoComplete: "tel", type: "tel", inputMode: "tel" },
];

const DELIVERY_FIELDS: FieldMeta[] = [
  { key: "address", label: "Address", autoComplete: "street-address", wide: true },
  { key: "city", label: "City", autoComplete: "address-level2" },
  { key: "state", label: "State", autoComplete: "address-level1" },
  { key: "pincode", label: "PIN code", autoComplete: "postal-code", inputMode: "numeric", maxLength: 6 },
];

const FIELD_ORDER = [...CONTACT_FIELDS, ...DELIVERY_FIELDS].map(({ key }) => key);

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function CheckoutView() {
  const { lines, itemCount, subtotalPaise } = useCart();
  const formRef = useRef<HTMLFormElement>(null);
  const [form, setForm] = useState<BillingForm>(INITIAL);
  const [promo, setPromo] = useState("");
  const [promoNote, setPromoNote] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<BillingForm>>({});
  const [submitted, setSubmitted] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const savingsPaise = cartSavingsPaise(lines);
  const freeDelivery = subtotalPaise >= FREE_SHIPPING_PAISE;
  const errorCount = Object.values(errors).filter(Boolean).length;
  const total = formatInrFromPaise(subtotalPaise);

  function updateField(key: BillingField, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  function validate() {
    const next: Partial<BillingForm> = {};
    for (const key of FIELD_ORDER) {
      if (!form[key].trim()) next[key] = "Required";
    }
    if (form.email.trim() && !isEmail(form.email.trim())) next.email = "Enter a valid email";
    if (form.phone.trim() && form.phone.replace(/\D/g, "").length < 10) next.phone = "Enter a valid 10-digit phone";
    if (form.pincode.trim() && !/^\d{6}$/.test(form.pincode.trim())) next.pincode = "Enter a 6-digit PIN";
    setErrors(next);
    return next;
  }

  function onApplyPromo() {
    setPromoNote(promo.trim() ? "Promo codes connect with live checkout. Nothing was applied or charged." : "Enter a code to preview.");
  }

  function onPay(event: FormEvent) {
    event.preventDefault();
    setSubmitted(true);
    const next = validate();
    const firstInvalid = FIELD_ORDER.find((key) => next[key]);
    if (firstInvalid) {
      const input = formRef.current?.elements.namedItem(firstInvalid);
      if (input instanceof HTMLInputElement) input.focus();
      return;
    }
    setPreview("Razorpay payment");
  }

  function renderField({ key, label, autoComplete, type, inputMode, maxLength, wide }: FieldMeta) {
    const errorId = `checkout-${key}-error`;
    return (
      <label key={key} className={cn(styles.field, wide && "sm:col-span-2")}>
        <span className={styles.label}>{label}</span>
        <input
          name={key}
          type={type ?? "text"}
          autoComplete={autoComplete}
          inputMode={inputMode}
          maxLength={maxLength}
          value={form[key]}
          onChange={(event) => updateField(key, event.target.value)}
          aria-invalid={Boolean(errors[key])}
          aria-describedby={errors[key] ? errorId : undefined}
          className={styles.input}
        />
        {errors[key] ? (
          <span id={errorId} className={styles.error}><AlertCircle size={12} aria-hidden="true" />{errors[key]}</span>
        ) : null}
      </label>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto w-full max-w-[1380px] px-4 pt-8 pb-16 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-5 border-b border-border pb-5">
          <div>
            <p className={cartStyles.eyebrow}>Your booking</p>
            <h1 className="mt-2 font-display text-5xl leading-none tracking-wide uppercase sm:text-6xl">Checkout</h1>
          </div>
          <CheckoutSteps current="details" />
        </div>
        <div className={cn(cartStyles.emptyWrap, "mt-10 max-w-3xl")}>
          <div className={cartStyles.empty}>
            <p className={cartStyles.emptyStub}>
              <ShoppingBag className="size-9" strokeWidth={1.5} aria-hidden="true" />
              <small>No seats booked</small>
            </p>
            <div className={cartStyles.emptyBody}>
              <p className="font-display text-3xl leading-none tracking-wide uppercase sm:text-4xl">Nothing to check out yet</p>
              <p className="mt-3 max-w-md text-sm leading-6 text-muted">Pick a piece and a size, and your booking opens here with everything ready to confirm.</p>
              <div className="mt-6">
                <Link href="/shop" className={cn(cartStyles.emptyCta, "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent")}>
                  Browse tonight&apos;s programme <ArrowRight size={15} aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto w-full max-w-[1380px] px-4 pt-8 pb-28 sm:px-6 lg:px-8 lg:pb-16">
        <div className="flex flex-wrap items-end justify-between gap-5 border-b border-border pb-5">
          <div>
            <p className={cartStyles.eyebrow}>Your booking</p>
            <h1 className="mt-2 font-display text-5xl leading-none tracking-wide uppercase sm:text-6xl">Checkout</h1>
            <p className="mt-2 text-xs text-muted">Two quick scenes, then your booking is ready.</p>
          </div>
          <CheckoutSteps current="details" />
        </div>

        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_400px]">
          <form ref={formRef} id="checkout-form" onSubmit={onPay} noValidate className="grid content-start gap-6">
            {submitted && errorCount > 0 ? (
              <p className={styles.alert} role="alert">
                <AlertCircle size={16} aria-hidden="true" />
                <span>Fill in the {errorCount === 1 ? "highlighted detail" : `${errorCount} highlighted details`} to continue.</span>
              </p>
            ) : null}

            <section className={styles.scene} aria-labelledby="scene-contact">
              <header className={styles.sceneHead}>
                <span className={styles.sceneNo}>Scene 01</span>
                <h2 id="scene-contact" className={styles.sceneTitle}>Contact</h2>
                <p className={styles.sceneNote}>Where we send your booking confirmation and delivery updates.</p>
              </header>
              <div className="grid gap-4 sm:grid-cols-2">{CONTACT_FIELDS.map(renderField)}</div>
            </section>

            <section className={styles.scene} aria-labelledby="scene-delivery">
              <header className={styles.sceneHead}>
                <span className={styles.sceneNo}>Scene 02</span>
                <h2 id="scene-delivery" className={styles.sceneTitle}>Delivery</h2>
                <p className={styles.sceneNote}>Your exact delivery date is confirmed from the PIN code.</p>
              </header>
              <div className="grid gap-4 sm:grid-cols-2">{DELIVERY_FIELDS.map(renderField)}</div>
            </section>

            <section className={styles.scene} aria-labelledby="scene-payment">
              <header className={styles.sceneHead}>
                <span className={styles.sceneNo}>Scene 03</span>
                <h2 id="scene-payment" className={styles.sceneTitle}>Payment</h2>
                <p className={styles.sceneNote}>This preview opens no payment session and places no order.</p>
              </header>
              <label className={styles.pay}>
                <input type="radio" name="payment" value="razorpay" defaultChecked className="sr-only" />
                <span className={styles.payDot} aria-hidden="true"><Check size={13} strokeWidth={3} /></span>
                <span>
                  <span className={cn(styles.payName, "block")}>Razorpay</span>
                  <span className={cn(styles.payNote, "block")}>Secure payment by Razorpay on the live store</span>
                </span>
                <span className={styles.payTag}>Preview · no charge</span>
              </label>

              <div className="mt-6">
                <div className={styles.promo}>
                  <span className={styles.promoStub} aria-hidden="true">Pass code</span>
                  <input
                    value={promo}
                    onChange={(event) => {
                      setPromo(event.target.value);
                      setPromoNote(null);
                    }}
                    aria-label="Promo code"
                    placeholder="Have a promo code?"
                    className={styles.promoInput}
                  />
                  <button type="button" onClick={onApplyPromo} className={cn(styles.promoApply, "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent")}>Apply</button>
                </div>
                {promoNote ? <p className="mt-2 text-xs leading-5 text-muted" role="status">{promoNote}</p> : null}
              </div>
            </section>
          </form>

          <aside className={cn(cartStyles.receipt, "h-fit lg:sticky lg:top-24")} aria-labelledby="checkout-summary-title">
            <div className={cartStyles.receiptTop}>
              <p className={cartStyles.eyebrow}>Box office</p>
              <h2 id="checkout-summary-title" className="mt-2 font-display text-4xl leading-none tracking-wide uppercase">Order summary</h2>
              <ul className="mt-6">
                {lines.map((line) => (
                  <li key={`${line.productId}-${line.size ?? "os"}`} className={styles.mini}>
                    <Link href={`/product/${line.slug}`} aria-label={`View ${line.name}`} className={cn(styles.miniPoster, "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent")}>
                      <Image src={line.image} alt={line.alt} fill sizes="50px" className="object-cover" />
                    </Link>
                    <div className="min-w-0">
                      <p className={cn(styles.miniName, "line-clamp-2")}>{line.name}</p>
                      <p className={styles.miniMeta}>Size {line.size ?? "One size"} · Qty {line.quantity}</p>
                    </div>
                    <p className={styles.miniPrice}>{formatInrFromPaise(line.pricePaise * line.quantity)}</p>
                  </li>
                ))}
              </ul>
              <dl className="mt-6 border-t border-dashed border-[var(--hairline)] pt-5">
                {savingsPaise > 0 ? (
                  <>
                    <div className={cartStyles.receiptRow}><dt>Total MRP</dt><dd>{formatInrFromPaise(subtotalPaise + savingsPaise)}</dd></div>
                    <div className={cn(cartStyles.receiptRow, cartStyles.saving)}><dt>Discount on MRP</dt><dd>−{formatInrFromPaise(savingsPaise)}</dd></div>
                  </>
                ) : null}
                <div className={cartStyles.receiptRow}><dt>Subtotal · {itemCount} {itemCount === 1 ? "piece" : "pieces"}</dt><dd>{total}</dd></div>
                <div className={cartStyles.receiptRow}><dt>Delivery</dt><dd>{freeDelivery ? "Free" : "Confirmed later"}</dd></div>
              </dl>
            </div>
            <div className={cartStyles.receiptBottom}>
              <p className={cartStyles.total}><span>Total due</span><strong>{total}</strong></p>
              {savingsPaise > 0 ? <p className="mt-2 text-right text-[11px] font-semibold text-accent">You save {formatInrFromPaise(savingsPaise)} on this booking</p> : null}
              <button type="submit" form="checkout-form" className={cn(cartStyles.cta, "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent")}>
                <Lock size={15} aria-hidden="true" /> Pay {total}
              </button>
              <Link href="/cart" className={cn(styles.back, "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent")}>
                <ArrowLeft size={14} aria-hidden="true" /> Back to bag
              </Link>
              <ul className={cartStyles.assure}>
                <li><ShieldCheck size={15} aria-hidden="true" /> Preview checkout · no charge, no order placed</li>
                <li><Truck size={15} aria-hidden="true" /> Delivery date confirmed from your PIN code</li>
                <li><PackageCheck size={15} aria-hidden="true" /> Easy returns within 14 days</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>

      <div className={cn(styles.mobileBar, "fixed inset-x-0 bottom-0 z-40 px-4 py-3 backdrop-blur lg:hidden")}>
        <div className="flex items-center gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-[9px] font-bold tracking-[0.2em] text-muted uppercase">Total due · {itemCount} {itemCount === 1 ? "piece" : "pieces"}</p>
            <p className={styles.barTotal}>{total}</p>
          </div>
          <button type="submit" form="checkout-form" className={cn(cartStyles.cta, styles.barCta, "shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent")}>
            <Lock size={14} aria-hidden="true" /> Pay now
          </button>
        </div>
      </div>

      <PreviewNotice
        open={preview !== null}
        action={preview ?? ""}
        onClose={() => setPreview(null)}
      />
    </>
  );
}
