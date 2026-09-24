import type { Metadata } from "next";
import { AccountView } from "@/features/account/components/account-view";

export const metadata: Metadata = {
  title: "Account | House of Bollywood",
  description: "Local account preview for House of Bollywood.",
  robots: { index: false, follow: false },
};

export default function AccountPage() {
  return (
    <main className="flex flex-1 flex-col bg-background">
      <AccountView />
    </main>
  );
}
