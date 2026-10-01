import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { ArrowUpRight, Plus } from "lucide-react";
import { requireAdmin } from "@/features/admin/auth/dal";
import { getCategorySummaries, getCollections, getRuleProducts, type ResolvedCollection } from "@/features/admin/data/collections";
import { CollectionsTable, type CollectionRow } from "@/features/admin/components/collections/collections-table";
import { PageHeader, TILE_CLASS, buttonClass } from "@/features/admin/components/ui";
import { SORT_LABELS, describeCondition } from "@/features/admin/lib/collection-rules";
import { formatNumber } from "@/features/admin/lib/format";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Collections" };

const VIEWS = {
  all: { label: "All", match: () => true },
  visible: { label: "Visible", match: (collection: ResolvedCollection) => collection.published },
  hidden: { label: "Hidden", match: (collection: ResolvedCollection) => !collection.published },
  smart: { label: "Smart", match: (collection: ResolvedCollection) => collection.kind === "smart" },
  manual: { label: "Manual", match: (collection: ResolvedCollection) => collection.kind === "manual" },
} as const;
type View = keyof typeof VIEWS;

function updatedLabel(days: number) {
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  return `${days} days ago`;
}

export default async function CollectionsPage({ searchParams }: PageProps<"/admin/collections">) {
  await requireAdmin();
  const params = await searchParams;
  const view: View = typeof params.view === "string" && params.view in VIEWS ? (params.view as View) : "all";
  const collections = getCollections();
  const categories = getCategorySummaries();
  const categoryNames = Object.fromEntries(categories.map((category) => [category.id, category.name]));
  const catalogue = getRuleProducts().length;

  const visible = collections.filter((collection) => collection.published);
  const covered = new Set(visible.flatMap((collection) => collection.products.map((product) => product.id))).size;
  const stats = [
    { label: "Collections", value: formatNumber(collections.length), hint: `${collections.filter((collection) => collection.kind === "smart").length} update automatically` },
    { label: "Visible in store", value: formatNumber(visible.length), hint: `${collections.length - visible.length} hidden` },
    { label: "Products featured", value: `${formatNumber(covered)} of ${formatNumber(catalogue)}`, hint: "In at least one visible collection" },
    { label: "Not in any collection", value: formatNumber(catalogue - covered), hint: catalogue - covered ? "Harder for shoppers to find" : "Every product is featured", alert: catalogue - covered > 0 },
  ];

  const rows: CollectionRow[] = collections.filter(VIEWS[view].match).map((collection) => ({
    id: collection.id,
    title: collection.title,
    slug: collection.slug,
    kind: collection.kind,
    summary:
      collection.kind === "smart"
        ? collection.rules.conditions.map((condition) => describeCondition(condition, categoryNames)).join(collection.rules.match === "any" ? " or " : " and ")
        : collection.description || "Hand-picked products",
    sortLabel: SORT_LABELS[collection.sort],
    count: collection.products.length,
    images: [collection.cover, ...collection.products.map((product) => product.image)].filter((src, index, list): src is string => Boolean(src) && list.indexOf(src) === index).slice(0, 3),
    published: collection.published,
    updatedLabel: updatedLabel(collection.updatedDaysAgo),
  }));

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6">
      <PageHeader
        title="Collections"
        description="Curated edits that help shoppers browse, like New Arrivals or Festive."
        actions={
          <Link href="/admin/collections/new" className={buttonClass.primary}>
            <Plus className="size-4" strokeWidth={2} aria-hidden="true" />
            Create collection
          </Link>
        }
      />

      <dl className={cn("adm-rise grid grid-cols-2 lg:grid-cols-4", TILE_CLASS)} style={{ "--adm-delay": "60ms" } as CSSProperties}>
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            className={cn("px-5 py-4", index % 2 === 1 ? "border-l border-adm-line" : "", index >= 2 ? "border-t border-adm-line lg:border-t-0" : "", index === 2 ? "lg:border-l" : "")}
          >
            <dt className="text-[12.5px] text-adm-ink-soft">{stat.label}</dt>
            <dd className={cn("mt-1 text-[22px] leading-tight font-semibold tracking-[-0.02em] tabular-nums", stat.alert && "text-adm-warning")}>{stat.value}</dd>
            <dd className="mt-0.5 text-[12px] text-adm-ink-faint">{stat.hint}</dd>
          </div>
        ))}
      </dl>

      <section className={cn("adm-rise overflow-hidden", TILE_CLASS)} style={{ "--adm-delay": "120ms" } as CSSProperties}>
        <nav aria-label="Collection filters" className="flex gap-1 overflow-x-auto border-b border-adm-line px-3 pt-2 sm:px-4">
          {(Object.keys(VIEWS) as View[]).map((key) => {
            const active = view === key;
            return (
              <Link
                key={key}
                href={key === "all" ? "/admin/collections" : `/admin/collections?view=${key}`}
                scroll={false}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative inline-flex h-10 shrink-0 items-center gap-2 px-2.5 text-[13px] font-medium whitespace-nowrap transition-colors",
                  active ? "text-adm-ink" : "text-adm-ink-faint hover:text-adm-ink",
                )}
              >
                {VIEWS[key].label}
                <span className={cn("rounded-md px-1.5 py-px text-[11px] font-semibold tabular-nums", active ? "bg-adm-accent-soft text-adm-accent" : "bg-adm-surface-muted text-adm-ink-faint")}>
                  {collections.filter(VIEWS[key].match).length}
                </span>
                <span aria-hidden="true" className={cn("absolute inset-x-1 -bottom-px h-0.5 rounded-full bg-adm-accent transition-opacity", active ? "opacity-100" : "opacity-0")} />
              </Link>
            );
          })}
        </nav>
        <CollectionsTable key={view} rows={rows} />
      </section>

      <section className="adm-rise flex flex-col gap-3" style={{ "--adm-delay": "180ms" } as CSSProperties} aria-labelledby="categories-heading">
        <div>
          <h2 id="categories-heading" className="text-[15px] font-semibold tracking-[-0.01em]">
            Categories
          </h2>
          <p className="mt-0.5 text-[12.5px] text-adm-ink-faint">The main departments of the shop. Every product belongs to exactly one.</p>
        </div>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <li key={category.id}>
              <Link
                href={`/admin/products?category=${category.id}`}
                className={cn("group flex h-full flex-col overflow-hidden transition-colors hover:border-adm-line-strong", TILE_CLASS)}
              >
                <span className="relative block aspect-[16/9] bg-adm-surface-muted">
                  <Image src={category.image} alt="" fill sizes="(min-width: 1024px) 280px, (min-width: 640px) 45vw, 90vw" className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]" />
                </span>
                <span className="flex flex-1 flex-col gap-1 p-4">
                  <span className="flex items-center justify-between gap-2">
                    <span className="text-[14px] font-semibold">{category.name}</span>
                    <ArrowUpRight className="size-4 text-adm-ink-faint transition-colors group-hover:text-adm-accent" strokeWidth={1.8} aria-hidden="true" />
                  </span>
                  <span className="line-clamp-2 text-[12.5px] text-adm-ink-soft">{category.description}</span>
                  <span className="mt-auto pt-2 text-[12px] text-adm-ink-faint tabular-nums">
                    {category.products} products · {formatNumber(category.units)} units
                    {category.soldOut ? <span className="text-adm-danger"> · {category.soldOut} sold out</span> : null}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
