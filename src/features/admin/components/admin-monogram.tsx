import { adminBrand } from "@/features/admin/config/admin-brand";
import { cn } from "@/lib/utils";

export function AdminMonogram({ className, onSidebar = false }: { className?: string; onSidebar?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative inline-flex size-10 shrink-0 items-center justify-center rounded-full border font-adm-display text-[15px] font-semibold tracking-[0.06em]",
        onSidebar ? "border-adm-sidebar-accent/70 text-adm-sidebar-accent" : "border-adm-accent/70 text-adm-accent",
        className,
      )}
    >
      <span
        className={cn("absolute inset-[3px] rounded-full border", onSidebar ? "border-adm-sidebar-accent/30" : "border-adm-accent/30")}
      />
      {adminBrand.monogram}
    </span>
  );
}
