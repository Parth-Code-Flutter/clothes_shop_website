import type { Metadata } from "next";
import { Suspense } from "react";
import { ShopListing } from "@/features/shop/components/shop-listing";

export const metadata: Metadata = {
  title: "Shop | House of Bollywood",
  description: "Shirts, t-shirts, jeans, trousers, and jackets.",
  robots: { index: false, follow: false },
};

export default function ShopPage() {
  return (
    <main className="flex flex-1 flex-col bg-background">
      <Suspense
        fallback={
          <div className="mx-auto max-w-7xl px-4 py-16 text-sm text-muted">
            Loading shop…
          </div>
        }
      >
        <ShopListing />
      </Suspense>
    </main>
  );
}
