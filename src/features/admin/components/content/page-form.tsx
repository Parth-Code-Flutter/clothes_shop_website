"use client";

import Link from "next/link";
import { startTransition, useActionState, useEffect, useId, useRef, useState, useTransition } from "react";
import { CheckCircle2, Info, Loader2, Trash2, TriangleAlert } from "lucide-react";
import type { PageFormValues } from "@/features/admin/data/content";
import { deletePageAction, savePageAction, type ContentFormState } from "@/features/admin/content/actions";
import { useToast } from "@/features/admin/components/admin-toast";
import { Card, Field, buttonClass, inputClass } from "@/features/admin/components/ui";
import { PAGE_LIMITS, toBlocks, wordCount, type Block, type PageStatus } from "@/features/admin/lib/content-meta";
import { slugify } from "@/features/admin/lib/slug";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS: { value: PageStatus; label: string; hint: string }[] = [
  { value: "published", label: "Published", hint: "Linked from the footer" },
  { value: "draft", label: "Draft", hint: "Hidden while you write it" },
];

export function PageBody({ source }: { source: string }) {
  const blocks = toBlocks(source);
  if (blocks.length === 0) return <p className="text-[13px] text-adm-ink-faint">Nothing written yet.</p>;
  return (
    <div className="flex flex-col gap-3 text-[13.5px] leading-relaxed text-adm-ink-soft">
      {blocks.map((block, index) =>
        block.kind === "h2" ? (
          <h2 key={index} className="mt-2 text-[17px] font-semibold tracking-[-0.01em] text-adm-ink first:mt-0">
            {block.text}
          </h2>
        ) : block.kind === "h3" ? (
          <h3 key={index} className="mt-1 text-[14.5px] font-semibold text-adm-ink">
            {block.text}
          </h3>
        ) : block.kind === "ul" ? (
          <ul key={index} className="flex list-disc flex-col gap-1 pl-5 marker:text-adm-ink-faint">
            {block.items.map((item, at) => (
              <li key={at}>{item}</li>
            ))}
          </ul>
        ) : (
          <p key={index}>{block.text}</p>
        ),
      )}
    </div>
  );
}

