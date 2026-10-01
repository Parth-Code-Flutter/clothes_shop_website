import { adminBrand } from "@/features/admin/config/admin-brand";
import { getAllCategories, getAllProducts } from "@/features/catalog/data";

/**
 * SAMPLE dashboard data.
 * Products and categories are the real catalogue; orders, revenue, traffic and
 * stock levels are generated deterministically per calendar day so the numbers
 * are stable between reloads. Replace getDashboardData() with real queries once
 * an orders backend exists — the returned shape is what the UI expects.
 */

export type DayPoint = {
  iso: string;
  label: string;
  revenuePaise: number;
  orders: number;
  newCustomers: number;
  sessions: number;
};

export type OrderStatus = "Awaiting payment" | "Paid" | "Processing" | "Shipped" | "Delivered" | "Refunded";

export type RecentOrder = {
  id: string;
  customer: string;
  city: string;
  items: number;
  totalPaise: number;
  status: OrderStatus;
  payment: "UPI" | "Card" | "COD";
  placed: string;
};

export type AttentionKind = "pack" | "payment" | "returns" | "stock" | "reviews";

/** One owner task; `count` 0 means nothing to do. */
export type AttentionItem = { kind: AttentionKind; count: number; hint: string };

export type BriefTone = "up" | "down" | "tip" | "alert";

/** A one-line, plain-language observation the owner can act on. */
export type BriefItem = { tone: BriefTone; title: string; detail: string };

type DaySnapshot = { revenuePaise: number; orders: number; sessions: number; newCustomers: number };

