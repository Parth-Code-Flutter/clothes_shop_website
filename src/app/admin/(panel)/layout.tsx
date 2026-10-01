import type { ReactNode } from "react";
import { requireAdmin } from "@/features/admin/auth/dal";
import { AdminShell } from "@/features/admin/components/admin-shell";

export default async function AdminPanelLayout({ children }: { children: ReactNode }) {
  const session = await requireAdmin();
  return <AdminShell user={{ name: session.name, email: session.email }}>{children}</AdminShell>;
}
