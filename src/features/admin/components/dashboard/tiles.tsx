import Link from "next/link";
import type { CSSProperties } from "react";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Lightbulb,
  MessageSquareQuote,
  PackageOpen,
  TrendingDown,
  TrendingUp,
  Undo2,
  type LucideIcon,
} from "lucide-react";
import type { AttentionKind, BriefItem, BriefTone, DashboardData, DayPoint } from "@/features/admin/data/dashboard";
import { formatMoney, formatNumber, percentChange } from "@/features/admin/lib/format";
import { cn } from "@/lib/utils";
import { AnimatedValue, type ValueFormat } from "./animated-value";
import { MiniBars, SizeMeter, Sparkline } from "./mini-charts";
import { Panel, READY_ROUTES } from "./panels";
import { TodayChart } from "./today-chart";

function Delta({ current, previous, className }: { current: number; previous: number; className?: string }) {
  const change = percentChange(current, previous);
  if (change === null) return <span className={cn("text-[12px] text-adm-ink-faint", className)}>No baseline</span>;
  const up = change >= 0;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <span className={cn("inline-flex items-center gap-0.5 text-[12px] font-medium tabular-nums", up ? "text-adm-success" : "text-adm-danger", className)}>
      <Icon className="size-3.5" strokeWidth={2} aria-hidden="true" />
      {Math.abs(change).toFixed(1)}%
    </span>
  );
}

const conversion = (orders: number, sessions: number) => (sessions ? (orders / sessions) * 100 : 0);

export function TodayTile({
  today,
  lastWeek,
  intraday,
  series,
  delay,
}: {
  today: DashboardData["today"];
  lastWeek: DashboardData["lastWeekSameDay"];
  intraday: DashboardData["intraday"];
  series: DayPoint[];
  delay?: number;
}) {
  const gap = today.revenuePaise - lastWeek.revenuePaise;
  const recent = series.slice(-15, -1);
  const stats: { label: string; value: number; previous: number; format: ValueFormat; trend: number[] }[] = [
    { label: "Orders", value: today.orders, previous: lastWeek.orders, format: "number", trend: recent.map((day) => day.orders) },
    { label: "Visitors", value: today.sessions, previous: lastWeek.sessions, format: "number", trend: recent.map((day) => day.sessions) },
    {
      label: "Conversion",
      value: conversion(today.orders, today.sessions),
      previous: conversion(lastWeek.orders, lastWeek.sessions),
      format: "percent",
      trend: recent.map((day) => conversion(day.orders, day.sessions)),
    },
    { label: "New customers", value: today.newCustomers, previous: lastWeek.newCustomers, format: "number", trend: recent.map((day) => day.newCustomers) },
  ];

  return (
    <Panel
      title="Today so far"
      description={`Compared with last ${lastWeek.weekday} at the same time`}
      delay={delay}
      action={
        <span className="inline-flex items-center gap-1.5 rounded-full bg-adm-success-soft px-2 py-0.5 text-[11px] font-medium text-adm-success">
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-adm-success opacity-60 motion-reduce:hidden" />
            <span className="relative inline-flex size-1.5 rounded-full bg-adm-success" />
          </span>
          Live
        </span>
      }
    >
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3 px-5">
        <div>
          <p className="text-[12px] text-adm-ink-soft">Revenue</p>
          <p className="mt-1 flex flex-wrap items-baseline gap-x-2.5">
            <AnimatedValue value={today.revenuePaise} format="money" className="text-[30px] leading-none font-semibold tracking-[-0.025em] tabular-nums" />
            <Delta current={today.revenuePaise} previous={lastWeek.revenuePaise} className="text-[13px]" />
          </p>
          <p className="mt-2 text-[12.5px] text-adm-ink-soft">
            <span className={cn("font-medium", gap >= 0 ? "text-adm-success" : "text-adm-danger")}>{formatMoney(Math.abs(gap))}</span>{" "}
            {gap >= 0 ? "ahead of" : "behind"} last {lastWeek.weekday} at this time
          </p>
        </div>
        <div className="flex flex-col gap-1.5 text-[12px] text-adm-ink-soft" aria-hidden="true">
          <span className="flex items-center gap-2">
            <span className="h-[2px] w-4 rounded-full bg-adm-accent" /> Today
          </span>
          <span className="flex items-center gap-2">
            <span className="w-4 border-t border-dashed border-adm-ink-faint" /> Last {lastWeek.weekday.slice(0, 3)} · ended at{" "}
            <span className="font-medium text-adm-ink tabular-nums">{formatMoney(lastWeek.fullDayRevenuePaise, { compact: true })}</span>
          </span>
        </div>
      </div>

      <div className="px-3 pt-5 pb-4 sm:px-5">
        <TodayChart today={intraday.today} lastWeek={intraday.lastWeek} now={intraday.now} weekday={lastWeek.weekday} />
      </div>

      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-b-[14px] border-t border-adm-line bg-adm-line lg:grid-cols-4">
        {stats.map((stat, index) => (
          <div key={stat.label} className="flex flex-col bg-adm-surface px-5 pt-4 pb-3">
            <dt className="flex items-center justify-between gap-2 text-[12px] text-adm-ink-soft">
              {stat.label}
              <Delta current={stat.value} previous={stat.previous} />
            </dt>
            <dd className="mt-1">
              <AnimatedValue value={stat.value} format={stat.format} className="text-[20px] leading-tight font-semibold tracking-[-0.02em] tabular-nums" />
            </dd>
            <dd className="mt-2">
              <Sparkline values={stat.trend} label={`${stat.label}, last 14 days`} delay={300 + index * 80} className="h-7" />
              <span className="mt-1 block text-[10.5px] text-adm-ink-faint">Last 14 days</span>
            </dd>
          </div>
        ))}
      </dl>
    </Panel>
  );
}

