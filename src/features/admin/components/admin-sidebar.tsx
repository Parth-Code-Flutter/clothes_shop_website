"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { adminBrand } from "@/features/admin/config/admin-brand";
import { adminNav } from "@/features/admin/config/admin-nav";
import { AdminMonogram } from "@/features/admin/components/admin-monogram";
import { cn } from "@/lib/utils";

export function AdminSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col bg-adm-sidebar text-adm-sidebar-ink">
      <div className="flex h-[72px] shrink-0 items-center gap-3 border-b border-adm-sidebar-line px-6">
        <AdminMonogram onSidebar className="size-9 text-[13px]" />
        <div className="min-w-0 leading-tight">
          <p className="truncate font-adm-display text-[19px] font-semibold">{adminBrand.name}</p>
          <p className="text-[10px] font-medium tracking-[0.2em] text-adm-sidebar-ink-soft uppercase">{adminBrand.consoleLabel}</p>
        </div>
      </div>

      <nav aria-label="Admin" className="flex-1 overflow-y-auto px-4 py-6">
        {adminNav.map((group) => (
          <div key={group.label} className="mb-7 last:mb-0">
            <p className="px-3 text-[10px] font-semibold tracking-[0.22em] text-adm-sidebar-ink-soft/80 uppercase">{group.label}</p>
            <ul className="mt-2.5 flex flex-col gap-0.5">
              {group.items.map((item) => {
                const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
                const Icon = item.icon;
                const inner = (
                  <>
                    <span
                      aria-hidden="true"
                      className={cn(
                        "absolute top-1/2 left-0 h-5 w-[2px] -translate-y-1/2 rounded-full bg-adm-sidebar-accent transition-opacity",
                        active ? "opacity-100" : "opacity-0",
                      )}
                    />
                    <Icon className={cn("size-[18px] shrink-0", active ? "text-adm-sidebar-accent" : "")} strokeWidth={1.6} aria-hidden="true" />
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.ready && item.badge ? (
                      <span className="rounded-full bg-adm-sidebar-accent px-2 py-0.5 text-[10px] font-semibold text-adm-sidebar tabular-nums">
                        {item.badge}
                      </span>
                    ) : null}
                    {!item.ready ? (
                      <span className="rounded-full border border-adm-sidebar-line px-2 py-0.5 text-[9px] font-semibold tracking-[0.14em] text-adm-sidebar-ink-soft uppercase">
                        Soon
                      </span>
                    ) : null}
                  </>
                );
                const base = "relative flex h-10 items-center gap-3 rounded-lg px-3 text-[14px]";
                return (
                  <li key={item.href}>
                    {item.ready ? (
                      <Link
                        href={item.href}
                        onClick={onNavigate}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          base,
                          "transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-adm-sidebar-accent",
                          active
                            ? "bg-adm-sidebar-ink/[0.07] font-medium text-adm-sidebar-ink"
                            : "text-adm-sidebar-ink-soft hover:bg-adm-sidebar-ink/[0.04] hover:text-adm-sidebar-ink",
                        )}
                      >
                        {inner}
                      </Link>
                    ) : (
                      <span aria-disabled="true" className={cn(base, "cursor-default text-adm-sidebar-ink-soft/55")}>
                        {inner}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="shrink-0 border-t border-adm-sidebar-line p-4">
        <Link
          href="/"
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between rounded-lg border border-adm-sidebar-line px-3.5 py-3 text-[13px] text-adm-sidebar-ink-soft transition-colors hover:border-adm-sidebar-accent/50 hover:text-adm-sidebar-ink focus-visible:outline-2 focus-visible:outline-adm-sidebar-accent"
        >
          <span>
            <span className="block font-medium text-adm-sidebar-ink">View storefront</span>
            <span className="text-[12px]">Opens in a new tab</span>
          </span>
          <ArrowUpRight className="size-4" strokeWidth={1.6} aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
