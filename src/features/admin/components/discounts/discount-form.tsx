"use client";

import Link from "next/link";
import { startTransition, useActionState, useEffect, useId, useRef, useState, useTransition } from "react";
import { CheckCircle2, Info, Loader2, RefreshCw, Trash2, TriangleAlert } from "lucide-react";
import type { DiscountFormValues } from "@/features/admin/data/discounts";
import { deleteDiscountAction, saveDiscountAction, type DiscountFormState } from "@/features/admin/discounts/actions";
import { useToast } from "@/features/admin/components/admin-toast";
import { DiscountStatusBadge } from "@/features/admin/components/discounts/discounts-table";
import { Card, Field, buttonClass, inputClass } from "@/features/admin/components/ui";
import { describeDiscount, generateCode, type DiscountRules, type DiscountStatus, type DiscountType } from "@/features/admin/lib/discount-rules";
import { formatMoney, formatNumber } from "@/features/admin/lib/format";
import { cn } from "@/lib/utils";

type Category = { id: string; name: string };

export type DiscountPerformance = {
  status: DiscountStatus;
  uses: number;
  revenuePaise: number;
  discountGivenPaise: number;
  createdLabel: string;
};

const TYPE_OPTIONS: { value: DiscountType; label: string; hint: string }[] = [
  { value: "percent", label: "Percentage", hint: "e.g. 15% off the order" },
  { value: "fixed", label: "Fixed amount", hint: "e.g. ₹300 off the order" },
  { value: "free_shipping", label: "Free shipping", hint: "Waives the delivery fee" },
];

const SWITCH =
  "relative h-5 w-9 shrink-0 rounded-full bg-adm-line-strong transition-colors peer-checked:bg-adm-accent peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-adm-accent after:absolute after:top-0.5 after:left-0.5 after:size-4 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:after:translate-x-4";

function toPaise(value: string) {
  const amount = Number(value.replace(/[₹,\s]/g, ""));
  return value.trim() && Number.isFinite(amount) ? Math.round(amount * 100) : null;
}

function Toggle({ name, checked, onChange, label, hint }: { name: string; checked: boolean; onChange: (checked: boolean) => void; label: string; hint: string }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4">
      <span>
        <span className="block text-[13px] font-medium">{label}</span>
        <span className="block text-[12px] text-adm-ink-faint">{hint}</span>
      </span>
      <input type="checkbox" name={name} checked={checked} onChange={(event) => onChange(event.target.checked)} className="peer sr-only" />
      <span aria-hidden="true" className={SWITCH} />
    </label>
  );
}

