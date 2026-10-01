import type { Metadata } from "next";
import Link from "next/link";
import type { CSSProperties } from "react";
import { Bell, ChevronRight, CreditCard, Palette, Receipt, Store, Truck, Users, type LucideIcon } from "lucide-react";
import { requireAdmin } from "@/features/admin/auth/dal";
import { adminThemes } from "@/features/admin/config/admin-brand";
import { getSettings } from "@/features/admin/data/settings";
import { PageHeader, TILE_CLASS } from "@/features/admin/components/ui";
import { formatMoney } from "@/features/admin/lib/format";
import { OWNER_ALERTS, SETTINGS_META, SETTINGS_SECTIONS, type SettingsSection, type SettingsValues } from "@/features/admin/lib/settings-meta";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Settings" };

const ICONS: Record<SettingsSection, LucideIcon> = {
  store: Store,
  branding: Palette,
  payments: CreditCard,
  shipping: Truck,
  taxes: Receipt,
  notifications: Bell,
  staff: Users,
};

function summary(section: SettingsSection, settings: SettingsValues): { text: string; warning?: boolean } {
  switch (section) {
    case "store":
      return { text: `${settings.store.city}, ${settings.store.state} · Orders #${settings.store.orderPrefix}-…` };
    case "branding":
      return { text: `${adminThemes[settings.branding.theme].label} theme · ${settings.branding.monogram}` };
    case "payments": {
      const { payments } = settings;
      const methods = [payments.upi && "UPI", payments.card && "Cards", payments.netBanking && "Net banking", payments.cod && "COD"].filter(Boolean);
      return { text: methods.join(", ") };
    }
    case "shipping":
      return {
        text: `Free from ${formatMoney(settings.shipping.freeShippingFromPaise)} · ${settings.shipping.zones.length + 1} rate${settings.shipping.zones.length ? "s" : ""}`,
      };
    case "taxes":
      return settings.store.gstin
        ? { text: `${settings.taxes.lowRate}% / ${settings.taxes.highRate}% GST · ${settings.taxes.pricesIncludeGst ? "Included in prices" : "Added at checkout"}` }
        : { text: "GSTIN not added yet", warning: true };
    case "notifications": {
      const on = OWNER_ALERTS.filter((key) => settings.notifications.alerts[key]).length;
      return { text: `${on} of ${OWNER_ALERTS.length} alerts on · ${settings.notifications.ownerEmail}` };
    }
    case "staff": {
      const invited = settings.staff.members.filter((member) => member.status === "invited").length;
      return { text: `${settings.staff.members.length} people${invited ? ` · ${invited} invite pending` : ""}` };
    }
  }
}

export default async function SettingsPage() {
  const session = await requireAdmin();
  const settings = getSettings(session);

  return (
    <div className="mx-auto flex w-full max-w-[1000px] flex-col gap-6">
      <PageHeader title="Settings" description="How your store runs: details, payments, delivery, tax and your team." />
      <ul className={cn("adm-rise divide-y divide-adm-line overflow-hidden", TILE_CLASS)} style={{ "--adm-delay": "60ms" } as CSSProperties}>
        {SETTINGS_SECTIONS.map((section) => {
          const Icon = ICONS[section];
          const line = summary(section, settings);
          return (
            <li key={section}>
              <Link href={`/admin/settings/${section}`} className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-adm-surface-muted/50 focus-visible:bg-adm-surface-muted/50 focus-visible:outline-none">
                <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-adm-surface-muted text-adm-ink-soft transition-colors group-hover:bg-adm-accent-soft group-hover:text-adm-accent">
                  <Icon className="size-[18px]" strokeWidth={1.7} aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[14px] font-semibold">{SETTINGS_META[section].label}</span>
                  <span className="block text-[12.5px] text-adm-ink-faint">{SETTINGS_META[section].description}</span>
                </span>
                <span className={cn("hidden max-w-[40%] truncate text-right text-[12.5px] md:block", line.warning ? "font-medium text-adm-warning" : "text-adm-ink-soft")}>{line.text}</span>
                <ChevronRight className="size-4 shrink-0 text-adm-ink-faint transition-transform group-hover:translate-x-0.5" strokeWidth={1.8} aria-hidden="true" />
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
