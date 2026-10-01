import "server-only";
import { adminBrand } from "@/features/admin/config/admin-brand";
import { getOrders } from "@/features/admin/data/orders";
import type { DiscountRules, DiscountStatus } from "@/features/admin/lib/discount-rules";

/**
 * SAMPLE discount codes, dated relative to today. FESTIVE10's usage comes from
 * the sample orders; the others use fixed sample numbers. Writes go through
 * `discountStore`.
 */

export type Discount = DiscountRules & {
  id: string;
  code: string;
  enabled: boolean;
  startsAt: string;
  endsAt: string | null;
  uses: number;
  revenuePaise: number;
  discountGivenPaise: number;
  createdAt: string;
};

export type DiscountWithStatus = Discount & { status: DiscountStatus };

const DAY_MS = 24 * 60 * 60 * 1000;

type Seed = Omit<Discount, "id" | "startsAt" | "endsAt" | "createdAt"> & { startDays: number; endDays: number | null };

const SEEDS: Seed[] = [
  { code: "FESTIVE10", type: "percent", value: 10, minOrderPaise: null, categoryIds: [], firstOrderOnly: false, oncePerCustomer: false, usageLimit: null, enabled: true, startDays: -12, endDays: 12, uses: 0, revenuePaise: 0, discountGivenPaise: 0 },
  { code: "WELCOME15", type: "percent", value: 15, minOrderPaise: 99_900, categoryIds: [], firstOrderOnly: true, oncePerCustomer: true, usageLimit: null, enabled: true, startDays: -140, endDays: null, uses: 214, revenuePaise: 3_86_420_00, discountGivenPaise: 68_190_00 },
  { code: "FLAT300", type: "fixed", value: 300_00, minOrderPaise: 2_499_00, categoryIds: [], firstOrderOnly: false, oncePerCustomer: false, usageLimit: 500, enabled: true, startDays: -25, endDays: 3, uses: 167, revenuePaise: 5_02_870_00, discountGivenPaise: 50_100_00 },
  { code: "FREESHIP", type: "free_shipping", value: 0, minOrderPaise: 49_900, categoryIds: [], firstOrderOnly: false, oncePerCustomer: false, usageLimit: null, enabled: true, startDays: -60, endDays: null, uses: 388, revenuePaise: 2_71_160_00, discountGivenPaise: 30_652_00 },
  { code: "DENIM20", type: "percent", value: 20, minOrderPaise: null, categoryIds: ["jeans", "trousers"], firstOrderOnly: false, oncePerCustomer: true, usageLimit: 300, enabled: true, startDays: 5, endDays: 19, uses: 0, revenuePaise: 0, discountGivenPaise: 0 },
  { code: "MONSOON25", type: "percent", value: 25, minOrderPaise: 1_499_00, categoryIds: [], firstOrderOnly: false, oncePerCustomer: true, usageLimit: 400, enabled: true, startDays: -75, endDays: -45, uses: 312, revenuePaise: 6_44_300_00, discountGivenPaise: 1_61_075_00 },
  { code: "STAFF50", type: "percent", value: 50, minOrderPaise: null, categoryIds: [], firstOrderOnly: false, oncePerCustomer: false, usageLimit: 20, enabled: false, startDays: -200, endDays: null, uses: 11, revenuePaise: 9_850_00, discountGivenPaise: 9_850_00 },
];

export function statusOf(discount: Discount, now = new Date()): DiscountStatus {
  const at = now.getTime();
  if (!discount.enabled) return "disabled";
  if (discount.endsAt && new Date(discount.endsAt).getTime() <= at) return "expired";
  if (new Date(discount.startsAt).getTime() > at) return "scheduled";
  if (discount.usageLimit && discount.uses >= discount.usageLimit) return "used_up";
  return "active";
}

