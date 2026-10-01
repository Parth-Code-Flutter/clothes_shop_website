import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { requireAdmin } from "@/features/admin/auth/dal";
import { AdminShell } from "@/features/admin/components/admin-shell";
import { ADMIN_SIDEBAR_COOKIE } from "@/features/admin/config/admin-nav";
import { getOrderStats } from "@/features/admin/data/orders";

export default async function AdminPanelLayout({ children }: { children: ReactNode }) {
  const session = await requireAdmin();
  const collapsed = (await cookies()).get(ADMIN_SIDEBAR_COOKIE)?.value === "collapsed";
  const { toPack } = getOrderStats();
  const badges: Record<string, string> = toPack > 0 ? { "/admin/orders": String(toPack) } : {};
  return (
    <AdminShell user={{ name: session.name, email: session.email }} defaultCollapsed={collapsed} badges={badges}>
      {children}
    </AdminShell>
  );
}
