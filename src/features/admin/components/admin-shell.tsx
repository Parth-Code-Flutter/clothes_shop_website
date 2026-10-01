"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Bell, ChevronDown, LogOut, Menu, Search, Settings, X } from "lucide-react";
import { logoutAction } from "@/features/admin/auth/actions";
import { ADMIN_SIDEBAR_COOKIE } from "@/features/admin/config/admin-nav";
import { AdminSidebar } from "@/features/admin/components/admin-sidebar";
import { AdminThemeToggle } from "@/features/admin/components/admin-theme-toggle";
import { cn } from "@/lib/utils";

type AdminShellProps = {
  user: { name: string; email: string };
  defaultCollapsed?: boolean;
  badges?: Record<string, string>;
  children: ReactNode;
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function AdminShell({ user, defaultCollapsed = false, badges, children }: AdminShellProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  const toggleCollapsed = useCallback(() => {
    const next = !collapsed;
    setCollapsed(next);
    document.cookie = `${ADMIN_SIDEBAR_COOKIE}=${next ? "collapsed" : "expanded"}; path=/admin; max-age=31536000; samesite=lax`;
  }, [collapsed]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && !event.shiftKey && !event.altKey && event.key.toLowerCase() === "b") {
        event.preventDefault();
        toggleCollapsed();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [toggleCollapsed]);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDrawerOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [drawerOpen]);

  return (
    <div className="flex min-h-dvh flex-1">
      <aside
        className={cn(
          "sticky top-0 z-[45] hidden h-dvh shrink-0 border-r border-adm-sidebar-line transition-[width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] lg:block",
          collapsed ? "w-[76px]" : "w-[256px]",
        )}
      >
        <AdminSidebar collapsed={collapsed} onToggleCollapse={toggleCollapsed} badges={badges} />
      </aside>

      <div
        className={cn(
          "fixed inset-0 z-50 lg:hidden",
          drawerOpen ? "pointer-events-auto" : "pointer-events-none",
        )}
        aria-hidden={!drawerOpen}
      >
        <div
          onClick={() => setDrawerOpen(false)}
          className={cn("absolute inset-0 bg-black/50 transition-opacity duration-300", drawerOpen ? "opacity-100" : "opacity-0")}
        />
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Admin navigation"
          className={cn(
            "absolute inset-y-0 left-0 w-[min(86vw,300px)] shadow-2xl transition-transform duration-300 ease-out",
            drawerOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          {drawerOpen ? <AdminSidebar onNavigate={() => setDrawerOpen(false)} badges={badges} /> : null}
          <button
            type="button"
            onClick={() => setDrawerOpen(false)}
            aria-label="Close navigation"
            className="absolute top-4 right-3 inline-flex size-10 items-center justify-center rounded-full text-adm-sidebar-ink-soft hover:text-adm-sidebar-ink"
          >
            <X className="size-5" strokeWidth={1.6} />
          </button>
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-3 border-b border-adm-line bg-adm-canvas/80 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open navigation"
            className="inline-flex size-9 items-center justify-center rounded-lg border border-adm-line bg-adm-surface text-adm-ink lg:hidden"
          >
            <Menu className="size-[18px]" strokeWidth={1.6} />
          </button>
          <AdminSearch />

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <AdminThemeToggle />
            <button
              type="button"
              aria-label="Notifications, 3 unread"
              className="relative inline-flex size-9 items-center justify-center rounded-lg border border-adm-line bg-adm-surface text-adm-ink-soft transition-colors hover:text-adm-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-adm-accent"
            >
              <Bell className="size-[18px]" strokeWidth={1.6} />
              <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-adm-accent ring-2 ring-adm-surface" />
            </button>
            <ProfileMenu user={user} />
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">{children}</main>
      </div>
    </div>
  );
}

function AdminSearch() {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <label className="hidden h-9 w-full max-w-sm items-center gap-2.5 rounded-lg border border-adm-line bg-adm-surface px-3 text-adm-ink-faint transition-colors focus-within:border-adm-accent md:flex">
      <Search className="size-4 shrink-0" strokeWidth={1.6} aria-hidden="true" />
      <span className="sr-only">Search the console</span>
      <input
        ref={inputRef}
        type="search"
        placeholder="Search orders, products, customers…"
        className="h-full min-w-0 flex-1 bg-transparent text-[13px] text-adm-ink outline-none placeholder:text-adm-ink-faint"
      />
      <kbd className="hidden rounded-md border border-adm-line px-1.5 py-0.5 font-sans text-[11px] text-adm-ink-faint lg:inline">⌘K</kbd>
    </label>
  );
}

function ProfileMenu({ user }: { user: AdminShellProps["user"] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

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

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2.5 rounded-lg py-1 pr-2 pl-1 hover:bg-adm-surface-muted transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-adm-accent sm:pr-3"
      >
        <span className="inline-flex size-8 items-center justify-center rounded-full bg-adm-accent text-[12px] font-semibold text-adm-accent-ink">
          {initials(user.name)}
        </span>
        <span className="hidden text-left leading-tight sm:block">
          <span className="block text-[13px] font-medium text-adm-ink">{user.name}</span>
          <span className="block text-[11px] text-adm-ink-faint">Owner</span>
        </span>
        <ChevronDown className={cn("size-4 text-adm-ink-faint transition-transform", open && "rotate-180")} strokeWidth={1.6} />
      </button>

      {open ? (
        <div role="menu" className="absolute top-[calc(100%+8px)] right-0 w-64 overflow-hidden rounded-xl border border-adm-line bg-adm-surface shadow-[0_24px_60px_-20px_rgb(0_0_0/0.35)]">
          <div className="border-b border-adm-line px-4 py-3.5">
            <p className="text-[14px] font-medium text-adm-ink">{user.name}</p>
            <p className="truncate text-[12px] text-adm-ink-faint">{user.email}</p>
          </div>
          <div className="p-1.5">
            <span role="menuitem" aria-disabled="true" className="flex h-10 items-center gap-3 rounded-lg px-3 text-[14px] text-adm-ink-faint">
              <Settings className="size-4" strokeWidth={1.6} />
              Store settings
              <span className="ml-auto text-[10px] font-semibold tracking-[0.06em] uppercase">Soon</span>
            </span>
            <form action={logoutAction}>
              <button
                type="submit"
                role="menuitem"
                className="flex h-10 w-full items-center gap-3 rounded-lg px-3 text-[14px] text-adm-danger transition-colors hover:bg-adm-danger-soft focus-visible:outline-2 focus-visible:outline-adm-accent"
              >
                <LogOut className="size-4" strokeWidth={1.6} />
                Sign out
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
