import type { Metadata } from "next";
import { CartView } from "@/features/cart/components/cart-view";

export const metadata: Metadata = {
  title: "Bag | House of Bollywood",
  description: "Your House of Bollywood bag.",
  robots: { index: false, follow: false },
};

export default function CartPage() {
  return (
    <main className="flex flex-1 flex-col bg-background">
      <CartView />
    </main>
  );
}
