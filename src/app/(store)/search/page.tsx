import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchView } from "@/features/search/components/search-view";
import styles from "@/features/shop/components/shop-listing.module.css";

export const metadata: Metadata = {
  title: "Search | House of Bollywood",
  description: "Search the House of Bollywood catalog.",
  robots: { index: false, follow: false },
};

export default function SearchPage() {
  return (
    <main className={`${styles.hall} flex flex-1 flex-col`}>
      <Suspense
        fallback={
          <div className="mx-auto max-w-7xl px-4 py-16 text-sm text-muted">
            Loading search…
          </div>
        }
      >
        <SearchView />
      </Suspense>
    </main>
  );
}
