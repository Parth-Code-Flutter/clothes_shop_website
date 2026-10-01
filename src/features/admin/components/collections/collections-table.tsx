"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";
import { Hand, LayoutGrid, Sparkles } from "lucide-react";
import { setCollectionPublishedAction } from "@/features/admin/collections/actions";
import { useToast } from "@/features/admin/components/admin-toast";
import type { CollectionKind } from "@/features/admin/lib/collection-rules";
import { cn } from "@/lib/utils";

export type CollectionRow = {
  id: string;
  title: string;
  slug: string;
  kind: CollectionKind;
  summary: string;
  sortLabel: string;
  count: number;
  images: string[];
  published: boolean;
  updatedLabel: string;
};

export function KindBadge({ kind }: { kind: CollectionKind }) {
  const Icon = kind === "smart" ? Sparkles : Hand;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11.5px] font-medium whitespace-nowrap",
        kind === "smart" ? "bg-adm-accent-soft text-adm-accent" : "bg-adm-surface-muted text-adm-ink-soft",
      )}
    >
      <Icon className="size-3" strokeWidth={2} aria-hidden="true" />
      {kind === "smart" ? "Smart" : "Manual"}
    </span>
  );
}

/** Up to three product images: one large, two stacked. */
export function CoverMosaic({ images, className }: { images: string[]; className?: string }) {
  if (images.length === 0) {
    return (
      <span className={cn("flex items-center justify-center rounded-xl border border-dashed border-adm-line-strong text-adm-ink-faint", className)}>
        <LayoutGrid className="size-5" strokeWidth={1.6} aria-hidden="true" />
      </span>
    );
  }
  return (
    <span className={cn("grid grid-cols-[2fr_1fr] grid-rows-2 gap-0.5 overflow-hidden rounded-xl bg-adm-surface-muted", className)}>
      {images.slice(0, 3).map((src, index) => (
        <span key={src} className={cn("relative", index === 0 ? "row-span-2" : "", images.length === 1 ? "col-span-2" : "", images.length === 2 && index === 1 ? "row-span-2" : "")}>
          <Image src={src} alt="" fill sizes="64px" className="object-cover" />
        </span>
      ))}
    </span>
  );
}

export function CollectionsTable({ rows }: { rows: CollectionRow[] }) {
  const [published, setPublished] = useState<Record<string, boolean>>(() => Object.fromEntries(rows.map((row) => [row.id, row.published])));
  const [pending, startTransition] = useTransition();
  const [toast, showToast] = useToast();

  const toggle = (row: CollectionRow) => {
    const next = !(published[row.id] ?? row.published);
    setPublished((current) => ({ ...current, [row.id]: next }));
    startTransition(async () => {
      const result = await setCollectionPublishedAction(row.id, next);
      if (!result.ok) setPublished((current) => ({ ...current, [row.id]: !next }));
      showToast(result.message, !result.ok ? "error" : result.persisted ? "success" : "info");
    });
  };

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center px-6 py-16 text-center">
        <span className="inline-flex size-11 items-center justify-center rounded-xl bg-adm-surface-muted text-adm-ink-faint">
          <LayoutGrid className="size-5" strokeWidth={1.7} aria-hidden="true" />
        </span>
        <p className="mt-4 text-[14px] font-medium">No collections here</p>
        <p className="mt-1 text-[13px] text-adm-ink-faint">Group products into edits like &ldquo;New Arrivals&rdquo; or &ldquo;Festive&rdquo;.</p>
      </div>
    );
  }

  return (
    <>
      <ul className="divide-y divide-adm-line">
        {rows.map((row) => {
          const on = published[row.id] ?? row.published;
          return (
            <li key={row.id} className="group relative flex flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3.5 transition-colors hover:bg-adm-surface-muted/40 sm:px-5">
              <div className="flex min-w-0 flex-1 basis-72 items-center gap-3.5">
                <CoverMosaic images={row.images} className="h-14 w-[72px] shrink-0" />
                <span className="min-w-0">
                  <span className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/admin/collections/${row.id}`}
                      className="truncate text-[14px] font-semibold text-adm-ink group-hover:text-adm-accent after:absolute after:inset-0 focus-visible:outline-none"
                    >
                      {row.title}
                    </Link>
                    <KindBadge kind={row.kind} />
                  </span>
                  <span className="mt-0.5 block truncate text-[12.5px] text-adm-ink-soft">{row.summary}</span>
                  <span className="block truncate text-[12px] text-adm-ink-faint">
                    /collections/{row.slug} · {row.sortLabel}
                  </span>
                </span>
              </div>

              <div className="w-24">
                <span className="block text-[14px] font-semibold tabular-nums">{row.count}</span>
                <span className="block text-[12px] text-adm-ink-faint">{row.count === 1 ? "product" : "products"}</span>
              </div>
              <div className="hidden w-36 md:block">
                <span className={cn("inline-flex items-center gap-1.5 text-[12.5px] font-medium", on ? "text-adm-success" : "text-adm-ink-faint")}>
                  <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
                  {on ? "Visible" : "Hidden"}
                </span>
                <span className="block text-[12px] text-adm-ink-faint">Updated {row.updatedLabel}</span>
              </div>
              <label className="relative z-10 ml-auto flex cursor-pointer items-center">
                <span className="sr-only">{on ? `Hide ${row.title}` : `Show ${row.title}`}</span>
                <input type="checkbox" checked={on} disabled={pending} onChange={() => toggle(row)} className="peer sr-only" />
                <span
                  aria-hidden="true"
                  className="relative h-5 w-9 shrink-0 rounded-full bg-adm-line-strong transition-colors peer-checked:bg-adm-accent peer-disabled:opacity-60 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-adm-accent after:absolute after:top-0.5 after:left-0.5 after:size-4 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:after:translate-x-4"
                />
              </label>
            </li>
          );
        })}
      </ul>
      {toast}
    </>
  );
}