export function DiscountForm({ initial, categories, performance }: { initial: DiscountFormValues; categories: Category[]; performance?: DiscountPerformance }) {
  const uid = useId();
  const [values, setValues] = useState(initial);
  const [baseline, setBaseline] = useState(() => JSON.stringify(initial));
  const valuesRef = useRef(values);
  const [deleting, startDelete] = useTransition();
  const [toast, showToast] = useToast();

  useEffect(() => {
    valuesRef.current = values;
  }, [values]);

  const [state, formAction, pending] = useActionState(async (previous: DiscountFormState, formData: FormData) => {
    const result = await saveDiscountAction(previous, formData);
    if (result.status !== "error") setBaseline(JSON.stringify(valuesRef.current));
    return result;
  }, { status: "idle" } as DiscountFormState);

  const dirty = JSON.stringify(values) !== baseline;
  const errors = state.status === "error" ? (state.fieldErrors ?? {}) : {};
  const isNew = !initial.id;

  const set = <K extends keyof DiscountFormValues>(key: K, value: DiscountFormValues[K]) => setValues((current) => ({ ...current, [key]: value }));
  const field = (key: keyof DiscountFormValues) => `${uid}-${key}`;
  const invalid = (key: keyof DiscountFormValues) => (errors[key] ? { "aria-invalid": true as const, "aria-describedby": `${field(key)}-error` } : {});

  const valueNumber = values.type === "fixed" ? (toPaise(values.value) ?? 0) : Number(values.value) || 0;
  const rules: DiscountRules = {
    type: values.type,
    value: valueNumber,
    minOrderPaise: toPaise(values.minOrder),
    categoryIds: values.appliesTo === "categories" ? values.categoryIds : [],
    firstOrderOnly: values.firstOrderOnly,
    oncePerCustomer: values.oncePerCustomer,
    usageLimit: Number.parseInt(values.usageLimit, 10) || null,
  };
  const summary = describeDiscount(rules, Object.fromEntries(categories.map((category) => [category.id, category.name])));

  const remove = () => {
    if (!initial.id || !window.confirm(`Delete ${initial.code}? Shoppers will no longer be able to use it.`)) return;
    const id = initial.id;
    startDelete(async () => {
      const result = await deleteDiscountAction(id);
      showToast(result.message, !result.ok ? "error" : result.persisted ? "success" : "info");
    });
  };

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
          <Link href="/admin/discounts" className="text-[13px] text-adm-ink-faint transition-colors hover:text-adm-ink">
            Discounts
          </Link>
          <span className="text-adm-line-strong" aria-hidden="true">
            /
          </span>
          <h1 className="truncate font-mono text-[16px] font-semibold tracking-wide">{values.code.trim() || (isNew ? "New discount" : "Untitled")}</h1>
          {dirty ? (
            <span className="hidden shrink-0 items-center gap-1.5 rounded-full bg-adm-warning-soft px-2 py-0.5 text-[11.5px] font-medium text-adm-warning sm:inline-flex">
              <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
              Unsaved changes
            </span>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <button type="button" disabled={!dirty || pending} onClick={() => setValues(JSON.parse(baseline))} className={buttonClass.secondary}>
            Discard
          </button>
          <button type="submit" disabled={pending} className={buttonClass.primary}>
            {pending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
            {isNew ? "Create discount" : "Save changes"}
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
          <Card title="Code" description="Shoppers type this at checkout. It isn't case-sensitive for them.">
            <Field label="Discount code" htmlFor={field("code")} error={errors.code} hint="3–20 letters, numbers, hyphens or underscores.">
              <div className="flex gap-2">
                <input
                  id={field("code")}
                  name="code"
                  value={values.code}
                  onChange={(event) => set("code", event.target.value.toUpperCase().replace(/\s+/g, ""))}
                  placeholder="e.g. DIWALI20"
                  maxLength={20}
                  autoComplete="off"
                  spellCheck={false}
                  className={cn(inputClass, "font-mono tracking-wide uppercase")}
                  {...invalid("code")}
                />
                <button type="button" onClick={() => set("code", generateCode())} className={cn(buttonClass.secondary, "shrink-0")}>
                  <RefreshCw className="size-4" strokeWidth={1.8} aria-hidden="true" />
                  Generate
                </button>
              </div>
            </Field>
          </Card>

          <Card title="Discount">
            <fieldset>
              <legend className="sr-only">Discount type</legend>
              <div className="grid gap-2 sm:grid-cols-3">
                {TYPE_OPTIONS.map((option) => (
                  <label
                    key={option.value}
                    className={cn(
                      "flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-2.5 transition-colors",
                      values.type === option.value ? "border-adm-accent bg-adm-accent-soft/60" : "border-adm-line hover:bg-adm-surface-muted",
                    )}
                  >
                    <input
                      type="radio"
                      name="type"
                      value={option.value}
                      checked={values.type === option.value}
                      onChange={() => setValues((current) => ({ ...current, type: option.value, value: option.value === "percent" ? "10" : option.value === "fixed" ? "200" : "" }))}
                      className="mt-0.5 size-4 accent-[var(--adm-accent)]"
                    />
                    <span>
                      <span className="block text-[13px] font-medium">{option.label}</span>
                      <span className="block text-[12px] text-adm-ink-faint">{option.hint}</span>
                    </span>
                  </label>
                ))}
              </div>
              {errors.type ? <p className="mt-2 text-[12px] text-adm-danger">{errors.type}</p> : null}
            </fieldset>

            {values.type !== "free_shipping" ? (
              <Field label={values.type === "percent" ? "Percentage off" : "Amount off"} htmlFor={field("value")} error={errors.value} className="mt-4 sm:max-w-xs">
                <div className="relative">
                  {values.type === "fixed" ? <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[13.5px] text-adm-ink-faint">₹</span> : null}
                  <input
                    id={field("value")}
                    name="value"
                    inputMode={values.type === "percent" ? "numeric" : "decimal"}
                    value={values.value}
                    onChange={(event) => set("value", event.target.value)}
                    className={cn(inputClass, "tabular-nums", values.type === "fixed" ? "pl-7" : "pr-8")}
                    {...invalid("value")}
                  />
                  {values.type === "percent" ? <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-[13.5px] text-adm-ink-faint">%</span> : null}
                </div>
              </Field>
            ) : (
              <p className="mt-4 text-[12.5px] text-adm-ink-soft">The delivery fee is removed at checkout. The order total stays the same otherwise.</p>
            )}
          </Card>

          <Card title="Applies to">
            <fieldset className="flex flex-col gap-2">
              <legend className="sr-only">Products the discount applies to</legend>
              {(
                [
                  ["all", "All products"],
                  ["categories", "Specific categories"],
                ] as const
              ).map(([value, label]) => (
                <label key={value} className="flex w-fit cursor-pointer items-center gap-2.5 text-[13px]">
                  <input type="radio" name="appliesTo" value={value} checked={values.appliesTo === value} onChange={() => set("appliesTo", value)} className="size-4 accent-[var(--adm-accent)]" />
                  {label}
                </label>
              ))}
            </fieldset>
            {values.appliesTo === "categories" ? (
              <div className="mt-4">
                <div className="flex flex-wrap gap-2" role="group" aria-label="Categories">
                  {categories.map((category) => {
                    const checked = values.categoryIds.includes(category.id);
                    return (
                      <label
                        key={category.id}
                        className={cn(
                          "inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-1.5 text-[13px] transition-colors focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-adm-accent",
                          checked ? "border-adm-accent bg-adm-accent-soft/60 font-medium" : "border-adm-line hover:bg-adm-surface-muted",
                        )}
                      >
                        <input
                          type="checkbox"
                          name="categoryIds"
                          value={category.id}
                          checked={checked}
                          onChange={(event) =>
                            set("categoryIds", event.target.checked ? [...values.categoryIds, category.id] : values.categoryIds.filter((id) => id !== category.id))
                          }
                          className="sr-only"
                        />
                        {category.name}
                      </label>
                    );
                  })}
                </div>
                {errors.categoryIds ? <p className="mt-2 text-[12px] text-adm-danger">{errors.categoryIds}</p> : null}
              </div>
            ) : null}
          </Card>

          <Card title="Requirements" description="Who can use the code, and on what orders.">
            <div className="flex flex-col gap-5">
              <Field label="Minimum order value" htmlFor={field("minOrder")} error={errors.minOrder} hint="Leave empty for no minimum." className="sm:max-w-xs">
                <div className="relative">
                  <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[13.5px] text-adm-ink-faint">₹</span>
                  <input
                    id={field("minOrder")}
                    name="minOrder"
                    inputMode="decimal"
                    value={values.minOrder}
                    onChange={(event) => set("minOrder", event.target.value)}
                    className={cn(inputClass, "pl-7 tabular-nums")}
                    {...invalid("minOrder")}
                  />
                </div>
              </Field>
              <div className="border-t border-adm-line pt-4">
                <Toggle name="firstOrderOnly" checked={values.firstOrderOnly} onChange={(checked) => set("firstOrderOnly", checked)} label="First order only" hint="Only shoppers who haven't ordered before" />
              </div>
            </div>
          </Card>

          <Card title="Usage limits">
            <div className="flex flex-col gap-5">
              <Field label="Total uses" htmlFor={field("usageLimit")} error={errors.usageLimit} hint="Leave empty for unlimited." className="sm:max-w-xs">
                <input
                  id={field("usageLimit")}
                  name="usageLimit"
                  type="number"
                  min={1}
                  step={1}
                  inputMode="numeric"
                  value={values.usageLimit}
                  onChange={(event) => set("usageLimit", event.target.value)}
                  className={cn(inputClass, "tabular-nums")}
                  {...invalid("usageLimit")}
                />
              </Field>
              <div className="border-t border-adm-line pt-4">
                <Toggle name="oncePerCustomer" checked={values.oncePerCustomer} onChange={(checked) => set("oncePerCustomer", checked)} label="Once per customer" hint="Each shopper can use it one time" />
              </div>
            </div>
          </Card>

          <Card title="Active dates" description="Times are in the store's time zone.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Starts" htmlFor={field("startsAt")} error={errors.startsAt}>
                <input
                  id={field("startsAt")}
                  name="startsAt"
                  type="datetime-local"
                  value={values.startsAt}
                  onChange={(event) => set("startsAt", event.target.value)}
                  className={cn(inputClass, "tabular-nums")}
                  {...invalid("startsAt")}
                />
              </Field>
              <Field label="Ends" htmlFor={field("endsAt")} error={errors.endsAt} hint="Leave empty to keep it running.">
                <input
                  id={field("endsAt")}
                  name="endsAt"
                  type="datetime-local"
                  value={values.endsAt}
                  onChange={(event) => set("endsAt", event.target.value)}
                  className={cn(inputClass, "tabular-nums")}
                  {...invalid("endsAt")}
                />
              </Field>
            </div>
          </Card>
        </div>

        <aside className="flex flex-col gap-6 lg:sticky lg:top-[136px] lg:self-start">
          <Card title="Status">
            <Toggle name="enabled" checked={values.enabled} onChange={(checked) => set("enabled", checked)} label="Enabled" hint={values.enabled ? "Usable between the active dates" : "Nobody can use it right now"} />
          </Card>

          <Card title="Summary">
            <p className="font-mono text-[15px] font-semibold tracking-wide">{values.code.trim() || "CODE"}</p>
            <ul className="mt-3 flex flex-col gap-2">
              {summary.map((line) => (
                <li key={line} className="flex gap-2 text-[13px] text-adm-ink-soft">
                  <span className="mt-2 size-1 shrink-0 rounded-full bg-adm-ink-faint" aria-hidden="true" />
                  {line}
                </li>
              ))}
            </ul>
          </Card>

          {performance ? (
            <Card title="Performance" action={<DiscountStatusBadge status={performance.status} />}>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
                {[
                  ["Times used", formatNumber(performance.uses)],
                  ["Sales", formatMoney(performance.revenuePaise, { compact: true })],
                  ["Discount given", formatMoney(performance.discountGivenPaise, { compact: true })],
                  ["Per order", performance.uses ? formatMoney(performance.discountGivenPaise / performance.uses) : "—"],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-[12px] text-adm-ink-faint">{label}</dt>
                    <dd className="text-[15px] font-semibold tabular-nums">{value}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-4 border-t border-adm-line pt-3 text-[12px] text-adm-ink-faint">Created {performance.createdLabel}</p>
            </Card>
          ) : null}

          {!isNew ? (
            <button type="button" onClick={remove} disabled={deleting} className={cn(buttonClass.ghost, "self-start text-adm-danger hover:bg-adm-danger-soft hover:text-adm-danger")}>
              {deleting ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Trash2 className="size-4" strokeWidth={1.8} aria-hidden="true" />}
              Delete discount
            </button>
          ) : null}
        </aside>
      </div>
      {toast}
    </form>
  );
}
