"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import { Bell, ChevronRight, CreditCard, MessageSquareQuote, Package, PackageX, RotateCcw, Settings2, type LucideIcon } from "lucide-react";
import type { AdminNotifications, NotificationKind } from "@/features/admin/data/notifications";
import { formatRelative } from "@/features/admin/lib/format";
import { cn } from "@/lib/utils";

const SEEN_KEY = "adm-notifications-seen";
const SEEN_EVENT = "adm-notifications-seen";

const KIND: Record<NotificationKind, { icon: LucideIcon; tone: string }> = {
  order: { icon: Package, tone: "bg-adm-accent-soft text-adm-accent" },
  payment: { icon: CreditCard, tone: "bg-adm-warning-soft text-adm-warning" },
  return: { icon: RotateCcw, tone: "bg-adm-info-soft text-adm-info" },
  stock: { icon: PackageX, tone: "bg-adm-danger-soft text-adm-danger" },
  review: { icon: MessageSquareQuote, tone: "bg-adm-success-soft text-adm-success" },
};

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(SEEN_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(SEEN_EVENT, callback);
  };
}

/** ISO time the panel was last opened; "" before the first visit, null while rendering on the server. */
function useLastSeen() {
  return useSyncExternalStore(
    subscribe,
    () => window.localStorage.getItem(SEEN_KEY) ?? "",
    () => null,
  );
}

function markSeen(at: string) {
  window.localStorage.setItem(SEEN_KEY, at);
  window.dispatchEvent(new Event(SEEN_EVENT));
}

export function AdminNotificationsMenu({ notifications }: { notifications: AdminNotifications }) {
  const [open, setOpen] = useState(false);
  const [openedSeen, setOpenedSeen] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const lastSeen = useLastSeen();
  const { tasks, activity } = notifications;
  const newest = activity[0]?.at ?? "";

  const unread = lastSeen === null ? 0 : activity.filter((item) => item.at > lastSeen).length;
  const attention = tasks.reduce((total, task) => total + task.count, 0);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const toggle = () => {
    if (open) return setOpen(false);
    // Keep this session's highlights until the panel closes, then count everything shown as seen.
    setOpenedSeen(lastSeen ?? "");
    if (newest) markSeen(newest);
    setOpen(true);
  };

  const label = unread ? `Notifications, ${unread} unread` : attention ? `Notifications, ${attention} ${attention === 1 ? "item needs" : "items need"} attention` : "Notifications";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={toggle}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={label}
        className={cn(
          "relative inline-flex size-9 items-center justify-center rounded-lg border border-adm-line bg-adm-surface text-adm-ink-soft transition-colors hover:text-adm-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-adm-accent",
          open && "text-adm-ink",
        )}
      >
        <Bell className="size-[18px]" strokeWidth={1.6} />
        {unread ? (
          <span className="absolute -top-1.5 -right-1.5 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-adm-accent px-1 text-[10px] font-semibold text-adm-accent-ink ring-2 ring-adm-canvas tabular-nums">
            {unread > 9 ? "9+" : unread}
          </span>
        ) : attention ? (
          <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-adm-accent ring-2 ring-adm-surface" aria-hidden="true" />
        ) : null}
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label="Notifications"
          className="adm-rise absolute top-[calc(100%+8px)] -right-12 z-50 flex max-h-[min(640px,calc(100dvh-88px))] w-[min(380px,calc(100vw-24px))] flex-col overflow-hidden rounded-xl border border-adm-line bg-adm-surface shadow-[0_24px_60px_-20px_rgb(0_0_0/0.35)] sm:right-0"
          style={{ "--adm-delay": "0ms" } as CSSProperties}
        >
          <header className="flex items-center justify-between gap-3 border-b border-adm-line px-4 py-3">
            <p className="text-[14px] font-semibold">Notifications</p>
            {openedSeen !== null && activity.some((item) => item.at > openedSeen) ? (
              <button type="button" onClick={() => setOpenedSeen(newest)} className="text-[12px] font-medium text-adm-accent hover:underline">
                Mark all as read
              </button>
            ) : null}
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {tasks.length ? (
              <section aria-label="Needs attention" className="border-b border-adm-line px-2 py-2">
                <p className="px-2 pt-1 pb-1.5 text-[11px] font-semibold tracking-[0.06em] text-adm-ink-faint uppercase">Needs attention</p>
                <ul>
                  {tasks.map((task) => {
                    const meta = KIND[task.kind];
                    return (
                      <li key={task.kind}>
                        <Link href={task.href} onClick={() => setOpen(false)} className="group flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-adm-surface-muted">
                          <span className={cn("inline-flex size-7 shrink-0 items-center justify-center rounded-lg", meta.tone)}>
                            <meta.icon className="size-3.5" strokeWidth={1.9} aria-hidden="true" />
                          </span>
                          <span className="flex-1 text-[13px]">
                            <span className="font-semibold tabular-nums">{task.count}</span> {task.label}
                          </span>
                          <ChevronRight className="size-3.5 text-adm-ink-faint transition-transform group-hover:translate-x-0.5" strokeWidth={2} aria-hidden="true" />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ) : null}

            <section aria-label="Recent activity" className="px-2 py-2">
              <p className="px-2 pt-1 pb-1.5 text-[11px] font-semibold tracking-[0.06em] text-adm-ink-faint uppercase">Recent activity</p>
              {activity.length ? (
                <ul>
                  {activity.map((item) => {
                    const meta = KIND[item.kind];
                    const isNew = openedSeen !== null && item.at > openedSeen;
                    return (
                      <li key={item.id}>
                        <Link
                          href={item.href}
                          onClick={() => setOpen(false)}
                          className={cn("flex items-start gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-adm-surface-muted", isNew && "bg-adm-accent-soft/40")}
                        >
                          <span className={cn("mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-full", meta.tone)}>
                            <meta.icon className="size-4" strokeWidth={1.8} aria-hidden="true" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-[13px] leading-snug font-medium">{item.title}</span>
                            <span className="mt-0.5 block truncate text-[12px] text-adm-ink-faint">{item.detail}</span>
                          </span>
                          <span className="flex shrink-0 flex-col items-end gap-1.5 pt-0.5">
                            <span className="text-[11px] whitespace-nowrap text-adm-ink-faint">{formatRelative(item.at)}</span>
                            {isNew ? <span className="size-2 rounded-full bg-adm-accent" aria-label="New" /> : null}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="px-2 py-6 text-center text-[13px] text-adm-ink-faint">Nothing new in the last two days.</p>
              )}
            </section>
          </div>

          <Link
            href="/admin/settings/notifications"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 border-t border-adm-line px-4 py-2.5 text-[12.5px] font-medium text-adm-ink-soft transition-colors hover:bg-adm-surface-muted hover:text-adm-ink"
          >
            <Settings2 className="size-3.5" strokeWidth={1.8} aria-hidden="true" />
            Notification settings
          </Link>
        </div>
      ) : null}
    </div>
  );
}
