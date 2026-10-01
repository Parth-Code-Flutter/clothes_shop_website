"use client";

import { useEffect, useRef, useState } from "react";
import { formatMoney, formatNumber, formatPercent } from "@/features/admin/lib/format";

export type ValueFormat = "money" | "moneyCompact" | "number" | "percent";

export function formatValue(value: number, format: ValueFormat) {
  switch (format) {
    case "money":
      return formatMoney(value);
    case "moneyCompact":
      return formatMoney(value, { compact: true });
    case "percent":
      return formatPercent(value, 2);
    default:
      return formatNumber(Math.round(value));
  }
}

/** Eases from the last shown value to `target` whenever it changes. */
export function useCountUp(target: number, duration = 1100) {
  const [display, setDisplay] = useState(0);
  const shown = useRef(0);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const from = shown.current;
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const progress = reduce ? 1 : Math.min(1, (now - start) / duration);
      const value = from + (target - from) * (1 - (1 - progress) ** 3);
      shown.current = value;
      setDisplay(value);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return display;
}

export function AnimatedValue({ value, format, className }: { value: number; format: ValueFormat; className?: string }) {
  const display = useCountUp(value);
  return (
    <span className={className}>
      <span aria-hidden="true">{formatValue(display, format)}</span>
      <span className="sr-only">{formatValue(value, format)}</span>
    </span>
  );
}
