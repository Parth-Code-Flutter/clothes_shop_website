import type { Metadata } from "next";
import { ShopListing } from "@/features/shop/components/shop-listing";

export const metadata: Metadata = {
  title: "Shop | House of Bollywood",
  description: "Graphic tees from the House of Bollywood catalog.",
  robots: { index: false, follow: false },
};

export default function ShopPage() {
  return (
    <main className="flex flex-1 flex-col bg-background">
      <ShopListing />
    </main>
  );
}
