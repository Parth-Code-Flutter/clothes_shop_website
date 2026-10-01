import type { AdminThemeName } from "@/features/admin/config/admin-brand";

export const SETTINGS_SECTIONS = ["store", "branding", "payments", "shipping", "taxes", "notifications", "staff"] as const;
export type SettingsSection = (typeof SETTINGS_SECTIONS)[number];

export const SETTINGS_META: Record<SettingsSection, { label: string; description: string }> = {
  store: { label: "Store details", description: "Name, contact details, business address and order numbers." },
  branding: { label: "Branding", description: "Colour theme, logo mark and the console name." },
  payments: { label: "Payments", description: "Payment methods and cash on delivery rules." },
  shipping: { label: "Shipping & delivery", description: "Free shipping, delivery zones, rates and times." },
  taxes: { label: "Taxes", description: "GST rates, HSN code and how prices show tax." },
  notifications: { label: "Notifications", description: "Alerts for you and emails for customers." },
  staff: { label: "Staff & roles", description: "Who can sign in and what each person can do." },
};

export function isSettingsSection(value: string): value is SettingsSection {
  return (SETTINGS_SECTIONS as readonly string[]).includes(value);
}

export const INDIAN_STATES = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chandigarh", "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir",
  "Jharkhand", "Karnataka", "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
  "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
] as const;

export const GSTIN_PATTERN = /^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
export const PINCODE_PATTERN = /^[1-9]\d{5}$/;
export const PHONE_PATTERN = /^\+?[\d\s-]{10,16}$/;
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const HSN_PATTERN = /^\d{4}(\d{2}){0,2}$/;

export type StoreDetails = {
  name: string;
  legalName: string;
  email: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
  gstin: string;
  orderPrefix: string;
};

export type BrandingSettings = { theme: AdminThemeName; monogram: string; consoleLabel: string };

export type PaymentSettings = {
  upi: boolean;
  card: boolean;
  netBanking: boolean;
  cod: boolean;
  codFeePaise: number;
  codMaxPaise: number;
};

export type ShippingZone = { id: string; name: string; states: string[]; ratePaise: number; minDays: number; maxDays: number };
export type ShippingSettings = { freeShippingFromPaise: number; processingDays: number; zones: ShippingZone[]; restOfIndia: Omit<ShippingZone, "id" | "name" | "states"> };

export type TaxSettings = { pricesIncludeGst: boolean; thresholdPaise: number; lowRate: number; highRate: number; hsn: string; showOnInvoice: boolean };

export const OWNER_ALERTS = ["newOrder", "lowStock", "returnRequested", "newReview", "dailySummary"] as const;
export const CUSTOMER_EMAILS = ["orderConfirmed", "shipped", "delivered", "reviewRequest"] as const;
export type OwnerAlert = (typeof OWNER_ALERTS)[number];
export type CustomerEmail = (typeof CUSTOMER_EMAILS)[number];

export const ALERT_META: Record<OwnerAlert, { label: string; hint: string }> = {
  newOrder: { label: "New order", hint: "As soon as an order is paid or placed with cash on delivery" },
  lowStock: { label: "Low stock", hint: "When a size drops to the low-stock level" },
  returnRequested: { label: "Return requested", hint: "So you can reply within 48 hours" },
  newReview: { label: "New review to approve", hint: "Reviews wait for approval before they show" },
  dailySummary: { label: "Daily summary", hint: "Yesterday's sales and today's tasks, at 9 am" },
};

export const CUSTOMER_EMAIL_META: Record<CustomerEmail, { label: string; hint: string; required?: boolean }> = {
  orderConfirmed: { label: "Order confirmation", hint: "Receipt with items, address and payment", required: true },
  shipped: { label: "Shipped", hint: "Courier name and tracking number" },
  delivered: { label: "Delivered", hint: "With a link to start a return" },
  reviewRequest: { label: "Review request", hint: "Five days after delivery" },
};

export type NotificationSettings = {
  ownerEmail: string;
  alerts: Record<OwnerAlert, boolean>;
  customer: Record<CustomerEmail, boolean>;
  lowStockThreshold: number;
  whatsappUpdates: boolean;
};

export const STAFF_ROLES = ["owner", "manager", "packer"] as const;
export type StaffRole = (typeof STAFF_ROLES)[number];

export const ROLE_META: Record<StaffRole, { label: string; hint: string }> = {
  owner: { label: "Owner", hint: "Everything, including settings and staff" },
  manager: { label: "Manager", hint: "Runs the store day to day" },
  packer: { label: "Packer", hint: "Packs and ships orders" },
};

export const PERMISSIONS: { area: string; roles: Record<StaffRole, "full" | "view" | "none"> }[] = [
  { area: "Orders and shipping", roles: { owner: "full", manager: "full", packer: "full" } },
  { area: "Products and inventory", roles: { owner: "full", manager: "full", packer: "view" } },
  { area: "Customers", roles: { owner: "full", manager: "full", packer: "none" } },
  { area: "Discounts and collections", roles: { owner: "full", manager: "full", packer: "none" } },
  { area: "Content and reviews", roles: { owner: "full", manager: "full", packer: "none" } },
  { area: "Analytics", roles: { owner: "full", manager: "view", packer: "none" } },
  { area: "Settings and staff", roles: { owner: "full", manager: "none", packer: "none" } },
];

export type StaffMember = { id: string; name: string; email: string; role: StaffRole; status: "active" | "invited"; lastActive?: string; isYou?: boolean };
export type StaffSettings = { members: StaffMember[] };

export type SettingsValues = {
  store: StoreDetails;
  branding: BrandingSettings;
  payments: PaymentSettings;
  shipping: ShippingSettings;
  taxes: TaxSettings;
  notifications: NotificationSettings;
  staff: StaffSettings;
};

/** GST on one item at `pricePaise`. Inclusive prices carry the tax inside them. */
export function gstFor(pricePaise: number, taxes: TaxSettings) {
  const rate = pricePaise <= taxes.thresholdPaise ? taxes.lowRate : taxes.highRate;
  const taxPaise = taxes.pricesIncludeGst ? Math.round(pricePaise - pricePaise / (1 + rate / 100)) : Math.round((pricePaise * rate) / 100);
  return { rate, taxPaise, totalPaise: taxes.pricesIncludeGst ? pricePaise : pricePaise + taxPaise };
}
