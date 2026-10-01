"use server";

import { requireAdmin } from "@/features/admin/auth/dal";
import { adminThemes, type AdminThemeName } from "@/features/admin/config/admin-brand";
import { settingsStore } from "@/features/admin/data/settings";
import {
  CUSTOMER_EMAILS,
  CUSTOMER_EMAIL_META,
  EMAIL_PATTERN,
  GSTIN_PATTERN,
  HSN_PATTERN,
  INDIAN_STATES,
  OWNER_ALERTS,
  PHONE_PATTERN,
  PINCODE_PATTERN,
  SETTINGS_META,
  STAFF_ROLES,
  isSettingsSection,
  type SettingsSection,
  type SettingsValues,
  type StaffRole,
} from "@/features/admin/lib/settings-meta";

export type SettingsFormState = {
  status: "idle" | "saved" | "preview" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
  at?: number;
};

type Errors = Record<string, string>;
type Raw = Record<string, unknown>;

const MAX_RUPEES = 10_00_000;

function text(raw: Raw, key: string, errors: Errors, label: string, max: number, required = true) {
  const value = String(raw[key] ?? "").trim();
  if (required && !value) errors[key] = `${label} can't be empty.`;
  else if (value.length > max) errors[key] = `Keep ${label.toLowerCase()} under ${max} characters.`;
  return value.slice(0, max);
}

/** Whole rupees stored as paise; blank counts as 0. */
function paise(value: unknown, key: string, errors: Errors, label: string) {
  const amount = Number(value ?? 0);
  if (!Number.isFinite(amount) || amount < 0 || amount > MAX_RUPEES * 100) {
    errors[key] = `Enter ${label.toLowerCase()} between ₹0 and ₹${MAX_RUPEES.toLocaleString("en-IN")}.`;
    return 0;
  }
  return Math.round(amount);
}

function whole(value: unknown, key: string, errors: Errors, label: string, min: number, max: number) {
  const number = Number(value);
  if (!Number.isInteger(number) || number < min || number > max) {
    errors[key] = `${label} must be a whole number from ${min} to ${max}.`;
    return min;
  }
  return number;
}

const flag = (value: unknown) => value === true;

type Validator<S extends SettingsSection> = (raw: Raw, errors: Errors) => SettingsValues[S];

