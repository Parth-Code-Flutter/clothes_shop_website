import type { Metadata } from "next";
import Link from "next/link";
import type { CSSProperties } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { requireAdmin } from "@/features/admin/auth/dal";
import { CUSTOMERS_PAGE_SIZE, VIP_ORDERS, VIP_SPEND_PAISE, getCustomers, parseCustomerQuery, queryCustomers, type CustomerView } from "@/features/admin/data/customers";
import { CustomersFilters } from "@/features/admin/components/customers/customers-filters";
import { CustomersTable, type CustomerRow } from "@/features/admin/components/customers/customers-table";
import { PageHeader, PageLink, TILE_CLASS, buttonClass } from "@/features/admin/components/ui";
import { formatMoney, formatNumber, formatPercent, formatRelative } from "@/features/admin/lib/format";
import { customersHref } from "@/features/admin/lib/customers-url";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Customers" };

const VIEW_LABELS: Record<CustomerView, string> = {
  all: "All",
  vip: "VIP",
  returning: "Returning",
  new: "New",
  returns: "Has returns",
};

export default async function CustomersPage({ searchParams }: PageProps<"/admin/customers">) {
  await requireAdmin();
  const now = new Date();
  const query = parseCustomerQuery(await searchParams);
  const result = queryCustomers(query, now);
  const everyone = getCustomers(now);

  const repeat = everyone.filter((customer) => customer.ordersCount > 1).length;
  const lifetime = everyone.reduce((total, customer) => total + customer.totalSpentPaise, 0);
  const vip = everyone.filter((customer) => customer.segment === "vip").length;
  const stats = [
    { label: "Customers", value: formatNumber(everyone.length), hint: "Everyone who has ordered" },
    { label: "Repeat rate", value: formatPercent(everyone.length ? (repeat / everyone.length) * 100 : 0, 0), hint: `${repeat} ordered more than once` },
    { label: "Avg. lifetime value", value: formatMoney(everyone.length ? lifetime / everyone.length : 0), hint: "Total spent per customer" },
    { label: "VIP customers", value: formatNumber(vip), hint: `${formatMoney(VIP_SPEND_PAISE)}+ spent or ${VIP_ORDERS}+ orders`, href: customersHref(query, { view: "vip" }) },
  ];

  const rows: CustomerRow[] = result.items.map((customer) => ({
    id: customer.id,
    name: customer.name,
    email: customer.email,
    city: customer.address.city,
    state: customer.address.state,
    ordersCount: customer.ordersCount,
    totalSpentPaise: customer.totalSpentPaise,
    lastOrderLabel: formatRelative(customer.lastOrderAt, now),
    segment: customer.segment,
    hasReturns: customer.hasReturns,
  }));

  const filtered = Boolean(query.q || query.view !== "all");
  const from = result.total === 0 ? 0 : (result.page - 1) * CUSTOMERS_PAGE_SIZE + 1;
  const to = Math.min(result.page * CUSTOMERS_PAGE_SIZE, result.total);

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6">
      <PageHeader title="Customers" description="Everyone who has shopped with you, and how much they love the store." />

      <dl className={cn("adm-rise grid grid-cols-2 lg:grid-cols-4", TILE_CLASS)} style={{ "--adm-delay": "60ms" } as CSSProperties}>
        {stats.map((stat, index) => {
          const body = (
            <>
              <dt className="text-[12.5px] text-adm-ink-soft">{stat.label}</dt>
              <dd className="mt-1 text-[22px] leading-tight font-semibold tracking-[-0.02em] tabular-nums">{stat.value}</dd>
              <dd className="mt-0.5 text-[12px] text-adm-ink-faint">{stat.hint}</dd>
            </>
          );
          const className = cn(
            "block px-5 py-4",
            index % 2 === 1 ? "border-l border-adm-line" : "",
            index >= 2 ? "border-t border-adm-line lg:border-t-0" : "",
            index === 2 ? "lg:border-l" : "",
          );
          return stat.href ? (
            <Link key={stat.label} href={stat.href} scroll={false} className={cn(className, "transition-colors hover:bg-adm-surface-muted/60")}>
              {body}
            </Link>
          ) : (
            <div key={stat.label} className={className}>
              {body}
            </div>
          );
        })}
      </dl>

      <section className={cn("adm-rise overflow-hidden", TILE_CLASS)} style={{ "--adm-delay": "120ms" } as CSSProperties}>
        <nav aria-label="Customer segments" className="flex gap-1 overflow-x-auto border-b border-adm-line px-3 pt-2 sm:px-4">
          {(Object.keys(VIEW_LABELS) as CustomerView[]).map((view) => {
            const active = query.view === view;
            return (
              <Link
                key={view}
                href={customersHref(query, { view })}
                scroll={false}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative inline-flex h-10 shrink-0 items-center gap-2 px-2.5 text-[13px] font-medium whitespace-nowrap transition-colors",
                  active ? "text-adm-ink" : "text-adm-ink-faint hover:text-adm-ink",
                )}
              >
                {VIEW_LABELS[view]}
                <span className={cn("rounded-md px-1.5 py-px text-[11px] font-semibold tabular-nums", active ? "bg-adm-accent-soft text-adm-accent" : "bg-adm-surface-muted text-adm-ink-faint")}>
                  {result.counts[view]}
                </span>
                <span aria-hidden="true" className={cn("absolute inset-x-1 -bottom-px h-0.5 rounded-full bg-adm-accent transition-opacity", active ? "opacity-100" : "opacity-0")} />
              </Link>
            );
          })}
        </nav>

        <div className="border-b border-adm-line px-3 py-3 sm:px-5">
          <CustomersFilters query={query} />
        </div>

        <CustomersTable
          customers={rows}
          emptyAction={
            filtered ? (
              <Link href="/admin/customers" className={buttonClass.secondary}>
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
              <PageLink href={result.page > 1 ? customersHref(query, { page: result.page - 1 }) : null} label="Previous page">
                <ChevronLeft className="size-4" strokeWidth={2} aria-hidden="true" />
              </PageLink>
              <span className="px-2 text-adm-ink-soft tabular-nums">
                {result.page} / {result.pageCount}
              </span>
              <PageLink href={result.page < result.pageCount ? customersHref(query, { page: result.page + 1 }) : null} label="Next page">
                <ChevronRight className="size-4" strokeWidth={2} aria-hidden="true" />
              </PageLink>
            </div>
          </footer>
        ) : null}
      </section>
    </div>
  );
}
