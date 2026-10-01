import "server-only";
import { siteConfig } from "@/config/site";
import { adminBrand } from "@/features/admin/config/admin-brand";
import { LOW_STOCK_THRESHOLD } from "@/features/admin/data/products";
import type { SettingsSection, SettingsValues } from "@/features/admin/lib/settings-meta";

/**
 * SAMPLE settings that mirror how the store behaves today: ₹999 free shipping
 * and a ₹79 fee (as in the sample orders), the low-stock level from products,
 * the admin theme from `admin-brand.ts`. Writes go through `settingsStore`.
 */

const HOUR_MS = 60 * 60 * 1000;

function seed(owner: { name: string; email: string }, now: Date): SettingsValues {
  const ago = (hours: number) => new Date(now.getTime() - hours * HOUR_MS).toISOString();
  return {
    store: {
      name: siteConfig.name,
      legalName: "",
      email: siteConfig.contact.email,
      phone: siteConfig.contact.phoneDisplay,
      line1: "Shop 4, Kalwa Chowk",
      line2: "MG Road",
      city: siteConfig.contact.city,
      state: "Gujarat",
      pincode: "362001",
      gstin: "",
      orderPrefix: "HB",
    },
    branding: { theme: adminBrand.theme, monogram: adminBrand.monogram, consoleLabel: adminBrand.consoleLabel },
    payments: { upi: true, card: true, netBanking: true, cod: true, codFeePaise: 0, codMaxPaise: 5_000_00 },
    shipping: {
      freeShippingFromPaise: 999_00,
      processingDays: 1,
      zones: [{ id: "z-gujarat", name: "Gujarat", states: ["Gujarat"], ratePaise: 49_00, minDays: 1, maxDays: 3 }],
      restOfIndia: { ratePaise: 79_00, minDays: 3, maxDays: 7 },
    },
    taxes: { pricesIncludeGst: true, thresholdPaise: 2_500_00, lowRate: 5, highRate: 18, hsn: "6109", showOnInvoice: true },
    notifications: {
      ownerEmail: owner.email,
      alerts: { newOrder: true, lowStock: true, returnRequested: true, newReview: false, dailySummary: true },
      customer: { orderConfirmed: true, shipped: true, delivered: true, reviewRequest: true },
      lowStockThreshold: LOW_STOCK_THRESHOLD,
      whatsappUpdates: false,
    },
    staff: {
      members: [
        { id: "owner", name: owner.name, email: owner.email, role: "owner", status: "active", lastActive: now.toISOString(), isYou: true },
        { id: "s-nisha", name: "Nisha Vaghela", email: "nisha@example.com", role: "manager", status: "active", lastActive: ago(5) },
        { id: "s-ravi", name: "Ravi Solanki", email: "ravi@example.com", role: "packer", status: "active", lastActive: ago(27) },
        { id: "s-karan", name: "", email: "karan.packing@example.com", role: "packer", status: "invited" },
      ],
    },
  };
}

export function getSettings(owner: { name: string; email: string }, now = new Date()): SettingsValues {
  return seed(owner, now);
}

/**
 * The single place settings writes go through. Settings are sample data for
 * now, so this reports `persisted: false`; replace the body with a database call.
 */
export const settingsStore = {
  async save<S extends SettingsSection>(section: S, value: SettingsValues[S]): Promise<{ persisted: boolean }> {
    void section;
    void value;
    return { persisted: false };
  },
};
