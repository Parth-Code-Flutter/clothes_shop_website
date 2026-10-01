import { adminBrand } from "@/features/admin/config/admin-brand";
import { cn } from "@/lib/utils";

export function AdminMonogram({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-adm-accent/70 font-adm-display text-[15px] font-semibold tracking-[0.06em] text-adm-accent",
        className,
      )}
    >
      <span className="absolute inset-[3px] rounded-full border border-adm-accent/30" />
      {adminBrand.monogram}
    </span>
  );
}
