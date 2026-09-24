import type { Metadata } from "next";
import { WishlistView } from "@/features/wishlist/components/wishlist-view";

export const metadata: Metadata = {
  title: "Wishlist | House of Bollywood",
  description: "Saved House of Bollywood drops.",
  robots: { index: false, follow: false },
};

export default function WishlistPage() {
  return (
    <main className="flex flex-1 flex-col bg-background">
      <WishlistView />
    </main>
  );
}
