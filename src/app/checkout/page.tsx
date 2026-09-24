import type { Metadata } from "next";
import { CheckoutView } from "@/features/checkout/components/checkout-view";

export const metadata: Metadata = {
  title: "Checkout | House of Bollywood",
  description: "Checkout preview for House of Bollywood.",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <main className="flex flex-1 flex-col bg-background">
      <CheckoutView />
    </main>
  );
}
