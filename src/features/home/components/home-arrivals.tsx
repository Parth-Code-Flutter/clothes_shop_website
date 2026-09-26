import Link from "next/link";
import { ProductCard } from "@/components/shared/product-card";
import { getAllProducts } from "@/features/catalog/data";

/** A short edit of the catalog, shown after the scroll story. */
export function HomeArrivals() {
  const products = getAllProducts().slice(0, 8);

  return (
    <section id="arrivals" className="bg-surface px-4 py-20 text-foreground sm:px-8 sm:py-28 lg:px-10">
      <div className="mx-auto max-w-[1440px]">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.32em] text-gold uppercase">
              New in
            </p>
            <h2 className="mt-3 font-display text-5xl tracking-tight sm:text-6xl">
              Just placed.
            </h2>
          </div>
          <Link
            href="/shop"
            className="inline-flex min-h-11 items-center text-sm font-semibold underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            Shop all
          </Link>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
