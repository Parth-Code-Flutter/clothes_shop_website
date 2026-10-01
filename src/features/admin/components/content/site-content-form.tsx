"use client";

import Link from "next/link";
import { startTransition, useActionState, useEffect, useId, useRef, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpRight, CheckCircle2, Eye, EyeOff, Info, Loader2, Plus, TriangleAlert, X } from "lucide-react";
import { saveSiteContentAction, type ContentFormState } from "@/features/admin/content/actions";
import { Card, Field, buttonClass, inputClass } from "@/features/admin/components/ui";
import { CONTENT_LIMITS, HOME_SECTION_META, type SiteContent } from "@/features/admin/lib/content-meta";
import { cn } from "@/lib/utils";

type CollectionOption = { id: string; title: string; count: number };

const SWITCH =
  "relative h-5 w-9 shrink-0 rounded-full bg-adm-line-strong transition-colors peer-checked:bg-adm-accent peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-adm-accent after:absolute after:top-0.5 after:left-0.5 after:size-4 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:after:translate-x-4";

const ICON_BUTTON = "inline-flex size-8 shrink-0 items-center justify-center rounded-md text-adm-ink-faint hover:bg-adm-surface-muted hover:text-adm-ink disabled:opacity-30";

function move<T>(list: T[], index: number, by: number) {
  const next = [...list];
  const [item] = next.splice(index, 1);
  next.splice(index + by, 0, item);
  return next;
}

