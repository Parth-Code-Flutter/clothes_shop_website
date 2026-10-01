import "server-only";
import { getAdminProducts } from "@/features/admin/data/products";
import {
  ORDER_STATUSES,
  type OrderStatus,
  type PaymentMethod,
  type PaymentStatus,
} from "@/features/admin/lib/order-status";

/**
 * SAMPLE orders built from the real catalogue. Each order's status follows from
 * a generated timeline, so counts, dates and steps always agree. The set is
 * anchored to the current hour so it stays stable between reloads. Writes go
 * through `orderStore`.
 */

export type OrderItem = { productId: string; name: string; image: string; sku: string; size: string; quantity: number; pricePaise: number };
export type OrderEvent = { at: string; label: string; note?: string; by?: string };

export type Order = {
  id: string;
  number: string;
  placedAt: string;
  status: OrderStatus;
  customer: { name: string; email: string; phone: string; ordersCount: number; since: string };
  shipping: { line1: string; city: string; state: string; pincode: string };
  items: OrderItem[];
  subtotalPaise: number;
  shippingPaise: number;
  discountPaise: number;
  discountCode?: string;
  totalPaise: number;
  payment: { method: PaymentMethod; status: PaymentStatus; reference?: string };
  tracking?: { courier: string; awb: string };
  customerNote?: string;
  events: OrderEvent[];
};

const CUSTOMERS = [
  ["Aarav Mehta", "Ahmedabad", "Gujarat", "380015", "B-402, Shivalik Heights, Satellite Road"],
  ["Diya Shah", "Surat", "Gujarat", "395007", "12, Green Park Society, Vesu"],
  ["Kabir Desai", "Rajkot", "Gujarat", "360005", "7, Kalavad Road, Nana Mava"],
  ["Ishita Patel", "Vadodara", "Gujarat", "390007", "C-18, Sun Residency, Alkapuri"],
  ["Rohan Joshi", "Mumbai", "Maharashtra", "400050", "Flat 9, Sea Breeze CHS, Bandra West"],
  ["Meera Iyer", "Pune", "Maharashtra", "411038", "21, Laxmi Nagar, Kothrud"],
  ["Vihaan Trivedi", "Junagadh", "Gujarat", "362001", "Near Kalwa Chowk, MG Road"],
  ["Ananya Rao", "Bengaluru", "Karnataka", "560038", "44, 12th Main, Indiranagar"],
  ["Arjun Malhotra", "New Delhi", "Delhi", "110024", "H-31, Lajpat Nagar II"],
  ["Saanvi Kulkarni", "Nashik", "Maharashtra", "422005", "Plot 6, Gangapur Road"],
  ["Reyansh Bhatt", "Gandhinagar", "Gujarat", "382007", "Sector 21, Block 14"],
  ["Kiara Nair", "Kochi", "Kerala", "682020", "Palm Grove, Panampilly Nagar"],
  ["Aditya Chauhan", "Jaipur", "Rajasthan", "302017", "88, Malviya Nagar"],
  ["Myra Kapoor", "Chandigarh", "Chandigarh", "160017", "House 512, Sector 17"],
  ["Vivaan Reddy", "Hyderabad", "Telangana", "500033", "Road 36, Jubilee Hills"],
  ["Navya Sethi", "Indore", "Madhya Pradesh", "452010", "29, Vijay Nagar"],
  ["Ayaan Sheikh", "Bhavnagar", "Gujarat", "364002", "Waghawadi Road, Opp. Lake"],
  ["Tara Menon", "Chennai", "Tamil Nadu", "600040", "3rd Avenue, Anna Nagar"],
  ["Krish Agarwal", "Lucknow", "Uttar Pradesh", "226010", "B-17, Gomti Nagar"],
  ["Riya Banerjee", "Kolkata", "West Bengal", "700019", "14, Ballygunge Place"],
  ["Dev Pandya", "Anand", "Gujarat", "388001", "Near Town Hall, Station Road"],
  ["Aisha Khan", "Bhopal", "Madhya Pradesh", "462016", "E-5, Arera Colony"],
  ["Yash Thakkar", "Mehsana", "Gujarat", "384002", "21, Radhanpur Road"],
  ["Pooja Verma", "Noida", "Uttar Pradesh", "201301", "Tower 4, Sector 62"],
  ["Nikhil Sharma", "Gurugram", "Haryana", "122002", "DLF Phase 3, U-Block"],
  ["Sneha Pillai", "Thiruvananthapuram", "Kerala", "695010", "TC 9/1123, Sasthamangalam"],
  ["Harsh Vyas", "Udaipur", "Rajasthan", "313001", "Fatehpura, Near Sukhadia Circle"],
  ["Neha Gupta", "Kanpur", "Uttar Pradesh", "208002", "117/H, Swaroop Nagar"],
  ["Om Parmar", "Navsari", "Gujarat", "396445", "Lunsikui Road, Dudhia Talav"],
  ["Zara Mirza", "Mysuru", "Karnataka", "570009", "Kuvempunagar, 4th Cross"],
  ["Manav Soni", "Jamnagar", "Gujarat", "361008", "Patel Colony, Street 9"],
  ["Ira Deshpande", "Nagpur", "Maharashtra", "440010", "Dharampeth, WHC Road"],
  ["Parth Modi", "Vapi", "Gujarat", "396191", "GIDC Char Rasta, Chala"],
  ["Anika Sen", "Guwahati", "Assam", "781006", "Zoo Road, Tiniali"],
  ["Rudra Saxena", "Dehradun", "Uttarakhand", "248001", "Rajpur Road, Hathibarkala"],
  ["Mahi Jain", "Bhilwara", "Rajasthan", "311001", "Azad Nagar, Sector 4"],
] as const;

