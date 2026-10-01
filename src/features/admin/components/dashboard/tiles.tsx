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
  Sparkles,
  TrendingDown,
  TrendingUp,
  Undo2,
  type LucideIcon,
} from "lucide-react";
import type { AttentionKind, BriefTone, DashboardData } from "@/features/admin/data/dashboard";
import { formatMoney, formatNumber, percentChange } from "@/features/admin/lib/format";
import { cn } from "@/lib/utils";
import { AnimatedValue, type ValueFormat } from "./animated-value";
import { Panel, READY_ROUTES } from "./panels";

function Delta({ current, previous }: { current: number; previous: number }) {
  const change = percentChange(current, previous);
  if (change === null) return <span className="text-[12px] text-adm-ink-faint">No baseline</span>;
  const up = change >= 0;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <span className={cn("inline-flex items-center gap-0.5 text-[12px] font-medium tabular-nums", up ? "text-adm-success" : "text-adm-danger")}>
      <Icon className="size-3.5" strokeWidth={2} aria-hidden="true" />
      {Math.abs(change).toFixed(1)}%
    </span>
  );
}

export function TodayTile({ today, lastWeek, delay }: { today: DashboardData["today"]; lastWeek: DashboardData["lastWeekSameDay"]; delay?: number }) {
  const stats: { label: string; value: number; previous: number; format: ValueFormat }[] = [
    { label: "Revenue", value: today.revenuePaise, previous: lastWeek.revenuePaise, format: "money" },
    { label: "Orders", value: today.orders, previous: lastWeek.orders, format: "number" },
    { label: "Visitors", value: today.sessions, previous: lastWeek.sessions, format: "number" },
    { label: "New customers", value: today.newCustomers, previous: lastWeek.newCustomers, format: "number" },
  ];

  return (
    <Panel
      title="Today so far"
      description={`Compared with last ${lastWeek.weekday}`}
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
      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-b-[14px] border-t border-adm-line bg-adm-line">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-adm-surface px-5 py-4">
            <dt className="text-[12px] text-adm-ink-soft">{stat.label}</dt>
            <dd className="mt-1 flex flex-wrap items-baseline justify-between gap-x-2">
              <AnimatedValue value={stat.value} format={stat.format} className="text-[20px] leading-tight font-semibold tracking-[-0.02em] tabular-nums" />
              <Delta current={stat.value} previous={stat.previous} />
            </dd>
          </div>
        ))}
      </dl>
    </Panel>
  );
}

export function GoalTile({ goal, delay }: { goal: DashboardData["monthGoal"]; delay?: number }) {
  const progress = Math.min(1, goal.achievedPaise / goal.goalPaise);
  const expected = goal.daysElapsed / goal.daysInMonth;
  const onTrack = progress >= expected;
  const forecast = (goal.achievedPaise / Math.max(1, goal.daysElapsed)) * goal.daysInMonth;
  const daysLeft = Math.max(1, goal.daysInMonth - goal.daysElapsed);
  const neededPerDay = Math.max(0, goal.goalPaise - goal.achievedPaise) / daysLeft;

  return (
    <Panel
      title={`${goal.monthLabel} goal`}
      description={`Day ${goal.daysElapsed} of ${goal.daysInMonth}`}
      delay={delay}
      action={
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[11px] font-medium",
            onTrack ? "bg-adm-success-soft text-adm-success" : "bg-adm-warning-soft text-adm-warning",
          )}
        >
          {onTrack ? "On track" : "Behind pace"}
        </span>
      }
    >
      <div className="px-5 pb-5">
        <p className="flex flex-wrap items-baseline gap-x-2">
          <AnimatedValue value={goal.achievedPaise} format="money" className="text-[26px] leading-tight font-semibold tracking-[-0.02em] tabular-nums" />
          <span className="text-[13px] text-adm-ink-faint tabular-nums">of {formatMoney(goal.goalPaise, { compact: true })}</span>
        </p>

        <div className="relative mt-4 h-2 rounded-full bg-adm-surface-muted">
          <span
            className="adm-grow-x absolute inset-y-0 left-0 rounded-full bg-adm-accent"
            style={{ width: `${progress * 100}%`, "--adm-delay": "200ms" } as CSSProperties}
          />
          <span
            className="absolute top-1/2 h-4 w-0.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-adm-ink"
            style={{ left: `${expected * 100}%` }}
            title="Where you should be today"
          />
        </div>
        <div className="mt-2 flex justify-between text-[11.5px] text-adm-ink-faint tabular-nums">
          <span>{Math.round(progress * 100)}% reached</span>
          <span>Pace marker {Math.round(expected * 100)}%</span>
        </div>

        <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-adm-line pt-4">
          <div>
            <dt className="text-[12px] text-adm-ink-soft">Month forecast</dt>
            <dd className="mt-0.5 text-[14px] font-semibold tabular-nums">{formatMoney(forecast, { compact: true })}</dd>
          </div>
          <div>
            <dt className="text-[12px] text-adm-ink-soft">Needed per day</dt>
            <dd className="mt-0.5 text-[14px] font-semibold tabular-nums">{neededPerDay ? formatMoney(neededPerDay, { compact: true }) : "Goal met"}</dd>
          </div>
        </dl>
      </div>
    </Panel>
  );
}

