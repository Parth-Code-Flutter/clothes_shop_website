import type { Metadata } from "next";
import { DashboardView } from "@/features/account/components/dashboard-view";

export const metadata: Metadata = {
  title: "Dashboard | House of Bollywood",
  description: "Your House of Bollywood account dashboard.",
  robots: { index: false, follow: false },
};

export default function DashboardPage() {
  return (
    <main className="flex flex-1 flex-col bg-background">
      <DashboardView />
    </main>
  );
}