const NOTES = ["Please deliver after 6 pm.", "Gift wrap if possible.", "Call before delivery.", "Leave with the security guard."];
const RETURN_REASONS = ["Size too small", "Size too large", "Colour differs from photos", "Changed my mind"];
const COURIERS = ["Delhivery", "Blue Dart", "DTDC", "Ekart"];

const HOUR_MS = 60 * 60 * 1000;
const MIN_MS = 60 * 1000;
const ORDER_COUNT = 90;
const FREE_SHIPPING_FROM = 99_900;
const SHIPPING_FEE = 7_900;

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

function pickMethod(roll: number): PaymentMethod {
  if (roll < 0.5) return "UPI";
  if (roll < 0.7) return "Card";
  if (roll < 0.95) return "COD";
  return "Net banking";
}

let cache: { anchor: number; orders: Order[] } | null = null;

export function getOrders(now = new Date()): Order[] {
  const anchor = Math.floor(now.getTime() / HOUR_MS) * HOUR_MS;
  if (cache?.anchor === anchor) return cache.orders;

  const random = mulberry32(Math.floor(anchor / (24 * HOUR_MS)) * 7919);
  const products = getAdminProducts().filter((product) => product.totalStock > 0);
  const orders: Order[] = [];
  let minutesAgo = 9;

  for (let index = 0; index < ORDER_COUNT; index += 1) {
    minutesAgo += Math.round((20 + random() * 80) * (1 + index / 40));
    const placed = anchor + 45 * MIN_MS - minutesAgo * MIN_MS;
    // Skewed so a few regulars order often and most shoppers order once or twice.
    const customerIndex = Math.floor(random() ** 1.4 * CUSTOMERS.length);
    const [name, city, state, pincode, line1] = CUSTOMERS[customerIndex];
    const phoneDigits = String(9_100_000_000 + ((customerIndex + 1) * 48_271_337) % 899_999_999);
    const method = pickMethod(random());

    const items: OrderItem[] = [];
    const lines = random() < 0.6 ? 1 : random() < 0.75 ? 2 : 3;
    for (let line = 0; line < lines; line += 1) {
      const product = products[Math.floor(random() * products.length)];
      const sizes = product.sizes.filter((size) => product.stock[size] > 0);
      items.push({
        productId: product.id,
        name: product.name,
        image: product.image,
        sku: product.sku,
        size: sizes[Math.floor(random() * sizes.length)] ?? product.sizes[0],
        quantity: random() < 0.85 ? 1 : 2,
        pricePaise: product.pricePaise,
      });
    }
    const subtotalPaise = items.reduce((total, item) => total + item.pricePaise * item.quantity, 0);
    const discountCode = random() < 0.18 ? "FESTIVE10" : undefined;
    const discountPaise = discountCode ? Math.round(subtotalPaise * 0.1) : 0;
    const shippingPaise = subtotalPaise - discountPaise >= FREE_SHIPPING_FROM ? 0 : SHIPPING_FEE;

    // Candidate timeline; the status is the last step that has already happened.
    const prepaid = method !== "COD";
    const unpaid = prepaid && random() < 0.1;
    const cancelledEarly = random() < 0.035;
    const returned = random() < 0.12;
    const paidAt = prepaid && !unpaid ? placed + (1 + random() * 3) * MIN_MS : null;
    const packedAt = (paidAt ?? placed) + (2 + random() * 6) * HOUR_MS;
    const shippedAt = packedAt + (2 + random() * 8) * HOUR_MS;
    const deliveredAt = shippedAt + (40 + random() * 56) * HOUR_MS;
    const returnAt = deliveredAt + (20 + random() * 50) * HOUR_MS;
    const refundAt = returnAt + (24 + random() * 24) * HOUR_MS;
    const nowMs = now.getTime();
    const happened = (at: number) => at <= nowMs;

    const events: OrderEvent[] = [{ at: new Date(placed).toISOString(), label: "Order placed", note: `${items.length} item${items.length > 1 ? "s" : ""} · ${method}`, by: "Customer" }];
    let status: OrderStatus;
    let paymentStatus: PaymentStatus = paidAt ? "paid" : "pending";

    if (unpaid) {
      const expireAt = placed + 12 * HOUR_MS;
      if (happened(expireAt)) {
        events.push({ at: new Date(expireAt).toISOString(), label: "Order cancelled", note: "Payment not received within 12 hours", by: "System" });
        status = "cancelled";
      } else status = "awaiting_payment";
    } else if (cancelledEarly && happened(placed + 50 * MIN_MS)) {
      if (paidAt) events.push({ at: new Date(paidAt).toISOString(), label: "Payment received", note: method, by: "System" });
      events.push({ at: new Date(placed + 50 * MIN_MS).toISOString(), label: "Order cancelled", note: "Cancelled by customer", by: "Customer" });
      status = "cancelled";
      if (paidAt) paymentStatus = "refunded";
    } else {
      status = "to_pack";
      if (paidAt) events.push({ at: new Date(paidAt).toISOString(), label: "Payment received", note: method, by: "System" });
      if (happened(packedAt)) {
        status = "ready_to_ship";
        events.push({ at: new Date(packedAt).toISOString(), label: "Order packed", by: "Store Owner" });
      }
      if (happened(shippedAt)) {
        status = "shipped";
        events.push({ at: new Date(shippedAt).toISOString(), label: "Handed to courier", by: "Store Owner" });
      }
      if (happened(deliveredAt)) {
        status = "delivered";
        events.push({ at: new Date(deliveredAt).toISOString(), label: "Delivered to customer", by: "Courier" });
        if (method === "COD") {
          paymentStatus = "paid";
          events.push({ at: new Date(deliveredAt + MIN_MS).toISOString(), label: "Cash collected", note: "COD", by: "Courier" });
        }
      }
      if (returned && happened(returnAt)) {
        status = "return_requested";
        events.push({ at: new Date(returnAt).toISOString(), label: "Return requested", note: RETURN_REASONS[Math.floor(random() * RETURN_REASONS.length)], by: "Customer" });
      }
      if (returned && happened(refundAt)) {
        status = "refunded";
        paymentStatus = "refunded";
        events.push({ at: new Date(refundAt).toISOString(), label: "Return approved and refunded", by: "Store Owner" });
      }
    }

    const number = String(10600 - index);
    const shipped = status === "shipped" || status === "delivered" || status === "return_requested" || status === "refunded";
    orders.push({
      id: `HB-${number}`,
      number: `#HB-${number}`,
      placedAt: new Date(placed).toISOString(),
      status,
      customer: {
        name,
        email: `${name.toLowerCase().replace(/[^a-z]+/g, ".")}@example.com`,
        phone: `+91 ${phoneDigits.slice(0, 5)} ${phoneDigits.slice(5)}`,
        ordersCount: 0,
        since: "",
      },
      shipping: { line1, city, state, pincode },
      items,
      subtotalPaise,
      shippingPaise,
      discountPaise,
      discountCode,
      totalPaise: subtotalPaise - discountPaise + shippingPaise,
      payment: {
        method,
        status: paymentStatus,
        reference: prepaid && paidAt ? `pay_${Math.floor(random() * 36 ** 8).toString(36).padStart(8, "0")}` : undefined,
      },
      tracking: shipped ? { courier: COURIERS[Math.floor(random() * COURIERS.length)], awb: String(Math.floor(1e10 + random() * 9e10)) } : undefined,
      customerNote: random() < 0.15 ? NOTES[Math.floor(random() * NOTES.length)] : undefined,
      events,
    });
  }

  const byCustomer = new Map<string, Order[]>();
  for (const order of orders) byCustomer.set(order.customer.name, [...(byCustomer.get(order.customer.name) ?? []), order]);
  for (const order of orders) {
    const history = byCustomer.get(order.customer.name)!;
    const firstOrder = history[history.length - 1];
    order.customer.ordersCount = history.length;
    const accountAgeDays = history.length === 1 ? 0 : (history.length * 37) % 200;
    order.customer.since = new Date(new Date(firstOrder.placedAt).getTime() - accountAgeDays * 24 * HOUR_MS).toISOString();
  }

  cache = { anchor, orders };
  return orders;
}

