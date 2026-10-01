import type { Metadata } from "next";
import Link from "next/link";
import { Bell, ChevronRight, LogOut, ShieldCheck, Store } from "lucide-react";
import { logoutAction } from "@/features/admin/auth/actions";
import { usingDevCredentials } from "@/features/admin/auth/credentials";
import { requireAdmin } from "@/features/admin/auth/dal";
import { AppearanceCard, PasswordForm, ProfileDetailsForm } from "@/features/admin/components/profile/profile-forms";
import { Card, PageHeader, buttonClass } from "@/features/admin/components/ui";
import { formatDateTime } from "@/features/admin/lib/format";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Profile settings" };

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

const LINKS = [
  { href: "/admin/settings/notifications", label: "Notification settings", hint: "Which alerts reach your inbox", icon: Bell },
  { href: "/admin/settings", label: "Store settings", hint: "Payments, delivery, tax and your team", icon: Store },
];

export default async function ProfilePage() {
  const session = await requireAdmin();
  const demo = usingDevCredentials();

  return (
    <div className="mx-auto flex w-full max-w-[960px] flex-col gap-6">
      <PageHeader title="Profile settings" description="Your sign-in details, password and how the console looks for you." />

      <section className="adm-rise flex flex-wrap items-center gap-4 rounded-[14px] border border-adm-line bg-adm-surface px-5 py-4">
        <span className="inline-flex size-14 shrink-0 items-center justify-center rounded-full bg-adm-accent text-[18px] font-semibold text-adm-accent-ink">{initials(session.name)}</span>
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-2 text-[16px] font-semibold">
            {session.name}
            <span className="rounded-full bg-adm-accent-soft px-2 py-0.5 text-[11px] font-medium text-adm-accent">Owner</span>
            {demo ? <span className="rounded-full bg-adm-warning-soft px-2 py-0.5 text-[11px] font-medium text-adm-warning">Demo login</span> : null}
          </p>
          <p className="truncate text-[13px] text-adm-ink-soft">{session.email}</p>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex min-w-0 flex-col gap-6">
          <ProfileDetailsForm name={session.name} email={session.email} />
          <PasswordForm />
        </div>

        <aside className="flex flex-col gap-6">
          <AppearanceCard />

          <Card title="This session">
            <div className="flex items-start gap-3">
              <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-adm-success-soft text-adm-success">
                <ShieldCheck className="size-4" strokeWidth={1.8} aria-hidden="true" />
              </span>
              <div className="text-[12.5px]">
                <p className="font-medium text-adm-ink">Signed in on this browser</p>
                <p className="mt-0.5 text-adm-ink-faint">Stays signed in until {formatDateTime(new Date(session.exp).toISOString())}.</p>
              </div>
            </div>
            <form action={logoutAction} className="mt-4">
              <button type="submit" className={cn(buttonClass.secondary, "w-full text-adm-danger hover:bg-adm-danger-soft")}>
                <LogOut className="size-4" strokeWidth={1.7} aria-hidden="true" />
                Sign out
              </button>
            </form>
          </Card>

          <nav aria-label="Related settings" className="overflow-hidden rounded-[14px] border border-adm-line bg-adm-surface">
            <ul className="divide-y divide-adm-line">
              {LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-adm-surface-muted/60">
                    <link.icon className="size-4 shrink-0 text-adm-ink-faint group-hover:text-adm-accent" strokeWidth={1.7} aria-hidden="true" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[13px] font-medium">{link.label}</span>
                      <span className="block text-[12px] text-adm-ink-faint">{link.hint}</span>
                    </span>
                    <ChevronRight className="size-4 text-adm-ink-faint transition-transform group-hover:translate-x-0.5" strokeWidth={1.8} aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
      </div>
    </div>
  );
}