export function SiteContentForm({ initial, collections }: { initial: SiteContent; collections: CollectionOption[] }) {
  const uid = useId();
  const [values, setValues] = useState(initial);
  const [baseline, setBaseline] = useState(() => JSON.stringify(initial));
  const valuesRef = useRef(values);
  const nextId = useRef(initial.announcement.messages.length + 1);

  useEffect(() => {
    valuesRef.current = values;
  }, [values]);

  const [state, formAction, pending] = useActionState(async (previous: ContentFormState, formData: FormData) => {
    const result = await saveSiteContentAction(previous, formData);
    if (result.status !== "error") setBaseline(JSON.stringify(valuesRef.current));
    return result;
  }, { status: "idle" } as ContentFormState);

  const dirty = JSON.stringify(values) !== baseline;
  const errors = state.status === "error" ? (state.fieldErrors ?? {}) : {};
  const id = (key: string) => `${uid}-${key.replace(/\./g, "-")}`;
  const aria = (key: string) => (errors[key] ? { "aria-invalid": true as const, "aria-describedby": `${id(key)}-error` } : {});

  const setHero = <K extends keyof SiteContent["hero"]>(key: K, value: SiteContent["hero"][K]) => setValues((current) => ({ ...current, hero: { ...current.hero, [key]: value } }));
  const setFooter = <K extends keyof SiteContent["footer"]>(key: K, value: SiteContent["footer"][K]) => setValues((current) => ({ ...current, footer: { ...current.footer, [key]: value } }));
  const setMessages = (update: (messages: SiteContent["announcement"]["messages"]) => SiteContent["announcement"]["messages"]) =>
    setValues((current) => ({ ...current, announcement: { ...current.announcement, messages: update(current.announcement.messages) } }));

  const heroField = (key: "kicker" | "titleTop" | "titleBottom" | "starring" | "ctaLabel" | "finaleTitle", label: string, max: number, hint?: string) => (
    <Field label={label} htmlFor={id(`hero.${key}`)} error={errors[`hero.${key}`]} hint={hint}>
      <input id={id(`hero.${key}`)} value={values.hero[key]} maxLength={max} onChange={(event) => setHero(key, event.target.value)} className={inputClass} {...aria(`hero.${key}`)} />
    </Field>
  );

  const visibleMessages = values.announcement.messages.filter((message) => message.text.trim());

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
      <input type="hidden" name="content" value={JSON.stringify(values)} />

      <div className="adm-rise sticky top-16 z-30 -mx-4 flex flex-wrap items-center justify-between gap-3 border-b border-adm-line bg-adm-canvas/85 px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <Link href="/admin/content" className="text-[13px] text-adm-ink-faint transition-colors hover:text-adm-ink">
            Content
          </Link>
          <span className="text-adm-line-strong" aria-hidden="true">
            /
          </span>
          <h1 className="truncate text-[17px] font-semibold tracking-[-0.015em]">Homepage &amp; site copy</h1>
          {dirty ? (
            <span className="hidden shrink-0 items-center gap-1.5 rounded-full bg-adm-warning-soft px-2 py-0.5 text-[11.5px] font-medium text-adm-warning sm:inline-flex">
              <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
              Unsaved changes
            </span>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <a href="/" target="_blank" rel="noreferrer" className={cn(buttonClass.ghost, "hidden sm:inline-flex")}>
            <ArrowUpRight className="size-4" strokeWidth={1.8} aria-hidden="true" />
            View store
          </a>
          <button type="button" disabled={!dirty || pending} onClick={() => setValues(JSON.parse(baseline))} className={buttonClass.secondary}>
            Discard
          </button>
          <button type="submit" disabled={pending} className={buttonClass.primary}>
            {pending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
            Save changes
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

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex min-w-0 flex-col gap-6">
          <Card
            title="Announcement bar"
            description="The scrolling strip of short messages above the footer."
            action={
              <label className="flex cursor-pointer items-center gap-2 pt-0.5 text-[12.5px] text-adm-ink-soft">
                {values.announcement.enabled ? "On" : "Off"}
                <input
                  type="checkbox"
                  checked={values.announcement.enabled}
                  onChange={(event) => setValues((current) => ({ ...current, announcement: { ...current.announcement, enabled: event.target.checked } }))}
                  className="peer sr-only"
                />
                <span aria-hidden="true" className={SWITCH} />
                <span className="sr-only">Show the announcement bar</span>
              </label>
            }
          >
            <ol className="flex flex-col gap-2">
              {values.announcement.messages.map((message, index) => {
                const key = `message.${index}`;
                return (
                  <li key={message.id}>
                    <div className="flex items-start gap-2">
                      <span className="mt-2 w-4 text-right text-[12px] text-adm-ink-faint tabular-nums">{index + 1}</span>
                      <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
                        <input
                          aria-label={`Message ${index + 1}`}
                          value={message.text}
                          maxLength={CONTENT_LIMITS.message}
                          onChange={(event) => setMessages((messages) => messages.map((entry) => (entry.id === message.id ? { ...entry, text: event.target.value } : entry)))}
                          placeholder="e.g. Free shipping over ₹999"
                          className={inputClass}
                          {...aria(key)}
                        />
                        <input
                          aria-label={`Link for message ${index + 1}`}
                          value={message.href}
                          onChange={(event) => setMessages((messages) => messages.map((entry) => (entry.id === message.id ? { ...entry, href: event.target.value.trim() } : entry)))}
                          placeholder="Link (optional), e.g. /shop"
                          className={cn(inputClass, "font-mono text-[12.5px]")}
                        />
                      </div>
                      <button type="button" onClick={() => setMessages((messages) => move(messages, index, -1))} disabled={index === 0} aria-label={`Move message ${index + 1} up`} className={ICON_BUTTON}>
                        <ArrowUp className="size-3.5" strokeWidth={2} aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setMessages((messages) => move(messages, index, 1))}
                        disabled={index === values.announcement.messages.length - 1}
                        aria-label={`Move message ${index + 1} down`}
                        className={ICON_BUTTON}
                      >
                        <ArrowDown className="size-3.5" strokeWidth={2} aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setMessages((messages) => messages.filter((entry) => entry.id !== message.id))}
                        aria-label={`Remove message ${index + 1}`}
                        className={cn(ICON_BUTTON, "hover:bg-adm-danger-soft hover:text-adm-danger")}
                      >
                        <X className="size-3.5" strokeWidth={2} aria-hidden="true" />
                      </button>
                    </div>
                    {errors[key] ? (
                      <p id={`${id(key)}-error`} className="mt-1 ml-6 text-[12px] text-adm-danger">
                        {errors[key]}
                      </p>
                    ) : null}
                  </li>
                );
              })}
            </ol>
            <div className="mt-3 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setMessages((messages) => [...messages, { id: `new-${nextId.current++}`, text: "", href: "" }])}
                disabled={values.announcement.messages.length >= CONTENT_LIMITS.messages}
                className={cn(buttonClass.secondary, "h-8")}
              >
                <Plus className="size-3.5" strokeWidth={2} aria-hidden="true" />
                Add message
              </button>
              <span className="text-[12px] text-adm-ink-faint">
                {values.announcement.messages.length}/{CONTENT_LIMITS.messages} messages
              </span>
            </div>
            {errors.messages ? <p className="mt-2 text-[12px] text-adm-danger">{errors.messages}</p> : null}

            <div data-admin-dark className={cn("mt-4 overflow-hidden rounded-lg bg-adm-canvas py-2.5 transition-opacity", !values.announcement.enabled && "opacity-40")} aria-hidden="true">
              <div className="flex items-center gap-6 px-4 text-[10px] font-bold tracking-[0.22em] whitespace-nowrap text-adm-ink-soft uppercase">
                {visibleMessages.length ? (
                  visibleMessages.map((message) => (
                    <span key={message.id} className="flex items-center gap-6">
                      {message.text}
                      <span className="size-1.5 rotate-45 bg-adm-accent" />
                    </span>
                  ))
                ) : (
                  <span>No messages yet</span>
                )}
              </div>
            </div>
          </Card>

          <Card title="Homepage opener" description="The premiere at the top of the homepage: the marquee sign, the reel and the finale.">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">{heroField("kicker", "Kicker", CONTENT_LIMITS.kicker, "The small line above the title.")}</div>
              {heroField("titleTop", "Title, first line", CONTENT_LIMITS.title)}
              {heroField("titleBottom", "Title, second line", CONTENT_LIMITS.title, "Shown larger, in neon.")}
              <div className="sm:col-span-2">{heroField("starring", "Starring line", CONTENT_LIMITS.starring, "Reads as “Starring …” under the title.")}</div>
              {heroField("ctaLabel", "Button text", CONTENT_LIMITS.ctaLabel)}
              <Field label="Button link" htmlFor={id("hero.ctaHref")} error={errors["hero.ctaHref"]}>
                <input
                  id={id("hero.ctaHref")}
                  value={values.hero.ctaHref}
                  onChange={(event) => setHero("ctaHref", event.target.value.trim())}
                  placeholder="/shop"
                  className={cn(inputClass, "font-mono text-[12.5px]")}
                  {...aria("hero.ctaHref")}
                />
              </Field>
              {heroField("finaleTitle", "Finale line", CONTENT_LIMITS.finaleTitle, "The closing screen shows “Starring” above this word.")}
              <Field label="Products on the reel" htmlFor={id("hero.reelSource")} error={errors["hero.reelSource"]}>
                <select id={id("hero.reelSource")} value={values.hero.reelSource} onChange={(event) => setHero("reelSource", event.target.value)} className={cn(inputClass, "cursor-pointer")} {...aria("hero.reelSource")}>
                  <option value="mix">One piece from each category</option>
                  {collections.map((collection) => (
                    <option key={collection.id} value={collection.id}>
                      {collection.title} ({collection.count})
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          </Card>

          <Card title="Homepage sections" description="Choose the order and which sections appear.">
            <ol className="flex flex-col divide-y divide-adm-line rounded-xl border border-adm-line">
              {values.sections.map((section, index) => {
                const meta = HOME_SECTION_META[section.id];
                return (
                  <li key={section.id} className={cn("flex items-center gap-3 px-3 py-2.5", !section.visible && "bg-adm-surface-muted/50")}>
                    <span className="w-4 text-right text-[12px] text-adm-ink-faint tabular-nums">{index + 1}</span>
                    <span className="min-w-0 flex-1">
                      <span className={cn("block text-[13px] font-medium", !section.visible && "text-adm-ink-faint line-through")}>{meta.label}</span>
                      <span className="block text-[12px] text-adm-ink-faint">{meta.description}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setValues((current) => ({ ...current, sections: current.sections.map((entry) => (entry.id === section.id ? { ...entry, visible: !entry.visible } : entry)) }))
                      }
                      aria-pressed={section.visible}
                      aria-label={section.visible ? `Hide ${meta.label}` : `Show ${meta.label}`}
                      className={ICON_BUTTON}
                    >
                      {section.visible ? <Eye className="size-4" strokeWidth={1.8} aria-hidden="true" /> : <EyeOff className="size-4" strokeWidth={1.8} aria-hidden="true" />}
                    </button>
                    <button type="button" onClick={() => setValues((current) => ({ ...current, sections: move(current.sections, index, -1) }))} disabled={index === 0} aria-label={`Move ${meta.label} up`} className={ICON_BUTTON}>
                      <ArrowUp className="size-3.5" strokeWidth={2} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setValues((current) => ({ ...current, sections: move(current.sections, index, 1) }))}
                      disabled={index === values.sections.length - 1}
                      aria-label={`Move ${meta.label} down`}
                      className={ICON_BUTTON}
                    >
                      <ArrowDown className="size-3.5" strokeWidth={2} aria-hidden="true" />
                    </button>
                  </li>
                );
              })}
            </ol>
            {errors.sections ? <p className="mt-2 text-[12px] text-adm-danger">{errors.sections}</p> : null}
          </Card>

          <Card title="Footer" description="The closing message at the bottom of every page.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Headline" htmlFor={id("footer.headline")} error={errors["footer.headline"]}>
                <input id={id("footer.headline")} value={values.footer.headline} maxLength={CONTENT_LIMITS.headline} onChange={(event) => setFooter("headline", event.target.value)} className={inputClass} {...aria("footer.headline")} />
              </Field>
              <Field label="Highlighted words" htmlFor={id("footer.highlight")} error={errors["footer.highlight"]} hint="Follows the headline, in gold.">
                <input id={id("footer.highlight")} value={values.footer.highlight} maxLength={CONTENT_LIMITS.highlight} onChange={(event) => setFooter("highlight", event.target.value)} className={inputClass} {...aria("footer.highlight")} />
              </Field>
              <Field label="Description" htmlFor={id("footer.blurb")} error={errors["footer.blurb"]} hint={`${values.footer.blurb.length}/${CONTENT_LIMITS.blurb}`} className="sm:col-span-2">
                <textarea
                  id={id("footer.blurb")}
                  rows={2}
                  value={values.footer.blurb}
                  maxLength={CONTENT_LIMITS.blurb}
                  onChange={(event) => setFooter("blurb", event.target.value)}
                  className={cn(inputClass, "h-auto resize-y py-2 leading-relaxed")}
                  {...aria("footer.blurb")}
                />
              </Field>
              <Field label="Sign-up note" htmlFor={id("footer.newsletter")} error={errors["footer.newsletter"]} hint="Shown above the email sign-up." className="sm:col-span-2">
                <input id={id("footer.newsletter")} value={values.footer.newsletter} maxLength={CONTENT_LIMITS.newsletter} onChange={(event) => setFooter("newsletter", event.target.value)} className={inputClass} {...aria("footer.newsletter")} />
              </Field>
            </div>
          </Card>
        </div>

        <aside className="flex flex-col gap-6 lg:sticky lg:top-[136px] lg:self-start">
          <Card title="Opener preview">
            <div data-admin-dark className="flex flex-col items-center gap-2 rounded-xl bg-adm-canvas px-4 py-7 text-center text-adm-ink" aria-hidden="true">
              <p className="text-[9.5px] font-semibold tracking-[0.28em] text-adm-ink-faint uppercase">{values.hero.kicker || "Kicker"}</p>
              <p className="flex flex-col leading-none">
                <span className="text-[13px] font-semibold tracking-[0.2em] uppercase">{values.hero.titleTop || "Title"}</span>
                <span className="mt-1 text-[30px] font-bold tracking-[-0.02em] text-adm-accent">{values.hero.titleBottom || "Line two"}</span>
              </p>
              {values.hero.starring ? (
                <p className="text-[11.5px] text-adm-ink-soft">
                  Starring <strong className="text-adm-ink">{values.hero.starring}</strong>
                </p>
              ) : null}
              <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-adm-ink px-3.5 py-1.5 text-[11.5px] font-semibold text-adm-canvas">
                {values.hero.ctaLabel || "Button"}
                <ArrowUpRight className="size-3.5" strokeWidth={2} />
              </span>
              <p className="mt-4 border-t border-adm-line pt-3 text-[10px] tracking-[0.2em] text-adm-ink-faint uppercase">
                Finale · Starring <span className="text-adm-ink">{values.hero.finaleTitle || "…"}</span>
              </p>
            </div>
          </Card>

          <Card title="Footer preview">
            <div data-admin-dark className="rounded-xl bg-adm-canvas px-4 py-5 text-adm-ink" aria-hidden="true">
              <p className="text-[18px] leading-tight font-semibold tracking-tight uppercase">
                {values.footer.headline} <span className="text-adm-accent">{values.footer.highlight}</span>
              </p>
              {values.footer.blurb ? <p className="mt-2 text-[11.5px] leading-relaxed text-adm-ink-soft">{values.footer.blurb}</p> : null}
            </div>
          </Card>

          <p className="flex gap-2 rounded-xl border border-adm-line bg-adm-surface-muted/50 px-3.5 py-3 text-[12px] leading-relaxed text-adm-ink-soft">
            <Info className="mt-0.5 size-3.5 shrink-0 text-adm-info" strokeWidth={2} aria-hidden="true" />
            The storefront shows its built-in copy until content is stored in a database. These previews show how your changes will read.
          </p>
        </aside>
      </div>
    </form>
  );
}