export function getOrder(id: string, now = new Date()) {
  const wanted = id.toUpperCase();
  return getOrders(now).find((order) => order.id === wanted);
}

export function getOrderStats(now = new Date()) {
  const orders = getOrders(now);
  const toPack = orders.filter((order) => order.status === "to_pack");
  const oldest = toPack.reduce<number | null>((min, order) => Math.min(min ?? Infinity, new Date(order.placedAt).getTime()), null);
  const weekAgo = now.getTime() - 7 * 24 * HOUR_MS;
  const counted = orders.filter((order) => new Date(order.placedAt).getTime() >= weekAgo && order.status !== "cancelled" && order.status !== "refunded");
  return {
    toPack: toPack.length,
    oldestToPackHours: oldest ? Math.max(1, Math.round((now.getTime() - oldest) / HOUR_MS)) : 0,
    awaitingPayment: orders.filter((order) => order.status === "awaiting_payment").length,
    readyToShip: orders.filter((order) => order.status === "ready_to_ship").length,
    returnsOpen: orders.filter((order) => order.status === "return_requested").length,
    weekRevenuePaise: counted.reduce((total, order) => total + order.totalPaise, 0),
    weekOrders: counted.length,
  };
}

// Listing query --------------------------------------------------------------

export const ORDER_VIEWS = ["all", "unpaid", "to_pack", "to_ship", "shipped", "delivered", "returns", "cancelled"] as const;
export type OrderView = (typeof ORDER_VIEWS)[number];

