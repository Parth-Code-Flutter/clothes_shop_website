"use client";

import { useId, useMemo, useState, type CSSProperties, type PointerEvent } from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import type { DayPoint } from "@/features/admin/data/dashboard";
import { AnimatedValue, formatValue, type ValueFormat } from "@/features/admin/components/dashboard/animated-value";
import { TILE_CLASS } from "@/features/admin/components/ui";
import { formatMoney, formatNumber, formatPercent, percentChange } from "@/features/admin/lib/format";
import { cn } from "@/lib/utils";

const RANGES = [
  { days: 7, label: "7D" },
  { days: 30, label: "30D" },
  { days: 90, label: "90D" },
] as const;

type Metric = "revenue" | "orders" | "aov" | "conversion";

const METRICS: Record<Metric, { label: string; format: ValueFormat; pick: (point: DayPoint) => number }> = {
  revenue: { label: "Net revenue", format: "money", pick: (point) => point.revenuePaise },
  orders: { label: "Orders", format: "number", pick: (point) => point.orders },
  aov: { label: "Avg. order value", format: "money", pick: (point) => (point.orders ? point.revenuePaise / point.orders : 0) },
  conversion: { label: "Conversion", format: "percent", pick: (point) => (point.sessions ? (point.orders / point.sessions) * 100 : 0) },
};

function sum(points: DayPoint[], pick: (point: DayPoint) => number) {
  return points.reduce((total, point) => total + pick(point), 0);
}

function totals(points: DayPoint[]): Record<Metric, number> {
  const revenue = sum(points, (point) => point.revenuePaise);
  const orders = sum(points, (point) => point.orders);
  const sessions = sum(points, (point) => point.sessions);
  return {
    revenue,
    orders,
    aov: orders ? revenue / orders : 0,
    conversion: sessions ? (orders / sessions) * 100 : 0,
  };
}

