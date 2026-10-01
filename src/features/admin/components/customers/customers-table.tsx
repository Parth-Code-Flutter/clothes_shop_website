import Link from "next/link";
import type { ReactNode } from "react";
import { Crown, Undo2, UsersRound } from "lucide-react";
import type { CustomerSegment } from "@/features/admin/data/customers";
import { formatMoney } from "@/features/admin/lib/format";
import { cn } from "@/lib/utils";

export type CustomerRow = {
  id: string;
  name: string;
  email: string;
  city: string;
  state: string;
  ordersCount: number;
  totalSpentPaise: number;
  lastOrderLabel: string;
  segment: CustomerSegment;
  hasReturns: boolean;
};

const SEGMENT_META: Record<CustomerSegment, { label: string; className: string }> = {
  vip: { label: "VIP", className: "bg-adm-accent-soft text-adm-accent" },
  returning: { label: "Returning", className: "bg-adm-info-soft text-adm-info" },
  new: { label: "New", className: "bg-adm-success-soft text-adm-success" },
};

export function SegmentBadge({ segment }: { segment: CustomerSegment }) {
  const meta = SEGMENT_META[segment];
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[12px] font-medium whitespace-nowrap", meta.className)}>
      {segment === "vip" ? <Crown className="size-3" strokeWidth={2} aria-hidden="true" /> : <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />}
      {meta.label}
    </span>
  );
}

export function CustomerAvatar({ name, className }: { name: string; className?: string }) {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
  return (
    <span aria-hidden="true" className={cn("inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-adm-accent-soft text-[12px] font-semibold text-adm-accent", className)}>
      {initials}
    </span>
  );
}

function ReturnsHint() {
  return (
    <span title="Has returned an order" className="inline-flex items-center gap-1 text-[12px] text-adm-danger">
      <Undo2 className="size-3" strokeWidth={2} aria-hidden="true" />
      Returns
    </span>
  );
}

export function CustomersTable({ customers, emptyAction }: { customers: CustomerRow[]; emptyAction: ReactNode }) {
  if (customers.length === 0) {
    return (
      <div className="flex flex-col items-center px-6 py-16 text-center">
        <span className="inline-flex size-11 items-center justify-center rounded-xl bg-adm-surface-muted text-adm-ink-faint">
          <UsersRound className="size-5" strokeWidth={1.7} aria-hidden="true" />
        </span>
        <p className="mt-4 text-[14px] font-medium">No customers match</p>
        <p className="mt-1 text-[13px] text-adm-ink-faint">Try another tab or search, or clear the filters to see everyone.</p>
        <div className="mt-4">{emptyAction}</div>
      </div>
    );
  }

  return (
    <>
      <div className="hidden md:block">
        <table className="w-full text-left text-[13.5px]">
          <thead>
            <tr className="border-b border-adm-line text-[12px] text-adm-ink-faint">
              <th scope="col" className="py-2.5 pr-3 pl-5 font-medium">Customer</th>
              <th scope="col" className="hidden px-3 py-2.5 font-medium lg:table-cell">Location</th>
              <th scope="col" className="px-3 py-2.5 font-medium">Segment</th>
              <th scope="col" className="px-3 py-2.5 text-right font-medium">Orders</th>
              <th scope="col" className="px-3 py-2.5 text-right font-medium">Total spent</th>
              <th scope="col" className="py-2.5 pr-5 pl-3 font-medium">Last order</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-adm-line">
            {customers.map((customer) => (
              <tr key={customer.id} className="group relative transition-colors hover:bg-adm-surface-muted/50">
                <td className="py-3 pr-3 pl-5">
                  <span className="flex items-center gap-3">
                    <CustomerAvatar name={customer.name} />
                    <span className="min-w-0">
                      <Link
                        href={`/admin/customers/${customer.id}`}
                        className="block truncate font-medium text-adm-ink group-hover:text-adm-accent focus-visible:outline-none after:absolute after:inset-0"
                      >
                        {customer.name}
                      </Link>
                      <span className="block truncate text-[12px] text-adm-ink-faint">{customer.email}</span>
                    </span>
                  </span>
                </td>
                <td className="hidden px-3 py-3 text-adm-ink-soft lg:table-cell">
                  {customer.city}
                  <span className="block text-[12px] text-adm-ink-faint">{customer.state}</span>
                </td>
                <td className="px-3 py-3">
                  <span className="flex flex-col items-start gap-1">
                    <SegmentBadge segment={customer.segment} />
                    {customer.hasReturns ? <ReturnsHint /> : null}
                  </span>
                </td>
                <td className="px-3 py-3 text-right text-adm-ink tabular-nums">{customer.ordersCount}</td>
                <td className="px-3 py-3 text-right font-medium text-adm-ink tabular-nums">{formatMoney(customer.totalSpentPaise)}</td>
                <td className="py-3 pr-5 pl-3 text-[12.5px] whitespace-nowrap text-adm-ink-faint">{customer.lastOrderLabel}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="divide-y divide-adm-line md:hidden">
        {customers.map((customer) => (
          <li key={customer.id}>
            <Link href={`/admin/customers/${customer.id}`} className="flex gap-3 px-4 py-3.5">
              <CustomerAvatar name={customer.name} className="size-10" />
              <span className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="flex items-start justify-between gap-2">
                  <span className="truncate text-[14px] font-medium">{customer.name}</span>
                  <span className="text-[14px] font-medium tabular-nums">{formatMoney(customer.totalSpentPaise)}</span>
                </span>
                <span className="text-[12.5px] text-adm-ink-soft">
                  {customer.city} · {customer.ordersCount} order{customer.ordersCount === 1 ? "" : "s"} · {customer.lastOrderLabel}
                </span>
                <span className="flex items-center gap-2">
                  <SegmentBadge segment={customer.segment} />
                  {customer.hasReturns ? <ReturnsHint /> : null}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