export const ORDER_SORTS = ["newest", "oldest", "total-desc", "total-asc"] as const;
export type OrderSort = (typeof ORDER_SORTS)[number];

export const ORDER_PAYMENT_FILTERS = ["", "UPI", "Card", "COD", "Net banking"] as const;

export type OrderQuery = { q: string; view: OrderView; payment: string; sort: OrderSort; page: number };

export const ORDERS_PAGE_SIZE = 15;

const VIEW_FILTER: Record<OrderView, (order: Order) => boolean> = {
  all: () => true,
  unpaid: (order) => order.status === "awaiting_payment",
  to_pack: (order) => order.status === "to_pack",
  to_ship: (order) => order.status === "ready_to_ship",
  shipped: (order) => order.status === "shipped",
  delivered: (order) => order.status === "delivered",
  returns: (order) => order.status === "return_requested" || order.status === "refunded",
  cancelled: (order) => order.status === "cancelled",
};

const SORTERS: Record<OrderSort, (a: Order, b: Order) => number> = {
  newest: (a, b) => b.placedAt.localeCompare(a.placedAt),
  oldest: (a, b) => a.placedAt.localeCompare(b.placedAt),
  "total-desc": (a, b) => b.totalPaise - a.totalPaise,
  "total-asc": (a, b) => a.totalPaise - b.totalPaise,
};

