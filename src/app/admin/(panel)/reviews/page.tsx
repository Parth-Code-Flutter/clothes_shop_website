import type { Metadata } from "next";
import Link from "next/link";
import type { CSSProperties } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { requireAdmin } from "@/features/admin/auth/dal";
import { adminBrand } from "@/features/admin/config/admin-brand";
import { REVIEWS_PAGE_SIZE, getReviewStats, parseReviewQuery, queryReviews, type ReviewView } from "@/features/admin/data/reviews";
import { ReviewsFilters } from "@/features/admin/components/reviews/reviews-filters";
import { ReviewsList, Stars, type ReviewRow } from "@/features/admin/components/reviews/reviews-list";
import { PageHeader, PageLink, TILE_CLASS, buttonClass } from "@/features/admin/components/ui";
import { formatDateTime, formatNumber, formatRelative } from "@/features/admin/lib/format";
import { FIT_LABELS } from "@/features/admin/lib/review-meta";
import { reviewsHref } from "@/features/admin/lib/reviews-url";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Reviews" };

const VIEW_LABELS: Record<ReviewView, string> = {
  all: "All",
  pending: "Awaiting approval",
  published: "Published",
  needs_reply: "Needs a reply",
  featured: "Featured",
  hidden: "Hidden",
};

const ACTION_VIEWS = new Set<ReviewView>(["pending", "needs_reply"]);

