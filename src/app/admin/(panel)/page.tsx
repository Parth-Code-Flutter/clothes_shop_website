import type { Metadata } from "next";
import { Info } from "lucide-react";
import { getAdminSession } from "@/features/admin/auth/dal";
import { adminBrand } from "@/features/admin/config/admin-brand";
import { PerformanceTile } from "@/features/admin/components/dashboard/overview";
import { RecentOrdersPanel, TopProductsPanel } from "@/features/admin/components/dashboard/panels";
import { AttentionTile, BriefTile, GoalTile, TodayTile } from "@/features/admin/components/dashboard/tiles";
import { getDashboardData } from "@/features/admin/data/dashboard";

export const metadata: Metadata = { title: "Dashboard" };

function greeting(now: Date) {
  const hour = Number(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hourCycle: "h23", timeZone: adminBrand.timeZone }).format(now));
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default async function AdminDashboardPage() {
  const session = await getAdminSession();
  const now = new Date();
  const data = getDashboardData(now);
  const firstName = session?.name.split(/\s+/)[0] ?? "there";
  const dateLabel = new Intl.DateTimeFormat(adminBrand.locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: adminBrand.timeZone,
  }).format(now);

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6">
      <header className="adm-rise flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[13px] text-adm-ink-faint">{dateLabel}</p>
          <h1 className="mt-1 text-[26px] leading-tight font-semibold tracking-[-0.025em]">
            {greeting(now)}, {firstName}
          </h1>
        </div>
        <span
          className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-adm-line-strong px-3 py-1 text-[12px] text-adm-ink-soft"
          title="Orders, revenue, traffic and stock are sample figures until the orders backend is connected. Products and categories are real."
        >
          <Info className="size-3.5" strokeWidth={1.8} aria-hidden="true" />
          Sample sales data
        </span>
      </header>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 xl:col-span-8">
          <PerformanceTile series={data.series} delay={60} />
        </div>
        <div className="col-span-12 grid gap-4 md:grid-cols-2 xl:col-span-4 xl:grid-cols-1">
          <TodayTile today={data.today} lastWeek={data.lastWeekSameDay} delay={120} />
          <GoalTile goal={data.monthGoal} delay={180} />
        </div>

        <div className="col-span-12 md:col-span-6 xl:col-span-4">
          <BriefTile items={data.brief} delay={240} />
        </div>
        <div className="col-span-12 md:col-span-6 xl:col-span-4">
          <AttentionTile items={data.attention} delay={300} />
        </div>
        <div className="col-span-12 xl:col-span-4">
          <TopProductsPanel products={data.topProducts} delay={360} />
        </div>

        <div className="col-span-12">
          <RecentOrdersPanel orders={data.recentOrders} delay={420} />
        </div>
      </div>
    </div>
  );
}