const GAUGE_R = 80;
const GAUGE_CX = 100;
const GAUGE_CY = 96;
const GAUGE_ARC = `M${GAUGE_CX - GAUGE_R},${GAUGE_CY} A${GAUGE_R},${GAUGE_R} 0 0 1 ${GAUGE_CX + GAUGE_R},${GAUGE_CY}`;

function onGauge(fraction: number, radius: number) {
  const angle = Math.PI * (1 - fraction);
  return { x: GAUGE_CX + radius * Math.cos(angle), y: GAUGE_CY - radius * Math.sin(angle) };
}

export function GoalTile({ goal, delay }: { goal: DashboardData["monthGoal"]; delay?: number }) {
  const progress = Math.min(1, goal.achievedPaise / goal.goalPaise);
  const expected = Math.min(1, goal.elapsed / goal.daysInMonth);
  const onTrack = progress >= expected;
  const forecast = (goal.achievedPaise / Math.max(0.25, goal.elapsed)) * goal.daysInMonth;
  const forecastShare = forecast / goal.goalPaise;
  const daysLeft = Math.max(1, goal.daysInMonth - goal.elapsed);
  const neededPerDay = Math.max(0, goal.goalPaise - goal.achievedPaise) / daysLeft;
  const tickInner = onGauge(expected, GAUGE_R + 10);
  const tickOuter = onGauge(expected, GAUGE_R + 19);
  // Headroom keeps the goal line clear of the right-aligned amounts.
  const scale = Math.max(goal.goalPaise, goal.previousMonth.totalPaise, forecast) * 1.25;
  const comparison = [
    { label: goal.previousMonth.label, note: "Actual", value: goal.previousMonth.totalPaise, bar: "bg-adm-ink-faint/45" },
    { label: goal.monthLabel, note: "Forecast", value: forecast, bar: forecastShare >= 1 ? "bg-adm-success" : "bg-adm-warning" },
  ];

  return (
    <Panel
      title={`${goal.monthLabel} goal`}
      description={`Day ${goal.daysElapsed} of ${goal.daysInMonth}`}
      delay={delay}
      action={
        <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium", onTrack ? "bg-adm-success-soft text-adm-success" : "bg-adm-warning-soft text-adm-warning")}>
          {onTrack ? "On track" : "Behind pace"}
        </span>
      }
    >
      <div className="flex h-full flex-col px-5 pb-5">
        <div className="relative mx-auto mt-4 w-full max-w-[300px]">
          <svg
            viewBox="0 0 200 110"
            className="w-full overflow-visible"
            role="img"
            aria-label={`${Math.round(progress * 100)}% of the ${goal.monthLabel} goal reached; pace for today is ${Math.round(expected * 100)}%`}
          >
            <path d={GAUGE_ARC} fill="none" stroke="var(--adm-surface-muted)" strokeWidth={14} strokeLinecap="round" />
            <path
              d={GAUGE_ARC}
              pathLength={100}
              fill="none"
              stroke="var(--adm-accent)"
              strokeWidth={14}
              strokeLinecap="round"
              strokeDasharray={`${progress * 100} 100`}
              className="adm-draw"
              style={{ "--adm-delay": `${(delay ?? 0) + 150}ms` } as CSSProperties}
            />
            <line x1={tickInner.x} y1={tickInner.y} x2={tickOuter.x} y2={tickOuter.y} stroke="var(--adm-ink)" strokeWidth={2.5} strokeLinecap="round" />
          </svg>
          <div className="absolute inset-x-0 bottom-0 text-center">
            <p className="text-[30px] leading-none font-semibold tracking-[-0.03em] tabular-nums">{Math.round(progress * 100)}%</p>
            <p className="mt-1 text-[12px] text-adm-ink-faint tabular-nums">
              <span className="font-medium text-adm-ink">{formatMoney(goal.achievedPaise, { compact: true })}</span> of {formatMoney(goal.goalPaise, { compact: true })}
            </p>
          </div>
        </div>

        <div className="mt-3 flex justify-center gap-4 text-[11.5px] text-adm-ink-soft" aria-hidden="true">
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-adm-accent" /> Reached
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-0.5 rounded-full bg-adm-ink" /> Where you should be today
          </span>
        </div>

        <div className="mt-auto border-t border-adm-line pt-4">
          <div
            className="relative flex flex-col gap-3 pt-5"
            role="img"
            aria-label={`${goal.previousMonth.label} closed at ${formatMoney(goal.previousMonth.totalPaise)}; ${goal.monthLabel} is forecast at ${formatMoney(forecast)} against a goal of ${formatMoney(goal.goalPaise)}`}
          >
            {comparison.map((row, index) => (
              <div key={row.note}>
                <div className="flex items-baseline justify-between gap-3 text-[12px]">
                  <span className="text-adm-ink-soft">
                    {row.label} <span className="text-adm-ink-faint">· {row.note}</span>
                  </span>
                  <span className="font-semibold tabular-nums">{formatMoney(row.value, { compact: true })}</span>
                </div>
                <div className="mt-1.5 h-2.5 rounded-full bg-adm-surface-muted">
                  <span
                    className={cn("adm-grow-x block h-full rounded-full", row.bar)}
                    style={{ width: `${(row.value / scale) * 100}%`, "--adm-delay": `${300 + index * 120}ms` } as CSSProperties}
                  />
                </div>
              </div>
            ))}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute top-0 bottom-0 flex -translate-x-1/2 flex-col items-center"
              style={{ left: `${(goal.goalPaise / scale) * 100}%` }}
            >
              <span className="text-[10.5px] font-semibold whitespace-nowrap text-adm-ink">Goal {formatMoney(goal.goalPaise, { compact: true })}</span>
              <span className="mt-0.5 w-0 flex-1 border-l-[1.5px] border-dashed border-adm-ink" />
            </span>
          </div>
          <p className="mt-4 flex items-baseline justify-between gap-3 text-[12px]">
            <span className="text-adm-ink-soft">Needed per day to hit the goal</span>
            <span className="font-semibold tabular-nums">{neededPerDay ? formatMoney(neededPerDay, { compact: true }) : "Goal met"}</span>
          </p>
        </div>
      </div>
    </Panel>
  );
}

