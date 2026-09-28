import type { Metadata } from "next";
import { WishlistView } from "@/features/wishlist/components/wishlist-view";
import styles from "@/features/shop/components/shop-listing.module.css";

export const metadata: Metadata = {
  title: "Wishlist | House of Bollywood",
  description: "Saved House of Bollywood drops.",
  robots: { index: false, follow: false },
};

export default function WishlistPage() {
  return (
    <main className={`${styles.hall} flex flex-1 flex-col`}>
      <WishlistView />
    </main>
  );
}
