import type { Metadata } from "next";
import { DashboardView } from "@/features/account/components/dashboard-view";
import styles from "@/features/shop/components/shop-listing.module.css";

export const metadata: Metadata = {
  title: "Dashboard | House of Bollywood",
  description: "Your House of Bollywood account dashboard.",
  robots: { index: false, follow: false },
};

export default function DashboardPage() {
  return (
    <main className={`${styles.hall} flex flex-1 flex-col`}>
      <DashboardView />
    </main>
  );
}
