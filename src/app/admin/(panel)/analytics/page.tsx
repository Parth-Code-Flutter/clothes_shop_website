import type { Metadata } from "next";
import Link from "next/link";
import { Download, Info } from "lucide-react";
import { requireAdmin } from "@/features/admin/auth/dal";
import { ANALYTICS_RANGES, getAnalytics, parseRange } from "@/features/admin/data/analytics";
import { ShareListPanel, SourcesPanel, StatTile, TopProductsTable, WeekdayPanel } from "@/features/admin/components/analytics/panels";
import { PerformanceTile } from "@/features/admin/components/dashboard/overview";
import { CategoryMixPanel, FunnelPanel } from "@/features/admin/components/dashboard/panels";
import { SalesRhythmPanel } from "@/features/admin/components/dashboard/sales-rhythm";
import { PageHeader, buttonClass } from "@/features/admin/components/ui";
import { formatDate, formatMoney, formatNumber, formatPercent } from "@/features/admin/lib/format";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Analytics" };

export default async function AnalyticsPage({ searchParams }: PageProps<"/admin/analytics">) {
  await requireAdmin();
  const days = parseRange((await searchParams).range);
  const data = getAnalytics(days);
  const { traffic, orderSample } = data;
  const sampleNote = `${orderSample.count} recent orders since ${formatDate(orderSample.since)}`;

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6">
      <PageHeader
        title="Analytics"
        description={`${formatDate(`${data.period.from}T12:00:00Z`)} to ${formatDate(`${data.period.to}T12:00:00Z`)}, compared with the ${days} days before.`}
        actions={
          <>
            <span
              className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-adm-line-strong px-3 py-1 text-[12px] text-adm-ink-soft"
              title="Revenue, orders and traffic are sample figures until the orders backend and store analytics are connected."
            >
              <Info className="size-3.5" strokeWidth={1.8} aria-hidden="true" />
              Sample data
            </span>
            <nav aria-label="Date range" className="inline-flex rounded-lg bg-adm-surface-muted p-0.5">
              {ANALYTICS_RANGES.map((range) => (
                <Link
                  key={range}
                  href={range === 30 ? "/admin/analytics" : `/admin/analytics?range=${range}`}
                  aria-current={range === days ? "page" : undefined}
                  scroll={false}
                  className={cn(
                    "inline-flex h-7 items-center rounded-md px-3 text-[12px] font-medium transition-all focus-visible:outline-2 focus-visible:outline-adm-accent",
                    range === days ? "bg-adm-surface text-adm-ink shadow-[0_1px_2px_rgb(0_0_0/0.08)]" : "text-adm-ink-faint hover:text-adm-ink",
                  )}
                >
                  {range} days
                </Link>
              ))}
            </nav>
            <a href={`/admin/analytics/export?range=${days}`} className={cn(buttonClass.secondary, "h-8")}>
              <Download className="size-3.5" strokeWidth={2} aria-hidden="true" />
              Export
            </a>
          </>
        }
      />

      <PerformanceTile key={days} series={data.series} days={days} delay={60} />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label="Store visits" value={formatNumber(traffic.sessions.value)} stat={traffic.sessions} delay={120} />
        <StatTile label="New customers" value={formatNumber(traffic.newCustomers.value)} stat={traffic.newCustomers} delay={150} />
        <StatTile label="Orders from returning customers" value={formatPercent(traffic.repeatRate.value * 100, 0)} stat={traffic.repeatRate} delay={180} />
        <StatTile
          label="Return rate"
          value={formatPercent(traffic.returnRate * 100, 1)}
          hint={`Of delivered recent orders · ${traffic.itemsPerOrder.toFixed(1)} items per order`}
          delay={210}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <FunnelPanel steps={data.funnel} days={days} delay={240} />
        <CategoryMixPanel mix={data.categoryMix} days={days} delay={270} />
        <div className="lg:col-span-2 xl:col-span-1">
          <SourcesPanel sources={data.sources} days={days} delay={300} />
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <TopProductsTable products={data.topProducts} days={days} delay={330} />
        <WeekdayPanel weekdays={data.weekdays} window={data.weekdayWindow} delay={360} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <ShareListPanel
          title="Top cities"
          description={`Revenue by delivery city · ${sampleNote}`}
          entries={orderSample.cities}
          format={(entry) => formatMoney(entry.value, { compact: true })}
          empty="No orders yet."
          delay={390}
        />
        <ShareListPanel
          title="Payment methods"
          description={sampleNote}
          entries={orderSample.payments}
          format={(entry) => `${entry.value} orders`}
          empty="No orders yet."
          footer={(() => {
            const cod = orderSample.payments.find((entry) => entry.method === "COD");
            return cod ? `Cash on delivery is ${formatPercent(cod.share * 100, 0)} of orders. Prepaid offers can lower failed deliveries.` : undefined;
          })()}
          delay={420}
        />
        <div className="md:col-span-2 xl:col-span-1">
          <ShareListPanel
            title="Discount codes"
            description={sampleNote}
            entries={orderSample.codes}
            format={(entry) => `${entry.value} uses`}
            empty="No codes used in recent orders."
            footer={`${formatPercent(orderSample.discountedShare * 100, 0)} of recent orders used a code.`}
            delay={450}
          />
        </div>
      </div>

      <SalesRhythmPanel series={data.series} />
    </div>
  );
}