/** Pass `days` to lock the range (the page controls it); otherwise the tile shows its own 7/30/90 switch. */
export function PerformanceTile({ series, delay = 0, days: fixedDays }: { series: DayPoint[]; delay?: number; days?: number }) {
  const [ownDays, setDays] = useState<number>(30);
  const days = fixedDays ?? ownDays;
  const [metric, setMetric] = useState<Metric>("revenue");

  const { current, previous, now, before } = useMemo(() => {
    const current = series.slice(-days);
    const previous = series.slice(-days * 2, -days);
    return { current, previous, now: totals(current), before: totals(previous) };
  }, [series, days]);

  return (
    <section aria-label="Performance" className={cn("adm-rise flex h-full flex-col", TILE_CLASS)} style={{ "--adm-delay": `${delay}ms` } as CSSProperties}>
      <header className="flex flex-wrap items-start justify-between gap-3 px-5 pt-5">
        <div>
          <h2 className="text-[14px] leading-tight font-semibold">Performance</h2>
          <p className="mt-1 text-[12.5px] text-adm-ink-faint">
            Last {days} days, compared with the {days} days before
          </p>
        </div>
        <div role="group" aria-label="Date range" className={cn("inline-flex rounded-lg bg-adm-surface-muted p-0.5", fixedDays && "hidden")}>
          {RANGES.map((range) => (
            <button
              key={range.days}
              type="button"
              aria-pressed={days === range.days}
              onClick={() => setDays(range.days)}
              className={cn(
                "h-7 rounded-md px-3 text-[12px] font-medium transition-all focus-visible:outline-2 focus-visible:outline-adm-accent",
                days === range.days ? "bg-adm-surface text-adm-ink shadow-[0_1px_2px_rgb(0_0_0/0.08)]" : "text-adm-ink-faint hover:text-adm-ink",
              )}
            >
              {range.label}
            </button>
          ))}
        </div>
      </header>

      <div role="tablist" aria-label="Metric" className="mt-4 grid grid-cols-2 border-y border-adm-line lg:grid-cols-4">
        {(Object.keys(METRICS) as Metric[]).map((key, index) => {
          const meta = METRICS[key];
          const change = percentChange(now[key], before[key]);
          const up = (change ?? 0) >= 0;
          const selected = metric === key;
          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setMetric(key)}
              className={cn(
                "group relative px-5 py-4 text-left transition-colors focus-visible:z-10 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-adm-accent",
                index % 2 === 0 && "border-r border-adm-line",
                index < 2 && "max-lg:border-b max-lg:border-adm-line",
                index === 1 && "lg:border-r lg:border-adm-line",
                selected ? "bg-adm-surface-muted/60" : "hover:bg-adm-surface-muted/40",
              )}
            >
              <span
                aria-hidden="true"
                className={cn("absolute inset-x-0 bottom-0 h-0.5 bg-adm-accent transition-opacity", selected ? "opacity-100" : "opacity-0")}
              />
              <span className={cn("block text-[12.5px] font-medium", selected ? "text-adm-ink" : "text-adm-ink-soft")}>{meta.label}</span>
              <AnimatedValue
                value={now[key]}
                format={key === "revenue" && now.revenue >= 1_00_00_000 ? "moneyCompact" : meta.format}
                className="mt-1.5 block text-[22px] leading-tight font-semibold tracking-[-0.02em] tabular-nums"
              />
              {change === null ? (
                <span className="mt-1 block text-[12px] text-adm-ink-faint">No baseline</span>
              ) : (
                <span className={cn("mt-1 inline-flex items-center gap-0.5 text-[12px] font-medium tabular-nums", up ? "text-adm-success" : "text-adm-danger")}>
                  {up ? <ArrowUpRight className="size-3.5" strokeWidth={2} aria-hidden="true" /> : <ArrowDownRight className="size-3.5" strokeWidth={2} aria-hidden="true" />}
                  {Math.abs(change).toFixed(1)}%
                  <span className="ml-1 font-normal text-adm-ink-faint">vs prev.</span>
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex flex-1 flex-col px-3 pt-5 pb-4 sm:px-5">
        <div className="mb-4 flex items-center justify-end gap-4 pr-1 text-[12px] text-adm-ink-soft">
          <span className="flex items-center gap-2">
            <span className="h-[2px] w-4 rounded-full bg-adm-accent" /> This period
          </span>
          <span className="flex items-center gap-2">
            <span className="w-4 border-t border-dashed border-adm-line-strong" /> Previous
          </span>
        </div>
        <TrendChart current={current} previous={previous} metric={metric} />
      </div>
    </section>
  );
}

const CHART_W = 1000;
const CHART_H = 260;

function niceCeiling(value: number) {
  if (value <= 0) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const normalized = value / magnitude;
  const step = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 2.5 ? 2.5 : normalized <= 5 ? 5 : 10;
  return step * magnitude;
}

function smoothPath(points: { x: number; y: number }[]) {
  if (!points.length) return "";
  let path = `M${points[0].x},${points[0].y}`;
  for (let index = 0; index < points.length - 1; index += 1) {
    const p0 = points[index - 1] ?? points[index];
    const p1 = points[index];
    const p2 = points[index + 1];
    const p3 = points[index + 2] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    path += ` C${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
  }
  return path;
}

function TrendChart({ current, previous, metric }: { current: DayPoint[]; previous: DayPoint[]; metric: Metric }) {
  const gradientId = useId();
  const [hover, setHover] = useState<number | null>(null);
  const { pick, label } = METRICS[metric];
  const format = (value: number, compact = false) => {
    if (metric === "conversion") return formatPercent(value, compact ? 1 : 2);
    if (metric === "orders") return formatNumber(Math.round(value));
    return compact ? formatMoney(value, { compact: true }) : formatValue(value, "money");
  };

  const values = current.map(pick);
  const prevValues = previous.map(pick);
  const ceiling = niceCeiling(Math.max(...values, ...prevValues, 1) * 1.08);
  const count = values.length;
  const toPoint = (value: number, index: number, length: number) => ({
    x: length > 1 ? (index / (length - 1)) * CHART_W : CHART_W / 2,
    y: CHART_H - (value / ceiling) * CHART_H,
  });
  const linePoints = values.map((value, index) => toPoint(value, index, count));
  const prevPoints = prevValues.map((value, index) => toPoint(value, index, prevValues.length));
  const line = smoothPath(linePoints);
  const area = `${line} L${CHART_W},${CHART_H} L0,${CHART_H} Z`;
  const ticks = [1, 0.75, 0.5, 0.25, 0];
  const labelEvery = Math.max(1, Math.ceil(count / 6));

  function onMove(event: PointerEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    setHover(Math.round(ratio * (count - 1)));
  }

  const active = hover !== null ? { point: linePoints[hover], day: current[hover], prev: prevValues[hover] } : null;
  return (
    <figure aria-label={`${label} per day, last ${count} days`} className="flex gap-3">
      <div className="relative w-12 shrink-0 sm:w-14" style={{ height: CHART_H }} aria-hidden="true">
        {ticks.map((tick) => (
          <span
            key={tick}
            className="absolute right-0 -translate-y-1/2 text-[11px] text-adm-ink-faint tabular-nums"
            style={{ top: `${(1 - tick) * 100}%` }}
          >
            {format(ceiling * tick, true)}
          </span>
        ))}
      </div>

      <div className="min-w-0 flex-1">
        <div
          className="relative touch-pan-y"
          style={{ height: CHART_H }}
          onPointerMove={onMove}
          onPointerDown={onMove}
          onPointerLeave={() => setHover(null)}
        >
          <svg viewBox={`0 0 ${CHART_W} ${CHART_H}`} preserveAspectRatio="none" className="absolute inset-0 size-full overflow-visible" aria-hidden="true">
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--adm-accent)" stopOpacity={0.22} />
                <stop offset="100%" stopColor="var(--adm-accent)" stopOpacity={0} />
              </linearGradient>
            </defs>
            {ticks.map((tick) => (
              <line
                key={tick}
                x1={0}
                x2={CHART_W}
                y1={(1 - tick) * CHART_H}
                y2={(1 - tick) * CHART_H}
                stroke="var(--adm-line)"
                strokeWidth={1}
                vectorEffect="non-scaling-stroke"
              />
            ))}
            {prevPoints.length > 1 ? (
              <path
                d={smoothPath(prevPoints)}
                fill="none"
                stroke="var(--adm-line-strong)"
                strokeWidth={1.5}
                strokeDasharray="5 5"
                vectorEffect="non-scaling-stroke"
              />
            ) : null}
            <path d={area} fill={`url(#${gradientId})`} />
            <path
              d={line}
              fill="none"
              stroke="var(--adm-accent)"
              strokeWidth={2}
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
              style={{ filter: "drop-shadow(0 6px 10px color-mix(in oklab, var(--adm-accent) 35%, transparent))" }}
            />
          </svg>

          {active ? (
            <>
              <span
                aria-hidden="true"
                className="pointer-events-none absolute top-0 bottom-0 w-px bg-adm-line-strong"
                style={{ left: `${(active.point.x / CHART_W) * 100}%` }}
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-adm-surface bg-adm-accent shadow"
                style={{ left: `${(active.point.x / CHART_W) * 100}%`, top: `${(active.point.y / CHART_H) * 100}%` }}
              />
              <div
                role="status"
                className={cn(
                  "pointer-events-none absolute top-2 z-10 w-44 rounded-xl border border-adm-line bg-adm-surface px-3.5 py-3 shadow-[0_18px_40px_-18px_rgb(0_0_0/0.4)]",
                  active.point.x / CHART_W > 0.6 ? "-translate-x-[calc(100%+14px)]" : "translate-x-3.5",
                )}
                style={{ left: `${(active.point.x / CHART_W) * 100}%` }}
              >
                <p className="text-[11px] font-medium tracking-[0.06em] text-adm-ink-faint uppercase">{active.day.label}</p>
                <p className="mt-1 font-adm-display text-base font-semibold tabular-nums">{format(pick(active.day))}</p>
                <p className="mt-1 text-[12px] text-adm-ink-soft">
                  {metric === "revenue" ? `${active.day.orders} orders` : `${formatMoney(active.day.revenuePaise)} · ${active.day.orders} orders`}
                </p>
                {active.prev !== undefined ? (
                  <p className="mt-1.5 border-t border-adm-line pt-1.5 text-[11px] text-adm-ink-faint tabular-nums">
                    Previous: {format(active.prev)}
                  </p>
                ) : null}
              </div>
            </>
          ) : null}
        </div>

        <div className="relative mt-3 h-4" aria-hidden="true">
          {current.map((day, index) =>
            index % labelEvery === 0 || index === count - 1 ? (
              <span
                key={day.iso}
                className={cn(
                  "absolute text-[11px] whitespace-nowrap text-adm-ink-faint",
                  index === 0 ? "" : index === count - 1 ? "-translate-x-full" : "-translate-x-1/2",
                  index !== count - 1 && count - 1 - index < labelEvery / 2 ? "hidden" : "",
                )}
                style={{ left: `${(linePoints[index].x / CHART_W) * 100}%` }}
              >
                {day.label}
              </span>
            ) : null,
          )}
        </div>
      </div>
    </figure>
  );
}
