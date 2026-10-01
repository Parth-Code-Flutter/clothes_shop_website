import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import type { AnalyticsData, Share, Stat } from "@/features/admin/data/analytics";
import { Panel } from "@/features/admin/components/dashboard/panels";
import { TILE_CLASS } from "@/features/admin/components/ui";
import { formatMoney, formatNumber, formatPercent, percentChange } from "@/features/admin/lib/format";
import { cn } from "@/lib/utils";

export function StatTile({
  label,
  value,
  stat,
  hint,
  delay = 0,
}: {
  label: string;
  value: string;
  stat?: Stat;
  hint?: string;
  delay?: number;
}) {
  const change = stat && stat.previous !== null ? percentChange(stat.value, stat.previous) : null;
  const up = (change ?? 0) >= 0;
  return (
    <div className={cn("adm-rise flex flex-col px-5 py-4", TILE_CLASS)} style={{ "--adm-delay": `${delay}ms` } as CSSProperties}>
      <p className="text-[12.5px] font-medium text-adm-ink-soft">{label}</p>
      <p className="mt-1.5 text-[22px] leading-tight font-semibold tracking-[-0.02em] tabular-nums">{value}</p>
      {change !== null ? (
        <p className={cn("mt-1 inline-flex items-center gap-0.5 text-[12px] font-medium tabular-nums", up ? "text-adm-success" : "text-adm-danger")}>
          {up ? <ArrowUpRight className="size-3.5" strokeWidth={2} aria-hidden="true" /> : <ArrowDownRight className="size-3.5" strokeWidth={2} aria-hidden="true" />}
          {Math.abs(change).toFixed(1)}%<span className="ml-1 font-normal text-adm-ink-faint">vs prev.</span>
        </p>
      ) : (
        <p className="mt-1 text-[12px] text-adm-ink-faint">{hint ?? "\u00a0"}</p>
      )}
    </div>
  );
}

function Bar({ share, muted = false }: { share: number; muted?: boolean }) {
  return (
    <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-adm-surface-muted">
      <span className={cn("adm-grow-x block h-full rounded-full", muted ? "bg-adm-ink-faint/50" : "bg-adm-accent")} style={{ width: `${Math.max(2, share * 100)}%` }} />
    </span>
  );
}

