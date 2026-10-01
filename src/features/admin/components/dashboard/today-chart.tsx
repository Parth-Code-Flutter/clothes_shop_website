"use client";

import { useId, useState, type PointerEvent } from "react";
import type { IntradayPoint } from "@/features/admin/data/dashboard";
import { niceCeiling, smoothPath } from "@/features/admin/components/dashboard/chart-utils";
import { formatMoney } from "@/features/admin/lib/format";
import { cn } from "@/lib/utils";

const W = 1000;
const H = 180;
const HOUR_TICKS = [0, 6, 12, 18, 24];

function clockLabel(hours: number) {
  const whole = Math.floor(hours) % 24;
  const minutes = Math.round((hours % 1) * 60);
  const suffix = whole < 12 ? "am" : "pm";
  const h12 = whole % 12 === 0 ? 12 : whole % 12;
  return minutes ? `${h12}:${String(minutes).padStart(2, "0")} ${suffix}` : `${h12} ${suffix}`;
}

/** Cumulative revenue through the day: today (solid, up to now) against the same weekday last week (dashed, full day). */
export function TodayChart({ today, lastWeek, now, weekday }: { today: IntradayPoint[]; lastWeek: IntradayPoint[]; now: number; weekday: string }) {
  const gradientId = useId();
  const [hover, setHover] = useState<number | null>(null);

  const ceiling = niceCeiling(Math.max(...lastWeek.map((point) => point.paise), ...today.map((point) => point.paise), 1) * 1.08);
  const toXY = (point: IntradayPoint) => ({ x: (point.hour / 24) * W, y: H - (point.paise / ceiling) * H });
  const todayPoints = today.map(toXY);
  const lastPoints = lastWeek.map(toXY);
  const line = smoothPath(todayPoints);
  const end = todayPoints[todayPoints.length - 1];
  const area = `${line} L${end.x},${H} L0,${H} Z`;

  function onMove(event: PointerEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    setHover(Math.round(ratio * 24));
  }

  const hovered =
    hover === null
      ? null
      : {
          x: (hover / 24) * W,
          today: hover <= now ? today.find((point) => point.hour === hover)?.paise : undefined,
          lastWeek: lastWeek.find((point) => point.hour === hover)?.paise ?? 0,
        };

  return (
    <figure aria-label={`Revenue through the day: ${formatMoney(today[today.length - 1].paise)} so far today`} className="flex gap-3">
      <div className="relative w-12 shrink-0" style={{ height: H }} aria-hidden="true">
        {[1, 0.5, 0].map((tick) => (
          <span key={tick} className="absolute right-0 -translate-y-1/2 text-[11px] text-adm-ink-faint tabular-nums" style={{ top: `${(1 - tick) * 100}%` }}>
            {formatMoney(ceiling * tick, { compact: true })}
          </span>
        ))}
      </div>

      <div className="min-w-0 flex-1">
        <div className="relative touch-pan-y" style={{ height: H }} onPointerMove={onMove} onPointerDown={onMove} onPointerLeave={() => setHover(null)}>
          <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="absolute inset-0 size-full overflow-visible" aria-hidden="true">
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--adm-accent)" stopOpacity={0.26} />
                <stop offset="100%" stopColor="var(--adm-accent)" stopOpacity={0} />
              </linearGradient>
            </defs>
            {[1, 0.5, 0].map((tick) => (
              <line key={tick} x1={0} x2={W} y1={(1 - tick) * H} y2={(1 - tick) * H} stroke="var(--adm-line)" strokeWidth={1} vectorEffect="non-scaling-stroke" />
            ))}
            <path
              d={smoothPath(lastPoints)}
              fill="none"
              stroke="var(--adm-ink-faint)"
              strokeOpacity={0.7}
              strokeWidth={1.5}
              strokeDasharray="5 5"
              vectorEffect="non-scaling-stroke"
            />
            <g className="adm-reveal-x">
              <path d={area} fill={`url(#${gradientId})`} />
              <path
                d={line}
                fill="none"
                stroke="var(--adm-accent)"
                strokeWidth={2.25}
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
                style={{ filter: "drop-shadow(0 6px 10px color-mix(in oklab, var(--adm-accent) 35%, transparent))" }}
              />
            </g>
            <line x1={end.x} x2={end.x} y1={end.y} y2={H} stroke="var(--adm-accent)" strokeOpacity={0.45} strokeWidth={1} strokeDasharray="3 3" vectorEffect="non-scaling-stroke" />
          </svg>

          <span
            aria-hidden="true"
            className="pointer-events-none absolute flex size-3 -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${(end.x / W) * 100}%`, top: `${(end.y / H) * 100}%` }}
          >
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-adm-accent opacity-50 motion-reduce:hidden" />
            <span className="relative inline-flex size-3 rounded-full border-2 border-adm-surface bg-adm-accent" />
          </span>
          <span
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute -top-1 rounded-md bg-adm-accent px-1.5 py-0.5 text-[10.5px] font-semibold whitespace-nowrap text-adm-accent-ink",
              end.x / W > 0.85 ? "-translate-x-full" : "-translate-x-1/2",
            )}
            style={{ left: `${(end.x / W) * 100}%` }}
          >
            Now · {clockLabel(now)}
          </span>

          {hovered ? (
            <>
              <span aria-hidden="true" className="pointer-events-none absolute top-0 bottom-0 w-px bg-adm-line-strong" style={{ left: `${(hovered.x / W) * 100}%` }} />
              <div
                role="status"
                className={cn(
                  "pointer-events-none absolute top-6 z-10 w-48 rounded-xl border border-adm-line bg-adm-surface px-3.5 py-3 shadow-[0_18px_40px_-18px_rgb(0_0_0/0.4)]",
                  hovered.x / W > 0.6 ? "-translate-x-[calc(100%+12px)]" : "translate-x-3",
                )}
                style={{ left: `${(hovered.x / W) * 100}%` }}
              >
                <p className="text-[11px] font-medium tracking-[0.06em] text-adm-ink-faint uppercase">By {clockLabel(hover ?? 0)}</p>
                <p className="mt-1.5 flex items-center justify-between gap-3 text-[12.5px]">
                  <span className="flex items-center gap-1.5 text-adm-ink-soft">
                    <span className="h-[2px] w-3 rounded-full bg-adm-accent" /> Today
                  </span>
                  <span className="font-semibold tabular-nums">{hovered.today === undefined ? "—" : formatMoney(hovered.today)}</span>
                </p>
                <p className="mt-1 flex items-center justify-between gap-3 text-[12.5px]">
                  <span className="flex items-center gap-1.5 text-adm-ink-soft">
                    <span className="w-3 border-t border-dashed border-adm-ink-faint" /> Last {weekday.slice(0, 3)}
                  </span>
                  <span className="tabular-nums">{formatMoney(hovered.lastWeek)}</span>
                </p>
              </div>
            </>
          ) : null}
        </div>

        <div className="relative mt-2.5 h-4" aria-hidden="true">
          {HOUR_TICKS.map((hour, index) => (
            <span
              key={hour}
              className={cn(
                "absolute text-[11px] whitespace-nowrap text-adm-ink-faint",
                index === 0 ? "" : index === HOUR_TICKS.length - 1 ? "-translate-x-full" : "-translate-x-1/2",
              )}
              style={{ left: `${(hour / 24) * 100}%` }}
            >
              {clockLabel(hour)}
            </span>
          ))}
        </div>
      </div>
    </figure>
  );
}
