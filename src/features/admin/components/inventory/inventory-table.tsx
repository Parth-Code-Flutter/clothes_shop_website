"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useTransition, type ReactNode } from "react";
import { Boxes, Loader2 } from "lucide-react";
import { saveStockAction } from "@/features/admin/inventory/actions";
import { useToast } from "@/features/admin/components/admin-toast";
import { buttonClass } from "@/features/admin/components/ui";
import { cn } from "@/lib/utils";

export type InventoryRow = {
  id: string;
  name: string;
  sku: string;
  image: string;
  categoryName: string;
  sizes: string[];
  stock: Record<string, number>;
  sold7d: Record<string, number>;
  sold7dTotal: number;
  coverDays: number | null;
};

const keyOf = (id: string, size: string) => `${id}:${size}`;

function Cover({ days }: { days: number | null }) {
  if (days === null) return <span className="text-adm-ink-faint" title="No sales in the last 7 days">—</span>;
  const label = days === 0 ? "Sold out" : days > 90 ? "90+ days" : `${days} day${days === 1 ? "" : "s"}`;
  return (
    <span
      title="How long the fastest-selling size lasts at this week's pace"
      className={cn("tabular-nums", days < 7 ? "font-medium text-adm-danger" : days < 14 ? "font-medium text-adm-warning" : "text-adm-ink-soft")}
    >
      {label}
    </span>
  );
}

function SizeInput({
  size,
  value,
  original,
  sold,
  threshold,
  onChange,
}: {
  size: string;
  value: string;
  original: number;
  sold: number;
  threshold: number;
  onChange: (value: string) => void;
}) {
  const level = value === "" ? Number.NaN : Number(value);
  const invalid = !Number.isInteger(level) || level < 0;
  const dirty = !invalid && level !== original;
  return (
    <label className="flex w-14 flex-col items-center gap-1">
      <span className="text-[10.5px] font-semibold text-adm-ink-faint" title={`${sold} sold in 7 days`}>
        {size}
      </span>
      <input
        type="number"
        inputMode="numeric"
        min={0}
        max={99999}
        value={value}
        aria-label={`Stock for size ${size}`}
        aria-invalid={invalid || undefined}
        onChange={(event) => onChange(event.target.value)}
        onFocus={(event) => event.target.select()}
        className={cn(
          "h-8 w-full rounded-md border text-center text-[13px] font-medium tabular-nums outline-none transition-colors [appearance:textfield] focus:border-adm-accent focus:ring-3 focus:ring-adm-accent/15 [&::-webkit-inner-spin-button]:appearance-none",
          invalid
            ? "border-adm-danger bg-adm-danger-soft text-adm-danger"
            : dirty
              ? "border-adm-accent bg-adm-accent-soft text-adm-accent"
              : level === 0
                ? "border-adm-danger/30 bg-adm-danger-soft text-adm-danger"
                : level <= threshold
                  ? "border-adm-warning/30 bg-adm-warning-soft text-adm-warning"
                  : "border-adm-line bg-adm-surface text-adm-ink hover:border-adm-line-strong",
        )}
      />
    </label>
  );
}

