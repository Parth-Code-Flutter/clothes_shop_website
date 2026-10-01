import type { CSSProperties } from "react";
import { smoothPath } from "@/features/admin/components/dashboard/chart-utils";
import { cn } from "@/lib/utils";

/** Small, non-interactive charts for tiles and cards. Colours are CSS colour values (e.g. `var(--adm-accent)`). */

const SPARK_W = 100;
const SPARK_H = 30;
const SPARK_PAD = 3;

export function Sparkline({
  values,
  color = "var(--adm-accent)",
  label,
  className,
  delay = 150,
}: {
  values: number[];
  color?: string;
  label: string;
  className?: string;
  delay?: number;
}) {
  if (values.length < 2) return null;
  const min = Math.min(...values);
  const span = Math.max(...values) - min || 1;
  const points = values.map((value, index) => ({
    x: (index / (values.length - 1)) * SPARK_W,
    y: SPARK_PAD + (1 - (value - min) / span) * (SPARK_H - SPARK_PAD * 2),
  }));
  const line = smoothPath(points);
  const last = points[points.length - 1];

  return (
    <div role="img" aria-label={label} className={cn("relative h-8", className)}>
      <svg
        viewBox={`0 0 ${SPARK_W} ${SPARK_H}`}
        preserveAspectRatio="none"
        aria-hidden="true"
        className="adm-reveal-x absolute inset-0 size-full overflow-visible"
        style={{ "--adm-delay": `${delay}ms` } as CSSProperties}
      >
        <path d={`${line} L${SPARK_W},${SPARK_H} L0,${SPARK_H} Z`} style={{ fill: `color-mix(in oklab, ${color} 13%, transparent)` }} />
        <path d={line} fill="none" stroke={color} strokeWidth={1.6} strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      </svg>
      <span
        aria-hidden="true"
        className="absolute size-[7px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ left: "100%", top: `${(last.y / SPARK_H) * 100}%`, background: color, boxShadow: "0 0 0 2px var(--adm-surface)" }}
      />
    </div>
  );
}

export function MiniBars({
  values,
  highlight,
  labels,
  caption,
  barClass = "bg-adm-accent",
  label,
  className,
}: {
  values: number[];
  highlight: number[];
  labels?: string[];
  caption?: [string, string];
  /** Tailwind background class for highlighted bars. */
  barClass?: string;
  label: string;
  className?: string;
}) {
  const max = Math.max(...values, 1);
  const marked = new Set(highlight);
  return (
    <div className={className}>
      <div role="img" aria-label={label} className="flex h-12 items-end gap-[3px]">
        {values.map((value, index) => (
          <span
            key={index}
            className={cn("adm-grow-y flex-1 rounded-[3px]", marked.has(index) ? barClass : "bg-adm-ink-faint/25")}
            style={{ height: `${Math.max(6, (value / max) * 100)}%`, "--adm-delay": `${200 + index * 25}ms` } as CSSProperties}
          />
        ))}
      </div>
      {labels ? (
        <div aria-hidden="true" className="mt-1 flex gap-[3px]">
          {labels.map((text, index) => (
            <span key={index} className={cn("flex-1 text-center text-[10px]", marked.has(index) ? "font-semibold text-adm-ink" : "text-adm-ink-faint")}>
              {text}
            </span>
          ))}
        </div>
      ) : null}
      {caption ? (
        <div aria-hidden="true" className="mt-1.5 flex justify-between text-[10.5px] text-adm-ink-faint">
          <span>{caption[0]}</span>
          <span className="font-medium text-adm-ink-soft">{caption[1]}</span>
        </div>
      ) : null}
    </div>
  );
}

export function SizeMeter({ sizes, className }: { sizes: { size: string; left: number }[]; className?: string }) {
  return (
    <ul aria-label="Stock left per size" className={cn("flex flex-wrap gap-1.5", className)}>
      {sizes.map(({ size, left }) => (
        <li
          key={size}
          className={cn(
            "flex min-w-14 flex-col items-center rounded-lg border px-2.5 py-2.5",
            left === 0 ? "border-adm-danger/25 bg-adm-danger-soft text-adm-danger" : "border-adm-warning/25 bg-adm-warning-soft text-adm-warning",
          )}
        >
          <span className="text-[16px] leading-none font-semibold">{size}</span>
          <span className="mt-1.5 text-[10.5px] leading-none tabular-nums">{left} left</span>
        </li>
      ))}
    </ul>
  );
}
