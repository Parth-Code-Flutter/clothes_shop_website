"use client";

import Link from "next/link";
import { useRef, useState, type ReactNode } from "react";
import { Check, Info, Minus, Plus, ShieldCheck, TriangleAlert, X } from "lucide-react";
import { adminThemes, type AdminThemeName } from "@/features/admin/config/admin-brand";
import { FieldError, RupeeInput, SettingsForm, ToggleRow, type SettingsContext } from "@/features/admin/components/settings/settings-form";
import { Card, Field, buttonClass, inputClass } from "@/features/admin/components/ui";
import { formatMoney, formatRelative } from "@/features/admin/lib/format";
import {
  ALERT_META,
  CUSTOMER_EMAILS,
  CUSTOMER_EMAIL_META,
  INDIAN_STATES,
  OWNER_ALERTS,
  PERMISSIONS,
  ROLE_META,
  STAFF_ROLES,
  gstFor,
  type SettingsSection,
  type SettingsValues,
  type StaffRole,
} from "@/features/admin/lib/settings-meta";
import { cn } from "@/lib/utils";

function Note({ children, tone = "info" }: { children: ReactNode; tone?: "info" | "warning" }) {
  return (
    <p
      className={cn(
        "flex gap-2 rounded-xl border px-3.5 py-3 text-[12px] leading-relaxed",
        tone === "info" ? "border-adm-line bg-adm-surface-muted/50 text-adm-ink-soft" : "border-adm-warning/25 bg-adm-warning-soft text-adm-warning",
      )}
    >
      {tone === "info" ? (
        <Info className="mt-0.5 size-3.5 shrink-0 text-adm-info" strokeWidth={2} aria-hidden="true" />
      ) : (
        <TriangleAlert className="mt-0.5 size-3.5 shrink-0" strokeWidth={2} aria-hidden="true" />
      )}
      <span>{children}</span>
    </p>
  );
}

function textField<T extends Record<string, unknown>>(
  ctx: SettingsContext<T>,
  key: keyof T & string,
  label: string,
  options: { hint?: string; placeholder?: string; max?: number; className?: string; transform?: (value: string) => string; type?: string } = {},
) {
  return (
    <Field label={label} htmlFor={ctx.id(key)} error={ctx.errors[key]} hint={options.hint} className={options.className}>
      <input
        id={ctx.id(key)}
        type={options.type ?? "text"}
        value={String(ctx.values[key] ?? "")}
        maxLength={options.max}
        placeholder={options.placeholder}
        onChange={(event) => ctx.patch({ [key]: options.transform ? options.transform(event.target.value) : event.target.value } as Partial<T>)}
        className={inputClass}
        {...ctx.aria(key)}
      />
    </Field>
  );
}

// Store -----------------------------------------------------------------------

function StoreSettings({ initial }: { initial: SettingsValues["store"] }) {
  return (
    <SettingsForm
      section="store"
      initial={initial}
      aside={({ values }) => (
        <Card title="On invoices and packing slips">
          <div className="rounded-xl border border-adm-line px-4 py-3.5 text-[12.5px] leading-relaxed">
            <p className="text-[14px] font-semibold">{values.legalName || values.name || "Store name"}</p>
            <p className="text-adm-ink-soft">{[values.line1, values.line2].filter(Boolean).join(", ")}</p>
            <p className="text-adm-ink-soft">
              {values.city}
              {values.city && values.state ? ", " : ""}
              {values.state} {values.pincode}
            </p>
            <p className="mt-1.5 text-adm-ink-soft">
              {values.phone} · {values.email}
            </p>
            <p className={cn("mt-1.5 font-mono text-[11.5px]", values.gstin ? "text-adm-ink" : "text-adm-warning")}>GSTIN: {values.gstin || "not added"}</p>
            <p className="mt-3 border-t border-adm-line pt-2.5 text-adm-ink-faint">
              Order <span className="font-medium text-adm-ink tabular-nums">#{values.orderPrefix || "HB"}-10601</span>
            </p>
          </div>
        </Card>
      )}
    >
      {(ctx) => (
        <>
          <Card title="Store" description="How customers see and reach you.">
            <div className="grid gap-4 sm:grid-cols-2">
              {textField(ctx, "name", "Store name", { max: 60 })}
              {textField(ctx, "legalName", "Legal business name", { max: 100, hint: "Shown on invoices when it differs from the store name." })}
              {textField(ctx, "email", "Customer support email", { type: "email", max: 120 })}
              {textField(ctx, "phone", "Customer support phone", { type: "tel", max: 20 })}
            </div>
          </Card>
          <Card title="Business address" description="Your return address and the place of supply for GST.">
            <div className="grid gap-4 sm:grid-cols-2">
              {textField(ctx, "line1", "Address", { max: 120, className: "sm:col-span-2" })}
              {textField(ctx, "line2", "Area or landmark", { max: 120, className: "sm:col-span-2" })}
              {textField(ctx, "city", "City", { max: 60 })}
              <Field label="State" htmlFor={ctx.id("state")} error={ctx.errors.state}>
                <select id={ctx.id("state")} value={ctx.values.state} onChange={(event) => ctx.patch({ state: event.target.value })} className={cn(inputClass, "cursor-pointer")} {...ctx.aria("state")}>
                  <option value="">Choose a state</option>
                  {INDIAN_STATES.map((state) => (
                    <option key={state}>{state}</option>
                  ))}
                </select>
              </Field>
              {textField(ctx, "pincode", "PIN code", { max: 6, transform: (value) => value.replace(/\D/g, "") })}
              {textField(ctx, "gstin", "GSTIN", { max: 15, placeholder: "24ABCDE1234F1Z5", transform: (value) => value.toUpperCase().replace(/\s/g, ""), hint: "Needed to charge GST and print tax invoices." })}
            </div>
          </Card>
          <Card title="Order numbers">
            <div className="grid gap-4 sm:grid-cols-2">
              {textField(ctx, "orderPrefix", "Prefix", { max: 4, transform: (value) => value.toUpperCase().replace(/[^A-Z]/g, ""), hint: `New orders read #${ctx.values.orderPrefix || "HB"}-10601. Past orders keep their numbers.` })}
            </div>
          </Card>
        </>
      )}
    </SettingsForm>
  );
}

