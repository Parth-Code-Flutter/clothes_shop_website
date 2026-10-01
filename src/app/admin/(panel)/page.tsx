import type { Metadata } from "next";
import { Info } from "lucide-react";
import { getAdminSession } from "@/features/admin/auth/dal";
import { adminBrand } from "@/features/admin/config/admin-brand";
import { DashboardOverview } from "@/features/admin/components/dashboard/overview";
import {
  CategoryMixPanel,
  FulfilmentPanel,
  FunnelPanel,
  LowStockPanel,
  RecentOrdersPanel,
  TopProductsPanel,
} from "@/features/admin/components/dashboard/panels";
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
  const today = new Intl.DateTimeFormat(adminBrand.locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: adminBrand.timeZone,
  }).format(now);

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-8">
      <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[13px] font-medium text-adm-ink-soft">{today}</p>
          <h1 className="mt-1 font-adm-display text-[1.625rem] leading-tight font-semibold tracking-[-0.02em] sm:text-[1.875rem]">
            {greeting(now)}, {firstName}
          </h1>
          <p className="mt-2 text-[15px] text-adm-ink-soft">Here&apos;s how {adminBrand.name} is performing.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-adm-line bg-adm-surface px-3.5 py-1.5 text-[12px] font-medium text-adm-ink-soft">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-adm-success opacity-60 motion-reduce:animate-none" />
              <span className="relative size-2 rounded-full bg-adm-success" />
            </span>
            Store live
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-adm-line bg-adm-surface px-3.5 py-1.5 text-[12px] font-medium text-adm-ink-soft">
            {data.catalogue.products} products · {data.catalogue.liveCategories} categories · {data.catalogue.onOffer} on offer
          </span>
          <span
            className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-adm-warning/50 bg-adm-warning-soft px-3.5 py-1.5 text-[12px] font-medium text-adm-warning"
            title="Orders, revenue, traffic and stock are sample figures until the orders backend is connected. Products and categories are real."
          >
            <Info className="size-3.5" strokeWidth={1.8} aria-hidden="true" />
            Sample sales data
          </span>
        </div>
      </header>

      <DashboardOverview series={data.series} />

      <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <RecentOrdersPanel orders={data.recentOrders} />
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-1">
          <FulfilmentPanel items={data.fulfilment} />
          <LowStockPanel items={data.lowStock} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        <TopProductsPanel products={data.topProducts} />
        <CategoryMixPanel mix={data.categoryMix} />
        <div className="md:col-span-2 xl:col-span-1">
          <FunnelPanel steps={data.funnel} />
        </div>
      </div>
    </div>
  );
}
