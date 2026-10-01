"use server";

import { requireAdmin } from "@/features/admin/auth/dal";
import { discountStore, fromLocalInput, getDiscount, getDiscounts, type DiscountInput } from "@/features/admin/data/discounts";
import { getProductCategories } from "@/features/admin/data/products";
import { CODE_PATTERN, DISCOUNT_TYPES, type DiscountType } from "@/features/admin/lib/discount-rules";

export type DiscountFormState = {
  status: "idle" | "saved" | "preview" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
  at?: number;
};

const PREVIEW_NOTE = "Saving switches on once the discounts database is connected.";

function toPaise(value: string) {
  const amount = Number(value.replace(/[₹,\s]/g, ""));
  return Number.isFinite(amount) ? Math.round(amount * 100) : Number.NaN;
}

export async function saveDiscountAction(_previous: DiscountFormState, formData: FormData): Promise<DiscountFormState> {
  await requireAdmin();
  const text = (key: string, max = 40) => String(formData.get(key) ?? "").trim().slice(0, max);
  const id = text("id") || null;
  const errors: Record<string, string> = {};

  const code = text("code").toUpperCase();
  if (!CODE_PATTERN.test(code)) errors.code = "Use 3–20 letters, numbers, hyphens or underscores.";
  else if (getDiscounts().some((discount) => discount.code === code && discount.id !== id)) errors.code = "Another discount already uses this code.";

  const type = text("type") as DiscountType;
  if (!DISCOUNT_TYPES.includes(type)) errors.type = "Choose a discount type.";

  let value = 0;
  if (type === "percent") {
    value = Number(text("value"));
    if (!Number.isInteger(value) || value < 1 || value > 90) errors.value = "Enter a whole percentage from 1 to 90.";
  } else if (type === "fixed") {
    value = toPaise(text("value"));
    if (!Number.isFinite(value) || value <= 0 || value > 1_00_000_00) errors.value = "Enter an amount above ₹0.";
  }

  const minText = text("minOrder");
  const minOrderPaise = minText ? toPaise(minText) : null;
  if (minOrderPaise !== null && (!Number.isFinite(minOrderPaise) || minOrderPaise < 0)) errors.minOrder = "Enter a valid amount, or leave it empty.";
  else if (type === "fixed" && minOrderPaise !== null && Number.isFinite(value) && value >= minOrderPaise) errors.minOrder = "The minimum order should be higher than the discount amount.";

  const known = new Set(getProductCategories().map((category) => category.id));
  const specific = formData.get("appliesTo") === "categories";
  const categoryIds = specific
    ? formData
        .getAll("categoryIds")
        .map(String)
        .filter((category) => known.has(category))
    : [];
  if (specific && categoryIds.length === 0) errors.categoryIds = "Pick at least one category, or apply it to all products.";

  const limitText = text("usageLimit");
  const usageLimit = limitText ? Number(limitText) : null;
  if (usageLimit !== null && (!Number.isInteger(usageLimit) || usageLimit < 1)) errors.usageLimit = "Enter a whole number, or leave it empty for no limit.";

  const startsAt = fromLocalInput(text("startsAt"));
  if (!startsAt) errors.startsAt = "Choose when the discount starts.";
  const endText = text("endsAt");
  const endsAt = endText ? fromLocalInput(endText) : null;
  if (endText && !endsAt) errors.endsAt = "Choose a valid end date, or leave it empty.";
  else if (startsAt && endsAt && endsAt <= startsAt) errors.endsAt = "The end must be after the start.";

  if (Object.keys(errors).length > 0) {
    return { status: "error", message: "Fix the highlighted fields and save again.", fieldErrors: errors, at: Date.now() };
  }

  const input: DiscountInput = {
    code,
    type,
    value,
    minOrderPaise,
    categoryIds,
    firstOrderOnly: formData.get("firstOrderOnly") === "on",
    oncePerCustomer: formData.get("oncePerCustomer") === "on",
    usageLimit,
    enabled: formData.get("enabled") === "on",
    startsAt: startsAt!.toISOString(),
    endsAt: endsAt?.toISOString() ?? null,
  };

  const result = await discountStore.save(id, input);
  return result.persisted
    ? { status: "saved", message: id ? `${code} updated.` : `${code} created.`, at: Date.now() }
    : { status: "preview", message: `Everything checks out. ${PREVIEW_NOTE}`, at: Date.now() };
}

export async function setDiscountEnabledAction(id: string, enabled: boolean): Promise<{ ok: boolean; persisted: boolean; message: string }> {
  await requireAdmin();
  const discount = getDiscount(id);
  if (!discount) return { ok: false, persisted: false, message: "That discount no longer exists." };
  const result = await discountStore.setEnabled(discount.id, Boolean(enabled));
  const label = `${discount.code} turned ${enabled ? "on" : "off"}`;
  return { ok: true, persisted: result.persisted, message: result.persisted ? `${label}.` : `${label} (preview). ${PREVIEW_NOTE}` };
}

export async function deleteDiscountAction(id: string): Promise<{ ok: boolean; persisted: boolean; message: string }> {
  await requireAdmin();
  const discount = getDiscount(id);
  if (!discount) return { ok: false, persisted: false, message: "That discount no longer exists." };
  const result = await discountStore.remove(discount.id);
  return { ok: true, persisted: result.persisted, message: result.persisted ? `${discount.code} deleted.` : `${discount.code} would be deleted. ${PREVIEW_NOTE}` };
}