export function SourcesPanel({ sources, days, delay }: { sources: AnalyticsData["sources"]; days: number; delay?: number }) {
  const top = sources[0]?.share || 1;
  return (
    <Panel title="Where visitors come from" description={`Store visits by source · last ${days} days`} delay={delay}>
      <table className="w-full text-[13px]">
        <thead>
          <tr className="text-[11px] font-semibold tracking-[0.06em] text-adm-ink-faint uppercase">
            <th scope="col" className="px-5 pb-2 text-left font-semibold">Source</th>
            <th scope="col" className="px-2 pb-2 text-right font-semibold">Visits</th>
            <th scope="col" className="px-5 pb-2 text-right font-semibold">Converts</th>
          </tr>
        </thead>
        <tbody>
          {sources.map((source) => (
            <tr key={source.label}>
              <td className="px-5 py-2">
                <span className="flex items-center gap-3">
                  <span className="w-24 shrink-0 text-adm-ink-soft">{source.label}</span>
                  <Bar share={source.share / top} />
                </span>
              </td>
              <td className="px-2 py-2 text-right font-medium tabular-nums">{formatNumber(source.sessions, { compact: source.sessions >= 100_000 })}</td>
              <td className="px-5 py-2 text-right text-adm-ink-soft tabular-nums">{formatPercent(source.conversion * 100, 1)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="px-5 pt-2 pb-5 text-[12px] text-adm-ink-faint">Illustrative until store analytics is connected.</p>
    </Panel>
  );
}

export function TopProductsTable({ products, days, delay }: { products: AnalyticsData["topProducts"]; days: number; delay?: number }) {
  const top = products[0]?.units || 1;
  return (
    <Panel title="Best sellers" description={`Units sold · last ${days} days`} delay={delay}>
      <table className="w-full text-[13px]">
        <thead className="sr-only sm:not-sr-only">
          <tr className="text-[11px] font-semibold tracking-[0.06em] text-adm-ink-faint uppercase">
            <th scope="col" className="px-5 pb-2 text-left font-semibold">Product</th>
            <th scope="col" className="px-2 pb-2 text-right font-semibold">Units</th>
            <th scope="col" className="hidden px-2 pb-2 text-right font-semibold sm:table-cell">Revenue</th>
            <th scope="col" className="hidden px-5 pb-2 text-right font-semibold md:table-cell">Share</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-adm-line border-t border-adm-line">
          {products.map((product, index) => (
            <tr key={product.id} className="group relative transition-colors hover:bg-adm-surface-muted/50">
              <td className="px-5 py-2.5">
                <span className="flex items-center gap-3">
                  <span className="w-4 shrink-0 text-[12px] font-semibold text-adm-ink-faint tabular-nums">{index + 1}</span>
                  <span className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-adm-surface-muted">
                    <Image src={product.image} alt="" fill sizes="40px" className="object-cover" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="block truncate font-medium group-hover:text-adm-accent focus-visible:outline-none after:absolute after:inset-0"
                    >
                      {product.name}
                    </Link>
                    <span className="mt-1 flex items-center gap-2">
                      <span className="text-[12px] text-adm-ink-faint">{product.category}</span>
                      <Bar share={product.units / top} />
                    </span>
                  </span>
                </span>
              </td>
              <td className="px-2 py-2.5 text-right font-medium tabular-nums">{formatNumber(product.units)}</td>
              <td className="hidden px-2 py-2.5 text-right tabular-nums sm:table-cell">{formatMoney(product.revenuePaise, { compact: product.revenuePaise >= 1_00_00_000 })}</td>
              <td className="hidden px-5 py-2.5 text-right text-adm-ink-soft tabular-nums md:table-cell">{formatPercent(product.share * 100, 1)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Panel>
  );
}

export function WeekdayPanel({ weekdays, window, delay }: { weekdays: AnalyticsData["weekdays"]; window: number; delay?: number }) {
  const top = Math.max(...weekdays.map((day) => day.averagePaise), 1);
  const best = weekdays.reduce((winner, day) => (day.averagePaise > winner.averagePaise ? day : winner), weekdays[0]);
  return (
    <Panel title="Best days to sell" description={`Average revenue per weekday · last ${Math.round(window / 7)} weeks`} delay={delay}>
      <div className="flex h-full flex-col px-5 pb-5">
        <div className="flex h-44 items-end gap-2" role="img" aria-label={weekdays.map((day) => `${day.label} ${formatMoney(day.averagePaise)}`).join(", ")}>
          {weekdays.map((day) => {
            const isBest = day === best;
            return (
              <div key={day.label} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
                <span className={cn("text-[11px] tabular-nums", isBest ? "font-semibold text-adm-ink" : "text-adm-ink-faint")}>
                  {formatMoney(day.averagePaise, { compact: true })}
                </span>
                <span
                  className={cn("adm-grow-y w-full max-w-10 rounded-t-md", isBest ? "bg-adm-accent" : "bg-adm-accent/30")}
                  style={{ height: `${(day.averagePaise / top) * 100}%` }}
                />
              </div>
            );
          })}
        </div>
        <div className="mt-2 flex gap-2 border-t border-adm-line pt-2" aria-hidden="true">
          {weekdays.map((day) => (
            <span key={day.label} className={cn("flex-1 text-center text-[11.5px]", day === best ? "font-semibold text-adm-ink" : "text-adm-ink-faint")}>
              {day.label}
            </span>
          ))}
        </div>
        <p className="mt-4 text-[12.5px] text-adm-ink-soft">
          <span className="font-medium text-adm-ink">{best.label}</span> is the strongest day, with about {Math.round(best.averageOrders)} orders. Plan drops and offers around it.
        </p>
      </div>
    </Panel>
  );
}

export function ShareListPanel({
  title,
  description,
  entries,
  format,
  empty,
  footer,
  delay,
}: {
  title: string;
  description: string;
  entries: Share[];
  format: (entry: Share) => string;
  empty: string;
  footer?: string;
  delay?: number;
}) {
  const top = entries[0]?.share || 1;
  return (
    <Panel title={title} description={description} delay={delay}>
      {entries.length ? (
        <ul className="flex flex-col gap-3 px-5 pb-5">
          {entries.map((entry) => (
            <li key={entry.label}>
              <div className="flex items-baseline justify-between gap-3 text-[13px]">
                <span className="truncate text-adm-ink-soft">{entry.label}</span>
                <span className="shrink-0 font-medium tabular-nums">
                  {format(entry)}
                  <span className="ml-2 font-normal text-adm-ink-faint">{formatPercent(entry.share * 100, 0)}</span>
                </span>
              </div>
              <div className="mt-1.5 flex items-center gap-3">
                <Bar share={entry.share / top} />
                {entry.detail ? <span className="w-16 text-right text-[11.5px] text-adm-ink-faint tabular-nums">{entry.detail}</span> : null}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="px-5 pb-5 text-[13px] text-adm-ink-faint">{empty}</p>
      )}
      {footer ? <p className="border-t border-adm-line px-5 py-3 text-[12px] text-adm-ink-faint">{footer}</p> : null}
    </Panel>
  );
}
