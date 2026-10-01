"use client";

import Image from "next/image";
import Link from "next/link";
import { startTransition, useActionState, useEffect, useId, useRef, useState } from "react";
import { CheckCircle2, ExternalLink, ImagePlus, Info, Loader2, Star, TriangleAlert } from "lucide-react";
import type { ProductStatus } from "@/features/admin/data/products";
import { saveProductAction, type ProductFormState } from "@/features/admin/products/actions";
import { Card, Field, buttonClass, inputClass } from "@/features/admin/components/ui";
import { formatMoney } from "@/features/admin/lib/format";
import { cn } from "@/lib/utils";

export type ProductFormValues = {
  id: string | null;
  name: string;
  slug: string;
  sku: string;
  categoryId: string;
  status: ProductStatus;
  summary: string;
  details: string;
  alt: string;
  price: string;
  mrp: string;
  stock: Record<string, string>;
  color: string;
  fit: string;
  fabric: string;
  pattern: string;
  occasion: string;
  care: string;
  isNew: boolean;
  gallery: string[];
};

type Category = { id: string; name: string; sizes: string[] };

const STATUS_OPTIONS: { value: ProductStatus; label: string; hint: string }[] = [
  { value: "active", label: "Active", hint: "Visible and available to buy" },
  { value: "draft", label: "Draft", hint: "Hidden while you finish it" },
  { value: "archived", label: "Archived", hint: "Hidden, kept for records" },
];

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function toPaise(value: string) {
  const amount = Number(value.replace(/[₹,\s]/g, ""));
  return value.trim() && Number.isFinite(amount) ? Math.round(amount * 100) : null;
}