export function getDiscounts(now = new Date()): DiscountWithStatus[] {
  const today = fromLocalInput(`${toLocalInput(now.toISOString()).slice(0, 10)}T00:00`)!.getTime();
  const festive = getOrders(now).filter((order) => order.discountCode === "FESTIVE10" && order.status !== "cancelled");

  return SEEDS.map(({ startDays, endDays, ...seed }) => {
    const discount: Discount = {
      ...seed,
      id: seed.code.toLowerCase(),
      startsAt: new Date(today + startDays * DAY_MS).toISOString(),
      endsAt: endDays === null ? null : new Date(today + endDays * DAY_MS).toISOString(),
      createdAt: new Date(today + Math.min(startDays - 2, -1) * DAY_MS).toISOString(),
    };
    if (seed.code === "FESTIVE10") {
      discount.uses = festive.length;
      discount.revenuePaise = festive.reduce((total, order) => total + order.totalPaise, 0);
      discount.discountGivenPaise = festive.reduce((total, order) => total + order.discountPaise, 0);
    }
    return { ...discount, status: statusOf(discount, now) };
  });
}

export function getDiscount(id: string, now = new Date()) {
  return getDiscounts(now).find((discount) => discount.id === id);
}

// Dates in the store's time zone for <input type="datetime-local"> ----------

const zoneParts = new Intl.DateTimeFormat("en-CA", {
  timeZone: adminBrand.timeZone,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

function partsOf(date: Date) {
  return Object.fromEntries(zoneParts.formatToParts(date).map((part) => [part.type, part.value]));
}

export function toLocalInput(iso: string | null) {
  if (!iso) return "";
  const parts = partsOf(new Date(iso));
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}

/** Reads a datetime-local value as a time in the store's time zone. */
export function fromLocalInput(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
  if (!match) return null;
  const asUtc = Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]), Number(match[4]), Number(match[5]));
  const parts = partsOf(new Date(asUtc));
  const zoned = Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day), Number(parts.hour), Number(parts.minute));
  return new Date(asUtc - (zoned - asUtc));
}

export type DiscountFormValues = {
  id: string | null;
  code: string;
  type: DiscountRules["type"];
  value: string;
  minOrder: string;
  appliesTo: "all" | "categories";
  categoryIds: string[];
  firstOrderOnly: boolean;
  oncePerCustomer: boolean;
  usageLimit: string;
  enabled: boolean;
  startsAt: string;
  endsAt: string;
};

export function toDiscountFormValues(discount?: Discount, now = new Date()): DiscountFormValues {
  const rupees = (paise: number | null) => (paise ? String(paise / 100) : "");
  return {
    id: discount?.id ?? null,
    code: discount?.code ?? "",
    type: discount?.type ?? "percent",
    value: discount ? (discount.type === "fixed" ? rupees(discount.value) : discount.type === "percent" ? String(discount.value) : "") : "10",
    minOrder: rupees(discount?.minOrderPaise ?? null),
    appliesTo: discount?.categoryIds.length ? "categories" : "all",
    categoryIds: discount?.categoryIds ?? [],
    firstOrderOnly: discount?.firstOrderOnly ?? false,
    oncePerCustomer: discount?.oncePerCustomer ?? false,
    usageLimit: discount?.usageLimit ? String(discount.usageLimit) : "",
    enabled: discount?.enabled ?? true,
    startsAt: toLocalInput(discount?.startsAt ?? now.toISOString()),
    endsAt: toLocalInput(discount?.endsAt ?? null),
  };
}

// Writes ---------------------------------------------------------------------

export type DiscountInput = DiscountRules & { code: string; enabled: boolean; startsAt: string; endsAt: string | null };

/**
 * The single place discount writes go through. Discounts are sample data for
 * now, so these report `persisted: false`; replace the bodies with database calls.
 */
export const discountStore = {
  async save(id: string | null, input: DiscountInput): Promise<{ persisted: boolean }> {
    void id;
    void input;
    return { persisted: false };
  },
  async setEnabled(id: string, enabled: boolean): Promise<{ persisted: boolean }> {
    void id;
    void enabled;
    return { persisted: false };
  },
  async remove(id: string): Promise<{ persisted: boolean }> {
    void id;
    return { persisted: false };
  },
};
