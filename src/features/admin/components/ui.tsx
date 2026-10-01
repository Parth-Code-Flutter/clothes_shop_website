import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

/** Shared admin primitives so every module looks like the dashboard. */

export const TILE_CLASS =
  "rounded-[14px] border border-adm-line bg-adm-surface shadow-[0_1px_2px_rgb(0_0_0/0.04),0_1px_0_rgb(255_255_255/0.03)_inset]";

const FOCUS = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-adm-accent";

export const buttonClass = {
  primary: cn(
    "inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-adm-accent px-3.5 text-[13px] font-medium text-adm-accent-ink shadow-[0_1px_2px_rgb(0_0_0/0.12),inset_0_1px_0_rgb(255_255_255/0.15)] transition-[filter,opacity] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60",
    FOCUS,
  ),
  secondary: cn(
    "inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-adm-line bg-adm-surface px-3.5 text-[13px] font-medium text-adm-ink shadow-[0_1px_2px_rgb(0_0_0/0.04)] transition-colors hover:bg-adm-surface-muted disabled:cursor-not-allowed disabled:opacity-60",
    FOCUS,
  ),
  ghost: cn(
    "inline-flex h-9 items-center justify-center gap-2 rounded-lg px-3 text-[13px] font-medium text-adm-ink-soft transition-colors hover:bg-adm-surface-muted hover:text-adm-ink disabled:cursor-not-allowed disabled:opacity-50",
    FOCUS,
  ),
  danger: cn(
    "inline-flex h-9 items-center justify-center gap-2 rounded-lg px-3 text-[13px] font-medium text-adm-danger transition-colors hover:bg-adm-danger-soft disabled:cursor-not-allowed disabled:opacity-50",
    FOCUS,
  ),
};

export const inputClass =
  "h-9 w-full rounded-lg border border-adm-line bg-adm-surface px-3 text-[13.5px] text-adm-ink shadow-[0_1px_2px_rgb(0_0_0/0.03)] transition-colors outline-none placeholder:text-adm-ink-faint hover:border-adm-line-strong focus:border-adm-accent focus:ring-3 focus:ring-adm-accent/15 aria-invalid:border-adm-danger aria-invalid:focus:ring-adm-danger/15";

export function PageHeader({
  title,
  description,
  actions,
  back,
  meta,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  back?: { href: string; label: string };
  meta?: ReactNode;
}) {
  return (
    <header className="adm-rise flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {back ? (
          <Link
            href={back.href}
            className="mb-2 inline-flex items-center gap-1 text-[12.5px] font-medium text-adm-ink-faint transition-colors hover:text-adm-ink"
          >
            <ChevronLeft className="size-3.5" strokeWidth={2} aria-hidden="true" />
            {back.label}
          </Link>
        ) : null}
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="truncate text-[24px] leading-tight font-semibold tracking-[-0.025em]">{title}</h1>
          {meta}
        </div>
        {description ? <p className="mt-1 text-[13px] text-adm-ink-soft">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}

export function Field({ label, htmlFor, hint, error, children, className }: { label: string; htmlFor: string; hint?: string; error?: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={htmlFor} className="text-[12.5px] font-medium text-adm-ink">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} className="text-[12px] text-adm-danger">
          {error}
        </p>
      ) : hint ? (
        <p className="text-[12px] text-adm-ink-faint">{hint}</p>
      ) : null}
    </div>
  );
}

export function PageLink({ href, label, children }: { href: string | null; label: string; children: ReactNode }) {
  const className = "inline-flex size-8 items-center justify-center rounded-lg border border-adm-line bg-adm-surface";
  if (!href) {
    return (
      <span aria-disabled="true" aria-label={label} className={cn(className, "opacity-40")}>
        {children}
      </span>
    );
  }
  return (
    <Link href={href} scroll={false} aria-label={label} className={cn(className, "text-adm-ink transition-colors hover:bg-adm-surface-muted")}>
      {children}
    </Link>
  );
}

export function Card({ title, description, action, children, className }: { title?: string; description?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn(TILE_CLASS, className)}>
      {title ? (
        <header className="flex items-start justify-between gap-4 px-5 pt-5 pb-1">
          <div className="min-w-0">
            <h2 className="text-[14px] leading-tight font-semibold">{title}</h2>
            {description ? <p className="mt-1 text-[12.5px] text-adm-ink-faint">{description}</p> : null}
          </div>
          {action}
        </header>
      ) : null}
      <div className="p-5">{children}</div>
    </section>
  );
}
