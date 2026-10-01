import { adminBrand } from "@/features/admin/config/admin-brand";

const money = new Intl.NumberFormat(adminBrand.locale, {
  style: "currency",
  currency: adminBrand.currency,
  maximumFractionDigits: 0,
});

const moneyCompact = new Intl.NumberFormat(adminBrand.locale, {
  style: "currency",
  currency: adminBrand.currency,
  notation: "compact",
  // Explicit minimum: Node's ICU otherwise pads currency to "₹50.0K" while browsers print "₹50K", breaking hydration.
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
});

const number = new Intl.NumberFormat(adminBrand.locale);
const numberCompact = new Intl.NumberFormat(adminBrand.locale, { notation: "compact", minimumFractionDigits: 0, maximumFractionDigits: 1 });

export function formatMoney(paise: number, options: { compact?: boolean } = {}) {
  const rupees = paise / 100;
  return options.compact ? moneyCompact.format(rupees) : money.format(Math.round(rupees));
}

export function formatNumber(value: number, options: { compact?: boolean } = {}) {
  return options.compact ? numberCompact.format(value) : number.format(value);
}

export function formatPercent(value: number, digits = 1) {
  return `${value.toFixed(digits)}%`;
}

const dateTime = new Intl.DateTimeFormat(adminBrand.locale, {
  timeZone: adminBrand.timeZone,
  day: "numeric",
  month: "short",
  hour: "numeric",
  minute: "2-digit",
});
const dateOnly = new Intl.DateTimeFormat(adminBrand.locale, { timeZone: adminBrand.timeZone, day: "numeric", month: "short", year: "numeric" });

export function formatDateTime(iso: string) {
  return dateTime.format(new Date(iso));
}

export function formatDate(iso: string) {
  return dateOnly.format(new Date(iso));
}

/** "Just now", "12 min ago", "3 h ago", "Yesterday", then a date. */
export function formatRelative(iso: string, now = new Date()) {
  const minutes = Math.round((now.getTime() - new Date(iso).getTime()) / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  if (hours < 48) return "Yesterday";
  return formatDate(iso);
}

/** Percentage change from previous to current; null when there is no baseline. */
export function percentChange(current: number, previous: number) {
  if (!previous) return null;
  return ((current - previous) / previous) * 100;
}
