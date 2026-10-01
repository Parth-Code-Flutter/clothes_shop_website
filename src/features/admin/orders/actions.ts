"use server";

import { requireAdmin } from "@/features/admin/auth/dal";
import { getOrder, getOrders, orderStore } from "@/features/admin/data/orders";
import { COURIERS, ORDER_ACTIONS, canRun, type OrderAction, type OrderStatus } from "@/features/admin/lib/order-status";

export type OrderActionResult = { ok: boolean; persisted: boolean; message: string; status?: OrderStatus };

const PREVIEW_NOTE = "Changes are saved once the orders database is connected.";

/**
 * `from` is the status the screen showed. It's checked against the transition
 * map so the screen can't skip steps, even while orders aren't persisted.
 */
export async function updateOrderAction(
  id: string,
  from: OrderStatus,
  action: OrderAction,
  details?: { courier?: string; awb?: string },
): Promise<OrderActionResult> {
  await requireAdmin();
  const order = getOrder(id);
  const rule = ORDER_ACTIONS[action];
  if (!order || !rule) return { ok: false, persisted: false, message: "That order no longer exists." };
  if (!canRun(action, from)) return { ok: false, persisted: false, message: `Can't ${rule.label.toLowerCase()} an order in this state.` };

  let tracking: { courier: string; awb: string } | undefined;
  if (action === "ship") {
    const courier = String(details?.courier ?? "").trim();
    const awb = String(details?.awb ?? "").trim().toUpperCase();
    if (!(COURIERS as readonly string[]).includes(courier)) return { ok: false, persisted: false, message: "Choose a courier." };
    if (!/^[A-Z0-9-]{6,30}$/.test(awb)) return { ok: false, persisted: false, message: "Enter a valid tracking number (6–30 letters or digits)." };
    tracking = { courier, awb };
  }

  const result = await orderStore.updateStatus([order.id], rule.to, tracking);
  return {
    ok: true,
    persisted: result.persisted,
    status: rule.to,
    message: result.persisted ? `${order.number}: ${rule.event.toLowerCase()}.` : `${rule.event} (preview). ${PREVIEW_NOTE}`,
  };
}

export async function addOrderNoteAction(id: string, note: string): Promise<OrderActionResult> {
  await requireAdmin();
  const text = note.trim().slice(0, 500);
  if (!getOrder(id)) return { ok: false, persisted: false, message: "That order no longer exists." };
  if (!text) return { ok: false, persisted: false, message: "Write a note first." };
  const result = await orderStore.addNote(id, text);
  return { ok: true, persisted: result.persisted, message: result.persisted ? "Note added." : `Note added (preview). ${PREVIEW_NOTE}` };
}

export type BulkOrderAction = Extract<OrderAction, "mark_paid" | "mark_packed" | "cancel">;

export async function bulkOrderAction(ids: string[], action: BulkOrderAction): Promise<OrderActionResult> {
  await requireAdmin();
  const rule = ORDER_ACTIONS[action];
  if (!rule || !["mark_paid", "mark_packed", "cancel"].includes(action)) return { ok: false, persisted: false, message: "Unknown action." };

  const wanted = new Set(ids.slice(0, 200));
  const targets = getOrders().filter((order) => wanted.has(order.id) && canRun(action, order.status));
  const skipped = wanted.size - targets.length;
  if (targets.length === 0) return { ok: false, persisted: false, message: `None of the selected orders can be ${rule.event.toLowerCase().replace("order ", "")}.` };

  const result = await orderStore.updateStatus(
    targets.map((order) => order.id),
    rule.to,
  );
  const label = targets.length === 1 ? "1 order" : `${targets.length} orders`;
  const skippedNote = skipped > 0 ? ` ${skipped} skipped (wrong status).` : "";
  return {
    ok: true,
    persisted: result.persisted,
    message: result.persisted ? `${label} updated.${skippedNote}` : `${label} would be updated.${skippedNote} ${PREVIEW_NOTE}`,
  };
}
