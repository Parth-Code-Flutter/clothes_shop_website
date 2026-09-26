"use client";

import { productGridClass, ProductCard } from "@/components/shared/product-card";
import type { CatalogProduct } from "@/features/catalog/types";

export function RelatedProducts({ products }: { products: CatalogProduct[] }) {
  if (products.length === 0) return null;

  return (
    <section className="border-t border-border">
      <div className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <h2 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
          Similar products
        </h2>
        <div className={`${productGridClass} mt-4`}>
          {products.map((item) => (
            <ProductCard key={item.id} product={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