export default async function ReviewsPage({ searchParams }: PageProps<"/admin/reviews">) {
  await requireAdmin();
  const now = new Date();
  const query = parseReviewQuery(await searchParams);
  const result = queryReviews(query, now);
  const stats = getReviewStats(now);
  const most = Math.max(1, ...stats.distribution.map((entry) => entry.count));

  const tiles = [
    { label: "Awaiting approval", value: formatNumber(stats.pending), hint: stats.pending ? "Not visible to shoppers yet" : "All caught up", href: reviewsHref(query, { view: "pending" }), alert: stats.pending > 0 },
    { label: "Low ratings without a reply", value: formatNumber(stats.needsReply), hint: `${Math.round(stats.replyRate * 100)}% of 1–3 star reviews answered`, href: reviewsHref(query, { view: "needs_reply" }), alert: stats.needsReply > 0 },
    { label: "Featured", value: formatNumber(stats.featured), hint: "Shown first on product pages", href: reviewsHref(query, { view: "featured" }) },
  ];

  const rows: ReviewRow[] = result.items.map((review) => ({
    id: review.id,
    productName: review.productName,
    productImage: review.productImage,
    productHref: `/admin/products/${review.productId}`,
    categoryName: review.categoryName,
    size: review.size,
    customerName: review.customerName,
    customerHref: review.customerId ? `/admin/customers/${review.customerId}` : null,
    orderHref: review.orderId ? `/admin/orders/${review.orderId}` : null,
    orderNumber: review.orderId ? `#${review.orderId}` : null,
    verified: review.verified,
    rating: review.rating,
    title: review.title,
    body: review.body,
    fitLabel: review.fit ? FIT_LABELS[review.fit] : null,
    dateLabel: formatRelative(review.createdAt, now),
    dateFull: formatDateTime(review.createdAt),
    status: review.status,
    featured: review.featured,
    reply: review.reply ? { body: review.reply.body, dateLabel: formatRelative(review.reply.at, now) } : null,
    helpful: review.helpful,
    flags: review.flags,
  }));

  const filtered = Boolean(query.q || query.rating || query.view !== "all");
  const from = result.total === 0 ? 0 : (result.page - 1) * REVIEWS_PAGE_SIZE + 1;
  const to = Math.min(result.page * REVIEWS_PAGE_SIZE, result.total);

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6">
      <PageHeader title="Reviews" description="Approve what shoppers say, reply to concerns and feature the best words." />

      <div className="adm-rise grid gap-4 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]" style={{ "--adm-delay": "60ms" } as CSSProperties}>
        <section className={cn("flex items-center gap-6 px-5 py-4", TILE_CLASS)} aria-label="Rating summary">
          <div className="shrink-0 text-center">
            <p className="text-[34px] leading-none font-semibold tracking-[-0.03em] tabular-nums">{stats.average.toFixed(1)}</p>
            <Stars rating={Math.round(stats.average)} className="mt-2" />
            <p className="mt-1 text-[12px] text-adm-ink-faint">{formatNumber(stats.published)} published</p>
          </div>
          <ul className="flex min-w-0 flex-1 flex-col gap-1.5">
            {stats.distribution.map((entry) => (
              <li key={entry.stars}>
                <Link href={reviewsHref(query, { rating: String(entry.stars) })} scroll={false} className="group flex items-center gap-2 text-[12px]">
                  <span className="w-3 text-adm-ink-soft tabular-nums">{entry.stars}</span>
                  <span className="h-2 flex-1 overflow-hidden rounded-full bg-adm-surface-muted">
                    <span
                      className={cn("block h-full rounded-full transition-opacity group-hover:opacity-80", entry.stars >= 4 ? "bg-adm-success" : entry.stars === 3 ? "bg-adm-warning" : "bg-adm-danger")}
                      style={{ width: `${(entry.count / most) * 100}%` }}
                    />
                  </span>
                  <span className="w-7 text-right text-adm-ink-faint tabular-nums">{entry.count}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <dl className={cn("grid sm:grid-cols-3", TILE_CLASS)}>
          {tiles.map((tile, index) => (
            <Link
              key={tile.label}
              href={tile.href}
              scroll={false}
              className={cn("block px-5 py-4 transition-colors hover:bg-adm-surface-muted/60", index > 0 && "border-t border-adm-line sm:border-t-0 sm:border-l")}
            >
              <dt className="text-[12.5px] text-adm-ink-soft">{tile.label}</dt>
              <dd className={cn("mt-1 text-[22px] leading-tight font-semibold tracking-[-0.02em] tabular-nums", tile.alert && "text-adm-warning")}>{tile.value}</dd>
              <dd className="mt-0.5 text-[12px] text-adm-ink-faint">{tile.hint}</dd>
            </Link>
          ))}
        </dl>
      </div>

      <section className={cn("adm-rise overflow-hidden", TILE_CLASS)} style={{ "--adm-delay": "120ms" } as CSSProperties}>
        <nav aria-label="Review status" className="flex gap-1 overflow-x-auto border-b border-adm-line px-3 pt-2 sm:px-4">
          {(Object.keys(VIEW_LABELS) as ReviewView[]).map((view) => {
            const active = query.view === view;
            const count = result.counts[view];
            return (
              <Link
                key={view}
                href={reviewsHref(query, { view })}
                scroll={false}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative inline-flex h-10 shrink-0 items-center gap-2 px-2.5 text-[13px] font-medium whitespace-nowrap transition-colors",
                  active ? "text-adm-ink" : "text-adm-ink-faint hover:text-adm-ink",
                )}
              >
                {VIEW_LABELS[view]}
                <span
                  className={cn(
                    "rounded-md px-1.5 py-px text-[11px] font-semibold tabular-nums",
                    active ? "bg-adm-accent-soft text-adm-accent" : ACTION_VIEWS.has(view) && count > 0 ? "bg-adm-warning-soft text-adm-warning" : "bg-adm-surface-muted text-adm-ink-faint",
                  )}
                >
                  {count}
                </span>
                <span aria-hidden="true" className={cn("absolute inset-x-1 -bottom-px h-0.5 rounded-full bg-adm-accent transition-opacity", active ? "opacity-100" : "opacity-0")} />
              </Link>
            );
          })}
        </nav>

        <div className="border-b border-adm-line px-3 py-3 sm:px-5">
          <ReviewsFilters query={query} />
        </div>

        <ReviewsList
          key={reviewsHref(query, { page: query.page })}
          rows={rows}
          brand={adminBrand.name}
          emptyAction={
            filtered ? (
              <Link href="/admin/reviews" className={buttonClass.secondary}>
                Clear filters
              </Link>
            ) : null
          }
        />

        {result.total > 0 ? (
          <footer className="flex items-center justify-between gap-3 border-t border-adm-line px-4 py-3 text-[12.5px] text-adm-ink-faint sm:px-5">
            <p className="tabular-nums">
              Showing {from}–{to} of {result.total}
            </p>
            <div className="flex items-center gap-1">
              <PageLink href={result.page > 1 ? reviewsHref(query, { page: result.page - 1 }) : null} label="Previous page">
                <ChevronLeft className="size-4" strokeWidth={2} aria-hidden="true" />
              </PageLink>
              <span className="px-2 text-adm-ink-soft tabular-nums">
                {result.page} / {result.pageCount}
              </span>
              <PageLink href={result.page < result.pageCount ? reviewsHref(query, { page: result.page + 1 }) : null} label="Next page">
                <ChevronRight className="size-4" strokeWidth={2} aria-hidden="true" />
              </PageLink>
            </div>
          </footer>
        ) : null}
      </section>
    </div>
  );
}