const BRIEF_META: Record<BriefTone, { icon: LucideIcon; chip: string }> = {
  up: { icon: TrendingUp, chip: "bg-adm-success-soft text-adm-success" },
  down: { icon: TrendingDown, chip: "bg-adm-danger-soft text-adm-danger" },
  tip: { icon: Lightbulb, chip: "bg-adm-accent-soft text-adm-accent" },
  alert: { icon: AlertTriangle, chip: "bg-adm-warning-soft text-adm-warning" },
};

export function BriefTile({ items, delay }: { items: DashboardData["brief"]; delay?: number }) {
  return (
    <Panel
      title="Daily brief"
      description="What changed, and what to do about it"
      delay={delay}
      action={
        <span className="inline-flex size-7 items-center justify-center rounded-lg bg-adm-accent-soft text-adm-accent">
          <Sparkles className="size-4" strokeWidth={1.8} aria-hidden="true" />
        </span>
      }
    >
      <ul className="flex flex-col gap-1 px-3 pb-3">
        {items.map((item) => {
          const meta = BRIEF_META[item.tone];
          const Icon = meta.icon;
          return (
            <li key={item.title} className="flex gap-3 rounded-[10px] px-2 py-2.5 transition-colors hover:bg-adm-surface-muted">
              <span className={cn("mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-lg", meta.chip)}>
                <Icon className="size-[15px]" strokeWidth={1.9} aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="text-[13.5px] leading-snug font-medium text-adm-ink">{item.title}</p>
                <p className="mt-0.5 text-[12.5px] leading-relaxed text-adm-ink-soft">{item.detail}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}

const ATTENTION_META: Record<AttentionKind, { label: string; icon: LucideIcon; chip: string; href: string }> = {
  pack: { label: "Orders to pack", icon: PackageOpen, chip: "bg-adm-accent-soft text-adm-accent", href: "/admin/orders?view=to_pack" },
  payment: { label: "Awaiting payment", icon: Clock3, chip: "bg-adm-warning-soft text-adm-warning", href: "/admin/orders?view=unpaid" },
  returns: { label: "Return requests", icon: Undo2, chip: "bg-adm-danger-soft text-adm-danger", href: "/admin/orders?view=returns" },
  stock: { label: "Sizes running low", icon: AlertTriangle, chip: "bg-adm-warning-soft text-adm-warning", href: "/admin/inventory?view=restock" },
  reviews: { label: "Reviews to approve", icon: MessageSquareQuote, chip: "bg-adm-info-soft text-adm-info", href: "/admin/reviews?view=pending" },
};

export function AttentionTile({ items, delay }: { items: DashboardData["attention"]; delay?: number }) {
  const open = items.reduce((total, item) => total + item.count, 0);

  return (
    <Panel title="Needs attention" description={open ? `${formatNumber(open)} tasks waiting on you` : "You're all caught up"} delay={delay}>
      <ul className="flex flex-col gap-1 px-3 pb-3">
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
              <span
                className={cn(
                  "min-w-7 rounded-md px-1.5 py-0.5 text-center text-[12.5px] font-semibold tabular-nums",
                  clear ? "text-adm-ink-faint" : "bg-adm-surface-muted text-adm-ink",
                )}
              >
                {item.count}
              </span>
              {ready ? <ChevronRight className="size-4 text-adm-ink-faint" strokeWidth={1.8} aria-hidden="true" /> : null}
            </>
          );
          const rowClass = "flex items-center gap-3 rounded-[10px] px-2 py-2.5 transition-colors hover:bg-adm-surface-muted";
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
