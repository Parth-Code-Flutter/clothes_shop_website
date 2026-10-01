"use client";

import Image from "next/image";
import Link from "next/link";
import { startTransition, useActionState, useEffect, useId, useMemo, useRef, useState, useTransition } from "react";
import { ArrowDown, ArrowUp, CheckCircle2, Hand, Info, Loader2, Plus, Search, Sparkles, Trash2, TriangleAlert, X } from "lucide-react";
import type { CollectionFormValues } from "@/features/admin/data/collections";
import { deleteCollectionAction, saveCollectionAction, type CollectionFormState } from "@/features/admin/collections/actions";
import { useToast } from "@/features/admin/components/admin-toast";
import { CoverMosaic } from "@/features/admin/components/collections/collections-table";
import { Card, Field, buttonClass, inputClass } from "@/features/admin/components/ui";
import {
  COLLECTION_SORTS,
  CONDITION_FIELDS,
  FIELD_META,
  OP_LABELS,
  SORT_LABELS,
  TAGS,
  TAG_LABELS,
  resolveProducts,
  slugify,
  type CollectionKind,
  type Condition,
  type ConditionField,
  type RuleProduct,
} from "@/features/admin/lib/collection-rules";
import { formatMoney } from "@/features/admin/lib/format";
import { cn } from "@/lib/utils";

type Category = { id: string; name: string };

const KIND_OPTIONS: { value: CollectionKind; label: string; hint: string; icon: typeof Hand }[] = [
  { value: "manual", label: "Manual", hint: "You pick each product and its order", icon: Hand },
  { value: "smart", label: "Smart", hint: "Products that match your rules join automatically", icon: Sparkles },
];

const SWITCH =
  "relative h-5 w-9 shrink-0 rounded-full bg-adm-line-strong transition-colors peer-checked:bg-adm-accent peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-adm-accent after:absolute after:top-0.5 after:left-0.5 after:size-4 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:after:translate-x-4";

const SELECT = cn(inputClass, "h-8 cursor-pointer text-[13px]");

function defaultValue(field: ConditionField, categories: Category[]) {
  if (field === "category") return categories[0]?.id ?? "";
  if (field === "price") return "999";
  if (field === "tag") return "new";
  return "";
}

function ProductThumb({ product, size = "size-10" }: { product: RuleProduct; size?: string }) {
  return (
    <span className={cn("relative shrink-0 overflow-hidden rounded-lg border border-adm-line bg-adm-surface-muted", size)}>
      <Image src={product.image} alt="" fill sizes="48px" className="object-cover" />
    </span>
  );
}

