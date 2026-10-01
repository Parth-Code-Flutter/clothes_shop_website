import type { Metadata } from "next";
import { CartView } from "@/features/cart/components/cart-view";
import styles from "@/features/shop/components/shop-listing.module.css";

export const metadata: Metadata = {
  title: "Bag | House of Bollywood",
  description: "Your House of Bollywood bag.",
  robots: { index: false, follow: false },
};

export default function CartPage() {
  return (
    <main className={`${styles.hall} flex flex-1 flex-col`}>
      <CartView />
    </main>
  );
}
