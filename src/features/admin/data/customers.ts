import "server-only";
import { getOrders, type Order } from "@/features/admin/data/orders";
import { getAdminProducts } from "@/features/admin/data/products";
import type { PaymentMethod } from "@/features/admin/lib/order-status";

/**
 * SAMPLE customers, derived from the sample orders so totals and histories
 * always match the Orders screens. Writes go through `customerStore`.
 */

export type CustomerSegment = "vip" | "returning" | "new";

export type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: Order["shipping"];
  since: string;
  orders: Order[];
  ordersCount: number;
  /** Excludes cancelled and refunded orders. */
  totalSpentPaise: number;
  avgOrderPaise: number;
  lastOrderAt: string;
  segment: CustomerSegment;
  hasReturns: boolean;
  marketing: { email: boolean; sms: boolean };
  profile: { topSize?: string; topCategory?: string; preferredPayment: PaymentMethod; units: number };
};

export const VIP_SPEND_PAISE = 6_000_00;
export const VIP_ORDERS = 4;

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function hash(text: string) {
  let value = 2166136261;
  for (let index = 0; index < text.length; index += 1) value = Math.imul(value ^ text.charCodeAt(index), 16777619);
  return value >>> 0;
}

function mostCommon<T>(values: T[]) {
  const counts = new Map<T, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  let best: T | undefined;
  let bestCount = 0;
  for (const [value, count] of counts) {
    if (count > bestCount) {
      best = value;
      bestCount = count;
    }
  }
  return best;
}

export function getCustomers(now = new Date()): Customer[] {
  const categoryOf = new Map(getAdminProducts().map((product) => [product.id, product.categoryName]));
  const byName = new Map<string, Order[]>();
  for (const order of getOrders(now)) byName.set(order.customer.name, [...(byName.get(order.customer.name) ?? []), order]);

  return [...byName.values()].map((orders) => {
    const latest = orders[0];
    const counted = orders.filter((order) => order.status !== "cancelled" && order.status !== "refunded");
    const totalSpentPaise = counted.reduce((total, order) => total + order.totalPaise, 0);
    const items = orders.flatMap((order) => order.items);
    const seed = hash(latest.customer.email);
    const segment: CustomerSegment = totalSpentPaise >= VIP_SPEND_PAISE || orders.length >= VIP_ORDERS ? "vip" : orders.length > 1 ? "returning" : "new";
    return {
      id: slugify(latest.customer.name),
      name: latest.customer.name,
      email: latest.customer.email,
      phone: latest.customer.phone,
      address: latest.shipping,
      since: latest.customer.since,
      orders,
      ordersCount: orders.length,
      totalSpentPaise,
      avgOrderPaise: counted.length ? Math.round(totalSpentPaise / counted.length) : 0,
      lastOrderAt: latest.placedAt,
      segment,
      hasReturns: orders.some((order) => order.status === "return_requested" || order.status === "refunded"),
      marketing: { email: seed % 3 !== 0, sms: seed % 4 === 0 },
      profile: {
        topSize: mostCommon(items.map((item) => item.size)),
        topCategory: mostCommon(items.map((item) => categoryOf.get(item.productId)).filter((name): name is string => Boolean(name))),
        preferredPayment: mostCommon(orders.map((order) => order.payment.method)) ?? latest.payment.method,
        units: items.reduce((total, item) => total + item.quantity, 0),
      },
    };
  });
}

export function getCustomer(id: string, now = new Date()) {
  return getCustomers(now).find((customer) => customer.id === id);
}

export function customerIdFor(name: string) {
  return slugify(name);
}

// Listing query --------------------------------------------------------------

export const CUSTOMER_VIEWS = ["all", "vip", "returning", "new", "returns"] as const;
export type CustomerView = (typeof CUSTOMER_VIEWS)[number];

export const CUSTOMER_SORTS = ["recent", "spent-desc", "orders-desc", "name"] as const;
export type CustomerSort = (typeof CUSTOMER_SORTS)[number];

export type CustomerQuery = { q: string; view: CustomerView; sort: CustomerSort; page: number };

export const CUSTOMERS_PAGE_SIZE = 15;

const VIEW_FILTER: Record<CustomerView, (customer: Customer) => boolean> = {
  all: () => true,
  vip: (customer) => customer.segment === "vip",
  returning: (customer) => customer.segment === "returning",
  new: (customer) => customer.segment === "new",
  returns: (customer) => customer.hasReturns,
};

const SORTERS: Record<CustomerSort, (a: Customer, b: Customer) => number> = {
  recent: (a, b) => b.lastOrderAt.localeCompare(a.lastOrderAt),
  "spent-desc": (a, b) => b.totalSpentPaise - a.totalSpentPaise,
  "orders-desc": (a, b) => b.ordersCount - a.ordersCount || b.totalSpentPaise - a.totalSpentPaise,
  name: (a, b) => a.name.localeCompare(b.name),
};

function first(value: string | string[] | undefined) {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

export function parseCustomerQuery(params: Record<string, string | string[] | undefined>): CustomerQuery {
  const view = first(params.view) as CustomerView;
  const sort = first(params.sort) as CustomerSort;
  const page = Number.parseInt(first(params.page), 10);
  return {
    q: first(params.q).trim().slice(0, 80),
    view: CUSTOMER_VIEWS.includes(view) ? view : "all",
    sort: CUSTOMER_SORTS.includes(sort) ? sort : "recent",
    page: Number.isFinite(page) && page > 0 ? page : 1,
  };
}

/** Filters and sorts without paging; used by the list and the CSV export. */
export function filterCustomers(query: Omit<CustomerQuery, "page">, now = new Date()) {
  const needle = query.q.toLowerCase();
  const scoped = getCustomers(now).filter(
    (customer) => !needle || [customer.name, customer.email, customer.phone, customer.address.city].some((field) => field.toLowerCase().includes(needle)),
  );
  const counts = Object.fromEntries(CUSTOMER_VIEWS.map((view) => [view, scoped.filter(VIEW_FILTER[view]).length])) as Record<CustomerView, number>;
  return { customers: scoped.filter(VIEW_FILTER[query.view]).sort(SORTERS[query.sort]), counts };
}

export function queryCustomers(query: CustomerQuery, now = new Date()) {
  const { customers, counts } = filterCustomers(query, now);
  const pageCount = Math.max(1, Math.ceil(customers.length / CUSTOMERS_PAGE_SIZE));
  const page = Math.min(query.page, pageCount);
  return { items: customers.slice((page - 1) * CUSTOMERS_PAGE_SIZE, page * CUSTOMERS_PAGE_SIZE), total: customers.length, page, pageCount, counts };
}

// Writes ---------------------------------------------------------------------

export type CustomerWriteResult = { persisted: boolean };

/**
 * The single place customer writes go through. Customers are sample data for
 * now, so these report `persisted: false`; replace the bodies with database calls.
 */
export const customerStore = {
  async addNote(id: string, note: string): Promise<CustomerWriteResult> {
    void id;
    void note;
    return { persisted: false };
  },
  async setMarketing(id: string, channel: "email" | "sms", subscribed: boolean): Promise<CustomerWriteResult> {
    void id;
    void channel;
    void subscribed;
    return { persisted: false };
  },
};