export function InventoryTable({ rows, threshold, emptyAction }: { rows: InventoryRow[]; threshold: number; emptyAction: ReactNode }) {
  /** Values accepted by the last save; they stand in for the server until stock is persisted. */
  const [saved, setSaved] = useState<Record<string, number>>({});
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [toast, showToast] = useToast();

  const originalOf = (row: InventoryRow, size: string) => saved[keyOf(row.id, size)] ?? row.stock[size] ?? 0;
  const known = new Map(rows.flatMap((row) => row.sizes.map((size) => [keyOf(row.id, size), originalOf(row, size)] as const)));

  const changes = Object.entries(edits).filter(([key, value]) => {
    const original = known.get(key) ?? saved[key];
    return value !== "" && Number(value) !== original;
  });
  const invalid = Object.values(edits).some((value) => value === "" || !Number.isInteger(Number(value)) || Number(value) < 0);

  useEffect(() => {
    if (changes.length === 0) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [changes.length]);

  const setValue = (key: string, value: string) => {
    setError(null);
    setEdits((current) => ({ ...current, [key]: value }));
  };

  const save = () => {
    if (invalid) {
      setError("Fix the highlighted sizes first: whole numbers, 0 or more.");
      return;
    }
    const payload = changes.map(([key, value]) => {
      const split = key.lastIndexOf(":");
      return { productId: key.slice(0, split), size: key.slice(split + 1), stock: Number(value) };
    });
    startTransition(async () => {
      const result = await saveStockAction(payload);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setSaved((current) => ({ ...current, ...Object.fromEntries(payload.map((change) => [keyOf(change.productId, change.size), change.stock])) }));
      setEdits({});
      showToast(result.message, result.persisted ? "success" : "info");
    });
  };

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center px-6 py-16 text-center">
        <span className="inline-flex size-11 items-center justify-center rounded-xl bg-adm-surface-muted text-adm-ink-faint">
          <Boxes className="size-5" strokeWidth={1.7} aria-hidden="true" />
        </span>
        <p className="mt-4 text-[14px] font-medium">Nothing here</p>
        <p className="mt-1 text-[13px] text-adm-ink-faint">Try another tab or search, or clear the filters.</p>
        <div className="mt-4">{emptyAction}</div>
      </div>
    );
  }

  const editors = (row: InventoryRow) => (
    <div className="flex flex-wrap gap-1.5">
      {row.sizes.map((size) => {
        const key = keyOf(row.id, size);
        const original = originalOf(row, size);
        return (
          <SizeInput
            key={size}
            size={size}
            value={edits[key] ?? String(original)}
            original={original}
            sold={row.sold7d[size] ?? 0}
            threshold={threshold}
            onChange={(value) => setValue(key, value)}
          />
        );
      })}
    </div>
  );

  const total = (row: InventoryRow) =>
    row.sizes.reduce((sum, size) => {
      const value = Number(edits[keyOf(row.id, size)] ?? originalOf(row, size));
      return sum + (Number.isFinite(value) ? value : 0);
    }, 0);

  return (
    <>
      <div className="hidden md:block">
        <table className="w-full text-left text-[13.5px]">
          <thead>
            <tr className="border-b border-adm-line text-[12px] text-adm-ink-faint">
              <th scope="col" className="py-2.5 pr-3 pl-5 font-medium">Product</th>
              <th scope="col" className="px-3 py-2.5 font-medium">Stock by size</th>
              <th scope="col" className="px-3 py-2.5 text-right font-medium">Total</th>
              <th scope="col" className="hidden px-3 py-2.5 text-right font-medium lg:table-cell">Sold, 7 days</th>
              <th scope="col" className="py-2.5 pr-5 pl-3 text-right font-medium">Lasts</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-adm-line">
            {rows.map((row) => (
              <tr key={row.id} className="transition-colors hover:bg-adm-surface-muted/40">
                <td className="py-3 pr-3 pl-5">
                  <Link href={`/admin/products/${row.id}`} className="group flex items-center gap-3">
                    <span className="relative size-11 shrink-0 overflow-hidden rounded-lg border border-adm-line bg-adm-surface-muted">
                      <Image src={row.image} alt="" fill sizes="44px" className="object-cover" />
                    </span>
                    <span className="min-w-0">
                      <span className="block max-w-[260px] truncate font-medium text-adm-ink group-hover:text-adm-accent">{row.name}</span>
                      <span className="block text-[12px] text-adm-ink-faint">
                        {row.sku} · {row.categoryName}
                      </span>
                    </span>
                  </Link>
                </td>
                <td className="px-3 py-2.5">{editors(row)}</td>
                <td className="px-3 py-3 text-right font-medium tabular-nums">{total(row)}</td>
                <td className="hidden px-3 py-3 text-right text-adm-ink-soft tabular-nums lg:table-cell">{row.sold7dTotal}</td>
                <td className="py-3 pr-5 pl-3 text-right whitespace-nowrap">
                  <Cover days={row.coverDays} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="divide-y divide-adm-line md:hidden">
        {rows.map((row) => (
          <li key={row.id} className="flex flex-col gap-3 px-4 py-4">
            <Link href={`/admin/products/${row.id}`} className="flex items-center gap-3">
              <span className="relative size-12 shrink-0 overflow-hidden rounded-lg border border-adm-line bg-adm-surface-muted">
                <Image src={row.image} alt="" fill sizes="48px" className="object-cover" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[14px] font-medium">{row.name}</span>
                <span className="block text-[12px] text-adm-ink-faint">
                  {total(row)} in stock · {row.sold7dTotal} sold this week · lasts <Cover days={row.coverDays} />
                </span>
              </span>
            </Link>
            {editors(row)}
          </li>
        ))}
      </ul>

      {changes.length > 0 || error ? (
        <div className="pointer-events-none fixed inset-x-0 bottom-5 z-[60] flex justify-center px-4">
          <div
            role="region"
            aria-label="Unsaved stock changes"
            className="adm-rise pointer-events-auto flex max-w-xl flex-wrap items-center gap-3 rounded-xl border border-adm-line bg-adm-surface py-2 pr-2 pl-4 text-[13px] shadow-[0_18px_50px_-18px_rgb(0_0_0/0.45)]"
          >
            <p className={cn("min-w-0 flex-1", error ? "text-adm-danger" : "text-adm-ink")}>
              {error ?? `${changes.length} unsaved change${changes.length === 1 ? "" : "s"}`}
            </p>
            <button type="button" disabled={pending} onClick={() => {
                setEdits({});
                setError(null);
              }} className={cn(buttonClass.ghost, "h-8")}>
              Discard
            </button>
            <button type="button" disabled={pending || changes.length === 0} onClick={save} className={cn(buttonClass.primary, "h-8")}>
              {pending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
              Save stock
            </button>
          </div>
        </div>
      ) : null}
      {toast}
    </>
  );
}
