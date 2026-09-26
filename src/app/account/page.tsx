import type { Metadata } from "next";
import { AccountView } from "@/features/account/components/account-view";

export const metadata: Metadata = {
  title: "Account | House of Bollywood",
  description: "Sign in or create your House of Bollywood account.",
  robots: { index: false, follow: false },
};

export default function AccountPage() {
  return (
    <main className="flex flex-1 flex-col bg-background">
      <AccountView />
    </main>
  );
}
