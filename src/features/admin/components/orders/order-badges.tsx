import { ORDER_STATUS_META, PAYMENT_STATUS_META, type OrderStatus, type PaymentMethod, type PaymentStatus } from "@/features/admin/lib/order-status";
import { cn } from "@/lib/utils";

export function OrderStatusBadge({ status, className }: { status: OrderStatus; className?: string }) {
  const meta = ORDER_STATUS_META[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[12px] font-medium whitespace-nowrap", meta.className, className)}>
      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      {meta.label}
    </span>
  );
}

export function PaymentLabel({ method, status }: { method: PaymentMethod; status: PaymentStatus }) {
  const meta = PAYMENT_STATUS_META[status];
  return (
    <span className="flex flex-col">
      <span className="text-adm-ink">{method}</span>
      <span className={cn("text-[12px]", meta.className)}>{meta.label}</span>
    </span>
  );
}
