import type { Metadata } from "next";
import { Info } from "lucide-react";
import { requireAdmin } from "@/features/admin/auth/dal";
import { adminBrand } from "@/features/admin/config/admin-brand";
import { ShareListPanel, SourcesPanel, StatTile, TopProductsTable, WeekdayPanel } from "@/features/admin/components/analytics/panels";
import { DashboardToolbar } from "@/features/admin/components/dashboard/dashboard-toolbar";
import { PerformanceTile } from "@/features/admin/components/dashboard/overview";
import { CategoryMixPanel, FunnelPanel, LowStockPanel, RecentOrdersPanel } from "@/features/admin/components/dashboard/panels";
import { SalesRhythmPanel } from "@/features/admin/components/dashboard/sales-rhythm";
import { DashboardSection } from "@/features/admin/components/dashboard/section";
import { AttentionTile, BriefStrip, GoalTile, TodayTile } from "@/features/admin/components/dashboard/tiles";
import { ANALYTICS_RANGES, getAnalytics, parseRange } from "@/features/admin/data/analytics";
import { getDashboardData, type DayPoint } from "@/features/admin/data/dashboard";
import { formatDate, formatMoney, formatNumber, formatPercent, percentChange } from "@/features/admin/lib/format";

export const metadata: Metadata = { title: "Dashboard" };

const SECTIONS = [
  { id: "today", label: "Today" },
  { id: "sales", label: "Sales" },
  { id: "customers", label: "Customers" },
  { id: "products", label: "Products" },
  { id: "orders", label: "Orders" },
];

/** Placeholder account names ("Store Owner") read badly in a greeting, so skip them. */
const GENERIC_NAMES = /^(store|shop|admin|owner|manager|staff|team)$/i;

function greeting(now: Date) {
  const hour = Number(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hourCycle: "h23", timeZone: adminBrand.timeZone }).format(now));
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function salesSummary(series: DayPoint[], days: number) {
  const total = (points: DayPoint[], pick: (point: DayPoint) => number) => points.reduce((sum, point) => sum + pick(point), 0);
  const current = series.slice(-days);
  const previous = series.slice(-days * 2, -days);
  const revenue = total(current, (point) => point.revenuePaise);
  const orders = total(current, (point) => point.orders);
  const change = previous.length === days ? percentChange(revenue, total(previous, (point) => point.revenuePaise)) : null;
  const trend =
    change === null ? "" : Math.abs(change) < 0.5 ? ", level with the period before" : `, ${change > 0 ? "up" : "down"} ${Math.abs(change).toFixed(1)}% on the ${days} days before`;
  return `${formatMoney(revenue)} from ${formatNumber(orders)} orders${trend}.`;
}

