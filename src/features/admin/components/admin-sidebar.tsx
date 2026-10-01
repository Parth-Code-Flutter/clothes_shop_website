"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type FocusEvent, type PointerEvent } from "react";
import { ArrowUpRight, PanelLeftClose, PanelLeftOpen, Store } from "lucide-react";
import { adminBrand } from "@/features/admin/config/admin-brand";
import { adminNav } from "@/features/admin/config/admin-nav";
import { AdminMonogram } from "@/features/admin/components/admin-monogram";
import { cn } from "@/lib/utils";

type Tip = { label: string; top: number };

type AdminSidebarProps = {
  onNavigate?: () => void;
  collapsed?: boolean;
  /** Desktop only; the mobile drawer has its own close button. */
  onToggleCollapse?: () => void;
  /** Live counts keyed by nav href, e.g. orders waiting to be packed. */
  badges?: Record<string, string>;
};

const allItems = adminNav.flatMap((group) => group.items);
const readyCount = allItems.filter((item) => item.ready).length;
const nextUp = allItems.find((item) => !item.ready);

export function AdminSidebar({ onNavigate, collapsed = false, onToggleCollapse, badges = {} }: AdminSidebarProps) {
  const pathname = usePathname();
  const [tip, setTip] = useState<Tip | null>(null);

  const showTip = (label: string) => (event: PointerEvent<HTMLElement> | FocusEvent<HTMLElement>) => {
    if (!collapsed) return;
    const rect = event.currentTarget.getBoundingClientRect();
    setTip({ label, top: rect.top + rect.height / 2 });
  };
  const hideTip = () => setTip(null);
  const tipHandlers = (label: string) => ({
    onPointerEnter: showTip(label),
    onPointerLeave: hideTip,
    onFocus: showTip(label),
    onBlur: hideTip,
  });

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-adm-sidebar whitespace-nowrap text-adm-sidebar-ink">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-48 opacity-70"
        style={{ background: "radial-gradient(120% 80% at 0% 0%, color-mix(in oklab, var(--adm-sidebar-accent) 12%, transparent), transparent 70%)" }}
      />

      <div className={cn("relative flex h-16 shrink-0 items-center", collapsed ? "justify-center px-0" : "gap-2.5 pr-2 pl-4")}>
        {collapsed && onToggleCollapse ? (
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label="Expand sidebar"
            aria-expanded={false}
            {...tipHandlers("Expand sidebar · Ctrl/⌘ B")}
            className="group relative inline-flex size-10 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-adm-sidebar-accent"
          >
            <AdminMonogram onSidebar className="size-8 text-[11px] transition-opacity group-hover:opacity-0 group-focus-visible:opacity-0" />
            <span className="absolute inset-0 inline-flex items-center justify-center rounded-full bg-adm-sidebar-ink/[0.08] text-adm-sidebar-ink opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
              <PanelLeftOpen className="size-[18px]" strokeWidth={1.6} aria-hidden="true" />
            </span>
          </button>
        ) : (
          <AdminMonogram onSidebar className="size-8 text-[11px]" />
        )}
        <div className={cn("min-w-0 flex-1 leading-tight", collapsed && "sr-only")}>
          <p className="truncate font-adm-display text-[14px] font-semibold">{adminBrand.name}</p>
          <p className="text-[12px] text-adm-sidebar-ink-soft">{adminBrand.consoleLabel}</p>
        </div>
        {!collapsed && onToggleCollapse ? (
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label="Collapse sidebar"
            aria-expanded
            title="Collapse sidebar (Ctrl/⌘ B)"
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-adm-sidebar-ink-soft transition-colors hover:bg-adm-sidebar-ink/[0.06] hover:text-adm-sidebar-ink focus-visible:outline-2 focus-visible:outline-adm-sidebar-accent"
          >
            <PanelLeftClose className="size-[18px]" strokeWidth={1.6} aria-hidden="true" />
          </button>
        ) : null}
      </div>

      <nav aria-label="Admin" onScroll={hideTip} className={cn("relative flex-1 overflow-x-hidden overflow-y-auto pt-3 pb-5", collapsed ? "px-0" : "px-3")}>
        {adminNav.map((group, groupIndex) => (
          <div key={group.label} className={cn("last:mb-0", collapsed ? "mb-3" : "mb-5")}>
            {collapsed ? (
              groupIndex > 0 ? <span aria-hidden="true" className="mx-auto mb-3 block h-px w-6 bg-adm-sidebar-line" /> : null
            ) : null}
            <p className={cn("px-2.5 text-[11px] font-medium text-adm-sidebar-ink-soft", collapsed && "sr-only")}>{group.label}</p>
            <ul className={cn("flex flex-col gap-0.5", collapsed ? "items-center" : "mt-1.5")}>
              {group.items.map((item) => {
                const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
                const Icon = item.icon;
                const badge = item.ready ? badges[item.href] : undefined;
                const tipLabel = item.ready ? (badge ? `${item.label} · ${badge}` : item.label) : `${item.label} · Coming soon`;
                const inner = (
                  <>
                    <span
                      className={cn(
                        "relative inline-flex size-7 shrink-0 items-center justify-center rounded-lg transition-all duration-200",
                        active
                          ? "bg-adm-sidebar-accent text-adm-sidebar shadow-[0_4px_12px_-4px_var(--adm-sidebar-accent)]"
                          : "text-adm-sidebar-ink-soft group-hover:bg-adm-sidebar-ink/[0.06] group-hover:text-adm-sidebar-ink",
                      )}
                    >
                      <Icon className="size-4" strokeWidth={active ? 2 : 1.7} aria-hidden="true" />
                    </span>
                    <span className={cn("flex-1 truncate", collapsed && "sr-only")}>{item.label}</span>
                    {badge && !collapsed ? (
                      <span className="rounded-md bg-adm-sidebar-accent/15 px-1.5 py-px text-[11px] font-semibold text-adm-sidebar-accent tabular-nums">
                        {badge}
                      </span>
                    ) : null}
                    {badge && collapsed ? (
                      <span aria-hidden="true" className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-adm-sidebar-accent ring-2 ring-adm-sidebar" />
                    ) : null}
                    {!item.ready && !collapsed ? (
                      <span className="text-[11px] text-adm-sidebar-ink-soft/70 opacity-0 transition-opacity group-hover:opacity-100">Soon</span>
                    ) : null}
                  </>
                );
                const base = cn(
                  "group relative flex h-9 items-center rounded-[10px] text-[13.5px] transition-colors",
                  collapsed ? "w-10 justify-center" : "gap-2 pr-2.5 pl-1",
                );
                return (
                  <li key={item.href} className={collapsed ? "" : "w-full"}>
                    {item.ready ? (
                      <Link
                        href={item.href}
                        onClick={onNavigate}
                        aria-current={active ? "page" : undefined}
                        {...tipHandlers(tipLabel)}
                        className={cn(
                          base,
                          "focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-adm-sidebar-accent",
                          active
                            ? "bg-adm-surface font-medium text-adm-sidebar-ink shadow-[0_1px_2px_rgb(0_0_0/0.06)] ring-1 ring-adm-sidebar-line"
                            : "text-adm-sidebar-ink-soft hover:bg-adm-sidebar-ink/[0.04] hover:text-adm-sidebar-ink",
                        )}
                      >
                        {inner}
                      </Link>
                    ) : (
                      <span
                        aria-disabled="true"
                        title={collapsed ? undefined : "Coming soon"}
                        {...tipHandlers(tipLabel)}
                        className={cn(base, "cursor-default text-adm-sidebar-ink-soft hover:bg-adm-sidebar-ink/[0.03]")}
                      >
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

      <div className={cn("relative shrink-0 border-t border-adm-sidebar-line", collapsed ? "flex justify-center py-3" : "flex flex-col gap-2 p-3")}>
        {collapsed ? null : (
          <div className="rounded-xl border border-adm-sidebar-line bg-adm-surface p-3 shadow-[0_1px_2px_rgb(0_0_0/0.04)]">
            <div className="flex items-center justify-between text-[12px]">
              <span className="font-medium text-adm-sidebar-ink">Console setup</span>
              <span className="text-adm-sidebar-ink-soft tabular-nums">
                {readyCount}/{allItems.length} live
              </span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-adm-sidebar-ink/[0.07]">
              <span
                className="adm-grow-x block h-full rounded-full bg-adm-sidebar-accent"
                style={{ width: `${Math.max(6, (readyCount / allItems.length) * 100)}%` }}
              />
            </div>
            {nextUp ? (
              <p className="mt-2 truncate text-[11.5px] text-adm-sidebar-ink-soft">
                Next up: <span className="font-medium text-adm-sidebar-ink">{nextUp.label}</span>
              </p>
            ) : null}
          </div>
        )}
        <Link
          href="/"
          target="_blank"
          rel="noreferrer"
          {...tipHandlers("View storefront")}
          aria-label={collapsed ? "View storefront (opens in a new tab)" : undefined}
          className={cn(
            "group flex items-center rounded-[10px] text-[13px] text-adm-sidebar-ink-soft transition-colors hover:bg-adm-sidebar-ink/[0.04] hover:text-adm-sidebar-ink focus-visible:outline-2 focus-visible:outline-adm-sidebar-accent",
            collapsed ? "size-10 justify-center" : "h-9 gap-2 pr-2.5 pl-1",
          )}
        >
          <span className="inline-flex size-7 items-center justify-center rounded-lg group-hover:bg-adm-sidebar-ink/[0.06]">
            <Store className="size-4" strokeWidth={1.7} aria-hidden="true" />
          </span>
          {collapsed ? null : (
            <>
              <span className="flex-1">View storefront</span>
              <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={1.8} aria-hidden="true" />
            </>
          )}
        </Link>
      </div>

      {collapsed && tip ? (
        <span
          role="tooltip"
          className="pointer-events-none fixed left-[88px] z-[60] -translate-y-1/2 rounded-lg bg-adm-ink px-2.5 py-1.5 text-[12px] font-medium text-adm-canvas shadow-[0_12px_30px_-12px_rgb(0_0_0/0.5)]"
          style={{ top: tip.top }}
        >
          {tip.label}
        </span>
      ) : null}
    </div>
  );
}
