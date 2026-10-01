"use client";

import { useMemo, useState } from "react";
import type { DayPoint } from "@/features/admin/data/dashboard";
import { Panel } from "@/features/admin/components/dashboard/panels";
import { adminBrand } from "@/features/admin/config/admin-brand";
import { formatMoney } from "@/features/admin/lib/format";

const WEEKS = 12;
const DAY_MS = 24 * 60 * 60 * 1000;
const WEEKDAYS = ["Mon", "", "Wed", "", "Fri", "", "Sun"];
const LEVEL_MIX = [14, 32, 52, 74, 100];

const longDate = new Intl.DateTimeFormat(adminBrand.locale, { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
const monthShort = new Intl.DateTimeFormat(adminBrand.locale, { month: "short", timeZone: "UTC" });

type Cell = { iso: string; date: Date; point: DayPoint | null; level: number };

function levelColor(level: number) {
  return `color-mix(in oklab, var(--adm-accent) ${LEVEL_MIX[level]}%, var(--adm-surface-muted))`;
}

export function SalesRhythmPanel({ series }: { series: DayPoint[] }) {
  const [hovered, setHovered] = useState<Cell | null>(null);

  const { columns, insights } = useMemo(() => {
    const byIso = new Map(series.map((point) => [point.iso, point]));
    const last = new Date(`${series[series.length - 1].iso}T00:00:00Z`);
    const weekday = (last.getUTCDay() + 6) % 7;
    const start = last.getTime() - (weekday + (WEEKS - 1) * 7) * DAY_MS;

    const raw = Array.from({ length: WEEKS }, (_, week) =>
      Array.from({ length: 7 }, (_, day) => {
        const date = new Date(start + (week * 7 + day) * DAY_MS);
        const iso = date.toISOString().slice(0, 10);
        return { iso, date, point: byIso.get(iso) ?? null };
      }),
    );

    const points = raw.flat().flatMap((cell) => (cell.point ? [cell.point] : []));
    const sorted = points.map((point) => point.revenuePaise).sort((a, b) => a - b);
    const cut = [0.2, 0.4, 0.6, 0.8].map((q) => sorted[Math.floor(q * (sorted.length - 1))] ?? 0);
    const level = (value: number) => cut.filter((threshold) => value > threshold).length;

    const cols: Cell[][] = raw.map((week) => week.map((cell) => ({ ...cell, level: cell.point ? level(cell.point.revenuePaise) : -1 })));

    const total = points.reduce((sum, point) => sum + point.revenuePaise, 0);
    const best = points.reduce((top, point) => (point.revenuePaise > top.revenuePaise ? point : top), points[0]);
    const quiet = points.reduce((low, point) => (point.revenuePaise < low.revenuePaise ? point : low), points[0]);
    const toDate = (point: DayPoint) => longDate.format(new Date(`${point.iso}T00:00:00Z`));

    return {
      columns: cols,
      insights: [
        { label: `${WEEKS}-week revenue`, value: formatMoney(total, { compact: true }), hint: `${points.length} trading days` },
        { label: "Daily average", value: formatMoney(points.length ? total / points.length : 0), hint: "Across all days" },
        { label: "Best day", value: formatMoney(best.revenuePaise), hint: toDate(best) },
        { label: "Quietest day", value: formatMoney(quiet.revenuePaise), hint: toDate(quiet) },
      ],
    };
  }, [series]);

  return (
    <Panel title="Sales rhythm" description={`Daily revenue · last ${WEEKS} weeks`}>
      <div className="flex flex-col gap-8 p-5 sm:p-6 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1 lg:max-w-[560px]">
          <div
            className="grid gap-1 sm:gap-1.5"
            style={{ gridTemplateColumns: `2rem repeat(${WEEKS}, minmax(0, 1fr))` }}
            role="img"
            aria-label={`Heatmap of daily revenue for the last ${WEEKS} weeks`}
            onPointerLeave={() => setHovered(null)}
          >
            <span />
            {columns.map((week, index) => {
              const month = monthShort.format(week[0].date);
              const showMonth = index === 0 || month !== monthShort.format(columns[index - 1][0].date);
              return (
                <span key={week[0].iso} className="text-[11px] whitespace-nowrap text-adm-ink-faint">
                  {showMonth ? month : ""}
                </span>
              );
            })}

            {WEEKDAYS.map((label, day) => (
              <Row key={day} label={label} day={day} columns={columns} hovered={hovered} onHover={setHovered} />
            ))}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-[12px] text-adm-ink-faint">
            <p aria-live="polite" className="min-h-[18px] text-adm-ink-soft tabular-nums">
              {hovered?.point ? (
                <>
                  <span className="font-medium text-adm-ink">{longDate.format(hovered.date)}</span> · {formatMoney(hovered.point.revenuePaise)} ·{" "}
                  {hovered.point.orders} orders
                </>
              ) : (
                "Hover a day to see its sales"
              )}
            </p>
            <span className="flex items-center gap-1.5">
              Less
              {LEVEL_MIX.map((_, level) => (
                <span key={level} className="size-3 rounded-[3px]" style={{ background: levelColor(level) }} />
              ))}
              More
            </span>
          </div>
        </div>

        <dl className="grid flex-1 grid-cols-2 gap-px overflow-hidden rounded-xl border border-adm-line bg-adm-line">
          {insights.map((item) => (
            <div key={item.label} className="bg-adm-surface p-4">
              <dt className="text-[12px] text-adm-ink-soft">{item.label}</dt>
              <dd className="mt-1.5 text-[1.125rem] leading-none font-semibold tracking-[-0.02em] tabular-nums">{item.value}</dd>
              <dd className="mt-1.5 text-[12px] text-adm-ink-faint">{item.hint}</dd>
            </div>
          ))}
        </dl>
      </div>
    </Panel>
  );
}

function Row({
  label,
  day,
  columns,
  hovered,
  onHover,
}: {
  label: string;
  day: number;
  columns: Cell[][];
  hovered: Cell | null;
  onHover: (cell: Cell) => void;
}) {
  return (
    <>
      <span className="self-center text-[11px] text-adm-ink-faint">{label}</span>
      {columns.map((week) => {
        const cell = week[day];
        if (!cell.point) return <span key={cell.iso} className="aspect-square rounded-[5px] border border-dashed border-adm-line" />;
        return (
          <span
            key={cell.iso}
            onPointerEnter={() => onHover(cell)}
            className="aspect-square rounded-[5px] transition-[transform,box-shadow] duration-150 hover:scale-110"
            style={{
              background: levelColor(cell.level),
              boxShadow: hovered?.iso === cell.iso ? "0 0 0 2px var(--adm-surface), 0 0 0 3.5px var(--adm-accent)" : undefined,
            }}
          />
        );
      })}
    </>
  );
}
