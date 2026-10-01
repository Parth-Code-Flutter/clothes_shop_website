import type { Metadata } from "next";
import Link from "next/link";
import type { CSSProperties } from "react";
import { ArrowRight, Eye, EyeOff, FileText, Megaphone, PanelsTopLeft, Plus } from "lucide-react";
import { requireAdmin } from "@/features/admin/auth/dal";
import { getCollections } from "@/features/admin/data/collections";
import { getPages, getSiteContent } from "@/features/admin/data/content";
import { PageHeader, TILE_CLASS, buttonClass } from "@/features/admin/components/ui";
import { HOME_SECTION_META, wordCount } from "@/features/admin/lib/content-meta";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Content" };

function updatedLabel(days: number) {
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

export default async function ContentPage() {
  await requireAdmin();
  const site = getSiteContent();
  const pages = getPages();
  const reel = site.hero.reelSource === "mix" ? "One piece from each category" : (getCollections().find((collection) => collection.id === site.hero.reelSource)?.title ?? "Collection");

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6">
      <PageHeader title="Content" description="The words and layout shoppers see on the storefront." />

      <div className="adm-rise grid gap-4 lg:grid-cols-2" style={{ "--adm-delay": "60ms" } as CSSProperties}>
        <Link href="/admin/content/homepage" className={cn("group flex flex-col p-5 transition-colors hover:border-adm-line-strong", TILE_CLASS)}>
          <span className="flex items-start justify-between gap-3">
            <span className="flex items-center gap-3">
              <span className="inline-flex size-10 items-center justify-center rounded-xl bg-adm-accent-soft text-adm-accent">
                <PanelsTopLeft className="size-5" strokeWidth={1.7} aria-hidden="true" />
              </span>
              <span>
                <span className="block text-[14px] font-semibold">Homepage</span>
                <span className="block text-[12.5px] text-adm-ink-faint">Opener, sections and footer copy</span>
              </span>
            </span>
            <ArrowRight className="size-4 text-adm-ink-faint transition-transform group-hover:translate-x-0.5 group-hover:text-adm-accent" strokeWidth={1.8} aria-hidden="true" />
          </span>
          <span className="mt-4 rounded-xl bg-adm-surface-muted/60 px-4 py-3">
            <span className="block text-[11px] font-semibold tracking-[0.18em] text-adm-ink-faint uppercase">{site.hero.kicker}</span>
            <span className="mt-1 block text-[18px] leading-tight font-semibold tracking-[-0.01em]">
              {site.hero.titleTop} <span className="text-adm-accent">{site.hero.titleBottom}</span>
            </span>
            <span className="mt-1 block text-[12px] text-adm-ink-soft">Reel: {reel}</span>
          </span>
          <ol className="mt-4 flex flex-wrap gap-1.5">
            {site.sections.map((section, index) => (
              <li
                key={section.id}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 text-[12px]",
                  section.visible ? "border-adm-line text-adm-ink-soft" : "border-dashed border-adm-line text-adm-ink-faint line-through",
                )}
              >
                <span className="text-adm-ink-faint tabular-nums">{index + 1}</span>
                {HOME_SECTION_META[section.id].label}
                {section.visible ? <Eye className="size-3" strokeWidth={2} aria-hidden="true" /> : <EyeOff className="size-3" strokeWidth={2} aria-label="Hidden" />}
              </li>
            ))}
          </ol>
        </Link>

        <Link href="/admin/content/homepage" className={cn("group flex flex-col p-5 transition-colors hover:border-adm-line-strong", TILE_CLASS)}>
          <span className="flex items-start justify-between gap-3">
            <span className="flex items-center gap-3">
              <span className="inline-flex size-10 items-center justify-center rounded-xl bg-adm-warning-soft text-adm-warning">
                <Megaphone className="size-5" strokeWidth={1.7} aria-hidden="true" />
              </span>
              <span>
                <span className="block text-[14px] font-semibold">Announcement bar</span>
                <span className="block text-[12.5px] text-adm-ink-faint">
                  {site.announcement.enabled ? `On · ${site.announcement.messages.length} messages` : "Off"}
                </span>
              </span>
            </span>
            <ArrowRight className="size-4 text-adm-ink-faint transition-transform group-hover:translate-x-0.5 group-hover:text-adm-accent" strokeWidth={1.8} aria-hidden="true" />
          </span>
          <span data-admin-dark className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl bg-adm-canvas px-4 py-3.5 text-[10px] font-bold tracking-[0.22em] text-adm-ink-soft uppercase">
            {site.announcement.messages.map((message) => (
              <span key={message.id} className="flex items-center gap-5">
                {message.text}
                <span className="size-1.5 rotate-45 bg-adm-accent" aria-hidden="true" />
              </span>
            ))}
          </span>
          <span className="mt-auto pt-4 text-[12px] text-adm-ink-faint">
            Footer: &ldquo;{site.footer.headline} {site.footer.highlight}&rdquo;
          </span>
        </Link>
      </div>

      <section className={cn("adm-rise overflow-hidden", TILE_CLASS)} style={{ "--adm-delay": "120ms" } as CSSProperties} aria-labelledby="pages-heading">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-adm-line px-4 py-3 sm:px-5">
          <div>
            <h2 id="pages-heading" className="text-[14px] font-semibold">
              Pages
            </h2>
            <p className="text-[12.5px] text-adm-ink-faint">Policies and info pages linked from the footer.</p>
          </div>
          <Link href="/admin/content/pages/new" className={cn(buttonClass.secondary, "h-8")}>
            <Plus className="size-3.5" strokeWidth={2} aria-hidden="true" />
            New page
          </Link>
        </header>
        <ul className="divide-y divide-adm-line">
          {pages.map((page) => (
            <li key={page.id} className="group relative flex flex-wrap items-center gap-x-6 gap-y-1 px-4 py-3 transition-colors hover:bg-adm-surface-muted/40 sm:px-5">
              <span className="flex min-w-0 flex-1 basis-64 items-center gap-3">
                <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-adm-surface-muted text-adm-ink-faint">
                  <FileText className="size-4" strokeWidth={1.7} aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <Link href={`/admin/content/pages/${page.id}`} className="block truncate text-[13.5px] font-medium group-hover:text-adm-accent after:absolute after:inset-0 focus-visible:outline-none">
                    {page.title}
                  </Link>
                  <span className="block truncate font-mono text-[11.5px] text-adm-ink-faint">/pages/{page.slug}</span>
                </span>
              </span>
              <span className="w-24 text-[12.5px] text-adm-ink-soft tabular-nums">{wordCount(page.body)} words</span>
              <span className="w-28 text-[12.5px] text-adm-ink-faint">{updatedLabel(page.updatedDaysAgo)}</span>
              <span
                className={cn(
                  "inline-flex w-24 items-center gap-1.5 text-[12.5px] font-medium",
                  page.status === "published" ? "text-adm-success" : "text-adm-ink-faint",
                )}
              >
                <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
                {page.status === "published" ? "Published" : "Draft"}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