const BRIEF_META: Record<BriefTone, { icon: LucideIcon; chip: string; bar: string; color: string }> = {
  up: { icon: TrendingUp, chip: "bg-adm-success-soft text-adm-success", bar: "bg-adm-success", color: "var(--adm-success)" },
  down: { icon: TrendingDown, chip: "bg-adm-danger-soft text-adm-danger", bar: "bg-adm-danger", color: "var(--adm-danger)" },
  tip: { icon: Lightbulb, chip: "bg-adm-accent-soft text-adm-accent", bar: "bg-adm-accent", color: "var(--adm-accent)" },
  alert: { icon: AlertTriangle, chip: "bg-adm-warning-soft text-adm-warning", bar: "bg-adm-warning", color: "var(--adm-warning)" },
};

function BriefChart({ item }: { item: BriefItem }) {
  const { visual } = item;
  const meta = BRIEF_META[item.tone];
  if (!visual) return null;
  if (visual.kind === "sizes") return <SizeMeter sizes={visual.sizes} />;
  if (visual.kind === "line") return <Sparkline values={visual.values} color={meta.color} label={`${item.title}, last 30 days`} className="h-12" />;
  return <MiniBars values={visual.values} highlight={visual.highlight} labels={visual.labels} caption={visual.caption} barClass={meta.bar} label={item.title} />;
}