export default async function AdminDashboardPage({ searchParams }: PageProps<"/admin">) {
  const session = await requireAdmin();
  const days = parseRange((await searchParams).range);
  const now = new Date();
  const data = getDashboardData(now);
  const insights = getAnalytics(days, now, data);
  const { traffic, orderSample } = insights;

  const first = session.name.trim().split(/\s+/)[0];
  const name = first && !GENERIC_NAMES.test(first) ? first : null;
  const dateLabel = new Intl.DateTimeFormat(adminBrand.locale, { weekday: "long", day: "numeric", month: "long", timeZone: adminBrand.timeZone }).format(now);
  const periodLabel = `${formatDate(`${insights.period.from}T12:00:00Z`)} – ${formatDate(`${insights.period.to}T12:00:00Z`)}`;
  const sampleNote = `${orderSample.count} recent orders since ${formatDate(orderSample.since)}`;
  const cod = orderSample.payments.find((entry) => entry.method === "COD");

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6">
      <header className="adm-rise flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[13px] text-adm-ink-faint">{dateLabel}</p>
          <h1 className="mt-1 text-[26px] leading-tight font-semibold tracking-[-0.025em]">
            {greeting(now)}
            {name ? `, ${name}` : ""}
          </h1>
          <p className="mt-1 text-[13px] text-adm-ink-soft">Everything about {adminBrand.name} in one place: today first, then the bigger picture.</p>
        </div>
        <span
          className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-adm-line-strong px-3 py-1 text-[12px] text-adm-ink-soft"
          title="Orders, revenue, traffic and stock are sample figures until the orders backend and store analytics are connected. Products and categories are real."
        >
          <Info className="size-3.5" strokeWidth={1.8} aria-hidden="true" />
          Sample sales data
        </span>
      </header>

      <DashboardToolbar sections={SECTIONS} days={days} ranges={ANALYTICS_RANGES} />

      <div className="flex flex-col gap-10">
        <DashboardSection id="today" title="Today" description="Live numbers for today, the jobs waiting on you, and how the month is pacing.">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-12">
            <div className="md:col-span-2 xl:col-span-8">
              <TodayTile today={data.today} lastWeek={data.lastWeekSameDay} intraday={data.intraday} series={data.series} delay={60} />
            </div>
            <div className="xl:col-span-4">
              <GoalTile goal={data.monthGoal} delay={120} />
            </div>
            <div className="xl:col-span-4">
              <AttentionTile items={data.attention} delay={160} />
            </div>
            <div className="md:col-span-2 xl:col-span-8">
              <BriefStrip items={data.brief} delay={200} />
            </div>
          </div>
        </DashboardSection>

        <DashboardSection
          id="sales"
          title="Sales"
          description={
            <>
              <span className="font-medium text-adm-ink">Last {days} days:</span> {salesSummary(data.series, days)}
            </>
          }
          aside={<span className="text-[12px] text-adm-ink-faint tabular-nums">{periodLabel}</span>}
        >
          <PerformanceTile key={days} series={data.series} days={days} delay={60} />
          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            <CategoryMixPanel mix={insights.categoryMix} days={days} delay={100} />
            <WeekdayPanel weekdays={insights.weekdays} window={insights.weekdayWindow} delay={140} />
            <div className="lg:col-span-2 xl:col-span-1">
              <ShareListPanel
                title="Top cities"
                description={`Revenue by delivery city · ${sampleNote}`}
                entries={orderSample.cities}
                format={(entry) => formatMoney(entry.value, { compact: true })}
                empty="No orders yet."
                delay={180}
              />
            </div>
          </div>
          <SalesRhythmPanel series={data.series} />
        </DashboardSection>

        <DashboardSection id="customers" title="Customers" description={`How shoppers find the store and how many of them buy · last ${days} days.`}>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatTile label="Store visits" value={formatNumber(traffic.sessions.value)} stat={traffic.sessions} />
            <StatTile label="New customers" value={formatNumber(traffic.newCustomers.value)} stat={traffic.newCustomers} delay={40} />
            <StatTile label="Orders from returning customers" value={formatPercent(traffic.repeatRate.value * 100, 0)} stat={traffic.repeatRate} delay={80} />
            <StatTile
              label="Return rate"
              value={formatPercent(traffic.returnRate * 100, 1)}
              hint={`Of delivered orders · ${traffic.itemsPerOrder.toFixed(1)} items per order`}
              delay={120}
            />
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <FunnelPanel steps={insights.funnel} days={days} />
            <SourcesPanel sources={insights.sources} days={days} delay={40} />
          </div>
        </DashboardSection>

        <DashboardSection id="products" title="Products" description="What's selling, and which sizes to restock before they run out.">
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
            <TopProductsTable products={insights.topProducts} days={days} />
            <LowStockPanel items={data.lowStock} delay={40} />
          </div>
        </DashboardSection>

        <DashboardSection id="orders" title="Orders" description="The latest orders, how customers pay, and which discount codes they use.">
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
            <RecentOrdersPanel orders={data.recentOrders} />
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
              <ShareListPanel
                title="Payment methods"
                description={sampleNote}
                entries={orderSample.payments}
                format={(entry) => `${entry.value} orders`}
                empty="No orders yet."
                footer={cod ? `Cash on delivery is ${formatPercent(cod.share * 100, 0)} of orders. Prepaid offers can lower failed deliveries.` : undefined}
                delay={40}
              />
              <ShareListPanel
                title="Discount codes"
                description={sampleNote}
                entries={orderSample.codes}
                format={(entry) => `${entry.value} uses`}
                empty="No codes used in recent orders."
                footer={`${formatPercent(orderSample.discountedShare * 100, 0)} of recent orders used a code.`}
                delay={80}
              />
            </div>
          </div>
        </DashboardSection>
      </div>
    </div>
  );
}