// Branding --------------------------------------------------------------------

function ThemePreview({ theme }: { theme: AdminThemeName }) {
  const palette = adminThemes[theme].light;
  return (
    <span className="flex h-16 overflow-hidden rounded-lg border border-adm-line" style={{ background: palette.canvas }} aria-hidden="true">
      <span className="flex w-1/4 flex-col gap-1 p-1.5" style={{ background: palette.sidebar, borderRight: `1px solid ${palette.sidebarLine}` }}>
        <span className="h-1.5 w-3/4 rounded-full" style={{ background: palette.sidebarAccent }} />
        <span className="h-1 w-full rounded-full opacity-40" style={{ background: palette.sidebarInk }} />
        <span className="h-1 w-2/3 rounded-full opacity-40" style={{ background: palette.sidebarInk }} />
      </span>
      <span className="flex flex-1 flex-col gap-1.5 p-2">
        <span className="flex-1 rounded" style={{ background: palette.surface, border: `1px solid ${palette.line}` }} />
        <span className="flex gap-1">
          <span className="h-2 w-8 rounded-sm" style={{ background: palette.accent }} />
          <span className="h-2 w-5 rounded-sm" style={{ background: palette.accentSoft }} />
        </span>
      </span>
    </span>
  );
}

function BrandingSettings({ initial }: { initial: SettingsValues["branding"] }) {
  return (
    <SettingsForm section="branding" initial={initial}>
      {(ctx) => (
        <>
          <Card title="Colour theme" description="Each theme has a light and dark version. Staff can switch modes from the top bar.">
            <fieldset>
              <legend className="sr-only">Colour theme</legend>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {(Object.keys(adminThemes) as AdminThemeName[]).map((theme) => {
                  const selected = ctx.values.theme === theme;
                  return (
                    <label
                      key={theme}
                      className={cn(
                        "flex cursor-pointer flex-col gap-2.5 rounded-xl border p-2.5 transition-colors has-focus-visible:outline-2 has-focus-visible:outline-adm-accent",
                        selected ? "border-adm-accent bg-adm-accent-soft/50" : "border-adm-line hover:border-adm-line-strong",
                      )}
                    >
                      <input type="radio" name="theme" value={theme} checked={selected} onChange={() => ctx.patch({ theme })} className="sr-only" />
                      <ThemePreview theme={theme} />
                      <span className="flex items-center justify-between px-0.5 text-[13px] font-medium">
                        {adminThemes[theme].label}
                        {selected ? <Check className="size-4 text-adm-accent" strokeWidth={2.2} aria-hidden="true" /> : null}
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
            <FieldError id={ctx.id("theme")} message={ctx.errors.theme} />
          </Card>
          <Card title="Logo mark and name" description="Shown in the sidebar and on the sign-in page.">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              <span className="inline-flex size-14 shrink-0 items-center justify-center rounded-2xl bg-adm-accent text-[18px] font-semibold tracking-tight text-adm-accent-ink" aria-hidden="true">
                {ctx.values.monogram || "?"}
              </span>
              <div className="grid flex-1 gap-4 sm:grid-cols-2">
                {textField(ctx, "monogram", "Monogram", { max: 2, transform: (value) => value.toUpperCase().replace(/[^A-Z0-9]/g, ""), hint: "One or two letters." })}
                {textField(ctx, "consoleLabel", "Console name", { max: 30, hint: "The line under the store name." })}
              </div>
            </div>
          </Card>
          <Note>
            The console uses the theme set in <code className="font-mono">admin-brand.ts</code> until settings are stored in a database. Changes here are checked but not applied yet.
          </Note>
        </>
      )}
    </SettingsForm>
  );
}

// Payments --------------------------------------------------------------------

const METHODS = [
  { key: "upi", label: "UPI", hint: "Google Pay, PhonePe, Paytm and any UPI app" },
  { key: "card", label: "Credit and debit cards", hint: "Visa, Mastercard, RuPay" },
  { key: "netBanking", label: "Net banking", hint: "All major Indian banks" },
] as const;

function PaymentSettings({ initial }: { initial: SettingsValues["payments"] }) {
  return (
    <SettingsForm
      section="payments"
      initial={initial}
      aside={({ values }) => (
        <>
          <Card title="At checkout">
            <ul className="flex flex-col gap-2 text-[13px]">
              {[...METHODS.filter((method) => values[method.key]).map((method) => method.label), ...(values.cod ? ["Cash on delivery"] : [])].map((label) => (
                <li key={label} className="flex items-center gap-2.5 rounded-lg border border-adm-line px-3 py-2">
                  <span className="size-3.5 rounded-full border-2 border-adm-line-strong" aria-hidden="true" />
                  {label}
                </li>
              ))}
            </ul>
            {values.cod && (values.codFeePaise > 0 || values.codMaxPaise > 0) ? (
              <p className="mt-3 text-[12px] text-adm-ink-faint">
                Cash on delivery
                {values.codFeePaise > 0 ? ` adds ${formatMoney(values.codFeePaise)}` : ""}
                {values.codFeePaise > 0 && values.codMaxPaise > 0 ? " and" : ""}
                {values.codMaxPaise > 0 ? ` is hidden above ${formatMoney(values.codMaxPaise)}` : ""}.
              </p>
            ) : null}
          </Card>
          <Card title="Payment provider">
            <div className="flex items-start gap-3">
              <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-adm-surface-muted text-adm-ink-faint">
                <ShieldCheck className="size-4.5" strokeWidth={1.7} aria-hidden="true" />
              </span>
              <div>
                <p className="text-[13px] font-medium">Not connected</p>
                <p className="mt-0.5 text-[12px] leading-relaxed text-adm-ink-faint">Online payments need a provider such as Razorpay or Cashfree. Their keys go in environment variables, not here.</p>
              </div>
            </div>
          </Card>
        </>
      )}
    >
      {(ctx) => (
        <>
          <Card title="Pay online">
            <div className="-my-3 divide-y divide-adm-line">
              {METHODS.map((method) => (
                <ToggleRow key={method.key} label={method.label} hint={method.hint} checked={ctx.values[method.key]} onChange={(checked) => ctx.patch({ [method.key]: checked })} />
              ))}
            </div>
            <FieldError id={ctx.id("methods")} message={ctx.errors.methods} />
          </Card>
          <Card title="Cash on delivery">
            <div className="-mt-3 divide-y divide-adm-line">
              <ToggleRow label="Offer cash on delivery" hint="Customers pay the courier in cash or by UPI at the door." checked={ctx.values.cod} onChange={(cod) => ctx.patch({ cod })} />
              {ctx.values.cod ? (
                <div className="grid gap-4 pt-4 sm:grid-cols-2">
                  <Field label="Extra fee" htmlFor={ctx.id("codFeePaise")} error={ctx.errors.codFeePaise} hint="0 for no fee. A small fee nudges people to pay online.">
                    <RupeeInput id={ctx.id("codFeePaise")} valuePaise={ctx.values.codFeePaise} onChange={(codFeePaise) => ctx.patch({ codFeePaise })} {...ctx.aria("codFeePaise")} />
                  </Field>
                  <Field label="Hide for orders above" htmlFor={ctx.id("codMaxPaise")} error={ctx.errors.codMaxPaise} hint="0 for no limit. Limits losses from refused parcels.">
                    <RupeeInput id={ctx.id("codMaxPaise")} valuePaise={ctx.values.codMaxPaise} onChange={(codMaxPaise) => ctx.patch({ codMaxPaise })} {...ctx.aria("codMaxPaise")} />
                  </Field>
                </div>
              ) : null}
            </div>
          </Card>
        </>
      )}
    </SettingsForm>
  );
}

// Shipping --------------------------------------------------------------------

function DaysInputs({ ctx, prefix, min, max, onChange }: { ctx: SettingsContext<SettingsValues["shipping"]>; prefix: string; min: number; max: number; onChange: (days: { minDays: number; maxDays: number }) => void }) {
  return (
    <Field label="Delivery time" htmlFor={ctx.id(`${prefix}.days`)} error={ctx.errors[`${prefix}.days`]}>
      <div className="flex items-center gap-2">
        <input
          id={ctx.id(`${prefix}.days`)}
          type="number"
          min={1}
          max={30}
          value={min}
          onChange={(event) => onChange({ minDays: Number(event.target.value), maxDays: max })}
          aria-label="Earliest day"
          className={cn(inputClass, "w-16 tabular-nums")}
          {...ctx.aria(`${prefix}.days`)}
        />
        <span className="text-[12.5px] text-adm-ink-faint">to</span>
        <input
          type="number"
          min={1}
          max={30}
          value={max}
          onChange={(event) => onChange({ minDays: min, maxDays: Number(event.target.value) })}
          aria-label="Latest day"
          className={cn(inputClass, "w-16 tabular-nums")}
        />
        <span className="text-[12.5px] text-adm-ink-faint">days</span>
      </div>
    </Field>
  );
}

function ShippingSettings({ initial }: { initial: SettingsValues["shipping"] }) {
  const nextId = useRef(initial.zones.length + 1);
  return (
    <SettingsForm
      section="shipping"
      initial={initial}
      aside={({ values }) => {
        const lines = [
          ...values.zones.map((zone) => ({ key: zone.id, name: zone.name || "Unnamed zone", rate: zone.ratePaise, min: zone.minDays, max: zone.maxDays })),
          { key: "rest", name: values.zones.length ? "Rest of India" : "All of India", rate: values.restOfIndia.ratePaise, min: values.restOfIndia.minDays, max: values.restOfIndia.maxDays },
        ];
        return (
          <Card title="What customers see">
            <ul className="flex flex-col divide-y divide-adm-line text-[13px]">
              {lines.map((line) => (
                <li key={line.key} className="flex items-baseline justify-between gap-3 py-2 first:pt-0">
                  <span>
                    <span className="block font-medium">{line.name}</span>
                    <span className="block text-[12px] text-adm-ink-faint">
                      Arrives in {line.min + values.processingDays}–{line.max + values.processingDays} days
                    </span>
                  </span>
                  <span className="tabular-nums">{line.rate ? formatMoney(line.rate) : "Free"}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 rounded-lg bg-adm-success-soft px-3 py-2 text-[12px] text-adm-success">
              {values.freeShippingFromPaise ? `Free delivery on orders of ${formatMoney(values.freeShippingFromPaise)} or more.` : "Delivery is free on every order."}
            </p>
            <p className="mt-3 text-[12px] text-adm-ink-faint">Arrival times include {values.processingDays === 1 ? "1 day" : `${values.processingDays} days`} to pack.</p>
          </Card>
        );
      }}
    >
      {(ctx) => {
        const claimed = new Set(ctx.values.zones.flatMap((zone) => zone.states));
        const setZone = (index: number, update: Partial<SettingsValues["shipping"]["zones"][number]>) =>
          ctx.set((current) => ({ ...current, zones: current.zones.map((zone, at) => (at === index ? { ...zone, ...update } : zone)) }));
        return (
          <>
            <Card title="General">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Free delivery from" htmlFor={ctx.id("freeShippingFromPaise")} error={ctx.errors.freeShippingFromPaise} hint="Order value after discounts. 0 makes delivery always free.">
                  <RupeeInput id={ctx.id("freeShippingFromPaise")} valuePaise={ctx.values.freeShippingFromPaise} onChange={(freeShippingFromPaise) => ctx.patch({ freeShippingFromPaise })} {...ctx.aria("freeShippingFromPaise")} />
                </Field>
                <Field label="Days to pack an order" htmlFor={ctx.id("processingDays")} error={ctx.errors.processingDays} hint="Added to every delivery estimate.">
                  <input
                    id={ctx.id("processingDays")}
                    type="number"
                    min={0}
                    max={10}
                    value={ctx.values.processingDays}
                    onChange={(event) => ctx.patch({ processingDays: Number(event.target.value) })}
                    className={cn(inputClass, "tabular-nums")}
                    {...ctx.aria("processingDays")}
                  />
                </Field>
              </div>
            </Card>

            <Card
              title="Delivery zones"
              description="Charge less or deliver faster to nearby states. Each state can be in one zone."
              action={
                <button
                  type="button"
                  onClick={() => ctx.set((current) => ({ ...current, zones: [...current.zones, { id: `z-new-${nextId.current++}`, name: "", states: [], ratePaise: current.restOfIndia.ratePaise, minDays: 2, maxDays: 5 }] }))}
                  disabled={ctx.values.zones.length >= 10}
                  className={cn(buttonClass.secondary, "h-8")}
                >
                  <Plus className="size-3.5" strokeWidth={2} aria-hidden="true" />
                  Add zone
                </button>
              }
            >
              {ctx.values.zones.length === 0 ? <p className="text-[13px] text-adm-ink-faint">No zones. Every order uses the rest-of-India rate.</p> : null}
              <ol className="flex flex-col gap-4">
                {ctx.values.zones.map((zone, index) => {
                  const prefix = `zone.${index}`;
                  const available = INDIAN_STATES.filter((state) => !claimed.has(state));
                  return (
                    <li key={zone.id} className="rounded-xl border border-adm-line p-4">
                      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_140px_auto_auto] sm:items-start">
                        <Field label="Zone name" htmlFor={ctx.id(`${prefix}.name`)} error={ctx.errors[`${prefix}.name`]}>
                          <input id={ctx.id(`${prefix}.name`)} value={zone.name} maxLength={40} placeholder="e.g. West India" onChange={(event) => setZone(index, { name: event.target.value })} className={inputClass} {...ctx.aria(`${prefix}.name`)} />
                        </Field>
                        <Field label="Rate" htmlFor={ctx.id(`${prefix}.rate`)} error={ctx.errors[`${prefix}.rate`]}>
                          <RupeeInput id={ctx.id(`${prefix}.rate`)} valuePaise={zone.ratePaise} onChange={(ratePaise) => setZone(index, { ratePaise })} {...ctx.aria(`${prefix}.rate`)} />
                        </Field>
                        <DaysInputs ctx={ctx} prefix={prefix} min={zone.minDays} max={zone.maxDays} onChange={(days) => setZone(index, days)} />
                        <button
                          type="button"
                          onClick={() => ctx.set((current) => ({ ...current, zones: current.zones.filter((entry) => entry.id !== zone.id) }))}
                          className={cn(buttonClass.ghost, "self-end text-adm-ink-faint hover:bg-adm-danger-soft hover:text-adm-danger sm:mb-0")}
                          aria-label={`Remove ${zone.name || "zone"}`}
                        >
                          <X className="size-4" strokeWidth={2} aria-hidden="true" />
                        </button>
                      </div>
                      <div className="mt-4">
                        <p className="text-[12.5px] font-medium">States</p>
                        <div className="mt-2 flex flex-wrap items-center gap-1.5">
                          {zone.states.map((state) => (
                            <span key={state} className="inline-flex items-center gap-1 rounded-full border border-adm-line bg-adm-surface-muted py-0.5 pr-1 pl-2.5 text-[12px]">
                              {state}
                              <button
                                type="button"
                                onClick={() => setZone(index, { states: zone.states.filter((entry) => entry !== state) })}
                                aria-label={`Remove ${state}`}
                                className="inline-flex size-4.5 items-center justify-center rounded-full text-adm-ink-faint hover:bg-adm-line hover:text-adm-ink"
                              >
                                <X className="size-3" strokeWidth={2.2} aria-hidden="true" />
                              </button>
                            </span>
                          ))}
                          <select
                            value=""
                            onChange={(event) => event.target.value && setZone(index, { states: [...zone.states, event.target.value] })}
                            aria-label={`Add a state to ${zone.name || "this zone"}`}
                            className="h-7 cursor-pointer rounded-full border border-dashed border-adm-line-strong bg-transparent px-2.5 text-[12px] text-adm-ink-soft outline-none hover:border-adm-accent focus-visible:border-adm-accent"
                            {...ctx.aria(`${prefix}.states`)}
                          >
                            <option value="">+ Add state</option>
                            {available.map((state) => (
                              <option key={state}>{state}</option>
                            ))}
                          </select>
                        </div>
                        <FieldError id={ctx.id(`${prefix}.states`)} message={ctx.errors[`${prefix}.states`]} />
                      </div>
                    </li>
                  );
                })}
              </ol>
            </Card>

            <Card title={ctx.values.zones.length ? "Rest of India" : "All of India"} description="Every state not in a zone above.">
              <div className="grid gap-4 sm:grid-cols-[140px_auto]">
                <Field label="Rate" htmlFor={ctx.id("rest.rate")} error={ctx.errors["rest.rate"]}>
                  <RupeeInput id={ctx.id("rest.rate")} valuePaise={ctx.values.restOfIndia.ratePaise} onChange={(ratePaise) => ctx.set((current) => ({ ...current, restOfIndia: { ...current.restOfIndia, ratePaise } }))} {...ctx.aria("rest.rate")} />
                </Field>
                <DaysInputs
                  ctx={ctx}
                  prefix="rest"
                  min={ctx.values.restOfIndia.minDays}
                  max={ctx.values.restOfIndia.maxDays}
                  onChange={(days) => ctx.set((current) => ({ ...current, restOfIndia: { ...current.restOfIndia, ...days } }))}
                />
              </div>
            </Card>
          </>
        );
      }}
    </SettingsForm>
  );
}

// Taxes -----------------------------------------------------------------------

function TaxSettings({ initial, gstin }: { initial: SettingsValues["taxes"]; gstin: string }) {
  const [samplePaise, setSamplePaise] = useState(1_299_00);
  return (
    <SettingsForm
      section="taxes"
      initial={initial}
      aside={({ values }) => {
        const gst = gstFor(samplePaise, values);
        const base = gst.totalPaise - gst.taxPaise;
        return (
          <Card title="Try a price">
            <Field label="Item price" htmlFor="gst-sample">
              <RupeeInput id="gst-sample" valuePaise={samplePaise} onChange={setSamplePaise} />
            </Field>
            <dl className="mt-4 flex flex-col gap-2 text-[13px]">
              <div className="flex justify-between">
                <dt className="text-adm-ink-soft">Price before GST</dt>
                <dd className="tabular-nums">{formatMoney(base)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-adm-ink-soft">GST at {gst.rate}%</dt>
                <dd className="tabular-nums">{formatMoney(gst.taxPaise)}</dd>
              </div>
              <div className="flex justify-between text-[12px] text-adm-ink-faint">
                <dt>Same state: CGST + SGST</dt>
                <dd className="tabular-nums">
                  {formatMoney(gst.taxPaise / 2)} + {formatMoney(gst.taxPaise / 2)}
                </dd>
              </div>
              <div className="flex justify-between border-t border-adm-line pt-2 font-semibold">
                <dt>Customer pays</dt>
                <dd className="tabular-nums">{formatMoney(gst.totalPaise)}</dd>
              </div>
            </dl>
            <p className="mt-3 text-[12px] text-adm-ink-faint">Orders from other states show the same amount as IGST.</p>
          </Card>
        );
      }}
    >
      {(ctx) => (
        <>
          {!gstin ? (
            <Note tone="warning">
              Add your GSTIN in <Link href="/admin/settings/store" className="font-medium underline">Store details</Link> before charging GST. Without it, invoices can&apos;t show tax.
            </Note>
          ) : null}
          <Card title="GST on clothing" description="Apparel is taxed by selling price per piece. Check current rates with your accountant.">
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Rate up to" htmlFor={ctx.id("thresholdPaise")} error={ctx.errors.thresholdPaise}>
                <RupeeInput id={ctx.id("thresholdPaise")} valuePaise={ctx.values.thresholdPaise} onChange={(thresholdPaise) => ctx.patch({ thresholdPaise })} {...ctx.aria("thresholdPaise")} />
              </Field>
              <Field label={`At or below ${formatMoney(ctx.values.thresholdPaise)}`} htmlFor={ctx.id("lowRate")} error={ctx.errors.lowRate}>
                <div className="relative">
                  <input id={ctx.id("lowRate")} type="number" min={0} max={28} step={0.5} value={ctx.values.lowRate} onChange={(event) => ctx.patch({ lowRate: Number(event.target.value) })} className={cn(inputClass, "pr-8 tabular-nums")} {...ctx.aria("lowRate")} />
                  <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[13px] text-adm-ink-faint">%</span>
                </div>
              </Field>
              <Field label={`Above ${formatMoney(ctx.values.thresholdPaise)}`} htmlFor={ctx.id("highRate")} error={ctx.errors.highRate}>
                <div className="relative">
                  <input id={ctx.id("highRate")} type="number" min={0} max={28} step={0.5} value={ctx.values.highRate} onChange={(event) => ctx.patch({ highRate: Number(event.target.value) })} className={cn(inputClass, "pr-8 tabular-nums")} {...ctx.aria("highRate")} />
                  <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[13px] text-adm-ink-faint">%</span>
                </div>
              </Field>
              {textField(ctx, "hsn", "Default HSN code", { max: 8, transform: (value) => value.replace(/\D/g, ""), hint: "6109 covers T-shirts. Products can override it later." })}
            </div>
          </Card>
          <Card title="Prices and invoices">
            <div className="-my-3 divide-y divide-adm-line">
              <ToggleRow label="Prices include GST" hint="The price on the product page is what the customer pays. Common for clothing stores." checked={ctx.values.pricesIncludeGst} onChange={(pricesIncludeGst) => ctx.patch({ pricesIncludeGst })} />
              <ToggleRow label="Show the GST breakdown on invoices" hint="Lists the taxable value, rate and CGST, SGST or IGST for each item." checked={ctx.values.showOnInvoice} onChange={(showOnInvoice) => ctx.patch({ showOnInvoice })} />
            </div>
          </Card>
        </>
      )}
    </SettingsForm>
  );
}

// Notifications ---------------------------------------------------------------

function NotificationSettings({ initial }: { initial: SettingsValues["notifications"] }) {
  return (
    <SettingsForm section="notifications" initial={initial}>
      {(ctx) => (
        <>
          <Card title="Alerts for you" description="Sent by email. Urgent ones also show in the bell in the top bar.">
            <div className="grid gap-4 pb-2 sm:grid-cols-2">
              {textField(ctx, "ownerEmail", "Send alerts to", { type: "email", max: 120 })}
              <Field label="Low-stock level" htmlFor={ctx.id("lowStockThreshold")} error={ctx.errors.lowStockThreshold} hint="A size counts as low at this many pieces or fewer.">
                <input
                  id={ctx.id("lowStockThreshold")}
                  type="number"
                  min={1}
                  max={50}
                  value={ctx.values.lowStockThreshold}
                  onChange={(event) => ctx.patch({ lowStockThreshold: Number(event.target.value) })}
                  className={cn(inputClass, "tabular-nums")}
                  {...ctx.aria("lowStockThreshold")}
                />
              </Field>
            </div>
            <div className="divide-y divide-adm-line border-t border-adm-line">
              {OWNER_ALERTS.map((key) => (
                <ToggleRow
                  key={key}
                  label={ALERT_META[key].label}
                  hint={ALERT_META[key].hint}
                  checked={ctx.values.alerts[key]}
                  onChange={(checked) => ctx.set((current) => ({ ...current, alerts: { ...current.alerts, [key]: checked } }))}
                />
              ))}
            </div>
          </Card>
          <Card title="Emails to customers">
            <div className="-my-3 divide-y divide-adm-line">
              {CUSTOMER_EMAILS.map((key) => {
                const meta = CUSTOMER_EMAIL_META[key];
                return (
                  <ToggleRow
                    key={key}
                    label={meta.label}
                    hint={meta.hint}
                    checked={meta.required ? true : ctx.values.customer[key]}
                    disabled={meta.required}
                    badge={meta.required ? <span className="rounded-full bg-adm-surface-muted px-1.5 py-px text-[10.5px] font-medium text-adm-ink-faint">Always on</span> : null}
                    onChange={(checked) => ctx.set((current) => ({ ...current, customer: { ...current.customer, [key]: checked } }))}
                  />
                );
              })}
            </div>
          </Card>
          <Card title="WhatsApp">
            <div className="-my-3">
              <ToggleRow
                label="Order updates on WhatsApp"
                hint="Confirmation and shipping updates by WhatsApp as well as email. Needs a WhatsApp Business account."
                checked={ctx.values.whatsappUpdates}
                onChange={(whatsappUpdates) => ctx.patch({ whatsappUpdates })}
              />
            </div>
          </Card>
        </>
      )}
    </SettingsForm>
  );
}

// Staff -----------------------------------------------------------------------

function initials(name: string, email: string) {
  const source = name.trim() || email;
  const parts = source.split(/[\s.@_-]+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
}

function StaffSettings({ initial }: { initial: SettingsValues["staff"] }) {
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<StaffRole>("packer");
  const [inviteError, setInviteError] = useState("");
  const nextId = useRef(1);

  return (
    <SettingsForm section="staff" initial={initial}>
      {(ctx) => {
        const invite = () => {
          const email = inviteEmail.trim().toLowerCase();
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setInviteError("Enter a valid email address.");
          if (ctx.values.members.some((member) => member.email === email)) return setInviteError("This person is already on the team.");
          ctx.set((current) => ({ members: [...current.members, { id: `invite-${nextId.current++}`, name: "", email, role: inviteRole, status: "invited" }] }));
          setInviteEmail("");
          setInviteError("");
        };
        return (
          <>
            <Card title="Team" description={`${ctx.values.members.length} ${ctx.values.members.length === 1 ? "person" : "people"} · Invites are sent when you save.`}>
              <ul className="-mx-5 -mt-2 divide-y divide-adm-line border-y border-adm-line">
                {ctx.values.members.map((member, index) => (
                  <li key={member.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3">
                    <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-adm-accent-soft text-[12px] font-semibold text-adm-accent">{initials(member.name, member.email)}</span>
                    <span className="min-w-0 flex-1 basis-48">
                      <span className="flex items-center gap-2 text-[13px] font-medium">
                        <span className="truncate">{member.name || member.email}</span>
                        {member.isYou ? <span className="rounded-full bg-adm-surface-muted px-1.5 py-px text-[10.5px] text-adm-ink-faint">You</span> : null}
                      </span>
                      <span className="block truncate text-[12px] text-adm-ink-faint">
                        {member.name ? `${member.email} · ` : ""}
                        {member.status === "invited" ? "Invite pending" : member.lastActive ? `Active ${formatRelative(member.lastActive).toLowerCase()}` : "Active"}
                      </span>
                    </span>
                    {member.status === "invited" ? <span className="rounded-full bg-adm-warning-soft px-2 py-0.5 text-[11.5px] font-medium text-adm-warning">Invited</span> : null}
                    <select
                      value={member.role}
                      disabled={member.isYou}
                      onChange={(event) => ctx.set((current) => ({ members: current.members.map((entry) => (entry.id === member.id ? { ...entry, role: event.target.value as StaffRole } : entry)) }))}
                      aria-label={`Role for ${member.name || member.email}`}
                      className={cn(inputClass, "h-8 w-32 cursor-pointer text-[12.5px] disabled:cursor-default disabled:opacity-70")}
                      {...ctx.aria(`member.${index}`)}
                    >
                      {STAFF_ROLES.map((role) => (
                        <option key={role} value={role}>
                          {ROLE_META[role].label}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      disabled={member.isYou}
                      onClick={() => ctx.set((current) => ({ members: current.members.filter((entry) => entry.id !== member.id) }))}
                      aria-label={member.status === "invited" ? `Cancel invite for ${member.email}` : `Remove ${member.name || member.email}`}
                      className="inline-flex size-8 items-center justify-center rounded-md text-adm-ink-faint hover:bg-adm-danger-soft hover:text-adm-danger disabled:invisible"
                    >
                      <X className="size-4" strokeWidth={2} aria-hidden="true" />
                    </button>
                    {ctx.errors[`member.${index}`] ? (
                      <p id={`${ctx.id(`member.${index}`)}-error`} className="basis-full pl-13 text-[12px] text-adm-danger">
                        {ctx.errors[`member.${index}`]}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
              {ctx.errors.members ? <p className="mt-3 text-[12px] text-adm-danger">{ctx.errors.members}</p> : null}

              <div className="mt-5 flex flex-col gap-1.5">
                <label htmlFor="invite-email" className="text-[12.5px] font-medium">
                  Invite someone
                </label>
                <div className="flex flex-wrap gap-2">
                  <input
                    id="invite-email"
                    type="email"
                    value={inviteEmail}
                    onChange={(event) => setInviteEmail(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        invite();
                      }
                    }}
                    placeholder="name@example.com"
                    className={cn(inputClass, "min-w-0 flex-1 basis-56")}
                    aria-invalid={inviteError ? true : undefined}
                    aria-describedby={inviteError ? "invite-email-error" : undefined}
                  />
                  <select value={inviteRole} onChange={(event) => setInviteRole(event.target.value as StaffRole)} aria-label="Role" className={cn(inputClass, "w-32 cursor-pointer")}>
                    {STAFF_ROLES.map((role) => (
                      <option key={role} value={role}>
                        {ROLE_META[role].label}
                      </option>
                    ))}
                  </select>
                  <button type="button" onClick={invite} className={buttonClass.secondary}>
                    <Plus className="size-3.5" strokeWidth={2} aria-hidden="true" />
                    Add
                  </button>
                </div>
                {inviteError ? (
                  <p id="invite-email-error" className="text-[12px] text-adm-danger">
                    {inviteError}
                  </p>
                ) : (
                  <p className="text-[12px] text-adm-ink-faint">{ROLE_META[inviteRole].label}: {ROLE_META[inviteRole].hint.toLowerCase()}.</p>
                )}
              </div>
            </Card>

            <Card title="What each role can do">
              <div className="-mx-5 -mb-5 overflow-x-auto">
                <table className="w-full min-w-[420px] text-[13px]">
                  <thead>
                    <tr className="border-y border-adm-line text-[11px] font-semibold tracking-[0.06em] text-adm-ink-faint uppercase">
                      <th scope="col" className="px-5 py-2.5 text-left font-semibold">Area</th>
                      {STAFF_ROLES.map((role) => (
                        <th key={role} scope="col" className="px-3 py-2.5 text-center font-semibold">
                          {ROLE_META[role].label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-adm-line">
                    {PERMISSIONS.map((row) => (
                      <tr key={row.area}>
                        <th scope="row" className="px-5 py-2.5 text-left font-normal text-adm-ink-soft">
                          {row.area}
                        </th>
                        {STAFF_ROLES.map((role) => {
                          const access = row.roles[role];
                          return (
                            <td key={role} className="px-3 py-2.5 text-center">
                              {access === "full" ? (
                                <Check className="mx-auto size-4 text-adm-success" strokeWidth={2.2} aria-label="Full access" />
                              ) : access === "view" ? (
                                <span className="text-[12px] text-adm-ink-soft">View</span>
                              ) : (
                                <Minus className="mx-auto size-4 text-adm-ink-faint/60" strokeWidth={2} aria-label="No access" />
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
            <Note>Only the owner account from the environment variables can sign in for now. Staff sign-in arrives with the user database.</Note>
          </>
        );
      }}
    </SettingsForm>
  );
}

// Entry -----------------------------------------------------------------------

export function SettingsEditor({ section, settings }: { section: SettingsSection; settings: SettingsValues }) {
  switch (section) {
    case "store":
      return <StoreSettings initial={settings.store} />;
    case "branding":
      return <BrandingSettings initial={settings.branding} />;
    case "payments":
      return <PaymentSettings initial={settings.payments} />;
    case "shipping":
      return <ShippingSettings initial={settings.shipping} />;
    case "taxes":
      return <TaxSettings initial={settings.taxes} gstin={settings.store.gstin} />;
    case "notifications":
      return <NotificationSettings initial={settings.notifications} />;
    case "staff":
      return <StaffSettings initial={settings.staff} />;
  }
}
