import type { Metadata } from "next";
import Link from "next/link";
import type { CSSProperties } from "react";
import { Plus } from "lucide-react";
import { requireAdmin } from "@/features/admin/auth/dal";
import { getDiscounts, statusOf, type DiscountWithStatus } from "@/features/admin/data/discounts";
import { getProductCategories } from "@/features/admin/data/products";
import { DiscountsTable, type DiscountRow } from "@/features/admin/components/discounts/discounts-table";
import { PageHeader, TILE_CLASS, buttonClass } from "@/features/admin/components/ui";
import { discountHeadline } from "@/features/admin/lib/discount-rules";
import { formatMoney, formatNumber } from "@/features/admin/lib/format";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Discounts" };

const VIEWS = {
  all: { label: "All", match: () => true },
  active: { label: "Active", match: (discount: DiscountWithStatus) => discount.status === "active" },
  scheduled: { label: "Scheduled", match: (discount: DiscountWithStatus) => discount.status === "scheduled" },
  ended: { label: "Ended", match: (discount: DiscountWithStatus) => discount.status === "expired" || discount.status === "used_up" },
  off: { label: "Turned off", match: (discount: DiscountWithStatus) => discount.status === "disabled" },
} as const;
type View = keyof typeof VIEWS;

function daysLabel(iso: string, now: Date, verb: "Starts" | "Ends") {
  const days = Math.round((new Date(iso).getTime() - now.getTime()) / 86_400_000);
  if (days === 0) return `${verb} today`;
  const count = `${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"}`;
  return days > 0 ? `${verb} in ${count}` : `${verb === "Starts" ? "Started" : "Ended"} ${count} ago`;
}

export default async function DiscountsPage({ searchParams }: PageProps<"/admin/discounts">) {
  await requireAdmin();
  const now = new Date();
  const params = await searchParams;
  const view: View = typeof params.view === "string" && params.view in VIEWS ? (params.view as View) : "all";
  const discounts = getDiscounts(now);
  const categoryNames = Object.fromEntries(getProductCategories().map((category) => [category.id, category.name]));

  const uses = discounts.reduce((total, discount) => total + discount.uses, 0);
  const given = discounts.reduce((total, discount) => total + discount.discountGivenPaise, 0);
  const stats = [
    { label: "Active codes", value: formatNumber(discounts.filter((discount) => discount.status === "active").length), hint: `${discounts.filter((discount) => discount.status === "scheduled").length} scheduled` },
    { label: "Times used", value: formatNumber(uses), hint: "Across every code" },
    { label: "Sales with codes", value: formatMoney(discounts.reduce((total, discount) => total + discount.revenuePaise, 0), { compact: true }), hint: "Order totals after discount" },
    { label: "Discount given", value: formatMoney(given, { compact: true }), hint: uses ? `${formatMoney(given / uses)} per order on average` : "Nothing yet" },
  ];

  const rows: DiscountRow[] = discounts.filter(VIEWS[view].match).map((discount) => ({
    id: discount.id,
    code: discount.code,
    headline: discountHeadline(discount),
    scope: [
      discount.categoryIds.length ? discount.categoryIds.map((id) => categoryNames[id] ?? id).join(", ") : "All products",
      discount.minOrderPaise ? `min ${formatMoney(discount.minOrderPaise)}` : null,
      discount.firstOrderOnly ? "first order" : null,
    ]
      .filter(Boolean)
      .join(" · "),
    status: discount.status,
    statusWhenOn: statusOf({ ...discount, enabled: true }, now),
    enabled: discount.enabled,
    uses: discount.uses,
    usageLimit: discount.usageLimit,
    dateLabel:
      discount.status === "scheduled"
        ? daysLabel(discount.startsAt, now, "Starts")
        : discount.endsAt
          ? daysLabel(discount.endsAt, now, "Ends")
          : "No end date",
    revenuePaise: discount.revenuePaise,
  }));

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6">
      <PageHeader
        title="Discounts"
        description="Coupon codes shoppers enter at checkout."
        actions={
          <Link href="/admin/discounts/new" className={buttonClass.primary}>
            <Plus className="size-4" strokeWidth={2} aria-hidden="true" />
            Create discount
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
            <dd className="mt-1 text-[22px] leading-tight font-semibold tracking-[-0.02em] tabular-nums">{stat.value}</dd>
            <dd className="mt-0.5 text-[12px] text-adm-ink-faint">{stat.hint}</dd>
          </div>
        ))}
      </dl>

      <section className={cn("adm-rise overflow-hidden", TILE_CLASS)} style={{ "--adm-delay": "120ms" } as CSSProperties}>
        <nav aria-label="Discount status" className="flex gap-1 overflow-x-auto border-b border-adm-line px-3 pt-2 sm:px-4">
          {(Object.keys(VIEWS) as View[]).map((key) => {
            const active = view === key;
            return (
              <Link
                key={key}
                href={key === "all" ? "/admin/discounts" : `/admin/discounts?view=${key}`}
                scroll={false}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative inline-flex h-10 shrink-0 items-center gap-2 px-2.5 text-[13px] font-medium whitespace-nowrap transition-colors",
                  active ? "text-adm-ink" : "text-adm-ink-faint hover:text-adm-ink",
                )}
              >
                {VIEWS[key].label}
                <span className={cn("rounded-md px-1.5 py-px text-[11px] font-semibold tabular-nums", active ? "bg-adm-accent-soft text-adm-accent" : "bg-adm-surface-muted text-adm-ink-faint")}>
                  {discounts.filter(VIEWS[key].match).length}
                </span>
                <span aria-hidden="true" className={cn("absolute inset-x-1 -bottom-px h-0.5 rounded-full bg-adm-accent transition-opacity", active ? "opacity-100" : "opacity-0")} />
              </Link>
            );
          })}
        </nav>
        <DiscountsTable key={view} rows={rows} />
      </section>
    </div>
  );
}
