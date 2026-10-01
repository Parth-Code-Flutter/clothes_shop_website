"use client";

import { useId, useMemo, useState, type PointerEvent } from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import type { DayPoint } from "@/features/admin/data/dashboard";
import { formatMoney, formatNumber, formatPercent, percentChange } from "@/features/admin/lib/format";
import { cn } from "@/lib/utils";

const RANGES = [
  { days: 7, label: "7D" },
  { days: 30, label: "30D" },
  { days: 90, label: "90D" },
] as const;

type Metric = "revenue" | "orders";

function sum(points: DayPoint[], pick: (point: DayPoint) => number) {
  return points.reduce((total, point) => total + pick(point), 0);
}

export function DashboardOverview({ series }: { series: DayPoint[] }) {
  const [days, setDays] = useState<number>(30);
  const [metric, setMetric] = useState<Metric>("revenue");

  const { current, previous } = useMemo(
    () => ({ current: series.slice(-days), previous: series.slice(-days * 2, -days) }),
    [series, days],
  );

  const kpis = useMemo(() => {
    const revenue = sum(current, (point) => point.revenuePaise);
    const revenuePrev = sum(previous, (point) => point.revenuePaise);
    const orders = sum(current, (point) => point.orders);
    const ordersPrev = sum(previous, (point) => point.orders);
    const sessions = sum(current, (point) => point.sessions);
    const sessionsPrev = sum(previous, (point) => point.sessions);
    const aov = orders ? revenue / orders : 0;
    const aovPrev = ordersPrev ? revenuePrev / ordersPrev : 0;
    const conversion = sessions ? (orders / sessions) * 100 : 0;
    const conversionPrev = sessionsPrev ? (ordersPrev / sessionsPrev) * 100 : 0;
    return [
      {
        label: "Net revenue",
        value: formatMoney(revenue, { compact: revenue >= 1_00_00_000 }),
        change: percentChange(revenue, revenuePrev),
        spark: current.map((point) => point.revenuePaise),
      },
      {
        label: "Orders",
        value: formatNumber(orders),
        change: percentChange(orders, ordersPrev),
        spark: current.map((point) => point.orders),
      },
      {
        label: "Average order value",
        value: formatMoney(aov),
        change: percentChange(aov, aovPrev),
        spark: current.map((point) => (point.orders ? point.revenuePaise / point.orders : 0)),
      },
      {
        label: "Conversion rate",
        value: formatPercent(conversion, 2),
        change: percentChange(conversion, conversionPrev),
        spark: current.map((point) => (point.sessions ? point.orders / point.sessions : 0)),
      },
    ];
  }, [current, previous]);

  return (
    <section aria-label="Performance overview" className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[13px] text-adm-ink-soft">
          Compared with the previous {days} days
        </p>
        <div role="group" aria-label="Date range" className="inline-flex rounded-full border border-adm-line bg-adm-surface p-1">
          {RANGES.map((range) => (
            <button
              key={range.days}
              type="button"
              aria-pressed={days === range.days}
              onClick={() => setDays(range.days)}
              className={cn(
                "h-8 rounded-full px-4 text-[12px] font-semibold tracking-[0.06em] transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-adm-accent",
                days === range.days ? "bg-adm-ink text-adm-canvas" : "text-adm-ink-soft hover:text-adm-ink",
              )}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.label} {...kpi} />
        ))}
      </div>

      <div className="rounded-2xl border border-adm-line bg-adm-surface">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-adm-line px-5 py-5 sm:px-6">
          <div>
            <h2 className="font-adm-display text-2xl font-semibold">Sales performance</h2>
            <p className="mt-1 text-[13px] text-adm-ink-soft">
              {metric === "revenue" ? "Net revenue" : "Orders placed"} per day · last {days} days
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-4 text-[12px] text-adm-ink-soft">
              <span className="flex items-center gap-2">
                <span className="h-[2px] w-4 rounded-full bg-adm-accent" /> This period
              </span>
              <span className="flex items-center gap-2">
                <span className="w-4 border-t border-dashed border-adm-line-strong" /> Previous
              </span>
            </div>
            <div role="group" aria-label="Chart metric" className="inline-flex rounded-lg border border-adm-line p-0.5">
              {(["revenue", "orders"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  aria-pressed={metric === option}
                  onClick={() => setMetric(option)}
                  className={cn(
                    "h-8 rounded-md px-3 text-[12px] font-medium capitalize transition-colors focus-visible:outline-2 focus-visible:outline-adm-accent",
                    metric === option ? "bg-adm-surface-muted text-adm-ink" : "text-adm-ink-faint hover:text-adm-ink",
                  )}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="px-3 pt-5 pb-4 sm:px-6">
          <TrendChart current={current} previous={previous} metric={metric} />
        </div>
      </div>
    </section>
  );
}

function KpiCard({ label, value, change, spark }: { label: string; value: string; change: number | null; spark: number[] }) {
  const up = (change ?? 0) >= 0;
  return (
    <article className="relative overflow-hidden rounded-2xl border border-adm-line bg-adm-surface p-5">
      <p className="text-[12px] font-medium tracking-[0.04em] text-adm-ink-soft">{label}</p>
      <p className="mt-3 font-adm-display text-[2.1rem] leading-none font-semibold tracking-[-0.01em] tabular-nums">{value}</p>
      <div className="mt-4 flex items-end justify-between gap-3">
        {change === null ? (
          <span className="text-[12px] text-adm-ink-faint">No baseline</span>
        ) : (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[12px] font-semibold tabular-nums",
              up ? "bg-adm-success-soft text-adm-success" : "bg-adm-danger-soft text-adm-danger",
            )}
          >
            {up ? <ArrowUpRight className="size-3.5" strokeWidth={2} /> : <ArrowDownRight className="size-3.5" strokeWidth={2} />}
            {Math.abs(change).toFixed(1)}%
          </span>
        )}
        <Sparkline values={spark} tone={up ? "success" : "danger"} />
      </div>
    </article>
  );
}

function Sparkline({ values, tone }: { values: number[]; tone: "success" | "danger" }) {
  if (values.length < 2) return null;
  const width = 96;
  const height = 32;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const points = values
    .map((value, index) => `${((index / (values.length - 1)) * width).toFixed(1)},${(height - 2 - ((value - min) / span) * (height - 4)).toFixed(1)}`)
    .join(" ");
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-8 w-24 shrink-0 overflow-visible" aria-hidden="true">
      <polyline
        points={points}
        fill="none"
        stroke={tone === "success" ? "var(--adm-success)" : "var(--adm-danger)"}
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
        opacity={0.85}
      />
    </svg>
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
  const pick = (point: DayPoint) => (metric === "revenue" ? point.revenuePaise : point.orders);
  const format = (value: number, compact = false) => (metric === "revenue" ? formatMoney(value, { compact }) : formatNumber(value));

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
  const total = values.reduce((acc, value) => acc + value, 0);

  return (
    <figure aria-label={`${metric === "revenue" ? "Revenue" : "Orders"} trend, total ${format(total)}`} className="flex gap-3">
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
            <path d={line} fill="none" stroke="var(--adm-accent)" strokeWidth={2} strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
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
                <p className="mt-1 font-adm-display text-xl font-semibold tabular-nums">{format(pick(active.day))}</p>
                <p className="mt-1 text-[12px] text-adm-ink-soft">
                  {metric === "revenue" ? `${active.day.orders} orders` : formatMoney(active.day.revenuePaise)}
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
