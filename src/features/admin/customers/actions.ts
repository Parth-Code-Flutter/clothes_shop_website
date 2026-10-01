"use server";

import { requireAdmin } from "@/features/admin/auth/dal";
import { customerStore, getCustomer } from "@/features/admin/data/customers";

export type CustomerActionResult = { ok: boolean; persisted: boolean; message: string };

const PREVIEW_NOTE = "Changes are saved once the customer database is connected.";

export async function addCustomerNoteAction(id: string, note: string): Promise<CustomerActionResult> {
  await requireAdmin();
  const text = note.trim().slice(0, 500);
  if (!getCustomer(id)) return { ok: false, persisted: false, message: "That customer no longer exists." };
  if (!text) return { ok: false, persisted: false, message: "Write a note first." };
  const result = await customerStore.addNote(id, text);
  return { ok: true, persisted: result.persisted, message: result.persisted ? "Note added." : `Note added (preview). ${PREVIEW_NOTE}` };
}

export async function setCustomerMarketingAction(id: string, channel: "email" | "sms", subscribed: boolean): Promise<CustomerActionResult> {
  await requireAdmin();
  if (!getCustomer(id)) return { ok: false, persisted: false, message: "That customer no longer exists." };
  if (channel !== "email" && channel !== "sms") return { ok: false, persisted: false, message: "Unknown channel." };
  const result = await customerStore.setMarketing(id, channel, Boolean(subscribed));
  const label = `${channel === "email" ? "Email" : "SMS"} marketing ${subscribed ? "on" : "off"}`;
  return { ok: true, persisted: result.persisted, message: result.persisted ? `${label}.` : `${label} (preview). ${PREVIEW_NOTE}` };
}