export function PageForm({ initial, storeName, host }: { initial: PageFormValues; storeName: string; host: string }) {
  const uid = useId();
  const [values, setValues] = useState(initial);
  const [baseline, setBaseline] = useState(() => JSON.stringify(initial));
  const [slugTouched, setSlugTouched] = useState(Boolean(initial.id));
  const [tab, setTab] = useState<"write" | "preview">("write");
  const valuesRef = useRef(values);
  const [deleting, startDelete] = useTransition();
  const [toast, showToast] = useToast();

  useEffect(() => {
    valuesRef.current = values;
  }, [values]);

  const [state, formAction, pending] = useActionState(async (previous: ContentFormState, formData: FormData) => {
    const result = await savePageAction(previous, formData);
    if (result.status !== "error") setBaseline(JSON.stringify(valuesRef.current));
    return result;
  }, { status: "idle" } as ContentFormState);

  const dirty = JSON.stringify(values) !== baseline;
  const errors = state.status === "error" ? (state.fieldErrors ?? {}) : {};
  const isNew = !initial.id;

  const set = <K extends keyof PageFormValues>(key: K, value: PageFormValues[K]) => setValues((current) => ({ ...current, [key]: value }));
  const field = (key: keyof PageFormValues) => `${uid}-${key}`;
  const invalid = (key: keyof PageFormValues) => (errors[key] ? { "aria-invalid": true as const, "aria-describedby": `${field(key)}-error` } : {});

  const searchTitle = values.seoTitle.trim() || values.title.trim() || "Page title";
  const firstParagraph = toBlocks(values.body).find((block): block is Extract<Block, { text: string }> => block.kind === "p");
  const searchDescription = values.seoDescription.trim() || firstParagraph?.text.slice(0, PAGE_LIMITS.seoDescription) || "Add a description so search results show a helpful summary.";
  const words = wordCount(values.body);

  const remove = () => {
    if (!initial.id || !window.confirm(`Delete ${initial.title}? Footer links to it will stop working.`)) return;
    const id = initial.id;
    startDelete(async () => {
      const result = await deletePageAction(id);
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
      <input type="hidden" name="body" value={values.body} />

      <div className="adm-rise sticky top-16 z-30 -mx-4 flex flex-wrap items-center justify-between gap-3 border-b border-adm-line bg-adm-canvas/85 px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <Link href="/admin/content" className="text-[13px] text-adm-ink-faint transition-colors hover:text-adm-ink">
            Content
          </Link>
          <span className="text-adm-line-strong" aria-hidden="true">
            /
          </span>
          <h1 className="truncate text-[17px] font-semibold tracking-[-0.015em]">{values.title.trim() || (isNew ? "New page" : "Untitled page")}</h1>
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
            {isNew ? "Create page" : "Save changes"}
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
          <Card>
            <div className="flex flex-col gap-4">
              <Field label="Title" htmlFor={field("title")} error={errors.title}>
                <input
                  id={field("title")}
                  name="title"
                  value={values.title}
                  maxLength={PAGE_LIMITS.title}
                  onChange={(event) => {
                    const title = event.target.value;
                    setValues((current) => ({ ...current, title, slug: slugTouched ? current.slug : slugify(title) }));
                  }}
                  placeholder="e.g. Size guide"
                  className={cn(inputClass, "text-[15px] font-medium")}
                  {...invalid("title")}
                />
              </Field>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-end justify-between gap-3">
                  <label htmlFor={field("body")} className="text-[12.5px] font-medium">
                    Content
                  </label>
                  <div role="tablist" aria-label="Editor mode" className="inline-flex rounded-lg border border-adm-line p-0.5">
                    {(["write", "preview"] as const).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        role="tab"
                        aria-selected={tab === mode}
                        onClick={() => setTab(mode)}
                        className={cn("rounded-md px-2.5 py-1 text-[12px] font-medium capitalize transition-colors", tab === mode ? "bg-adm-surface-muted text-adm-ink" : "text-adm-ink-faint hover:text-adm-ink")}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>
                {tab === "write" ? (
                  <textarea
                    id={field("body")}
                    rows={18}
                    value={values.body}
                    maxLength={PAGE_LIMITS.body}
                    onChange={(event) => set("body", event.target.value)}
                    placeholder={"## A heading\n\nA paragraph of text.\n\n- A list item\n- Another item"}
                    className={cn(inputClass, "h-auto resize-y py-3 font-mono text-[13px] leading-relaxed")}
                    {...invalid("body")}
                  />
                ) : (
                  <div className="min-h-[200px] rounded-lg border border-adm-line px-4 py-4">
                    <h1 className="mb-3 text-[22px] font-semibold tracking-[-0.02em]">{values.title || "Page title"}</h1>
                    <PageBody source={values.body} />
                  </div>
                )}
                {errors.body ? (
                  <p id={`${field("body")}-error`} className="text-[12px] text-adm-danger">
                    {errors.body}
                  </p>
                ) : (
                  <p className="flex flex-wrap justify-between gap-2 text-[12px] text-adm-ink-faint">
                    <span>
                      Start a line with <code className="font-mono">##</code> for a heading or <code className="font-mono">-</code> for a list. Leave a blank line between paragraphs.
                    </span>
                    <span className="tabular-nums">{words.toLocaleString("en-IN")} words</span>
                  </p>
                )}
              </div>
            </div>
          </Card>

          <Card title="Search engine listing" description="How the page can appear in Google results.">
            <div className="rounded-xl border border-adm-line px-4 py-3">
              <p className="truncate text-[12px] text-adm-ink-faint">
                {host} › pages › {values.slug || "page-url"}
              </p>
              <p className="mt-0.5 truncate text-[16px] text-adm-info">
                {searchTitle} | {storeName}
              </p>
              <p className="mt-0.5 line-clamp-2 text-[12.5px] text-adm-ink-soft">{searchDescription}</p>
            </div>
            <div className="mt-4 flex flex-col gap-4">
              <Field label="Page title for search" htmlFor={field("seoTitle")} error={errors.seoTitle} hint={`${values.seoTitle.length}/${PAGE_LIMITS.seoTitle}. Uses the page title when empty.`}>
                <input id={field("seoTitle")} name="seoTitle" value={values.seoTitle} onChange={(event) => set("seoTitle", event.target.value)} className={inputClass} {...invalid("seoTitle")} />
              </Field>
              <Field
                label="Description for search"
                htmlFor={field("seoDescription")}
                error={errors.seoDescription}
                hint={`${values.seoDescription.length}/${PAGE_LIMITS.seoDescription}. Uses the first paragraph when empty.`}
              >
                <textarea
                  id={field("seoDescription")}
                  name="seoDescription"
                  rows={2}
                  value={values.seoDescription}
                  onChange={(event) => set("seoDescription", event.target.value)}
                  className={cn(inputClass, "h-auto resize-y py-2 leading-relaxed")}
                  {...invalid("seoDescription")}
                />
              </Field>
            </div>
          </Card>
        </div>

        <aside className="flex flex-col gap-6 lg:sticky lg:top-[136px] lg:self-start">
          <Card title="Visibility">
            <fieldset className="flex flex-col gap-2">
              <legend className="sr-only">Page status</legend>
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
          </Card>

          <Card title="URL">
            <Field label="Page address" htmlFor={field("slug")} error={errors.slug}>
              <div className="flex overflow-hidden rounded-lg border border-adm-line focus-within:border-adm-accent focus-within:ring-3 focus-within:ring-adm-accent/15">
                <span className="flex items-center border-r border-adm-line bg-adm-surface-muted px-2.5 text-[12.5px] text-adm-ink-faint">/pages/</span>
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
            {!isNew && values.slug !== initial.slug ? <p className="mt-2 text-[12px] text-adm-warning">Changing the URL breaks links people may have saved.</p> : null}
          </Card>

          {!isNew ? (
            <button type="button" onClick={remove} disabled={deleting} className={cn(buttonClass.ghost, "self-start text-adm-danger hover:bg-adm-danger-soft hover:text-adm-danger")}>
              {deleting ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Trash2 className="size-4" strokeWidth={1.8} aria-hidden="true" />}
              Delete page
            </button>
          ) : null}
        </aside>
      </div>
      {toast}
    </form>
  );
}
