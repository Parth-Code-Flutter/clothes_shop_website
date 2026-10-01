import "server-only";
import { getInventoryStats } from "@/features/admin/data/inventory";
import { getOrderStats, getOrders } from "@/features/admin/data/orders";
import { getReviews } from "@/features/admin/data/reviews";
import { formatMoney } from "@/features/admin/lib/format";

/**
 * The bell menu, built from the sample orders, stock and reviews. "Tasks" are
 * standing counts; "activity" is a timestamped feed whose unread state the
 * browser tracks against the time the panel was last opened.
 */

export type NotificationKind = "order" | "payment" | "return" | "stock" | "review";

export type AdminTask = { kind: NotificationKind; label: string; count: number; href: string };
export type AdminActivity = { id: string; kind: NotificationKind; title: string; detail: string; at: string; href: string };
export type AdminNotifications = { tasks: AdminTask[]; activity: AdminActivity[] };

const DAY_MS = 24 * 60 * 60 * 1000;
const FEED_SIZE = 8;

export function getAdminNotifications(now = new Date()): AdminNotifications {
  const orders = getOrders(now);
  const stats = getOrderStats(now);
  const { outSizes } = getInventoryStats(now);
  const reviews = getReviews(now);
  const pendingReviews = reviews.filter((review) => review.status === "pending");
  const since = now.getTime() - 2 * DAY_MS;

  const tasks: AdminTask[] = [
    { kind: "order" as const, label: stats.toPack === 1 ? "order to pack" : "orders to pack", count: stats.toPack, href: "/admin/orders?view=to_pack" },
    { kind: "payment" as const, label: stats.awaitingPayment === 1 ? "payment to confirm" : "payments to confirm", count: stats.awaitingPayment, href: "/admin/orders?view=unpaid" },
    { kind: "return" as const, label: stats.returnsOpen === 1 ? "return to review" : "returns to review", count: stats.returnsOpen, href: "/admin/orders?view=returns" },
    { kind: "stock" as const, label: outSizes === 1 ? "size sold out" : "sizes sold out", count: outSizes, href: "/admin/inventory?view=out" },
    { kind: "review" as const, label: pendingReviews.length === 1 ? "review to approve" : "reviews to approve", count: pendingReviews.length, href: "/admin/reviews?view=pending" },
  ].filter((task) => task.count > 0);

  const activity: AdminActivity[] = [];
  for (const order of orders) {
    if (new Date(order.placedAt).getTime() >= since && order.status !== "cancelled") {
      const items = order.items.reduce((total, item) => total + item.quantity, 0);
      activity.push({
        id: `order-${order.id}`,
        kind: order.status === "awaiting_payment" ? "payment" : "order",
        title: order.status === "awaiting_payment" ? `${order.number} is waiting for payment` : `New order ${order.number}`,
        detail: `${order.customer.name} · ${formatMoney(order.totalPaise)} · ${items} ${items === 1 ? "item" : "items"}`,
        at: order.placedAt,
        href: `/admin/orders/${order.id}`,
      });
    }
    const returnEvent = order.status === "return_requested" ? order.events.find((event) => event.label === "Return requested") : undefined;
    if (returnEvent) {
      activity.push({
        id: `return-${order.id}`,
        kind: "return",
        title: `Return requested on ${order.number}`,
        detail: `${order.customer.name} · ${returnEvent.note ?? "No reason given"}`,
        at: returnEvent.at,
        href: `/admin/orders/${order.id}`,
      });
    }
  }
  for (const review of pendingReviews) {
    activity.push({
      id: `review-${review.id}`,
      kind: "review",
      title: `${review.rating}-star review to approve`,
      detail: `${review.customerName} on ${review.productName}`,
      at: review.createdAt,
      href: "/admin/reviews?view=pending",
    });
  }

  activity.sort((a, b) => b.at.localeCompare(a.at));
  return { tasks, activity: activity.slice(0, FEED_SIZE) };
}
