"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Copy, TicketPercent } from "lucide-react";
import { setDiscountEnabledAction } from "@/features/admin/discounts/actions";
import { useToast } from "@/features/admin/components/admin-toast";
import { formatMoney } from "@/features/admin/lib/format";
import { DISCOUNT_STATUS_META, type DiscountStatus } from "@/features/admin/lib/discount-rules";
import { cn } from "@/lib/utils";

export type DiscountRow = {
  id: string;
  code: string;
  headline: string;
  scope: string;
  status: DiscountStatus;
  /** What the status becomes when the switch is turned on. */
  statusWhenOn: DiscountStatus;
  enabled: boolean;
  uses: number;
  usageLimit: number | null;
  dateLabel: string;
  revenuePaise: number;
};

export function DiscountStatusBadge({ status }: { status: DiscountStatus }) {
  const meta = DISCOUNT_STATUS_META[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[12px] font-medium whitespace-nowrap", meta.className)}>
      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      {meta.label}
    </span>
  );
}

function Usage({ uses, limit }: { uses: number; limit: number | null }) {
  return (
    <span className="flex min-w-24 flex-col gap-1">
      <span className="text-[13px] tabular-nums">
        {uses.toLocaleString("en-IN")}
        <span className="text-adm-ink-faint">{limit ? ` / ${limit.toLocaleString("en-IN")}` : " uses"}</span>
      </span>
      {limit ? (
        <span className="h-1 w-full overflow-hidden rounded-full bg-adm-surface-muted">
          <span className={cn("block h-full rounded-full", uses >= limit ? "bg-adm-warning" : "bg-adm-accent")} style={{ width: `${Math.min(100, (uses / limit) * 100)}%` }} />
        </span>
      ) : null}
    </span>
  );
}

export function DiscountsTable({ rows }: { rows: DiscountRow[] }) {
  const [enabled, setEnabled] = useState<Record<string, boolean>>(() => Object.fromEntries(rows.map((row) => [row.id, row.enabled])));
  const [pending, startTransition] = useTransition();
  const [toast, showToast] = useToast();

  const toggle = (row: DiscountRow) => {
    const next = !(enabled[row.id] ?? row.enabled);
    setEnabled((current) => ({ ...current, [row.id]: next }));
    startTransition(async () => {
      const result = await setDiscountEnabledAction(row.id, next);
      if (!result.ok) setEnabled((current) => ({ ...current, [row.id]: !next }));
      showToast(result.message, !result.ok ? "error" : result.persisted ? "success" : "info");
    });
  };

  const copy = (code: string) => {
    void navigator.clipboard?.writeText(code);
    showToast(`${code} copied.`, "success");
  };

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center px-6 py-16 text-center">
        <span className="inline-flex size-11 items-center justify-center rounded-xl bg-adm-surface-muted text-adm-ink-faint">
          <TicketPercent className="size-5" strokeWidth={1.7} aria-hidden="true" />
        </span>
        <p className="mt-4 text-[14px] font-medium">No discounts here</p>
        <p className="mt-1 text-[13px] text-adm-ink-faint">Create a code to reward first-time buyers or run a festive sale.</p>
      </div>
    );
  }

  return (
    <>
      <ul className="divide-y divide-adm-line">
        {rows.map((row) => {
          const on = enabled[row.id] ?? row.enabled;
          const status = on ? row.statusWhenOn : "disabled";
          return (
            <li key={row.id} className="group relative flex flex-wrap items-center gap-x-6 gap-y-3 px-4 py-4 transition-colors hover:bg-adm-surface-muted/40 sm:px-5">
              <div className="flex min-w-0 flex-1 basis-64 items-center gap-3">
                <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-adm-accent-soft text-adm-accent">
                  <TicketPercent className="size-5" strokeWidth={1.7} aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="flex items-center gap-2">
                    <Link
                      href={`/admin/discounts/${row.id}`}
                      className="font-mono text-[14px] font-semibold tracking-wide text-adm-ink group-hover:text-adm-accent after:absolute after:inset-0 focus-visible:outline-none"
                    >
                      {row.code}
                    </Link>
                    <button
                      type="button"
                      onClick={() => copy(row.code)}
                      aria-label={`Copy ${row.code}`}
                      className="relative z-10 inline-flex size-6 items-center justify-center rounded-md text-adm-ink-faint hover:bg-adm-surface-muted hover:text-adm-ink"
                    >
                      <Copy className="size-3.5" strokeWidth={2} aria-hidden="true" />
                    </button>
                  </span>
                  <span className="block truncate text-[12.5px] text-adm-ink-soft">
                    <span className="font-medium text-adm-ink">{row.headline}</span> · {row.scope}
                  </span>
                </span>
              </div>

              <div className="w-28">
                <DiscountStatusBadge status={status} />
                <span className="mt-1 block text-[12px] text-adm-ink-faint">{row.dateLabel}</span>
              </div>
              <Usage uses={row.uses} limit={row.usageLimit} />
              <div className="hidden w-28 text-right lg:block">
                <span className="block text-[13px] font-medium tabular-nums">{formatMoney(row.revenuePaise, { compact: true })}</span>
                <span className="block text-[12px] text-adm-ink-faint">Sales with code</span>
              </div>
              <label className="relative z-10 ml-auto flex cursor-pointer items-center gap-2">
                <span className="sr-only">{on ? `Turn off ${row.code}` : `Turn on ${row.code}`}</span>
                <input type="checkbox" checked={on} disabled={pending} onChange={() => toggle(row)} className="peer sr-only" />
                <span
                  aria-hidden="true"
                  className="relative h-5 w-9 shrink-0 rounded-full bg-adm-line-strong transition-colors peer-checked:bg-adm-accent peer-disabled:opacity-60 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-adm-accent after:absolute after:top-0.5 after:left-0.5 after:size-4 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:after:translate-x-4"
                />
              </label>
            </li>
          );
        })}
      </ul>
      {toast}
    </>
  );
}