export function ProductForm({ initial, categories, threshold }: { initial: ProductFormValues; categories: Category[]; threshold: number }) {
  const uid = useId();
  const [values, setValues] = useState(initial);
  const [baseline, setBaseline] = useState(() => JSON.stringify(initial));
  const [slugTouched, setSlugTouched] = useState(Boolean(initial.id));
  const valuesRef = useRef(values);

  useEffect(() => {
    valuesRef.current = values;
  }, [values]);

  const [state, formAction, pending] = useActionState(async (previous: ProductFormState, formData: FormData) => {
    const result = await saveProductAction(previous, formData);
    if (result.status !== "error") setBaseline(JSON.stringify(valuesRef.current));
    return result;
  }, { status: "idle" } as ProductFormState);

  const dirty = JSON.stringify(values) !== baseline;
  const errors = state.status === "error" ? (state.fieldErrors ?? {}) : {};
  const category = categories.find((entry) => entry.id === values.categoryId);
  const isNew = !initial.id;

  const set = <K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) => setValues((current) => ({ ...current, [key]: value }));
  const field = (key: keyof ProductFormValues) => `${uid}-${key}`;
  const invalid = (key: string) => (errors[key] ? { "aria-invalid": true as const, "aria-describedby": `${field(key as keyof ProductFormValues)}-error` } : {});

  const pricePaise = toPaise(values.price);
  const mrpPaise = toPaise(values.mrp);
  const saving = pricePaise && mrpPaise && mrpPaise > pricePaise ? mrpPaise - pricePaise : 0;
  const stockTotal = Object.values(values.stock).reduce((total, left) => total + (Number.parseInt(left, 10) || 0), 0);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        startTransition(() => formAction(formData));
      }}
      className="flex flex-col gap-6"
      noValidate
    >
      <input type="hidden" name="id" value={values.id ?? ""} />

      <div className="adm-rise sticky top-16 z-30 -mx-4 flex flex-wrap items-center justify-between gap-3 border-b border-adm-line bg-adm-canvas/85 px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <Link href="/admin/products" className="text-[13px] text-adm-ink-faint transition-colors hover:text-adm-ink">
            Products
          </Link>
          <span className="text-adm-line-strong" aria-hidden="true">
            /
          </span>
          <h1 className="truncate text-[17px] font-semibold tracking-[-0.015em]">{values.name.trim() || (isNew ? "New product" : "Untitled product")}</h1>
          {dirty ? (
            <span className="hidden shrink-0 items-center gap-1.5 rounded-full bg-adm-warning-soft px-2 py-0.5 text-[11.5px] font-medium text-adm-warning sm:inline-flex">
              <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
              Unsaved changes
            </span>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          {!isNew ? (
            <a href={`/product/${initial.slug}`} target="_blank" rel="noreferrer" className={cn(buttonClass.ghost, "hidden sm:inline-flex")}>
              <ExternalLink className="size-4" strokeWidth={1.8} aria-hidden="true" />
              View in store
            </a>
          ) : null}
          <button type="button" disabled={!dirty || pending} onClick={() => setValues(JSON.parse(baseline))} className={buttonClass.secondary}>
            Discard
          </button>
          <button type="submit" disabled={pending} className={buttonClass.primary}>
            {pending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
            {isNew ? "Create product" : "Save changes"}
          </button>
        </div>
      </div>

      {state.status !== "idle" && state.message ? (
        <div
          key={state.at}
          role={state.status === "error" ? "alert" : "status"}
          className={cn(
            "adm-rise flex items-start gap-3 rounded-xl border px-4 py-3 text-[13px]",
            state.status === "error" && "border-adm-danger/30 bg-adm-danger-soft text-adm-danger",
            state.status === "preview" && "border-adm-info/25 bg-adm-info-soft text-adm-info",
            state.status === "saved" && "border-adm-success/25 bg-adm-success-soft text-adm-success",
          )}
        >
          {state.status === "error" ? (
            <TriangleAlert className="mt-0.5 size-4 shrink-0" strokeWidth={2} aria-hidden="true" />
          ) : state.status === "preview" ? (
            <Info className="mt-0.5 size-4 shrink-0" strokeWidth={2} aria-hidden="true" />
          ) : (
            <CheckCircle2 className="mt-0.5 size-4 shrink-0" strokeWidth={2} aria-hidden="true" />
          )}
          <p>{state.message}</p>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex min-w-0 flex-col gap-6">
          <Card title="Basics" description="What shoppers read on the product page.">
            <div className="flex flex-col gap-4">
              <Field label="Product name" htmlFor={field("name")} error={errors.name}>
                <input
                  id={field("name")}
                  name="name"
                  value={values.name}
                  onChange={(event) => {
                    const name = event.target.value;
                    setValues((current) => ({ ...current, name, slug: slugTouched ? current.slug : slugify(name) }));
                  }}
                  placeholder="e.g. Venom Mustard Tee"
                  className={inputClass}
                  {...invalid("name")}
                />
              </Field>
              <Field label="Description" htmlFor={field("summary")} error={errors.summary} hint={`${values.summary.length}/600 characters`}>
                <textarea
                  id={field("summary")}
                  name="summary"
                  rows={3}
                  maxLength={600}
                  value={values.summary}
                  onChange={(event) => set("summary", event.target.value)}
                  className={cn(inputClass, "h-auto resize-y py-2 leading-relaxed")}
                  {...invalid("summary")}
                />
              </Field>
              <Field label="Highlights" htmlFor={field("details")} hint="One per line. Shown as bullet points.">
                <textarea
                  id={field("details")}
                  name="details"
                  rows={4}
                  value={values.details}
                  onChange={(event) => set("details", event.target.value)}
                  placeholder={"Back graphic print\nDropped shoulders"}
                  className={cn(inputClass, "h-auto resize-y py-2 leading-relaxed")}
                />
              </Field>
            </div>
          </Card>

          <Card title="Media" description={
              values.gallery.length === 0 ? "No images yet" : values.gallery.length === 1 ? "1 image · used as the cover" : `${values.gallery.length} images · the first is the cover`
            }>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {values.gallery.map((src, index) => (
                <div
                  key={src}
                  className={cn(
                    "relative overflow-hidden rounded-xl border border-adm-line bg-adm-surface-muted",
                    index === 0 ? "col-span-2 row-span-2 aspect-square" : "aspect-square",
                  )}
                >
                  <Image src={src} alt={index === 0 ? values.alt : ""} fill sizes="(min-width: 1024px) 240px, 40vw" className="object-cover" />
                  {index === 0 ? (
                    <span className="absolute top-2 left-2 rounded-md bg-black/60 px-1.5 py-0.5 text-[11px] font-medium text-white backdrop-blur">Cover</span>
                  ) : null}
                </div>
              ))}
              <div
                className="flex aspect-square flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-adm-line-strong p-2 text-center text-adm-ink-faint"
                title="Image uploads open once image storage is connected"
              >
                <ImagePlus className="size-5" strokeWidth={1.6} aria-hidden="true" />
                <span className="text-[11.5px] leading-tight">Uploads coming soon</span>
              </div>
            </div>
            <Field label="Image description (alt text)" htmlFor={field("alt")} hint="Describes the cover for screen readers and search engines." className="mt-4">
              <input id={field("alt")} name="alt" value={values.alt} onChange={(event) => set("alt", event.target.value)} className={inputClass} />
            </Field>
          </Card>

          <Card title="Pricing">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Price" htmlFor={field("price")} error={errors.price}>
                <div className="relative">
                  <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[13.5px] text-adm-ink-faint">₹</span>
                  <input
                    id={field("price")}
                    name="price"
                    inputMode="decimal"
                    value={values.price}
                    onChange={(event) => set("price", event.target.value)}
                    className={cn(inputClass, "pl-7 tabular-nums")}
                    {...invalid("price")}
                  />
                </div>
              </Field>
              <Field label="Compare-at price" htmlFor={field("mrp")} error={errors.mrp} hint="Optional. Shown struck through to signal an offer.">
                <div className="relative">
                  <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[13.5px] text-adm-ink-faint">₹</span>
                  <input
                    id={field("mrp")}
                    name="mrp"
                    inputMode="decimal"
                    value={values.mrp}
                    onChange={(event) => set("mrp", event.target.value)}
                    className={cn(inputClass, "pl-7 tabular-nums")}
                    {...invalid("mrp")}
                  />
                </div>
              </Field>
            </div>
            {saving && pricePaise && mrpPaise ? (
              <p className="mt-4 inline-flex items-center gap-2 rounded-lg bg-adm-success-soft px-3 py-2 text-[12.5px] font-medium text-adm-success">
                Customers save {formatMoney(saving)} ({Math.round((saving / mrpPaise) * 100)}% off)
              </p>
            ) : null}
          </Card>

          <Card
            title="Inventory"
            description={category ? `Stock for each ${category.name.toLowerCase()} size` : "Choose a category to set sizes"}
            action={<span className="pt-0.5 text-[12.5px] text-adm-ink-soft tabular-nums">{stockTotal} units</span>}
          >
            <Field label="SKU" htmlFor={field("sku")} error={errors.sku} hint="Your internal code for this product." className="sm:max-w-xs">
              <input
                id={field("sku")}
                name="sku"
                value={values.sku}
                onChange={(event) => set("sku", event.target.value.toUpperCase())}
                className={cn(inputClass, "font-mono text-[13px] uppercase")}
                {...invalid("sku")}
              />
            </Field>
            {category ? (
              <div className="mt-5">
                <p className="text-[12.5px] font-medium text-adm-ink">Stock by size</p>
                <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {category.sizes.map((size) => {
                    const left = Number.parseInt(values.stock[size] ?? "0", 10) || 0;
                    const tone = left === 0 ? "out" : left <= threshold ? "low" : "ok";
                    return (
                      <label
                        key={size}
                        className={cn(
                          "flex flex-col gap-2 rounded-xl border p-3 transition-colors focus-within:border-adm-accent",
                          tone === "out" ? "border-adm-danger/30 bg-adm-danger-soft/50" : tone === "low" ? "border-adm-warning/30 bg-adm-warning-soft/50" : "border-adm-line",
                        )}
                      >
                        <span className="flex items-center justify-between">
                          <span className="text-[13px] font-semibold">{size}</span>
                          <span
                            className={cn(
                              "text-[11px] font-medium",
                              tone === "out" ? "text-adm-danger" : tone === "low" ? "text-adm-warning" : "text-adm-success",
                            )}
                          >
                            {tone === "out" ? "Sold out" : tone === "low" ? "Low" : "In stock"}
                          </span>
                        </span>
                        <input
                          name={`stock.${size}`}
                          type="number"
                          min={0}
                          step={1}
                          inputMode="numeric"
                          aria-label={`Stock for size ${size}`}
                          value={values.stock[size] ?? "0"}
                          onChange={(event) => setValues((current) => ({ ...current, stock: { ...current.stock, [size]: event.target.value } }))}
                          className={cn(inputClass, "h-8 bg-adm-surface tabular-nums")}
                        />
                      </label>
                    );
                  })}
                </div>
                {errors.stock ? <p className="mt-2 text-[12px] text-adm-danger">{errors.stock}</p> : null}
                <p className="mt-2 text-[12px] text-adm-ink-faint">Sizes with {threshold} or fewer left are flagged on the dashboard.</p>
              </div>
            ) : null}
          </Card>

          <Card title="Product details" description="Shown in the specification list on the product page.">
            <div className="grid gap-4 sm:grid-cols-2">
              {(
                [
                  ["color", "Colour", "e.g. Mustard"],
                  ["fit", "Fit", "e.g. Oversized fit"],
                  ["fabric", "Fabric", "e.g. Soft cotton"],
                  ["pattern", "Pattern", "e.g. Graphic print"],
                  ["occasion", "Occasion", "e.g. Everyday / streetwear"],
                ] as const
              ).map(([key, label, placeholder]) => (
                <Field key={key} label={label} htmlFor={field(key)}>
                  <input id={field(key)} name={key} value={values[key]} onChange={(event) => set(key, event.target.value)} placeholder={placeholder} className={inputClass} />
                </Field>
              ))}
              <Field label="Care instructions" htmlFor={field("care")} className="sm:col-span-2">
                <textarea
                  id={field("care")}
                  name="care"
                  rows={2}
                  value={values.care}
                  onChange={(event) => set("care", event.target.value)}
                  className={cn(inputClass, "h-auto resize-y py-2 leading-relaxed")}
                />
              </Field>
            </div>
          </Card>
        </div>

        <aside className="flex flex-col gap-6 lg:sticky lg:top-[136px] lg:self-start">
          <Card title="Status">
            <fieldset className="flex flex-col gap-2">
              <legend className="sr-only">Product status</legend>
              {STATUS_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-2.5 transition-colors",
                    values.status === option.value ? "border-adm-accent bg-adm-accent-soft/60" : "border-adm-line hover:bg-adm-surface-muted",
                  )}
                >
                  <input
                    type="radio"
                    name="status"
                    value={option.value}
                    checked={values.status === option.value}
                    onChange={() => set("status", option.value)}
                    className="mt-0.5 size-4 accent-[var(--adm-accent)]"
                  />
                  <span>
                    <span className="block text-[13px] font-medium">{option.label}</span>
                    <span className="block text-[12px] text-adm-ink-faint">{option.hint}</span>
                  </span>
                </label>
              ))}
            </fieldset>
            <label className="mt-4 flex cursor-pointer items-center justify-between gap-3 border-t border-adm-line pt-4">
              <span>
                <span className="block text-[13px] font-medium">&ldquo;New&rdquo; badge</span>
                <span className="block text-[12px] text-adm-ink-faint">Highlights it in the shop</span>
              </span>
              <input type="checkbox" name="isNew" checked={values.isNew} onChange={(event) => set("isNew", event.target.checked)} className="peer sr-only" />
              <span
                aria-hidden="true"
                className="relative h-5 w-9 shrink-0 rounded-full bg-adm-line-strong transition-colors peer-checked:bg-adm-accent peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-adm-accent after:absolute after:top-0.5 after:left-0.5 after:size-4 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:after:translate-x-4"
              />
            </label>
          </Card>

          <Card title="Organisation">
            <div className="flex flex-col gap-4">
              <Field label="Category" htmlFor={field("categoryId")} error={errors.categoryId} hint="Sets the size range for stock.">
                <select
                  id={field("categoryId")}
                  name="categoryId"
                  value={values.categoryId}
                  onChange={(event) => {
                    const next = categories.find((entry) => entry.id === event.target.value);
                    setValues((current) => ({
                      ...current,
                      categoryId: event.target.value,
                      stock: Object.fromEntries((next?.sizes ?? []).map((size) => [size, current.stock[size] ?? "0"])),
                    }));
                  }}
                  className={cn(inputClass, "cursor-pointer")}
                  {...invalid("categoryId")}
                >
                  <option value="">Choose a category</option>
                  {categories.map((entry) => (
                    <option key={entry.id} value={entry.id}>
                      {entry.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Product URL" htmlFor={field("slug")} error={errors.slug}>
                <div className="flex overflow-hidden rounded-lg border border-adm-line focus-within:border-adm-accent focus-within:ring-3 focus-within:ring-adm-accent/15">
                  <span className="flex items-center border-r border-adm-line bg-adm-surface-muted px-2.5 text-[12.5px] text-adm-ink-faint">/product/</span>
                  <input
                    id={field("slug")}
                    name="slug"
                    value={values.slug}
                    onChange={(event) => {
                      setSlugTouched(true);
                      set("slug", event.target.value.toLowerCase().replace(/\s+/g, "-"));
                    }}
                    className="h-9 min-w-0 flex-1 bg-adm-surface px-2.5 text-[13px] text-adm-ink outline-none"
                    {...invalid("slug")}
                  />
                </div>
              </Field>
            </div>
          </Card>

          <Card title="Storefront preview" description="How the card looks in the shop.">
            <div className="overflow-hidden rounded-xl border border-adm-line">
              <div className="relative aspect-[4/5] bg-adm-surface-muted">
                {values.gallery[0] ? (
                  <Image src={values.gallery[0]} alt="" fill sizes="300px" className="object-cover" />
                ) : (
                  <span className="absolute inset-0 flex items-center justify-center text-adm-ink-faint">
                    <ImagePlus className="size-6" strokeWidth={1.5} aria-hidden="true" />
                  </span>
                )}
                <span className="absolute top-2 left-2 flex gap-1">
                  {values.isNew ? <span className="rounded-md bg-adm-ink px-1.5 py-0.5 text-[10.5px] font-semibold text-adm-canvas">NEW</span> : null}
                  {saving && mrpPaise ? (
                    <span className="rounded-md bg-adm-danger px-1.5 py-0.5 text-[10.5px] font-semibold text-white">-{Math.round((saving / mrpPaise) * 100)}%</span>
                  ) : null}
                </span>
              </div>
              <div className="flex flex-col gap-1 p-3">
                <p className="truncate text-[13.5px] font-medium">{values.name.trim() || "Product name"}</p>
                <p className="flex items-baseline gap-2 text-[13px]">
                  <span className="font-semibold tabular-nums">{pricePaise ? formatMoney(pricePaise) : "₹—"}</span>
                  {saving && mrpPaise ? <span className="text-[12px] text-adm-ink-faint line-through tabular-nums">{formatMoney(mrpPaise)}</span> : null}
                </p>
                <p className="flex items-center gap-1 text-[11.5px] text-adm-ink-faint">
                  <Star className="size-3 fill-current text-adm-warning" aria-hidden="true" />
                  {values.color || "Colour"} · {category?.name ?? "Category"}
                </p>
              </div>
            </div>
          </Card>
        </aside>
      </div>
    </form>
  );
}
