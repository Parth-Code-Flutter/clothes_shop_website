import Link from "next/link";
import { productGridClass, ProductCard } from "@/components/shared/product-card";
import { getAllProducts } from "@/features/catalog/data";

/** New-in shelf — same browse density as the shop, so you can scan the drop. */
export function HomeArrivals() {
  const products = getAllProducts().slice(0, 10);

  return (
    <section id="arrivals" className="bg-surface py-10 text-foreground sm:py-12 lg:pr-16">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.2em] text-muted uppercase">
              New in
            </p>
            <h2 className="mt-1 text-xl font-bold tracking-tight sm:text-2xl">
              Just placed
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <p className="text-[13px] text-muted">{products.length} items</p>
            <Link
              href="/shop"
              className="inline-flex min-h-10 items-center text-[13px] font-semibold text-accent hover:underline focus-visible:outline-2 focus-visible:outline-offset-4"
            >
              View all
            </Link>
          </div>
        </div>
        <div className={productGridClass}>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