export function CollectionForm({
  initial,
  categories,
  products,
  colors,
}: {
  initial: CollectionFormValues;
  categories: Category[];
  products: RuleProduct[];
  colors: string[];
}) {
  const uid = useId();
  const [values, setValues] = useState(initial);
  const [baseline, setBaseline] = useState(() => JSON.stringify(initial));
  const [slugTouched, setSlugTouched] = useState(Boolean(initial.id));
  const [search, setSearch] = useState("");
  const valuesRef = useRef(values);
  const [deleting, startDelete] = useTransition();
  const [toast, showToast] = useToast();

  useEffect(() => {
    valuesRef.current = values;
  }, [values]);

  const [state, formAction, pending] = useActionState(async (previous: CollectionFormState, formData: FormData) => {
    const result = await saveCollectionAction(previous, formData);
    if (result.status !== "error") setBaseline(JSON.stringify(valuesRef.current));
    return result;
  }, { status: "idle" } as CollectionFormState);

  const dirty = JSON.stringify(values) !== baseline;
  const errors = state.status === "error" ? (state.fieldErrors ?? {}) : {};
  const isNew = !initial.id;

  const set = <K extends keyof CollectionFormValues>(key: K, value: CollectionFormValues[K]) => setValues((current) => ({ ...current, [key]: value }));
  const field = (key: keyof CollectionFormValues) => `${uid}-${key}`;
  const invalid = (key: keyof CollectionFormValues) => (errors[key] ? { "aria-invalid": true as const, "aria-describedby": `${field(key)}-error` } : {});

  const members = useMemo(() => resolveProducts(values, products), [values, products]);
  const byId = useMemo(() => new Map(products.map((product) => [product.id, product])), [products]);
  const cover = (values.coverProductId && byId.get(values.coverProductId)) || members[0] || null;

  const needle = search.trim().toLowerCase();
  const results = needle
    ? products
        .filter((product) => !values.productIds.includes(product.id) && [product.name, product.categoryName, product.color].some((text) => text.toLowerCase().includes(needle)))
        .slice(0, 8)
    : [];

  const setConditions = (update: (conditions: Condition[]) => Condition[]) =>
    setValues((current) => ({ ...current, rules: { ...current.rules, conditions: update(current.rules.conditions) } }));

  const move = (index: number, by: number) =>
    setValues((current) => {
      const next = [...current.productIds];
      const [item] = next.splice(index, 1);
      next.splice(index + by, 0, item);
      return { ...current, productIds: next };
    });

  const remove = () => {
    if (!initial.id || !window.confirm(`Delete ${initial.title}? The products in it are not deleted.`)) return;
    const id = initial.id;
    startDelete(async () => {
      const result = await deleteCollectionAction(id);
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
      <input type="hidden" name="coverProductId" value={values.coverProductId ?? ""} />
      {values.kind === "smart" ? <input type="hidden" name="rules" value={JSON.stringify(values.rules)} /> : null}
      {values.kind === "manual" ? values.productIds.map((id) => <input key={id} type="hidden" name="productIds" value={id} />) : null}

      <div className="adm-rise sticky top-16 z-30 -mx-4 flex flex-wrap items-center justify-between gap-3 border-b border-adm-line bg-adm-canvas/85 px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <Link href="/admin/collections" className="text-[13px] text-adm-ink-faint transition-colors hover:text-adm-ink">
            Collections
          </Link>
          <span className="text-adm-line-strong" aria-hidden="true">
            /
          </span>
          <h1 className="truncate text-[17px] font-semibold tracking-[-0.015em]">{values.title.trim() || (isNew ? "New collection" : "Untitled collection")}</h1>
          {dirty ? (
            <span className="hidden shrink-0 items-center gap-1.5 rounded-full bg-adm-warning-soft px-2 py-0.5 text-[11.5px] font-medium text-adm-warning sm:inline-flex">
              <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
              Unsaved changes
            </span>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={!dirty || pending}
            onClick={() => {
              setValues(JSON.parse(baseline));
              setSearch("");
            }}
            className={buttonClass.secondary}
          >
            Discard
          </button>
          <button type="submit" disabled={pending} className={buttonClass.primary}>
            {pending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
            {isNew ? "Create collection" : "Save changes"}
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
          <Card title="Details">
            <div className="flex flex-col gap-4">
              <Field label="Title" htmlFor={field("title")} error={errors.title}>
                <input
                  id={field("title")}
                  name="title"
                  value={values.title}
                  maxLength={80}
                  onChange={(event) => {
                    const title = event.target.value;
                    setValues((current) => ({ ...current, title, slug: slugTouched ? current.slug : slugify(title) }));
                  }}
                  placeholder="e.g. Festive Edit"
                  className={inputClass}
                  {...invalid("title")}
                />
              </Field>
              <Field label="Description" htmlFor={field("description")} error={errors.description} hint={`${values.description.length}/500 characters. Shown at the top of the collection page.`}>
                <textarea
                  id={field("description")}
                  name="description"
                  rows={3}
                  maxLength={500}
                  value={values.description}
                  onChange={(event) => set("description", event.target.value)}
                  className={cn(inputClass, "h-auto resize-y py-2 leading-relaxed")}
                  {...invalid("description")}
                />
              </Field>
              <Field label="URL" htmlFor={field("slug")} error={errors.slug}>
                <div className="flex overflow-hidden rounded-lg border border-adm-line focus-within:border-adm-accent focus-within:ring-3 focus-within:ring-adm-accent/15">
                  <span className="flex items-center border-r border-adm-line bg-adm-surface-muted px-2.5 text-[12.5px] text-adm-ink-faint">/collections/</span>
                  <input
                    id={field("slug")}
                    name="slug"
                    value={values.slug}
                    maxLength={60}
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

          <Card title="Products" action={<span className="pt-0.5 text-[12.5px] text-adm-ink-soft tabular-nums">{members.length} in collection</span>}>
            <fieldset>
              <legend className="sr-only">How products are added</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {KIND_OPTIONS.map((option) => (
                  <label
                    key={option.value}
                    className={cn(
                      "flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-2.5 transition-colors",
                      values.kind === option.value ? "border-adm-accent bg-adm-accent-soft/60" : "border-adm-line hover:bg-adm-surface-muted",
                    )}
                  >
                    <input
                      type="radio"
                      name="kind"
                      value={option.value}
                      checked={values.kind === option.value}
                      onChange={() =>
                        setValues((current) => ({
                          ...current,
                          kind: option.value,
                          sort: option.value === "smart" && current.sort === "manual" ? "best" : current.sort,
                        }))
                      }
                      className="mt-0.5 size-4 accent-[var(--adm-accent)]"
                    />
                    <span>
                      <span className="flex items-center gap-1.5 text-[13px] font-medium">
                        <option.icon className="size-3.5" strokeWidth={2} aria-hidden="true" />
                        {option.label}
                      </span>
                      <span className="block text-[12px] text-adm-ink-faint">{option.hint}</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            {values.kind === "manual" ? (
              <div className="mt-5">
                <div className="relative">
                  <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-adm-ink-faint" strokeWidth={1.8} aria-hidden="true" />
                  <input
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") event.preventDefault();
                    }}
                    placeholder="Search products to add"
                    aria-label="Search products to add"
                    className={cn(inputClass, "pl-9")}
                  />
                </div>
                {needle ? (
                  <ul className="mt-2 overflow-hidden rounded-xl border border-adm-line">
                    {results.length === 0 ? (
                      <li className="px-3 py-3 text-[12.5px] text-adm-ink-faint">No matching products that aren&apos;t already added.</li>
                    ) : (
                      results.map((product) => (
                        <li key={product.id} className="flex items-center gap-3 border-b border-adm-line px-3 py-2 last:border-b-0">
                          <ProductThumb product={product} size="size-9" />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[13px] font-medium">{product.name}</span>
                            <span className="block text-[12px] text-adm-ink-faint">
                              {product.categoryName} · {formatMoney(product.pricePaise)}
                            </span>
                          </span>
                          <button type="button" onClick={() => set("productIds", [...values.productIds, product.id])} className={cn(buttonClass.secondary, "h-8 px-2.5")}>
                            <Plus className="size-3.5" strokeWidth={2} aria-hidden="true" />
                            Add
                          </button>
                        </li>
                      ))
                    )}
                  </ul>
                ) : null}

                {values.productIds.length === 0 ? (
                  <p className="mt-4 rounded-xl border border-dashed border-adm-line-strong px-4 py-6 text-center text-[12.5px] text-adm-ink-faint">Search above to add products.</p>
                ) : (
                  <ol className="mt-4 flex flex-col divide-y divide-adm-line rounded-xl border border-adm-line">
                    {values.productIds.map((id, index) => {
                      const product = byId.get(id);
                      if (!product) return null;
                      return (
                        <li key={id} className="flex items-center gap-3 px-3 py-2">
                          <span className="w-5 text-right text-[12px] text-adm-ink-faint tabular-nums">{index + 1}</span>
                          <ProductThumb product={product} />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[13px] font-medium">{product.name}</span>
                            <span className="block text-[12px] text-adm-ink-faint">
                              {product.categoryName} · {formatMoney(product.pricePaise)}
                              {!product.inStock ? <span className="text-adm-danger"> · Sold out</span> : null}
                            </span>
                          </span>
                          {values.sort === "manual" ? (
                            <span className="flex">
                              <button
                                type="button"
                                onClick={() => move(index, -1)}
                                disabled={index === 0}
                                aria-label={`Move ${product.name} up`}
                                className="inline-flex size-7 items-center justify-center rounded-md text-adm-ink-faint hover:bg-adm-surface-muted hover:text-adm-ink disabled:opacity-30"
                              >
                                <ArrowUp className="size-3.5" strokeWidth={2} aria-hidden="true" />
                              </button>
                              <button
                                type="button"
                                onClick={() => move(index, 1)}
                                disabled={index === values.productIds.length - 1}
                                aria-label={`Move ${product.name} down`}
                                className="inline-flex size-7 items-center justify-center rounded-md text-adm-ink-faint hover:bg-adm-surface-muted hover:text-adm-ink disabled:opacity-30"
                              >
                                <ArrowDown className="size-3.5" strokeWidth={2} aria-hidden="true" />
                              </button>
                            </span>
                          ) : null}
                          <button
                            type="button"
                            onClick={() =>
                              setValues((current) => ({
                                ...current,
                                productIds: current.productIds.filter((entry) => entry !== id),
                                coverProductId: current.coverProductId === id ? null : current.coverProductId,
                              }))
                            }
                            aria-label={`Remove ${product.name}`}
                            className="inline-flex size-7 items-center justify-center rounded-md text-adm-ink-faint hover:bg-adm-danger-soft hover:text-adm-danger"
                          >
                            <X className="size-3.5" strokeWidth={2} aria-hidden="true" />
                          </button>
                        </li>
                      );
                    })}
                  </ol>
                )}
                {errors.productIds ? <p className="mt-2 text-[12px] text-adm-danger">{errors.productIds}</p> : null}
              </div>
            ) : (
              <div className="mt-5">
                <fieldset className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px]">
                  <legend className="sr-only">How conditions combine</legend>
                  <span className="text-adm-ink-soft">Products must match</span>
                  {(
                    [
                      ["all", "all conditions"],
                      ["any", "any condition"],
                    ] as const
                  ).map(([value, label]) => (
                    <label key={value} className="inline-flex cursor-pointer items-center gap-2">
                      <input
                        type="radio"
                        name="match"
                        value={value}
                        checked={values.rules.match === value}
                        onChange={() => setValues((current) => ({ ...current, rules: { ...current.rules, match: value } }))}
                        className="size-4 accent-[var(--adm-accent)]"
                      />
                      {label}
                    </label>
                  ))}
                </fieldset>

                <ul className="mt-3 flex flex-col gap-2">
                  {values.rules.conditions.map((condition, index) => {
                    const meta = FIELD_META[condition.field];
                    const update = (patch: Partial<Condition>) => setConditions((conditions) => conditions.map((entry, at) => (at === index ? { ...entry, ...patch } : entry)));
                    return (
                      <li key={index} className="grid grid-cols-[1fr_1fr_auto] gap-2 rounded-xl border border-adm-line bg-adm-surface-muted/40 p-2 sm:grid-cols-[150px_130px_1fr_auto]">
                        <select
                          aria-label={`Condition ${index + 1} field`}
                          value={condition.field}
                          onChange={(event) => {
                            const next = event.target.value as ConditionField;
                            update({ field: next, op: FIELD_META[next].ops[0], value: defaultValue(next, categories) });
                          }}
                          className={SELECT}
                        >
                          {CONDITION_FIELDS.map((option) => (
                            <option key={option} value={option}>
                              {FIELD_META[option].label}
                            </option>
                          ))}
                        </select>
                        <select aria-label={`Condition ${index + 1} comparison`} value={condition.op} onChange={(event) => update({ op: event.target.value as Condition["op"] })} className={SELECT}>
                          {meta.ops.map((op) => (
                            <option key={op} value={op}>
                              {OP_LABELS[op]}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => setConditions((conditions) => conditions.filter((_, at) => at !== index))}
                          aria-label={`Remove condition ${index + 1}`}
                          className="row-start-1 inline-flex size-8 items-center justify-center rounded-md text-adm-ink-faint hover:bg-adm-danger-soft hover:text-adm-danger sm:col-start-4"
                        >
                          <X className="size-3.5" strokeWidth={2} aria-hidden="true" />
                        </button>
                        <div className="col-span-3 sm:col-span-1 sm:col-start-3 sm:row-start-1">
                          {condition.field === "category" ? (
                            <select aria-label={`Condition ${index + 1} category`} value={condition.value} onChange={(event) => update({ value: event.target.value })} className={SELECT}>
                              {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                  {category.name}
                                </option>
                              ))}
                            </select>
                          ) : condition.field === "tag" ? (
                            <select aria-label={`Condition ${index + 1} tag`} value={condition.value} onChange={(event) => update({ value: event.target.value })} className={SELECT}>
                              {TAGS.map((tag) => (
                                <option key={tag} value={tag}>
                                  {TAG_LABELS[tag]}
                                </option>
                              ))}
                            </select>
                          ) : condition.field === "price" ? (
                            <div className="relative">
                              <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[13px] text-adm-ink-faint">₹</span>
                              <input
                                aria-label={`Condition ${index + 1} price`}
                                inputMode="decimal"
                                value={condition.value}
                                onChange={(event) => update({ value: event.target.value.replace(/[^\d.]/g, "") })}
                                className={cn(inputClass, "h-8 pl-7 text-[13px] tabular-nums")}
                              />
                            </div>
                          ) : (
                            <input
                              aria-label={`Condition ${index + 1} colour`}
                              list={`${uid}-colors`}
                              value={condition.value}
                              onChange={(event) => update({ value: event.target.value })}
                              placeholder="e.g. black"
                              className={cn(inputClass, "h-8 text-[13px]")}
                            />
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
                <datalist id={`${uid}-colors`}>
                  {colors.map((color) => (
                    <option key={color} value={color} />
                  ))}
                </datalist>
                <button
                  type="button"
                  onClick={() => setConditions((conditions) => [...conditions, { field: "tag", op: "is", value: "new" }])}
                  disabled={values.rules.conditions.length >= 10}
                  className={cn(buttonClass.secondary, "mt-3 h-8")}
                >
                  <Plus className="size-3.5" strokeWidth={2} aria-hidden="true" />
                  Add condition
                </button>
                {errors.rules ? <p className="mt-2 text-[12px] text-adm-danger">{errors.rules}</p> : null}

                <div className="mt-5 border-t border-adm-line pt-4">
                  <p className="text-[12.5px] font-medium">
                    {members.length === 0 ? "No products match yet" : `${members.length} matching ${members.length === 1 ? "product" : "products"}`}
                    <span className="font-normal text-adm-ink-faint"> · updates as your catalogue changes</span>
                  </p>
                  {members.length > 0 ? (
                    <ul className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-8">
                      {members.slice(0, 16).map((product) => (
                        <li key={product.id} title={product.name} className="relative aspect-square overflow-hidden rounded-lg border border-adm-line bg-adm-surface-muted">
                          <Image src={product.image} alt={product.name} fill sizes="80px" className="object-cover" />
                        </li>
                      ))}
                      {members.length > 16 ? (
                        <li className="flex aspect-square items-center justify-center rounded-lg border border-adm-line text-[12px] font-medium text-adm-ink-soft">+{members.length - 16}</li>
                      ) : null}
                    </ul>
                  ) : null}
                </div>
              </div>
            )}
          </Card>
        </div>

        <aside className="flex flex-col gap-6 lg:sticky lg:top-[136px] lg:self-start">
          <Card title="Visibility">
            <label className="flex cursor-pointer items-center justify-between gap-4">
              <span>
                <span className="block text-[13px] font-medium">Show in store</span>
                <span className="block text-[12px] text-adm-ink-faint">{values.published ? "Shoppers can browse it" : "Hidden while you prepare it"}</span>
              </span>
              <input type="checkbox" name="published" checked={values.published} onChange={(event) => set("published", event.target.checked)} className="peer sr-only" />
              <span aria-hidden="true" className={SWITCH} />
            </label>
          </Card>

          <Card title="Sort products">
            <Field label="Order on the collection page" htmlFor={field("sort")} error={errors.sort}>
              <select id={field("sort")} name="sort" value={values.sort} onChange={(event) => set("sort", event.target.value as CollectionFormValues["sort"])} className={cn(inputClass, "cursor-pointer")} {...invalid("sort")}>
                {COLLECTION_SORTS.filter((sort) => values.kind === "manual" || sort !== "manual").map((sort) => (
                  <option key={sort} value={sort}>
                    {SORT_LABELS[sort]}
                  </option>
                ))}
              </select>
            </Field>
            {values.kind === "manual" && values.sort === "manual" ? <p className="mt-2 text-[12px] text-adm-ink-faint">Use the arrows next to each product to set the order.</p> : null}
          </Card>

          <Card title="Cover" description="Shown on the collection card and page header.">
            {members.length === 0 ? (
              <p className="text-[12.5px] text-adm-ink-faint">Add products to choose a cover.</p>
            ) : (
              <fieldset>
                <legend className="sr-only">Cover image</legend>
                <div className="grid grid-cols-4 gap-2">
                  {members.slice(0, 12).map((product) => {
                    const chosen = cover?.id === product.id;
                    return (
                      <label
                        key={product.id}
                        title={product.name}
                        className={cn(
                          "relative aspect-square cursor-pointer overflow-hidden rounded-lg border-2 transition-colors focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-adm-accent",
                          chosen ? "border-adm-accent" : "border-transparent hover:border-adm-line-strong",
                        )}
                      >
                        <input
                          type="radio"
                          name="cover-choice"
                          checked={chosen}
                          onChange={() => set("coverProductId", product.id === members[0]?.id ? null : product.id)}
                          className="sr-only"
                          aria-label={product.name}
                        />
                        <Image src={product.image} alt="" fill sizes="70px" className="object-cover" />
                      </label>
                    );
                  })}
                </div>
                <p className="mt-2 text-[12px] text-adm-ink-faint">{values.coverProductId ? "Chosen by you." : "The first product is used until you pick one."}</p>
              </fieldset>
            )}
          </Card>

          <Card title="Storefront preview">
            <div className="overflow-hidden rounded-xl border border-adm-line">
              <CoverMosaic images={[cover?.image, ...members.map((product) => product.image)].filter((src, index, list): src is string => Boolean(src) && list.indexOf(src) === index)} className="aspect-[4/3] w-full rounded-none" />
              <div className="p-3">
                <p className="truncate text-[14px] font-semibold">{values.title.trim() || "Collection title"}</p>
                <p className="text-[12px] text-adm-ink-faint">
                  {members.length} {members.length === 1 ? "piece" : "pieces"}
                </p>
              </div>
            </div>
          </Card>

          {!isNew ? (
            <button type="button" onClick={remove} disabled={deleting} className={cn(buttonClass.ghost, "self-start text-adm-danger hover:bg-adm-danger-soft hover:text-adm-danger")}>
              {deleting ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Trash2 className="size-4" strokeWidth={1.8} aria-hidden="true" />}
              Delete collection
            </button>
          ) : null}
        </aside>
      </div>
      {toast}
    </form>
  );
}
