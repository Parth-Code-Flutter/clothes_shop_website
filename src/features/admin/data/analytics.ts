import "server-only";
import { adminBrand } from "@/features/admin/config/admin-brand";
import { getDashboardData, type DashboardData, type DayPoint } from "@/features/admin/data/dashboard";
import { getOrders } from "@/features/admin/data/orders";
import type { PaymentMethod } from "@/features/admin/lib/order-status";
import { getAllCategories, getAllProducts } from "@/features/catalog/data";

/**
 * SAMPLE analytics built on the dashboard's daily series and the sample orders.
 * Daily figures cover 180 days; breakdowns that need order detail (cities,
 * payment methods, codes, returns) use the recent sample orders and say so.
 * Traffic sources are illustrative until a real analytics provider is wired in.
 */

export const ANALYTICS_RANGES = [7, 30, 90] as const;
export type AnalyticsRange = (typeof ANALYTICS_RANGES)[number];

export function parseRange(value: string | string[] | undefined): AnalyticsRange {
  const days = Number(Array.isArray(value) ? value[0] : value);
  return (ANALYTICS_RANGES as readonly number[]).includes(days) ? (days as AnalyticsRange) : 30;
}

export type Stat = { value: number; previous: number | null };
export type Share = { label: string; value: number; share: number; detail?: string };

export type AnalyticsData = {
  days: AnalyticsRange;
  series: DayPoint[];
  period: { from: string; to: string };
  traffic: { sessions: Stat; newCustomers: Stat; repeatRate: Stat; returnRate: number; itemsPerOrder: number };
  funnel: DashboardData["funnel"];
  categoryMix: DashboardData["categoryMix"];
  sources: { label: string; sessions: number; share: number; conversion: number }[];
  topProducts: { id: string; name: string; image: string; category: string; units: number; revenuePaise: number; share: number }[];
  weekdays: { label: string; averagePaise: number; averageOrders: number }[];
  weekdayWindow: number;
  orderSample: {
    count: number;
    since: string;
    cities: Share[];
    payments: (Share & { method: PaymentMethod })[];
    codes: Share[];
    discountedShare: number;
  };
};