export type DashboardData = {
  generatedFor: string;
  series: DayPoint[];
  today: DaySnapshot;
  /** Same weekday one week earlier, for a like-for-like comparison. */
  lastWeekSameDay: DaySnapshot & { weekday: string };
  brief: BriefItem[];
  monthGoal: { monthLabel: string; goalPaise: number; achievedPaise: number; daysElapsed: number; daysInMonth: number };
  attention: AttentionItem[];
  recentOrders: RecentOrder[];
  topProducts: { id: string; name: string; image: string; category: string; units: number; revenuePaise: number }[];
  categoryMix: { id: string; name: string; revenuePaise: number; share: number }[];
  funnel: { label: string; value: number }[];
  lowStock: { id: string; name: string; image: string; size: string; left: number }[];
  catalogue: { products: number; liveCategories: number; onOffer: number };
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

const DAY_MS = 24 * 60 * 60 * 1000;
// Monday-first weekend lift for a fashion store.
const WEEKDAY_FACTOR = [1.2, 0.85, 0.82, 0.9, 0.96, 1.14, 1.32];
const SERIES_DAYS = 180;

const CUSTOMERS = [
  ["Aarav Mehta", "Ahmedabad"],
  ["Diya Shah", "Surat"],
  ["Kabir Desai", "Rajkot"],
  ["Ishita Patel", "Vadodara"],
  ["Rohan Joshi", "Mumbai"],
  ["Meera Iyer", "Pune"],
  ["Vihaan Trivedi", "Junagadh"],
] as const;

const ORDER_STATUSES: OrderStatus[] = ["Paid", "Processing", "Awaiting payment", "Shipped", "Delivered", "Processing", "Refunded"];
const PAYMENTS: RecentOrder["payment"][] = ["UPI", "Card", "UPI", "COD", "UPI", "Card", "UPI"];
const PLACED = ["12 min ago", "38 min ago", "1 h ago", "2 h ago", "4 h ago", "Yesterday", "Yesterday"];

function localDayStart(now: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: adminBrand.timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  return new Date(`${parts}T00:00:00Z`);
}

function buildSeries(today: Date): DayPoint[] {
  const label = new Intl.DateTimeFormat(adminBrand.locale, { day: "numeric", month: "short", timeZone: "UTC" });
  const points: DayPoint[] = [];
  for (let offset = SERIES_DAYS - 1; offset >= 0; offset -= 1) {
    const date = new Date(today.getTime() - offset * DAY_MS);
    const dayNumber = Math.floor(date.getTime() / DAY_MS);
    const random = mulberry32(dayNumber * 7919);
    const weekday = (date.getUTCDay() + 6) % 7;
    const trend = 1 + (SERIES_DAYS - offset) * 0.0035;
    const orders = Math.max(3, Math.round(15 * WEEKDAY_FACTOR[weekday] * trend * (0.72 + random() * 0.56)));
    let revenuePaise = 0;
    for (let index = 0; index < orders; index += 1) revenuePaise += Math.round((1150 + random() * 1450) * 100);
    const conversion = 0.021 + random() * 0.011;
    points.push({
      iso: date.toISOString().slice(0, 10),
      label: label.format(date),
      revenuePaise,
      orders,
      newCustomers: Math.max(1, Math.round(orders * (0.3 + random() * 0.18))),
      sessions: Math.round(orders / conversion),
    });
  }
  return points;
}

export function getDashboardData(now = new Date()): DashboardData {
  const today = localDayStart(now);
  const series = buildSeries(today);
  const products = getAllProducts();
  const categories = getAllCategories();
  const random = mulberry32(Math.floor(today.getTime() / DAY_MS));
  const last30 = series.slice(-30);
  const revenue30 = last30.reduce((total, day) => total + day.revenuePaise, 0);
  const orders30 = last30.reduce((total, day) => total + day.orders, 0);
  const sessions30 = last30.reduce((total, day) => total + day.sessions, 0);

  const recentOrders = CUSTOMERS.map(([customer, city], index): RecentOrder => {
    const items = 1 + Math.floor(random() * 3);
    let totalPaise = 0;
    for (let item = 0; item < items; item += 1) {
      totalPaise += products[Math.floor(random() * products.length)].pricePaise;
    }
    return {
      id: `#HB-${(10482 - index * 7).toString()}`,
      customer,
      city,
      items,
      totalPaise,
      status: ORDER_STATUSES[index],
      payment: PAYMENTS[index],
      placed: PLACED[index],
    };
  });

  const topProducts = [...products]
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, 5)
    .map((product, index) => {
      const units = Math.round(64 - index * 9 - random() * 6);
      return {
        id: product.id,
        name: product.name,
        image: product.image,
        category: categories.find((category) => category.id === product.categoryId)?.name ?? "",
        units,
        revenuePaise: units * product.pricePaise,
      };
    });

  const live = categories.filter((category) => category.available);
  const weights = live.map((category) => {
    const inCategory = products.filter((product) => product.categoryId === category.id);
    const value = inCategory.reduce((total, product) => total + product.popularity * product.pricePaise, 0);
    return { category, value };
  });
  const weightTotal = weights.reduce((total, entry) => total + entry.value, 0) || 1;
  const categoryMix = weights
    .map(({ category, value }) => ({
      id: category.id,
      name: category.name,
      share: value / weightTotal,
      revenuePaise: Math.round((revenue30 * value) / weightTotal),
    }))
    .sort((a, b) => b.share - a.share);

  const lowStockPool = [...products].sort((a, b) => a.popularity - b.popularity).slice(0, 12);
  const lowStock = lowStockPool
    .filter((_, index) => index % 3 === 0)
    .slice(0, 4)
    .map((product) => ({
      id: product.id,
      name: product.name,
      image: product.image,
      size: product.sizes[Math.floor(random() * product.sizes.length)] ?? "One size",
      left: 1 + Math.floor(random() * 5),
    }));

  const todayPoint = series[series.length - 1];
  const sumRevenue = (points: DayPoint[]) => points.reduce((total, day) => total + day.revenuePaise, 0);

  const monthKey = todayPoint.iso.slice(0, 7);
  const monthToDate = series.filter((day) => day.iso.startsWith(monthKey));
  const previousMonthKey = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - 1, 1)).toISOString().slice(0, 7);
  const previousMonth = series.filter((day) => day.iso.startsWith(previousMonthKey));
  const daysInMonth = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + 1, 0)).getUTCDate();
  const goalPaise = Math.ceil((sumRevenue(previousMonth) * 1.15) / 50_000_00) * 50_000_00;

  const thisWeek = sumRevenue(series.slice(-7));
  const lastWeek = sumRevenue(series.slice(-14, -7));
  const weekdayTotals = Array.from({ length: 7 }, () => ({ revenue: 0, days: 0 }));
  for (const day of series.slice(-84)) {
    const weekday = new Date(`${day.iso}T00:00:00Z`).getUTCDay();
    weekdayTotals[weekday].revenue += day.revenuePaise;
    weekdayTotals[weekday].days += 1;
  }
  const bestWeekdayIndex = weekdayTotals.reduce(
    (best, entry, index) => (entry.revenue / (entry.days || 1) > weekdayTotals[best].revenue / (weekdayTotals[best].days || 1) ? index : best),
    0,
  );
  const weekdayName = new Intl.DateTimeFormat(adminBrand.locale, { weekday: "long", timeZone: "UTC" }).format(
    new Date(Date.UTC(2024, 0, 7 + bestWeekdayIndex)),
  );

  const scarce = [...lowStock].sort((a, b) => a.left - b.left)[0];

  const sameDayLastWeek = series[series.length - 8];
  const prev30 = series.slice(-60, -30);
  const conversion30 = sessions30 ? orders30 / sessions30 : 0;
  const prevSessions = prev30.reduce((total, day) => total + day.sessions, 0);
  const prevConversion = prevSessions ? prev30.reduce((total, day) => total + day.orders, 0) / prevSessions : 0;
  const conversionChange = prevConversion ? ((conversion30 - prevConversion) / prevConversion) * 100 : 0;
  const weekChange = lastWeek ? ((thisWeek - lastWeek) / lastWeek) * 100 : null;
  const leader = topProducts[0];
  const inr = new Intl.NumberFormat(adminBrand.locale, { style: "currency", currency: adminBrand.currency, maximumFractionDigits: 0 });

  const brief: BriefItem[] = [];
  if (weekChange !== null) {
    brief.push({
      tone: weekChange >= 0 ? "up" : "down",
      title: `Revenue ${weekChange >= 0 ? "up" : "down"} ${Math.abs(weekChange).toFixed(1)}% this week`,
      detail: `${inr.format(thisWeek / 100)} in the last 7 days against ${inr.format(lastWeek / 100)} the week before.`,
    });
  }
  if (scarce) {
    brief.push({
      tone: "alert",
      title: `${scarce.name} is almost sold out`,
      detail: `Only ${scarce.left} left in size ${scarce.size}. Restock before the weekend rush.`,
    });
  }
  brief.push({
    tone: "tip",
    title: `${weekdayName}s are your best day`,
    detail: `They average ${inr.format(weekdayTotals[bestWeekdayIndex].revenue / (weekdayTotals[bestWeekdayIndex].days || 1) / 100)}. Time new drops and offers for then.`,
  });
  brief.push(
    conversionChange < 0
      ? {
          tone: "down",
          title: `Conversion slipped ${Math.abs(conversionChange).toFixed(1)}%`,
          detail: "Fewer visitors are checking out. Review delivery fees and the checkout steps.",
        }
      : {
          tone: "up",
          title: leader ? `${leader.name} leads sales` : `Conversion up ${conversionChange.toFixed(1)}%`,
          detail: leader ? `${leader.units} sold in 30 days. Keep every size in stock.` : "More visitors are completing checkout.",
        },
  );

  return {
    generatedFor: today.toISOString().slice(0, 10),
    series,
    today: {
      revenuePaise: todayPoint.revenuePaise,
      orders: todayPoint.orders,
      sessions: todayPoint.sessions,
      newCustomers: todayPoint.newCustomers,
    },
    lastWeekSameDay: {
      revenuePaise: sameDayLastWeek.revenuePaise,
      orders: sameDayLastWeek.orders,
      sessions: sameDayLastWeek.sessions,
      newCustomers: sameDayLastWeek.newCustomers,
      weekday: new Intl.DateTimeFormat(adminBrand.locale, { weekday: "long", timeZone: "UTC" }).format(new Date(`${sameDayLastWeek.iso}T00:00:00Z`)),
    },
    brief,
    monthGoal: {
      monthLabel: new Intl.DateTimeFormat(adminBrand.locale, { month: "long", timeZone: "UTC" }).format(today),
      goalPaise,
      achievedPaise: sumRevenue(monthToDate),
      daysElapsed: monthToDate.length,
      daysInMonth,
    },
    attention: [
      { kind: "pack", count: 7, hint: "Oldest has waited 3 h" },
      { kind: "payment", count: 3, hint: "UPI and COD confirmations" },
      { kind: "returns", count: 2, hint: "Reply within 48 h" },
      {
        kind: "stock",
        count: lowStock.length,
        hint: scarce ? `${scarce.name}, size ${scarce.size}` : "All sizes in stock",
      },
      { kind: "reviews", count: 5, hint: "Waiting for approval" },
    ],
    recentOrders: recentOrders.slice(0, 5),
    topProducts,
    categoryMix,
    funnel: [
      { label: "Store visits", value: sessions30 },
      { label: "Added to bag", value: Math.round(sessions30 * 0.081) },
      { label: "Reached checkout", value: Math.round(sessions30 * 0.044) },
      { label: "Purchased", value: orders30 },
    ],
    lowStock,
    catalogue: {
      products: products.length,
      liveCategories: live.length,
      onOffer: products.filter((product) => product.mrpPaise && product.mrpPaise > product.pricePaise).length,
    },
  };
}
