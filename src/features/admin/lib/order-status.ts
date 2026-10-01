/** Order lifecycle shared by the server actions and the order screens. */

export const ORDER_STATUSES = [
  "awaiting_payment",
  "to_pack",
  "ready_to_ship",
  "shipped",
  "delivered",
  "return_requested",
  "refunded",
  "cancelled",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export type PaymentMethod = "UPI" | "Card" | "COD" | "Net banking";
export type PaymentStatus = "paid" | "pending" | "refunded";

export const ORDER_STATUS_META: Record<OrderStatus, { label: string; className: string }> = {
  awaiting_payment: { label: "Awaiting payment", className: "bg-adm-warning-soft text-adm-warning" },
  to_pack: { label: "To pack", className: "bg-adm-accent-soft text-adm-accent" },
  ready_to_ship: { label: "Ready to ship", className: "bg-adm-info-soft text-adm-info" },
  shipped: { label: "Shipped", className: "bg-adm-info-soft text-adm-info" },
  delivered: { label: "Delivered", className: "bg-adm-success-soft text-adm-success" },
  return_requested: { label: "Return requested", className: "bg-adm-danger-soft text-adm-danger" },
  refunded: { label: "Refunded", className: "bg-adm-surface-muted text-adm-ink-soft" },
  cancelled: { label: "Cancelled", className: "bg-adm-surface-muted text-adm-ink-faint" },
};

export const PAYMENT_STATUS_META: Record<PaymentStatus, { label: string; className: string }> = {
  paid: { label: "Paid", className: "text-adm-success" },
  pending: { label: "Pending", className: "text-adm-warning" },
  refunded: { label: "Refunded", className: "text-adm-ink-faint" },
};

export type OrderAction = "mark_paid" | "mark_packed" | "ship" | "mark_delivered" | "refund" | "decline_return" | "cancel";

export const ORDER_ACTIONS: Record<OrderAction, { label: string; from: OrderStatus[]; to: OrderStatus; event: string; tone?: "danger" }> = {
  mark_paid: { label: "Mark as paid", from: ["awaiting_payment"], to: "to_pack", event: "Payment confirmed" },
  mark_packed: { label: "Mark as packed", from: ["to_pack"], to: "ready_to_ship", event: "Order packed" },
  ship: { label: "Mark as shipped", from: ["ready_to_ship"], to: "shipped", event: "Handed to courier" },
  mark_delivered: { label: "Mark as delivered", from: ["shipped"], to: "delivered", event: "Delivered to customer" },
  refund: { label: "Approve return & refund", from: ["return_requested"], to: "refunded", event: "Return approved and refunded" },
  decline_return: { label: "Decline return", from: ["return_requested"], to: "delivered", event: "Return declined" },
  cancel: { label: "Cancel order", from: ["awaiting_payment", "to_pack", "ready_to_ship"], to: "cancelled", event: "Order cancelled", tone: "danger" },
};

/** The main next step for an order, shown as the primary button. */
export const PRIMARY_ACTION: Partial<Record<OrderStatus, OrderAction>> = {
  awaiting_payment: "mark_paid",
  to_pack: "mark_packed",
  ready_to_ship: "ship",
  shipped: "mark_delivered",
  return_requested: "refund",
};

export const COURIERS = ["Delhivery", "Blue Dart", "DTDC", "Ekart", "India Post"] as const;

/** Where an order sits on the happy path, for the progress stepper. */
export const ORDER_STEPS = ["Placed", "Paid", "Packed", "Shipped", "Delivered"] as const;

export function stepIndex(status: OrderStatus, paymentMethod: PaymentMethod) {
  switch (status) {
    case "awaiting_payment":
      return 0;
    case "to_pack":
      return paymentMethod === "COD" ? 0 : 1;
    case "ready_to_ship":
      return 2;
    case "shipped":
      return 3;
    default:
      return 4;
  }
}

export function canRun(action: OrderAction, status: OrderStatus) {
  return ORDER_ACTIONS[action].from.includes(status);
}
