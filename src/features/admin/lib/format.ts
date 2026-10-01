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
  maximumFractionDigits: 1,
});

const number = new Intl.NumberFormat(adminBrand.locale);
const numberCompact = new Intl.NumberFormat(adminBrand.locale, { notation: "compact", maximumFractionDigits: 1 });

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

/** Percentage change from previous to current; null when there is no baseline. */
export function percentChange(current: number, previous: number) {
  if (!previous) return null;
  return ((current - previous) / previous) * 100;
}