function first(value: string | string[] | undefined) {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

export function parseOrderQuery(params: Record<string, string | string[] | undefined>): OrderQuery {
  const view = first(params.view) as OrderView;
  const sort = first(params.sort) as OrderSort;
  const payment = first(params.payment);
  const page = Number.parseInt(first(params.page), 10);
  return {
    q: first(params.q).trim().slice(0, 80),
    view: ORDER_VIEWS.includes(view) ? view : "all",
    payment: (ORDER_PAYMENT_FILTERS as readonly string[]).includes(payment) ? payment : "",
    sort: ORDER_SORTS.includes(sort) ? sort : "newest",
    page: Number.isFinite(page) && page > 0 ? page : 1,
  };
}

/** Filters and sorts without paging; used by the list and the CSV export. */
export function filterOrders(query: Omit<OrderQuery, "page">, now = new Date()) {
  const needle = query.q.toLowerCase().replace(/^#/, "");
  const scoped = getOrders(now).filter(
    (order) =>
      (!query.payment || order.payment.method === query.payment) &&
      (!needle ||
        [order.id, order.customer.name, order.customer.email, order.customer.phone, order.shipping.city, order.tracking?.awb ?? ""].some((field) =>
          field.toLowerCase().includes(needle),
        )),
  );
  const counts = Object.fromEntries(ORDER_VIEWS.map((view) => [view, scoped.filter(VIEW_FILTER[view]).length])) as Record<OrderView, number>;
  return { orders: scoped.filter(VIEW_FILTER[query.view]).sort(SORTERS[query.sort]), counts };
}

export function queryOrders(query: OrderQuery, now = new Date()) {
  const { orders, counts } = filterOrders(query, now);
  const pageCount = Math.max(1, Math.ceil(orders.length / ORDERS_PAGE_SIZE));
  const page = Math.min(query.page, pageCount);
  return { items: orders.slice((page - 1) * ORDERS_PAGE_SIZE, page * ORDERS_PAGE_SIZE), total: orders.length, page, pageCount, counts };
}

export function isOrderStatus(value: string): value is OrderStatus {
  return (ORDER_STATUSES as readonly string[]).includes(value);
}

// Writes ---------------------------------------------------------------------

export type OrderWriteResult = { persisted: boolean };

/**
 * The single place order writes go through. Orders are sample data for now, so
 * these report `persisted: false`; replace the bodies with database calls.
 */
export const orderStore = {
  async updateStatus(ids: string[], status: OrderStatus, details?: { courier?: string; awb?: string }): Promise<OrderWriteResult> {
    void ids;
    void status;
    void details;
    return { persisted: false };
  },
  async addNote(id: string, note: string): Promise<OrderWriteResult> {
    void id;
    void note;
    return { persisted: false };
  },
};