/** The daily brief as cards, each backed by a small chart. */
export function BriefStrip({ items, delay = 0 }: { items: DashboardData["brief"]; delay?: number }) {
  return (
    <ul aria-label="Daily brief" className="grid h-full gap-4 sm:grid-cols-2">
      {items.map((item, index) => {
        const meta = BRIEF_META[item.tone];
        const Icon = meta.icon;
        return (
          <li
            key={item.title}
            className="adm-rise flex flex-col rounded-[14px] border border-adm-line bg-adm-surface p-4 shadow-[0_1px_2px_rgb(0_0_0/0.04)]"
            style={{ "--adm-delay": `${delay + index * 50}ms` } as CSSProperties}
          >
            <div className="flex gap-3">
              <span className={cn("inline-flex size-8 shrink-0 items-center justify-center rounded-lg", meta.chip)}>
                <Icon className="size-4" strokeWidth={1.9} aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="text-[13.5px] leading-snug font-medium text-adm-ink">{item.title}</p>
                <p className="mt-1 text-[12.5px] leading-relaxed text-adm-ink-soft">{item.detail}</p>
              </div>
            </div>
            <div className="mt-auto pt-4">
              <BriefChart item={item} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

const ATTENTION_META: Record<AttentionKind, { label: string; icon: LucideIcon; chip: string; bar: string; href: string }> = {
  pack: { label: "Orders to pack", icon: PackageOpen, chip: "bg-adm-accent-soft text-adm-accent", bar: "bg-adm-accent", href: "/admin/orders?view=to_pack" },
  payment: { label: "Awaiting payment", icon: Clock3, chip: "bg-adm-warning-soft text-adm-warning", bar: "bg-adm-warning", href: "/admin/orders?view=unpaid" },
  returns: { label: "Return requests", icon: Undo2, chip: "bg-adm-danger-soft text-adm-danger", bar: "bg-adm-danger", href: "/admin/orders?view=returns" },
  stock: {
    label: "Sizes running low",
    icon: AlertTriangle,
    chip: "bg-adm-warning-soft text-adm-warning",
    bar: "bg-[color-mix(in_oklab,var(--adm-warning)_55%,var(--adm-surface))]",
    href: "/admin/inventory?view=restock",
  },
  reviews: { label: "Reviews to approve", icon: MessageSquareQuote, chip: "bg-adm-info-soft text-adm-info", bar: "bg-adm-info", href: "/admin/reviews?view=pending" },
};

export function AttentionTile({ items, delay }: { items: DashboardData["attention"]; delay?: number }) {
  const open = items.reduce((total, item) => total + item.count, 0);
  const busy = items.filter((item) => item.count > 0);

  return (
    <Panel title="Needs attention" description={open ? "Open tasks by type" : "You're all caught up"} delay={delay}>
      <div className="px-5 pb-3">
        <p className="flex items-baseline gap-2">
          <AnimatedValue value={open} format="number" className="text-[30px] leading-none font-semibold tracking-[-0.025em] tabular-nums" />
          <span className="text-[12.5px] text-adm-ink-soft">{open === 1 ? "task" : "tasks"} waiting</span>
        </p>
        {open ? (
          <div
            role="img"
            aria-label={busy.map((item) => `${ATTENTION_META[item.kind].label} ${item.count}`).join(", ")}
            className="adm-grow-x mt-3 flex h-2.5 gap-0.5 overflow-hidden rounded-full"
            style={{ "--adm-delay": `${(delay ?? 0) + 150}ms` } as CSSProperties}
          >
            {busy.map((item) => (
              <span key={item.kind} className={cn("h-full first:rounded-l-full last:rounded-r-full", ATTENTION_META[item.kind].bar)} style={{ flexGrow: item.count, minWidth: 6 }} />
            ))}
          </div>
        ) : null}
      </div>
      <ul className="flex flex-col gap-0.5 px-3 pb-3">
        {items.map((item) => {
          const meta = ATTENTION_META[item.kind];
          const clear = item.count === 0;
          const Icon = clear ? CheckCircle2 : meta.icon;
          const ready = READY_ROUTES.has(meta.href.split("?")[0]);
          const body = (
            <>
              <span className={cn("inline-flex size-7 shrink-0 items-center justify-center rounded-lg", clear ? "bg-adm-success-soft text-adm-success" : meta.chip)}>
                <Icon className="size-[15px]" strokeWidth={1.9} aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13.5px] leading-snug font-medium text-adm-ink">{meta.label}</span>
                <span className="block truncate text-[12px] text-adm-ink-faint">{clear ? "All clear" : item.hint}</span>
              </span>
              <span className={cn("flex min-w-7 items-center justify-end gap-1.5 text-[12.5px] font-semibold tabular-nums", clear ? "text-adm-ink-faint" : "text-adm-ink")}>
                {clear ? null : <span className={cn("size-2 rounded-full", meta.bar)} aria-hidden="true" />}
                {formatNumber(item.count)}
              </span>
              {ready ? <ChevronRight className="size-4 text-adm-ink-faint" strokeWidth={1.8} aria-hidden="true" /> : null}
            </>
          );
          const rowClass = "flex items-center gap-3 rounded-[10px] px-2 py-2 transition-colors hover:bg-adm-surface-muted";
          return (
            <li key={item.kind}>
              {ready ? (
                <Link href={meta.href} className={rowClass}>
                  {body}
                </Link>
              ) : (
                <div className={rowClass} title="Opens once this screen is built">
                  {body}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}
