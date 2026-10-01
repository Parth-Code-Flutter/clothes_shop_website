import { formatMoney } from "@/features/admin/lib/format";

/** Discount shapes shared by the server data, the actions and the editor. */

export const DISCOUNT_TYPES = ["percent", "fixed", "free_shipping"] as const;
export type DiscountType = (typeof DISCOUNT_TYPES)[number];

export type DiscountStatus = "active" | "scheduled" | "expired" | "disabled" | "used_up";

export type DiscountRules = {
  type: DiscountType;
  /** Percent (1–90) for "percent", paise for "fixed", unused for free shipping. */
  value: number;
  minOrderPaise: number | null;
  /** Empty means every product. */
  categoryIds: string[];
  firstOrderOnly: boolean;
  oncePerCustomer: boolean;
  usageLimit: number | null;
};

export const DISCOUNT_STATUS_META: Record<DiscountStatus, { label: string; className: string }> = {
  active: { label: "Active", className: "bg-adm-success-soft text-adm-success" },
  scheduled: { label: "Scheduled", className: "bg-adm-info-soft text-adm-info" },
  expired: { label: "Expired", className: "bg-adm-surface-muted text-adm-ink-faint" },
  disabled: { label: "Turned off", className: "bg-adm-surface-muted text-adm-ink-soft" },
  used_up: { label: "Limit reached", className: "bg-adm-warning-soft text-adm-warning" },
};

export const CODE_PATTERN = /^[A-Z0-9_-]{3,20}$/;

/** The headline, e.g. "15% off" or "₹300 off". */
export function discountHeadline(rules: Pick<DiscountRules, "type" | "value">) {
  if (rules.type === "percent") return `${rules.value || 0}% off`;
  if (rules.type === "fixed") return `${formatMoney(rules.value || 0)} off`;
  return "Free shipping";
}

/** Plain-language lines describing who gets the discount and when. */
export function describeDiscount(rules: DiscountRules, categoryNames: Record<string, string>) {
  const scope = rules.categoryIds.length ? rules.categoryIds.map((id) => categoryNames[id] ?? id).join(", ") : "all products";
  const lines = [`${discountHeadline(rules)} on ${scope}`];
  lines.push(rules.minOrderPaise ? `On orders of ${formatMoney(rules.minOrderPaise)} or more` : "No minimum order");
  if (rules.firstOrderOnly) lines.push("First order only");
  if (rules.oncePerCustomer) lines.push("One use per customer");
  if (rules.usageLimit) lines.push(`Limited to ${rules.usageLimit.toLocaleString("en-IN")} uses in total`);
  return lines;
}

export function generateCode(seed = Math.random()) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  let value = Math.floor(seed * 2 ** 31);
  for (let index = 0; index < 8; index += 1) {
    value = (value * 1103515245 + 12345) & 0x7fffffff;
    code += alphabet[value % alphabet.length];
  }
  return code;
}