function mulberry32(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const SOURCES = [
  { label: "Instagram", weight: 0.38, conversion: 0.024 },
  { label: "Google search", weight: 0.22, conversion: 0.034 },
  { label: "Direct", weight: 0.17, conversion: 0.041 },
  { label: "WhatsApp", weight: 0.13, conversion: 0.048 },
  { label: "Facebook", weight: 0.06, conversion: 0.017 },
  { label: "Other", weight: 0.04, conversion: 0.02 },
];

const sum = (points: DayPoint[], pick: (point: DayPoint) => number) => points.reduce((total, point) => total + pick(point), 0);

/** Share of orders placed by returning customers. */
function repeatShare(points: DayPoint[]) {
  const orders = sum(points, (point) => point.orders);
  return orders ? Math.max(0, 1 - sum(points, (point) => point.newCustomers) / orders) : 0;
}

function shares<T extends string>(entries: Map<T, number>, limit: number): { label: T; value: number; share: number }[] {
  const total = [...entries.values()].reduce((a, b) => a + b, 0) || 1;
  return [...entries.entries()]
    .map(([label, value]) => ({ label, value, share: value / total }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
}

export function getAnalytics(days: AnalyticsRange, now = new Date(), dashboard: DashboardData = getDashboardData(now)): AnalyticsData {
  const { series } = dashboard;
  const current = series.slice(-days);
  const previous = series.slice(-days * 2, -days);
  const hasPrevious = previous.length === days;
  const random = mulberry32(Number(dashboard.generatedFor.replace(/-/g, "")) + days);

  const revenue = sum(current, (point) => point.revenuePaise);
  const orders = sum(current, (point) => point.orders);
  const sessions = sum(current, (point) => point.sessions);

  const orderSet = getOrders(now);
  const counted = orderSet.filter((order) => order.status !== "cancelled" && order.status !== "awaiting_payment");
  const shippedOrDone = counted.filter((order) => ["delivered", "return_requested", "refunded"].includes(order.status));
  const units = counted.reduce((total, order) => total + order.items.reduce((count, item) => count + item.quantity, 0), 0);

  const cities = new Map<string, number>();
  const payments = new Map<PaymentMethod, number>();
  const codes = new Map<string, number>();
  for (const order of counted) {
    cities.set(order.shipping.city, (cities.get(order.shipping.city) ?? 0) + order.totalPaise);
    payments.set(order.payment.method, (payments.get(order.payment.method) ?? 0) + 1);
    if (order.discountCode) codes.set(order.discountCode, (codes.get(order.discountCode) ?? 0) + 1);
  }
  const cityOrders = (city: string) => counted.filter((order) => order.shipping.city === city).length;

  const products = getAllProducts();
  const categories = getAllCategories();
  const topProducts = [...products]
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, 8)
    .map((product, index) => {
      const sold = Math.max(1, Math.round((62 - index * 6) * (days / 30) * (0.88 + random() * 0.24)));
      return {
        id: product.id,
        name: product.name,
        image: product.image,
        category: categories.find((category) => category.id === product.categoryId)?.name ?? "",
        units: sold,
        revenuePaise: sold * product.pricePaise,
        share: revenue ? (sold * product.pricePaise) / revenue : 0,
      };
    })
    .sort((a, b) => b.units - a.units);

  const weekdayWindow = Math.max(days, 28);
  const weekdayLabel = new Intl.DateTimeFormat(adminBrand.locale, { weekday: "short", timeZone: "UTC" });
  const weekdayTotals = Array.from({ length: 7 }, (_, index) => ({
    label: weekdayLabel.format(new Date(Date.UTC(2024, 0, 1 + index))),
    revenue: 0,
    orders: 0,
    days: 0,
  }));
  for (const point of series.slice(-weekdayWindow)) {
    const entry = weekdayTotals[(new Date(`${point.iso}T00:00:00Z`).getUTCDay() + 6) % 7];
    entry.revenue += point.revenuePaise;
    entry.orders += point.orders;
    entry.days += 1;
  }

  const sourceSessions = SOURCES.map((source) => ({ ...source, sessions: Math.round(sessions * source.weight * (0.9 + random() * 0.2)) }));
  const sourceTotal = sourceSessions.reduce((total, source) => total + source.sessions, 0) || 1;
  const funnelScale = (rate: number) => Math.round(sessions * rate);
  const oldest = orderSet[orderSet.length - 1];

  return {
    days,
    series,
    period: { from: current[0].iso, to: current[current.length - 1].iso },
    traffic: {
      sessions: { value: sessions, previous: hasPrevious ? sum(previous, (point) => point.sessions) : null },
      newCustomers: { value: sum(current, (point) => point.newCustomers), previous: hasPrevious ? sum(previous, (point) => point.newCustomers) : null },
      repeatRate: { value: repeatShare(current), previous: hasPrevious ? repeatShare(previous) : null },
      returnRate: shippedOrDone.length ? shippedOrDone.filter((order) => order.status !== "delivered").length / shippedOrDone.length : 0,
      itemsPerOrder: counted.length ? units / counted.length : 0,
    },
    funnel: [
      { label: "Store visits", value: sessions },
      { label: "Viewed a product", value: funnelScale(0.46) },
      { label: "Added to bag", value: funnelScale(0.081) },
      { label: "Reached checkout", value: funnelScale(0.044) },
      { label: "Purchased", value: orders },
    ],
    categoryMix: dashboard.categoryMix.map((entry) => ({ ...entry, revenuePaise: Math.round(revenue * entry.share) })),
    sources: sourceSessions
      .map((source) => ({ label: source.label, sessions: source.sessions, share: source.sessions / sourceTotal, conversion: source.conversion }))
      .sort((a, b) => b.sessions - a.sessions),
    topProducts,
    weekdays: weekdayTotals.map((entry) => ({
      label: entry.label,
      averagePaise: entry.days ? entry.revenue / entry.days : 0,
      averageOrders: entry.days ? entry.orders / entry.days : 0,
    })),
    weekdayWindow,
    orderSample: {
      count: counted.length,
      since: oldest?.placedAt ?? now.toISOString(),
      cities: shares(cities, 6).map((entry) => ({ ...entry, detail: `${cityOrders(entry.label)} orders` })),
      payments: shares(payments, 4).map((entry) => ({ ...entry, method: entry.label })),
      codes: shares(codes, 4),
      discountedShare: counted.length ? counted.filter((order) => order.discountCode).length / counted.length : 0,
    },
  };
}