const validators: { [S in SettingsSection]: Validator<S> } = {
  store(raw, errors) {
    const email = text(raw, "email", errors, "Email", 120);
    if (email && !EMAIL_PATTERN.test(email)) errors.email = "Enter a valid email address.";
    const phone = text(raw, "phone", errors, "Phone", 20);
    if (phone && !PHONE_PATTERN.test(phone)) errors.phone = "Enter a 10-digit phone number, with +91 if you like.";
    const state = String(raw.state ?? "");
    if (!(INDIAN_STATES as readonly string[]).includes(state)) errors.state = "Choose a state.";
    const pincode = text(raw, "pincode", errors, "PIN code", 6);
    if (pincode && !PINCODE_PATTERN.test(pincode)) errors.pincode = "PIN codes are 6 digits.";
    const gstin = String(raw.gstin ?? "").trim().toUpperCase();
    if (gstin && !GSTIN_PATTERN.test(gstin)) errors.gstin = "A GSTIN is 15 characters, like 24ABCDE1234F1Z5.";
    const orderPrefix = String(raw.orderPrefix ?? "").trim().toUpperCase();
    if (!/^[A-Z]{1,4}$/.test(orderPrefix)) errors.orderPrefix = "Use 1 to 4 letters.";
    return {
      name: text(raw, "name", errors, "Store name", 60),
      legalName: text(raw, "legalName", errors, "Legal name", 100, false),
      email,
      phone,
      line1: text(raw, "line1", errors, "Address", 120),
      line2: text(raw, "line2", errors, "Address line 2", 120, false),
      city: text(raw, "city", errors, "City", 60),
      state,
      pincode,
      gstin,
      orderPrefix,
    };
  },

  branding(raw, errors) {
    const theme = String(raw.theme ?? "") as AdminThemeName;
    if (!(theme in adminThemes)) errors.theme = "Choose one of the themes.";
    const monogram = String(raw.monogram ?? "").trim().toUpperCase();
    if (!/^[A-Z0-9]{1,2}$/.test(monogram)) errors.monogram = "Use one or two letters or numbers.";
    return { theme, monogram, consoleLabel: text(raw, "consoleLabel", errors, "Console name", 30) };
  },

  payments(raw, errors) {
    const value = {
      upi: flag(raw.upi),
      card: flag(raw.card),
      netBanking: flag(raw.netBanking),
      cod: flag(raw.cod),
      codFeePaise: paise(raw.codFeePaise, "codFeePaise", errors, "The fee"),
      codMaxPaise: paise(raw.codMaxPaise, "codMaxPaise", errors, "The limit"),
    };
    if (!value.upi && !value.card && !value.netBanking && !value.cod) errors.methods = "Keep at least one way to pay switched on.";
    if (value.cod && value.codMaxPaise > 0 && value.codMaxPaise < 500_00) errors.codMaxPaise = "Set the limit to at least ₹500, or 0 for no limit.";
    return value;
  },

  shipping(raw, errors) {
    const zonesRaw = Array.isArray(raw.zones) ? (raw.zones as Raw[]).slice(0, 10) : [];
    const claimed = new Set<string>();
    const days = (source: Raw, prefix: string) => {
      const minDays = whole(source.minDays, `${prefix}.days`, errors, "Delivery days", 1, 30);
      const maxDays = whole(source.maxDays, `${prefix}.days`, errors, "Delivery days", 1, 30);
      if (maxDays < minDays) errors[`${prefix}.days`] = "The latest day can't be before the earliest.";
      return { minDays, maxDays };
    };
    const zones = zonesRaw.map((zone, index) => {
      const prefix = `zone.${index}`;
      const name = String(zone.name ?? "").trim().slice(0, 40);
      if (!name) errors[`${prefix}.name`] = "Name the zone.";
      const states = (Array.isArray(zone.states) ? zone.states : []).map(String).filter((state) => (INDIAN_STATES as readonly string[]).includes(state));
      if (states.length === 0) errors[`${prefix}.states`] = "Add at least one state.";
      const repeated = states.find((state) => claimed.has(state));
      if (repeated) errors[`${prefix}.states`] = `${repeated} is already in another zone.`;
      states.forEach((state) => claimed.add(state));
      return { id: String(zone.id ?? `z${index}`).slice(0, 30), name, states, ratePaise: paise(zone.ratePaise, `${prefix}.rate`, errors, "The rate"), ...days(zone, prefix) };
    });
    const rest = (raw.restOfIndia ?? {}) as Raw;
    return {
      freeShippingFromPaise: paise(raw.freeShippingFromPaise, "freeShippingFromPaise", errors, "The amount"),
      processingDays: whole(raw.processingDays, "processingDays", errors, "Packing time", 0, 10),
      zones,
      restOfIndia: { ratePaise: paise(rest.ratePaise, "rest.rate", errors, "The rate"), ...days(rest, "rest") },
    };
  },

  taxes(raw, errors) {
    const rate = (value: unknown, key: string) => {
      const number = Number(value);
      if (!Number.isFinite(number) || number < 0 || number > 28) {
        errors[key] = "GST rates run from 0% to 28%.";
        return 0;
      }
      return Math.round(number * 100) / 100;
    };
    const hsn = String(raw.hsn ?? "").trim();
    if (!HSN_PATTERN.test(hsn)) errors.hsn = "HSN codes are 4, 6 or 8 digits.";
    const value = {
      pricesIncludeGst: flag(raw.pricesIncludeGst),
      thresholdPaise: paise(raw.thresholdPaise, "thresholdPaise", errors, "The price"),
      lowRate: rate(raw.lowRate, "lowRate"),
      highRate: rate(raw.highRate, "highRate"),
      hsn,
      showOnInvoice: flag(raw.showOnInvoice),
    };
    if (!errors.highRate && value.highRate < value.lowRate) errors.highRate = "The rate above the limit is usually the higher one.";
    return value;
  },

  notifications(raw, errors) {
    const ownerEmail = text(raw, "ownerEmail", errors, "Email", 120);
    if (ownerEmail && !EMAIL_PATTERN.test(ownerEmail)) errors.ownerEmail = "Enter a valid email address.";
    const alerts = (raw.alerts ?? {}) as Raw;
    const customer = (raw.customer ?? {}) as Raw;
    return {
      ownerEmail,
      alerts: Object.fromEntries(OWNER_ALERTS.map((key) => [key, flag(alerts[key])])) as SettingsValues["notifications"]["alerts"],
      customer: Object.fromEntries(CUSTOMER_EMAILS.map((key) => [key, CUSTOMER_EMAIL_META[key].required ? true : flag(customer[key])])) as SettingsValues["notifications"]["customer"],
      lowStockThreshold: whole(raw.lowStockThreshold, "lowStockThreshold", errors, "Low-stock level", 1, 50),
      whatsappUpdates: flag(raw.whatsappUpdates),
    };
  },

  staff(raw, errors) {
    const membersRaw = Array.isArray(raw.members) ? (raw.members as Raw[]).slice(0, 25) : [];
    const seen = new Set<string>();
    const members = membersRaw.map((member, index) => {
      const email = String(member.email ?? "").trim().toLowerCase();
      if (!EMAIL_PATTERN.test(email)) errors[`member.${index}`] = "Enter a valid email address.";
      else if (seen.has(email)) errors[`member.${index}`] = "This person is already on the team.";
      seen.add(email);
      const role = String(member.role ?? "") as StaffRole;
      if (!STAFF_ROLES.includes(role)) errors[`member.${index}`] = "Choose a role.";
      return {
        id: String(member.id ?? `s${index}`).slice(0, 40),
        name: String(member.name ?? "").trim().slice(0, 60),
        email,
        role,
        status: member.status === "active" ? ("active" as const) : ("invited" as const),
      };
    });
    if (!members.some((member) => member.role === "owner" && member.status === "active")) errors.members = "Keep at least one active owner.";
    return { members };
  },
};

export async function saveSettingsAction(_previous: SettingsFormState, formData: FormData): Promise<SettingsFormState> {
  await requireAdmin();
  const section = String(formData.get("section") ?? "");
  if (!isSettingsSection(section)) return { status: "error", message: "Unknown settings section. Reload and try again.", at: Date.now() };

  let raw: Raw;
  try {
    raw = JSON.parse(String(formData.get("payload") ?? "{}"));
  } catch {
    return { status: "error", message: "Something went wrong reading the form. Reload and try again.", at: Date.now() };
  }

  const errors: Errors = {};
  const value = validators[section](raw, errors);
  if (Object.keys(errors).length > 0) return { status: "error", message: "Fix the highlighted fields and save again.", fieldErrors: errors, at: Date.now() };

  const result = await settingsStore.save(section, value as never);
  const label = SETTINGS_META[section].label;
  return result.persisted
    ? { status: "saved", message: `${label} saved.`, at: Date.now() }
    : { status: "preview", message: "Everything checks out. Saving switches on once settings are stored in a database.", at: Date.now() };
}
